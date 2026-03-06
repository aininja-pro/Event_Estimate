import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Search,
  Check,
  Plus,
  Copy,
  Trash2,
  Plane,
  BedDouble,
  UtensilsCrossed,
  X,
  Calendar,
} from 'lucide-react'
import type { ScheduleEntry, ScheduleDayType, ScheduleDayEntry } from '@/types/schedule'
import type { RateCardItemsBySection } from '@/types/rate-card'
import type { LaborLog, EstimateWithClient } from '@/types/estimate'
import {
  getScheduleEntries,
  getScheduleDayTypes,
  addScheduleEntry,
  updateScheduleEntry,
  deleteScheduleEntry,
  duplicateScheduleEntry,
  upsertScheduleDayEntry,
  deleteScheduleDayEntry,
  upsertScheduleDayType,
  deleteScheduleDayType,
  bulkFillColumn,
  generateDateRange,
  computeScheduleRollup,
} from '@/lib/schedule-service'

// ── Constants ──────────────────────────────────────────────────────────────────

const DAY_TYPES = ['event', 'setup', 'training', 'travel', 'off'] as const
type DayType = typeof DAY_TYPES[number]

const DAY_TYPE_COLORS: Record<DayType, { bg: string; badge: string; text: string; cell: string }> = {
  event:    { bg: 'bg-emerald-50/60', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700', text: 'text-emerald-700', cell: 'bg-emerald-50' },
  setup:    { bg: 'bg-sky-50/60', badge: 'bg-sky-50 border-sky-200 text-sky-700', text: 'text-sky-700', cell: 'bg-sky-50' },
  training: { bg: 'bg-violet-50/60', badge: 'bg-violet-50 border-violet-200 text-violet-700', text: 'text-violet-700', cell: 'bg-violet-50' },
  travel:   { bg: 'bg-slate-100/60', badge: 'bg-slate-100 border-slate-300 text-slate-600', text: 'text-slate-600', cell: 'bg-slate-50' },
  off:      { bg: '', badge: 'bg-white border-slate-200 text-slate-400', text: 'text-slate-400', cell: '' },
}

const STANDARD_HOURS = 10

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatDate(dateStr: string): { month: string; day: string; weekday: string } {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: d.getDate().toString(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
  }
}

/** Heat map opacity based on hours worked — varies the day-type color intensity. */
function cellOpacity(hours: number): string {
  if (hours <= 0) return 'opacity-0'
  if (hours <= 8) return 'opacity-30'
  if (hours <= 10) return 'opacity-50'
  return 'opacity-70'
}

// ── Add Staff Modal ────────────────────────────────────────────────────────────

function AddStaffModal({
  open,
  onOpenChange,
  rateCardData,
  estimate,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rateCardData: RateCardItemsBySection[]
  estimate: EstimateWithClient
  onAdd: (entries: { role_name: string; day_rate: number; cost_rate: number; gl_code: string | null; rate_card_item_id: string | null }[]) => void
}) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customRate, setCustomRate] = useState('')
  type CustomRole = { id: string; role_name: string; day_rate: number }
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([])

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set())
      setSearch('')
      setShowCustom(false)
      setCustomName('')
      setCustomRate('')
      setCustomRoles([])
    }
  }, [open])

  const laborSections = rateCardData.filter((s) => s.section.cost_type === 'labor')
  const allRoles = laborSections.flatMap((s) =>
    s.items.map((item) => ({ ...item, sectionName: s.section.name }))
  )
  const filtered = search
    ? allRoles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : allRoles

  function toggleRole(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function handleAddCustom() {
    if (!customName.trim()) return
    const id = `custom-${Date.now()}`
    setCustomRoles((prev) => [...prev, { id, role_name: customName.trim(), day_rate: parseFloat(customRate) || 0 }])
    setSelectedIds((prev) => new Set(prev).add(id))
    setCustomName('')
    setCustomRate('')
    setShowCustom(false)
  }

  function handleAddSelected() {
    const isOffice = estimate.cost_structure === 'office'
    const rcEntries = allRoles
      .filter((r) => selectedIds.has(r.id))
      .map((role) => ({
        role_name: role.name,
        day_rate: role.unit_rate ?? 0,
        cost_rate: isOffice && role.unit_rate
          ? role.unit_rate * (1 - estimate.clients.office_payout_pct)
          : 0,
        gl_code: role.gl_code ?? null,
        rate_card_item_id: role.id,
      }))
    const customEntries = customRoles
      .filter((r) => selectedIds.has(r.id))
      .map((role) => ({
        role_name: role.role_name,
        day_rate: role.day_rate,
        cost_rate: isOffice ? role.day_rate * (1 - estimate.clients.office_payout_pct) : 0,
        gl_code: null as string | null,
        rate_card_item_id: null as string | null,
      }))
    onAdd([...rcEntries, ...customEntries])
    onOpenChange(false)
  }

  const totalSelected = selectedIds.size

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add Staff to Schedule</DialogTitle>
          <DialogDescription className="text-xs">Select roles from the rate card to add to the staffing grid</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-7 text-[13px] border-border/50" autoFocus />
        </div>
        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[350px] -mx-1 px-1">
          {filtered.length === 0 && <p className="text-xs text-muted-foreground/50 text-center py-4">No roles found</p>}
          {filtered.map((role) => (
            <button
              key={role.id}
              onClick={() => toggleRole(role.id)}
              className={`w-full flex items-center gap-2 px-2 py-1 text-left rounded transition-colors ${selectedIds.has(role.id) ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-muted/50'}`}
            >
              <span className={`h-3.5 w-3.5 rounded-sm border flex items-center justify-center shrink-0 ${selectedIds.has(role.id) ? 'bg-emerald-600 border-emerald-600' : 'border-border/60'}`}>
                {selectedIds.has(role.id) && <Check className="h-2.5 w-2.5 text-white" />}
              </span>
              <span className="text-[13px] font-medium flex-1 truncate">{role.name}</span>
              <span className="text-[11px] text-muted-foreground/50 tabular-nums">${role.unit_rate?.toLocaleString() ?? '0'}/day</span>
            </button>
          ))}
          {customRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => toggleRole(role.id)}
              className={`w-full flex items-center gap-2 px-2 py-1 text-left rounded transition-colors ${selectedIds.has(role.id) ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-muted/50'}`}
            >
              <span className={`h-3.5 w-3.5 rounded-sm border flex items-center justify-center shrink-0 ${selectedIds.has(role.id) ? 'bg-emerald-600 border-emerald-600' : 'border-border/60'}`}>
                {selectedIds.has(role.id) && <Check className="h-2.5 w-2.5 text-white" />}
              </span>
              <span className="text-[13px] font-medium flex-1 truncate">{role.role_name} <span className="text-muted-foreground/40">(custom)</span></span>
              <span className="text-[11px] text-muted-foreground/50 tabular-nums">${role.day_rate.toLocaleString()}/day</span>
            </button>
          ))}
        </div>
        {showCustom ? (
          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            <Input placeholder="Role name" value={customName} onChange={(e) => setCustomName(e.target.value)} className="h-7 text-[13px] flex-1 border-border/50" autoFocus />
            <Input placeholder="Day rate" value={customRate} onChange={(e) => setCustomRate(e.target.value)} className="h-7 text-[13px] w-20 border-border/50" />
            <Button size="sm" variant="outline" onClick={handleAddCustom} disabled={!customName.trim()} className="h-7 text-[11px]">Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCustom(false)} className="h-7 text-[11px]">Cancel</Button>
          </div>
        ) : (
          <button onClick={() => setShowCustom(true)} className="text-[11px] text-muted-foreground/60 hover:text-foreground/90 transition-colors text-left">+ Add custom role</button>
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-[13px]">Cancel</Button>
          <Button
            size="sm"
            disabled={totalSelected === 0}
            onClick={handleAddSelected}
            className="text-[13px] bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm"
          >
            {totalSelected === 0 ? 'Select Roles' : `Add ${totalSelected} Staff`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Day Type Selector ──────────────────────────────────────────────────────────

function DayTypeDropdown({
  value,
  onChange,
}: {
  value: DayType
  onChange: (type: DayType) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [open])

  const colors = DAY_TYPE_COLORS[value]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide border ${colors.badge} hover:opacity-80 transition-opacity`}
      >
        {value}
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-white dark:bg-zinc-900 border border-border/50 rounded-md shadow-lg py-1 w-24">
          {DAY_TYPES.map((dt) => (
            <button
              key={dt}
              onMouseDown={(e) => { e.preventDefault(); onChange(dt); setOpen(false) }}
              className={`block w-full text-left px-2 py-1 text-[11px] capitalize hover:bg-muted/50 transition-colors ${dt === value ? 'font-medium' : ''}`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${DAY_TYPE_COLORS[dt].badge.split(' ')[0]}`} />
              {dt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Schedule Grid Cell ─────────────────────────────────────────────────────────

function GridCell({
  hours,
  dayType,
  onSetHours,
  onClear,
}: {
  hours: number | null
  dayType: DayType
  onSetHours: (h: number) => void
  onClear: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const colors = DAY_TYPE_COLORS[dayType]
  const hasHours = hours !== null && hours > 0
  const isOT = hasHours && hours > STANDARD_HOURS
  const otHours = isOT ? hours - STANDARD_HOURS : 0

  function handleClick() {
    if (!hasHours) {
      // Click empty cell -> fill with 10
      onSetHours(STANDARD_HOURS)
    } else {
      // Click filled cell -> edit
      setEditValue(hours.toString())
      setEditing(true)
    }
  }

  function commitEdit() {
    setEditing(false)
    const val = parseFloat(editValue)
    if (isNaN(val) || val <= 0) {
      onClear()
    } else {
      onSetHours(val)
    }
  }

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.select()
  }, [editing])

  if (editing) {
    return (
      <td className={`border border-slate-200 p-0 ${colors.bg}`}>
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
          className="w-full h-full text-center text-sm font-medium bg-transparent outline-none ring-2 ring-blue-500 rounded-sm py-1.5"
          autoFocus
        />
      </td>
    )
  }

  return (
    <td
      className={`border border-slate-200 text-center cursor-pointer transition-colors duration-150 relative select-none ${hasHours ? colors.bg : 'hover:bg-slate-100/60'}`}
      onClick={handleClick}
      onDoubleClick={(e) => { e.stopPropagation(); if (hasHours) onClear() }}
      style={hasHours ? { '--tw-bg-opacity': hours <= 8 ? '0.3' : hours <= 10 ? '0.5' : '0.7' } as React.CSSProperties : undefined}
    >
      {hasHours ? (
        <span className="text-sm font-medium tabular-nums py-1.5 inline-block">
          {isOT ? (
            <>
              {STANDARD_HOURS}
              <span className="text-amber-600 text-[11px]">+{otHours}</span>
            </>
          ) : (
            hours
          )}
        </span>
      ) : (
        <span className="py-1.5 inline-block">&nbsp;</span>
      )}
    </td>
  )
}

// ── Main ScheduleGrid Component ────────────────────────────────────────────────

export function ScheduleGrid({
  laborLog,
  estimate,
  rateCardData,
}: {
  laborLog: LaborLog
  estimate: EstimateWithClient
  rateCardData: RateCardItemsBySection[]
}) {
  const [entries, setEntries] = useState<ScheduleEntry[]>([])
  const [dayTypes, setDayTypes] = useState<ScheduleDayType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [showAddDate, setShowAddDate] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [showFillConfirm, setShowFillConfirm] = useState<string | null>(null)
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Load data
  const loadSchedule = useCallback(async () => {
    try {
      const [ents, dts] = await Promise.all([
        getScheduleEntries(laborLog.id),
        getScheduleDayTypes(laborLog.id),
      ])
      setEntries(ents)
      setDayTypes(dts)

      // Auto-generate day types from segment dates if none exist
      if (dts.length === 0 && laborLog.start_date && laborLog.end_date) {
        const dates = generateDateRange(laborLog.start_date, laborLog.end_date)
        const created: ScheduleDayType[] = []
        for (let i = 0; i < dates.length; i++) {
          const dt = await upsertScheduleDayType(laborLog.id, dates[i], 'event', i)
          created.push(dt)
        }
        setDayTypes(created)
      }
    } catch (err) {
      console.error('Failed to load schedule:', err)
    } finally {
      setLoading(false)
    }
  }, [laborLog.id, laborLog.start_date, laborLog.end_date])

  useEffect(() => { loadSchedule() }, [loadSchedule])

  // Cleanup debounce timers
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach((t) => clearTimeout(t))
    }
  }, [])

  // ── Date columns sorted by date ──
  const sortedDates = [...dayTypes].sort((a, b) => a.work_date.localeCompare(b.work_date))
  const dateMap = new Map(sortedDates.map((dt) => [dt.work_date, dt]))

  // ── Helpers for cell data ──
  function getCellHours(entry: ScheduleEntry, date: string): number | null {
    const de = entry.day_entries?.find((d) => d.work_date === date)
    return de ? de.hours : null
  }

  // ── Handlers ──

  async function handleAddStaff(roles: { role_name: string; day_rate: number; cost_rate: number; gl_code: string | null; rate_card_item_id: string | null }[]) {
    const baseIndex = entries.length
    const groupId = crypto.randomUUID()

    const created: ScheduleEntry[] = []
    for (let i = 0; i < roles.length; i++) {
      const role = roles[i]
      const entry = await addScheduleEntry({
        labor_log_id: laborLog.id,
        rate_card_item_id: role.rate_card_item_id,
        role_name: role.role_name,
        person_name: null,
        row_index: baseIndex + i,
        staff_group_id: roles.length > 1 ? groupId : null,
        needs_airfare: true,
        needs_hotel: true,
        needs_per_diem: true,
        day_rate: role.day_rate,
        cost_rate: role.cost_rate,
        gl_code: role.gl_code,
        notes: null,
      })
      created.push({ ...entry, day_entries: [] })
    }
    setEntries((prev) => [...prev, ...created])
  }

  async function handleDeleteRow(id: string) {
    if (!confirm('Remove this staff row?')) return
    await deleteScheduleEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleDuplicateRow(id: string) {
    const newEntry = await duplicateScheduleEntry(id)
    // Reload to get nested day_entries
    const refreshed = await getScheduleEntries(laborLog.id)
    setEntries(refreshed)
  }

  async function handleUpdatePersonName(id: string, name: string) {
    await updateScheduleEntry(id, { person_name: name || null })
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, person_name: name || null } : e))
  }

  async function handleToggleFlag(id: string, flag: 'needs_airfare' | 'needs_hotel' | 'needs_per_diem') {
    const entry = entries.find((e) => e.id === id)
    if (!entry) return
    const newValue = !entry[flag]
    await updateScheduleEntry(id, { [flag]: newValue })
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, [flag]: newValue } : e))
  }

  function handleSetCellHours(entryId: string, date: string, hours: number) {
    // Optimistic update
    setEntries((prev) => prev.map((e) => {
      if (e.id !== entryId) return e
      const existing = e.day_entries?.find((d) => d.work_date === date)
      if (existing) {
        return { ...e, day_entries: e.day_entries?.map((d) => d.work_date === date ? { ...d, hours } : d) }
      }
      return {
        ...e,
        day_entries: [...(e.day_entries ?? []), { id: '', schedule_entry_id: entryId, work_date: date, hours, per_diem_override: null, created_at: '', updated_at: '' }],
      }
    }))

    // Debounced save
    const key = `${entryId}-${date}`
    const existing = debounceTimers.current.get(key)
    if (existing) clearTimeout(existing)
    debounceTimers.current.set(key, setTimeout(async () => {
      try {
        await upsertScheduleDayEntry(entryId, date, hours)
      } catch (err) {
        console.error('Failed to save cell:', err)
      }
    }, 300))
  }

  function handleClearCell(entryId: string, date: string) {
    // Optimistic update
    setEntries((prev) => prev.map((e) => {
      if (e.id !== entryId) return e
      return { ...e, day_entries: e.day_entries?.filter((d) => d.work_date !== date) }
    }))

    // Immediate delete
    deleteScheduleDayEntry(entryId, date).catch((err) => console.error('Failed to clear cell:', err))
  }

  async function handleDayTypeChange(date: string, newType: DayType) {
    const dt = await upsertScheduleDayType(laborLog.id, date, newType)
    setDayTypes((prev) => {
      const exists = prev.find((d) => d.work_date === date)
      if (exists) return prev.map((d) => d.work_date === date ? dt : d)
      return [...prev, dt]
    })
  }

  async function handleRemoveDate(date: string) {
    const hasData = entries.some((e) => e.day_entries?.some((d) => d.work_date === date && d.hours > 0))
    if (hasData && !confirm('This date has hours entered. Remove it?')) return
    await deleteScheduleDayType(laborLog.id, date)
    setDayTypes((prev) => prev.filter((d) => d.work_date !== date))
    // Also clear any day entries for this date
    for (const entry of entries) {
      const de = entry.day_entries?.find((d) => d.work_date === date)
      if (de) {
        await deleteScheduleDayEntry(entry.id, date)
      }
    }
    setEntries((prev) => prev.map((e) => ({
      ...e,
      day_entries: e.day_entries?.filter((d) => d.work_date !== date),
    })))
  }

  async function handleAddDate() {
    if (!newDate) return
    const existing = dayTypes.find((d) => d.work_date === newDate)
    if (existing) { setShowAddDate(false); setNewDate(''); return }
    const dt = await upsertScheduleDayType(laborLog.id, newDate, 'event', dayTypes.length)
    setDayTypes((prev) => [...prev, dt])
    setShowAddDate(false)
    setNewDate('')
  }

  async function handleFillColumn(date: string) {
    await bulkFillColumn(laborLog.id, date, STANDARD_HOURS)
    // Optimistic update: set all entries to 10 hours on that date
    setEntries((prev) => prev.map((e) => {
      const existing = e.day_entries?.find((d) => d.work_date === date)
      if (existing) {
        return { ...e, day_entries: e.day_entries?.map((d) => d.work_date === date ? { ...d, hours: STANDARD_HOURS } : d) }
      }
      return {
        ...e,
        day_entries: [...(e.day_entries ?? []), { id: '', schedule_entry_id: e.id, work_date: date, hours: STANDARD_HOURS, per_diem_override: null, created_at: '', updated_at: '' }],
      }
    }))
    setShowFillConfirm(null)
  }

  // ── Computed totals ──

  function getRowTotalDays(entry: ScheduleEntry): number {
    return entry.day_entries?.filter((d) => d.hours > 0).length ?? 0
  }

  function getColumnStaffCount(date: string): number {
    return entries.filter((e) => e.day_entries?.some((d) => d.work_date === date && d.hours > 0)).length
  }

  const rollup = computeScheduleRollup(entries)
  const totalStaff = entries.length
  const totalPersonDays = entries.reduce((sum, e) => sum + getRowTotalDays(e), 0)
  const totalPerDiemDays = entries
    .filter((e) => e.needs_per_diem)
    .reduce((sum, e) => sum + getRowTotalDays(e), 0)
  const totalOtHours = rollup.reduce((sum, r) => sum + r.total_ot_hours, 0)
  const totalRevenue = rollup.reduce((sum, r) => sum + r.revenue_total, 0)
  const totalCost = rollup.reduce((sum, r) => sum + r.cost_total, 0)
  const totalGP = totalRevenue - totalCost
  const gpPct = totalRevenue > 0 ? (totalGP / totalRevenue) * 100 : 0

  // ── Render ──

  if (loading) {
    return <div className="text-xs text-muted-foreground/50 text-center py-8">Loading schedule...</div>
  }

  // Empty state: no dates
  if (sortedDates.length === 0 && !laborLog.start_date) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <Calendar className="h-10 w-10 text-muted-foreground/30" />
        <div>
          <p className="text-sm font-medium text-muted-foreground/70">Set event dates to generate your staffing schedule</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Add start and end dates in the event header above</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddStaff(true)} className="h-7 text-[11px]">
            <Plus className="h-3 w-3 mr-1" /> Add Staff
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAddDate(true)} className="h-7 text-[11px]">
            <Plus className="h-3 w-3 mr-1" /> Add Date
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/50">Click cell to fill 10h · Double-click to clear · Click filled cell to edit</p>
      </div>

      {/* Grid */}
      <div className="relative overflow-x-auto border border-slate-200 rounded-md">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            {/* Date row */}
            <tr className="bg-slate-100">
              <th className="sticky left-0 z-20 bg-slate-100 text-left px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium w-[120px] border-b border-r border-slate-200">Name</th>
              <th className="sticky left-[120px] z-20 bg-slate-100 text-left px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium w-[100px] border-b border-r border-slate-200">Role</th>
              {sortedDates.map((dt) => {
                const d = formatDate(dt.work_date)
                return (
                  <th key={dt.work_date} className={`px-1 py-1 border-b border-r border-slate-200 min-w-[56px] text-center ${DAY_TYPE_COLORS[dt.day_type as DayType]?.bg ?? ''}`}>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowFillConfirm(dt.work_date)}
                          className="text-[11px] font-semibold text-foreground/80 hover:text-blue-600 transition-colors"
                          title="Click to fill all staff"
                        >
                          {d.month} {d.day}
                        </button>
                        <button
                          onClick={() => handleRemoveDate(dt.work_date)}
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-muted-foreground/40 hover:text-red-500 transition-all"
                          title="Remove date"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                      <span className="text-[9px] text-muted-foreground/50">{d.weekday}</span>
                      <DayTypeDropdown value={dt.day_type as DayType} onChange={(type) => handleDayTypeChange(dt.work_date, type)} />
                    </div>
                  </th>
                )
              })}
              <th className="px-2 py-1.5 border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-widest text-muted-foreground font-medium min-w-[50px] text-center">Days</th>
              <th className="px-1 py-1.5 border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-widest text-muted-foreground font-medium w-[80px] text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={sortedDates.length + 4} className="text-center py-8 text-xs text-muted-foreground/50 border-dashed border-2 border-slate-200">
                  Click <span className="font-medium">+ Add Staff</span> to start building your schedule
                </td>
              </tr>
            ) : (
              entries.map((entry, rowIdx) => (
                <tr key={entry.id} className={`group/row ${rowIdx % 2 === 1 ? 'bg-slate-50/50' : ''} hover:bg-slate-50`}>
                  {/* Name (frozen) */}
                  <td className={`sticky left-0 z-10 border-b border-r border-slate-200 px-1 ${rowIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                    <input
                      value={entry.person_name ?? ''}
                      onChange={(e) => setEntries((prev) => prev.map((en) => en.id === entry.id ? { ...en, person_name: e.target.value } : en))}
                      onBlur={(e) => handleUpdatePersonName(entry.id, e.target.value)}
                      placeholder="Name..."
                      className="w-full text-[13px] bg-transparent border-0 outline-none placeholder:text-muted-foreground/30 px-1 py-1.5"
                    />
                  </td>
                  {/* Role (frozen) */}
                  <td className={`sticky left-[120px] z-10 border-b border-r border-slate-200 px-2 py-1.5 ${rowIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                    <span className="text-[12px] font-medium text-foreground/80 truncate block">{entry.role_name}</span>
                  </td>
                  {/* Hour cells */}
                  {sortedDates.map((dt) => (
                    <GridCell
                      key={`${entry.id}-${dt.work_date}`}
                      hours={getCellHours(entry, dt.work_date)}
                      dayType={dt.day_type as DayType}
                      onSetHours={(h) => handleSetCellHours(entry.id, dt.work_date, h)}
                      onClear={() => handleClearCell(entry.id, dt.work_date)}
                    />
                  ))}
                  {/* Total days */}
                  <td className="border-b border-slate-200 bg-slate-50 text-center text-sm font-semibold tabular-nums py-1.5">
                    {getRowTotalDays(entry)}
                  </td>
                  {/* Actions */}
                  <td className="border-b border-slate-200 bg-slate-50 px-1 py-1">
                    <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleFlag(entry.id, 'needs_airfare')}
                        title="Airfare"
                        className={`p-1 rounded transition-colors ${entry.needs_airfare ? 'text-sky-600' : 'text-muted-foreground/30 hover:text-muted-foreground/60'}`}
                      >
                        <Plane className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleToggleFlag(entry.id, 'needs_hotel')}
                        title="Hotel"
                        className={`p-1 rounded transition-colors ${entry.needs_hotel ? 'text-violet-600' : 'text-muted-foreground/30 hover:text-muted-foreground/60'}`}
                      >
                        <BedDouble className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleToggleFlag(entry.id, 'needs_per_diem')}
                        title="Per Diem"
                        className={`p-1 rounded transition-colors ${entry.needs_per_diem ? 'text-amber-600' : 'text-muted-foreground/30 hover:text-muted-foreground/60'}`}
                      >
                        <UtensilsCrossed className="h-3 w-3" />
                      </button>
                      <button onClick={() => handleDuplicateRow(entry.id)} title="Duplicate" className="p-1 rounded text-muted-foreground/30 hover:text-foreground/60 transition-colors">
                        <Copy className="h-3 w-3" />
                      </button>
                      <button onClick={() => handleDeleteRow(entry.id)} title="Delete" className="p-1 rounded text-muted-foreground/30 hover:text-red-500 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {/* Staff/Day totals row */}
            {entries.length > 0 && (
              <tr className="border-t-2 border-slate-300">
                <td className="sticky left-0 z-10 bg-white px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium border-r border-slate-200" colSpan={2}>Staff / Day</td>
                {sortedDates.map((dt) => (
                  <td key={dt.work_date} className="text-center text-sm font-semibold tabular-nums py-1.5 border-r border-slate-200">
                    {getColumnStaffCount(dt.work_date) || ''}
                  </td>
                ))}
                <td className="bg-slate-50 border-slate-200" />
                <td className="bg-slate-50 border-slate-200" />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary bar */}
      {entries.length > 0 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 bg-white border border-slate-200 rounded-md px-3 py-2.5 shadow-sm">
          <SummaryMetric label="Staff" value={totalStaff.toString()} />
          <SummaryMetric label="Person-Days" value={totalPersonDays.toString()} />
          <SummaryMetric label="Per Diem Days" value={totalPerDiemDays.toString()} />
          <SummaryMetric label="OT Hours" value={totalOtHours.toString()} />
          <SummaryMetric label="Est. Revenue" value={fmt(totalRevenue)} />
          <SummaryMetric label="Est. Cost" value={fmt(totalCost)} />
          <SummaryMetric label="Gross Profit" value={fmt(totalGP)} />
          <SummaryMetric label="GP%" value={`${gpPct.toFixed(1)}%`} color={gpPct >= 35 ? 'text-green-700' : gpPct >= 25 ? 'text-amber-600' : 'text-red-600'} />
        </div>
      )}

      {/* Fill column confirmation */}
      {showFillConfirm && (
        <Dialog open={true} onOpenChange={() => setShowFillConfirm(null)}>
          <DialogContent className="sm:max-w-[340px]">
            <DialogHeader>
              <DialogTitle className="text-sm">Fill Column</DialogTitle>
              <DialogDescription className="text-xs">Set all staff to 10 hours on {showFillConfirm}?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowFillConfirm(null)} className="text-[13px]">Cancel</Button>
              <Button size="sm" onClick={() => handleFillColumn(showFillConfirm)} className="text-[13px]">Fill All</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Date dialog */}
      <Dialog open={showAddDate} onOpenChange={setShowAddDate}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Date</DialogTitle>
            <DialogDescription className="text-xs">Add a date column to the schedule</DialogDescription>
          </DialogHeader>
          <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="h-8 text-sm" autoFocus />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddDate(false); setNewDate('') }} className="text-[13px]">Cancel</Button>
            <Button size="sm" disabled={!newDate} onClick={handleAddDate} className="text-[13px]">Add Date</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Staff modal */}
      <AddStaffModal
        open={showAddStaff}
        onOpenChange={setShowAddStaff}
        rateCardData={rateCardData}
        estimate={estimate}
        onAdd={handleAddStaff}
      />
    </div>
  )
}

// ── Summary Metric ─────────────────────────────────────────────────────────────

function SummaryMetric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{label}</p>
      <p className={`text-base font-semibold tabular-nums ${color ?? 'text-foreground'}`}>{value}</p>
    </div>
  )
}
