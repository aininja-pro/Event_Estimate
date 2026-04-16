# Blueprint: Client-Specific Approval Routing

## What This Is

Add a "Primary Approver" field per client in Rate Card Management settings. When an estimate is submitted for review, the approval routes to that client's designated approver instead of broadcasting to all account managers. One new column, one dropdown, one routing change.

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context, conventions
- `planning/requirements-driveshop-approval-routing.md` — full requirements
- `src/lib/workflow-service.ts` — `submitForApproval()` — this is where routing happens. Read it carefully to understand the current notification dispatch.
- `src/lib/notification-service.ts` — how notifications are dispatched to users/roles
- `src/lib/rate-card-service.ts` — client CRUD, understand how client settings are managed
- `src/pages/RateCardManagementPage.tsx` (or wherever the client settings panel lives) — where the dropdown will be added
- `src/components/segments/SegmentTransitionBar.tsx` — the "Submit for Review" button and confirmation modal

Also check: How does `submitForApproval()` currently determine who gets notified? Does it dispatch to a specific role, all users, or use some other pattern? The answer determines how much the routing logic needs to change.

---

## Step 1: Database — Add Primary Approver to Clients

Create migration: `scripts/migration_client_approver.sql`

```sql
ALTER TABLE clients ADD COLUMN primary_approver_id UUID REFERENCES profiles(id);

COMMENT ON COLUMN clients.primary_approver_id IS 'The designated internal approver (account manager) for estimates from this client. If NULL, approvals broadcast to all account_managers.';
```

One column, one FK. Show me the SQL before running.

---

## Step 2: Rate Card Service — Update Client Queries

### Modify `src/lib/rate-card-service.ts`:

**Update the client query** to include the approver profile when fetching client data. The existing `getClients()` or client fetch functions should join the approver profile:

```sql
clients(*, primary_approver:profiles!clients_primary_approver_id_fkey(id, display_name, email, role))
```

This gives you the approver's name and email alongside the client data.

**Add a function to get approver-eligible users:**

```typescript
export async function getApproverUsers(): Promise<Array<{ id: string; display_name: string; role: string }>> {
  // Query profiles where role is 'account_manager' or 'admin'
  // Return id, display_name, role
  // Order by display_name
}
```

**Add/update the client update function** to accept `primary_approver_id`:

```typescript
export async function updateClient(id: string, updates: { primary_approver_id?: string | null; ... }): Promise<Client>
```

Show me the updated service functions before proceeding.

---

## Step 3: Rate Card Management UI — Approver Dropdown

### Find the client settings panel in the Rate Card Management page.

There should be an area that shows client-level settings (agency fee %, third-party markup %, office payout %, etc.). Add the approver dropdown in this same area.

**UI:**

```
┌─────────────────────────────────────────────────┐
│ Client Settings — Mazda                          │
│                                                  │
│ Third Party Markup:  [ 5%    ]                   │
│ Agency Fee:          [ 10%   ]                   │
│ Office Payout:       [ 75%   ]                   │
│ Primary Approver:    [ Tad Smith ▼ ]   ← NEW    │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Dropdown behavior:**
- Populated from `getApproverUsers()` — shows users with account_manager or admin role
- Shows display_name in the dropdown
- First option: "— No assigned approver —" (sets primary_approver_id to null)
- On selection change, call `updateClient(clientId, { primary_approver_id: selectedUserId })`
- Subtle save indicator (checkmark flash) on success

**Styling:** Match the existing client settings fields. Same label style (text-[10px] uppercase), same input/select pattern. Use a shadcn Select or the existing ComboInput pattern if it fits.

Show me the dropdown rendering with real user data before proceeding.

---

## Step 4: Approval Routing — Wire the Approver

### Modify `src/lib/workflow-service.ts`:

In `submitForApproval()` (or wherever the approval request is created and notifications dispatched):

**Current behavior (read the code to confirm):** Likely dispatches a notification to all users with a certain role, or creates an approval_request without a specific assignee.

**New behavior:**

1. When creating the approval request, look up the estimate's client:
   ```typescript
   const estimate = await getEstimate(estimateId)
   const client = await getClient(estimate.client_id)  // or however client data is fetched
   ```

2. If `client.primary_approver_id` exists:
   - Set `assigned_to: client.primary_approver_id` on the approval_request (if the field exists — check the table schema)
   - Dispatch notification specifically to that user: `dispatchNotification(client.primary_approver_id, ...)`
   - Log: "Submitted to {approver_name} for review"

3. If `client.primary_approver_id` is null:
   - Fall back to existing behavior (broadcast to all account_managers or however it works today)
   - Log: "Submitted for review (no assigned approver)"

**Important:** Read the existing `submitForApproval` and `notification-service` code before making changes. The approval_requests table may or may not have an `assigned_to` field. If it doesn't, you may need to add one, or the routing may happen purely through the notification dispatch. Understand the current pattern first.

If `approval_requests` needs an `assigned_to` column:
```sql
ALTER TABLE approval_requests ADD COLUMN assigned_to UUID REFERENCES profiles(id);
```

Show me the routing logic change before proceeding.

---

## Step 5: Submission UI — Show Who It's Going To

### Modify `src/components/segments/SegmentTransitionBar.tsx`:

In the confirmation modal that appears when the user clicks "Submit for Review":

**Current:** Shows a reason/notes textarea and Confirm/Cancel buttons.

**Updated:** Add a line showing who the estimate will be routed to:

```
┌──────────────────────────────────────────┐
│ Submit for Review                         │
│                                          │
│ This will be sent to:                    │
│ 👤 Tad Smith (Mazda Account Manager)     │
│                                          │
│ Notes (optional):                        │
│ ┌──────────────────────────────────────┐ │
│ │                                      │ │
│ └──────────────────────────────────────┘ │
│                                          │
│              [Cancel]  [Submit]           │
└──────────────────────────────────────────┘
```

If no approver is assigned: show "This will be sent to all account managers for review."

**How to get the approver info:** The EstimateBuilderPage already has the estimate and client data loaded. Pass the approver name down to the SegmentTransitionBar as a prop, or fetch it when the modal opens.

---

## Step 6: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log
Add row: `Wk 13 | Client-Specific Approval Routing: primary_approver_id on clients, approver dropdown in rate card settings, targeted notification routing, submission modal shows assignee | Intacct integration | Approval routing complete`

### Conventions
Add: "Approval routing is client-specific. clients.primary_approver_id determines who receives the first-gate approval notification. Falls back to all account_managers if not set."

### New Columns
Add: `clients.primary_approver_id` (UUID FK to profiles, nullable)

---

## What NOT to Build

- Do not build per-estimate approver override. Dave said "it's always the same person" per client.
- Do not build client-specific approval thresholds. The global threshold in system_settings applies.
- Do not build the client email/PDF approval flow. That's a separate feature.
- Do not build multiple approvers per client. One primary approver for now.
- Do not change the executive review gate logic. The primary approver handles the AM gate only. Executive review (threshold-based) still routes based on existing logic.
- Do not send the actual email notification yet if Resend isn't deployed. The in-app notification bell is sufficient. Email delivery is an infrastructure task, not a routing task.

---

## Build Order

1. **Step 1** — Migration: add `primary_approver_id` to clients. Show me SQL before running.
2. **Step 2** — Rate card service updates: join approver profile, add getApproverUsers(). Show me the functions.
3. **Step 3** — Approver dropdown in Rate Card Management client settings. Show me the UI with real users.
4. **Step 4** — Approval routing: submitForApproval routes to the client's approver. Show me the logic change.
5. **Step 5** — Submission modal shows who it's going to. Show me the updated modal.
6. **Step 6** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1. Do not skip ahead.
