# Blueprint: Fix Nudge Auto-Refresh (Surgical Bug Fix)

## What This Fixes

The Intelligence panel loads nudges on first open but does not update when estimate data changes. The root cause: `estimateStateForAI` is a `useMemo` that reads from in-memory state maps (`laborEntriesMap`, `lineItemsMap`, `scheduleEntriesMap`, `dayTypesMap`). Child components like ScheduleGrid write directly to Supabase, and the parent's state maps don't sync in time for the debounced refresh to see the changes.

## The Fix (One Concept)

**Stop reading from in-memory state. Re-fetch from Supabase on every nudge refresh.**

The database is always the source of truth. Every child component already writes there. Instead of trying to keep React state maps synchronized, the nudge fetch function queries Supabase directly for the current estimate state at the moment it fires. This eliminates all stale closure, stale state, and timing issues in one move.

## Prerequisites

Read these files before making changes:

- `CLAUDE.md` — project conventions
- `src/pages/EstimateBuilderPage.tsx` — the file being modified (all changes are here and in ai-nudge-service.ts)
- `src/lib/ai-nudge-service.ts` — the service that calls the FastAPI endpoint
- `src/lib/estimate-service.ts` — existing Supabase query functions to reuse

---

## Step 1: Add a fresh-fetch function to ai-nudge-service.ts

Add a new function to `src/lib/ai-nudge-service.ts` that queries Supabase for the complete estimate state and returns it in the exact shape the FastAPI endpoint expects.

### Function: `fetchFreshEstimateState(estimateId: string)`

This function does what `loadData` in EstimateBuilderPage does, but returns the AI payload shape instead of setting React state. It reuses existing service functions.

```
Import: getEstimate, getLaborLogs, getLaborEntries, getLineItemsByLocation from estimate-service
Import: getScheduleEntries, getScheduleDayTypes from schedule-service

async function fetchFreshEstimateState(estimateId: string):
  1. const estimate = await getEstimate(estimateId)
  2. const laborLogs = await getLaborLogs(estimateId)
  3. For each laborLog in parallel:
     - getLaborEntries(log.id)
     - getLineItemsByLocation(log.id)
     - getScheduleEntries(log.id)
     - getScheduleDayTypes(log.id)
  4. Compute totalRevenue, totalCost, grossProfit, gpPercent (same math as the existing useMemo on lines 2089-2103 of EstimateBuilderPage)
  5. Return the object in the same shape as the current estimateStateForAI (lines 2105-2158) — client_name, event_type, segments array with labor_entries/schedule_entries/line_items, summary totals
```

Export this function. It's ~40 lines of code. The serialization logic is copied from the existing `estimateStateForAI` useMemo — same field mapping, same structure.

---

## Step 2: Update triggerNudgeFetch in EstimateBuilderPage.tsx

Replace the current `triggerNudgeFetch` function (lines 2167-2184) with one that calls `fetchFreshEstimateState` instead of reading from `estimateStateRef.current`.

### Current (broken):
```typescript
const triggerNudgeFetch = useCallback(async (bypassCache = false) => {
  const currentState = estimateStateRef.current  // ← THIS IS STALE
  if (!currentState) return
  setAiLoading(true)
  setAiError(null)
  const payload = bypassCache
    ? { ...currentState, _refresh: Date.now() }
    : currentState
  const [response] = await Promise.all([
    fetchNudges(estimateId, payload),
    new Promise((r) => setTimeout(r, 800)),
  ])
  ...
}, [estimateId])
```

### New (fixed):
```typescript
const triggerNudgeFetch = useCallback(async (bypassCache = false) => {
  setAiLoading(true)
  setAiError(null)
  try {
    const freshState = await fetchFreshEstimateState(estimateId)  // ← ALWAYS FRESH
    if (!freshState) {
      setAiLoading(false)
      return
    }
    const payload = bypassCache
      ? { ...freshState, _refresh: Date.now() }
      : freshState
    const [response] = await Promise.all([
      fetchNudges(estimateId, payload),
      new Promise((r) => setTimeout(r, 800)),
    ])
    if (response.error) {
      setAiError(response.error)
    }
    setAiNudges(response.nudges.filter((n) => !dismissedRef.current.includes(n.id)))
  } catch (err) {
    setAiError('Failed to load estimate data for analysis')
  } finally {
    setAiLoading(false)
  }
}, [estimateId])
```

The key change: instead of `estimateStateRef.current` (stale React state), it calls `fetchFreshEstimateState(estimateId)` which queries Supabase directly. Always fresh. No closure issues. No stale state.

---

## Step 3: Simplify the auto-refresh trigger

The current auto-refresh effect (lines 2193-2199) watches `estimateStateForAI` for changes. This is fragile because `estimateStateForAI` depends on the same stale state maps. Replace it with a simpler approach: notify on data writes.

### Option A (simplest — recommended): Keep the existing debounce pattern but make it work

The existing effect at line 2193 already debounces on `estimateStateForAI` changes. With Step 2's fix, the `triggerNudgeFetch` call will fetch fresh data from Supabase regardless. So even if `estimateStateForAI` is slightly stale when the debounce fires, the actual API call gets fresh data.

The effect is now just a trigger mechanism — "something changed, wait 3 seconds, then fetch fresh." The staleness of what triggered it doesn't matter because the fetch itself always reads from Supabase.

**Important:** Change the debounce timer from 5000ms to 3000ms in the effect (line ~2197 in EstimateBuilderPage.tsx). The original 5-second delay was conservative to limit API costs. 3 seconds feels more responsive while still batching rapid edits.

**Keep the existing effect as-is.** It will now work correctly because `triggerNudgeFetch` no longer reads stale state.

### One small fix needed:

The `onDataChange` callback on ScheduleGrid (line 2587) already re-fetches and updates `scheduleEntriesMap`, `laborEntriesMap`, `dayTypesMap` for the active location. This triggers the `estimateStateForAI` useMemo to recompute, which triggers the debounce effect. This chain already exists — it just didn't matter before because `triggerNudgeFetch` read stale state. Now it works.

For the EventHeader fields (attendance, event type, location, etc.) — these call `handleUpdateEstimate` which updates `estimate` state directly. This also triggers `estimateStateForAI` recompute → debounce → fresh fetch. Already wired.

For line item changes — verify that `handleAddLineItems`, `handleUpdateLineItem`, `handleDeleteLineItem` update `lineItemsMap` state (they should based on the existing code pattern). If they do, `estimateStateForAI` recomputes → debounce triggers → fresh fetch works.

---

## Step 4: Remove stale-state workarounds

Clean up code that was trying to work around the stale state problem:

1. **Remove `estimateStateRef`** (line 2162-2163) — no longer needed since `triggerNudgeFetch` doesn't read from it.
2. **Remove `triggerRef`** (line 2187-2188) — no longer needed since the effect can reference `triggerNudgeFetch` directly (it's stable because its only dependency is `estimateId`).
3. **Simplify the debounce effect** (lines 2193-2199) — can reference `triggerNudgeFetch` directly instead of through `triggerRef.current`.
4. **Simplify the initial fetch effect** (lines 2201-2207) — same, reference directly.

This removes ~10 lines of ref-juggling that existed only to work around closure issues.

---

## Step 5: Test

1. Open an estimate. Open the Intelligence panel. Nudges should load (this already works).
2. Change the attendance field. Wait 3 seconds. Nudges should refresh and the "missing attendance" nudge should disappear.
3. Add a line item to Production. Wait 3 seconds. Nudges should refresh reflecting the new item.
4. On the Schedule tab, add hours for a staff member. Switch to another tab. Wait 3 seconds. Nudges should refresh.
5. Click the manual Refresh button. Nudges should fetch with the absolute latest data from Supabase.
6. Toggle auto-refresh off. Make changes. Verify nudges do NOT auto-refresh. Click manual refresh — should still work.

---

## What NOT to Do

- Do not restructure the component's data flow or state management. The fix is in how the nudge fetch gets its data, not in how the page manages state.
- Do not add a global event bus or React context for this. Overkill for the problem.
- Do not remove the `estimateStateForAI` useMemo — it's still used by the debounce trigger effect as a change-detection signal. It just no longer feeds the API call.
- Do not touch the AINudgePanel component. It renders whatever it receives — the fix is upstream.
- Do not touch the FastAPI backend. The backend is working correctly.

---

## Build Order

1. **Step 1** — Add `fetchFreshEstimateState` to `ai-nudge-service.ts`. Show me the function before proceeding.
2. **Step 2** — Replace `triggerNudgeFetch` in EstimateBuilderPage. Show me the diff.
3. **Step 3** — Verify the debounce trigger still fires correctly. No code changes expected — just confirm.
4. **Step 4** — Remove stale-state refs. Show me what was removed.
5. **Step 5** — Test all 6 scenarios. Report results.

Start with Step 1. Show me the `fetchFreshEstimateState` function before moving on.
