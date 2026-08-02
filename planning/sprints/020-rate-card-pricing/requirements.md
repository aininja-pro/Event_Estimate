# Sprint 020 — Rate Card Pricing Load + No-Price Guard

**Packed:** 2026-07-27
**Depends on:** Sprint 019 (the 160-item catalog in `fee_types`)
**Unblocks:** first priced estimate; Sprint 024's real Intacct export

## Why this sprint exists

Since Sprint 019 the app has had DriveShop's real items but **no prices** — `rate_card_items` is empty, so nobody can build a usable estimate. On 2026-07-24 Dave Morck delivered the missing half: a filled pricing workbook covering 20 clients.

This sprint loads it, and closes the hole that would otherwise make that load dangerous: an item with no price currently becomes a silent `$0` line that can flow into a client-facing PDF.

## Current behavior

- `rate_card_items` = **0 rows**. Every client's rate card is empty. New estimates produce unpriced line items.
- Four sites coerce a missing rate to zero with no signal to the user:
  - `src/pages/EstimateBuilderPage.tsx:857` — `picked?.unit_rate ?? 0` (single-role add)
  - `src/pages/EstimateBuilderPage.tsx:1075` — `role.unit_rate ?? 0` (multi-role add)
  - `src/pages/EstimateBuilderPage.tsx:2371` — `item.unit_rate ?? 0` (line-item add)
  - `src/components/schedule/ScheduleGrid.tsx:148` — `role.unit_rate ?? 0` (schedule staff add)
- Nothing prevents an estimate with $0 lines from being submitted for approval or exported to PDF.

## Desired behavior

- Each of the 20 clients has a populated rate card, priced exactly as Dave delivered it, joined to the catalog on Item ID.
- Overtime is carried on the parent item (`has_overtime_rate` / `overtime_rate`), not as separate selectable items.
- Pass-through items appear with **no** unit rate and are understood to bill at the client's markup — they are *not* treated as missing prices.
- An item that genuinely has no rate on file says so where an estimator can see it, and an estimate carrying such a line cannot advance `estimate → in_review`.

## Source of truth

**`data/imports/DriveShop_Rate_Card_Template_for_Dave - Updated.xlsx` — already staged (Architect, 2026-07-27).** Delivered by Dave Morck on 2026-07-24 and placed in `data/imports/` under its original filename, matching the provenance convention used by the Sprint 019 imports.

**Verify before use:**

```
shasum -a 256 "data/imports/DriveShop_Rate_Card_Template_for_Dave - Updated.xlsx"
# f4a6ff18fdc6c241d62b9bb0b4fb9a5a0de9a9145a16fbf816a19ebb5222b6f7
```

Every figure in this sprint was derived from **that exact file**. If the checksum does not match, the workbook has been changed or replaced — **stop and hand back for a replan**, because the row counts and the exception list below will no longer hold.

**Do not rename, reformat, or hand-edit the workbook.**

**Note — `data/` is gitignored** (`.gitignore:46`), as it is for the Sprint 019 imports. This file is deliberately not in version control: it is client data and lives only on the operator's machine. The checksum above is the durable link between the plan and the file.

Shape (verified by the Architect, 2026-07-27):

- 22 sheets: `READ ME`, `Client Settings`, and **20 client tabs** (Acura, Audi, Bentley, JLR, Hankook, Ferrari, Genesis, Honda, Hyundai, Lamborghini, Lucid, Lexus, Maserati, Mazda, MB, Polestar, Porsche, Toyota, Volkswagen, Volvo).
- Client tab layout: header rows 1–4; data from **row 5**. Columns: `A` Section · `B` Item ID · `C` fee_type_name · `D` Cost Type · `E` unit_rate · `F` overtime_rate · `G` Notes.
- Rows with a blank Item ID are section headers — skip them.
- The `Client Settings` tab is **entirely blank**. It is out of scope for this sprint (Sprint 022).

## Verified join facts — do not re-derive, do not fuzzy-match

- All **160** Item IDs on every tab match `fee_types.intacct_ar_item_id` from Sprint 019 **exactly**. Zero unknown, zero renamed, zero duplicate item names.
- All **20** tab names match existing `clients.name` rows exactly (case-insensitive).
- The template's 6 section names are exactly the 6 `rate_card_sections.name` values: Planning & Administration Labor · Onsite Event Labor · Travel Expenses · Creative Costs · Production Expenses · Logistics Expenses.
- Cost Type distribution per tab: 82 Labor · 45 Pass Through · 33 Flat Fee.

**Item ID is the join key.** Never match on name or GL code. Sprint 019 proved GL is coarser than Item ID (one GL maps to up to 22 items) — see DECISIONS §"Intacct item foundation". If a row's Item ID does not resolve, the importer **aborts**; it does not guess.

## Load rules

| Row shape | Action |
|---|---|
| Numeric `unit_rate`, non-overtime item | Create a `rate_card_item` with that rate. **499 rows.** |
| `Cost Type = Pass Through` (rate shown as `—`) | Create a `rate_card_item` with `unit_rate = NULL`, `is_pass_through = true`. **900 rows** (45 × 20). |
| Numeric `overtime_rate` on a parent row | Set `has_overtime_rate = true`, `overtime_rate = value`. **158 rows.** |
| Standalone overtime item (see identification below) | **Skip** — create no rate-card row. **140 priced ones skipped**; the money is preserved on the parent. |
| Blank `unit_rate`, not pass-through, not overtime | **Skip** — this client does not use the item. **1,223 rows.** |

**Expected total: 1,399 `rate_card_items` across 20 clients.**

### Identifying a standalone overtime item

Use the catalog's **Revenue GL shape**, not the name: an item whose `fee_types.gl_code` has **three dot-separated parts** (e.g. `4000.26.01`) is an overtime item. This yields exactly **29** items and is a strict superset of a name-based match — it additionally catches `I0030` "Event Staff- OT", whose name does not follow the `O/T` convention. Name matching alone misses it.

### Overtime exceptions the importer must report, not resolve

Pairing each overtime item to its parent **by name** (GL cannot do it — one overtime GL maps to up to 5 candidate parents) resolves 28 of 29; `I0251` "Assistant Event Manager Training or O/T Hours" needs a hard-coded alias to `Assistant Event Manager Days`.

Across all 20 tabs the parent's overtime column and the standalone overtime item **agree 136 times**, with exactly **4 exceptions** — all on Right Seat Driver, all on the Lucid and MB tabs:

| Tab | Exception |
|---|---|
| Lucid, MB | `I0042` Right Seat Driver OT Hours priced at **800**, but parent `I0041`'s overtime column says **80** (conflict) |
| Lucid, MB | `I0125` Right Seat Driver – Travel O/T priced at **80**, but parent `I0124`'s overtime column is **blank** (orphan) |

These look like two transposed rows. **The importer must print them and stop short of choosing.** Ray confirms the intended values with Dave during dry-run review; the resolved values go into the script as an explicit, commented override table.

## Constraints / out of scope

- **No schema changes.** Every column needed already exists (`rate_card_items.unit_rate` is already nullable).
- **No writes to the database from code.** Dry-run → `--confirm` writes `.sql` → **operator** applies via the Supabase SQL editor. The script never opens a DB connection.
- **Do not invent, adjust, round, or interpolate a price.** If the workbook is silent, the app is silent.
- **Do not modify `fee_types`.** The catalog is Sprint 019's output and is correct.
- **Do not touch the exporter** (`accounting-review-service.ts`, `accounting-export-line-service.ts`, `accounting-csv-service.ts`).
- **No corporate-cost work.** Leave `corporate_cost` NULL. Sprint 025.
- **No client-settings work** — markup %, agency fee %, office payout %, Intacct customer IDs. Sprint 022.
- **No catalog amendments** — the chauffeur split, the four "Duplicate???" items, the flat-rate EV Charging / Per Diem requests. Sprint 023, and all blocked on accounting issuing Item IDs.
- **No historical backfill.** Existing estimates keep their stored values.
- **Do not rename the `Volvo` tab's client or invent a `Volvo MS` / `VW` rate card** — those client rows exist but Dave sent no tab for them. Leave their cards empty.

## Risks

- 639 hand-typed prices, two proven transpositions. Mitigated by the exception report and the >50%-of-parent overtime heuristic; not eliminated. A human still has to look.
- Skipping blank rows means an item Dave *forgot* to price is indistinguishable from one the client never uses. Accepted: the dry-run prints a per-client priced-item count so an anomalously thin card is visible (Porsche 23 vs MB 46 is the real spread).
- The no-price guard touches the estimate builder, a large and heavily-used file. Mitigated by staging (see blueprint) with an eyeball checkpoint between the load and the guard.
