# Current State

**Project:** DriveShop Event Estimate Engine
**Phase:** 2 — Beta Launch (priced estimates)
**Mode:** Directed

## Active Sprint

Sprint 022 — Client Accounting Identity + VW Merge — **SHIPPED (applied 2026-08-10).**

Every client record now carries the Intacct customer ID Tatiana confirmed, and the duplicate VW/Volkswagen pair is one record.

- **21 of 22 clients carry a customer ID.** `No Client` is the only one without, deliberately: it is our internal fallback, not a DriveShop account.
- **VW merge done, data intact.** `Volkswagen` held the 70 priced rate-card rows; the empty `VW` record held the non-standard **0.8000** office payout. The payout was carried across before the delete, then `Volkswagen` was renamed to `VW` with code `VW` and customer `C0208`. Verified after the load: one `VW`, 70 rate rows, payout 0.8000. Total rate-card rows across all clients unchanged at **1,397** — nothing was lost.
- **Two customer IDs are shared by two clients each, by design:** `C0004` (Acura + Honda) and `C0099` (Volvo + Volvo MS). Any uniqueness check must permit this.
- **A live-catalog check found `rate_card_items.client_id` is `ON DELETE CASCADE`**, so deleting a client silently destroys its rate card. The load guarded the delete explicitly rather than trusting the database to refuse it. Future client merges must do the same.
- **Still blocking a real export, and not fixable by us:** AR payment terms (only Mazda has one) and department (no fallback anywhere). Both are Tatiana's, QUESTIONS #14 and #15.

## Production Deployment — LIVE (since 2026-07-02)

Render Blueprint `driveshop-event-estimate` from `render.yaml`, deploying from branch **`main`** since 2026-08-10 (Sprint 021). Static frontend `event-history` + Python backend `driveshop-api`; the Branch setting was changed on both services. Push to `main` to deploy. Before 2026-08-10 the tracked branch was `sprint-018-office-cost-correction`; older notes describe that period. Full detail in DECISIONS §"Render deployment".

**Both former operational items are closed (Sprint 021, 2026-08-10):** the branch was consolidated onto `main`, which is what finally put Sprint 020's price guard into production. Key rotation was **dropped by decision** after investigation showed no `.env` was ever committed and no real credential appears in any tracked file; the exposure was local-machine only. See RISKS for the full reasoning.

**Still unverified by command:** no deploy has ever been confirmed with a health check or an exercised API call, including the one that shipped the price guard. Carried since Sprint 017; logged as an accepted risk.

**Guardrail (unchanged):** do NOT generate client-facing PDFs for recap-stage estimates that have unplanned schedule items (see Deferred / DECISIONS).

## Just Shipped

**Sprint 021 — Production Branch Consolidation** (2026-08-10, operator-executed, no build)
- Both Render services repointed from `sprint-018-office-cost-correction` to `main`. A fast-forward: `main` was one commit ahead, the deploy branch held nothing `main` lacked. This put Sprint 020's price guard live for the first time; between 2026-08-02 and 2026-08-10 production had real prices and no guard.

**Sprint 020 — Rate Card Pricing Load + No-Price Guard** (2026-08-02)
- Loaded DriveShop's delivered per-client pricing: **1,397** `rate_card_items` across 20 clients (497 priced + 900 pass-through, 158 carrying an overtime rate). Estimators can build priced estimates again for the first time since the Sprint 019 catalog wipe.
- Added the unpriced-line guard: `isUnpricedRate()` plus a three-table `estimate → in_review` block, picker markers and a Summary banner.
- **One criterion closed as `attention`, not proven:** Summary-to-PDF cent reconciliation on a freshly built priced estimate. Still outstanding.

**Sprint 019 — Intacct Data: Start Fresh from DriveShop's Catalog** (applied to the live DB 2026-07-01)
- Replaced the app's placeholder items and test prices with DriveShop's real **160-item catalog**. Every item carries its own `intacct_ar_item_id` (`I0xxx`), Cost GL and Revenue GL, so the 0/967 AR-item-ID wall was cleared **at the source**. `fee_types` = 160 with AR/AP/revenue-GL 160/160/160.
- Reconciliation-by-GL was abandoned (proven impossible — GL is coarser than Item IDs). Do not revive it.
- `rate_card_items` deliberately left **empty** pending real pricing. **Sprint 020 fills them.**
- Reference tables loaded: 15 office profiles, 10 revenue segments, 7 of 23 clients matched to Intacct customer IDs.
- Historical data (1,674 events / 98 patterns) untouched. `tsc` clean; no new eslint findings.

**Sprint 018 Phase 1 — Office Cost Correction (W8)** — office labor cost corrected to `day_rate × office_payout_pct` across all five sites, collapsed to a single `officeCostRate()` helper in `estimate-totals.ts`, with recompute-and-persist on the Corporate↔Office toggle and office-row rate change. Confirmed by Dave Morck (VP Ops) 2026-06-01. CFO sign-off (Tatiana) still pending — revisit only if she dissents.

## Recently Shipped

- **Sprint 017** — Deploy Readiness (W1–W7 shipped, W8 investigated)
- **Sprint 016** — Rate Card Bulk Import (20-tab cost rate card; 14 new OEM clients, 46 fee_types)
- **Sprint 015** — Admin Settings UI for Financial Thresholds
- **Sprint 014** — Final Polish (client approval email, toasts, invoice-with-receipts PDF, data feed API)
- **Sprint 013** — Client-Specific Approval Routing
- **Sprint 012** — Unplanned Additions in Recap

## Next Up

See `planning/ROADMAP.md` for the full road. Sprints 020, 021 and 022 are done; three remain.

- **Sprint 023 — Catalog Amendments.** Dave's follow-ups: the chauffeur market split needing its own Item ID, the four "Duplicate???" items, flat-rate EV Charging and Per Diem, and the `I00601` typo. All blocked on accounting issuing IDs.
- **Sprint 024 — First Real Intacct Export End-to-End.** Finishes Sprint 018 Phase 2. **Blocked on Tatiana** for AR payment terms and department (QUESTIONS #14, #15), and on the per-estimate fields a user must fill in: project ID, revenue segment, event city and state.
- **Sprint 025 — Corporate Event Cost & Gross Profit.** Corporate estimates record no cost, so they show ~100% GP.

## Open Questions — routed to DriveShop

Full list with provenance in `planning/QUESTIONS.md`. Tatiana's customer mapping is **fully answered and loaded**; what follows is what remains.

**For Tatiana (blocks Sprint 024):** AR payment terms per client, and default department. Both were blank on the Client Settings tab; neither has a usable fallback in the exporter.

**For Dave:**

1. **Chauffeur market split shares one Item ID.** On the Maserati and Volvo tabs Dave split "Professional Chauffeur Hours" into *Standard Market* and *High Markets* at different prices, but both rows carry `I0217`. Accounting must issue a second Item ID (the pre-Sprint-019 rate card had exactly this split as LA/SF/NY vs all other markets).
2. **Four items flagged "Duplicate???"** by Dave on every tab, all left unpriced: `I0204` Vehicle Labor Days, `I0205` Vehicle Labor O/T Hours, `I0202` Vehicle Manager Days, `I0203` Vehicle Manager O/T Hours. They exist in the accounting catalog, so they need a decision, not deletion.
3. **Two new flat-rate items requested** in Dave's email: "EV Charging - Flat Rate" and "Per Diem". Both already exist as **pass-through** items (`I00601` EV Charging, `I0090` Per Diem). What he is asking for is a fixed-price variant of each — new catalog items needing their own Item ID and GL from accounting, not a rename.
4. **`I00601` is a malformed Item ID** — five digits where all 159 others are four. It arrived that way in Dave's own catalog file and is already loaded into `fee_types`. Confirm with accounting whether it should be `I0060` or something else.

Also open for Dave: the blank "In event estimate?" column; `4000.99`; per-item vs per-client office payout; and **Volvo MS prices** — Tatiana confirmed it runs its own rate table but Dave sent no Volvo MS tab, so it can invoice and cannot produce an estimate.

## Deferred

**Findings needing a decision before fixing (full data in DECISIONS.md):**
- **Corporate-event cost is not recorded at all.** The add paths set `cost_rate: null` for corporate-structure estimates, so corporate estimates show ~100% gross profit. Pre-existing — not caused by Sprint 019 or 020 — but it becomes highly visible the moment the beta runs corporate events. Sprint 025. Note: the Sprint 016 rate card carried per-item `corporate_cost` values that Sprint 019 deleted; they are recoverable from `scripts/import_rate_cards.sql` in git.
- **PDF labor rollup diverges from canonical** on recap+unplanned estimates (PDF over-counts labor; +$1,995/+40% on Mazda Ride & Drive). Fix = point the PDF at the canonical rollup. Guardrail above stands until then.
- **CO deltas don't reflect the agency-fee ripple** (per-segment by design) — pending Tatiana.
- **Approval threshold is fee-blind** (per-segment by design) — governance call for Tatiana.
- **Totals computed in 5 independent places** — consolidate onto one engine (future sprint).
- **Data hygiene:** historical pipeline field `cost_rate` actually holds the source's **Margin %** — rename to `margin_pct` so it isn't mis-read again.
- **Two leftover placeholder reference rows** (`Test Office`, `Test Revenue`) survive from Sprint 019, still referenced by test estimates. Harmless; cleanup needs those FKs nulled first (RESTRICT).
- **eslint has pre-existing errors** unrelated to recent work (FeedbackPage, ScheduleGrid, EstimateBuilderPage, ui/*, schedule-service) — candidate for a cleanup sprint.

**Pre-existing / longer-term:**
- `driveshop.com` Resend sender domain verification (flip `CLIENT_APPROVAL_EMAIL_ENABLED=true` once verified)
- Drop now-unused `@anthropic-ai/sdk` from the frontend `package.json`
- Internal / External / Vendor line type driving cost source (needs business-rule decisions)
- Locked rates on the corporate / no-client rate card; Internal/External/Vendor cost-mix on Summary
- New rate card sections — Creator Services, Media, Talent (blocked on field defs + GL codes)
- Corporate event recap workflow; recap-variance overtime-multiplier reconciliation
- Data-feed totals performance (O(n)); location-aware historical patterns
- Per-estimate approver override (OOO); confirmation emails to client + AM on client approval
- Live broadcast of system settings to open tabs; default landing page setting
- Editing `is_unplanned` post-creation; unplanned items on client-facing PDFs
- SMS notifications; multiple receipt attachments per line item
- Change Order / Recap PDF options in Export dropdown
- Broader role-based workflow rules engine
