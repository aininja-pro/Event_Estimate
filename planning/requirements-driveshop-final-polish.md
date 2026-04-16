# Requirements: Client Email, Invoice PDF with Receipts, Data Feed — Final Polish Sprint

## Problem

Three gaps remaining from Dave's April 8 feedback:

1. **No way to send estimates to clients electronically.** After internal approval, the current process is: generate PDF, manually email it, wait for the client to respond via email, then manually mark it approved in the system. There's no system-generated email and no way for the client to respond through the platform.

2. **Invoice PDFs don't include receipt attachments.** When billing, Dave wants one combined document: the invoice detail plus all uploaded receipts appended. Currently, receipts are stored in Supabase Storage but can't be bundled into the PDF export.

3. **No data feed for Dave's external reporting.** Dave builds dashboards in Power BI pulling from a Google Sheet (fed by JotForm today). He needs a way to pull estimate data from this system in a format he can consume.

## Who This Is For

- **Client email:** Account Managers (Tad, Kim, Gayle) — send estimates to clients for approval
- **Invoice PDF:** Tatiana (CFO), Dave (Operations) — generate complete billing packages
- **Data feed:** Dave (Operations) — pull data into external dashboards and reporting tools

## Proposal

One sprint, three features:

1. **Client approval email** via Resend (email API) — when internal approval clears and the user confirms "send to client," the system emails the client contact with the estimate PDF attached and an approval link. Client clicks "Approve" in the email → status updates automatically.
2. **Invoice PDF with bundled receipts** — extend the existing PDF export to append uploaded receipt files (from Supabase Storage) into one combined document.
3. **Data feed API** — a read-only FastAPI endpoint that returns estimate summary data in JSON format for Dave's external tools.

## Success Criteria

### Client Email
- After AM approval, a "Send to Client" modal appears with pre-filled client contact (from rate card)
- User can verify/change the recipient email and add a note
- System sends an email via Resend with the client-facing estimate PDF attached
- Email includes an "Approve Estimate" button/link
- Clicking the link updates the estimate status to active (client approval gate cleared)
- The approval link is a unique, time-limited token — no login required for the client
- Estimate status shows "Pending Client Approval" while waiting

### Invoice PDF with Receipts
- New export option: "Invoice with Receipts" in the Export dropdown
- Generates the estimate PDF (client-facing or internal, user chooses)
- Appends all uploaded receipt files (from Supabase Storage) as additional pages
- PDFs and images (JPG, PNG) are embedded directly
- Output is one combined PDF file
- If no receipts exist, generates the normal PDF without appending anything

### Data Feed
- New FastAPI endpoint: GET /api/data/estimates
- Returns JSON array of estimate summaries: client, event name, type, status, total revenue, total cost, GP%, dates, segment count
- Filterable by status, client, date range via query parameters
- Optionally returns CSV format (Accept header or query param)
- Read-only, no authentication beyond API key (or Supabase service key)
- Dave can point Power BI or a Google Sheet import at this URL

## Scope

### Included

**Client Email:**
- Resend account setup + API key as environment variable on FastAPI
- New FastAPI endpoint: POST /api/email/send-client-approval
- Email template: professional HTML email with DriveShop branding, estimate summary, "Approve" button
- Approval link with unique token (UUID stored in approval_requests or a new table)
- Public route: GET /api/approval/confirm/{token} — validates token, updates status, shows confirmation page
- "Send to Client" modal in the approval flow with recipient email, optional note
- Client contact pre-filled from the client record (contact_email field — verify it exists)

**Invoice PDF with Receipts:**
- New PDF type option in the Export dropdown: "Invoice with Receipts"
- Backend fetches all receipt_attachments for the estimate from Supabase Storage
- Uses PyPDF2 or WeasyPrint to merge the estimate PDF with receipt files
- Images (JPG, PNG) converted to PDF pages before merging
- Handles missing/corrupted files gracefully (skip with a note)

**Data Feed:**
- GET /api/data/estimates — returns estimate summaries as JSON
- Query params: status, client, from_date, to_date, format (json/csv)
- CSV option for Google Sheets import compatibility
- No authentication for v1 (or simple API key in header)

### Not Included

- Email notifications for internal approval (existing bell notifications continue — Resend could power these later)
- Client portal with login (the approval link is a one-click action, no portal)
- Automated recurring data exports (Dave pulls on demand)
- Real-time webhook to Power BI (polling/manual pull only)

## Dependencies

- **Resend** — email API account needed. Sign up at resend.com, verify sending domain, get API key.
- **Existing PDF generation** — WeasyPrint pipeline working ✅
- **Existing receipt uploads** — Supabase Storage with receipt_attachments table ✅
- **FastAPI backend** — deployed on Render ✅
- **Client contact data** — verify clients table has contact email. If not, add it.

## Resolved Decisions

- **Resend for email.** Simple API, developer-friendly, free tier handles the volume. Adds ~10 lines of Python to send an email.
- **One-click client approval.** No client login required. A unique token link in the email. Client clicks → done. Simplest possible UX for the client.
- **Combined PDF uses PyPDF2 for merging.** WeasyPrint generates the estimate pages, PyPDF2 merges receipt files after. Images get converted to PDF via Pillow first.
- **Data feed is read-only JSON/CSV.** No webhook, no real-time push. Dave pulls when he needs it. Simple and sufficient.

## Open Questions

*None — all resolved.*
