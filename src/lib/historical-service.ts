import { supabase } from './supabase'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

// ---- Types ----

export interface HistoricalSearchParams {
  query?: string
  client?: string
  event_type?: string
  limit?: number
}

export interface HistoricalEventSummary {
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

// ---- Search ----

export async function searchHistoricalEvents(
  params: HistoricalSearchParams
): Promise<HistoricalEventSummary[]> {
  const db = requireSupabase()
  const limit = params.limit ?? 20

  let query = db
    .from('historical_events')
    .select('id, filename, client, event_name, event_type, location, grand_total, initial_estimate_amount, final_invoice_amount, has_recap_data, sections, labor_roles')

  if (params.query) {
    const q = `%${params.query}%`
    query = query.or(`event_name.ilike.${q},client.ilike.${q},location.ilike.${q}`)
  }

  if (params.client) {
    query = query.eq('client', params.client)
  }

  if (params.event_type) {
    query = query.eq('event_type', params.event_type)
  }

  const { data, error } = await query
    .order('grand_total', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as HistoricalEventSummary[]
}

// ---- Distinct Clients ----

export async function getDistinctHistoricalClients(): Promise<string[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('historical_events')
    .select('client')
    .not('client', 'is', null)
    .order('client')

  if (error) throw error

  // Deduplicate client names
  const unique = [...new Set((data ?? []).map((d: { client: string }) => d.client))]
  return unique
}
