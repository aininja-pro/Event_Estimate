# Requirements: PDF Generation — Event Estimate Engine

## Problem

Estimates exist only inside the web application. There's no way to export a professional document to share with clients, print for internal review, or attach to an email. The SOW specifically calls for two PDF types — a client-facing export with internal costs hidden, and an internal version with full P&L visibility. Kim also requested the option for summary-level vs. detailed line-item output, since some clients only want total + section breakout while others want every line item.

## Cost of Status Quo

- Estimators can't share a polished estimate document with clients
- Internal financial review requires looking at the app — no printable P&L document
- Change order deltas have no exportable format for client communication
- Recap variance reports can't be shared outside the system

## Who This Is For

- **Primary users:** Dan, Tim (Production Managers) — generate PDFs to send to clients or print for internal meetings
- **Stakeholders:** Tatiana (CFO) — needs internal P&L PDFs for financial review
- **Stakeholders:** Account Managers (Kim, Tad) — send client-facing estimates for approval
- **Stakeholders:** Derek (CEO) — professional output reflects the quality of the platform

## Proposal

Add PDF export buttons to the Estimate Builder that generate professional documents via the FastAPI backend using WeasyPrint. Two core document types with format options.

## Success Criteria

- "Export PDF" button on the Estimate Builder generates a downloadable PDF within 5 seconds
- Client-facing PDF shows event details, section totals, line items, and grand total — NO internal costs, margins, or GP data visible
- Internal PDF shows the full P&L: revenue, cost, GP, GP% per line item and per section
- User can choose between Summary (section totals only) and Detailed (all line items) format
- PDFs look professional — DriveShop branding, clean typography, proper page breaks
- Change order PDFs show the delta summary (added/removed/modified with dollar impact)
- Recap variance PDFs show estimated vs. actual with variance per section

## Scope

### Included (This Blueprint)

**Two core PDF types:**

1. **Client-Facing Estimate PDF (sanitized)**
   - Event header: client name, event name, event type, location, dates, PO number, duration, attendance
   - Section-by-section breakdown with line items
   - Each line item shows: item name, quantity, unit rate (client rate), total
   - Section subtotals
   - Agency fee (if applicable)
   - Grand total
   - NO columns for: cost rate, GP, GP%, net revenue, resource type, internal notes
   - DriveShop logo/branding in header
   - "CONFIDENTIAL" watermark option
   - Summary mode: section totals only, no individual line items
   - Detailed mode: all line items within each section

2. **Internal P&L PDF (full visibility)**
   - Everything in the client-facing PDF PLUS:
   - Cost rate column per line item
   - GP and GP% per line item
   - Section-level GP summary
   - Net Revenue row
   - Overall P&L summary: GR, NR, Total Cost, GP, GP%
   - Resource type breakdown (internal/external/vendor) if relevant
   - "INTERNAL — NOT FOR CLIENT DISTRIBUTION" header

**Additional PDF types (generated from existing data):**

3. **Change Order PDF**
   - CO number, description, date
   - Delta summary: added/removed/modified items with dollar amounts
   - Before and after totals
   - Net change amount
   - Approval status and approver name

4. **Recap Variance PDF**
   - Section-by-section: estimated vs. actual with variance ($ and %)
   - Overall variance summary
   - Staff assignment list (names matched to roles)

**Generation architecture:**
- FastAPI endpoint: `POST /api/pdf/generate`
- WeasyPrint renders HTML templates to PDF on the backend
- HTML templates with CSS for print styling (page breaks, headers/footers, tables)
- PDF returned as downloadable file to the frontend
- Frontend shows "Generating PDF..." loading state, then triggers download

**UI:**
- "Export" dropdown button on the Estimate Builder header
- Options: "Client PDF (Summary)", "Client PDF (Detailed)", "Internal P&L", "Change Order" (if COs exist), "Recap Report" (if recap data exists)
- Generated PDF opens in a new tab or downloads directly

### Not Included

- PDF preview within the application (PDF opens in browser or downloads)
- Editable PDF templates (templates are code-managed, not user-editable)
- E-signature integration on PDFs
- Batch PDF generation (one estimate at a time)
- Custom branding per client (DriveShop branding only for v1)
- PDF storage in Supabase (generated on-demand, not stored)

## Dependencies

- **FastAPI backend** — deployed on Render ✅
- **WeasyPrint** — Python library, needs to be installed in the API environment
- **Estimate data** — all data accessible via existing Supabase queries
- **Change order data** — delta_summary stored as JSONB ✅
- **Recap data** — variance report function exists ✅
- **DriveShop logo** — need a logo file for the PDF header (ask Derek or grab from website)

## Inputs

- **Estimate ID** — identifies which estimate to export
- **PDF type** — client_summary, client_detailed, internal, change_order, recap
- **Segment filter** — optional, for multi-segment estimates (export specific segment or all)

## Outputs

- **PDF file** — downloadable document, properly formatted for print (US Letter, 8.5" × 11")
- **Filename convention:** `{ClientName}_{EventName}_{Type}_{Date}.pdf` (e.g., "Mazda_RideDrive_Estimate_2026-04-07.pdf")

## Constraints

- WeasyPrint requires system-level dependencies (Cairo, Pango, etc.). Verify these are available on Render or add them to the build.
- PDF generation should complete within 5 seconds for typical estimates. Complex multi-segment estimates may take longer.
- HTML templates should be maintainable — clean HTML/CSS, not deeply nested Python string concatenation.
- The internal PDF must never be accidentally sent to a client. Clear "INTERNAL" branding and separate button placement help prevent this.

## Resolved Decisions

- **WeasyPrint, not browser-based PDF.** Server-side generation gives consistent output regardless of browser. Matches the SOW tech stack.
- **HTML templates rendered to PDF.** WeasyPrint converts HTML+CSS to PDF. This is the standard pattern — easier to style than direct PDF library calls.
- **On-demand generation, not stored.** PDFs are generated fresh each time. No storage overhead, always reflects current data.
- **Summary vs. Detailed is a format option, not a separate document type.** Same template, conditional rendering of line items.

## Open Questions

*None — all resolved.*
