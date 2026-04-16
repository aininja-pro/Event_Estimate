"""Public approval confirmation endpoint.

Exposes GET /api/approval/confirm/{token} as an unauthenticated, browser-facing
endpoint. The token itself is the credential: a valid, non-expired token flips
the segment's client gate from pending to approved and moves the segment to
'active'. The response is an HTML page, not JSON, because the client lands
here by clicking a link from email.
"""

import traceback

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from services.client_approval_service import ApprovalError, confirm_client_approval

router = APIRouter(prefix="/api/approval")


@router.get("/confirm/{token}", response_class=HTMLResponse)
async def confirm(token: str, request: Request) -> HTMLResponse:
    client_ip = request.client.host if request.client else None
    try:
        payload = confirm_client_approval(token, request_ip=client_ip)
    except ApprovalError as err:
        return HTMLResponse(
            _render_error_page(err.reason),
            status_code=410 if err.reason in ("expired", "already_used") else 404,
        )
    except Exception as err:  # pragma: no cover - catch-all so the user doesn't see a stack trace
        traceback.print_exc()
        return HTMLResponse(_render_error_page("unexpected", str(err)), status_code=500)

    return HTMLResponse(
        _render_success_page(
            event_name=payload["event_name"],
            client_name=payload["client_name"],
        )
    )


_BASE_STYLE = (
    "margin:0;padding:40px 20px;background:#f6f6f8;"
    "font-family:Arial,Helvetica,sans-serif;color:#1a1a2e;"
)
_CARD_STYLE = (
    "max-width:520px;margin:60px auto 0;background:#fff;padding:40px 36px;"
    "border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);"
)


def _render_success_page(*, event_name: str, client_name: str) -> str:
    client_line = (
        f'<p style="margin:4px 0 0;color:#666;">{_escape(client_name)}</p>'
        if client_name
        else ""
    )
    return f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Estimate Approved</title></head>
<body style="{_BASE_STYLE}">
  <div style="{_CARD_STYLE}">
    <div style="font-size:13px;letter-spacing:2px;color:#666;font-weight:600;margin-bottom:24px;">DRIVESHOP</div>
    <div style="font-size:44px;margin-bottom:12px;line-height:1;">\u2713</div>
    <h1 style="margin:0 0 8px;font-size:22px;">Thank you \u2014 approved.</h1>
    <p style="margin:12px 0 0;color:#444;">
      The estimate for <strong>{_escape(event_name)}</strong> has been approved.
    </p>
    {client_line}
    <p style="margin:28px 0 0;color:#999;font-size:13px;">
      You can close this window. DriveShop has been notified and will proceed with the project.
    </p>
  </div>
</body>
</html>
"""


_REASON_MESSAGES = {
    "not_found": (
        "Link not recognized",
        "We couldn't find an approval request matching this link. "
        "If you received this email recently, please contact your DriveShop account manager.",
    ),
    "expired": (
        "Link expired",
        "This approval link is no longer valid. Please contact your DriveShop account manager "
        "to request a fresh estimate.",
    ),
    "superseded": (
        "Newer version available",
        "A more recent version of this estimate was sent. Please use the most recent email "
        "from DriveShop.",
    ),
    "already_used": (
        "Already approved",
        "This estimate has already been approved. Thank you \u2014 no further action needed.",
    ),
    "unexpected": (
        "Something went wrong",
        "We hit an unexpected error while processing your approval. Please contact your "
        "DriveShop account manager.",
    ),
}


def _render_error_page(reason: str, detail: str = "") -> str:
    title, message = _REASON_MESSAGES.get(reason, _REASON_MESSAGES["unexpected"])
    detail_block = (
        f'<p style="margin:16px 0 0;color:#999;font-size:12px;">Reference: {_escape(detail)}</p>'
        if detail
        else ""
    )
    return f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>{_escape(title)}</title></head>
<body style="{_BASE_STYLE}">
  <div style="{_CARD_STYLE}">
    <div style="font-size:13px;letter-spacing:2px;color:#666;font-weight:600;margin-bottom:24px;">DRIVESHOP</div>
    <div style="font-size:36px;margin-bottom:12px;line-height:1;color:#c74;">\u26a0</div>
    <h1 style="margin:0 0 8px;font-size:22px;">{_escape(title)}</h1>
    <p style="margin:12px 0 0;color:#444;">{_escape(message)}</p>
    {detail_block}
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
