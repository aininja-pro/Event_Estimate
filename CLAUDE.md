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

## Current State

- Phase 2, Week 9-10. AI Intelligence sprint.
- **Completed this session:** AI Intelligence Phase 1 (Steps 1-4 of AI Nudges blueprint).
  - Step 1: FastAPI backend (/api) with health check, CORS, Claude API integration
  - Step 2: Nudge rules document (api/prompts/nudge_rules.md) — 20+ plain-English validation rules
  - Step 3: System prompt template (api/prompts/nudge_system_prompt.md) with placeholders
  - Step 4: Frontend integration — live Intelligence panel replacing hardcoded placeholders, dismiss persistence, debounced auto-refresh, loading/error/empty states
- **Previously completed:** Financial Controls (all 5 steps) and all prior sprints.
- **Deferred:** Admin Settings UI for GP/approval thresholds (GitHub issue captured).
- **Next:** Step 5 (deployment config for Render) and Step 6 (already done — this update). Then historical data pipeline.

### New Tables Added This Sprint
- `estimate_nudge_dismissals` (estimate_id, nudge_id, dismissed_by, dismissed_at)

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
- Historical event data (988 bid-vs-actual records) not yet migrated to Supabase — lives in enriched_master_index.json.
- Nudge rules are starter set — expand based on Dave/Tatiana feedback.
- FastAPI backend not yet deployed to Render (runs locally, deployment config pending).

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
- `ai-nudge-service.ts` — Frontend service for fetching nudges from FastAPI and managing dismissals

### Supabase Tables
clients, rate_card_sections, rate_card_items, fee_types, profiles, notifications, estimates, labor_logs (segments with per-segment status), labor_entries, estimate_line_items, schedule_entries, schedule_day_entries, schedule_day_types, estimate_versions, approval_requests, status_transitions, system_settings, estimate_nudge_dismissals

## Environment Variables

| Variable | Purpose |
|----------|---------|
| VITE_ANTHROPIC_API_KEY | Anthropic API key for AI Scoping Assistant |
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
| Intelligence | 9-10 | AI scoping, historical data | In Progress |
| Outputs | 10-11 | Change orders, recaps, PDF gen | Not Started |
| Delivery | 12 | Intacct, pipeline dashboard, QA | Not Started |
