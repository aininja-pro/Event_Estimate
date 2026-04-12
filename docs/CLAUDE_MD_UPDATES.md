# CLAUDE.md — Required Updates

These are the specific changes to make to CLAUDE.md based on Dave's Estimator Workflows document (March 2026).

---

## CHANGE 1: Update Status Lifecycle Description

**Find this text in the "Workflow Engine" section (~line 43):**
> Each segment transitions independently: Draft → Review → Approved → Active → Recap → Invoiced → Complete.

**Replace with:**
> Each segment transitions independently: Pipeline → Estimate → In Review → Active → Recap → Invoiced.
> Terminal statuses: Lost, Cancelled (reachable from Pipeline or Estimate).
> Estimate-level status is computed as the lowest segment status via `computeEstimateStatus()`.

**Also find (~line 43):**
> Draft → Review → Approved → Active → Recap → Invoiced → Complete

Update ALL references to the old status names throughout the file:
- `Draft` → `Estimate` (the status where actual estimate building happens)
- `Review` → `In Review` (two-phase: internal AM/exec approval, then client review)
- `Approved` → remove as a distinct status (approval is a gate within In Review, not a separate status)
- `Complete` → remove (Invoiced is the terminal status)
- Add `Lost` and `Cancelled` as terminal statuses

> **NOTE:** This is a naming and semantics change. The underlying state machine logic is similar, but the status labels and transition meanings change. Claude Code should update the enum, all UI references, badge colors, transition bar labels, and the workflow service.

---

## CHANGE 2: Add Workflow Lifecycle Detail

**Add this new section after the "Workflow Engine" bullet in "Current State" or in a new "## Workflow Lifecycle" section under Business Domain Knowledge:**

```markdown
## Workflow Lifecycle (Source: Dave M., March 2026)

### Status Stages

| Status | What Happens | Who Acts |
|--------|-------------|----------|
| **Pipeline** | Basic event info created (name, details). No estimate or labor log required. Notification sent to event creator and AM with link to event record. | Any role (Event Lead, AM, Executive, Admin) |
| **Estimate** | Prepare all event details. Build labor log. Fill in all relevant details. AI suggestions available. When ready, submit for approval. | Event Lead, AM, Admin |
| **In Review** | Two-phase review: (1) Internal — AM approves first. If over configurable threshold (default $50K), executive approval also required. Changes may be made prior to approval. (2) Client — Estimate PDF sent to client. Client reviews and approves online. Only pre-authorized client contacts can approve. Client response: Approved or Changes Needed. | AM (first approval), Executive (threshold), Client (final approval) |
| **Active** | Client has approved. Event execution begins. Staff names assigned, schedule finalized. | Event Lead, Operations |
| **Recap** | Event concludes. Event manager fills in actual amounts. Uploads receipts and backup files (images, PDFs). | Event Lead, Operations |
| **Invoiced** | Notification to AM and Accounting. Accounting prepares invoice and exports GL data to Intacct. | Accounting |

### Terminal Statuses

| Status | When Used |
|--------|----------|
| **Lost** | Estimate was not accepted / opportunity lost |
| **Cancelled** | Event was cancelled after creation |

### Key Business Rules

1. **Two-phase approval in "In Review":**
   - AM approves first (required for all estimates)
   - If estimate total ≥ threshold (configurable, default $50K), executive must also approve
   - After internal approval, PDF is generated and sent to client
   - Client approval is the gate to Active status

2. **Client approval portal:**
   - Client sees sanitized estimate PDF (no costs/margins)
   - Only pre-authorized client contacts can approve (maintained per client)
   - Client can respond: "Approved" or "Changes Needed"
   - "Changes Needed" returns estimate to Estimate status with client notes

3. **Office vs. Corporate is a template/calculation difference, NOT a workflow difference.**
   Dave confirmed the workflow is identical for both — the only difference is the estimate template and how profit calculates (margin vs. office payout %).

4. **Event creation source (future):**
   Events may originate from Monday.com integration (TBD). For now, events are created in-app.

5. **Recap includes file uploads:**
   Event manager uploads receipts and backup files (images, PDFs) alongside actual amounts.
```

---

## CHANGE 3: Add Roles & Permissions Section

**Add this new section under Business Domain Knowledge:**

```markdown
## User Roles & Permissions (Source: Dave M., March 2026)

| Role | DB Value | Permissions | Examples |
|------|----------|-------------|----------|
| **Event Lead** | `event_lead` | Create and modify events | Office Managers, Field Event Leads |
| **Approver (AM)** | `account_manager` | Create, modify, first-line approval in chain | Account Managers (at least one per client account) |
| **Accounting** | `accounting` | Modify event recaps, create invoices, export data for Intacct | Accounting Team (Tatiana's team) |
| **Executive** | `executive` | Create, modify, approve all events regardless of size. Second approval for over-threshold events | Derek, Justin, executive team |
| **Administrator** | `admin` | All functions above + rate card modifications | Dave M., system admins |

### Permission Matrix

| Action | Event Lead | AM/Approver | Accounting | Executive | Admin |
|--------|-----------|-------------|------------|-----------|-------|
| Create event | ✅ | ✅ | ❌ | ✅ | ✅ |
| Edit estimate (in Estimate status) | ✅ | ✅ | ❌ | ✅ | ✅ |
| Submit for review | ✅ | ✅ | ❌ | ✅ | ✅ |
| Approve (first line) | ❌ | ✅ | ❌ | ✅ | ✅ |
| Approve (over threshold) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Edit recap amounts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload recap files | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create invoice | ❌ | ❌ | ✅ | ❌ | ✅ |
| Export GL to Intacct | ❌ | ❌ | ✅ | ❌ | ✅ |
| Modify rate cards | ❌ | ❌ | ❌ | ❌ | ✅ |

### Role Mapping to Existing `profiles.role` Column

Current roles in DB: `admin`, `cfo`, `operations`, `production_manager`, `account_manager`

Mapping to Dave's roles:
- `admin` → Administrator (no change)
- `cfo` → Executive (rename or alias — CFO has executive-level approval authority)
- `operations` → Event Lead (Dave's operations team creates and manages events)
- `production_manager` → Event Lead (Dan/Tim — same permissions as operations for workflow purposes)
- `account_manager` → Approver/AM (no change — first-line approval)
- NEW: `accounting` → Accounting (Tatiana's team — recap, invoicing, Intacct export)
```

---

## CHANGE 4: Update "Next Sprint" Line

**Find (~line 244):**
> **Next Sprint (Weeks 8-10):** AI Intelligence (scoping assistant, historical data training)

**Replace with:**
> **Week 8-9 (Current):** Workflow Refinement — Dave's workflow definitions integration. Status rename (Draft→Estimate, Review→In Review, remove Approved/Complete, add Lost/Cancelled). Two-phase approval chain (AM + executive threshold). Role-permission matrix. Client review portal stub. Recap file upload. Invoiced status with accounting actions.
> **Weeks 9-10 (Next):** AI Intelligence (scoping assistant, historical data training)

---

## CHANGE 5: Update Key Stakeholders

**Find the stakeholders list and update Dave's entry:**

> - **Dave** — Operations. Handles estimate building, labor logs, FMS data. Manages media scheduling system. **Authored the definitive workflow lifecycle and role definitions (March 2026).**

**Add Justin:**

> - **Justin** — COO. Newly engaged. Executive-level approval authority.
