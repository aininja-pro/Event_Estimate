# Requirements: Estimate Duplication & Historical Event Search

## Problem

Two common scenarios have no solution in the system:

1. Dan builds an estimate and wants to create a similar one for a different location or date — he has to start from scratch every time. There's no "duplicate" option.
2. Dave knows DriveShop did a similar event last year and wants to use it as a starting point — but the only way to reference history is through the AI chat, which describes events but doesn't create estimates from them.

## Who This Is For

- **Primary users:** Dan, Tim (Production Managers) — duplicate existing estimates for similar events
- **Secondary users:** Dave (Operations), Account Managers — find historical events and generate new estimates from proven patterns

## Proposal

Two features in one sprint:

1. **Duplicate Estimate** — three-dot menu on the Estimates list page copies an entire estimate (header, labor log, entries, schedule, line items, agency fee) into a new estimate in pipeline status.
2. **Historical Event Search** — a "From History" tab on the AI Scoping page where users search/filter 1,674 historical events, view details, and click "Use as Template" to pre-fill the AI Scoping form. Then "Create Estimate" works exactly as it does today.

## Success Criteria

- "Duplicate" option in the three-dot menu on any estimate in the Estimates list
- Duplicated estimate has all data copied: header fields, labor log with entries, schedule entries with day entries, line items, agency fee auto-generated
- Duplicated estimate starts in "pipeline" status with name "Copy of {original name}"
- "From History" tab on AI Scoping page with search/filter over 1,674 historical events
- Search by client, event type, event name, location (text search)
- Filter by client dropdown and event type dropdown
- Click an event to see section breakdown, common roles, and financials
- "Use as Template" pre-fills the AI Scoping form with the historical event's parameters
- "Create Estimate" from pre-filled form works identically to existing Mode 3 flow

## Scope

### Included

**Duplicate Estimate:**
- "Duplicate" option in the three-dot menu on EstimatesListPage
- Deep copy: estimate header (new ID, status=pipeline, name="Copy of..."), primary labor log, all labor entries, all schedule entries + day entries + day types, all line items, auto-generated agency fee
- Navigate to the new estimate after creation

**Historical Event Search:**
- New "From History" tab on AIScopingPage alongside existing "Generate New" tab
- Search input: text search across event_name, client, location
- Filter dropdowns: client (from clients table), event type (from EVENT_TYPES constant)
- Results table: event name, client, type, location, total, staff count, has_recap badge
- Click a row to expand detail: section breakdown (bid totals per section as % of total), common roles list, financial summary
- "Use as Template" button that switches to the "Generate New" tab with form pre-filled: client (matched to clients table), event type, location, attendance (if available)
- If client from historical event doesn't exist in the clients table, leave client dropdown empty with a note

### Not Included

- Duplicate with modifications (e.g., "duplicate but change the client") — user duplicates then edits
- Batch duplicate (one at a time)
- Historical event detail page (expand inline is sufficient)
- Editing or managing historical events

## Dependencies

- **Estimates list three-dot menu** — likely already exists for delete/archive actions ✅
- **AI Scoping page** — exists with full Create Estimate flow ✅
- **historical_events table** — 1,674 events in Supabase ✅
- **Existing service functions** — createEstimate, createLaborLog, createLaborEntry, createLineItem, createAutoFeeLines ✅

## Resolved Decisions

- **Historical search lives on the AI Scoping page** as a tab. Both "Generate New" and "From History" lead to the same Create Estimate flow.
- **"Use as Template" pre-fills the form, doesn't create directly.** User reviews and adjusts before creating. The AI still generates the scope — the historical event just seeds the parameters.
- **Duplicate is a full deep copy.** Every child record is copied. User adjusts dates, names, etc. after duplication.

## Open Questions

*None — all resolved.*
