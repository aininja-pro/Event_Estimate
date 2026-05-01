"""Email dispatch endpoints.

Currently exposes only the client-approval send flow. Future internal-notification
routes would live here too.
"""

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

        # 1. Gather estimate data — reused for the PDF and the email body.
        data = get_estimate_pdf_data(req.estimate_id, req.labor_log_id)
        estimate = data.get("estimate", {})
        client_name = estimate.get("client_name", "Client")
        event_name = estimate.get("event_name", "Estimate")
        gross_revenue = float(data.get("totals", {}).get("gross_revenue", 0) or 0)

        # 2. Render the client-facing PDF (not detailed — matches "client_summary").
        from services.pdf_render_service import render_pdf

        pdf_bytes = render_pdf("estimate_client.html", data, detailed=False)
        safe_client = client_name.replace(" ", "_")
        safe_event = event_name.replace(" ", "_")
        pdf_filename = f"{safe_client}_{safe_event}_Estimate_{date.today().isoformat()}.pdf"

        # 3. Supersede any outstanding pending token for this segment — the new
        #    email is the source of truth, older links should stop working.
        existing = get_pending_token_for_segment(req.labor_log_id)
        if existing:
            db.table("client_approval_tokens").update({"status": "superseded"}).eq(
                "id", existing["id"]
            ).execute()

        # 4. Create the new token. DB defaults: 30-day expiry, fresh UUID.
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

        # 5. Fire the email. Any Resend error bubbles up to the 500 handler
        #    below — we don't roll back the token (user can resend; superseding
        #    the token on retry is handled in step 3).
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
            "token_id": token_row["id"],
            "sent_to": req.recipient_email,
            "pdf_filename": pdf_filename,
            "resend_id": (resend_response or {}).get("id"),
        }
    except Exception as err:
        traceback.print_exc()
        return {"ok": False, "error": str(err)}
