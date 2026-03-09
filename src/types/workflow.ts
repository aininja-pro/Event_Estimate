// ---- Phase 2: Workflow Engine types ----

export interface EstimateVersion {
  id: string
  estimate_id: string
  version_number: number
  snapshot_json: EstimateSnapshot
  status_at_version: string
  change_summary: string | null
  changed_by: string
  created_at: string
}

export interface ApprovalRequest {
  id: string
  estimate_id: string
  version_id: string
  requested_by: string
  requested_at: string
  reviewer: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  status: 'pending' | 'approved' | 'rejected' | 'recalled'
  threshold_triggered: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface StatusTransition {
  id: string
  estimate_id: string
  from_status: string
  to_status: string
  transitioned_by: string
  reason: string | null
  version_id: string | null
  created_at: string
}

export type SegmentStatus = 'draft' | 'review' | 'approved' | 'active' | 'recap' | 'invoiced' | 'complete'

// ---- Segment Status types ----

export interface SegmentActivity {
  id: string
  labor_log_id: string
  estimate_id: string
  action: string
  from_status: string | null
  to_status: string | null
  changed_by: string
  comment: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface SegmentEditRules {
  schedule_hours: boolean
  schedule_names: boolean
  schedule_add_remove: boolean
  schedule_dates: boolean
  labor_log: boolean
  line_items: boolean
  event_details: boolean
  notes: boolean
  actuals: boolean
  names_required: boolean
}

export interface RecapActual {
  id: string
  estimate_id: string
  labor_log_id: string
  labor_entry_id: string | null
  schedule_entry_id: string | null
  line_item_id: string | null
  actual_quantity: number | null
  actual_days: number | null
  actual_hours: number | null
  actual_unit_cost: number | null
  actual_total: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface VarianceRow {
  item_name: string
  section: string
  estimated_total: number
  actual_total: number
  variance: number
  variance_pct: number
}

export type EstimateStatus = 'pipeline' | 'draft' | 'review' | 'approved' | 'active' | 'recap' | 'complete'

// ---- Snapshot shape ----

export interface EstimateSnapshot {
  estimate: Record<string, unknown>
  labor_logs: Array<{
    [key: string]: unknown
    entries: Record<string, unknown>[]
  }>
  line_items: Record<string, unknown>[]
  schedule_entries: Record<string, unknown>[]
  schedule_day_entries: Record<string, unknown>[]
  schedule_day_types: Record<string, unknown>[]
  totals: {
    total_revenue: number
    total_cost: number
    gross_profit: number
    gross_margin_pct: number
  }
  snapshot_at: string
}
