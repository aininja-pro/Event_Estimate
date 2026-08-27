import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2, Circle, CircleDot, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth'
import {
  getPunchListItems,
  createPunchListItem,
  updatePunchListItem,
  movePunchListItem,
  deletePunchListItem,
  type PunchListItem,
  type PunchItemType,
  type PunchItemArea,
  type PunchItemStatus,
} from '@/lib/punch-list-service'

const TYPE_META: Record<PunchItemType, { label: string; className: string }> = {
  bug: { label: 'Bug', className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900' },
  feature: { label: 'Feature', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900' },
  question: { label: 'Question', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900' },
  task: { label: 'Task', className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-700' },
}

const AREA_LABELS: Record<PunchItemArea, string> = {
  accounting: 'Accounting',
  operations: 'Operations',
  rates: 'Rates',
  ai: 'AI',
  general: 'General',
}

const SECTIONS: { status: PunchItemStatus; label: string; icon: React.ComponentType<{ className?: string }>; defaultOpen: boolean }[] = [
  { status: 'open', label: 'Open', icon: Circle, defaultOpen: true },
  { status: 'in_progress', label: 'In Progress', icon: CircleDot, defaultOpen: true },
  { status: 'done', label: 'Done', icon: CheckCircle2, defaultOpen: false },
]

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PunchListPage() {
  const { profile } = useAuth()
  const userName = profile?.full_name ?? 'Unknown'

  const [items, setItems] = useState<PunchListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ done: true })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // quick-add form
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<PunchItemType>('bug')
  const [newArea, setNewArea] = useState<PunchItemArea>('general')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    getPunchListItems()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load punch list'))
      .finally(() => setLoading(false))
  }, [])

  const grouped = useMemo(() => {
    const g: Record<PunchItemStatus, PunchListItem[]> = { open: [], in_progress: [], done: [] }
    for (const item of items) g[item.status].push(item)
    // Done reads newest-resolved first; active buckets oldest first so the backlog surfaces.
    g.open.sort((a, b) => a.created_at.localeCompare(b.created_at))
    g.in_progress.sort((a, b) => a.created_at.localeCompare(b.created_at))
    g.done.sort((a, b) => (b.resolved_at ?? b.updated_at).localeCompare(a.resolved_at ?? a.updated_at))
    return g
  }, [items])

  async function handleAdd() {
    const title = newTitle.trim()
    if (!title || adding) return
    setAdding(true)
    try {
      const created = await createPunchListItem({ title, item_type: newType, area: newArea, created_by: userName })
      setItems((prev) => [created, ...prev])
      setNewTitle('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add item')
    } finally {
      setAdding(false)
    }
  }

  async function handleMove(item: PunchListItem, status: PunchItemStatus) {
    try {
      const updated = await movePunchListItem(item.id, status, userName)
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update item')
    }
  }

  async function handleFieldSave(item: PunchListItem, updates: Parameters<typeof updatePunchListItem>[1]) {
    try {
      const updated = await updatePunchListItem(item.id, updates)
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    }
  }

  async function handleDelete(item: PunchListItem) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    try {
      await deletePunchListItem(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Punch List</h1>
        <p className="text-[13px] text-muted-foreground">
          Bugs, features, and questions as the rollout runs. Admins only — this replaces the emailed spreadsheet.
        </p>
      </div>

      {/* Quick add */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card p-3">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          placeholder="Add an item — what's broken, missing, or unclear?"
          className="h-8 flex-1 min-w-[240px] text-[13px]"
        />
        <Select value={newType} onValueChange={(v) => setNewType(v as PunchItemType)}>
          <SelectTrigger className="h-8 w-[120px] text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(TYPE_META) as PunchItemType[]).map((t) => (
              <SelectItem key={t} value={t}>{TYPE_META[t].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={newArea} onValueChange={(v) => setNewArea(v as PunchItemArea)}>
          <SelectTrigger className="h-8 w-[130px] text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(AREA_LABELS) as PunchItemArea[]).map((a) => (
              <SelectItem key={a} value={a}>{AREA_LABELS[a]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="h-8" onClick={handleAdd} disabled={!newTitle.trim() || adding}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>
      )}
      {loading && <p className="text-[13px] text-muted-foreground">Loading…</p>}

      {!loading && SECTIONS.map(({ status, label, icon: Icon, defaultOpen }) => {
        const list = grouped[status]
        const isCollapsed = collapsed[status] ?? !defaultOpen
        return (
          <div key={status} className="rounded-lg border border-border/60 bg-card overflow-hidden">
            <button
              onClick={() => setCollapsed((prev) => ({ ...prev, [status]: !isCollapsed }))}
              className="flex w-full items-center gap-2 px-4 py-2.5 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              <Icon className={`h-4 w-4 ${status === 'done' ? 'text-green-600' : status === 'in_progress' ? 'text-amber-600' : 'text-muted-foreground'}`} />
              <span className="text-[13px] font-semibold text-foreground">{label}</span>
              <span className="text-[11px] tabular-nums text-muted-foreground">({list.length})</span>
            </button>
            {!isCollapsed && (
              <div className="divide-y divide-border/40">
                {list.length === 0 && (
                  <p className="px-4 py-3 text-[13px] text-muted-foreground/60">Nothing here.</p>
                )}
                {list.map((item) => {
                  const isExpanded = expandedId === item.id
                  return (
                    <div key={item.id} className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="flex-1 text-left min-w-0"
                        >
                          <span className={`text-[13px] ${status === 'done' ? 'text-muted-foreground line-through decoration-border' : 'text-foreground'}`}>
                            {item.title}
                          </span>
                        </button>
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wide shrink-0 ${TYPE_META[item.item_type].className}`}>
                          {TYPE_META[item.item_type].label}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:inline">{AREA_LABELS[item.area]}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {status !== 'open' && (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => handleMove(item, 'open')}>
                              Reopen
                            </Button>
                          )}
                          {status === 'open' && (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-amber-700" onClick={() => handleMove(item, 'in_progress')}>
                              Start
                            </Button>
                          )}
                          {status !== 'done' && (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-green-700" onClick={() => handleMove(item, 'done')}>
                              Done
                            </Button>
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-2 mb-1 ml-1 space-y-2 rounded-md bg-muted/30 p-3">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                              <Textarea
                                defaultValue={item.notes ?? ''}
                                onBlur={(e) => { if (e.target.value !== (item.notes ?? '')) handleFieldSave(item, { notes: e.target.value || null }) }}
                                placeholder="Details, links, context…"
                                className="min-h-[60px] text-[13px]"
                              />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Resolution</p>
                              <Textarea
                                defaultValue={item.resolution_note ?? ''}
                                onBlur={(e) => { if (e.target.value !== (item.resolution_note ?? '')) handleFieldSave(item, { resolution_note: e.target.value || null }) }}
                                placeholder={status === 'done' ? 'How it was resolved…' : 'Filled in when resolved'}
                                className="min-h-[60px] text-[13px]"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-muted-foreground">
                              Added by {item.created_by ?? '—'} · {fmtDate(item.created_at)}
                              {item.resolved_at && <> · Resolved by {item.resolved_by ?? '—'} · {fmtDate(item.resolved_at)}</>}
                            </p>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-rose-600" onClick={() => handleDelete(item)}>
                              <Trash2 className="h-3 w-3 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
