"""Resend email integration.

Currently used for sending client approval emails (estimate PDF + one-click
approval link). Additional email types can be added here as the product grows.
"""

import base64
import os

import resend

resend.api_key = os.getenv("RESEND_API_KEY", "")


def send_client_approval_email(
    *,
    to_email: str,
    client_name: str,
    event_name: str,
    estimate_total: float,
    approval_token: str,
    pdf_bytes: bytes,
    pdf_filename: str,
    note: str = "",
) -> dict:
    """Email a client the estimate PDF + a one-click approval link.

    Caller is responsible for creating the client_approval_tokens row and
    generating the PDF. This function only handles the send.

    Raises on Resend errors — caller decides how to surface failure.
    """
    from_email = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
    approval_base = os.getenv("APPROVAL_BASE_URL", "http://localhost:8000").rstrip("/")
    approval_url = f"{approval_base}/api/approval/confirm/{approval_token}"

    html = _build_approval_html(
        client_name=client_name,
        event_name=event_name,
        estimate_total=estimate_total,
        approval_url=approval_url,
        note=note,
    )

    response = resend.Emails.send(
        {
            "from": from_email,
            "to": [to_email],
            "subject": f"Estimate for Review: {event_name} \u2014 DriveShop",
            "html": html,
            "attachments": [
                {
                    "filename": pdf_filename,
                    "content": base64.b64encode(pdf_bytes).decode("ascii"),
                }
            ],
        }
    )
    return response


def _build_approval_html(
    *,
    client_name: str,
    event_name: str,
    estimate_total: float,
    approval_url: str,
    note: str,
) -> str:
    note_block = (
        f'<p style="margin:16px 0;color:#444;font-style:italic;">{_escape(note)}</p>'
        if note.strip()
        else ""
    )
    return f"""\
<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f6f6f8;font-family:Arial,Helvetica,sans-serif;color:#1a1a2e;">
  <div style="max-width:600px;margin:0 auto;background:#fff;padding:28px 32px;border-radius:6px;">
    <div style="border-bottom:2px solid #1a1a2e;padding-bottom:12px;margin-bottom:20px;">
      <div style="font-size:18px;letter-spacing:2px;font-weight:700;">DRIVESHOP</div>
    </div>

    <p style="margin:0 0 12px;">Hi,</p>
    <p style="margin:0 0 16px;">Please review the attached estimate for <strong>{_escape(event_name)}</strong>.</p>

    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:6px 0;color:#666;width:120px;">Client</td>
        <td style="padding:6px 0;font-weight:500;">{_escape(client_name)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#666;">Event</td>
        <td style="padding:6px 0;font-weight:500;">{_escape(event_name)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#666;">Total</td>
        <td style="padding:6px 0;font-weight:500;">${estimate_total:,.0f}</td>
      </tr>
    </table>

    {note_block}

    <div style="text-align:center;margin:28px 0 20px;">
      <a href="{approval_url}"
         style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 32px;text-decoration:none;border-radius:4px;font-weight:500;">
        Approve Estimate
      </a>
    </div>

    <p style="color:#999;font-size:12px;margin:20px 0 0;">
      Clicking the button confirms the estimate on your behalf. If you have questions,
      reply to this email or contact your account manager.
    </p>
  </div>
</body>
</html>
"""


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )
