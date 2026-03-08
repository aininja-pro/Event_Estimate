import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Trash2,
  Send,
  Search,
  Check,
  Plus,
  ChevronUp,
  ChevronDown,
  Calendar,
} from 'lucide-react'
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid'
import { EstimateStatusBar } from '@/components/EstimateStatusBar'
import { VersionHistoryPanel, HistoryButton } from '@/components/VersionHistoryPanel'
import { ApprovalBanner } from '@/components/ApprovalBanner'
import { getScheduleEntries, computeScheduleRollup } from '@/lib/schedule-service'
import {
  transitionStatus,
  submitForApproval,
  getPendingApproval,
  reviewApproval,
} from '@/lib/workflow-service'
import type { EstimateStatus, ApprovalRequest } from '@/types/workflow'
import type { ScheduleEntry, LaborRollupRow } from '@/types/schedule'
import {
  getEstimate,
  updateEstimate,
  getLaborLogs,
  createLaborLog,
  deleteLaborLog,
  updateLaborLog,
  getLaborEntries,
  createLaborEntry,
  updateLaborEntry,
  deleteLaborEntry,
  getLineItemsByLocation,
  createLineItem,
  updateLineItem,
  deleteLineItem,
} from '@/lib/estimate-service'
import { getRateCardItemsBySection } from '@/lib/rate-card-service'
import type { EstimateWithClient, EstimateUpdate, LaborLog, LaborEntry, EstimateLineItem } from '@/types/estimate'
import type { RateCardItemsBySection } from '@/types/rate-card'

// ── Constants ────────────────────────────────────────────────────────────────

const TAB_TO_RC_SECTION: Record<string, string> = {
  production: 'Production Expenses',
  travel: 'Travel Expenses',
  creative: 'Creative Costs',
  access: 'Logistics Expenses',
}

const EVENT_TYPES = [
  'Ride & Drive',
  'Static Display',
  'Press Event',
  'Chauffeur',
  'Auto Show',
  'Tour',
  'Fleet',
  'Other',
]

const STATUS_DOT: Record<string, string> = {
  pipeline: 'bg-zinc-400',
  draft: 'bg-amber-400/80',
  review: 'bg-sky-400/70',
  approved: 'bg-emerald-400/70',
  active: 'bg-emerald-400/70',
  recap: 'bg-violet-400/70',
  complete: 'bg-zinc-400',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function pct(gp: number, rev: number): string {
  if (rev === 0) return '0.0%'
  return ((gp / rev) * 100).toFixed(1) + '%'
}

function computeDuration(start: string | null, end: string | null): number | null {
  if (!start || !end) return null
  const d = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1
  return d > 0 ? d : null
}

// ── AI Panel (Static Mockup — wired up in Weeks 8-10) ──────────────────────

const nudges = [
  { type: 'suggestion' as const, icon: '💡', label: 'STAFFING SUGGESTION', message: 'For Mazda ride & drives with 5,000 attendees, you typically staff 2 In-Vehicle Hosts per 500 attendees. Your current plan has 8 — consider scaling to 10.', footer: 'Based on 14 similar Mazda events' },
  { type: 'warning' as const, icon: '⚠️', label: 'COST ALERT', message: 'LA logistics costs have come in 20% over budget on the last 6 LA-based ride & drive events. Consider adding a 15-20% buffer to your logistics line items.', footer: 'Based on 6 LA ride & drive events' },
  { type: 'validation' as const, icon: '✅', label: 'VALIDATION', message: 'Insurance line item detected. ✓ 94% of ride & drive events in this revenue range include General Liability + Auto coverage.', footer: 'Validated against 342 ride & drive events' },
  { type: 'insight' as const, icon: '📊', label: 'MARGIN INSIGHT', message: 'Your current blended GP is 20.5%. The average for Mazda events in this revenue range is 28.3%. Labor margins look healthy — check production and travel markups.', footer: 'Based on 23 Mazda events ($75K-$150K range)' },
  { type: 'suggestion' as const, icon: '💡', label: 'MISSING ITEM CHECK', message: "You haven't included a Vehicle Detailing line item. 87% of ride & drive events include detailing services ($150-$300/vehicle/day).", footer: 'Based on 342 ride & drive events' },
]

const nudgeColors = {
  suggestion: { accent: 'border-l-zinc-400/60', label: 'text-zinc-500' },
  warning: { accent: 'border-l-amber-400/50', label: 'text-amber-600' },
  validation: { accent: 'border-l-green-700/30', label: 'text-green-800/50' },
  insight: { accent: 'border-l-violet-400/50', label: 'text-violet-500/70' },
}

function AINudgePanel() {
  return (
    <div className="flex h-full flex-col">
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-3">Intelligence</p>
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {nudges.map((nudge, i) => {
          const colors = nudgeColors[nudge.type]
          return (
            <div key={i} className={`rounded-sm border-l-2 ${colors.accent} bg-muted/5 px-3 py-2`}>
              <span className={`text-[9px] font-medium tracking-widest uppercase ${colors.label}`}>{nudge.label}</span>
              <p className="mt-0.5 text-[12px] leading-relaxed text-foreground/90">{nudge.message}</p>
              <p className="mt-1 text-[10px] text-muted-foreground/70">{nudge.footer}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-3 pt-2.5 border-t border-border/40">
        <div className="flex gap-1.5">
          <Textarea placeholder="Ask about this estimate..." className="min-h-[40px] resize-none text-xs border-border/40 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/60" readOnly />
          <button className="shrink-0 self-end p-1.5 text-muted-foreground/60 hover:text-foreground/60 transition-colors"><Send className="h-3 w-3" /></button>
        </div>
      </div>
    </div>
  )
}

// ── Combo Input (dropdown with options + custom text) ────────────────────────

const ATTENDANCE_RANGES = [
  '1–25',
  '25–50',
  '50–100',
  '100–250',
  '250–500',
  '500–1,000',
  '1,000–2,500',
  '2,500–5,000',
  '5,000+',
]

function ComboInput({
  value,
  options,
  onChange,
  onSave,
  className,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
  onSave: (v: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('click', handleClick, true)
      return () => document.removeEventListener('click', handleClick, true)
    }
  }, [open])

  function selectOption(opt: string) {
    onChange(opt)
    onSave(opt)
    setOpen(false)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => onSave(value)}
        placeholder=""
        className={className}
      />
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-zinc-900 border border-border/50 rounded-md shadow-lg py-1 max-h-[200px] overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              onMouseDown={(e) => { e.preventDefault(); selectOption(opt) }}
              className="block w-full text-left px-3 py-1 text-[13px] hover:bg-muted/50 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Event Header ─────────────────────────────────────────────────────────────

function EventHeader({
  estimate,
  onUpdate,
}: {
  estimate: EstimateWithClient
  onUpdate: (updates: EstimateUpdate) => void
}) {
  const [eventName, setEventName] = useState(estimate.event_name)
  const [eventType, setEventType] = useState(estimate.event_type ?? '')
  const [location, setLocation] = useState(estimate.location ?? '')
  const [startDate, setStartDate] = useState(estimate.start_date ?? '')
  const [endDate, setEndDate] = useState(estimate.end_date ?? '')
  const [attendance, setAttendance] = useState(estimate.expected_attendance?.toString() ?? '')
  const [poNumber, setPoNumber] = useState(estimate.po_number ?? '')
  const [projectId, setProjectId] = useState(estimate.project_id ?? '')
  const [internalNotes, setInternalNotes] = useState(estimate.internal_notes ?? '')
  const [publishedNotes, setPublishedNotes] = useState(estimate.published_notes ?? '')
  const [showNotes, setShowNotes] = useState(!!(estimate.internal_notes || estimate.published_notes))

  function saveField(field: string, value: string | number | null) {
    const updates: EstimateUpdate = { [field]: value || null }
    if (field === 'start_date' || field === 'end_date') {
      const s = field === 'start_date' ? (value as string) : startDate
      const e = field === 'end_date' ? (value as string) : endDate
      updates.duration_days = computeDuration(s, e)
    }
    onUpdate(updates)
  }

  const fieldLabel = "mb-0.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium"
  const fieldInput = "h-7 text-[13px] font-medium rounded-none border-0 border-b border-border/40 bg-transparent hover:border-border/60 focus-visible:border-foreground/40 focus-visible:ring-0 px-0 transition-colors"
  const readOnlyField = "h-7 text-[13px] font-medium border-0 bg-transparent cursor-default px-0 text-muted-foreground"

  return (
    <div className="border border-border/50 bg-slate-50 dark:bg-slate-800/50 rounded-md px-4 py-3">
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[estimate.status] ?? 'bg-zinc-400'}`} />
        <span className="text-[11px] text-muted-foreground/50 font-medium">{estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}</span>
      </div>
      <div className="grid grid-cols-4 gap-x-5 gap-y-2">
        <div>
          <p className={fieldLabel}>Client</p>
          <Input readOnly value={estimate.clients.name} className={readOnlyField} />
        </div>
        <div>
          <p className={fieldLabel}>Event Type</p>
          <ComboInput value={eventType} options={EVENT_TYPES} onChange={setEventType} onSave={(v) => saveField('event_type', v || null)} className={fieldInput} />
        </div>
        <div className="col-span-2">
          <p className={fieldLabel}>Event Name</p>
          <Input value={eventName} onChange={(e) => setEventName(e.target.value)} onBlur={() => saveField('event_name', eventName)} className={fieldInput} />
        </div>
        <div>
          <p className={fieldLabel}>Location</p>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} onBlur={() => saveField('location', location)} className={fieldInput} />
        </div>
        <div>
          <p className={fieldLabel}>Start Date</p>
          <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); saveField('start_date', e.target.value) }} className={fieldInput} />
        </div>
        <div>
          <p className={fieldLabel}>End Date</p>
          <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); saveField('end_date', e.target.value) }} className={fieldInput} />
        </div>
        <div>
          <p className={fieldLabel}>Attendance</p>
          <ComboInput value={attendance} options={ATTENDANCE_RANGES} onChange={setAttendance} onSave={(v) => saveField('expected_attendance', v || null)} className={fieldInput} />
        </div>
        <div>
          <p className={fieldLabel}>PO Number</p>
          <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} onBlur={() => saveField('po_number', poNumber)} className={fieldInput} />
        </div>
        <div>
          <p className={fieldLabel}>Project ID</p>
          <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} onBlur={() => saveField('project_id', projectId)} className={fieldInput} />
        </div>
        <div>
          <p className={fieldLabel}>Cost Structure</p>
          <div className="flex items-center gap-0 h-7">
            <button type="button" onClick={() => onUpdate({ cost_structure: 'corporate' })} className={`text-[13px] transition-colors ${estimate.cost_structure === 'corporate' ? 'font-medium text-foreground border-b border-foreground/40' : 'text-muted-foreground/70 hover:text-foreground/90'}`}>Corporate</button>
            <span className="mx-2 text-border/40">/</span>
            <button type="button" onClick={() => onUpdate({ cost_structure: 'office' })} className={`text-[13px] transition-colors ${estimate.cost_structure === 'office' ? 'font-medium text-foreground border-b border-foreground/40' : 'text-muted-foreground/70 hover:text-foreground/90'}`}>Office</button>
          </div>
        </div>
        <div>
          <p className={fieldLabel}>Duration</p>
          <Input readOnly value={estimate.duration_days ? `${estimate.duration_days} days` : '—'} className={readOnlyField} />
        </div>
      </div>
      {!showNotes ? (
        <button onClick={() => setShowNotes(true)} className="mt-2.5 text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground/60 transition-colors font-medium">
          + Add notes
        </button>
      ) : (
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          <div>
            <p className={fieldLabel}>Internal Notes <span className="text-muted-foreground/40 normal-case tracking-normal">(not shown to client)</span></p>
            <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} onBlur={() => saveField('internal_notes', internalNotes)} className="min-h-[40px] text-[13px] border-border/40 bg-transparent resize-none focus-visible:ring-0 focus-visible:border-border/40" placeholder="Internal team notes..." />
          </div>
          <div>
            <p className={fieldLabel}>Published Notes <span className="text-muted-foreground/40 normal-case tracking-normal">(shown on estimate)</span></p>
            <Textarea value={publishedNotes} onChange={(e) => setPublishedNotes(e.target.value)} onBlur={() => saveField('published_notes', publishedNotes)} className="min-h-[40px] text-[13px] border-border/40 bg-transparent resize-none focus-visible:ring-0 focus-visible:border-border/40" placeholder="Notes visible to client..." />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Add Role Modal ───────────────────────────────────────────────────────────

function AddRoleModal({
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
  onAdd: (entries: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }[]) => void
}) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customRate, setCustomRate] = useState('')
  type CustomRole = { id: string; role_name: string; unit_rate: number }
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([])

  // Clear selections when modal opens/closes
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

  // Filter to labor sections only
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
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAddCustom() {
    if (!customName.trim()) return
    const id = `custom-${Date.now()}`
    setCustomRoles((prev) => [...prev, { id, role_name: customName.trim(), unit_rate: parseFloat(customRate) || 0 }])
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
        unit_rate: role.unit_rate ?? 0,
        cost_rate: isOffice && role.unit_rate
          ? role.unit_rate * (1 - estimate.clients.office_payout_pct)
          : null,
        gl_code: role.gl_code,
        rate_card_item_id: role.id,
      }))
    const customEntries = customRoles
      .filter((r) => selectedIds.has(r.id))
      .map((role) => ({
        role_name: role.role_name,
        unit_rate: role.unit_rate,
        cost_rate: isOffice && role.unit_rate
          ? role.unit_rate * (1 - estimate.clients.office_payout_pct)
          : null,
        gl_code: null as string | null,
        rate_card_item_id: null as string | null,
      }))
    onAdd([...rcEntries, ...customEntries])
    onOpenChange(false)
  }

  const totalSelected = selectedIds.size

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add Roles from Rate Card</DialogTitle>
          <DialogDescription className="text-xs">Select roles from {estimate.clients.name}'s rate card</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm border-border/30" autoFocus />
        </div>
        <div className="max-h-[300px] overflow-y-auto space-y-0.5">
          {filtered.length === 0 && customRoles.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center py-4">No matching roles found</p>
          )}
          {filtered.map((role) => {
            const selected = selectedIds.has(role.id)
            return (
              <button
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`w-full text-left px-3 py-1.5 rounded-sm transition-colors flex items-start gap-2.5 ${selected ? 'bg-muted/60' : 'hover:bg-muted/40'}`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border ${selected ? 'bg-green-800/15 border-green-800/40' : 'border-border/50'} flex items-center justify-center`}>
                  {selected && <Check className="h-3 w-3 text-green-800/70" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground/90">{role.name}</span>
                    <span className="text-[13px] text-muted-foreground/60 tabular-nums">
                      {role.unit_rate ? `$${role.unit_rate.toLocaleString()}` : 'Pass-through'}
                      {role.unit_label ? ` ${role.unit_label}` : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">{role.sectionName}{role.gl_code ? ` · GL ${role.gl_code}` : ''}</p>
                </div>
              </button>
            )
          })}
          {/* Custom roles already added */}
          {customRoles.map((role) => {
            const selected = selectedIds.has(role.id)
            return (
              <button
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`w-full text-left px-3 py-1.5 rounded-sm transition-colors flex items-start gap-2.5 ${selected ? 'bg-muted/60' : 'hover:bg-muted/40'}`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border ${selected ? 'bg-green-800/15 border-green-800/40' : 'border-border/50'} flex items-center justify-center`}>
                  {selected && <Check className="h-3 w-3 text-green-800/70" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground/90">{role.role_name}</span>
                    <span className="text-[13px] text-muted-foreground/60 tabular-nums">
                      {role.unit_rate ? `$${role.unit_rate.toLocaleString()}` : '$0'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">Custom role</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Custom role inline form */}
        {showCustom ? (
          <div className="border border-border/40 rounded-md p-2.5 space-y-2 bg-muted/20">
            <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">Custom Role</p>
            <div className="flex gap-2">
              <Input
                placeholder="Role name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-7 text-[13px] border-border/40 flex-1"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Input
                type="number"
                placeholder="Rate"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                className="h-7 text-[13px] border-border/40 w-24"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5" onClick={handleAddCustom} disabled={!customName.trim()}>Add</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/80 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add custom role
          </button>
        )}

        <DialogFooter>
          <Button
            onClick={handleAddSelected}
            disabled={totalSelected === 0}
            size="sm"
            className="text-xs bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm"
          >
            {totalSelected === 0
              ? 'Select roles to add'
              : `Add ${totalSelected} Role${totalSelected > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Segment Selector (shared across Labor Log + Line Item tabs) ──────────────

function LocationSelector({
  laborLogs,
  activeLocationId,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onRenameLocation,
}: {
  laborLogs: LaborLog[]
  activeLocationId: string | null
  onSelectLocation: (id: string) => void
  onAddLocation: (name: string) => void
  onDeleteLocation: (id: string) => void
  onRenameLocation: (id: string, name: string) => void
}) {
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [newLocationName, setNewLocationName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  function startEditing(log: LaborLog) {
    setEditingId(log.id)
    setEditingName(log.location_name)
  }

  function commitEdit() {
    if (editingId && editingName.trim() && editingName.trim() !== laborLogs.find((l) => l.id === editingId)?.location_name) {
      onRenameLocation(editingId, editingName.trim())
    }
    setEditingId(null)
    setEditingName('')
  }

  return (
    <>
      <div className="flex items-center gap-1 flex-wrap py-0.5">
        {laborLogs.map((log) => (
          editingId === log.id ? (
            <input
              key={log.id}
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') { setEditingId(null); setEditingName('') } }}
              autoFocus
              className="text-[11px] px-2 py-0.5 rounded font-medium bg-white dark:bg-slate-900 border border-border/50 outline-none w-[120px]"
            />
          ) : (
            <button
              key={log.id}
              onClick={() => onSelectLocation(log.id)}
              onDoubleClick={() => startEditing(log)}
              className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                log.id === activeLocationId
                  ? 'font-medium text-foreground bg-slate-100 dark:bg-slate-800/50'
                  : 'text-muted-foreground/70 hover:text-foreground/80 hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
            >
              {log.location_name}{log.is_primary ? ' (Primary)' : ''}
            </button>
          )
        ))}
        <button onClick={() => setShowAddLocation(true)} className="text-[11px] px-2 py-0.5 rounded text-muted-foreground/50 hover:text-foreground/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
          + Add Segment
        </button>
        {activeLocationId && laborLogs.length > 1 && !laborLogs.find((l) => l.id === activeLocationId)?.is_primary && (
          <button
            className="text-[11px] px-2 py-0.5 rounded text-muted-foreground/30 hover:text-red-800/60 hover:bg-red-800/5 transition-colors"
            onClick={() => {
              if (confirm('Delete this segment and all its data?')) {
                onDeleteLocation(activeLocationId)
              }
            }}
          >
            Remove
          </button>
        )}
      </div>

      <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Add Segment</DialogTitle>
            <DialogDescription className="text-xs">Add a geographic location or time period for this estimate</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs">Segment Name</Label>
            <Input placeholder="e.g., San Diego or January 2026" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} className="h-8 text-sm border-border/50" autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddLocation(false); setNewLocationName('') }} className="text-[13px]">Cancel</Button>
            <Button size="sm" disabled={!newLocationName.trim()} onClick={() => { onAddLocation(newLocationName.trim()); setNewLocationName(''); setShowAddLocation(false) }} className="text-[13px] bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm">Add Segment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Labor Log Tab ────────────────────────────────────────────────────────────

function LaborLogTab({
  estimate,
  laborLogs,
  activeLocationId,
  entries,
  rateCardData,
  allEntriesMap,
  scheduleEntriesMap,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onRenameLocation,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onSwitchToSchedule,
}: {
  estimate: EstimateWithClient
  laborLogs: LaborLog[]
  activeLocationId: string | null
  entries: LaborEntry[]
  rateCardData: RateCardItemsBySection[]
  allEntriesMap: Record<string, LaborEntry[]>
  scheduleEntriesMap: Record<string, ScheduleEntry[]>
  onSelectLocation: (id: string) => void
  onAddLocation: (name: string) => void
  onDeleteLocation: (id: string) => void
  onRenameLocation: (id: string, name: string) => void
  onAddEntry: (entries: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }[]) => void
  onUpdateEntry: (id: string, updates: Partial<LaborEntry>) => void
  onDeleteEntry: (id: string) => void
  onSwitchToSchedule: () => void
}) {
  const [showAddRole, setShowAddRole] = useState(false)

  // Check if the active segment has schedule data
  const activeScheduleEntries = activeLocationId ? (scheduleEntriesMap[activeLocationId] ?? []) : []
  const hasScheduleData = activeScheduleEntries.length > 0
  const activeRollup = hasScheduleData ? computeScheduleRollup(activeScheduleEntries) : []

  // Active segment summary (from schedule rollup or manual entries)
  const activeLog = laborLogs.find((l) => l.id === activeLocationId)
  let segRevenue: number, segCost: number, segGP: number, segStaff: number

  if (hasScheduleData) {
    segRevenue = activeRollup.reduce((s, r) => s + r.revenue_total, 0)
    segCost = activeRollup.reduce((s, r) => s + r.cost_total, 0)
    segGP = segRevenue - segCost
    segStaff = activeRollup.reduce((s, r) => s + r.quantity, 0)
  } else {
    const segLabor = entries.filter((e) => !e.role_name.toLowerCase().includes('per diem'))
    segRevenue = segLabor.reduce((sum, e) => sum + e.quantity * e.days * (e.override_rate ?? e.unit_rate), 0)
    segCost = segLabor.reduce((sum, e) => sum + e.quantity * e.days * (e.cost_rate ?? 0), 0)
    segGP = segRevenue - segCost
    segStaff = segLabor.reduce((sum, e) => sum + e.quantity, 0)
  }

  // All-segments summary
  let laborRevenue = 0, laborCost = 0, laborGP = 0, staffCount = 0, perDiemTotal = 0
  for (const log of laborLogs) {
    const schedEntries = scheduleEntriesMap[log.id] ?? []
    if (schedEntries.length > 0) {
      const rollup = computeScheduleRollup(schedEntries)
      laborRevenue += rollup.reduce((s, r) => s + r.revenue_total, 0)
      laborCost += rollup.reduce((s, r) => s + r.cost_total, 0)
      staffCount += rollup.reduce((s, r) => s + r.quantity, 0)
    } else {
      const allEntries = allEntriesMap[log.id] ?? []
      const labor = allEntries.filter((e) => !e.role_name.toLowerCase().includes('per diem'))
      const perDiem = allEntries.filter((e) => e.role_name.toLowerCase().includes('per diem'))
      laborRevenue += labor.reduce((sum, e) => sum + e.quantity * e.days * (e.override_rate ?? e.unit_rate), 0)
      laborCost += labor.reduce((sum, e) => sum + e.quantity * e.days * (e.cost_rate ?? 0), 0)
      staffCount += labor.reduce((sum, e) => sum + e.quantity, 0)
      perDiemTotal += perDiem.reduce((sum, e) => sum + e.quantity * e.days * (e.override_rate ?? e.unit_rate), 0)
    }
  }
  laborGP = laborRevenue - laborCost

  return (
    <div className="space-y-2">
      <LocationSelector
        laborLogs={laborLogs}
        activeLocationId={activeLocationId}
        onSelectLocation={onSelectLocation}
        onAddLocation={onAddLocation}
        onDeleteLocation={onDeleteLocation}
        onRenameLocation={onRenameLocation}
      />

      {/* Schedule-driven banner */}
      {hasScheduleData && (
        <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-200/50 rounded-md">
          <Calendar className="h-3.5 w-3.5 text-sky-600/70" />
          <p className="text-[12px] text-sky-800/70">This labor log is driven by the Schedule tab. Edit the schedule to update labor.</p>
        </div>
      )}

      {/* Labor Table */}
      <div>
        {hasScheduleData ? (
          /* Read-only rollup from schedule data */
          activeRollup.length === 0 ? (
            <p className="text-xs text-muted-foreground/70 text-center py-6">No staff scheduled yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableHead className="w-[200px] text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Role</TableHead>
                  <TableHead className="text-center w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Qty</TableHead>
                  <TableHead className="text-center w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Days</TableHead>
                  <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Day Rate</TableHead>
                  <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Line Total</TableHead>
                  <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Cost Rate</TableHead>
                  <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Cost Total</TableHead>
                  <TableHead className="text-right w-20 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">GP</TableHead>
                  <TableHead className="text-right w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">GP%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRollup.map((row, idx) => {
                  const gp = row.revenue_total - row.cost_total
                  return (
                    <TableRow key={idx} className="border-b border-border/10 hover:bg-muted/30">
                      <TableCell className="py-1.5 text-[13px] font-medium">{row.role_name}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-center tabular-nums">{row.quantity}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-center tabular-nums">{row.total_days}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums">{fmt(row.day_rate)}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums">{fmt(row.revenue_total)}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums">{fmt(row.cost_rate)}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums">{fmt(row.cost_total)}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums text-green-800/60 font-medium">{fmt(gp)}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums">{pct(gp, row.revenue_total)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )
        ) : (
          /* Editable labor entries (no schedule data — backward compat) */
          <>
            {entries.length === 0 ? (
              <p className="text-xs text-muted-foreground/70 text-center py-6">No roles added yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableHead className="w-[200px] text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Role</TableHead>
                    <TableHead className="text-center w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Qty</TableHead>
                    <TableHead className="text-center w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Days</TableHead>
                    <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Day Rate</TableHead>
                    <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Line Total</TableHead>
                    <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Cost Rate</TableHead>
                    <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Cost Total</TableHead>
                    <TableHead className="text-right w-20 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">GP</TableHead>
                    <TableHead className="text-right w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">GP%</TableHead>
                    <TableHead className="w-6" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <LaborEntryRow
                      key={entry.id}
                      entry={entry}
                      isOffice={estimate.cost_structure === 'office'}
                      officePayout={estimate.clients.office_payout_pct}
                      onUpdate={onUpdateEntry}
                      onDelete={onDeleteEntry}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
        {hasScheduleData ? (
          <button onClick={onSwitchToSchedule} className="mt-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/90 transition-colors">
            + Add Staff on Schedule
          </button>
        ) : (
          <button onClick={() => setShowAddRole(true)} className="mt-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/90 transition-colors">
            + Add Role
          </button>
        )}
      </div>

      {/* Labor Summary — two compact lines */}
      <div className="mt-1.5 space-y-1 border-t border-border/40 pt-2.5">
        <p className="text-[13px] tabular-nums">
          <span className="font-medium text-foreground">{activeLog?.location_name ?? 'Segment'}:</span>{' '}
          <span className="text-foreground/90">{fmt(segRevenue)} rev</span>
          <span className="text-muted-foreground/60 mx-1">·</span>
          <span className="text-foreground/90">{fmt(segCost)} cost</span>
          <span className="text-muted-foreground/60 mx-1">·</span>
          <span className="text-green-800/60 font-medium">{fmt(segGP)} GP</span>
          <span className="text-muted-foreground/60 mx-1">·</span>
          <span className="text-foreground/80">{pct(segGP, segRevenue)}</span>
          <span className="text-muted-foreground/60 mx-1">·</span>
          <span className="text-foreground/80">{segStaff} staff</span>
        </p>
        {laborLogs.length > 1 && (
          <p className="text-[13px] tabular-nums text-muted-foreground/60">
            <span className="font-medium text-muted-foreground/70">All Segments:</span>{' '}
            <span>{fmt(laborRevenue)} rev</span>
            <span className="text-muted-foreground/60 mx-1">·</span>
            <span>{fmt(laborCost)} cost</span>
            <span className="text-muted-foreground/60 mx-1">·</span>
            <span className="text-green-800/60 font-medium">{fmt(laborGP)} GP</span>
            <span className="text-muted-foreground/60 mx-1">·</span>
            <span>{staffCount} staff</span>
            {perDiemTotal > 0 && (<>
              <span className="text-muted-foreground/60 mx-1">·</span>
              <span>{fmt(perDiemTotal)} per diem</span>
            </>)}
          </p>
        )}
      </div>

      {/* Modals (only used in manual mode) */}
      {!hasScheduleData && (
        <AddRoleModal
          open={showAddRole}
          onOpenChange={setShowAddRole}
          rateCardData={rateCardData}
          estimate={estimate}
          onAdd={onAddEntry}
        />
      )}
    </div>
  )
}

// ── Stepper Input (up/down arrows for integer fields) ────────────────────────

function StepperInput({
  value,
  onChange,
  onBlur,
  onStep,
  min = 0,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  onStep: (newValue: number) => void
  min?: number
  className?: string
}) {
  function step(delta: number) {
    const next = Math.max(min, (parseInt(value) || 0) + delta)
    onChange(next.toString())
    onStep(next)
  }

  return (
    <div className="flex items-center justify-center gap-0.5 mx-auto group/stepper">
      <div className="flex flex-col opacity-0 group-hover/stepper:opacity-100 transition-opacity">
        <button onClick={() => step(1)} className="h-3 w-3.5 flex items-center justify-center rounded-sm hover:bg-muted/60 text-muted-foreground/50 hover:text-foreground/70" tabIndex={-1}>
          <ChevronUp className="h-3 w-3" />
        </button>
        <button onClick={() => step(-1)} className="h-3 w-3.5 flex items-center justify-center rounded-sm hover:bg-muted/60 text-muted-foreground/50 hover:text-foreground/70" tabIndex={-1}>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className={`${className} w-10 text-center`} />
    </div>
  )
}

// ── Labor Entry Row ──────────────────────────────────────────────────────────

function LaborEntryRow({
  entry,
  isOffice,
  officePayout,
  onUpdate,
  onDelete,
}: {
  entry: LaborEntry
  isOffice: boolean
  officePayout: number
  onUpdate: (id: string, updates: Partial<LaborEntry>) => void
  onDelete: (id: string) => void
}) {
  const [qty, setQty] = useState(entry.quantity.toString())
  const [days, setDays] = useState(entry.days.toString())
  const [rate, setRate] = useState((entry.override_rate ?? entry.unit_rate).toString())
  const [costRate, setCostRate] = useState((entry.cost_rate ?? '').toString())

  const effectiveRate = parseFloat(rate) || 0
  const effectiveCost = isOffice ? effectiveRate * (1 - officePayout) : (parseFloat(costRate) || 0)
  const qtyNum = parseInt(qty) || 0
  const daysNum = parseInt(days) || 0
  const lineTotal = qtyNum * daysNum * effectiveRate
  const costTotal = qtyNum * daysNum * effectiveCost
  const gp = lineTotal - costTotal
  const gpPct = lineTotal > 0 ? ((gp / lineTotal) * 100).toFixed(0) : '0'
  const isOverridden = entry.override_rate !== null && entry.override_rate !== entry.unit_rate

  function saveQty() {
    const v = parseInt(qty) || 1
    setQty(v.toString())
    onUpdate(entry.id, { quantity: v })
  }

  function saveDays() {
    const v = parseInt(days) || 1
    setDays(v.toString())
    onUpdate(entry.id, { days: v })
  }

  function saveRate() {
    const v = parseFloat(rate) || 0
    if (v !== entry.unit_rate) {
      onUpdate(entry.id, { override_rate: v, override_reason: 'Custom rate' })
    } else {
      onUpdate(entry.id, { override_rate: null, override_reason: null })
    }
  }

  function saveCostRate() {
    const v = parseFloat(costRate) || 0
    onUpdate(entry.id, { cost_rate: v })
  }

  const cellInput = "h-6 text-[13px] bg-transparent border-0 focus-visible:ring-0 focus-visible:bg-muted/50 rounded-sm transition-colors tabular-nums"

  return (
    <TableRow className="group border-b border-border/30 hover:bg-muted/30">
      <TableCell className="py-1">
        <span className="text-[13px] text-foreground">{entry.role_name}</span>
        {isOverridden && <span className="ml-1 text-[9px] text-amber-600 font-medium">*</span>}
      </TableCell>
      <TableCell className="text-center py-1">
        <StepperInput value={qty} onChange={setQty} onBlur={saveQty} onStep={(v) => onUpdate(entry.id, { quantity: v })} min={0} className={cellInput} />
      </TableCell>
      <TableCell className="text-center py-1">
        <StepperInput value={days} onChange={setDays} onBlur={saveDays} onStep={(v) => onUpdate(entry.id, { days: v })} min={0} className={cellInput} />
      </TableCell>
      <TableCell className="text-right py-1">
        <div className="relative w-[72px] ml-auto">
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground/60 pointer-events-none">$</span>
          <Input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            onBlur={saveRate}
            className={`${cellInput} w-full text-right pl-4 ${isOverridden ? 'text-amber-600' : ''}`}
          />
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <span className="text-[13px] font-medium tabular-nums text-foreground">{fmt(lineTotal)}</span>
      </TableCell>
      <TableCell className="text-right py-1">
        {isOffice ? (
          <span className="text-[13px] text-muted-foreground/50 tabular-nums">{fmt(effectiveCost)}</span>
        ) : (
          <div className="relative w-[72px] ml-auto">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground/60 pointer-events-none">$</span>
            <Input value={costRate} onChange={(e) => setCostRate(e.target.value)} onBlur={saveCostRate} className={`${cellInput} w-full text-right pl-4`} />
          </div>
        )}
      </TableCell>
      <TableCell className="text-right py-1">
        <span className="text-[13px] font-medium tabular-nums text-foreground">{fmt(costTotal)}</span>
      </TableCell>
      <TableCell className="text-right py-1">
        <span className="text-[13px] font-medium tabular-nums text-green-800/60">{fmt(gp)}</span>
      </TableCell>
      <TableCell className="text-right py-1">
        <span className="text-[13px] tabular-nums text-muted-foreground/50">{gpPct}%</span>
      </TableCell>
      <TableCell className="py-1">
        <Trash2
          className="h-3 w-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity cursor-pointer text-foreground/60"
          onClick={() => onDelete(entry.id)}
        />
      </TableCell>
    </TableRow>
  )
}

// ── Line Item Tab ────────────────────────────────────────────────────────────

function LineItemTab({
  items,
  section,
  isPassThrough,
  defaultMarkup,
  rateCardData,
  clientName,
  laborLogs,
  activeLocationId,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onRenameLocation,
  onAdd,
  onUpdate,
  onDelete,
}: {
  items: EstimateLineItem[]
  section: string
  isPassThrough: boolean
  defaultMarkup: number
  rateCardData: RateCardItemsBySection[]
  clientName: string
  laborLogs: LaborLog[]
  activeLocationId: string | null
  onSelectLocation: (id: string) => void
  onAddLocation: (name: string) => void
  onDeleteLocation: (id: string) => void
  onRenameLocation: (id: string, name: string) => void
  onAdd: (items: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }[]) => void
  onUpdate: (id: string, updates: Partial<EstimateLineItem>) => void
  onDelete: (id: string) => void
}) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-2">
      <LocationSelector
        laborLogs={laborLogs}
        activeLocationId={activeLocationId}
        onSelectLocation={onSelectLocation}
        onAddLocation={onAddLocation}
        onDeleteLocation={onDeleteLocation}
        onRenameLocation={onRenameLocation}
      />

      <div>
        {isPassThrough && (
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium mb-1.5">
            Pass-through · {defaultMarkup}% markup
          </p>
        )}
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground/70 text-center py-6">No items added yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <TableHead className="w-[200px] text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Item</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Description</TableHead>
                <TableHead className="text-center w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Qty</TableHead>
                <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Unit Cost</TableHead>
                <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Total</TableHead>
                <TableHead className="text-center w-18 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Markup</TableHead>
                <TableHead className="text-right w-28 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Client Total</TableHead>
                <TableHead className="w-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <LineItemRow key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
              ))}
            </TableBody>
          </Table>
        )}
        <button onClick={() => setShowModal(true)} className="mt-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/90 transition-colors">
          + Add Item
        </button>
      </div>

      <AddLineItemModal
        open={showModal}
        onOpenChange={setShowModal}
        section={section}
        defaultMarkup={defaultMarkup}
        rateCardData={rateCardData}
        clientName={clientName}
        onAdd={onAdd}
      />
    </div>
  )
}

// ── Line Item Row ────────────────────────────────────────────────────────────

function LineItemRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: EstimateLineItem
  onUpdate: (id: string, updates: Partial<EstimateLineItem>) => void
  onDelete: (id: string) => void
}) {
  const [qty, setQty] = useState(item.quantity.toString())
  const [unitCost, setUnitCost] = useState(item.unit_cost.toString())
  const [markup, setMarkup] = useState(item.markup_pct.toString())

  const qtyNum = parseFloat(qty) || 0
  const costNum = parseFloat(unitCost) || 0
  const markupNum = parseFloat(markup) || 0
  const total = qtyNum * costNum
  const clientTotal = total * (1 + markupNum / 100)

  const cellInput = "h-6 text-[13px] bg-transparent border-0 focus-visible:ring-0 focus-visible:bg-muted/50 rounded-sm transition-colors tabular-nums"

  return (
    <TableRow className="group border-b border-border/30 hover:bg-muted/30">
      <TableCell className="text-[13px] text-foreground py-1">{item.item_name}</TableCell>
      <TableCell className="text-[13px] text-muted-foreground/50 py-1">{item.description || '—'}</TableCell>
      <TableCell className="text-center py-1">
        <StepperInput value={qty} onChange={setQty} onBlur={() => onUpdate(item.id, { quantity: parseFloat(qty) || 1 })} onStep={(v) => onUpdate(item.id, { quantity: v })} min={0} className={cellInput} />
      </TableCell>
      <TableCell className="text-right py-1">
        <div className="relative w-[72px] ml-auto">
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground/60 pointer-events-none">$</span>
          <Input value={unitCost} onChange={(e) => setUnitCost(e.target.value)} onBlur={() => onUpdate(item.id, { unit_cost: parseFloat(unitCost) || 0 })} className={`${cellInput} w-full text-right pl-4`} />
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <span className="text-[13px] font-medium tabular-nums text-foreground">{fmt(total)}</span>
      </TableCell>
      <TableCell className="text-center py-1">
        <Input value={markup} onChange={(e) => setMarkup(e.target.value)} onBlur={() => onUpdate(item.id, { markup_pct: parseFloat(markup) || 0 })} className={`${cellInput} w-12 text-center mx-auto`} />
      </TableCell>
      <TableCell className="text-right py-1">
        <span className="text-[13px] font-medium tabular-nums text-foreground">{fmt(clientTotal)}</span>
      </TableCell>
      <TableCell className="py-1">
        <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity cursor-pointer text-foreground/60" onClick={() => onDelete(item.id)} />
      </TableCell>
    </TableRow>
  )
}

// ── Add Line Item Modal (Multi-Select from Rate Card) ────────────────────────

function AddLineItemModal({
  open,
  onOpenChange,
  section,
  defaultMarkup,
  rateCardData,
  clientName,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: string
  defaultMarkup: number
  rateCardData: RateCardItemsBySection[]
  clientName: string
  onAdd: (items: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }[]) => void
}) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCost, setCustomCost] = useState('')
  type CustomItem = { id: string; item_name: string; unit_cost: number }
  const [customItems, setCustomItems] = useState<CustomItem[]>([])

  // Clear selections when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set())
      setSearch('')
      setShowCustom(false)
      setCustomName('')
      setCustomCost('')
      setCustomItems([])
    }
  }, [open])

  // Find matching rate card section
  const rcSectionName = TAB_TO_RC_SECTION[section]
  const rcSection = rateCardData.find((s) => s.section.name === rcSectionName)
  const rcItems = (rcSection?.items ?? []).map((item) => ({ ...item, sectionName: rcSection?.section.name ?? '' }))
  const filtered = search
    ? rcItems.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : rcItems

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAddCustom() {
    if (!customName.trim()) return
    const id = `custom-${Date.now()}`
    setCustomItems((prev) => [...prev, { id, item_name: customName.trim(), unit_cost: parseFloat(customCost) || 0 }])
    setSelectedIds((prev) => new Set(prev).add(id))
    setCustomName('')
    setCustomCost('')
    setShowCustom(false)
  }

  function handleAddSelected() {
    const rcSelected = rcItems
      .filter((r) => selectedIds.has(r.id))
      .map((item) => ({
        item_name: item.name,
        description: '',
        quantity: 1,
        unit_cost: item.unit_rate ?? 0,
        markup_pct: defaultMarkup,
        gl_code: item.gl_code,
        rate_card_item_id: item.id,
      }))
    const customSelected = customItems
      .filter((r) => selectedIds.has(r.id))
      .map((item) => ({
        item_name: item.item_name,
        description: '',
        quantity: 1,
        unit_cost: item.unit_cost,
        markup_pct: defaultMarkup,
        gl_code: null as string | null,
        rate_card_item_id: null as string | null,
      }))
    onAdd([...rcSelected, ...customSelected])
    onOpenChange(false)
  }

  // Fallback: if no rate card section mapped (e.g., misc), show a simple free-text form
  if (!rcSectionName || rcItems.length === 0) {
    return <AddLineItemManualModal open={open} onOpenChange={onOpenChange} section={section} defaultMarkup={defaultMarkup} onAdd={(item) => onAdd([item])} />
  }

  const sectionLabel = rcSectionName.replace(' Expenses', '').replace(' Costs', '')
  const totalSelected = selectedIds.size

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add Items from Rate Card</DialogTitle>
          <DialogDescription className="text-xs">Select {sectionLabel.toLowerCase()} items from {clientName}'s rate card</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm border-border/30" autoFocus />
        </div>
        <div className="max-h-[300px] overflow-y-auto space-y-0.5">
          {filtered.length === 0 && customItems.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center py-4">No matching items found</p>
          )}
          {filtered.map((item) => {
            const selected = selectedIds.has(item.id)
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full text-left px-3 py-1.5 rounded-sm transition-colors flex items-start gap-2.5 ${selected ? 'bg-muted/60' : 'hover:bg-muted/40'}`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border ${selected ? 'bg-green-800/15 border-green-800/40' : 'border-border/50'} flex items-center justify-center`}>
                  {selected && <Check className="h-3 w-3 text-green-800/70" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground/90">{item.name}</span>
                    <span className="text-[13px] text-muted-foreground/60 tabular-nums">
                      {item.unit_rate ? `$${item.unit_rate.toLocaleString()}` : 'Pass-through'}
                      {item.unit_label ? ` ${item.unit_label}` : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">{item.sectionName}{item.gl_code ? ` · GL ${item.gl_code}` : ''}</p>
                </div>
              </button>
            )
          })}
          {/* Custom items already added */}
          {customItems.map((item) => {
            const selected = selectedIds.has(item.id)
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full text-left px-3 py-1.5 rounded-sm transition-colors flex items-start gap-2.5 ${selected ? 'bg-muted/60' : 'hover:bg-muted/40'}`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border ${selected ? 'bg-green-800/15 border-green-800/40' : 'border-border/50'} flex items-center justify-center`}>
                  {selected && <Check className="h-3 w-3 text-green-800/70" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground/90">{item.item_name}</span>
                    <span className="text-[13px] text-muted-foreground/60 tabular-nums">
                      {item.unit_cost ? `$${item.unit_cost.toLocaleString()}` : '$0'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">Custom item</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Custom item inline form */}
        {showCustom ? (
          <div className="border border-border/40 rounded-md p-2.5 space-y-2 bg-muted/20">
            <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">Custom Item</p>
            <div className="flex gap-2">
              <Input
                placeholder="Item name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-7 text-[13px] border-border/40 flex-1"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Input
                type="number"
                placeholder="Unit cost"
                value={customCost}
                onChange={(e) => setCustomCost(e.target.value)}
                className="h-7 text-[13px] border-border/40 w-24"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5" onClick={handleAddCustom} disabled={!customName.trim()}>Add</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/80 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add custom item
          </button>
        )}

        <DialogFooter>
          <Button
            onClick={handleAddSelected}
            disabled={totalSelected === 0}
            size="sm"
            className="text-xs bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm"
          >
            {totalSelected === 0
              ? 'Select items to add'
              : `Add ${totalSelected} Item${totalSelected > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Manual Add Line Item Modal (fallback for Misc tab) ───────────────────────

function AddLineItemManualModal({
  open,
  onOpenChange,
  section,
  defaultMarkup,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: string
  defaultMarkup: number
  onAdd: (item: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }) => void
}) {
  const [itemName, setItemName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitCost, setUnitCost] = useState('')
  const [markupPct, setMarkupPct] = useState(defaultMarkup.toString())

  function handleSave() {
    if (!itemName.trim()) return
    onAdd({
      item_name: itemName.trim(),
      description: description.trim(),
      quantity: parseFloat(quantity) || 1,
      unit_cost: parseFloat(unitCost) || 0,
      markup_pct: parseFloat(markupPct) || 0,
      gl_code: null,
      rate_card_item_id: null,
    })
    setItemName('')
    setDescription('')
    setQuantity('1')
    setUnitCost('')
    setMarkupPct(defaultMarkup.toString())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add Line Item</DialogTitle>
          <DialogDescription className="text-xs">Add to {section} section</DialogDescription>
        </DialogHeader>
        <div className="space-y-2.5">
          <div className="space-y-1">
            <Label className="text-xs">Item Name *</Label>
            <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Vehicle Transport" className="h-8 text-sm border-border/30" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Carrier delivery of 12 vehicles" className="h-8 text-sm border-border/30" />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs">Quantity</Label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-8 text-sm border-border/30" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit Cost ($)</Label>
              <Input type="number" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} className="h-8 text-sm border-border/30" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Markup %</Label>
              <Input type="number" value={markupPct} onChange={(e) => setMarkupPct(e.target.value)} className="h-8 text-sm border-border/30" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" disabled={!itemName.trim()} onClick={handleSave}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Summary Tab ──────────────────────────────────────────────────────────────

// Rate card section display order and line-item key mapping
const SUMMARY_SECTIONS = [
  { name: 'Planning & Administration Labor', type: 'labor', lineItemKey: null, passThrough: false },
  { name: 'Onsite Event Labor', type: 'labor', lineItemKey: null, passThrough: false },
  { name: 'Travel Expenses', type: 'line_item', lineItemKey: 'travel', passThrough: true },
  { name: 'Creative Costs', type: 'line_item', lineItemKey: 'creative', passThrough: false },
  { name: 'Production Expenses', type: 'line_item', lineItemKey: 'production', passThrough: true },
  { name: 'Logistics Expenses', type: 'line_item', lineItemKey: 'access', passThrough: false },
  { name: 'Misc', type: 'line_item', lineItemKey: 'misc', passThrough: false },
] as const

function SummaryTab({
  laborLogs,
  allEntriesMap,
  lineItemsMap,
  rateCardData,
  scheduleEntriesMap,
}: {
  laborLogs: LaborLog[]
  allEntriesMap: Record<string, LaborEntry[]>
  lineItemsMap: Record<string, EstimateLineItem[]>
  rateCardData: RateCardItemsBySection[]
  scheduleEntriesMap: Record<string, ScheduleEntry[]>
}) {
  // Build lookup: rate_card_item_id → rate_card_section name
  const itemSectionMap = new Map<string, string>()
  for (const { section, items } of rateCardData) {
    for (const item of items) {
      itemSectionMap.set(item.id, section.name)
    }
  }



  const hasMultipleSegments = laborLogs.length > 1

  // Categorize labor entries by rate card section
  function laborSectionName(entry: LaborEntry): string {
    if (entry.rate_card_item_id) {
      const sec = itemSectionMap.get(entry.rate_card_item_id)
      if (sec) return sec
    }
    // Default: onsite for day-rate roles, planning for hourly admin
    return 'Onsite Event Labor'
  }

  // Categorize schedule rollup rows by rate card item
  function rollupSectionName(row: LaborRollupRow, schedEntries: ScheduleEntry[]): string {
    // Find the first schedule entry matching this role to get its rate_card_item_id
    const entry = schedEntries.find((e) => e.role_name === row.role_name)
    if (entry?.rate_card_item_id) {
      const sec = itemSectionMap.get(entry.rate_card_item_id)
      if (sec) return sec
    }
    return 'Onsite Event Labor'
  }

  type DetailRow = {
    label: string
    detail: string  // e.g. "2 × 4 days × $700" or "3 × $200"
    revenue: number
    cost: number
    isSegmentHeader?: boolean
  }

  type SectionBlock = {
    name: string
    details: DetailRow[]
    total: { revenue: number; cost: number }
    passThrough: boolean
  }

  const blocks: SectionBlock[] = []

  for (const sec of SUMMARY_SECTIONS) {
    const details: DetailRow[] = []
    let totalRevenue = 0
    let totalCost = 0

    if (sec.type === 'labor') {
      for (const log of laborLogs) {
        const schedEntries = scheduleEntriesMap[log.id] ?? []

        if (schedEntries.length > 0) {
          // Schedule-driven: use rollup data
          const rollup = computeScheduleRollup(schedEntries)
          const sectionRows = rollup.filter((r) => rollupSectionName(r, schedEntries) === sec.name)
          if (sectionRows.length === 0) continue

          if (hasMultipleSegments) {
            details.push({ label: log.location_name, detail: '', revenue: 0, cost: 0, isSegmentHeader: true })
          }

          for (const r of sectionRows) {
            details.push({
              label: r.role_name,
              detail: `${r.quantity} × ${r.total_days}d × ${fmt(r.day_rate)}${r.total_ot_hours > 0 ? ` + ${r.total_ot_hours}h OT` : ''}`,
              revenue: r.revenue_total,
              cost: r.cost_total,
            })
            totalRevenue += r.revenue_total
            totalCost += r.cost_total
          }
        } else {
          // Manual labor entries (backward compat)
          const entries = (allEntriesMap[log.id] ?? []).filter(
            (e) => laborSectionName(e) === sec.name
          )
          if (entries.length === 0) continue

          if (hasMultipleSegments) {
            details.push({ label: log.location_name, detail: '', revenue: 0, cost: 0, isSegmentHeader: true })
          }

          for (const e of entries) {
            const rev = e.quantity * e.days * (e.override_rate ?? e.unit_rate)
            const cost = e.quantity * e.days * (e.cost_rate ?? 0)
            const rate = e.override_rate ?? e.unit_rate
            details.push({
              label: e.role_name,
              detail: `${e.quantity} × ${e.days}d × ${fmt(rate)}`,
              revenue: rev,
              cost,
            })
            totalRevenue += rev
            totalCost += cost
          }
        }
      }
    } else {
      for (const log of laborLogs) {
        const items = (lineItemsMap[log.id] ?? []).filter((i) => i.section === sec.lineItemKey)
        if (items.length === 0) continue

        if (hasMultipleSegments) {
          details.push({ label: log.location_name, detail: '', revenue: 0, cost: 0, isSegmentHeader: true })
        }

        for (const i of items) {
          const cost = i.quantity * i.unit_cost
          const rev = cost * (1 + i.markup_pct / 100)
          details.push({
            label: i.item_name,
            detail: i.quantity === 1 ? fmt(i.unit_cost) : `${i.quantity} × ${fmt(i.unit_cost)}`,
            revenue: rev,
            cost,
          })
          totalRevenue += rev
          totalCost += cost
        }
      }
    }

    if (details.length > 0) {
      blocks.push({ name: sec.name, details, total: { revenue: totalRevenue, cost: totalCost }, passThrough: sec.passThrough })
    }
  }

  const grandRevenue = blocks.reduce((s, b) => s + b.total.revenue, 0)
  const grandCost = blocks.reduce((s, b) => s + b.total.cost, 0)
  const grandGP = grandRevenue - grandCost
  const ptBlocks = blocks.filter(b => b.passThrough)
  const passThroughRevenue = ptBlocks.reduce((s, b) => s + b.total.revenue, 0)
  const passThroughCost = ptBlocks.reduce((s, b) => s + b.total.cost, 0)
  const netRevenue = grandRevenue - passThroughRevenue
  const netCost = grandCost - passThroughCost
  const netGP = netRevenue - netCost

  return (
    <div className="border border-border/40 rounded-md">
      <div className="px-4 py-2.5 border-b border-border/40">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">P&L Summary</p>
      </div>
      <div className="px-3 pb-3 pt-1">
        {blocks.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/70 text-center py-6">No data yet. Add labor roles and line items to see the summary.</p>
        ) : (
          <Table className="text-[12px]">
            <TableHeader>
              <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <TableHead className="w-[200px] py-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Item</TableHead>
                <TableHead className="py-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Detail</TableHead>
                <TableHead className="py-2 text-[10px] font-medium uppercase tracking-widest text-right w-[80px] text-muted-foreground">GR</TableHead>
                <TableHead className="py-2 text-[10px] font-medium uppercase tracking-widest text-right w-[80px] text-muted-foreground">Cost</TableHead>
                <TableHead className="py-2 text-[10px] font-medium uppercase tracking-widest text-right w-[80px] text-muted-foreground">GP</TableHead>
                <TableHead className="py-2 text-[10px] font-medium uppercase tracking-widest text-right w-[52px] text-muted-foreground">GP%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((block) => {
                const blockGP = block.total.revenue - block.total.cost
                return (
                  <React.Fragment key={block.name}>
                    <TableRow className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-b border-border/40">
                      <TableCell colSpan={6} className="font-semibold text-[11px] py-1.5 text-foreground uppercase tracking-wide">{block.name}</TableCell>
                    </TableRow>
                    {block.details.map((row, idx) => {
                      if (row.isSegmentHeader) {
                        return (
                          <TableRow key={`${block.name}-seg-${idx}`} className="hover:bg-transparent">
                            <TableCell colSpan={6} className="pl-5 text-[9px] font-medium text-muted-foreground/70 uppercase tracking-widest py-0.5">{row.label}</TableCell>
                          </TableRow>
                        )
                      }
                      const gp = row.revenue - row.cost
                      return (
                        <TableRow key={`${block.name}-${idx}`} className="hover:bg-muted/30 border-b border-border/5">
                          <TableCell className="pl-5 py-0.5 text-[12px] text-foreground/90">{row.label}</TableCell>
                          <TableCell className="py-0.5 text-[12px] text-muted-foreground/70 tabular-nums">{row.detail}</TableCell>
                          <TableCell className="py-0.5 text-[12px] text-right tabular-nums text-foreground/60">{fmt(row.revenue)}</TableCell>
                          <TableCell className="py-0.5 text-[12px] text-right tabular-nums text-foreground/60">{fmt(row.cost)}</TableCell>
                          <TableCell className="py-0.5 text-[12px] text-right tabular-nums text-green-800/60">{fmt(gp)}</TableCell>
                          <TableCell className="py-0.5 text-[12px] text-right tabular-nums text-muted-foreground/70">{pct(gp, row.revenue)}</TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableCell colSpan={2} className="py-1 pl-5 text-[11px] font-medium text-muted-foreground/50">{block.name} Subtotal</TableCell>
                      <TableCell className="py-1 text-[12px] text-right font-medium tabular-nums text-foreground/90">{fmt(block.total.revenue)}</TableCell>
                      <TableCell className="py-1 text-[12px] text-right font-medium tabular-nums text-foreground/90">{fmt(block.total.cost)}</TableCell>
                      <TableCell className="py-1 text-[12px] text-right font-medium tabular-nums text-green-800/60">{fmt(blockGP)}</TableCell>
                      <TableCell className="py-1 text-[12px] text-right font-medium tabular-nums text-muted-foreground/50">{pct(blockGP, block.total.revenue)}</TableCell>
                    </TableRow>
                  </React.Fragment>
                )
              })}
              {/* Grand Totals */}
              <TableRow className="border-t border-foreground/10 hover:bg-transparent">
                <TableCell colSpan={2} className="py-1.5 text-[11px] font-bold uppercase tracking-widest text-foreground/90">GR (Gross Revenue)</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground">{fmt(grandRevenue)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground">{fmt(grandCost)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-green-800/60">{fmt(grandGP)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground/60">{pct(grandGP, grandRevenue)}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="py-1.5 text-[11px] font-bold uppercase tracking-widest text-foreground/70">NR (Net Revenue)</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground/80">{fmt(netRevenue)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground/80">{fmt(netCost)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-green-800/60">{fmt(netGP)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground/60">{pct(netGP, netRevenue)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

function EstimateBuilderContent({ estimateId }: { estimateId: string }) {
  const [estimate, setEstimate] = useState<EstimateWithClient | null>(null)
  const [laborLogs, setLaborLogs] = useState<LaborLog[]>([])
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null)
  const [laborEntriesMap, setLaborEntriesMap] = useState<Record<string, LaborEntry[]>>({})
  const [lineItemsMap, setLineItemsMap] = useState<Record<string, EstimateLineItem[]>>({})
  const [rateCardData, setRateCardData] = useState<RateCardItemsBySection[]>([])
  const [scheduleEntriesMap, setScheduleEntriesMap] = useState<Record<string, ScheduleEntry[]>>({})
  const [activeTab, setActiveTab] = useState('schedule')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [pendingApproval, setPendingApproval] = useState<ApprovalRequest | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const est = await getEstimate(estimateId)
      setEstimate(est)

      // Load pending approval if in review status
      if (est.status === 'review') {
        const approval = await getPendingApproval(estimateId)
        setPendingApproval(approval)
      } else {
        setPendingApproval(null)
      }

      const [logs, rcData] = await Promise.all([
        getLaborLogs(estimateId),
        getRateCardItemsBySection(est.client_id),
      ])

      setLaborLogs(logs)
      setRateCardData(rcData)

      // Load entries, line items, and schedule entries for all logs in parallel
      const entriesMap: Record<string, LaborEntry[]> = {}
      const itemsMap: Record<string, EstimateLineItem[]> = {}
      const schedMap: Record<string, ScheduleEntry[]> = {}
      await Promise.all(logs.map(async (log) => {
        const [entries, items, schedEntries] = await Promise.all([
          getLaborEntries(log.id),
          getLineItemsByLocation(log.id),
          getScheduleEntries(log.id),
        ])
        entriesMap[log.id] = entries
        itemsMap[log.id] = items
        schedMap[log.id] = schedEntries
      }))
      setLaborEntriesMap(entriesMap)
      setLineItemsMap(itemsMap)
      setScheduleEntriesMap(schedMap)

      // Set active location
      if (logs.length > 0) {
        const primary = logs.find((l) => l.is_primary)
        setActiveLocationId(primary?.id ?? logs[0].id)
      }
    } catch (err) {
      console.error('Failed to load estimate:', err)
    } finally {
      setLoading(false)
    }
  }, [estimateId])

  useEffect(() => { loadData() }, [loadData])

  // ── Handlers ──

  async function handleUpdateEstimate(updates: EstimateUpdate) {
    if (!estimate) return
    try {
      const updated = await updateEstimate(estimateId, updates)
      setEstimate((prev) => prev ? { ...prev, ...updated } : prev)

      // Sync date changes to labor logs so the schedule grid picks them up
      if (updates.start_date !== undefined || updates.end_date !== undefined) {
        const dateUpdates: { start_date?: string | null; end_date?: string | null } = {}
        if (updates.start_date !== undefined) dateUpdates.start_date = updates.start_date
        if (updates.end_date !== undefined) dateUpdates.end_date = updates.end_date
        const updatedLogs = await Promise.all(
          laborLogs.map((log) => updateLaborLog(log.id, dateUpdates))
        )
        setLaborLogs(updatedLogs)
      }
    } catch (err) {
      console.error('Failed to update estimate:', err)
    }
  }

  async function handleAddLocation(name: string) {
    try {
      const log = await createLaborLog({ estimate_id: estimateId, location_name: name, is_primary: false })
      setLaborLogs((prev) => [...prev, log])
      setLaborEntriesMap((prev) => ({ ...prev, [log.id]: [] }))
      setLineItemsMap((prev) => ({ ...prev, [log.id]: [] }))
      setActiveLocationId(log.id)
    } catch (err) {
      console.error('Failed to add location:', err)
    }
  }

  async function handleDeleteLocation(logId: string) {
    try {
      await deleteLaborLog(logId)
      setLaborLogs((prev) => prev.filter((l) => l.id !== logId))
      setLaborEntriesMap((prev) => {
        const next = { ...prev }
        delete next[logId]
        return next
      })
      setLineItemsMap((prev) => {
        const next = { ...prev }
        delete next[logId]
        return next
      })
      // Switch to first remaining log
      setActiveLocationId((prev) => {
        if (prev === logId) {
          const remaining = laborLogs.filter((l) => l.id !== logId)
          return remaining[0]?.id ?? null
        }
        return prev
      })
    } catch (err) {
      console.error('Failed to delete location:', err)
    }
  }

  async function handleRenameLocation(logId: string, name: string) {
    try {
      await updateLaborLog(logId, { location_name: name })
      setLaborLogs((prev) => prev.map((l) => l.id === logId ? { ...l, location_name: name } : l))
    } catch (err) {
      console.error('Failed to rename location:', err)
    }
  }

  async function handleAddEntry(entries: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }[]) {
    if (!activeLocationId) return
    try {
      const currentCount = laborEntriesMap[activeLocationId]?.length ?? 0
      const created = await Promise.all(
        entries.map((data, i) =>
          createLaborEntry({
            labor_log_id: activeLocationId,
            role_name: data.role_name,
            unit_rate: data.unit_rate,
            cost_rate: data.cost_rate,
            gl_code: data.gl_code,
            rate_card_item_id: data.rate_card_item_id,
            quantity: 1,
            days: estimate?.duration_days ?? 1,
            override_rate: null,
            override_reason: null,
            has_overtime: false,
            overtime_rate: null,
            overtime_hours: null,
            notes: null,
            display_order: currentCount + i,
          })
        )
      )
      setLaborEntriesMap((prev) => ({
        ...prev,
        [activeLocationId]: [...(prev[activeLocationId] ?? []), ...created],
      }))
    } catch (err) {
      console.error('Failed to add entries:', err)
    }
  }

  async function handleUpdateEntry(id: string, updates: Partial<LaborEntry>) {
    if (!activeLocationId) return
    try {
      const updated = await updateLaborEntry(id, updates)
      setLaborEntriesMap((prev) => ({
        ...prev,
        [activeLocationId]: (prev[activeLocationId] ?? []).map((e) => e.id === id ? updated : e),
      }))
    } catch (err) {
      console.error('Failed to update entry:', err)
    }
  }

  async function handleDeleteEntry(id: string) {
    if (!activeLocationId) return
    try {
      await deleteLaborEntry(id)
      setLaborEntriesMap((prev) => ({
        ...prev,
        [activeLocationId]: (prev[activeLocationId] ?? []).filter((e) => e.id !== id),
      }))
    } catch (err) {
      console.error('Failed to delete entry:', err)
    }
  }

  async function handleAddLineItems(section: string, items: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }[]) {
    if (!activeLocationId) return
    try {
      const activeItems = lineItemsMap[activeLocationId] ?? []
      const baseOrder = activeItems.filter((i) => i.section === section).length
      const created = await Promise.all(
        items.map((data, idx) =>
          createLineItem({
            estimate_id: estimateId,
            labor_log_id: activeLocationId,
            section,
            item_name: data.item_name,
            description: data.description || null,
            quantity: data.quantity,
            unit_cost: data.unit_cost,
            markup_pct: data.markup_pct,
            gl_code: data.gl_code,
            rate_card_item_id: data.rate_card_item_id,
            notes: null,
            display_order: baseOrder + idx,
          })
        )
      )
      setLineItemsMap((prev) => ({
        ...prev,
        [activeLocationId]: [...(prev[activeLocationId] ?? []), ...created],
      }))
    } catch (err) {
      console.error('Failed to add line items:', err)
    }
  }

  async function handleUpdateLineItem(id: string, updates: Partial<EstimateLineItem>) {
    if (!activeLocationId) return
    try {
      const updated = await updateLineItem(id, updates)
      setLineItemsMap((prev) => ({
        ...prev,
        [activeLocationId]: (prev[activeLocationId] ?? []).map((i) => i.id === id ? updated : i),
      }))
    } catch (err) {
      console.error('Failed to update line item:', err)
    }
  }

  async function handleDeleteLineItem(id: string) {
    if (!activeLocationId) return
    try {
      await deleteLineItem(id)
      setLineItemsMap((prev) => ({
        ...prev,
        [activeLocationId]: (prev[activeLocationId] ?? []).filter((i) => i.id !== id),
      }))
    } catch (err) {
      console.error('Failed to delete line item:', err)
    }
  }

  // ── Workflow handlers ──

  async function handleStatusTransition(toStatus: EstimateStatus, reason?: string) {
    const result = await transitionStatus(estimateId, toStatus, 'Current User', reason)
    if (result.success) {
      const est = await getEstimate(estimateId)
      setEstimate(est)
    }
    return result
  }

  async function handleSubmitForApproval() {
    const result = await submitForApproval(estimateId, 'Current User')
    if (!result.error) {
      await loadData()
      return { success: true, threshold: result.threshold }
    }
    return { success: false, error: result.error }
  }

  async function handleApprove(approvalId: string) {
    const result = await reviewApproval(approvalId, 'approved', 'Current User')
    if (result.success) await loadData()
    return result
  }

  async function handleReject(approvalId: string, notes: string) {
    const result = await reviewApproval(approvalId, 'rejected', 'Current User', notes)
    if (result.success) await loadData()
    return result
  }

  const isReadOnly = estimate?.status === 'review' || estimate?.status === 'approved' || estimate?.status === 'active' || estimate?.status === 'complete'

  // ── Render ──

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground/50">Loading estimate...</p>
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground/50">Estimate not found.</p>
      </div>
    )
  }

  const defaultMarkup = estimate.clients.third_party_markup * 100
  const activeEntries = activeLocationId ? (laborEntriesMap[activeLocationId] ?? []) : []
  const activeLineItems = activeLocationId ? (lineItemsMap[activeLocationId] ?? []) : []

  const lineItemTabs = [
    { key: 'production', label: 'Production', pt: true },
    { key: 'travel', label: 'Travel & Logistics', pt: true },
    { key: 'creative', label: 'Creative', pt: false },
    { key: 'access', label: 'Access Fees & Insurance', pt: false },
    { key: 'misc', label: 'Misc', pt: false },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{estimate.event_name}</h1>
          <p className="text-sm text-muted-foreground">{estimate.clients.name} · Estimate Builder</p>
        </div>
        <HistoryButton onClick={() => setHistoryOpen(true)} />
      </div>

      <EstimateStatusBar
        status={estimate.status as EstimateStatus}
        onTransition={handleStatusTransition}
        onSubmitForApproval={handleSubmitForApproval}
        disabled={isReadOnly && estimate.status !== 'review' && estimate.status !== 'approved'}
      />

      {pendingApproval && estimate.status === 'review' && (
        <ApprovalBanner
          approval={pendingApproval}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* 70/30 Split Layout */}
      <div className="flex gap-4">
        {/* Left Panel — Estimate Working Area (70%) */}
        <div className="flex-[7] min-w-0 space-y-2.5">
          <EventHeader estimate={estimate} onUpdate={handleUpdateEstimate} />

          <Tabs value={activeTab} onValueChange={async (tab) => {
            setActiveTab(tab)
            // Refresh schedule entries when leaving the schedule tab so Labor Log / Summary see latest data
            if (activeTab === 'schedule' && tab !== 'schedule') {
              const schedMap: Record<string, ScheduleEntry[]> = {}
              await Promise.all(laborLogs.map(async (log) => {
                schedMap[log.id] = await getScheduleEntries(log.id)
              }))
              setScheduleEntriesMap(schedMap)
            }
          }}>
            <TabsList variant="line" className="border-b border-border/40 w-full">
              <TabsTrigger value="schedule" className="text-[13px]">Schedule</TabsTrigger>
              <TabsTrigger value="labor" className="text-[13px]">Labor Log</TabsTrigger>
              {lineItemTabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-[13px]">{tab.label}</TabsTrigger>
              ))}
              <TabsTrigger value="summary" className="text-[13px]">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule">
              <div className="space-y-2">
                <LocationSelector
                  laborLogs={laborLogs}
                  activeLocationId={activeLocationId}
                  onSelectLocation={setActiveLocationId}
                  onAddLocation={handleAddLocation}
                  onDeleteLocation={handleDeleteLocation}
                  onRenameLocation={handleRenameLocation}
                />
                {activeLocationId && laborLogs.find((l) => l.id === activeLocationId) && (
                  <ScheduleGrid
                    laborLog={laborLogs.find((l) => l.id === activeLocationId)!}
                    estimate={estimate}
                    rateCardData={rateCardData}
                    onUpdateDates={async (startDate, endDate) => {
                      const updated = await updateLaborLog(activeLocationId, { start_date: startDate, end_date: endDate })
                      setLaborLogs((prev) => prev.map((l) => l.id === activeLocationId ? updated : l))
                    }}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="labor">
              <LaborLogTab
                estimate={estimate}
                laborLogs={laborLogs}
                activeLocationId={activeLocationId}
                entries={activeEntries}
                rateCardData={rateCardData}
                allEntriesMap={laborEntriesMap}
                scheduleEntriesMap={scheduleEntriesMap}
                onSelectLocation={setActiveLocationId}
                onAddLocation={handleAddLocation}
                onDeleteLocation={handleDeleteLocation}
                onRenameLocation={handleRenameLocation}
                onAddEntry={handleAddEntry}
                onUpdateEntry={handleUpdateEntry}
                onDeleteEntry={handleDeleteEntry}
                onSwitchToSchedule={() => setActiveTab('schedule')}
              />
            </TabsContent>

            {lineItemTabs.map((tab) => (
              <TabsContent key={tab.key} value={tab.key}>
                <LineItemTab
                  items={activeLineItems.filter((i) => i.section === tab.key)}
                  section={tab.key}
                  isPassThrough={tab.pt}
                  defaultMarkup={tab.pt ? defaultMarkup : 0}
                  rateCardData={rateCardData}
                  clientName={estimate.clients.name}
                  laborLogs={laborLogs}
                  activeLocationId={activeLocationId}
                  onSelectLocation={setActiveLocationId}
                  onAddLocation={handleAddLocation}
                  onDeleteLocation={handleDeleteLocation}
                  onRenameLocation={handleRenameLocation}
                  onAdd={(items) => handleAddLineItems(tab.key, items)}
                  onUpdate={handleUpdateLineItem}
                  onDelete={handleDeleteLineItem}
                />
              </TabsContent>
            ))}

            <TabsContent value="summary">
              <SummaryTab laborLogs={laborLogs} allEntriesMap={laborEntriesMap} lineItemsMap={lineItemsMap} rateCardData={rateCardData} scheduleEntriesMap={scheduleEntriesMap} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel — AI Intelligence (30%) */}
        <div className="flex-[3] min-w-[260px] border-l border-border/40 pl-4">
          <AINudgePanel />
        </div>
      </div>

      <VersionHistoryPanel
        estimateId={estimateId}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRollback={loadData}
      />
    </div>
  )
}

export function EstimateBuilderPage() {
  const { id } = useParams()
  if (!id) return <Navigate to="/estimates" replace />
  return <EstimateBuilderContent estimateId={id} />
}
