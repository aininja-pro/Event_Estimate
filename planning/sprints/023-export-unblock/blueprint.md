# Sprint 023 — Blueprint

Two independent pieces. A is data, B is code. They do not depend on each other, so build A first and get it applied while B is reviewed.

---

## Stage A — payment terms

### A1. `scripts/import_client_payment_terms.py` (new)

Mirror `scripts/import_client_accounting.py`, which is the closest precedent and already the right shape. Read it first.

```
python scripts/import_client_payment_terms.py            # dry-run, report only
python scripts/import_client_payment_terms.py --confirm  # also writes the .sql
```

The 21 terms from `requirements.md` live in the script as a literal dict with provenance in the docstring (Tatiana, `Customers with Pmt Terms.xlsx`, 2026-08-10). **No spreadsheet parsing.** The workbook is the source of the values, not a runtime input; transcribing them keeps the script dependency-free and reviewable. Never connects to the database.

### A2. `scripts/import_client_payment_terms.sql` (generated)

One `BEGIN … COMMIT`, safe to re-run, `clients` table only. One guarded update per client:

```sql
UPDATE clients SET default_payment_terms = 'Net 30' WHERE lower(name) = lower('Acura');
```

Close with a verification block in the same transaction, matching the Sprint 022 pattern:

```sql
DO $$
DECLARE n INT;
BEGIN
  SELECT count(*) INTO n FROM clients WHERE default_payment_terms IS NOT NULL;
  IF n <> 21 THEN
    RAISE EXCEPTION 'ABORT: % clients carry payment terms (expected 21). A client name probably does not match.', n;
  END IF;
END $$;
```

That guard is the protection against a silent name mismatch, which is the only realistic failure mode for a guarded update keyed on name.

### A3. Operator applies, then re-runs Query 1 of `scripts/audit_client_accounting.sql`

`missing_for_export` should no longer mention `ar_payment_terms` for any client.

---

## Stage B — the department fallback

Three touches in `src/lib/accounting-export-line-service.ts`, exactly as listed in `requirements.md`: widen the join at `:428`, widen the type at `:90`, append the fallback at `:273`.

Nothing else in the file changes. No other file changes.

### Flight evidence

**The acceptance invariant at risk:** precedence. The revenue segment must be the **last** resort, so an explicit department on the estimate or the client still wins.

**Discriminating example.** Take an estimate whose revenue segment is Experiential (`code = '300'`):

| `estimate.accounting_department_id` | `client.default_department_id` | Expected `departmentId` |
|---|---|---|
| `'999'` | null | **`'999'`** — explicit estimate value wins |
| null | `'888'` | **`'888'`** — client default wins over the segment |
| null | null | **`'300'`** — falls through to the segment |
| null | null, and no revenue segment selected | **`null`** — still reported missing |

A plausible wrong implementation puts the segment first in the chain, or replaces the client default instead of appending. Either gives `'300'` in row 1 or row 2, and both rows would look correct in a casual read of the diff. **A test that only covers the third row cannot go red for the wrong implementation** and is therefore not evidence.

**Paths verified while planning:**
- `:273` is the sole place `departmentId` is resolved (`grep "departmentId:"` returns `:106` type, `:273` resolution, `:312` consumption).
- `:428` already joins `revenue_segments(id, name)`; only `code` is missing.
- `revenue_segments.code` holds the department ID, confirmed against Tatiana's list: all 10 codes and names match what Sprint 019 loaded.

### How to verify it

The project has no automated test suite, so verification is by inspection plus a live check:

1. `npx tsc -b --force` must be clean. The type widening at `:90` is what makes `?.code` legal; if it compiles, the join and the type agree.
2. `npx eslint .` must show no new findings against the baseline of 21 problems (17 errors, 4 warnings).
3. **Operator check on a real estimate.** Mazda has 6 estimates. Open one, set a revenue segment, leave the department fields empty, and confirm the accounting review no longer reports `Department dimension is missing.` Then set an explicit department on the estimate and confirm **that** value is used instead. Row 1 and row 3 of the table above, on real data.

---

## Files the Builder may touch

**New:** `scripts/import_client_payment_terms.py` · `scripts/import_client_payment_terms.sql` (generated)

**Modified:** `src/lib/accounting-export-line-service.ts` (three touches, no more) · planning files at close

**Not touched:** `accounting-csv-service.ts` · `accounting-review-service.ts` · anything under `api/` · any UI file · any migration · `fee_types` · `rate_card_items` · estimate values.
