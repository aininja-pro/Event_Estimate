import { useState, useEffect, useCallback } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Trash2,
  Send,
  MapPin,
  Search,
} from 'lucide-react'
import {
  getEstimate,
  updateEstimate,
  getLaborLogs,
  createLaborLog,
  deleteLaborLog,
  getLaborEntries,
  createLaborEntry,
  updateLaborEntry,
  deleteLaborEntry,
  getLineItems,
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

const STATUS_COLORS: Record<string, string> = {
  pipeline: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  review: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  recap: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  complete: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
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
  suggestion: { border: 'border-blue-500/30', bg: 'bg-blue-500/5', label: 'text-blue-400' },
  warning: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', label: 'text-yellow-400' },
  validation: { border: 'border-green-500/30', bg: 'bg-green-500/5', label: 'text-green-400' },
  insight: { border: 'border-purple-500/30', bg: 'bg-purple-500/5', label: 'text-purple-400' },
}

function AINudgePanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
        <span className="text-lg">🤖</span>
        <h2 className="text-sm font-semibold">AI Assistant</h2>
        <div className="ml-auto h-0.5 w-8 rounded-full bg-blue-500" />
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {nudges.map((nudge, i) => {
          const colors = nudgeColors[nudge.type]
          return (
            <div key={i} className={`rounded-lg border ${colors.border} ${colors.bg} p-3`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-sm">{nudge.icon}</span>
                <span className={`text-xs font-semibold tracking-wide ${colors.label}`}>{nudge.label}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{nudge.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">{nudge.footer}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-4 border-t border-border pt-4">
        <div className="flex gap-2">
          <Textarea placeholder="Ask about this estimate or describe what you need..." className="min-h-[60px] resize-none text-sm" readOnly />
          <Button size="icon" className="shrink-0 self-end"><Send className="h-4 w-4" /></Button>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Event Details</CardTitle>
        <Badge className={STATUS_COLORS[estimate.status] ?? ''}>
          {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          {/* Client (read-only) */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Client</p>
            <Input readOnly value={estimate.clients.name} className="h-8 text-sm bg-muted/30 cursor-default" />
          </div>
          {/* Event Type */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Event Type</p>
            <Input value={eventType} onChange={(e) => setEventType(e.target.value)} onBlur={() => saveField('event_type', eventType)} className="h-8 text-sm" />
          </div>
          {/* Event Name */}
          <div className="col-span-2">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Event Name</p>
            <Input value={eventName} onChange={(e) => setEventName(e.target.value)} onBlur={() => saveField('event_name', eventName)} className="h-8 text-sm" />
          </div>
          {/* Location */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Location</p>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} onBlur={() => saveField('location', location)} className="h-8 text-sm" />
          </div>
          {/* Dates */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Start Date</p>
            <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); saveField('start_date', e.target.value) }} className="h-8 text-sm" />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">End Date</p>
            <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); saveField('end_date', e.target.value) }} className="h-8 text-sm" />
          </div>
          {/* Attendance */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Expected Attendance</p>
            <Input type="number" value={attendance} onChange={(e) => setAttendance(e.target.value)} onBlur={() => saveField('expected_attendance', attendance ? parseInt(attendance) : null)} className="h-8 text-sm" />
          </div>
          {/* PO Number */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">PO Number</p>
            <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} onBlur={() => saveField('po_number', poNumber)} className="h-8 text-sm" />
          </div>
          {/* Project ID */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Project ID</p>
            <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} onBlur={() => saveField('project_id', projectId)} className="h-8 text-sm" />
          </div>
          {/* Cost Structure */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Cost Structure</p>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant={estimate.cost_structure === 'corporate' ? 'default' : 'outline'} onClick={() => onUpdate({ cost_structure: 'corporate' })}>Corporate</Button>
              <Button type="button" size="sm" variant={estimate.cost_structure === 'office' ? 'default' : 'outline'} onClick={() => onUpdate({ cost_structure: 'office' })}>Office</Button>
            </div>
          </div>
          {/* Duration (read-only, computed) */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Duration</p>
            <Input readOnly value={estimate.duration_days ? `${estimate.duration_days} days` : '—'} className="h-8 text-sm bg-muted/30 cursor-default" />
          </div>
        </div>
        {/* Project Notes */}
        {!showNotes ? (
          <button onClick={() => setShowNotes(true)} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
            + Add project notes
          </button>
        ) : (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Project Notes</p>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => saveField('project_notes', notes)} className="min-h-[60px] text-sm" placeholder="Internal notes about this estimate..." />
          </div>
        )}
      </CardContent>
    </Card>
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
          <DialogTitle>Add Role from Rate Card</DialogTitle>
          <DialogDescription>Select a role from {estimate.clients.name}'s rate card</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" autoFocus />
        </div>
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No matching roles found</p>
          )}
          {filtered.map((role) => (
            <button
              key={role.id}
              onClick={() => handleSelect(role)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{role.name}</span>
                <span className="text-sm text-muted-foreground">
                  {role.unit_rate ? `$${role.unit_rate.toLocaleString()}` : 'Pass-through'}
                  {role.unit_label ? ` ${role.unit_label}` : ''}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{role.sectionName}{role.gl_code ? ` · GL ${role.gl_code}` : ''}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Labor Log Tab ────────────────────────────────────────────────────────────

function LaborLogTab({
  estimate,
  laborLogs,
  activeLaborLogId,
  entries,
  rateCardData,
  allEntriesMap,
  onSelectLog,
  onAddLocation,
  onDeleteLocation,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}: {
  estimate: EstimateWithClient
  laborLogs: LaborLog[]
  activeLaborLogId: string | null
  entries: LaborEntry[]
  rateCardData: RateCardItemsBySection[]
  allEntriesMap: Record<string, LaborEntry[]>
  onSelectLog: (id: string) => void
  onAddLocation: (name: string) => void
  onDeleteLocation: (id: string) => void
  onAddEntry: (entry: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }) => void
  onUpdateEntry: (id: string, updates: Partial<LaborEntry>) => void
  onDeleteEntry: (id: string) => void
}) {
  const [showAddRole, setShowAddRole] = useState(false)
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [newLocationName, setNewLocationName] = useState('')

  // Compute labor summary across ALL locations
  const allEntries = Object.values(allEntriesMap).flat()
  const laborEntries = allEntries.filter((e) => !e.role_name.toLowerCase().includes('per diem'))
  const perDiemEntries = allEntries.filter((e) => e.role_name.toLowerCase().includes('per diem'))

  const laborRevenue = laborEntries.reduce((sum, e) => {
    const rate = e.override_rate ?? e.unit_rate
    return sum + e.quantity * e.days * rate
  }, 0)
  const laborCost = laborEntries.reduce((sum, e) => sum + e.quantity * e.days * (e.cost_rate ?? 0), 0)
  const laborGP = laborRevenue - laborCost
  const staffCount = laborEntries.reduce((sum, e) => sum + e.quantity, 0)
  const perDiemTotal = perDiemEntries.reduce((sum, e) => {
    const rate = e.override_rate ?? e.unit_rate
    return sum + e.quantity * e.days * rate
  }, 0)

  return (
    <div className="space-y-4">
      {/* Location Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {laborLogs.map((log) => (
          <Button
            key={log.id}
            variant={log.id === activeLaborLogId ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={() => onSelectLog(log.id)}
          >
            <MapPin className="h-3.5 w-3.5" />
            {log.location_name}{log.is_primary ? ' (Primary)' : ''}
          </Button>
        ))}
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => setShowAddLocation(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Location
        </Button>
        {activeLaborLogId && laborLogs.length > 1 && !laborLogs.find((l) => l.id === activeLaborLogId)?.is_primary && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive/70 hover:text-destructive"
            onClick={() => {
              if (confirm('Delete this location and all its staffing?')) {
                onDeleteLocation(activeLaborLogId)
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Labor Table */}
      <Card>
        <CardContent className="pt-4">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No roles added yet. Click "Add Role" to start building your labor plan.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Role</TableHead>
                  <TableHead className="text-center w-16">Qty</TableHead>
                  <TableHead className="text-center w-16">Days</TableHead>
                  <TableHead className="text-right w-24">Day Rate</TableHead>
                  <TableHead className="text-right w-24">Line Total</TableHead>
                  <TableHead className="text-right w-24">Cost Rate</TableHead>
                  <TableHead className="text-right w-24">Cost Total</TableHead>
                  <TableHead className="text-right w-20">GP</TableHead>
                  <TableHead className="text-right w-16">GP%</TableHead>
                  <TableHead className="w-10" />
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
          <div className="mt-3 border-t border-border pt-3">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setShowAddRole(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Role
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Labor Summary */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total Labor Revenue</p>
              <p className="text-lg font-bold">{fmt(laborRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Labor Cost</p>
              <p className="text-lg font-bold">{fmt(laborCost)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gross Profit</p>
              <p className="text-lg font-bold text-green-400">{fmt(laborGP)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">GP%</p>
              <p className="text-lg font-bold">{pct(laborGP, laborRevenue)}</p>
            </div>
            <div className="border-l border-border pl-6">
              <p className="text-xs text-muted-foreground">Staff Count</p>
              <p className="text-lg font-bold">{staffCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Per Diem Total</p>
              <p className="text-lg font-bold">{fmt(perDiemTotal)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total with Per Diem</p>
              <p className="text-lg font-bold">{fmt(laborRevenue + perDiemTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddRoleModal
        open={showAddRole}
        onOpenChange={setShowAddRole}
        rateCardData={rateCardData}
        estimate={estimate}
        onAdd={onAddEntry}
      />

      <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Location</DialogTitle>
            <DialogDescription>Add a new location for this estimate's labor plan</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Location Name</Label>
            <Input placeholder="e.g., San Diego" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddLocation(false); setNewLocationName('') }}>Cancel</Button>
            <Button disabled={!newLocationName.trim()} onClick={() => { onAddLocation(newLocationName.trim()); setNewLocationName(''); setShowAddLocation(false) }}>Add Location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

  return (
    <TableRow className="group hover:bg-muted/50">
      <TableCell>
        <span className="font-medium text-sm">{entry.role_name}</span>
        {isOverridden && <Badge variant="outline" className="ml-2 text-[10px] text-orange-400 border-orange-400/30">Override</Badge>}
      </TableCell>
      <TableCell className="text-center">
        <Input value={qty} onChange={(e) => setQty(e.target.value)} onBlur={saveQty} className="h-7 w-14 text-center text-sm bg-transparent mx-auto" />
      </TableCell>
      <TableCell className="text-center">
        <Input value={days} onChange={(e) => setDays(e.target.value)} onBlur={saveDays} className="h-7 w-14 text-center text-sm bg-transparent mx-auto" />
      </TableCell>
      <TableCell className="text-right">
        <Input
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          onBlur={saveRate}
          className={`h-7 w-24 text-right text-sm bg-transparent ml-auto ${isOverridden ? 'text-orange-400' : ''}`}
        />
      </TableCell>
      <TableCell className="text-right bg-muted/20">
        <span className="text-sm font-medium">{fmt(lineTotal)}</span>
      </TableCell>
      <TableCell className="text-right">
        {isOffice ? (
          <span className="text-sm text-muted-foreground">{fmt(effectiveCost)}</span>
        ) : (
          <Input value={costRate} onChange={(e) => setCostRate(e.target.value)} onBlur={saveCostRate} className="h-7 w-24 text-right text-sm bg-transparent ml-auto" />
        )}
      </TableCell>
      <TableCell className="text-right bg-muted/20">
        <span className="text-sm">{fmt(costTotal)}</span>
      </TableCell>
      <TableCell className="text-right bg-muted/20">
        <span className="text-sm text-green-400">{fmt(gp)}</span>
      </TableCell>
      <TableCell className="text-right bg-muted/20">
        <span className="text-sm text-muted-foreground">{gpPct}%</span>
      </TableCell>
      <TableCell>
        <Trash2
          className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors cursor-pointer"
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
  onAdd: (item: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }) => void
  onUpdate: (id: string, updates: Partial<EstimateLineItem>) => void
  onDelete: (id: string) => void
}) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Card>
        <CardContent className="pt-4">
          {isPassThrough && (
            <p className="text-sm text-muted-foreground mb-3">
              Pass-through costs subject to {defaultMarkup}% markup
            </p>
          )}
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No items added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Line Item</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center w-16">Qty</TableHead>
                  <TableHead className="text-right w-24">Unit Cost</TableHead>
                  <TableHead className="text-right w-24">Total</TableHead>
                  <TableHead className="text-center w-20">Markup %</TableHead>
                  <TableHead className="text-right w-28">Client Total</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <LineItemRow key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
                ))}
              </TableBody>
            </Table>
          )}
          <div className="mt-3 border-t border-border pt-3">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setShowModal(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Line Item
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddLineItemModal
        open={showModal}
        onOpenChange={setShowModal}
        section={section}
        defaultMarkup={defaultMarkup}
        rateCardData={rateCardData}
        clientName={clientName}
        onAdd={onAdd}
      />
    </>
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

  return (
    <TableRow className="group hover:bg-muted/50">
      <TableCell className="font-medium text-sm">{item.item_name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{item.description || '—'}</TableCell>
      <TableCell className="text-center">
        <Input value={qty} onChange={(e) => setQty(e.target.value)} onBlur={() => onUpdate(item.id, { quantity: parseFloat(qty) || 1 })} className="h-7 w-14 text-center text-sm bg-transparent mx-auto" />
      </TableCell>
      <TableCell className="text-right">
        <Input value={unitCost} onChange={(e) => setUnitCost(e.target.value)} onBlur={() => onUpdate(item.id, { unit_cost: parseFloat(unitCost) || 0 })} className="h-7 w-24 text-right text-sm bg-transparent ml-auto" />
      </TableCell>
      <TableCell className="text-right bg-muted/20">
        <span className="text-sm">{fmt(total)}</span>
      </TableCell>
      <TableCell className="text-center">
        <Input value={markup} onChange={(e) => setMarkup(e.target.value)} onBlur={() => onUpdate(item.id, { markup_pct: parseFloat(markup) || 0 })} className="h-7 w-16 text-center text-sm bg-transparent mx-auto" />
      </TableCell>
      <TableCell className="text-right bg-muted/20">
        <span className="text-sm font-medium">{fmt(clientTotal)}</span>
      </TableCell>
      <TableCell>
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors cursor-pointer" onClick={() => onDelete(item.id)} />
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
          <DialogTitle>Add Line Item</DialogTitle>
          <DialogDescription>Add to {section} section</DialogDescription>
        </DialogHeader>

        {/* Rate card suggestions */}
        {rcItems.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Pick from {clientName}'s rate card</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search rate card..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
            </div>
            {search && filtered.length > 0 && (
              <div className="max-h-[120px] overflow-y-auto border rounded-md">
                {filtered.map((item) => (
                  <button key={item.id} onClick={() => handleSelectRC(item)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted/50">
                    {item.name}{item.unit_rate ? ` — $${item.unit_rate}` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Item Name *</Label>
            <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Vehicle Transport" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Carrier delivery of 12 vehicles" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Quantity</Label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Unit Cost ($)</Label>
              <Input type="number" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Markup %</Label>
              <Input type="number" value={markupPct} onChange={(e) => setMarkupPct(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!itemName.trim()} onClick={handleSave}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Summary Tab ──────────────────────────────────────────────────────────────

function SummaryTab({
  allEntriesMap,
  lineItems,
}: {
  allEntriesMap: Record<string, LaborEntry[]>
  lineItems: EstimateLineItem[]
}) {
  const allEntries = Object.values(allEntriesMap).flat()
  const laborEntries = allEntries.filter((e) => !e.role_name.toLowerCase().includes('per diem'))
  const perDiemEntries = allEntries.filter((e) => e.role_name.toLowerCase().includes('per diem'))

  function laborTotals(entries: LaborEntry[]) {
    const revenue = entries.reduce((s, e) => s + e.quantity * e.days * (e.override_rate ?? e.unit_rate), 0)
    const cost = entries.reduce((s, e) => s + e.quantity * e.days * (e.cost_rate ?? 0), 0)
    return { revenue, cost }
  }

  function lineItemTotals(section: string) {
    const items = lineItems.filter((i) => i.section === section)
    const cost = items.reduce((s, i) => s + i.quantity * i.unit_cost, 0)
    const revenue = items.reduce((s, i) => s + i.quantity * i.unit_cost * (1 + i.markup_pct / 100), 0)
    return { revenue, cost }
  }

  const labor = laborTotals(laborEntries)
  const perDiem = laborTotals(perDiemEntries)
  const production = lineItemTotals('production')
  const travel = lineItemTotals('travel')
  const creative = lineItemTotals('creative')
  const access = lineItemTotals('access')
  const misc = lineItemTotals('misc')

  const rows = [
    { section: 'Labor', ...labor },
    { section: 'Per Diem', ...perDiem },
    { section: 'Production', ...production },
    { section: 'Travel/Logistics', ...travel },
    { section: 'Creative', ...creative },
    { section: 'Access/Insurance', ...access },
    { section: 'Misc', ...misc },
  ].filter((r) => r.revenue > 0 || r.cost > 0)

  const totals = rows.reduce((acc, r) => ({ revenue: acc.revenue + r.revenue, cost: acc.cost + r.cost }), { revenue: 0, cost: 0 })
  const totalGP = totals.revenue - totals.cost

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Consolidated P&L Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data yet. Add labor roles and line items to see the summary.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Section</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">GP</TableHead>
                  <TableHead className="text-right">GP%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const gp = row.revenue - row.cost
                  return (
                    <TableRow key={row.section}>
                      <TableCell className="font-medium">{row.section}</TableCell>
                      <TableCell className="text-right">{fmt(row.revenue)}</TableCell>
                      <TableCell className="text-right">{fmt(row.cost)}</TableCell>
                      <TableCell className="text-right text-green-400">{fmt(gp)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{pct(gp, row.revenue)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <div className="mt-4 border-t-2 border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-base font-bold">TOTAL</span>
                <div className="flex items-center gap-12">
                  <span className="font-bold">{fmt(totals.revenue)}</span>
                  <span className="font-bold">{fmt(totals.cost)}</span>
                  <span className="font-bold text-green-400">{fmt(totalGP)}</span>
                  <span className="font-bold">{pct(totalGP, totals.revenue)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

function EstimateBuilderContent({ estimateId }: { estimateId: string }) {
  const [estimate, setEstimate] = useState<EstimateWithClient | null>(null)
  const [laborLogs, setLaborLogs] = useState<LaborLog[]>([])
  const [activeLaborLogId, setActiveLaborLogId] = useState<string | null>(null)
  const [laborEntriesMap, setLaborEntriesMap] = useState<Record<string, LaborEntry[]>>({})
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([])
  const [rateCardData, setRateCardData] = useState<RateCardItemsBySection[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const est = await getEstimate(estimateId)
      setEstimate(est)

      const [logs, items, rcData] = await Promise.all([
        getLaborLogs(estimateId),
        getLineItems(estimateId),
        getRateCardItemsBySection(est.client_id),
      ])

      setLaborLogs(logs)
      setLineItems(items)
      setRateCardData(rcData)

      // Load entries for all logs
      const entriesMap: Record<string, LaborEntry[]> = {}
      await Promise.all(logs.map(async (log) => {
        entriesMap[log.id] = await getLaborEntries(log.id)
      }))
      setLaborEntriesMap(entriesMap)

      // Set active log
      if (logs.length > 0) {
        const primary = logs.find((l) => l.is_primary)
        setActiveLaborLogId(primary?.id ?? logs[0].id)
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
      setActiveLaborLogId(log.id)
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
      // Switch to first remaining log
      setActiveLaborLogId((prev) => {
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

  async function handleAddEntry(data: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }) {
    if (!activeLaborLogId) return
    try {
      const entry = await createLaborEntry({
        labor_log_id: activeLaborLogId,
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
        display_order: (laborEntriesMap[activeLaborLogId]?.length ?? 0),
      })
      setLaborEntriesMap((prev) => ({
        ...prev,
        [activeLaborLogId]: [...(prev[activeLaborLogId] ?? []), entry],
      }))
    } catch (err) {
      console.error('Failed to add entry:', err)
    }
  }

  async function handleUpdateEntry(id: string, updates: Partial<LaborEntry>) {
    if (!activeLaborLogId) return
    try {
      const updated = await updateLaborEntry(id, updates)
      setLaborEntriesMap((prev) => ({
        ...prev,
        [activeLaborLogId]: (prev[activeLaborLogId] ?? []).map((e) => e.id === id ? updated : e),
      }))
    } catch (err) {
      console.error('Failed to update entry:', err)
    }
  }

  async function handleDeleteEntry(id: string) {
    if (!activeLaborLogId) return
    try {
      await deleteLaborEntry(id)
      setLaborEntriesMap((prev) => ({
        ...prev,
        [activeLaborLogId]: (prev[activeLaborLogId] ?? []).filter((e) => e.id !== id),
      }))
    } catch (err) {
      console.error('Failed to delete entry:', err)
    }
  }

  async function handleAddLineItem(section: string, data: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }) {
    try {
      const item = await createLineItem({
        estimate_id: estimateId,
        section,
        item_name: data.item_name,
        description: data.description || null,
        quantity: data.quantity,
        unit_cost: data.unit_cost,
        markup_pct: data.markup_pct,
        gl_code: data.gl_code,
        rate_card_item_id: data.rate_card_item_id,
        notes: null,
        display_order: lineItems.filter((i) => i.section === section).length,
      })
      setLineItems((prev) => [...prev, item])
    } catch (err) {
      console.error('Failed to add line item:', err)
    }
  }

  async function handleUpdateLineItem(id: string, updates: Partial<EstimateLineItem>) {
    try {
      const updated = await updateLineItem(id, updates)
      setLineItems((prev) => prev.map((i) => i.id === id ? updated : i))
    } catch (err) {
      console.error('Failed to update line item:', err)
    }
  }

  async function handleDeleteLineItem(id: string) {
    try {
      await deleteLineItem(id)
      setLineItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      console.error('Failed to delete line item:', err)
    }
  }

  // ── Render ──

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading estimate...</p>
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Estimate not found.</p>
      </div>
    )
  }

  const defaultMarkup = estimate.clients.third_party_markup * 100
  const activeEntries = activeLaborLogId ? (laborEntriesMap[activeLaborLogId] ?? []) : []

  const lineItemTabs = [
    { key: 'production', label: 'Production', pt: true },
    { key: 'travel', label: 'Travel & Logistics', pt: true },
    { key: 'creative', label: 'Creative', pt: false },
    { key: 'access', label: 'Access Fees & Insurance', pt: false },
    { key: 'misc', label: 'Misc', pt: false },
  ]

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">Estimate Builder</h1>
        <p className="text-muted-foreground">
          {estimate.clients.name} — {estimate.event_name}
        </p>
      </div>

      {/* 70/30 Split Layout */}
      <div className="flex gap-6">
        {/* Left Panel — Estimate Working Area (70%) */}
        <div className="flex-[7] min-w-0 space-y-4">
          <EventHeader estimate={estimate} onUpdate={handleUpdateEstimate} />

          <Tabs defaultValue="labor">
            <TabsList>
              <TabsTrigger value="labor">Labor Log</TabsTrigger>
              {lineItemTabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
              ))}
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="labor">
              <LaborLogTab
                estimate={estimate}
                laborLogs={laborLogs}
                activeLaborLogId={activeLaborLogId}
                entries={activeEntries}
                rateCardData={rateCardData}
                allEntriesMap={laborEntriesMap}
                onSelectLog={setActiveLaborLogId}
                onAddLocation={handleAddLocation}
                onDeleteLocation={handleDeleteLocation}
                onAddEntry={handleAddEntry}
                onUpdateEntry={handleUpdateEntry}
                onDeleteEntry={handleDeleteEntry}
              />
            </TabsContent>

            {lineItemTabs.map((tab) => (
              <TabsContent key={tab.key} value={tab.key}>
                <LineItemTab
                  items={lineItems.filter((i) => i.section === tab.key)}
                  section={tab.key}
                  isPassThrough={tab.pt}
                  defaultMarkup={tab.pt ? defaultMarkup : 0}
                  rateCardData={rateCardData}
                  clientName={estimate.clients.name}
                  onAdd={(data) => handleAddLineItem(tab.key, data)}
                  onUpdate={handleUpdateLineItem}
                  onDelete={handleDeleteLineItem}
                />
              </TabsContent>
            ))}

            <TabsContent value="summary">
              <SummaryTab allEntriesMap={laborEntriesMap} lineItems={lineItems} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel — AI Intelligence (30%) */}
        <div className="flex-[3] min-w-[280px] border-l border-border pl-6">
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
