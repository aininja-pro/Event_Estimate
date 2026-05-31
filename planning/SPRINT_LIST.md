# Sprint List — DriveShop Event Estimate Engine (Phase 2)

This list reflects the real sprint folders on disk. Historical sprints (001–016) are shipped. Sprint 017 is active. Sprint 018 is next.

## Folder naming convention

`sprints/###-kebab-case-name/`

Each folder contains `requirements.md` and `blueprint.md`. Historical sprints keep one-line summaries; sprints from 014 onward carry full Architect output.

---

## Historical Sprints (shipped)

### Sprint 001 — Foundation
Rate Card Management Engine, Supabase schema, initial client rate cards seeded.

### Sprint 002 — Core Build: Estimate Builder
Estimate Builder UI, labor planning, calculations, multi-segment support.

### Sprint 003 — Rate Card Refinements + Builder UX
Fee Types tab, fee-type-linked Add Rate, client contacts, bulk import, multi-select modals, custom items, steppers, combo dropdowns, split notes, NR summary, archive/delete.

### Sprint 004 — Schedule Tab
Calendar staffing grid, Labor Log rollup, sortable columns, per-segment dates.

### Sprint 005 — Workflow Engine
Status machine, versioning, approvals, history panel, rollback, status bar, lockdown, segment-level workflow, transition bar, status badges, estimates list overhaul.

### Sprint 006 — Auth + Notifications
Supabase Auth, profiles, login, route guards, admin users, notification bell + Realtime, dispatch on transitions, role-permission enforcement, RLS.

### Sprint 007 — Three-Gate Approval Chain + Financial Controls
Three-gate approval chain, configurable threshold, pipeline as default status, agency fee auto-populate, Fees & Markups tab, resource type tracking, locked rate cards, GP threshold, rollback fix.

### Sprint 008 — AI Intelligence (Modes 1-3)
FastAPI backend, Claude API integration, nudge rules engine, live Intelligence panel; historical pipeline (988 events migrated, event-type classification, pre-computed patterns); nudge auto-refresh fix; AI Chat Assistant + Scoping Bridge with Create-Estimate-from-scope.

### Sprint 009 — Recap Entry + Change Orders + PDF Generation
Recap actuals + variance + receipt upload; lightweight + formal change orders with auto-delta and per-segment CO numbering; WeasyPrint integration, 4 PDF types, Export dropdown, Jinja2 templates.

### Sprint 010 — Pipeline Dashboard + Duplication + History Search
Pipeline dashboard (summary cards, status/client breakdowns, monthly volume, activity feed); estimate deep-copy duplication; From-History search/filter/template flow; CO-rejection remount fix.

### Sprint 011 — Schedule Recap Actuals + Financial Summary Cards
Planned-vs-actual schedule grid with smart-visibility tints, per-person/per-day totals, unplanned-day actuals, pre-fill on active→recap; labor log + Summary variance from schedule actuals; GR/NR/Cost/GP/GP% cards above the tabs.

### Sprint 012 — Unplanned Additions in Recap
`is_unplanned` flag across four tables; Add Unplanned Item/Day/Staff/Role buttons (rose dashed) reusing planned pickers; UNPLANNED badges; approved-budget rollups stay locked so unplanned lands as pure overrun.

### Sprint 013 — Client-Specific Approval Routing
`primary_approver_id` on clients (FK to profiles), targeted notification on in_review, fallback fix (`'cfo'` → `'account_manager'`), segment-recovery + pipeline-behavior fixes.

### Sprint 014 — Final Polish
Client approval email via Resend with one-click link, toast notifications (sonner), Invoice-with-Receipts PDF export, read-only data feed API.

### Sprint 015 — Admin Settings UI for Financial Thresholds
`/admin/settings` with GP threshold + approval threshold controls, audit caption, toasts.

### Sprint 016 — Rate Card Bulk Import
20-tab cost rate card import via `scripts/import_rate_cards.py`; 14 new OEM clients, upserts onto 6 existing brands, 46 auto-created fee_types (NULL gl_code), No-Client fallback seed, typo/dedup/normalization fixes with safety assertion.

---

## Active Sprint

### Sprint 017 — Deploy Readiness
Stabilization pass for first production deploy to Render + beta release. Agency-fee PDF correctness, snapshot/change-order baseline correctness, WeasyPrint native libs on Render, render.yaml env vars, hybrid email mode (client email gated, internal routing intact), env hygiene, Summary-tab section percentages, and investigate-then-fix on the office-cost recalc. See `sprints/017-deploy-readiness/requirements.md` and `blueprint.md`.

---

## Next Up

### Sprint 018 — Sage Intacct CSV Export + Final QA
CSV export for upload into Intacct (CSV-based, not an API integration). Blocked on corporate cost rate data from finance to finalize the export format. Final QA pass folds in once beta feedback is collected.
