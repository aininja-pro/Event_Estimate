# Architecture

Map of the system. Points at the source of truth (the code) rather than duplicating it. When details matter, read the referenced files directly.

---

## Overview

DriveShop Event Estimate Engine is a full-stack web application for estimating, managing, and recapping automotive experiential marketing events. It replaces a spreadsheet-based workflow with a centralized platform used by DriveShop's internal team (admins, CFOs, operations, production managers, account managers) and their OEM clients (Lucid, VW, JLR, Hankook, Mazda, Mercedes-Benz, Volvo).

The system has a **React frontend** talking to a **Supabase database** directly for CRUD, and a **Python FastAPI backend** for AI workflows, PDF generation, email orchestration, and anything requiring server-side logic or secrets. A **stakeholder review portal** allows external reviewers to browse select pages and submit feedback.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + TypeScript |
| Bundler | Vite 7 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| File parsing | SheetJS (xlsx) |
| Backend | Python + FastAPI (`/api`) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (invite-only) |
| Realtime | Supabase Realtime (notifications bell) |
| AI | Claude API (Anthropic), server-side only |
| PDF | WeasyPrint + Jinja2 templates |
| Email | Resend |
| Accounting | Sage Intacct API (to be added) |
| Deployment | Render (static site + API service) |

---

## Routes

Two layout trees under a single `<BrowserRouter>`:

- **AppLayout** — full internal app. Sidebar sections: Discovery Intelligence, Phase 1 Deliverables, Production, UI Concepts, Admin. Header: NotificationBell + "CONFIDENTIAL" badge.
- **StakeholderLayout** — simplified review portal. Its own sidebar. Header: "REVIEW" badge.
- **Public** — `/login` and `GET /api/approval/confirm/{token}` (branded HTML page, no login required).

Page components are reused across layouts via React Router's `<Outlet />`.

For the full route map + guards (`RequireAuth`, `RequireAdmin`), read **`src/App.tsx`**.

---

## Directory Layout

```
src/                    React frontend
  components/
    layout/             AppLayout, Sidebar, Header (+ Stakeholder variants)
    segments/           SegmentStatusBadge, SegmentTransitionBar
    schedule/           ScheduleGrid, RecapGridCell, AddStaffModal
    ui/                 shadcn/ui primitives
    NotificationBell.tsx
    ApprovalBanner.tsx
    SendToClientModal.tsx
  lib/                  Services + utilities (see "Service Organization" below)
  pages/                Page components
  types/                TypeScript interfaces

api/                    FastAPI backend
  main.py               App entry. Must load_dotenv(override=True) BEFORE route imports.
  routes/               HTTP endpoints (approval, data_feed, email, pdf, ai)
  services/             Backend business logic (see "Service Organization" below)
  templates/            Jinja2 HTML for PDF rendering
  prompts/              AI prompt files (nudge_rules.md — edit in plain English)

scripts/                Python pipeline + SQL migrations
  migration_*.sql       Schema migrations (applied in order)
  supabase_schema.sql   Base schema
  seed_rate_cards.py    Excel rate card → SQL
  import_intacct_catalog.py   Sprint 019 — load DriveShop 160-item catalog + Intacct coding (dry-run → --confirm → operator applies .sql; never opens DB)
  import_rate_card_prices.py  Sprint 020 — load per-client prices onto catalog Item IDs (dry-run → --confirm → operator applies .sql; never opens DB)
  compute_historical_patterns.py   Historical event pattern aggregation

docs/                   Architecture + phase kickoffs
data/                   Client data files, parsed JSON
historical_estimates/   1,700+ reference spreadsheets
planning/              Project planning (STATE, DECISIONS, DOMAIN, sprints/)
```

---

## Service Organization

Services are organized by domain. Read the service file for specifics.

**Frontend services** live in `src/lib/` as `*-service.ts`. **Backend services** live in `api/services/` as `*_service.py`.

### Estimates & Labor
- `estimate-service.ts` — Estimate/labor/line item CRUD, `createPrimarySegmentForEstimate()` (single source of truth for initial segment)
- `estimate-totals.ts` — Shared GR / NR / Cost / GP / GP% computation (used by SummaryTab AND FinancialSummaryCards). Also exports `officeCostRate()` — the single source of truth for office labor cost (`rate × office_payout_pct`), called by all add-time paths and the recompute-on-toggle in `EstimateBuilderPage`; it exists to collapse what were five drifted copies of the formula (Sprint 018 W8 fix). Also exports `isUnpricedRate()` / `listUnpricedLineLabels()` — Sprint 020 no-price guard predicate shared by pickers, Summary banner, and the `estimate → in_review` gate.
- `rate-card-service.ts` — Clients, rate cards, fee types, `getClientApproverForEstimate()`

### Schedule & Recap
- `schedule-service.ts` — Schedule grid CRUD, `computeScheduleRollup()` (keys by `is_unplanned`), planned+actual rollup, recap actuals pre-fill
- `receipt-service.ts` — Receipt upload/download/delete via Supabase Storage bucket `receipts`

### Workflow, Status, Permissions
- `workflow-service.ts` — Status machine, versioning, three-gate approvals, rollback
- `segment-status-service.ts` — Per-segment transitions, edit rules, notification dispatch, client-approver routing
- `permissions.ts` — Role-permission matrix, `hasPermission()`
- `notification-service.ts` — Notification CRUD, role-based dispatch, Realtime triggers
- `system-settings-service.ts` — Configurable settings (GP threshold, approval threshold) with audit

### Change Orders
- `change-order-service.ts` — CO CRUD, delta computation (baseline vs current via version snapshots), per-segment numbering

### AI (frontend)
- `ai-nudge-service.ts` — Nudge fetching, chat messages, dismissals

### AI (backend, `api/services/`)
- `ai_chat_service.py` — Chat endpoint with conversation history, cross-client historical events, rate card context
- `ai_scope_gen_service.py` — Scope generation using client-specific rate card from Supabase
- `ai_scope_service.py` — Scope-to-estimate matching (role name fuzzy matching, section mapping)

### PDF
- `pdf-service.ts` (frontend) — POST to backend, blob download
- `pdf_data_service.py` (backend) — Gathers estimate/CO/recap data from Supabase
- `pdf_render_service.py` (backend) — Jinja2 template rendering + WeasyPrint
- `pdf_merge_service.py` (backend) — Invoice-with-Receipts PDF (merges receipts onto detailed PDF)

### Email & Client Approvals
- `client-approval-service.ts` (frontend) — Send, fetch latest token
- `email_service.py` (backend) — Resend integration (reads `RESEND_API_KEY` at module load — env load order matters)
- `client_approval_service.py` (backend) — Token validation, approval_requests update, segment transition, notification fan-out

### Auth, Dashboard, Historical
- `auth.tsx` — AuthProvider, `useAuth()` / `useUser()` hooks
- `supabase.ts` — Main Supabase client + `createIsolatedClient()` for admin invite
- `dashboard-service.ts` — Aggregated pipeline queries
- `historical-service.ts` — Historical event search for "From History" tab

---

## Database Schema

**Source of truth: `scripts/supabase_schema.sql` + `scripts/migration_*.sql` applied in order.**

Don't inline table definitions here — they drift. For current columns and constraints, read the migrations.

### Table Groupings

| Group | Tables |
|---|---|
| Clients & Rate Cards | `clients`, `rate_card_sections`, `rate_card_items`, `fee_types` |
| Estimates | `estimates`, `labor_logs`, `labor_entries`, `estimate_line_items` |
| Schedule | `schedule_entries`, `schedule_day_entries`, `schedule_day_types` |
| Workflow | `estimate_versions`, `approval_requests`, `status_transitions`, `segment_activities` |
| Recap | `recap_actuals`, `receipt_attachments` |
| Change Orders | `change_orders` |
| AI | `historical_events`, `historical_patterns`, `estimate_nudge_dismissals` |
| Auth & Notifications | `profiles`, `notifications` |
| Client Approval | `client_approval_tokens` |
| Configuration | `system_settings` |
| Feedback (Phase 1 legacy) | `feedback` |

### Storage Buckets

- `receipts` — Path pattern `receipts/{estimate_id}/{line_item_id}/{timestamp}_{filename}`

---

## Subsystem Deep Dives

For the WHY (design decisions, non-obvious behaviors, rules future work must respect): **`@planning/DECISIONS.md`**

For the HOW of a specific subsystem, read the service file(s) listed below.

| Subsystem | Read |
|---|---|
| Segment-level workflow (status state machine, edit rules) | `segment-status-service.ts` + `workflow-service.ts` |
| Three-gate approval chain | `workflow-service.ts` + DECISIONS §Workflow & Status |
| Client-specific approval routing | `rate-card-service.ts:getClientApproverForEstimate()` + DECISIONS §Workflow & Status |
| AI nudge engine | `api/prompts/nudge_rules.md` + `api/services/ai_*.py` + DECISIONS §AI |
| AI Chat (Mode 2) | `api/services/ai_chat_service.py` |
| AI Scoping (Mode 3) | `api/services/ai_scope_gen_service.py` + `ai_scope_service.py` |
| Change orders + delta computation | `change-order-service.ts` + DECISIONS §Change Orders |
| Recap actuals + variance | `schedule-service.ts:computeScheduleRollup()` + `estimate-totals.ts` + DECISIONS §Schedule & Recap |
| Unplanned additions | Scattered across estimate/schedule/labor services — DECISIONS §Unplanned Additions has the full rule set |
| PDF pipeline | `pdf-service.ts` → `pdf_data_service.py` → `pdf_render_service.py` (+ `pdf_merge_service.py` for invoice) |
| Client approval email flow | `POST /api/email/send-client-approval` + `GET /api/approval/confirm/{token}` + `email_service.py` + `client_approval_service.py` |
| Data feed API | `api/routes/data_feed.py` |
| System settings (GP threshold, approval threshold) | `system-settings-service.ts` + DECISIONS §Financial Controls |

---

## Realtime & Notifications

- `notifications` table has Realtime enabled
- `NotificationBell.tsx` subscribes to live updates
- Toast notifications fire from NotificationBell's Realtime subscription (via `sonner`)
- RLS ensures users only see their own notifications

---

## Environment & Deployment

- **Env vars:** See `.env.example` in repo root (single source of truth)
- **Hosting (since 2026-08-27):** everything runs on DriveShop's accounts — GitHub `DriveShopDave/Event_Estimate`, Render (both services), Supabase, Anthropic. Push to `main` of that repo to deploy.
- **Frontend deploy:** Render static site with SPA rewrite, auto-deploys on push to `main`. `public/guide.html` ships the in-app User Guide.
- **Backend deploy:** Render web service, **root directory blank** so the repo-root `Aptfile` installs WeasyPrint's native libs (Pango/Cairo/gdk-pixbuf). Build `cd api && pip install -r requirements.txt`; start `cd api && uvicorn main:app --host 0.0.0.0 --port $PORT`
- **AI:** three FastAPI services call Claude (`claude-opus-5`) on DriveShop's key; responses are parsed from the first text block because Opus 5 can lead with a thinking block
- **Local backend:** `cd api && uvicorn main:app --reload --port 8000`
- **Local frontend:** `npm run dev`

---

## Update Discipline

Update this file when:
- A new top-level subsystem is added (e.g., Sage Intacct integration)
- A service is added, renamed, or deleted
- A new table grouping is introduced
- Deployment or build requirements change

Do NOT update this file for:
- Implementation details inside a service (those live in code + DECISIONS.md)
- Bug fixes (those are sprint history)
- Specific column changes (those live in migrations)

**If this file starts drifting past 250 lines, split by subsystem. Current: ~150 lines.**
