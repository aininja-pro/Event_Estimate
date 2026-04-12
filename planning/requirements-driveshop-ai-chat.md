# Requirements: AI Chat Assistant & Scoping Bridge — Event Estimate Engine

## Problem

The AI Intelligence panel delivers passive nudges — it watches and warns. But estimators still can't ask questions. When Dan is building a Mazda ride-and-drive and wants to know "what did we charge for chauffeurs on the last LA event?" he has to dig through spreadsheets or ask someone who remembers. When an account manager gets a new event request and wants to start from a similar past event, there's no way to go from "I need something like what we did last year" to a pre-populated estimate in the system.

The AI backbone is built — FastAPI backend, Claude API integration, 988 historical events in Supabase, pre-computed patterns. Modes 2 and 3 are new endpoints with different prompts through the same pipe.

## Cost of Status Quo

- Estimators can't query institutional knowledge — "what did we spend?" requires tribal memory or spreadsheet archaeology
- Starting a new estimate from scratch every time, even when a similar event was done 3 months ago
- The AI Scoping Assistant page generates scope text but it dead-ends — no bridge to the Estimate Builder
- Historical data sits in Supabase unused except by the nudge pipeline

## Who This Is For

- **Primary users (Mode 2):** Dan, Tim (Production Managers) — asking questions while building estimates. Dave (Operations) — querying historical patterns for planning.
- **Primary users (Mode 3):** Account Managers — generating initial scope estimates from client briefs and creating a real estimate draft in one step.
- **Stakeholders:** Derek (CEO) — "type what you want and the estimate builds itself" is the story he's been selling since Phase 1.

## Proposal

### Mode 2 — Chat Assistant (Suggest Only)

Wire the existing "Ask about this estimate..." input in the Intelligence panel to a conversational Claude endpoint. The chat reads the current estimate state AND the historical event data and responds to natural language questions. It suggests actions but does not execute them — the user makes changes manually.

Conversation history persists within the session and clears when the panel is closed.

### Mode 3 — Scoping Bridge

Connect the existing AI Scoping Assistant page to the Estimate Builder. When the AI generates a scope recommendation, a "Create Estimate" button creates a real estimate in Supabase with all sections pre-populated — labor entries, production, travel, creative, logistics, and fees — then navigates to the Estimate Builder for refinement.

## Success Criteria

### Mode 2
- Chat input in the Intelligence panel accepts natural language and returns conversational responses within 5 seconds
- Can answer questions about the current estimate ("what's my GP on this?", "am I missing anything?")
- Can answer questions about historical events ("what did we spend on the Genesis Miami event?", "what's the average logistics cost for Mazda Ride & Drives?")
- Can recommend roles, rates, and staffing based on historical patterns ("what should I staff for a 3-day Volvo static display?")
- Conversation history maintained within the session — follow-up questions work ("what about the one before that?")
- Responses reference real data — event names, dollar amounts, role names from the database
- Does not modify the estimate — suggests only

### Mode 3
- "Create Estimate" button on the AI Scoping output creates a real estimate in Supabase
- Estimate is pre-populated with labor entries, line items across all relevant sections, and event header data
- User is navigated to the Estimate Builder where they can review and adjust
- Pre-populated entries use real rate card data for the selected client (not AI-invented rates)

## Scope

### Included (This Blueprint)

**Mode 2:**
- New FastAPI endpoint: `POST /api/ai/chat`
- Chat system prompt with access to current estimate state, historical events, and historical patterns
- Conversation history passed in each request (frontend manages the message array)
- Frontend wiring: chat input sends messages, responses render as chat bubbles in the Intelligence panel below the nudge cards
- Streaming response (SSE) for real-time typing feel — or standard request/response if streaming adds too much complexity
- Supabase queries in the backend to search historical events by client, event type, location, and event name

**Mode 3:**
- New FastAPI endpoint: `POST /api/ai/scope-to-estimate`
- Takes the AI Scoping output (structured scope recommendation) and returns a structured estimate payload
- Frontend: "Create Estimate" button on the AI Scoping page that calls the endpoint, creates the estimate via estimate-service.ts, and navigates to `/estimates/:id`
- Rate card lookup — pre-populated labor entries use actual client rates, not AI-guessed rates
- Pre-populated line items mapped to fee_types with correct GL codes

### Not Included

- Execute mode for chat (AI modifying the estimate directly) — deferred to Phase 2.5
- Voice input for chat
- Chat history persistence across sessions (clears on panel close)
- Chat accessible outside the Estimate Builder (it's panel-only for now)
- AI Scoping page redesign — the existing page stays as-is, we just add the "Create Estimate" button

## Dependencies

- **FastAPI backend** — deployed and live on Render ✅
- **Historical events in Supabase** — 1,674 events migrated ✅
- **Historical patterns in Supabase** — 98 aggregated patterns ✅
- **AI Scoping Assistant page** — exists from Phase 1 demo ✅
- **Rate card data** — client rates in Supabase (rates exist, cost data still pending from Tatiana)
- **Estimate service layer** — createEstimate, createLaborLog, createLaborEntry, createLineItem all functional ✅

## Inputs

### Mode 2
- **User message:** Natural language question or request
- **Conversation history:** Array of previous messages in the session (role + content)
- **Current estimate state:** Same payload shape as the nudge endpoint (fetched fresh from Supabase)
- **Historical context:** Backend queries historical_events and historical_patterns based on the current estimate's client and event type

### Mode 3
- **AI Scoping output:** The structured scope recommendation text from the AI Scoping page
- **Client ID:** Selected client for rate card lookup
- **Event metadata:** Event name, type, location, dates, attendance from the scoping form

## Outputs

### Mode 2
- **Chat response:** Conversational text with specific data references (event names, dollar amounts, role names, dates)
- **No structured actions** — text only, user acts on suggestions manually

### Mode 3
- **Created estimate:** A new estimate record in Supabase with:
  - Event header populated (client, event name, type, location, dates, attendance)
  - Primary labor log with labor entries (roles matched to rate card items, quantities and days from scope)
  - Line items across sections (production, travel, creative, logistics) mapped to fee_types with GL codes
  - Agency fee auto-generated (existing createAutoFeeLines pattern)
- **Navigation:** Redirect to `/estimates/:id` after creation

## Constraints

- Chat responses must reference real data from Supabase — no hallucinated event names or dollar amounts
- Rate card lookup for Mode 3 must use actual client rates. If a role from the AI scope doesn't match a rate card item, flag it as a custom item rather than inventing a rate.
- Conversation history adds tokens on every message. Cap at 20 messages per session to keep costs reasonable. After 20, drop the oldest messages.
- Mode 3 pre-population should handle partial matches gracefully — if the AI recommends a role that doesn't exist in the client's rate card, skip it rather than creating a broken entry.
- The chat endpoint should not be significantly slower than the nudge endpoint. Target under 5 seconds for typical questions.

## Resolved Decisions

- **Suggest only for Mode 2.** Chat does not modify the estimate. Intelligence is the value, not automation. Execute mode deferred to Phase 2.5 based on usage patterns.
- **Full pre-population for Mode 3.** "Create Estimate" generates labor entries AND line items across all sections, not just a blank estimate with notes.
- **Conversation history within session.** Messages persist while the panel is open, clear when the panel closes or the user navigates away. No database persistence of chat history.
- **Streaming is optional.** If SSE streaming is straightforward with FastAPI + React, do it for the typing feel. If it adds significant complexity, standard request/response is acceptable.
- **Single blueprint for both modes.** They share the same backend infrastructure and can be built in sequence within one sprint.

## Open Questions

*None — all resolved.*
