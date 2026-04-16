# DriveShop Event Estimate Engine

A web application replacing DriveShop's spreadsheet-based event estimation workflow with an intelligent, centralized platform. DriveShop is an automotive experiential marketing company managing vehicle programs (test drives, launches, fleet management) for OEM clients.

Client: DriveShop (Derek Drake, CEO)
Phase: Assembly (Phase 2, Week 9)
Started: February 2026
Tool Ladder Level: 3 (VS Code + Claude Code)

## Tech Stack

- Frontend: React 19 + TypeScript, Vite 7, React Router v7
- Styling: Tailwind CSS v4 + shadcn/ui
- Charts: Recharts
- File Parsing: SheetJS (xlsx) for CSV/Excel import
- Database: PostgreSQL via Supabase
- Backend: Python + FastAPI (/api directory)
- AI: Claude API (Anthropic)
- PDF: WeasyPrint (api/templates/ for HTML templates, Jinja2 rendering)
- Accounting: Sage Intacct API (to be added)
- Deployment: Render (static site with SPA rewrite)

## Workspaces

- /.planning — Phase plans, roadmap, project state, codebase conventions, architecture docs
- /src — Application code (React frontend)
- /scripts — Python data pipeline, migrations, seed scripts
- /docs — Architecture docs, phase kickoffs, screenshots
- /data — Client data files, parsed JSON, historical template
- /historical_estimates — 1,700+ historical estimate spreadsheets (reference data)

## Routing

| Task | Go to | Read |
|------|-------|------|
| Understand project scope and phases | /.planning | PROJECT.md + ROADMAP.md + STATE.md |
| Understand architecture and patterns | /.planning/codebase | ARCHITECTURE.md + CONVENTIONS.md + STACK.md |
| Understand current concerns or risks | /.planning/codebase | CONCERNS.md |
| See what was done in a specific phase | /.planning/phases/[phase] | PLAN.md + SUMMARY.md files |
| Write application code | /src | This CLAUDE.md (conventions below) |
| Write or run a migration | /scripts | Existing migration files as reference |
| Review architecture docs | /docs | ARCHITECTURE.md |
| Review phase kickoff docs | /docs/phase-kickoffs | Relevant kickoff MD |
| Work with data files | /data | Existing JSON/XLSX files |
| Debug or investigate | /src | Read the specific files first, then answer |

## Commands

| Action | Command |
|--------|---------|
| Dev server (frontend) | npm run dev |
| Dev server (backend) | cd api && uvicorn main:app --reload --port 8000 |
| Build | npm run build |
| Preview build | npm run preview |
| Lint | npx eslint . |
| Deploy | Push to main (Render auto-deploys) |

## Working Modes

- **Directed mode:** I tell you exactly what to build, file by file. Follow instructions precisely.
- **Autonomous mode:** I give you the blueprint and say "build it." You make implementation decisions within the conventions. Ask before deviating from the blueprint.

Current mode: Directed

## Conventions

- Functional React components only. No class components.
- All Supabase queries go through service layers in src/lib/. No direct Supabase calls in components.
- Role-permission checks use src/lib/permissions.ts hasPermission() function.
- Status transitions use src/lib/segment-status-service.ts and src/lib/workflow-service.ts.
- shadcn/ui primitives in src/components/ui/. Do not create custom primitives that duplicate existing ones.
- Consistent text sizing: text-[13px] body, text-[10px] uppercase headers.
- High-contrast light-background color palette for all badges/pills.
- Segment-level workflow: status lives on labor_logs, not estimates. Estimate status computed via computeEstimateStatus().
- fee_types is the master table for GL codes. rate_card_items reference fee_type_id.
- All add modals propagate gl_code and rate_card_item_id from the rate card.
- Version snapshots captured on every status transition including segment-level.
- Notifications dispatched on all workflow trigger points via notification-service.ts.
- Auth uses Supabase Auth with invite-only signup via isolated client. Five roles: admin, cfo, operations, production_manager, account_manager.
- ComboInput pattern for dropdowns that also accept free text.
- Agency fee auto-generated on estimate creation via createAutoFeeLines() in estimate-service.ts. Fee line stored as section='fees', fee_basis='total_estimate', is_auto_generated=true.
- Resource type (internal/external/vendor) tracked on schedule_entries and labor_entries. Default 'external'.
- Locked rates: rate_card_items.is_rate_locked disables unit_rate editing in the rate card management dialog.
- GP threshold warning: system_settings key 'gp_threshold_pct' (default 20%). Summary tab shows amber banner when GP% is below threshold. Editable by admins at `/admin/settings` via `updateSystemSetting()` in `system-settings-service.ts`.
- in_review segments always show "Send Back to Estimate" button (handles post-rollback stuck state).
- AI nudge rules defined in api/prompts/nudge_rules.md. Edit rules in plain English — no code changes needed.
- All Claude API calls route through FastAPI backend. Never call Anthropic API from the frontend.
- Nudge refresh queries Supabase directly via `fetchFreshEstimateState()` — never reads from React state maps.
- Staffing mismatches are pre-computed in the backend (`_pre_compute_staffing_mismatches`). Claude reads the result, never does its own role comparison.
- Schedule-driven segments have empty `labor_entries` — the labor log UI derives data from schedule_entries. Staffing mismatch check skips these segments.
- Cache bypass uses `bypass_cache: true` as a top-level field in the nudge request body (not inside estimate_state).
- Chat conversation history managed in frontend React state. Persists on panel collapse, clears on navigation. Max 20 messages per session.
- AI Scoping generates scope via backend `POST /api/ai/generate-scope` using client-specific rate card. Never calls Claude from frontend.
- Create Estimate from scope creates: estimate + labor log + labor entries + line items + schedule day types + schedule entries + day entries (10hr) + agency fee.
- Recap mode renders additional columns when `editRules.actuals === true`. Original estimate data is never modified — actuals are separate records in recap_actuals.
- Receipts stored in Supabase Storage bucket 'receipts' with path pattern: receipts/{estimate_id}/{line_item_id}/{timestamp}_{filename}.
- Name validation gate: recap → invoiced transition blocked until all schedule_entries have person_name filled. Enforced in both service layer and SegmentTransitionBar UI.
- Change orders are per-segment. CO numbers are sequential per estimate × segment (CO-001, CO-002).
- Delta computation compares version snapshots — baseline (at CO creation) vs current state (at submission). Match entries by rate_card_item_id first, then by name.
- Lightweight edit uses "Request Edit" — no CO record, just version history. Formal change order uses "Create Change Order" — produces a numbered CO with auto-computed delta.
- CO approval routing: EstimateBuilderPage detects submitted COs and routes approve/reject through approveChangeOrder/rejectChangeOrder instead of plain reviewApproval.
- PDF generation: all PDF rendering happens server-side via FastAPI. Frontend calls `generatePDF()` from `pdf-service.ts`. Templates are Jinja2 HTML in `api/templates/`. Data gathering in `pdf_data_service.py`, rendering in `pdf_render_service.py`.
- PDF filename convention: `{ClientName}_{EventName}_{Type}_{Date}.pdf`.
- Duplicate estimate clears person_name fields and skips auto-generated fee lines (agency fee re-generates fresh).
- Historical event search on AI Scoping page pre-fills the Generate New form — does not create estimates directly.
- Schedule recap actuals: each `schedule_day_entries` row carries both planned `hours` and nullable `actual_hours`. Entering recap triggers `prefillScheduleActuals()` which copies `hours → actual_hours` where null (idempotent). Unplanned days get an `hours=0, actual_hours=N` row so the grid can record ad-hoc work without touching the planned total.
- Labor Log recap columns for schedule-driven segments are read-only computed values — `computeScheduleRollup()` now returns `actual_days`, `actual_revenue_total`, `actual_cost_total` alongside the planned totals. `getVarianceReport()` delegates to this rollup for schedule-driven segments instead of reading `recap_actuals`.
- `computeScheduleRollup()` skips `hours = 0` rows when computing the plan side, so unplanned-actual placeholder rows don't inflate planned totals.
- `FinancialSummaryCards` renders GR / NR / Total Cost / GP / GP% above the tabs on every Estimate Builder view. Both the cards and SummaryTab share `computeEstimateTotals()` from `src/lib/estimate-totals.ts` as the single source of truth. GP% turns amber when below `gp_threshold_pct`.
- **Unplanned additions in recap** — `is_unplanned BOOLEAN` flag on `estimate_line_items`, `schedule_day_types`, `schedule_entries`, and `labor_entries`. Recap-only `"+ Add Unplanned *"` buttons (rose dashed outline) open mode-aware pickers that reuse the planned flows. Unplanned items are flagged visually (rose left-border + UNPLANNED badge + dashes in planned columns) and contribute **zero** to approved-budget rollups so overruns land in the Planned vs Actual view automatically.
- **One rule for unplanned rollups:** anywhere totals the planned side (`computeEstimateTotals`, `getVarianceReport`, `computeScheduleRollup`), filter or zero-contribute rows with `is_unplanned=true`. Actual side includes them. `computeScheduleRollup` keys by `is_unplanned` so planned vs unplanned copies of the same role stay separate rows; `LaborRollupRow.is_unplanned` carries the flag through.
- **Unplanned line items and labor entries** save with `quantity=0, unit_cost=0, markup_pct=0` (or `quantity=0, days=0, unit_rate=0` for labor). Actual cost captured in `recap_actuals` keyed on `line_item_id` / `labor_entry_id`.
- **Unplanned schedule days and staff rows** create the parent record with `is_unplanned=true` and **no** pre-populated `schedule_day_entries` — `RecapGridCell` single-click fills 10h (matching the non-recap build flow), double-click clears. Blueprint 1's `hours > 0` planned filter ensures these don't inflate planned totals.
- Unplanned pickers live alongside the planned modals in `EstimateBuilderPage.tsx` (`AddUnplannedLineItemModal`, `AddUnplannedLaborEntryModal`) and `ScheduleGrid.tsx` (shared `AddStaffModal` + `AddDate dialog` with `mode='unplanned'`). Recap title shows an `UNPLANNED` rose badge; submit button uses rose hover styling; rate card picker is reused for name / GL code / rate_card_item_id inheritance.
- Approval routing is client-specific. `clients.primary_approver_id` (FK to `profiles`, `ON DELETE SET NULL`) determines who receives the first-gate (AM) approval notification on `in_review` transitions. When set, `segment-status-service.ts` dispatches a targeted notification to that user via `createNotification`; when null, it falls back to `notifyByRole('account_manager', ...)`. `submitForApproval` also stamps the approver's id on `approval_requests.reviewer` for audit. The approver is looked up via `getClientApproverForEstimate(estimateId)` in `rate-card-service.ts` (single joined query). `SegmentTransitionBar` receives the approver as a prop and surfaces "This will be sent to {name}" in the confirm dialog.
- Every estimate must have an initial primary segment. `createPrimarySegmentForEstimate()` in `estimate-service.ts` is the single source of truth — used by `createEstimate()` on the create path and as a self-repair fallback in `EstimateBuilderPage` when an estimate is opened with `laborLogs.length === 0` (recovers from estimates created before this guarantee existed). Header save and Add Location both call it on demand.
- Header → segment date sync is **single-segment only**. `handleUpdateEstimate` propagates `start_date` / `end_date` from the estimate header to the segment **only** when there is exactly one primary segment. Multi-segment estimates own their per-segment timelines and must not be overwritten by header edits. Late-added segments default to `status: 'pipeline'` with `null` dates and inherit nothing from the header.

## Avoid

- Do not use global state. Use React context or prop drilling.
- Do not put Supabase queries directly in page components. Use service layers.
- Do not hardcode user identity strings. Use useUser() hook.
- Do not add new dependencies without checking if an existing one covers the need.
- Do not modify Supabase schema without a migration script in /scripts.
- Do not speculate about unread code. Read the file first, then answer.
- Do not make major changes without checking in first.

## Critical Rules

1. Think through the problem first. Read the codebase for relevant files before making changes.
2. Check in before major changes. Verify the plan with me.
3. Explain changes at a high level every step of the way.
4. Keep it simple. Every change should impact as little code as possible.
5. Maintain docs/ARCHITECTURE.md when making structural changes.
6. Never speculate about unread code. Read first, answer second.

## Session Log

| Date | What was built | What's next | Notes |
|------|---------------|-------------|-------|
| Wk 1-2 | Rate Card Management Engine, Supabase schema, 8 client rate cards seeded | Estimate Builder | Foundation complete |
| Wk 3-5 | Estimate Builder UI, labor planning, calculations, multi-segment support | Schedule tab | Core build complete |
| Wk 5 | Fee Types tab, fee-type-linked Add Rate, client contacts, bulk import | Schedule grid | Rate card refinements |
| Wk 5-6 | Multi-select modals, custom items, steppers, combo dropdowns, split notes, NR summary, archive/delete | Schedule tab | Builder UX complete |
| Wk 6 | Schedule tab (calendar staffing grid), Labor Log rollup, sortable columns, per-segment dates | Workflow engine | Schedule complete |
| Wk 6-7 | Workflow engine: status machine, versioning, approvals, history panel, rollback, status bar, lockdown | Segment-level workflow | Workflow complete |
| Wk 7 | Segment-level workflow: status on labor_logs, SegmentTransitionBar, SegmentStatusBadge, estimates list overhaul | Auth + notifications | Segment workflow complete |
| Wk 7-8 | UX polish: version history search, segment filter, updated badge colors | Auth foundation | Polish pass done |
| Wk 8 | Auth: Supabase Auth, profiles, login, route guards, admin users, notification bell + Realtime, dispatch on all transitions | Role-permission enforcement | Auth + notifications complete |
| Wk 8 | Role-permission enforcement: permissions.ts, wired into all gated UI, admin invite fixes, RLS | Bug fixes + workflow refinement | Permissions complete |
| Wk 9 | Bug fixes (Add Segment, ordering), three-gate approval chain, configurable threshold, pipeline as default status | Financial Controls sprint | Approval chain complete |
| Wk 9 | Financial Controls: agency fee auto-populate, Fees & Markups tab, resource type tracking, locked rate cards, GP threshold, rollback bug fix | AI Intelligence sprint | Financial Controls complete |
| Wk 9-10 | AI Intelligence Phase 1: FastAPI backend, Claude API integration, nudge rules engine, live Intelligence panel | Historical data pipeline | AI nudges live |
| Wk 10 | AI Historical Pipeline: 988 events migrated to Supabase, event type classification, pre-computed patterns, historically-enriched nudges | Nudge refresh fix | Historical intelligence live |
| Wk 10 | Nudge auto-refresh fix: Supabase-direct fetch, cache bypass, pre-computed staffing mismatches, schedule-driven segment handling, attendance parsing | Mode 2 chat assistant | Nudge refresh complete |
| Wk 10-11 | AI Chat Assistant (Mode 2) + Scoping Bridge (Mode 3): conversational chat in Intelligence panel with cross-client data, AI Scoping page restyled and moved to Production sidebar, Create Estimate from scope with schedule auto-generation, scope generation moved to backend with client-specific rate cards | Outputs sprint | AI Intelligence phase complete |
| Wk 11 | Recap Entry: actuals columns on Labor Log + line items, variance display on Summary, name validation gate, receipt upload via Supabase Storage | Change Orders sprint | Recap mode complete |
| Wk 11-12 | Change Orders: lightweight edit + formal CO with auto-delta, CO tracking in version history, per-segment CO numbering | PDF generation | Change orders complete |
| Wk 12 | PDF Generation: WeasyPrint integration, 4 PDF types (client summary/detailed, internal P&L, change order, recap variance), Export dropdown on Estimate Builder, Jinja2 templates, PDF data service | Pipeline Dashboard | PDF export complete |
| Wk 12 | Pipeline Dashboard: summary cards (pipeline/active/recap/invoiced), status breakdown chart, client breakdown table, monthly volume chart, recent activity feed, loading/empty/error states | QA + Intacct | Dashboard complete |
| Wk 12 | Bug fix: replaced window.location.reload() with React key-based remount on CO rejection | QA + Intacct | CO rejection smooth refresh |
| Wk 12 | Estimate Duplication + Historical Event Search: deep-copy from Estimates list, "From History" tab on AI Scoping with search/filter/template flow | QA polish | Duplicate & history complete |
| Wk 12-13 | Schedule Recap Actuals + Financial Summary Cards: planned vs actual on schedule grid with smart-visibility tints (green under / red over), per-person and per-day plan-vs-actual totals, unplanned-day actuals, pre-fill on active→recap transition, labor log + Summary variance derive from schedule actuals, GR/NR/Cost/GP/GP% cards above the tabs | QA + Intacct | Schedule recap + financial cards complete |
| Wk 13 | Unplanned Additions in Recap: is_unplanned flag on estimate_line_items / schedule_day_types / schedule_entries / labor_entries. "+ Add Unplanned Item / Day / Staff / Role" buttons (rose dashed) in recap open mode-aware pickers reusing the planned modals. Rose left-border + UNPLANNED badge + dashes on planned side everywhere. One-click 10h fill on blank recap cells. Approved-budget rollups (FinancialSummaryCards, SummaryTab variance) stay locked — unplanned additions land as pure overruns in Planned vs Actual | QA + Intacct | Unplanned recap additions complete |
| Wk 13 | Client-Specific Approval Routing: primary_approver_id on clients (FK to profiles, ON DELETE SET NULL), Primary Approver dropdown in Rate Card Management client settings strip, targeted notification on in_review via getClientApproverForEstimate (single joined query), fallback broadcast fixed from role='cfo' → role='account_manager', approval_requests.reviewer stamped for audit, SegmentTransitionBar confirm dialog shows "This will be sent to {name}" (or broadcast fallback message) | Intacct + QA | Approval routing complete |
| Wk 13 | Final Polish Sprint: (1) client approval email via Resend with one-click approval link (client_approval_tokens table, POST /api/email/send-client-approval, public GET /api/approval/confirm/{token} HTML page, SendToClientModal with inline PDF preview, notification fan-out to sent_by + creator + AMs + PMs); (2) toast notifications via sonner fired from NotificationBell realtime subscription; (3) Invoice-with-Receipts PDF export bundling every receipt_attachment (images converted via Pillow, PDFs merged via pypdf); (4) read-only data feed API GET /api/data/estimates with X-API-Key auth, JSON + CSV output, filters for status/client/date | QA + Intacct | Final polish complete |
| Wk 13 | Segment-recovery + pipeline-behavior fixes (PRs #10, #11): `createPrimarySegmentForEstimate()` in `estimate-service.ts` guarantees every new estimate gets an initial primary segment even when location is left blank; self-repair path on header save / Add Location for already-stranded estimates; header → segment date sync narrowed to single-primary-segment case so multi-segment timelines aren't clobbered by header edits; new late-added segments default to `status: 'pipeline'` with null dates; LocationSelector now visible while in pipeline so users can add segments before estimating; primary-placeholder segment renames from "Primary" when a location is set later | QA + Intacct | Segment workflow fixes complete |
| Wk 13 | Recovery PR (#12): rebased 3 polish-sprint commits (Apr 12-13) that were committed locally but never pushed onto current main (which had moved with PRs #10, #11 in the meantime). One conflict resolved in `EstimateBuilderPage.tsx` (combined PR #10's `loadedLogs` rename + segment recovery with this sprint's third Promise.all call for `getClientApproverForEstimate`) | QA + Intacct | All work synced to origin |
| Wk 13 | Admin Settings UI for Financial Thresholds: new `/admin/settings` route (admin-only via existing `RequireAdmin` gate, sidebar nav item under Admin section) with number inputs for `gp_threshold_pct` (0–100) and `approval_threshold` (non-negative integer). `updateSystemSetting(key, value)` upsert added to `system-settings-service.ts` (stamps `updated_by = auth.uid()`). `getSettingAudit(key)` surfaces "Last updated {ts} by {name}" caption per field via a second profile lookup. Save button disables until values are dirty + valid; sonner toast on success/error. Existing RLS on `system_settings` already restricts writes to admin. Completes a Week 9 deferred item for Chris, Joelle, and Tatiana | QA + Intacct | Admin threshold UI complete |

## Current State

- Phase 2, Week 13. QA phase.
- **Completed this session — Admin Settings UI for Financial Thresholds** (`src/lib/system-settings-service.ts`, `src/pages/AdminSettingsPage.tsx`, `src/App.tsx`, `src/components/layout/Sidebar.tsx`):
  - **New page** — `src/pages/AdminSettingsPage.tsx` at `/admin/settings`, gated by the existing `RequireAdmin` wrapper in `App.tsx` (no new permission added — matches the `/admin/users` pattern). Sidebar gains a third "System Settings" item under the Admin section (Settings icon), which only renders for admin role via the existing `isAdmin` check in `Sidebar.tsx`.
  - **Form** — single Card with two number inputs. GP% threshold (0–100, step 0.1) and approval threshold (non-negative integer, step 1). Save button disables until values differ from the loaded baseline AND both are valid. Validation errors surface inline above the button; write failures surface as sonner `toast.error` (Supabase RLS message passed through for debuggability). On success, `toast.success('Saved: GP threshold, Approval threshold')` and the form reloads the baseline + audit caption.
  - **Audit caption** — "Last updated {localized timestamp} by {full_name}" rendered under each field when the row has ever been written. Implemented via new `getSettingAudit(key)` — reads `updated_at` + `updated_by` from `system_settings`, then resolves the name via a second `profiles.full_name` lookup (avoids depending on the auto-generated FK embed name).
  - **Write path** — new `updateSystemSetting(key, value)` in `system-settings-service.ts` upserts `{ key, value, updated_at: now, updated_by: auth.uid() }` with `onConflict: 'key'`. No schema change — the existing RLS policy (`role = 'admin'` for writes, authenticated read) from `migration_system_settings_approval_chain.sql` is already correct. `DEFAULT_APPROVAL_THRESHOLD` and `DEFAULT_GP_THRESHOLD_PCT` promoted to `export const` (cleanup only, no functional change).
  - **Propagation semantics** — `getApprovalThreshold()` is re-read on every `submitForApproval()` call in `workflow-service.ts:578`, so the approval gate picks up new thresholds **immediately** on the next submission (no reload needed). `getGPThreshold()` in `EstimateBuilderPage.tsx:2986` is fetched once on mount into local state, so already-open Estimate Builder tabs keep the prior value until a reload. Settings page carries an inline caption setting that expectation — acceptable because GP is visual (amber tint + banner) and changes rarely. Not worth a Realtime channel or context rewire for this.
  - **Scope held:** no new `manage_system_settings` permission (matches `/admin/users`'s plain-role gate), no live broadcast to open pages, no additional settings beyond the two thresholds. Closes the Week 9 deferred ask from Chris, Joelle, and Tatiana to tune thresholds without SQL.
- **Prior sprint this session — Final Polish Sprint (client approval email + toast + invoice-with-receipts + data feed)** (`scripts/migration_client_approval_tokens.sql`, `api/main.py`, `api/requirements.txt`, `api/routes/approval.py`, `api/routes/data_feed.py`, `api/routes/email.py`, `api/routes/pdf.py`, `api/services/client_approval_service.py`, `api/services/email_service.py`, `api/services/pdf_merge_service.py`, `src/App.tsx`, `src/components/ApprovalBanner.tsx`, `src/components/NotificationBell.tsx`, `src/components/SendToClientModal.tsx`, `src/lib/client-approval-service.ts`, `src/lib/estimate-service.ts`, `src/lib/pdf-service.ts`, `src/pages/EstimateBuilderPage.tsx`, `src/types/estimate.ts`):
  - **Client approval email** — Resend wired as the client-facing email channel. New `client_approval_tokens` table (pending/approved/expired/superseded states, 30-day default expiry, optional link to `approval_requests.id`). `POST /api/email/send-client-approval` orchestrates: gather estimate data → render client-facing PDF → supersede existing pending tokens → create a new token → call Resend with the PDF attached + an "Approve Estimate" button. Public `GET /api/approval/confirm/{token}` replicates the client-gate branch of `reviewApproval()` in Python: marks the token approved, updates `approval_requests`, transitions `labor_logs` to `active`, logs `segment_activities`, and fans notifications out to `sent_by` + creator + all `account_manager` + all `production_manager` profiles (deduplicated). Returns a branded HTML success/error page — no login required for the client.
  - **SendToClientModal** — `src/components/SendToClientModal.tsx` with recipient email (pre-filled from `clients.billing_contact_email`), optional note, and an inline **Preview PDF** link that opens the exact client-facing PDF in a new tab via `previewPDF()` in `pdf-service.ts`. `ApprovalBanner` shows a new "Send to Client" button (blue) on the `client` gate. Manual "Mark Approved (manual)" stays available as a fallback per Dave's preference. A "Sent to X on Y — awaiting client response" chip appears under the banner when a pending token exists; button copy flips to "Resend Email" in that case.
  - **Toast notifications** — `sonner` (added to `package.json`) mounted in `App.tsx` at top-right. `NotificationBell`'s existing Supabase Realtime subscription now also fires a toast (green for `approval_decision`, blue otherwise, 6s duration, "Open" action navigates to the estimate). Bell badge continues to update on the same subscription.
  - **Invoice with Receipts PDF** — new `api/services/pdf_merge_service.py` renders the client-facing **detailed** PDF (billing needs itemization) and appends every `receipt_attachment` for the estimate. Fetches files via 2-minute signed URLs on the private `receipts` bucket. PDFs pass through; images (jpg/png/etc.) convert to PDF pages via Pillow (flattens alpha on white); CSV/XLSX and unreadable files are skipped with a logged warning. Merged with `pypdf.PdfWriter`. Added `invoice_with_receipts` to the `pdf_type` Literal on `/api/pdf/generate` and a matching option in the estimate builder's Export dropdown.
  - **Data feed API** — new `api/routes/data_feed.py` serving `GET /api/data/estimates`. `X-API-Key` auth via FastAPI dependency (fails closed with 503 when the key isn't configured, 401 on mismatch). Query params `status`, `client`, `from_date`, `to_date`, `format=json|csv`, `limit=1..5000` (default 500). Shape: `estimate_id, client_name, event_name, event_type, location, start_date, end_date, duration_days, status, total_revenue, total_cost, gross_profit, gp_percent, segment_count, created_at, updated_at`. Totals computed fresh via `get_estimate_pdf_data()` (correctness > micro-speed at the current volume). CSV variant returns `Content-Type: text/csv` + `Content-Disposition: attachment; filename=driveshop_estimates_{date}.csv`.
  - **load_dotenv timing fix** — `api/main.py` now calls `load_dotenv(override=True)` **before** the route imports. Module-level env reads (`resend.api_key = os.getenv(...)` in `email_service.py`) happen at import time; the previous order left those reads with empty strings. This was the "API key is invalid" bug seen during Step 2 testing.
  - **Scope held:** no frontend `/approve/{token}` route (backend HTML page is simpler and keeps the flow working even if the frontend is down), no `X-API-Key` secret rotation, no per-segment receipt filtering on the invoice PDF (whole estimate by default), no verified `driveshop.com` domain yet (using Resend's `onboarding@resend.dev` sandbox, which restricts delivery to the Resend account holder's inbox).
- **Prior sprint this session — Client-Specific Approval Routing** (`scripts/migration_client_approver.sql`, `src/types/rate-card.ts`, `src/lib/rate-card-service.ts`, `src/lib/segment-status-service.ts`, `src/lib/workflow-service.ts`, `src/pages/RateCardManagementPage.tsx`, `src/pages/EstimateBuilderPage.tsx`, `src/components/segments/SegmentTransitionBar.tsx`):
  - **Migration** — `clients.primary_approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL`. NULL = broadcast fallback; set = targeted routing. `ON DELETE SET NULL` handles profile deletion gracefully.
  - **Service layer** — `rate-card-service.ts` client queries now join `primary_approver:profiles!clients_primary_approver_id_fkey(id, full_name, email, role)` via a shared `CLIENT_SELECT` constant. New `getApproverUsers()` (profiles with role admin|account_manager) and `getClientApproverForEstimate(estimateId)` (single joined query from estimate → client → approver profile).
  - **Rate Card Management UI** — new `ApproverSelect` component in the client settings strip (after Address). `__none__` sentinel for "No assigned approver" since shadcn Select can't accept empty-string values. Admin role users get an "Admin" micro-badge in the options.
  - **Routing** — `segment-status-service.ts` `in_review` branch now dispatches `createNotification` to the client's approver when set, else falls back to `notifyByRole('account_manager', ...)`. **Latent bug fix:** previous fallback was `notifyByRole('cfo', ...)` which never notified AMs despite the AM gate being the first approval gate. `submitForApproval` in `workflow-service.ts` stamps `approval_requests.reviewer` (existing nullable TEXT column) with the approver's UUID for audit.
  - **Submission modal** — `SegmentTransitionBar` receives `primaryApprover` prop from `EstimateBuilderPage` (loaded once in the parallel `Promise.all`). Confirm dialog on any `in_review` transition (Submit for Review + Submit Change Order) shows an amber info block: User icon + "This will be sent to **{full_name}** for review" when set, or Users icon + broadcast fallback message with "No primary approver is set on this client" subline.
  - **Scope held:** no per-estimate approver override (Dave: "it's always the same person"), no client-specific thresholds, no new `approval_requests.assigned_to` column (reused the pre-existing unused `reviewer TEXT`), no email delivery (in-app bell only — Resend not deployed).
- **Prior sprint this session — Unplanned Additions in Recap** (`scripts/migration_unplanned_line_items.sql`, `scripts/migration_unplanned_schedule_days.sql`, `scripts/migration_unplanned_schedule_entries.sql`, `scripts/migration_unplanned_labor_entries.sql`, `src/types/estimate.ts`, `src/types/schedule.ts`, `src/lib/estimate-service.ts`, `src/lib/estimate-totals.ts`, `src/lib/schedule-service.ts`, `src/lib/segment-status-service.ts`, `src/components/schedule/ScheduleGrid.tsx`, `src/pages/AIScopingPage.tsx`, `src/pages/EstimateBuilderPage.tsx`):
  - **Unplanned line items** — `estimate_line_items.is_unplanned`. `"+ Add Unplanned Item"` button (rose dashed) on each line item tab in recap opens a single-select rate card picker with custom fallback and an Actual Cost field. Items save with qty/unit_cost/markup=0; recap_actual captures the cost. `LineItemRow` renders rose left-border + UNPLANNED badge + dashes on planned columns.
  - **Unplanned schedule days** — `schedule_day_types.is_unplanned`. `"+ Add Unplanned Day"` button replaces the hidden Add Date in recap toolbar. Column header gets a rose tint + UNPLANNED micro-badge. Reuses the Add Date dialog with a recap-mode title. X (remove) still available in recap for unplanned columns only.
  - **Unplanned staff (schedule-driven)** — `schedule_entries.is_unplanned`. `"+ Add Unplanned Staff"` button in the recap toolbar opens `AddStaffModal` in `mode='unplanned'` (rose badge, rose submit). No pre-populated day entries; `RecapGridCell` single-click fills 10h for fully-blank cells (matches non-recap build flow). Row renders rose left-border on Name + UNPLANNED badge on Role.
  - **Unplanned roles (manual labor)** — `labor_entries.is_unplanned`. `"+ Add Unplanned Role"` on Labor Log for manual segments; schedule-driven segments show a rose hint that routes to the Schedule tab. New `AddUnplannedLaborEntryModal` mirrors the line item picker. `LaborEntryRow` gets matching rose styling + dashes.
  - **Rollup / variance** — `computeScheduleRollup` now keys by is_unplanned (planned vs unplanned stay as separate rows) and carries the flag on `LaborRollupRow`. `computeEstimateTotals` filters is_unplanned from labor and line item planned totals. `getVarianceReport` zeroes estimated_total for unplanned line items and manual labor entries. Schedule-driven rollup naturally produces `revenue_total=0` for unplanned rows (planned hours=0).
  - **Pattern consistency** — Every `"+ Add Unplanned *"` uses the same rose dashed button. Every unplanned row uses the same `[&>td:first-child]:border-l-[3px] border-l-rose-400` + `bg-rose-50/20` row treatment + `UNPLANNED` rose micro-badge.
  - **Bug fix:** runtime blank-screen on line item tabs caused by a prop declared on a component type but not destructured from the parameter list; also caught via `npx tsc -b --force` which surfaces stale errors that `tsc --noEmit` missed.
- **Previously completed (this project lifecycle):** Schedule Recap Actuals, Financial Summary Cards, Estimate Duplication, Historical Event Search, CO rejection fix, Pipeline Dashboard, PDF Generation, Change Orders, Recap Entry, AI Intelligence (Modes 1-3), Financial Controls, Auth, Workflow, Schedule, Estimate Builder, Rate Cards.
- **Deferred:** Location-aware historical patterns (logged as enhancement). Default landing page setting (dashboard vs estimates). Unplanned items on client-facing PDFs (currently internal-only). Editing the `is_unplanned` flag after creation (delete + re-add for now). `driveshop.com` sender domain verification in Resend (blocks sending to non-account-holder inboxes until verified). Per-estimate approver override (OOO handling) and confirmation email back to the client + internal email to the AM on client approval (post-domain-verification enhancement). Live broadcast of system settings changes to already-open Estimate Builder tabs (GP threshold currently fetches once on mount — reload to see new value).
- **Next:** QA + Intacct.

### New Tables Added This Sprint (Final Polish)
- `client_approval_tokens` — one-click approval tokens issued when an estimate is emailed to a client. Columns: `id`, `estimate_id`, `labor_log_id`, `approval_request_id` (nullable), `token` (UUID, unique), `client_email`, `sent_by` (profile FK, ON DELETE SET NULL), `note`, `sent_at`, `expires_at` (default NOW + 30 days), `approved_at`, `approved_from_ip`, `status` (pending | approved | expired | superseded). Indexes on `token` and `(labor_log_id, status)`. RLS `auth.role() = 'authenticated'` — the public confirmation endpoint uses the service key which bypasses RLS.

### New Columns Added Previously This Session (Client-Specific Approval Routing)
- `clients.primary_approver_id` (UUID REFERENCES profiles(id) ON DELETE SET NULL) — designated internal approver per client. NULL = broadcast to all account_managers on `in_review`.

### New Columns Added (Unplanned Additions Sprint)
- `estimate_line_items.is_unplanned` (BOOLEAN NOT NULL DEFAULT FALSE) — line item added during recap.
- `schedule_day_types.is_unplanned` (BOOLEAN NOT NULL DEFAULT FALSE) — schedule date column added during recap.
- `schedule_entries.is_unplanned` (BOOLEAN NOT NULL DEFAULT FALSE) — staff row added during recap.
- `labor_entries.is_unplanned` (BOOLEAN NOT NULL DEFAULT FALSE) — manual labor entry added during recap.

### New Columns Added (Schedule Recap Actuals Sprint)
- `schedule_day_entries.actual_hours` (DECIMAL(4,1), nullable) — per-cell recap actuals. NULL means "not yet recorded" and renders as plan.

### Tables Added in Prior Sprints
- `change_orders` (estimate_id, labor_log_id, co_number, description, baseline_version_id, revised_version_id, delta_summary JSONB, baseline_total, revised_total, delta_amount, status, created_by, approved_by, approved_at)
- `estimate_nudge_dismissals` (estimate_id, nudge_id, dismissed_by, dismissed_at)
- `historical_events` (1,674 events — filename, client, event_name, event_type, financials, sections, labor_roles)
- `historical_patterns` (98 aggregated patterns — client × event_type with section averages, variances, common roles)

### New Columns Added (Financial Controls Sprint)
- `estimate_line_items.is_auto_generated` (BOOLEAN DEFAULT FALSE)
- `estimate_line_items.fee_basis` (TEXT, nullable)
- `schedule_entries.resource_type` (TEXT DEFAULT 'external', CHECK internal/external/vendor)
- `labor_entries.resource_type` (TEXT DEFAULT 'external', CHECK internal/external/vendor)
- `rate_card_items.is_rate_locked` (BOOLEAN DEFAULT FALSE)

### Known Issues / Tech Debt
- Resend email integration live for client approval emails. Internal notification emails (bell → email) can be wired to Resend as a follow-up once a real sender domain is verified.
- `driveshop.com` not yet verified as a Resend sending domain. While using `onboarding@resend.dev` as the from-address, Resend only delivers to the email address on the Resend account (ours is `aininja.pro@gmail.com`). Once DNS is added and `driveshop.com` verified, swap `RESEND_FROM_EMAIL=estimates@driveshop.com` and arbitrary recipients will work.
- Data feed API uses a single shared `X-API-Key` header. Upgrade to OAuth or Supabase auth if broader access is needed. No key rotation UI — rotate by editing `api/.env` and restarting.
- Data feed totals are computed fresh per-estimate via `get_estimate_pdf_data()`. Correct but O(n) per request. If response times become a problem we can switch to reading `estimate_versions.snapshot_json` with a freshness check.
- Invoice-with-Receipts PDF includes ALL receipts on the estimate regardless of `segment_id`. Per-segment invoices would require a join through `estimate_line_items.labor_log_id`.
- Invoice-with-Receipts silently skips non-image, non-PDF attachments (CSV/XLSX). The backend returns a `meta.skipped` list but the frontend doesn't surface it yet.
- `api/main.py` must call `load_dotenv(override=True)` **before** importing any route module. `services/email_service.py` reads `os.getenv("RESEND_API_KEY")` at module-load time; the previous import order left this empty and produced "API key is invalid" errors.
- SMS notifications deferred pending feedback.
- PDF templates use text-based DriveShop branding. Logo image can be added later.
- WeasyPrint requires system dependencies — on macOS: `DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib`; on Render: add `apt-get install -y libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libcairo2` to build command.
- Export dropdown currently shows 4 PDF types (client summary/detailed, internal, invoice with receipts). Change Order and Recap PDF options can be added when those flows are more commonly used.
- Sage Intacct integration not yet started.
- DriveShop internal rate card needs real rate values from Derek/HR (structure in place, $0 placeholders).
- Historical patterns are pre-computed aggregates — rerun scripts/compute_historical_patterns.py after adding new event data.
- Historical patterns are client × event_type only — location-aware patterns logged as enhancement.
- Event type classification used Claude Haiku — spot-check 'Other' classifications (243 events) for potential misclassification.
- Nudge rules are starter set — expand based on Dave/Tatiana feedback.
- Chat conversation history is session-only — clears on navigation away. No database persistence.
- Mode 3 scope-to-estimate matching is best-effort — roles not in the rate card are created as custom items (null rate_card_item_id).
- AI Scoping page lives under Production section in sidebar, not Discovery Intelligence.
- Receipt upload supports one file per line item. Multiple attachments per line item is a future enhancement.
- Recap actuals for line items and manual labor entries are entered at the line-item level via `recap_actuals`. Schedule-driven segments derive labor actuals from `schedule_day_entries.actual_hours` and cannot be edited on the Labor Log tab.
- Schedule recap pre-fill only runs on the `active/invoiced → recap` transition. Segments that entered recap before this sprint have `actual_hours = NULL` for all cells — they render as plan (no tint) until a user edits, or until the segment is bounced back to active and re-transitioned.
- Financial Summary Cards always show estimated totals (not actuals) across every status, including recap. Variance is surfaced in the Summary tab's "Estimated vs Actual" table.
- Unplanned line items and unplanned labor entries carry `is_unplanned=true` with `quantity=0, unit_cost=0, markup_pct=0` (or `quantity=0, days=0, unit_rate=0` for labor). They're surfaced on variance as $0 Planned / $X Actual / -$X overrun. Cannot edit the flag post-creation — delete + re-add.
- Unplanned items do not appear on client-facing PDFs by default (internal recap data only).
- Schedule-driven segments in recap can add unplanned staff via the Schedule tab only; Labor Log shows a rose hint linking back. Manual segments can add unplanned roles directly on the Labor Log tab.
- `npx tsc --noEmit` alone can miss stale errors due to incremental build cache; use `npx tsc -b --force` when adding required fields to shared interfaces to surface every callsite that needs updating.
- Approval routing uses `approval_requests.reviewer` (pre-existing nullable TEXT column) to stamp the intended approver at submit time. We didn't add an `assigned_to UUID` FK because the existing column satisfies the audit need without a migration. A future refactor could convert this to a proper UUID FK if we need richer queries.
- Per-client primary approver is a tactical fix. Broader future direction is a role-based workflow rules engine (routing, escalation, notification targeting) — once enough hardcoded branches accumulate in `segment-status-service.ts` / `workflow-service.ts` to justify it.
- No per-estimate approver override yet. If an AM is OOO, the admin must change `clients.primary_approver_id` on the client record (affects all their clients' active estimates simultaneously).
- System settings: GP threshold is fetched once on mount in `EstimateBuilderPage.tsx` and held in local state, so already-open tabs keep the old value until reload. Approval threshold is fresh on every `submitForApproval()` call, so it picks up changes immediately on the next submission. The Admin Settings page surfaces this expectation inline.

## Architecture Notes

### Dual Layout System
- `/login` — Public login page
- **AppLayout** (`/`) — Protected. Full internal app with collapsible sidebar (256px expanded, 64px collapsed). Sidebar sections: Discovery Intelligence, Phase 1 Deliverables, Production, UI Concepts, Admin. Header shows NotificationBell and "CONFIDENTIAL" badge.
- **StakeholderLayout** (`/stakeholder`) — Protected. Simplified review portal with its own sidebar.

### Key Service Layers
- `client-approval-service.ts` (frontend) — sendClientApproval() POSTs to the backend send endpoint; getLatestClientApprovalToken() fetches the most recent token for a segment so the banner can show send state
- `email_service.py` (backend) — Resend email sending (currently client approval emails; extend here for future email types)
- `client_approval_service.py` (backend) — Python-side client-gate approval: token validation, approval_requests update, segment transition to active, segment_activities log, fanned-out internal notifications (sent_by + creator + AMs + PMs, deduplicated)
- `pdf_merge_service.py` (backend) — Invoice-with-Receipts PDF: appends every receipt_attachment to the client-facing detailed PDF (PDFs pass through, images converted via Pillow, unsupported types skipped)
- `estimate-service.ts` — Estimate/labor CRUD
- `rate-card-service.ts` — Clients, rate cards, fee types CRUD
- `schedule-service.ts` — Schedule grid CRUD, planned+actual rollup, recap actuals pre-fill
- `workflow-service.ts` — Status machine, versioning, three-gate approvals, rollback
- `segment-status-service.ts` — Per-segment status transitions, edit rules, notification dispatch
- `notification-service.ts` — Notification CRUD + role-based dispatch
- `permissions.ts` — Role-permission matrix and hasPermission()
- `system-settings-service.ts` — Configurable settings (approval threshold)
- `auth.tsx` — AuthProvider, useAuth/useUser hooks
- `supabase.ts` — Main client + createIsolatedClient() for admin invite
- `ai-nudge-service.ts` — Frontend service for fetching nudges, sending chat messages, and managing dismissals
- `ai_chat_service.py` (backend) — Chat endpoint with conversation history, cross-client historical events, rate card context
- `ai_scope_gen_service.py` (backend) — Scope generation using client-specific rate card from Supabase
- `ai_scope_service.py` (backend) — Scope-to-estimate matching: role name fuzzy matching, section mapping
- `receipt-service.ts` — Receipt upload/download/delete via Supabase Storage
- `change-order-service.ts` — Change order CRUD, delta computation, CO lifecycle (create/submit/approve/reject)
- `pdf-service.ts` — Frontend PDF generation (POST to backend, blob download)
- `pdf_data_service.py` (backend) — Gathers estimate/CO/recap data from Supabase for PDF rendering
- `pdf_render_service.py` (backend) — Jinja2 template rendering + WeasyPrint PDF generation
- `dashboard-service.ts` — Aggregated pipeline queries for dashboard (estimates, versions, activities)
- `historical-service.ts` — Historical event search and filtering for "From History" tab
- `estimate-totals.ts` — Shared GR / NR / Cost / GP / GP% computation used by both SummaryTab and FinancialSummaryCards

### Supabase Tables
clients, rate_card_sections, rate_card_items, fee_types, profiles, notifications, estimates, labor_logs (segments with per-segment status), labor_entries, estimate_line_items, schedule_entries, schedule_day_entries, schedule_day_types, estimate_versions, approval_requests, status_transitions, system_settings, estimate_nudge_dismissals, historical_events, historical_patterns, recap_actuals, receipt_attachments, change_orders, client_approval_tokens

## Environment Variables

| Variable | Purpose |
|----------|---------|
| VITE_ANTHROPIC_API_KEY | Anthropic API key (legacy, no longer used — scoping moved to backend) |
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous/public key |
| VITE_API_URL | FastAPI backend URL (e.g. http://localhost:8000) |
| ANTHROPIC_API_KEY | Claude API key (server-side, in /api/.env) |
| SUPABASE_SERVICE_KEY | Supabase service role key (server-side, in /api/.env) |
| RESEND_API_KEY | Resend email API key (server-side, in /api/.env) |
| RESEND_FROM_EMAIL | Sending email address for client communications (e.g. onboarding@resend.dev in dev, estimates@driveshop.com once domain verified) |
| APPROVAL_BASE_URL | Base URL the approval link points at — the FastAPI host serving GET /api/approval/confirm/{token} (e.g. http://localhost:8000 in dev, the Render API URL in prod) |
| DATA_FEED_API_KEY | Shared secret required in the X-API-Key header on GET /api/data/estimates |

## Key Stakeholders

- **Derek** — CEO. Decision maker. Approved Phase 2.
- **Tatiana** — CFO. Owns rate card data, reviews estimates over $50K/$100K.
- **Dave** — Operations. Builds estimates, manages labor logs and FMS data.
- **Dan & Tim** — Production managers. Daily users, key UI feedback providers.
- **Account Managers** (e.g., Gail for Lucid) — Own client relationships and rate cards.

---

## Business Domain Knowledge

### DriveShop's Rate Card System

DriveShop maintains separate rate cards per OEM client. Each client's MSA defines unique rates, markup rules, and cost structures.

**Three Cost Types:**
1. **Labor** — Roles billed at day/hourly rate. Margin on spread between bill and pay rate.
2. **Flat Fees** — Fixed MSA charges, no receipts. Billed per unit/day/event.
3. **Pass-Through Costs** — Receipt-based, passed to client with client-specific markup (Lucid 1.5%, Mazda 5%, VW 0%, Hankook 10%).

**Client-Specific Fields:** Client Name, Third Party Cost Markup %, Agency Fee %, Trucking Markup %.

**Rate Card Sections:** Planning & Admin Labor, Onsite Event Labor, Travel Expenses (pass-through), Creative Costs, Production Expenses (pass-through), Logistics Expenses (flat fee).

**MSA vs Custom:** Each section has MSA rates (locked) and custom rates (added per project, flagged as non-MSA).

**Corporate vs Office:** Corporate events = DriveShop hires contractors directly (variable margin). Office events = regional offices get 75% revenue (80% for VW), pass-throughs at 100%.

**GL Codes:** Standardized across clients. Format: 4000.01, 4025.12, etc. Live in fee_types table.

**Two Rate Sources:**
1. Tatiana's Event Rate Cards (DriveShop_Event_Estimate_Template) — 8 client tabs, primary source.
2. Dave's FMS Rate Matrix — Fleet rates, 146 fee types x 15 brands.

**Rate Card Ownership:** Account Managers own their client rate cards per Tatiana's recommendation.

## Phase 2 Build Plan (12 weeks)

| Phase | Weeks | Focus | Status |
|-------|-------|-------|--------|
| Foundation | 1-2 | Rate card engine, schema, Supabase | Complete |
| Core Build | 3-5 | Estimate builder, labor planning | Complete |
| Workflow | 6-7 | Approvals, versioning, notifications | Complete |
| Auth | 8 | Authentication, roles, permissions | Complete |
| Intelligence | 9-11 | AI scoping, historical data, chat, scoping bridge | Complete |
| Outputs | 10-12 | Change orders, recaps, PDF gen | Change Orders + Recaps Complete |
| Delivery | 12 | Intacct, pipeline dashboard, QA | Pipeline Dashboard Complete |
