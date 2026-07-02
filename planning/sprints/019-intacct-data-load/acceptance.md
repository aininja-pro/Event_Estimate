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
