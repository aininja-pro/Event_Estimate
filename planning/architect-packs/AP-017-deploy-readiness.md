# Architect Pack — 017 Deploy Readiness

**Mode:** Existing Project / Stabilization (Mode 2)
**Author:** Architect Layer
**Date:** 2026-05-29
**Target project root:** DriveShop Event Estimate Engine repo

## How to apply

1. Save this file to `planning/architect-packs/AP-017-deploy-readiness.md`.
2. Dry-run your Architect Pack importer from the project root. Review the diff.
3. This pack OVERWRITES two existing files — `planning/STATE.md` and `planning/SPRINT_LIST.md` — by design (active-sprint update + stale-list reconciliation). Confirm those diffs look right before applying.
4. The other two FILE sections create new files under a new `planning/sprints/017-deploy-readiness/` folder.
5. Apply after review. Then hand the sprint folder to the Builder using the kickoff prompt provided separately.

## What this pack does NOT do

- It writes planning files only. No production application code is changed by this pack.
- It contains no secrets, keys, or env values — env vars are referenced by name only.

---

============================================================
FILE: planning/sprints/017-deploy-readiness/requirements.md
============================================================

# Sprint 017 — Deploy Readiness

**Status:** Active
**Mode:** Existing Project / Stabilization
**Goal:** Get the existing, working build into a clean state for a first production deploy to Render and a beta release to end users (Dave, Dan, Tim). Fix outstanding correctness, configuration, and a small set of refinements. No new business logic that requires unresolved stakeholder decisions.

## Why this sprint exists

A beta-deployment readiness audit (run by the Builder, investigation-only) surfaced a small number of real blockers: one financial-correctness bug on generated PDFs, a related total-computation bug in version snapshots and change-order baselines, and several Render deployment-configuration gaps that would prevent PDFs from rendering and approval emails from working in production. Two refinements from the stakeholder walkthrough are small enough to include. Everything requiring unresolved business-rule decisions is explicitly deferred to a later sprint.

## Scope — the eight work items

### W1 — Agency fee renders as $0 on every PDF (financial correctness, highest priority)
- **Current behavior:** The PDF data service computes every line as `cost = qty * unit_cost; revenue = cost * (1 + markup_pct/100)`. Agency-fee lines are stored with `unit_cost = 0` and `fee_basis = 'total_estimate'`, so they yield `revenue = 0`. A code comment promises a post-loop recalculation that does not exist. The grand total on the client-facing and internal PDF is understated by the entire agency fee. The on-screen total is correct; only the PDF is wrong.
- **Expected behavior:** Fee-basis lines on the PDF compute revenue the same way the canonical engine does — as a percentage of prior revenue — so the PDF grand total matches the on-screen total exactly.
- **Likely files:** `api/services/pdf_data_service.py` (the per-line loop and the section sum), with the canonical logic to mirror in `src/lib/estimate-totals.ts`. Reference how fee lines are stored in `src/lib/estimate-service.ts`.

### W2 — Version snapshots and change-order baselines omit fee-basis and unplanned handling
- **Current behavior:** Both the snapshot builder and the change-order revenue sum compute line revenue as `qty * unit_cost * (1 + markup_pct/100)` with no fee-basis branch and no unplanned filter. Snapshot totals feed version history; the change-order sum feeds CO delta baselines. Both understate by the agency fee and can misstate when unplanned items are present.
- **Expected behavior:** Snapshot and change-order totals match the canonical engine, including fee-basis revenue and the unplanned-item filter.
- **Likely files:** `src/lib/workflow-service.ts` (snapshot builder), `src/lib/change-order-service.ts` (revenue sum). Prefer delegating to the canonical engine in `src/lib/estimate-totals.ts` over re-implementing the math.

### W3 — WeasyPrint native libraries missing from the Render build
- **Current behavior:** The backend build command on Render installs Python requirements only. WeasyPrint requires system libraries (Pango, Cairo, gdk-pixbuf) that are not installed, so PDF generation is expected to fail at runtime in production even after W1 is fixed.
- **Expected behavior:** The Render backend build installs the required native libraries so WeasyPrint renders in production.
- **Likely files:** `render.yaml`, plus possibly a new `Aptfile` or a switch to a Docker runtime — Builder to choose the cleanest approach for Render and propose it before applying. Reference the documented requirement already noted in `planning/DECISIONS.md` and the architecture doc.

### W4 — render.yaml is missing required backend environment variables
- **Current behavior:** The backend service block declares only a subset of needed env vars. Missing: the Resend API key, the Resend from-address, the approval base URL (currently defaults to localhost, which would break approval links), the data-feed API key, and optionally the extra-CORS-origins var.
- **Expected behavior:** All required backend env vars are declared in `render.yaml`. Secret values are set in the Render dashboard, not committed — the yaml declares the keys with no values (sync disabled). The approval base URL and frontend URL point to production, not localhost.
- **Additional:** Add one new env var to gate client email (see W5), defaulting to disabled for beta.
- **Likely files:** `render.yaml`, with confirmation of how `email_service.py` reads its defaults.

### W5 — Hybrid email mode (disable client-facing approval email, keep internal routing)
- **Decision context:** The Resend sender domain is not yet verified, so client-facing emails cannot reliably deliver to real client addresses in production. For beta, client email is disabled; internal approval routing stays fully functional.
- **Must remain functional:** Internal in-app approval notifications; all approval state transitions (approve / reject / route); the approval audit trail; the approval-confirm endpoint (so a direct link can still be tested).
- **Must be disabled:** The step that sends an approval email to the external client address, gated on the new env var from W4. When disabled, the UI control that previously sent to client is hidden or shows a clear message that client approval email is disabled for beta pending domain verification.
- **Likely files:** the email service and the approval route on the backend; the approval-trigger UI component on the frontend.

### W6 — Environment hygiene
- Fix the corrupted first line of the root `.env` (a stray prefix is glued onto the first variable name).
- Remove the frontend Anthropic key var from the frontend `.env` and delete the dead frontend AI module that reads it (confirmed imported nowhere). The project rule is that the Anthropic API is never called from the frontend; anything bundled into client JS would leak.
- Add the backend `.env` to `.gitignore` defensively so it can never be committed.
- Recommend (outside this pack, operationally) rotating the Supabase, Anthropic, and Resend keys given how long they have sat in local plaintext.

### W7 — Section-level percentage of total bid on the Summary tab (refinement)
- **Goal:** On the Summary tab, show each section header's revenue as a percentage of the total bid (e.g., Planning & Admin = X%, Onsite Labor = X%, Travel = X%, etc.).
- **Constraint:** Read-only display derived from the existing canonical totals. No schema changes. No new business logic. This is the simple, decision-free cut of the broader cost-visibility feedback — the Internal/External/Vendor cost-mix version is explicitly deferred (see Out of Scope).
- **Likely files:** the Summary tab component and the financial summary derivation, both of which already consume the canonical engine.

### W8 — Investigate the office-cost recalculation the operations lead flagged
- **Context:** During the walkthrough, the operations lead reported that toggling a line from Corporate to Office did not recalculate cost against the office payout percentage (a $140 day rate at 50% office payout showed $35 instead of the expected $70, with a wrong line GP%). The readiness audit found that the cost-structure and office-cost fields do not enter the core revenue/GP math at all — they only gate the accounting export — which means what was observed may be a display issue on a specific line context rather than a core-engine bug.
- **Task:** Investigate first. The Builder reports findings — the exact files and functions, the current behavior, the expected behavior, and a proposed fix in plain English — BEFORE changing any code. Do not assume the audit is complete; reconcile the observed behavior with the audit finding.
- **Likely files:** the cost-structure / office-cost handling in the line-item layer and the accounting-export service, plus wherever line cost is displayed in the builder UI.

## Acceptance criteria

- **W1:** For an estimate that carries an agency fee, the generated PDF grand total equals the on-screen grand total to the cent. A non-fee estimate is unchanged.
- **W2:** A version snapshot and a formal change order created on an estimate with an agency fee produce totals matching the canonical engine; unplanned items are excluded from approved-budget rollups as they are on screen.
- **W3:** A PDF generates successfully on the deployed Render backend (not just locally).
- **W4:** The deployed backend has all required env vars present; approval links resolve to the production URL, not localhost; no secret values are committed to the repo.
- **W5:** With client email disabled: internal approval routing, transitions, audit trail, and the confirm endpoint all work; no email is sent to an external client address; the UI clearly reflects the disabled state. With the gate enabled: prior behavior is restored.
- **W6:** Root `.env` line 1 is well-formed; the frontend Anthropic key var and the dead AI module are gone; backend `.env` is gitignored.
- **W7:** The Summary tab shows correct section percentages that sum to 100% of the total bid and reconcile with the canonical totals.
- **W8:** The Builder has produced a written investigation finding and a proposed fix approved by the Architect before any code change; if a real bug exists, toggling Corporate/Office recalculates cost correctly and the line GP% is correct.

## Validation plan

- Build one real estimate end-to-end against a fully loaded rate card: create, add line items across multiple sections, save, generate PDF, confirm PDF total matches screen.
- Create a version snapshot and a change order on an estimate with an agency fee; confirm totals.
- Deploy to Render; generate a PDF on the live instance; confirm it renders.
- Exercise the approval flow in disabled-email mode; confirm internal routing works and no client email is sent.
- Toggle a line between Corporate and Office; confirm the W8 outcome (fixed or documented-as-not-a-bug).
- Refresh mid-estimate; confirm no data loss.

## Out of scope (deferred — do not build in 017)

- Internal / External / Vendor line type driving the cost source (needs business-rule decisions with operations and finance).
- Locked rates on the corporate / no-client rate card (needs lock-semantics decision).
- Internal / External / Vendor cost-mix visualization on Summary (depends on the type-driven logic above).
- New rate card sections for Creator Services, Media, Talent (blocked on field definitions and GL codes from the client).
- Rate card data cleanup (client-side data work).
- Corporate event recap workflow (unresolved scope decision with operations).
- Sage Intacct CSV export (moved to Sprint 018; blocked on corporate cost rate data from finance).
- Recap-variance overtime-multiplier reconciliation, data-feed performance, PDF logo/branding, nudge-rule expansion, OOO approver handling — all acceptable as-is for beta.

============================================================
FILE: planning/sprints/017-deploy-readiness/blueprint.md
============================================================

# Sprint 017 — Deploy Readiness — Blueprint

This sprint is sequenced. The Builder completes one step at a time and shows results before proceeding. Steps W1, W2, and W8 are financial-integrity work and require explicit Architect approval of the proposed fix BEFORE any code change. Steps W3–W6 are configuration and hygiene. W7 is a contained UI addition.

## Operating rules for the Builder

- Read the standard project context first (CLAUDE.md / AGENTS.md, planning/STATE.md, planning/DECISIONS.md, planning/DOMAIN.md, this sprint's requirements.md and blueprint.md).
- For each financial step: show current code, show the canonical reference logic, propose the fix in plain English, and wait for approval. Do not change code before approval on those steps.
- Make each change as small and localized as possible. Prefer delegating to the canonical engine over duplicating math.
- Do not expand scope. Do not touch anything on the Out of Scope list.
- Update STATE.md at the end of the sprint.

## Step sequence

### Step 1 — W1: Agency fee = $0 on PDFs (APPROVAL GATE)
1. Show the per-line computation loop and the section-sum in the PDF data service.
2. Show the canonical fee-basis revenue computation in the estimate-totals engine.
3. Propose the fix in plain English: where the fee-basis branch goes, and how the section/grand totals incorporate it.
4. On approval, apply the minimal fix.
5. Verify: generate a PDF for an estimate with an agency fee; confirm the PDF grand total equals the on-screen total. Confirm a non-fee estimate is unchanged.

### Step 2 — W2: Snapshot + change-order baseline (APPROVAL GATE)
1. Show the snapshot builder's revenue computation and the change-order revenue sum.
2. Propose either delegating both to the canonical engine (preferred) or replicating fee-basis + unplanned handling exactly — flag which path and why.
3. On approval, apply.
4. Verify: snapshot and change-order totals on a fee-bearing estimate match the canonical engine; unplanned items excluded from approved-budget rollups.

### Step 3 — W3: WeasyPrint native libs on Render
1. Inspect the current backend build command in render.yaml and the documented native-library requirement.
2. Propose the cleanest Render-compatible approach (Aptfile vs Docker runtime vs build-command apt step).
3. On approval of approach, apply.
4. Verify locally that the requirements are coherent; final verification is the live PDF render after deploy (Step 7).

### Step 4 — W4: render.yaml env vars
1. List the env vars the backend reads and which are missing from render.yaml.
2. Add the missing keys with secret values set in the dashboard (no values committed; sync disabled for secrets). Set approval base URL and frontend URL to production.
3. Add the new client-email gate var (default disabled for beta), consumed in Step 5.
4. Show the proposed render.yaml diff before applying.

### Step 5 — W5: Hybrid email mode
1. Identify the exact backend code path that sends the client-facing approval email, and the UI control that triggers it.
2. Propose: where the gate var is checked, what happens when disabled, and what the UI shows. Confirm internal routing, transitions, audit trail, and confirm-endpoint are untouched.
3. On approval, apply.
4. Verify both states: disabled (no client email, internal routing intact, UI reflects disabled) and enabled (prior behavior).

### Step 6 — W6: Environment hygiene (no gate — mechanical)
1. Fix the corrupted root `.env` first line.
2. Remove the frontend Anthropic key var; delete the dead frontend AI module (confirm no imports first).
3. Add backend `.env` to `.gitignore`.
4. Show the results. Note the key-rotation recommendation for the operator to action outside the repo.

### Step 7 — W7: Summary tab section percentages
1. Show how the Summary tab derives section totals from the canonical engine.
2. Add a read-only percentage-of-total-bid display per section header.
3. Verify the percentages reconcile with canonical totals and sum to 100%.

### Step 8 — W8: Office-cost recalc investigation (INVESTIGATION GATE)
1. Investigate how cost-structure / office-cost are handled in the line layer and whether they reach any displayed cost.
2. Reconcile the observed walkthrough behavior with the audit finding that these fields only gate the accounting export.
3. Report: files/functions, current behavior, expected behavior, proposed fix in plain English — OR a documented conclusion that the core math is correct and the observation was a display/context artifact.
4. Do not change code until the Architect approves the finding. If a fix is approved, apply it minimally and verify the Corporate/Office toggle recalculates cost and line GP% correctly.

### Step 9 — Close out
1. Update planning/STATE.md: mark 017 shipped with a summary; set 018 (Intacct export) as the next/active sprint.
2. Summarize all changes made and any follow-ups for the Architect.

## Deploy step (operator, after Builder steps verified)
- Push to the deploy branch; confirm Render builds with native libs; smoke-test a live estimate including a PDF render; then release the beta link to the operational users.

============================================================
FILE: planning/STATE.md
============================================================

# Current State

**Project:** DriveShop Event Estimate Engine
**Phase:** 2 — Stabilization / First Production Deploy
**Mode:** Directed

## Active Sprint

Sprint 017 — Deploy Readiness (in progress)

Stabilize the existing build for a first production deploy to Render and a beta release to operational users. Scope: agency-fee PDF correctness, snapshot/change-order baseline correctness, WeasyPrint native libs on Render, render.yaml env vars, hybrid email mode (client email gated, internal routing intact), env hygiene, Summary-tab section percentages, and an investigate-then-fix pass on the office-cost recalc flagged in the walkthrough. See `sprints/017-deploy-readiness/`.

## Just Shipped

**Sprint 016 — Rate Card Bulk Import**
Imported the 20-tab cost rate card template via `scripts/import_rate_cards.py` (dry-run by default, `--confirm` writes SQL). Creates 14 new OEM clients, upserts rate card items onto 6 existing brands (preserving `markup_percent` / `primary_approver`), auto-creates 46 missing `fee_types` with NULL gl_code, seeds a `No Client` fallback from the Audi tab. Applied `Detailling → Detailing` (20×) and `Insuarnce → Insurance` (6×) typo fixes, deduped 4 `Pressure Washer (/week)` rows, normalized `office_cost` from decimal fractions to whole-number percent with a 0–500 safety assertion.

## Recently Shipped

- **Sprint 015** — Admin Settings UI for Financial Thresholds (GP threshold + approval threshold controls at `/admin/settings`)
- **Sprint 014** — Final Polish (client approval email via Resend, toast notifications, invoice-with-receipts PDF, read-only data feed API)
- **Sprint 013** — Client-Specific Approval Routing (primary_approver_id on clients, targeted notifications, `'cfo'` → `'account_manager'` fallback fix)
- **Sprint 012** — Unplanned Additions in Recap (is_unplanned flag on 4 tables, rose dashed UI pattern)
- **Sprint 011** — Schedule Recap Actuals + Financial Summary Cards
- **Sprint 010** — Estimate Duplication + Historical Event Search

## Next Up

**Sprint 018 — Sage Intacct CSV Export + Final QA**
CSV export from the Event Estimate Engine for upload into Intacct (not an API integration). Blocked on corporate cost rate data from finance to finalize the export format. Final QA pass folds in here once beta feedback is collected.

## Deferred

- Internal / External / Vendor line type driving cost source (needs business-rule decisions)
- Locked rates on the corporate / no-client rate card (needs lock-semantics decision)
- Internal / External / Vendor cost-mix visibility on Summary (depends on the type-driven logic)
- New rate card sections — Creator Services, Media, Talent (blocked on field defs + GL codes)
- Rate card data cleanup (client-side data work)
- Corporate event recap workflow (unresolved scope decision)
- `driveshop.com` Resend sender domain verification (re-enables client approval email)
- Recap-variance overtime-multiplier reconciliation
- Data-feed totals performance (O(n) per request)
- Location-aware historical patterns; per-estimate approver override (OOO); confirmation emails back to client + internal AM notification on client approval
- Live broadcast of system settings to open tabs; default landing page setting
- Editing `is_unplanned` post-creation; unplanned items on client-facing PDFs
- SMS notifications; multiple receipt attachments per line item
- Change Order / Recap PDF options in Export dropdown
- Broader role-based workflow rules engine

============================================================
FILE: planning/SPRINT_LIST.md
============================================================

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
