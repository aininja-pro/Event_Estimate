# Sprint 023 — Acceptance

## Stage A — payment terms

1. [ ] `python scripts/import_client_payment_terms.py` runs clean and writes nothing.
2. [ ] Dry-run lists **21** clients and their terms, matching the table in `requirements.md` literally.
3. [ ] `--confirm` writes `scripts/import_client_payment_terms.sql`. The script imported no database client and opened no connection.
4. [ ] The SQL is one `BEGIN … COMMIT`, safe to re-run, and touches **only** the `clients` table.
5. [ ] After the operator applies it: **21** clients have `default_payment_terms`; `No Client` is the only null.
6. [ ] Spot-check against the source: Audi `Net 60`, Lexus `Net 45`, Porsche `Net 30`, VW `Net 60`.
7. [ ] Mazda still reads `Net 30` and was not disturbed.
8. [ ] Re-running Query 1 of `scripts/audit_client_accounting.sql` no longer reports `ar_payment_terms` in `missing_for_export` for any client.

## Stage B — department fallback

9. [ ] `src/lib/accounting-export-line-service.ts:428` joins `revenue_segments(id, name, code)`.
10. [ ] The type at `:90` includes `code: string | null`.
11. [ ] `:273` reads exactly:
    `ctx.estimate.accounting_department_id || client?.default_department_id || office?.default_department_id || ctx.estimate.revenue_segments?.code || null`
    with the revenue segment **last**.
12. [ ] `git diff --stat` shows **one** changed file under `src/`, and no other source file anywhere.
13. [ ] **Precedence proven on a real estimate, not just the third case.** On a Mazda estimate with a revenue segment set:
    - with `accounting_department_id` empty → export uses the segment's code
    - with `accounting_department_id` set to a distinct value → export uses **that**, not the segment
    Both observed and recorded. Testing only the first proves nothing about the ordering.
14. [ ] With a revenue segment selected and no explicit department, the accounting review no longer reports `Department dimension is missing.`
15. [ ] With **no** revenue segment selected and no explicit department, it still reports it missing. The fallback must not invent a department.

## Whole-sprint

16. [ ] `npx tsc -b --force` clean.
17. [ ] `npx eslint .` shows no new findings against the baseline **21 problems (17 errors, 4 warnings)**. State before and after.
18. [ ] No schema change, no migration file.
19. [ ] The CSV writers, the review gate, the AR/AP amount maths and everything under `api/` are untouched.
20. [ ] `planning/DECISIONS.md` records: department is the revenue segment and belongs to the **event**, not the client (Tatiana, 2026-08-10); the fallback order and that the revenue segment is deliberately last; payment terms are per-client free text sourced from Intacct.
21. [ ] `planning/QUESTIONS.md` marks #14 and #15 answered, with provenance.
22. [ ] Roadmap row 023 → `done`; `STATUS.json` → `sprint-closed`; `ARCHITECT_BRIEFING.md` refreshed with real evidence and an honest `## Plan corrections`.

## The honest close

23. [ ] The briefing states plainly which fields still block an export, and that they are all per-estimate and user-entered: `revenue_segment_id`, `intacct_project_id`, `event_city`, `event_state`. If a full export was attempted and failed on any of these, say so with the exact message rather than describing the sprint as complete.
24. [ ] If payment terms turn out to need an Intacct term **ID** rather than the label `"Net 30"`, record it as a finding for Sprint 025. Do not guess at a code.
