# Sprint List — DriveShop Event Estimate Engine (Phase 2)

This list reflects the real sprint folders on disk. Sprints 001–019 are shipped. Sprint 020 is active. The forward road lives in `planning/ROADMAP.md`.

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

### Sprint 017 — Deploy Readiness
Stabilization pass for first production deploy to Render + beta release. Agency-fee PDF correctness, snapshot/change-order baseline correctness, WeasyPrint native libs on Render, render.yaml env vars, hybrid email mode, env hygiene, Summary-tab section percentages, and investigate-then-fix on the office-cost recalc (W8 investigated, fixed in 018 Phase 1).

### Sprint 018 — Office Cost Correction + Intacct Export (two-phase)
**Phase 1 shipped:** office labor cost/GP inversion corrected to `day_rate × office_payout_pct` across all five sites, single `officeCostRate()` helper, recompute-and-persist on structure toggle and rate change. **Phase 2 outstanding:** the AR/AP CSV exporter is built and matches Tatiana's templates field-for-field; it still needs a priced estimate, the client→customer mappings, `dueDate` wiring, default scalars, and the corporate-scope decision. See `sprints/018-intacct-export/NOTES.md`.

### Sprint 019 — Intacct Data: Start Fresh from DriveShop's Catalog
Replaced the app's placeholder items and test prices with DriveShop's real 160-item catalog as the item foundation. Every item carries its own Item ID + Cost/Revenue GL, clearing the 0/967 AR-item-ID wall at the source. Reconciliation-by-GL abandoned (proven impossible). Reference tables loaded (15 offices, 10 segments, 7 customer IDs). Rate cards left deliberately empty pending real pricing. Pack: `architect-packs/architect-pack-019-intacct-data-load.md`.

---

## Active Sprint

### Sprint 020 — Rate Card Pricing Load + No-Price Guard
Loads DriveShop's delivered per-client pricing (20 client tabs, 639 prices, delivered by Dave Morck 2026-07-24) onto the Sprint 019 catalog, joined on Item ID — 1,399 `rate_card_items` = 499 priced rows + 900 pass-through rows, 158 carrying an overtime rate. Overtime loads as an attribute of the parent item; the 29 standalone `.01` overtime items stay accounting-only. Adds a no-price guard so an item without a rate is visibly flagged and cannot reach approval as a silent $0. Pack: `architect-packs/architect-pack-020-rate-card-pricing.md`.

---

## Next Up

See `planning/ROADMAP.md`. In order: **021** Production Hardening (key rotation, `main` consolidation) · **022** Client Settings + Intacct Customer Mapping · **023** Catalog Amendments from Dave's review · **024** First Real Intacct Export End-to-End · **025** Corporate Event Cost & Gross Profit.
