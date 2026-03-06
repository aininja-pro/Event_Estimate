import { supabase } from './supabase'
import type {
  ScheduleEntry,
  ScheduleEntryInsert,
  ScheduleEntryUpdate,
  ScheduleDayEntry,
  ScheduleDayType,
  LaborRollupRow,
} from '../types/schedule'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

// ---- Day Types (column definitions) ----

export async function getScheduleDayTypes(laborLogId: string): Promise<ScheduleDayType[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('schedule_day_types')
    .select('*')
    .eq('labor_log_id', laborLogId)
    .order('work_date')
  if (error) throw error
  return data
}

export async function upsertScheduleDayType(
  laborLogId: string,
  workDate: string,
  dayType: string,
  displayOrder?: number
): Promise<ScheduleDayType> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('schedule_day_types')
    .upsert(
      {
        labor_log_id: laborLogId,
        work_date: workDate,
        day_type: dayType,
        display_order: displayOrder ?? 0,
      },
      { onConflict: 'labor_log_id,work_date' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteScheduleDayType(laborLogId: string, workDate: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('schedule_day_types')
    .delete()
    .eq('labor_log_id', laborLogId)
    .eq('work_date', workDate)
  if (error) throw error
}

/** Generate an array of ISO date strings between start and end (inclusive). */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

// ---- Schedule Entries (rows = people) ----

export async function getScheduleEntries(laborLogId: string): Promise<ScheduleEntry[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('schedule_entries')
    .select('*, day_entries:schedule_day_entries(*)')
    .eq('labor_log_id', laborLogId)
    .order('row_index')
  if (error) throw error
  return data
}

export async function addScheduleEntry(entry: ScheduleEntryInsert): Promise<ScheduleEntry> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('schedule_entries')
    .insert(entry)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateScheduleEntry(id: string, updates: ScheduleEntryUpdate): Promise<ScheduleEntry> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('schedule_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteScheduleEntry(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('schedule_entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function duplicateScheduleEntry(id: string): Promise<ScheduleEntry> {
  const db = requireSupabase()

  // Fetch the source entry with its day entries
  const { data: source, error: fetchError } = await db
    .from('schedule_entries')
    .select('*, day_entries:schedule_day_entries(*)')
    .eq('id', id)
    .single()
  if (fetchError) throw fetchError

  // Insert the new entry (omit generated/system columns)
  const { id: _id, created_at: _ca, updated_at: _ua, ot_hourly_rate: _ohr, ot_cost_rate: _ocr, day_entries, ...rest } = source
  const { data: newEntry, error: insertError } = await db
    .from('schedule_entries')
    .insert({ ...rest, person_name: null, row_index: rest.row_index + 1 })
    .select()
    .single()
  if (insertError) throw insertError

  // Copy day entries if any exist
  if (day_entries && day_entries.length > 0) {
    const dayInserts = day_entries.map((de: ScheduleDayEntry) => ({
      schedule_entry_id: newEntry.id,
      work_date: de.work_date,
      hours: de.hours,
      per_diem_override: de.per_diem_override,
    }))
    const { error: dayError } = await db
      .from('schedule_day_entries')
      .insert(dayInserts)
    if (dayError) throw dayError
  }

  return newEntry
}

// ---- Schedule Day Entries (cells = hours per person per day) ----

export async function upsertScheduleDayEntry(
  scheduleEntryId: string,
  workDate: string,
  hours: number,
  perDiemOverride?: boolean | null
): Promise<ScheduleDayEntry> {
  const db = requireSupabase()
  const payload: Record<string, unknown> = {
    schedule_entry_id: scheduleEntryId,
    work_date: workDate,
    hours,
  }
  if (perDiemOverride !== undefined) {
    payload.per_diem_override = perDiemOverride
  }
  const { data, error } = await db
    .from('schedule_day_entries')
    .upsert(payload, { onConflict: 'schedule_entry_id,work_date' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteScheduleDayEntry(scheduleEntryId: string, workDate: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('schedule_day_entries')
    .delete()
    .eq('schedule_entry_id', scheduleEntryId)
    .eq('work_date', workDate)
  if (error) throw error
}

/** Fill all staff on a given date with the specified hours. */
export async function bulkFillColumn(laborLogId: string, workDate: string, hours: number): Promise<void> {
  const db = requireSupabase()

  // Get all schedule entries for this labor log
  const { data: entries, error: fetchError } = await db
    .from('schedule_entries')
    .select('id')
    .eq('labor_log_id', laborLogId)
  if (fetchError) throw fetchError
  if (!entries || entries.length === 0) return

  const upserts = entries.map((e) => ({
    schedule_entry_id: e.id,
    work_date: workDate,
    hours,
  }))
  const { error } = await db
    .from('schedule_day_entries')
    .upsert(upserts, { onConflict: 'schedule_entry_id,work_date' })
  if (error) throw error
}

/** Fill all given dates for a single person with the specified hours. */
export async function bulkFillRow(scheduleEntryId: string, dates: string[], hours: number): Promise<void> {
  const db = requireSupabase()
  const upserts = dates.map((d) => ({
    schedule_entry_id: scheduleEntryId,
    work_date: d,
    hours,
  }))
  const { error } = await db
    .from('schedule_day_entries')
    .upsert(upserts, { onConflict: 'schedule_entry_id,work_date' })
  if (error) throw error
}

// ---- Rollup (for Labor Log tab) ----

/**
 * Compute the labor rollup from schedule data.
 * Groups by staff_group_id (or role_name if no group), calculates
 * quantity, days, hours, OT, revenue, cost, and GP.
 *
 * OT rules:
 * - Standard day = 10 hours (minimum billing)
 * - Hours over 10 = overtime at day_rate/10 per hour
 */
export function computeScheduleRollup(entries: ScheduleEntry[]): LaborRollupRow[] {
  // Group entries by staff_group_id, falling back to role_name
  const groups = new Map<string, ScheduleEntry[]>()
  for (const entry of entries) {
    const key = entry.staff_group_id || `role:${entry.role_name}:${entry.day_rate}:${entry.cost_rate}`
    const group = groups.get(key) || []
    group.push(entry)
    groups.set(key, group)
  }

  const rows: LaborRollupRow[] = []

  for (const group of groups.values()) {
    const first = group[0]
    const quantity = group.length
    let totalDays = 0
    let totalStandardHours = 0
    let totalOtHours = 0
    let revenueTotal = 0
    let costTotal = 0

    for (const entry of group) {
      const dayEntries = entry.day_entries || []
      for (const de of dayEntries) {
        totalDays += 1
        const stdHours = Math.min(de.hours, 10)
        const otHours = Math.max(de.hours - 10, 0)
        totalStandardHours += stdHours
        totalOtHours += otHours

        // Revenue: full day rate + OT hours at hourly rate
        revenueTotal += entry.day_rate + otHours * (entry.day_rate / 10)
        // Cost: full day cost + OT hours at cost hourly rate
        costTotal += entry.cost_rate + otHours * (entry.cost_rate / 10)
      }
    }

    const gp = revenueTotal - costTotal
    const gpPct = revenueTotal > 0 ? (gp / revenueTotal) * 100 : 0

    rows.push({
      role_name: first.role_name,
      gl_code: first.gl_code,
      quantity,
      total_days: totalDays,
      total_standard_hours: totalStandardHours,
      total_ot_hours: totalOtHours,
      day_rate: first.day_rate,
      cost_rate: first.cost_rate,
      revenue_total: revenueTotal,
      cost_total: costTotal,
      gp,
      gp_pct: Math.round(gpPct * 100) / 100,
    })
  }

  return rows
}

/**
 * Fetch schedule entries and compute the rollup for a labor log.
 * Returns empty array if no schedule data exists.
 */
export async function getScheduleRollup(laborLogId: string): Promise<LaborRollupRow[]> {
  const entries = await getScheduleEntries(laborLogId)
  if (entries.length === 0) return []
  return computeScheduleRollup(entries)
}
