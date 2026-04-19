# Requirements: Client-Specific Approval Routing — Event Estimate Engine

## Problem

The approval workflow exists but doesn't know WHO to route approvals to. When Dan submits a Mazda estimate for review, the system doesn't know that Tad is the approver for Mazda. The notification fires but there's no client-specific routing. Dave confirmed in the April 8 meeting: "every client will have one person" as the primary internal approver, and that person should be defined per client in the rate card settings, tied to a user role rather than hardcoded to a name.

## Who This Is For

- **Primary users:** Dan, Tim (Production Managers) — submit estimates and need them routed to the right approver automatically
- **Stakeholders:** Dave (Operations) — defined the routing model: one approver per client, role-based
- **Stakeholders:** Account Managers (Tad, Kim, Gayle) — each owns specific clients and needs estimates for their clients routed to them

## Proposal

Add a "Primary Approver" setting per client in the Rate Card Management settings. When an estimate is submitted for review, the system looks up the client's designated approver and routes the notification to them. The approver is selected from existing system users by role — when Tad leaves and Jill replaces him, the admin updates the user assignment, not every rate card.

## Success Criteria

- Each client has a configurable "Primary Approver" in the rate card settings
- Approver is selected from a dropdown of system users with account_manager or admin role
- When an estimate is submitted for review, the approval notification routes to the client's designated approver
- If no approver is set, falls back to the current behavior (notification to all account_managers)
- Changing the approver on the client settings takes effect immediately for future submissions
- The approver's name appears in the approval request ("Submitted to Tad Smith for review")

## Scope

### Included (This Blueprint)

**Client settings:**
- New field on the clients table: `primary_approver_id` (FK to profiles)
- Dropdown in the Rate Card Management client settings panel to select the approver
- Populated from profiles where role is 'account_manager' or 'admin'
- Shows user display_name in the dropdown

**Approval routing:**
- When `submitForApproval()` fires, look up the estimate's client → `primary_approver_id`
- Create the approval_request with `assigned_to: primary_approver_id`
- Notification dispatched specifically to that user (not broadcast to all AMs)
- If `primary_approver_id` is null, fall back to existing behavior

**Visibility:**
- The approval submission modal shows who it's being routed to: "This will be sent to Tad Smith (Mazda Account Manager)"
- SegmentTransitionBar "Submit for Review" button tooltip or subtitle shows the approver name

### Not Included

- Per-estimate approver override (Dave said "it's always the same person" per client — override can be added later)
- Client-specific executive threshold (uses the global system_settings threshold)
- Client contact for external approval (that's the email/PDF feature — separate)
- Multiple approvers per client (one primary approver for now)

## Dependencies

- **Profiles table** with user roles ✅
- **Approval workflow** — submitForApproval(), approval_requests table ✅
- **Rate Card Management settings panel** — client settings UI exists ✅
- **Notification service** — dispatches to specific users ✅

## Resolved Decisions

- **Role-based, not name-based.** The dropdown selects a user, but if that user is deactivated, the admin assigns a new user. The rate card stores the user ID, not a name string.
- **One approver per client.** Dave confirmed: "it's always going to go to the same person." Multiple approvers per client is a future enhancement.
- **Fallback to broadcast.** If no approver is configured, the existing behavior (notify all AMs) continues. No client is broken by this change.

## Open Questions

*None — all resolved.*
