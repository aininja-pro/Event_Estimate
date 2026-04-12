# Blueprint: Schedule Recap Actuals & Financial Summary Cards

## What This Is

Two features: (1) transform the schedule grid in recap mode to show planned vs. actual hours per staff member per day, with actuals pre-filled from the plan, and (2) add a persistent financial summary card row at the top of the Estimate Builder showing GR, NR, Cost, GP, GP%.

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context, conventions
- `planning/requirements-driveshop-schedule-recap.md` — full requirements
- `src/components/schedule/ScheduleGrid.tsx` — the schedule grid component. Understand how it renders day columns, hour cells, and how `readOnly` and `namesEditable` props work today.
- `src/components/recap/RecapActualsCells.tsx` — the existing recap actuals pattern on the Labor Log tab. Follow the same save pattern.
- `src/lib/segment-status-service.ts` — `getSegmentEditRules()`, `getRecapActuals()`, `upsertRecapActual()`
- `src/lib/schedule-service.ts` — `getScheduleEntries()`, `computeScheduleRollup()` — understand the rollup logic
- `src/pages/EstimateBuilderPage.tsx` — where the financial cards will be placed and how data flows

Check: How are recap actuals currently stored? Is there a `recap_actuals` record per labor_entry? Understand the current schema before deciding whether schedule-level actuals need a new table or can extend the existing one.

---

## Step 1: Schedule Recap Data Model

### Determine storage approach:

The schedule grid has individual `schedule_entries` (one per staff member) with `schedule_day_entries` (one per day per staff member, stores hours). Recap actuals need to capture actual hours per day per staff member.

**Option A: New table `schedule_recap_entries`**
```sql
CREATE TABLE IF NOT EXISTS schedule_recap_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_entry_id UUID NOT NULL REFERENCES schedule_entries(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  actual_hours NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(schedule_entry_id, work_date)
);
```
One row per staff member × day. Mirrors `schedule_day_entries` but for actuals.

**Option B: Add `actual_hours` column to existing `schedule_day_entries`**
```sql
ALTER TABLE schedule_day_entries ADD COLUMN actual_hours NUMERIC;
```
Simpler — no new table, just an additional column. NULL means "no actual entered yet." When recap starts, you could pre-fill actual_hours = hours for all entries.

**Recommendation: Option B** — it's simpler, keeps planned and actual on the same record, and the pre-fill is a single UPDATE statement. But read the existing table structure first to confirm this makes sense. If `schedule_day_entries` has constraints or patterns that make this awkward, go with Option A.

Show me your decision and the migration SQL before proceeding.

---

## Step 2: Pre-fill Actuals on Recap Transition

When a segment transitions to "recap" status, pre-fill all actual hours from the planned hours.

### Where to trigger:

In `transitionSegmentStatus()` in `segment-status-service.ts`, when the transition is `active → recap`:

If using Option B (actual_hours on schedule_day_entries):
```sql
UPDATE schedule_day_entries 
SET actual_hours = hours 
WHERE schedule_entry_id IN (
  SELECT id FROM schedule_entries WHERE labor_log_id = '{laborLogId}'
)
AND actual_hours IS NULL;
```

This pre-fills only entries that haven't been set yet (idempotent — safe to re-run).

If using Option A (new table), insert rows from schedule_day_entries into schedule_recap_entries with actual_hours = hours.

### Service function:

Add `prefillScheduleActuals(laborLogId)` to `schedule-service.ts` or `segment-status-service.ts`. Call it from the recap transition handler.

Show me the pre-fill logic working — transition a segment to recap and verify actual_hours are populated.

---

## Step 3: Schedule Grid Recap Mode UI

### Modify `src/components/schedule/ScheduleGrid.tsx`:

When the segment is in recap status (pass a new prop `recapMode: boolean` from EstimateBuilderPage based on `editRules.actuals`):

**Visual treatment per cell — Option B: Stacked in same cell, smart visibility**

The grid keeps the exact same dimensions. Cells get ~10px taller in recap mode. The key principle: **show differences, hide agreement.** When actual matches plan (90% of cells), the grid looks identical to today. When something changed, the cell highlights the exception.

**When actual = planned (most cells — the default after pre-fill):**
```
┌──────┐
│  10  │  ← just the number, editable, looks normal
└──────┘
```
No planned reference shown. No visual noise. Looks exactly like the grid does today.

**When actual differs from planned (the exceptions that matter):**
```
┌──────┐
│   8  │  ← actual (editable, amber background tint)
│ (10) │  ← planned (text-[9px], muted, read-only)
└──────┘
```
The cell gets a subtle amber/red background tint. The planned value appears below in small muted text with parentheses. Your eye goes straight to the exceptions.

**When actual is cleared to 0 (person didn't work that day):**
```
┌──────┐
│   —  │  ← actual is 0/empty (red-ish tint)
│ (10) │  ← planned (shows what was expected)
└──────┘
```
Dash or empty with the planned reference below. Red tint signals "this was planned but didn't happen."

**When actual exceeds planned (overtime or extra hours):**
```
┌──────┐
│  14  │  ← actual (editable, blue/indigo tint)
│ (10) │  ← planned reference
└──────┘
```
Different tint color for over-plan to distinguish from under-plan.

**Implementation:**
- In recap mode, each hour cell renders as an editable input for the actual value
- On every render, compare `actual_hours` vs `hours` (planned)
- If equal: render just the actual number, no planned reference, no background tint
- If different: render actual + planned reference below, apply appropriate background tint
- The planned value is NEVER editable — it's purely a reference
- Cell height increases by ~10px in recap mode to accommodate the potential second line (CSS transition for smooth appearance)

**Per-row summary (rightmost column):**

Currently shows "DAYS" count. In recap mode, show:
```
Plan: 4 | Act: 3
```
Or a variance: "4 → 3 (-1)"

**Column totals (bottom row):**

Currently shows STAFF/DAY count. In recap mode, show planned vs. actual staff per day.

**On-blur save:**

When the user changes an actual hour value:
- If Option B: update `schedule_day_entries.actual_hours` for that entry
- If Option A: upsert `schedule_recap_entries` for that schedule_entry_id + work_date
- Use the same debounced save pattern as other recap cells

**Names still editable in recap.** The existing `namesEditable` behavior continues — recap mode keeps names editable AND adds actual hours editing.

---

## Step 4: Labor Log Recap Derives from Schedule

### The integration:

Currently, the Labor Log recap columns (Act Days, Act Cost) are manually entered on the Labor Log tab via RecapActualsCells. For schedule-driven segments, these should AUTO-COMPUTE from the schedule actuals instead of requiring separate entry.

**Logic:**
- For each role in the labor log rollup, count the actual days worked from schedule_day_entries (where actual_hours > 0)
- Compute actual cost = actual_days × day_rate (+ OT if actual_hours > 10 on any day)
- Display these as read-only computed values on the Labor Log recap columns (not editable — they derive from schedule)
- The RecapActualsCells component should detect "this is a schedule-driven segment" and render computed values instead of inputs

**How to detect schedule-driven:** Check if the segment has schedule_entries. If yes, labor log actuals are computed. If no (manual labor entries only), the current manual entry behavior continues.

Show me the labor log showing computed actuals from schedule data before proceeding.

---

## Step 5: Financial Summary Cards

### New component: `src/components/FinancialSummaryCards.tsx`

A row of 5 cards displayed above the Tabs in EstimateBuilderPage.

**Cards:**

| GR (Gross Revenue) | NR (Net Revenue) | Total Cost | GP (Gross Profit) | GP% |
|---|---|---|---|---|
| $82,400 | $74,200 | $51,000 | $31,400 | 38.1% |

**Design:**
- Use shadcn `Card` component
- 5-column grid: `grid grid-cols-5 gap-3`
- Each card:
  - Label: text-[10px] uppercase tracking-widest text-muted-foreground (e.g., "GROSS REVENUE")
  - Value: text-[18px] or text-[20px] font-semibold (e.g., "$82,400")
  - Compact: `py-2.5 px-3` — not tall, just enough to show label + value
- GP% card: color-coded based on gp_threshold_pct
  - Above threshold: green text
  - Below threshold: amber/red text with subtle warning background
- Border-bottom accent color per card (subtle, like the pipeline dashboard cards)

**Data source:**

Compute from the same data the Summary tab uses. Create a shared computation function (or extract from SummaryTab if it's inline) that takes `laborLogs`, `laborEntriesMap`, `lineItemsMap`, `scheduleEntriesMap` and returns `{ grossRevenue, netRevenue, totalCost, grossProfit, gpPercent }`.

The cards re-render on any state change — same reactivity as the rest of the page.

**Placement in EstimateBuilderPage.tsx:**

```jsx
{/* Financial Summary Cards — always visible */}
<FinancialSummaryCards
  laborLogs={laborLogs}
  laborEntriesMap={laborEntriesMap}
  lineItemsMap={lineItemsMap}
  scheduleEntriesMap={scheduleEntriesMap}
  gpThreshold={gpThreshold}
/>

{/* Tabs below */}
<Tabs value={activeTab} ...>
```

Between the segment transition bar and the tabs. Always visible regardless of tab selection.

---

## Step 6: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log
Add row: `Wk 12-13 | Schedule Recap Actuals + Financial Summary Cards: planned vs actual on schedule grid, pre-filled actuals, labor log derives from schedule, GR/NR/GP% cards above tabs | Recap additions | Schedule recap + financial cards complete`

### Conventions
Add: "In recap mode, schedule grid shows planned vs actual hours. Actual hours pre-filled from plan on recap transition. Labor log actuals auto-compute from schedule actuals for schedule-driven segments."
Add: "FinancialSummaryCards component renders above tabs on every Estimate Builder view. Recomputes from state on every change."

### Known Issues
Add: "Schedule recap pre-fill runs on recap transition only. If schedule is modified before recap (via change order), the pre-fill uses the current approved schedule."

---

## What NOT to Build

- Do not add extra date columns to the schedule during recap (separate blueprint)
- Do not add new unplanned line items during recap (separate blueprint)
- Do not build a separate recap schedule page — recap transforms the existing grid
- Do not make the financial cards collapsible or toggleable — they're always visible per Dave's request
- Do not duplicate the Summary tab logic — extract a shared computation function that both the cards and the Summary tab use
- Do not change the schedule grid layout for non-recap modes — the planned/actual split only appears in recap

---

## Build Order

1. **Step 1** — Data model decision + migration SQL. Show me the approach and SQL before running.
2. **Step 2** — Pre-fill logic on recap transition. Transition a test segment to recap and verify actuals populated.
3. **Step 3** — Schedule grid recap UI. Show me the planned vs. actual rendering on a real segment in recap.
4. **Step 4** — Labor log derives from schedule actuals. Show me the labor log tab with computed values.
5. **Step 5** — Financial summary cards. Show me the cards rendering with real data above the tabs.
6. **Step 6** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1. Do not skip ahead.
