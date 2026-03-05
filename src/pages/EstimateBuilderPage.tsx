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
} from 'lucide-react'
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
  const [notes, setNotes] = useState(estimate.project_notes ?? '')
  const [showNotes, setShowNotes] = useState(!!estimate.project_notes)

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
          <Input value={eventType} onChange={(e) => setEventType(e.target.value)} onBlur={() => saveField('event_type', eventType)} className={fieldInput} />
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
          <Input type="number" value={attendance} onChange={(e) => setAttendance(e.target.value)} onBlur={() => saveField('expected_attendance', attendance ? parseInt(attendance) : null)} className={fieldInput} />
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
        <div className="mt-2.5">
          <p className={fieldLabel}>Notes</p>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => saveField('project_notes', notes)} className="min-h-[40px] text-[13px] border-border/40 bg-transparent resize-none focus-visible:ring-0 focus-visible:border-border/40" placeholder="Internal notes..." />
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
  onAdd: (entry: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }) => void
}) {
  const [search, setSearch] = useState('')

  // Filter to labor sections only
  const laborSections = rateCardData.filter((s) => s.section.cost_type === 'labor')
  const allRoles = laborSections.flatMap((s) =>
    s.items.map((item) => ({ ...item, sectionName: s.section.name }))
  )
  const filtered = search
    ? allRoles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : allRoles

  function handleSelect(role: typeof allRoles[number]) {
    const isOffice = estimate.cost_structure === 'office'
    const costRate = isOffice && role.unit_rate
      ? role.unit_rate * (1 - estimate.clients.office_payout_pct)
      : null
    onAdd({
      role_name: role.name,
      unit_rate: role.unit_rate ?? 0,
      cost_rate: costRate,
      gl_code: role.gl_code,
      rate_card_item_id: role.id,
    })
    setSearch('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add Role from Rate Card</DialogTitle>
          <DialogDescription className="text-xs">Select a role from {estimate.clients.name}'s rate card</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm border-border/30" autoFocus />
        </div>
        <div className="max-h-[300px] overflow-y-auto space-y-0.5">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center py-4">No matching roles found</p>
          )}
          {filtered.map((role) => (
            <button
              key={role.id}
              onClick={() => handleSelect(role)}
              className="w-full text-left px-3 py-1.5 rounded-sm hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-foreground/90">{role.name}</span>
                <span className="text-[13px] text-muted-foreground/60 tabular-nums">
                  {role.unit_rate ? `$${role.unit_rate.toLocaleString()}` : 'Pass-through'}
                  {role.unit_label ? ` ${role.unit_label}` : ''}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/70">{role.sectionName}{role.gl_code ? ` · GL ${role.gl_code}` : ''}</p>
            </button>
          ))}
        </div>
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
          + Add
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
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onRenameLocation,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}: {
  estimate: EstimateWithClient
  laborLogs: LaborLog[]
  activeLocationId: string | null
  entries: LaborEntry[]
  rateCardData: RateCardItemsBySection[]
  allEntriesMap: Record<string, LaborEntry[]>
  onSelectLocation: (id: string) => void
  onAddLocation: (name: string) => void
  onDeleteLocation: (id: string) => void
  onRenameLocation: (id: string, name: string) => void
  onAddEntry: (entry: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }) => void
  onUpdateEntry: (id: string, updates: Partial<LaborEntry>) => void
  onDeleteEntry: (id: string) => void
}) {
  const [showAddRole, setShowAddRole] = useState(false)

  // Active segment summary
  const segLabor = entries.filter((e) => !e.role_name.toLowerCase().includes('per diem'))
  const segRevenue = segLabor.reduce((sum, e) => sum + e.quantity * e.days * (e.override_rate ?? e.unit_rate), 0)
  const segCost = segLabor.reduce((sum, e) => sum + e.quantity * e.days * (e.cost_rate ?? 0), 0)
  const segGP = segRevenue - segCost
  const segStaff = segLabor.reduce((sum, e) => sum + e.quantity, 0)
  const activeLog = laborLogs.find((l) => l.id === activeLocationId)

  // All-segments summary
  const allEntries = Object.values(allEntriesMap).flat()
  const laborEntries = allEntries.filter((e) => !e.role_name.toLowerCase().includes('per diem'))
  const perDiemEntries = allEntries.filter((e) => e.role_name.toLowerCase().includes('per diem'))
  const laborRevenue = laborEntries.reduce((sum, e) => sum + e.quantity * e.days * (e.override_rate ?? e.unit_rate), 0)
  const laborCost = laborEntries.reduce((sum, e) => sum + e.quantity * e.days * (e.cost_rate ?? 0), 0)
  const laborGP = laborRevenue - laborCost
  const staffCount = laborEntries.reduce((sum, e) => sum + e.quantity, 0)
  const perDiemTotal = perDiemEntries.reduce((sum, e) => sum + e.quantity * e.days * (e.override_rate ?? e.unit_rate), 0)

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

      {/* Labor Table */}
      <div>
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
        <button onClick={() => setShowAddRole(true)} className="mt-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/90 transition-colors">
          + Add Role
        </button>
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

      {/* Modals */}
      <AddRoleModal
        open={showAddRole}
        onOpenChange={setShowAddRole}
        rateCardData={rateCardData}
        estimate={estimate}
        onAdd={onAddEntry}
      />
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
        <Input value={qty} onChange={(e) => setQty(e.target.value)} onBlur={saveQty} className={`${cellInput} w-10 text-center mx-auto`} />
      </TableCell>
      <TableCell className="text-center py-1">
        <Input value={days} onChange={(e) => setDays(e.target.value)} onBlur={saveDays} className={`${cellInput} w-10 text-center mx-auto`} />
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
  onAdd: (item: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }) => void
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
        <Input value={qty} onChange={(e) => setQty(e.target.value)} onBlur={() => onUpdate(item.id, { quantity: parseFloat(qty) || 1 })} className={`${cellInput} w-10 text-center mx-auto`} />
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

// ── Add Line Item Modal ──────────────────────────────────────────────────────

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
  onAdd: (item: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }) => void
}) {
  const [itemName, setItemName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitCost, setUnitCost] = useState('')
  const [markupPct, setMarkupPct] = useState(defaultMarkup.toString())
  const [search, setSearch] = useState('')

  // Find matching rate card section
  const rcSectionName = TAB_TO_RC_SECTION[section]
  const rcSection = rateCardData.find((s) => s.section.name === rcSectionName)
  const rcItems = rcSection?.items ?? []
  const filtered = search ? rcItems.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())) : rcItems

  function handleSelectRC(item: typeof rcItems[number]) {
    setItemName(item.name)
    setUnitCost(item.unit_rate?.toString() ?? '')
    setSearch('')
  }

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
    // Reset
    setItemName('')
    setDescription('')
    setQuantity('1')
    setUnitCost('')
    setMarkupPct(defaultMarkup.toString())
    setSearch('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add Line Item</DialogTitle>
          <DialogDescription className="text-xs">Add to {section} section</DialogDescription>
        </DialogHeader>

        {/* Rate card suggestions */}
        {rcItems.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground/50">Pick from {clientName}'s rate card</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-muted-foreground/70" />
              <Input placeholder="Search rate card..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-7 text-[13px] border-border/40" />
            </div>
            {search && filtered.length > 0 && (
              <div className="max-h-[100px] overflow-y-auto border border-border/40 rounded-sm">
                {filtered.map((item) => (
                  <button key={item.id} onClick={() => handleSelectRC(item)} className="w-full text-left px-3 py-1 text-[13px] hover:bg-muted/30 text-foreground/90">
                    {item.name}{item.unit_rate ? ` — $${item.unit_rate}` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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
  { name: 'Planning & Administration Labor', type: 'labor', lineItemKey: null },
  { name: 'Onsite Event Labor', type: 'labor', lineItemKey: null },
  { name: 'Travel Expenses', type: 'line_item', lineItemKey: 'travel' },
  { name: 'Creative Costs', type: 'line_item', lineItemKey: 'creative' },
  { name: 'Production Expenses', type: 'line_item', lineItemKey: 'production' },
  { name: 'Logistics Expenses', type: 'line_item', lineItemKey: 'access' },
  { name: 'Misc', type: 'line_item', lineItemKey: 'misc' },
] as const

function SummaryTab({
  laborLogs,
  allEntriesMap,
  lineItemsMap,
  rateCardData,
}: {
  laborLogs: LaborLog[]
  allEntriesMap: Record<string, LaborEntry[]>
  lineItemsMap: Record<string, EstimateLineItem[]>
  rateCardData: RateCardItemsBySection[]
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
  }

  const blocks: SectionBlock[] = []

  for (const sec of SUMMARY_SECTIONS) {
    const details: DetailRow[] = []
    let totalRevenue = 0
    let totalCost = 0

    if (sec.type === 'labor') {
      for (const log of laborLogs) {
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
      blocks.push({ name: sec.name, details, total: { revenue: totalRevenue, cost: totalCost } })
    }
  }

  const grandRevenue = blocks.reduce((s, b) => s + b.total.revenue, 0)
  const grandCost = blocks.reduce((s, b) => s + b.total.cost, 0)
  const grandGP = grandRevenue - grandCost

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
                <TableHead className="py-2 text-[10px] font-medium uppercase tracking-widest text-right w-[80px] text-muted-foreground">Revenue</TableHead>
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
              {/* Grand Total — same table, columns align */}
              <TableRow className="border-t border-foreground/10 hover:bg-transparent">
                <TableCell colSpan={2} className="py-2 text-[11px] font-bold uppercase tracking-widest text-foreground/90">Grand Total</TableCell>
                <TableCell className="py-2 text-[12px] text-right font-bold tabular-nums text-foreground">{fmt(grandRevenue)}</TableCell>
                <TableCell className="py-2 text-[12px] text-right font-bold tabular-nums text-foreground">{fmt(grandCost)}</TableCell>
                <TableCell className="py-2 text-[12px] text-right font-bold tabular-nums text-green-800/60">{fmt(grandGP)}</TableCell>
                <TableCell className="py-2 text-[12px] text-right font-bold tabular-nums text-foreground/60">{pct(grandGP, grandRevenue)}</TableCell>
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
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const est = await getEstimate(estimateId)
      setEstimate(est)

      const [logs, rcData] = await Promise.all([
        getLaborLogs(estimateId),
        getRateCardItemsBySection(est.client_id),
      ])

      setLaborLogs(logs)
      setRateCardData(rcData)

      // Load entries and line items for all logs in parallel
      const entriesMap: Record<string, LaborEntry[]> = {}
      const itemsMap: Record<string, EstimateLineItem[]> = {}
      await Promise.all(logs.map(async (log) => {
        const [entries, items] = await Promise.all([
          getLaborEntries(log.id),
          getLineItemsByLocation(log.id),
        ])
        entriesMap[log.id] = entries
        itemsMap[log.id] = items
      }))
      setLaborEntriesMap(entriesMap)
      setLineItemsMap(itemsMap)

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

  async function handleAddEntry(data: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }) {
    if (!activeLocationId) return
    try {
      const entry = await createLaborEntry({
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
        display_order: (laborEntriesMap[activeLocationId]?.length ?? 0),
      })
      setLaborEntriesMap((prev) => ({
        ...prev,
        [activeLocationId]: [...(prev[activeLocationId] ?? []), entry],
      }))
    } catch (err) {
      console.error('Failed to add entry:', err)
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

  async function handleAddLineItem(section: string, data: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }) {
    if (!activeLocationId) return
    try {
      const activeItems = lineItemsMap[activeLocationId] ?? []
      const item = await createLineItem({
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
        display_order: activeItems.filter((i) => i.section === section).length,
      })
      setLineItemsMap((prev) => ({
        ...prev,
        [activeLocationId]: [...(prev[activeLocationId] ?? []), item],
      }))
    } catch (err) {
      console.error('Failed to add line item:', err)
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
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{estimate.event_name}</h1>
        <p className="text-sm text-muted-foreground">{estimate.clients.name} · Estimate Builder</p>
      </div>

      {/* 70/30 Split Layout */}
      <div className="flex gap-4">
        {/* Left Panel — Estimate Working Area (70%) */}
        <div className="flex-[7] min-w-0 space-y-2.5">
          <EventHeader estimate={estimate} onUpdate={handleUpdateEstimate} />

          <Tabs defaultValue="labor">
            <TabsList variant="line" className="border-b border-border/40 w-full">
              <TabsTrigger value="labor" className="text-[13px]">Labor Log</TabsTrigger>
              {lineItemTabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-[13px]">{tab.label}</TabsTrigger>
              ))}
              <TabsTrigger value="summary" className="text-[13px]">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="labor">
              <LaborLogTab
                estimate={estimate}
                laborLogs={laborLogs}
                activeLocationId={activeLocationId}
                entries={activeEntries}
                rateCardData={rateCardData}
                allEntriesMap={laborEntriesMap}
                onSelectLocation={setActiveLocationId}
                onAddLocation={handleAddLocation}
                onDeleteLocation={handleDeleteLocation}
                onRenameLocation={handleRenameLocation}
                onAddEntry={handleAddEntry}
                onUpdateEntry={handleUpdateEntry}
                onDeleteEntry={handleDeleteEntry}
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
                  onAdd={(data) => handleAddLineItem(tab.key, data)}
                  onUpdate={handleUpdateLineItem}
                  onDelete={handleDeleteLineItem}
                />
              </TabsContent>
            ))}

            <TabsContent value="summary">
              <SummaryTab laborLogs={laborLogs} allEntriesMap={laborEntriesMap} lineItemsMap={lineItemsMap} rateCardData={rateCardData} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel — AI Intelligence (30%) */}
        <div className="flex-[3] min-w-[260px] border-l border-border/40 pl-4">
          <AINudgePanel />
        </div>
      </div>
    </div>
  )
}

export function EstimateBuilderPage() {
  const { id } = useParams()
  if (!id) return <Navigate to="/estimates" replace />
  return <EstimateBuilderContent estimateId={id} />
}
