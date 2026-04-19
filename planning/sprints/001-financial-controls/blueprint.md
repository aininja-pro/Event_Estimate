# FINANCIAL CONTROLS SPRINT — Claude Code Blueprint

**Context:** Friday client meeting (March 21, 2026) revealed revenue leakage and margin visibility as the #1 business problem. Chris (new executive) and Joelle identified: employees being staffed in junior roles to game rates, agency fees not being added to estimates, and no visibility into internal vs external cost breakdown. This sprint adds the financial guardrails before moving to AI Intelligence.

**Pattern:** Schema → Service Layer → UI → Verify
**Approach:** Incremental. Complete each step before moving to the next. Show work before proceeding.
**Read first:** CLAUDE.md for full project context.

---

## STEP 1: FEES SECTION + AGENCY FEE AUTO-POPULATE

### What we're building and why

Chris said: "It should probably be its own little section... fees, and then underneath it, agency fee pulled from the rate card. But we could add other fees as needed."

Joelle: "Rather it auto populate and have people take it off, versus the other way where it's not there and you have to add it in."

The estimate builder currently has sections: Labor Log, Schedule, Production, Travel & Logistics, Creative, Access & Fees, Miscellaneous, Summary. Agency fee exists on the `clients` table as `agency_fee_pct` but is never rendered on the estimate or calculated in the summary.

### What exists to reuse

- `clients.agency_fee_pct` — already stored per client
- `clients.third_party_markup_pct` — already stored per client  
- `estimate_line_items` table — existing line item storage
- Estimate builder tab pattern — existing tab system to add a new tab or modify existing
- Summary tab GR/NR/GP calculation — needs to include fees

### Data model changes

**No new tables needed.** Use `estimate_line_items` with a new section identifier.

```sql
-- Add a 'fees' section option if not already in the section enum/string
-- estimate_line_items.section should support: 'production', 'travel', 'creative', 'access_fees', 'miscellaneous', 'fees'
-- Check what the current section values are before adding

-- Add auto_generated flag so system-generated fee lines are identifiable
ALTER TABLE estimate_line_items ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE estimate_line_items ADD COLUMN IF NOT EXISTS fee_basis TEXT; -- 'total_estimate', 'subtotal_before_fees', 'labor_only', etc.
```

### UI changes

1. **Rename or add a "Fees & Markups" tab** on the estimate builder (or fold into the existing "Access & Fees" tab — check what's there first).

2. **On estimate creation** (in `estimate-service.ts` `createEstimate()` or wherever the initial estimate is set up): If the selected client has `agency_fee_pct > 0`, auto-create an `estimate_line_items` row:
   - `section`: 'fees'
   - `description`: 'Agency Fee'
   - `fee_basis`: 'total_estimate'  
   - `is_auto_generated`: true
   - `markup_pct`: client's agency_fee_pct value
   - No fixed dollar amount — calculated dynamically as % of (labor + flat fee subtotal, excluding pass-through sections)

3. **In the Summary tab**: Add a "Fees & Markups" row after the section subtotals. Agency Fee = (subtotal minus pass-through sections) × agency_fee_pct. Show this before the Grand Total. Pass-through sections are: Travel Expenses, Production Expenses marked as pass-through. Labor, Creative, and flat-fee items ARE included in the fee basis.

4. **Fees tab UI**: Show auto-generated fee lines (non-deletable but can be toggled off/removed with a "Remove" action). Allow adding custom fee lines (Media Buying Fee, Management Fee, etc.) with either a % basis or flat dollar amount.

### Build steps

1. Read `src/pages/EstimateBuilderPage.tsx` — understand the current tab structure and how sections are rendered.
2. Read `src/lib/estimate-service.ts` — understand createEstimate() and line item CRUD.
3. Read the Summary tab component — understand how GR/NR/GP is calculated.
4. Add migration: `is_auto_generated` and `fee_basis` columns on estimate_line_items.
5. Modify estimate creation to auto-generate agency fee line if client has agency_fee_pct > 0.
6. Add/modify the Fees tab UI to show fee lines with add/remove.
7. Update Summary calculation to include fees in the grand total.
8. Verify: Create a new Mazda estimate → agency fee (10%) should auto-appear. Create a VW estimate (0% agency fee) → no fee line. Manually add a "Media Buying Fee" → appears in summary.

### Decisions (resolved)

- **Agency fee basis:** Calculate against TOTAL estimate subtotal — all sections included, including pass-throughs. Confirmed by Dave. Per-line-item selective application (Gayle's LSM scenario) is deferred to V2.
- **Fees UI:** Fold agency fee + custom fees into the EXISTING "Access & Fees" tab. Do NOT create a separate tab. Rename the tab to "Fees & Markups" if it reads better, but keep it in the same position.

---

## STEP 2: RESOURCE TYPE ON SCHEDULE GRID

### What we're building and why

Joelle: "Maybe it's just a dropdown that's like E for employee, or I for independent... internal, external, and then vendor really are the three components."

Chris: "If you assign someone's name, it should pull the hourly rate that we have budgeted... because people would go in and change it to $1,000 a day but we just lost $200."

This adds a resource classification column to each staff row on the schedule grid, enabling margin analysis by resource type in the summary.

### What exists to reuse

- `schedule_entries` table — one row per staff member per segment
- `labor_entries` table — the labor log equivalent
- Schedule grid component (`src/components/schedule/ScheduleGrid.tsx` or similar)
- ComboInput pattern — for the dropdown

### Data model changes

```sql
-- Add resource_type to schedule_entries (or labor_entries — check which table staff rows live on)
ALTER TABLE schedule_entries ADD COLUMN IF NOT EXISTS resource_type TEXT DEFAULT 'external' 
  CHECK (resource_type IN ('internal', 'external', 'vendor'));

-- Also add to labor_entries for the labor log view
ALTER TABLE labor_entries ADD COLUMN IF NOT EXISTS resource_type TEXT DEFAULT 'external'
  CHECK (resource_type IN ('internal', 'external', 'vendor'));
```

### UI changes

1. **Schedule grid**: Add a narrow column (maybe 80px) with a dropdown/select: Internal / External / Vendor. Default to "External" (most common case per the meeting).

2. **Labor Log tab**: If labor_entries are displayed separately from schedule, also show resource_type there. Should sync from schedule_entries when the rollup happens.

3. **Summary tab**: Show resource type breakdown INLINE within each section's summary row. Example: "Labor: $9,580 (Internal: $4,200 · External: $3,880 · Vendor: $1,500)". Use smaller muted text for the breakdown. Do NOT add separate rows — keep the summary compact. Only show the breakdown on sections that have resource-typed items (primarily Labor). If all items in a section are the same type, the breakdown can be omitted for that section.

### Build steps

1. Read `src/components/schedule/ScheduleGrid.tsx` — understand the grid column structure.
2. Read `src/lib/schedule-service.ts` — understand how schedule entries are saved.
3. Add migration: resource_type column on schedule_entries and labor_entries.
4. Add the dropdown column to the schedule grid UI.
5. Update schedule-service save/load to include resource_type.
6. Update the rollup computation to pass resource_type from schedule to labor entries.
7. Update the Summary tab to show a resource type breakdown.
8. Verify: Add staff to schedule → set one as Internal, one as External → Summary shows breakdown.

### Decisions (resolved)

- **Default resource type:** "External" (most common case). Pre-selected on new rows. User can change to Internal or Vendor.
- **Summary display:** Inline within each section row, not a separate section. Example: the Labor row in Summary shows "Labor: $9,580 (Internal: $4,200 · External: $3,880 · Vendor: $1,500)". Same pattern for any section that has resource-typed line items. This keeps the Summary compact — no new rows, just richer detail on existing ones.

---

## STEP 3: DRIVESHOP INTERNAL RATE CARD + LOCKED RATES

### What we're building and why

Chris: "I would love to be able to lock, have a rate card where our internal time rates are locked. You can't change the rate. You can change your hours, but you can't change your hourly rate."

Joelle: "When we do our DriveShop rate card, those should be locked. The only thing that you can adjust is your amount of time."

### What exists to reuse

- `clients` table — create a "DriveShop" client entry
- `rate_card_items` table — store DS internal rates  
- Rate card management page — admin can set up rates
- Estimate builder — already reads from client's rate card

### Data model changes

```sql
-- Add is_locked flag to rate_card_items
ALTER TABLE rate_card_items ADD COLUMN IF NOT EXISTS is_rate_locked BOOLEAN DEFAULT FALSE;

-- Seed a DriveShop client if not exists
-- INSERT INTO clients (name, ...) VALUES ('DriveShop', ...);
-- Then add rate_card_items for each internal role with is_rate_locked = TRUE
```

### UI changes

1. **Rate Card Management**: Show a lock icon on locked rate items. Admin can toggle lock.
2. **Estimate Builder**: When pulling from a rate card with locked items, the unit_rate field is read-only (grayed out, shows lock icon). Quantity/days fields remain editable.
3. **Estimate creation with DS rate card**: When client is "DriveShop" (or when resource_type = 'internal' and using DS rate card), rates are locked.

### Build steps

1. Add migration: is_rate_locked column on rate_card_items.
2. Create DriveShop client record (or verify it exists).
3. Update Rate Card Management page to show lock toggle for admin.
4. Update estimate builder line item rendering — if rate_card_item.is_rate_locked, disable unit_rate input.
5. Verify: Go to DriveShop rate card → lock a rate → create estimate with that rate card → rate field is read-only → can still change hours/quantity.

### Decisions (resolved)

- **Rate data:** Build the full structure now (client record, rate card sections, is_rate_locked flag, lock icon UI). Leave the actual rate values EMPTY. Ray will get employee rates from Derek/HR and populate later. The feature should be fully functional — just with $0 placeholder rates until real data arrives.
- **Locked rates on non-DS estimates:** Defer for now. V1 only enforces locks when the estimate's client IS DriveShop. The cross-rate-card cost comparison (Tim on Mazda event, DS rate card shows he costs $250 but Mazda only pays $125) is a V2 feature tied to the staff/resources table (A9).

---

## STEP 4: GP THRESHOLD FLAG

### What we're building and why

Chris: "If this comes in as an estimate but it's below the percentage threshold, there's like a flag or alert next to it."

This adds a configurable GP floor. If an estimate's GP% falls below the threshold, show a visual warning and optionally require additional approval.

### What exists to reuse

- `system_settings` table — already has `approval_threshold_amount` for the $50K gate
- Three-gate approval chain — existing pattern for adding gates
- Summary tab GP% calculation — already computed

### Data model changes

```sql
-- Add GP threshold to system_settings
INSERT INTO system_settings (key, value, description) 
VALUES ('gp_threshold_pct', '20', 'Minimum GP% before flagging for review')
ON CONFLICT (key) DO NOTHING;
```

### UI changes

1. **Summary tab**: If current GP% < threshold, show a yellow/orange warning banner: "⚠️ GP is below minimum threshold (20%). This estimate may require additional review."
2. **Admin Settings page**: Allow configuring gp_threshold_pct alongside the existing approval_threshold_amount.
3. **Optional (defer if complex)**: Add as a gate in the approval chain — if GP% < threshold, require executive approval regardless of estimate amount.

### Build steps

1. Add system_settings seed for gp_threshold_pct.
2. Read the Summary tab component — find where GP% is computed.
3. Fetch gp_threshold_pct from system_settings.
4. If GP% < threshold, render warning banner below the summary.
5. Update Admin Settings UI to show the GP threshold config.
6. Verify: Set threshold to 20% → create estimate with 15% GP → warning appears → change to 25% GP → warning disappears.

---

## STEP 5: ROLLBACK BUG FIX

### What happened

Ray demoed rolling back from Active to Review during the meeting. After rollback, the "Move to Active" button disappeared — the segment was stuck in Review with no forward path.

### What to investigate

1. Read `src/lib/workflow-service.ts` — find the rollback function.
2. Read `src/lib/segment-status-service.ts` — check how available transitions are computed.
3. The issue is likely that after rollback, the transition logic doesn't recognize "Review" as having a valid forward path, OR the rollback creates a state that isn't in the allowed transitions map.
4. Check the `status_transitions` table — after a rollback, is the segment status correctly set to the target status?

### Fix

- Ensure that after rollback, the segment's status is set to a valid state that has forward transitions defined.
- The available transitions function should return the same options regardless of whether the segment arrived at that status via normal flow or rollback.

---

## VERIFICATION CHECKLIST

After all steps complete:

- [ ] New Mazda estimate → agency fee (10%) auto-appears in Fees section and Summary
- [ ] New VW estimate → no agency fee auto-generated (0%)
- [ ] Can manually add "Media Buying Fee" as a custom fee line
- [ ] Schedule grid shows resource type dropdown per row
- [ ] Summary shows resource type breakdown inline (e.g., "Labor: $X (Internal: $Y · External: $Z)")
- [ ] DriveShop rate card exists with locked rates
- [ ] Locked rate items show as read-only in estimate builder
- [ ] GP below threshold shows warning banner in Summary
- [ ] Admin can configure GP threshold
- [ ] Rollback from Active → segment can still move forward to Active again
- [ ] All existing functionality unchanged (regression check)
