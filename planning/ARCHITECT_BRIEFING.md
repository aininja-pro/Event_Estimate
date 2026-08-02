# Architect Briefing — DriveShop Event Estimate Engine

_Refreshed at Sprint 020 close, 2026-08-02._

## Where things stand

DriveShop's real per-client prices are loaded. Estimators can build priced estimates again for the first time since the catalog wipe in Sprint 019. An item without a rate now says so in the picker and cannot sneak into approval as a silent $0. Production is still live on Render; the next useful work is production hardening (key rotation + consolidating onto `main`) and the remaining Intacct client mapping once Tatiana returns answers.

## Executive summary

- **Business outcome:** 20 client rate cards carry Dave's delivered prices; unpriced non-pass-through lines are visible and blocked from `estimate → in_review`.
- **Current focus:** Ship Sprint 020; then Sprint 021 (keys + `main`) and DriveShop-blocked 022/023.
- **What is proven:** Importer dry-run + generated SQL (1,397 rows); workbook checksum match; `tsc` clean; eslint 21→21 (zero new); operator applied SQL and eyeballed a live rate card; Stage B guard/pickers/banner implemented to B3 rules.
- **What is not live / not proven:** End-to-end Summary↔PDF cent reconciliation on a freshly built priced estimate was not independently recorded in this flight (residual risk — see Readiness). Catalog amendments and 16 Intacct customer IDs still wait on DriveShop.

## Readiness signals

| Signal | Status |
| --- | --- |
| Price load SQL generated + operator applied + rate card eyeball | passed |
| No-price guard (predicate + three-table gate + pickers + banner) | passed |
| `tsc` clean; zero new eslint findings | passed |
| Summary↔PDF cent reconciliation on a new priced estimate | attention |

## Validation / test status

**Tests:** 0 passing, 0 failing. (No automated unit suite for this sprint; evidence is command + operator.)

- `shasum -a 256` workbook = `f4a6ff18fdc6c241d62b9bb0b4fb9a5a0de9a9145a16fbf816a19ebb5222b6f7`
- `python scripts/import_rate_card_prices.py` — 1397 create (497 priced + 900 PT), 158 OT, skips 1223 blank + 140 standalone OT; −2 vs plan explained by I0217 duplicates
- `python scripts/import_rate_card_prices.py --confirm` — wrote `scripts/import_rate_card_prices.sql`
- Operator: apply + `eyeball ok` (2026-08-02)
- Baseline before Stage B: `npx tsc -b --force` exit 0; `npx eslint .` → 21 problems (17 errors, 4 warnings)
- After Stage B: same — exit 0 / 21 problems — zero new

## Evidence

Commands above were run in the Fly session. Fresh Architect inspection 1/3 returned `ask` solely for Summary↔PDF E2E proof; code criteria passed. Ray proceeded to commit after operator eyeball.

## Plan corrections

- B3 originally scoped the approval guard to `labor_entries` + `estimate_line_items` only; schedule-driven segments store labor in `schedule_entries` — amended in plan review (PLAN-001) before build.
- Effective labor rate must be `override_rate ?? unit_rate` (PLAN-002); `fee_basis = 'total_estimate'` must be exempt (PLAN-003).
- Plan headline 1,399/499 counted both `I0217` duplicate rows; load correctly creates 1,397/497 — document that in acceptance/DECISIONS (INSPECT-005).
- Advisories deferred: gate could call `listUnpricedLineLabels` directly (INSPECT-001); banner uses active rate-card map vs gate's DB read (INSPECT-002).

## Flight record

- **Class:** critical
- **Plan reviews:** 2/3 — review 1 `fix`, review 2 `pass`
- **Inspection:** 1/3 — `ask` (E2E PDF); residual risk accepted for close by operator commit request after eyeball
- **Ledger:** PLAN-001..003 resolved; PLAN-004..007 advisory/deferred; INSPECT-001..004 advisory; INSPECT-005..007 attention; INSPECT-008 open residual (PDF E2E)

## Recommended next Architect action

**Do:** Confirm one MB (or other) priced estimate Summary↔PDF to the cent if not already done; start Sprint 021 Production Hardening (rotate plaintext-era keys; consolidate production branch onto `main`).  
**Owner:** Ray / operator  
**Decision:** Whether to treat PDF reconcile as a five-minute smoke before 021, or accept attention and proceed to hardening first.

## Current status (ops)

- Production still deploys from `sprint-018-office-cost-correction` until Sprint 021 consolidates to `main`.
- 16 clients still lack Intacct customer IDs (Sprint 022). Catalog follow-ups from Dave → Sprint 023.
