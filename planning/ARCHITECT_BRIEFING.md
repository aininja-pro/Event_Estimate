# Architect Briefing — DriveShop Event Estimate Engine

_Refreshed at Sprint 022 close, 2026-08-10._

## Where things stand

Three sprints landed in quick succession and the app is now genuinely usable. Dave's real prices are loaded and live, the safety net that stops an unpriced item becoming a silent $0 is finally deployed to production, and every client record now carries the Intacct customer ID that an invoice needs.

What is left before DriveShop can actually invoice out of this app is no longer ours. Two fields on every client, AR payment terms and department, are still empty, and only Tatiana can supply them. Dave still owes answers on a handful of catalog items. Neither is a build problem.

## Executive summary

- **Business outcome:** 22 client records, 21 carrying a confirmed Intacct customer ID; 1,397 priced rate-card rows live; unpriced lines visibly flagged and blocked from approval in production.
- **Current focus:** Sprint 023 (Dave's catalog amendments) and Sprint 024 (first real export), both gated on DriveShop, not on engineering.
- **What is proven:** Customer IDs loaded and verified by re-running the audit; VW merge completed with all 70 rate rows and the non-standard 0.8000 payout intact; total rate-card rows unchanged at 1,397; `tsc` clean; eslint 21 problems, identical to baseline; no application code touched this sprint.
- **What is not live / not proven:** No deploy has ever been verified by command. Sprint 020's Summary-to-PDF cent reconciliation is still unproven. No estimate can export yet: AR payment terms and department are missing on every client, and the per-estimate fields (project ID, revenue segment, event city and state) are user-entered and untested end to end.

## Readiness signals

| Signal | Status |
| --- | --- |
| 21 of 22 clients carry the confirmed Intacct customer ID | passed |
| VW merge preserved 70 rate rows and the 0.8000 payout | passed |
| No application code, no schema change, no new lint findings | passed |
| An estimate can produce a valid Intacct export | **attention** |
| Production deploy verified by command rather than by eye | **attention** |

## Validation / test status

**Tests:** 0 passing, 0 failing. (No automated suite for this sprint; evidence is command output plus operator-run SQL.)

- `python scripts/import_client_accounting.py` — dry-run listed 21 assignments and the three-step merge; flagged both shared IDs as intended.
- `python scripts/import_client_accounting.py --confirm` — wrote `scripts/import_client_accounting.sql` (148 lines, one transaction, `clients` table only).
- Operator applied the SQL, 2026-08-10. Both in-transaction guards passed.
- Post-load audit re-run confirmed: 22 clients, 21 with a customer ID, one `VW` at 70 rate rows and payout 0.8000, `C0004` on exactly two records and `C0099` on exactly two, all seven Sprint 019 IDs unchanged, rate-card rows still summing to 1,397.
- `npx tsc -b --force` exit 0. `npx eslint .` 21 problems (17 errors, 4 warnings), identical before and after.

## Evidence

The Stage A audit (`scripts/audit_client_accounting.sql`) is read-only and was run by the operator before anything was written. It produced the three facts the sprint turned on, none of which were knowable from the planning documents:

1. **`rate_card_items.client_id` is `ON DELETE CASCADE`**, confirmed from `information_schema` rather than migration files. The plan had asserted the opposite. Deleting a client silently destroys its rate card.
2. **Volkswagen held the 70 priced rows; the empty VW record held the non-standard 0.8000 payout.** The record to keep by data and the record to keep by name were different records, and the valuable setting was on the one being deleted.
3. **`default_currency` and `default_exchange_rate_type` were already populated** on every client, removing two fields from the assumed blocker list.

## Plan corrections

- **The blueprint's safety claim was wrong, in the most dangerous place.** Both `requirements.md` and `blueprint.md` stated FK constraints are RESTRICT so a mistake "fails loudly." `rate_card_items` and `client_contacts` are CASCADE. Only `estimates` is restrictive. The generated SQL therefore guards the delete explicitly instead of relying on the database to refuse it. Any future client merge must do the same.
- **The rate-row count was 70, not 71.** The planning figure came from counting lines mentioning "Volkswagen" in the generated Sprint 020 SQL, one of which was the `DELETE` scoping statement rather than an inserted row. Acceptance criterion 5 was amended before the build.
- **The settings-carry list was incomplete.** The plan named only `office_payout_pct`. The table also carries `third_party_markup`, `agency_fee`, `agency_fee_basis`, `trucking_markup`, `notes` and `is_active`. In the event only the payout differed between the two records, but the audit had to check all of them to establish that.
- **Verification could not run as written.** `node_modules` was absent, so `npx tsc` and `npx eslint` both failed and the "21 problems" baseline was quoted rather than observed. Resolved by running `npm install` before the build. Future sprints should not assume a working toolchain.
- **The sprint plan understated what remains.** It framed customer IDs as the client-level blocker. Tracing `accounting-export-line-service.ts:643-658` showed AR payment terms and department are equally hard requirements with no usable fallback. Logged as QUESTIONS #14 and #15.

## Current status (ops)

- Production deploys from `main` (since Sprint 021, 2026-08-10). Push to `main` to deploy.
- Sprint 020's price guard is live. Not independently exercised; the suggested check is to add a custom line at a 0 rate and confirm submit-for-review is blocked.
- Key rotation was dropped by decision, not oversight. No credential was ever committed.

## Recommended next Architect action

**Do:** Send Tatiana the two remaining field requests (AR payment terms, department) and Dave his catalog list including Volvo MS prices. Then plan Sprint 023, which can proceed on whatever Dave returns. Do not start Sprint 024 until both are answered; a real export needs them.
**Owner:** Ray, for both client conversations.
**Decision:** Whether to spend a short sprint on the deploy verification script before Sprint 024. It has been declined once and the gap is now five sprints old, and Sprint 024 is the first sprint whose success genuinely depends on production behaving as expected.
