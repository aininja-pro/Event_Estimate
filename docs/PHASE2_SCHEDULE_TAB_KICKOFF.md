# PHASE 2: SCHEDULE TAB — Staffing Grid Feature
## Claude Code Build Instructions

**Sprint:** Schedule Tab (Staffing Grid)
**Pattern:** Schema → Service Layer → UI → Integration → Verify
**Approach:** Incremental. Complete each step before moving to the next. Show work before proceeding.

---

## CONTEXT

Derek (CEO) wants a **Schedule tab** — a visual staffing grid that becomes the primary entry point for building an estimate's labor plan. This replaces the manual Qty × Days entry on the Labor Log tab.

**Derek's exact words:**
- "I want to force the discipline of people actually building out the labor schedule for these events"
- "1,000% start with the calendar. That's the place."
- "Rows are people, columns are days"
- "This is the end result [the Labor Log]. But I want the discipline of people building that schedule first"

**What already exists:**
- Estimate Builder page with tabs: Labor Log | Production | Travel & Logistics | Creative | Access Fees & Insurance | Misc | Summary
- Labor Log tab with functional CRUD: roles from rate card dropdown, Qty × Days × Rate, auto-calculated totals and GP
- `labor_logs` table (one per segment within an estimate)
- `labor_entries` table (individual role rows within a labor log)
- `estimate-service.ts` with all Supabase queries for estimates
- `rate-card-service.ts` with rate card queries
- Multi-segment support (geographic or temporal divisions)
- AI Intelligence panel (static mockup on right side — 70/30 layout)

**After this sprint:**
- Schedule tab is the NEW default first tab
- Tab order: **Schedule** | Labor Log | Production | Travel & Logistics | Creative | Access Fees & Insurance | Misc | Summary
- Schedule tab = INPUT (user builds the staffing grid here)
- Labor Log tab = ROLLUP (auto-calculated from schedule data, read-only)
- No manual entry on Labor Log anymore — 100% driven by the schedule

---

## WHAT NOT TO DO IN THIS SPRINT

- Do NOT change the AI Intelligence panel — it stays as a static visual placeholder
- Do NOT modify Production, Travel, Creative, Access, or Misc tabs
- Do NOT add approval workflows or version control
- Do NOT add drag-to-reorder rows yet — use simple up/down arrows if needed
- Do NOT build the Pre-Event Work section in the first pass — stub it out with a placeholder. We'll add it as a follow-up.
- Do NOT over-engineer — no virtualized scrolling, no complex drag libraries. Simple HTML table with React state.

---

## STEP 1: DATABASE SCHEMA

Create `scripts/supabase_schedule_schema.sql`. This adds one new table.

### Design Decision: Separate table, not extending labor_entries

The schedule needs per-person, per-day granularity. The existing `labor_entries` table stores rolled-up totals (role × qty × days). These are different data shapes. A new `schedule_entries` table stores the grid data. The Labor Log tab reads from `schedule_entries` and computes the rollup.

```sql
-- Schedule entries: one row per person per day in the staffing grid
CREATE TABLE schedule_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,

  -- Role info (snapshotted from rate card at creation time)
  rate_card_item_id UUID REFERENCES rate_card_items(id),
  role_name TEXT NOT NULL,
  person_name TEXT,  -- nullable during estimate, filled in during recap

  -- Grid position
  row_index INTEGER NOT NULL DEFAULT 0,  -- for ordering rows in the grid
  staff_group_id UUID,  -- groups rows of the same role together (e.g., 4 Product Specialists share one group ID)

  -- Per-person travel/expense flags
  needs_airfare BOOLEAN DEFAULT true,
  needs_hotel BOOLEAN DEFAULT true,
  needs_per_diem BOOLEAN DEFAULT true,

  -- Rate snapshot (copied from rate card at creation)
  day_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  ot_hourly_rate DECIMAL(10,2) GENERATED ALWAYS AS (day_rate / 10) STORED,
  ot_cost_rate DECIMAL(10,2) GENERATED ALWAYS AS (cost_rate / 10) STORED,

  -- Metadata
  gl_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Schedule day entries: one row per cell in the grid (person × date)
CREATE TABLE schedule_day_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_entry_id UUID NOT NULL REFERENCES schedule_entries(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  hours DECIMAL(4,1) NOT NULL DEFAULT 10,  -- 10 = standard day
  per_diem_override BOOLEAN,  -- null = use parent default, true/false = explicit override

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One cell per person per date
  UNIQUE(schedule_entry_id, work_date)
);

-- Day type definitions per date per labor log (column-level, not cell-level)
CREATE TABLE schedule_day_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  day_type TEXT NOT NULL DEFAULT 'event' CHECK (day_type IN ('event', 'setup', 'training', 'travel', 'off')),
  display_order INTEGER DEFAULT 0,

  -- One day type per date per labor log
  UNIQUE(labor_log_id, work_date)
);

-- Indexes
CREATE INDEX idx_schedule_entries_labor_log ON schedule_entries(labor_log_id);
CREATE INDEX idx_schedule_entries_group ON schedule_entries(staff_group_id);
CREATE INDEX idx_schedule_day_entries_entry ON schedule_day_entries(schedule_entry_id);
CREATE INDEX idx_schedule_day_entries_date ON schedule_day_entries(work_date);
CREATE INDEX idx_schedule_day_types_labor_log ON schedule_day_types(labor_log_id);

-- Updated_at triggers (reuses existing function)
CREATE TRIGGER schedule_entries_updated_at BEFORE UPDATE ON schedule_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER schedule_day_entries_updated_at BEFORE UPDATE ON schedule_day_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER schedule_day_types_updated_at BEFORE UPDATE ON schedule_day_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (permissive for now — same pattern as other tables)
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_day_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_day_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to schedule_entries" ON schedule_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to schedule_day_entries" ON schedule_day_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to schedule_day_types" ON schedule_day_types FOR ALL USING (true) WITH CHECK (true);
```

### Schema Rationale (3 tables):
1. **`schedule_entries`** = rows in the grid (one per person). Stores role, rates, travel flags.
2. **`schedule_day_entries`** = cells in the grid (one per person × date). Stores hours worked.
3. **`schedule_day_types`** = column headers (one per date per segment). Stores day type (event/setup/travel/etc.).

This is normalized but simple. The grid is: `schedule_entries` (rows) × `schedule_day_types` (columns) → `schedule_day_entries` (cell values).

**Show me the SQL before running it. Do not proceed to Step 2 until I confirm.**

---

## STEP 2: SCHEDULE SERVICE LAYER

Create `src/lib/schedule-service.ts` — thin wrappers around Supabase queries.

### Functions to build:

```typescript
// --- Day Types (column definitions) ---
getScheduleDayTypes(laborLogId: string): Promise<ScheduleDayType[]>
upsertScheduleDayType(laborLogId: string, workDate: string, dayType: string): Promise<ScheduleDayType>
deleteScheduleDayType(laborLogId: string, workDate: string): Promise<void>
generateDateRange(startDate: string, endDate: string): string[]  // utility, not DB

// --- Schedule Entries (rows = people) ---
getScheduleEntries(laborLogId: string): Promise<ScheduleEntry[]>  // includes nested day_entries
addScheduleEntry(laborLogId: string, entry: NewScheduleEntry): Promise<ScheduleEntry>
updateScheduleEntry(id: string, updates: Partial<ScheduleEntry>): Promise<ScheduleEntry>
deleteScheduleEntry(id: string): Promise<void>
duplicateScheduleEntry(id: string): Promise<ScheduleEntry>  // copy row with all day entries

// --- Schedule Day Entries (cells = hours per person per day) ---
upsertScheduleDayEntry(scheduleEntryId: string, workDate: string, hours: number): Promise<ScheduleDayEntry>
deleteScheduleDayEntry(scheduleEntryId: string, workDate: string): Promise<void>
bulkFillColumn(laborLogId: string, workDate: string, hours: number): Promise<void>  // fill all staff on a date
bulkFillRow(scheduleEntryId: string, dates: string[], hours: number): Promise<void>  // fill all event days for a person

// --- Rollup (for Labor Log tab) ---
getScheduleRollup(laborLogId: string): Promise<LaborRollupRow[]>
// Returns: { role_name, quantity, total_days, total_hours, ot_hours, day_rate, cost_rate, line_total, cost_total, gp, gp_pct }
// This is the data that replaces manual labor_entries
```

### Types to define:

```typescript
interface ScheduleDayType {
  id: string;
  labor_log_id: string;
  work_date: string;
  day_type: 'event' | 'setup' | 'training' | 'travel' | 'off';
  display_order: number;
}

interface ScheduleEntry {
  id: string;
  labor_log_id: string;
  rate_card_item_id: string | null;
  role_name: string;
  person_name: string | null;
  row_index: number;
  staff_group_id: string | null;
  needs_airfare: boolean;
  needs_hotel: boolean;
  needs_per_diem: boolean;
  day_rate: number;
  cost_rate: number;
  ot_hourly_rate: number;
  ot_cost_rate: number;
  gl_code: string | null;
  notes: string | null;
  day_entries: ScheduleDayEntry[];  // nested
}

interface ScheduleDayEntry {
  id: string;
  schedule_entry_id: string;
  work_date: string;
  hours: number;
  per_diem_override: boolean | null;
}

interface LaborRollupRow {
  role_name: string;
  quantity: number;
  total_days: number;
  total_standard_hours: number;
  total_ot_hours: number;
  day_rate: number;
  cost_rate: number;
  revenue_total: number;  // (total_days × day_rate × qty) + (ot_hours × ot_rate)
  cost_total: number;
  gp: number;
  gp_pct: number;
}
```

### Rollup calculation logic:

```
For each unique role (grouped by staff_group_id or role_name):
  quantity = count of schedule_entries with that role
  For each person in that role:
    For each day_entry:
      standard_hours = min(hours, 10)
      ot_hours = max(hours - 10, 0)
      day_revenue = day_rate + (ot_hours × ot_hourly_rate)
      day_cost = cost_rate + (ot_hours × ot_cost_rate)
    total_days = count of day_entries (each day worked = 1 day, regardless of hours)

  Total across all people in that role.
```

**IMPORTANT:** The rollup function computes everything client-side from the schedule data. It does NOT write to `labor_entries`. The Labor Log tab calls `getScheduleRollup()` and renders the result. The existing `labor_entries` table is untouched — it's still there for estimates that don't have a schedule (backward compatibility).

**Show me the service layer before proceeding to Step 3.**

---

## STEP 3: SCHEDULE TAB UI — The Grid

This is the big step. Create a new component for the Schedule tab.

### File: `src/components/schedule/ScheduleGrid.tsx`

This is the main grid component. It receives a `laborLogId` and renders the staffing grid.

### Layout:
```
┌─────────────────────────────────────────────────────────────────┐
│ [+ Add Staff]  [+ Add Date]                    Segment: LA (▼) │
├──────────┬──────┬───────┬───────┬───────┬───────┬──────┬───────┤
│          │      │ Jun 6 │ Jun 9 │Jun 17 │Jun 18 │Jun 19│ TOTAL │
│ Name     │ Role │ Setup │ Setup │ Event │ Event │Event │ Days  │
│          │      │  (▣)  │  (▣)  │  (▣)  │  (▣)  │ (▣)  │       │
├──────────┼──────┼───────┼───────┼───────┼───────┼──────┼───────┤
│ [____]   │ Mgr  │  10   │  10   │  10   │  10   │  10  │   5   │
│ [____]   │ VH   │  10   │  10   │  10   │  14*  │  10  │   5   │
│ [____]   │ VH   │       │  10   │  10   │  10   │  10  │   4   │
│ [____]   │ PS   │       │       │  10   │  10   │  10  │   3   │
│ [____]   │ PS   │       │       │  10   │  10   │  10  │   3   │
│ [____]   │ PS   │       │       │  10   │  10   │  10  │   3   │
├──────────┼──────┼───────┼───────┼───────┼───────┼──────┼───────┤
│ STAFF/DAY│      │   2   │   3   │   6   │   6   │  6   │       │
└──────────┴──────┴───────┴───────┴───────┴───────┴──────┴───────┘
│ Total Per Diem Days: 23  │  Total OT Hours: 4  │  Est Labor: $XX,XXX │
└──────────────────────────────────────────────────────────────────────┘
```

### Column headers:
- Each date column has TWO rows in the header: the date (e.g., "Jun 17") and a day type dropdown (Event/Setup/Training/Travel/Off)
- Day type selection colors the entire column with a subtle background:
  - Event = green-50
  - Setup = blue-50
  - Training = purple-50
  - Travel = gray-100
  - Off = white (no color)
- A "remove date" (×) button on hover of the column header

### Date generation:
- On load, auto-generate date columns from the segment's `start_date` to `end_date`
- If no dates set, show empty state with "Set event dates to generate schedule" message
- "+ Add Date" button opens a date picker to add individual dates outside the range (for non-consecutive schedules)

### Adding Staff (rows):
- "+ Add Staff" opens the same role picker modal/dropdown already built for Labor Log
- User picks a role (e.g., "Event Director") → new row appears with:
  - Name field: empty text input (editable inline)
  - Role: pre-filled from rate card
  - All date cells: empty
  - Travel flags: checkboxes in a row actions area (Airfare ✓, Hotel ✓, Per Diem ✓)
- Can add multiple rows of the same role
- Each row has action buttons: Duplicate (copy row with same role + same schedule pattern), Delete (with confirm)

### Column interactions:
- **Click date header number** → opens a small popover: "Fill all staff with 10 hours?" with Confirm/Cancel. This is the fast way to mark a full day — one click staffs everyone.
- **Day type dropdown** in column header → changes the day type for that date, recolors the column
- **"×" remove button** on hover of column header → removes that date column (with confirm if any cells have data)
- **"+ Add Date"** button in the header row → date picker to add a non-consecutive date

### Cell interaction:
- Click empty cell → fills with 10 (standard day)
- Click populated cell → select the number, type new value
- Right-click or double-click populated cell → clear it (set to empty/not working)
- Cells show just the number: "10", "12", "8"
- If hours > 10, show a small amber indicator or format like "10+4" to flag OT
- Cell background color intensity follows the column's day type color

### OT Business Rules (CRITICAL):
- Standard day = 10 hours minimum charge (even if working 8, bill 10)
- Hours over 10 = overtime at hourly rate
- OT hourly rate = day_rate / 10
- OT cost rate = cost_rate / 10
- Example: 14 hours = 1 × day_rate + 4 × (day_rate / 10) revenue
- The rollup must calculate this correctly

### Summary bar (below grid):
Live-updating totals:
- **Staff Count:** total unique rows
- **Total Person-Days:** sum of all cells that have hours
- **Total Per Diem Days:** same as person-days unless per_diem toggled off for specific rows
- **Total OT Hours:** sum of (hours - 10) for all cells where hours > 10
- **Estimated Labor Revenue:** calculated from rates
- **Estimated Labor Cost:** calculated from cost rates
- **Gross Profit / GP%:** revenue - cost

### Row actions column (far left or far right):
Per row: ✓ Airfare | ✓ Hotel | ✓ Per Diem | [Duplicate] | [Delete]
Keep this compact — use icon buttons or a small popover menu.

### Visual Design Specification (IMPORTANT — read this before building)

This grid needs to feel like a **premium enterprise tool**, not a basic HTML table. The users are coming from Excel (see their current spreadsheet — plain blue cells, no hierarchy, no visual rhythm). We want them to feel an immediate upgrade.

**Design direction: Clean, refined, data-dense but not cluttered. Think Notion meets Linear meets a high-end financial dashboard.**

**Grid styling:**
- Use a proper table with `border-collapse` and subtle 1px borders (gray-200 or slate-200)
- Alternating row backgrounds: white and slate-50 (very subtle zebra striping)
- Header row: sticky, slightly darker background (slate-100), font-weight 600, smaller text (text-xs uppercase tracking-wide)
- Date headers: two-line — date on top (e.g., "Jun 17"), day type badge below (small rounded pill: "Event" in green, "Setup" in blue, etc.)
- Column day-type colors should be VERY subtle — just enough tint to create visual rhythm across the grid. Think bg-green-50/50, bg-blue-50/50, bg-purple-50/50. Not saturated.
- The "Total Days" column on the right should have a slightly different background (slate-50) to visually separate it as a summary column
- The "Staff/Day" totals row at the bottom should have a top border (slate-300) and bold numbers

**Cell styling:**
- Cells should feel clickable — subtle hover state (bg-slate-100)
- Active/focused cell: ring-2 ring-blue-500 (clear focus indicator)
- Empty cells: just show the subtle column background color
- Filled cells: centered number, medium font weight
- **Heat map intensity based on hours:** Cell background opacity scales with hours worked. Use the column's day-type color but vary the intensity: 8 hours = light (opacity-30), 10 hours = medium (opacity-50), 12+ hours = strong (opacity-70). This creates an instant visual heat map of staffing density across the grid — you can see the busy days at a glance without reading a single number.
- OT cells (>10 hours): the number displays as "10+4" with the "+4" in amber-600 text, slightly smaller font. The amber OT indicator should be visually distinct from the heat map coloring.
- Cells transition smoothly on hover and focus (transition-colors duration-150)

**Name + Role columns (frozen left):**
- These two columns should be sticky/frozen on horizontal scroll (the grid will scroll horizontally for events with many dates)
- Name field: clean inline text input with no visible border until hover/focus — looks like plain text until you interact
- Role field: shows role name as a subtle badge/pill with the role category color (if applicable) or just clean text
- Left column area has a slightly different background to visually anchor it

**Row actions:**
- Show on row hover only — don't clutter the default view
- Small icon buttons: duplicate (copy icon), delete (trash icon), and a small popover/dropdown for Airfare/Hotel/Per Diem toggles
- Travel flag icons: small plane (✈), bed (🏨), utensils (🍽) — filled = active, outline = inactive. Toggle on click.
- Keep these SMALL — 16px icons, muted colors, don't compete with the data

**Summary bar below grid:**
- Full-width card with rounded corners, subtle shadow, white background
- Stats displayed in a horizontal row of metric cards: label on top (text-xs text-slate-500), value below (text-lg font-semibold)
- Key metrics: Staff Count | Person-Days | Per Diem Days | OT Hours | Est. Revenue | Est. Cost | GP | GP%
- GP% should be color-coded: green if >= 35%, amber if 25-35%, red if < 25%
- Numbers should animate/transition when they change (a subtle count-up effect)

**"+ Add Staff" and "+ Add Date" buttons:**
- Positioned above the grid, right-aligned
- Use shadcn Button variant="outline" with a plus icon
- Subtle but clearly discoverable

**Empty state (no dates set):**
- Centered illustration or icon (calendar with a subtle animation)
- "Set event dates to generate your staffing schedule"
- Clear CTA button: "Set Dates" that scrolls to or focuses the event date fields in the header

**Empty state (dates set but no staff):**
- Show the date column headers with day type dropdowns
- Placeholder row with dashed border: "Click + Add Staff to start building your schedule"

**Overall grid container:**
- Horizontal scroll with a subtle fade/shadow on the right edge when content overflows
- The grid should feel responsive — if there are 20 date columns, it scrolls smoothly
- Vertical scroll if many staff rows, with sticky header

**Typography:**
- Use the existing app font stack (whatever's in tailwind config)
- Grid data: text-sm (14px) for readability in dense data
- Headers: text-xs uppercase tracking-wider
- Summary bar: text-lg for values, text-xs for labels

**Color palette for day types (use these exact Tailwind classes):**
- Event: bg-emerald-50 border-emerald-200 text-emerald-700 (for the badge)
- Setup: bg-sky-50 border-sky-200 text-sky-700
- Training: bg-violet-50 border-violet-200 text-violet-700
- Travel: bg-slate-100 border-slate-300 text-slate-600
- Off: bg-white (no special color)

### State management:
- Load all data on mount: `getScheduleEntries(laborLogId)` + `getScheduleDayTypes(laborLogId)`
- Every cell change: debounced save via `upsertScheduleDayEntry()`
- Adding/removing staff: immediate save
- Day type changes: immediate save via `upsertScheduleDayType()`
- Use React state for the grid data, sync to Supabase on changes
- Debounce cell edits (300ms) to avoid hammering the DB on rapid clicks

---

## STEP 4: INTEGRATE SCHEDULE TAB INTO ESTIMATE BUILDER

### Modify: `src/pages/EstimateBuilderPage.tsx`

1. **Add Schedule as the first tab.** New tab order:
   ```
   Schedule | Labor Log | Production | Travel & Logistics | Creative | Access Fees & Insurance | Misc | Summary
   ```

2. **Schedule tab renders `<ScheduleGrid laborLogId={currentLaborLog.id} />`**
   - Uses the existing segment selector (the location/segment tabs above the main tabs)
   - Each segment gets its own schedule grid

3. **Labor Log tab becomes read-only when schedule data exists.**
   - Check: does this labor_log have any `schedule_entries`?
   - If YES: render the rollup from `getScheduleRollup(laborLogId)` — read-only table, no edit buttons
   - If NO: render the existing editable Labor Log (backward compatibility for older estimates)
   - Show a subtle banner on read-only Labor Log: "This labor log is driven by the Schedule tab. Edit the schedule to update labor."
   - **Nudge button:** The existing "+ Add Role" button on the Labor Log tab should still be visible when in read-only mode, but instead of adding a labor entry, it switches the user to the Schedule tab. Label it "+ Add Staff on Schedule" with a small calendar icon. This keeps the expected action discoverable but routes them to the right place.

4. **Summary tab continues to work.**
   - The Summary tab already reads labor totals. It should work regardless of whether data comes from manual `labor_entries` or from the schedule rollup.
   - If schedule data exists, Summary reads from the rollup calculation.
   - If no schedule data, Summary reads from `labor_entries` as before.

---

## STEP 5: VERIFY & TEST

### Manual testing checklist:
- [ ] Create a new estimate → Schedule tab is the default active tab
- [ ] Date columns auto-generate from segment start_date/end_date
- [ ] Add a date outside the range with "+ Add Date"
- [ ] Remove a date column
- [ ] Set day types on columns (Event, Setup, Training, Travel) — column colors update
- [ ] Add staff via role picker — row appears with correct role and rates
- [ ] Click empty cell → fills with 10
- [ ] Edit cell to a different value (e.g., 14)
- [ ] Clear a cell (double-click or right-click)
- [ ] OT indicator shows on cells > 10 hours
- [ ] Row totals (total days) update in real time
- [ ] Column totals (staff per day) update in real time
- [ ] Summary bar totals update in real time
- [ ] Duplicate a row — new row with same role and schedule pattern
- [ ] Delete a row — confirm dialog, then remove
- [ ] Toggle Airfare/Hotel/Per Diem flags per row
- [ ] Switch to Labor Log tab — see rolled-up data (read-only)
- [ ] Rollup correctly calculates: quantity, days, hours, OT hours, revenue, cost, GP
- [ ] Switch to Summary tab — labor totals reflect schedule data
- [ ] Reload page — all schedule data persists from Supabase
- [ ] Test with multiple segments — each segment has its own schedule grid
- [ ] Test an estimate with NO schedule data — Labor Log tab still works in edit mode (backward compat)

---

## CRITICAL BUSINESS RULES SUMMARY

1. **10-hour minimum:** A day worked is always billed as at least 10 hours, even if the person works 8.
2. **OT rate = day_rate / 10:** Consistent across all clients.
3. **Rates are snapshots:** When adding a role to the schedule, copy the rate from the rate card. Future rate card changes don't affect existing schedules.
4. **Per diem = per person per day worked:** If a person has hours on a day, per diem applies unless explicitly toggled off.
5. **Names are optional during estimate:** The Name field starts blank. It gets filled in during recap.
6. **Schedule drives Labor Log:** Once a schedule exists for a segment, the Labor Log is read-only and shows the rollup.
7. **Backward compatibility:** Estimates without schedule data still work with the manual Labor Log.
8. **Per-segment schedules:** Each segment (location or time period) has its own schedule grid, day types, and staff.

---

## FILES TO CREATE/MODIFY

| File | Action |
|------|--------|
| `scripts/supabase_schedule_schema.sql` | CREATE |
| `src/lib/schedule-service.ts` | CREATE |
| `src/components/schedule/ScheduleGrid.tsx` | CREATE |
| `src/components/schedule/ScheduleSummaryBar.tsx` | CREATE (optional — can be inline) |
| `src/pages/EstimateBuilderPage.tsx` | MODIFY (add Schedule tab, make Labor Log conditional) |
| `docs/ARCHITECTURE.md` | UPDATE (document schedule tables and data flow) |

---

## FUTURE (NOT THIS SPRINT)

These are noted for context but should NOT be built now:
- Pre-Event Work section (hourly admin roles below the grid)
- Drag-to-reorder rows
- Bulk fill: "fill all event days" button per row
- Right-click context menu on columns
- Schedule → Travel tab auto-population (airfare/hotel from flags)
- Print/export of the schedule grid
- Per diem rate from rate card (for now, use a hardcoded $50 or pull from rate card if easy)

### AI Intelligence Panel — Schedule Tab Context (Weeks 8-10)
When we wire up the AI panel, the Schedule tab will have schedule-specific nudges:
- **Staffing suggestion:** "For Mazda ride & drives with 5,000 attendees, you typically have 6-8 Product Specialists on event days. You currently have 4."
- **Coverage gap:** "March 15 only has 3 staff scheduled. Similar events average 8 staff on Day 1."
- **OT warning:** "Your Event Director is scheduled for 14 hours on March 16. That's 4 OT hours at $70/hr = $280 additional."
- **Per diem check:** "You have 5 staff across 4 event days = 20 per diem days. Budget: $1,000 at $50/day."
- **Historical pattern:** "Last Mazda event in LA used 2 setup days and 1 travel day. You only have event days scheduled."
- **Chat commands:** "Staff this like the Mazda event in LA last March" → AI pre-fills grid from historical data

These nudges are noted here so the grid design accommodates them visually (the AI panel is already in the 70/30 layout), but the actual AI logic is a separate sprint.
