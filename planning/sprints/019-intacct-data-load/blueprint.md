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
