import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  Plus,
} from 'lucide-react'
import type {
  Client,
  RateCardItem,
  RateCardSection,
  RateCardItemsBySection,
  FeeType,
} from '@/types/rate-card'
import {
  getClients,
  getRateCardItemsBySection,
  createRateCardItem,
  updateRateCardItem,
  deleteRateCardItem,
  getFeeTypes,
  createFeeType,
  updateFeeType,
  deleteFeeType,
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

/** Map rate_card_sections.name → fee_types.section key */
const SECTION_TO_FEE_TYPE_KEY: Record<string, string> = {
  'Planning & Administration Labor': 'planning_admin',
  'Onsite Event Labor': 'onsite_labor',
  'Travel Expenses': 'travel',
  'Production Expenses': 'production',
  'Logistics Expenses': 'logistics',
}

const COST_TYPE_ACCENT: Record<string, string> = {
  labor: 'text-muted-foreground',
  flat_fee: 'text-muted-foreground',
  pass_through: 'text-muted-foreground',
}

// ── Rate Form Dialog ─────────────────────────────────────────────────────────

interface RateFormState {
  fee_type_id: string | null
  name: string
  unit_rate: string
  unit_label: string
  gl_code: string
}

const EMPTY_FORM: RateFormState = { fee_type_id: null, name: '', unit_rate: '', unit_label: '', gl_code: '' }

function formFromItem(item: RateCardItem): RateFormState {
  return {
    fee_type_id: item.fee_type_id,
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
  mode: 'add' | 'edit'
  sectionKey?: string
  onSwitchToFeeTypes?: () => void
}

function RateFormDialog({ open, onClose, onSave, onDelete, title, description, initial, isPassThrough, mode, sectionKey, onSwitchToFeeTypes }: RateFormDialogProps) {
  const [form, setForm] = useState<RateFormState>(initial)
  const [saving, setSaving] = useState(false)
  const [allFeeTypes, setAllFeeTypes] = useState<FeeType[]>([])
  const [feeTypeSearch, setFeeTypeSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initial)
      setFeeTypeSearch('')
      setDropdownOpen(false)
      getFeeTypes().then(setAllFeeTypes).catch(() => {})
    }
  }, [open, initial])

  // Filter fee types to the current section, then by search term
  const sectionFeeTypes = sectionKey
    ? allFeeTypes.filter((ft) => ft.section === sectionKey)
    : allFeeTypes

  const filteredFeeTypes = feeTypeSearch
    ? sectionFeeTypes.filter((ft) =>
        ft.name.toLowerCase().includes(feeTypeSearch.toLowerCase()) ||
        ft.gl_code.toLowerCase().includes(feeTypeSearch.toLowerCase())
      )
    : sectionFeeTypes

  function selectFeeType(ft: FeeType) {
    setForm({
      ...form,
      fee_type_id: ft.id,
      name: ft.name,
      gl_code: ft.gl_code,
      unit_label: ft.unit_label ?? form.unit_label,
    })
    setFeeTypeSearch('')
    setDropdownOpen(false)
  }

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

  const selectedFeeType = form.fee_type_id ? allFeeTypes.find((ft) => ft.id === form.fee_type_id) : null
  const canSave = mode === 'edit' ? !!form.name.trim() : !!form.fee_type_id

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          {mode === 'add' ? (
            <div className="space-y-1">
              <Label className="text-xs">Fee Type</Label>
              <div className="relative">
                {!dropdownOpen ? (
                  <button
                    type="button"
                    className="flex items-center justify-between w-full h-8 px-3 text-sm border border-border/50 rounded-md bg-white hover:border-border transition-colors"
                    onClick={() => setDropdownOpen(true)}
                  >
                    {selectedFeeType ? (
                      <span className="text-foreground">{selectedFeeType.name}</span>
                    ) : (
                      <span className="text-muted-foreground">Select a fee type...</span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />
                  </button>
                ) : (
                  <div>
                    <Input
                      value={feeTypeSearch}
                      onChange={(e) => setFeeTypeSearch(e.target.value)}
                      onBlur={() => { setTimeout(() => setDropdownOpen(false), 150) }}
                      autoFocus
                      placeholder="Search fee types..."
                      className="h-8 text-sm border-border/50"
                    />
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto border border-border/50 rounded-md bg-white shadow-lg">
                      {filteredFeeTypes.length === 0 ? (
                        <div className="px-3 py-2 text-[13px] text-muted-foreground">No matching fee types</div>
                      ) : (
                        filteredFeeTypes.map((ft) => (
                          <button
                            key={ft.id}
                            className="w-full text-left px-3 py-1.5 hover:bg-muted/50 transition-colors flex items-center justify-between"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectFeeType(ft)}
                          >
                            <span className="text-[13px] text-foreground">{ft.name}</span>
                            <span className="text-[11px] text-muted-foreground font-mono ml-2">{ft.gl_code}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {selectedFeeType && !dropdownOpen && (
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                  <span className="font-mono">GL {selectedFeeType.gl_code}</span>
                  <span>{COST_TYPE_LABELS[selectedFeeType.cost_type] ?? selectedFeeType.cost_type}</span>
                  {selectedFeeType.unit_label && <span>{selectedFeeType.unit_label}</span>}
                </div>
              )}
              {onSwitchToFeeTypes && (
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  Don't see what you need?{' '}
                  <button className="underline hover:text-foreground transition-colors" onClick={() => { onClose(); onSwitchToFeeTypes() }}>
                    Add it in Fee Types first.
                  </button>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="text-xs">Item Name</Label>
              <div className="h-8 px-3 flex items-center text-sm text-foreground border border-border/30 rounded-md bg-muted/30">
                {form.name}
              </div>
              {form.gl_code && (
                <span className="text-[11px] text-muted-foreground font-mono">GL {form.gl_code}</span>
              )}
            </div>
          )}
          {!isPassThrough && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Unit Rate ($)</Label>
                <Input id="rate-amount" type="number" step="0.01" value={form.unit_rate} onChange={(e) => setForm({ ...form, unit_rate: e.target.value })} placeholder="0.00" className="h-8 text-sm border-border/50" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Unit Label</Label>
                <Input id="rate-unit" value={form.unit_label} onChange={(e) => setForm({ ...form, unit_label: e.target.value })} placeholder="e.g., /10 hr day" className="h-8 text-sm border-border/50" />
              </div>
            </div>
          )}
          {isPassThrough && (
            <p className="text-[13px] text-muted-foreground">Pass-through items are estimated per project. No fixed rate is set here.</p>
          )}
        </div>
        <DialogFooter>
          {onDelete && (
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={saving} className="mr-auto text-[13px] text-red-800/60 border-red-800/20 hover:bg-red-800/10 hover:text-red-800/80 hover:border-red-800/30">
              Remove
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving} className="text-[13px]">Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !canSave} className="text-[13px] bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm">
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
  thirdPartyMarkup: number
  collapsed: boolean
  onToggle: () => void
  onAddRate: (section: RateCardSection) => void
  onEditRate: (item: RateCardItem) => void
}

function SectionTable({ section, items, search, thirdPartyMarkup, collapsed, onToggle, onAddRate, onEditRate }: SectionTableProps) {
  const isPassThrough = section.cost_type === 'pass_through'
  const term = search.toLowerCase()
  const filtered = items.filter((item) => item.name.toLowerCase().includes(term))

  if (search && filtered.length === 0) return null

  return (
    <div className="border border-border/40 rounded-md overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-b border-border/50 cursor-pointer select-none" onClick={onToggle}>
        <div className="flex items-center gap-2.5">
          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`} />
          <span className="text-[12px] uppercase tracking-widest font-semibold text-foreground/90">{section.name}</span>
          <span className={`text-[11px] ${COST_TYPE_ACCENT[section.cost_type]}`}>
            {COST_TYPE_LABELS[section.cost_type] ?? section.cost_type}
          </span>
          <span className="text-[11px] text-muted-foreground">{filtered.length} items</span>
        </div>
        <button
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
          onClick={(e) => { e.stopPropagation(); onAddRate(section) }}
        >
          + Add Rate
        </button>
      </div>
      {!collapsed && (
        <div>
          {isPassThrough && thirdPartyMarkup > 0 && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium px-4 pb-1.5">
              Pass-through · {pct(thirdPartyMarkup)} markup
            </p>
          )}

          {/* Rate items table */}
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="w-[40%] text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Item Name</TableHead>
                {!isPassThrough && <TableHead className="text-right w-[15%] text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Unit Rate</TableHead>}
                <TableHead className="w-[15%] text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Unit Label</TableHead>
                <TableHead className="w-[12%] text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">GL Code</TableHead>
                <TableHead className="w-[10%] text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Source</TableHead>
                <TableHead className="w-[8%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="group border-b border-border/40 hover:bg-muted/30">
                  <TableCell className="py-1.5">
                    <span className="text-[13px] text-foreground">{item.name}</span>
                    {item.has_overtime_rate && item.overtime_rate != null && (
                      <span className="text-[10px] text-muted-foreground ml-2">
                        OT: {fmt(item.overtime_rate)} {item.overtime_unit_label}
                        {item.overtime_gl_code && <span className="ml-1 font-mono">GL {item.overtime_gl_code}</span>}
                      </span>
                    )}
                  </TableCell>
                  {!isPassThrough && (
                    <TableCell className="text-right py-1">
                      <span className="text-[13px] font-medium tabular-nums text-foreground">{fmt(item.unit_rate)}</span>
                    </TableCell>
                  )}
                  <TableCell className="py-1">
                    <span className="text-[13px] text-muted-foreground">{item.unit_label ?? '—'}</span>
                  </TableCell>
                  <TableCell className="py-1">
                    <span className="text-[13px] text-muted-foreground tabular-nums font-mono">{item.gl_code ?? '—'}</span>
                  </TableCell>
                  <TableCell className="py-1">
                    {item.is_from_msa ? (
                      <span className="text-[11px] text-green-800/60 font-medium">MSA</span>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-medium">Custom</span>
                    )}
                  </TableCell>
                  <TableCell className="py-1">
                    <Pencil
                      className="h-3 w-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity cursor-pointer text-foreground/60"
                      onClick={() => onEditRate(item)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isPassThrough ? 5 : 6} className="text-center text-muted-foreground/70 text-xs py-6">
                    No items in this section
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// ── Fee Type Section Groups ──────────────────────────────────────────────────

const FEE_TYPE_SECTIONS = [
  { key: 'planning_admin', label: 'Planning & Admin' },
  { key: 'onsite_labor', label: 'Onsite Labor' },
  { key: 'travel', label: 'Travel' },
  { key: 'production', label: 'Production' },
  { key: 'logistics', label: 'Logistics' },
] as const

// ── Fee Type Form Dialog ────────────────────────────────────────────────────

interface FeeTypeFormState {
  name: string
  gl_code: string
  cost_type: string
  unit_label: string
  section: string
}

const EMPTY_FEE_TYPE_FORM: FeeTypeFormState = { name: '', gl_code: '', cost_type: 'labor', unit_label: '', section: FEE_TYPE_SECTIONS[0].key }

function feeTypeFormFromItem(item: FeeType): FeeTypeFormState {
  return {
    name: item.name,
    gl_code: item.gl_code ?? '',
    cost_type: item.cost_type,
    unit_label: item.unit_label ?? '',
    section: item.section,
  }
}

interface FeeTypeFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (form: FeeTypeFormState) => Promise<void>
  onDelete?: () => Promise<void>
  title: string
  description: string
  initial: FeeTypeFormState
}

function FeeTypeFormDialog({ open, onClose, onSave, onDelete, title, description, initial }: FeeTypeFormDialogProps) {
  const [form, setForm] = useState<FeeTypeFormState>(initial)
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-xs">Fee Type Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Event Director Day (10 hr)" className="h-8 text-sm border-border/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">GL Code</Label>
              <Input value={form.gl_code} onChange={(e) => setForm({ ...form, gl_code: e.target.value })} placeholder="e.g., 4000.26" className="h-8 text-sm border-border/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit Label</Label>
              <Input value={form.unit_label} onChange={(e) => setForm({ ...form, unit_label: e.target.value })} placeholder="e.g., /10 hr day" className="h-8 text-sm border-border/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Cost Type</Label>
              <Select value={form.cost_type} onValueChange={(v) => setForm({ ...form, cost_type: v })}>
                <SelectTrigger className="h-8 text-sm border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="labor" className="text-[13px]">Labor</SelectItem>
                  <SelectItem value="flat_fee" className="text-[13px]">Flat Fee</SelectItem>
                  <SelectItem value="pass_through" className="text-[13px]">Pass-Through</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Section</Label>
              <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}>
                <SelectTrigger className="h-8 text-sm border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEE_TYPE_SECTIONS.map((s) => (
                    <SelectItem key={s.key} value={s.key} className="text-[13px]">{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          {onDelete && (
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={saving} className="mr-auto text-[13px] text-red-800/60 border-red-800/20 hover:bg-red-800/10 hover:text-red-800/80 hover:border-red-800/30">
              Remove
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving} className="text-[13px]">Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !form.name.trim() || !form.gl_code.trim()} className="text-[13px] bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Delete Confirmation Dialog ───────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  itemName: string
}

function DeleteConfirmDialog({ open, onClose, onConfirm, itemName }: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false)

  async function handleConfirm() {
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Delete Fee Type</DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            Are you sure you want to delete "{itemName}"? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={deleting} className="text-[13px]">Cancel</Button>
          <Button size="sm" onClick={handleConfirm} disabled={deleting} className="text-[13px] bg-red-600 hover:bg-red-700 text-white border-0">
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Fee Types Tab ────────────────────────────────────────────────────────────

function FeeTypesTab() {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [dialogItem, setDialogItem] = useState<FeeType | null>(null)
  const [dialogSection, setDialogSection] = useState<string>(FEE_TYPE_SECTIONS[0])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<FeeType | null>(null)

  const loadFeeTypes = useCallback(async () => {
    try {
      const data = await getFeeTypes()
      setFeeTypes(data)
      // Default all sections to collapsed
      const collapsed: Record<string, boolean> = {}
      FEE_TYPE_SECTIONS.forEach((s) => { collapsed[s.key] = true })
      setCollapsedSections(collapsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fee types')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadFeeTypes() }, [loadFeeTypes])

  function toggleSection(section: string) {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Group fee types by section
  const groupedBySection = FEE_TYPE_SECTIONS.map(({ key, label }) => ({
    key,
    label,
    items: feeTypes.filter((ft) => ft.section === key),
  }))

  const term = search.toLowerCase()

  function handleAdd(sectionKey: string) {
    setDialogMode('add')
    setDialogItem(null)
    setDialogSection(sectionKey)
    setDialogOpen(true)
  }

  function handleEdit(item: FeeType) {
    setDialogMode('edit')
    setDialogItem(item)
    setDialogSection(item.section)
    setDialogOpen(true)
  }

  function handleDeleteClick(item: FeeType) {
    setDeleteItem(item)
    setDeleteDialogOpen(true)
  }

  async function handleSaveAdd(form: FeeTypeFormState) {
    await createFeeType({
      name: form.name.trim(),
      gl_code: form.gl_code.trim(),
      cost_type: form.cost_type as FeeType['cost_type'],
      unit_label: form.unit_label || null,
      section: form.section,
      display_order: 0,
    })
    await loadFeeTypes()
  }

  async function handleSaveEdit(form: FeeTypeFormState) {
    if (!dialogItem) return
    await updateFeeType(dialogItem.id, {
      name: form.name.trim(),
      gl_code: form.gl_code.trim(),
      cost_type: form.cost_type as FeeType['cost_type'],
      unit_label: form.unit_label || null,
      section: form.section,
    })
    await loadFeeTypes()
  }

  async function handleConfirmDelete() {
    if (!deleteItem) return
    await deleteFeeType(deleteItem.id)
    await loadFeeTypes()
  }

  if (error) {
    return (
      <div className="border border-border/40 rounded-md px-4 py-4">
        <p className="text-[13px] text-destructive">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[13px]">Loading fee types...</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search + Add row */}
      <div className="flex items-end gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Search fee types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-[13px] border-border/50 focus-visible:ring-1 focus-visible:ring-ring/30 rounded-md transition-colors"
          />
        </div>
        <Button
          size="sm"
          onClick={() => handleAdd(FEE_TYPE_SECTIONS[0].key)}
          className="h-8 text-[13px] bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Fee Type
        </Button>
      </div>

      {/* Summary */}
      <p className="text-[13px] tabular-nums">
        <span className="font-medium text-foreground">{feeTypes.length} fee types</span>
        <span className="text-muted-foreground/60 mx-1.5">·</span>
        <span className="text-muted-foreground">{FEE_TYPE_SECTIONS.length} sections</span>
      </p>

      {/* Section-grouped tables */}
      <div className="space-y-2.5">
        {groupedBySection.map(({ key, label, items }) => {
          const filtered = items.filter((ft) =>
            ft.name.toLowerCase().includes(term) ||
            ft.gl_code?.toLowerCase().includes(term)
          )
          if (search && filtered.length === 0) return null
          const collapsed = !!collapsedSections[key]

          return (
            <div key={key} className="border border-border/40 rounded-md overflow-hidden">
              {/* Section header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-b border-border/50 cursor-pointer select-none" onClick={() => toggleSection(key)}>
                <div className="flex items-center gap-2.5">
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`} />
                  <span className="text-[12px] uppercase tracking-widest font-semibold text-foreground/90">{label}</span>
                  <span className="text-[11px] text-muted-foreground">{filtered.length} items</span>
                </div>
                <button
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
                  onClick={(e) => { e.stopPropagation(); handleAdd(key) }}
                >
                  + Add Fee Type
                </button>
              </div>

              {!collapsed && (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableHead className="w-[40%] text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Name</TableHead>
                      <TableHead className="w-[15%] text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">GL Code</TableHead>
                      <TableHead className="w-[15%] text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Cost Type</TableHead>
                      <TableHead className="w-[15%] text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Unit Label</TableHead>
                      <TableHead className="w-[15%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((ft) => (
                      <TableRow key={ft.id} className="group border-b border-border/40 hover:bg-muted/30">
                        <TableCell className="py-1.5">
                          <span className="text-[13px] text-foreground">{ft.name}</span>
                        </TableCell>
                        <TableCell className="py-1">
                          <span className="text-[13px] text-muted-foreground tabular-nums font-mono">{ft.gl_code}</span>
                        </TableCell>
                        <TableCell className="py-1">
                          <span className="text-[13px] text-muted-foreground">{COST_TYPE_LABELS[ft.cost_type] ?? ft.cost_type}</span>
                        </TableCell>
                        <TableCell className="py-1">
                          <span className="text-[13px] text-muted-foreground">{ft.unit_label ?? '—'}</span>
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Pencil
                              className="h-3 w-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity cursor-pointer text-foreground/60"
                              onClick={() => handleEdit(ft)}
                            />
                            <Trash2
                              className="h-3 w-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity cursor-pointer text-red-600/60"
                              onClick={() => handleDeleteClick(ft)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground/70 text-xs py-6">
                          No fee types in this section
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          )
        })}
      </div>

      {/* Add/Edit dialog */}
      <FeeTypeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={dialogMode === 'add' ? handleSaveAdd : handleSaveEdit}
        title={dialogMode === 'add' ? 'Add Fee Type' : 'Edit Fee Type'}
        description={
          dialogMode === 'add'
            ? `Add a new master fee type`
            : `Editing "${dialogItem?.name ?? ''}"`
        }
        initial={dialogMode === 'edit' && dialogItem ? feeTypeFormFromItem(dialogItem) : { ...EMPTY_FEE_TYPE_FORM, section: dialogSection }}
      />

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={deleteItem?.name ?? ''}
      />
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function RateCardManagementPage() {
  const [activeTab, setActiveTab] = useState<'rate-cards' | 'fee-types'>('rate-cards')
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [sectionsWithItems, setSectionsWithItems] = useState<RateCardItemsBySection[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  function toggleSection(sectionId: string) {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

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
      // Default all sections to collapsed
      const collapsed: Record<string, boolean> = {}
      data.forEach((s) => { collapsed[s.section.id] = true })
      setCollapsedSections(collapsed)
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
    if (!selectedClientId || !dialogSection || !form.fee_type_id) return
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
      fee_type_id: form.fee_type_id,
    })
    await loadItems(selectedClientId)
  }

  async function handleSaveEdit(form: RateFormState) {
    if (!dialogItem || !selectedClientId) return
    await updateRateCardItem(dialogItem.id, {
      unit_rate: form.unit_rate ? parseFloat(form.unit_rate) : null,
      unit_label: form.unit_label || null,
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
      <div className="space-y-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Rate Card Management</h1>
          <p className="text-sm text-muted-foreground">Manage client-specific pricing from MSA rate cards</p>
        </div>
        <div className="border border-border/40 rounded-md px-4 py-4">
          <p className="text-[13px] text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground mt-1">Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Rate Card Management</h1>
          <p className="text-sm text-muted-foreground">Manage client-specific pricing from MSA rate cards</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-[13px]">Loading clients...</span>
        </div>
      </div>
    )
  }

  // ── Main render ──

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Rate Card Management</h1>
        <p className="text-sm text-muted-foreground">Manage client-specific pricing and master fee types</p>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-0 border-b border-border/40">
        <button
          className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${
            activeTab === 'rate-cards'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground/80'
          }`}
          onClick={() => setActiveTab('rate-cards')}
        >
          Client Rate Cards
        </button>
        <button
          className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${
            activeTab === 'fee-types'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground/80'
          }`}
          onClick={() => setActiveTab('fee-types')}
        >
          Fee Types
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'fee-types' ? (
        <FeeTypesTab />
      ) : (
        <>
          {/* Client selector + search row */}
          <div className="flex items-end gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Client Rate Card</Label>
              <Select value={selectedClientId ?? undefined} onValueChange={setSelectedClientId}>
                <SelectTrigger className="h-9 w-[220px] text-sm font-medium border-border/60 bg-white dark:bg-slate-900 shadow-sm">
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="text-[13px] focus:bg-green-800/10 focus:text-green-800/80">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              <Input
                placeholder="Search rates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-[13px] border-border/50 focus-visible:ring-1 focus-visible:ring-ring/30 rounded-md transition-colors"
              />
            </div>
          </div>

          {/* Client summary bar */}
          {selectedClient && (
            <p className="text-[13px] tabular-nums">
              <span className="font-medium text-foreground">{selectedClient.name}</span>
              <span className="text-muted-foreground/60 mx-1.5">·</span>
              <span className="text-foreground/80">{pct(selectedClient.third_party_markup)} markup</span>
              {selectedClient.agency_fee > 0 && (<>
                <span className="text-muted-foreground/60 mx-1.5">·</span>
                <span className="text-foreground/80">{pct(selectedClient.agency_fee)} agency fee</span>
              </>)}
              {selectedClient.trucking_markup > 0 && (<>
                <span className="text-muted-foreground/60 mx-1.5">·</span>
                <span className="text-foreground/80">{pct(selectedClient.trucking_markup)} trucking</span>
              </>)}
              <span className="text-muted-foreground/60 mx-1.5">·</span>
              <span className="text-foreground/80">{totalItems} rates</span>
              <span className="text-muted-foreground mx-1">({msaItems} MSA</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground mx-1">{customItems} custom)</span>
              <span className="text-muted-foreground/60 mx-1.5">·</span>
              <span className="text-muted-foreground/70">Updated {new Date(selectedClient.updated_at).toLocaleDateString()}</span>
            </p>
          )}

          {/* Section-grouped rate tables */}
          {loadingItems ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[13px]">Loading rate card...</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sectionsWithItems.map(({ section, items }) => (
                <SectionTable
                  key={section.id}
                  section={section}
                  items={items}
                  search={search}
                  thirdPartyMarkup={selectedClient?.third_party_markup ?? 0}
                  collapsed={!!collapsedSections[section.id]}
                  onToggle={() => toggleSection(section.id)}
                  onAddRate={handleAddRate}
                  onEditRate={handleEditRate}
                />
              ))}
            </div>
          )}

          {/* Add/Edit dialog */}
          <RateFormDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onSave={dialogMode === 'add' ? handleSaveAdd : handleSaveEdit}
            onDelete={dialogMode === 'edit' ? handleDeleteRate : undefined}
            title={dialogMode === 'add' ? 'Add Rate' : 'Edit Rate'}
            description={
              dialogMode === 'add'
                ? `Add a rate to ${dialogSection?.name ?? 'this section'}`
                : `Editing "${dialogItem?.name ?? ''}"`
            }
            initial={dialogMode === 'edit' && dialogItem ? formFromItem(dialogItem) : EMPTY_FORM}
            isPassThrough={dialogSection?.cost_type === 'pass_through'}
            mode={dialogMode}
            sectionKey={dialogSection ? SECTION_TO_FEE_TYPE_KEY[dialogSection.name] : undefined}
            onSwitchToFeeTypes={() => setActiveTab('fee-types')}
          />
        </>
      )}
    </div>
  )
}
