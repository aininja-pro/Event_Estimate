# Requirements: Recap Additions — Unplanned Line Items & Extra Schedule Days

## Problem

Two scenarios from Dave's April 8 feedback that the current recap mode doesn't handle:

1. **Unexpected costs after the event.** "We had a flood and needed a cleaning crew." The estimator needs to add a line item that wasn't in the original estimate. Currently, recap mode only lets you enter actuals on existing line items — you can't add new ones.

2. **Extra days on the schedule.** "We had a disaster and had to keep everybody an extra day." The event ran longer than planned. Currently, the schedule grid in recap mode only shows the planned date columns — you can't add a new date that wasn't in the original schedule.

Both scenarios produce entries with $0 estimated cost and a real actual cost. They need to be visually distinct so anyone reviewing the recap can immediately see "this wasn't part of the plan."

## Who This Is For

- **Primary users:** Dan, Tim (Production Managers) — adding unplanned costs and extra days during recap
- **Stakeholders:** Dave (Operations) — "give them the ability to add something extra, maybe even a different color"
- **Stakeholders:** Tatiana (CFO) — needs to see what was planned vs. what was added after the fact

## Proposal

Two enhancements to recap mode on the existing Estimate Builder page:

1. **Add line items during recap** — an "Add Unplanned Item" button on each line item tab (Production, Travel, etc.) that creates a new line item with $0 estimate and an editable actual cost. Visually distinct color/highlight to flag it as unplanned.

2. **Add extra days to schedule during recap** — an "Add Day" button on the schedule grid that adds a new date column not in the original plan. Staff can have actual hours entered for that day. The column is visually distinct as unplanned.

## Success Criteria

### Unplanned Line Items
- "Add Unplanned Item" button appears on line item tabs when segment is in recap
- New items have $0 for all estimated columns (quantity, unit_cost, markup — all zero)
- Actual cost column is editable (this is the only meaningful field)
- Item appears with a distinct visual treatment — different background color, badge, or left-border accent that says "unplanned"
- Flows into the variance summary: $0 estimated, $X actual, -$X variance
- Receipt upload works on unplanned items (same as planned items)
- Can add description/notes to explain why it was added

### Extra Schedule Days
- "Add Day" button appears on the schedule grid when segment is in recap
- New date column appears with all staff having blank/zero actual hours
- Planned hours are $0 for the new day (it wasn't in the plan)
- Actual hours are editable — enter hours for staff who worked
- Column is visually distinct — different header color or "UNPLANNED" label
- Flows into schedule recap actuals: adds to actual days/cost without inflating planned totals
- Day type can be assigned (event, setup, travel, etc.)

## Scope

### Included (This Blueprint)

**Unplanned Line Items:**
- "Add Unplanned Item" button on each line item tab in recap mode
- Simple modal or inline form: item name (required), section (auto-set from current tab), description, actual cost
- New item created with: quantity=1, unit_cost=0, markup_pct=0 (all estimate fields zero), actual cost entered by user
- Visual distinction: subtle rose/amber left-border accent + "UNPLANNED" micro-badge on the row
- Variance calculation handles $0 estimate gracefully (show actual as full negative variance)
- Works with existing receipt upload

**Extra Schedule Days:**
- "Add Day" button on schedule grid in recap mode (next to existing "+ Add Date")
- Date picker for the new day
- New day_type entry created for the date
- All schedule_day_entries for the new date created with hours=0 (no planned hours), actual_hours=NULL (editable)
- Column header visually distinct: different background or "UNPLANNED" label below the date
- Existing rollup logic handles unplanned days correctly (Blueprint 1 already fixed planned-side filtering to exclude hours=0)

### Not Included

- Adding new staff/roles during recap (only new days and new line items)
- Bulk import of unplanned items
- Automatic detection of "this looks unplanned" on existing items
- Unplanned items appearing on the client-facing PDF (they're internal recap data unless explicitly included)

## Dependencies

- **Recap mode infrastructure** — edit rules, actuals columns on line items ✅
- **Schedule recap actuals** — Blueprint 1 complete, actual_hours column exists, smart visibility working ✅
- **Rollup filtering** — Blueprint 1 fixed planned-side filtering to exclude hours=0, so unplanned days won't inflate planned totals ✅

## Resolved Decisions

- **$0 estimate, real actual.** Unplanned items have zero across all estimate columns. The actual cost is the only meaningful field. Variance shows the full actual as negative.
- **Visually distinct but not alarming.** Dave said "a different color, like this was added after." A subtle accent (rose/amber left-border + micro-badge) signals "unplanned" without making it look like an error.
- **Unplanned schedule days don't inflate planned totals.** Blueprint 1 already handled this — planned rollup filters hours > 0, so days with hours=0 (unplanned) are excluded from the plan side.

## Open Questions

*None — all resolved.*
