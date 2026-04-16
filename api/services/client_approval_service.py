"""Python-side client-gate approval.

When a client clicks the one-click approval link in their email, this service
replicates the client-gate branch of reviewApproval() (src/lib/workflow-service.ts
lines 836-868) on the server: mark the token approved, resolve the pending
approval_requests row, transition the segment from in_review -> active, log the
segment_activities row, and notify the internal team.

The rest of the 3-gate chain (AM, executive) still runs through the TypeScript
workflow service; only the terminal client gate is handled here.
"""

from datetime import datetime, timezone
from typing import Any

from services.ai_service import get_supabase


class ApprovalError(Exception):
    """Raised when a token cannot be used. reason is machine-readable."""

    def __init__(self, reason: str, message: str = ""):
        super().__init__(message or reason)
        self.reason = reason  # 'not_found' | 'expired' | 'already_used'


def confirm_client_approval(token: str, request_ip: str | None = None) -> dict[str, Any]:
    """Validate a token and run the client-gate approval sequence.

    Returns {"event_name": str, "client_name": str} on success.
    Raises ApprovalError on any validation failure (caller renders the error page).
    """
    db = get_supabase()

    token_rows = (
        db.table("client_approval_tokens")
        .select("*")
        .eq("token", token)
        .limit(1)
        .execute()
    )
    if not token_rows.data:
        raise ApprovalError("not_found", "No matching approval token.")
    token_row = token_rows.data[0]

    if token_row["status"] == "approved":
        return _success_payload(db, token_row["estimate_id"])
    if token_row["status"] == "rejected":
        raise ApprovalError("already_used", "This estimate already has pending feedback.")
    if token_row["status"] in ("expired", "superseded"):
        raise ApprovalError(token_row["status"], f"Token is {token_row['status']}.")

    # Lazy-expire tokens that slipped past their expires_at.
    expires_at = _parse_ts(token_row["expires_at"])
    now = datetime.now(timezone.utc)
    if expires_at and expires_at < now:
        db.table("client_approval_tokens").update({"status": "expired"}).eq(
            "id", token_row["id"]
        ).execute()
        raise ApprovalError("expired", "Token has expired.")

    estimate_id: str = token_row["estimate_id"]
    labor_log_id: str = token_row["labor_log_id"]
    approval_request_id: str | None = token_row.get("approval_request_id")
    client_email: str = token_row["client_email"]

    # 1. Mark token approved (first write — locks the token from a double-submit
    #    race. Subsequent writes below are best-effort; on failure we surface the
    #    error but the token is already consumed).
    db.table("client_approval_tokens").update(
        {
            "status": "approved",
            "approved_at": now.isoformat(),
            "approved_from_ip": request_ip,
        }
    ).eq("id", token_row["id"]).execute()

    # 2. Resolve the matching approval_requests row.
    approval_row = _resolve_approval_request(db, approval_request_id, labor_log_id)
    if approval_row is not None:
        db.table("approval_requests").update(
            {
                "status": "approved",
                "reviewed_at": now.isoformat(),
                "reviewer": client_email,
                "reviewed_by": None,
                "notes": "Approved by client via email link",
            }
        ).eq("id", approval_row["id"]).execute()

    # 3. Transition the segment to active (idempotent — skip if already active).
    segment = (
        db.table("labor_logs")
        .select("id, status, estimate_id, location_name")
        .eq("id", labor_log_id)
        .limit(1)
        .execute()
    )
    if not segment.data:
        return _success_payload(db, estimate_id)
    seg_row = segment.data[0]
    from_status = seg_row.get("status") or "estimate"

    if from_status != "active":
        db.table("labor_logs").update({"status": "active"}).eq("id", labor_log_id).execute()

        # 4. Log segment_activities for the History panel.
        db.table("segment_activities").insert(
            {
                "labor_log_id": labor_log_id,
                "estimate_id": estimate_id,
                "action": "status_change",
                "from_status": from_status,
                "to_status": "active",
                "changed_by": client_email,
                "comment": "Client approved via email link",
                "metadata": {
                    "gate": "client",
                    "channel": "email",
                    "token_id": token_row["id"],
                },
            }
        ).execute()

    # 5. Notify the internal team — sender, creator, AMs, production_managers.
    #    Best effort: approval must succeed even if notifications fail.
    try:
        _notify_internal(
            db,
            estimate_id=estimate_id,
            labor_log_id=labor_log_id,
            segment_name=seg_row.get("location_name") or "Segment",
            client_email=client_email,
            sent_by=token_row.get("sent_by"),
        )
    except Exception as err:  # pragma: no cover - notification failures must not break approval
        print(f"[client_approval] notification dispatch failed: {err}")

    return _success_payload(db, estimate_id)


def reject_client_approval(
    token: str, comments: str, request_ip: str | None = None
) -> dict[str, Any]:
    """Validate a token and run the client-gate rejection sequence.

    Returns {"event_name": str, "client_name": str} on success.
    Raises ApprovalError on any validation failure.
    """
    db = get_supabase()

    token_rows = (
        db.table("client_approval_tokens")
        .select("*")
        .eq("token", token)
        .limit(1)
        .execute()
    )
    if not token_rows.data:
        raise ApprovalError("not_found", "No matching approval token.")
    token_row = token_rows.data[0]

    if token_row["status"] == "approved":
        raise ApprovalError("already_used", "This estimate has already been approved.")
    if token_row["status"] == "rejected":
        raise ApprovalError("already_used", "This estimate already has pending feedback.")
    if token_row["status"] in ("expired", "superseded"):
        raise ApprovalError(token_row["status"], f"Token is {token_row['status']}.")

    expires_at = _parse_ts(token_row["expires_at"])
    now = datetime.now(timezone.utc)
    if expires_at and expires_at < now:
        db.table("client_approval_tokens").update({"status": "expired"}).eq(
            "id", token_row["id"]
        ).execute()
        raise ApprovalError("expired", "Token has expired.")

    estimate_id: str = token_row["estimate_id"]
    labor_log_id: str = token_row["labor_log_id"]
    approval_request_id: str | None = token_row.get("approval_request_id")
    client_email: str = token_row["client_email"]

    # 1. Mark token rejected.
    db.table("client_approval_tokens").update(
        {
            "status": "rejected",
            "rejected_at": now.isoformat(),
            "rejected_from_ip": request_ip,
            "rejection_notes": comments,
        }
    ).eq("id", token_row["id"]).execute()

    # 2. Resolve and reject the matching approval_requests row.
    approval_row = _resolve_approval_request(db, approval_request_id, labor_log_id)
    if approval_row is not None:
        db.table("approval_requests").update(
            {
                "status": "rejected",
                "reviewed_at": now.isoformat(),
                "reviewer": client_email,
                "reviewed_by": None,
                "notes": f"Client requested changes: {comments}",
            }
        ).eq("id", approval_row["id"]).execute()

    # 3. Transition the segment back to estimate (skip if no longer in_review).
    segment = (
        db.table("labor_logs")
        .select("id, status, estimate_id, location_name")
        .eq("id", labor_log_id)
        .limit(1)
        .execute()
    )
    if not segment.data:
        return _success_payload(db, estimate_id)
    seg_row = segment.data[0]
    from_status = seg_row.get("status") or "in_review"

    if from_status == "in_review":
        db.table("labor_logs").update({"status": "estimate"}).eq("id", labor_log_id).execute()

        # 4. Log segment_activities for the History panel.
        db.table("segment_activities").insert(
            {
                "labor_log_id": labor_log_id,
                "estimate_id": estimate_id,
                "action": "status_change",
                "from_status": from_status,
                "to_status": "estimate",
                "changed_by": client_email,
                "comment": f"Client requested changes via email: {comments}",
                "metadata": {
                    "gate": "client",
                    "channel": "email",
                    "token_id": token_row["id"],
                    "rejected": True,
                },
            }
        ).execute()

    # 5. Notify the internal team.
    try:
        _notify_internal(
            db,
            estimate_id=estimate_id,
            labor_log_id=labor_log_id,
            segment_name=seg_row.get("location_name") or "Segment",
            client_email=client_email,
            sent_by=token_row.get("sent_by"),
            rejected=True,
            rejection_comments=comments,
        )
    except Exception as err:  # pragma: no cover
        print(f"[client_approval] rejection notification dispatch failed: {err}")

    return _success_payload(db, estimate_id)


def validate_pending_token(token: str) -> dict[str, Any]:
    """Validate a token is pending without consuming it. Returns the token row + estimate info."""
    db = get_supabase()
    token_rows = (
        db.table("client_approval_tokens")
        .select("*")
        .eq("token", token)
        .limit(1)
        .execute()
    )
    if not token_rows.data:
        raise ApprovalError("not_found", "No matching approval token.")
    token_row = token_rows.data[0]

    if token_row["status"] != "pending":
        reason = "already_used" if token_row["status"] in ("approved", "rejected") else token_row["status"]
        raise ApprovalError(reason, f"Token is {token_row['status']}.")

    expires_at = _parse_ts(token_row["expires_at"])
    now = datetime.now(timezone.utc)
    if expires_at and expires_at < now:
        db.table("client_approval_tokens").update({"status": "expired"}).eq(
            "id", token_row["id"]
        ).execute()
        raise ApprovalError("expired", "Token has expired.")

    payload = _success_payload(db, token_row["estimate_id"])
    return {**payload, "token": token}


def _resolve_approval_request(
    db: Any, approval_request_id: str | None, labor_log_id: str
) -> dict | None:
    if approval_request_id:
        found = (
            db.table("approval_requests")
            .select("id, status")
            .eq("id", approval_request_id)
            .limit(1)
            .execute()
        )
        if found.data and found.data[0]["status"] == "pending":
            return found.data[0]
    pending = (
        db.table("approval_requests")
        .select("id, status")
        .eq("labor_log_id", labor_log_id)
        .eq("approval_gate", "client")
        .eq("status", "pending")
        .order("requested_at", desc=True)
        .limit(1)
        .execute()
    )
    return pending.data[0] if pending.data else None


def _notify_internal(
    db: Any,
    *,
    estimate_id: str,
    labor_log_id: str,
    segment_name: str,
    client_email: str,
    sent_by: str | None,
    rejected: bool = False,
    rejection_comments: str = "",
) -> None:
    """Fan out a notification to the internal team when the client approves or rejects.

    Recipient set (deduplicated):
      - The user who clicked "Send to Client" (sent_by on the token).
      - The estimate's creator.
      - All account_manager role users.
      - All production_manager role users.

    A single bell notification is created per user. The sender and creator get
    an "approval_decision" framing; AMs / PMs get a broader "segment_status_changed"
    framing.
    """
    if rejected:
        base_body = f'"{segment_name}" — client ({client_email}) requested changes.'
        if rejection_comments:
            base_body += f' Feedback: "{rejection_comments}"'
        metadata = {"gate": "client", "channel": "email", "client_email": client_email, "rejected": True}
    else:
        base_body = f'"{segment_name}" was approved by the client ({client_email}) and is now active.'
        metadata = {"gate": "client", "channel": "email", "client_email": client_email}

    sent_ids: set[str] = set()

    def _send(user_id: str | None, *, type_: str, title: str) -> None:
        if not user_id or user_id in sent_ids:
            return
        sent_ids.add(user_id)
        db.table("notifications").insert(
            {
                "user_id": user_id,
                "type": type_,
                "title": title,
                "body": base_body,
                "estimate_id": estimate_id,
                "labor_log_id": labor_log_id,
                "metadata": metadata,
            }
        ).execute()

    sender_title = "Client requested changes" if rejected else "Client approved your estimate"
    _send(sent_by, type_="approval_decision", title=sender_title)

    estimate = (
        db.table("estimates")
        .select("created_by")
        .eq("id", estimate_id)
        .limit(1)
        .execute()
    )
    creator_id = estimate.data[0]["created_by"] if estimate.data else None
    creator_title = "Client requested changes — segment sent back" if rejected else "Segment approved — now active"
    _send(creator_id, type_="approval_decision", title=creator_title)

    team_title = "Client requested changes" if rejected else "Segment now active"
    team = (
        db.table("profiles")
        .select("id")
        .in_("role", ["account_manager", "production_manager"])
        .execute()
    )
    for person in team.data or []:
        _send(person["id"], type_="segment_status_changed", title=team_title)


def _success_payload(db: Any, estimate_id: str) -> dict[str, str]:
    row = (
        db.table("estimates")
        .select("event_name, clients(name)")
        .eq("id", estimate_id)
        .limit(1)
        .execute()
    )
    event_name = "the estimate"
    client_name = ""
    if row.data:
        event_name = row.data[0].get("event_name") or event_name
        client = row.data[0].get("clients") or {}
        client_name = client.get("name", "") if isinstance(client, dict) else ""
    return {"event_name": event_name, "client_name": client_name}


def _parse_ts(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        # Supabase returns ISO 8601 with 'Z' or '+00:00' — both parseable.
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def get_pending_token_for_segment(labor_log_id: str) -> dict | None:
    """Used by the future Send-to-Client endpoint (Step 2) to supersede an
    outstanding token before creating a new one.
    """
    db = get_supabase()
    rows = (
        db.table("client_approval_tokens")
        .select("*")
        .eq("labor_log_id", labor_log_id)
        .eq("status", "pending")
        .limit(1)
        .execute()
    )
    return rows.data[0] if rows.data else None
