# Blueprint: AI Historical Data Pipeline — Phase 2 (Enriched Intelligence)

## What This Is

Migrate 988 historical events from `enriched_master_index.json` into Supabase. Classify each event by type using Claude. Pre-compute aggregated patterns (averages, variances, staffing norms) by client × event_type into a summary table. Update the nudge pipeline to inject relevant historical patterns into the prompt so nudges reference real data — "Based on 14 similar Mazda Ride & Drive events, logistics averages 18% of total cost."

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context, conventions, service layer patterns
- `planning/requirements-driveshop-ai-historical.md` — full requirements for this sprint
- `api/services/ai_service.py` — current nudge pipeline (this gets updated)
- `api/prompts/nudge_system_prompt.md` — current system prompt template (this gets a new placeholder)
- `api/prompts/nudge_rules.md` — current rules (stays unchanged)
- Locate `enriched_master_index.json` in the repo (should be in `data/` or project root). Read the first 2-3 records to confirm the data shape before writing any migration code.

---

## Step 1: Supabase Schema — Historical Tables

Create migration script at `scripts/add_historical_tables.sql`:

### Table: historical_events

```sql
CREATE TABLE IF NOT EXISTS historical_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL UNIQUE,
  client TEXT,
  event_name TEXT,
  event_type TEXT CHECK (event_type IN (
    'Ride & Drive', 'Static Display', 'Press Event', 'Chauffeur',
    'Auto Show', 'Tour', 'Fleet', 'Other'
  )),
  event_manager TEXT,
  lead_office TEXT,
  status TEXT,
  revenue_segment TEXT,
  location TEXT,
  initial_estimate_amount NUMERIC,
  final_invoice_amount NUMERIC,
  grand_total NUMERIC,
  has_recap_data BOOLEAN DEFAULT FALSE,
  template_format TEXT,
  sections JSONB DEFAULT '[]',
  labor_roles JSONB DEFAULT '[]',
  bid_total NUMERIC GENERATED ALWAYS AS (
    (SELECT COALESCE(SUM((s->>'bid_total')::numeric), 0)
     FROM jsonb_array_elements(sections) AS s)
  ) STORED,
  recap_total NUMERIC GENERATED ALWAYS AS (
    (SELECT COALESCE(SUM((s->>'recap_total')::numeric), 0)
     FROM jsonb_array_elements(sections) AS s)
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_historical_events_client ON historical_events(client);
CREATE INDEX idx_historical_events_event_type ON historical_events(event_type);
CREATE INDEX idx_historical_events_client_type ON historical_events(client, event_type);

ALTER TABLE historical_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Historical events are readable by all authenticated users"
  ON historical_events FOR SELECT
  USING (auth.role() = 'authenticated');
```

**Note on generated columns:** The `bid_total` and `recap_total` generated columns may not work with JSONB array aggregation in all Postgres versions. If the generated column syntax fails, make them regular NUMERIC columns and compute them during the migration insert instead. Test the SQL before running it.

### Table: historical_patterns

```sql
CREATE TABLE IF NOT EXISTS historical_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'Ride & Drive', 'Static Display', 'Press Event', 'Chauffeur',
    'Auto Show', 'Tour', 'Fleet', 'Other'
  )),
  event_count INTEGER NOT NULL DEFAULT 0,
  avg_total_revenue NUMERIC,
  avg_grand_total NUMERIC,
  avg_gp_percent NUMERIC,
  avg_staff_count NUMERIC,
  avg_duration_days NUMERIC,
  section_averages JSONB DEFAULT '{}',
  section_variance JSONB DEFAULT '{}',
  common_roles JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client, event_type)
);

ALTER TABLE historical_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Historical patterns are readable by all authenticated users"
  ON historical_patterns FOR SELECT
  USING (auth.role() = 'authenticated');
```

**`section_averages` JSONB shape:**
```json
{
  "Planning & Admin Labor": { "avg_bid": 5200, "avg_recap": 4800, "pct_of_total": 12.5 },
  "Onsite Event Labor": { "avg_bid": 18000, "avg_recap": 19500, "pct_of_total": 42.0 },
  "Travel Expenses": { "avg_bid": 6500, "avg_recap": 7200, "pct_of_total": 15.8 },
  "Creative Costs": { "avg_bid": 2000, "avg_recap": 1800, "pct_of_total": 4.8 },
  "Production Expenses": { "avg_bid": 4500, "avg_recap": 5800, "pct_of_total": 10.9 },
  "Logistics Expenses": { "avg_bid": 5800, "avg_recap": 6200, "pct_of_total": 14.0 }
}
```

**`section_variance` JSONB shape:**
```json
{
  "Planning & Admin Labor": { "avg_variance_pct": -7.7, "over_budget_pct": 35 },
  "Onsite Event Labor": { "avg_variance_pct": 8.3, "over_budget_pct": 62 },
  "Production Expenses": { "avg_variance_pct": 28.9, "over_budget_pct": 78 },
  "Logistics Expenses": { "avg_variance_pct": 6.9, "over_budget_pct": 55 }
}
```

**`common_roles` JSONB shape:**
```json
[
  { "role": "Production Director/ hr", "frequency": 0.92, "avg_rate": 700 },
  { "role": "Production Manager/ hr", "frequency": 0.85, "avg_rate": 550 },
  { "role": "Vehicle Handler/ hr", "frequency": 0.78, "avg_rate": 350 }
]
```

Show me the SQL before running it. Verify the generated columns work in Supabase's Postgres version — if they don't, fall back to regular columns.

---

## Step 2: Migration Script — Load Historical Events

Create `scripts/migrate_historical_events.py`:

This script reads `enriched_master_index.json` and inserts records into `historical_events`. It does NOT classify event types yet — that's Step 3.

### Logic:

1. Read the JSON file. Confirm the record count matches expectations (~1,659 total).
2. Filter to records where `has_recap_data` is true. This gives the ~988 training set. Also insert the non-recap records (they have bid data that's still useful for pattern context), but flag them with `has_recap_data: false`.
3. For each record, map fields:
   - `filename` → `filename` (this is the unique key for upsert)
   - `client` → `client`
   - `event_name` → `event_name`
   - `event_type` → NULL (filled in Step 3)
   - `event_manager` → `event_manager`
   - `lead_office` → `lead_office`
   - `status` → `status`
   - `revenue_segment` → `revenue_segment`
   - `initial_estimate_amount` → `initial_estimate_amount`
   - `final_invoice_amount` → `final_invoice_amount`
   - `grand_total` → `grand_total`
   - `has_recap_data` → `has_recap_data`
   - `template_format` → `template_format`
   - `sections` → `sections` (the full sections array as JSONB)
   - `labor_roles` → `labor_roles` (the full labor_roles array as JSONB)
4. Use upsert on `filename` — if the record exists, update it. This makes the script idempotent.
5. Batch inserts in groups of 50 to avoid hitting Supabase limits.
6. Print progress every 100 records.
7. Print final summary: total inserted, total updated, total skipped (if any), count with recap data.

### Environment:

The script reads `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from environment variables (same ones the FastAPI backend uses). Use the `supabase` Python library.

### Running:

```bash
cd scripts && python migrate_historical_events.py
```

Show me the script and a dry-run count (how many records will be inserted) before running the actual migration.

---

## Step 3: Event Type Classification

Create `scripts/classify_event_types.py`:

This script reads the `historical_events` table rows where `event_type IS NULL` and uses Claude to classify each one.

### Logic:

1. Query `historical_events` where `event_type IS NULL`. Should return ~1,659 records on first run.
2. Batch events into groups of 20 for a single Claude call (cheaper than 1,659 individual calls).
3. For each batch, send to Claude Haiku (cheapest model — `claude-haiku-4-5-20251001`):
   - System prompt: "You are classifying DriveShop event estimates by type. For each event, return the best matching type from this exact list: Ride & Drive, Static Display, Press Event, Chauffeur, Auto Show, Tour, Fleet, Other. Consider the event name and client name. Return ONLY a JSON array of objects with 'filename' and 'event_type' fields. No explanation."
   - User message: JSON array of `{ "filename": "...", "event_name": "...", "client": "..." }` for the batch.
4. Parse Claude's response. For each classified event, UPDATE the `historical_events` row SET `event_type` = the classified value WHERE `filename` matches.
5. If Claude returns an event_type not in the allowed list, set it to "Other" and log a warning.
6. Print progress: "Classified batch 5/83 (100/1659 events)"
7. Add a 0.5-second delay between batches to avoid rate limiting.
8. Print final summary: count per event_type, count of "Other" classifications.

### Cost estimate:

~83 batches × ~500 tokens per call = ~41,500 tokens. At Haiku pricing this is well under $1.

### Running:

```bash
cd scripts && python classify_event_types.py
```

Show me the script and run it on a small test batch (first 20 records) before processing all records. Verify the classifications look reasonable.

---

## Step 4: Pattern Computation Script

Create `scripts/compute_historical_patterns.py`:

This script reads from `historical_events` and writes aggregated patterns to `historical_patterns`.

### Logic:

1. Query all `historical_events` where `has_recap_data = true` (the ~988 events with actual data).
2. Group by `client` × `event_type`.
3. For each group, compute:
   - `event_count` — number of events in this group
   - `avg_total_revenue` — average of `initial_estimate_amount` (where not null)
   - `avg_grand_total` — average of `grand_total` (where not null)
   - `avg_gp_percent` — average of `(initial_estimate_amount - grand_total) / initial_estimate_amount * 100` where both values exist
   - `avg_staff_count` — average count of labor_roles per event (from JSONB)
   - `avg_duration_days` — not available in the data, set to NULL
   - `section_averages` — for each of the 6 canonical sections, compute average bid_total, average recap_total, and percentage of grand total
   - `section_variance` — for each section, compute average `(recap_total - bid_total) / bid_total * 100` variance, and what percentage of events in this group went over budget on this section
   - `common_roles` — from the labor_roles JSONB, count role frequency across events in this group, compute average rate per role, return top 10 most frequent roles
4. Upsert into `historical_patterns` on the `(client, event_type)` unique constraint.
5. Also compute an "ALL" client row per event_type (aggregate across all clients for that type) — this provides fallback patterns when a specific client × type combo has too few events.
6. Skip groups with fewer than 3 events — not enough data for meaningful patterns. Log these as "insufficient data."
7. Print summary: total patterns computed, groups skipped, top 5 largest groups.

### Running:

```bash
cd scripts && python compute_historical_patterns.py
```

Show me the script output summary before moving on. Verify the pattern numbers look reasonable for a couple of known groups (e.g., Mazda Ride & Drive should be the largest group).

---

## Step 5: Update Nudge Pipeline with Historical Context

### Update `api/prompts/nudge_system_prompt.md`:

Add a new placeholder section after the rate card data:

```markdown
## Historical Patterns (Based on Similar Past Events)

{historical_patterns}
```

### Update `api/services/ai_service.py`:

In the `generate_nudges` function, after querying the rate card data:

1. Extract `client_name` and `event_type` from the estimate state.
2. Query `historical_patterns` table for the matching `client` × `event_type` row.
3. If no match found (new client or rare event type), fall back to the "ALL" client row for that event_type.
4. If still no match, set `historical_patterns` to "No historical data available for this client and event type."
5. Format the patterns into a concise text block (keep under 500 tokens):

```
For {client} {event_type} events ({event_count} historical events):
- Average total estimate: ${avg_grand_total}
- Average GP: {avg_gp_percent}%
- Section breakdown (% of total): Planning {pct}%, Onsite Labor {pct}%, Travel {pct}%, Creative {pct}%, Production {pct}%, Logistics {pct}%
- Sections that tend to go over budget: {list sections where avg_variance_pct > 5, with the variance %}
- Most common roles: {top 5 roles with frequency %}
```

6. Replace the `{historical_patterns}` placeholder in the system prompt with this formatted text.

### Update `api/prompts/nudge_rules.md`:

Add a new section at the end:

```markdown
## Historical Comparison (only apply when historical patterns are available)
- If a section's estimated cost is more than 30% below the historical average for this client × event type, flag it as potentially underestimated. Reference the historical average.
- If a section's estimated cost is more than 50% above the historical average, flag it as potentially overestimated. Reference the historical average.
- If the overall estimate total is more than 40% below the historical average for this event type, flag it as unusually low.
- If commonly used roles (frequency > 70%) for this client × event type are missing from the labor log, suggest adding them.
- If a section historically goes over budget more than 60% of the time for this client × event type, proactively warn the estimator to add buffer.
```

### Test:

After updating, test with a real estimate (e.g., a Mazda Ride & Drive). The nudges should now include historically-grounded recommendations alongside the rule-based ones. Verify:
- The nudge messages reference specific numbers ("Based on 14 similar events...")
- The historical patterns don't duplicate rule-based nudges (Claude should be smart enough to consolidate)
- If a client × event_type has no historical data, nudges still work (rules-only fallback)

---

## Step 6: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log

Add row: `Wk 10 | AI Historical Pipeline: 988 events migrated to Supabase, event type classification, pre-computed patterns, historically-enriched nudges | Mode 2 chat assistant | Historical intelligence live`

### Known Issues

- Remove "Historical event data (988 bid-vs-actual records) not yet migrated to Supabase — lives in enriched_master_index.json"
- Add: "Historical patterns are pre-computed aggregates — rerun scripts/compute_historical_patterns.py after adding new event data"
- Add: "Event type classification used Claude Haiku — spot-check 'Other' classifications for potential misclassification"

### Supabase Tables

Add: `historical_events, historical_patterns`

### Key Service Layers

No new frontend service layers — this sprint only touches the backend pipeline.

---

## What NOT to Build

- Do not build Mode 2 (chat assistant). That's a separate blueprint.
- Do not build Mode 3 (scoping bridge). That's a separate blueprint.
- Do not build a UI for browsing or managing historical data. Deferred.
- Do not build auto-refresh of patterns when estimates hit Invoiced. Manual script for now.
- Do not normalize section data into separate tables — keep it as JSONB on historical_events.
- Do not modify the Intelligence panel UI. The panel already renders whatever nudges the API returns — the enriched nudges flow through the same pipeline.
- Do not delete or modify `enriched_master_index.json`. It stays as the source-of-truth backup.

---

## Build Order

1. **Step 1** — Schema. Create the two tables. Show me the SQL before running. Test the generated columns — fall back to regular columns if needed.
2. **Step 2** — Migration script. Load all events into `historical_events`. Show me the record count before and after.
3. **Step 3** — Classification. Run on a 20-record test batch first. Show me the classifications. Then run full batch.
4. **Step 4** — Pattern computation. Run and show me the summary output. Verify Mazda Ride & Drive is the largest group.
5. **Step 5** — Update the nudge pipeline. Test with a real Mazda Ride & Drive estimate. Show me the nudge response with historical context.
6. **Step 6** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1. Show me the SQL before running it.
