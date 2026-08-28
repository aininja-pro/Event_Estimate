# DriveShop Event Estimate Engine

Web application replacing DriveShop's spreadsheet-based event estimation workflow with an intelligent, centralized platform. DriveShop is an automotive experiential marketing company managing vehicle programs (test drives, launches, fleet management) for OEM clients.

**Client:** DriveShop (Derek Drake, CEO)
**Phase:** Assembly (Phase 2, Week 13)
**Started:** February 2026
**Tool Ladder Level:** 3 (VS Code + Claude Code)

## Tech Stack

- **Frontend:** React 19 + TypeScript, Vite 7, React Router v7
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Charts:** Recharts
- **File Parsing:** SheetJS (xlsx)
- **Database:** PostgreSQL via Supabase
- **Backend:** Python + FastAPI (/api)
- **AI:** Claude API (Anthropic)
- **PDF:** WeasyPrint + Jinja2 (api/templates/)
- **Accounting:** Sage Intacct API (to be added)
- **Deployment:** Render (static site + SPA rewrite)

## Workspaces

- `/src` — React frontend
- `/api` — FastAPI backend
- `/scripts` — Python pipeline, migrations, seed scripts
- `/docs` — Architecture docs, phase kickoffs, screenshots → see `@docs/ARCHITECTURE.md`
- `/data` — Client data files, parsed JSON, historical templates
- `/historical_estimates` — 1,700+ historical estimate spreadsheets (reference data)
- `/planning` — Project planning docs (STATE, DECISIONS, sprints)

## Routing

| Task | Read first |
|------|------------|
| **Where the project is going (the whole road)** | `@planning/ROADMAP.md` |
| Where the last sprint left off | `@planning/ARCHITECT_BRIEFING.md` |
| Current sprint + what's in-flight | `@planning/STATE.md` |
| Feature-specific rules (business + technical) | `@planning/DECISIONS.md` |
| Business domain (rate cards, cost types, stakeholders) | `@planning/DOMAIN.md` |
| Current sprint's spec + plan | `@planning/sprints/{active-sprint}/` |
| System design, service map, schema | `@docs/ARCHITECTURE.md` |
| Debug or investigate code | Read the specific files first, then answer |
| Write or run a migration | `/scripts` — existing migration files as reference |

## Commands

| Action | Command |
|--------|---------|
| Dev server (frontend) | `npm run dev` |
| Dev server (backend) | `cd api && uvicorn main:app --reload --port 8000` |
| Build | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npx eslint .` |
| Type check (force) | `npx tsc -b --force` |
| Deploy | Push to `origin` main (= DriveShopDave/Event_Estimate; DriveShop's Render auto-deploys). `mine` = Ray's backup mirror |

## Working Mode

- **Directed:** I tell you exactly what to build, file by file. Follow instructions precisely.
- **Autonomous:** I give you the blueprint and say "build it." Make implementation decisions within the decisions already made (see `DECISIONS.md`). Ask before deviating from the blueprint.

**Current mode:** Directed

## Core Conventions

These apply to every file in the codebase. Feature-specific rules live in `@planning/DECISIONS.md`.

- Functional React components only. No class components.
- All Supabase queries go through service layers in `src/lib/`. No direct Supabase calls in components.
- Role-permission checks use `hasPermission()` from `src/lib/permissions.ts`.
- shadcn/ui primitives in `src/components/ui/`. Do not duplicate existing primitives.
- All Claude API calls route through FastAPI backend. Never call Anthropic API from the frontend.
- Consistent text sizing: `text-[13px]` body, `text-[10px]` uppercase headers.
- Use `useUser()` hook for identity. Never hardcode user strings.
- State: React context or prop drilling. No global state libraries.

## Critical Rules

1. Think through the problem first. Read the codebase for relevant files before making changes.
2. Check in before major changes. Verify the plan with me.
3. Explain changes at a high level as you go.
4. Keep it simple. Every change should impact as little code as possible.
5. Maintain `docs/ARCHITECTURE.md` when making structural changes.
6. Never speculate about unread code. Read first, answer second.

## Avoid

- Supabase queries directly in page components — use service layers
- New dependencies without checking if an existing one covers the need
- Schema changes without a migration script in `/scripts`
- Major changes without checking in first
