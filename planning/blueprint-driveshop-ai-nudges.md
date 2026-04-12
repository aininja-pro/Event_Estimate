# Blueprint: AI Nudges — Phase 1 (Mode 1: Passive Intelligence Panel)

## What This Is

Wire the existing Intelligence panel skeleton in the Estimate Builder to a live FastAPI backend that calls Claude API. The backend reads a plain-English rules document, the client's rate card data, and the current estimate state, sends it to Claude, and returns structured nudge cards that render in the panel. No historical data needed. No chat functionality. Just real-time rule-based validation nudges that fire as the user builds an estimate.

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context, conventions, service layer patterns
- `planning/requirements-driveshop-ai-nudges.md` — full requirements for the AI Intelligence module
- `src/pages/EstimateBuilderPage.tsx` — the existing Estimate Builder with Intelligence panel skeleton
- `src/lib/estimate-service.ts` — how estimates are fetched and structured
- `src/lib/rate-card-service.ts` — how rate card data is queried
- `src/lib/supabase.ts` — Supabase client pattern

Identify the existing Intelligence panel component in the Estimate Builder. It's a collapsible right-side panel with five hardcoded nudge card placeholders (Staffing Suggestion, Cost Alert, Validation, Margin Insight, Missing Item Check) and an "Ask about this estimate..." chat input. You are replacing the hardcoded cards with live data from the API. The chat input stays as a non-functional placeholder for Phase 3.

---

## Step 1: FastAPI Backend Service

Create a new `/api` directory at the project root for the Python backend.

### File Structure

```
/api
├── main.py                         — FastAPI app, CORS config, health check
├── routes/
│   └── ai.py                       — POST /api/ai/nudges endpoint
├── services/
│   └── ai_service.py               — Prompt assembly, Claude API call, response parsing
├── prompts/
│   ├── nudge_system_prompt.md       — System prompt template with {placeholders}
│   └── nudge_rules.md              — Plain-English validation rules
├── requirements.txt                 — Python dependencies
└── render.yaml                      — Render web service config (or update existing render.yaml)
```

### Dependencies (requirements.txt)

```
fastapi>=0.115.0
uvicorn>=0.34.0
anthropic>=0.42.0
python-dotenv>=1.0.0
httpx>=0.28.0
supabase>=2.0.0
```

### main.py

- Create FastAPI app instance
- Add CORS middleware allowing the frontend origin (localhost:5173 for dev, the Render URL for prod). Use environment variable `FRONTEND_URL` for the allowed origin.
- Include the `ai` router from `routes/ai.py`
- Add a `GET /api/health` endpoint that returns `{"status": "ok"}`
- Load environment variables from `.env` on startup

### routes/ai.py

Single endpoint: `POST /api/ai/nudges`

**Request body:**
```json
{
  "estimate_id": "uuid",
  "estimate_state": {
    "client_name": "Mazda",
    "event_type": "Ride & Drive",
    "event_name": "Mazda Test",
    "location": "San Diego",
    "start_date": "2026-03-23",
    "end_date": "2026-03-28",
    "cost_structure": "corporate",
    "attendance": null,
    "segments": [
      {
        "name": "Feb 2026 (Primary)",
        "status": "estimate",
        "labor_entries": [...],
        "schedule_entries": [...],
        "line_items": [...]
      }
    ],
    "summary": {
      "total_revenue": 0,
      "total_cost": 0,
      "gross_profit": 0,
      "gp_percent": 0
    }
  }
}
```

The frontend serializes the current estimate into this shape before calling the endpoint. Do not query Supabase from the frontend for this — assemble the state from what's already loaded in the Estimate Builder page.

**Response body:**
```json
{
  "nudges": [
    {
      "id": "nudge_missing_travel_days",
      "type": "missing",
      "severity": "warning",
      "title": "Missing Travel Days",
      "message": "This is a 6-day event in San Diego but no travel days are included in the schedule. Multi-day out-of-market events typically include at least 1 travel day.",
      "suggested_action": "Add travel day columns to the schedule",
      "rule_id": "missing_travel_days"
    }
  ],
  "cached": false,
  "generated_at": "2026-03-25T16:00:00Z"
}
```

**Caching logic:** Hash the `estimate_state` JSON (use hashlib.sha256). Store the hash and response in an in-memory dict. If the same hash comes in within 5 minutes, return the cached response with `"cached": true`. This avoids duplicate Claude API calls when nothing changed.

**Error handling:** If Claude API fails, return `{"nudges": [], "error": "AI service temporarily unavailable", "cached": false}` with HTTP 200 (not 500 — the panel should degrade gracefully, not crash).

### services/ai_service.py

This is where the intelligence lives.

**`generate_nudges(estimate_state: dict, rate_card_data: list) -> list[dict]`**

1. Read `prompts/nudge_system_prompt.md` from disk
2. Read `prompts/nudge_rules.md` from disk
3. Query Supabase for the client's rate card items (use the client name from estimate_state to look up the client, then fetch their rate_card_items joined with fee_types for GL codes and section names)
4. Replace placeholders in the system prompt:
   - `{nudge_rules}` → contents of nudge_rules.md
   - `{rate_card_data}` → JSON-serialized rate card items
   - `{estimate_state}` → JSON-serialized estimate state
5. Call the Anthropic API:
   - Model: `claude-sonnet-4-20250514`
   - max_tokens: 2000
   - System prompt: the assembled prompt
   - User message: `"Analyze this estimate and return nudges as a JSON array. Return ONLY valid JSON, no markdown, no explanation."`
6. Parse the response text as JSON
7. Validate each nudge has required fields (id, type, severity, title, message)
8. Return the list of nudge dicts

**Environment variables needed:**
- `ANTHROPIC_API_KEY` — Claude API key (server-side only, never exposed to frontend)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key (not the anon key — this is server-side)
- `FRONTEND_URL` — Allowed CORS origin

### Supabase query in ai_service.py

To get the client's rate card for prompt context:

1. Query `clients` table by name to get client_id
2. Query `rate_card_items` where client_id matches, joined with `fee_types` on fee_type_id
3. Return: fee_type name, section, gl_code, unit_rate, markup_pct, is_rate_locked, cost_type

This gives Claude the full MSA rate card to validate against.

---

## Step 2: Nudge Rules Document

Create `api/prompts/nudge_rules.md`:

```markdown
# Estimate Validation Rules

## Missing Item Checks
- If the event spans multiple days AND the location is not the client's home market, check for travel day columns in the schedule. Flag if missing.
- If out-of-market staff are scheduled (resource_type = external), check for per diem, hotel, and airfare line items. Flag any that are missing.
- If the event type is "Ride & Drive", check for vehicle detailing line items in Production. Flag if missing.
- If the event has any labor scheduled, check for insurance line items in Access Fees & Insurance section. Flag if missing.
- If the event spans 3+ days, check for a site survey or advance day. Flag if missing.

## Rate Validation
- Compare each labor entry's unit_rate against the client's MSA rate card. If a rate is more than 15% above or below the MSA rate for that role, flag it.
- If any labor entry has a $0 rate, flag it as likely missing data.
- If custom line items (items not matching any fee_type) represent more than 20% of total revenue, flag for review.

## Staffing Checks
- If the schedule has event days with zero staff assigned, flag it.
- If any role appears in the labor log but has zero days in the schedule, flag the mismatch.
- If total staff count is less than 3 for a multi-day event, flag as potentially understaffed.

## Financial Guardrails
- If any section's gross profit percentage is below 20%, flag it with the section name and current GP%.
- If the overall estimate GP% is below 20%, flag it as a critical margin warning.
- If pass-through items exist but the client's markup percentage is 0% AND the client normally has a markup, flag it.
- If the cost structure field (corporate vs office) is not set, flag it — the system cannot calculate correct costs without this.

## Structural Validation
- If the estimate has no segments, flag it.
- If any segment has zero line items across all sections, flag it.
- If start_date or end_date is missing, flag it.
- If end_date is before start_date, flag it.
- If attendance is null or zero for event types that typically track attendance (Ride & Drive, Launch Event, Family Day), flag it.
```

This file is meant to be edited by hand. When Dave or Tatiana identifies a new pattern to catch, add a line. No code change required.

---

## Step 3: System Prompt Template

Create `api/prompts/nudge_system_prompt.md`:

```markdown
You are an estimate validation assistant for DriveShop, an automotive experiential marketing company that manages vehicle programs for OEM clients.

Your job is to review an in-progress event estimate and surface potential issues. You are helpful, not authoritative — you suggest, you don't demand. Your tone is professional and concise.

## Validation Rules

{nudge_rules}

## Client Rate Card (MSA Rates)

{rate_card_data}

## Current Estimate State

{estimate_state}

## Response Format

Return a JSON array of nudge objects. Each nudge must have these fields:
- "id": A unique snake_case identifier for this specific nudge (e.g., "missing_travel_days_seg1")
- "type": One of "staffing", "cost", "validation", "missing", "margin"
- "severity": One of "info", "warning", "critical"
- "title": Short title (5 words max)
- "message": One or two sentences explaining the issue and why it matters.
- "suggested_action": One sentence describing what the user could do.
- "rule_id": Which rule triggered this (matches a concept from the rules above)

Guidelines:
- Return between 0 and 8 nudges. Do not overwhelm the user.
- Prioritize critical issues first, then warnings, then info.
- If the estimate looks solid, return an empty array. Do not invent problems.
- Do not repeat the same nudge for multiple segments unless the details differ.
- Be specific — reference actual role names, dollar amounts, dates, and section names from the estimate.
- Do not suggest adding items that are clearly not relevant to this event type.

Return ONLY the JSON array. No markdown formatting, no explanation, no preamble.
```

---

## Step 4: Frontend Integration

### New service file: `src/lib/ai-nudge-service.ts`

This follows the existing service layer pattern (like estimate-service.ts).

**Functions:**

`fetchNudges(estimateState: EstimateState): Promise<NudgeResponse>`
- POST to `${API_URL}/api/ai/nudges` with the serialized estimate state
- `API_URL` comes from `import.meta.env.VITE_API_URL`
- Handle errors gracefully — return empty nudges array on failure
- Include a loading/error state pattern consistent with other services

`dismissNudge(estimateId: string, nudgeId: string): Promise<void>`
- INSERT into `estimate_nudge_dismissals` table via Supabase
- Fields: estimate_id, nudge_id, dismissed_at, dismissed_by (user ID from useUser)

`getDismissedNudges(estimateId: string): Promise<string[]>`
- SELECT nudge_ids from `estimate_nudge_dismissals` where estimate_id matches
- Returns array of dismissed nudge IDs to filter out of the panel

### New Supabase table: estimate_nudge_dismissals

Create migration script at `scripts/add_nudge_dismissals_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS estimate_nudge_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  nudge_id TEXT NOT NULL,
  dismissed_by UUID REFERENCES profiles(id),
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(estimate_id, nudge_id)
);

ALTER TABLE estimate_nudge_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage nudge dismissals"
  ON estimate_nudge_dismissals
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### TypeScript types: `src/types/nudge.ts`

```typescript
export interface Nudge {
  id: string;
  type: 'staffing' | 'cost' | 'validation' | 'missing' | 'margin';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  suggested_action: string;
  rule_id: string;
}

export interface NudgeResponse {
  nudges: Nudge[];
  cached: boolean;
  generated_at: string;
  error?: string;
}
```

### Wire into Estimate Builder page

Modify `src/pages/EstimateBuilderPage.tsx` (or the Intelligence panel component — read the actual file structure first to identify the right component):

1. **On page load and after meaningful changes**, call `fetchNudges()` with the serialized estimate state. "Meaningful changes" = adding/removing line items, changing rates, modifying schedule entries, switching segments. NOT typing in text fields like event name or notes.

2. **Debounce:** Use a 5-second debounce timer. When a meaningful change fires, reset the timer. Only call the API when the timer expires. This prevents rapid-fire API calls during bulk edits.

3. **Auto-refresh toggle:** Add a small toggle icon in the Intelligence panel header. When toggled off, nudges only refresh on manual click of a refresh button. Persist the toggle preference in localStorage. Default: on.

4. **Loading state:** While waiting for the API response, show a subtle skeleton/shimmer in the nudge card areas. Do not block the estimate editing — this is fully async.

5. **Render nudge cards:** Replace the hardcoded placeholder cards with live nudge data. Map each nudge to a card using the existing card styling. Color-code by type:
   - `staffing` — blue/indigo
   - `cost` — amber/orange
   - `validation` — green
   - `missing` — purple
   - `margin` — red/rose

6. **Severity indicators:** `critical` nudges get a solid left border and bolder styling. `warning` gets a standard card. `info` gets a muted/lighter card.

7. **Dismiss button:** Each nudge card gets a small X button. Clicking it calls `dismissNudge()` and removes the card from the panel. Dismissed nudges do not reappear for this estimate (filtered by the dismissed list on next fetch).

8. **Empty state:** If the API returns zero nudges (and no error), show a green checkmark card: "Estimate looks good. No issues detected."

9. **Error state:** If the API returns an error, show a muted card: "Intelligence temporarily unavailable. Click to retry." with a retry button.

10. **Chat input stays as placeholder.** Do not wire it up. Keep the existing "Ask about this estimate..." input as non-functional. It gets activated in Phase 3.

---

## Step 5: Environment & Deployment

### Local development

Add to the project root `.env` (or `.env.local`):

```
VITE_API_URL=http://localhost:8000
```

Add to `/api/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
FRONTEND_URL=http://localhost:5173
```

### Running locally

Terminal 1 (frontend): `npm run dev`
Terminal 2 (backend): `cd api && uvicorn main:app --reload --port 8000`

### Render deployment

The FastAPI backend deploys as a separate Render web service:

- **Name:** driveshop-api
- **Type:** Web Service
- **Build Command:** `cd api && pip install -r requirements.txt`
- **Start Command:** `cd api && uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:** ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY, FRONTEND_URL

Update the frontend's Render environment to add `VITE_API_URL` pointing to the backend service URL.

---

## Step 6: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log
Add row: `Wk 9-10 | AI Intelligence Phase 1: FastAPI backend, Claude API integration, nudge rules engine, live Intelligence panel | Historical data pipeline | AI nudges live`

### Known Issues
- Remove "FastAPI backend not yet added" from Known Issues
- Add: "Historical event data (988 bid-vs-actual records) not yet migrated to Supabase — lives in enriched_master_index.json"
- Add: "Nudge rules are starter set — expand based on Dave/Tatiana feedback"

### Tech Stack
- Update "Backend: Python + FastAPI (to be added)" → "Backend: Python + FastAPI (/api directory)"

### Environment Variables
Add:
| VITE_API_URL | FastAPI backend URL |
| ANTHROPIC_API_KEY | Claude API key (server-side, in /api/.env) |
| SUPABASE_SERVICE_KEY | Supabase service role key (server-side, in /api/.env) |

### Conventions
Add: "AI nudge rules defined in api/prompts/nudge_rules.md. Edit rules in plain English — no code changes needed."
Add: "All Claude API calls route through FastAPI backend. Never call Anthropic API from the frontend."

### Key Service Layers
Add: `ai-nudge-service.ts` — Frontend service for fetching nudges from FastAPI and managing dismissals

---

## What NOT to Build

- Do not build Mode 2 (chat functionality). The chat input stays as a visual placeholder.
- Do not build Mode 3 (AI Scoping → Estimate bridge). That's a separate blueprint.
- Do not build historical data ingestion or event type tagging. That's Phase 2 blueprint.
- Do not query historical_estimates/ directory or enriched_master_index.json. Phase 1 nudges are rule-based only.
- Do not create a new Intelligence panel component from scratch. Wire into what exists.
- Do not remove or redesign the existing panel layout. Preserve the current UI skeleton.
- Do not add any AI-related environment variables to the frontend bundle. All AI calls go through FastAPI.

---

## Build Order

1. **Step 1** — FastAPI backend: /api directory, main.py, routes, services. Get the health check working first. Then wire the Claude API call. Test with curl/Postman before touching the frontend.
2. **Step 2** — Nudge rules document. Drop it in api/prompts/. This is just a file — no code.
3. **Step 3** — System prompt template. Same — just a file.
4. **Step 4** — Frontend integration. Create the service, types, migration. Wire the existing panel to the live endpoint. Test with a real estimate.
5. **Step 5** — Environment and deployment config.
6. **Step 6** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1. Show me main.py and the route before proceeding.
