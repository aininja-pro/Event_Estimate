# Proposed Sprint List (DriveShop Phase 2)

Reconstructed from the session log in your existing CLAUDE.md. 14 sprints total.

For historical sprints (001–013), create each folder as a stub — just the name and summary below. You don't need to reverse-engineer full `requirements.md` + `blueprint.md` for shipped work. Keep those files minimal (or even empty) for historical sprints; the real value starts with sprint 014 where the Architect/Executor pattern kicks in for future work.

---

## Sprint Folder Naming Convention

`sprints/###-kebab-case-name/`

Each folder contains:
- `requirements.md` — for historical sprints, one-line summary. For new sprints, full Architect output.
- `blueprint.md` — for historical sprints, one-line summary. For new sprints, full Architect output.

---

## Historical Sprints (stubs only)

### Sprint 001 — Foundation
**Wk 1-2** · Rate Card Management Engine, Supabase schema, 8 client rate cards seeded.

### Sprint 002 — Core Build: Estimate Builder
**Wk 3-5** · Estimate Builder UI, labor planning, calculations, multi-segment support.

### Sprint 003 — Rate Card Refinements + Builder UX
**Wk 5-6** · Fee Types tab, fee-type-linked Add Rate, client contacts, bulk import, multi-select modals, custom items, steppers, combo dropdowns, split notes, NR summary, archive/delete.

### Sprint 004 — Schedule Tab
**Wk 6** · Calendar staffing grid, Labor Log rollup, sortable columns, per-segment dates.

### Sprint 005 — Workflow Engine
**Wk 6-7** · Status machine, versioning, approvals, history panel, rollback, status bar, lockdown, segment-level workflow, SegmentTransitionBar, SegmentStatusBadge, estimates list overhaul.

### Sprint 006 — Auth + Notifications
**Wk 8** · Supabase Auth, profiles, login, route guards, admin users, notification bell + Realtime, dispatch on all transitions, role-permission enforcement via `permissions.ts`, RLS.

### Sprint 007 — Three-Gate Approval Chain + Financial Controls
**Wk 9** · Bug fixes (Add Segment, ordering), three-gate approval chain, configurable threshold, pipeline as default status. Agency fee auto-populate, Fees & Markups tab, resource type tracking, locked rate cards, GP threshold, rollback bug fix.

### Sprint 008 — AI Intelligence (Modes 1-3)
**Wk 9-11** · AI Phase 1: FastAPI backend, Claude API integration, nudge rules engine, live Intelligence panel. Historical pipeline: 988 events migrated to Supabase, event type classification, pre-computed patterns, historically-enriched nudges. Nudge auto-refresh fix: Supabase-direct fetch, cache bypass, pre-computed staffing mismatches. AI Chat Assistant (Mode 2) + Scoping Bridge (Mode 3): conversational chat, AI Scoping page restyled, Create Estimate from scope with schedule auto-generation.

### Sprint 009 — Recap Entry + Change Orders + PDF Generation
**Wk 11-12** · Recap Entry: actuals columns, variance display, name validation gate, receipt upload. Change Orders: lightweight edit + formal CO with auto-delta, CO tracking, per-segment CO numbering. PDF Generation: WeasyPrint integration, 4 PDF types, Export dropdown, Jinja2 templates.

### Sprint 010 — Pipeline Dashboard + Duplication + History Search
**Wk 12** · Pipeline Dashboard: summary cards, status breakdown chart, client breakdown table, monthly volume chart, recent activity feed. Estimate Duplication: deep-copy from Estimates list. Historical Event Search: "From History" tab with search/filter/template flow. Bug fix: replaced `window.location.reload()` with React key-based remount on CO rejection.

### Sprint 011 — Schedule Recap Actuals + Financial Summary Cards
**Wk 12-13** · Planned vs actual on schedule grid with smart-visibility tints (green under / red over), per-person and per-day plan-vs-actual totals, unplanned-day actuals, pre-fill on `active→recap` transition. Labor log + Summary variance derive from schedule actuals. GR/NR/Cost/GP/GP% cards above the tabs.

### Sprint 012 — Unplanned Additions in Recap
**Wk 13** · `is_unplanned` flag on `estimate_line_items` / `schedule_day_types` / `schedule_entries` / `labor_entries`. "+ Add Unplanned Item / Day / Staff / Role" buttons (rose dashed) in recap open mode-aware pickers reusing planned modals. Rose left-border + UNPLANNED badge + dashes on planned side everywhere. Approved-budget rollups stay locked — unplanned additions land as pure overruns in Planned vs Actual.

### Sprint 013 — Client-Specific Approval Routing + Segment Recovery + Final Polish + Admin Settings
**Wk 13** · `primary_approver_id` on clients (FK to profiles), targeted notification on `in_review`, latent bug fix (fallback was `'cfo'`, now `'account_manager'`). Segment-recovery + pipeline-behavior fixes (PRs #10, #11, #12). Final Polish Sprint: client approval email via Resend with one-click link, toast notifications via sonner, Invoice-with-Receipts PDF export, read-only data feed API. Admin Settings UI for Financial Thresholds: `/admin/settings` with GP threshold + approval threshold controls, audit caption, sonner toasts.

**Note:** You may want to split Sprint 013 into smaller sprints since it covers 4 distinct work streams. I've grouped them since they all shipped in Week 13, but if you prefer finer granularity, split into:
- 013-client-approval-routing
- 014-segment-recovery-fixes
- 015-final-polish (email + toasts + invoice receipts + data feed)
- 016-admin-settings-ui

Then sprint 017 becomes QA + Intacct.

---

## Active Sprint

### Sprint 014 — QA + Sage Intacct Integration
**Wk 14+** · Sage Intacct API integration. Final QA pass on the full Phase 2 build. See `sprints/014-qa-intacct/` — requirements.md and blueprint.md to be produced by Architect before build starts.

---

## Recommendation on Split Decision

Honest take: **keep Sprint 013 as one bundle for the historical record.** Splitting it retroactively is busywork without clear benefit — the session log already tells the granular story if you ever need it. Start the clean Architect/Executor discipline with Sprint 014 going forward. Don't retcon history; set the standard from here.
