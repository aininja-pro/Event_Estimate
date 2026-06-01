# Architect Pack — 018 Office Cost Correction (Phase 1)

**Mode:** Existing Project / Bug Fix (Mode 2)
**Author:** Architect Layer
**Date:** 2026-06-01
**Target project root:** DriveShop Event Estimate Engine repo

## How to apply

1. Save this file to `planning/architect-packs/AP-018-office-cost-correction.md`.
2. Run `/apply-pack use AP-018-office-cost-correction.md` (or dry-run your importer manually).
3. This pack writes TWO NEW files into the existing `planning/sprints/018-intacct-export/` folder. It does **not** overwrite `STATE.md` or `DECISIONS.md` — those are updated in place by the Builder as the final sprint step (Step 5 of the blueprint), because they contain Sprint 017 close-out content that must not be destroyed.
4. Apply after review, then run the Builder handoff.

## What this pack does NOT do

- Writes planning files only. No production code is changed by this pack.
- Does not overwrite STATE.md or DECISIONS.md (in-place edits happen during the sprint).
- Contains no secrets.

## Context note

Sprint 016 = Rate Card Bulk Import (shipped). Sprint 017 = Deploy Readiness (shipped, committed). The W8 investigation in 017 found office-event labor cost is computed **inverted**. On 2026-06-01, Dave Morck (VP Operations) confirmed the direction: "DriveShop corporate keeps 25%, we pay 75% to the offices," scoped to fee items (non-pass-through). This pack turns that confirmed finding into the fix. Tatiana (CFO) was copied and has not yet replied; Dave's answer is authoritative for operations, and the historical data (3,200-to-0) and DOMAIN doc both agree, so the fix proceeds — with a note to revisit only if the CFO dissents.

The office cost formula also feeds the Intacct AP amounts, which is why this work is folded into Sprint 018 (Intacct). Phase 1 (this pack) is the office cost correction and is actionable now. Phase 2 (the Intacct export) remains blocked on mapping data and is documented for continuity only.

---

============================================================
FILE: planning/sprints/018-intacct-export/requirements.md
============================================================

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

============================================================
FILE: planning/sprints/018-intacct-export/blueprint.md
============================================================

# Sprint 018 — Blueprint (Phase 1: Office Cost Correction)

Phase 1 only. Phase 2 (Intacct) is blocked — do not start. **Full gate on the financial logic:** investigate, show current code + proposed fix in plain English, wait for approval before changing code. Same discipline as Sprint 017's financial steps.

## Operating rules for the Builder

- Read CLAUDE.md / AGENTS.md, planning/STATE.md, planning/DECISIONS.md, planning/DOMAIN.md, this requirements.md + blueprint.md, the W8 entries already in DECISIONS.md, and the 018 NOTES.md.
- **Confirmed business rule (do not re-litigate):** the office *receives* the payout → office `cost_rate = day_rate × office_payout_pct` (fraction). Confirmed by Dave Morck 2026-06-01, scoped to fee / non-pass-through items.
- Smallest safe change. Prefer single-source-of-truth over freezing derived values, but do not expand blast radius beyond what's needed.

## Step 1 — Investigate + map the full surface (no code changes)
1. Find every place office `cost_rate` is computed (the four known add-time paths plus any others). Confirm exact files/lines.
2. Find every place `cost_structure` / `office_payout_pct` is read or could trigger a recompute (the Corporate/Office toggle, client payout edits).
3. Confirm units (`office_payout_pct` is a fraction) and that pass-through and corporate paths are separate from this.
4. Report: current behavior; the exact formula change for Issue 3; and the two options for Issue 1 (recompute-and-persist vs derive-at-read-time) with a recommendation for the lower-risk one in this codebase, plus the existing-estimate consequence of each.
5. STOP for approval. No code yet.

## Step 2 — Formula direction (Issue 3) [APPROVAL GATE]
1. On approval, change office cost computation from `day_rate × (1 − office_payout_pct)` to `day_rate × office_payout_pct` in every confirmed location.
2. Show the before/after diff for each location.
3. Verify: a $140 office line at 0.75 → cost $105, margin $35 (~25%). Corporate + pass-through unchanged.

## Step 3 — Recompute on change (Issue 1) [APPROVAL GATE]
1. Implement the approach approved in Step 1.
2. Show the diff.
3. Verify: toggling Corporate→Office→Corporate recomputes office `cost_rate` correctly with no stale values; the canonical engine, snapshots, and data feed reflect it.

## Step 4 — Verification pass
- New office estimate math correct; toggle recompute correct; corporate + pass-through unchanged.
- Cross-check corrected office cost against the historical ~75%-cost / ~25%-margin pattern.
- `tsc` + `eslint` clean.
- Confirm the AP-amount path (the office payout/cost the Intacct AP builder consumes) now produces the corrected cost. Do not build any Phase 2 Intacct work — just confirm the upstream number is now right.

## Step 5 — Update planning docs (edit in place — do NOT rewrite blind)
- **DECISIONS.md:** flip the W8 entries from "deferred / awaiting confirmation" to: "RESOLVED 2026-06-01 — the office *receives* the payout; office cost = rate × payout; confirmed by Dave Morck (VP Ops), scoped to fee / non-pass-through. Formula corrected + recompute-on-change implemented in Sprint 018 Phase 1. CFO sign-off (Tatiana) pending; revisit only if she dissents." Keep the guardrail note but mark the office-cost portion resolved.
- **STATE.md:** set Sprint 018 active; describe it as two-phase (Phase 1 office cost correction — shipped after this; Phase 2 Intacct — blocked on mapping data). Move the W8 office-cost item from deferred to shipped once verified.
- Use the Edit tool in place on both files. Do not regenerate either file from scratch.

## Out of scope reminder
- Corporate cost handling, pass-through logic, historical backfill, all of Phase 2 (Intacct), and the PDF rollup divergence. Do not touch any of these.
