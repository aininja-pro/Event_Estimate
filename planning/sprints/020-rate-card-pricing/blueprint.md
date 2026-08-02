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
