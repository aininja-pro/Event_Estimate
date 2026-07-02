# Sprint 019 — Intacct Data: Start Clean from DriveShop's Catalog

Single phase, unblocked. Wipes the app's test items/prices and makes DriveShop's real 160-item catalog + accounting coding the foundation, so the item list is correct and the Intacct export is unblocked at the source. Real prices come later from DriveShop.

## Why this sprint changed (read this first)

The original plan tried to *reconcile* the app's existing items against DriveShop's catalog. The Builder's Step 1 investigation (2026-07-01) proved that can't work: revenue GL codes are coarser than the catalog's item IDs (one GL, e.g. `4025.12`, maps to 22 catalog items), so a machine cannot infer a unique Item ID from a GL. **Reconciliation abandoned.**

**Ray confirmed 2026-07-01: the items and per-client prices currently in the app are TEST data** (the app's ~125 test items and DriveShop's 160-item catalog overlap on only 8 names — almost entirely different lists). Decision (Ray, 2026-07-01): **start clean.** Delete the test items and prices, load DriveShop's catalog as the real foundation. Because every catalog item already carries its own Item ID + GL codes, the AR item-ID problem disappears.

## Approach — FULL REPLACE (confirmed with Ray 2026-07-01)

The app's item table (`fee_types`) has **no `is_active` flag**, so soft-deactivation isn't possible there and leaving legacy rows in place would collide with the real catalog (`name` is UNIQUE) and risk wrong-item exports. So we do a clean full replace. The Builder's Step 1 confirmed this is safe:

- **All 6 estimates are test/demo** ("Test Demo", "Test 10", etc.).
- **Historical data is fully insulated** — `historical_events` (1,674) and `historical_patterns` (98) store everything as JSON with **no foreign key** to `fee_types`/`rate_card_items`. A replace cannot touch them.
- Estimate/schedule/labor rows **copy** their `unit_rate`/`gl_code`/name at creation, so detaching the soft-link FK does not change any stored numbers.
- Done as **one atomic transaction (BEGIN/COMMIT), FK-safe order, operator-reviewed before it runs.**

## Boundary — prices are NOT in these files

DriveShop's catalog has **items and accounting codes, but no prices.** After this sprint the app has the correct item foundation with empty rate cards. **Real per-client pricing is a separate future delivery from DriveShop (Dave/Tatiana) — Ray will request new rate cards.** Do not invent prices.

## Work item 1 — Replace the item foundation with the catalog

Atomic transaction, in FK-safe order:
1. **Detach** test-estimate soft-links: `UPDATE estimate_line_items / schedule_entries / labor_entries SET rate_card_item_id = NULL` (~47 rows; denormalized values preserved).
2. **Delete** `rate_card_items` (~967 test rows — this also clears the test prices, Work item 2).
3. **Delete** `fee_types` (~143 now-unreferenced test rows).
4. **Insert** the 160 catalog items into `fee_types`: name ← Item Name; section ← Section; cost_type ← Cost Type; `gl_code` ← Revenue GL; `intacct_ar_item_id` ← Item ID; `intacct_ap_gl_account_no` ← Cost GL; `default_unit` / `accounting_memo` as available.

**Do NOT load catalog Office Payout** — there is no column for it (adding one is a schema change, out of scope), and the engine already uses per-client `clients.office_payout_pct`. The 9 items with a non-standard payout (7 at 50%, 2 at 90%) are logged as a question for Dave (see QUESTIONS.md); the 45 items at 100% are the pass-throughs.

## Work item 2 — Test prices cleared

Covered by Work item 1 step 2 (the `rate_card_items` delete). Rate cards are empty until DriveShop supplies real pricing.

## Work item 3 — Load the reference tables

- `office_accounting_profiles` ← Vendors-Affiliates (15 offices; skip the blank Corporate vendor row): office name, legal name ← Intacct Vendor Name, vendor ID, payment terms, location ID.
- `revenue_segments` ← Departments-Segment (10): name + code.
- `clients.intacct_customer_id` ← Customers: set the ~7 clean name matches (Genesis, Hyundai, Lamborghini, Maserati, Mazda, Toyota, Volvo); **list the 16 that don't cleanly match** (Acura, Audi, Bentley, Ferrari, Hankook, Honda, JLR, Lexus, Lucid, MB, Polestar, Porsche, VW, Volkswagen, Volvo MS, No Client) for the Dave meeting. Do not invent clients from the 289-row list.

## Acceptance (summary — full list in acceptance.md)

All 160 catalog items exist in `fee_types`, each carrying its own `intacct_ar_item_id`; test items + prices removed in one atomic, operator-reviewed transaction; historical data untouched; office + segment tables loaded; client→customer set for clean matches with the 16 exceptions listed; no schema changes; `tsc` + `eslint` clean.

## Open questions — for the 2026-07-02 Dave meeting (see QUESTIONS.md)

1. **Real per-client prices** — the app has items but no rates until DriveShop delivers new rate cards.
2. Estimate-facing vs accounting-only (Dave's blank "In event estimate?" column).
3. Overtime `.01` items — separate items or an attribute on the parent.
4. `4000.99` — a code seen in old test rate cards, not in the catalog.
5. Client→customer exceptions (the 16 above).
6. Office payout — 9 catalog items carry a non-standard per-item payout (7 at 50%, 2 at 90%); the app applies payout per client. How should these be handled?

## Out of scope

Schema changes (incl. any office-payout column); building/altering the exporter (Sprint 018 Phase 2, which this unblocks); real pricing; historical backfill; Resend/PDF/corporate-cost/pass-through work.
