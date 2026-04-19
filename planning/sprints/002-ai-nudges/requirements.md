# Requirements: AI Intelligence Module — Event Estimate Engine

## Problem

DriveShop's estimate creation process relies entirely on tribal knowledge. When Dan builds an estimate for a Mazda ride-and-drive, he's working from memory — did he include travel days? Is that chauffeur rate within the MSA? Are logistics costs realistic for this market? Nobody catches mistakes until Tatiana reviews the final number or, worse, until the post-event recap reveals a margin blowout.

The system has 988 historical events with bid-vs-actual data, 55 normalized labor roles with rate ranges, and client-specific MSA rate cards already in the database. None of that institutional knowledge is surfaced to the person building the estimate.

## Cost of Status Quo

- Estimates missing common line items (travel days, insurance, per diem) caught late or not at all
- Rates entered outside MSA ranges without anyone noticing until invoicing
- No visibility into how current estimates compare to historical actuals for similar events
- Margin erosion from understaffing, logistics underestimation, and missing markup — Production and Logistics sections consistently come in over budget across 988 historical events
- Experienced estimators retiring or leaving takes institutional knowledge with them

## Who This Is For

- **Primary users:** Dan, Tim (Production Managers building estimates daily)
- **Stakeholders:** Tatiana (reviews estimates for financial accuracy), Dave (operations, owns workflow), Derek (CEO, wants margin protection and pipeline visibility)
- **Future users:** Account Managers building initial scopes, office-level estimators across DriveShop's regional offices

## Proposal

Add an AI intelligence layer to the existing Estimate Builder that watches the estimate as it's built and surfaces contextual nudges — staffing suggestions, cost alerts, validation warnings, missing item checks, and margin insights. The AI reads the current estimate state, the client's MSA rate card, and (in later phases) historical event data to provide real-time guidance without interrupting the user's workflow.

This is delivered in three modes across three phased blueprints:

- **Mode 1 — Passive Nudges (Phase 1):** Automated validation cards that fire as the user builds. Rule-based, powered by Claude API via a FastAPI backend. No user action required. The "TurboTax" experience.
- **Mode 2 — Conversational Assistant (Phase 3):** A collapsible chat panel where users type natural language queries — "do what we did last year in LA" or "what did we spend on logistics for the Genesis Miami event?" The AI searches historical data and can execute actions on the estimate.
- **Mode 3 — AI Scoping Bridge (Phase 3):** Connects the existing AI Scoping Assistant page to the Estimate Builder so a generated scope flows directly into a real estimate draft.

## Success Criteria

- Nudge panel renders in the Estimate Builder within 3 seconds of estimate changes
- Catches at least 5 categories of common errors: rate deviations, missing line items, staffing gaps, margin warnings, structural incompleteness
- Rules are defined in a plain-English markdown file — no code changes required to add, edit, or remove rules
- FastAPI backend established as the central AI service layer for all three modes
- Claude API integration is clean, cached where appropriate, and never exposes API keys to the frontend
- Users can dismiss individual nudges without them reappearing for that estimate
- Nudge severity levels (info, warning, critical) are visually distinct

## Scope

### Included (Phase 1 — Blueprint 1)

- FastAPI backend service with `/api/ai/nudges` endpoint
- Claude API integration via Python SDK
- Nudge rules document (`nudge_rules.md`) — plain English validation rules
- System prompt template (`nudge_system_prompt.md`) — assembled at runtime with rules + rate card + estimate state
- Wire existing Intelligence panel UI skeleton (already built — collapsible right-side panel with nudge card placeholders and "Ask about this estimate..." chat input) to the live FastAPI backend
- Five nudge card types: Staffing Suggestion, Cost Alert, Validation Warning, Missing Item, Margin Insight
- Panel toggle to enable/disable auto-refresh (for users who want heads-down mode)
- Debounced triggering — nudges refresh on meaningful estimate changes, not every keystroke
- Nudge dismissal per estimate (persisted to database)
- Rate card data injected into prompt context for client-specific validation
- Error handling for Claude API failures (graceful degradation — panel shows "unavailable" state)

### Included (Phase 2 — Blueprint 2)

- Historical data migration — move 988 bid-vs-actual events from `enriched_master_index.json` into Supabase tables
- Event type tagging (ride-and-drive, static display, chauffeur, fleet, tour)
- Section-level variance pattern computation (e.g., "Logistics averages +18% over bid for Mazda events")
- Enriched nudge context — "Based on 12 similar events, your logistics estimate is 40% below average"
- Confidence scoring on nudges based on comparable event count

### Included (Phase 3 — Blueprint 3)

- Mode 2: Conversational chat panel with natural language queries against historical data
- Mode 2: Action execution from chat — "add 4 chauffeurs for 3 days" modifies the estimate
- Mode 3: AI Scoping → Estimate Builder bridge — generated scope creates a real estimate draft
- Conversation history within an estimate session
- Tool-calling integration for Claude to query Supabase directly

### Not Included

- AI-generated client-facing documents (PDFs remain template-driven)
- Automatic estimate modification without user confirmation (AI suggests, human decides)
- Training on external market data (only DriveShop's historical data)
- Real-time collaboration features for the AI panel (single-user context)
- Voice interface

## Dependencies

- **Existing system:** Estimate Builder, Rate Card Engine, Schedule Grid, Labor Log — all functional in Supabase + React
- **Claude API:** Anthropic API key with access to claude-sonnet-4-20250514 or later
- **FastAPI:** Python 3.11+, uvicorn, httpx or anthropic Python SDK
- **Supabase:** Rate card tables, estimate tables, fee types — all populated with real client data
- **Client data:** Tatiana's cost rates (partially pending), Dave's workflow confirmation (complete)

## Inputs

- **Estimate state:** JSON serialization of the current estimate — event details, segments, labor log entries, schedule entries, line items, summary totals, client ID, corporate/office flag
- **Rate card data:** Client-specific rates from `client_rate_card_items` table — fee type, unit rate, markup %, MSA rate ranges
- **Nudge rules:** Plain-English markdown file defining validation rules, thresholds, and common patterns
- **System prompt template:** Markdown file with placeholders for rules, rate card, and estimate state

## Outputs

- **Nudge cards:** JSON array of objects with: `type` (staffing | cost | validation | missing | margin), `severity` (info | warning | critical), `title`, `message`, `suggested_action`, `rule_id`
- **Dismissed nudges:** Persisted to `estimate_nudge_dismissals` table so dismissed nudges don't reappear

## Constraints

- Claude API calls cost money — implement debouncing (minimum 5-second delay between calls) and consider caching responses for unchanged estimate states
- Nudge generation must not block the UI — async call with loading state
- API key must never be exposed to the frontend — all Claude calls route through FastAPI
- Rules document must be human-readable by non-technical stakeholders (Dave, Tatiana could review it)
- Response format from Claude must be structured JSON — use explicit formatting instructions in the system prompt to ensure parseable output
- FastAPI service needs to be deployable alongside the existing Vite/React frontend on Render

## Resolved Decisions

- **Caching strategy:** Hash the estimate state, cache nudge response per hash, expire after 5 minutes. Unchanged estimates serve cached nudges. Any change triggers a fresh Claude call.
- **Nudge frequency UX:** Auto-refresh with 5-second debounce after meaningful changes (line item add/edit, rate change, schedule change — not text field typing). Manual refresh button on panel header. Toggle to disable auto-refresh entirely.
- **Deployment topology:** FastAPI as a separate Render web service. Own URL, own environment variables (ANTHROPIC_API_KEY), independent deploys. React app calls via VITE_API_URL env var.
- **Historical data access:** The 988 events currently live in `enriched_master_index.json` (not in Supabase). Phase 2 blueprint will migrate this into Supabase tables. Phase 1 does not depend on historical data.
- **Rate card completeness:** Removed as a nudge type. Cost data is Tatiana's pending input and is an admin concern, not an estimation concern. Nudges focus on what the estimator controls.
- **Existing UI:** The Intelligence panel skeleton is already built in the Estimate Builder — collapsible right-side panel with five nudge card placeholders and a chat input. Phase 1 wires this to the real backend, not builds it from scratch.
