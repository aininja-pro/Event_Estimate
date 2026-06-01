# Sprint 018 — Intacct CSV Export — Pre-sprint Readiness Notes

> Captured during Sprint 017 (read-only investigation, no code/data changed) after Tatiana
> provided the AR/Invoice and AP/Bill upload templates. **Read this before scoping 018 —
> the exporter is already built; 018 is data + correctness, not a from-scratch build.**

## 1. The exporter/pipeline is COMPLETE and matches Tatiana's templates field-for-field

Three layers already exist and are wired end-to-end:
- `src/lib/accounting-review-service.ts` — workflow gate (recap → submit for accounting review → approve → `export_ready`); office-only; permission-gated.
- `src/lib/accounting-export-line-service.ts` — builds structured AR/AP lines from recap actuals; resolves every Intacct dimension/mapping; emits per-field readiness issues + warnings.
- `src/lib/accounting-csv-service.ts` — serializes two CSVs, filenames, SHA-256 checksum, browser download + optional local save, `accounting_exports` audit record.

Column headers match exactly (count, order, names — including the `lineprojectId` vs `lineProjectId` casing quirk):
- **AR** `AR_INVOICE_UPLOAD_HEADERS` = the 19-col AR/Invoice template; **header-then-lines** (`repeatInvoiceFields ?? false`).
- **AP** `AP_BILL_UPLOAD_HEADERS` = the 16-col AP/Bill template; **header-repeated** (`repeatHeaderFields ?? true`).

It's client-side CSV generation (no API integration) — matches "CSV-based, not an API integration."

## 2. The blocker is DATA, not format — `rate_card_items` Intacct IDs are the wall

Population snapshot (as of Sprint 017):

| Field | Populated | State |
|---|---|---|
| `rate_card_items.intacct_ar_item_id` | **0 / 967** | 🔴 Empty — **the wall** |
| `rate_card_items.intacct_ap_gl_account_no` | **0 / 967** | 🔴 Empty |
| `rate_card_items.gl_code` (legacy AP fallback) | 325 / 967 (34%) | 🟡 Partial |
| `fee_types.intacct_ar_item_id` | 3 / 160 (2%) | 🔴 ~Empty |
| `fee_types.intacct_ap_gl_account_no` | 1 / 160 (1%) | 🔴 ~Empty |
| `fee_types.gl_code` (legacy AP fallback) | 59 / 160 (37%) | 🟡 Partial |
| `clients.intacct_customer_id` | 1 / 23 | 🟡 Partial (Mazda only) |
| `clients.default_payment_terms` | 1 / 23 | 🟡 Partial |
| `clients.default_department_id` / `default_location_id` | 0 / 23 | 🔴 Empty |
| `clients.default_currency` / `default_exchange_rate_type` | 23 / 23 | 🟢 Full |
| `office_accounting_profiles.*` (vendor/terms/dept/loc) | 1 / 1 | 🟢 Full (only one profile exists) |
| `estimates.accounting_customer_id` | 0 / 5 | 🔴 Empty (resolves via client) |
| `estimates.accounting_department_id` / `_location_id` | 1 / 5 | 🟡 Partial |
| `estimates.accounting_payment_terms` | 0 / 5 | 🔴 Empty |
| `estimates.intacct_project_id` | 2 / 5 | 🟡 Partial |
| `estimates.office_accounting_profile_id` / `revenue_segment_id` | 2 / 5 | 🟡 Partial |
| `estimates.event_city` / `_state` | 3 / 5 | 🟡 Partial |

**AR `itemId` has NO fallback** — if a line's rate-card item (or its fee type) lacks an Intacct AR item ID, that AR line is blocked. AP `glAccountNo` can fall back to legacy `gl_code` (34%/37% populated), so AP fares marginally better but is still mostly blocked.

## 3. The few populated values are placeholder TEST data, not real Intacct IDs

Where populated, the values are obvious test placeholders, not production Intacct identifiers:
customer `123456`, dept `1234`, location `12345`, project `ABC123`, item IDs `9999`/`9998`, GL `9999.99`. These must be replaced with real Intacct IDs (from finance), not just "filled in."

## 4. Workflow gate: only Test 10 / Dallas clears it today — and it still fails at line level

All 5 office estimates were checked against the readiness gate:
- 4 estimates blocked at the **gate level** (segment not `export_ready` / no approved accounting review / missing estimate-level dims).
- **Test 10 / "Dallas, TX"** is the only segment that clears the gate (it's `export_ready`, review `approved`, and has all estimate-level dims set — set up as the happy-path test). It **still fails at the line level**: of its 5 lines, only 2 resolve (via the 3 fee_types that happen to have Intacct IDs); **Creator Services Manager, Permit Research, and the Agency Fee** are missing both `itemId` and `glAccountNo`.

**Net: 0 of 5 office estimates would produce a valid CSV pair today.**

## 5. AP amounts depend on the W8 cost-direction fix

AP `transAmount` is the office payout/cost (`getLinePayoutAmount` / schedule `actual_cost_total`), derived from the office-payout formula that Sprint 017 W8 found **inverted** (see DECISIONS.md). **AP bill amounts will be wrong until W8 is confirmed with Tatiana and fixed.** Fix W8 before relying on any AP export.

## Sprint 018 actual scope (NOT a from-scratch build)

1. **Populate the Intacct mapping data** (the real work): `rate_card_items` AR item IDs + AP GL accounts (0/967), fee_types equivalents, `clients.intacct_customer_id` + dept/location defaults, per-estimate project/office-profile/revenue-segment — with **real** Intacct IDs from finance.
2. **Fix W8** (office cost-direction) first — AP amounts depend on it.
3. **Confirm default scalar values** against real Intacct: `transactionType` (`Sales Invoice`?), `exchRateType` (`Intacct Daily Rate`?), `message`, and the `referenceNo`/`billNo`/`dueDate` derivation conventions (note: builder never populates `dueDate` today — it's blank unless wired).
4. **Corporate-scope decision**: export is currently office-only by design. Decide whether corporate events should export too.
5. Final QA pass folds in once beta feedback is collected.
