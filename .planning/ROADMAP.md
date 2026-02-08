# Roadmap: Event Estimate Engine — Phase 1 Discovery Intelligence Report

## Overview

Build three interactive React applications as Phase 1 Discovery deliverables for DriveShop: a data-driven dashboard, a rate card explorer, and an AI-powered scoping assistant — all wrapped in a professional enterprise navigation shell. Foundation first, then views, then the hero AI build, then polish for Wednesday's client presentation.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Project setup, navigation shell, and data pipeline
- [ ] **Phase 2: Dashboard & Rate Card** - Historical Intelligence Dashboard and Rate Card Explorer
- [ ] **Phase 3: AI Scoping Assistant** - Hero build: Claude-powered event scope estimator
- [ ] **Phase 4: Polish & Presentation** - Final styling, branding, and demo preparation

## Phase Details

### Phase 1: Foundation
**Goal**: Vite + React + Tailwind + shadcn/ui project scaffolded, shared sidebar navigation shell working, JSON data files loaded and pre-computed into component-ready aggregations
**Depends on**: Nothing (first phase)
**Research**: Unlikely (established patterns — Vite/React/Tailwind/shadcn standard setup)
**Plans**: TBD

Plans:
- [x] 01-01: Project scaffolding and dependency installation
- [x] 01-02: Navigation shell with sidebar, header, routing
- [ ] 01-03: Data pipeline — pre-compute aggregations from JSON source files

### Phase 2: Dashboard & Rate Card
**Goal**: 4-tab Historical Intelligence Dashboard (Executive Summary, Cost Analysis, Bid vs Actual Variance, Event Manager Performance) with KPI cards and Recharts visualizations, plus searchable Rate Card Explorer with 136 roles
**Depends on**: Phase 1
**Research**: Unlikely (internal UI patterns with Recharts, standard table components)
**Plans**: TBD

Plans:
- [ ] 02-01: Executive Summary and Cost Analysis tabs
- [ ] 02-02: Bid vs Actual Variance and Event Manager Performance tabs
- [ ] 02-03: Rate Card Explorer — searchable/sortable table with expandable rows

### Phase 3: AI Scoping Assistant
**Goal**: Event input form that sends structured data to Claude API and returns staffing recommendations, cost breakdowns by section, confidence notes, and margin recommendations — framed as proof-of-concept
**Depends on**: Phase 1 (uses data pipeline), Phase 2 (references dashboard patterns)
**Research**: Likely (external API integration)
**Research topics**: Anthropic API browser-side usage patterns (or proxy approach), structured output prompting for cost estimates, Vite environment variable handling for API keys, prompt engineering for reliable JSON responses
**Plans**: TBD

Plans:
- [ ] 03-01: Event input form and Claude API integration
- [ ] 03-02: Structured response display with staffing, costs, confidence, margins

### Phase 4: Polish & Presentation
**Goal**: Professional enterprise aesthetic (Stripe/Linear style), "Phase 1 Discovery Intelligence Report" branding throughout, CONFIDENTIAL labels, final demo walkthrough prep
**Depends on**: Phases 1-3
**Research**: Unlikely (CSS/styling refinements, internal polish)
**Plans**: TBD

Plans:
- [ ] 04-01: Visual polish, branding, and presentation readiness

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation | 2/3 | In progress | - |
| 2. Dashboard & Rate Card | 0/3 | Not started | - |
| 3. AI Scoping Assistant | 0/2 | Not started | - |
| 4. Polish & Presentation | 0/1 | Not started | - |
