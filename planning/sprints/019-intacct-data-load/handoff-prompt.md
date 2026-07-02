# Builder Handoff — Sprint 019 (Start Clean / Full Replace)

Your Step 1 report is approved. Proceed.

---

**Decisions from Ray (2026-07-01):**

1. **Full replace — approved.** Do exactly the atomic transaction you recommended: detach the 47 test-estimate soft-links → delete `rate_card_items` (~967) → delete `fee_types` (~143) → insert the 160 catalog items (Item ID → `intacct_ar_item_id`, Cost GL → `intacct_ap_gl_account_no`, Revenue GL → `gl_code`, mapped section + cost type). One `BEGIN/COMMIT`, FK-safe order, operator-applied after review. Ray will get real rate cards (prices) from DriveShop later — leave rate cards empty.
2. **Office payout — do NOT load it** (no column; the app uses per-client `clients.office_payout_pct`). Log the 9 non-standard-payout items (7 at 50%, 2 at 90%) as a question for Dave. No schema change.

Proceed to build `scripts/import_intacct_catalog.py` (mirroring `import_rate_cards.py`: reads both `.xlsx`, prints a dry-run, writes `scripts/import_intacct_catalog.sql` only under `--confirm`). Then load the reference tables — `office_accounting_profiles` (15), `revenue_segments` (10), `clients.intacct_customer_id` on the ~7 clean matches with the 16-client exception list output for the Dave meeting.

**Show the generated SQL + exact row counts and STOP before it is applied** — Ray/operator reviews and applies via Supabase. Scope guards: no schema changes, no exporter/`src`/`api` edits, no invented prices, no historical backfill, protect `historical_events`/`historical_patterns`. At close, update `planning/DECISIONS.md` and `planning/STATE.md` in place.
