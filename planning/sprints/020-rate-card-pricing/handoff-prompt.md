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
