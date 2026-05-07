"""
PDF Data Service — gathers estimate, change order, and recap data from Supabase
for PDF rendering. Mirrors the financial computation logic from the frontend
(workflow-service.ts buildSnapshot, schedule-service.ts computeScheduleRollup,
segment-status-service.ts getVarianceReport).
"""

from collections import defaultdict
from datetime import date

from services.ai_service import get_supabase


# Section display names (matches frontend VarianceSummary.tsx)
SECTION_LABELS = {
    "labor": "Labor",
    "production": "Production Expenses",
    "travel": "Travel & Logistics",
    "creative": "Creative Costs",
    "access": "Access Fees & Insurance",
    "misc": "Misc",
    "fees": "Fees & Markups",
}

# Canonical section order for display
SECTION_ORDER = ["labor", "production", "travel", "creative", "access", "misc", "fees"]


def _round2(n: float) -> float:
    return round(n * 100) / 100


def _actual_cost_total(actual: dict | None) -> float:
    """Return canonical actual cost, falling back to legacy actual_total."""
    if not actual:
        return 0.0
    value = actual.get("actual_cost_total")
    if value is None:
        value = actual.get("actual_total")
    return float(value or 0)


def _compute_schedule_rollup(schedule_entries: list[dict], day_entries: list[dict]) -> list[dict]:
    """
    Compute labor rollup from schedule entries + day entries.
    Mirrors computeScheduleRollup() in schedule-service.ts.

    Groups by role_name:day_rate:cost_rate. For each day entry:
    - Revenue = day_rate + OT_hours * (day_rate / 10)
    - Cost = cost_rate + OT_hours * (cost_rate / 10)
    """
    # Index day entries by schedule_entry_id
    de_by_se: dict[str, list[dict]] = defaultdict(list)
    for de in day_entries:
        de_by_se[de["schedule_entry_id"]].append(de)

    # Group schedule entries by role_name:day_rate:cost_rate
    groups: dict[str, list[dict]] = {}
    for se in schedule_entries:
        key = f"{se.get('role_name', '')}:{se.get('day_rate', 0)}:{se.get('cost_rate', 0)}"
        groups.setdefault(key, []).append(se)

    rows = []
    for group in groups.values():
        first = group[0]
        quantity = len(group)
        total_days = 0
        total_std_hours = 0
        total_ot_hours = 0
        revenue_total = 0.0
        cost_total = 0.0

        day_rate = float(first.get("day_rate") or 0)
        cost_rate = float(first.get("cost_rate") or 0)

        for entry in group:
            for de in de_by_se.get(entry["id"], []):
                hours = float(de.get("hours") or 0)
                total_days += 1
                std_hours = min(hours, 10)
                ot_hours = max(hours - 10, 0)
                total_std_hours += std_hours
                total_ot_hours += ot_hours

                revenue_total += day_rate + ot_hours * (day_rate / 10)
                cost_total += cost_rate + ot_hours * (cost_rate / 10)

        gp = revenue_total - cost_total
        gp_pct = (gp / revenue_total * 100) if revenue_total > 0 else 0

        rows.append({
            "role_name": first.get("role_name") or "Unnamed Role",
            "gl_code": first.get("gl_code"),
            "quantity": quantity,
            "total_days": total_days,
            "total_standard_hours": total_std_hours,
            "total_ot_hours": total_ot_hours,
            "day_rate": day_rate,
            "cost_rate": cost_rate,
            "revenue_total": _round2(revenue_total),
            "cost_total": _round2(cost_total),
            "gp": _round2(gp),
            "gp_pct": _round2(gp_pct),
            "resource_type": first.get("resource_type", "external"),
        })

    return rows


def get_estimate_pdf_data(estimate_id: str, segment_id: str | None = None) -> dict:
    """
    Gather all data needed for client-facing and internal estimate PDFs.

    Returns structured dict with estimate header, per-segment sections with
    items and subtotals, and overall totals.
    """
    sb = get_supabase()

    # 1. Estimate + client
    est_resp = (
        sb.table("estimates")
        .select("*, clients(name, code, third_party_markup, agency_fee, office_payout_pct)")
        .eq("id", estimate_id)
        .single()
        .execute()
    )
    estimate = est_resp.data

    client = estimate.get("clients") or {}

    # 2. Labor logs (segments)
    ll_query = sb.table("labor_logs").select("*").eq("estimate_id", estimate_id).order("location_order")
    if segment_id:
        ll_query = ll_query.eq("id", segment_id)
    ll_resp = ll_query.execute()
    labor_logs = ll_resp.data or []
    log_ids = [ll["id"] for ll in labor_logs]

    if not log_ids:
        return _build_empty_result(estimate, client)

    # 3. Labor entries, line items, schedule entries, day entries
    le_resp = sb.table("labor_entries").select("*").in_("labor_log_id", log_ids).execute()
    labor_entries = le_resp.data or []

    li_resp = (
        sb.table("estimate_line_items")
        .select("*")
        .eq("estimate_id", estimate_id)
        .in_("labor_log_id", log_ids)
        .order("display_order")
        .execute()
    )
    line_items = li_resp.data or []

    se_resp = sb.table("schedule_entries").select("*").in_("labor_log_id", log_ids).execute()
    schedule_entries = se_resp.data or []

    day_entries: list[dict] = []
    if schedule_entries:
        se_ids = [se["id"] for se in schedule_entries]
        sde_resp = sb.table("schedule_day_entries").select("*").in_("schedule_entry_id", se_ids).execute()
        day_entries = sde_resp.data or []

    # Index data by labor log
    logs_with_schedule = set(se["labor_log_id"] for se in schedule_entries)
    le_by_log: dict[str, list[dict]] = defaultdict(list)
    for le in labor_entries:
        le_by_log[le["labor_log_id"]].append(le)

    li_by_log: dict[str, list[dict]] = defaultdict(list)
    for li in line_items:
        li_by_log[li["labor_log_id"]].append(li)

    se_by_log: dict[str, list[dict]] = defaultdict(list)
    for se in schedule_entries:
        se_by_log[se["labor_log_id"]].append(se)

    # 4. Build segments
    segments = []
    grand_revenue = 0.0
    grand_cost = 0.0

    for ll in labor_logs:
        log_id = ll["id"]
        is_schedule_driven = log_id in logs_with_schedule

        sections: dict[str, dict] = {}

        # -- Labor section --
        labor_items = []
        if is_schedule_driven:
            rollup = _compute_schedule_rollup(se_by_log[log_id], day_entries)
            for row in rollup:
                labor_items.append({
                    "name": row["role_name"],
                    "quantity": row["quantity"],
                    "days": row["total_days"],
                    "unit_rate": row["day_rate"],
                    "cost_rate": row["cost_rate"],
                    "revenue": row["revenue_total"],
                    "cost": row["cost_total"],
                    "gp": row["gp"],
                    "gp_pct": row["gp_pct"],
                    "resource_type": row["resource_type"],
                })
        else:
            for entry in le_by_log.get(log_id, []):
                qty = float(entry.get("quantity") or 0)
                days = float(entry.get("days") or 0)
                rate = float(entry.get("unit_rate") or 0)
                cost_rate = float(entry.get("cost_rate") or 0)
                revenue = qty * days * rate
                cost = qty * days * cost_rate
                gp = revenue - cost
                labor_items.append({
                    "name": entry.get("role_name") or "Unnamed Role",
                    "quantity": qty,
                    "days": days,
                    "unit_rate": rate,
                    "cost_rate": cost_rate,
                    "revenue": _round2(revenue),
                    "cost": _round2(cost),
                    "gp": _round2(gp),
                    "gp_pct": _round2((gp / revenue * 100) if revenue > 0 else 0),
                    "resource_type": entry.get("resource_type", "external"),
                })

        if labor_items:
            labor_rev = sum(i["revenue"] for i in labor_items)
            labor_cost = sum(i["cost"] for i in labor_items)
            labor_gp = labor_rev - labor_cost
            sections["labor"] = {
                "label": SECTION_LABELS["labor"],
                "line_items": labor_items,
                "subtotal_revenue": _round2(labor_rev),
                "subtotal_cost": _round2(labor_cost),
                "subtotal_gp": _round2(labor_gp),
                "subtotal_gp_pct": _round2((labor_gp / labor_rev * 100) if labor_rev > 0 else 0),
            }

        # -- Line item sections --
        log_line_items = li_by_log.get(log_id, [])
        items_by_section: dict[str, list[dict]] = defaultdict(list)
        for li in log_line_items:
            section_key = li.get("section") or "misc"
            qty = float(li.get("quantity") or 0)
            unit_cost = float(li.get("unit_cost") or 0)
            markup_pct = float(li.get("markup_pct") or 0)

            cost = qty * unit_cost
            revenue = cost * (1 + markup_pct / 100)

            # Agency fee special handling: fee_basis='total_estimate' means
            # the revenue is computed as a percentage of the total estimate,
            # but we compute it inline here as revenue = markup_pct% of segment total.
            # We'll recalculate this after we know the segment total.

            gp = revenue - cost
            items_by_section[section_key].append({
                "name": li.get("item_name") or "Unnamed Item",
                "quantity": qty,
                "unit_cost": unit_cost,
                "unit_rate": _round2(revenue / qty) if qty > 0 else 0,
                "markup_pct": markup_pct,
                "revenue": _round2(revenue),
                "cost": _round2(cost),
                "gp": _round2(gp),
                "gp_pct": _round2((gp / revenue * 100) if revenue > 0 else 0),
                "is_auto_generated": li.get("is_auto_generated", False),
                "fee_basis": li.get("fee_basis"),
            })

        for section_key in SECTION_ORDER:
            if section_key == "labor":
                continue
            sec_items = items_by_section.get(section_key, [])
            if not sec_items:
                continue
            sec_rev = sum(i["revenue"] for i in sec_items)
            sec_cost = sum(i["cost"] for i in sec_items)
            sec_gp = sec_rev - sec_cost
            sections[section_key] = {
                "label": SECTION_LABELS.get(section_key, section_key.title()),
                "line_items": sec_items,
                "subtotal_revenue": _round2(sec_rev),
                "subtotal_cost": _round2(sec_cost),
                "subtotal_gp": _round2(sec_gp),
                "subtotal_gp_pct": _round2((sec_gp / sec_rev * 100) if sec_rev > 0 else 0),
            }

        # Segment totals
        seg_revenue = sum(s["subtotal_revenue"] for s in sections.values())
        seg_cost = sum(s["subtotal_cost"] for s in sections.values())
        seg_gp = seg_revenue - seg_cost
        seg_gp_pct = (seg_gp / seg_revenue * 100) if seg_revenue > 0 else 0

        # Ordered sections list for template iteration
        ordered_sections = []
        for key in SECTION_ORDER:
            if key in sections:
                ordered_sections.append({"key": key, **sections[key]})

        segments.append({
            "name": ll.get("location_name") or "Primary",
            "status": ll.get("status"),
            "sections": ordered_sections,
            "totals": {
                "revenue": _round2(seg_revenue),
                "cost": _round2(seg_cost),
                "gp": _round2(seg_gp),
                "gp_pct": _round2(seg_gp_pct),
            },
        })

        grand_revenue += seg_revenue
        grand_cost += seg_cost

    grand_gp = grand_revenue - grand_cost
    grand_gp_pct = (grand_gp / grand_revenue * 100) if grand_revenue > 0 else 0

    return {
        "estimate": {
            "client_name": client.get("name", ""),
            "client_code": client.get("code", ""),
            "event_name": estimate.get("event_name", ""),
            "event_type": estimate.get("event_type", ""),
            "location": estimate.get("location", ""),
            "start_date": estimate.get("start_date", ""),
            "end_date": estimate.get("end_date", ""),
            "duration_days": estimate.get("duration_days", ""),
            "expected_attendance": estimate.get("expected_attendance", ""),
            "po_number": estimate.get("po_number", ""),
            "project_id": estimate.get("project_id", ""),
            "cost_structure": estimate.get("cost_structure", "corporate"),
        },
        "segments": segments,
        "totals": {
            "gross_revenue": _round2(grand_revenue),
            "total_cost": _round2(grand_cost),
            "gross_profit": _round2(grand_gp),
            "gp_percent": _round2(grand_gp_pct),
        },
        "generated_at": date.today().isoformat(),
    }


def get_change_order_pdf_data(change_order_id: str) -> dict:
    """Gather data for a change order PDF."""
    sb = get_supabase()

    co_resp = sb.table("change_orders").select("*").eq("id", change_order_id).single().execute()
    co = co_resp.data

    # Get estimate + client for header
    est_resp = (
        sb.table("estimates")
        .select("event_name, event_type, location, clients(name, code)")
        .eq("id", co["estimate_id"])
        .single()
        .execute()
    )
    estimate = est_resp.data
    client = estimate.get("clients") or {}

    # Get segment name
    ll_resp = (
        sb.table("labor_logs")
        .select("location_name")
        .eq("id", co["labor_log_id"])
        .single()
        .execute()
    )
    segment_name = ll_resp.data.get("location_name", "Primary")

    # Resolve approver name
    approver_name = None
    if co.get("approved_by"):
        profile_resp = (
            sb.table("profiles")
            .select("full_name")
            .eq("id", co["approved_by"])
            .single()
            .execute()
        )
        approver_name = profile_resp.data.get("full_name") if profile_resp.data else None

    delta = co.get("delta_summary") or {"added": [], "removed": [], "modified": [], "net_delta": 0}

    return {
        "client_name": client.get("name", ""),
        "event_name": estimate.get("event_name", ""),
        "segment_name": segment_name,
        "co_number": co.get("co_number", ""),
        "description": co.get("description", ""),
        "status": co.get("status", ""),
        "baseline_total": float(co.get("baseline_total") or 0),
        "revised_total": float(co.get("revised_total") or 0),
        "delta_amount": float(co.get("delta_amount") or 0),
        "delta": delta,
        "created_at": co.get("created_at", ""),
        "approved_by": approver_name,
        "approved_at": co.get("approved_at", ""),
        "generated_at": date.today().isoformat(),
    }


def get_recap_pdf_data(estimate_id: str, segment_id: str | None = None) -> dict:
    """
    Gather recap variance data for one or all segments.
    Mirrors getVarianceReport() from segment-status-service.ts.
    """
    sb = get_supabase()

    # Get estimate + client for header
    est_resp = (
        sb.table("estimates")
        .select("event_name, event_type, location, clients(name, code)")
        .eq("id", estimate_id)
        .single()
        .execute()
    )
    estimate = est_resp.data
    client = estimate.get("clients") or {}

    # Get labor logs
    ll_query = sb.table("labor_logs").select("*").eq("estimate_id", estimate_id).order("location_order")
    if segment_id:
        ll_query = ll_query.eq("id", segment_id)
    ll_resp = ll_query.execute()
    labor_logs = ll_resp.data or []

    segments = []
    for ll in labor_logs:
        log_id = ll["id"]
        rows = _get_variance_rows(sb, log_id)

        # Group by section for display
        sections: dict[str, dict] = {}
        for row in rows:
            sec = row["section"]
            if sec not in sections:
                sections[sec] = {
                    "label": SECTION_LABELS.get(sec, sec.title()),
                    "line_items": [],
                    "estimated_total": 0,
                    "actual_total": 0,
                    "variance": 0,
                }
            sections[sec]["line_items"].append(row)
            sections[sec]["estimated_total"] += row["estimated_total"]
            sections[sec]["actual_total"] += row["actual_total"]
            sections[sec]["variance"] += row["variance"]

        for sec in sections.values():
            sec["estimated_total"] = _round2(sec["estimated_total"])
            sec["actual_total"] = _round2(sec["actual_total"])
            sec["variance"] = _round2(sec["variance"])
            sec["variance_pct"] = _round2(
                (sec["variance"] / sec["estimated_total"] * 100) if sec["estimated_total"] > 0 else 0
            )

        # Ordered sections
        ordered = []
        for key in SECTION_ORDER:
            if key in sections:
                ordered.append({"key": key, **sections[key]})

        # Get staff assignments from schedule entries
        se_resp = (
            sb.table("schedule_entries")
            .select("role_name, person_name")
            .eq("labor_log_id", log_id)
            .execute()
        )
        staff = [
            {"role": se.get("role_name", ""), "person": se.get("person_name", "")}
            for se in (se_resp.data or [])
            if se.get("person_name")
        ]

        seg_estimated = sum(s["estimated_total"] for s in sections.values())
        seg_actual = sum(s["actual_total"] for s in sections.values())
        seg_variance = seg_estimated - seg_actual

        segments.append({
            "name": ll.get("location_name") or "Primary",
            "sections": ordered,
            "staff": staff,
            "totals": {
                "estimated": _round2(seg_estimated),
                "actual": _round2(seg_actual),
                "variance": _round2(seg_variance),
                "variance_pct": _round2((seg_variance / seg_estimated * 100) if seg_estimated > 0 else 0),
            },
        })

    return {
        "client_name": client.get("name", ""),
        "event_name": estimate.get("event_name", ""),
        "segments": segments,
        "generated_at": date.today().isoformat(),
    }


def _get_variance_rows(sb, labor_log_id: str) -> list[dict]:
    """Compute variance rows for a single segment. Mirrors getVarianceReport()."""
    actuals_resp = sb.table("recap_actuals").select("*").eq("labor_log_id", labor_log_id).execute()
    actuals = actuals_resp.data or []

    le_resp = sb.table("labor_entries").select("*").eq("labor_log_id", labor_log_id).execute()
    labor_entries = le_resp.data or []

    se_resp = (
        sb.table("schedule_entries")
        .select("*, schedule_day_entries(*)")
        .eq("labor_log_id", labor_log_id)
        .execute()
    )
    schedule_entries = se_resp.data or []

    li_resp = sb.table("estimate_line_items").select("*").eq("labor_log_id", labor_log_id).execute()
    line_items = li_resp.data or []

    rows = []
    is_schedule_driven = len(schedule_entries) > 0

    if is_schedule_driven:
        # Group by role_name:day_rate:cost_rate
        groups: dict[str, dict] = {}
        for se in schedule_entries:
            key = f"{se.get('role_name', '')}:{se.get('day_rate', 0)}:{se.get('cost_rate', 0)}"
            if key not in groups:
                groups[key] = {"entries": [], "first_id": se["id"]}
            groups[key]["entries"].append(se)

        for group in groups.values():
            first = group["entries"][0]
            day_rate = float(first.get("day_rate") or 0)
            cost_rate = float(first.get("cost_rate") or 0)
            revenue_total = 0.0

            for entry in group["entries"]:
                for de in (entry.get("schedule_day_entries") or []):
                    hours = float(de.get("hours") or 0)
                    std_hours = min(hours, 10)
                    ot_hours = max(hours - 10, 0)
                    revenue_total += std_hours * day_rate / 10 + ot_hours * day_rate / 10 * 1.5
                    # Note: variance report in frontend uses this OT formula (differs from rollup)

            actual = next((a for a in actuals if a.get("schedule_entry_id") == group["first_id"]), None)
            actual_total = _actual_cost_total(actual)

            variance = revenue_total - actual_total
            rows.append({
                "item_name": first.get("role_name") or "Unnamed Role",
                "section": "labor",
                "estimated_total": _round2(revenue_total),
                "actual_total": _round2(actual_total),
                "variance": _round2(variance),
                "variance_pct": _round2((variance / revenue_total * 100) if revenue_total > 0 else 0),
            })
    else:
        for entry in labor_entries:
            qty = float(entry.get("quantity") or 0)
            days = float(entry.get("days") or 0)
            rate = float(entry.get("unit_rate") or 0)
            estimated = qty * days * rate

            actual = next((a for a in actuals if a.get("labor_entry_id") == entry["id"]), None)
            actual_total = _actual_cost_total(actual)

            variance = estimated - actual_total
            rows.append({
                "item_name": entry.get("role_name") or "Unnamed Role",
                "section": "labor",
                "estimated_total": _round2(estimated),
                "actual_total": _round2(actual_total),
                "variance": _round2(variance),
                "variance_pct": _round2((variance / estimated * 100) if estimated > 0 else 0),
            })

    # Line items
    for item in line_items:
        qty = float(item.get("quantity") or 0)
        unit_cost = float(item.get("unit_cost") or 0)
        estimated = qty * unit_cost

        actual = next((a for a in actuals if a.get("line_item_id") == item["id"]), None)
        actual_total = _actual_cost_total(actual)

        variance = estimated - actual_total
        rows.append({
            "item_name": item.get("item_name") or "Unnamed Item",
            "section": item.get("section") or "misc",
            "estimated_total": _round2(estimated),
            "actual_total": _round2(actual_total),
            "variance": _round2(variance),
            "variance_pct": _round2((variance / estimated * 100) if estimated > 0 else 0),
        })

    return rows


def _build_empty_result(estimate: dict, client: dict) -> dict:
    return {
        "estimate": {
            "client_name": client.get("name", ""),
            "client_code": client.get("code", ""),
            "event_name": estimate.get("event_name", ""),
            "event_type": estimate.get("event_type", ""),
            "location": estimate.get("location", ""),
            "start_date": estimate.get("start_date", ""),
            "end_date": estimate.get("end_date", ""),
            "duration_days": estimate.get("duration_days", ""),
            "expected_attendance": estimate.get("expected_attendance", ""),
            "po_number": estimate.get("po_number", ""),
            "project_id": estimate.get("project_id", ""),
            "cost_structure": estimate.get("cost_structure", "corporate"),
        },
        "segments": [],
        "totals": {
            "gross_revenue": 0,
            "total_cost": 0,
            "gross_profit": 0,
            "gp_percent": 0,
        },
        "generated_at": date.today().isoformat(),
    }
