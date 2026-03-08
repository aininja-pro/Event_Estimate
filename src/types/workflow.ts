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

export type SegmentStatus = 'draft' | 'active' | 'recap' | 'invoiced'

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
