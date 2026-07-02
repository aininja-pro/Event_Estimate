# Architect Pack 019 — Intacct Data: Start Clean from DriveShop's Catalog

**Mode:** Existing Project / Feature or Fix
**Date:** 2026-07-01 (final: full replace / start clean)
**Apply from the repo root:**

```
node scripts/apply-architect-pack.js planning/architect-packs/architect-pack-019-intacct-data-load.md --dry-run
node scripts/apply-architect-pack.js planning/architect-packs/architect-pack-019-intacct-data-load.md
```

This pack rewrites the four Sprint 019 files and the open-questions log. It does not touch STATE.md or DECISIONS.md (updated in place at sprint end) and changes no application code. Everything below the first delimiter is parsed by the apply script.

============================================================
FILE: planning/sprints/019-intacct-data-load/requirements.md
============================================================

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

============================================================
FILE: planning/sprints/019-intacct-data-load/blueprint.md
============================================================

# Sprint 019 — Blueprint (Start Clean / Full Replace)

Data-load sprint. **Full gate before any DB write.** Mirror the `scripts/import_rate_cards.py` pattern: a script that reads the source `.xlsx`, prints a dry-run summary, and only writes SQL under `--confirm`; an operator applies the SQL via Supabase after review. No application code changes.

## Operating rules for the Builder

- Read CLAUDE.md / AGENTS.md, `planning/STATE.md`, `planning/DECISIONS.md`, `planning/DOMAIN.md`, `planning/RISKS.md`, `planning/QUESTIONS.md`, this requirements.md + acceptance.md, and `scripts/import_rate_cards.py`.
- **Confirmed (do not re-litigate):** app items + prices are test data; full replace is approved; DriveShop's catalog is the real foundation; prices are not in these files and are out of scope; office payout is not loaded.
- The replace runs as **one atomic transaction (BEGIN/COMMIT), FK-safe order, operator-applied after review.** Protect `historical_events` / `historical_patterns` (JSON, no FK — untouched).
- Smallest safe change. Reuse existing import/seed machinery; no new dependencies, no schema.

## Step 1 — Investigate + dry-run report — DONE (2026-07-01)

Completed and approved. Schema targets confirmed present; catalog confirmed clean (160, 0 dup IDs/names, all fields populated, sections + cost types map 1:1); dependency map established (rate_card_items 967 → fee_types RESTRICT; estimate_line_items/schedule_entries/labor_entries → rate_card_items RESTRICT, 47 soft-links on 6 test estimates; historical JSON insulated); full replace approved.

## Step 2 — Load catalog + full replace (Work items 1 & 2) [APPROVAL GATE]

Build `scripts/import_intacct_catalog.py` (mirrors `import_rate_cards.py`: reads both `.xlsx`, prints dry-run, writes `scripts/import_intacct_catalog.sql` only under `--confirm`). The SQL is one atomic transaction: detach 47 soft-links → delete `rate_card_items` → delete `fee_types` → insert the 160 catalog items with Item ID / GL codes / section / cost type. Do not load office payout. Show a sample of the generated inserts and the exact row counts. Operator applies after review.

## Step 3 — Reference tables (Work item 3) [APPROVAL GATE]

Same script (or a sibling): upsert `office_accounting_profiles` (15) and `revenue_segments` (10); set `clients.intacct_customer_id` on the ~7 clean matches and **output the 16-client exception list** for the Dave meeting. Idempotent upserts.

## Step 4 — Apply + verify

Operator applies the reviewed SQL via Supabase. Verify: 160 items present, each with `intacct_ar_item_id` (export no longer blocked by missing item IDs); test items/prices gone; `historical_events` count unchanged (1,674); offices (15) + segments (10) loaded. `tsc` + `eslint` clean. (A full end-to-end export test needs a priced estimate and waits on real pricing — note it, don't force it.)

## Step 5 — Update planning docs (edit in place — do NOT rewrite blind)

- `planning/DECISIONS.md`: record the pivot — app items/prices were test; started clean from DriveShop's catalog (full replace, atomic, historical insulated); reconciliation/GL-match abandoned (GL coarser than Item IDs); office payout not loaded (no column; per-client model); prices are a separate future delivery.
- `planning/STATE.md`: mark Sprint 019; note Sprint 018 Phase 2 (export) unblocked at the item-ID level, pending real pricing for a full export test.

## Out-of-scope reminder

No schema changes, no exporter changes, no invented prices, no historical backfill. If a target column is missing or the transaction looks risky to real data, STOP and report.

============================================================
FILE: planning/sprints/019-intacct-data-load/acceptance.md
============================================================

# Sprint 019 — Acceptance Criteria (Start Clean / Full Replace)

## Catalog + replace

- [ ] All 160 catalog items exist in `fee_types` with name, section, cost type, revenue `gl_code`, `intacct_ar_item_id` (Item ID), `intacct_ap_gl_account_no` (Cost GL).
- [ ] **Every item carries its `intacct_ar_item_id`** — no item missing an AR ID.
- [ ] Test `fee_types` (~143) and `rate_card_items` (~967) removed; 47 test-estimate soft-links detached (their stored numbers unchanged).
- [ ] The whole replace ran as one atomic transaction, operator-applied after review.
- [ ] Office payout NOT loaded (no column); the 9 non-standard-payout items logged for Dave.

## Data safety

- [ ] `historical_events` (1,674) and `historical_patterns` (98) unchanged — untouched by the replace.
- [ ] No schema changes.

## Reference tables

- [ ] `office_accounting_profiles` has 15 offices (vendor ID, location ID, payment terms); blank Corporate row not loaded as a vendor.
- [ ] `revenue_segments` has 10 segments (name + code).
- [ ] `clients.intacct_customer_id` set on the ~7 clean matches; the 16-client exception list output for the Dave meeting; no clients invented from the 289-row list.
- [ ] Reference upserts idempotent.

## System

- [ ] `tsc` clean; `eslint` clean.
- [ ] DECISIONS.md + STATE.md updated in place.

## Explicitly NOT required this sprint

- Real per-client prices (separate future DriveShop delivery — items load with empty rate cards).
- A full end-to-end Intacct export test (needs a priced estimate).
- Estimate-facing flag, overtime modeling, `4000.99`, client/customer exceptions, office-payout model — all deferred to the Dave meeting.

============================================================
FILE: planning/sprints/019-intacct-data-load/handoff-prompt.md
============================================================

# Builder Handoff — Sprint 019 (Start Clean / Full Replace)

Your Step 1 report is approved. Proceed.

---

**Decisions from Ray (2026-07-01):**

1. **Full replace — approved.** Do exactly the atomic transaction you recommended: detach the 47 test-estimate soft-links → delete `rate_card_items` (~967) → delete `fee_types` (~143) → insert the 160 catalog items (Item ID → `intacct_ar_item_id`, Cost GL → `intacct_ap_gl_account_no`, Revenue GL → `gl_code`, mapped section + cost type). One `BEGIN/COMMIT`, FK-safe order, operator-applied after review. Ray will get real rate cards (prices) from DriveShop later — leave rate cards empty.
2. **Office payout — do NOT load it** (no column; the app uses per-client `clients.office_payout_pct`). Log the 9 non-standard-payout items (7 at 50%, 2 at 90%) as a question for Dave. No schema change.

Proceed to build `scripts/import_intacct_catalog.py` (mirroring `import_rate_cards.py`: reads both `.xlsx`, prints a dry-run, writes `scripts/import_intacct_catalog.sql` only under `--confirm`). Then load the reference tables — `office_accounting_profiles` (15), `revenue_segments` (10), `clients.intacct_customer_id` on the ~7 clean matches with the 16-client exception list output for the Dave meeting.

**Show the generated SQL + exact row counts and STOP before it is applied** — Ray/operator reviews and applies via Supabase. Scope guards: no schema changes, no exporter/`src`/`api` edits, no invented prices, no historical backfill, protect `historical_events`/`historical_patterns`. At close, update `planning/DECISIONS.md` and `planning/STATE.md` in place.

============================================================
FILE: planning/QUESTIONS.md
============================================================

# Questions

| Date | Question | Needed From | Status | Answer |
| --- | --- | --- | --- | --- |
| 2026-07-01 | Real per-client PRICES — the catalog has items but no rates. Ray to request new rate cards; what format / when? | Dave / Tatiana | Open | TBD |
| 2026-07-01 | Which catalog items are estimate-facing vs accounting-only? (Dave's blank "In event estimate?" column) | Dave | Open | TBD |
| 2026-07-01 | Overtime `.01` items — separate items or an attribute on the parent item? | Dave | Open | TBD |
| 2026-07-01 | `4000.99` appears in old test rate cards but not the catalog — ignore or map to something? | Dave | Open | TBD |
| 2026-07-01 | Client→customer exceptions (16 clients incl. JLR = "Jaguar Land Rover", Acura/Honda composite, Lucid/VW/Hankook/MB) — confirm the mapping. | Tatiana | Open | TBD |
| 2026-07-01 | Office payout — 9 catalog items carry a non-standard per-item payout (7 at 50%, 2 at 90%); the app applies payout per client. How should these be handled? | Dave | Open | TBD |
