# PHASE 2: WORKFLOW REFINEMENT — Dave's Workflow Definitions
## Claude Code Build Instructions

**Sprint:** Workflow Refinement (Week 8-9)
**Source Document:** Dave M.'s `Estimator_Workflows.xlsx` (March 2026)
**Pattern:** Schema → Service Layer → UI → Verify
**Approach:** Incremental. Complete each step before moving to the next. Show work before proceeding.

---

## CONTEXT

Read `CLAUDE.md` for full project context. The Workflow Engine is already built — status state machine, version snapshots, approval routing, segment-level transitions, notification dispatch, and auth with roles. This sprint **refines** the workflow based on Dave's authoritative definitions. It does NOT rebuild the engine — it renames statuses, adds a two-phase approval chain, introduces new roles/permissions, and stubs the client review portal.

Dave confirmed: Office vs. Corporate events follow the **same workflow**. The only difference is the estimate template and profit calculation. Do NOT create separate workflow paths.

---

## STEP 1: STATUS RENAME & NEW TERMINAL STATES

### 1a. Update the status enum

The current status values in the codebase are:
```
draft → review → approved → active → recap → invoiced → complete
```

Rename to match Dave's definitions:
```
pipeline → estimate → in_review → active → recap → invoiced
```

Terminal statuses (new):
```
lost, cancelled
```

**Mapping:**
| Old Value | New Value | Notes |
|-----------|-----------|-------|
| `draft` | `estimate` | Where estimate building happens |
| `review` | `in_review` | Two-phase: internal approval + client review |
| `approved` | REMOVE | Approval is a gate within `in_review`, not a separate status |
| `active` | `active` | No change |
| `recap` | `recap` | No change |
| `invoiced` | `invoiced` | Now the true terminal status |
| `complete` | REMOVE | `invoiced` is the final stage |
| (new) | `lost` | Terminal — opportunity lost |
| (new) | `cancelled` | Terminal — event cancelled |

### 1b. Update the state machine transitions

```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  pipeline: ['estimate', 'lost', 'cancelled'],
  estimate: ['in_review', 'lost', 'cancelled'],
  in_review: ['active', 'estimate'],  // active = client approved; estimate = sent back
  active: ['recap'],
  recap: ['invoiced'],
  // invoiced, lost, cancelled = terminal, no outbound transitions
};
```

**Key change:** There is no longer a separate `approved` status between `in_review` and `active`. The In Review phase contains TWO gates:
1. Internal approval (AM first, then executive if over threshold)
2. Client approval (estimate PDF sent to client, client approves or requests changes)

Once BOTH gates are passed, status moves directly to `active`.

If the client requests changes, status goes back to `estimate`.

### 1c. Database migration

Update `labor_logs.status` column:
```sql
-- Update existing records
UPDATE labor_logs SET status = 'estimate' WHERE status = 'draft';
UPDATE labor_logs SET status = 'in_review' WHERE status = 'review';
UPDATE labor_logs SET status = 'invoiced' WHERE status = 'complete';
-- Remove 'approved' by moving to appropriate state
UPDATE labor_logs SET status = 'active' WHERE status = 'approved';

-- Update estimates.status if it exists as a column (check first)
UPDATE estimates SET status = 'estimate' WHERE status = 'draft';
UPDATE estimates SET status = 'in_review' WHERE status = 'review';
UPDATE estimates SET status = 'invoiced' WHERE status = 'complete';
UPDATE estimates SET status = 'active' WHERE status = 'approved';
```

Also update any status values stored in:
- `estimate_versions.status_at_snapshot`
- `status_transitions.from_status` and `to_status`
- `approval_requests.status` (if it stores estimate status)

**Show the SQL migration before running it. Wait for confirmation.**

### 1d. Update all UI status references

Search the entire codebase for the old status strings and update:
- `SegmentTransitionBar` — button labels, transition logic
- `SegmentStatusBadge` — color mapping, label text
- `EstimateStatusBar` — progress track labels
- `workflow-service.ts` — `VALID_TRANSITIONS`, `canTransition()`
- `segment-status-service.ts` — transition rules, edit permission checks
- `notification-service.ts` — dispatch triggers
- Estimates list page — filter tabs, status counts
- Version history panel — status labels in snapshots
- Any TypeScript types/enums for status values

**Badge color mapping (update):**
| Status | Badge Colors |
|--------|-------------|
| `pipeline` | `bg-slate-100 text-slate-600 border-slate-300` |
| `estimate` | `bg-gray-100 text-gray-700 border-gray-300` |
| `in_review` | `bg-amber-100 text-amber-800 border-amber-300` |
| `active` | `bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300` |
| `recap` | `bg-violet-100 text-violet-800 border-violet-300` |
| `invoiced` | `bg-green-100 text-green-800 border-green-300` |
| `lost` | `bg-red-100 text-red-700 border-red-300` |
| `cancelled` | `bg-orange-100 text-orange-700 border-orange-300` |

### Verify Step 1

- [ ] All old status strings replaced — search for `'draft'`, `'review'`, `'approved'`, `'complete'` and confirm zero remaining references (except in version history snapshots, which are historical and should NOT be migrated)
- [ ] SegmentTransitionBar shows correct button labels for each status
- [ ] Estimates list filter tabs show new status names with counts
- [ ] Status bar in builder shows the updated progression
- [ ] App compiles with no type errors

---

## STEP 2: TWO-PHASE APPROVAL CHAIN

### The Business Rule

When a segment is submitted for review (status → `in_review`), TWO approval gates must be passed:

**Gate 1: Internal Approval**
- AM (account_manager role) approves first — REQUIRED for all estimates
- If segment's estimated revenue ≥ configurable threshold (default $50,000), an executive must ALSO approve
- Both approvals are recorded in `approval_requests`

**Gate 2: Client Approval (stub for now)**
- After internal approval passes, the estimate PDF would be sent to the client
- Client reviews and approves online, or requests changes
- THIS SPRINT: Stub this as a manual toggle — "Mark Client Approved" button visible after internal approval passes. Full client portal is a future sprint.

### 2a. Update `approval_requests` table

Add a column to distinguish approval phases:
```sql
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS approval_phase TEXT DEFAULT 'internal';
-- Values: 'internal', 'client'
-- 'internal' = AM/executive approval
-- 'client' = client sign-off (stub for now)
```

### 2b. Update approval logic in `workflow-service.ts`

```typescript
// When submitting for review:
async function submitForReview(laborLogId: string, userId: string) {
  // 1. Create approval_request with phase='internal'
  // 2. Determine if threshold is met → set threshold_triggered flag
  // 3. Notify AM(s) assigned to this client
  // 4. If threshold met, also notify executives
}

// When AM approves:
async function approveInternal(approvalId: string, reviewerId: string, notes?: string) {
  // 1. Record AM approval
  // 2. Check if threshold requires executive approval
  //    - If yes and no executive has approved yet → stay in_review, notify executives
  //    - If no threshold OR executive already approved → internal gate passed
  // 3. When internal gate passes:
  //    - Create a new approval_request with phase='client'
  //    - Show "Pending Client Approval" state in UI
  //    - (Future: auto-send PDF to client)
}

// Stub: Manual client approval
async function approveClient(approvalId: string, userId: string, notes?: string) {
  // 1. Record client approval
  // 2. Transition segment status from in_review → active
  // 3. Notify creator and AM that event is now active
}
```

### 2c. Update ApprovalBanner component

The banner in the Estimate Builder should show the current approval state:

**State: Awaiting AM Approval**
> "Submitted for review. Awaiting Account Manager approval."
> [Approve] [Send Back] — visible to AM and Executive roles

**State: Awaiting Executive Approval (threshold)**
> "AM approved. Requires executive approval (estimate ≥ $50K threshold)."
> [Approve] [Send Back] — visible to Executive and Admin roles only

**State: Awaiting Client Approval**
> "Internally approved. Pending client approval."
> [Mark Client Approved] [Client Requested Changes] — visible to AM, Executive, Admin
> (Future: this becomes automatic via client portal)

**State: Sent Back**
> "Changes requested. [Notes from reviewer]. Edit and resubmit."
> Status returns to `estimate`.

### 2d. Add configurable threshold

Store the approval threshold as a system setting:
```sql
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

INSERT INTO system_settings (key, value) VALUES
  ('approval_threshold', '{"amount": 50000, "currency": "USD"}')
ON CONFLICT (key) DO NOTHING;
```

Read threshold from this table in the approval logic (not hardcoded).

### Verify Step 2

- [ ] Submit a $30K estimate → AM approval only required, no executive gate
- [ ] Submit a $60K estimate → AM approval required, then executive approval required
- [ ] After both internal approvals, banner shows "Pending Client Approval"
- [ ] "Mark Client Approved" transitions to active
- [ ] "Client Requested Changes" returns to estimate status with notes
- [ ] "Send Back" at any internal stage returns to estimate with notes
- [ ] Approval history in Version History panel shows all phases

---

## STEP 3: ROLE-PERMISSION ENFORCEMENT

### 3a. Add `accounting` role to profiles

```sql
-- Add 'accounting' as a valid role option
-- Current roles: admin, cfo, operations, production_manager, account_manager
-- The profiles.role column is TEXT, so no enum migration needed
-- Just document that 'accounting' is now valid

-- Also add 'executive' as explicit role (currently using 'cfo' for this)
-- Mapping: cfo → executive permissions, operations/production_manager → event_lead permissions
```

### 3b. Create permission helper

Create `src/lib/permissions.ts`:

```typescript
type Permission =
  | 'create_event'
  | 'edit_estimate'
  | 'submit_for_review'
  | 'approve_internal'
  | 'approve_threshold'
  | 'edit_recap'
  | 'upload_recap_files'
  | 'create_invoice'
  | 'export_intacct'
  | 'modify_rate_cards';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  event_lead: ['create_event', 'edit_estimate', 'submit_for_review', 'edit_recap', 'upload_recap_files'],
  account_manager: ['create_event', 'edit_estimate', 'submit_for_review', 'approve_internal', 'edit_recap', 'upload_recap_files'],
  accounting: ['edit_recap', 'upload_recap_files', 'create_invoice', 'export_intacct'],
  executive: ['create_event', 'edit_estimate', 'submit_for_review', 'approve_internal', 'approve_threshold', 'edit_recap', 'upload_recap_files'],
  admin: ['create_event', 'edit_estimate', 'submit_for_review', 'approve_internal', 'approve_threshold', 'edit_recap', 'upload_recap_files', 'create_invoice', 'export_intacct', 'modify_rate_cards'],
};

// Map existing DB roles to permission roles
const ROLE_MAPPING: Record<string, string> = {
  admin: 'admin',
  cfo: 'executive',
  operations: 'event_lead',
  production_manager: 'event_lead',
  account_manager: 'account_manager',
  accounting: 'accounting',
};

export function hasPermission(dbRole: string, permission: Permission): boolean {
  const mappedRole = ROLE_MAPPING[dbRole] || dbRole;
  return ROLE_PERMISSIONS[mappedRole]?.includes(permission) ?? false;
}

export function canApprove(dbRole: string, isOverThreshold: boolean): boolean {
  if (isOverThreshold) {
    return hasPermission(dbRole, 'approve_threshold');
  }
  return hasPermission(dbRole, 'approve_internal');
}
```

### 3c. Wire permissions into existing UI

- **SegmentTransitionBar**: Show/hide action buttons based on `hasPermission()`
- **ApprovalBanner**: Show approve/reject only to roles with `approve_internal` or `approve_threshold`
- **Rate Card page**: Edit controls only visible to `modify_rate_cards` permission
- **Estimates list**: Create button gated on `create_event`
- **Recap fields**: Editable only for `edit_recap` permission

**Important:** Keep this lightweight. Use the `hasPermission()` helper in component render logic. Do NOT add middleware or route-level permission checks yet — that's overengineering for the current user base.

### Verify Step 3

- [ ] Login as account_manager → can submit for review, can approve (first line), cannot approve over-threshold
- [ ] Login as operations → can create and edit, cannot approve
- [ ] Login as admin → can do everything
- [ ] Login as accounting → can only see/edit recap and invoice actions
- [ ] Buttons that a user can't use are hidden (not just disabled)

---

## STEP 4: TERMINAL STATUSES (Lost / Cancelled)

### 4a. Add to SegmentTransitionBar

When a segment is in `pipeline` or `estimate` status, show a secondary action menu (three-dot or dropdown) with:
- "Mark as Lost"
- "Cancel Event"

Both require a confirmation dialog with required reason/notes field.

### 4b. Update UI for terminal states

- Terminal status segments show as muted/grayed in the segment selector
- Badge uses red (lost) or orange (cancelled) coloring
- Segment is fully read-only (no edit actions)
- No outbound transitions from terminal statuses
- Estimates list shows Lost/Cancelled in filter tabs

### 4c. Transition logic

```typescript
// In workflow-service.ts or segment-status-service.ts:
// Lost and Cancelled create a version snapshot (for audit) but do NOT
// trigger approval workflows. They bypass directly to terminal state.
// Require a reason string.
```

### Verify Step 4

- [ ] Can mark a Pipeline segment as Lost with required reason
- [ ] Can mark an Estimate segment as Cancelled with required reason
- [ ] Cannot mark Active/Recap/Invoiced segments as Lost or Cancelled
- [ ] Lost/Cancelled segments are fully locked and muted
- [ ] Version history shows the terminal transition with reason
- [ ] Filter tabs on estimates list show Lost and Cancelled counts

---

## STEP 5: PIPELINE STATUS BEHAVIOR

Dave defined Pipeline as: "Basic event info (name, details). Does not need an estimate or labor log at this point."

### 5a. Pipeline is the new default status

When creating a new estimate, the first segment starts in `pipeline` status (not `estimate`/`draft`).

### 5b. Pipeline UI behavior

In Pipeline status:
- Event header fields are editable (name, client, type, attendance, dates)
- Tabs are visible but show an empty state: "Start building this estimate to see labor and line items"
- A prominent "Start Estimate" button transitions the segment to `estimate` status
- The Schedule tab, Labor Log tab, and all line item tabs are read-only/empty until `estimate` status

### 5c. Notifications on Pipeline creation

When a new event is created in Pipeline:
- Notify the event creator (confirmation)
- Notify the AM responsible for the client account
- Notification includes a link to the event record

### Verify Step 5

- [ ] New estimates start in Pipeline
- [ ] Pipeline shows event header but tabs are empty with prompt
- [ ] "Start Estimate" moves to Estimate status and unlocks tabs
- [ ] Notifications sent on creation

---

## STEP 6: UPDATE CLAUDE.md

After all changes are verified, update `CLAUDE.md` to reflect:

1. New status lifecycle: Pipeline → Estimate → In Review → Active → Recap → Invoiced (+ Lost, Cancelled)
2. Two-phase approval (internal AM/exec + client)
3. Role-permission model with 5 roles and permission matrix
4. Pipeline as default creation status
5. Client review portal noted as stub (future sprint)
6. Dave credited as workflow definition author

---

## WHAT NOT TO DO IN THIS SPRINT

- Do NOT build the full client review portal — stub with manual "Mark Client Approved" button
- Do NOT build email notifications to clients — in-app only for now
- Do NOT build Monday.com integration — noted as future, event creation stays in-app
- Do NOT rename the database role values in `profiles.role` — use the mapping layer in `permissions.ts` instead. Renaming roles would require migrating all existing user records and auth tokens.
- Do NOT build receipt/file upload yet — that's the Recap Enhancement sprint
- Do NOT build Intacct GL export — that's a later phase
- Do NOT over-engineer the permission system — simple function check, not middleware
