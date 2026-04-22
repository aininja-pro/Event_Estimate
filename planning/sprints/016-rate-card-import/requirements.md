# Sprint 016 — Rate Card Bulk Import

**Source:** `DriveShop_Cost_Rate_Card_Template__1_.xlsx` (Dave Morck, 2026-04-22)

## What

Import Dave's spreadsheet into the Rate Card Management system.

- 20 client tabs in the spreadsheet
- 8 clients already exist in the app → update them
- 12 clients don't exist → create them
- Plus create a 21st rate card: "No Client" (seed from Audi tab)

## Rules

1. **Skip rows where `unit_rate = 0`.** Rate cards are editable; users can add them later.
2. **Fix obvious typos on import:** `Detailling` → `Detailing`, `Insuarnce` → `Insurance`. Use common sense. Misspellings don't create new fee types.
3. **Deduplicate within a tab.** Hankook / JLR / Mazda / MB have `Pressure Washer (/week)` twice — keep the first, drop the second.
4. **GL codes are tied to item name, not client.** Standard accounting logic — apply existing GL codes consistently.
5. **Preserve client-level fields on existing clients:** `markup_percent`, `primary_approver`. Don't overwrite what's already configured.

## Done when

- 21 rate cards exist in the system
- Dan and Tim can open any client and start building estimates
- `planning/DOMAIN.md` updated to reflect 21 clients (was 8)
