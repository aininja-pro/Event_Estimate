# Requirements: AI Historical Data Pipeline — Event Estimate Engine

## Problem

The AI Intelligence panel currently runs on rule-based validation only. It catches structural issues (missing travel days, $0 rates, low margins) but has no awareness of what DriveShop has actually experienced across 988 real events. When the system says "your logistics estimate seems low," it's applying a generic rule — not comparing against 14 similar Mazda ride-and-drives where logistics averaged 18% of total cost.

The historical data exists. Phase 1 discovery processed 1,700+ estimate spreadsheets and produced `enriched_master_index.json` — 988 of those events have both bid and actual (recap) data. This file sits in the repo unused. Migrating it into Supabase and pre-computing patterns transforms the nudge engine from "generic checklist" to "institutional memory."

## Cost of Status Quo

- Nudges are generic — they apply the same rules regardless of whether it's a Mazda ride-and-drive or a VW family day, despite those events having fundamentally different cost profiles
- No variance awareness — the system can't say "you consistently underestimate logistics on this type of event" because it doesn't know what happened on past events
- Estimators still rely on personal memory for "what did we spend last time" — the exact tribal knowledge problem the Estimate Engine was built to solve
- Mode 2 (chat assistant) and Mode 3 (scoping bridge) are blocked until historical data is queryable in Supabase

## Who This Is For

- **Primary users:** Dan, Tim (Production Managers) — nudges become specific to their client and event type
- **Stakeholders:** Derek (CEO) — "the system learns from our history" is the headline feature he's been sold on since Phase 1
- **Future users:** Account Managers using Mode 2 chat to ask "what did we charge for something like this last year?"

## Proposal

Migrate the 988 bid-vs-actual historical events from `enriched_master_index.json` into Supabase. Tag each event with a structured event type using Claude for classification. Pre-compute aggregated patterns (averages, variances, staffing levels) by client × event type into a summary table. Inject relevant patterns into the nudge prompt so the AI Intelligence panel delivers historically-grounded recommendations.

## Success Criteria

- All 988 events with recap data migrated into a `historical_events` table in Supabase
- Each event tagged with a structured event_type (ride-and-drive, static-display, launch-event, family-day, chauffeur, fleet, tour, training, corporate-event, other)
- Pre-computed patterns table aggregated by client × event_type with: average total revenue, average section percentages, average GP%, typical staff count, bid-vs-actual variance by section
- Nudge prompt updated to include relevant historical patterns — nudges now reference "Based on N similar events..." with real numbers
- Migration script is idempotent — can be re-run without duplicating data
- Pattern recomputation can be triggered manually (script) when new historical data is added

## Scope

### Included (This Blueprint)

- Migration script to load `enriched_master_index.json` into Supabase `historical_events` table
- Event type classification using Claude API (batch process during migration)
- Section-level data stored per event (bid totals, recap totals, variance per section)
- `historical_patterns` table with pre-computed aggregates by client × event_type
- Pattern computation script that reads from `historical_events` and writes to `historical_patterns`
- Updated nudge system prompt to include historical pattern context
- Updated `ai_service.py` to query `historical_patterns` for the current client × event type and inject into the prompt
- Labor role frequency data per client × event type (which roles are commonly used, at what rates)

### Not Included

- Mode 2 chat assistant (Phase 3 blueprint)
- Mode 3 scoping bridge (Phase 3 blueprint)
- Real-time ingestion of new estimates into historical data (future — when an estimate reaches "Invoiced" status, it could auto-feed into historical tables)
- Location-level pattern aggregation (client × event_type × market — not enough data density per location to be reliable yet)
- UI for browsing or managing historical data (admin feature, deferred)

## Dependencies

- **FastAPI backend** — deployed and live on Render ✅
- **AI nudge pipeline** — functional with rules-based nudges ✅
- **`enriched_master_index.json`** — in the repo (data/ or project root)
- **Claude API** — needed for event type classification during migration
- **Supabase** — tables need to be created via migration script

## Inputs

- **`enriched_master_index.json`** — 1,659 records total. Each record contains:
  - Project List fields: client, event_name, event_manager, lead_office, status, revenue_segment, initial_estimate_amount, final_invoice_amount
  - Scan fields: template_format, grand_total, has_recap_data
  - Sections array: canonical_name, section_exists, bid_total, recap_total per section
  - Labor roles array: role, unit_rate, gl_code per role found in the estimate
  - 988 of these records have `has_recap_data: true` (bid AND actual data — the training set)

## Outputs

- **`historical_events` table** — one row per event with structured fields, section-level JSON, and classified event_type
- **`historical_patterns` table** — aggregated rows by client × event_type with averages, counts, and variance data
- **Updated nudge prompt** — injects "For [client] [event_type] events, historically: [patterns]" into Claude's context
- **Enriched nudge responses** — nudges now say "Based on 14 similar Mazda ride-and-drive events, logistics averages 18% of total cost — yours is at 8%"

## Constraints

- Event type classification should use Claude Haiku (cheapest model) for the batch classification — 988 calls at ~$0.001 each
- Migration script must be idempotent — check for existing records before inserting, use upsert pattern on a unique key (filename or a composite of client + event_name)
- Pattern computation is a separate script from migration — they can be run independently
- Historical pattern data in the nudge prompt should be concise — aggregated summaries, not raw event dumps. Keep the prompt addition under 500 tokens.
- The `historical_events` table stores section data as JSONB (not normalized into separate tables) to keep the schema simple. We're reading patterns, not querying individual line items.

## Resolved Decisions

- **Pre-computed patterns for nudges, raw records for future chat.** Nudges read from the aggregated `historical_patterns` table (fast, small prompt). Mode 2 chat will query `historical_events` directly when users ask about specific past events. Different modes, different data shapes, same source.
- **Event type classification via Claude.** The historical data has no structured event_type field. Event names like "Mazda CX-5 SLP Drive" and "VW Family Day Reston" contain the type implicitly. Claude classifies each event during migration into a fixed taxonomy.
- **JSONB for section data.** Each historical event stores its sections array as a JSONB column rather than normalized rows. This keeps the schema simple and the migration straightforward. Pattern computation queries aggregate across the JSONB.
- **No location-level patterns yet.** Client × event_type gives enough segmentation for meaningful patterns. Adding location would fragment the data too thin (e.g., "Mazda ride-and-drive in San Diego" might only have 2 events). Can be added later if data density supports it.

## Open Questions

*None — all resolved.*

- **Event type taxonomy:** Use the 8 types already in the Estimate Builder dropdown: Ride & Drive, Static Display, Press Event, Chauffeur, Auto Show, Tour, Fleet, Other. Historical events classified to match exactly.
- **Pattern refresh cadence:** Manual script for now. Auto-refresh when estimates hit Invoiced is a future enhancement.
- **Data quality threshold:** Include all 988 records. Aggregation smooths noise from scanning inconsistencies.
