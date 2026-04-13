const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export type PDFType =
  | 'client_summary'
  | 'client_detailed'
  | 'internal'
  | 'change_order'
  | 'recap'
  | 'invoice_with_receipts'

export async function generatePDF(
  estimateId: string,
  pdfType: PDFType,
  segmentId?: string,
  changeOrderId?: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/pdf/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      estimate_id: estimateId,
      pdf_type: pdfType,
      segment_id: segmentId || null,
      change_order_id: changeOrderId || null,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'PDF generation failed' }))
    throw new Error(err.error || 'PDF generation failed')
  }

  // Extract filename from Content-Disposition header
  const disposition = res.headers.get('Content-Disposition') || ''
  const filenameMatch = disposition.match(/filename="(.+)"/)
  const filename = filenameMatch?.[1] || 'estimate.pdf'

  // Download the PDF
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Same endpoint, but opens the PDF in a new tab for preview rather than
 *  downloading it. Used by the Send to Client modal so the user can review
 *  exactly what the client will see. */
export async function previewPDF(
  estimateId: string,
  pdfType: PDFType,
  segmentId?: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/pdf/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      estimate_id: estimateId,
      pdf_type: pdfType,
      segment_id: segmentId || null,
      change_order_id: null,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'PDF preview failed' }))
    throw new Error(err.error || 'PDF preview failed')
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  // Open in a new tab. The browser's native PDF viewer renders it.
  // We revoke the URL after a short delay so the tab has time to load it.
  window.open(url, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
