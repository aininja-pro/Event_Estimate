# Architecture

## Overview

Event History is a Vite + React + TypeScript SPA for the DriveShop Event Estimate Engine. It presents historical event data analysis, system design deliverables, and UI concepts. A secondary stakeholder review portal allows external reviewers to browse select pages and submit feedback.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 7
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Charts:** Recharts
- **Backend (feedback):** Supabase (Postgres + REST API)
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
    layout/          — AppLayout, Sidebar, Header + Stakeholder variants
    ui/              — shadcn/ui primitives (Button, Card, Table, etc.)
  lib/
    data.ts          — Pre-computed historical data
    ai.ts            — Anthropic API integration
    supabase.ts      — Supabase client (graceful null if env vars missing)
    utils.ts         — cn() helper
  pages/             — All page components
  types/
    feedback.ts      — Feedback interface and category types
```

## Supabase Integration

Feedback is stored in a Supabase `feedback` table with columns: `id`, `name`, `category`, `message`, `status`, `created_at`. RLS is permissive (no auth — open link access via anon key).

The Supabase client (`src/lib/supabase.ts`) gracefully returns `null` if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` env vars are missing. Feedback pages show an error state in that case; the rest of the app is unaffected.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key for AI Scoping Assistant |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
