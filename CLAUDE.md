# Claude Code Guidelines

1. **Think through the problem first.** Read the codebase for relevant files before making changes.

2. **Check in before major changes.** Before making any major changes, verify the plan with the user.

3. **Explain changes at a high level.** Every step of the way, provide a high-level explanation of what changes were made.

4. **Keep it simple.** Make every task and code change as simple as possible. Avoid massive or complex changes. Every change should impact as little code as possible. Simplicity is paramount.

5. **Maintain architecture documentation.** Keep `docs/ARCHITECTURE.md` updated when making structural changes.

6. **Never speculate about unread code.** If the user references a specific file, read it before answering. Investigate and read relevant files BEFORE answering questions about the codebase. Never make claims about code before investigating unless certain of the correct answer. Provide grounded, hallucination-free answers.

---

# Project: DriveShop Event Estimate Engine

## What This Is

A web application that replaces DriveShop's spreadsheet-based event estimation workflow with an intelligent, centralized platform. DriveShop is an automotive experiential marketing company that manages vehicle programs (test drives, launches, fleet management) for OEM clients like Mazda, Volvo, VW, Lucid, Genesis, Mercedes-Benz, JLR, Hankook, and others.

## Current State

Phase 2 is well underway. Completed features:

- **Rate Card Management Engine** — Supabase schema deployed, all 8 client rate cards seeded from MSA data. Two-tab UI:
  - **Client Rate Cards tab** — Section-grouped rate tables with collapsible sections (default collapsed), client dropdown selector, MSA vs Custom badge tracking. Add Rate modal uses a searchable fee type dropdown (filtered by section) that auto-fills name, GL code, and unit label from the `fee_types` table. Edit mode shows name read-only with rate-only editing. Inline editable client billing contact fields (name, phone, email, address) in the header row, saving to Supabase on blur. Bulk Import button for uploading CSV/Excel files with fee type matching preview.
  - **Fee Types tab** — Full CRUD management of the master fee types table, grouped by section (Planning & Admin, Onsite Labor, Travel, Production, Logistics). Add/edit/delete with confirmation dialogs.
- **fee_types Master Table** — Centralized GL codes based on Dave's feedback. GL codes live in `fee_types` and `rate_card_items` reference them via `fee_type_id`. This ensures GL code consistency across all clients. 127 fee types seeded across 5 sections.
- **Estimate Builder** — Full estimate creation and editing with Supabase-backed CRUD. Includes:
  - **Schedule tab** — Calendar-based staffing grid. Date columns auto-generated from segment start/end dates. Click cell to fill 10h, double-click to clear, click filled cell to edit hours. Day type badges per column (Event, Setup, Training, Travel, Off) with color-coded heat map. OT hours shown as `10+N`. Bulk "Fill All" per column. Add Staff modal (multi-select from rate card + custom roles). Add Date for extra columns. Sortable Name/Role column headers (click cycles asc/desc/default). Summary bar with Staff, Person-Days, Per Diem Days, OT Hours, Est. Revenue/Cost, GP, GP%. New segments get an inline date picker to set their own date range and generate the calendar.
  - **Labor Log tab** — Read-only rollup view when schedule data exists (driven by Schedule tab). Falls back to manual role-based staffing (qty, days, day rate, cost rate, GP calculation) when no schedule. "Add Role from Rate Card" modal supports multi-select with checkboxes and batch add. "+ Add custom role" inline form for one-off entries. Schedule data auto-refreshes when switching tabs so rollup stays current.
  - Non-labor tabs (Production, Travel & Logistics, Creative, Access Fees & Insurance, Misc) use the same multi-select modal pattern — checkboxes pulling from the client's rate card filtered to the appropriate section, with batch add and "+ Add custom item" for one-off entries. Misc tab uses a manual free-text form (no rate card section mapped).
  - All add modals correctly propagate `gl_code` and `rate_card_item_id` from the rate card.
  - Stepper arrows (up/down chevrons) on QTY and DAYS fields for quick increment/decrement.
  - Multi-segment support ("Segments" replaces "Locations"). Segments are pill-selectable with double-click inline rename. Button reads "+ Add Segment". Each segment can have independent dates.
  - Event Header with ComboInput dropdowns: Event Type (Ride & Drive, Static Display, Press Event, etc.) and Attendance (range presets: 1–25 through 5,000+). Both allow free-text entry.
  - Split notes: Internal Notes (not shown to client) and Published Notes (shown on estimate output). Side-by-side layout.
  - Summary tab with labor grouped by segment, line items grouped by section. Two footer rows: **GR (Gross Revenue)** and **NR (Net Revenue)**. NR = GR minus pass-through section totals (Travel, Production). GP% shown against both GR and NR. Column header uses "GR" instead of "Revenue".
  - AI nudge panel (right sidebar) for scoping assistance
- **Workflow Engine** — Full status lifecycle and version control:
  - **Status state machine** — Pipeline → Draft → Review → Approved → Active → Recap → Complete, with validated transitions and required reasons for rejections/unlocks.
  - **Status bar UI** — Linear-style progress track in Estimate Builder header with contextual action buttons (Submit for Review, Approve, Mark Active, etc.).
  - **Version snapshots** — Full estimate snapshot captured on every status transition. Snapshots include estimate header, labor logs with entries, schedule entries with day entries, line items, day types, and computed totals (revenue, cost, GP, GP%). Totals correctly use `computeScheduleRollup()` for schedule-based estimates.
  - **Version history panel** — Slide-out History panel accessible from estimate header with Versions and Approvals tabs. Expandable version entries with change summaries. Read-only snapshot modal shows estimate header, totals bar, labor (manual or schedule rollup with "(from schedule)" label), and non-labor line items. Rollback to any previous version with confirmation dialog.
  - **Approval routing** — Threshold-based routing ($50K+ triggers executive review). ApprovalBanner component shown on Review status with submitter info, threshold display, and Approve/Send Back buttons with confirmation dialogs.
  - **Read-only lockdown** — All interactive elements disabled when estimate is in review, approved, active, or complete status. Disables header fields, notes, segments, labor log editing, line item editing, and schedule grid interactions.
- **Estimates List Page** — Table view of all estimates with status dots, create flow via modal dialog, navigation to Estimate Builder. Color-coded status badges, status filter tabs with counts (All/Draft/Review/Approved/Active/etc.), and contextual quick action buttons (Submit/Review/Mark Active). Three-dot context menu per row with Archive and Delete actions. Delete has confirmation dialog. "Show archived / Hide archived" toggle with count. Archived rows use muted text color.
- **UI Styling** — Professional density pass (Stripe/Linear aesthetic) across all pages. Muted hunter green accents, slate section backgrounds, consistent `text-[13px]` body / `text-[10px]` uppercase headers.

All data persists to Supabase (estimates, labor_logs, labor_entries, estimate_line_items, rate_card_items, fee_types, clients, rate_card_sections, schedule_entries, schedule_day_entries, schedule_day_types, estimate_versions, approval_requests, status_transitions).

**Completed Sprint:** Workflow Engine — status state machine, version snapshots with schedule rollup, approval routing, version history panel with snapshot viewer and rollback, status bar UI, estimates list badges/filters/quick actions, read-only lockdown for locked statuses.
**Next Sprint (Weeks 8-10):** AI Intelligence (scoping assistant, historical data training).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript, Vite 7, React Router v7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| File Parsing | SheetJS (xlsx) for CSV/Excel import |
| Database | PostgreSQL via Supabase |
| Backend | Python + FastAPI (to be added in Phase 2) |
| AI | Claude API (Anthropic) |
| PDF | WeasyPrint (to be added) |
| Accounting | Sage Intacct API (to be added) |
| Deployment | Render (static site with SPA rewrite) |

## Key File Structure

```
/
├── src/
│   ├── App.tsx                    — Router and layout definitions
│   ├── components/
│   │   ├── layout/                — AppLayout, Sidebar, Header + Stakeholder variants
│   │   ├── schedule/              — ScheduleGrid (calendar staffing grid component)
│   │   ├── ApprovalBanner.tsx     — Approval actions for estimates in Review status
│   │   ├── EstimateStatusBar.tsx  — Linear-style progress track with contextual actions
│   │   ├── VersionHistoryPanel.tsx — Slide-out panel with versions and approvals tabs
│   │   ├── VersionSnapshotModal.tsx — Read-only snapshot viewer with schedule rollup support
│   │   └── ui/                    — shadcn/ui primitives (button, card, table, etc.)
│   ├── data/                      — Pre-computed JSON for dashboard views
│   ├── lib/
│   │   ├── ai.ts                  — Anthropic API integration
│   │   ├── data.ts                — Historical data helpers
│   │   ├── estimate-service.ts    — Estimate/labor CRUD (Supabase)
│   │   ├── rate-card-service.ts   — Rate card/client CRUD (Supabase)
│   │   ├── schedule-service.ts    — Schedule entries, day types, rollup (Supabase)
│   │   ├── workflow-service.ts    — Status machine, versioning, approvals, rollback (Supabase)
│   │   ├── supabase.ts            — Supabase client (graceful null if env vars missing)
│   │   └── utils.ts               — cn() helper
│   ├── pages/                     — All page components (EstimateBuilderPage, EstimatesListPage, RateCardManagementPage, etc.)
│   └── types/                     — TypeScript interfaces (estimate, rate-card, schedule, workflow)
├── scripts/                       — Python data pipeline scripts
├── historical_estimates/          — 1,700+ historical estimate spreadsheets
├── docs/
│   └── ARCHITECTURE.md            — Detailed architecture documentation
├── *.json                         — Extracted/enriched data files (rate cards, scans, etc.)
└── *.md                           — Build instruction files from Phase 1
```

## Dual Layout System

The app has two independent layout trees under a single BrowserRouter:

- **AppLayout** (`/`) — Full internal app with sidebar (Discovery Intelligence, Phase 1 Deliverables, UI Concepts, Admin sections). Header shows "CONFIDENTIAL" badge.
- **StakeholderLayout** (`/stakeholder`) — Simplified review portal with its own sidebar, "REVIEW" badge. Shares page components via React Router Outlet.

## Supabase Integration

Supabase is the primary data store. Client configured in `src/lib/supabase.ts` (graceful null if env vars missing). Key tables:

- `clients` — OEM client records (Mazda, Volvo, VW, Lucid, etc.) with billing contact fields (name, email, phone, address)
- `rate_card_sections` — Section groupings per client (Planning & Admin Labor, Onsite Labor, etc.)
- `rate_card_items` — Individual rate entries with MSA/Custom tracking, references `fee_type_id`
- `fee_types` — Master table of centralized GL codes and fee type names. Section values are snake_case keys: `planning_admin`, `onsite_labor`, `travel`, `production`, `logistics`
- `estimates` — Estimate header records (event name, client, dates, status, cost structure, internal_notes, published_notes). Status includes 'archived'. `expected_attendance` is text (stores range strings like "50–100").
- `labor_logs` — Segments within an estimate (geographic or temporal divisions)
- `labor_entries` — Individual labor roles staffed per segment (qty, days, rates)
- `estimate_line_items` — Non-labor line items per segment per section (production, travel, etc.)
- `schedule_entries` — Staff rows in the schedule grid (person_name, role_name, day_rate, cost_rate, flags for airfare/hotel/per_diem, staff_group_id for rollup grouping)
- `schedule_day_entries` — Hours per staff per date (hours, per_diem_override)
- `schedule_day_types` — Day type per date column per segment (event, setup, training, travel, off)
- `estimate_versions` — Version snapshots with full JSON snapshot, version number, change summary, status at time of snapshot
- `approval_requests` — Approval workflow records (requested_by, reviewed_by, status, threshold_triggered, notes)
- `status_transitions` — Audit log of all status changes (from_status, to_status, transitioned_by, reason, version_id)

Service layers: `src/lib/rate-card-service.ts` (clients, rate cards, fee types CRUD), `src/lib/estimate-service.ts`, `src/lib/schedule-service.ts` (schedule grid CRUD + rollup computation), and `src/lib/workflow-service.ts` (status machine, versioning, approvals, rollback).

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key for AI Scoping Assistant |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

---

# Business Domain Knowledge

## DriveShop's Rate Card System

DriveShop maintains **separate rate cards for each OEM client**. Each client's MSA (Master Service Agreement) defines unique rates, markup rules, and cost structures. There is no single universal rate card.

### Three Cost Types

Every rate card item falls into one of three categories:

1. **Labor** — Roles billed at a day rate or hourly rate. DriveShop makes margin on the spread between bill rate and pay rate. Examples: Event Director ($700/day), Product Specialist ($800/day), Chauffeur ($100/hr).

2. **Flat Fees** — Fixed charges from the MSA, no receipts required. Billed per unit/day/event. Examples: Radio Rental ($20/unit/day), Event Insurance ($500/day), Detailing Supplies ($10/vehicle/prep).

3. **Pass-Through Costs** — Receipt-based expenses passed to the client with a client-specific markup multiplier. Examples: Fuel, Airfare, Hotels, Shipping. Markup varies by client (Lucid = 1.5%, Mazda = 5%, VW = 0%, Hankook = 10%).

### Client-Specific Rules

Each client rate card has:
- **Client Name**
- **Third Party Cost Markup %** — markup applied to all pass-through costs
- **Agency Fee %** — some clients (e.g., Mazda at 10%) have an additional agency fee on total bid
- **Trucking Markup %** — some clients (e.g., Volvo at 20%) have separate trucking markup

### Rate Card Sections (standard groupings)

1. Planning & Administration Labor
2. Onsite Event Labor
3. Travel Expenses (Pass Through)
4. Creative Costs
5. Production Expenses (Pass Through)
6. Logistics Expenses (Flat Fee)

### MSA vs. Custom Rates

Each section has "From MSA" rates (locked, from the contract) and "Added rates determined by project scope" (custom rates added by account managers for specific projects). Custom rates should persist for future projects and be flagged as non-MSA.

### Corporate vs. Office Cost Structure

- **Corporate-produced events** — DriveShop hires contractors directly. Margin = bill rate minus pay rate (variable per contractor).
- **Office-produced events** — Regional offices execute. They receive 75% of revenue (80% for VW). Pass-throughs paid at 100%.

### GL Codes

GL codes are standardized across all clients. Each line item maps to a GL code for Intacct integration. Format examples: 4000.01, 4000.26, 4025.12, 4075.04.

### Two Data Sources for Rates

1. **Tatiana's Event Rate Cards** (`DriveShop_Event_Estimate_Template_12_01_25.xlsx`) — 8 client tabs (Lucid, VW, JLR, Hankook, Mazda, MB, Volvo, Volvo MS) with MSA rates, sections, and GL codes. This is the primary source for the Event Estimate Engine.

2. **Dave's FMS Rate Matrix** (`FMS_Rate_Matrix.xlsx`) — Fleet Management rates. 146 fee types × 15 brands. Values are either flat dollar amounts or multiplier percentages (100 = at cost, 101.5 = 1.5% markup, 105 = 5% markup). Column B flags pass-through items.

### Rate Card Ownership

Account Managers own their client rate cards (recommended by Tatiana, pending Derek's confirmation). They can add new rates for project-specific needs. Accountants review but don't maintain rates.

### Estimate Template Structure

When building an estimate, rates are consumed in a grid format:
- Line item name | Qty 1 | Qty 2 | Unit Rate | Subtotal | 3rd Party Fee | Total
- Grouped by section with section totals
- Grand Total at bottom
- Pass-through sections include a 3rd Party Fee column for markup

---

# Phase 2 Build Plan (12 weeks)

| Phase | Weeks | Focus |
|-------|-------|-------|
| Foundation | 1-2 | Rate card engine, database schema, Supabase setup |
| Core Build | 3-5 | Estimate builder UI, labor planning, calculations |
| Workflow | 6-7 | Approval engine, version control, notifications |
| Intelligence | 8-10 | AI scoping assistant, historical data training |
| Outputs | 10-11 | Change orders, recaps, PDF generation |
| Delivery | 12 | Intacct integration, pipeline dashboard, QA, training |

**Weeks 1-2 (Complete):** Rate Card Management Engine
**Weeks 3-5 (Complete):** Estimate Builder & Labor Planning
**Week 5 (Complete):** Rate Card refinements — Fee Types tab, fee-type-linked Add Rate, client contacts, bulk import
**Week 5-6 (Complete):** Estimate Builder UX — multi-select modals, custom items, steppers, combo dropdowns, split notes, NR summary, archive/delete
**Week 6 (Complete):** Schedule tab — calendar staffing grid, Labor Log read-only rollup from schedule, sortable columns, per-segment date picker, auto-refresh on tab switch
**Weeks 6-7 (Complete):** Workflow Engine — status state machine, version snapshots (with schedule rollup support), approval routing with threshold detection, version history panel with snapshot viewer and rollback, linear status bar UI, estimates list status badges/filter tabs/quick actions, read-only lockdown for locked statuses
**Next Sprint (Weeks 8-10):** AI Intelligence (scoping assistant, historical data training)

## Key Stakeholders

- **Derek** — CEO. Decision maker. Approved Phase 2.
- **Tatiana** — CFO. Owns rate card data, reviews estimates over $50K/$100K. Source of truth for MSA rates and markup rules.
- **Dave** — Operations. Handles estimate building, labor logs, FMS data. Manages media scheduling system.
- **Dan & Tim** — Production managers. Daily users who build estimates and run events. Key feedback providers for UI.
- **Account Managers** (e.g., Gail for Lucid) — Own their client relationships and rate cards. Will maintain rates in the system.
