# Architect Briefing — DriveShop Event Estimate Engine

_Refreshed at Sprint 023 close, 2026-08-10._

## Where things stand

Four sprints landed in quick succession and the app is genuinely usable. Dave's prices are loaded and live, the guard that stops an unpriced item becoming a silent $0 is deployed, and every client carries its Intacct customer ID, payment term, and now a working department.

**Sprint 023 is done.** Payment terms applied, and the department now resolves from the estimate's revenue segment, confirmed working on a real estimate by the operator.

After that, nothing at the client level blocks an invoice. What remains is per-estimate data a user types in, and Dave's catalog answers.

## Executive summary

- **Business outcome:** 22 client records, 21 carrying a confirmed Intacct customer ID; 1,397 priced rate-card rows live; unpriced lines visibly flagged and blocked from approval in production.
- **Current focus:** finish Sprint 023 (two operator steps), then Sprint 024 (Dave's catalog amendments, gated on him) and Sprint 025 (first real export).
- **What is proven:** Customer IDs loaded and verified by re-running the audit; VW merge completed with all 70 rate rows and the non-standard 0.8000 payout intact; total rate-card rows unchanged at 1,397; `tsc` clean; eslint 21 problems, identical to baseline; no application code touched this sprint.
- **What is not live / not proven:** No deploy has ever been verified by command. Sprint 020's Summary-to-PDF cent reconciliation is still unproven. No estimate has exported yet: Sprint 023's payment-terms SQL is generated but not applied, department precedence is unverified, and the per-estimate fields (project ID, revenue segment, event city and state) are user-entered and untested end to end.

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

*Superseded — Tatiana answered both fields on 2026-08-10 and Sprint 023 was planned and built the same day. See the Sprint 023 build record below for the live next action.*

---

# Sprint 023 — build record (2026-08-10)

**Status: CLOSED 2026-08-10.** Operator applied the payment-terms SQL and confirmed the department resolves from the revenue segment on a real estimate.

## What was built

**Stage A — payment terms.** `scripts/import_client_payment_terms.py` generates `scripts/import_client_payment_terms.sql`: 21 guarded updates plus an in-transaction guard that aborts unless exactly 21 clients carry a term afterwards. Net 30 (10 clients), Net 45 (6), Net 60 (5). `No Client` deliberately null. The script imports no database client and opens no connection.

**Stage B — department fallback.** Three touches in `src/lib/accounting-export-line-service.ts` and nothing else:
- the join now selects `revenue_segments(id, name, code)`
- the type carries `code: string | null`
- `departmentId` resolves `estimate → client → office → revenue_segments.code → null`

The revenue segment is **last** on purpose, so an explicit department still wins. Both the type and the resolution carry comments saying so, because a reordering would still produce a plausible department and would not announce itself.

## Evidence

- `python scripts/import_client_payment_terms.py --confirm` — wrote 51 lines, one transaction, `clients` only, 21 updates.
- `npx tsc -b --force` → exit 0.
- `npx eslint .` → **21 problems (17 errors, 4 warnings)**, identical to the baseline recorded before the change.
- `git diff --stat src/` → one file, 11 insertions, 3 deletions.

## Outstanding after close — one accepted residual

**Acceptance 13 was met in one direction, not both.** The operator confirmed that a revenue segment fills an empty department (`"department works"`, 2026-08-10). The reverse — that an explicit `accounting_department_id` on an estimate still **overrides** the segment — was not exercised.

Why this is a real, if small, residual: the fallback is written with the segment last, and the code was read to confirm the ordering, so the risk is low. But if the ordering were ever wrong, the symptom is invisible — the export still produces a plausible department, just the wrong one, on exactly those estimates that carry a deliberate override. Worth one minute during Sprint 025's first real export: set a department on an estimate that also has a revenue segment and confirm the export uses the department.

## Plan corrections

- **None on the plan itself.** The three touches were exactly where the blueprint said, and the fallback chain at `:273` was the sole resolution point as claimed.
- Line numbers shifted by roughly 8 after the type comment was added; the blueprint's `:273` is now `:281`. Cosmetic.

## Decisions taken this sprint

- **Office payout stays per client.** Per-item payout will not be built. Rationale in DECISIONS: it rewrites office margin calculation across the app, and that formula was found inverted and fixed only in Sprint 018. Revisit only on evidence from Dave that the variance is material.
- **Estimate-facing items: propose the 83.** Only 83 of 160 catalog items appear on any rate card; 77 have never been priced. Ask Dave to confirm those rather than fill in 160 blank rows.
- **The four "Duplicate???" items: recommend retiring them.** He left all four unpriced on all 20 tabs, and equivalents already exist in the catalog.

## Recommended next Architect action

**Do:** Apply the payment-terms SQL and run the two-direction precedence check, then close 023. Send Dave the catalog list including Volvo MS prices and the 83-item proposal.
**Owner:** Ray.
**Decision:** Still open from Sprint 021 — whether to build the deploy verification script before Sprint 025. Sprint 025 is the first sprint whose success depends on production behaving as expected, and no deploy has ever been confirmed by command.
