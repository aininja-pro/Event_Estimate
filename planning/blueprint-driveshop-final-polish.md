# Blueprint: Client Email, Invoice PDF with Receipts, Data Feed — Final Polish Sprint

## What This Is

Three small features in one sprint: (1) client approval email via Resend with one-click approval link, (2) PDF export that bundles receipt attachments into one document, (3) read-only data feed API for Dave's external dashboards.

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context
- `planning/requirements-driveshop-final-polish.md` — full requirements
- `api/routes/pdf.py` — existing PDF generation endpoint (extend for receipts)
- `api/services/pdf_render_service.py` — existing PDF render pipeline
- `src/lib/receipt-service.ts` — how receipts are fetched from Supabase Storage
- `src/lib/workflow-service.ts` — submitForApproval, reviewApproval — understand the client gate
- `src/components/segments/SegmentTransitionBar.tsx` — where the "Send to Client" flow lives
- `src/components/ApprovalBanner.tsx` — the client approval gate UI

Check first: Does the `clients` table have a `contact_email` field? If not, Step 1 adds it alongside the Resend setup.

---

## Step 1: Resend Setup + Email Service

### Resend account

1. Sign up at https://resend.com (free tier: 100 emails/day, 3,000/month — more than enough)
2. Add and verify a sending domain (driveshop.com ideally, or use Resend's test domain for dev)
3. Get the API key

### Environment variable

Add to `/api/.env`:
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=estimates@driveshop.com
```

Add to Render environment variables for the FastAPI service.

### Install

Add to `api/requirements.txt`:
```
resend>=2.0.0
```

### Email service: `api/services/email_service.py`

Simple service with one function for now:

```python
import resend
import os

resend.api_key = os.getenv("RESEND_API_KEY")

async def send_client_approval_email(
    to_email: str,
    client_name: str,
    event_name: str,
    estimate_total: float,
    approval_token: str,
    pdf_bytes: bytes,
    pdf_filename: str,
    note: str = ""
) -> dict:
    """Send estimate to client with PDF attached and approval link."""
    
    approval_url = f"{os.getenv('FRONTEND_URL')}/approve/{approval_token}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #1a1a2e; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #1a1a2e; margin: 0;">DRIVESHOP</h2>
        </div>
        
        <p>Hi,</p>
        
        <p>Please find attached the estimate for <strong>{event_name}</strong>.</p>
        
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; color: #666;">Client:</td>
                <td style="padding: 8px 0; font-weight: 500;">{client_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666;">Event:</td>
                <td style="padding: 8px 0; font-weight: 500;">{event_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666;">Total:</td>
                <td style="padding: 8px 0; font-weight: 500;">${estimate_total:,.0f}</td>
            </tr>
        </table>
        
        {"<p><em>" + note + "</em></p>" if note else ""}
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{approval_url}" 
               style="background: #1a1a2e; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 500;">
                Approve Estimate
            </a>
        </div>
        
        <p style="color: #999; font-size: 12px;">
            If you have questions, please reply to this email or contact your account manager.
        </p>
    </div>
    """
    
    response = resend.Emails.send({
        "from": os.getenv("RESEND_FROM_EMAIL", "estimates@driveshop.com"),
        "to": [to_email],
        "subject": f"Estimate for Review: {event_name} — DriveShop",
        "html": html,
        "attachments": [
            {
                "filename": pdf_filename,
                "content": pdf_bytes,
            }
        ],
    })
    
    return response
```

### Approval token table

Create migration: `scripts/migration_client_approval_tokens.sql`

```sql
CREATE TABLE IF NOT EXISTS client_approval_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  approval_request_id UUID REFERENCES approval_requests(id),
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  client_email TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  approved_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'expired'))
);

CREATE INDEX idx_client_approval_tokens_token ON client_approval_tokens(token);

ALTER TABLE client_approval_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tokens are manageable by authenticated users"
  ON client_approval_tokens FOR ALL
  USING (true) WITH CHECK (true);
```

### Approval confirmation endpoint

Add to `api/routes/` — a new `approval.py` route:

**GET /api/approval/confirm/{token}**

1. Query `client_approval_tokens` by token
2. Validate: not expired, status='pending'
3. If valid: set status='approved', approved_at=now()
4. Process the approval through the existing workflow — call the equivalent of reviewApproval for the client gate
5. Return a simple HTML confirmation page: "Thank you! The estimate for {event_name} has been approved."
6. If invalid/expired: return an error page: "This approval link has expired or was already used."

This is a PUBLIC endpoint — no auth required. The token IS the authentication.

Register the router in `api/main.py`. Add CORS for this route if needed.

Show me the email service, the migration, and the confirmation endpoint before proceeding.

---

## Step 2: "Send to Client" UI Flow

### After AM approval clears the first gate:

Currently, the client gate in the approval workflow shows a "Client Approved" / "Client Rejected" option in the ApprovalBanner. Replace or augment this with a "Send to Client" flow.

### Where to trigger:

When the segment is in `in_review` and the AM gate has been approved, the next step is client approval. At this point:

**Option A:** The ApprovalBanner shows a "Send to Client for Approval" button (instead of the approver manually marking client approved)

**Option B:** After AM approval, a modal auto-appears asking "Send to client?"

**Recommendation: Option A.** Less intrusive. The button sits in the ApprovalBanner where the client gate controls already live.

### "Send to Client" modal:

When the user clicks "Send to Client for Approval":

```
┌──────────────────────────────────────────┐
│ Send Estimate to Client                   │
│                                          │
│ Recipient:                               │
│ [ john.smith@mazda.com         ]  ← pre-filled from client contact │
│                                          │
│ Note (optional):                         │
│ ┌──────────────────────────────────────┐ │
│ │ Please review the attached estimate  │ │
│ │ for the CX-90 Ride & Drive event.   │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ PDF: Mazda_CX90_Estimate_2026-04-14.pdf  │
│ (Client-facing summary will be attached) │
│                                          │
│              [Cancel]  [Send]            │
└──────────────────────────────────────────┘
```

### On "Send":

1. Generate the client-facing PDF via the existing `/api/pdf/generate` endpoint
2. Create a `client_approval_tokens` record with the estimate, segment, recipient email
3. Call `send_client_approval_email()` with the PDF bytes, token, and details
4. Update the segment status or approval state to reflect "sent to client, pending response"
5. Show confirmation: "Estimate sent to john.smith@mazda.com"

### Frontend service function:

Add to `src/lib/` (new file or extend existing):

```typescript
export async function sendClientApproval(
  estimateId: string,
  laborLogId: string,
  approvalRequestId: string,
  recipientEmail: string,
  note: string
): Promise<{ success: boolean; error?: string }>
```

POST to `${API_URL}/api/email/send-client-approval` with the parameters. The backend handles PDF generation + email sending + token creation in one call.

### New FastAPI endpoint: POST /api/email/send-client-approval

Orchestrates everything:
1. Generate client-facing PDF (call existing pdf_data_service + pdf_render_service)
2. Create approval token
3. Send email via Resend with PDF attached
4. Return success/failure

Show me the modal and the send flow working before proceeding.

---

## Step 3: Invoice PDF with Bundled Receipts

### Install PyPDF2

Add to `api/requirements.txt`:
```
pypdf>=4.0.0
```

(Note: `PyPDF2` is deprecated — use `pypdf` which is the maintained successor.)

### Extend the PDF endpoint

In `api/routes/pdf.py`, add a new pdf_type: `'invoice_with_receipts'`

### Backend logic in `api/services/pdf_render_service.py` (or a new `pdf_merge_service.py`):

**`generate_invoice_with_receipts(estimate_id, segment_id=None) → bytes`**

1. Generate the base estimate PDF (client-facing detailed or internal — configurable) using existing pipeline
2. Query `receipt_attachments` for this estimate (all segments, or specific segment)
3. For each receipt:
   a. Download the file from Supabase Storage (use the `file_path` to get a signed URL, then fetch the bytes)
   b. If PDF: read directly with pypdf
   c. If image (JPG, PNG): convert to PDF page using Pillow + io.BytesIO → pypdf
   d. If file is missing/corrupted: skip with a logged warning
4. Merge all PDFs using pypdf.PdfMerger:
   ```python
   from pypdf import PdfMerger
   merger = PdfMerger()
   merger.append(io.BytesIO(estimate_pdf_bytes))  # base estimate
   for receipt_pdf in receipt_pdfs:
       merger.append(io.BytesIO(receipt_pdf))
   output = io.BytesIO()
   merger.write(output)
   return output.getvalue()
   ```
5. Return the combined PDF bytes

### Frontend — Export dropdown

Add a new option to the Export dropdown in EstimateBuilderPage:

- "Invoice with Receipts" — only shows when the estimate has receipt_attachments (check receipt count)
- Calls generatePDF with pdf_type='invoice_with_receipts'
- Downloads the combined file

Show me a test — generate an invoice with at least one receipt appended. Verify the combined PDF opens correctly.

---

## Step 4: Data Feed API

### New route: `api/routes/data_feed.py`

**GET /api/data/estimates**

Query parameters:
- `status` (optional): filter by segment status
- `client` (optional): filter by client name
- `from_date` (optional): created_at >= date
- `to_date` (optional): created_at <= date
- `format` (optional): 'json' (default) or 'csv'

### Response (JSON):

```json
[
  {
    "estimate_id": "uuid",
    "client_name": "Mazda",
    "event_name": "CX-90 Ride & Drive",
    "event_type": "Ride & Drive",
    "location": "San Diego",
    "start_date": "2026-05-15",
    "end_date": "2026-05-18",
    "duration_days": 4,
    "status": "active",
    "total_revenue": 82400,
    "total_cost": 51000,
    "gross_profit": 31400,
    "gp_percent": 38.1,
    "segment_count": 1,
    "created_at": "2026-04-01",
    "updated_at": "2026-04-14"
  }
]
```

### CSV response:

If `format=csv`, return the same data as CSV with `Content-Type: text/csv` and `Content-Disposition: attachment; filename=driveshop_estimates_2026-04-14.csv`.

### Data computation:

For each estimate:
1. Query estimate + client join
2. Get segment statuses from labor_logs (compute overall status)
3. Compute financials using `computeEstimateTotals()` pattern — or query the latest version snapshot's totals if available (faster than recomputing)

Keep it efficient — don't recompute every estimate's full P&L on every request. If version snapshots store totals, read from there.

### Authentication:

For v1, use a simple API key in the request header:
```
X-API-Key: {DATA_FEED_API_KEY}
```

Add `DATA_FEED_API_KEY` to the FastAPI environment variables. The endpoint validates the key before returning data. This prevents anyone from scraping the endpoint but doesn't require user authentication.

Register the router in `api/main.py`.

Show me the endpoint returning JSON for current estimates before proceeding.

---

## Step 5: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log
Add row: `Wk 13 | Final Polish: client approval email via Resend, invoice PDF with bundled receipts, data feed API for external reporting | QA + documentation | Final features complete`

### Known Issues
Remove: "Email notifications wired but Resend integration not deployed yet (Edge Function needed)."
Add: "Resend email integration live for client approval emails. Internal notification emails (bell → email) can be wired to Resend as a follow-up."
Add: "Data feed API uses simple API key auth. Upgrade to OAuth or Supabase auth if broader access needed."

### Environment Variables
Add:
| RESEND_API_KEY | Resend email API key (server-side) |
| RESEND_FROM_EMAIL | Sending email address for client communications |
| DATA_FEED_API_KEY | API key for the data feed endpoint |

### Key Service Layers (backend)
Add: `email_service.py` — Resend email sending for client approvals
Add: `pdf_merge_service.py` — Receipt bundling into combined PDF (if created separately)

### Supabase Tables
Add: `client_approval_tokens`

---

## What NOT to Build

- Do not build internal email notifications via Resend in this sprint. Focus on client-facing email only. Internal notification emails are a follow-up.
- Do not build a client portal. The approval link is a one-click action, not a portal.
- Do not build real-time webhooks for the data feed. Polling/manual pull only.
- Do not build automated scheduled exports. Dave pulls when he needs it.
- Do not over-design the email template. Professional, clean, functional. Not a marketing email.
- Do not build email tracking (open rates, click rates). Out of scope.

---

## Build Order

1. **Step 1** — Resend setup + email service + approval token table + confirmation endpoint. Show me a test email sent to a test address before proceeding.
2. **Step 2** — "Send to Client" UI flow. Show me the modal and a successful send.
3. **Step 3** — Invoice PDF with receipts. Show me a combined PDF with at least one receipt appended.
4. **Step 4** — Data feed API. Show me JSON response for current estimates.
5. **Step 5** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1 — set up Resend, create the email service and token table. Show me the migration SQL before running. Do not skip ahead.
