# Domain Knowledge: DriveShop's Business

Business context a new team member (or fresh Claude session) needs to understand the system. This is about DriveShop's world — rate cards, cost structures, stakeholders — not about how our code works. For code behavior, see `@.planning/DECISIONS.md` and `@docs/ARCHITECTURE.md`.

---

## What DriveShop Does

DriveShop is an automotive experiential marketing company. They manage vehicle programs — **test drives, launches, fleet management events** — on behalf of OEM (Original Equipment Manufacturer) clients. Each OEM has its own fleet, its own contract terms, and its own expectations for how events get billed.

DriveShop's work is almost always project-based: a client requests an event, DriveShop estimates it, builds it, executes it, then reconciles actuals and invoices.

The Event Estimate Engine is the operating system for that lifecycle.

---

## Stakeholders

| Name | Role | Responsibility |
|---|---|---|
| **Derek Drake** | CEO | Decision maker. Approved Phase 2. Primary client relationship. |
| **Tatiana** | CFO | Owns rate card data. Reviews estimates over approval threshold (currently $50K/$100K). |
| **Dave** | Operations | Builds estimates, manages labor logs and FMS data. Power user. |
| **Dan & Tim** | Production Managers | Daily users. Key UI feedback providers. |
| **Account Managers** (e.g., Gail for Lucid) | Per-client | Own client relationships and their rate cards. |

Account Managers own their client rate cards (per Tatiana's recommendation) — this is not an IT/admin function.

---

## OEM Clients (Rate Card Tenants)

21 rate cards live in the system: 20 OEM brands plus a `No Client` fallback card used for internal / unassigned work. Each has its own markup rules and cost structures.

**20 OEM brands (from Dave Morck's Cost Rate Card Template, imported Sprint 016):**

Acura, Audi, Bentley, Ferrari, Genesis, Hankook, Honda, Hyundai, JLR (Jaguar Land Rover), Lamborghini, Lexus, Lucid, Maserati, Mazda, MB (Mercedes-Benz), Polestar, Porsche, Toyota, Volkswagen, Volvo.

**Plus:** `No Client` — 21st rate card seeded from the Audi tab. Used when an estimate isn't yet tied to a specific OEM.

Client-level fields on the existing 6 brands that were already in the DB (Hankook, JLR, Lucid, Mazda, MB, Volvo) were **preserved** during import — only rate card items were upserted. `markup_percent` and `primary_approver` were left untouched. New brands were created with default markup; AM sets client-level fields in the UI.

Rate cards have two upstream sources historically:
- **Tatiana's Event Rate Card Template** — the original 8-tab Excel that seeded the first pass (Lucid, VW, JLR, Hankook, Mazda, MB, Volvo, Volvo MS).
- **Dave's Cost Rate Card Template** — the 20-tab cost-focused template imported in Sprint 016. Adds corporate/office cost columns for GP math and expands to the full OEM roster.

---

## The Rate Card System

### Three Cost Types

Every line item on every rate card falls into exactly one of these buckets:

1. **Labor** — Roles billed at day rate or hourly rate. DriveShop makes margin on the spread between **bill rate** (what the client pays) and **pay rate** (what the worker gets).

2. **Flat Fees** — Fixed MSA-defined charges. No receipts required. Billed per unit, per day, or per event.

3. **Pass-Through Costs** — Receipt-based costs passed through to the client with a client-specific markup on top. Examples: travel expenses, production expenses. Markup varies by client (Lucid 1.5%, Mazda 5%, VW 0%, Hankook 10%).

### Client-Specific Fields

Each client's top-level settings:

- **Client Name** and code
- **Third Party Cost Markup %** — applied to pass-through costs
- **Agency Fee %** — applied to total estimate, auto-generated on estimate creation
- **Agency Fee Basis** — what the fee calculates against (currently `total_estimate`)
- **Trucking Markup %** — specific to logistics/trucking line items
- **Office Payout %** — what percentage of revenue goes to the regional office (see Corporate vs Office below)
- **Primary Approver** — designated internal reviewer for this client's `in_review` submissions (see DECISIONS §Workflow)

### Rate Card Sections

Standard sections, shared across all clients (defined in `rate_card_sections` table):

1. **Planning & Administration Labor**
2. **Onsite Event Labor**
3. **Travel Expenses** (pass-through)
4. **Creative Costs**
5. **Production Expenses** (pass-through)
6. **Logistics Expenses** (flat fee)

### MSA Rates vs Custom Rates

Each rate card item has a flag: `is_from_msa`.

- **MSA rates** — locked in the Master Services Agreement. Cannot be modified per-project. These are the baseline.
- **Custom rates** — added per project as non-MSA line items. Flagged as `is_from_msa=false`. Used when a project needs something outside the standard contract terms.

Some items also have `is_rate_locked` — disables `unit_rate` editing in the rate card management dialog even when normally editable (see DECISIONS §Rate Cards).

### GL Codes

Standardized across all clients. Format: `4000.01`, `4025.12`, etc. Live in the `fee_types` master table. All `rate_card_items` reference a `fee_type_id`, which carries the GL code. When a rate card item is added to an estimate, the GL code propagates to the line item automatically.

---

## Corporate vs Office Events

DriveShop distinguishes between two event models:

### Corporate Events
- DriveShop hires contractors directly
- Variable margin (DriveShop keeps the spread)
- Higher operational complexity
- Typically larger, higher-profile events (launches, major test drives)

### Office Events
- Regional offices receive a percentage of revenue (typically 75%, 80% for VW)
- Pass-through costs remain at 100% — offices don't markup pass-throughs
- Simpler revenue split model
- Typically smaller, routine events

The `office_payout_pct` on the client record configures this split.

---

## Rate Sources (Important Nuance)

Three upstream sources have fed `rate_card_items` over the life of the project:

1. **Tatiana's Event Rate Cards** — `DriveShop_Event_Estimate_Template.xlsx`. Original 8-tab source for bill rates and GL codes. Seeded the first pass.

2. **Dave's Cost Rate Card Template** — `data/imports/DriveShop_Cost_Rate_Card_Template.xlsx`. 20 OEM tabs with corporate/office cost columns. Imported Sprint 016. Current source for per-item GP math.

3. **Dave's FMS Rate Matrix** — Fleet Management System rate matrix (146 fee types × 15 brands). Covers fleet-specific rates (vehicle prep, delivery, logistics). Referenced for fleet rate validation but not directly integrated into the estimation flow.

---

## The Estimate Lifecycle

An estimate moves through these statuses (see DECISIONS §Workflow for the state machine):

1. **Pipeline** — identified opportunity, not yet built out
2. **Draft** — being built
3. **Review** — submitted for internal approval (AM → CFO if over threshold → Client)
4. **Approved** — all internal gates passed
5. **Active** — event is happening or has happened; production is on the ground
6. **Recap** — entering actuals (schedule recap, line item actuals, receipts)
7. **Invoiced** — billed to client
8. **Complete** — closed out

Each segment (location within a multi-location estimate) moves through the lifecycle independently. The estimate-level status is computed from segment statuses.

---

## Key Business Terms

- **Segment** — One location within an estimate. Single-location estimates have one "primary" segment; multi-location estimates have N segments, each with its own dates, staff, and lifecycle.
- **Labor Log** — Internal name for a segment (the database table is `labor_logs`). When you see "labor log" in code and "segment" in UI, they're the same thing.
- **Change Order (CO)** — A formal change to an approved estimate. Per-segment. Sequential numbering (CO-001, CO-002).
- **Recap** — Post-event reconciliation. Compare planned vs actual for every labor row, line item, and schedule day.
- **Unplanned Additions** — Line items, schedule days, staff, or roles added during recap that weren't in the approved estimate. Tracked separately so they land as pure overruns in Planned vs Actual.
- **Three-Gate Approval** — AM review → CFO review (if over threshold) → Client review. Each gate can approve or send back.
- **Pass-Through** — Cost billed to client at cost + markup, with receipts required. Distinct from flat fees (no receipts) and labor (bill rate × days).

---

## Financial Thresholds

Configurable in `system_settings` table (editable by admins at `/admin/settings`):

- **GP Threshold** (`gp_threshold_pct`, default 20%) — estimates below this gross profit percentage trigger an amber banner on the Summary tab
- **Approval Threshold** (`approval_threshold`, default $50K) — estimates over this amount require CFO review

See DECISIONS §Financial Controls for propagation semantics (GP threshold is lazy-loaded; approval threshold is fresh per submission).

---

## What This Product Replaces

Before this system, DriveShop ran their estimation workflow in **Excel spreadsheets** (literally: the `DriveShop_Event_Estimate_Template.xlsx` file, copied and edited per event). Key pain points:

- No centralized rate card — rate changes meant finding and updating every template copy
- No version history — previous quotes lost or scattered across inboxes
- Manual markup math — errors in markup application
- No approval workflow — approvals happened in email threads
- No recap capability — actuals tracked in separate spreadsheets or not at all
- No historical data — couldn't search "what did we quote for a similar VW launch last year?"

The Event Estimate Engine addresses all of these. The 1,700+ historical estimates in `/historical_estimates/` are legacy spreadsheets imported and made searchable via the AI Scoping "From History" tab.
