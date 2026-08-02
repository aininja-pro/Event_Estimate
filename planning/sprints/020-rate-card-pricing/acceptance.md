# Sprint 020 — Acceptance

Every box must be checked with evidence, not assertion. "It should work" is not a result.

## Stage A — the load

- [ ] The staged workbook `data/imports/DriveShop_Rate_Card_Template_for_Dave - Updated.xlsx` checksums to `f4a6ff18fdc6c241d62b9bb0b4fb9a5a0de9a9145a16fbf816a19ebb5222b6f7`, proving it is the file this sprint was planned against. It was not copied, renamed, or edited by the Builder.
- [ ] `python scripts/import_rate_card_prices.py` runs clean and writes nothing.
- [ ] The dry-run reports **1,399** rows to create = **499** priced + **900** pass-through, with **158** carrying an overtime rate, across **20** clients. Any deviation is explained in the report before the Builder proceeds.
- [ ] The dry-run reports **1,223** blank rows skipped and **140** priced standalone overtime items skipped.
- [ ] The exception block lists, at minimum: the 4 Right Seat Driver overtime conflicts/orphans on Lucid and MB; the 4 `Duplicate???` items; the duplicate `I0217` chauffeur rows on Maserati and Volvo. Nothing in that block was auto-resolved.
- [ ] Zero unresolved clients, sections, or Item IDs. (If any appear, the script aborted — that is correct behavior, and the sprint stops for a replan.)
- [ ] `--confirm` writes `scripts/import_rate_card_prices.sql`; the script still never opened a database connection.
- [ ] The SQL is a single `BEGIN … COMMIT`, is safe to re-run, and touches only `rate_card_items`.
- [ ] **After the operator applies it:** `rate_card_items` = 1,399; `fee_types` still = 160; `historical_events` = 1,674 and `historical_patterns` = 98, unchanged.
- [ ] Spot-check three tabs against the workbook by hand — MB (richest, 46 priced), Porsche (thinnest, 23), and Mazda — every price matches the cell it came from.
- [ ] **Operator eyeball:** Ray opens a client's rate card in the running app and confirms items, prices, overtime on the parent row, and rate-less pass-throughs. Approval recorded before Stage B starts.

## Stage B — the guard

- [ ] `isUnpricedRate()` exists in `src/lib/estimate-totals.ts` and is the only implementation of that condition in the codebase (`grep` proves no inline duplicates).
- [ ] A rate-card item with no rate shows **"no rate on file"** in all four pickers.
- [ ] A pass-through item shows **"billed at markup"**, never styled as an error.
- [ ] Submitting a segment for approval with an unpriced non-pass-through line is **blocked**, with a message naming the count and the offending items.
- [ ] The same submission **succeeds** once the line is priced or removed.
- [ ] Unplanned rows do not trigger the block.
- [ ] **A schedule-driven segment is blocked too.** A segment whose labor lives only in `schedule_entries` (no `labor_entries` rows) and that carries a non-pass-through role at `day_rate = 0` is blocked from `estimate → in_review`, with the role named. *(Added by plan review, PLAN-001.)*
- [ ] **An override-priced line is not blocked.** A `labor_entries` row with `unit_rate = 0` and a real `override_rate` submits successfully — the guard reads `override_rate ?? unit_rate`. *(Added by plan review, PLAN-002.)*
- [ ] **A percentage fee line is not blocked.** An `estimate_line_items` row with `fee_basis = 'total_estimate'` and `unit_cost = 0` submits successfully. *(Added by plan review, PLAN-003.)*
- [ ] The Summary tab shows an amber unpriced-lines banner when any exist, and no banner when none do.
- [ ] An estimate built entirely from priced items submits for approval with no change in behavior from before this sprint.

## Whole-sprint

- [ ] `npx tsc -b --force` is clean.
- [ ] `npx eslint .` introduces **zero** new findings. Pre-existing findings (FeedbackPage, ScheduleGrid, EstimateBuilderPage, ui/*, schedule-service) may remain; the Builder states the before/after counts. **The "before" count must be captured before the first Stage B source edit** — a baseline taken afterwards proves nothing. If `tsc` or `eslint` will not complete, stop and hand back rather than proceeding without a baseline. *(Clarified by plan review, PLAN-004.)*
- [ ] A full estimate is built end-to-end on a real priced client and its totals reconcile to the cent between the Summary tab and the internal PDF. **This is the proof the sprint worked** — the app has not produced a priced estimate since June.
- [ ] No schema change was made. No price was invented. No `fee_types` row changed.
- [ ] `docs/ARCHITECTURE.md` records the new importer alongside the Sprint 019 one. **`ARCHITECTURE.md` currently documents neither importer** (verified 2026-08-02), so the Builder adds both the Sprint 019 `import_intacct_catalog` entry and the Sprint 020 `import_rate_card_prices` entry. *(Clarified by plan review, PLAN-005.)*
- [ ] `planning/ROADMAP.md` row 020 is marked `done`.
- [ ] `planning/DECISIONS.md` carries a new `## Rate Card Pricing (Sprint 020)` section covering: Item ID as the sole join key; overtime as a parent attribute with standalone `.01` items accounting-only; blank = client does not use the item; pass-through = NULL rate by design; the unpriced-line guard, the three tables it covers, its exemptions (unplanned, pass-through, `fee_basis = 'total_estimate'`), and the accepted residual that a pass-through line item with no cost typed yet is not blocked.
- [ ] `planning/ARCHITECT_BRIEFING.md` refreshed, leading with plain-English `Where things stand`, and carrying `## Evidence`, `## Executive summary`, `## Readiness signals`, and `## Plan corrections`.
