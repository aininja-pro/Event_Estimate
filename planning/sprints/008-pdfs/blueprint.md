# Blueprint: PDF Generation — Outputs Sprint (Part 3)

## What This Is

Add PDF export to the Estimate Builder via the FastAPI backend using WeasyPrint. Four document types: client-facing estimate (summary and detailed), internal P&L, change order delta, and recap variance report. HTML templates rendered server-side to PDF, returned as downloadable files.

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context, conventions
- `planning/requirements-driveshop-pdfs.md` — full requirements
- `api/services/ai_service.py` — pattern for how the FastAPI backend queries Supabase (reuse the same Supabase client setup)
- `src/pages/EstimateBuilderPage.tsx` — where the Export button will live
- `src/lib/estimate-service.ts` — existing queries for estimate data
- `src/lib/change-order-service.ts` — for change order delta data
- `src/lib/segment-status-service.ts` — for recap variance data (getVarianceReport)

Check first: Is WeasyPrint installable on Render? Run `pip install weasyprint` in the API environment. WeasyPrint requires system dependencies (Cairo, Pango, GDK-Pixbuf). On Ubuntu/Debian (which Render uses): `apt-get install -y libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev libcairo2`. If Render's build environment doesn't support these, we'll need to add them to the build command or use an alternative like `xhtml2pdf` (pure Python, no system deps). Verify before writing any template code.

---

## Step 1: WeasyPrint Setup + FastAPI Endpoint

### Install WeasyPrint

Add to `api/requirements.txt`:
```
weasyprint>=62.0
```

Update Render build command if system dependencies are needed:
```
apt-get update && apt-get install -y libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev libcairo2 && cd api && pip install -r requirements.txt
```

Test that WeasyPrint imports successfully before proceeding.

### New route: `api/routes/pdf.py`

Single endpoint: `POST /api/pdf/generate`

**Request body:**
```json
{
  "estimate_id": "uuid",
  "pdf_type": "client_summary" | "client_detailed" | "internal" | "change_order" | "recap",
  "segment_id": "uuid" | null,
  "change_order_id": "uuid" | null
}
```

**Response:** PDF file as binary with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="..."`.

**Filename convention:** `{ClientName}_{EventName}_{Type}_{Date}.pdf`
- Client summary: `Mazda_RideDrive_Estimate_2026-04-07.pdf`
- Internal: `Mazda_RideDrive_Internal_2026-04-07.pdf`
- Change order: `Mazda_RideDrive_CO-001_2026-04-07.pdf`
- Recap: `Mazda_RideDrive_Recap_2026-04-07.pdf`

### Route logic:

1. Query Supabase for the full estimate data (estimate + client + labor_logs + labor_entries + line_items + schedule_entries)
2. Based on `pdf_type`, select the appropriate template and data shape
3. Render HTML template with data using Python string formatting or Jinja2 (your choice — Jinja2 is cleaner for complex templates)
4. Convert HTML to PDF via WeasyPrint
5. Return the PDF as a streaming response

Register the router in `api/main.py`.

Show me the endpoint working with a simple test template (just the estimate header rendered as PDF) before building full templates.

---

## Step 2: PDF Data Service

Create `api/services/pdf_data_service.py`:

This service gathers all the data needed for each PDF type from Supabase.

### Functions:

**`get_estimate_pdf_data(estimate_id, segment_id=None) → dict`**

Queries Supabase for:
- Estimate record joined with client (name, code, markup, agency_fee)
- All labor_logs for the estimate (or specific segment if segment_id provided)
- Labor entries per log
- Schedule entries per log (for schedule-driven segments, compute rollup)
- Line items per log, grouped by section
- Compute totals: revenue, cost, GP, GP% per section and overall
- Compute NR (Net Revenue) by subtracting pass-through revenue

Returns a structured dict with all the data a template needs.

**`get_change_order_pdf_data(change_order_id) → dict`**

Queries:
- Change order record with delta_summary
- Estimate + client name for header
- Baseline and revised totals

**`get_recap_pdf_data(estimate_id, segment_id=None) → dict`**

Queries:
- Recap actuals joined with labor entries and line items
- Compute variance per section (reuse the getVarianceReport logic — port it to Python or query Supabase directly)
- Staff name assignments

### Shared data shape for templates:

```python
{
  "estimate": {
    "client_name": "Mazda",
    "event_name": "CX-90 Ride & Drive",
    "event_type": "Ride & Drive",
    "location": "San Diego",
    "start_date": "2026-05-15",
    "end_date": "2026-05-18",
    "duration_days": 4,
    "attendance": "500-1,000",
    "po_number": "PO-2026-042",
    "project_id": "MAZ-2026-SD",
    "cost_structure": "corporate",
  },
  "segments": [
    {
      "name": "Primary",
      "sections": {
        "labor": {
          "items": [...],
          "subtotal_revenue": 45000,
          "subtotal_cost": 28000,
          "subtotal_gp": 17000,
          "subtotal_gp_pct": 37.8,
        },
        "production": { ... },
        "travel": { ... },
        "creative": { ... },
        "access": { ... },
        "misc": { ... },
        "fees": { ... },
      }
    }
  ],
  "totals": {
    "gross_revenue": 82000,
    "total_cost": 51000,
    "gross_profit": 31000,
    "gp_percent": 37.8,
    "net_revenue": 74000,
    "agency_fee": 8200,
  },
  "generated_at": "2026-04-07",
}
```

---

## Step 3: HTML Templates

Create `api/templates/` directory with HTML template files.

Use Jinja2 for templating (add `jinja2` to requirements.txt if not already present). This is much cleaner than Python string concatenation for complex layouts.

### Template structure:

```
api/templates/
├── base.html                  — shared layout (page size, fonts, header/footer)
├── estimate_client.html       — client-facing estimate (both summary and detailed)
├── estimate_internal.html     — internal P&L
├── change_order.html          — change order delta
├── recap.html                 — recap variance report
└── styles.css                 — shared print CSS
```

### base.html — shared layout:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: letter;
      margin: 0.75in 0.75in 1in 0.75in;
      @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 8pt;
        color: #999;
      }
    }
    
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      color: #1a1a1a;
      line-height: 1.4;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1a1a2e;
      padding-bottom: 12pt;
      margin-bottom: 16pt;
    }
    
    .header-logo {
      font-size: 14pt;
      font-weight: 700;
      color: #1a1a2e;
      letter-spacing: 1pt;
    }
    
    .header-badge {
      font-size: 7pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2pt;
      color: #dc2626;
      border: 1px solid #dc2626;
      padding: 2pt 8pt;
    }
    
    .event-details {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 8pt;
      margin-bottom: 20pt;
    }
    
    .detail-label {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 1pt;
      color: #888;
      margin-bottom: 2pt;
    }
    
    .detail-value {
      font-size: 10pt;
      font-weight: 500;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16pt;
    }
    
    th {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 1pt;
      color: #666;
      text-align: left;
      padding: 6pt 8pt;
      border-bottom: 1px solid #ddd;
    }
    
    th.number { text-align: right; }
    
    td {
      font-size: 9pt;
      padding: 5pt 8pt;
      border-bottom: 1px solid #f0f0f0;
    }
    
    td.number { text-align: right; font-variant-numeric: tabular-nums; }
    
    .section-header {
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      color: #1a1a2e;
      padding: 8pt 8pt 4pt;
      background: #f8f9fa;
      border-bottom: 1px solid #ddd;
    }
    
    .subtotal-row td {
      font-weight: 600;
      border-top: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
      background: #fafafa;
    }
    
    .grand-total-row td {
      font-weight: 700;
      font-size: 10pt;
      border-top: 2px solid #1a1a2e;
      padding-top: 8pt;
    }
    
    .gp-positive { color: #16a34a; }
    .gp-negative { color: #dc2626; }
    
    .internal-banner {
      background: #fef2f2;
      border: 1px solid #dc2626;
      color: #dc2626;
      text-align: center;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2pt;
      padding: 4pt;
      margin-bottom: 16pt;
    }
    
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  {% block content %}{% endblock %}
</body>
</html>
```

### estimate_client.html — client-facing:

Extends base.html. Contains:
- Header: DriveShop logo area (text-based for v1, image later) + "CONFIDENTIAL" badge
- Event details grid: client, event name, type, location, dates, duration, PO, attendance
- For each section that has line items:
  - Section header
  - If detailed mode: line items table (Item, Qty, Rate, Total)
  - If summary mode: section total row only
  - Section subtotal
- Agency fee row (if applicable)
- Grand total row
- Footer: generated date, page numbers

**Template receives a `detailed` boolean** to toggle between summary and detailed mode. Same template, conditional rendering:

```html
{% for section in segment.sections %}
  <tr class="section-header"><td colspan="4">{{ section.name }}</td></tr>
  {% if detailed %}
    {% for item in section.items %}
      <tr>
        <td>{{ item.name }}</td>
        <td class="number">{{ item.quantity }}</td>
        <td class="number">{{ format_currency(item.unit_rate) }}</td>
        <td class="number">{{ format_currency(item.total) }}</td>
      </tr>
    {% endfor %}
  {% endif %}
  <tr class="subtotal-row">
    <td colspan="3">{{ section.name }} Subtotal</td>
    <td class="number">{{ format_currency(section.subtotal) }}</td>
  </tr>
{% endfor %}
```

### estimate_internal.html — internal P&L:

Same layout as client-facing but with additional columns and the internal banner:
- Columns: Item, Qty, Rate, Revenue, Cost, GP, GP%
- Section subtotals include all financial columns
- NR (Net Revenue) row
- Grand total with full P&L
- "INTERNAL — NOT FOR CLIENT DISTRIBUTION" banner at top
- Always detailed (never summary-only — internal reviews need line items)

### change_order.html:

- Header with CO number and description
- "Change Order Summary" title
- Table of changes:
  - ADDED items: green plus icon, item name, quantity × rate, total
  - REMOVED items: red minus icon, item name, quantity × rate, total
  - MODIFIED items: amber icon, item name, field changed (from → to), delta
- Net change line: "Original: $X → Revised: $Y (+$Z)"
- Approval status: approved by, date

### recap.html:

- Section-by-section variance table: Section, Estimated, Actual, Variance ($), Variance (%)
- Color-coded variance: green under budget, red over budget
- Grand total variance row
- Staff assignment table: Role, Person Name, Days Worked
- Generated from getVarianceReport data

---

## Step 4: PDF Render Service

Create `api/services/pdf_render_service.py`:

**`render_pdf(template_name, data, detailed=False) → bytes`**

1. Load the Jinja2 template from `api/templates/`
2. Register helper functions: `format_currency(n)` → "$1,234", `format_pct(n)` → "37.8%", `format_date(d)` → "April 7, 2026"
3. Render the template with data + `detailed` flag
4. Pass the rendered HTML to WeasyPrint: `HTML(string=html).write_pdf()`
5. Return the PDF bytes

Keep this service thin — it just renders templates. All data gathering happens in pdf_data_service.

---

## Step 5: Frontend Export Button

### Add to EstimateBuilderPage.tsx:

Add an "Export" dropdown button in the Estimate Builder header area (near the History button).

**Dropdown options:**
- "Client Estimate (Summary)" → calls generate with `pdf_type: 'client_summary'`
- "Client Estimate (Detailed)" → calls generate with `pdf_type: 'client_detailed'`
- "Internal P&L" → calls generate with `pdf_type: 'internal'`
- "Change Order" → only shows if change orders exist for this estimate. If multiple COs, show a submenu or default to the latest.
- "Recap Report" → only shows if any segment has recap data

**Flow:**
1. User clicks an export option
2. Show loading state on the button ("Generating...")
3. POST to `${API_URL}/api/pdf/generate` with estimate_id and pdf_type
4. Receive PDF as blob
5. Create a download link: `URL.createObjectURL(blob)` → trigger download with the filename from the Content-Disposition header
6. Or open in new tab: `window.open(url, '_blank')`
7. Clear loading state

### New function in ai-nudge-service.ts (or create a new pdf-service.ts):

```typescript
export async function generatePDF(
  estimateId: string,
  pdfType: 'client_summary' | 'client_detailed' | 'internal' | 'change_order' | 'recap',
  segmentId?: string,
  changeOrderId?: string
): Promise<Blob> {
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
  if (!res.ok) throw new Error('PDF generation failed')
  return res.blob()
}
```

---

## Step 6: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log
Add row: `Wk 12 | PDF Generation: WeasyPrint integration, 4 PDF types (client summary/detailed, internal P&L, change order, recap variance), export dropdown on Estimate Builder | Pipeline Dashboard | PDF export complete`

### Tech Stack
Update: "PDF: WeasyPrint (to be added)" → "PDF: WeasyPrint (api/templates/ for HTML templates)"

### Known Issues
Remove: "PDF generation (WeasyPrint) not yet implemented."
Add: "PDF templates use text-based DriveShop branding. Logo image can be added later."
Add: "WeasyPrint requires system dependencies on Render — documented in build command."

### Key Service Layers (backend)
Add: `pdf_data_service.py` — Gathers estimate/CO/recap data for PDF rendering
Add: `pdf_render_service.py` — Jinja2 template rendering + WeasyPrint PDF generation

---

## What NOT to Build

- Do not build PDF preview in the app. PDFs open in a new tab or download.
- Do not build editable PDF templates. Templates are code-managed HTML files.
- Do not store generated PDFs in Supabase. On-demand generation only.
- Do not build e-signature integration.
- Do not build batch PDF generation (one at a time).
- Do not build custom branding per client. DriveShop branding only for v1.
- Do not over-design the templates. Clean, professional, readable. Not a graphic design project. The CSS in Step 3 is the target quality level.
- If WeasyPrint has installation issues on Render, fall back to `xhtml2pdf` (pure Python, no system deps) rather than spending hours debugging system libraries.

---

## Build Order

1. **Step 1** — Install WeasyPrint, create the endpoint, test with a simple "Hello World" PDF to confirm it works on your environment. If WeasyPrint fails to install on Render, try xhtml2pdf as fallback. Show me the test PDF before proceeding.
2. **Step 2** — PDF data service. Show me the data shape returned for a real estimate.
3. **Step 3** — HTML templates. Build the client-facing estimate template first (detailed mode). Show me a generated PDF for a real estimate before building the other templates.
4. **Step 4** — PDF render service wiring all templates together.
5. **Step 5** — Frontend export dropdown. Test all PDF types on a real estimate.
6. **Step 6** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1 — install WeasyPrint and generate a test PDF. Do not skip ahead.
