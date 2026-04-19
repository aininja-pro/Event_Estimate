# Blueprint: AI Chat Assistant & Scoping Bridge — Phase 3 (Modes 2 & 3)

## What This Is

Wire the chat input in the Intelligence panel to a conversational Claude endpoint (Mode 2). Upgrade the existing AI Scoping Assistant page from demo to production and add a "Create Estimate" button that generates a fully pre-populated estimate in Supabase (Mode 3). Both modes share the existing FastAPI backend infrastructure.

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context, conventions, service layer patterns
- `planning/requirements-driveshop-ai-chat.md` — full requirements for both modes
- `api/services/ai_service.py` — existing nudge pipeline (pattern to follow)
- `api/prompts/nudge_system_prompt.md` — existing prompt pattern to follow
- `src/lib/ai-nudge-service.ts` — existing frontend AI service (extend this)
- `src/lib/estimate-service.ts` — createEstimate, createLaborLog, createLaborEntry, createLineItem functions
- `src/pages/EstimateBuilderPage.tsx` — the Intelligence panel with chat input (Mode 2 wires into this)
- Find the existing AI Scoping Assistant page in the codebase (likely in `src/pages/` under Discovery Intelligence section). Read it fully before making changes.

---

## Step 1: Mode 2 — FastAPI Chat Endpoint

### New endpoint: `POST /api/ai/chat`

Add to `api/routes/ai.py`:

**Request body:**
```json
{
  "estimate_id": "uuid",
  "message": "What did we spend on the last Mazda ride and drive in LA?",
  "conversation_history": [
    { "role": "user", "content": "previous question" },
    { "role": "assistant", "content": "previous answer" }
  ],
  "estimate_state": { ... }
}
```

The frontend sends the full conversation history with every request. Claude sees the entire thread and can handle follow-ups like "what about the one before that?"

The `estimate_state` is fetched fresh from Supabase using the existing `fetchFreshEstimateState()` pattern from ai-nudge-service.ts. Pass the estimate_id so the backend can also query Supabase for context if needed.

**Response body:**
```json
{
  "response": "The last Mazda Ride & Drive in LA was the CX-70 Launch Experience in March 2025. Total estimate was $82,400 with 14 staff over 4 days. Logistics was $12,600 (15.3% of total). Here's the breakdown by section...",
  "sources": ["CX-70 Launch Experience - March 2025", "CX-50 SLP Drive - January 2025"]
}
```

The `sources` field lists which historical events were referenced so the frontend can optionally display them.

### New service function: `api/services/ai_chat_service.py`

**`generate_chat_response(message, conversation_history, estimate_state, estimate_id) -> dict`**

1. Read a new system prompt template: `api/prompts/chat_system_prompt.md`
2. Query Supabase for the current estimate's client name and event type (from the estimate_state or by querying estimates + clients tables)
3. Query `historical_events` table for events matching the client (up to 20 most recent). This gives Claude specific events to reference.
4. Query `historical_patterns` table for the client × event_type row. This gives Claude aggregated averages.
5. Query the client's rate card items for rate validation questions.
6. Assemble the system prompt with: chat instructions, current estimate state, historical events summary, historical patterns, rate card data
7. Build the messages array: system prompt + conversation_history + new user message
8. Call Claude Sonnet with max_tokens 1500
9. Parse the response. Extract any event names referenced for the `sources` field.
10. Return { response, sources }

**Cap conversation history at 20 messages.** If the array exceeds 20, drop the oldest messages (keep the most recent 20). This prevents token costs from growing unbounded.

### New prompt: `api/prompts/chat_system_prompt.md`

```markdown
You are a conversational assistant for DriveShop's Event Estimate Engine. You help estimators build better estimates by answering questions about the current estimate and referencing historical event data.

You have access to:
1. The current estimate being built (event details, labor entries, schedule, line items, financials)
2. Historical events for this client (past estimates with bid and actual costs)
3. Aggregated patterns for this client × event type (averages, variances, common roles)
4. The client's MSA rate card (approved rates by role)

## Current Estimate
{estimate_state}

## Historical Events for {client_name}
{historical_events}

## Aggregated Patterns for {client_name} {event_type}
{historical_patterns}

## Client Rate Card
{rate_card_data}

## Guidelines
- Be conversational and concise. Answer in 2-4 sentences when possible.
- Always reference specific data — event names, dollar amounts, dates, role names. Never make up numbers.
- If asked about a specific past event, find the closest match in the historical events data. If no match, say so.
- If asked for recommendations, base them on the historical patterns and rate card. Explain your reasoning briefly.
- If asked about the current estimate, analyze what's there and give specific feedback.
- You can NOT modify the estimate. If the user asks you to add or change something, explain what they should do and where in the UI to do it.
- If you don't have enough data to answer, say so honestly rather than guessing.
- When referencing historical events, mention the event name and approximate date so the user can verify.
```

---

## Step 2: Mode 2 — Frontend Chat UI

### Modify the Intelligence panel in EstimateBuilderPage.tsx

The chat input already exists at the bottom of the AINudgePanel component (the `<Textarea placeholder="Ask about this estimate..." readOnly />` around line 271). Currently it's read-only. Wire it up:

**New state in EstimateBuilderContent:**
```typescript
const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
const [chatInput, setChatInput] = useState('')
const [chatLoading, setChatLoading] = useState(false)
```

**Chat send handler:**
1. User types a message and hits Enter or clicks the Send button
2. Add the user message to `chatMessages`
3. Set `chatLoading = true`
4. Call `fetchFreshEstimateState(estimateId)` to get current estimate data
5. Call a new function `sendChatMessage(estimateId, message, chatMessages, estimateState)` in ai-nudge-service.ts
6. On response, add the assistant message to `chatMessages`
7. Set `chatLoading = false`

**Chat UI changes to AINudgePanel:**
- Remove `readOnly` from the Textarea
- Add onChange handler for `chatInput`
- Add onKeyDown handler: Enter (without Shift) sends the message
- Wire the Send button onClick
- Below the nudge cards and above the chat input, render the conversation as chat bubbles:
  - User messages: right-aligned, subtle background
  - Assistant messages: left-aligned, no background, slightly different text style
  - Show a typing indicator (three dots or shimmer) when `chatLoading` is true
- Auto-scroll to the bottom when new messages appear
- The chat area should be scrollable independently from the nudge cards above

**Layout within the Intelligence panel:**
```
┌─────────────────────────┐
│ INTELLIGENCE header     │
│ [refresh] [auto] [close]│
├─────────────────────────┤
│ Nudge cards (scrollable)│
│  - Staffing suggestion  │
│  - Cost alert           │
│  - etc.                 │
├─────────────────────────┤
│ Chat messages           │
│  User: what did we...   │
│  AI: The last Mazda...  │
│  User: what about...    │
│  AI: That one was...    │
│  [typing indicator]     │
├─────────────────────────┤
│ [input] [send]          │
└─────────────────────────┘
```

The nudge cards and chat messages share the scrollable area — nudges at top, chat below. Or if that gets cluttered, add a subtle divider between them.

**Clear chat on panel close.** When `setAiPanelOpen(false)` fires, also `setChatMessages([])`.

**Props to pass to AINudgePanel:** Add `chatMessages`, `chatInput`, `chatLoading`, `onChatInputChange`, `onChatSend` to the component props.

### New function in ai-nudge-service.ts:

```typescript
export async function sendChatMessage(
  estimateId: string,
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  estimateState: Record<string, unknown>
): Promise<{ response: string; sources: string[] }>
```

POST to `${API_URL}/api/ai/chat` with the message, conversation history, estimate state, and estimate_id. Handle errors gracefully — return a friendly error message, not a crash.

---

## Step 3: Mode 3 — Upgrade AI Scoping Page

### Find and restyle the existing AI Scoping Assistant page.

The page exists somewhere in `src/pages/` — likely linked from the "Discovery Intelligence" sidebar section. Read it before making changes.

**Sidebar changes:**
- Move the AI Scoping Assistant link from "Discovery Intelligence" section to the **"Production"** section in the sidebar
- Rename it to "AI Scoping" or "New Estimate (AI)" — whatever fits naturally alongside "Estimates" and "Rate Cards"
- Keep the Discovery Intelligence section for the historical dashboard and rate analysis pages (those are read-only reference tools)

**Restyle the page to match production conventions:**
- Same text sizing: text-[13px] body, text-[10px] uppercase tracking-widest headers
- Same input styling: border-b underline inputs, not boxed inputs (match EventHeader pattern)
- Same card/container patterns: border border-border/50, rounded-md, subtle backgrounds
- Same button styling: consistent with other production pages
- Remove any Phase 1 demo branding or "proof of concept" language
- Keep the form fields: Client (dropdown from clients table), Event Type, Event Name, Location, Start Date, End Date, Attendance, Description (textarea)
- Keep the "Generate Scope" button and the output display area

**Do not change the AI generation logic.** The scope generation already works. We're just restyling the page and adding the bridge.

---

## Step 4: Mode 3 — "Create Estimate" Bridge

### Add the button

After the AI generates a scope and the output is displayed, show a prominent "Create Estimate" button. Only show it when there's a generated scope to work with. Style it as a primary action button — this is the money button.

### Backend endpoint: `POST /api/ai/scope-to-estimate`

Add to `api/routes/ai.py`:

**Request body:**
```json
{
  "client_id": "uuid",
  "event_name": "Mazda CX-90 Ride & Drive",
  "event_type": "Ride & Drive",
  "location": "San Diego",
  "start_date": "2026-05-15",
  "end_date": "2026-05-18",
  "attendance": "500-1,000",
  "cost_structure": "corporate",
  "scope_text": "The full AI-generated scope text...",
  "description": "The user's original event description"
}
```

**Response body:**
```json
{
  "labor_entries": [
    { "role_name": "Production Director/ hr", "fee_type_id": "uuid-or-null", "rate_card_item_id": "uuid-or-null", "gl_code": "4000.26", "quantity": 1, "days": 4, "unit_rate": 750, "resource_type": "external" },
    { "role_name": "Vehicle Handler/ hr", "fee_type_id": "uuid-or-null", "rate_card_item_id": "uuid-or-null", "gl_code": "4000.31", "quantity": 6, "days": 3, "unit_rate": 330, "resource_type": "external" }
  ],
  "line_items": [
    { "section": "travel", "item_name": "Hotels", "fee_type_id": "uuid-or-null", "gl_code": "4075.04", "quantity": 10, "unit_cost": 200, "markup_pct": 5 },
    { "section": "production", "item_name": "Vehicle Detailing", "fee_type_id": "uuid-or-null", "gl_code": "4025.08", "quantity": 8, "unit_cost": 150, "markup_pct": 5 },
    { "section": "access", "item_name": "General Liability Insurance", "fee_type_id": "uuid-or-null", "gl_code": "4075.01", "quantity": 1, "unit_cost": 2500, "markup_pct": 0 }
  ]
}
```

### Backend service: `api/services/ai_scope_service.py`

**`parse_scope_to_estimate(scope_text, client_id, event_type) -> dict`**

1. Query the client's rate card items joined with fee_types (same query as nudge service)
2. Send the scope text to Claude with a system prompt that says:
   - "Parse this event scope into structured labor entries and line items."
   - "Here is the client's rate card: {rate_card_data}"
   - "Match recommended roles to rate card items by name. Use the rate card's unit_rate, gl_code, and rate_card_item_id when there's a match."
   - "For items not in the rate card, include them with fee_type_id: null and rate_card_item_id: null — they'll be treated as custom items."
   - "Return ONLY valid JSON with labor_entries and line_items arrays."
   - Include the exact field schema in the prompt so Claude returns the right shape.
3. Parse Claude's response as JSON
4. For each labor entry, verify the rate_card_item_id actually exists in the client's rate card. If Claude hallucinated an ID, set it to null.
5. For each line item, verify the fee_type exists. If not, set fee_type_id to null.
6. Return the validated payload

### Frontend: Create Estimate flow

When the user clicks "Create Estimate":

1. Show a loading state on the button ("Creating estimate...")
2. Call `POST /api/ai/scope-to-estimate` with the form data and scope text
3. On response, use existing service functions to create everything:
   ```
   const estimate = await createEstimate({
     client_id, event_name, event_type, location,
     start_date, end_date, expected_attendance: attendance,
     cost_structure, status: 'pipeline'
   })
   
   const laborLog = await createLaborLog({
     estimate_id: estimate.id,
     location_name: location || 'Primary',
     is_primary: true
   })
   
   for (const entry of response.labor_entries) {
     await createLaborEntry({
       labor_log_id: laborLog.id,
       role_name: entry.role_name,
       rate_card_item_id: entry.rate_card_item_id,
       gl_code: entry.gl_code,
       quantity: entry.quantity,
       days: entry.days,
       unit_rate: entry.unit_rate,
       resource_type: entry.resource_type || 'external',
       display_order: index
     })
   }
   
   for (const item of response.line_items) {
     await createLineItem({
       estimate_id: estimate.id,
       labor_log_id: laborLog.id,
       section: item.section,
       item_name: item.item_name,
       gl_code: item.gl_code,
       rate_card_item_id: item.rate_card_item_id,
       quantity: item.quantity,
       unit_cost: item.unit_cost,
       markup_pct: item.markup_pct,
       display_order: index
     })
   }
   
   // Auto-generate agency fee if client has one
   await createAutoFeeLines(estimate.id, laborLog.id, client.agency_fee)
   ```
4. Navigate to `/estimates/${estimate.id}`

**Important:** The creation logic runs on the frontend using existing service functions — NOT in the FastAPI backend. The backend only parses the scope into structured data. The frontend creates the records in Supabase using the same service layer every other feature uses. This keeps the pattern consistent.

---

## Step 5: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log
Add row: `Wk 10-11 | AI Chat Assistant (Mode 2) + Scoping Bridge (Mode 3): conversational chat in Intelligence panel, AI Scoping page restyled and moved to Production, Create Estimate from scope | Outputs sprint | AI Intelligence phase complete`

### Phase 2 Build Plan
Update Intelligence row: `Intelligence | 9-10 | AI scoping, historical data | Complete`

### Known Issues
- Add: "Chat conversation history is session-only — clears on panel close. No persistence."
- Add: "Mode 3 scope-to-estimate matching is best-effort — roles not in the rate card are created as custom items."

### Key Service Layers
Add: `ai-chat-service.ts` (if created separately) or note the new functions added to `ai-nudge-service.ts`

### Conventions
Add: "Chat conversation history managed in frontend React state. Cleared on panel close. Max 20 messages per session."
Add: "AI Scoping page lives under Production section in sidebar, not Discovery Intelligence."

---

## What NOT to Build

- Do not build execute mode for the chat. Suggest only. No estimate modification from chat.
- Do not persist chat history to the database. Session-only, cleared on panel close.
- Do not redesign the AI Scoping page layout. Restyle to match production conventions but keep the same form and output structure.
- Do not build streaming/SSE unless it's straightforward. Standard request/response is acceptable for v1. If you can add streaming easily with FastAPI's StreamingResponse and the frontend can handle it, go for it — but don't let it block the feature.
- Do not build a separate chat page or modal. Chat lives in the Intelligence panel only.
- Do not modify the nudge pipeline. Mode 2 is a separate endpoint — nudges keep working exactly as they are.

---

## Build Order

1. **Step 1** — FastAPI chat endpoint + chat service + chat system prompt. Test with curl before touching the frontend. Send a sample question with estimate context and verify the response references real historical data.
2. **Step 2** — Frontend chat UI in the Intelligence panel. Wire the input, render messages, handle loading state. Test the full flow: type a question → see a response → ask a follow-up → conversation history works.
3. **Step 3** — Restyle the AI Scoping page. Move sidebar link to Production. Match production conventions. Do not change functionality.
4. **Step 4** — "Create Estimate" button + backend scope parser + frontend creation flow. Test: generate a scope → click Create Estimate → verify the estimate appears in the Estimates list with pre-populated data → open it in the Estimate Builder and verify entries are correct.
5. **Step 5** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1 — show me the chat endpoint and system prompt before proceeding. Do not skip ahead.
