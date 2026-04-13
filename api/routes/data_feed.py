"""Read-only data feed for external tools (Power BI, Google Sheets imports).

Returns a flat list of estimate summaries — one row per estimate, with
rolled-up financials. JSON by default, optional CSV output.

Auth: single shared API key via X-API-Key header. Sufficient for Dave's
pull-on-demand use case. Swap for OAuth or Supabase auth if the feed
opens up to broader consumers.
"""

from __future__ import annotations

import csv
import io
import os
import traceback
from datetime import date, datetime
from typing import Any, Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from fastapi.responses import JSONResponse, Response

from services.ai_service import get_supabase
from services.pdf_data_service import get_estimate_pdf_data

router = APIRouter(prefix="/api/data")


# ── Auth ────────────────────────────────────────────────────────────────────

def require_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> None:
    expected = os.getenv("DATA_FEED_API_KEY", "").strip()
    if not expected:
        # Fail closed: without a configured key nobody gets in.
        raise HTTPException(status_code=503, detail="Data feed not configured")
    if not x_api_key or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


# ── Row shape ───────────────────────────────────────────────────────────────

_CSV_COLUMNS = [
    "estimate_id",
    "client_name",
    "event_name",
    "event_type",
    "location",
    "start_date",
    "end_date",
    "duration_days",
    "status",
    "total_revenue",
    "total_cost",
    "gross_profit",
    "gp_percent",
    "segment_count",
    "created_at",
    "updated_at",
]


# ── Endpoint ────────────────────────────────────────────────────────────────

@router.get("/estimates", dependencies=[Depends(require_api_key)])
def list_estimates(
    status: str | None = Query(default=None, description="Filter by estimate status"),
    client: str | None = Query(default=None, description="Filter by client name (exact match)"),
    from_date: str | None = Query(default=None, description="created_at >= YYYY-MM-DD"),
    to_date: str | None = Query(default=None, description="created_at <= YYYY-MM-DD"),
    format: Literal["json", "csv"] = Query(default="json"),
    limit: int = Query(default=500, ge=1, le=5000),
) -> Response:
    try:
        rows = _fetch_rows(
            status=status,
            client=client,
            from_date=from_date,
            to_date=to_date,
            limit=limit,
        )
    except HTTPException:
        raise
    except Exception as err:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Data feed failed: {err}") from err

    if format == "csv":
        return _csv_response(rows)
    return JSONResponse(rows)


# ── Row assembly ────────────────────────────────────────────────────────────

def _fetch_rows(
    *,
    status: str | None,
    client: str | None,
    from_date: str | None,
    to_date: str | None,
    limit: int,
) -> list[dict[str, Any]]:
    db = get_supabase()

    # 1. Top-level estimate + client + segment count in one round trip.
    query = (
        db.table("estimates")
        .select(
            "id, event_name, event_type, location, start_date, end_date, "
            "duration_days, status, created_at, updated_at, "
            "clients(name), labor_logs(id)"
        )
        .order("updated_at", desc=True)
        .limit(limit)
    )
    if status:
        query = query.eq("status", status)
    if from_date:
        query = query.gte("created_at", from_date)
    if to_date:
        # inclusive upper bound — treat as end-of-day
        query = query.lte("created_at", f"{to_date}T23:59:59Z")

    result = query.execute()
    estimates: list[dict[str, Any]] = result.data or []

    # 2. Optional client filter (applied client-side after the join — PostgREST
    #    can't filter on joined columns without embedded filters, and exact
    #    match is cheap to do here).
    if client:
        want = client.strip().lower()
        estimates = [e for e in estimates if _client_name(e).lower() == want]

    # 3. Enrich each row with rolled-up financials. get_estimate_pdf_data is
    #    the canonical totals computation used by the PDF pipeline.
    rows: list[dict[str, Any]] = []
    for est in estimates:
        totals = _compute_totals(est["id"])
        rows.append(
            {
                "estimate_id": est["id"],
                "client_name": _client_name(est),
                "event_name": est.get("event_name") or "",
                "event_type": est.get("event_type") or "",
                "location": est.get("location") or "",
                "start_date": _date_only(est.get("start_date")),
                "end_date": _date_only(est.get("end_date")),
                "duration_days": est.get("duration_days"),
                "status": est.get("status") or "",
                "total_revenue": totals["gross_revenue"],
                "total_cost": totals["total_cost"],
                "gross_profit": totals["gross_profit"],
                "gp_percent": totals["gp_percent"],
                "segment_count": len(est.get("labor_logs") or []),
                "created_at": _date_only(est.get("created_at")),
                "updated_at": _date_only(est.get("updated_at")),
            }
        )
    return rows


def _client_name(est: dict[str, Any]) -> str:
    clients = est.get("clients") or {}
    if isinstance(clients, dict):
        return clients.get("name") or ""
    return ""


def _compute_totals(estimate_id: str) -> dict[str, float]:
    """Return {gross_revenue, total_cost, gross_profit, gp_percent} for the
    estimate. On compute failure return zeros so one bad estimate doesn't
    kill the whole feed."""
    try:
        data = get_estimate_pdf_data(estimate_id)
        t = data.get("totals") or {}
        return {
            "gross_revenue": float(t.get("gross_revenue") or 0),
            "total_cost": float(t.get("total_cost") or 0),
            "gross_profit": float(t.get("gross_profit") or 0),
            "gp_percent": float(t.get("gp_percent") or 0),
        }
    except Exception as err:  # noqa: BLE001
        print(f"[data_feed] totals failed for {estimate_id}: {err}")
        return {"gross_revenue": 0.0, "total_cost": 0.0, "gross_profit": 0.0, "gp_percent": 0.0}


def _date_only(value: str | datetime | None) -> str | None:
    """Normalize ISO timestamps to YYYY-MM-DD for consumer friendliness."""
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    s = str(value)
    # Supabase returns ISO 8601 like '2026-04-13T20:36:27.266076+00:00'
    return s[:10] if len(s) >= 10 else s


# ── CSV writer ──────────────────────────────────────────────────────────────

def _csv_response(rows: list[dict[str, Any]]) -> Response:
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=_CSV_COLUMNS, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    filename = f"driveshop_estimates_{date.today().isoformat()}.csv"
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
