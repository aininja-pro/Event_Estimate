============================================================
FILE: planning/sprints/020-rate-card-pricing/requirements.md
============================================================

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

============================================================
FILE: planning/sprints/020-rate-card-pricing/blueprint.md
============================================================

# Sprint 020 — Blueprint

Two stages with an operator checkpoint between them. **Stage A is the value; Stage B is the safety net.** Do not begin Stage B until Stage A's SQL has been applied and Ray has eyeballed a real rate card in the running app.

---

## Stage A — the price load

### A1. Verify the source file (already staged)

The workbook is **already in place** — the Architect staged it on 2026-07-27. Do not copy, move, rename, or edit it. Confirm it is the file this plan was built from:

```
shasum -a 256 "data/imports/DriveShop_Rate_Card_Template_for_Dave - Updated.xlsx"
# expect f4a6ff18fdc6c241d62b9bb0b4fb9a5a0de9a9145a16fbf816a19ebb5222b6f7
```

A mismatch means the workbook changed after planning. **Stop and hand back** — do not adapt the importer to a different file. `data/` is gitignored, so this file is not in version control and cannot be restored from git.

### A2. `scripts/import_rate_card_prices.py` (new)

Mirror `scripts/import_intacct_catalog.py` in structure, tone, and safety posture — read it first and follow it.

```
python scripts/import_rate_card_prices.py            # dry-run: report only, writes nothing
python scripts/import_rate_card_prices.py --confirm  # also writes scripts/import_rate_card_prices.sql
```

The script **never connects to the database.** An operator reviews and applies the generated SQL through the Supabase SQL editor.

**Read:** the staged workbook, plus the Sprint 019 catalog file for the overtime-GL classification (or classify from the generated SQL's `fee_types` rows — either source is acceptable, but state which in the docstring).

**Resolution order per client tab:**
1. Tab name → `clients.name` (case-insensitive exact). Unresolved tab ⇒ **abort**.
2. Column A section → `rate_card_sections.name` (exact). Unresolved section ⇒ **abort**.
3. Column B Item ID → `fee_types.intacct_ar_item_id` (exact). Unresolved Item ID ⇒ **abort**.

**Row handling:** exactly as the table in `requirements.md`. Classify overtime items by three-part GL. Apply the `I0251` alias. Carry the Notes column into `rate_card_items.notes` when present (it holds real unit semantics — `per hour`, `per vehicle`, `per mile`, `per week`, `percent`, `Indoor`, `Vehicle Delivery`), **except** the literal `Duplicate???` marker, which is Dave asking a question and belongs in the report, not the database.

**Field mapping for each created row:**

| Column | Value |
|---|---|
| `client_id` | resolved client |
| `section_id` | resolved section |
| `name` | column C (`fee_type_name`) |
| `unit_rate` | numeric rate, or `NULL` for pass-through |
| `is_pass_through` | `true` when Cost Type = Pass Through |
| `has_overtime_rate` / `overtime_rate` | from column F where numeric |
| `fee_type_id` | resolved fee type |
| `gl_code`, `unit_label` | inherited from the resolved `fee_types` row, as `import_rate_cards.sql` does |
| `notes` | column G where meaningful |
| `display_order` | source row order within the section |
| `corporate_cost`, `office_cost` | `NULL` — out of scope |
| `is_active` | `true` |
| `is_rate_locked` | `false` |

**Dry-run report must print:**
- Per client: rows to create, of which priced / pass-through / carrying overtime; rows skipped blank.
- Grand totals, to be checked against the expected **1,399 / 499 / 900 / 158**.
- **Exception block** — the 4 known overtime conflicts/orphans, plus any overtime rate exceeding **50%** of its parent's unit rate, plus the 4 `Duplicate???` items, plus the duplicate `I0217` chauffeur rows on Maserati and Volvo (both rows share an Item ID — load only the first, report the second as unloadable pending Sprint 023).
- A per-client priced-item count so a suspiciously thin card is visible at a glance.

**Hard aborts:** unresolved client, section, or Item ID; a client tab that yields zero rows; a grand total that deviates from the expected figures without an explanation printed.

### A3. `scripts/import_rate_card_prices.sql` (generated)

One atomic `BEGIN … COMMIT`. `rate_card_items` is currently empty, but write it to be **safe to re-run**: delete only the rows for the 20 clients being loaded, then insert. Do not touch `fee_types`, `clients`, `office_accounting_profiles`, `revenue_segments`, or any estimate table.

### A4. Operator checkpoint

Ray applies the SQL, then opens the app and confirms: a client's rate card shows the expected items with real prices; overtime shows on the parent row; pass-throughs show no rate. **Stop here for approval before Stage B.**

---

## Stage B — the no-price guard

Three touches. Keep each minimal and follow the existing precedent named for it.

### B1. One predicate, one place

Add to `src/lib/estimate-totals.ts`, beside `officeCostRate()` — the W8 fix established this file as the home for shared financial predicates:

```ts
// A line is unpriced when it carries no usable rate AND is not a pass-through
// (pass-throughs legitimately have no rate; they bill at the client's markup
// on actual cost).
export function isUnpricedRate(rate: number | null | undefined, isPassThrough: boolean): boolean
```

Every site below calls this. Do not re-implement the condition inline anywhere — W8's five-sites-one-formula lesson applies.

### B2. Make the pickers honest

At the four coercion sites (`EstimateBuilderPage.tsx:857`, `:1075`, `:2371`; `ScheduleGrid.tsx:148`) the `?? 0` fallback stays — changing what is written to the database is out of scope — but the **picker rows** gain a marker:

- `unit_rate == null && !is_pass_through` → **"no rate on file"**, amber, and the row is visually de-emphasised.
- `is_pass_through` → **"billed at markup"**, muted. This is not an error and must never be styled as one.

Follow the existing rose/amber conventions (`text-[10px]` uppercase, as used by the UNPLANNED badge).

### B3. Block the approval transition

In `src/lib/segment-status-service.ts`, mirror the existing `person_name` gate (the `recap → invoiced` block around lines 165–180) — same `{ success: false, error }` shape, same plain-language message. "Mirror exactly" means the error shape and tone, **not** an identical query; this gate needs its own reads and a pass-through resolution.

> Block `estimate → in_review` when any non-unplanned, non-pass-through row on the segment has a zero or null **effective rate**, across all three revenue-bearing tables: `labor_entries`, `schedule_entries`, and `estimate_line_items`. Name the count and the first few item names in the error.

**Amended by fresh Architect plan review, 2026-08-02 (PLAN-001/002/003).** The three clarifications below are corrections to this section's original two-table, `unit_rate`-only wording. They do not widen product scope; they make the gate match the invariant already stated in `requirements.md` §"Desired behavior" and in the Flight evidence.

**Which tables (PLAN-001).** `schedule_entries` must be checked. When a segment has any `schedule_entries` rows it is *schedule-driven*: `estimate-totals.ts:87–109` and `api/services/pdf_data_service.py:584` both derive **all** labor revenue from the schedule rollup and ignore `labor_entries` entirely. A schedule-driven segment can carry zero `labor_entries`, so a two-table gate would let a `day_rate = 0` line — produced by the `ScheduleGrid.tsx:148` coercion this sprint is already patching in B2 — reach approval and a client PDF. That is exactly Flight discriminating example 5.

**What counts as the rate (PLAN-002/003).**

| Table | Effective rate | Exemptions beyond unplanned / pass-through |
|---|---|---|
| `labor_entries` | `override_rate ?? unit_rate` — never `unit_rate` alone. `estimate-totals.ts:104` uses the override as the billed rate, so a line priced by override is priced. | — |
| `schedule_entries` | `day_rate` | — |
| `estimate_line_items` | `unit_cost` | Rows with `fee_basis = 'total_estimate'` are exempt. They are priced as a percentage of prior-section revenue (`estimate-totals.ts:122–123`) and legitimately carry `unit_cost = 0`. |

Checking `unit_rate` alone is wrong in both directions: it blocks a line the estimator priced by override, and it passes a line whose override zeroed it out.

**Pass-through resolution.** Neither `labor_entries` nor `estimate_line_items` nor `schedule_entries` carries an `is_pass_through` column; resolve it through `rate_card_item_id` → `rate_card_items.is_pass_through`. A row with a null `rate_card_item_id` (custom role, manually added item) is not pass-through.

Unplanned rows are exempt on all three tables (they legitimately carry zeros — see DECISIONS §"Unplanned Additions"). Pass-throughs are exempt.

**Known residual, accepted (PLAN-006).** A pass-through *line item* whose actual cost has not yet been typed sits at `unit_cost = 0` and is exempt by design — Flight discriminating example 4 explicitly requires that pass-throughs never trip the guard. Record this in the DECISIONS close-out section so it is a chosen limit, not a surprise.

### B4. Surface it before they hit the wall

On the Summary tab in `EstimateBuilderPage.tsx`, add an amber banner counting unpriced lines when any exist — same pattern as the existing GP-threshold banner, which is the precedent to copy. An estimator should discover this while building, not at submit.

---

## Files the Builder may touch

**New:** `scripts/import_rate_card_prices.py` · `scripts/import_rate_card_prices.sql` (generated)

**Read-only input (already staged, never modify):** `data/imports/DriveShop_Rate_Card_Template_for_Dave - Updated.xlsx`

**Modified:** `src/lib/estimate-totals.ts` · `src/lib/segment-status-service.ts` · `src/pages/EstimateBuilderPage.tsx` · `src/components/schedule/ScheduleGrid.tsx` · `docs/ARCHITECTURE.md` · `planning/DECISIONS.md` (append at close) · `planning/STATE.md` · `planning/ROADMAP.md` (mark row 020 `done` at close) · `planning/ARCHITECT_BRIEFING.md` (refresh at close) · `planning/STATUS.json`

**Explicitly not touched:** anything under `api/` · the three `accounting-*-service.ts` files · `scripts/import_intacct_catalog.*` · `src/pages/RateCardManagementPage.tsx` · any migration file · `fee_types` data.

---

## Flight evidence

**Class:** `critical`  
**Reason:** The sprint loads real client dollar rates into persistence and changes whether an estimate can enter approval. Wrong join keys, invented prices, or a missing approval block can silently misprice client-facing estimates and PDFs. Money/pricing outranks layer count.

**Acceptance invariant at risk:** Every loaded `rate_card_items.unit_rate` / `overtime_rate` equals the workbook cell for that client + Item ID (or is intentionally NULL for pass-through); blank and standalone-overtime rows are not invented as prices; an estimate with a non-pass-through unpriced line cannot transition `estimate → in_review`.

**Affected layers (origin → sink):**
1. **Input** — `data/imports/DriveShop_Rate_Card_Template_for_Dave - Updated.xlsx` (SHA-256 `f4a6ff18fdc6c241d62b9bb0b4fb9a5a0de9a9145a16fbf816a19ebb5222b6f7`, verified 2026-08-02). 22 sheets; 20 client tabs.
2. **Import / transform** — new `scripts/import_rate_card_prices.py` → `scripts/import_rate_card_prices.sql` (dry-run → `--confirm`; never opens a DB). Join keys: tab→`clients.name`, col A→`rate_card_sections.name`, col B→`fee_types.intacct_ar_item_id`. Overtime classification via three-part Revenue GL on catalog (`data/imports/Item IDs - Dave M Edits_06.24.26.xlsx`, SHA-256 `f79fb04960fa88c926ed8e097b837efda58a687f0eee6877298860d16cecf3b9`).
3. **Persistence** — `rate_card_items` only (expected 1,399 rows). `fee_types` / historical tables untouched.
4. **Domain / UI** — pickers read rates (`EstimateBuilderPage.tsx` ~857/1075/2371; `ScheduleGrid.tsx` ~148 — all `unit_rate ?? 0` coercion sites still write zero; markers + Summary banner make missing prices visible). Shared predicate `isUnpricedRate()` in `estimate-totals.ts` beside `officeCostRate()`.
5. **Workflow sink** — `segment-status-service.ts` `transitionSegmentStatus`: block `estimate → in_review` when any non-unplanned, non-pass-through row in `labor_entries`, `schedule_entries`, or `estimate_line_items` has a null/zero effective rate (precedent: `person_name` gate ~165–179 for `recap|export_ready → invoiced`). See B3 for the effective-rate definition per table.

**Discriminating examples (must go red for plausible wrong implementations):**
1. **Parent OT vs standalone OT rate (Lucid/MB `I0041`/`I0042`):** workbook shows parent `I0041` unit=800, OT column=80; standalone `I0042` unit=800. Correct load puts `overtime_rate=80` on the parent and skips creating an `I0042` rate-card row. A wrong load that copies the standalone item's unit rate onto the parent as OT yields **800** — same Item ID path, wrong money. Importer must report the conflict, not auto-pick 800.
2. **Orphan Travel OT (Lucid/MB `I0124`/`I0125`):** parent `I0124` has unit=80 and blank OT; standalone `I0125` has unit=80. Correct: parent OT stays NULL/unset from column F, standalone skipped, exception reported. Wrong: inventing OT=80 from the standalone row invents a price the parent column did not carry.
3. **Duplicate Item ID (Volvo `I0217`):** Standard Market rate=90 and High Markets rate=100 share one Item ID. Correct: load first row only, report second unloadable. Wrong: last-write-wins leaves 100 and silently drops 90 (or invents a second row that violates uniqueness).
4. **Pass-through vs unpriced:** Cost Type Pass Through with `—` rate must create `unit_rate NULL` + `is_pass_through=true` and must **not** trip `isUnpricedRate` or the approval block. A wrong guard that treats NULL rate as always unpriced blocks legitimate pass-through estimates.
5. **Silent $0 path:** adding a non-pass-through item with `unit_rate == null` still coerces to 0 at write sites, but `estimate → in_review` must fail naming the items. A wrong implementation that only styles the picker but omits the transition gate lets a $0 line reach approval/PDF.

**Git / durable verification sources (2026-08-02):**
- Branch `sprint-018-office-cost-correction` @ `8845a6d142ad661ef419f749c6cf7419b0065cba` (Sprint 019 close-out tip).
- Workbook checksum above; catalog checksum above.
- Live coercion sites and `person_name` gate confirmed present in working tree as cited.

**Known uncertainty / operator gate (not invented):**
- Ray must confirm with Dave the Lucid/MB OT exceptions before SQL apply; resolved values become an explicit commented override table — never a silent fix.
- Post-load DB counts and operator eyeball of a live rate card are Stage A exit criteria; Stage B must not start without that approval.
- End-to-end Summary↔PDF cent reconciliation requires a priced estimate after the load (acceptance whole-sprint).

============================================================
FILE: planning/sprints/020-rate-card-pricing/acceptance.md
============================================================

# Sprint 020 — Acceptance

Every box must be checked with evidence, not assertion. "It should work" is not a result.

## Stage A — the load

- [ ] The staged workbook `data/imports/DriveShop_Rate_Card_Template_for_Dave - Updated.xlsx` checksums to `f4a6ff18fdc6c241d62b9bb0b4fb9a5a0de9a9145a16fbf816a19ebb5222b6f7`, proving it is the file this sprint was planned against. It was not copied, renamed, or edited by the Builder.
- [ ] `python scripts/import_rate_card_prices.py` runs clean and writes nothing.
- [ ] The dry-run reports **1,399** rows to create = **499** priced + **900** pass-through, with **158** carrying an overtime rate, across **20** clients. Any deviation is explained in the report before the Builder proceeds.
- [ ] The dry-run reports **1,223** blank rows skipped and **140** priced standalone overtime items skipped.
- [ ] The exception block lists, at minimum: the 4 Right Seat Driver overtime conflicts/orphans on Lucid and MB; the 4 `Duplicate???` items; the duplicate `I0217` chauffeur rows on Maserati and Volvo. Nothing in that block was auto-resolved.
- [ ] Zero unresolved clients, sections, or Item IDs. (If any appear, the script aborted — that is correct behavior, and the sprint stops for a replan.)
- [ ] `--confirm` writes `scripts/import_rate_card_prices.sql`; the script still never opened a database connection.
- [ ] The SQL is a single `BEGIN … COMMIT`, is safe to re-run, and touches only `rate_card_items`.
- [ ] **After the operator applies it:** `rate_card_items` = 1,399; `fee_types` still = 160; `historical_events` = 1,674 and `historical_patterns` = 98, unchanged.
- [ ] Spot-check three tabs against the workbook by hand — MB (richest, 46 priced), Porsche (thinnest, 23), and Mazda — every price matches the cell it came from.
- [ ] **Operator eyeball:** Ray opens a client's rate card in the running app and confirms items, prices, overtime on the parent row, and rate-less pass-throughs. Approval recorded before Stage B starts.

## Stage B — the guard

- [ ] `isUnpricedRate()` exists in `src/lib/estimate-totals.ts` and is the only implementation of that condition in the codebase (`grep` proves no inline duplicates).
- [ ] A rate-card item with no rate shows **"no rate on file"** in all four pickers.
- [ ] A pass-through item shows **"billed at markup"**, never styled as an error.
- [ ] Submitting a segment for approval with an unpriced non-pass-through line is **blocked**, with a message naming the count and the offending items.
- [ ] The same submission **succeeds** once the line is priced or removed.
- [ ] Unplanned rows do not trigger the block.
- [ ] **A schedule-driven segment is blocked too.** A segment whose labor lives only in `schedule_entries` (no `labor_entries` rows) and that carries a non-pass-through role at `day_rate = 0` is blocked from `estimate → in_review`, with the role named. *(Added by plan review, PLAN-001.)*
- [ ] **An override-priced line is not blocked.** A `labor_entries` row with `unit_rate = 0` and a real `override_rate` submits successfully — the guard reads `override_rate ?? unit_rate`. *(Added by plan review, PLAN-002.)*
- [ ] **A percentage fee line is not blocked.** An `estimate_line_items` row with `fee_basis = 'total_estimate'` and `unit_cost = 0` submits successfully. *(Added by plan review, PLAN-003.)*
- [ ] The Summary tab shows an amber unpriced-lines banner when any exist, and no banner when none do.
- [ ] An estimate built entirely from priced items submits for approval with no change in behavior from before this sprint.

## Whole-sprint

- [ ] `npx tsc -b --force` is clean.
- [ ] `npx eslint .` introduces **zero** new findings. Pre-existing findings (FeedbackPage, ScheduleGrid, EstimateBuilderPage, ui/*, schedule-service) may remain; the Builder states the before/after counts. **The "before" count must be captured before the first Stage B source edit** — a baseline taken afterwards proves nothing. If `tsc` or `eslint` will not complete, stop and hand back rather than proceeding without a baseline. *(Clarified by plan review, PLAN-004.)*
- [ ] A full estimate is built end-to-end on a real priced client and its totals reconcile to the cent between the Summary tab and the internal PDF. **This is the proof the sprint worked** — the app has not produced a priced estimate since June.
- [ ] No schema change was made. No price was invented. No `fee_types` row changed.
- [ ] `docs/ARCHITECTURE.md` records the new importer alongside the Sprint 019 one. **`ARCHITECTURE.md` currently documents neither importer** (verified 2026-08-02), so the Builder adds both the Sprint 019 `import_intacct_catalog` entry and the Sprint 020 `import_rate_card_prices` entry. *(Clarified by plan review, PLAN-005.)*
- [ ] `planning/ROADMAP.md` row 020 is marked `done`.
- [ ] `planning/DECISIONS.md` carries a new `## Rate Card Pricing (Sprint 020)` section covering: Item ID as the sole join key; overtime as a parent attribute with standalone `.01` items accounting-only; blank = client does not use the item; pass-through = NULL rate by design; the unpriced-line guard, the three tables it covers, its exemptions (unplanned, pass-through, `fee_basis = 'total_estimate'`), and the accepted residual that a pass-through line item with no cost typed yet is not blocked.
- [ ] `planning/ARCHITECT_BRIEFING.md` refreshed, leading with plain-English `Where things stand`, and carrying `## Evidence`, `## Executive summary`, `## Readiness signals`, and `## Plan corrections`.

============================================================
FILE: planning/sprints/020-rate-card-pricing/handoff-prompt.md
============================================================

# Builder Handoff — Sprint 020: Rate Card Pricing Load + No-Price Guard

## Task contract

**objective**
DriveShop's delivered per-client prices are loaded onto the Sprint 019 catalog so an estimator can build a fully priced estimate for the first time since June — and no item without a price can silently become a $0 line or reach approval.

**owns**
- `scripts/import_rate_card_prices.py` (new) and `scripts/import_rate_card_prices.sql` (generated)
- **Not yours to touch:** `data/imports/DriveShop_Rate_Card_Template_for_Dave - Updated.xlsx` is already staged and is read-only input. Verify its checksum (`f4a6ff18fdc6c241d62b9bb0b4fb9a5a0de9a9145a16fbf816a19ebb5222b6f7`); never copy, rename, or edit it.
- `src/lib/estimate-totals.ts` — add `isUnpricedRate()` only
- `src/lib/segment-status-service.ts` — add the `estimate → in_review` guard only
- `src/pages/EstimateBuilderPage.tsx` — picker markers + Summary banner only
- `src/components/schedule/ScheduleGrid.tsx` — picker marker only
- `docs/ARCHITECTURE.md`, and the planning files listed in the blueprint

**must_not**
- No schema changes. No migration files. Every needed column already exists.
- No database writes from code — dry-run → `--confirm` → **operator** applies the SQL. The script must never open a DB connection.
- Do not invent, adjust, round, or interpolate any price. If the workbook is silent, the app is silent.
- Do not auto-resolve the overtime conflicts, the `Duplicate???` items, or the duplicate `I0217` chauffeur rows — report them.
- Do not match on item name or GL code. **Item ID only.** Sprint 019 proved GL matching impossible; do not revive it.
- Do not modify `fee_types`, the exporter (`accounting-*-service.ts`), anything under `api/`, or `RateCardManagementPage.tsx`.
- No corporate-cost work, no client-settings work, no catalog amendments, no historical backfill.
- Do not create rate cards for `Volvo MS` or `VW` — Dave sent no tab for them.

**acceptance**
`planning/sprints/020-rate-card-pricing/acceptance.md`, in full. The headline numbers: **1,399** rate-card rows = **499** priced + **900** pass-through, **158** with overtime, across **20** clients; **1,223** blank and **140** standalone-overtime rows skipped.

**verification**
```
python scripts/import_rate_card_prices.py
python scripts/import_rate_card_prices.py --confirm
npx tsc -b --force
npx eslint .
```
Plus: operator applies the SQL and confirms the post-load counts; and a full priced estimate is built end-to-end with Summary and internal PDF reconciling to the cent.

---


## Fly authority note

This sprint is executing inside an active `/fly` session. After a fresh Architect
`pass` on the exact Builder plan, that pass is the code-gate approval for the
passed plan — do not wait for a second human `approved`. The Stage A operator
checkpoint (SQL apply + rate-card eyeball before Stage B) still stands; it is an
operator data gate, not the code gate.

## Before you touch anything

1. Read, in this order: `planning/sprints/020-rate-card-pricing/requirements.md`, then `blueprint.md`, then `acceptance.md`.
2. Read `scripts/import_intacct_catalog.py` end to end. Your importer mirrors its structure, safety posture, and docstring style. Read `scripts/import_rate_cards.sql` for the `rate_card_items` insert shape and field inheritance.
3. Read the four coercion sites named in `requirements.md` and the `person_name` gate in `segment-status-service.ts` (~lines 165–180) — that gate is the precedent for B3.
4. Read DECISIONS §"Intacct item foundation" (why GL matching is forbidden) and §W8 (why shared financial logic lives in one helper).

**Performance note, learned the hard way on this repo:** when reading these workbooks with `openpyxl` in `read_only=True` mode, never use `ws.cell(row, col)` — it is O(n) per access. Load everything in one `iter_rows` pass into a dict keyed by `(row, col)`, then work from that.

## Staging

This sprint runs in **two stages with an operator checkpoint between them**, because Stage B touches a large, heavily-used file.

- **Stage A** — the importer, the SQL, and the load. Ends when the operator has applied the SQL and eyeballed a real rate card in the app.
- **Stage B** — the no-price guard. **Do not start it until Ray approves Stage A's result.**

## The code gate

Before creating, editing, or deleting **any** file outside `planning/` and `docs/`, stop. Post your concrete file-by-file plan, the scope guards, and the acceptance criteria you are targeting, and wait for explicit approval of *that* plan. This handoff is not approval to write code. Each approval covers only the step in front of you — Stage A approval is not Stage B approval.

## Two honest attempts

At most two focused repair attempts per validation failure. After the second, stop, write what you tried into `planning/ARCHITECT_BRIEFING.md`, and hand back for a replan. No thrash loops.

## What Ray needs to decide during Stage A

The dry-run will surface four exceptions Ray must take to Dave before the SQL is applied. Present them plainly and wait:

1. **`I0042` Right Seat Driver OT Hours** is priced at **800** on Lucid and MB, but the parent's overtime column says **80**. Likely a transposition.
2. **`I0125` Right Seat Driver – Travel O/T** is priced at **80** on Lucid and MB, but parent `I0124`'s overtime column is blank.
3. **`I0217`** appears twice on Maserati and Volvo — "Professional Chauffeur Hours – Standard Market" and "– High Markets" at different prices, sharing one Item ID. Only one can load until accounting issues a second ID.
4. The four **`Duplicate???`** items Dave flagged and left unpriced.

Once resolved, the agreed values go into the script as an explicit, commented override table — never as a silent fix.

## At close

- Refresh `planning/ARCHITECT_BRIEFING.md`: lead with plain-English `Where things stand`, then `## Executive summary` (Business outcome / Current focus / What is proven / What is not live), `## Readiness signals` (2–4 rows, status exactly `passed` or `attention`), `## Validation / test status` opening with `**Tests:** N passing, N failing.`, `## Evidence` (the commands you ran and their real results), `## Plan corrections` (what this plan got wrong or left ambiguous — or "None — the plan held"), and `## Recommended next Architect action` with `Do`, `Owner`, and `Decision` lines above the prose.
- Append the `## Rate Card Pricing (Sprint 020)` section to `planning/DECISIONS.md`.
- Mark roadmap row 020 `done`.
- Set `planning/STATUS.json` to `sprint-closed`.

An honest `attention` beats a green board that isn't true. If something did not get verified, say so.

