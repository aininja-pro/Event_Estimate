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

---

# 2026-08-27 — Rapid-delivery record: sprints 024-026 built, full handover to DriveShop

*This record supersedes everything above it where they disagree. The work below ran outside the formal flight cadence at Ray's direction ("no blocks, best guess"), so it is logged as one consolidated record rather than per-sprint briefings.*

## Where things stand

The app is live on DriveShop's own infrastructure and in Dave's hands. GitHub (`DriveShopDave/Event_Estimate`), Render (both services), Supabase (ownership transferred; ref/URL/keys unchanged), and the Anthropic key are all theirs. Ray is an admin collaborator, not the host. Push to `origin` `main` to deploy their production.

## Shipped since the Sprint 023 record

- **Sprint 024 — catalog amendments, decided without Dave.** Volvo MS's rate card seeded from Volvo (69 rows, idempotent); `I0124` Travel overtime set to $80 on Lucid/MB. Three items deliberately NOT guessed because they need an Intacct Item ID only accounting can issue (chauffeur High Markets split, flat-rate EV/Per Diem, the `I00601` malformation) — a fabricated identifier on a real invoice is worse than the gap. Three of Dave's asks turned out to need no work at all (the four "Duplicate???" items are on zero rate cards; the estimate-facing column is moot because the builder reads per-client rate cards; `4000.99` is referenced nowhere). Applied by operator. **Post-script: Dave's own punch list later answered EV Charging — `I0012` = Flat Rate, `I00601` = Pass Through — so that gap closed itself.**
- **Sprint 025 (partial) — AP `dueDate` derived from payment terms** (`dueDateFromTerms()`, UTC arithmetic, blank on unparseable rather than guessed; 9 cases verified incl. leap day). `transactionType`/`exchRateType` confirmed already correctly defaulted. **The real finish line — an end-to-end AR+AP export on a priced estimate — has still never been run.**
- **Sprint 026 — corporate cost.** `corporateCostRate()` in `estimate-totals.ts` mirrors `officeCostRate()`; wired into both add paths AND both halves of the Corporate↔Office toggle recompute (the W8 lesson). Returns null, never 0, for uncosted rows. Load SQL: pass-throughs 100%, everything else 50% (recovered from the Sprint 016 cost card; Ray confirmed). First apply was **correctly rejected by its own guard** — 1466 rows vs the planned 1397, exactly the 69 Volvo MS rows Sprint 024 had added the same day. Expectations corrected; **operator re-apply not confirmed**.
- **Rate card UI:** OFFICE COST column shows the live derived payout on labor rows instead of a permanent dash (derived, deliberately not stored).
- **User Guide** shipped in-app (`public/guide.html`, sidebar link) — full lifecycle, role table, honest beta notes.
- **Admin Punch List** shipped (`punch_list_items` + RLS, service, page, sidebar) seeded from Dave's spreadsheet — the shared tracker replacing emailed spreadsheets. **Migration apply unconfirmed.**
- **AI outage fixed:** the three AI services were pinned to retired `claude-sonnet-4-20250514`, which DriveShop's brand-new Anthropic org couldn't use. Now `claude-opus-5`, parsing the first *text* block (Opus 5 can lead with a thinking block). Confirmed working on their key.

## Evidence

- `tsc` exit 0 and eslint at the 21-problem baseline after every code change; production build passes.
- Sprint 026 guard rejection + clean rollback observed by operator; corrected SQL regenerated.
- AI confirmed working by operator on DriveShop's key after the model fix.
- Handover verified: push to `DriveShopDave/Event_Estimate` succeeded; both Render services green on the new repo; Supabase transfer completed by operator.

## Plan corrections

- The roadmap's "blocked on Dave" for 024 dissolved under a no-blocks directive: most of his items needed verification, not answers. The one class never to guess: accounting identifiers.
- Sprint 026's guard caught same-day drift between sprints (Volvo MS seed). Guards with hardcoded expectations are doing exactly their job; keep them hardcoded.
- The briefing cadence itself lapsed during rapid delivery — this consolidated record is the correction.

## Recommended next Architect action

**Do:** Confirm the two unconfirmed applies (punch list migration, corporate-costs re-apply); then drive one real estimate to an accepted AR+AP export — that closes 025 and is the actual finish line. Work Dave's punch list as the beta backlog.
**Owner:** Ray (applies + export test), Dave (punch list answers).
**Decision:** When beta feedback slows, whether to resume formal sprint cadence or stay in directed rapid-delivery mode.
