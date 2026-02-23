# Architecture

## Overview

Event History is a Vite + React + TypeScript SPA for the DriveShop Event Estimate Engine. Phase 1 presents historical event data analysis, system design deliverables, and UI concepts. Phase 2 adds production modules backed by Supabase (starting with Rate Card Management). A secondary stakeholder review portal allows external reviewers to browse select pages and submit feedback.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 7
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Charts:** Recharts
- **Backend:** Supabase (Postgres + PostgREST API)
- **Deployment:** Render (static site with SPA rewrite)

## Dual Layout System

The app runs two independent layout trees under a single `<BrowserRouter>`:

```
/                          → AppLayout
  /dashboard               → DashboardPage
  /rate-card               → RateCardPage
  /ai-assistant            → AIScopingPage
  /system-architecture     → SystemArchitecturePage
  /database-schema         → DatabaseSchemaPage
  /estimate-lifecycle      → EstimateLifecyclePage
  /phase2-roadmap          → Phase2RoadmapPage
  /estimate-builder        → EstimateBuilderPage
  /rate-card-management    → RateCardManagementPage
  /admin/feedback          → AdminFeedbackPage

/stakeholder               → StakeholderLayout
  /estimate-lifecycle      → EstimateLifecyclePage (reused)
  /phase2-roadmap          → Phase2RoadmapPage (reused)
  /estimate-builder        → EstimateBuilderPage (reused)
  /rate-card-management    → RateCardManagementPage (reused)
  /feedback                → FeedbackPage
```

**AppLayout** — Full internal app with sidebar (Discovery Intelligence, Phase 1 Deliverables, UI Concepts, Admin sections), header with "CONFIDENTIAL" badge.

**StakeholderLayout** — Simplified portal with its own sidebar (4 review pages + feedback), header with "REVIEW" badge. Intended for sharing via direct link.

Page components are reused across both layouts via React Router's `<Outlet />` — no duplication needed.

## Key Directories

```
src/
  components/
    layout/              — AppLayout, Sidebar, Header + Stakeholder variants
    ui/                  — shadcn/ui primitives (Button, Card, Table, Dialog, etc.)
  lib/
    data.ts              — Pre-computed historical data
    ai.ts                — Anthropic API integration
    supabase.ts          — Supabase client (graceful null if env vars missing)
    rate-card-service.ts — CRUD operations for clients, sections, and rate card items
    utils.ts             — cn() helper
  pages/                 — All page components
  types/
    feedback.ts          — Feedback interface and category types
    rate-card.ts         — Client, RateCardSection, RateCardItem types (Phase 1 analysis + Phase 2 Supabase)
scripts/
  supabase_schema.sql    — Database schema (tables, indexes, triggers, RLS, seed sections)
  seed_rate_cards.py     — Reads Excel rate card template → generates seed SQL
  seed_rate_cards.sql    — Generated INSERT statements (8 clients, 377 rate items)
```

## Supabase Integration

The Supabase client (`src/lib/supabase.ts`) gracefully returns `null` if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` env vars are missing. Pages that need Supabase show an error state; the rest of the app is unaffected. All tables use permissive RLS (no auth — open access via anon key).

### Database Tables

**`feedback`** — Stakeholder review feedback (Phase 1)
- Columns: `id`, `name`, `category`, `message`, `status`, `created_at`

**`clients`** — One row per OEM client (Phase 2)
- Columns: `id`, `name`, `code`, `third_party_markup`, `agency_fee`, `agency_fee_basis`, `trucking_markup`, `office_payout_pct`, `is_active`, `notes`, `created_at`, `updated_at`
- 8 clients seeded: Lucid, VW, JLR, Hankook, Mazda, MB, Volvo, Volvo MS

**`rate_card_sections`** — Standard section groupings shared across all clients (Phase 2)
- Columns: `id`, `name`, `display_order`, `cost_type` (`labor` | `flat_fee` | `pass_through`), `description`
- 6 sections seeded: Planning & Administration Labor, Onsite Event Labor, Travel Expenses, Creative Costs, Production Expenses, Logistics Expenses

**`rate_card_items`** — Individual rate line items per client per section (Phase 2)
- Columns: `id`, `client_id` (FK → clients), `section_id` (FK → rate_card_sections), `name`, `unit_rate`, `unit_label`, `gl_code`, `is_from_msa`, `is_pass_through`, `has_overtime_rate`, `overtime_rate`, `overtime_unit_label`, `overtime_gl_code`, `display_order`, `is_active`, `created_at`, `updated_at`
- 377 items seeded from `DriveShop Event Estimate Template_12.01.25.xlsx`
- Soft delete via `is_active` flag

### Data Service (`src/lib/rate-card-service.ts`)

8 async functions wrapping Supabase queries:
- `getClients()` — All active clients ordered by name
- `getClient(id)` — Single client by ID
- `getRateCardSections()` — All sections ordered by display_order
- `getRateCardItems(clientId)` — All active items for a client
- `getRateCardItemsBySection(clientId)` — Items grouped by section (used by the Rate Card Management page)
- `createRateCardItem(item)` — Insert new item (auto-sets `is_from_msa: false`)
- `updateRateCardItem(id, updates)` — Partial update
- `deleteRateCardItem(id)` — Soft delete (`is_active = false`)

### Seed Data Pipeline

`scripts/seed_rate_cards.py` reads the Excel rate card template and generates SQL:
1. Parses 8 visible client tabs (skips 3 hidden: Templates Event Admin, Templates - Admin Labor, Ineos)
2. Extracts client metadata (name, code, markup percentages)
3. Extracts rate items per section, handling MSA vs. custom markers, overtime pairing, GL codes
4. Outputs `scripts/seed_rate_cards.sql` with DELETE cleanup + INSERT statements

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key for AI Scoping Assistant |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
