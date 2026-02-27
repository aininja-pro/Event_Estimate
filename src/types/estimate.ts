// ---- Phase 2: Estimate Builder types ----

export interface Estimate {
  id: string
  client_id: string
  event_name: string
  event_type: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  duration_days: number | null
  expected_attendance: number | null
  po_number: string | null
  project_id: string | null
  cost_structure: 'corporate' | 'office'
  project_notes: string | null
  status: 'pipeline' | 'draft' | 'review' | 'approved' | 'active' | 'recap' | 'complete'
  created_by: string | null
  created_at: string
  updated_at: string
}

export type EstimateInsert = Omit<Estimate, 'id' | 'created_at' | 'updated_at'>

export type EstimateUpdate = Partial<Omit<Estimate, 'id' | 'client_id' | 'created_at' | 'updated_at'>>

export interface EstimateWithClient extends Estimate {
  clients: { name: string; code: string; third_party_markup: number; office_payout_pct: number }
}

export interface LaborLog {
  id: string
  estimate_id: string
  location_name: string
  is_primary: boolean
  location_order: number
  start_date: string | null
  end_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type LaborLogInsert = Pick<LaborLog, 'estimate_id' | 'location_name' | 'is_primary'> & Partial<Pick<LaborLog, 'location_order' | 'start_date' | 'end_date' | 'notes'>>

export type LaborLogUpdate = Partial<Omit<LaborLog, 'id' | 'estimate_id' | 'created_at' | 'updated_at'>>

export interface LaborEntry {
  id: string
  labor_log_id: string
  rate_card_item_id: string | null
  role_name: string
  quantity: number
  days: number
  unit_rate: number
  cost_rate: number | null
  override_rate: number | null
  override_reason: string | null
  has_overtime: boolean
  overtime_rate: number | null
  overtime_hours: number | null
  gl_code: string | null
  notes: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export type LaborEntryInsert = Omit<LaborEntry, 'id' | 'created_at' | 'updated_at'>

export type LaborEntryUpdate = Partial<Omit<LaborEntry, 'id' | 'labor_log_id' | 'created_at' | 'updated_at'>>

export interface EstimateLineItem {
  id: string
  estimate_id: string
  section: string
  rate_card_item_id: string | null
  item_name: string
  description: string | null
  quantity: number
  unit_cost: number
  markup_pct: number
  gl_code: string | null
  notes: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export type EstimateLineItemInsert = Omit<EstimateLineItem, 'id' | 'created_at' | 'updated_at'>

export type EstimateLineItemUpdate = Partial<Omit<EstimateLineItem, 'id' | 'estimate_id' | 'created_at' | 'updated_at'>>
