# Requirements: Schedule Recap Actuals & Financial Summary Cards — Event Estimate Engine

## Problem

Two gaps identified in Dave's feedback session (April 8):

1. **Recap only captures actuals at the labor log level, not the schedule level.** When Dave asks "what days did they actually work?" the system can't answer. The current recap adds actual days and costs to the Labor Log tab, but the schedule grid — where individual staff × day assignments live — stays locked and read-only. Dave needs to see planned vs. actual at the day level so he can track exactly what happened.

2. **Financial headline numbers are buried in the Summary tab.** Estimators have to scroll to the bottom and click the Summary tab to see GR, NR, GP%. Dave wants these always visible at the top of the page — every view Derek prepares has a financial summary card row at the top.

## Who This Is For

- **Primary users:** Dan, Tim (Production Managers) — enter schedule actuals during recap
- **Stakeholders:** Dave (Operations) — wants day-level plan vs. actual visibility
- **Stakeholders:** Derek (CEO) — wants headline financials always visible

## Proposal

### Schedule Recap Actuals
When a segment is in recap status, the schedule grid transforms to show two rows per staff member: a planned row (locked, from the approved estimate) and an actual row (editable). Actuals default to match the plan (pre-filled from budgeted hours) since "more often than not it follows the plan" (Dave). The estimator adjusts only what changed — clear a day someone didn't work, add hours for overtime. The labor log recap columns then derive from the schedule actuals.

### Financial Summary Cards
A persistent card row at the top of the Estimate Builder (above the tabs) showing Gross Revenue, Net Revenue, Total Cost, Gross Profit, and GP%. Updates in real time as data changes. Always visible regardless of which tab is active.

## Success Criteria

### Schedule Recap
- When segment is in recap, schedule grid cells become editable for actual hours
- Planned hours shown as muted reference below the actual ONLY when they differ (smart visibility)
- Actual hours pre-filled from the planned schedule (default = plan)
- Planned hours are never editable — purely a reference
- Clearing an actual day (setting to 0) captures "this person didn't work this day"
- Labor Log recap actuals derive from the schedule recap data (not entered separately)
- Variance visible: total planned days vs. total actual days per person
- Day-level changes persist to the `recap_actuals` table or a new schedule-level recap table
- Grid dimensions unchanged — no extra columns, cells slightly taller in recap mode

### Financial Summary Cards
- Card row visible above the tabs on every view (schedule, labor log, line items, summary)
- Shows: GR (Gross Revenue), NR (Net Revenue), Cost, GP (Gross Profit), GP%
- Updates in real time as entries change
- Matches the app's production aesthetic — clean, professional, not flashy
- GP% color-coded: green if above threshold, amber/red if below

## Scope

### Included (This Blueprint)

**Schedule Recap Actuals:**
- When `editRules.actuals === true` (recap status), schedule grid renders in recap mode
- Each hour cell becomes editable for actual hours. Planned value appears as a small muted reference below the actual ONLY when they differ (smart visibility — if actual matches plan, cell looks identical to today)
- Cells color-coded: amber when actual is under plan, red when actual is zero/cleared (no-show), blue when actual exceeds plan. No tint when actual matches plan.
- Actual hours pre-filled from planned hours on first entering recap
- On-blur save of actual hours (same pattern as other recap fields — upsert to recap storage)
- Per-person summary: planned days vs. actual days, with variance
- Labor Log tab actuals auto-compute from schedule actuals (not entered independently when schedule data exists)
- Column-level totals: planned staff/day vs. actual staff/day
- Grid dimensions stay the same — cells get slightly taller in recap mode, no additional columns added

**Financial Summary Cards:**
- New component rendered above the Tabs in EstimateBuilderPage
- Five values: Gross Revenue, Net Revenue, Total Cost, Gross Profit, GP%
- Computed from the same data the Summary tab uses (labor entries, line items, schedule rollup)
- Recomputes on any data change (uses the existing state maps)
- GP% color-coded against the gp_threshold_pct from system_settings
- Responsive: cards shrink gracefully on smaller screens

### Not Included

- Adding extra days to the schedule during recap (separate blueprint)
- Adding new line items during recap with color-coding (separate blueprint)
- Schedule-level OT actual tracking (actuals capture total hours per day, OT derives from the same 10hr rule)
- Historical comparison on the financial cards ("last similar event was $X")

## Dependencies

- **Recap mode infrastructure** — edit rules, recap_actuals table, upsertRecapActual() — all exist ✅
- **Schedule grid component** — ScheduleGrid.tsx with day entries ✅
- **Summary computation logic** — exists in SummaryTab, reusable for cards ✅
- **GP threshold setting** — system_settings key exists ✅

## Resolved Decisions

- **Actuals default to planned.** Dave confirmed: "more often than not it follows the plan." Pre-filling saves time on the 90% case. Users adjust the exceptions.
- **Schedule actuals drive labor log actuals.** For schedule-driven segments, the labor log recap shouldn't require separate entry — it derives from what's entered on the schedule. This avoids double-entry.
- **Financial cards are always visible.** Not a toggle, not collapsible. Derek and Dave both want headline numbers at a glance without navigating to Summary.

## Open Questions

*None — all resolved.*
