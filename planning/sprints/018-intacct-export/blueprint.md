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
