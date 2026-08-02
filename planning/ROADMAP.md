# Roadmap - DriveShop Event Estimate Engine

> A living estimate, not a contract. Sprints get added, split, re-ordered, or dropped as the work teaches us. The Architect updates this file at every session and shows the change in git; the Builder marks a row `done` when that sprint closes.

**About:** 6 sprints on the road
**Last estimated:** 2026-08-02
**Completed before this roadmap existed:** sprints 001-019 (the record lives in
`planning/sprints/` and `planning/STATE.md`)

| # | Sprint | Phase | Status | Why it matters |
| --- | --- | --- | --- | --- |
| 020 | Rate Card Pricing Load + No-Price Guard | Beta launch | done | Loads DriveShop's 639 delivered prices across 20 clients so estimators can build a priced estimate for the first time since June, and makes an unpriced item visibly say so instead of silently costing $0. |
| 021 | Production Hardening | Beta launch | planned | Rotates the Supabase/Anthropic/Resend keys that sat in local plaintext, and moves production off a feature branch onto `main` so nobody ships to the wrong place. |
| 022 | Client Settings + Intacct Customer Mapping | Accounting go-live | planned | Fills the client-level values Dave returned blank — pass-through markup, agency fee, office payout — and maps the 16 remaining clients to Intacct customer IDs so an invoice can name its customer. |
| 023 | Catalog Amendments from Dave's Review | Accounting go-live | planned | Adds flat-rate EV Charging and Per Diem, gives the chauffeur market split its own Item ID, and resolves the four items Dave flagged "Duplicate???". All need accounting to issue IDs first. |
| 024 | First Real Intacct Export End-to-End | Accounting go-live | planned | Finishes Sprint 018 Phase 2 — wire `dueDate`, confirm default scalars, decide corporate scope — and runs a real AR+AP export on a priced estimate. The actual finish line for accounting. |
| 025 | Corporate Event Cost & Gross Profit | Margin correctness | planned | Corporate-structure estimates record no cost today, so they show roughly 100% gross profit. Restores true margin and makes the GP threshold meaningful on non-office events. |

## Notes

- **020 and 021 are the "they can start using it" pair.** 022-024 are the "accounting is off the spreadsheet" band. 025 is correctness cleanup that becomes urgent only when corporate events run through the app in volume.
- **022 and 023 are both blocked on DriveShop, not on us.** They can run in either order, or merge into one sprint, depending on what Tatiana and Dave return and when. Do not start 024 before both land — a real export needs both the customer IDs and the amended catalog.
- **025 may grow.** No cost data exists for corporate events in any form DriveShop has sent. If the answer turns out to be a derived rule (cost = rate x a percentage), it is small; if it needs a per-item corporate cost column collected from finance, it is a sprint of its own plus a client dependency.
- The old Sprint 016 rate card carried per-item `corporate_cost` values that Sprint 019 deleted. That data is recoverable from `scripts/import_rate_cards.sql` in git if 025 needs a starting point.
