# Sprint 022 — Acceptance

Numbered so the diff read can cite them. Every box needs evidence, not assertion.

## Stage A — audit

1. [ ] `scripts/audit_client_accounting.sql` exists, contains only `SELECT` statements, and writes nothing. Proven by reading it: no `INSERT`, `UPDATE`, `DELETE`, `ALTER`, or `DROP` anywhere in the file.
2. [ ] Operator ran it and pasted back both result sets.
3. [ ] The output is recorded in the sprint folder or the briefing, so the "what is still missing" answer survives this conversation.

## Stage B — the merge

4. [ ] After the load there is **exactly one** client named `VW` and **no** client named `Volkswagen`.
5. [ ] That surviving `VW` record has **71** `rate_card_items`. (If it has 0, the wrong record survived. Stop.)
6. [ ] That record's `office_payout_pct` matches the non-standard value the Stage A audit showed, expected **0.80**. If the audit showed 80% on the old `VW` record, it was carried across, not lost.
7. [ ] No estimate changed which client it belongs to. If the audit found estimates on the old `VW` record, the Builder stopped and reported instead of proceeding.
8. [ ] The `clients` row count dropped by exactly **one**.

## Stage B — the customer IDs

9. [ ] **21** client records carry an `intacct_customer_id`; `No Client` is the only one still null.
10. [ ] Every ID matches the confirmed table in `requirements.md` **literally**. Spot-check at minimum: Bentley `C0091`, Lexus `C0134`, Hankook `C0255`, VW `C0208`.
11. [ ] `C0004` appears on **exactly two** records (Acura, Honda) and `C0099` on **exactly two** (Volvo, Volvo MS). Neither was "deduplicated" by a well-meaning uniqueness check.
12. [ ] The 7 IDs loaded in Sprint 019 are unchanged: Genesis `C0121`, Hyundai `C0019`, Lamborghini `C0156`, Maserati `C0028`, Mazda `C0029`, Toyota `C0048`, Volvo `C0099`.

## Safety

13. [ ] The Python script never opened a database connection. Proven by reading it: no `psycopg`, `supabase`, `requests`, or equivalent client.
14. [ ] The generated SQL is one atomic `BEGIN … COMMIT` and is safe to re-run.
15. [ ] The SQL touches only the `clients` table. No `fee_types`, no `rate_card_items`, no estimate table.
16. [ ] No application code changed. `git diff --stat` shows no file under `src/` or `api/`.
17. [ ] No schema change. No new migration file.

## Whole-sprint

18. [ ] `npx tsc -b --force` clean and `npx eslint .` shows no new findings versus the recorded baseline of **21 problems (17 errors, 4 warnings)**. Both should be untouched, since no application code changed; run them anyway to prove it.
19. [ ] Stage A's audit re-run after the load, with the output recorded. This is the verification, not the Builder's word.
20. [ ] `planning/DECISIONS.md` carries a new entry covering: the confirmed mapping and its provenance; that two customer IDs are intentionally shared by two clients each and any uniqueness validation must permit it; the VW merge and which record actually survived; and that Volvo MS shares Volvo's customer but needs its own rate table.
21. [ ] `planning/QUESTIONS.md` records the outstanding Tatiana ask created by this sprint: **AR payment terms** and **default department** per client, both required by the exporter and both blank on the Client Settings tab.
22. [ ] Roadmap row 022 flipped to `done`; `STATUS.json` set to `sprint-closed`; `ARCHITECT_BRIEFING.md` refreshed with real evidence and an honest `## Plan corrections`.

## Explicitly NOT in scope

This sprint does not make an estimate exportable and must not claim it does. Still missing afterward: AR payment terms, department, per-estimate project ID, revenue segment, event city and state. The Stage A audit exists to state that precisely rather than leave it implied.
