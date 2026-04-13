import traceback
from typing import Literal

from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel
from datetime import date

from services.pdf_data_service import (
    get_estimate_pdf_data,
    get_change_order_pdf_data,
    get_recap_pdf_data,
)
from services.pdf_merge_service import generate_invoice_with_receipts
from services.pdf_render_service import render_pdf

router = APIRouter(prefix="/api/pdf")


class PDFRequest(BaseModel):
    estimate_id: str
    pdf_type: Literal[
        "client_summary",
        "client_detailed",
        "internal",
        "change_order",
        "recap",
        "invoice_with_receipts",
    ]
    segment_id: str | None = None
    change_order_id: str | None = None


# Map pdf_type to template name and rendering options
TEMPLATE_MAP = {
    "client_summary": ("estimate_client.html", False),
    "client_detailed": ("estimate_client.html", True),
    "internal": ("estimate_internal.html", True),
    "change_order": ("change_order.html", False),
    "recap": ("recap.html", False),
}

FILENAME_LABELS = {
    "client_summary": "Estimate",
    "client_detailed": "Estimate_Detailed",
    "internal": "Internal",
    "change_order": "CO",
    "recap": "Recap",
    "invoice_with_receipts": "Invoice_with_Receipts",
}


@router.post("/generate")
async def generate_pdf(request: PDFRequest):
    """Generate a PDF for the given estimate and type."""
    try:
        # 1. Gather data + render PDF. invoice_with_receipts short-circuits
        #    here because it pulls the client-facing detailed PDF itself and
        #    appends receipt attachments — no template branching needed.
        if request.pdf_type == "invoice_with_receipts":
            # Need client / event name for the filename — gather data once.
            data = get_estimate_pdf_data(request.estimate_id, request.segment_id)
            client_name = data["estimate"]["client_name"]
            event_name = data["estimate"]["event_name"]
            pdf_bytes, _meta = generate_invoice_with_receipts(
                request.estimate_id, request.segment_id
            )
        elif request.pdf_type in ("client_summary", "client_detailed", "internal"):
            data = get_estimate_pdf_data(request.estimate_id, request.segment_id)
            client_name = data["estimate"]["client_name"]
            event_name = data["estimate"]["event_name"]
            template_name, detailed = TEMPLATE_MAP[request.pdf_type]
            pdf_bytes = render_pdf(template_name, data, detailed=detailed)
        elif request.pdf_type == "change_order":
            if not request.change_order_id:
                return {"error": "change_order_id is required for change_order PDF type"}
            data = get_change_order_pdf_data(request.change_order_id)
            client_name = data["client_name"]
            event_name = data["event_name"]
            template_name, detailed = TEMPLATE_MAP[request.pdf_type]
            pdf_bytes = render_pdf(template_name, data, detailed=detailed)
        elif request.pdf_type == "recap":
            data = get_recap_pdf_data(request.estimate_id, request.segment_id)
            client_name = data["client_name"]
            event_name = data["event_name"]
            template_name, detailed = TEMPLATE_MAP[request.pdf_type]
            pdf_bytes = render_pdf(template_name, data, detailed=detailed)
        else:
            return {"error": f"Unknown pdf_type: {request.pdf_type}"}

        # 3. Build filename
        safe_client = client_name.replace(" ", "_")
        safe_event = event_name.replace(" ", "_")
        type_label = FILENAME_LABELS[request.pdf_type]
        if request.pdf_type == "change_order":
            type_label = f"CO-{data.get('co_number', '001')}"

        filename = f"{safe_client}_{safe_event}_{type_label}_{date.today().isoformat()}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


@router.post("/debug-data")
async def debug_pdf_data(request: PDFRequest):
    """Debug endpoint — returns raw data that would be used for PDF rendering."""
    try:
        if request.pdf_type in ("client_summary", "client_detailed", "internal"):
            return get_estimate_pdf_data(request.estimate_id, request.segment_id)
        elif request.pdf_type == "change_order":
            if not request.change_order_id:
                return {"error": "change_order_id required"}
            return get_change_order_pdf_data(request.change_order_id)
        elif request.pdf_type == "recap":
            return get_recap_pdf_data(request.estimate_id, request.segment_id)
        else:
            return {"error": f"Unknown pdf_type: {request.pdf_type}"}
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}
