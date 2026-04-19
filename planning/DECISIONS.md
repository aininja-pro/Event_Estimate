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
