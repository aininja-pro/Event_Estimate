# BUILD INSTRUCTIONS: Phase 1 Deliverable Pages

## CONTEXT
We already have a React app with shadcn/ui, Tailwind, dark sidebar nav, and three pages:
- Historical Dashboard
- Historical Rate Analysis
- AI Scoping Assistant

We're adding a new nav section called "Technical Architecture" with 4 sub-pages. These ARE the Phase 1 deliverables — instead of static PDFs, they live in the app itself.

## IMPORTANT: These are NOT additional scope. The SOW lists these deliverables:
- Technical Architecture Document
- Database Schema Design
- Data Flow Diagrams
- UI/UX Wireframes
- Phase 2 Project Plan

We're just delivering them in an interactive format instead of a Word doc.

## DESIGN
- Same dark sidebar, same shadcn/ui components, same Tailwind styling
- New nav section divider: "Phase 1 Deliverables" (below the existing "Discovery Intelligence" section)
- Each page should feel professional and interactive — not just text on a page
- Use Mermaid diagrams rendered via a React Mermaid component, or custom SVG/React components for diagrams
- Color palette: same as existing app (slate/zinc base, blue accents)

---

## PAGE 1: System Architecture

**Nav label:** System Architecture
**Icon:** lucide Layers or Server

### Content:

**Header:** "System Architecture — Event Estimate Engine"
**Subtitle:** "Production technology stack and component interactions"

**Main visual:** Interactive architecture diagram showing the layers:

```
┌─────────────────────────────────────┐
│         React + TailwindCSS         │  ← Frontend
│     Estimate Builder, Labor Log,    │
│   Rate Cards, Dashboards, Approvals │
└──────────────┬──────────────────────┘
               │ REST API
┌──────────────▼──────────────────────┐
│         Python + FastAPI            │  ← Backend / API
│   Business Logic, Calculations,    │
│   Auth, Validation, Versioning     │
└──────┬───────────┬──────────────────┘
       │           │
┌──────▼──────┐  ┌─▼──────────────────┐
│  PostgreSQL │  │   Claude API       │  ← Data + AI
│  (Supabase) │  │   AI Scoping       │
│  Rate Cards │  │   Recommendations  │
│  Estimates  │  │   Validation       │
│  Versions   │  └────────────────────┘
│  Approvals  │
└──────┬──────┘
       │
┌──────▼──────────────────────────────┐
│         Integrations                │  ← External
│  Intacct (Invoicing)               │
│  PDF Generation (WeasyPrint)       │
│  PowerBI (Pipeline Dashboard)      │
└─────────────────────────────────────┘
```

**Make this interactive:** Each box/layer is a clickable Card component. When clicked, it expands to show:

**Frontend card details:**
- React + TailwindCSS + shadcn/ui
- Estimate Builder with Labor Log module
- Rate Card management interface
- Approval workflow UI with status tracking
- Real-time pipeline dashboard
- Client-facing PDF preview

**Backend card details:**
- Python + FastAPI REST API
- Business logic: margin calculations, cost rollups, rate card enforcement
- Version control engine — every change tracked with who/what/when
- Approval routing — configurable rules ($50K+ requires executive review)
- Authentication and role-based permissions

**Database card details:**
- PostgreSQL hosted on Supabase
- Tables: clients, rate_cards, rate_items, estimates, line_items, labor_logs, versions, approvals, change_orders, recaps, users
- Row-level security for multi-team access
- Real-time subscriptions for live dashboard updates

**AI card details:**
- Claude API (Anthropic)
- Trained on 988 historical bid-vs-actual events
- Scoping recommendations based on event type, client, market
- Inline validation nudges: "For Mazda events in LA, logistics typically runs 20% over estimate"
- Confidence scoring based on comparable event matches

**Integration card details:**
- Intacct API: Invoice data push, recap-to-invoice automation
- WeasyPrint: PDF generation (client-facing sanitized + internal P&L)
- PowerBI: Pipeline and forecast data feed

### Tech Stack Summary Table
Below the diagram, show a clean table:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + TailwindCSS + shadcn/ui | User interface |
| Backend | Python + FastAPI | Business logic, API |
| Database | PostgreSQL (Supabase) | Data persistence |
| AI | Claude API (Anthropic) | Scoping assistant, validation |
| PDF | WeasyPrint | Estimate/invoice generation |
| Accounting | Intacct API | Invoice integration |
| Reporting | PowerBI | Pipeline dashboards |

---

## PAGE 2: Database Schema

**Nav label:** Database Schema
**Icon:** lucide Database

### Content:

**Header:** "Database Schema Design"
**Subtitle:** "Core data model for the Event Estimate Engine"

**Main visual:** Interactive ERD (Entity Relationship Diagram)

Show these tables as interactive cards arranged in a logical layout. Each card shows the table name and key columns. Click to expand full column list.

**Core Tables:**

**clients**
- id, name, status (active/inactive)
- contact_name, contact_email
- default_markup_pct
- msa_reference
- notes
- Relationship: has_many rate_cards, has_many estimates

**rate_cards** (one per client)
- id, client_id, name, effective_date, expires_date
- status (draft/active/expired)
- is_driveshop_standard (boolean — master template)
- Relationship: belongs_to client, has_many rate_items

**rate_items**
- id, rate_card_id, role_name, gl_code
- unit_type (hourly/daily_8hr/daily_10hr/flat)
- unit_rate (client-facing rate)
- cost_rate_corporate (DriveShop corporate cost)
- cost_rate_office (office cost — for office events)
- ot_rate, dt_rate (overtime/doubletime if applicable)
- is_custom (boolean — was this added for a specific estimate?)
- notes
- Relationship: belongs_to rate_card

**estimates**
- id, client_id, event_name, event_type
- event_start_date, event_end_date, duration_days
- location, market, estimated_attendance
- status (draft/pending_review/approved/active/recap/complete)
- current_version_id
- created_by, assigned_to (event manager)
- revenue_segment (experiential/press/AME/other)
- is_office_event (boolean — switches cost calculation)
- approved_by, approved_at
- total_revenue, total_net_revenue, total_gross_profit, gross_margin_pct
- notes
- Relationship: belongs_to client, has_many labor_logs, has_many line_items, has_many versions, has_many change_orders

**labor_logs** (one-to-many with estimates for multi-location/tour events)
- id, estimate_id, location_name, location_order
- start_date, end_date
- notes
- Relationship: belongs_to estimate, has_many labor_entries

**labor_entries**
- id, labor_log_id, rate_item_id
- role_name, quantity, days
- unit_rate (from rate card, can be overridden)
- cost_rate (corporate or office depending on estimate type)
- total_revenue (qty × days × unit_rate)
- total_cost (qty × days × cost_rate)
- gross_profit (revenue - cost)
- override_rate (if manually changed from rate card default)
- override_reason
- schedule_notes (e.g., "Mon-Wed only")
- Relationship: belongs_to labor_log, references rate_item

**line_items** (non-labor costs — logistics, production, travel, etc.)
- id, estimate_id, section (matches the 7 cost sections)
- description, gl_code
- quantity, unit_cost, total_cost
- is_passthrough (boolean — pass-through vs markup)
- markup_pct (if applicable)
- client_charge (what client pays)
- gross_profit
- notes
- Relationship: belongs_to estimate

**versions**
- id, estimate_id, version_number
- snapshot (JSON — full estimate state at this point)
- changed_by, changed_at
- change_summary
- Relationship: belongs_to estimate

**approvals**
- id, estimate_id, version_id
- requested_by, requested_at
- approved_by, approved_at
- status (pending/approved/rejected/recalled)
- notes
- threshold_triggered (e.g., "$50K+ executive review")
- Relationship: belongs_to estimate, belongs_to version

**change_orders**
- id, estimate_id, original_version_id, new_version_id
- reason, requested_by, approved_by
- delta_revenue, delta_cost, delta_margin
- line_item_changes (JSON — what changed)
- status (pending/approved/rejected)
- Relationship: belongs_to estimate

**recaps**
- id, estimate_id
- section, line_description
- estimated_amount, actual_amount, variance
- receipt_url (document upload)
- notes
- Relationship: belongs_to estimate

### Visual Layout
Arrange the cards in a logical flow:
- Top row: clients → rate_cards → rate_items (the reference data)
- Middle row: estimates → labor_logs → labor_entries (the core workflow)
- Middle row continued: estimates → line_items (non-labor costs)
- Bottom row: versions, approvals, change_orders, recaps (lifecycle management)

Draw relationship lines between cards (one-to-many indicators).

### Key Design Decisions callout box:
- **Labor logs are separate from estimates** — supports multi-location tour events (1 estimate → N labor logs → N labor entries per log)
- **Rate items support dual cost structures** — cost_rate_corporate and cost_rate_office on same record, estimate type determines which is used
- **Override tracking** — when someone changes a rate on an estimate, the override is logged with reason while the rate card default stays intact
- **Version snapshots** — full JSON snapshot at each version, enabling rollback to any point
- **Passthrough tracking** — line items flagged as passthrough are excluded from net revenue calculation per Derek's revenue/net revenue/GP framework

---

## PAGE 3: Estimate Lifecycle

**Nav label:** Estimate Lifecycle
**Icon:** lucide GitBranch or Workflow

### Content:

**Header:** "Estimate Lifecycle & Data Flow"
**Subtitle:** "From event kickoff through Intacct invoicing"

**Main visual:** Interactive state machine / flow diagram

Show the estimate lifecycle as a horizontal or stepped flow. Each state is a clickable node.

```
[New Event] → [Draft] → [Pending Review] → [Approved] → [Active] → [Recap] → [Complete] → [Intacct]
```

**Make it interactive:** Click any state to see:
- What happens in this state
- Who can take action
- What triggers the transition to the next state
- What data is captured

**State Details:**

**New Event**
- Trigger: Event manager creates new estimate
- AI Scoping Assistant available: "Tell me about the event and I'll generate a starting scope"
- Client and rate card auto-linked
- Event type selection (determines cost structure: office vs corporate)

**Draft**
- Labor log(s) built out — roles, quantities, days, schedule
- Non-labor line items added by section (logistics, production, travel, etc.)
- Auto-calculations running: revenue, net revenue, GP per line item
- AI nudges active: "For similar events, you typically include insurance" / "Logistics costs for this market tend to run 12% over"
- Rate card defaults loaded, overrides available with reason logging
- Multiple labor logs for tour/multi-location events

**Pending Review**
- Event manager submits for review
- Routing rules: AM review for all, executive review if >$50K
- Reviewer sees full P&L breakdown by line item
- Can approve, reject with comments, or send back for revision
- Version snapshot created automatically

**Approved**
- Locked for editing (changes require change order)
- Client-facing PDF generated (sanitized — costs hidden)
- Internal PDF generated (full P&L visibility)
- Client approval portal available (optional e-signature)
- Pipeline dashboard updated with approved amount

**Active**
- Event is live / in execution
- Change orders can be created — system auto-generates delta from approved version
- Change orders follow their own approval workflow
- All changes versioned and tracked

**Recap**
- Post-event: actual costs entered
- Section-by-section: estimated vs actual comparison
- Receipt/document upload for backup
- Variance analysis auto-generated
- AI learns from this data for future recommendations

**Complete**
- Final review of recap data
- Variance report finalized
- Data feeds to pipeline dashboard
- Triggers Intacct integration

**Intacct Invoice**
- Invoice data pushed to Intacct via API
- Field mapping: client, event, line items, amounts
- Confirmation received and logged
- Recap-to-invoice cycle complete

### Below the flow, show a "Data Flow" section:
A simpler diagram showing how data moves between systems:

```
JotForm (event intake) → Estimate Engine (create/manage) → Intacct (invoice)
                                    ↓
                              PowerBI (pipeline/forecast dashboard)
                                    ↓
                              Claude AI (learns from outcomes)
```

---

## PAGE 4: Phase 2 Roadmap

**Nav label:** Phase 2 Roadmap
**Icon:** lucide Calendar or Milestone

### Content:

**Header:** "Phase 2 Build Plan — 12 Weeks"
**Subtitle:** "Development timeline, milestones, and payment schedule"

**Main visual:** Interactive Gantt-style timeline

Show 12 weeks (or 14 per original SOW) with phases as horizontal bars. Each phase is clickable for detail.

**Timeline:**

**Weeks 1-2: Rate Card Engine + Database Setup**
- PostgreSQL/Supabase schema deployment
- Rate card management CRUD
- DriveShop standard rate card loaded from Phase 1 discovery data (55 roles)
- Client MSA rate card creation (starting with top clients: Genesis, Volvo, Audi, Mazda)
- Tatiana validates rate cards against actual MSA documents
- MILESTONE: Rate cards operational, Tatiana can manage rates
- PRIORITY NOTES: This was elevated from discovery — Tatiana specifically requested that new proposed rates persist to the master rate table, not just individual estimates

**Weeks 3-5: Labor Log Module + Estimate Builder**
- Labor Log module (THIS WAS ELEVATED TO HIGHER PRIORITY per kickoff meeting)
  - Role selection from rate card with search
  - Quantity × Days × Rate auto-calculation
  - Multi-location support: one estimate → multiple labor logs (for tours)
  - Schedule/calendar view per labor log
  - Per Diem auto-calculation tied to headcount
- Estimate Builder
  - Event overview: type, duration, location, client, attendance
  - Office vs Corporate toggle (switches cost structure)
  - Section-based line items: P&A, Labor, Logistics, Production, Travel, Creative, Access Fees
  - Auto-calculations: revenue, net revenue, gross profit PER LINE ITEM (Derek requirement)
  - Pass-through cost tracking with configurable markup
  - Rate card defaults with override capability + reason logging
- MILESTONE: Tatiana can build a complete estimate in the system
- PAYMENT: $35,000 deposit due at kickoff

**Weeks 6-7: Workflow Engine + Approvals**
- Status state machine: Draft → Pending Review → Approved → Active → Recap → Complete
- Approval routing: AM review for all, $50K+ executive review
- Version history: who changed what, when, full snapshot at each version
- Rollback to any previous version
- Notifications (email) for approval requests and status changes
- MILESTONE: Complete approval workflow operational
- PAYMENT: $20,000 due at Week 7 (core engine milestone)

**Weeks 8-10: AI Scoping Assistant (Full)**
- Retrain on 988 bid-vs-actual events from Phase 1 discovery
- Event type classification (ride & drive, chauffeur, static display, press, etc.)
- Client-specific and market-specific recommendations
- Inline validation nudges in the Estimate Builder UI
  - "For Mazda events in LA, logistics typically runs 20% over"
  - "Did you include insurance? 94% of similar events include it"
  - "Your chauffeur rate is below the historical range for this client"
- Confidence scoring based on number of comparable events
- MILESTONE: AI assistant integrated into estimate creation flow

**Weeks 11-12: Change Orders, Recaps, PDF Outputs**
- Change order generation: auto-compute delta from approved version
- Recap entry: actual costs, hours, quantities per section
- Document upload for receipts and backup
- Variance analysis: estimated vs actual with drill-down
- PDF generation:
  - Client-facing (sanitized, no costs/margins visible)
  - Internal (full P&L per line item)
- MILESTONE: Full estimate lifecycle from creation through recap

**Weeks 13-14: Intacct Integration + Pipeline Dashboard + QA**
- Intacct API integration: invoice data push
- Field mapping and data validation
- Pipeline dashboard: real-time forecast from approved estimates
- PowerBI data feed (if applicable)
- QA and user acceptance testing
- Documentation and training
- MILESTONE: System go-live
- PAYMENT: $20,000 final invoice at delivery

---

## SIDEBAR NAVIGATION UPDATE

Current nav:
```
Discovery Intelligence
  📊 Historical Dashboard
  📋 Historical Rate Analysis
  🤖 AI Scoping Assistant

Phase 1 Deliverables        ← NEW SECTION
  🏗️ System Architecture
  🗄️ Database Schema
  🔄 Estimate Lifecycle
  📅 Phase 2 Roadmap
```

Use a subtle divider or section header between the two groups. The Discovery Intelligence section should feel like "what we found" and the Phase 1 Deliverables section should feel like "what we're building."

---

## PRIORITY ORDER FOR BUILD

1. System Architecture (highest visual impact, simplest to build)
2. Estimate Lifecycle (directly relevant to Dan/Tim)
3. Database Schema (shows technical depth)
4. Phase 2 Roadmap (closes the deal)

If time is tight, build #1 and #2 and save #3 and #4 for a fast follow.
