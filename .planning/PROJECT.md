# Event Estimate Engine — Phase 1 Discovery Intelligence Report

## What This Is

Three interactive React applications that serve as Phase 1 Discovery deliverables for the DriveShop Event Estimate Engine project. Read-only analytics and proof-of-concepts that demonstrate we've decoded DriveShop's business data from 1,659 historical event estimates. Presented to the client on Wednesday as the "Phase 1 Discovery Intelligence Report."

## Core Value

The AI Scoping Assistant is the hero — it proves that historical event data can power intelligent, data-backed scope recommendations. The Dashboard is supporting evidence showing the 997 events of bid-vs-actual data powering it. The Rate Card is clean reference documentation.

## Requirements

### Validated

- ✓ ETL pipeline extracting structured data from 1,659 XLSX event estimates — existing
- ✓ Rate card with 136 unique labor roles and GL codes — existing (`rate_card_master.json`)
- ✓ Financial summaries by client, office, segment — existing (`financial_summary.json`)
- ✓ Enriched master index joining project metadata with scan data — existing (`enriched_master_index.json`)
- ✓ Section/cost category analysis — existing (`section_summary.json`)

### Active

- [ ] **AI Scoping Assistant** (HERO BUILD) — Event input form → Claude API → structured scope estimate with staffing, costs by section, confidence notes, margin recommendations. Proof-of-concept with clear framing banner.
- [ ] **Historical Intelligence Dashboard** — 4-tab dashboard (Executive Summary, Cost Analysis, Bid vs Actual Variance, Event Manager Performance) with KPI cards, bar/pie/area charts, data tables
- [ ] **Rate Card Explorer** — Searchable/sortable table of 136 roles with rate ranges, GL codes, usage counts, expandable detail rows
- [ ] **Shared navigation shell** — Sidebar nav + header with "Phase 1 Discovery Intelligence Report" branding, "CONFIDENTIAL" label, professional enterprise aesthetic
- [ ] **Data pipeline** — Pre-compute aggregations from JSON source files, embed summary data in components

### Out of Scope

- Data entry, editing, or workflow — Phase 2-3 deliverable
- Multi-user access or permissions — Phase 2-3 deliverable
- Intacct integration — Phase 2-3 deliverable
- Version control or change tracking — Phase 2-3 deliverable
- Approval workflows — Phase 2-3 deliverable
- Production AI training (this is proof-of-concept) — Phase 2-3 deliverable
- Mobile responsiveness — desktop presentation only
- Automated testing — presentation prototype, not production code

## Context

- **Client**: DriveShop — automotive experiential marketing company operating from 14 offices
- **Data**: 1,659 event estimates (XLSX), 997 with bid-vs-actual data, 136 labor roles, 7 cost categories
- **Presentation**: Wednesday client demo — must be polished and professional
- **Strategic framing**: These are discovery outputs proving we decoded their data. The production Estimate Engine (Phase 2-3, $63K remaining) adds workflows, editing, approvals, multi-user, Intacct integration
- **Existing codebase**: Python ETL pipeline that produced the JSON data files (not part of this build)
- **Priority order**: AI Scoping (hero) > Dashboard (solid) > Rate Card (basic-but-clean)

## Constraints

- **Tech stack**: Vite + React + Tailwind CSS + shadcn/ui + Recharts + lucide-react
- **Timeline**: Must be presentable by Wednesday
- **API**: Anthropic API via environment variable (`VITE_ANTHROPIC_API_KEY`), model `claude-sonnet-4-20250514`
- **Design**: Enterprise B2B aesthetic (Stripe/Linear style) — dark sidebar, light content, slate/zinc + blue/emerald accent. No purple gradients or playful styling.
- **Data**: JSON files in project root, pre-computed where possible to keep bundle manageable

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full Vite + React project (not single file) | shadcn/ui requires proper project setup; more polished for presentation | — Pending |
| API key via .env environment variable | Simplest approach for demo; key stays local | — Pending |
| AI Scoping as hero build | Most forward-looking, differentiated, "wow moment" for client | — Pending |
| Pre-compute aggregations from large JSON | enriched_master_index.json too large to embed raw; extract only what each view needs | — Pending |

---
*Last updated: 2026-02-08 after initialization*
