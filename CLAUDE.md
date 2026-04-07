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
- PDF: WeasyPrint (to be added)
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
- GP threshold warning: system_settings key 'gp_threshold_pct' (default 20%). Summary tab shows amber banner when GP% is below threshold.
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

## Current State

- Phase 2, Week 11-12. Change Orders sprint complete. Outputs sprint continuing.
- **Completed this session:**
  - **Lightweight "Request Edit" flow:** "Request Edit" button on active segments. Requires reason, captures version snapshot, transitions segment back to `estimate` for editing. No CO record — version history is the audit trail. Re-submission goes through normal approval flow.
  - **Formal "Create Change Order" flow:** "Create Change Order" button on active segments. Creates numbered CO record (CO-001, CO-002), captures baseline snapshot, unlocks segment for editing. Blue banner shows CO in progress. "Submit Change Order" replaces normal submit button.
  - **Auto-computed delta:** On CO submission, `computeDelta()` diffs baseline snapshot vs current state. Compares labor entries, line items, and schedule entries. Categorizes changes as added/removed/modified with dollar amounts. Handles both schedule-driven and manual labor segments.
  - **CO approval routing:** `handleApprove`/`handleReject` in EstimateBuilderPage detect submitted COs and route through `approveChangeOrder`/`rejectChangeOrder` which wrap `reviewApproval` and handle CO record lifecycle. Rejection rolls back to baseline and returns segment to active.
  - **Delta display in ApprovalBanner:** When a submitted CO exists, ApprovalBanner shows a collapsible delta summary section (added/removed/modified items with dollar amounts) so reviewers see exactly what changed.
  - **Change Order history tab:** VersionHistoryPanel has a third "COs" tab. Shows running total (Original → Current with total delta), timeline of all COs newest-first with status badges, and expandable delta detail per CO.
  - **Database:** `change_orders` table created with co_number, baseline/revised version references, delta_summary JSONB, status machine (draft/submitted/approved/rejected).
  - **Service layer:** `change-order-service.ts` with full CRUD, delta computation, submit/approve/reject lifecycle.
  - **Status transitions:** Added `active` → `estimate` (for reopening) and `estimate` → `active` (for CO rejection rollback) to valid transitions map.
- **Previously completed:** Recap Entry, AI Intelligence (Modes 1-3), Financial Controls, Auth, Workflow, Schedule, Estimate Builder, Rate Cards.
- **Deferred:** Admin Settings UI for GP/approval thresholds (GitHub issue captured). Location-aware historical patterns (logged as enhancement).
- **Next:** PDF generation sprint.

### New Tables Added This Sprint
- `change_orders` (estimate_id, labor_log_id, co_number, description, baseline_version_id, revised_version_id, delta_summary JSONB, baseline_total, revised_total, delta_amount, status, created_by, approved_by, approved_at)

### Tables Added in Prior Sprints
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
- Email notifications wired but Resend integration not deployed yet (Edge Function needed).
- SMS notifications deferred pending feedback.
- PDF generation (WeasyPrint) not yet implemented.
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
- Recap actuals are entered at the line item level. Schedule-level hour-by-hour actuals tracking is deferred.

## Architecture Notes

### Dual Layout System
- `/login` — Public login page
- **AppLayout** (`/`) — Protected. Full internal app with collapsible sidebar (256px expanded, 64px collapsed). Sidebar sections: Discovery Intelligence, Phase 1 Deliverables, Production, UI Concepts, Admin. Header shows NotificationBell and "CONFIDENTIAL" badge.
- **StakeholderLayout** (`/stakeholder`) — Protected. Simplified review portal with its own sidebar.

### Key Service Layers
- `estimate-service.ts` — Estimate/labor CRUD
- `rate-card-service.ts` — Clients, rate cards, fee types CRUD
- `schedule-service.ts` — Schedule grid CRUD + rollup computation
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

### Supabase Tables
clients, rate_card_sections, rate_card_items, fee_types, profiles, notifications, estimates, labor_logs (segments with per-segment status), labor_entries, estimate_line_items, schedule_entries, schedule_day_entries, schedule_day_types, estimate_versions, approval_requests, status_transitions, system_settings, estimate_nudge_dismissals, historical_events, historical_patterns, recap_actuals, receipt_attachments, change_orders

## Environment Variables

| Variable | Purpose |
|----------|---------|
| VITE_ANTHROPIC_API_KEY | Anthropic API key (legacy, no longer used — scoping moved to backend) |
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous/public key |
| VITE_API_URL | FastAPI backend URL (e.g. http://localhost:8000) |
| ANTHROPIC_API_KEY | Claude API key (server-side, in /api/.env) |
| SUPABASE_SERVICE_KEY | Supabase service role key (server-side, in /api/.env) |

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
| Delivery | 12 | Intacct, pipeline dashboard, QA | Not Started |
