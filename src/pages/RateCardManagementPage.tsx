import { useState, useEffect, useCallback } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  Pencil,
  Loader2,
} from 'lucide-react'
import type {
  Client,
  RateCardItem,
  RateCardSection,
  RateCardItemsBySection,
} from '@/types/rate-card'
import {
  getClients,
  getRateCardItemsBySection,
  createRateCardItem,
  updateRateCardItem,
  deleteRateCardItem,
} from '@/lib/rate-card-service'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null): string {
  if (n == null) return '—'
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function pct(n: number): string {
  return (n * 100).toFixed(1).replace(/\.0$/, '') + '%'
}

const COST_TYPE_LABELS: Record<string, string> = {
  labor: 'Labor',
  flat_fee: 'Flat Fee',
  pass_through: 'Pass-Through',
}

// ── Rate Form Dialog ─────────────────────────────────────────────────────────

interface RateFormState {
  name: string
  unit_rate: string
  unit_label: string
  gl_code: string
}

const EMPTY_FORM: RateFormState = { name: '', unit_rate: '', unit_label: '', gl_code: '' }

function formFromItem(item: RateCardItem): RateFormState {
  return {
    name: item.name,
    unit_rate: item.unit_rate != null ? String(item.unit_rate) : '',
    unit_label: item.unit_label ?? '',
    gl_code: item.gl_code ?? '',
  }
}

interface RateFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (form: RateFormState) => Promise<void>
  onDelete?: () => Promise<void>
  title: string
  description: string
  initial: RateFormState
  isPassThrough: boolean
}

function RateFormDialog({ open, onClose, onSave, onDelete, title, description, initial, isPassThrough }: RateFormDialogProps) {
  const [form, setForm] = useState<RateFormState>(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm(initial)
  }, [open, initial])

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) return
    setSaving(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="rate-name">Item Name</Label>
            <Input id="rate-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Event Director Day (10 hr)" />
          </div>
          {!isPassThrough && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="rate-amount">Unit Rate ($)</Label>
                <Input id="rate-amount" type="number" step="0.01" value={form.unit_rate} onChange={(e) => setForm({ ...form, unit_rate: e.target.value })} placeholder="0.00" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rate-unit">Unit Label</Label>
                <Input id="rate-unit" value={form.unit_label} onChange={(e) => setForm({ ...form, unit_label: e.target.value })} placeholder="e.g., /10 hr day" />
              </div>
            </div>
          )}
          {isPassThrough && (
            <p className="text-sm text-muted-foreground">Pass-through items are estimated per project. No fixed rate is set here.</p>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="rate-gl">GL Code</Label>
            <Input id="rate-gl" value={form.gl_code} onChange={(e) => setForm({ ...form, gl_code: e.target.value })} placeholder="e.g., 4000.26" />
          </div>
        </div>
        <DialogFooter>
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving} className="mr-auto">
              Remove
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Section Table ────────────────────────────────────────────────────────────

interface SectionTableProps {
  section: RateCardSection
  items: RateCardItem[]
  search: string
  onAddRate: (section: RateCardSection) => void
  onEditRate: (item: RateCardItem) => void
}

function SectionTable({ section, items, search, onAddRate, onEditRate }: SectionTableProps) {
  const isPassThrough = section.cost_type === 'pass_through'
  const term = search.toLowerCase()
  const filtered = items.filter((item) => item.name.toLowerCase().includes(term))

  if (search && filtered.length === 0) return null

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{section.name}</h3>
            <Badge variant="secondary" className="text-[10px]">
              {COST_TYPE_LABELS[section.cost_type] ?? section.cost_type}
            </Badge>
            <span className="text-xs text-muted-foreground">{filtered.length} items</span>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => onAddRate(section)}>
            <Plus className="h-3.5 w-3.5" />
            Add Rate
          </Button>
        </div>

        {/* Rate items table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Item Name</TableHead>
              {!isPassThrough && <TableHead className="text-right w-[15%]">Unit Rate</TableHead>}
              <TableHead className="w-[15%]">Unit Label</TableHead>
              <TableHead className="w-[12%]">GL Code</TableHead>
              <TableHead className="w-[10%]">Source</TableHead>
              <TableHead className="w-[8%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} className="group hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div>
                    {item.name}
                    {item.has_overtime_rate && item.overtime_rate != null && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        OT: {fmt(item.overtime_rate)} {item.overtime_unit_label}
                        {item.overtime_gl_code && <span className="ml-2 text-muted-foreground/60">GL {item.overtime_gl_code}</span>}
                      </div>
                    )}
                  </div>
                </TableCell>
                {!isPassThrough && (
                  <TableCell className="text-right font-medium tabular-nums">{fmt(item.unit_rate)}</TableCell>
                )}
                <TableCell className="text-sm text-muted-foreground">{item.unit_label ?? '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">{item.gl_code ?? '—'}</TableCell>
                <TableCell>
                  {item.is_from_msa ? (
                    <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">MSA</Badge>
                  ) : (
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">Custom</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onEditRate(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={isPassThrough ? 5 : 6} className="text-center text-muted-foreground py-6">
                  No items in this section
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function RateCardManagementPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [sectionsWithItems, setSectionsWithItems] = useState<RateCardItemsBySection[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [dialogSection, setDialogSection] = useState<RateCardSection | null>(null)
  const [dialogItem, setDialogItem] = useState<RateCardItem | null>(null)

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null

  // Load clients on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getClients()
        if (cancelled) return
        setClients(data)
        if (data.length > 0) {
          setSelectedClientId(data[0].id)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load clients')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Load rate card items when client changes
  const loadItems = useCallback(async (clientId: string) => {
    setLoadingItems(true)
    try {
      const data = await getRateCardItemsBySection(clientId)
      setSectionsWithItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rate card')
    } finally {
      setLoadingItems(false)
    }
  }, [])

  useEffect(() => {
    if (selectedClientId) loadItems(selectedClientId)
  }, [selectedClientId, loadItems])

  // Total item count
  const totalItems = sectionsWithItems.reduce((sum, s) => sum + s.items.length, 0)
  const msaItems = sectionsWithItems.reduce((sum, s) => sum + s.items.filter((i) => i.is_from_msa).length, 0)
  const customItems = totalItems - msaItems

  // Dialog handlers
  function handleAddRate(section: RateCardSection) {
    setDialogMode('add')
    setDialogSection(section)
    setDialogItem(null)
    setDialogOpen(true)
  }

  function handleEditRate(item: RateCardItem) {
    const section = sectionsWithItems.find((s) => s.section.id === item.section_id)?.section ?? null
    setDialogMode('edit')
    setDialogSection(section)
    setDialogItem(item)
    setDialogOpen(true)
  }

  async function handleSaveAdd(form: RateFormState) {
    if (!selectedClientId || !dialogSection) return
    await createRateCardItem({
      client_id: selectedClientId,
      section_id: dialogSection.id,
      name: form.name.trim(),
      unit_rate: form.unit_rate ? parseFloat(form.unit_rate) : null,
      unit_label: form.unit_label || null,
      gl_code: form.gl_code || null,
      is_from_msa: false,
      is_pass_through: dialogSection.cost_type === 'pass_through',
      has_overtime_rate: false,
      overtime_rate: null,
      overtime_unit_label: null,
      overtime_gl_code: null,
      notes: null,
      display_order: 0,
      is_active: true,
      created_by: null,
    })
    await loadItems(selectedClientId)
  }

  async function handleSaveEdit(form: RateFormState) {
    if (!dialogItem || !selectedClientId) return
    await updateRateCardItem(dialogItem.id, {
      name: form.name.trim(),
      unit_rate: form.unit_rate ? parseFloat(form.unit_rate) : null,
      unit_label: form.unit_label || null,
      gl_code: form.gl_code || null,
    })
    await loadItems(selectedClientId)
  }

  async function handleDeleteRate() {
    if (!dialogItem || !selectedClientId) return
    await deleteRateCardItem(dialogItem.id)
    await loadItems(selectedClientId)
  }

  // ── Error / Loading states ──

  if (error) {
    return (
      <div className="space-y-4">
        <div className="pb-2 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Rate Card Management</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="pb-2 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Rate Card Management</h1>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading clients...</span>
        </div>
      </div>
    )
  }

  // ── Main render ──

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">Rate Card Management</h1>
        <p className="text-muted-foreground">Manage client-specific pricing from MSA rate cards</p>
      </div>

      {/* Client selector + search bar */}
      <div className="flex items-center gap-4">
        <Select value={selectedClientId ?? ''} onValueChange={setSelectedClientId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select client..." />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Client markup summary bar */}
      {selectedClient && (
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-xs text-muted-foreground">Client</p>
                <p className="text-sm font-semibold">{selectedClient.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Third Party Markup</p>
                <p className="text-sm font-semibold">{pct(selectedClient.third_party_markup)}</p>
              </div>
              {selectedClient.agency_fee > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Agency Fee</p>
                  <p className="text-sm font-semibold">{pct(selectedClient.agency_fee)}</p>
                </div>
              )}
              {selectedClient.trucking_markup > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Trucking Markup</p>
                  <p className="text-sm font-semibold">{pct(selectedClient.trucking_markup)}</p>
                </div>
              )}
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground">Rates</p>
                <p className="text-sm font-semibold">
                  {totalItems} <span className="text-muted-foreground font-normal">({msaItems} MSA, {customItems} custom)</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section-grouped rate tables */}
      {loadingItems ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading rate card...</span>
        </div>
      ) : (
        sectionsWithItems.map(({ section, items }) => (
          <SectionTable
            key={section.id}
            section={section}
            items={items}
            search={search}
            onAddRate={handleAddRate}
            onEditRate={handleEditRate}
          />
        ))
      )}

      {/* Add/Edit dialog */}
      <RateFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={dialogMode === 'add' ? handleSaveAdd : handleSaveEdit}
        onDelete={dialogMode === 'edit' ? handleDeleteRate : undefined}
        title={dialogMode === 'add' ? 'Add Custom Rate' : 'Edit Rate'}
        description={
          dialogMode === 'add'
            ? `Add a new rate to ${dialogSection?.name ?? 'this section'}`
            : `Editing "${dialogItem?.name ?? ''}"`
        }
        initial={dialogMode === 'edit' && dialogItem ? formFromItem(dialogItem) : EMPTY_FORM}
        isPassThrough={dialogSection?.cost_type === 'pass_through'}
      />
    </div>
  )
}
