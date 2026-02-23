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

Phase 2 is underway. The Rate Card Management Engine is complete — Supabase schema deployed, all 8 client rate cards seeded from MSA data, functional UI with section grouping, collapsible sections, client selector, and Add Rate functionality with Custom badge tracking. Current sprint: Estimate Builder & Labor Planning (Weeks 3-5).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript, Vite 7, React Router v7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
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
│   │   └── ui/                    — shadcn/ui primitives (button, card, table, etc.)
│   ├── data/                      — Pre-computed JSON for dashboard views
│   ├── lib/
│   │   ├── ai.ts                  — Anthropic API integration
│   │   ├── data.ts                — Historical data helpers
│   │   ├── supabase.ts            — Supabase client (graceful null if env vars missing)
│   │   └── utils.ts               — cn() helper
│   ├── pages/                     — All page components
│   └── types/                     — TypeScript interfaces
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

Supabase is already wired up in `src/lib/supabase.ts`. Currently used only for a feedback table. The client gracefully returns `null` if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` env vars are missing, so the rest of the app works without Supabase configured.

**Phase 2 will expand Supabase to be the primary data store** for rate cards, estimates, labor logs, approvals, versions, and more.

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

**Current Sprint: Weeks 1-2 — Rate Card Management Engine**

## Key Stakeholders

- **Derek** — CEO. Decision maker. Approved Phase 2.
- **Tatiana** — CFO. Owns rate card data, reviews estimates over $50K/$100K. Source of truth for MSA rates and markup rules.
- **Dave** — Operations. Handles estimate building, labor logs, FMS data. Manages media scheduling system.
- **Dan & Tim** — Production managers. Daily users who build estimates and run events. Key feedback providers for UI.
- **Account Managers** (e.g., Gail for Lucid) — Own their client relationships and rate cards. Will maintain rates in the system.
