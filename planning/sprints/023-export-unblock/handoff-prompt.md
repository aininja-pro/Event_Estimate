# Builder Handoff — Sprint 023: Export Unblock (Payment Terms + Department)

## Task contract

**objective**
All 21 clients carry their confirmed AR payment term, and the exporter resolves the department from the estimate's revenue segment when nothing more specific is set, so that the only remaining export blockers are per-estimate fields a user types in.

**owns**
- `scripts/import_client_payment_terms.py` (new) and `scripts/import_client_payment_terms.sql` (generated)
- `src/lib/accounting-export-line-service.ts` — **three touches only**: the join at `:428`, the type at `:90`, the fallback at `:273`
- Planning files at close

**must_not**
- No schema changes, no migration files. Both columns already exist.
- No database writes from code. Dry-run → `--confirm` → **operator** applies.
- Do not invent a payment term. Not in the table, stays null.
- **Do not reorder the department fallback chain.** The revenue segment goes last. An explicit estimate or client value must still win.
- **Do not remove `client.default_department_id`** from the chain, even though Tatiana says department belongs to the event. Removing it is an unrequested behavior change.
- Do not touch `accounting-csv-service.ts`, `accounting-review-service.ts`, the AR/AP amount maths, any UI file, or anything under `api/`.
- No per-estimate data entry and no UI work.
- Dave's catalog amendments are Sprint 024, not this sprint.

**acceptance**
`planning/sprints/023-export-unblock/acceptance.md`, criteria 1 to 24. Headline: **21** clients with payment terms, **one** changed file under `src/`, and precedence proven in **both** directions.

**verification**
```
python scripts/import_client_payment_terms.py
python scripts/import_client_payment_terms.py --confirm
npx tsc -b --force
npx eslint .
```
Plus: operator applies the SQL and re-runs Query 1 of `scripts/audit_client_accounting.sql`, and checks precedence on a real Mazda estimate.

---

## Read first

1. `requirements.md`, then `blueprint.md`, then `acceptance.md` in this folder.
2. `scripts/import_client_accounting.py` — the closest precedent, same shape, same safety posture.
3. `src/lib/accounting-export-line-service.ts` lines 85 to 115, 265 to 280, and 400 to 450 before changing anything.

## The trap

This sprint looks trivial and has one way to get it quietly wrong: **fallback order**.

Putting the revenue segment anywhere but last means it overrides an explicit department that somebody deliberately set on an estimate. The export still produces a file, the number is still a real department, and the diff looks fine. Nothing fails. It is simply wrong for every estimate that carries an override.

That is why acceptance 13 requires proving precedence in **both** directions on real data. Confirming only that the segment fills an empty department proves nothing about ordering.

## Baseline

`npm install` has been run. Current baseline, observed 2026-08-10:
- `npx tsc -b --force` → exit 0
- `npx eslint .` → **21 problems (17 errors, 4 warnings)**

Stage B is the first application-code change since Sprint 020, so state the after-numbers explicitly rather than asserting no change.

## Sequence

Build **Stage A first** and hand the SQL over for the operator to apply while Stage B is reviewed. They are independent; nothing is gained by coupling them.

## The code gate

Before creating or editing any file, stop, post your file-by-file plan, the scope guards, and the acceptance criteria you are targeting, and wait for explicit approval. This handoff is not that approval. Stage A approval is not Stage B approval.

## Two honest attempts

At most two focused repair attempts per validation failure. After the second, stop, write what you tried into `ARCHITECT_BRIEFING.md`, and hand back.

## At close

- `DECISIONS.md`: department is the revenue segment and belongs to the **event**, not the client (Tatiana, 2026-08-10); the exact fallback order and why the segment is last; payment terms are per-client free text taken from Intacct.
- `QUESTIONS.md`: mark #14 and #15 answered with provenance.
- Refresh `ARCHITECT_BRIEFING.md`, flip roadmap row 023 to `done`, set `STATUS.json` to `sprint-closed`.

**Do not claim the export works.** This sprint removes the last *client-level* blocker. Whether a real estimate exports depends on per-estimate fields nobody has filled in yet. If you attempt one and it fails, quote the exact message. That is a useful result, not a failed sprint.
