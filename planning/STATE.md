# Current State

**Project:** DriveShop Event Estimate Engine
**Phase:** 2 — Assembly, Week 13
**Mode:** Directed

## Active Sprint

Sprint 017 — Sage Intacct Integration + Final QA Pass (not yet scoped)

## Just Shipped

**Sprint 016 — Rate Card Bulk Import**
Imported Dave Morck's 20-tab cost rate card template via `scripts/import_rate_cards.py` (dry-run by default, `--confirm` writes SQL). Creates 14 new OEM clients, upserts rate card items onto 6 existing brands (preserving `markup_percent` / `primary_approver`), auto-creates 46 missing `fee_types` with NULL gl_code, and seeds a `No Client` fallback from the Audi tab. Applied `Detailling → Detailing` (20×) and `Insuarnce → Insurance` (6×) typo fixes, deduped 4 `Pressure Washer (/week)` rows, normalized `office_cost` from decimal fractions (0.75) to the app's whole-number percent convention (75) with a 0–500 safety assertion.

## Recently Shipped

- **Sprint 015** — Admin Settings UI for Financial Thresholds (GP threshold + approval threshold controls at `/admin/settings`)
- **Sprint 014** — Final Polish (client approval email via Resend, toast notifications, invoice-with-receipts PDF, read-only data feed API)
- **Sprint 013** — Client-Specific Approval Routing (primary_approver_id on clients, targeted notifications, latent `'cfo'` → `'account_manager'` fallback bug fix)
- **Sprint 012** — Unplanned Additions in Recap (is_unplanned flag on 4 tables, rose dashed UI pattern)
- **Sprint 011** — Schedule Recap Actuals + Financial Summary Cards
- **Sprint 010** — Estimate Duplication + Historical Event Search

## Deferred

- Sage Intacct integration (next sprint)
- Location-aware historical patterns (enhancement)
- Per-estimate approver override (OOO handling)
- Confirmation emails back to client + internal AM notification on client approval
- `driveshop.com` sender domain verification in Resend
- Live broadcast of system settings to already-open tabs
- Default landing page setting (dashboard vs estimates)
- Editing `is_unplanned` flag post-creation
- Unplanned items on client-facing PDFs (currently internal-only)
- SMS notifications
- Multiple receipt attachments per line item
- Change Order and Recap PDF options in Export dropdown
- Broader role-based workflow rules engine

## Next Up

Sage Intacct integration + final QA pass.
