# Blueprint: Recap Entry & Actuals — Outputs Sprint (Part 1)

## What This Is

Build the Recap mode UI on the existing Estimate Builder page. When a segment is in "recap" status, actuals columns appear alongside estimated amounts, staff names become required with progress tracking, receipts can be uploaded to line items, and the Summary tab shows side-by-side variance analysis. The backend service layer already exists — this is a frontend sprint with one new Supabase Storage integration.

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context, conventions, service layer patterns
- `planning/requirements-driveshop-recap.md` — full requirements
- `src/lib/segment-status-service.ts` — READ CAREFULLY. Find `getSegmentEditRules()`, `getRecapActuals()`, `upsertRecapActual()`, `getVarianceReport()`, and the `RecapActual` / `VarianceRow` types. These are the backend functions you'll wire into the UI.
- `src/pages/EstimateBuilderPage.tsx` — the page being modified. Understand how `editRules` are applied today, how tabs render, and how the Summary tab works.
- `src/components/schedule/ScheduleGrid.tsx` — understand how `namesEditable` and `readOnly` props control field behavior
- `src/lib/estimate-service.ts` — existing CRUD patterns for reference

Confirm before starting: Does the `recap_actuals` table exist in Supabase? Run a query to check. If not, Step 1 creates it. If it does, skip the migration part of Step 1.

---

## Step 1: Database Setup

### Check if recap_actuals table exists

Query Supabase to confirm. The service layer references it, but it may not have been created yet.

### If it doesn't exist, create migration: `scripts/add_recap_tables.sql`

```sql
-- Recap actuals: stores actual costs entered during recap mode
CREATE TABLE IF NOT EXISTS recap_actuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  labor_entry_id UUID REFERENCES labor_entries(id) ON DELETE CASCADE,
  line_item_id UUID REFERENCES estimate_line_items(id) ON DELETE CASCADE,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  actual_quantity NUMERIC,
  actual_days NUMERIC,
  actual_hours NUMERIC,
  actual_unit_cost NUMERIC,
  actual_total NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT recap_actual_has_reference CHECK (
    (labor_entry_id IS NOT NULL AND line_item_id IS NULL) OR
    (labor_entry_id IS NULL AND line_item_id IS NOT NULL)
  )
);

CREATE INDEX idx_recap_actuals_labor_entry ON recap_actuals(labor_entry_id);
CREATE INDEX idx_recap_actuals_line_item ON recap_actuals(line_item_id);
CREATE INDEX idx_recap_actuals_labor_log ON recap_actuals(labor_log_id);

ALTER TABLE recap_actuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage recap actuals"
  ON recap_actuals FOR ALL
  USING (true) WITH CHECK (true);

-- Receipt attachments: file metadata for uploaded receipts
CREATE TABLE IF NOT EXISTS receipt_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  line_item_id UUID REFERENCES estimate_line_items(id) ON DELETE CASCADE,
  labor_entry_id UUID REFERENCES labor_entries(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_receipt_attachments_line_item ON receipt_attachments(line_item_id);
CREATE INDEX idx_receipt_attachments_estimate ON receipt_attachments(estimate_id);

ALTER TABLE receipt_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage receipt attachments"
  ON receipt_attachments FOR ALL
  USING (true) WITH CHECK (true);
```

### Supabase Storage bucket

Check if a storage bucket named `receipts` exists. If not, create it:
- Either via Supabase dashboard (Storage → New bucket → name: "receipts", public: false)
- Or via SQL: `INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);`

Add a storage policy allowing authenticated users to upload and read:

```sql
CREATE POLICY "Authenticated users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete receipts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');
```

Show me the SQL and confirm the table/bucket status before proceeding.

---

## Step 2: Receipt Service Layer

Create `src/lib/receipt-service.ts` following existing service layer patterns.

### Functions:

**`uploadReceipt(estimateId, lineItemId, file) → ReceiptAttachment`**
1. Generate a storage path: `receipts/${estimateId}/${lineItemId}/${Date.now()}_${file.name}`
2. Upload the file to Supabase Storage bucket "receipts"
3. Insert metadata row into `receipt_attachments` table (file_name, file_path, file_size, mime_type, uploaded_by from useUser)
4. Return the attachment record

**`getReceipts(lineItemId) → ReceiptAttachment[]`**
- Query `receipt_attachments` where line_item_id matches

**`getReceiptsByEstimate(estimateId) → ReceiptAttachment[]`**
- Query all receipts for an estimate (for summary/totals view)

**`getReceiptUrl(filePath) → string`**
- Get a signed download URL from Supabase Storage (temporary URL, e.g. 1 hour expiry)

**`deleteReceipt(id, filePath) → void`**
- Delete file from Supabase Storage
- Delete metadata row from `receipt_attachments`

### Types (add to existing types file or create `src/types/receipt.ts`):

```typescript
export interface ReceiptAttachment {
  id: string
  estimate_id: string
  line_item_id: string | null
  labor_entry_id: string | null
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  uploaded_by: string | null
  uploaded_at: string
}
```

### Validation:
- Max file size: 10MB. Reject before upload if larger.
- Allowed types: application/pdf, image/jpeg, image/png, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv
- Show clear error message if file is rejected

Show me the service file before proceeding.

---

## Step 3: Recap UI on Labor Log Tab

This is the core recap entry experience for labor.

### When the active segment's status is "recap":

Read `editRules` — when `editRules.actuals === true`, the Labor Log tab should render in recap mode.

**Load recap actuals on mount (or when segment changes):**
- Call `getRecapActuals(activeLocationId)` to get any previously entered actuals
- Map them by `labor_entry_id` for quick lookup

**Additional columns appear after the existing columns:**

| Role | Qty | Days | Rate | Est Total | **Act Days** | **Act Cost** | **Variance** | **Var %** |
|------|-----|------|------|-----------|-------------|-------------|-------------|----------|

- **Act Days** — editable input, pre-filled from recap_actuals if exists, otherwise blank
- **Act Cost** — editable input, pre-filled from recap_actuals if exists. If Act Days is entered and rate exists, auto-calculate as a suggestion (Act Days × Qty × Rate) but allow override.
- **Variance** — auto-calculated: Est Total minus Act Cost. Green text if positive (under budget), red if negative (over budget).
- **Var %** — `((Est Total - Act Cost) / Est Total * 100)`. Show as "+5.2%" or "-12.3%"

**On blur of any actuals field:**
- Call `upsertRecapActual()` with the labor_entry_id, actual_days, actual_unit_cost (derived from act cost / qty / days if possible), actual_total
- Show a subtle save indicator (checkmark flash or similar)

**Name fields:**
- When `editRules.names_required === true`, show red border on any row where `person_name` is empty
- Below the table, show a progress counter: "6 of 8 names assigned" with count of filled vs total schedule entries for this segment
- If a name is empty and the field is editable, make it visually prominent (red border, slightly different background)

**Keep it simple.** The actuals columns are just additional columns on the existing Labor Log table. Don't restructure the table — append columns to the right side when recap mode is active.

---

## Step 4: Recap UI on Line Item Tabs

When `editRules.actuals === true`, each line item tab (Production, Travel, Creative, Access, Misc, Fees) shows recap columns.

### Additional columns per line item:

| Item | Qty | Unit Cost | Markup | Est Total | **Actual** | **Variance** | **Receipt** |
|------|-----|-----------|--------|-----------|-----------|-------------|------------|

- **Actual** — editable input. Pre-filled from recap_actuals if exists. User enters the actual total cost for this line item.
- **Variance** — auto-calculated: Est Total minus Actual. Color-coded green/red.
- **Receipt** — small button/icon. If no receipt attached: upload icon (paperclip or upload arrow). If receipt attached: file icon with filename, click to download, small X to delete.

**On blur of actual field:**
- Call `upsertRecapActual()` with the line_item_id and actual_total
- Subtle save indicator

**Receipt upload flow:**
- Click the upload icon → file picker opens (accept: .pdf, .jpg, .png, .xlsx, .csv)
- File uploads via `uploadReceipt()` from receipt-service.ts
- On success, icon changes to show the file is attached
- Click the attached file icon → opens/downloads the receipt via `getReceiptUrl()`
- Small X button to delete the receipt (with confirmation)

**Keep the receipt UI minimal.** A small icon in the last column. Not a full file manager. One receipt per line item is sufficient for v1 — if they need multiple, we can add that later.

---

## Step 5: Recap Summary on Summary Tab

When ANY segment in the estimate has recap actuals data, the Summary tab should show a variance view.

### Modify the existing SummaryTab component:

**Detect recap mode:** Check if any labor_log in the estimate has status "recap" or "invoiced" AND has recap_actuals data. If yes, show the variance view.

**Load variance data:** Call `getVarianceReport(laborLogId)` for each segment that has recap data. This function already exists and returns `VarianceRow[]` with estimated_total, actual_total, variance, and variance_pct.

**Display:**

For each section (Planning & Admin, Onsite Labor, Travel, etc.), show:

| Section | Estimated | Actual | Variance | Var % |
|---------|-----------|--------|----------|-------|
| Onsite Event Labor | $45,000 | $48,200 | -$3,200 | -7.1% |
| Travel Expenses | $12,000 | $10,800 | +$1,200 | +10.0% |
| Production | $8,500 | $8,500 | $0 | 0.0% |

- Green text for positive variance (under budget)
- Red text for negative variance (over budget)
- Bold row at bottom: **Total** with overall estimated, actual, variance

**If a segment hasn't entered recap yet,** show "—" in the Actual column for its entries rather than $0.

**Multi-segment handling:** If the estimate has multiple segments, show a segment selector or show all segments stacked with subtotals, then a grand total across all segments. Follow the pattern the Summary tab already uses for multi-segment display.

---

## Step 6: Name Validation Gate

### Enforce name requirement before invoicing:

Modify the segment transition logic. When a user tries to transition a segment from "recap" → "invoiced":

1. Query all `schedule_entries` for this segment (labor_log_id)
2. Count how many have `person_name` as null or empty string
3. If any names are missing:
   - Block the transition
   - Show an error message: "Cannot mark as invoiced — 3 staff members still need names assigned. Go to the Schedule tab to assign names."
   - Do NOT transition the status

**Where to enforce this:**
- In `transitionSegmentStatus()` in segment-status-service.ts — add a check before the recap → invoiced transition
- In the `SegmentTransitionBar` component — disable the "Mark Invoiced" button and show the warning count when names are missing

**Visual indicator on the segment badge:**
- When in recap status and names are missing, the SegmentStatusBadge could show a small warning dot or the transition button text changes to "Mark Invoiced (3 names missing)"

---

## Step 7: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log
Add row: `Wk 11 | Recap Entry: actuals columns on Labor Log + line items, variance display on Summary, name validation gate, receipt upload via Supabase Storage | Change Orders sprint | Recap mode complete`

### Known Issues
- Add: "Receipt upload supports one file per line item. Multiple attachments per line item is a future enhancement."
- Add: "Recap actuals are entered at the line item level. Schedule-level hour-by-hour actuals tracking is deferred."

### Supabase Tables
Add: `recap_actuals, receipt_attachments`

### Key Service Layers
Add: `receipt-service.ts` — Receipt upload/download/delete via Supabase Storage

### Conventions
Add: "Recap mode renders additional columns when `editRules.actuals === true`. Original estimate data is never modified — actuals are separate records in recap_actuals."
Add: "Receipts stored in Supabase Storage bucket 'receipts' with path pattern: receipts/{estimate_id}/{line_item_id}/{timestamp}_{filename}"

---

## What NOT to Build

- Do not create a separate Recap page or route. Recap mode lives on the Estimate Builder page.
- Do not modify original estimate data in recap mode. Actuals are separate records.
- Do not build recap on the Schedule Grid itself. Hours are locked in recap. Actuals entry happens on the Labor Log tab and line item tabs.
- Do not build batch import for actuals. Manual entry only for v1.
- Do not build receipt OCR or automated cost extraction.
- Do not build a recap approval workflow. The segment transition from recap → invoiced is the approval gate.
- Do not restructure the Labor Log or line item table components. Append recap columns conditionally when `editRules.actuals === true`.

---

## Build Order

1. **Step 1** — Database: confirm recap_actuals table exists (create if not), create receipt_attachments table, set up Supabase Storage bucket. Show me the SQL and bucket status before proceeding.
2. **Step 2** — Receipt service layer. Show me the file before proceeding.
3. **Step 3** — Recap UI on Labor Log tab. Actuals columns, name highlighting, progress counter. Show me a screenshot or describe the UI before proceeding.
4. **Step 4** — Recap UI on line item tabs. Actuals column, variance, receipt upload. Show me one tab working before proceeding.
5. **Step 5** — Recap Summary. Variance view on Summary tab. Show me the output.
6. **Step 6** — Name validation gate. Test: try to transition recap → invoiced with missing names. Confirm it blocks.
7. **Step 7** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1. Do not skip ahead.
