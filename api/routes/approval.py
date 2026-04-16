"""Public approval and rejection endpoints.

Exposes browser-facing HTML endpoints for the client approval email flow:
- GET /api/approval/confirm/{token} — one-click approval
- GET /api/approval/respond/{token} — rejection form page
- POST /api/approval/reject/{token} — process rejection with comments
"""

import traceback

from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse

from services.client_approval_service import (
    ApprovalError,
    confirm_client_approval,
    reject_client_approval,
    validate_pending_token,
)

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


# ── Client rejection endpoints ────────────────────────────────────────────────


@router.get("/respond/{token}", response_class=HTMLResponse)
async def respond_form(token: str) -> HTMLResponse:
    """Render the rejection form page. The client lands here from the
    "Request Changes" link in the approval email."""
    try:
        payload = validate_pending_token(token)
    except ApprovalError as err:
        return HTMLResponse(
            _render_error_page(err.reason),
            status_code=410 if err.reason in ("expired", "already_used") else 404,
        )
    except Exception:
        traceback.print_exc()
        return HTMLResponse(_render_error_page("unexpected"), status_code=500)

    return HTMLResponse(
        _render_respond_form(
            event_name=payload["event_name"],
            client_name=payload["client_name"],
            token=token,
        )
    )


@router.post("/reject/{token}", response_class=HTMLResponse)
async def reject(token: str, request: Request, comments: str = Form(...)) -> HTMLResponse:
    """Process the client's rejection and render a confirmation page."""
    client_ip = request.client.host if request.client else None
    try:
        payload = reject_client_approval(token, comments.strip(), request_ip=client_ip)
    except ApprovalError as err:
        return HTMLResponse(
            _render_error_page(err.reason),
            status_code=410 if err.reason in ("expired", "already_used") else 404,
        )
    except Exception:
        traceback.print_exc()
        return HTMLResponse(_render_error_page("unexpected"), status_code=500)

    return HTMLResponse(
        _render_rejection_success(event_name=payload["event_name"])
    )


def _render_respond_form(*, event_name: str, client_name: str, token: str) -> str:
    client_line = (
        f'<p style="margin:4px 0 16px;color:#666;">{_escape(client_name)}</p>'
        if client_name
        else ""
    )
    return f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Request Changes — DriveShop</title></head>
<body style="{_BASE_STYLE}">
  <div style="{_CARD_STYLE}">
    <div style="font-size:13px;letter-spacing:2px;color:#666;font-weight:600;margin-bottom:24px;">DRIVESHOP</div>
    <h1 style="margin:0 0 8px;font-size:22px;">Request Changes</h1>
    <p style="margin:12px 0 4px;color:#444;">
      Estimate for <strong>{_escape(event_name)}</strong>
    </p>
    {client_line}

    <form method="post" action="/api/approval/reject/{_escape(token)}">
      <label style="display:block;margin:16px 0 6px;font-size:13px;color:#444;font-weight:500;">
        What needs to change?
      </label>
      <textarea
        name="comments"
        required
        rows="5"
        style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #ddd;border-radius:4px;font-family:inherit;font-size:14px;resize:vertical;"
        placeholder="Please describe the changes you'd like..."
      ></textarea>

      <div style="text-align:center;margin:24px 0 8px;">
        <button
          type="submit"
          style="display:inline-block;background:#c74;color:#fff;padding:12px 32px;border:none;border-radius:4px;font-weight:500;font-size:14px;cursor:pointer;"
        >
          Submit Feedback
        </button>
      </div>
    </form>

    <p style="color:#999;font-size:12px;margin:16px 0 0;">
      Your feedback will be sent to the DriveShop team. They will revise the estimate and follow up with you.
    </p>
  </div>
</body>
</html>
"""


def _render_rejection_success(*, event_name: str) -> str:
    return f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Feedback Sent — DriveShop</title></head>
<body style="{_BASE_STYLE}">
  <div style="{_CARD_STYLE}">
    <div style="font-size:13px;letter-spacing:2px;color:#666;font-weight:600;margin-bottom:24px;">DRIVESHOP</div>
    <div style="font-size:44px;margin-bottom:12px;line-height:1;">\u2713</div>
    <h1 style="margin:0 0 8px;font-size:22px;">Thank you \u2014 feedback sent.</h1>
    <p style="margin:12px 0 0;color:#444;">
      Your feedback for <strong>{_escape(event_name)}</strong> has been sent to the DriveShop team.
    </p>
    <p style="margin:28px 0 0;color:#999;font-size:13px;">
      You can close this window. The team will revise the estimate and send you an updated version.
    </p>
  </div>
</body>
</html>
"""
