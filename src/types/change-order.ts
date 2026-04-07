// ---- Change Order types ----

export interface ChangeOrder {
  id: string
  estimate_id: string
  labor_log_id: string
  co_number: number
  description: string
  baseline_version_id: string | null
  revised_version_id: string | null
  delta_summary: DeltaSummary
  baseline_total: number | null
  revised_total: number | null
  delta_amount: number | null
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  created_by: string | null
  created_at: string
  approved_by: string | null
  approved_at: string | null
  // Joined fields (from profiles)
  created_by_name?: string
  approved_by_name?: string
}

export interface DeltaSummary {
  added: DeltaItem[]
  removed: DeltaItem[]
  modified: DeltaModifiedItem[]
  net_delta: number
}

export interface DeltaItem {
  type: 'labor' | 'line_item' | 'schedule'
  item_name: string
  section?: string
  quantity?: number
  days?: number
  unit_rate?: number
  total: number
}

export interface DeltaModifiedItem {
  type: 'labor' | 'line_item' | 'schedule'
  item_name: string
  section?: string
  field: string
  from: number
  to: number
  delta: number
}
