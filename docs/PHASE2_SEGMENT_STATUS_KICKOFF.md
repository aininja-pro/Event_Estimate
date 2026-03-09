# PHASE 2: SEGMENT-LEVEL STATUS & ACTIVE/RECAP MODE
## Claude Code Build Instructions

**Context:** The workflow engine is built — status state machine, version history, approval banners, lock behavior. But right now the entire estimate locks when Active. This sprint adds per-segment status tracking and unlocks the fields that need to be editable during Active and Recap phases. This is the "Event Management" capability — built as a mode on the existing Estimate Builder page, not a separate page.

**Pattern:** Schema → Service Layer → UI → Verify
**Approach:** Incremental. Complete each step before moving to the next.

---

## THE PROBLEM

When an estimate has multiple segments (e.g., a 12-month stadium program or a multi-city tour), each segment moves through the lifecycle independently. January might be invoiced while March is in recap and June is still being estimated. Right now the entire estimate has one status and one lock state. We need per-segment status.

Also: when a segment is Active, staff names need to be assignable on the schedule grid. When a segment is in Recap, actuals need to be entered alongside the original estimates. The current "locked" state is too rigid — it needs to be smart about what's editable based on the segment's specific status.

---

## WHAT NOT TO DO

- Do NOT create a separate Event Manager page — this all lives on the existing Estimate Builder
- Do NOT change the estimate-level status bar or version history — those stay as-is
- Do NOT build change order forms yet — just the "Request Change Order" button that changes segment status
- Do NOT build receipt/document upload — that's a future sprint
- Do NOT build notifications — future sprint
- Do NOT remove or modify the existing workflow-service.ts status transition logic — extend it

---

## STEP 1: DATABASE SCHEMA

Create `scripts/supabase_segment_status_schema.sql`.

### Changes:

```sql
-- Add status field to labor_logs (segments)
ALTER TABLE labor_logs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' 
  CHECK (status IN ('draft', 'review', 'approved', 'active', 'recap', 'invoiced', 'complete'));

-- Add segment-level activity tracking
-- (The existing estimate_versions table handles estimate-level snapshots.
--  This tracks segment-specific status changes.)
CREATE TABLE IF NOT EXISTS segment_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  action TEXT NOT NULL,  -- 'status_change', 'name_assigned', 'actuals_entered', 'note_added'
  from_status TEXT,
  to_status TEXT,
  changed_by TEXT DEFAULT 'Current User',
  comment TEXT,
  metadata JSONB,  -- flexible storage for action-specific data
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Actuals tracking for recap phase
-- One row per labor entry or line item, storing actual vs estimated
CREATE TABLE IF NOT EXISTS recap_actuals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  
  -- Reference to what this actual is for (one of these will be set)
  labor_entry_id UUID REFERENCES labor_entries(id) ON DELETE CASCADE,
  schedule_entry_id UUID REFERENCES schedule_entries(id) ON DELETE CASCADE,
  line_item_id UUID REFERENCES estimate_line_items(id) ON DELETE CASCADE,
  
  -- Actual values
  actual_quantity DECIMAL(10,2),
  actual_days DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  actual_unit_cost DECIMAL(10,2),
  actual_total DECIMAL(10,2),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_segment_activities_labor_log ON segment_activities(labor_log_id);
CREATE INDEX IF NOT EXISTS idx_segment_activities_estimate ON segment_activities(estimate_id);
CREATE INDEX IF NOT EXISTS idx_recap_actuals_labor_log ON recap_actuals(labor_log_id);
CREATE INDEX IF NOT EXISTS idx_recap_actuals_estimate ON recap_actuals(estimate_id);

-- Triggers
CREATE TRIGGER IF NOT EXISTS recap_actuals_updated_at BEFORE UPDATE ON recap_actuals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE segment_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recap_actuals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to segment_activities" ON segment_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to recap_actuals" ON recap_actuals FOR ALL USING (true) WITH CHECK (true);
```

### Key design decisions:
- **Status lives on `labor_logs` table** — segments ARE labor_logs. No new table needed.
- **`segment_activities`** tracks per-segment actions separately from estimate-level version history.
- **`recap_actuals`** is a separate table, not additional columns on existing tables. This preserves the original estimate numbers and makes variance calculation clean: `estimated - actual = variance`.
- **All segments default to 'draft'** — existing data gets the default automatically.

**Show me the SQL before running it.**

---

## STEP 2: SERVICE LAYER

Create `src/lib/segment-status-service.ts` — manages segment lifecycle.

### Functions:

```typescript
// --- Segment Status Transitions ---
getSegmentStatus(laborLogId: string): Promise<string>
transitionSegmentStatus(laborLogId: string, toStatus: string, comment?: string): Promise<void>
// Validates transition is allowed, updates status, logs activity
// Valid transitions:
//   draft → review
//   review → approved | draft (send back)
//   approved → active | draft (reopen - requires reason)
//   active → recap
//   recap → invoiced | active (reopen)
//   invoiced → complete

getSegmentActivities(laborLogId: string): Promise<SegmentActivity[]>

// --- Estimate-Level Status Computation ---
computeEstimateStatus(estimateId: string): Promise<string>
// Rules:
//   If ANY segment is 'draft' or 'review' → estimate is 'draft' (still being built)
//   If ALL segments are 'approved' → estimate is 'approved'
//   If ANY segment is 'active' and none are 'draft' → estimate is 'active'
//   If ANY segment is 'recap' → estimate is 'active' (still in progress)
//   If ALL segments are 'invoiced' or 'complete' → estimate is 'complete'
// This UPDATES the estimate's status field to stay in sync.

// --- Edit Permission Checks ---
getSegmentEditRules(segmentStatus: string): SegmentEditRules
// Returns which fields/sections are editable for a given segment status.
// See the rules table in the UI section below.

// --- Recap Actuals ---
getRecapActuals(laborLogId: string): Promise<RecapActual[]>
upsertRecapActual(actual: Partial<RecapActual>): Promise<RecapActual>
getVarianceReport(laborLogId: string): Promise<VarianceRow[]>
// Returns: { item_name, estimated_total, actual_total, variance, variance_pct }
```

### Types:

```typescript
interface SegmentActivity {
  id: string;
  labor_log_id: string;
  estimate_id: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  changed_by: string;
  comment: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

interface SegmentEditRules {
  schedule_hours: boolean;      // can edit hours in schedule grid cells
  schedule_names: boolean;      // can edit name field on schedule rows
  schedule_add_remove: boolean; // can add/remove staff rows
  schedule_dates: boolean;      // can add/remove date columns
  labor_log: boolean;           // can edit labor log (if manual mode)
  line_items: boolean;          // can edit non-labor tabs
  event_details: boolean;       // can edit estimate header fields
  notes: boolean;               // can edit notes
  actuals: boolean;             // can enter recap actuals
  names_required: boolean;      // names must be filled before advancing
}

interface RecapActual {
  id: string;
  estimate_id: string;
  labor_log_id: string;
  labor_entry_id: string | null;
  schedule_entry_id: string | null;
  line_item_id: string | null;
  actual_quantity: number | null;
  actual_days: number | null;
  actual_hours: number | null;
  actual_unit_cost: number | null;
  actual_total: number | null;
  notes: string | null;
}

interface VarianceRow {
  item_name: string;
  section: string;
  estimated_total: number;
  actual_total: number;
  variance: number;       // estimated - actual (positive = under budget)
  variance_pct: number;   // variance / estimated * 100
}
```

### Edit rules by segment status:

```typescript
const SEGMENT_EDIT_RULES: Record<string, SegmentEditRules> = {
  draft:    { schedule_hours: true,  schedule_names: true,  schedule_add_remove: true,  schedule_dates: true,  labor_log: true,  line_items: true,  event_details: true,  notes: true,  actuals: false, names_required: false },
  review:   { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: false, actuals: false, names_required: false },
  approved: { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: true,  actuals: false, names_required: false },
  active:   { schedule_hours: false, schedule_names: true,  schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: true,  actuals: false, names_required: false },
  recap:    { schedule_hours: false, schedule_names: true,  schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: true,  actuals: true,  names_required: true },
  invoiced: { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: false, actuals: false, names_required: false },
  complete: { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: false, actuals: false, names_required: false },
};
```

**Show me the service layer before proceeding.**

---

## STEP 3: SEGMENT STATUS UI

### 3A: Segment status badges on segment pills

Modify the segment tabs/pills that already exist (e.g., "San Diego (Primary)" | "July 2026").

Each segment pill now shows a small colored status badge:

```
San Diego (Primary) [● Active]  |  July 2026 [● Draft]  |  + Add Segment
```

Badge colors match the estimate-level status colors already used in the status bar:
- Draft = gray
- Review = amber
- Approved = blue
- Active = green
- Recap = purple
- Invoiced = teal
- Complete = slate

### 3B: Segment status transition controls

When a segment is selected, show a contextual action bar below the segment pills (or integrate into the existing status bar area). This bar shows:

- Current segment status as a label
- The available next action as a primary button:
  - Draft → "Submit for Review"
  - Review → "Approve" / "Send Back" (if user has permission)
  - Approved → "Mark Active"
  - Active → "Begin Recap"
  - Recap → "Mark Invoiced" (with validation: all names must be filled)
  - Invoiced → "Mark Complete"

Each transition opens a confirmation dialog with an optional comment field (reuse the pattern from the estimate-level workflow transitions).

On transition, call `transitionSegmentStatus()` then `computeEstimateStatus()` to keep the estimate-level status in sync.

### 3C: Contextual lock banner

Replace the current "Estimate is active and locked" banner with a segment-aware message:

- If current segment is Draft: no banner (fully editable)
- If Review: "This segment is under review. Editing is disabled."
- If Approved: "This segment is approved and locked. Request a change order to modify."
- If Active: "This segment is active. Staff names can be updated. Other fields are locked."
- If Recap: "This segment is in recap. Enter actual costs and assign staff names."
- If Invoiced/Complete: "This segment is invoiced and locked."

### 3D: Smart field locking

This is the critical part. Instead of the current blanket lock on all fields, use `getSegmentEditRules(segmentStatus)` to control what's editable per the rules table above.

**On the Schedule Grid:**
- When `schedule_names: true` but `schedule_hours: false` → Name fields are editable text inputs, but hour cells are grayed out and non-clickable. The grid visually shows which fields are live vs locked.
- When `names_required: true` (recap) → Empty name fields show a red border/indicator. The "Mark Invoiced" button is disabled until all names are filled. Show count: "3 of 8 names assigned"

**On non-labor tabs (Production, Travel, etc.):**
- When `line_items: false` → All fields disabled, add/remove buttons hidden
- When `actuals: true` (recap) → An "Actual" column appears next to the estimated amount. User enters the real cost. Variance auto-calculates inline.

**On the estimate header:**
- When `event_details: false` → All header fields are read-only (already implemented via current lock behavior)

---

## STEP 4: RECAP MODE

When a segment's status is "Recap", the UI shifts to support entering actuals.

### On the Schedule Grid:
- Name fields become editable with red borders if empty
- A summary line appears: "6 of 8 names assigned" with a progress indicator
- Hours cells show the estimated hours but are not editable
- Below each person's row (or in a slide-out), show: Estimated Days, Estimated Cost, Actual Days (editable), Actual Cost (editable)

### On non-labor tabs (Production, Travel, Creative, Access, Misc):
- Each line item gets an additional "Actual" column after the estimated total
- User enters actual cost
- A "Variance" column auto-calculates: Estimated - Actual
- Color code: green if under budget (positive variance), red if over budget (negative)

### On the Summary tab:
- Show two columns: "Estimated" and "Actual" side by side
- Variance row at the bottom of each section
- Overall variance summary: "Total Estimated: $142K | Total Actual: $138K | Under Budget: $4K (2.8%)"

### Validation before advancing to Invoiced:
- All staff names must be assigned on the schedule
- Show a validation summary: "Missing: 2 staff names, 3 actual costs not entered"
- Allow advancing with missing actuals (with a warning) but NOT with missing names (Dave's rule: "when they turn it in, we want to make sure there's a name there")

---

## STEP 5: ESTIMATE STATUS SYNC

### Modify the existing estimate-level status behavior:

The estimate's status field now COMPUTES from its segments rather than being manually set (except for single-segment estimates where the behavior stays the same as today).

Add a function that runs after every segment status change:

```
After segment transition:
  1. Call computeEstimateStatus(estimateId)
  2. If computed status differs from current estimate status:
     a. Update estimate status
     b. Create version snapshot (existing logic)
     c. Log activity
```

### Single-segment estimates:
For estimates with only one segment (95% of cases per Dave), the behavior is identical to today. The segment status and estimate status always match. The user sees the same status bar, same transition buttons. No visible difference.

### Multi-segment estimates:
The estimate-level status bar shows the computed status. But the user primarily manages status at the segment level via the segment pills. The estimate-level status bar becomes informational — "2 of 5 segments active, 1 in recap, 2 still in estimate."

---

## STEP 6: VERIFY & TEST

### Manual testing checklist:
- [ ] Existing single-segment estimates work exactly as before (no regression)
- [ ] Segment pills show status badges with correct colors
- [ ] Can transition a segment through the full lifecycle: Draft → Review → Approved → Active → Recap → Invoiced → Complete
- [ ] Lock banner updates per segment status
- [ ] In Active status: only name fields are editable on schedule grid
- [ ] In Recap status: name fields editable + actual cost entry appears on all tabs
- [ ] Names required validation prevents advancing from Recap to Invoiced
- [ ] Multi-segment estimate: each segment can be at a different status
- [ ] Multi-segment estimate: estimate-level status computes correctly from segment statuses
- [ ] Version history captures segment-level status changes
- [ ] Segment status transitions include optional comments
- [ ] Variance calculations show correctly on Summary tab during recap
- [ ] Cannot edit rates, hours, or structure on Active/Recap segments (only names and actuals)

---

## FILES TO CREATE/MODIFY

| File | Action |
|------|--------|
| `scripts/supabase_segment_status_schema.sql` | CREATE |
| `src/lib/segment-status-service.ts` | CREATE |
| `src/components/segments/SegmentStatusBadge.tsx` | CREATE |
| `src/components/segments/SegmentTransitionBar.tsx` | CREATE |
| `src/components/recap/RecapActualsColumn.tsx` | CREATE |
| `src/components/recap/VarianceSummary.tsx` | CREATE |
| `src/components/schedule/ScheduleGrid.tsx` | MODIFY (conditional field locking, name-required indicators) |
| `src/pages/EstimateBuilderPage.tsx` | MODIFY (segment status integration, lock rules, recap mode) |
| `src/lib/workflow-service.ts` | MODIFY (add computeEstimateStatus, extend transitions) |
| `docs/ARCHITECTURE.md` | UPDATE |
