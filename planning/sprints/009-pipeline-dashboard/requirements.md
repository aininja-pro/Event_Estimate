# Requirements: Pipeline Dashboard — Event Estimate Engine

## Problem

Derek has no single view showing the health of DriveShop's estimating pipeline. To understand "how much is in pipeline, how much is active, what's been invoiced this quarter," he has to manually scan the Estimates list page and add up numbers in his head. The SOW calls for a "pipeline dashboard with real-time forecast data" — a summary view that rolls up estimate data by status, client, and time period.

## Cost of Status Quo

- No executive-level visibility into the pipeline without opening individual estimates
- Can't quickly answer "what's our total active event value right now?"
- No trending or forecasting — just a list of estimates
- The Estimates list page is a production tool for estimators, not a strategic tool for leadership

## Who This Is For

- **Primary user:** Derek (CEO) — wants to open one page and see the pipeline health
- **Secondary users:** Tatiana (CFO) — revenue forecasting. Account Managers — their client's pipeline.
- **Not for:** Dan, Tim (they use the Estimates list for daily work)

## Proposal

A dedicated dashboard page with summary cards, status breakdown, client breakdown, and a simple timeline chart. Reads from existing estimate data — no new tables or backend work needed. Purely a frontend view over data that already exists in Supabase.

## Success Criteria

- Dashboard page loads in under 2 seconds
- Summary cards show: total pipeline value, total active value, total in recap, total invoiced (this quarter)
- Status breakdown shows estimate count and total revenue per status
- Client breakdown shows total revenue per client across all active statuses
- A simple timeline or bar chart shows monthly estimate volume
- Dashboard auto-refreshes when estimates change (or on page load)

## Scope

### Included (This Blueprint)

**Summary cards row:**
- Total Pipeline: count + dollar value of estimates in pipeline/estimate/in_review status
- Total Active: count + dollar value of active estimates
- In Recap: count + dollar value
- Invoiced (this quarter): count + dollar value

**Status breakdown table/chart:**
- All statuses: Pipeline, Estimate, In Review, Active, Recap, Invoiced, Complete, Lost, Cancelled
- Count of estimates per status
- Total revenue per status
- Bar chart or horizontal bars for visual weight

**Client breakdown:**
- Top clients by total active revenue
- Click a client to filter the view

**Monthly volume chart:**
- Recharts bar chart showing estimates created per month (last 6-12 months)
- Optionally stacked by status

**Navigation:**
- New page at `/dashboard`
- Add to sidebar under Production section (above Estimates)
- Make it the default landing page after login (or keep Estimates as default — ask Derek)

### Not Included

- Real-time Supabase subscriptions (dashboard refreshes on page load, not live WebSocket updates)
- PowerBI data feed (deferred — the dashboard covers the core need)
- Forecast projections (e.g., "based on pipeline conversion rates, expect $X invoiced next month")
- Per-estimator performance metrics
- Drill-down into individual estimates from the dashboard (link to Estimates list with filter applied)

## Dependencies

- **Estimate data in Supabase** — all data exists ✅
- **Recharts** — already in the project for charting ✅
- **No backend work** — all queries go through existing Supabase client on the frontend

## Inputs

- **Supabase queries:** estimates joined with clients and labor_logs (for status), aggregated by status, client, and created_at month

## Outputs

- **Dashboard page** with summary cards, status breakdown, client breakdown, and monthly chart
- **Sidebar link** under Production section

## Constraints

- Keep it simple. This is a 1-2 day build, not a BI tool. Summary cards + one or two charts + a breakdown table.
- Use existing Recharts library for any charts. No new chart dependencies.
- Follow existing page conventions: same text sizing, same card patterns, same layout structure.
- Queries should be efficient — aggregate in the database where possible, not pulling all estimates and computing in JS.

## Resolved Decisions

- **Separate page, not embedded in Estimates list.** The dashboard is a strategic view. The Estimates list is a production tool. Different audiences.
- **Frontend-only queries.** No new FastAPI endpoints needed. Supabase client queries with aggregation.
- **Recharts for charting.** Already in the project, no new dependencies.
- **Simple is better.** Four summary cards, one status table, one client table, one chart. If Derek wants more, we iterate.

## Open Questions

*None — all resolved.*
