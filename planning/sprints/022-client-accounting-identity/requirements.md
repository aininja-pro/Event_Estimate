# Sprint 022 — Client Accounting Identity + VW Merge

**Planned:** 2026-08-10
**Depends on:** Sprint 019 (office/segment reference data), Sprint 020 (rate cards), Tatiana's confirmed customer mapping
**Unblocks:** Sprint 024 (first real Intacct export)

## Why this sprint exists

The Intacct exporter has been built since Sprint 017 and has never produced a valid export, because the data it needs was never loaded. Sprint 019 loaded the item catalog. Sprint 020 loaded the prices. This sprint loads the last piece we actually have in hand: **who the customer is**.

Tatiana delivered and confirmed the full client-to-customer mapping on 2026-08-10. Every one of the 23 client records is now accounted for.

It also fixes a duplicate that has been sitting in the client list since Sprint 016, and it produces an honest answer to the question nobody can currently answer: **exactly what is still missing before an estimate can export.**

## Current behavior

- `clients.intacct_customer_id` is populated on **7** of 23 records (Sprint 019 name matches). The other 16 are null, so the exporter reports `Client Intacct customer ID is missing.` for every one of them.
- **VW and Volkswagen exist as two separate client records.** Dave's pricing tab was named "Volkswagen", so all **71** priced rate-card rows loaded onto the **Volkswagen** record. The **VW** record has **zero** rate-card rows.
- Nobody can say what else blocks an export without reading the exporter source.

## Desired behavior

- Every client record carries the customer ID Tatiana confirmed.
- One VW client record, named `VW`, holding the rate card, mapped to `C0208`.
- A read-only audit anyone can run that lists, per client, which export-required accounting fields are still empty.

## The mapping — confirmed, not derived

This table is the authority. It came from Tatiana's `Customers 8.10.26.xlsx` plus her explicit confirmations on 2026-08-10 (full provenance in `planning/QUESTIONS.md` §"Customer mapping — COMPLETE"). **Do not re-derive it by name matching. Do not fuzzy match. Load these literal values.**

| Client | Customer ID |
|---|---|
| Acura | `C0004` |
| Audi | `C0009` |
| Bentley | `C0091` |
| Ferrari | `C0202` |
| Genesis | `C0121` |
| Hankook | `C0255` |
| Honda | `C0004` |
| Hyundai | `C0019` |
| JLR | `C0026` |
| Lamborghini | `C0156` |
| Lexus | `C0134` |
| Lucid | `C0294` |
| Maserati | `C0028` |
| Mazda | `C0029` |
| MB | `C0032` |
| Polestar | `C0207` |
| Porsche | `C0041` |
| Toyota | `C0048` |
| VW *(the merged record)* | `C0208` |
| Volvo | `C0099` |
| Volvo MS | `C0099` |
| No Client | *(none — leave null)* |

**Two customer IDs are shared by two clients each, and this is intended and confirmed:** Acura and Honda both on `C0004` ("Acura/Honda" is a single Intacct account), and Volvo and Volvo MS both on `C0099` (Volvo MS is a program under Volvo). **Any uniqueness check must permit this.** A validation that rejects duplicate customer IDs is wrong.

## The VW merge

Tatiana: *"VW and Volkswagen should be just one client – VW. The correct ID for VW is C0208."*

The complication: the record she wants to keep **by name** is the empty one. The prices are on `Volkswagen`.

**Required approach — keep the data, move the name:**

1. **Audit first.** Determine what references the existing `VW` record: estimates, client contacts, `primary_approver_id`, and its settings, especially `office_payout_pct`. DECISIONS records VW at **80%** where the standard is 75%; if that value lives on the `VW` record it **must** survive onto the merged record, or every future VW estimate silently changes margin.
2. Copy any settings the `VW` record holds and `Volkswagen` lacks onto `Volkswagen`.
3. Repoint anything referencing `VW` to `Volkswagen`.
4. Delete the now-unreferenced `VW` record.
5. Rename `Volkswagen` to `VW` and set `intacct_customer_id = 'C0208'`.

**Order matters.** If a unique constraint exists on `clients.name`, renaming before deleting will fail. Delete the old record first, then rename.

**If step 1 finds estimates attached to the `VW` record, stop and report.** Moving estimates between clients is out of scope for this sprint and needs a separate decision.

## What is still missing after this sprint (deliberately)

This sprint does **not** complete export readiness, and must not claim to. Tracing `accounting-export-line-service.ts` (the `pushRequired` block, lines 643 to 658), a valid export also needs:

| Field | Source | Status after this sprint |
|---|---|---|
| `customerId` | client | **Fixed here** |
| `locationId` | estimate → client → **office profile** | Covered for office events; Sprint 019 loaded office `default_location_id` |
| AP `paymentTerms` | estimate → **office profile** → client | Covered; Sprint 019 loaded office `default_payment_terms` |
| AR `paymentTerms` | estimate → **client** only, no office fallback | **STILL MISSING** — needs Tatiana's "Pay Terms" column |
| `departmentId` | estimate → client → office profile | **STILL MISSING** — office profiles carry no department; needs Tatiana's "Default Dept ID" |
| `projectId` | estimate only, no fallback | Per-estimate, user-entered |
| `revenue_segment_id` | estimate only | Per-estimate, user-selected from the 10 loaded segments |
| `event_city`, `event_state` | estimate only | Per-estimate, user-entered |
| `vendorId` | office profile | Loaded Sprint 019 |

The audit deliverable exists to make this list concrete per client rather than theoretical.

## Constraints / out of scope

- **No schema changes.** Every column already exists.
- **No writes to the database from code.** Dry-run, then `--confirm` writes SQL, then the **operator** applies it. The script never opens a DB connection. This mirrors `import_intacct_catalog.py` and `import_rate_card_prices.py`.
- **Do not invent a customer ID, payment term, department, or location.** If it is not in the table above, it stays null.
- **Do not touch** `fee_types`, `rate_card_items`, the exporter, anything under `api/`, or any estimate's stored values.
- **Do not move estimates between clients.** If the VW audit finds any, stop and report.
- No per-estimate data entry. That is the user's job and Sprint 024's concern.

## Risks

- **The VW merge is the only destructive step in this sprint.** It deletes a client record. FK constraints are RESTRICT, so a mistake fails loudly rather than silently, but the audit-first sequence is mandatory, not optional.
- **Losing VW's 80% office payout** would change margins on every future VW estimate and would not be visible on screen. Explicitly checked in acceptance.
- Two clients legitimately sharing a customer ID will look like a bug to anyone reviewing the data later. Documented here and in DECISIONS at close.
