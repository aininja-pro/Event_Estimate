# Blueprint: Estimate Duplication & Historical Event Search

## What This Is

Two features: (1) a "Duplicate" option on the Estimates list that deep-copies an entire estimate, and (2) a "From History" tab on the AI Scoping page that lets users search historical events and use them as templates for new AI-generated estimates.

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context, conventions
- `planning/requirements-driveshop-duplicate-history.md` — full requirements
- `src/pages/EstimatesListPage.tsx` — where the duplicate action lives (find the existing three-dot menu or row actions)
- `src/pages/AIScopingPage.tsx` — where the "From History" tab will be added
- `src/lib/estimate-service.ts` — createEstimate, createLaborLog, createLaborEntry, createLineItem, createAutoFeeLines
- `src/lib/schedule-service.ts` — getScheduleEntries, getScheduleDayTypes, and any create functions for schedule data

---

## Step 1: Duplicate Estimate — Service Function

### Add to `src/lib/estimate-service.ts`:

**`duplicateEstimate(estimateId: string, userId: string) → { newEstimateId: string }`**

This function deep-copies an entire estimate. Logic:

1. Fetch the source estimate via `getEstimate(estimateId)`
2. Create a new estimate with:
   - All header fields copied (client_id, event_type, location, start_date, end_date, expected_attendance, cost_structure, duration_days, po_number, project_id)
   - `event_name`: `"Copy of {original name}"`
   - `status`: removed or not set (the labor_log status will be 'pipeline')
   - New UUID auto-generated
3. Fetch all labor_logs for the source estimate via `getLaborLogs(estimateId)`
4. For each labor log:
   a. Create a new labor log on the new estimate (copy location_name, is_primary, location_order, start_date, end_date, status='pipeline')
   b. Fetch labor entries via `getLaborEntries(logId)` → create copies on the new labor log (copy role_name, rate_card_item_id, gl_code, quantity, days, unit_rate, cost_rate, resource_type, display_order, fee_type_id). Clear person_name (names are specific to the original event).
   c. Fetch line items via `getLineItemsByLocation(logId)` → create copies on the new estimate + new labor log. Copy all fields. Skip `is_auto_generated=true` items (agency fee will be re-generated).
   d. Fetch schedule entries via `getScheduleEntries(logId)` → for each entry:
      - Create new schedule entry on the new labor log (copy role_name, day_rate, cost_rate, resource_type, display_order). Clear person_name.
      - Fetch day entries for this schedule entry → create copies on the new schedule entry (copy work_date, hours)
   e. Fetch day types via `getScheduleDayTypes(logId)` → create copies on the new labor log (copy work_date, day_type)
5. Auto-generate agency fee via `createAutoFeeLines()` if the client has an agency fee
6. Return the new estimate ID

**Important:**
- Clear all person_name fields (the duplicate is a new event with different staff)
- Skip auto-generated fee lines (agency fee re-generates fresh)
- All new records get fresh UUIDs
- No version history, no approvals, no recap data copied — clean slate

Show me the function before proceeding.

---

## Step 2: Duplicate Estimate — UI

### Modify `src/pages/EstimatesListPage.tsx`:

Find the existing row actions (three-dot menu, or however the list currently handles delete/archive). Add a "Duplicate" option.

**UI:**
- Menu item: "Duplicate" with a lucide `Copy` icon
- On click: show a brief loading state ("Duplicating...")
- Call `duplicateEstimate(estimateId, userId)`
- On success: navigate to `/estimates/${newEstimateId}` — user lands in the new estimate ready to edit
- On error: show a toast or inline error

**Keep it simple.** One menu item, one click, navigate to the result.

Show me the menu with the new option before proceeding.

---

## Step 3: Historical Event Search — Backend Query

### Add to `src/lib/dashboard-service.ts` (or create `src/lib/historical-service.ts`):

**`searchHistoricalEvents(params) → HistoricalEventSummary[]`**

```typescript
interface HistoricalSearchParams {
  query?: string          // text search across event_name, client, location
  client?: string         // filter by client name
  event_type?: string     // filter by event type
  limit?: number          // default 20
}

interface HistoricalEventSummary {
  id: string
  filename: string
  client: string
  event_name: string
  event_type: string
  location: string | null
  grand_total: number | null
  initial_estimate_amount: number | null
  final_invoice_amount: number | null
  has_recap_data: boolean
  sections: Array<{
    canonical_name: string
    bid_total: number
    recap_total: number
  }>
  labor_roles: Array<{
    role: string
    unit_rate: number
    gl_code: string | null
  }>
}
```

**Query logic:**

1. Start with `supabase.from('historical_events').select('*')`
2. If `query` provided: use `.or()` with `ilike` across event_name, client, and location — e.g., `.or(`event_name.ilike.%${query}%,client.ilike.%${query}%,location.ilike.%${query}%`)`
3. If `client` provided: `.eq('client', client)`
4. If `event_type` provided: `.eq('event_type', event_type)`
5. Order by `grand_total` descending (biggest events first — most useful as templates)
6. Limit to 20 results
7. Map to `HistoricalEventSummary` type

Also add:

**`getDistinctHistoricalClients() → string[]`**
- Query distinct client values from historical_events for the filter dropdown

Show me the service function before proceeding.

---

## Step 4: Historical Event Search — UI on AI Scoping Page

### Modify `src/pages/AIScopingPage.tsx`:

Add a tab system at the top of the page:

```
┌─────────────────┬──────────────────┐
│  Generate New   │  From History    │
└─────────────────┴──────────────────┘
```

Use shadcn `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` — same pattern as the Estimate Builder tabs.

### "Generate New" tab:
Contains the existing AI Scoping form exactly as it is today. No changes.

### "From History" tab:

**Search bar row:**
- Text search input (placeholder: "Search events by name, client, or location...")
- Client dropdown filter (populated from `getDistinctHistoricalClients()`)
- Event type dropdown filter (same EVENT_TYPES constant used elsewhere)
- Search triggers on Enter key or 500ms debounce after typing stops

**Results table:**

| Event Name | Client | Type | Location | Total | Staff | Recap |
|---|---|---|---|---|---|---|
| CX-70 Launch Experience | Mazda | Ride & Drive | Los Angeles | $82,400 | 14 | ✓ |
| CX-50 SLP Drive | Mazda | Ride & Drive | Los Angeles | $68,200 | 11 | ✓ |
| Ioniq 6 Press Launch | Genesis | Press Event | New York | $124,000 | 22 | ✓ |

- Use shadcn Table component
- "Recap" column shows a small green check if has_recap_data is true (means we have actual data, not just estimates)
- Total formatted as currency
- Staff count = length of labor_roles array
- Sort by total descending by default

**Click a row to expand detail panel:**

Below the clicked row (or in a slide-down section), show:

**Section Breakdown:**
```
Onsite Event Labor    $34,600  (42.0%)  ████████████████
Travel Expenses       $12,400  (15.0%)  ██████
Production            $9,100   (11.0%)  ████
Logistics             $8,200   (10.0%)  ████
Creative              $4,900   (6.0%)   ██
Planning & Admin      $4,100   (5.0%)   ██
```

Simple horizontal bars showing section as % of total. Use the section bid_total values from the JSONB.

**Common Roles:**
```
Production Director, Event Manager, Product Specialist, Vehicle Handler (×6), 
Registration Host (×2), Per Diem
```

List the roles from the labor_roles array with quantities if multiple.

**Financial Summary:**
```
Estimated: $82,400  |  Actual: $79,100  |  Variance: +$3,300 (4.0% under budget)
```

Show if has_recap_data. Use grand_total vs final_invoice_amount.

**"Use as Template" button:**

Prominent button below the detail. On click:

1. Switch to the "Generate New" tab
2. Pre-fill the form fields:
   - Client: find the matching client in the clients dropdown by name. If no match (historical client not in system), leave empty and show a note: "Client '{name}' not found in system — select a client"
   - Event Type: set from historical event's event_type
   - Location: set from historical event's location (if available)
   - Event Name: leave empty (user names the new event)
   - In the description/notes textarea, auto-populate: "Based on historical event: {event_name} ({client}, {date}). Original total: ${grand_total}."
3. User reviews, adjusts, then clicks "Generate Scope Estimate" → "Create Estimate" as normal

The AI Scoping prompt already receives the client's rate card and historical patterns. The pre-filled parameters just give it a stronger starting point.

---

## Step 5: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log
Add row: `Wk 12 | Estimate Duplication + Historical Event Search: deep-copy from Estimates list, "From History" tab on AI Scoping with search/filter/template flow | QA polish | Duplicate & history complete`

### Key Service Layers
Add: `historical-service.ts` (if created separately) — Historical event search and filtering

### Conventions
Add: "Duplicate estimate clears person_name fields and skips auto-generated fee lines (agency fee re-generates fresh)."
Add: "Historical event search on AI Scoping page pre-fills the Generate New form — does not create estimates directly."

---

## What NOT to Build

- Do not build duplicate with modifications (duplicate then edit manually)
- Do not build batch duplicate
- Do not build a separate historical events management page
- Do not build editing of historical event records
- Do not create estimates directly from historical events — always route through the AI Scoping "Generate New" flow so the AI generates a proper scope matched to the current client's rate card
- Do not import historical event line items directly (the historical data is section-level aggregates, not line-item detail)

---

## Build Order

1. **Step 1** — Duplicate service function. Show me `duplicateEstimate` before proceeding.
2. **Step 2** — Duplicate UI on Estimates list. Show me the menu item and test a duplication.
3. **Step 3** — Historical search service. Show me search results for "Mazda ride and drive."
4. **Step 4** — From History tab on AI Scoping page. Show me the search, the detail expansion, and the "Use as Template" pre-fill flow.
5. **Step 5** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1. Do not skip ahead.
