# Requirements: Change Orders — Event Estimate Engine

## Problem

When an estimate is approved or active and the scope changes — client adds days, staffing increases, venue changes — there's no way to formally track the modification. The estimate is locked. The current workaround is either "just capture it in recap" (Derek's preference for small changes) or going back to spreadsheets to document what changed (everyone's frustration for big changes). Tad specifically asked for "rev one" tracking — the ability to see the original bid, each modification, and the current state.

The version history system already captures every change with full JSON snapshots. But there's no workflow for intentionally reopening an approved estimate, no formal delta computation showing "this change order adds $3,400," and no change order numbering or tracking.

## Cost of Status Quo

- Scope changes on approved estimates are undocumented or captured informally in recap
- No visibility into how an estimate evolved from original to final — Dan mentioned the Cleveland Auto Show had 8 versions
- No formal change order document to share with clients showing what changed and the cost impact
- Tad can't see "rev one" tracking — original bid vs. current state with each change order in between
- Small scope tweaks require the same heavyweight process as major changes, which discourages people from documenting changes at all

## Who This Is For

- **Primary users:** Dan, Tim (Production Managers) — they discover scope changes during event execution and need to document them
- **Stakeholders:** Tad (Account Manager) — wants "rev one" tracking and formal change order documents for client communication
- **Stakeholders:** Tatiana (CFO) — needs to see the financial delta before approving cost increases
- **Stakeholders:** Derek (CEO) — wants flexibility. Small changes shouldn't require a formal process.

## Proposal

Two modes for handling scope changes on approved/active estimates:

**Lightweight Edit (default):** "Request Edit" unlocks a segment back to estimate status for modification. User makes changes, submits for re-approval. The version history captures the delta automatically. No formal change order document. For quick adjustments — swapping a role, adding a day, fixing a rate.

**Formal Change Order:** "Create Change Order" captures a baseline snapshot, unlocks for editing, and on submission automatically computes and stores a formal delta document. Gets a change order number (CO-001, CO-002). Approval screen shows the delta summary. Change order history persists as a permanent record showing the estimate's evolution.

Both flows use the same underlying mechanics: unlock → edit → re-approve. The formal path adds delta computation and a tracking record.

## Success Criteria

- Users can reopen an approved or active segment for lightweight edits via "Request Edit"
- Users can create a formal change order with a numbered identifier (CO-001, etc.)
- Formal change orders auto-compute the delta: what was added, removed, modified, with dollar impact per line
- Change order approval shows the delta summary, not the full estimate
- Change order history is visible — "Original: $80K → CO-001: +$3.4K → CO-002: -$1.2K → Current: $82.2K"
- Both flows route through the existing approval workflow (AM review, executive review if threshold crossed)
- Version history captures all changes regardless of which flow is used

## Scope

### Included (This Blueprint)

**Lightweight Edit flow:**
- "Request Edit" button on segments in approved/active status
- Requires a reason (text input — "Client added 2 days")
- Captures a version snapshot as the baseline
- Transitions segment back to "estimate" status for editing
- On re-submission, normal approval flow kicks in
- Version history shows the reason and tracks the reopen event

**Formal Change Order flow:**
- "Create Change Order" button on segments in approved/active status
- Requires a reason/description
- Captures a baseline snapshot (the approved state)
- Transitions segment to "estimate" status for editing
- On submission: auto-computes delta between baseline and current state
- Delta computation: line-by-line comparison of labor entries and line items — added, removed, changed — with dollar amounts
- Stores the change order record with: CO number, description, baseline snapshot ID, revised snapshot ID, delta summary (JSON), total delta amount
- Approval screen shows the delta summary
- After approval, segment transitions back to approved/active

**Change Order tracking:**
- `change_orders` table in Supabase
- Sequential numbering per estimate (CO-001, CO-002, etc.)
- Change order history panel (or section in the existing Version History panel)
- Summary view: original approved amount → each CO delta → current amount

**UI elements:**
- Two buttons on the SegmentTransitionBar when segment is approved/active: "Request Edit" (subtle) and "Create Change Order" (prominent for active segments)
- Change order reason modal with text input
- Delta summary view showing added/removed/changed items with dollar impact
- Change order history in the Version History panel or as a separate tab

### Not Included

- Client-facing change order PDF (deferred to PDF generation sprint — the data will be there)
- Change order templates or pre-built scope change categories
- Automatic change order creation from recap variance (if actuals differ significantly from estimate)
- Multi-segment change orders (each segment creates its own CO — matches the per-segment workflow model)
- Change order rejection with counter-proposal

## Dependencies

- **Version snapshots** — full JSON snapshots on every status transition ✅
- **Approval workflow** — three-gate approval chain ✅
- **Segment status transitions** — transitionSegmentStatus() ✅
- **Version History panel** — exists and shows timeline ✅

## Inputs

- **Change order reason:** User-entered text description of why the change is needed
- **Baseline snapshot:** Automatically captured from the current approved/active state
- **Revised state:** The estimate state after the user makes their changes

## Outputs

- **Change order record:** Stored in `change_orders` table with CO number, description, baseline/revised snapshot references, delta summary, total delta amount
- **Delta summary:** JSON showing each line item that changed — added, removed, or modified — with before/after amounts and net impact
- **Version history entries:** Automatic entries showing "Change Order CO-001 created" → "CO-001 approved" with the reason

## Constraints

- Change orders should not be more complex than the current approval flow. The friction must match the severity — lightweight for small tweaks, formal for material changes.
- Delta computation must handle: added entries (new items not in baseline), removed entries (items in baseline not in current), modified entries (same item, different values). All three cases need clear presentation.
- Change order numbering is per-estimate, not global. Each estimate has its own CO-001, CO-002 sequence.
- The "Request Edit" lightweight flow should feel fast — modal with reason, click confirm, start editing. No multi-step wizard.

## Resolved Decisions

- **Two modes, not one.** Lightweight edit for small changes, formal change order for material changes. User chooses which to use.
- **Delta is auto-computed, not manually entered.** The system diffs the baseline snapshot against the current state. Users don't have to describe what changed — the system figures it out.
- **Per-segment change orders.** Each segment creates its own CO, matching the existing per-segment workflow model.
- **Reuses the existing approval flow.** Change orders go through the same AM review → executive review pipeline. No separate approval chain.
- **Version history integration.** Change orders appear in the existing Version History panel as timestamped events, not in a separate UI.

## Open Questions

*None — all resolved.*
