import { useState, useEffect } from 'react'
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
import { FileSpreadsheet } from 'lucide-react'
import { getEstimates, createEstimate, createLaborLog } from '@/lib/estimate-service'
import { getClients } from '@/lib/rate-card-service'
import type { EstimateWithClient } from '@/types/estimate'
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

const STATUS_DOT: Record<string, string> = {
  pipeline: 'bg-zinc-400',
  draft: 'bg-amber-400',
  review: 'bg-sky-400',
  approved: 'bg-emerald-400',
  active: 'bg-emerald-400',
  recap: 'bg-violet-400',
  complete: 'bg-zinc-400',
}

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
  const [estimates, setEstimates] = useState<EstimateWithClient[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

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
        project_notes: null,
        status: 'draft',
        created_by: null,
      })

      // Auto-create primary labor log
      if (formLocation) {
        await createLaborLog({
          estimate_id: estimate.id,
          location_name: formLocation,
          is_primary: true,
        })
      }

      setShowModal(false)
      resetForm()
      navigate(`/estimates/${estimate.id}`)
    } catch (err) {
      console.error('Failed to create estimate:', err)
    } finally {
      setSaving(false)
    }
  }

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
        <Button size="sm" onClick={() => setShowModal(true)} className="text-[13px] bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm">
          + New Estimate
        </Button>
      </div>

      {/* Estimates Table */}
      {estimates.length === 0 ? (
        <div className="border border-border/40 rounded-md flex flex-col items-center justify-center py-16">
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No estimates yet</p>
          <p className="text-[13px] text-muted-foreground/70 mt-1">Create your first estimate to get started.</p>
          <Button size="sm" onClick={() => setShowModal(true)} className="mt-4">
            + New Estimate
          </Button>
        </div>
      ) : (
        <div className="border border-border/40 rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Event Name</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Client</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Status</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Location</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Dates</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2 text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.map((est) => (
                <TableRow
                  key={est.id}
                  className="cursor-pointer border-b border-border/30 hover:bg-muted/30 transition-colors"
                  onClick={() => navigate(`/estimates/${est.id}`)}
                >
                  <TableCell className="text-[13px] font-medium py-2.5">{est.event_name}</TableCell>
                  <TableCell className="text-[13px] py-2.5">{est.clients.name}</TableCell>
                  <TableCell className="py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[est.status] ?? 'bg-zinc-400'}`} />
                      <span className="text-[13px]">{est.status.charAt(0).toUpperCase() + est.status.slice(1)}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground py-2.5">{est.location || '—'}</TableCell>
                  <TableCell className="text-[13px] text-muted-foreground tabular-nums py-2.5">{formatDateRange(est.start_date, est.end_date)}</TableCell>
                  <TableCell className="text-[13px] text-muted-foreground tabular-nums py-2.5 text-right">{formatDate(est.updated_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
