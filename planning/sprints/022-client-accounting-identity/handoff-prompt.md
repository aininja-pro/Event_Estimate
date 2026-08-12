# Builder Handoff — Sprint 022: Client Accounting Identity + VW Merge

## Task contract

**objective**
Every client record carries the Intacct customer ID Tatiana confirmed, the duplicate VW/Volkswagen pair is collapsed into one record that keeps its 71 priced rate-card rows and its 80% office payout, and there is a read-only audit that states exactly which export-required fields are still empty.

**owns**
- `scripts/audit_client_accounting.sql` (new, read-only)
- `scripts/import_client_accounting.py` (new)
- `scripts/import_client_accounting.sql` (generated)
- Planning files at close: `DECISIONS.md`, `STATE.md`, `ROADMAP.md`, `QUESTIONS.md`, `ARCHITECT_BRIEFING.md`, `STATUS.json`

**must_not**
- **No application code.** Nothing under `src/` or `api/`. This sprint changes no TypeScript and no Python app code. If you are editing a `.tsx`, you have left scope.
- No schema changes, no migration files.
- No database writes from code. Dry-run, then `--confirm` writes SQL, then the **operator** applies it. The script must never open a DB connection.
- Do not derive the customer mapping. It is a confirmed literal table in `requirements.md`. No name matching, no fuzzy matching, no spreadsheet parsing.
- Do not invent a payment term, department, or location. Missing stays null.
- Do not "fix" the two shared customer IDs. `C0004` on Acura and Honda, and `C0099` on Volvo and Volvo MS, are confirmed and intended.
- Do not move estimates between clients. If the audit finds estimates on the old `VW` record, **stop and report**.
- Do not touch `fee_types`, `rate_card_items`, the exporter, or any estimate's stored values.

**acceptance**
`planning/sprints/022-client-accounting-identity/acceptance.md`, criteria 1 to 22. Headline numbers: **21** clients with a customer ID, **one** `VW` record holding **71** rate-card rows at **0.80** payout, client row count down by **one**.

**verification**
```
python scripts/import_client_accounting.py
python scripts/import_client_accounting.py --confirm
npx tsc -b --force
npx eslint .
```
Plus: operator runs `scripts/audit_client_accounting.sql` before the load and again after, and pastes both results back. The after-run is the proof.

---

## Read first

1. `requirements.md`, then `blueprint.md`, then `acceptance.md` in this folder.
2. `scripts/import_intacct_catalog.py` end to end. Your script mirrors its structure and safety posture.
3. `scripts/import_intacct_catalog.sql` lines 248 to 255, for the exact guarded-UPDATE shape used to set customer IDs.
4. `planning/QUESTIONS.md` §"Customer mapping — COMPLETE" for the provenance of every value you are loading.

## The order is not negotiable

**Stage A is read-only and comes first.** You cannot safely generate the merge SQL without knowing what references the old `VW` record and which record holds the 80% payout. Write the audit, have the operator run it, read the output, then generate.

Within the merge, the sequence is: carry settings across, repoint references, **delete the old `VW`**, then **rename `Volkswagen` to `VW`**. Renaming first risks a unique-name collision.

## The trap in this sprint

Tatiana said "keep VW." The data says the prices are on **Volkswagen**. Following her wording literally, by deleting `Volkswagen`, destroys 71 priced rows. **Keep the `Volkswagen` record and rename it.** The name is cosmetic; the rate card is not.

The second trap is quieter: DECISIONS records VW at an **80%** office payout where every other client is 75%. If that value sits on the record being deleted and is not carried across, every future VW estimate silently changes margin and nothing on screen shows it. Acceptance criterion 6 exists for exactly this.

## The code gate

Before creating or editing any file, stop, post your file-by-file plan, the scope guards, and the acceptance criteria you are targeting, and wait for explicit approval. This handoff is not that approval.

## Two honest attempts

At most two focused repair attempts per validation failure. After the second, stop, write what you tried into `ARCHITECT_BRIEFING.md`, and hand back for a replan.

## At close

- Record in `DECISIONS.md`: the confirmed mapping and its provenance; that two customer IDs are shared by two clients each **by design** and any future uniqueness check must permit it; which VW record survived and why; that Volvo MS shares Volvo's customer ID but runs on its own rate table and currently has no prices.
- Record in `QUESTIONS.md` the ask this sprint surfaces: **AR payment terms** and **default department** per client. Both are hard requirements of the exporter (`accounting-export-line-service.ts:644-645`), both were blank on the Client Settings tab, and neither has an office-profile fallback for AR terms or any fallback at all for department.
- Refresh `ARCHITECT_BRIEFING.md` with plain-English `Where things stand`, `## Executive summary`, `## Readiness signals` (status exactly `passed` or `attention`), real test counts, `## Evidence`, `## Plan corrections`, and `Do` / `Owner` / `Decision`.
- Roadmap row 022 → `done`; `STATUS.json` → `sprint-closed`.

Be honest about what this sprint does not achieve. It does not make an estimate exportable. Saying so plainly is the correct result, not a failure.
