# Decisions

Non-obvious choices made during the build that future sprints must respect. Each entry is a decision you'd otherwise forget and accidentally undo.

If you're about to change something in this codebase and the change would violate a rule here, **stop and check in first.**

---

## Estimates & Line Items

- **Agency fee auto-generation** — Agency fee auto-generated on estimate creation via `createAutoFeeLines()` in `estimate-service.ts`. Fee line stored as `section='fees'`, `fee_basis='total_estimate'`, `is_auto_generated=true`.
- **Duplicate estimate** — Clears `person_name` fields and skips auto-generated fee lines (agency fee regenerates fresh on the duplicate).
- **Estimate creation from scope** — Creates: estimate + labor log + labor entries + line items + schedule day types + schedule entries + day entries (10hr) + agency fee.
- **Initial primary segment** — Every estimate must have one. `createPrimarySegmentForEstimate()` in `estimate-service.ts` is the single source of truth. Used on the create path AND as self-repair fallback in `EstimateBuilderPage` when `laborLogs.length === 0`. Header save and Add Location also call it on demand.
- **Header → segment date sync** — Single-segment only. `handleUpdateEstimate` propagates `start_date` / `end_date` from the estimate header to the segment **only** when there is exactly one primary segment. Multi-segment estimates own per-segment timelines — never overwrite from header.
- **Late-added segments** — Default to `status: 'pipeline'` with `null` dates. Inherit nothing from the header.
- **GL codes** — `fee_types` is the master table for GL codes. `rate_card_items` reference `fee_type_id`. All add modals propagate `gl_code` and `rate_card_item_id` from the rate card.
- **ComboInput pattern** — Use for dropdowns that also accept free text.

## Workflow & Status

- **Segment-level workflow** — Status lives on `labor_logs`, not estimates. Estimate status computed via `computeEstimateStatus()`.
- **Status transitions** — Use `src/lib/segment-status-service.ts` and `src/lib/workflow-service.ts`. Do not bypass.
- **Version snapshots** — Captured on every status transition, including segment-level.
- **Notifications** — Dispatched on all workflow trigger points via `notification-service.ts`.
- **In-review segments** — Always show "Send Back to Estimate" button (handles post-rollback stuck state).
- **Three-gate approvals** — Threshold-configurable. AM gate is first. CFO gate is threshold-based. Client gate is final.
- **Approval routing** — Client-specific via `clients.primary_approver_id` (FK to `profiles`, `ON DELETE SET NULL`). When set, `segment-status-service.ts` dispatches targeted notification via `createNotification`. When null, falls back to `notifyByRole('account_manager', ...)` — NOT `'cfo'` (that was a latent bug). `submitForApproval` stamps `approval_requests.reviewer` with the approver's UUID for audit. Lookup via `getClientApproverForEstimate(estimateId)` in `rate-card-service.ts` (single joined query).
- **SegmentTransitionBar** — Receives `primaryApprover` as a prop. Confirm dialog shows "This will be sent to {name}" on `in_review` transitions (or broadcast fallback message if unset).
- **Change order approval routing** — `EstimateBuilderPage` detects submitted COs and routes approve/reject through `approveChangeOrder` / `rejectChangeOrder` instead of plain `reviewApproval`.

## Auth & Permissions

- **Auth** — Supabase Auth with invite-only signup via isolated client (`createIsolatedClient()` in `supabase.ts`).
- **Roles** — Five: `admin`, `cfo`, `operations`, `production_manager`, `account_manager`.
- **Role-permission matrix** — `src/lib/permissions.ts` `hasPermission()` function. All gated UI wires through this.
- **RLS** — Enforced on `system_settings` and other admin-write tables. `role = 'admin'` for writes, authenticated read.
- **Admin gate** — Use existing `RequireAdmin` wrapper in `App.tsx`. Don't invent new per-page permission checks unless the use case genuinely warrants it (matches `/admin/users` and `/admin/settings` pattern).

## Rate Cards & Fee Types

- **Locked rates** — `rate_card_items.is_rate_locked` disables `unit_rate` editing in the rate card management dialog.
- **Resource type** — Tracked on `schedule_entries` and `labor_entries` (`internal | external | vendor`). Default `'external'`.

## Schedule & Recap

- **Schedule-driven segments** — Empty `labor_entries`. Labor log UI derives data from `schedule_entries`. Staffing mismatch check skips these segments.
- **Schedule recap actuals** — Each `schedule_day_entries` row carries planned `hours` and nullable `actual_hours`. Entering recap triggers `prefillScheduleActuals()` which copies `hours → actual_hours` where null (idempotent). Unplanned days get `hours=0, actual_hours=N`.
- **Labor Log recap columns (schedule-driven)** — Read-only computed. `computeScheduleRollup()` returns `actual_days`, `actual_revenue_total`, `actual_cost_total` alongside planned totals. `getVarianceReport()` delegates to this rollup for schedule-driven segments instead of reading `recap_actuals`.
- **Skip hours=0 rows on plan side** — `computeScheduleRollup()` skips them so unplanned-actual placeholders don't inflate planned totals.
- **Recap mode edit rules** — Renders additional columns when `editRules.actuals === true`. Original estimate data never modified — actuals are separate records in `recap_actuals`.
- **Name validation gate** — `recap → invoiced` transition blocked until all `schedule_entries` have `person_name` filled. Enforced in both service layer and `SegmentTransitionBar` UI.
- **Pre-fill runs once** — Only on `active/invoiced → recap` transition. Segments that entered recap before this sprint have `actual_hours = NULL` — render as plan until edited or bounced back.

## Unplanned Additions (Recap)

- **Flag** — `is_unplanned BOOLEAN` on `estimate_line_items`, `schedule_day_types`, `schedule_entries`, `labor_entries`.
- **UI pattern** — `"+ Add Unplanned *"` buttons use rose dashed outline. Unplanned rows get rose left-border + UNPLANNED badge + dashes in planned columns.
- **Rollup rule** — Anywhere totals the planned side (`computeEstimateTotals`, `getVarianceReport`, `computeScheduleRollup`), filter or zero-contribute rows with `is_unplanned=true`. Actual side includes them.
- **Schedule rollup keying** — `computeScheduleRollup` keys by `is_unplanned` so planned vs unplanned copies of the same role stay separate rows. `LaborRollupRow.is_unplanned` carries the flag through.
- **Save values (line items + manual labor)** — `quantity=0, unit_cost=0, markup_pct=0` (or `quantity=0, days=0, unit_rate=0` for labor). Actual cost in `recap_actuals` keyed on `line_item_id` / `labor_entry_id`.
- **Save values (schedule days + staff rows)** — Parent record `is_unplanned=true`, NO pre-populated `schedule_day_entries`. `RecapGridCell` single-click fills 10h (matches non-recap build flow), double-click clears.
- **Picker locations** — Unplanned pickers live alongside planned modals in `EstimateBuilderPage.tsx` (`AddUnplannedLineItemModal`, `AddUnplannedLaborEntryModal`) and `ScheduleGrid.tsx` (shared `AddStaffModal` + `AddDate dialog` with `mode='unplanned'`). Rate card picker reused for name / GL code / `rate_card_item_id` inheritance.
- **Cannot edit post-creation** — Delete + re-add to change the `is_unplanned` flag.
- **PDF exclusion** — Unplanned items do not appear on client-facing PDFs by default (internal recap only).
- **Schedule-driven vs manual** — Schedule-driven segments can only add unplanned staff via the Schedule tab (Labor Log shows a rose hint linking back). Manual segments can add unplanned roles directly on the Labor Log tab.

## Change Orders

- **Scope** — Per-segment. CO numbers sequential per estimate × segment (CO-001, CO-002).
- **Delta computation** — Compare version snapshots. Baseline (at CO creation) vs current state (at submission). Match entries by `rate_card_item_id` first, then by name.
- **Lightweight vs formal** — "Request Edit" = no CO record, just version history. "Create Change Order" = numbered CO with auto-computed delta.

## Financial Controls

- **GP threshold** — `system_settings` key `gp_threshold_pct` (default 20%). Summary tab shows amber banner when GP% is below threshold. Editable by admins at `/admin/settings` via `updateSystemSetting()` in `system-settings-service.ts`.
- **Financial Summary Cards** — `FinancialSummaryCards` renders GR / NR / Total Cost / GP / GP% above tabs on every Estimate Builder view. Cards and SummaryTab share `computeEstimateTotals()` from `src/lib/estimate-totals.ts` (single source of truth). GP% turns amber below `gp_threshold_pct`. Always shows estimated totals (not actuals), even in recap. Variance surfaced in Summary tab's "Estimated vs Actual" table.
- **Threshold propagation** — `getApprovalThreshold()` re-read on every `submitForApproval()` call (`workflow-service.ts:578`) — picks up new thresholds immediately. `getGPThreshold()` in `EstimateBuilderPage.tsx:2986` fetched once on mount into local state — already-open tabs keep prior value until reload. Admin Settings page surfaces this expectation inline.

## AI (Nudges + Chat + Scoping)

- **API routing** — All Claude API calls route through FastAPI backend. Never call Anthropic API from the frontend.
- **Nudge rules** — Defined in `api/prompts/nudge_rules.md`. Edit rules in plain English — no code changes needed.
- **Nudge refresh** — Queries Supabase directly via `fetchFreshEstimateState()`. Never reads from React state maps.
- **Staffing mismatches** — Pre-computed in backend (`_pre_compute_staffing_mismatches`). Claude reads the result, never does its own role comparison.
- **Cache bypass** — Use `bypass_cache: true` as a top-level field in the nudge request body (not inside `estimate_state`).
- **Chat history** — Managed in frontend React state. Persists on panel collapse, clears on navigation. Max 20 messages per session. No database persistence.
- **AI Scoping** — Generates scope via backend `POST /api/ai/generate-scope` using client-specific rate card. Never calls Claude from frontend.
- **Scope page location** — Lives under Production section in sidebar, not Discovery Intelligence.
- **Historical search** — Pre-fills the Generate New form on AI Scoping. Does not create estimates directly.
- **Scope-to-estimate matching** — Best-effort. Roles not in the rate card created as custom items (null `rate_card_item_id`).

## PDF Generation

- **Pipeline** — All PDF rendering happens server-side via FastAPI. Frontend calls `generatePDF()` from `pdf-service.ts`. Templates are Jinja2 HTML in `api/templates/`. Data gathering in `pdf_data_service.py`, rendering in `pdf_render_service.py`.
- **Filename convention** — `{ClientName}_{EventName}_{Type}_{Date}.pdf`.
- **Receipts storage** — Supabase Storage bucket `receipts`. Path: `receipts/{estimate_id}/{line_item_id}/{timestamp}_{filename}`.
- **Invoice-with-Receipts** — Appends every `receipt_attachment` to the client-facing detailed PDF. PDFs pass through, images converted via Pillow, unsupported types skipped. Includes ALL receipts on the estimate (no per-segment filtering).
- **WeasyPrint deps** — macOS: `DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib`. Render: `apt-get install -y libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libcairo2` in build command.

## Email (Resend)

- **Client approval email** — `client_approval_tokens` table. Token states: pending / approved / expired / superseded. Default 30-day expiry. Optional link to `approval_requests.id`.
- **Send flow** — `POST /api/email/send-client-approval` orchestrates: gather estimate data → render client-facing PDF → supersede existing pending tokens → create new token → call Resend with PDF attached + approval button.
- **Public approval endpoint** — `GET /api/approval/confirm/{token}` is public (no login required). Replicates client-gate branch of `reviewApproval()` in Python: marks token approved, updates `approval_requests`, transitions `labor_logs` to `active`, logs `segment_activities`, fans notifications to `sent_by` + creator + all `account_manager` + all `production_manager` profiles (deduplicated). Returns branded HTML page.
- **Env load order** — `api/main.py` MUST call `load_dotenv(override=True)` **before** importing any route module. `services/email_service.py` reads `os.getenv("RESEND_API_KEY")` at module-load time.

## Render Deployment

- **Two services, one repo (Blueprint).** Production runs on Render via `render.yaml` (Blueprint `driveshop-event-estimate`): static frontend **`event-history`** (`npm install && npm run build` → `dist`, SPA rewrite) + Python backend **`driveshop-api`** (`cd api && pip install -r requirements.txt`; `uvicorn main:app`). First deployed 2026-07-02.
- **Deploy branch is `sprint-018-office-cost-correction`, NOT `main`.** The Blueprint tracks that branch and auto-syncs on every push to it — so it is effectively the production branch. `main` is ~2 sprints behind (Sprint 016). To deploy a change you must push it to the tracked branch. Consolidating onto `main` (merge + repoint Blueprint) is optional future housekeeping.
- **`Aptfile` at repo root is mandatory for the backend** — installs WeasyPrint's native libs (Pango/Cairo/gdk-pixbuf). Backend service root must be the repo root so it's detected; the build then `cd api`. Without it, `from weasyprint import HTML` crashes at runtime.
- **URL env vars must be full `https://…` origins and cannot use `fromService`.** Render's `fromService` only exposes `host`/`port`/`hostport` (private-network hostname, no scheme), but the app consumes `VITE_API_URL` / `FRONTEND_URL` / `APPROVAL_BASE_URL` as full public URLs (e.g. `${API_URL}/api/...`; CORS origins need the scheme). So these are set by hand to `https://<service>.onrender.com`. `FRONTEND_URL` is CORS-critical (backend defaults it to `http://localhost:5173`, which blocks the deployed frontend if unset); `APPROVAL_BASE_URL` similarly defaults to localhost and breaks approval links.
- **Backend secrets are `sync: false`** (never committed) — set in the Render dashboard on `driveshop-api`: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY`, `DATA_FEED_API_KEY`. `RESEND_FROM_EMAIL` + `CLIENT_APPROVAL_EMAIL_ENABLED` carry committed non-secret values. Frontend `VITE_*` vars are baked at **build** time, so changing them requires a redeploy (Clear cache & redeploy).
- **Vite env vars are build-time.** The static site embeds `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `VITE_API_URL` at build; a value change has no effect until the frontend rebuilds.

## Data Feed

- **Endpoint** — `GET /api/data/estimates`. Read-only. `X-API-Key` header auth. Single shared secret from `DATA_FEED_API_KEY` env var. Rotate by editing `api/.env` and restarting (no UI).
- **Output** — JSON + CSV. Filters: status, client, date.
- **Compute** — Totals computed fresh per-estimate via `get_estimate_pdf_data()`. Correct but O(n).

## TypeScript / Tooling

- **Force type check** — Use `npx tsc -b --force` when adding required fields to shared interfaces. `tsc --noEmit` alone can miss stale errors due to incremental build cache.

## System Settings Approach

- **Per-client primary approver** — Tactical fix. Broader future direction is role-based workflow rules engine (routing, escalation, notification targeting) — once enough hardcoded branches accumulate in `segment-status-service.ts` / `workflow-service.ts` to justify it.
- **No per-estimate approver override** — If AM is OOO, admin changes `clients.primary_approver_id` on the client record. Affects all their clients' active estimates simultaneously.

## Known Constraints & Gotchas

Things learned the hard way that future work must respect. Each one exists because we got bitten.

- **Data feed compute** — Totals computed fresh per-estimate via `get_estimate_pdf_data()`. Correct but O(n) per request. If response times become a problem, switch to reading `estimate_versions.snapshot_json` with a freshness check.
- **Invoice-with-Receipts scope** — Includes ALL receipts on the estimate regardless of `segment_id`. Per-segment invoices would require joining through `estimate_line_items.labor_log_id`.
- **Invoice-with-Receipts silent skip** — Backend silently skips non-image, non-PDF attachments (CSV/XLSX). `meta.skipped` list returned but frontend doesn't surface it.
- **Resend sender domain** — `driveshop.com` not yet verified. While using `onboarding@resend.dev` as the from-address, Resend only delivers to the email on the Resend account (`aininja.pro@gmail.com`). Once DNS verified, swap `RESEND_FROM_EMAIL=estimates@driveshop.com`.
- **Data feed API key** — Single shared `X-API-Key` header. No rotation UI. Rotate by editing `api/.env` and restarting. Upgrade to OAuth / Supabase auth if broader access is needed.
- **Historical patterns** — Client × event_type only. Location-aware patterns logged as enhancement but not built.
- **Historical pattern refresh** — Pre-computed aggregates. Rerun `scripts/compute_historical_patterns.py` after adding new event data.
- **Event type classification** — Used Claude Haiku. Spot-check `Other` classifications (243 events) for potential misclassification.
- **Nudge rules** — Starter set. Expand based on Dave/Tatiana feedback.
- **Receipt attachments** — One file per line item. Multiple attachments per line item is a future enhancement.
- **DriveShop internal rate card** — Structure in place, $0 placeholders. Needs real rate values from Derek/HR.
- **PDF templates** — Text-based DriveShop branding. Logo image can be added later.
- **Export dropdown** — Shows 4 PDF types (client summary/detailed, internal, invoice with receipts). Change Order and Recap PDF options deferred until those flows are more common.
- **Recap actuals scope** — Line items and manual labor entries entered at line-item level via `recap_actuals`. Schedule-driven segments derive labor actuals from `schedule_day_entries.actual_hours` and cannot be edited on the Labor Log tab.
- **Totals computed in multiple independent places** — Estimate totals are re-implemented separately in the canonical engine (`src/lib/estimate-totals.ts`), an inline copy in `EstimateBuilderPage.tsx` (the on-screen Summary P&L), the PDF service (`api/services/pdf_data_service.py`), the version-snapshot builder (`workflow-service.ts`), and change-order baselines (`change-order-service.ts`); they can drift (e.g. round-then-sum vs sum-then-round, fee-basis handling). Consolidating onto one engine is a known candidate for a future sprint. (Sprint 017 W1/W2 aligned the PDF and snapshot to the canonical engine; `EstimateBuilderPage` inline copy still independent.)
- **CO deltas don't reflect the agency-fee ripple** — Change-order baseline/revised totals are per-segment (Sprint 017 W2, Option A). A CO that changes segment revenue also changes the estimate-wide agency fee, but that ripple is not attributed into the per-segment CO delta. Whether CO deltas should include the fee ripple is a correctness refinement pending Tatiana's input.
- **Approval threshold is fee-blind by design** — `computeSegmentRevenue` (the threshold input) is per-segment and now includes per-segment fee-basis lines and excludes unplanned (Sprint 017 W2), but does NOT add the estimate-wide agency fee. Whether the agency fee should push an estimate over the CFO approval threshold is a governance decision for Tatiana.
- **PDF labor rollup diverges from the canonical engine on recap/unplanned data** (deferred, Sprint 017 W2 finding) — The PDF's `_compute_schedule_rollup` (`api/services/pdf_data_service.py`) and the canonical `computeScheduleRollup` (`src/lib/schedule-service.ts`, used by the screen + version snapshots) produce different labor totals for estimates that have entered **recap with unplanned schedule additions**. Two symptoms, one root cause (two independent rollup implementations): (1) **is_unplanned classification** — the PDF counts rows the canonical engine treats as unplanned; (2) **worked-day counting** — the PDF counts more worked days per role (picks up actual/extra recap days the canonical engine excludes). **Scope:** recap-stage estimates with unplanned schedule items only — estimate/approval-phase PDFs (no recap, no unplanned) match the screen to the cent. **Severity:** material where it hits — e.g. Mazda Ride & Drive shows PDF labor 6,935 vs screen 4,940 (+$1,995 / +40%), and wrongly includes an unplanned row on a client-facing PDF (DECISIONS says unplanned must be excluded from client PDFs). Canonical screen engine is the source of truth; the PDF is wrong. **Right fix is consolidation, not a one-off patch:** point the PDF at the canonical rollup — part of the "Totals computed in multiple independent places" item above. **Operational guardrail until reconciled: do NOT generate client-facing PDFs for recap-stage estimates that have unplanned schedule items.**

- **Office-event labor cost/GP formula was INVERTED — RESOLVED 2026-06-01 (Sprint 018 Phase 1)** (investigated Sprint 017 W8) — For office-structure estimates, labor `cost_rate` was computed as `day_rate × (1 − office_payout_pct)`. DOMAIN says the office **receives** `office_payout_pct` of revenue (≈75%), so that share is DriveShop's **cost**; cost should be `day_rate × payout`, GP = `day_rate × (1 − payout)`. The old formula was backwards (it booked the office's 75% share as GP and DriveShop's 25% as cost).
  - **RESOLVED — the office *receives* the payout; office cost = `day_rate × office_payout_pct`.** Confirmed by **Dave Morck (VP Operations) 2026-06-01**, scoped to **fee / non-pass-through** items. Formula direction (Issue ③) corrected **and** recompute-on-change (Issue ①) implemented in Sprint 018 Phase 1. **CFO sign-off (Tatiana) pending — revisit only if she dissents.** Corporate-structure and pass-through paths unaffected.
  - **The formula lived in FIVE sites, not four** (Sprint 018 finding): four add-time write paths (`ScheduleGrid.tsx` ~148/159; `EstimateBuilderPage.tsx` ~1076/1087) **plus a fifth read-time recompute** in `LaborEntryRow` (`EstimateBuilderPage.tsx` ~1792) that ignored the stored value. All five were corrected; **the formula is now a single source of truth — `officeCostRate()` in `estimate-totals.ts`** — called by the add paths and the recompute path, and **site #5 now READS the stored `cost_rate`** like every other consumer (Summary P&L, PDF, snapshots, CO baselines, Intacct AP) so it can never drift again. Recompute-and-persist fires on the Corporate↔Office toggle and on office-row rate change (loops all segments); `office_payout_pct` has no in-estimate editor, so client-side payout changes re-sync on the next toggle/edit (no backfill, consistent with scope).
  - **Three-signal agreement that the code was inverted:**
    1. **Historical data (the ~1,700 estimates): 3,200-to-0.** Across 4,072 FORMAT_A labor roles, recorded cost clusters at `day_rate × payout` (≈0.75) in 3,200 roles (79%) and at `day_rate × (1 − payout)` (≈0.25) in **0** roles. (Real rows, e.g. Mazda Program Director: bill 600, source Margin% 0.25 → revenue $4,200, cost $3,150 = 75%.)
    2. **DOMAIN wording:** "Regional offices receive a percentage of revenue (typically 75%)" → the office's share is the cost.
    3. **Dave's symptom:** his $140 office line showed ~75% GP ($105) where the historical norm is ~25% GP / 75% cost — exactly the inversion.
  - **Provenance of the historical evidence is proven clean (not circular):** the figures were carried verbatim from the source spreadsheets (DB cost values matched the pure-extract output for **986/986** overlapping files); the historical extract/migration pipeline never runs the app's office-payout formula (that formula is frontend-only TypeScript).
  - **Honest caveats:** (a) historical records have **no explicit office/corporate flag** — the "office" inference rests on the dominant 25%-margin labor cluster landing exactly at the canonical 0.75 payout (strong corroboration, but inferential); (b) historical data shows **what was done, not what is authoritative** — Tatiana confirms the intended direction.
  - **Two linked bugs — fixed as a PAIR in Sprint 018 Phase 1:**
    - **Issue ① (recompute on toggle) — DONE:** `cost_rate` was frozen at row-add time; toggling `cost_structure` (or changing `office_payout_pct`) did not re-derive existing rows. Now recompute-and-persist on the Corporate↔Office toggle and on office-row rate change, across all segments (`recomputeLaborCostsForStructure`), keeping a single stored value all consumers read.
    - **Issue ③ (formula direction) — DONE:** corrected to `cost = day_rate × office_payout_pct`, GP = `day_rate × (1 − office_payout_pct)`.
  - **Guardrail RESOLVED for office cost/GP:** office-event cost and GP are now correct in estimates, PDFs, snapshots, thresholds, and the Intacct AP feed. (Corporate-structure estimates were always unaffected.) Note: existing office estimates created before this fix keep their old stored `cost_rate` until toggled/edited/re-saved — no one-time historical backfill was run (deliberate scope boundary).

- **Data-hygiene: historical `cost_rate` field actually holds the source's "Margin %"** (Sprint 017 W8 finding) — In the historical pipeline (`scripts/extract_estimates.py` `extract_labor_roles`, and the `labor_roles[].cost_rate` field stored in `historical_events`), the field named `cost_rate` is read from the source spreadsheet's **Margin %** column (the financial header labels it "Margin %"; per-role `Margin$ ÷ Margin% = role revenue` reconciles). The name is a misnomer — it is a **margin fraction, not a cost**. This mislabel is almost certainly what led the original readiness audit to under-read the office-cost issue (trusting the name "cost_rate" would confirm the inverted formula as correct). **Rename the field to `margin_pct` (extract output + `historical_events.labor_roles`) regardless of W8**, so no one trips on it again. (Renaming touches the migration pipeline + any consumer; low urgency, but do it before the data is relied on for analysis.)

- **Intacct CSV export is built; Sprint 018 is data + correctness, not a from-scratch build** (Sprint 017 investigation; full snapshot in `planning/sprints/018-intacct-export/NOTES.md`) — (1) The AR/Invoice + AP/Bill exporter (`accounting-review-service.ts` → `accounting-export-line-service.ts` → `accounting-csv-service.ts`) is complete end-to-end and matches Tatiana's two templates **field-for-field** (19-col AR header-then-lines; 16-col AP header-repeated; including the `lineprojectId`/`lineProjectId` casing quirk). (2) The blocker is **data, not format**: `rate_card_items.intacct_ar_item_id` + `intacct_ap_gl_account_no` are **0/967** — the wall — and **AR `itemId` has no fallback** (AP `glAccountNo` falls back to legacy `gl_code`, ~34%/37% populated). `clients.intacct_customer_id` is 1/23; client dept/location defaults 0/23. (3) The few populated values are **placeholder test data** (customer `123456`, project `ABC123`, item `9999`), not real Intacct IDs. (4) Of 5 office estimates, **only Test 10/Dallas clears the workflow gate** today, and it still fails at the line level (3 of 5 lines missing `itemId`/`glAccountNo`) → **0 valid exports today**. (5) **AP amounts depend on the W8 office cost-direction fix** — they are inverted until W8 is fixed. So 018 = populate Intacct mapping data with real IDs + fix W8 + confirm default scalar values (`transactionType`, `exchRateType`, `dueDate` wiring) + decide corporate-event scope.

- **Intacct item foundation: started fresh from DriveShop's catalog, not reconciled — RESOLVED 2026-07-01 (Sprint 019)** — The AR-item-ID wall (0/967) is cleared. Two-part story:
  - **Reconciliation-by-GL was abandoned (proven impossible).** The first Sprint 019 plan tried to map the app's existing items to DriveShop's catalog by **Revenue GL**. The Builder's Step 1 investigation proved a machine cannot infer a unique Item ID from a GL: revenue GL is **coarser** than the catalog's item IDs (one GL, e.g. `4025.12`, maps to **22** catalog items; `4000.01` → 7). Only ~30/160 fee_types resolved uniquely; the rule would have cleared just **242/967** rate-card rows, leaving the wall ~75% intact. Do not revive GL-matching for item identity.
  - **Ray confirmed 2026-07-01 the app's items + per-client prices were TEST data**, so we **started fresh**: DriveShop's **160-item catalog** (`data/imports/Item IDs - Dave M Edits_06.24.26.xlsx`) is now the real item foundation. Because every catalog item ships with its own **Item ID (`I0xxx`) + Revenue GL + Cost GL**, the AR-item-ID problem is solved **at the source** — nothing is matched. Mechanism: **full replace**, one atomic transaction, FK-safe order (detach 47 test-estimate `rate_card_item_id` soft-links → `DELETE FROM rate_card_items` (967) → `DELETE FROM fee_types` (160 test) → INSERT 160 catalog items). `fee_types` has no `is_active`, so a clean delete (not deactivate) was the only real fresh start. Script: `scripts/import_intacct_catalog.py` → `scripts/import_intacct_catalog.sql` (dry-run → `--confirm` → operator applies via Supabase; mirrors `import_rate_cards.py`).
  - **Prices are OUT OF SCOPE** — the catalog carries items + accounting codes but **no prices**. Rate cards (`rate_card_items`) are intentionally **empty** after this sprint; real per-client pricing is a **separate future DriveShop delivery** (Dave/Tatiana). Do not invent prices.
  - **Office payout is NOT stored on `fee_types`** (no column; adding one would be a schema change, out of scope). The app uses per-client `clients.office_payout_pct` (the W8 fix reads that). The catalog's per-item payout was logged for Dave, not loaded — 9 non-standard items to confirm (7 Planning-&-Admin labor @ 0.50; 2 Professional Chauffeur @ 0.90); 0.75 = standard split, 1.0 = pass-through/production/travel (expected).
  - **GL data-fidelity fix:** 131/160 catalog Cost-GL cells are numeric, so `str(float)` drops trailing zeros (`5000.10`→`5000.1`) — wrong Intacct account numbers. The loader formats numeric GLs to 2 decimals; 3-part overtime sub-accounts (e.g. `5000.26.01`) arrive as text and pass through unchanged.
  - **Reference tables loaded** from `data/imports/Intacct Coding.xlsx`: `office_accounting_profiles` = 15 offices (blank Corporate row skipped); `revenue_segments` = 10; `clients.intacct_customer_id` set on **7** clean name matches (Genesis, Hyundai, Lamborghini, Maserati, Mazda, Toyota, Volvo). **16 client→customer exceptions** left for the 2026-07-02 Dave meeting (Acura, Audi, Bentley, Ferrari, Hankook, Honda, JLR, Lexus, Lucid, MB, No Client, Polestar, Porsche, VW, Volkswagen, Volvo MS). Reference upserts are idempotent (`ON CONFLICT` on the natural unique field), so they did **not** remove two pre-existing placeholder rows (`Test Office`, `Test Revenue`) — those remain referenced by the `Test 10`/`Mazda Test Drive` test estimates; harmless, optional cleanup.
  - **Historical data safe:** `historical_events` (1,674) + `historical_patterns` (98) store their data as JSON with **no FK** to `fee_types`/`rate_card_items` — untouched by the replace. The 6 existing (test) estimates were preserved; only their `rate_card_item_id` soft-links were nulled (estimate rows denormalize `unit_rate`/`unit_cost`/`gl_code`/name at creation, so no stored number changed).
