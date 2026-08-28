# Current State

**Project:** DriveShop Event Estimate Engine
**Phase:** 2 — Beta Launch (priced estimates)
**Mode:** Directed

## Active Sprint

None in flight. Sprints 020-024 shipped; 025/026 are built and partially applied (see Recently Shipped and the 2026-08-27 briefing record). **The app is handed over and live on DriveShop's own infrastructure.**

## Infrastructure — HANDED OVER TO DRIVESHOP (2026-08-27)

The entire stack now runs on DriveShop's accounts. Ray is a collaborator, not the host.

- **Code:** `https://github.com/DriveShopDave/Event_Estimate` (private) is the canonical repo; Dave's Render deploys from its `main`. Ray's `aininja-pro/Event_Estimate` is a backup mirror. Local remotes: `origin` = DriveShopDave (push to deploy production), `mine` = the backup.
- **Render:** two services in DriveShop's account — Python backend `driveshop-api` (root dir blank so the `Aptfile` installs WeasyPrint libs) and static `event-history`. Rebuilt by hand after the Blueprint apply dropped the `sync: false` env vars (known quirk — vars must be re-entered or copied from the old service).
- **Supabase:** project ownership transferred to DriveShop's org. **The project ref, URL and keys are unchanged by a transfer**, so no Render env changes were needed. Database, auth users, and the `receipts` storage bucket all moved together.
- **Anthropic:** AI features run on DriveShop's own Console org and key. The three AI services were moved off the retired `claude-sonnet-4-20250514` snapshot to `claude-opus-5` (a brand-new org cannot use the old snapshot — this outage is what surfaced it), and response parsing now takes the first *text* block since Opus 5 responses can lead with a thinking block.
- **Render GitHub credential gotcha (learned twice):** Render binds one GitHub identity to one Render user. Sharing Ray's GitHub across both Render accounts caused a credential tug-of-war; the fix was giving DriveShop's Render its own GitHub identity (DriveShopDave). If a deploy fails with `could not read Username`, the credential dropped — reconnect it in Render Account settings.
- **Ray's old Render services:** redundant; suspend (not delete) until the new stack has run clean for a few weeks — they hold the reference env vars.

**Still open (small):** punch list migration SQL apply unconfirmed; corporate-costs SQL re-apply (corrected 1466-row expectations) unconfirmed; Resend domain verification for client-facing email; optional custom domain.

## Previous Sprint

Sprint 023 — Export Unblock: Payment Terms + Department — **SHIPPED (2026-08-10).**

The last client-level export blockers are closed. Everything still missing is per-estimate data a user types in.

- **21 clients carry AR payment terms** (Net 30 x10, Net 45 x6, Net 60 x5; `No Client` deliberately null), from Tatiana's Intacct customer list.
- **Department now resolves from the estimate's revenue segment.** Tatiana confirmed the department *is* the revenue segment and belongs to the event, not the client. All 10 of her departments already existed as `revenue_segments` from Sprint 019, so no data was needed; the exporter simply was not selecting `revenue_segments.code`. Three touches in `accounting-export-line-service.ts`. Operator confirmed working on a real estimate.
- **Fallback order is `estimate → client → office → revenue segment → null`.** The segment is last so an explicit department still wins. Do not reorder.
- **Residual:** the override direction was not exercised. Confirm during Sprint 025 that an explicit department beats the segment.
- **Decided, not built:** office payout stays per client. Per-item payout would rewrite office margin calculation, and that formula was found inverted and fixed only in Sprint 018.

## Production Deployment

**Superseded 2026-08-27 — see "Infrastructure — HANDED OVER TO DRIVESHOP" above.** Production is DriveShop's Render, deploying `main` of `DriveShopDave/Event_Estimate`. History: Ray's Render hosted production from the first deploy (2026-07-02) until the handover; branch was `sprint-018-office-cost-correction` until 2026-08-10, then `main`.

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

See `planning/ROADMAP.md`. Sprints 020-024 done. What remains:

- **Sprint 025 — First Real Intacct Export End-to-End.** Partially done: AP due dates derive from payment terms, default scalars confirmed. The finish line — an actual AR+AP export produced on a priced estimate and accepted — has never been run. Nothing external blocks it; it needs a user to fill the per-estimate fields (project ID, revenue segment, city, state) and click export.
- **Sprint 026 — Corporate Event Cost.** Code shipped; the corrected load SQL (1466 rows) awaits confirmed operator apply.
- **Beta feedback loop:** the Punch List is the intake now. Dave's open items are the working backlog.

## Open Questions — routed to DriveShop

Full list with provenance in `planning/QUESTIONS.md`.

**Tatiana is fully answered.** Customer IDs, payment terms and department are all resolved and loaded. Nothing is waiting on her.

**Everything below is Dave's.** Recommendations are recorded in DECISIONS and QUESTIONS; most need only his confirmation.

1. **Chauffeur market split shares one Item ID.** On the Maserati and Volvo tabs Dave split "Professional Chauffeur Hours" into *Standard Market* and *High Markets* at different prices, but both rows carry `I0217`. Accounting must issue a second Item ID (the pre-Sprint-019 rate card had exactly this split as LA/SF/NY vs all other markets).
2. **Four items flagged "Duplicate???"** by Dave on every tab, all left unpriced: `I0204` Vehicle Labor Days, `I0205` Vehicle Labor O/T Hours, `I0202` Vehicle Manager Days, `I0203` Vehicle Manager O/T Hours. They exist in the accounting catalog, so they need a decision, not deletion.
3. **Two new flat-rate items requested** in Dave's email: "EV Charging - Flat Rate" and "Per Diem". Both already exist as **pass-through** items (`I00601` EV Charging, `I0090` Per Diem). What he is asking for is a fixed-price variant of each — new catalog items needing their own Item ID and GL from accounting, not a rename.
4. **`I00601` is a malformed Item ID** — five digits where all 159 others are four. It arrived that way in Dave's own catalog file and is already loaded into `fee_types`. Confirm with accounting whether it should be `I0060` or something else.

Also open for Dave, with recommendations already formed:
- **"In event estimate?" column** — propose the **83** items that appear on at least one rate card (77 of the 160 have never been priced by anyone) rather than asking him to fill in 160 blank rows.
- **Volvo MS prices** — Tatiana confirmed it runs its own rate table, but Dave sent no Volvo MS tab, so it can invoice and cannot produce an estimate. Recommendation: seed it from Volvo's rates (same customer, same 20% trucking markup, same 2.5% third-party markup) and let him adjust.
- **The four "Duplicate???" items** — recommendation: retire them. Unpriced on all 20 tabs, and equivalents already exist in the catalog.
- **Right Seat Driver Travel overtime (Lucid, MB)** — recommendation: $80. He priced the standalone item at exactly that and only missed the parent row's column.
- **`4000.99`** — recommendation: drop. Absent from the 160-item catalog; only ever appeared in pre-Sprint-019 test data.
- **Per-item vs per-client office payout — DECIDED, not open.** Staying per client; per-item will not be built. See DECISIONS.

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
