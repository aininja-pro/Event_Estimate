# Current State

**Project:** DriveShop Event Estimate Engine
**Phase:** 2 — Assembly, Week 13
**Mode:** Directed

## Active Sprint

Sprint 014 — QA + Sage Intacct Integration
See `@.planning/sprints/014-qa-intacct/` (blueprint pending)

## Just Shipped

**Sprint 013 — Admin Settings UI for Financial Thresholds**
`/admin/settings` page with GP threshold + approval threshold controls. `updateSystemSetting()` upsert, audit caption ("Last updated {ts} by {name}"), sonner toasts. Admin-only via existing `RequireAdmin` gate. Closes Week 9 deferred ask from Chris, Joelle, and Tatiana.

## Recently Shipped

- **Sprint 012** — Final Polish (client approval email via Resend, toast notifications, invoice-with-receipts PDF, read-only data feed API)
- **Sprint 011** — Client-Specific Approval Routing (primary_approver_id on clients, targeted notifications)
- **Sprint 010** — Segment Recovery + Pipeline Behavior Fixes (PRs #10, #11, #12)
- **Sprint 009** — Unplanned Additions in Recap (is_unplanned flag on 4 tables, rose dashed UI pattern)
- **Sprint 008** — Schedule Recap Actuals + Financial Summary Cards

## Deferred

- Sage Intacct integration (next sprint)
- Location-aware historical patterns (enhancement)
- Per-estimate approver override (OOO handling)
- Confirmation emails back to client + internal AM notification on client approval
- `driveshop.com` sender domain verification in Resend
- Live broadcast of system settings to already-open tabs
- Default landing page setting (dashboard vs estimates)
- Editing `is_unplanned` flag post-creation
- Unplanned items on client-facing PDFs (currently internal-only)
- SMS notifications
- Multiple receipt attachments per line item
- Change Order and Recap PDF options in Export dropdown
- Broader role-based workflow rules engine

## Next Up

Sage Intacct integration + final QA pass.
