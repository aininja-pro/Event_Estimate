import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, FileSpreadsheet } from 'lucide-react'
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

const STATUS_COLORS: Record<string, string> = {
  pipeline: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  review: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  recap: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  complete: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
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
        <p className="text-muted-foreground">Loading estimates...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">Create and manage event estimates</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Estimate
        </Button>
      </div>

      {/* Estimates Table */}
      {estimates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No estimates yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Create your first estimate to get started.</p>
            <Button onClick={() => setShowModal(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              New Estimate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.map((est) => (
                  <TableRow
                    key={est.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/estimates/${est.id}`)}
                  >
                    <TableCell className="font-medium">{est.event_name}</TableCell>
                    <TableCell>{est.clients.name}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[est.status] ?? ''}>
                        {est.status.charAt(0).toUpperCase() + est.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{est.location || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDateRange(est.start_date, est.end_date)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(est.updated_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* New Estimate Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Estimate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Client */}
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={formClientId} onValueChange={setFormClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Name */}
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input
                placeholder="e.g., Mazda CX-70 Launch Experience"
                value={formEventName}
                onChange={(e) => setFormEventName(e.target.value)}
              />
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={formEventType} onValueChange={setFormEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="e.g., Los Angeles, CA"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Cost Structure */}
            <div className="space-y-2">
              <Label>Cost Structure</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={formCostStructure === 'corporate' ? 'default' : 'outline'}
                  onClick={() => setFormCostStructure('corporate')}
                >
                  Corporate
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={formCostStructure === 'office' ? 'default' : 'outline'}
                  onClick={() => setFormCostStructure('office')}
                >
                  Office
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModal(false); resetForm() }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formClientId || !formEventName || saving}
            >
              {saving ? 'Creating...' : 'Create Estimate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
