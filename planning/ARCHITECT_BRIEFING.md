# Architect Briefing — DriveShop Event Estimate Engine

_Refreshed at Sprint 019 close + first production deploy, 2026-07-02._

## Where things stand

Two big things just happened. First, we threw out the app's made-up test items/prices and loaded DriveShop's real 160-item catalog — every item now carries the accounting IDs Intacct needs, which was the one thing blocking the export. Second, **the app is now actually deployed and running on Render for the first time** — a static frontend plus, crucially, the Python backend that was never set up before (that missing backend was why earlier deploys looked broken). It's live and the owner confirmed it's up. Two honest caveats: rate cards show **no prices** on purpose (real pricing is the next thing DriveShop owes us — Dave/Tatiana), and production currently deploys off a feature-named branch rather than `main`. A short list of loose ends is queued for the July 2 Dave meeting. Nothing is broken; historical data was never touched.

## Current status

- **Production deploy — LIVE (2026-07-02).** Render Blueprint `driveshop-event-estimate` from `render.yaml` on branch `sprint-018-office-cost-correction`; static `event-history` + Python `driveshop-api`. Backend env vars set + names verified. Owner confirmed running. See DECISIONS §"Render deployment". Open: rotate the plaintext-era keys; optional `main` consolidation; a quick `/api/health` + one API-backed action as final confirmation.
- **Sprint 019 — SHIPPED and applied to the live DB (2026-07-01).** Full-replace load succeeded, verified against the database.
- Verified post-load: `fee_types` = 160, with `intacct_ar_item_id` / `intacct_ap_gl_account_no` / `gl_code` all **160/160** (the 0/967 AR wall is gone). `rate_card_items` = **0** (test prices cleared). `office_accounting_profiles` = 15 real + 1 leftover test row. `revenue_segments` = 10 real + 1 leftover test row. `clients.intacct_customer_id` = 7/23. `historical_events` = 1,674, `historical_patterns` = 98 (unchanged). 6 test estimates preserved, their rate-card soft-links nulled.
- `tsc -b --force` clean. `eslint` shows only pre-existing findings (FeedbackPage, ScheduleGrid, EstimateBuilderPage, ui/*, schedule-service) — **zero** introduced by this sprint (it changed no TypeScript).

## Since last sprint

- Original Sprint 019 (reconcile app items → catalog by Revenue GL) was **abandoned mid-flight**: the Builder's Step 1 investigation proved GL is coarser than the catalog's Item IDs (one GL → up to 22 items), so it could clear only ~242/967. Re-scoped by Ray to "start fresh from the catalog."
- New Sprint 019 loaded the catalog as the item foundation, cleared test prices, loaded office/segment/customer reference data. Sprint 018 Phase 1 (office cost/GP inversion, W8) remains shipped.

## Architecture / file map

- **Load script (new):** `scripts/import_intacct_catalog.py` — reads `data/imports/Item IDs - Dave M Edits_06.24.26.xlsx` (160-item catalog) + `data/imports/Intacct Coding.xlsx` (offices/segments/customers); prints a dry-run; writes `scripts/import_intacct_catalog.sql` under `--confirm`; never writes to the DB. Mirrors `scripts/import_rate_cards.py`. Hard-aborts if the catalog fails validation.
- **Generated SQL:** `scripts/import_intacct_catalog.sql` — one atomic `BEGIN…COMMIT`; FK-safe order (detach soft-links → delete rate_card_items → delete fee_types → insert 160 → upsert offices/segments → update client customer IDs). Operator-applied via Supabase.
- **Schema (unchanged this sprint):** targets pre-existed in `scripts/migration_intacct_accounting_metadata.sql` + `scripts/migration_fee_types.sql`. `fee_types` is the catalog/master (referenced only by `rate_card_items.fee_type_id`, RESTRICT). `rate_card_items` is referenced by `labor_entries` / `estimate_line_items` / `schedule_entries` (RESTRICT; values denormalized at creation).
- **Exporter (unchanged, now unblocked at item-ID level):** `accounting-review-service.ts` → `accounting-export-line-service.ts` → `accounting-csv-service.ts`.

## Decisions (this sprint — full text in DECISIONS.md)

- Catalog is the single source of truth for item identity + GL; every item ships with its own Item ID, so AR item IDs are solved at the source (no matching).
- Reconciliation/GL-matching for item identity is abandoned (GL coarser than Item IDs) — do not revive.
- Prices are out of scope; rate cards intentionally empty until DriveShop delivers real pricing.
- Office payout not stored on `fee_types` (no column; app uses per-client `office_payout_pct`).
- Numeric-GL trailing-zero fix (2-decimal formatting; 3-part OT sub-accounts preserved as text).
- Reference upserts idempotent (`ON CONFLICT`); historical tables are JSON-only and untouched.

## Risks / watch-items

- **The app has items but no prices.** Any estimate built now has no rates until real pricing lands — this is expected, but it means no full export test yet.
- **Two leftover placeholder rows** (`Test Office`, `Test Revenue`) remain in the reference tables (idempotent upsert didn't remove them); still referenced by test estimates `Test 10` / `Mazda Test Drive`. Harmless; optional cleanup would require nulling those estimate FKs first (RESTRICT).
- **16 clients have no Intacct customer ID** (no clean name match) — export can't set a customer for them until mapped.
- **Production deploys off `sprint-018-office-cost-correction`, not `main`.** Anyone assuming `main` = production is wrong; `main` is ~2 sprints behind. Consolidate when convenient.
- **Plaintext-era keys not yet confirmed rotated** — Supabase/Anthropic/Resend keys sat in local plaintext; rotate and set fresh values on `driveshop-api`.
- eslint has pre-existing errors unrelated to this work (candidate for a future cleanup sprint).

## Open questions for the Architect / Dave (2026-07-02 meeting)

1. **Real per-client pricing** — the big one; when/what format does DriveShop deliver?
2. **16 client→customer mappings** — JLR="Jaguar Land Rover", VW vs Volkswagen, Acura/Honda composite, No Client, etc.
3. **9 non-standard office-payout items** — 7 Planning-&-Admin labor @ 0.50, 2 Professional Chauffeur @ 0.90 — intended?
4. **"In event estimate?" flag** — which catalog items are estimate-facing vs accounting-only (Dave's blank column).
5. **Overtime `.01` items** — separate items (as loaded) or an attribute on the parent?
6. **`4000.99`** — a GL in old test rate cards, absent from the catalog; ignore or map?

## Validation / test status

- Post-load DB verification: passed (counts + integrity above; 0 duplicate `intacct_ar_item_id`; GL trailing-zero fix confirmed on `I0012` → `5000.10`).
- `tsc` clean; no new eslint findings.
- Deploy: services created + built on Render; backend env-var names verified; owner confirmed "up and running." **Not yet independently exercised** — a `GET /api/health` and one API-backed action (AI scoping / PDF) would confirm end-to-end + CORS.
- Full end-to-end Intacct export test **not run** — needs a priced estimate (waits on real pricing). Noted, not forced (per blueprint).

## Recommended next Architect action

1. **Confirm the deploy end-to-end** — hit `/api/health`, run one API-backed action, verify no CORS block; then **rotate** the plaintext-era Supabase/Anthropic/Resend keys on `driveshop-api`. Decide whether to consolidate the production branch onto `main`.
2. **Run the 2026-07-02 Dave meeting** against the six open questions above, prioritizing **real per-client pricing** (unblocks the first genuine end-to-end Intacct export test) and the **16 client→customer mappings**.
3. Once pricing arrives, scope a short **Sprint 018 Phase 2 finish**: load prices, wire `dueDate`, confirm default scalars (`transactionType`, `exchRateType`), decide corporate-event export scope, and run the first real AR+AP export end-to-end.
