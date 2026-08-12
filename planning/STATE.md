# Current State

**Project:** DriveShop Event Estimate Engine
**Phase:** 2 — Beta Launch (priced estimates)
**Mode:** Directed

## Active Sprint

Sprint 020 — Rate Card Pricing Load + No-Price Guard — **SHIPPED (2026-08-02).**

DriveShop delivered real per-client pricing on 2026-07-24 (Dave Morck, by email). This sprint loaded it and closed the silent-$0 hole that would otherwise let an unpriced item reach a client PDF. Operator applied SQL + eyeball OK. Load: **1,397** `rate_card_items` (497 priced + 900 pass-through; −2 vs original 1,399 headline = skipped duplicate `I0217` High Markets rows). Stage B: `isUnpricedRate()` + three-table `estimate → in_review` gate + picker markers + Summary banner.

- **Source (staged 2026-07-27):** `data/imports/DriveShop_Rate_Card_Template_for_Dave - Updated.xlsx` — 20 client tabs, each carrying all 160 catalog items, prices filled where that client uses the item. SHA-256 `f4a6ff18fdc6c241d62b9bb0b4fb9a5a0de9a9145a16fbf816a19ebb5222b6f7`; every figure below was derived from that exact file. `data/` is gitignored (`.gitignore:46`), so the workbook is **not in version control** — it lives only on the operator's machine, same as the Sprint 019 imports. Back it up outside the repo; git cannot restore it.
- **The join is clean.** Architect verification 2026-07-27: all 160 Item IDs in the template match the catalog loaded in Sprint 019 **exactly** (0 unknown, 0 renamed, 0 duplicate names); all 20 tab names match existing `clients.name` rows exactly; the template's 6 sections are the app's 6 `rate_card_sections`. No fuzzy matching is required or permitted — Item ID is the key.
- **What loads:** **1,399** `rate_card_items` across 20 clients = **499** priced non-overtime rows + **900** pass-through rows (45 per client, `unit_rate` NULL, billed at client markup). **158** of the priced rows carry an overtime rate.
- **What does not load:** **1,223** blank rows (client does not use that item) and **140** priced standalone overtime items (money preserved via the parent row's Overtime Rate column — see the overtime decision below).
- **The guard:** an item with no rate on file must say so in the picker, and an estimate must not advance `estimate → in_review` while any non-pass-through line carries a zero/null rate. Four `unit_rate ?? 0` coercion sites are the hazard.

**Decisions taken with Ray, 2026-07-27** (Builder appends these to `DECISIONS.md` at close):
1. **Scope is prices only.** Corporate cost and the Intacct client settings are separate sprints (021+). Do not widen.
2. **Overtime is an attribute of the parent item.** Load the parent row's Overtime Rate column; do **not** create rate-card rows for the 29 standalone `.01` overtime items. They stay in `fee_types` for accounting and the Intacct export. This finally answers open question #3.
3. **No price ⇒ show it, flag it.** Unpriced items stay visible and clearly marked, and block approval. Do not hide them; do not silently zero them.

## Production Deployment — LIVE (since 2026-07-02)

Render Blueprint `driveshop-event-estimate` from `render.yaml`, deploying from branch **`main`** since 2026-08-10 (Sprint 021). Static frontend `event-history` + Python backend `driveshop-api`; the Branch setting was changed on both services. Push to `main` to deploy. Before 2026-08-10 the tracked branch was `sprint-018-office-cost-correction`; older notes describe that period. Full detail in DECISIONS §"Render deployment".

**Two operational items are still open and are now Sprint 021:**
- **Rotate** the Supabase, Anthropic, and Resend keys (they sat in local plaintext) and set fresh values on `driveshop-api`. Unconfirmed as of 2026-07-27 — treat as still exposed.
- **Consolidate production onto `main`** (merge the deploy branch, repoint the Blueprint). Anyone assuming `main` is production is currently wrong.

**Guardrail (unchanged):** do NOT generate client-facing PDFs for recap-stage estimates that have unplanned schedule items (see Deferred / DECISIONS).

## Just Shipped

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

See `planning/ROADMAP.md` for the full road (about 6 sprints).

- **Sprint 021 — Production Hardening.** Rotate the plaintext-era keys; consolidate the deploy branch onto `main`; confirm `/api/health` and one API-backed action end-to-end.
- **Sprint 022 — Client Settings + Intacct Customer Mapping.** Dave returned the "Client Settings" tab entirely blank. Confirm pass-through markup %, agency fee %, office payout % against what the app already holds, and map the remaining 16 clients to Intacct customer IDs. Needs Tatiana.
- **Sprint 023 — Catalog Amendments.** Dave's own follow-ups (see Open Questions).
- **Sprint 024 — First Real Intacct Export End-to-End.** Finishes Sprint 018 Phase 2.
- **Sprint 025 — Corporate Event Cost & Gross Profit.**

## Open Questions — routed to DriveShop (not blocking Sprint 020)

Raised by the 2026-07-27 review of Dave's pricing file. All four go to Dave/Tatiana; none block the load.

1. **Chauffeur market split shares one Item ID.** On the Maserati and Volvo tabs Dave split "Professional Chauffeur Hours" into *Standard Market* and *High Markets* at different prices, but both rows carry `I0217`. Accounting must issue a second Item ID (the pre-Sprint-019 rate card had exactly this split as LA/SF/NY vs all other markets).
2. **Four items flagged "Duplicate???"** by Dave on every tab, all left unpriced: `I0204` Vehicle Labor Days, `I0205` Vehicle Labor O/T Hours, `I0202` Vehicle Manager Days, `I0203` Vehicle Manager O/T Hours. They exist in the accounting catalog, so they need a decision, not deletion.
3. **Two new flat-rate items requested** in Dave's email: "EV Charging - Flat Rate" and "Per Diem". Both already exist as **pass-through** items (`I00601` EV Charging, `I0090` Per Diem). What he is asking for is a fixed-price variant of each — new catalog items needing their own Item ID and GL from accounting, not a rename.
4. **`I00601` is a malformed Item ID** — five digits where all 159 others are four. It arrived that way in Dave's own catalog file and is already loaded into `fee_types`. Confirm with accounting whether it should be `I0060` or something else.

Carried from the 2026-07-02 list, still open: the 16 client→Intacct-customer mappings (Sprint 022); the blank "In event estimate?" column; `4000.99`; per-item vs per-client office payout.

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
