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
