# Sprint 018 — Office Cost Correction + Intacct Export

Two phases. **Phase 1 (Office Cost Correction) is unblocked and is the work of this sprint.** Phase 2 (Intacct Export) remains blocked on mapping data from finance and is documented here and in NOTES.md for continuity — do not start it.

## Background — why Phase 1 exists

- Sprint 017's W8 investigation found office-event labor cost is computed **inverted**.
- **Confirmed 2026-06-01 by Dave Morck (VP Operations):** "DriveShop corporate keeps 25%, we pay 75% to the offices." Scoped to **fee items (non-pass-through)**. In other words: the office **receives** the payout, so the payout **is** DriveShop's cost.
- Three independent signals agree: Dave's confirmation, the DOMAIN doc ("office receives ~75% of revenue"), and ~1,700 historical estimates where office cost clustered at ~75% of rate (3,200 line items one way, 0 the other).
- The same office cost formula feeds the **Intacct AP (bill) amounts**, so correcting it (Phase 1) is a prerequisite for correct AP output (Phase 2).
- **CFO sign-off:** Tatiana was copied and has not yet replied. Dave's answer is authoritative for operations and the data corroborates it; proceed, but revisit if the CFO dissents.

## Phase 1 — Office Cost Correction (DO NOW)

### Issue 3 — Formula direction (the confirmed fix)
- **Current (wrong):** office labor `cost_rate = day_rate × (1 − office_payout_pct)`. e.g. $140 × (1 − 0.75) = **$35** cost, ~75% margin.
- **Correct:** office labor `cost_rate = day_rate × office_payout_pct`. e.g. $140 × 0.75 = **$105** cost, $35 margin (~25%).
- `office_payout_pct` is stored as a **fraction** (0.75; 0.80 for VW). So the change is literally swapping `(1 − office_payout_pct)` for `office_payout_pct`.
- **Known locations** (from the W8 investigation; Builder to confirm exact lines): `ScheduleGrid.tsx` (~148, ~159, the schedule-staff and custom-role add paths) and `EstimateBuilderPage.tsx` (~1076, ~1087, the manual-labor add handler).
- **Scope:** office events, fee/labor (non-pass-through) only.

### Issue 1 — Recompute on change
- **Current:** `cost_rate` is computed once at row-add time and **frozen**. Toggling Corporate↔Office (or changing the client's payout) does not re-derive `cost_rate` on existing rows — they keep stale values (often $0 from when added as Corporate).
- **Required:** office `cost_rate` must reflect the current `cost_structure` and `office_payout_pct`. The Builder investigates and proposes the lower-risk approach **in this codebase**:
  - **(a) recompute-and-persist** `cost_rate` whenever `cost_structure` / payout changes; or
  - **(b) derive at read-time** — stop storing office `cost_rate`, compute it in the derivation layer — which eliminates staleness and backfill entirely.
- Decision is made at the gate, favoring the smallest safe change consistent with the single-source-of-truth lesson from Sprint 017.

### Acceptance (Phase 1)
- A newly added office labor row at 0.75 payout on a $140 rate shows **cost $105, margin $35 (~25%)**. Corporate rows unchanged. Pass-through unchanged.
- Toggling an estimate Corporate→Office (and back) recomputes office `cost_rate` correctly; no stale values remain on affected rows.
- The on-screen P&L, version snapshots, change-order baselines, and the data feed all reflect the corrected office cost (they consume the same `cost_rate` / canonical engine).
- Corrected office cost cross-checks against the historical ~75%-cost / ~25%-margin norm.
- `tsc` + `eslint` clean.

### Known consequence — existing estimates (no backfill in scope)
- This sprint does **not** run a one-time data backfill of historical office estimates.
- If approach **(b) derive-at-read-time** is chosen, existing estimates auto-correct on next render — no backfill needed.
- If approach **(a) recompute-on-change** is chosen, existing office rows keep their old (inverted) `cost_rate` until the estimate is toggled/edited/re-saved. This is a deliberate scope boundary, not an oversight; a backfill can be a separate later task if desired.

## Phase 2 — Intacct Export (BLOCKED — do not start)

- The AR/AP CSV exporter is already built and matches the AR/AP upload templates field-for-field (see `NOTES.md`).
- Blocked on: Intacct mapping-data population (item IDs 0/967, GL accounts, customer/vendor IDs, dept/location/project codes), corporate-scope decision, `dueDate` wiring, and default-value confirmation.
- Phase 1 unblocks the **correctness** of the AP amounts (computed from the office cost formula). Phase 2 still cannot run until the mapping data lands. Documented here for continuity only.

## Out of scope (this sprint)

- Corporate-event cost handling (corporate `cost_rate` currently 0 / placeholder rate card) — separate question, not part of Dave's office confirmation.
- Pass-through markup logic — unaffected by office payout.
- One-time backfill of historical office estimates — explicitly excluded.
- All of Phase 2 (Intacct mapping-data population and export build) — blocked.
- PDF labor rollup divergence — separate deferred item with its own guardrail.
