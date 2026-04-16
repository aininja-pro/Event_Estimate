import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileSpreadsheet, MoreVertical, ChevronUp, ChevronDown, Search, X, Copy } from 'lucide-react'
import { getEstimates, createEstimate, createPrimarySegmentForEstimate, updateEstimate, deleteEstimate, duplicateEstimate } from '@/lib/estimate-service'
import { getClients } from '@/lib/rate-card-service'
import { useUser } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { createNotification, notifyByRole } from '@/lib/notification-service'
import type { EstimateWithSegments } from '@/types/estimate'
import type { Client } from '@/types/rate-card'

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

const STATUS_LABELS: Record<string, string> = {
  all: 'All',
  pipeline: 'Pipeline',
  estimate: 'Estimate',
  in_review: 'In Review',
  active: 'Active',
  recap: 'Recap',
  invoiced: 'Invoiced',
  lost: 'Lost',
  cancelled: 'Cancelled',
  archived: 'Archived',
}

const STATUS_DOT: Record<string, string> = {
  pipeline: 'bg-zinc-400',
  estimate: 'bg-zinc-500',
  in_review: 'bg-amber-500',
  active: 'bg-fuchsia-500',
  recap: 'bg-violet-500',
  invoiced: 'bg-teal-500',
  lost: 'bg-red-500',
  cancelled: 'bg-slate-400',
  archived: 'bg-slate-300',
}

const STATUS_BADGE: Record<string, string> = {
  pipeline: 'bg-zinc-100 text-zinc-600',
  estimate: 'bg-zinc-100 text-zinc-600',
  in_review: 'bg-amber-50 text-amber-700',
  active: 'bg-fuchsia-50 text-fuchsia-700',
  recap: 'bg-violet-50 text-violet-700',
  invoiced: 'bg-teal-50 text-teal-700',
  lost: 'bg-red-50 text-red-700',
  cancelled: 'bg-slate-50 text-slate-500',
  archived: 'bg-zinc-100 text-zinc-400',
}

const SEGMENT_PILL: Record<string, string> = {
  pipeline: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  estimate: 'bg-zinc-200 text-zinc-700 border-zinc-300',
  in_review: 'bg-amber-100 text-amber-800 border-amber-300',
  active: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
  recap: 'bg-violet-100 text-violet-800 border-violet-300',
  invoiced: 'bg-teal-100 text-teal-800 border-teal-300',
  lost: 'bg-red-100 text-red-800 border-red-300',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-300',
}

const SEGMENT_DOT: Record<string, string> = {
  pipeline: 'bg-zinc-400',
  estimate: 'bg-zinc-500',
  in_review: 'bg-amber-500',
  active: 'bg-fuchsia-500',
  recap: 'bg-violet-500',
  invoiced: 'bg-teal-500',
  lost: 'bg-red-500',
  cancelled: 'bg-slate-400',
}

const STATUS_ORDER: Record<string, number> = {
  pipeline: 0, estimate: 1, in_review: 2, active: 3, recap: 4, invoiced: 5, lost: 6, cancelled: 7, archived: 8,
}

type SortKey = 'event_name' | 'client' | 'status' | 'updated_at'
type SortDir = 'asc' | 'desc' | null

const FILTER_STATUSES = ['all', 'pipeline', 'estimate', 'in_review', 'active', 'recap', 'invoiced', 'lost', 'cancelled'] as const

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return '—'
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  return formatDate(start || end)
}

export function EstimatesListPage() {
  const navigate = useNavigate()
  const { profile } = useUser()
  const userRole = profile?.role || 'account_manager'
  const [estimates, setEstimates] = useState<EstimateWithSegments[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 })
  const [deleteTarget, setDeleteTarget] = useState<EstimateWithSegments | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  // New estimate form state
  const [formClientId, setFormClientId] = useState('')
  const [formEventName, setFormEventName] = useState('')
  const [formEventType, setFormEventType] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [formCostStructure, setFormCostStructure] = useState<'corporate' | 'office'>('corporate')

  useEffect(() => {
    loadData()
  }, [])

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        e.stopPropagation()
        e.preventDefault()
        setOpenMenuId(null)
      }
    }
    if (openMenuId) {
      // Use click (not mousedown) with capture to prevent row navigation
      document.addEventListener('click', handleClickOutside, true)
      return () => document.removeEventListener('click', handleClickOutside, true)
    }
  }, [openMenuId])

  async function loadData() {
    try {
      const [estimatesData, clientsData] = await Promise.all([
        getEstimates(),
        getClients(),
      ])
      setEstimates(estimatesData)
      setClients(clientsData)
    } catch (err) {
      console.error('Failed to load estimates:', err)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormClientId('')
    setFormEventName('')
    setFormEventType('')
    setFormLocation('')
    setFormStartDate('')
    setFormEndDate('')
    setFormCostStructure('corporate')
  }

  function computeDurationDays(): number | null {
    if (!formStartDate || !formEndDate) return null
    const start = new Date(formStartDate)
    const end = new Date(formEndDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : null
  }

  async function handleCreate() {
    if (!formClientId || !formEventName) return
    setSaving(true)
    try {
      const duration = computeDurationDays()
      const estimate = await createEstimate({
        client_id: formClientId,
        event_name: formEventName,
        event_type: formEventType || null,
        location: formLocation || null,
        start_date: formStartDate || null,
        end_date: formEndDate || null,
        duration_days: duration,
        expected_attendance: null,
        po_number: null,
        project_id: null,
        cost_structure: formCostStructure,
        internal_notes: null,
        published_notes: null,
        status: 'pipeline',
        created_by: profile?.id || null,
      })

      // Always create the initial segment, even if the header location was left blank.
      await createPrimarySegmentForEstimate(estimate, {
        location_name: formLocation || undefined,
        start_date: formStartDate || null,
        end_date: formEndDate || null,
        status: 'pipeline',
      })

      // Dispatch pipeline creation notifications
      const clientName = clients.find(c => c.id === formClientId)?.name || 'Unknown'
      if (profile?.id) {
        createNotification({
          user_id: profile.id,
          type: 'segment_status_changed',
          title: 'New event created',
          body: `New event created: ${formEventName}`,
          estimate_id: estimate.id,
        }).catch((err) => console.error('Notification failed:', err))
      }
      notifyByRole('account_manager', {
        type: 'segment_status_changed',
        title: 'New pipeline event',
        body: `New pipeline event: ${formEventName} for ${clientName}`,
        estimate_id: estimate.id,
      }).catch((err) => console.error('Notification failed:', err))

      setShowModal(false)
      resetForm()
      navigate(`/estimates/${estimate.id}`)
    } catch (err) {
      console.error('Failed to create estimate:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive(est: EstimateWithSegments) {
    setOpenMenuId(null)
    try {
      await updateEstimate(est.id, { status: 'archived' })
      const fresh = await getEstimates()
      setEstimates(fresh)
    } catch (err) {
      console.error('Failed to archive estimate:', err)
    }
  }

  async function handleUnarchive(est: EstimateWithSegments) {
    setOpenMenuId(null)
    try {
      await updateEstimate(est.id, { status: 'estimate' })
      // Reload full list to ensure consistency
      const fresh = await getEstimates()
      setEstimates(fresh)
      // If no more archived estimates, switch back to default view
      if (!fresh.some(e => e.status === 'archived')) setShowArchived(false)
    } catch (err) {
      console.error('Failed to unarchive estimate:', err)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteEstimate(deleteTarget.id)
      setEstimates(prev => prev.filter(e => e.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      console.error('Failed to delete estimate:', err)
    } finally {
      setDeleting(false)
    }
  }

  async function handleDuplicate(est: EstimateWithSegments) {
    setOpenMenuId(null)
    setDuplicatingId(est.id)
    try {
      const { newEstimateId } = await duplicateEstimate(est.id, profile?.id || '')
      navigate(`/estimates/${newEstimateId}`)
    } catch (err) {
      console.error('Failed to duplicate estimate:', err)
    } finally {
      setDuplicatingId(null)
    }
  }

  const nonArchivedEstimates = estimates.filter(e => e.status !== 'archived')
  const archivedCount = estimates.filter(e => e.status === 'archived').length

  // Status counts for filter tabs (exclude archived)
  const statusCounts = nonArchivedEstimates.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1
    return acc
  }, {})

  function toggleSort(key: SortKey) {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc') }
    else if (sortDir === 'asc') setSortDir('desc')
    else { setSortKey(null); setSortDir(null) }
  }

  const visibleEstimates = (() => {
    const base = showArchived ? estimates : nonArchivedEstimates
    const byStatus = statusFilter === 'all' ? base : base.filter(e => e.status === statusFilter)
    const q = searchQuery.trim().toLowerCase()
    const filtered = !q ? byStatus : byStatus.filter(e =>
      e.event_name.toLowerCase().includes(q) ||
      e.clients.name.toLowerCase().includes(q) ||
      (e.location ?? '').toLowerCase().includes(q) ||
      e.labor_logs?.some(s => s.location_name.toLowerCase().includes(q))
    )
    if (!sortKey || !sortDir) return filtered
    const sorted = [...filtered]
    const dir = sortDir === 'asc' ? 1 : -1
    sorted.sort((a, b) => {
      switch (sortKey) {
        case 'event_name': return dir * a.event_name.localeCompare(b.event_name)
        case 'client': return dir * a.clients.name.localeCompare(b.clients.name)
        case 'status': return dir * ((STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99))
        case 'updated_at': return dir * (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
        default: return 0
      }
    })
    return sorted
  })()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Loading estimates...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Estimates</h1>
          <p className="text-sm text-muted-foreground">Create and manage event estimates</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Search estimates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-[200px] rounded-md border border-border/50 bg-white pl-7 pr-7 text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/30 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {archivedCount > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {showArchived ? 'Hide archived' : `Show archived (${archivedCount})`}
            </button>
          )}
          {hasPermission(userRole, 'create_estimate') && (
            <Button size="sm" onClick={() => setShowModal(true)} className="text-[13px] bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm">
              + New Estimate
            </Button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-0.5 border-b border-border/40">
        {FILTER_STATUSES.map((s) => {
          const isActive = statusFilter === s
          const count = s === 'all' ? nonArchivedEstimates.length : (statusCounts[s] || 0)
          if (s === 'pipeline' && count === 0) return null
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[11px] font-medium transition-colors border-b-2 ${
                isActive
                  ? 'text-foreground border-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
            >
              {STATUS_LABELS[s] || s}
              <span className="ml-1 text-[10px] text-muted-foreground">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Segment Status Legend */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        {Object.entries(SEGMENT_DOT).map(([status, dotClass]) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
            {STATUS_LABELS[status] || status}
          </span>
        ))}
      </div>

      {/* Estimates Table */}
      {visibleEstimates.length === 0 ? (
        <div className="border border-border/40 rounded-md flex flex-col items-center justify-center py-16">
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No estimates yet</p>
          <p className="text-[13px] text-muted-foreground/70 mt-1">Create your first estimate to get started.</p>
          {hasPermission(userRole, 'create_estimate') && (
            <Button size="sm" onClick={() => setShowModal(true)} className="mt-4">
              + New Estimate
            </Button>
          )}
        </div>
      ) : (
        <div className="border border-border/40 rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                {([
                  { key: 'event_name' as SortKey, label: 'Event Name', align: '' },
                  { key: 'client' as SortKey, label: 'Client', align: '' },
                  { key: 'status' as SortKey, label: 'Status', align: '' },
                  { key: null, label: 'Location', align: '' },
                  { key: null, label: 'Dates', align: '' },
                  { key: 'updated_at' as SortKey, label: 'Last Updated', align: 'text-right' },
                ] as const).map(({ key, label, align }) => (
                  <TableHead
                    key={label}
                    className={`text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2 ${align} ${key ? 'cursor-pointer select-none hover:text-foreground transition-colors' : ''}`}
                    onClick={key ? () => toggleSort(key) : undefined}
                  >
                    <span className={`inline-flex items-center gap-0.5 ${align === 'text-right' ? 'justify-end' : ''}`}>
                      {label}
                      {key && sortKey === key && sortDir === 'asc' && <ChevronUp className="h-3 w-3" />}
                      {key && sortKey === key && sortDir === 'desc' && <ChevronDown className="h-3 w-3" />}
                    </span>
                  </TableHead>
                ))}
                <TableHead className="w-10 py-2" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleEstimates.map((est) => {
                const isArchived = est.status === 'archived'
                return (
                  <TableRow
                    key={est.id}
                    className={`cursor-pointer border-b border-border/30 hover:bg-muted/30 transition-colors ${isArchived ? 'text-muted-foreground/40' : ''}`}
                    onClick={() => navigate(`/estimates/${est.id}`)}
                  >
                    <TableCell className="text-[13px] font-medium py-2.5">{est.event_name}</TableCell>
                    <TableCell className="text-[13px] py-2.5">{est.clients.name}</TableCell>
                    <TableCell className="py-2.5">
                      {(est.labor_logs?.length ?? 0) === 0 ? (
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_BADGE[est.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[est.status] ?? 'bg-zinc-400'}`} />
                          {STATUS_LABELS[est.status] || est.status}
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {est.labor_logs.map((seg) => (
                            <span
                              key={seg.id}
                              className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${SEGMENT_PILL[seg.status] ?? 'bg-zinc-100 text-zinc-600 border-zinc-300'}`}
                            >
                              <span className="truncate max-w-[100px]">{seg.location_name}</span>
                              <span className="text-[9px] uppercase tracking-wider opacity-80">{STATUS_LABELS[seg.status] || seg.status}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground py-2.5">{est.location || '—'}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground tabular-nums py-2.5">{formatDateRange(est.start_date, est.end_date)}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground tabular-nums py-2.5 text-right">{formatDate(est.updated_at)}</TableCell>
                    <TableCell className="py-2.5 px-2">
                      <div className="relative" ref={openMenuId === est.id ? menuRef : undefined}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (openMenuId === est.id) {
                              setOpenMenuId(null)
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                              setOpenMenuId(est.id)
                            }
                          }}
                          className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === est.id && (
                          <div
                            ref={menuRef}
                            className="fixed z-[9999] bg-white dark:bg-zinc-900 border border-border/50 rounded-md shadow-lg py-1 w-[140px]"
                            style={{ top: menuPos.top, right: menuPos.right }}
                          >
                            {!isArchived && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDuplicate(est) }}
                                disabled={duplicatingId === est.id}
                                className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[13px] hover:bg-muted/50 transition-colors disabled:opacity-50"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                {duplicatingId === est.id ? 'Duplicating...' : 'Duplicate'}
                              </button>
                            )}
                            {isArchived ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUnarchive(est) }}
                                className="block w-full text-left px-3 py-1.5 text-[13px] hover:bg-muted/50 transition-colors"
                              >
                                Unarchive
                              </button>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleArchive(est) }}
                                className="block w-full text-left px-3 py-1.5 text-[13px] hover:bg-muted/50 transition-colors"
                              >
                                Archive
                              </button>
                            )}
                            {hasPermission(userRole, 'delete_estimate') && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(est); setOpenMenuId(null) }}
                                className="block w-full text-left px-3 py-1.5 text-[13px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Delete Estimate</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground py-2">
            Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.event_name}</span>? This will permanently remove the estimate and all associated labor logs, entries, and line items. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} className="text-[13px]">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-[13px] bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete Estimate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Estimate Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">New Estimate</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {/* Client */}
            <div className="space-y-1">
              <Label className="text-xs">Client *</Label>
              <Select value={formClientId} onValueChange={setFormClientId}>
                <SelectTrigger className="h-8 text-sm border-border/50">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-[13px]">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Name */}
            <div className="space-y-1">
              <Label className="text-xs">Event Name *</Label>
              <Input
                placeholder="e.g., Mazda CX-70 Launch Experience"
                value={formEventName}
                onChange={(e) => setFormEventName(e.target.value)}
                className="h-8 text-sm border-border/50"
              />
            </div>

            {/* Event Type */}
            <div className="space-y-1">
              <Label className="text-xs">Event Type</Label>
              <Select value={formEventType} onValueChange={setFormEventType}>
                <SelectTrigger className="h-8 text-sm border-border/50">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-[13px]">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <Label className="text-xs">Location</Label>
              <Input
                placeholder="e.g., Los Angeles, CA"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="h-8 text-sm border-border/50"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="h-8 text-sm border-border/50"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="h-8 text-sm border-border/50"
                />
              </div>
            </div>

            {/* Cost Structure */}
            <div className="space-y-1">
              <Label className="text-xs">Cost Structure</Label>
              <div className="flex items-center gap-0 h-7">
                <button
                  type="button"
                  onClick={() => setFormCostStructure('corporate')}
                  className={`text-[13px] transition-colors ${formCostStructure === 'corporate' ? 'font-medium text-foreground border-b border-foreground/40' : 'text-muted-foreground hover:text-foreground/80'}`}
                >
                  Corporate
                </button>
                <span className="mx-2 text-border">/</span>
                <button
                  type="button"
                  onClick={() => setFormCostStructure('office')}
                  className={`text-[13px] transition-colors ${formCostStructure === 'office' ? 'font-medium text-foreground border-b border-foreground/40' : 'text-muted-foreground hover:text-foreground/80'}`}
                >
                  Office
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowModal(false); resetForm() }} className="text-[13px]">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!formClientId || !formEventName || saving}
              className="text-[13px] bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm"
            >
              {saving ? 'Creating...' : 'Create Estimate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
