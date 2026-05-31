"""Email dispatch endpoints.

Currently exposes only the client-approval send flow. Future internal-notification
routes would live here too.
"""

import os
import traceback
from datetime import date

from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.ai_service import get_supabase
from services.client_approval_service import get_pending_token_for_segment
from services.email_service import send_client_approval_email
from services.pdf_data_service import get_estimate_pdf_data

router = APIRouter(prefix="/api/email")


class SendClientApprovalRequest(BaseModel):
    estimate_id: str
    labor_log_id: str
    approval_request_id: str | None = None
    recipient_email: str
    note: str = ""
    sent_by: str | None = Field(default=None, description="Profile id of the user triggering the send.")


@router.post("/send-client-approval")
async def send_client_approval(req: SendClientApprovalRequest) -> dict:
    """Generate the client-facing PDF, issue a fresh approval token, and email
    it to the client. Supersedes any existing pending token on the segment so
    only the newest link can be used.
    """
    try:
        db = get_supabase()
        email_enabled = os.getenv("CLIENT_APPROVAL_EMAIL_ENABLED", "false").strip().lower() == "true"

        # 1. Supersede any outstanding pending token for this segment, then issue
        #    a fresh one. Done regardless of email mode so the confirm endpoint
        #    always has a live link to test (older links stop working).
        existing = get_pending_token_for_segment(req.labor_log_id)
        if existing:
            db.table("client_approval_tokens").update({"status": "superseded"}).eq(
                "id", existing["id"]
            ).execute()

        # DB defaults: 30-day expiry, fresh UUID.
        insert = (
            db.table("client_approval_tokens")
            .insert(
                {
                    "estimate_id": req.estimate_id,
                    "labor_log_id": req.labor_log_id,
                    "approval_request_id": req.approval_request_id,
                    "client_email": req.recipient_email,
                    "sent_by": req.sent_by,
                    "note": req.note or None,
                }
            )
            .execute()
        )
        token_row = insert.data[0]
        approval_base = os.getenv("APPROVAL_BASE_URL", "http://localhost:8000").rstrip("/")
        approval_url = f"{approval_base}/api/approval/confirm/{token_row['token']}"

        # 2. Hybrid email mode (beta): client-facing email is gated OFF until the
        #    Resend sender domain is verified. Do NOT email the external client;
        #    return the token + confirm link so internal users can test directly.
        if not email_enabled:
            return {
                "ok": True,
                "email_sent": False,
                "client_email_disabled": True,
                "token_id": token_row["id"],
                "sent_to": req.recipient_email,
                "approval_url": approval_url,
                "message": (
                    "Client approval email is disabled for beta (pending Resend "
                    "sender-domain verification). A token was created; the confirm "
                    "link is active for testing."
                ),
            }

        # 3. Email mode ON — gather data, render the client-facing PDF, and send.
        data = get_estimate_pdf_data(req.estimate_id, req.labor_log_id)
        estimate = data.get("estimate", {})
        client_name = estimate.get("client_name", "Client")
        event_name = estimate.get("event_name", "Estimate")
        gross_revenue = float(data.get("totals", {}).get("gross_revenue", 0) or 0)

        from services.pdf_render_service import render_pdf

        pdf_bytes = render_pdf("estimate_client.html", data, detailed=False)
        safe_client = client_name.replace(" ", "_")
        safe_event = event_name.replace(" ", "_")
        pdf_filename = f"{safe_client}_{safe_event}_Estimate_{date.today().isoformat()}.pdf"

        # Any Resend error bubbles up to the handler below — we don't roll back
        # the token (user can resend; superseding on retry is handled in step 1).
        resend_response = send_client_approval_email(
            to_email=req.recipient_email,
            client_name=client_name,
            event_name=event_name,
            estimate_total=gross_revenue,
            approval_token=token_row["token"],
            pdf_bytes=pdf_bytes,
            pdf_filename=pdf_filename,
            note=req.note or "",
        )

        return {
            "ok": True,
            "email_sent": True,
            "token_id": token_row["id"],
            "sent_to": req.recipient_email,
            "pdf_filename": pdf_filename,
            "resend_id": (resend_response or {}).get("id"),
        }
    except Exception as err:
        traceback.print_exc()
        return {"ok": False, "error": str(err)}
