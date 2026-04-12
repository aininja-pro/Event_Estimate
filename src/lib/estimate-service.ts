import { supabase } from './supabase'
import { getClient } from './rate-card-service'
import { getScheduleEntries, getScheduleDayTypes, addScheduleEntry, upsertScheduleDayType } from './schedule-service'
import type {
  Estimate,
  EstimateInsert,
  EstimateUpdate,
  EstimateWithClient,
  EstimateWithSegments,
  LaborLog,
  LaborLogInsert,
  LaborLogUpdate,
  LaborEntry,
  LaborEntryInsert,
  LaborEntryUpdate,
  EstimateLineItem,
  EstimateLineItemInsert,
  EstimateLineItemUpdate,
} from '../types/estimate'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

// ---- Estimates ----

export async function getEstimates(): Promise<EstimateWithSegments[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimates')
    .select('*, clients(name, code, third_party_markup, office_payout_pct), labor_logs(id, location_name, status, is_primary, location_order)')
    .order('updated_at', { ascending: false })
    .order('location_order', { ascending: true, referencedTable: 'labor_logs' })
  if (error) throw error
  return data
}

export async function getEstimate(id: string): Promise<EstimateWithClient> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimates')
    .select('*, clients(name, code, third_party_markup, office_payout_pct)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createEstimate(estimate: EstimateInsert): Promise<Estimate> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimates')
    .insert(estimate)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEstimate(id: string, updates: EstimateUpdate): Promise<Estimate> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEstimate(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('estimates')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---- Labor Logs ----

export async function getLaborLogs(estimateId: string): Promise<LaborLog[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_logs')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('location_order', { ascending: true })
  if (error) throw error
  return data
}

export async function createLaborLog(log: LaborLogInsert): Promise<LaborLog> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_logs')
    .insert(log)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLaborLog(id: string, updates: LaborLogUpdate): Promise<LaborLog> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLaborLog(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('labor_logs')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---- Labor Entries ----

export async function getLaborEntries(laborLogId: string): Promise<LaborEntry[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_entries')
    .select('*')
    .eq('labor_log_id', laborLogId)
    .order('display_order')
  if (error) throw error
  return data
}

export async function createLaborEntry(entry: LaborEntryInsert): Promise<LaborEntry> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_entries')
    .insert(entry)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLaborEntry(id: string, updates: LaborEntryUpdate): Promise<LaborEntry> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLaborEntry(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('labor_entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---- Estimate Line Items ----

export async function getLineItems(estimateId: string, section?: string): Promise<EstimateLineItem[]> {
  const db = requireSupabase()
  let query = db
    .from('estimate_line_items')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('display_order')

  if (section) {
    query = query.eq('section', section)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getLineItemsByLocation(laborLogId: string): Promise<EstimateLineItem[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimate_line_items')
    .select('*')
    .eq('labor_log_id', laborLogId)
    .order('display_order')
  if (error) throw error
  return data
}

export async function createLineItem(item: EstimateLineItemInsert): Promise<EstimateLineItem> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimate_line_items')
    .insert(item)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLineItem(id: string, updates: EstimateLineItemUpdate): Promise<EstimateLineItem> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimate_line_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLineItem(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('estimate_line_items')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---- Auto-generated Fee Lines ----

/** Create agency fee line item on the primary labor log if client has agency_fee > 0 */
export async function createAutoFeeLines(
  estimateId: string,
  laborLogId: string,
  agencyFee: number,
): Promise<EstimateLineItem | null> {
  if (!agencyFee || agencyFee <= 0) return null

  return createLineItem({
    estimate_id: estimateId,
    labor_log_id: laborLogId,
    section: 'fees',
    rate_card_item_id: null,
    item_name: 'Agency Fee',
    description: null,
    quantity: 1,
    unit_cost: 0,
    markup_pct: agencyFee * 100,
    gl_code: null,
    notes: null,
    is_auto_generated: true,
    fee_basis: 'total_estimate',
    is_unplanned: false,
    display_order: 0,
  })
}

// ---- Duplicate Estimate ----

/** Deep-copy an entire estimate: header, labor logs, entries, line items, schedule, day types. */
export async function duplicateEstimate(
  estimateId: string,
  userId: string
): Promise<{ newEstimateId: string }> {
  const db = requireSupabase()

  // 1. Fetch source estimate and client (for agency fee)
  const source = await getEstimate(estimateId)
  const client = await getClient(source.client_id)

  // 2. Create new estimate
  const newEstimate = await createEstimate({
    client_id: source.client_id,
    event_name: `Copy of ${source.event_name}`,
    event_type: source.event_type,
    location: source.location,
    start_date: source.start_date,
    end_date: source.end_date,
    duration_days: source.duration_days,
    expected_attendance: source.expected_attendance,
    po_number: null,
    project_id: null,
    cost_structure: source.cost_structure,
    internal_notes: source.internal_notes,
    published_notes: source.published_notes,
    status: 'pipeline',
    created_by: userId,
  })

  // 3. Fetch all labor logs and copy each with children
  const laborLogs = await getLaborLogs(estimateId)
  let primaryNewLogId: string | null = null

  for (const log of laborLogs) {
    // Create new labor log
    const newLog = await createLaborLog({
      estimate_id: newEstimate.id,
      location_name: log.location_name,
      is_primary: log.is_primary,
      location_order: log.location_order,
      start_date: log.start_date,
      end_date: log.end_date,
      status: 'pipeline',
    })

    if (log.is_primary) primaryNewLogId = newLog.id

    // Copy labor entries
    const entries = await getLaborEntries(log.id)
    for (const entry of entries) {
      await createLaborEntry({
        labor_log_id: newLog.id,
        rate_card_item_id: entry.rate_card_item_id,
        role_name: entry.role_name,
        quantity: entry.quantity,
        days: entry.days,
        unit_rate: entry.unit_rate,
        cost_rate: entry.cost_rate,
        override_rate: entry.override_rate,
        override_reason: entry.override_reason,
        has_overtime: entry.has_overtime,
        overtime_rate: entry.overtime_rate,
        overtime_hours: entry.overtime_hours,
        gl_code: entry.gl_code,
        notes: entry.notes,
        resource_type: entry.resource_type,
        display_order: entry.display_order,
      })
    }

    // Copy line items (skip auto-generated fee lines — agency fee re-generates fresh)
    const lineItems = await getLineItemsByLocation(log.id)
    for (const item of lineItems) {
      if (item.is_auto_generated) continue
      await createLineItem({
        estimate_id: newEstimate.id,
        labor_log_id: newLog.id,
        section: item.section,
        rate_card_item_id: item.rate_card_item_id,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        markup_pct: item.markup_pct,
        gl_code: item.gl_code,
        notes: item.notes,
        is_auto_generated: false,
        fee_basis: null,
        is_unplanned: item.is_unplanned,
        display_order: item.display_order,
      })
    }

    // Copy schedule entries + day entries
    const scheduleEntries = await getScheduleEntries(log.id)
    for (const se of scheduleEntries) {
      const newSe = await addScheduleEntry({
        labor_log_id: newLog.id,
        rate_card_item_id: se.rate_card_item_id,
        role_name: se.role_name,
        person_name: null, // Clear — new event, different staff
        row_index: se.row_index,
        staff_group_id: se.staff_group_id,
        needs_airfare: se.needs_airfare,
        needs_hotel: se.needs_hotel,
        needs_per_diem: se.needs_per_diem,
        day_rate: se.day_rate,
        cost_rate: se.cost_rate,
        gl_code: se.gl_code,
        notes: se.notes,
        resource_type: se.resource_type,
      })

      if (se.day_entries && se.day_entries.length > 0) {
        const dayInserts = se.day_entries.map((de) => ({
          schedule_entry_id: newSe.id,
          work_date: de.work_date,
          hours: de.hours,
          per_diem_override: de.per_diem_override,
        }))
        const { error } = await db
          .from('schedule_day_entries')
          .insert(dayInserts)
        if (error) throw error
      }
    }

    // Copy day types
    const dayTypes = await getScheduleDayTypes(log.id)
    for (const dt of dayTypes) {
      await upsertScheduleDayType(newLog.id, dt.work_date, dt.day_type, dt.display_order)
    }
  }

  // 4. Auto-generate agency fee on primary labor log
  if (primaryNewLogId && client.agency_fee > 0) {
    await createAutoFeeLines(newEstimate.id, primaryNewLogId, client.agency_fee)
  }

  return { newEstimateId: newEstimate.id }
}
