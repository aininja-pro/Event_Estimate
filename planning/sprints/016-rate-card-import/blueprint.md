# Sprint 016 — Blueprint

**Requirements:** See `requirements.md` in this folder
**Spreadsheet location:** `data/imports/DriveShop_Cost_Rate_Card_Template__1_.xlsx`

## Pre-flight

Check whether the "Bulk Import" button on the Rate Card Management screen already works. If yes, Ray uses it and we're done. If no, build a CLI script per below.

## Script

`scripts/import_rate_cards.py`

Reads the xlsx, writes to DB. For each of the 20 client tabs:

1. Find client by name (case-sensitive). Create if missing.
2. Parse rows. Skip section headers, blank rows, and rows where `unit_rate = 0`.
3. Apply typo fixes: `Detailling` → `Detailing`, `Insuarnce` → `Insurance`.
4. On duplicate `fee_type_name` within a tab, keep first, drop rest.
5. Upsert each fee type onto the client's rate card by `(client_id, fee_type_name)`:
   - Match exists → update rate + costs
   - No match → insert, applying GL code by item-name lookup

Then duplicate Audi's parsed rows into a new client called "No Client".

## Verification gate

Default to dry-run. Print summary of what will change. Require `--confirm` to execute.

## After running

1. Ray spot-checks 3 clients in the UI (one existing, one new, No Client).
2. Claude Code updates `planning/DOMAIN.md` (8 clients → 21).
3. Claude Code updates `planning/STATE.md` (016 → shipped, 017 → active).
