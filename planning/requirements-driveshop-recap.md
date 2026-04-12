# Requirements: Recap Entry & Actuals — Event Estimate Engine

## Problem

When an event wraps and a segment moves to "Recap" status, the Estimate Builder currently locks everything except names and notes — identical to Active mode. There's no way to enter actual costs, assign staff names with validation, compare estimated vs. actual, upload receipts, or see variance analysis. The estimator has to go back to spreadsheets to do recap work, defeating the purpose of the centralized platform.

The backend infrastructure is fully built — RecapActual types, CRUD functions, variance computation — but zero UI exists to surface it.

## Cost of Status Quo

- Recap data entry happens outside the system (back to spreadsheets)
- No variance visibility until someone manually compares spreadsheet actuals to the estimate
- Staff names not enforced before invoicing — labor entries go to Intacct without names attached
- Receipts live in email threads and shared drives, not attached to the line items they support
- The estimate lifecycle is broken at the Recap → Invoiced transition — the most important step for financial accuracy

## Who This Is For

- **Primary users:** Dan, Tim (Production Managers) — they enter actuals after events, assign staff names, upload receipts
- **Stakeholders:** Tatiana (CFO) — reviews variance before approving invoicing. Needs to see estimated vs. actual at a glance.
- **Stakeholders:** Dave (Operations) — owns the recap workflow, defined the name assignment requirement

## Proposal

Build the Recap mode UI on the existing Estimate Builder page. When a segment is in "recap" status, the UI transforms: actuals columns appear alongside estimated amounts, staff names become required with progress tracking, receipts can be uploaded to line items, and the Summary tab shows side-by-side variance analysis. All of this uses the existing service layer functions that are already built.

## Success Criteria

- When a segment is in "recap" status, an "Actual" column appears on the Labor Log tab and all line item tabs
- Users can enter actual quantities, days, hours, and unit costs per line item
- Variance auto-calculates inline (estimated minus actual, color-coded green/red)
- Summary tab shows side-by-side Estimated vs. Actual with variance per section and overall
- Staff names are required before a segment can transition to "invoiced" — empty names show red borders and a progress counter
- Receipts can be uploaded and attached to individual line items via Supabase Storage
- Original estimated values are read-only in Recap mode — users cannot change the estimate, only enter actuals
- The `recap_actuals` Supabase table is created (if not already) and data persists correctly

## Scope

### Included (This Blueprint)

**Recap UI on Labor Log tab:**
- "Actual Days" and "Actual Cost" columns appear next to estimated values when segment is in recap
- Variance column with color coding (green = under budget, red = over)
- Staff name fields editable with red border when empty
- Progress counter: "6 of 8 names assigned"
- Name validation gate: cannot transition to "invoiced" until all names filled

**Recap UI on line item tabs (Production, Travel, Creative, Access, Misc, Fees):**
- "Actual" column appears next to each line item's estimated total
- User enters actual cost
- Variance auto-calculates inline
- Receipt upload button per line item (attach file via Supabase Storage)
- Receipt indicator icon when a file is attached, click to view/download

**Recap Summary on Summary tab:**
- Side-by-side columns: Estimated vs. Actual
- Variance per section (dollar amount and percentage)
- Overall variance summary row
- Color-coded: green sections under budget, red sections over budget

**Supabase Storage integration:**
- Receipt uploads stored in Supabase Storage bucket (e.g., `receipts/{estimate_id}/{line_item_id}/filename`)
- File metadata tracked (filename, size, uploaded_by, uploaded_at)
- Support common file types: PDF, JPG, PNG, XLSX, CSV
- Max file size: 10MB per file

**Validation and gating:**
- "Mark Invoiced" button disabled until all person_name fields are filled on the segment's schedule entries
- Warning banner: "3 staff names still required before invoicing"
- Missing actuals show a soft warning but do NOT block invoicing (some costs arrive late)

**Database:**
- Create `recap_actuals` table if it doesn't already exist (check first)
- Create `receipt_attachments` table for file metadata
- Set up Supabase Storage bucket for receipts

### Not Included

- Automated recap entry from external data sources
- Recap approval workflow (separate from estimate approval — deferred)
- Batch import of actuals from spreadsheet
- Receipt OCR or automated cost extraction from uploaded files
- Recap mode on the Schedule Grid itself (schedule stays read-only in recap — actuals are entered on Labor Log and line item tabs)

## Dependencies

- **Existing service layer:** `getRecapActuals()`, `upsertRecapActual()`, `getVarianceReport()` in segment-status-service.ts — all built ✅
- **Edit rules:** `getSegmentEditRules('recap')` returns `actuals: true`, `names_required: true` — already defined ✅
- **Segment transitions:** `transitionSegmentStatus()` handles recap → invoiced — exists but needs name validation gate added
- **Supabase Storage:** May need to be enabled on the Supabase project (check if a storage bucket exists)

## Inputs

- **Recap actuals data:** User-entered actual quantities, days, hours, unit costs per labor entry and line item
- **Staff names:** User-entered person names on schedule entries
- **Receipt files:** PDF, JPG, PNG, XLSX, CSV uploads per line item

## Outputs

- **Recap actuals** persisted to `recap_actuals` table with references to labor_entry_id or line_item_id
- **Variance report** displayed on Summary tab — section-by-section and overall
- **Receipt files** stored in Supabase Storage with metadata in `receipt_attachments` table
- **Name validation** enforced before invoiced transition

## Constraints

- Original estimate data is NEVER modified in recap mode — actuals are separate records that reference the original entries
- The Estimate Builder page is already large (~2,700 lines). Recap UI should be in separate components where possible to avoid bloating the page further.
- Supabase Storage has a free tier limit — receipts should be reasonably sized (10MB max per file)
- The recap UI only appears when the active segment's status is "recap" — other statuses see the normal view

## Resolved Decisions

- **Same page, not a separate Recap page.** The Estimate Builder transforms based on segment status. No new route or page.
- **Actuals are separate records.** They reference the original labor_entry_id or line_item_id but do not modify the original. This preserves the estimate as the "what we bid" and actuals as "what actually happened."
- **Names required before invoicing, actuals not required.** Dave's rule: staff names must be attached. But some costs arrive weeks after the event, so missing actuals shouldn't block invoicing.
- **Receipt upload per line item, not per segment.** Receipts attach to the specific line item they support (e.g., hotel receipt on the Hotels line item).

## Open Questions

*None — all resolved.*
