# Sprint 022 — Blueprint

Three deliverables, in this order. Stage A is read-only and its output decides Stage B, so **A must run and be reviewed before B is generated.**

---

## Stage A — the audit (read-only, no writes anywhere)

### A1. `scripts/audit_client_accounting.sql` (new)

A plain SELECT script the operator runs in the Supabase SQL editor and pastes back. It writes nothing. Two queries:

**Query 1 — client accounting readiness.** One row per client, ordered by name:

```
name, intacct_customer_id, default_payment_terms, default_department_id,
default_location_id, office_payout_pct, third_party_markup, agency_fee,
primary_approver_id,
(count of rate_card_items for that client) AS rate_card_rows,
(count of estimates for that client)       AS estimates
```

This is the sprint's honest answer to "what is still missing." It also gives the Builder the facts it needs for the VW merge instead of guessing.

**Query 2 — VW merge safety check.** For each of the two records (`VW` and `Volkswagen`), everything that references it: estimate count, client contact count, rate-card row count, and its full settings row. If `VW` has any estimates, the merge stops.

### A2. Operator checkpoint

Ray runs both queries and pastes the output back. **The Builder does not proceed to Stage B without it.** Nothing about the merge or the settings can be safely generated from assumption.

---

## Stage B — the load

### B1. `scripts/import_client_accounting.py` (new)

Mirror `scripts/import_intacct_catalog.py` in structure, safety posture, and docstring style. Read it first.

```
python scripts/import_client_accounting.py            # dry-run, report only
python scripts/import_client_accounting.py --confirm  # also writes the .sql
```

The confirmed mapping from `requirements.md` lives in this file as an **explicit literal dict**, commented with its provenance (Tatiana, 2026-08-10). There is no matching logic, no spreadsheet to read, no inference. If a client name in the dict does not exist in the target, the generated SQL's guarded UPDATE simply affects zero rows and the report says so.

The script takes the Stage A audit output as input for the merge decisions (pass the relevant facts as explicit constants with a comment recording where they came from, the same way `import_rate_card_prices.py` records `OPERATOR_DECISIONS_APPLIED`).

**Dry-run report prints:**
- Each client and the customer ID it will receive, flagging the two intentional shared IDs.
- The exact VW merge sequence it will emit, including which settings are being carried across and why.
- A refusal, with reason, if the Stage A audit shows estimates attached to the `VW` record.

### B2. `scripts/import_client_accounting.sql` (generated)

One atomic `BEGIN … COMMIT`. Safe to re-run. Two parts, in this order:

**Part 1 — the VW merge** (must precede the rename to avoid a unique-name collision):
1. Carry any settings the `VW` record holds and `Volkswagen` lacks onto `Volkswagen`, `office_payout_pct` above all.
2. Repoint references from `VW` to `Volkswagen`.
3. `DELETE FROM clients WHERE lower(name) = lower('VW')`.
4. `UPDATE clients SET name = 'VW' WHERE lower(name) = lower('Volkswagen')`.

**Part 2 — the customer IDs.** One guarded `UPDATE` per client, keyed on `lower(name)`, exactly as Sprint 019 did:

```sql
UPDATE clients SET intacct_customer_id = 'C0091' WHERE lower(name) = lower('Bentley');
```

`No Client` gets no statement.

### B3. Operator applies, then re-runs the audit

Query 1 from Stage A is the verification. Re-running it after the load proves the state rather than asserting it.

---

## Flight evidence

**The acceptance invariant at risk:** that the merge preserves VW's economics. A plausible wrong implementation deletes the `Volkswagen` record instead of the `VW` one (following Tatiana's wording literally rather than the data), or renames before deleting, or drops `office_payout_pct`.

**Discriminating example:** after the load there must be **exactly one** client named `VW`, it must have **71** rate-card rows, and its `office_payout_pct` must equal the value the Stage A audit showed for whichever record carried the non-standard 80%. A wrong implementation gives 0 rate-card rows, or a 75% payout, or a failed transaction on a unique-name collision. Query 1 distinguishes all of these.

**Paths verified while planning this sprint:**
- `src/lib/accounting-export-line-service.ts:270-274` (the fallback chains) and `:643-658` (the required-field list) established which fields this sprint does and does not fix.
- `scripts/import_intacct_catalog.sql:190-209` confirmed office profiles carry `default_payment_terms` and `default_location_id` but **no** department.
- `scripts/import_rate_card_prices.sql` confirmed 71 rate-card rows on `Volkswagen` and 0 on `VW`.

---

## Files the Builder may touch

**New:** `scripts/audit_client_accounting.sql` · `scripts/import_client_accounting.py` · `scripts/import_client_accounting.sql` (generated)

**Modified at close:** `planning/DECISIONS.md` · `planning/STATE.md` · `planning/ROADMAP.md` (row 022 → `done`) · `planning/ARCHITECT_BRIEFING.md` · `planning/STATUS.json` · `planning/QUESTIONS.md`

**Not touched:** any `src/` or `api/` file · `fee_types` · `rate_card_items` · the exporter · any migration · any estimate's stored values.

This sprint changes **no application code**. If the Builder finds itself editing a `.tsx` or `.ts` file, it has left scope and should stop.
