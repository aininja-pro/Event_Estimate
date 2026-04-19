# Blueprint: Pipeline Dashboard — Delivery Sprint

## What This Is

A dedicated dashboard page showing the health of DriveShop's estimating pipeline at a glance. Summary cards, status breakdown, client breakdown, monthly volume chart, and recent activity feed. Purely frontend — no backend work, no new tables. Reads from existing Supabase data via the frontend client.

## Prerequisites

Read these files before writing any code:

- `CLAUDE.md` — full project context, conventions
- `planning/requirements-driveshop-pipeline-dashboard.md` — full requirements
- `src/pages/EstimatesListPage.tsx` — understand how estimates are currently queried and displayed (pattern to follow)
- `src/pages/EstimateBuilderPage.tsx` — reference for the production aesthetic (card patterns, spacing, text sizing, color palette)
- `src/lib/estimate-service.ts` — existing getEstimates() query that joins clients and labor_logs
- `src/lib/system-settings-service.ts` — pattern for settings (for landing page preference)
- `src/components/ui/` — use existing shadcn/ui primitives (Card, Table, Badge, Button). Do NOT create custom components that duplicate what shadcn provides.

## Design Requirements

**This dashboard must match the high-end production aesthetic of the rest of the application.** It should feel like it belongs next to the Estimate Builder and Rate Card Management pages — polished, professional, enterprise-grade. Not a generic analytics template.

**Use shadcn/ui components throughout:**
- `Card` / `CardHeader` / `CardContent` for summary cards and panel containers
- `Table` / `TableHeader` / `TableBody` / `TableHead` / `TableRow` / `TableCell` for the client breakdown
- `Badge` for status indicators (reuse the same status badge colors used on the Estimates list page and SegmentStatusBadge)
- `Button` for any actions (refresh, settings)

**Follow the established conventions from CLAUDE.md:**
- text-[13px] for body text
- text-[10px] uppercase tracking-widest for section headers and labels
- High-contrast light-background color palette for badges and pills
- border border-border/50 rounded-md for card containers
- Subtle backgrounds: bg-slate-50 or bg-muted/5 for card interiors
- Muted foreground for secondary text: text-muted-foreground
- No bold colors or heavy visual weight — the app uses a restrained, professional palette

**Recharts styling:**
- Match the existing charts in the app (check if any Recharts charts exist in the Discovery Intelligence pages for color/style reference)
- Use the same slate/zinc/indigo palette as the rest of the app
- Grid lines subtle (stroke="#f0f0f0")
- Axis labels text-[10px] text-muted-foreground
- Tooltips clean and minimal
- No 3D effects, no gradients, no heavy borders on bars

**Spacing and layout:**
- Consistent gap between sections (gap-4 or gap-6)
- Summary cards in a 4-column grid on desktop, 2-column on smaller screens
- Side-by-side panels use flex with gap, not cramped
- Plenty of whitespace — this is an executive view, not a dense data table

**The page should feel like opening a Bloomberg terminal for DriveShop's pipeline — clean, information-dense but not cluttered, with every pixel earning its place.**

---

## Step 1: Dashboard Page + Routing

### Create `src/pages/DashboardPage.tsx`

New page component. Follow existing page conventions: same text sizing (text-[13px] body, text-[10px] uppercase headers), same card patterns, same layout structure.

### Routing

Add to App.tsx:
- `/dashboard` → DashboardPage

### Sidebar

Add "Dashboard" to the Production section in the sidebar, ABOVE "Estimates":
```
Production
  📊 Dashboard          ← NEW (first item)
  📋 Estimates
  💰 Rate Cards
  🤖 AI Scoping
```

Use lucide `LayoutDashboard` or `BarChart3` icon.

### Landing page setting

Add a new system setting: `default_landing_page` with values `'dashboard'` or `'estimates'`. Default to `'estimates'` (don't change existing behavior without the user opting in).

In the app's root route handler or AppLayout, check this setting on login redirect. If `'dashboard'`, redirect to `/dashboard`. If `'estimates'`, redirect to `/estimates` (current behavior).

Add this option to the Admin Settings page (if it exists) or as a small toggle on the Dashboard page itself: "Set as default landing page" link.

Show me the empty page rendering with the sidebar link before proceeding.

---

## Step 2: Data Queries

### Create `src/lib/dashboard-service.ts`

This service queries Supabase and returns aggregated data for the dashboard. All queries use the existing Supabase client.

**`getDashboardSummary() → DashboardData`**

Single function that runs all queries in parallel and returns the full dashboard state:

```typescript
interface DashboardData {
  summary: {
    pipeline: { count: number; total_revenue: number }
    active: { count: number; total_revenue: number }
    in_recap: { count: number; total_revenue: number }
    invoiced_this_quarter: { count: number; total_revenue: number }
  }
  status_breakdown: Array<{ status: string; count: number; total_revenue: number }>
  client_breakdown: Array<{ client_name: string; count: number; total_revenue: number }>
  monthly_volume: Array<{ month: string; count: number; total_revenue: number }>
  recent_activity: Array<{ estimate_name: string; client_name: string; from_status: string; to_status: string; changed_at: string; changed_by: string }>
}
```

**Queries:**

1. **Summary cards** — Query estimates joined with clients. Group by computed status:
   - Pipeline = estimates where ANY labor_log has status in ('pipeline', 'estimate', 'in_review')
   - Active = estimates where ANY labor_log has status 'active'
   - In Recap = estimates where ANY labor_log has status 'recap'
   - Invoiced this quarter = estimates where ANY labor_log has status 'invoiced' AND the estimate's updated_at is within the current quarter

   For revenue, sum estimate-level totals. If estimates don't store a total_revenue field directly, compute from labor_entries and line_items (or use a simpler proxy — sum of labor entry revenues + line item revenues for each estimate). Check what data is available before choosing the approach. If computing per-estimate revenue is too expensive for the dashboard, consider adding a `cached_total_revenue` column to estimates that updates on save — but only if performance is actually a problem. Start simple.

2. **Status breakdown** — Query labor_logs grouped by status, count distinct estimate_ids, sum revenue. Include all statuses: pipeline, estimate, in_review, active, recap, invoiced, complete, lost, cancelled.

3. **Client breakdown** — Query estimates joined with clients, filter to active statuses (pipeline, estimate, in_review, active), group by client name, sum revenue. Return top 8 clients sorted by revenue descending.

4. **Monthly volume** — Query estimates grouped by `created_at` month for the last 12 months. Count and sum revenue per month. Format month as "Jan 2026", "Feb 2026", etc.

5. **Recent activity** — Query `status_transitions` table (if it exists) or `estimate_versions` ordered by created_at descending, limit 10. Join with estimates and clients for names. Show the most recent status changes across all estimates.

Show me the data returned for the current database before building UI.

---

## Step 3: Summary Cards Row

Top of the dashboard page. Four cards in a row.

### Card design:

Each card shows:
- Status label (uppercase, small, muted — "PIPELINE", "ACTIVE", "IN RECAP", "INVOICED Q2 2026")
- Dollar amount (large, bold — "$380,000")
- Estimate count (small, muted — "12 estimates")
- Subtle color accent per card: Pipeline = blue, Active = green, Recap = amber, Invoiced = slate

### Layout:

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PIPELINE    │ │   ACTIVE     │ │  IN RECAP    │ │ INVOICED Q2  │
│  $380,000    │ │  $520,000    │ │  $180,000    │ │  $640,000    │
│  12 estimates│ │  8 events    │ │  4 events    │ │  18 events   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

Use the same card pattern as elsewhere in the app — `border border-border/50 rounded-md`. Clean, not flashy.

---

## Step 4: Status Breakdown + Client Breakdown (side by side)

Two panels below the summary cards, side by side (50/50 or 60/40 split).

### Left: Status Breakdown

A horizontal bar chart (Recharts `BarChart` with `layout="vertical"`) showing all statuses:

- Y-axis: status names (Pipeline, Estimate, In Review, Active, Recap, Invoiced, Complete, Lost, Cancelled)
- X-axis: dollar value
- Each bar labeled with count and dollar amount
- Color-code bars by status (reuse the same color palette as status badges elsewhere in the app)
- Skip statuses with zero estimates

### Right: Client Breakdown

A simple table (not a chart) showing top clients:

| Client | Active Estimates | Revenue |
|--------|-----------------|---------|
| Mazda | 4 | $180,000 |
| Volvo | 3 | $120,000 |
| Genesis | 2 | $95,000 |
| VW | 2 | $72,000 |
| JLR | 1 | $45,000 |

Sorted by revenue descending. Top 8 clients. Clean table, no borders, same text sizing as the rest of the app.

---

## Step 5: Monthly Volume Chart + Recent Activity (side by side or stacked)

### Left (or top): Monthly Volume

A Recharts `BarChart` showing estimate count per month for the last 12 months.

- X-axis: months (Jan, Feb, Mar...)
- Y-axis: count of estimates created
- Bar color: consistent blue/indigo
- Hover tooltip: "March 2026: 14 estimates, $280K total"
- Simple, clean, no stacking needed for v1

### Right (or bottom): Recent Activity Feed

A compact list of the last 10 status changes:

```
Mazda CX-90 Ride & Drive → Active                    2 hours ago
Volvo Static Display → Submitted for Review           Yesterday
Genesis Launch Event → Recap                          2 days ago
VW Family Day → Invoiced                              3 days ago
```

Each row shows:
- Event name (truncated if long)
- Arrow + new status (with status badge color)
- Relative time ("2 hours ago", "Yesterday", "Mar 28")
- Click the row → navigate to `/estimates/:id`

---

## Step 6: Loading + Empty States

### Loading state:
Skeleton shimmer on all cards and charts while data loads. Same pattern used elsewhere in the app.

### Empty state:
If no estimates exist at all, show a centered message: "No estimates yet. Create your first estimate to see pipeline data here." with a link to the AI Scoping page or Estimates list.

### Error state:
If Supabase query fails, show a muted error card: "Dashboard data temporarily unavailable. Try refreshing." with a retry button.

---

## Step 7: CLAUDE.md Updates

After completing the build, update CLAUDE.md:

### Session Log
Add row: `Wk 12 | Pipeline Dashboard: summary cards, status/client breakdown, monthly volume chart, recent activity feed, configurable landing page | QA + Intacct | Dashboard complete`

### Phase 2 Build Plan
Update: `Delivery | 12 | Intacct, pipeline dashboard, QA | In Progress` (dashboard done, Intacct blocked, QA remaining)

### Key Service Layers
Add: `dashboard-service.ts` — Aggregated pipeline queries for dashboard

### Supabase Tables
No new tables.

---

## What NOT to Build

- Do not build PowerBI integration. The dashboard IS the real-time view. PowerBI is a future enhancement if Derek needs external reporting.
- Do not build real-time Supabase subscriptions. Dashboard refreshes on page load. Add a manual refresh button if desired.
- Do not build drill-down from dashboard into individual estimates. Clicking an activity row navigates to the estimate — that's sufficient.
- Do not build forecast projections or conversion rate calculations. Simple actuals only.
- Do not build per-user or per-estimator performance metrics. This is a pipeline view, not a people review.
- Do not over-design. Four cards, two panels, one chart, one activity feed. If it takes more than 1-2 days, you're overbuilding.

---

## Build Order

1. **Step 1** — Dashboard page + routing + sidebar link. Show me the empty page rendering.
2. **Step 2** — Data queries. Show me the raw data returned for the current database.
3. **Step 3** — Summary cards. Show me the four cards with real numbers.
4. **Step 4** — Status breakdown chart + client table. Show me both panels.
5. **Step 5** — Monthly volume chart + recent activity feed.
6. **Step 6** — Loading and empty states.
7. **Step 7** — Update CLAUDE.md.

Show me each step's output before moving to the next. Start with Step 1. Do not skip ahead.
