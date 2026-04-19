# Blueprint: Recap Additions — Unplanned Line Items & Extra Schedule Days

## What This Is

Two additions to recap mode: (1) the ability to add new line items that weren't in the original estimate, with $0 estimated cost and a real actual cost, visually flagged as unplanned, and (2) the ability to add extra date columns to the schedule grid for days the event ran beyond the plan.

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context, conventions
- `planning/requirements-driveshop-recap-additions.md` — full requirements
- `src/pages/EstimateBuilderPage.tsx` — line item tab rendering, how recap mode is detected, how items are added
- `src/components/schedule/ScheduleGrid.tsx` — how date columns are added (existing "+ Add Date" button), how RecapGridCell renders, how the rollup excludes hours=0 from planned totals
- `src/lib/estimate-service.ts` — createLineItem(), existing add flow
- `src/lib/schedule-service.ts` — how day entries and day types are created
- `src/components/recap/RecapActualsCells.tsx` — how actuals render on line item tabs

Understand how existing recap actuals work on line items before adding unplanned items. The new items use the same actual/variance pattern but with $0 estimate.

---

## Step 1: Unplanned Line Items — Data Model

No schema changes needed. Unplanned items use the existing `estimate_line_items` table with a marker to identify them as unplanned.

**Option A: New boolean column `is_unplanned`**
```sql
ALTER TABLE estimate_line_items ADD COLUMN is_unplanned BOOLEAN DEFAULT FALSE;
```

**Option B: Infer from data — if quantity=0 AND unit_cost=0, it's unplanned**

**Recommendation: Option A.** An explicit flag is clearer than inferring from data. It survives edge cases (what if someone manually sets a planned item to $0?). One column, one migration.

Create migration: `scripts/migration_unplanned_line_items.sql`

```sql
ALTER TABLE estimate_line_items ADD COLUMN is_unplanned BOOLEAN DEFAULT FALSE;
```

Show me the SQL before running.

---

## Step 2: Unplanned Line Items — UI

### "Add Unplanned Item" button

On each line item tab (Production, Travel & Logistics, Creative, Access Fees, Misc, Fees & Markups), when `editRules.actuals === true` (recap mode):

Show an **"+ Add Unplanned Item"** button below the existing items. Style it differently from the normal "Add Item" button — use a subtle rose/amber outline or dashed border to signal it's a recap-only action. The normal "Add Item" button should be hidden in recap mode (you can't add planned items during recap).

### Modal or inline form:

Keep it simple. A small inline form or modal with:
- **Item name** (required) — text input
- **Description** (optional) — text input for why this was added ("Emergency cleaning crew due to flood")
- **Section** — auto-set from the current tab (production, travel, etc.)
- **Actual cost** (required) — number input. This is the only cost that matters.

On save:
```typescript
await createLineItem({
  estimate_id: estimateId,
  labor_log_id: activeLocationId,
  section: currentTab,
  item_name: name,
  description: description,
  quantity: 0,
  unit_cost: 0,
  markup_pct: 0,
  gl_code: null,
  rate_card_item_id: null,
  is_unplanned: true,
  display_order: existingItems.length,
})
```

Then immediately create a recap actual for the new item:
```typescript
await upsertRecapActual({
  line_item_id: newItem.id,
  labor_log_id: activeLocationId,
  actual_total: actualCost,
  notes: description,
})
```

### Visual treatment on the line item table:

Unplanned items render with:
- **Left-border accent:** 3px rose/amber border on the left side of the row (like nudge severity styling)
- **Micro-badge:** Small "UNPLANNED" text badge next to the item name — text-[8px] uppercase tracking-wider, rose/amber color, subtle background pill
- **Estimate columns show "—"** instead of $0 (cleaner than showing zeros everywhere)
- **Actual and Variance columns** work normally — actual shows the entered cost, variance shows the full amount as negative (since estimate is $0)

### How it reads visually:

```
| Item Name              | Qty | Rate  | Est Total | Actual  | Variance  | Receipt |
|------------------------|-----|-------|-----------|---------|-----------|---------|
| Hotels                 | 8   | $200  | $1,600    | $1,400  | +$200 ✅  | 📎      |
| Fuel                   | 1   | $500  | $500      | $620    | -$120 🔴  | 📎      |
| Emergency Cleanup UNPLANNED | —   | —     | —         | $890    | -$890 🔴  | 📎      |
```

The unplanned row is immediately distinguishable — left-border accent, badge, dashes in estimate columns.

---

## Step 3: Unplanned Line Items — Variance Integration

### Variance calculation:

The existing variance logic in `getVarianceReport()` and on the Summary tab already handles this case:
- Estimated total = quantity × unit_cost × (1 + markup_pct/100) = 0 × 0 × 1 = $0
- Actual total = from recap_actuals = $890
- Variance = $0 - $890 = -$890

This should already work. Verify by adding an unplanned item and checking that:
1. The line item tab shows the correct variance
2. The Summary tab's variance section includes the unplanned item
3. The section subtotals reflect the unplanned cost

If the variance report groups by section, the unplanned item should appear in its section (production, travel, etc.) with its $0 estimate and real actual.

Show me a test — add an unplanned item and verify variance flows through to Summary.

---

## Step 4: Extra Schedule Days

### "Add Day" in recap mode

The schedule grid already has a "+ Add Date" button. In recap mode, this button is currently hidden (or disabled) because `editRules.schedule_add_remove === false`.

**Change:** When in recap mode, show a different button: **"+ Add Unplanned Day"** that adds a date column specifically for recap actuals.

### Flow:

1. User clicks "+ Add Unplanned Day"
2. Date picker appears (same as the existing add date flow)
3. On date selection:
   a. Create a `schedule_day_types` entry for the new date with the selected day_type (default to 'event' or let user choose)
   b. For EACH existing `schedule_entry` (each staff member) in this segment, create a `schedule_day_entry` with:
      - `work_date`: the new date
      - `hours`: 0 (no planned hours — this day wasn't in the plan)
      - `actual_hours`: NULL (editable — user will fill in who worked)
4. The new column appears in the grid

### Visual treatment for unplanned day columns:

The column header for an unplanned day should be visually distinct:
- Same date format as other columns (e.g., "Apr 6 Mon")
- Day type badge below (EVENT, SETUP, etc.)
- **Different header background** — subtle rose/amber tint instead of the normal green/teal tints
- Or a small **"UNPLANNED"** label below the day type badge

### Cell behavior:

Since `hours = 0` for all staff on the unplanned day:
- In the smart visibility system (from Blueprint 1), cells with hours=0 and actual_hours=NULL show as empty/clickable
- User clicks a cell → enters actual hours for staff who worked that day
- Cells where actual_hours > 0 show the hours with a red tint (unplanned work)
- The planned reference shows "(0)" or is hidden since there's nothing planned

This actually already works thanks to Blueprint 1's unplanned day handling:
> "Unplanned days are legitimate recap data... allowing edit on blank cells, stored as hours=0 / actual_hours=N."

The main new work is the "Add Unplanned Day" button + the day type creation + the column header styling.

### Rollup:

Blueprint 1 already fixed this:
- Planned rollup filters `hours > 0`, so unplanned days (hours=0) don't inflate planned totals
- Actual rollup counts `actual_hours > 0`, so unplanned days with actual work are included in actuals
- Variance captures the difference correctly

Verify by adding an unplanned day, entering actual hours for a couple staff members, and checking that:
1. Planned totals don't change
2. Actual totals increase by the new hours
3. Labor log actuals reflect the extra day
4. Summary variance reflects the additional cost

---

## Step 5: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log
Add row: `Wk 13 | Recap Additions: unplanned line items with visual flagging + extra schedule days in recap mode | Approval routing improvements | Recap additions complete`

### Conventions
Add: "Unplanned line items in recap have is_unplanned=true, quantity/unit_cost/markup=0, rose left-border + UNPLANNED badge. Estimate columns show dashes."
Add: "Unplanned schedule days created with hours=0 for all staff. Column header has distinct tint. Rollup correctly excludes from planned totals (hours > 0 filter)."

### New Columns
Add: `estimate_line_items.is_unplanned` (BOOLEAN DEFAULT FALSE)

---

## What NOT to Build

- Do not add new staff/roles to the schedule during recap. Only new days and new line items.
- Do not change the existing "+ Add Date" button behavior in non-recap modes. It stays as-is.
- Do not auto-detect unplanned items. The user explicitly clicks "Add Unplanned Item" — it's a conscious action.
- Do not show unplanned items on the client-facing PDF by default. They're internal recap data.
- Do not allow editing estimate-side fields on unplanned items (quantity, unit_cost, markup stay at 0). Only actual cost and description are editable.
- Do not overcomplicate the inline form. Item name + actual cost + optional description. That's it.

---

## Build Order

1. **Step 1** — Migration: add `is_unplanned` column. Show me the SQL before running.
2. **Step 2** — Unplanned line item UI: button, form, create flow, visual treatment. Show me an unplanned item rendered on a line item tab.
3. **Step 3** — Verify variance integration. Add an unplanned item, check Summary tab variance. Show me the numbers.
4. **Step 4** — Extra schedule days: "Add Unplanned Day" button, date creation, column header styling. Add an unplanned day, enter hours for two staff, verify rollup. Show me the grid.
5. **Step 5** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1. Do not skip ahead.
