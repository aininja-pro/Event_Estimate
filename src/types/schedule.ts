// ---- Phase 2: Schedule Tab (Staffing Grid) types ----

export interface ScheduleEntry {
  id: string
  labor_log_id: string
  rate_card_item_id: string | null
  role_name: string
  person_name: string | null
  row_index: number
  staff_group_id: string | null
  needs_airfare: boolean
  needs_hotel: boolean
  needs_per_diem: boolean
  day_rate: number
  cost_rate: number
  ot_hourly_rate: number
  ot_cost_rate: number
  gl_code: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Nested day entries (loaded via separate query)
  day_entries?: ScheduleDayEntry[]
}

export type ScheduleEntryInsert = Omit<ScheduleEntry, 'id' | 'ot_hourly_rate' | 'ot_cost_rate' | 'created_at' | 'updated_at' | 'day_entries'>

export type ScheduleEntryUpdate = Partial<Omit<ScheduleEntry, 'id' | 'labor_log_id' | 'ot_hourly_rate' | 'ot_cost_rate' | 'created_at' | 'updated_at' | 'day_entries'>>

export interface ScheduleDayEntry {
  id: string
  schedule_entry_id: string
  work_date: string
  hours: number
  per_diem_override: boolean | null
  created_at: string
  updated_at: string
}

export type ScheduleDayEntryInsert = Omit<ScheduleDayEntry, 'id' | 'created_at' | 'updated_at'>

export interface ScheduleDayType {
  id: string
  labor_log_id: string
  work_date: string
  day_type: 'event' | 'setup' | 'training' | 'travel' | 'off'
  display_order: number
  created_at: string
  updated_at: string
}

export type ScheduleDayTypeInsert = Omit<ScheduleDayType, 'id' | 'created_at' | 'updated_at'>

export interface LaborRollupRow {
  role_name: string
  gl_code: string | null
  quantity: number
  total_days: number
  total_standard_hours: number
  total_ot_hours: number
  day_rate: number
  cost_rate: number
  revenue_total: number
  cost_total: number
  gp: number
  gp_pct: number
}
