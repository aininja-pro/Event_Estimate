"""Invoice-with-receipts PDF merger.

Produces a single PDF containing the client-facing estimate followed by every
receipt attachment for the estimate. PDFs are appended directly; images
(JPG/PNG/etc.) are converted to PDF pages first via Pillow. Missing or
corrupted files are skipped with a logged warning so one bad file doesn't
blow up the whole merge.

Entry point: generate_invoice_with_receipts(estimate_id, segment_id=None)
"""

from __future__ import annotations

import io
import mimetypes
from typing import Any

import httpx
from PIL import Image
from pypdf import PdfReader, PdfWriter

from services.ai_service import get_supabase
from services.pdf_data_service import get_estimate_pdf_data


# Extensions we can safely turn into PDF pages via Pillow. Anything else is
# skipped with a warning — we don't want to attempt to render .csv/.xlsx.
_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tif", ".tiff", ".webp"}
_RECEIPTS_BUCKET = "receipts"


def generate_invoice_with_receipts(
    estimate_id: str,
    segment_id: str | None = None,
) -> tuple[bytes, dict[str, Any]]:
    """Render the client-facing detailed PDF and append every receipt.

    Returns (combined_pdf_bytes, meta). meta carries counts so the caller can
    log or surface "appended N of M receipts (K skipped)".
    """
    db = get_supabase()

    # 1. Base estimate PDF — always the detailed client view. Invoicing wants
    #    the full itemization, not the summary.
    from services.pdf_render_service import render_pdf

    data = get_estimate_pdf_data(estimate_id, segment_id)
    base_pdf = render_pdf("estimate_client.html", data, detailed=True)

    # 2. All receipts for this estimate. We don't segment-filter here — a
    #    billing package typically covers the whole estimate. A future sprint
    #    can add segment-scoped invoices if needed.
    receipts = (
        db.table("receipt_attachments")
        .select("id, file_path, file_name, mime_type")
        .eq("estimate_id", estimate_id)
        .order("uploaded_at", desc=False)
        .execute()
    )
    receipt_rows: list[dict[str, Any]] = receipts.data or []

    # 3. Merge.
    writer = PdfWriter()
    _append_pdf_bytes(writer, base_pdf)

    appended = 0
    skipped: list[dict[str, str]] = []

    for row in receipt_rows:
        try:
            blob = _download_from_storage(db, row["file_path"])
            if blob is None:
                skipped.append({"file_name": row["file_name"], "reason": "missing"})
                continue

            converted = _to_pdf_bytes(blob, row["file_name"], row.get("mime_type"))
            if converted is None:
                skipped.append({"file_name": row["file_name"], "reason": "unsupported"})
                continue

            _append_pdf_bytes(writer, converted)
            appended += 1
        except Exception as err:  # noqa: BLE001 - one bad file shouldn't kill the merge
            skipped.append({"file_name": row.get("file_name", "<unknown>"), "reason": f"error: {err}"})
            print(f"[pdf_merge] skipped receipt {row.get('file_name')}: {err}")

    output = io.BytesIO()
    writer.write(output)
    writer.close()
    combined = output.getvalue()

    meta = {
        "total_receipts": len(receipt_rows),
        "appended": appended,
        "skipped": skipped,
    }
    return combined, meta


def _append_pdf_bytes(writer: PdfWriter, pdf_bytes: bytes) -> None:
    """Append every page of pdf_bytes to writer."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    for page in reader.pages:
        writer.add_page(page)


def _download_from_storage(db: Any, file_path: str) -> bytes | None:
    """Fetch a receipt file. Uses a short-lived signed URL (via PostgREST
    storage API) so this works with the private `receipts` bucket without
    granting public read access.
    """
    try:
        signed = db.storage.from_(_RECEIPTS_BUCKET).create_signed_url(file_path, 120)
        url = signed.get("signedURL") or signed.get("signed_url") or signed.get("url")
        if not url:
            return None
        resp = httpx.get(url, timeout=30.0)
        if resp.status_code != 200:
            return None
        return resp.content
    except Exception as err:  # noqa: BLE001
        print(f"[pdf_merge] storage fetch failed for {file_path}: {err}")
        return None


def _to_pdf_bytes(
    blob: bytes,
    file_name: str,
    mime_type: str | None,
) -> bytes | None:
    """Return PDF bytes for the given file. PDFs pass through unchanged;
    supported image types are converted; everything else returns None (caller
    will record the skip reason).
    """
    # PDFs pass through. Check mime first, fall back to extension.
    if (mime_type or "").lower() == "application/pdf" or file_name.lower().endswith(".pdf"):
        return blob

    ext = "." + file_name.lower().rsplit(".", 1)[-1] if "." in file_name else ""
    guessed_type = mime_type or mimetypes.guess_type(file_name)[0] or ""
    is_image = ext in _IMAGE_EXTS or guessed_type.startswith("image/")
    if not is_image:
        return None

    try:
        with Image.open(io.BytesIO(blob)) as img:
            # Pillow's PDF encoder can't write alpha — flatten on white.
            if img.mode in ("RGBA", "LA", "P"):
                flat = Image.new("RGB", img.size, (255, 255, 255))
                flat.paste(img.convert("RGBA"), mask=img.convert("RGBA").split()[-1])
                img = flat
            elif img.mode != "RGB":
                img = img.convert("RGB")

            out = io.BytesIO()
            img.save(out, format="PDF", resolution=150.0)
            return out.getvalue()
    except Exception as err:  # noqa: BLE001
        print(f"[pdf_merge] image conversion failed for {file_name}: {err}")
        return None
