# Current State

**Project:** DriveShop Event Estimate Engine
**Phase:** 2 — Stabilization / First Production Deploy
**Mode:** Directed

## Active Sprint

Sprint 019 — Intacct Data: Start Fresh from DriveShop's Catalog — **SHIPPED (applied 2026-07-01).**

- **What shipped:** the app's placeholder items + per-client prices (test data, per Ray 2026-07-01) were replaced with DriveShop's real **160-item catalog** as the item foundation. Every item now carries its own `intacct_ar_item_id` (`I0xxx`), Cost GL, and Revenue GL — so the **0/967 AR-item-ID wall is cleared at the source** (fee_types AR/AP/revenue-GL = 160/160/160). Reconciliation-by-GL was abandoned (Builder Step 1 proved GL is coarser than item IDs — see DECISIONS §"Intacct item foundation"). Reference tables loaded: 15 office profiles, 10 revenue segments, 7 clients matched to Intacct customer IDs. Mechanism: full replace in one atomic FK-safe transaction (`scripts/import_intacct_catalog.py` → `.sql`, operator-applied). `tsc` clean; no new eslint findings; historical data (1,674 events / 98 patterns) untouched.
- **Prices are intentionally empty** — the catalog has items + accounting codes but no prices. Real per-client pricing is a **separate future DriveShop delivery** (Dave/Tatiana). Rate cards (`rate_card_items`) are empty until it lands.
- **For the 2026-07-02 Dave meeting:** real pricing; 16 client→customer exceptions (JLR="Jaguar Land Rover", VW/Volkswagen, composites); 9 non-standard office-payout items; estimate-facing "In event estimate?" flag; overtime `.01` items; `4000.99`. Optional tiny cleanup: two pre-existing placeholder reference rows (`Test Office`, `Test Revenue`) survive (idempotent upsert didn't remove them) — still referenced by test estimates; harmless.

Sprint 018 — Office Cost Correction + Intacct Export — **two-phase.**

- **Phase 1 — Office Cost Correction: shipped (Sprint 018 Phase 1).** The Sprint 017 W8 finding (office labor cost/GP inverted) is fixed: formula corrected to `cost = day_rate × office_payout_pct` across all five sites, collapsed to a single `officeCostRate()` helper, with recompute-and-persist on the Corporate↔Office toggle and office-row rate change (all segments). Confirmed by Dave Morck (VP Ops) 2026-06-01, scoped to fee/non-pass-through. CFO sign-off (Tatiana) pending — revisit only if she dissents. See DECISIONS §W8.
- **Phase 2 — Intacct Export: UNBLOCKED at the item-ID level (Sprint 019).** The exporter is built and the AR item-ID wall is cleared (every item carries its `intacct_ar_item_id`); Phase 1 makes AP amounts correct. **A full end-to-end export test still needs a priced estimate** — deferred until real per-client pricing arrives. Remaining before a production export: real pricing, the 16 client→customer mappings, `dueDate` wiring, default scalars (`transactionType`, `exchRateType`), and the corporate-scope decision. See `planning/sprints/018-intacct-export/NOTES.md`.

## Production Deployment — LIVE (2026-07-02)

The app is deployed on Render for the first time, resolving the long-pending Sprint 017 operator-deploy carryover.

- **How:** Render **Blueprint** `driveshop-event-estimate`, deploying from `render.yaml` on branch **`sprint-018-office-cost-correction`** (NOT `main` — `main` is ~2 sprints behind). Two services: static frontend **`event-history`** + Python backend **`driveshop-api`**. The Blueprint auto-syncs on every push to that branch → **that branch is now the production branch.** See DECISIONS §"Render deployment".
- **Backend env vars set** on `driveshop-api` (operator-verified names, 2026-07-02): `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY`, `DATA_FEED_API_KEY`, `FRONTEND_URL` (= static site origin, for CORS), `APPROVAL_BASE_URL` (= backend origin), `RESEND_FROM_EMAIL=onboarding@resend.dev`, `CLIENT_APPROVAL_EMAIL_ENABLED=false`. `EXTRA_CORS_ORIGINS` intentionally unset (optional). Frontend `event-history` has `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (= backend origin, baked at build).
- **Aptfile** ships on the branch → WeasyPrint native libs install for backend PDF rendering.
- **Operator confirmed "up and running"** 2026-07-02. Recommended quick confirmations if not yet done: hit `GET /api/health`; exercise one API-backed action (AI scoping or a PDF); confirm the deployed frontend isn't CORS-blocked (guards `FRONTEND_URL` correctness).
- **Live-app consequence of Sprint 019:** rate cards are **empty** (test prices cleared; real pricing is a future delivery). New estimates will have unpriced line items until pricing lands — expected, not a bug.

**Still open (ops / housekeeping):**
- **Rotate** the Supabase, Anthropic, and Resend keys (they sat in local plaintext) — set the fresh values on `driveshop-api`. Confirm whether done.
- **`main` consolidation (optional):** merge `sprint-018-office-cost-correction` → `main` and repoint the Blueprint to `main` for a conventionally-named production branch. Triggers a redeploy.
- **Guardrail (unchanged):** do NOT generate client-facing PDFs for recap-stage estimates that have unplanned schedule items (see Deferred / DECISIONS).

## Just Shipped

**Sprint 017 — Deploy Readiness** (W1–W7 shipped, W8 investigated)
- **W1 — Agency fee on PDFs:** fee-basis lines now compute against estimate-wide non-fee revenue in `pdf_data_service.py`; PDF grand total matches the on-screen total and is internally consistent to the cent. Verified across all 5 estimates; non-fee output byte-identical.
- **W2 — Snapshot / CO / threshold correctness:** version snapshots delegate to the canonical engine (`estimate-totals.ts`); change-order baselines (Option A, per-segment) and `computeSegmentRevenue` now include fee-basis revenue and exclude unplanned. Verified against the real TS engine (Δ = agency fee, cost unchanged).
- **W3 — WeasyPrint on Render:** added root `Aptfile` (Pango/Cairo/gdk-pixbuf) so PDFs render in production.
- **W4 — render.yaml env vars:** declared the 5 missing backend vars (Resend key, data-feed key, approval base URL, frontend URL, extra CORS) + the `CLIENT_APPROVAL_EMAIL_ENABLED` gate; secrets `sync: false`.
- **W5 — Hybrid email mode:** client-facing approval email gated off for beta (backend-enforced via `CLIENT_APPROVAL_EMAIL_ENABLED`, frontend reads `/api/health`); internal routing, transitions, audit trail, and the confirm endpoint all intact; UI hides the Send button and shows the manual-approve path. Backend smoke-tested (`email_sent: false`, token still created, no Resend call).
- **W6 — Env hygiene:** removed the frontend Anthropic key + dead `src/lib/ai.ts`; gitignored `api/.env`; fixed a corrupted root `.env` line; (incidental) fixed a latent Node-types leak in `ScheduleGrid.tsx`.
- **W7 — Summary-tab section %:** each section header shows its revenue as % of total bid (read-only, derived from canonical totals; reconciles to the cent).
- **W8 — Office-cost formula correction (fixed in Sprint 018 Phase 1):** the inverted office labor cost/GP formula is corrected — `cost = day_rate × office_payout_pct` across all **five** sites (four add-time write paths + the `LaborEntryRow` read-time recompute, which now reads the stored value), collapsed to one `officeCostRate()` helper, with recompute-and-persist on the Corporate↔Office toggle and office-row rate change (all segments). Confirmed by Dave Morck (VP Ops) 2026-06-01, scoped to fee/non-pass-through; CFO sign-off (Tatiana) pending. `tsc` clean; 0 new eslint findings. No historical backfill (scope boundary). Live toggle click-through to be run by operator before close. See DECISIONS §W8.

## Recently Shipped

- **Sprint 016** — Rate Card Bulk Import (20-tab cost rate card; 14 new OEM clients, 46 fee_types, No-Client fallback)
- **Sprint 015** — Admin Settings UI for Financial Thresholds
- **Sprint 014** — Final Polish (client approval email, toasts, invoice-with-receipts PDF, data feed API)
- **Sprint 013** — Client-Specific Approval Routing
- **Sprint 012** — Unplanned Additions in Recap
- **Sprint 011** — Schedule Recap Actuals + Financial Summary Cards

## Next Up

**Sprint 018 — Sage Intacct CSV Export + Final QA**
CSV export for upload into Intacct (CSV-based, not an API integration). **The exporter is already COMPLETE** — the AR/Invoice + AP/Bill CSV pipeline (`accounting-review-service.ts` → `accounting-export-line-service.ts` → `accounting-csv-service.ts`) matches Tatiana's two templates field-for-field. So 018 is **not** a from-scratch build; it is:
1. **Populate the Intacct mapping data with real IDs** (the actual work) — `rate_card_items` AR item IDs + AP GL accounts (currently **0/967**, AR `itemId` has no fallback), fee_types equivalents, `clients.intacct_customer_id` (1/23) + dept/location defaults (0/23), per-estimate project/office-profile/revenue-segment. Today's few populated values are placeholder test data, not real Intacct IDs.
2. **Fix W8** (office cost-direction) — AP bill amounts are inverted until it's fixed.
3. **Confirm default scalar values** (`transactionType`, `exchRateType`, `referenceNo`/`billNo`/`dueDate` conventions; `dueDate` is unwired today).
4. **Decide corporate-event scope** (export is office-only by design).
5. Final QA pass folds in once beta feedback is collected.

Full readiness snapshot: `planning/sprints/018-intacct-export/NOTES.md`. (0 of 5 office estimates would produce a valid export today — only Test 10/Dallas clears the workflow gate, and it still fails at the line level on missing item/GL mappings.)

## Deferred

**Sprint 017 findings (need a decision before fixing — see DECISIONS.md for full data):**
- **W8 — Office-event cost/GP formula INVERTED — RESOLVED in Sprint 018 Phase 1** (moved to Just Shipped). Office labor cost is now `day_rate × office_payout_pct`; formula corrected across all five sites (single `officeCostRate()` helper) + recompute-and-persist on toggle/rate-change across all segments. Confirmed by Dave Morck (VP Ops); CFO sign-off pending.
- **PDF labor rollup diverges from canonical** on recap+unplanned estimates (PDF over-counts labor; +$1,995/+40% on Mazda Ride & Drive). Fix = point PDF at the canonical rollup. Guardrail: no client PDFs for recap-stage estimates with unplanned items.
- **CO deltas don't reflect the agency-fee ripple** (per-segment by design) — pending Tatiana.
- **Approval threshold is fee-blind** (per-segment by design) — governance call for Tatiana.
- **Totals computed in 5 independent places** — consolidate onto one engine (future sprint).
- **Data hygiene:** historical pipeline field `cost_rate` actually holds the source's **Margin %** — rename to `margin_pct` so it isn't mis-read again.

**Pre-existing / longer-term:**
- `driveshop.com` Resend sender domain verification (flip `CLIENT_APPROVAL_EMAIL_ENABLED=true` once verified to re-enable client email)
- Drop now-unused `@anthropic-ai/sdk` from the frontend `package.json` (no importers after W6)
- Internal / External / Vendor line type driving cost source (needs business-rule decisions)
- Locked rates on the corporate / no-client rate card; Internal/External/Vendor cost-mix on Summary (depends on type-driven logic)
- New rate card sections — Creator Services, Media, Talent (blocked on field defs + GL codes)
- Rate card data cleanup; Corporate event recap workflow
- Recap-variance overtime-multiplier reconciliation; data-feed totals performance (O(n))
- Location-aware historical patterns; per-estimate approver override (OOO); confirmation emails to client + AM on client approval
- Live broadcast of system settings to open tabs; default landing page setting
- Editing `is_unplanned` post-creation; unplanned items on client-facing PDFs
- SMS notifications; multiple receipt attachments per line item
- Change Order / Recap PDF options in Export dropdown
- Broader role-based workflow rules engine
