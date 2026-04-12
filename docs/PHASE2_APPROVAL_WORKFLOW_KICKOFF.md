# Phase 2: Approval Workflow & Version Control — Kickoff Instructions

**Sprint:** Weeks 6-7 (Workflow Engine)
**Milestone Payment:** $20,000 due at completion (core engine milestone)
**Prerequisites:** Rate Card Engine ✅, Estimate Builder & Labor Log ✅

---

## CONTEXT

Read `CLAUDE.md` for full project context. This sprint builds the approval workflow and version control system on top of the existing Estimate Builder and Rate Card modules.

**What exists today:**
- `estimates` table with `status` column: `CHECK (status IN ('pipeline', 'draft', 'review', 'approved', 'active', 'recap', 'complete'))`
- `labor_logs` table (one per segment within an estimate)
- `labor_entries` table (individual role rows within a labor log)
- `estimate_line_items` table (non-labor sections)
- Estimate Builder UI with working CRUD — create, edit, save estimates to Supabase
- Rate Card Management with client-specific rates loaded from real MSA data
- Multi-segment support (labor logs represent both geographic locations AND time periods like "January 2026", "February 2026")

**What we're building now:**
1. Status state machine with transition rules
2. Version history with full JSON snapshots
3. Approval routing (AM review for all, executive review for $50K+)
4. Per-segment status tracking
5. Rollback capability to any previous version
6. Basic notification system (in-app first, email later)

---

## STEP 1: DATABASE SCHEMA

Create `scripts/supabase_workflow_schema.sql`. Run this AFTER the existing estimates schema is in place.

```sql
-- ============================================
-- ESTIMATE VERSIONS (full snapshot at each save)
-- ============================================
CREATE TABLE estimate_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot_json JSONB NOT NULL,  -- full estimate state: labor_logs, labor_entries, line_items, totals
  status_at_version TEXT NOT NULL,  -- what status the estimate was in when this version was created
  change_summary TEXT,  -- human-readable: "Added 2 labor entries to LA segment", "Changed status to Review"
  changed_by TEXT NOT NULL,  -- user who triggered the save
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estimate_id, version_number)
);

-- ============================================
-- APPROVAL REQUESTS
-- ============================================
CREATE TABLE approval_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES estimate_versions(id),
  requested_by TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT now(),
  reviewer TEXT,  -- assigned reviewer (NULL = unassigned, routed by rules)
  reviewed_by TEXT,  -- who actually reviewed
  reviewed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'recalled')),
  threshold_triggered TEXT,  -- e.g., '$50K+ executive review', 'standard AM review'
  notes TEXT,  -- reviewer comments (especially on rejection)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STATUS TRANSITIONS (audit log)
-- ============================================
CREATE TABLE status_transitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  transitioned_by TEXT NOT NULL,
  reason TEXT,  -- required for rejections and rollbacks
  version_id UUID REFERENCES estimate_versions(id),  -- version at time of transition
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SEGMENT STATUS (per-segment tracking per Dave's request)
-- ============================================
-- Add status column to labor_logs table
ALTER TABLE labor_logs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
  CHECK (status IN ('draft', 'active', 'recap', 'invoiced'));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_versions_estimate ON estimate_versions(estimate_id);
CREATE INDEX idx_versions_estimate_number ON estimate_versions(estimate_id, version_number);
CREATE INDEX idx_approvals_estimate ON approval_requests(estimate_id);
CREATE INDEX idx_approvals_status ON approval_requests(status);
CREATE INDEX idx_transitions_estimate ON status_transitions(estimate_id);
CREATE INDEX idx_labor_logs_status ON labor_logs(status);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER approval_requests_updated_at BEFORE UPDATE ON approval_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS (permissive for now — tighten in auth sprint)
-- ============================================
ALTER TABLE estimate_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to estimate_versions" ON estimate_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to approval_requests" ON approval_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to status_transitions" ON status_transitions FOR ALL USING (true) WITH CHECK (true);
```

**After creating the SQL file, show it to me before running it in Supabase.**

---

## STEP 2: WORKFLOW SERVICE LAYER

Create `src/lib/workflow-service.ts` — all workflow logic lives here. Keep it thin and readable.

### Status State Machine

The valid transitions are:

```
pipeline → draft         (user starts building the estimate)
draft → review           (user submits for approval)
review → approved        (reviewer approves)
review → draft           (reviewer sends back for revision — with required notes)
approved → active        (event goes live / execution begins)
active → recap           (event complete, entering actuals)
recap → complete         (recap reviewed and finalized)

// Special transitions
approved → draft         (unlock for editing — requires reason, creates change order context)
any → draft              (rollback — admin only, requires reason)
```

**Implement as a function:**

```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  pipeline: ['draft'],
  draft: ['review'],
  review: ['approved', 'draft'],
  approved: ['active', 'draft'],
  active: ['recap'],
  recap: ['complete'],
};

function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
```

### Core Functions

```typescript
// 1. Transition status (with validation)
async function transitionStatus(
  estimateId: string,
  toStatus: string,
  userId: string,
  reason?: string  // required for rejections and rollbacks
): Promise<{ success: boolean; error?: string }>

// 2. Create version snapshot
async function createVersionSnapshot(
  estimateId: string,
  userId: string,
  changeSummary?: string
): Promise<{ versionId: string; versionNumber: number }>

// 3. Get version history for an estimate
async function getVersionHistory(
  estimateId: string
): Promise<EstimateVersion[]>

// 4. Rollback to a specific version
async function rollbackToVersion(
  estimateId: string,
  versionId: string,
  userId: string,
  reason: string  // always required for rollback
): Promise<{ success: boolean; error?: string }>

// 5. Submit for approval (transition to review + create approval request)
async function submitForApproval(
  estimateId: string,
  userId: string
): Promise<{ approvalId: string; threshold: string }>

// 6. Review approval (approve or reject)
async function reviewApproval(
  approvalId: string,
  decision: 'approved' | 'rejected',
  reviewerId: string,
  notes?: string  // required for rejections
): Promise<{ success: boolean; error?: string }>

// 7. Get approval history for an estimate
async function getApprovalHistory(
  estimateId: string
): Promise<ApprovalRequest[]>

// 8. Update segment status (per-segment tracking)
async function updateSegmentStatus(
  laborLogId: string,
  toStatus: string,
  userId: string
): Promise<{ success: boolean; error?: string }>
```

### Version Snapshot Logic

When creating a snapshot, query the full estimate state and store as JSONB:

```typescript
async function buildSnapshot(estimateId: string): Promise<object> {
  // 1. Get estimate record
  // 2. Get all labor_logs for this estimate
  // 3. Get all labor_entries for each labor_log
  // 4. Get all estimate_line_items for this estimate
  // 5. Calculate totals (revenue, cost, GP)
  // 6. Return as a single JSON object
  return {
    estimate: { /* estimate fields */ },
    labor_logs: [
      {
        /* labor_log fields */,
        entries: [ /* labor_entries */ ]
      }
    ],
    line_items: [ /* estimate_line_items */ ],
    totals: {
      total_revenue: 0,
      total_cost: 0,
      gross_profit: 0,
      gross_margin_pct: 0
    },
    snapshot_at: new Date().toISOString()
  };
}
```

### Approval Routing Logic

```typescript
function determineApprovalThreshold(estimateTotal: number): string {
  if (estimateTotal >= 50000) {
    return '$50K+ executive review';
  }
  return 'standard AM review';
}
```

**Note:** For now, we are NOT implementing user authentication or role-based permissions. The `userId` / `changed_by` / `reviewed_by` fields will be plain text strings (e.g., "Dave", "Tatiana", "Derek"). We'll wire up real auth in a later sprint. The threshold logic is informational — it tags the approval request so the right person knows they need to look at it, but it does NOT enforce who can click approve. Enforcement comes with auth.

### Auto-Versioning Rules

Create a version snapshot automatically when:
- Status transitions (every `transitionStatus` call)
- User submits for approval
- Reviewer approves or rejects
- User explicitly saves (manual "Save Version" button)

Do NOT auto-version on every keystroke or field change. Only on deliberate actions.

---

## STEP 3: ESTIMATE STATUS UI

Modify the existing Estimate Builder page to show and manage status.

### Status Bar Component

Create `src/components/EstimateStatusBar.tsx` — a horizontal bar at the top of the Estimate Builder, above the estimate content.

**Visual design:**
- Horizontal pill/step indicator showing all statuses: Pipeline → Draft → Review → Approved → Active → Recap → Complete
- Current status highlighted (filled color). Past statuses shown as completed (checkmark). Future statuses grayed out.
- Color coding: Draft = gray, Review = yellow/amber, Approved = green, Active = blue, Recap = orange, Complete = green
- Next to the status bar: an action button for the valid next transition
  - In Draft: "Submit for Review" button
  - In Review: "Approve" and "Send Back" buttons
  - In Approved: "Mark Active" button
  - In Active: "Begin Recap" button
  - In Recap: "Complete" button

**Status-dependent behavior:**
- `draft`: Fully editable. All fields, labor logs, and line items can be modified.
- `review`: Read-only for the submitter. Reviewer sees Approve / Reject buttons.
- `approved`: Locked. No edits. Show a prominent "Locked — Approved" banner. If someone needs to edit, they must click "Unlock for Editing" which transitions back to Draft with a required reason (this is a change order scenario).
- `active`: Locked. Same as approved but with "Active" badge.
- `recap`: Partially editable — only recap-specific fields are active (actuals, staff names on labor entries). Original estimate data is read-only for comparison.
- `complete`: Fully locked. Archive view only.

### Segment Status Badges

In the segment tabs (the labor log tabs), add a small status badge next to each segment name showing its individual status (Draft / Active / Recap / Invoiced). These are independent of the overall estimate status per Dave's requirement.

Example: An estimate might be "Active" overall, but the "January 2026" segment is already "Invoiced" while "March 2026" is still in "Active."

---

## STEP 4: VERSION HISTORY PANEL

Create `src/components/VersionHistoryPanel.tsx` — a slide-out panel or collapsible sidebar on the Estimate Builder page.

### Trigger
Add a "History" button (use lucide `History` icon) in the Estimate Builder header, next to the status bar. Clicking it opens the version history panel.

### Panel Content

**Version list** — reverse chronological (newest first). Each entry shows:
- Version number (v1, v2, v3...)
- Timestamp (formatted: "Feb 27, 2026 at 3:45 PM")
- Who made the change
- Change summary text
- Status at that version
- Badge: "Current" for the latest version

**Clicking a version** expands it to show:
- Full change summary
- Status transition (if any): "Draft → Review"
- Action buttons: "View Snapshot" and "Rollback to This Version"

### View Snapshot
Opens a read-only modal or overlay showing the estimate as it existed at that version. Use the `snapshot_json` to render a simplified read-only view — doesn't need to be the full builder UI, just a clean summary showing:
- Estimate header info
- Labor logs with entries (role, qty, days, rate, total per entry)
- Line items by section
- Totals

### Rollback
"Rollback to This Version" button:
1. Shows a confirmation dialog: "This will revert the estimate to Version X. A new version will be created to record this rollback. Are you sure?"
2. Requires a reason field (text input, required)
3. On confirm: calls `rollbackToVersion()`, which restores the snapshot data and creates a new version entry documenting the rollback
4. Refreshes the page to show the restored state

---

## STEP 5: APPROVAL WORKFLOW UI

### Submit for Review Flow

When user clicks "Submit for Review" from Draft status:
1. System calculates estimate total
2. Determines threshold: standard AM review or $50K+ executive review
3. Shows confirmation dialog:
   - "Submit this estimate for review?"
   - Shows total: "$42,350"
   - Shows routing: "Standard AM Review" or "$50K+ Executive Review Required"
4. On confirm: creates version snapshot, creates approval request, transitions status to Review
5. Estimate becomes read-only

### Review Flow

When a reviewer opens an estimate in Review status:
1. Status bar shows "Review" as active with yellow/amber highlight
2. Show a review banner at top: "This estimate is awaiting your review. Submitted by [name] on [date]."
3. Two action buttons in the banner: "Approve" (green) and "Send Back for Revision" (red/orange)
4. **Approve:** Confirmation dialog → transitions to Approved → creates version snapshot → estimate locks
5. **Send Back:** Requires notes field (what needs to change) → transitions back to Draft → creates version snapshot with rejection notes → estimate unlocks for editing

### Approval History

Add an "Approvals" tab or section in the Version History panel showing:
- All approval requests for this estimate
- Status of each (Pending, Approved, Rejected, Recalled)
- Who requested, who reviewed, when, and any notes
- Which threshold was triggered

---

## STEP 6: ESTIMATES LIST PAGE UPDATES

Update the existing Estimates List page (`src/pages/EstimatesPage.tsx` or similar) to reflect workflow status.

### Status Column
Add a status badge column to the estimates table. Color-coded to match the status bar:
- Pipeline: light gray
- Draft: gray
- Review: yellow/amber
- Approved: green
- Active: blue
- Recap: orange
- Complete: dark green

### Filtering
Add status filter tabs or dropdown above the table: All | Pipeline | Draft | Review | Approved | Active | Recap | Complete

With counts next to each: "Draft (4) | Review (2) | Approved (1) | Active (3)"

### Quick Actions
In the table row, add quick action buttons based on current status:
- Draft → "Submit" button
- Review → "Review" button
- Approved → "Mark Active" button

---

## STEP 7: VERIFICATION

After building, verify each of these works:

1. **State machine enforcement:** Try to transition from Draft directly to Approved — should fail. Try Draft → Review → Approved — should succeed.
2. **Version creation:** Save an estimate, check that `estimate_versions` table has a new row with correct `snapshot_json`.
3. **Version history UI:** Open the history panel, see versions listed. Click one, see the snapshot.
4. **Rollback:** Create 3 versions (add entries, change entries, remove entries). Rollback to version 1. Verify the estimate data matches version 1. Verify a new version 4 is created documenting the rollback.
5. **Submit for review:** Submit a $30K estimate — should show "Standard AM Review." Submit a $60K estimate — should show "$50K+ Executive Review Required."
6. **Approve/Reject:** From Review status, approve → verify status changes and estimate locks. From Review status, reject with notes → verify status goes back to Draft and notes are visible.
7. **Segment status:** Change one segment to "Active" while others stay "Draft." Verify they track independently.
8. **Estimates list:** Verify status badges show, filters work, quick actions route correctly.

---

## WHAT NOT TO DO IN THIS SPRINT

- Do NOT add user authentication or login — `userId` is a plain text string for now
- Do NOT build email notifications yet — in-app only (the status changes and approval requests are visible in the UI)
- Do NOT build change order management — that's a separate sprint (Weeks 10-11)
- Do NOT build the recap entry flow — that's Weeks 10-11 (recap just needs the status transition to work)
- Do NOT build PDF generation — that's Weeks 10-11
- Do NOT add real-time subscriptions (Supabase realtime) — simple refresh/refetch pattern is fine
- Do NOT over-engineer permissions — no role-based access control yet. Anyone can approve, anyone can submit. We'll lock it down when auth is added.
- Do NOT change any Rate Card Management functionality
- Do NOT refactor the Estimate Builder's core editing UI — only ADD the status bar, version panel, and approval components on top of what exists

---

## FILES TO CREATE/MODIFY

| File | Action |
|------|--------|
| `scripts/supabase_workflow_schema.sql` | CREATE (new tables + labor_logs ALTER) |
| `src/lib/workflow-service.ts` | CREATE (state machine, versioning, approvals) |
| `src/components/EstimateStatusBar.tsx` | CREATE (status pill bar + action buttons) |
| `src/components/VersionHistoryPanel.tsx` | CREATE (slide-out version history) |
| `src/components/ApprovalBanner.tsx` | CREATE (review banner with approve/reject) |
| `src/components/VersionSnapshotModal.tsx` | CREATE (read-only snapshot view) |
| `src/pages/EstimateBuilderPage.tsx` | MODIFY (integrate status bar, version panel, approval flow, edit locking) |
| `src/pages/EstimatesPage.tsx` | MODIFY (add status badges, filters, quick actions) |
| `docs/ARCHITECTURE.md` | UPDATE (document workflow tables, state machine, versioning) |

That's it. Nine files. Keep it simple.
