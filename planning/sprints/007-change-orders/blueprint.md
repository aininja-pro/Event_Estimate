# Blueprint: Change Orders — Outputs Sprint (Part 2)

## What This Is

Add two modes for handling scope changes on approved/active estimates: a lightweight "Request Edit" that unlocks for quick changes, and a formal "Create Change Order" that captures a numbered delta document. Both flows reuse the existing approval workflow and version snapshot infrastructure. The user chooses which mode fits the situation — no enforcement rules on when to use which.

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context, conventions, service layer patterns
- `planning/requirements-driveshop-change-orders.md` — full requirements
- `src/lib/workflow-service.ts` — version snapshots, approval chain, status transitions
- `src/lib/segment-status-service.ts` — per-segment transitions, edit rules
- `src/components/segments/SegmentTransitionBar.tsx` — where the buttons will live
- `src/components/VersionHistoryPanel.tsx` — where CO history will display
- `src/lib/estimate-service.ts` — estimate and labor CRUD for delta comparison

---

## Step 1: Database — Change Orders Table

Create migration script at `scripts/add_change_orders_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  co_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  baseline_version_id UUID REFERENCES estimate_versions(id),
  revised_version_id UUID REFERENCES estimate_versions(id),
  delta_summary JSONB DEFAULT '{}',
  baseline_total NUMERIC,
  revised_total NUMERIC,
  delta_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  UNIQUE(estimate_id, labor_log_id, co_number)
);

CREATE INDEX idx_change_orders_estimate ON change_orders(estimate_id);
CREATE INDEX idx_change_orders_labor_log ON change_orders(labor_log_id);

ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage change orders"
  ON change_orders FOR ALL
  USING (true) WITH CHECK (true);
```

The `delta_summary` JSONB stores the line-by-line comparison:

```json
{
  "added": [
    { "type": "labor", "role_name": "Vehicle Handler/ hr", "quantity": 4, "days": 2, "unit_rate": 330, "total": 2640 }
  ],
  "removed": [],
  "modified": [
    { "type": "labor", "role_name": "Production Director/ hr", "field": "days", "from": 4, "to": 6, "delta": 1400 }
  ],
  "net_delta": 4040
}
```

Show me the SQL before running it.

---

## Step 2: Change Order Service Layer

Create `src/lib/change-order-service.ts` following existing service layer patterns.

### Functions:

**`getChangeOrders(estimateId) → ChangeOrder[]`**
- Query `change_orders` where estimate_id matches, ordered by co_number ascending
- Join with profiles for created_by and approved_by names

**`getChangeOrdersForSegment(laborLogId) → ChangeOrder[]`**
- Query by labor_log_id, ordered by co_number ascending

**`getNextCONumber(estimateId, laborLogId) → number`**
- Query max co_number for this estimate + labor_log, return max + 1 (or 1 if none exist)

**`createChangeOrder(data) → ChangeOrder`**
- Insert with auto-assigned co_number from getNextCONumber
- Set status to 'draft'
- Record created_by from current user

**`computeDelta(baselineVersionId, currentEstimateState) → DeltaSummary`**

This is the core function. It compares a snapshot to the current state and produces the delta.

1. Fetch the baseline version snapshot from `estimate_versions` table (it's a full JSON snapshot)
2. Extract labor entries and line items from the baseline snapshot
3. Fetch current labor entries and line items from Supabase for this segment (fresh query)
4. Compare:

**Labor entries comparison:**
- Match by `rate_card_item_id` first, then by `role_name` as fallback
- If entry exists in current but not baseline → "added"
- If entry exists in baseline but not current → "removed"
- If entry exists in both but qty, days, or rate changed → "modified" with before/after values
- Compute dollar delta for each change

**Line items comparison:**
- Match by `rate_card_item_id` first, then by `item_name` + `section` as fallback
- Same added/removed/modified logic
- Compute dollar delta for each change

5. Sum all deltas for net_delta
6. Return the DeltaSummary object

**`submitChangeOrder(id) → ChangeOrder`**
- Compute the delta (call computeDelta with the baseline version and current state)
- Store delta_summary, baseline_total, revised_total, delta_amount
- Create a version snapshot of the current state as the revised version
- Set revised_version_id
- Update status to 'submitted'
- Trigger normal approval flow (call submitForApproval from workflow-service)

**`approveChangeOrder(id, approvedBy) → ChangeOrder`**
- Update status to 'approved', set approved_by and approved_at
- Transition the segment back to its pre-edit status (approved or active)

**`rejectChangeOrder(id) → ChangeOrder`**
- Update status to 'rejected'
- Rollback the segment to the baseline version (revert changes)
- Transition segment back to its pre-edit status

### Types (add to `src/types/workflow.ts` or create `src/types/change-order.ts`):

```typescript
export interface ChangeOrder {
  id: string
  estimate_id: string
  labor_log_id: string
  co_number: number
  description: string
  baseline_version_id: string | null
  revised_version_id: string | null
  delta_summary: DeltaSummary
  baseline_total: number | null
  revised_total: number | null
  delta_amount: number | null
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  created_by: string | null
  created_at: string
  approved_by: string | null
  approved_at: string | null
}

export interface DeltaSummary {
  added: DeltaItem[]
  removed: DeltaItem[]
  modified: DeltaModifiedItem[]
  net_delta: number
}

export interface DeltaItem {
  type: 'labor' | 'line_item'
  item_name: string
  section?: string
  quantity?: number
  days?: number
  unit_rate?: number
  total: number
}

export interface DeltaModifiedItem {
  type: 'labor' | 'line_item'
  item_name: string
  section?: string
  field: string
  from: number
  to: number
  delta: number
}
```

Show me the service file before proceeding.

---

## Step 3: Lightweight "Request Edit" Flow

### Button placement:

In `SegmentTransitionBar.tsx`, when the segment status is "approved" or "active", show a **"Request Edit"** button. Style it as a subtle/secondary button — not the primary action.

### Flow:

1. User clicks "Request Edit"
2. Modal opens with:
   - Text input: "Reason for edit" (required)
   - Confirm / Cancel buttons
3. On confirm:
   - Capture a version snapshot (call existing version snapshot logic from workflow-service)
   - Log the reason in the version snapshot's change_summary: "Reopened for editing: {reason}"
   - Transition the segment status back to "estimate" using `transitionSegmentStatus()`
   - The segment is now fully editable
4. User makes changes (normal Estimate Builder editing)
5. User clicks "Submit for Review" (existing button appears because segment is back in estimate status)
6. Normal approval flow kicks in

**No change order record is created.** The version history captures: "v5: Reopened for editing — Client requested rate adjustment" → "v6: Re-approved." That's the audit trail.

---

## Step 4: Formal "Create Change Order" Flow

### Button placement:

In `SegmentTransitionBar.tsx`, when the segment status is "approved" or "active", show a **"Create Change Order"** button alongside "Request Edit". Style it as a more prominent action.

### Flow:

1. User clicks "Create Change Order"
2. Modal opens with:
   - Auto-assigned CO number displayed: "Change Order CO-001"
   - Text area: "Description of scope change" (required)
   - Confirm / Cancel buttons
3. On confirm:
   - Call `createChangeOrder()` — records the CO with status 'draft'
   - Capture a version snapshot as the baseline (store the version ID on the CO record)
   - Transition the segment status back to "estimate"
   - Show a banner at the top of the Estimate Builder: "Change Order CO-001 in progress — {description}"
4. User makes changes (normal editing)
5. User clicks **"Submit Change Order"** (this replaces the normal "Submit for Review" button when a CO is in draft)
6. On submit:
   - Call `submitChangeOrder()` — computes delta automatically, stores delta_summary, creates revised version snapshot
   - A **Change Order Summary modal** appears showing the delta:
     ```
     Change Order CO-001: "Client added 2 days and 4 vehicle handlers"
     
     ADDED:
       + Vehicle Handler/ hr × 4 × 2 days × $330 = +$2,640
       + Hotel Nights × 4 × $200 = +$800
     
     MODIFIED:
       ~ Schedule extended from 4 to 6 days: +$1,400
     
     NET CHANGE: +$4,840
     Original: $80,000 → Revised: $84,840
     ```
   - User confirms submission
   - Normal approval flow triggers

7. Approval:
   - Approver sees the delta summary (not the full estimate)
   - On approve: CO status → 'approved', segment transitions back to approved/active
   - On reject: CO status → 'rejected', segment rolls back to baseline

### CO in-progress indicator:

While a change order is in draft (user is editing), show:
- A banner on the Estimate Builder: "Change Order CO-001 in progress"
- The SegmentStatusBadge could show "CO in progress" or a small CO icon
- The Estimates list page should reflect that a CO is pending

---

## Step 5: Change Order History in Version History Panel

### Extend the existing VersionHistoryPanel:

Add a "Change Orders" section or tab within the panel. Show:

**Change Order timeline:**
```
CO-003 — "Added catering for VIP reception"  [Approved]
  Net change: +$4,200  |  $88,040 → $92,240
  Created: Apr 5 by Dan  |  Approved: Apr 6 by Tad

CO-002 — "Extended schedule to 6 days"  [Approved]
  Net change: +$3,440  |  $84,600 → $88,040
  Created: Apr 2 by Dan  |  Approved: Apr 3 by Tad

CO-001 — "Client added 4 vehicle handlers"  [Approved]
  Net change: +$2,600  |  $82,000 → $84,600
  Created: Mar 28 by Dan  |  Approved: Mar 29 by Justin

Original Approved Estimate: $82,000
```

**Click a CO** to expand and see the full delta summary (added/removed/modified items).

**Running total line** at the top: "Original: $82,000 → Current: $92,240 (3 change orders, +$10,240)"

This gives Tad his "rev one" tracking — he can see exactly how the estimate evolved from the original bid to the current state.

---

## Step 6: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log
Add row: `Wk 11-12 | Change Orders: lightweight edit + formal CO with auto-delta, CO tracking in version history, per-segment CO numbering | PDF generation | Change orders complete`

### Supabase Tables
Add: `change_orders`

### Key Service Layers
Add: `change-order-service.ts` — Change order CRUD, delta computation, CO lifecycle

### Conventions
Add: "Change orders are per-segment. CO numbers are sequential per estimate × segment (CO-001, CO-002)."
Add: "Delta computation compares version snapshots — baseline (at CO creation) vs current state (at submission). Match entries by rate_card_item_id first, then by name."
Add: "Lightweight edit uses 'Request Edit' — no CO record, just version history. Formal change order uses 'Create Change Order' — produces a numbered CO with auto-computed delta."

---

## What NOT to Build

- Do not build change order enforcement rules (e.g., "changes over $5K require formal CO"). The user decides which mode to use.
- Do not build client-facing change order PDFs. The data is stored — PDF export is a separate sprint.
- Do not build CO rejection with counter-proposals. Simple approve/reject.
- Do not build multi-segment change orders. Each segment manages its own COs independently.
- Do not build automatic CO creation from recap variance. That's a future enhancement.
- Do not modify the existing approval workflow logic. Change orders route through the same three-gate approval chain.

---

## Build Order

1. **Step 1** — Database: create `change_orders` table. Show me the SQL before running.
2. **Step 2** — Change order service layer with delta computation. Show me `computeDelta` logic before proceeding — this is the critical function.
3. **Step 3** — Lightweight "Request Edit" flow. Show me the modal and confirm the segment transitions work.
4. **Step 4** — Formal "Create Change Order" flow. Show me the CO creation, the in-progress banner, the delta summary modal on submission.
5. **Step 5** — Change order history in the Version History panel. Show me the timeline view.
6. **Step 6** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1. Do not skip ahead.
