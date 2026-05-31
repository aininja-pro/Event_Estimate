# Sprint 017 — Deploy Readiness — Blueprint

This sprint is sequenced. The Builder completes one step at a time and shows results before proceeding. Steps W1, W2, and W8 are financial-integrity work and require explicit Architect approval of the proposed fix BEFORE any code change. Steps W3–W6 are configuration and hygiene. W7 is a contained UI addition.

## Operating rules for the Builder

- Read the standard project context first (CLAUDE.md / AGENTS.md, planning/STATE.md, planning/DECISIONS.md, planning/DOMAIN.md, this sprint's requirements.md and blueprint.md).
- For each financial step: show current code, show the canonical reference logic, propose the fix in plain English, and wait for approval. Do not change code before approval on those steps.
- Make each change as small and localized as possible. Prefer delegating to the canonical engine over duplicating math.
- Do not expand scope. Do not touch anything on the Out of Scope list.
- Update STATE.md at the end of the sprint.

## Step sequence

### Step 1 — W1: Agency fee = $0 on PDFs (APPROVAL GATE)
1. Show the per-line computation loop and the section-sum in the PDF data service.
2. Show the canonical fee-basis revenue computation in the estimate-totals engine.
3. Propose the fix in plain English: where the fee-basis branch goes, and how the section/grand totals incorporate it.
4. On approval, apply the minimal fix.
5. Verify: generate a PDF for an estimate with an agency fee; confirm the PDF grand total equals the on-screen total. Confirm a non-fee estimate is unchanged.

### Step 2 — W2: Snapshot + change-order baseline (APPROVAL GATE)
1. Show the snapshot builder's revenue computation and the change-order revenue sum.
2. Propose either delegating both to the canonical engine (preferred) or replicating fee-basis + unplanned handling exactly — flag which path and why.
3. On approval, apply.
4. Verify: snapshot and change-order totals on a fee-bearing estimate match the canonical engine; unplanned items excluded from approved-budget rollups.

### Step 3 — W3: WeasyPrint native libs on Render
1. Inspect the current backend build command in render.yaml and the documented native-library requirement.
2. Propose the cleanest Render-compatible approach (Aptfile vs Docker runtime vs build-command apt step).
3. On approval of approach, apply.
4. Verify locally that the requirements are coherent; final verification is the live PDF render after deploy (Step 7).

### Step 4 — W4: render.yaml env vars
1. List the env vars the backend reads and which are missing from render.yaml.
2. Add the missing keys with secret values set in the dashboard (no values committed; sync disabled for secrets). Set approval base URL and frontend URL to production.
3. Add the new client-email gate var (default disabled for beta), consumed in Step 5.
4. Show the proposed render.yaml diff before applying.

### Step 5 — W5: Hybrid email mode
1. Identify the exact backend code path that sends the client-facing approval email, and the UI control that triggers it.
2. Propose: where the gate var is checked, what happens when disabled, and what the UI shows. Confirm internal routing, transitions, audit trail, and confirm-endpoint are untouched.
3. On approval, apply.
4. Verify both states: disabled (no client email, internal routing intact, UI reflects disabled) and enabled (prior behavior).

### Step 6 — W6: Environment hygiene (no gate — mechanical)
1. Fix the corrupted root `.env` first line.
2. Remove the frontend Anthropic key var; delete the dead frontend AI module (confirm no imports first).
3. Add backend `.env` to `.gitignore`.
4. Show the results. Note the key-rotation recommendation for the operator to action outside the repo.

### Step 7 — W7: Summary tab section percentages
1. Show how the Summary tab derives section totals from the canonical engine.
2. Add a read-only percentage-of-total-bid display per section header.
3. Verify the percentages reconcile with canonical totals and sum to 100%.

### Step 8 — W8: Office-cost recalc investigation (INVESTIGATION GATE)
1. Investigate how cost-structure / office-cost are handled in the line layer and whether they reach any displayed cost.
2. Reconcile the observed walkthrough behavior with the audit finding that these fields only gate the accounting export.
3. Report: files/functions, current behavior, expected behavior, proposed fix in plain English — OR a documented conclusion that the core math is correct and the observation was a display/context artifact.
4. Do not change code until the Architect approves the finding. If a fix is approved, apply it minimally and verify the Corporate/Office toggle recalculates cost and line GP% correctly.

### Step 9 — Close out
1. Update planning/STATE.md: mark 017 shipped with a summary; set 018 (Intacct export) as the next/active sprint.
2. Summarize all changes made and any follow-ups for the Architect.

## Deploy step (operator, after Builder steps verified)
- Push to the deploy branch; confirm Render builds with native libs; smoke-test a live estimate including a PDF render; then release the beta link to the operational users.
