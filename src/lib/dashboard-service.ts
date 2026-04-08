import { supabase } from './supabase'

// ---- Types ----

export interface DashboardData {
  summary: {
    pipeline: { count: number; total_revenue: number }
    active: { count: number; total_revenue: number }
    in_recap: { count: number; total_revenue: number }
    invoiced_this_quarter: { count: number; total_revenue: number }
  }
  status_breakdown: Array<{ status: string; count: number; total_revenue: number }>
  client_breakdown: Array<{ client_name: string; count: number; total_revenue: number }>
  monthly_volume: Array<{ month: string; count: number; total_revenue: number }>
  recent_activity: Array<{
    id: string
    estimate_id: string
    estimate_name: string
    client_name: string
    from_status: string | null
    to_status: string | null
    changed_at: string
    changed_by: string
  }>
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

// ---- Helpers ----

const PIPELINE_STATUSES = ['pipeline', 'estimate', 'in_review']
const ACTIVE_STATUSES = ['pipeline', 'estimate', 'in_review', 'active']
const ALL_STATUSES = ['pipeline', 'estimate', 'in_review', 'active', 'recap', 'invoiced', 'complete', 'lost', 'cancelled']

function getQuarterRange(): { start: string; end: string } {
  const now = new Date()
  const quarter = Math.floor(now.getMonth() / 3)
  const start = new Date(now.getFullYear(), quarter * 3, 1)
  const end = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59)
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// ---- Main Query ----

export async function getDashboardData(): Promise<DashboardData> {
  const db = requireSupabase()

  // Run all queries in parallel
  const [estimatesRes, versionsRes, activitiesRes] = await Promise.all([
    // 1. All estimates with clients and labor_logs
    db
      .from('estimates')
      .select('id, event_name, status, created_at, updated_at, clients(name), labor_logs(id, status)')
      .order('updated_at', { ascending: false }),

    // 2. Latest version per estimate (for revenue totals)
    // Fetch all versions ordered by version_number desc — we'll pick latest per estimate in JS
    db
      .from('estimate_versions')
      .select('estimate_id, snapshot_json, version_number')
      .order('version_number', { ascending: false }),

    // 3. Recent activity (status changes)
    db
      .from('segment_activities')
      .select('id, estimate_id, from_status, to_status, changed_by, created_at')
      .eq('action', 'status_change')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (estimatesRes.error) throw estimatesRes.error
  if (versionsRes.error) throw versionsRes.error
  if (activitiesRes.error) throw activitiesRes.error

  const estimates = estimatesRes.data || []
  const versions = versionsRes.data || []
  const activities = activitiesRes.data || []

  // Build revenue map: estimate_id → total_revenue (from latest version snapshot)
  const revenueMap = new Map<string, number>()
  for (const v of versions) {
    if (!revenueMap.has(v.estimate_id)) {
      const totals = (v.snapshot_json as { totals?: { total_revenue?: number } })?.totals
      revenueMap.set(v.estimate_id, totals?.total_revenue ?? 0)
    }
  }

  // Build estimate lookup for activity enrichment
  const estimateLookup = new Map<string, { event_name: string; client_name: string }>()
  for (const est of estimates) {
    const clientName = (est.clients as { name: string } | null)?.name ?? 'Unknown'
    estimateLookup.set(est.id, { event_name: est.event_name, client_name: clientName })
  }

  // ---- Compute summary cards ----
  const quarterRange = getQuarterRange()
  const summary = {
    pipeline: { count: 0, total_revenue: 0 },
    active: { count: 0, total_revenue: 0 },
    in_recap: { count: 0, total_revenue: 0 },
    invoiced_this_quarter: { count: 0, total_revenue: 0 },
  }

  // ---- Compute status breakdown ----
  const statusMap = new Map<string, { count: number; total_revenue: number }>()
  for (const s of ALL_STATUSES) {
    statusMap.set(s, { count: 0, total_revenue: 0 })
  }

  // ---- Compute client breakdown ----
  const clientMap = new Map<string, { count: number; total_revenue: number }>()

  // ---- Compute monthly volume ----
  const monthMap = new Map<string, { count: number; total_revenue: number }>()

  for (const est of estimates) {
    const status = est.status as string
    const revenue = revenueMap.get(est.id) ?? 0
    const clientName = (est.clients as { name: string } | null)?.name ?? 'Unknown'

    // Status breakdown
    const statusEntry = statusMap.get(status)
    if (statusEntry) {
      statusEntry.count += 1
      statusEntry.total_revenue += revenue
    }

    // Summary cards (based on estimate-level status)
    if (PIPELINE_STATUSES.includes(status)) {
      summary.pipeline.count += 1
      summary.pipeline.total_revenue += revenue
    }
    if (status === 'active') {
      summary.active.count += 1
      summary.active.total_revenue += revenue
    }
    if (status === 'recap') {
      summary.in_recap.count += 1
      summary.in_recap.total_revenue += revenue
    }
    if (status === 'invoiced' && est.updated_at >= quarterRange.start && est.updated_at <= quarterRange.end) {
      summary.invoiced_this_quarter.count += 1
      summary.invoiced_this_quarter.total_revenue += revenue
    }

    // Client breakdown (active statuses only)
    if (ACTIVE_STATUSES.includes(status)) {
      const existing = clientMap.get(clientName) || { count: 0, total_revenue: 0 }
      existing.count += 1
      existing.total_revenue += revenue
      clientMap.set(clientName, existing)
    }

    // Monthly volume
    const month = formatMonth(est.created_at)
    const monthEntry = monthMap.get(month) || { count: 0, total_revenue: 0 }
    monthEntry.count += 1
    monthEntry.total_revenue += revenue
    monthMap.set(month, monthEntry)
  }

  // ---- Format outputs ----

  const status_breakdown = ALL_STATUSES
    .map(s => ({ status: s, ...(statusMap.get(s) || { count: 0, total_revenue: 0 }) }))
    .filter(s => s.count > 0)

  const client_breakdown = Array.from(clientMap.entries())
    .map(([client_name, data]) => ({ client_name, ...data }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 8)

  // Monthly volume: last 12 months, sorted chronologically
  const now = new Date()
  const monthly_volume: Array<{ month: string; count: number; total_revenue: number }> = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const entry = monthMap.get(key) || { count: 0, total_revenue: 0 }
    monthly_volume.push({ month: key, ...entry })
  }

  // Recent activity: enrich with estimate/client names
  const recent_activity = activities
    .map(a => {
      const lookup = estimateLookup.get(a.estimate_id)
      return {
        id: a.id,
        estimate_id: a.estimate_id,
        estimate_name: lookup?.event_name ?? 'Unknown',
        client_name: lookup?.client_name ?? 'Unknown',
        from_status: a.from_status,
        to_status: a.to_status,
        changed_at: a.created_at,
        changed_by: a.changed_by,
      }
    })

  return {
    summary,
    status_breakdown,
    client_breakdown,
    monthly_volume,
    recent_activity,
  }
}
