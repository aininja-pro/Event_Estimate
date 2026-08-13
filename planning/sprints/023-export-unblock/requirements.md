# Sprint 023 — Export Unblock: Payment Terms + Department

**Planned:** 2026-08-10
**Depends on:** Sprint 022 (customer IDs), Tatiana's answers of 2026-08-10
**Unblocks:** Sprint 025, the first real Intacct export

## Why this sprint exists

After Sprint 022, four client-level fields were required by the exporter and two were still empty on every client: **AR payment terms** and **department**. Tatiana answered both on 2026-08-10. Neither answer needs anything further from DriveShop, so this sprint closes the last client-level gap.

It is deliberately small: one data load and one three-line fallback. It is also the first sprint since 018 to change application code.

## What Tatiana answered

**1. Payment terms.** She sent `Customers with Pmt Terms.xlsx` (298 customers, a `Term` column). Every one of our 21 mapped customer IDs has a term; none is blank.

**2. Department.** Quoting her directly:

> "the Department refers to the Revenue Segment. I have attached a list of the Revenue Segments we use. The Department is associated with the event, not the client."

Her `Revenue Segments.xlsx` lists 10 departments. **We already have all 10**, loaded in Sprint 019 into `revenue_segments` with `code` holding the department ID. Verified match, all ten, codes and names:

| Code | Name | | Code | Name |
|---|---|---|---|---|
| 150 | Auto Media Events | | 450 | Lifestyle Media Events |
| 200 | Auto Media Loans | | 500 | Lifestyle Media Loans |
| 300 | Experiential | | 700 | Content Production |
| 310 | Exp Affiliate Events | | 750 | Media Buying |
| 320 | Exp Affiliate Fleet | | 800 | Admin Services |

**So department needs no data at all.** It needs the exporter to look in the right place.

## Current behavior

**Payment terms:** `clients.default_payment_terms` is null on 20 of 21 clients. Only Mazda has one, "Net 30". The exporter treats AR payment terms as a hard requirement with **no fallback** (`accounting-export-line-service.ts:644`), so every invoice fails.

**Department:** `accounting-export-line-service.ts:273` resolves it as:

```
estimate.accounting_department_id || client.default_department_id || office.default_department_id || null
```

All three are null in practice, so every AR and AP line fails on `Department dimension is missing.` (`:645`, `:655`). The estimate's revenue segment **is** the department per Tatiana, but the exporter never reads it. The query already joins `revenue_segments(id, name)` at `:428` and simply does not select `code`.

## Desired behavior

- All 21 clients carry their confirmed AR payment term.
- Department resolves from the estimate's revenue segment when nothing more specific is set, so selecting a revenue segment on an estimate is enough.
- The remaining export blockers are per-estimate and user-entered only.

## The payment terms — confirmed, not derived

From `Customers with Pmt Terms.xlsx`, joined on the customer IDs Sprint 022 loaded. Load these literal values.

| Client | Term | | Client | Term |
|---|---|---|---|---|
| Acura | Net 30 | | Lucid | Net 45 |
| Audi | Net 60 | | Maserati | Net 60 |
| Bentley | Net 60 | | Mazda | Net 30 |
| Ferrari | Net 30 | | MB | Net 30 |
| Genesis | Net 30 | | Polestar | Net 45 |
| Hankook | Net 30 | | Porsche | Net 30 |
| Honda | Net 30 | | Toyota | Net 45 |
| Hyundai | Net 30 | | VW | Net 60 |
| JLR | Net 30 | | Volvo | Net 45 |
| Lamborghini | Net 60 | | Volvo MS | Net 45 |
| Lexus | Net 45 | | | |

`No Client` gets none. Mazda already holds "Net 30", so its update is a no-op and the load stays idempotent.

## The department fallback

Three touches, one file, `src/lib/accounting-export-line-service.ts`:

1. **`:428`** — change the join `revenue_segments(id, name)` to `revenue_segments(id, name, code)`.
2. **`:90`** — widen the type to `{ id: string; name: string; code: string | null } | null`.
3. **`:273`** — append the fallback:
   `estimate.accounting_department_id || client.default_department_id || office.default_department_id || estimate.revenue_segments?.code || null`

**Order matters and must not change.** The revenue segment goes **last**, so any explicit per-estimate or per-client override still wins. This is a fallback, not a takeover.

**Do not remove `client.default_department_id` from the chain** even though Tatiana says department belongs to the event. The column exists, something may set it, and dropping it is a behavior change nobody asked for.

## Constraints / out of scope

- **No schema changes.** `clients.default_payment_terms` and `revenue_segments.code` both exist.
- **No database writes from code.** Dry-run → `--confirm` writes SQL → **operator** applies. Same pattern as Sprints 019, 020, 022.
- Do not invent a payment term. If a client is not in the table above, it stays null.
- Do not touch the CSV writers (`accounting-csv-service.ts`), the review gate (`accounting-review-service.ts`), the AR/AP amount maths, or anything under `api/`.
- **No per-estimate data entry, and no UI work.** Project ID, revenue segment selection, event city and state are the user's job.
- Do not touch `fee_types`, `rate_card_items`, or any estimate's stored values.
- Dave's catalog amendments are **not** in this sprint. They moved to Sprint 024.

## What still blocks an export after this

All per-estimate, all user-entered, none loadable by us:

| Field | Where the user sets it |
|---|---|
| `revenue_segment_id` | Estimate header. Also now supplies the department. |
| `intacct_project_id` | Estimate accounting section |
| `event_city`, `event_state` | Estimate header |

Plus, for AP lines, the estimate needs an office profile; Sprint 019 loaded 15 with vendor IDs and payment terms.

## Risks

- **This sprint changes the exporter, which has never produced a valid export.** There is no regression baseline to compare against, so "it still works" cannot be proven by output comparison. Mitigated by keeping the change to a strictly additive fallback appended to the end of an existing chain.
- **A wrong fallback order would silently override an explicit department** set on an estimate or client. This is exactly the kind of change that looks fine and is wrong. Acceptance covers precedence explicitly.
- Payment terms are free text (`"Net 30"`), not a validated code. If Intacct expects a term ID rather than a label, the export will fail on a value that looks correct. Flagged for the Sprint 025 dry run; not resolvable here.
