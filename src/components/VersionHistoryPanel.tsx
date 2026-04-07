import { useState, useEffect, useMemo } from 'react'
import { History, ChevronDown, ChevronRight, RotateCcw, Eye, X, Search } from 'lucide-react'
import { useUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { VersionSnapshotModal } from './VersionSnapshotModal'
import {
  getVersionHistory,
  getApprovalHistory,
  rollbackToVersion,
} from '@/lib/workflow-service'
import { getChangeOrders, formatCONumber } from '@/lib/change-order-service'
import { supabase } from '@/lib/supabase'
import type { EstimateVersion, ApprovalRequest } from '@/types/workflow'
import type { ChangeOrder } from '@/types/change-order'

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' at '
    + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const STATUS_COLOR: Record<string, string> = {
  // Current statuses
  pipeline: 'bg-zinc-100 text-zinc-600',
  estimate: 'bg-zinc-200 text-zinc-600',
  in_review: 'bg-amber-100 text-amber-700',
  active: 'bg-fuchsia-100 text-fuchsia-700',
  recap: 'bg-violet-100 text-violet-700',
  invoiced: 'bg-teal-100 text-teal-700',
  lost: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
  // Legacy keys for backward compat with historical snapshots
  draft: 'bg-zinc-200 text-zinc-600',
  review: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  complete: 'bg-green-100 text-green-800',
  // Approval statuses
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  recalled: 'bg-zinc-200 text-zinc-600',
}

// ── UUID → Display Name Resolution ──────────────────────────────────────────

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g

async function buildProfileNameMap(
  versions: EstimateVersion[],
  approvals: ApprovalRequest[]
): Promise<Map<string, string>> {
  const uuids = new Set<string>()
  for (const v of versions) {
    if (v.changed_by?.match(UUID_REGEX)) uuids.add(v.changed_by)
    const summaryMatches = v.change_summary?.match(UUID_REGEX) || []
    for (const m of summaryMatches) uuids.add(m)
  }
  for (const a of approvals) {
    if (a.requested_by?.match(UUID_REGEX)) uuids.add(a.requested_by)
    if (a.reviewed_by?.match(UUID_REGEX)) uuids.add(a.reviewed_by)
  }
  if (uuids.size === 0 || !supabase) return new Map()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', Array.from(uuids))
  return new Map((profiles || []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]))
}

function replaceUuidsInText(text: string, nameMap: Map<string, string>): string {
  return text.replace(UUID_REGEX, (uuid) => nameMap.get(uuid) || uuid)
}

// ── Panel Component ─────────────────────────────────────────────────────────

interface VersionHistoryPanelProps {
  estimateId: string
  open: boolean
  onClose: () => void
  onRollback: () => void  // callback to refresh page after rollback
}

export function VersionHistoryPanel({ estimateId, open, onClose, onRollback }: VersionHistoryPanelProps) {
  const { displayName } = useUser()
  const [versions, setVersions] = useState<EstimateVersion[]>([])
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([])
  const [activeTab, setActiveTab] = useState<'versions' | 'approvals' | 'change_orders'>('versions')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [snapshotVersion, setSnapshotVersion] = useState<EstimateVersion | null>(null)
  const [rollbackTarget, setRollbackTarget] = useState<EstimateVersion | null>(null)
  const [rollbackReason, setRollbackReason] = useState('')
  const [rolling, setRolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [segmentFilter, setSegmentFilter] = useState<string | null>(null)

  const segmentNames = useMemo(() => {
    const names = new Set<string>()
    versions.forEach(v => {
      const match = v.change_summary?.match(/Segment "([^"]+)"/)
      if (match) names.add(match[1])
    })
    return Array.from(names).sort()
  }, [versions])

  const filteredVersions = useMemo(() => {
    return versions.filter(v => {
      if (segmentFilter && !v.change_summary?.includes(`Segment "${segmentFilter}"`)) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesSummary = v.change_summary?.toLowerCase().includes(q)
        const matchesUser = v.changed_by.toLowerCase().includes(q)
        const matchesVersion = `v${v.version_number}`.includes(q)
        if (!matchesSummary && !matchesUser && !matchesVersion) return false
      }
      return true
    })
  }, [versions, searchQuery, segmentFilter])

  const isFiltered = searchQuery || segmentFilter

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const load = async () => {
      try {
        const [v, a] = await Promise.all([
          getVersionHistory(estimateId),
          getApprovalHistory(estimateId),
        ])

        // Resolve UUIDs to display names across all history entries
        const nameMap = await buildProfileNameMap(v, a)
        for (const ver of v) {
          ver.changed_by = nameMap.get(ver.changed_by) || ver.changed_by
          if (ver.change_summary) {
            ver.change_summary = replaceUuidsInText(ver.change_summary, nameMap)
          }
        }
        // Approvals already resolved by getApprovalHistory, but replace any remaining UUIDs
        for (const ap of a) {
          ap.requested_by = nameMap.get(ap.requested_by) || ap.requested_by
          if (ap.reviewed_by) ap.reviewed_by = nameMap.get(ap.reviewed_by) || ap.reviewed_by
        }

        if (!cancelled) { setVersions(v); setApprovals(a) }
        // Load COs separately so a failure doesn't break versions/approvals
        try {
          const co = await getChangeOrders(estimateId)
          if (!cancelled) setChangeOrders(co)
        } catch (coErr) { console.error('Failed to load change orders:', coErr) }
      } catch (err) { if (!cancelled) console.error(err) }
      if (!cancelled) setLoading(false)
    }
    setLoading(true) // eslint-disable-line react-hooks/set-state-in-effect
    load()
    return () => { cancelled = true }
  }, [open, estimateId])

  async function handleRollback() {
    if (!rollbackTarget || !rollbackReason.trim()) return
    setRolling(true)
    setError(null)
    const result = await rollbackToVersion(estimateId, rollbackTarget.id, displayName, rollbackReason.trim())
    setRolling(false)
    if (result.success) {
      setRollbackTarget(null)
      setRollbackReason('')
      onRollback()
      onClose()
    } else {
      setError(result.error || 'Rollback failed')
    }
  }

  if (!open) return null

  return (
    <>
      {/* Slide-out panel */}
      <div className="fixed inset-y-0 right-0 z-40 w-96 bg-white border-l border-zinc-200 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-[13px] font-semibold">History</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-100">
          <button
            onClick={() => setActiveTab('versions')}
            className={`flex-1 py-2 text-[11px] font-medium text-center transition-colors ${
              activeTab === 'versions'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Versions ({isFiltered ? `${filteredVersions.length} of ${versions.length}` : versions.length})
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 py-2 text-[11px] font-medium text-center transition-colors ${
              activeTab === 'approvals'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Approvals ({approvals.length})
          </button>
          <button
            onClick={() => setActiveTab('change_orders')}
            className={`flex-1 py-2 text-[11px] font-medium text-center transition-colors ${
              activeTab === 'change_orders'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            COs ({changeOrders.length})
          </button>
        </div>

        {/* Search & segment filter (versions tab only) */}
        {activeTab === 'versions' && versions.length > 0 && (
          <div className="px-3 pt-2.5 pb-1.5 border-b border-zinc-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search versions..."
                className="w-full h-7 pl-7 pr-2 text-[11px] rounded border border-zinc-200 bg-zinc-50 focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors placeholder:text-muted-foreground/50"
              />
            </div>
            {segmentNames.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSegmentFilter(null)}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                    !segmentFilter
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'bg-zinc-100 text-muted-foreground hover:bg-zinc-200'
                  }`}
                >
                  All
                </button>
                {segmentNames.map(name => (
                  <button
                    key={name}
                    onClick={() => setSegmentFilter(segmentFilter === name ? null : name)}
                    className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                      segmentFilter === name
                        ? 'bg-zinc-900 text-white font-medium'
                        : 'bg-zinc-100 text-muted-foreground hover:bg-zinc-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-[11px] text-muted-foreground/60 text-center py-8">Loading...</p>
          ) : activeTab === 'versions' ? (
            <div className="divide-y divide-zinc-100">
              {versions.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/60 text-center py-8">No versions yet</p>
              ) : filteredVersions.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/60 text-center py-8">No matching versions</p>
              ) : (
                filteredVersions.map((v) => {
                  const isExpanded = expandedId === v.id
                  const isCurrent = versions.length > 0 && v.id === versions[0].id
                  return (
                    <div key={v.id} className="px-4 py-2.5">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : v.id)}
                        className="w-full flex items-start gap-2 text-left"
                      >
                        <div className="mt-0.5 shrink-0">
                          {isExpanded
                            ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            : <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold">v{v.version_number}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[v.status_at_version] || 'bg-zinc-100 text-zinc-600'}`}>
                              {v.status_at_version}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-white font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDate(v.created_at)} · {v.changed_by}
                          </p>
                          {v.change_summary && (
                            <p className={`text-[11px] text-foreground/80 mt-0.5 ${isExpanded ? '' : 'line-clamp-2'}`}>{v.change_summary}</p>
                          )}
                        </div>
                      </button>

                      {/* Expanded actions */}
                      {isExpanded && (
                        <div className="ml-5 mt-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] gap-1"
                            onClick={() => setSnapshotVersion(v)}
                          >
                            <Eye className="h-3 w-3" />
                            View Snapshot
                          </Button>
                          {!isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-[10px] gap-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                              onClick={() => { setRollbackTarget(v); setRollbackReason(''); setError(null) }}
                            >
                              <RotateCcw className="h-3 w-3" />
                              Rollback
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          ) : activeTab === 'approvals' ? (
            /* Approvals tab */
            <div className="divide-y divide-zinc-100">
              {approvals.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/60 text-center py-8">No approvals yet</p>
              ) : (
                approvals.map((a) => {
                  const gateLabel = a.approval_gate === 'executive' ? 'Executive Review'
                    : a.approval_gate === 'client' ? 'Client Approval'
                    : 'AM Review'
                  return (
                    <div key={a.id} className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[a.status] || 'bg-zinc-100 text-zinc-600'}`}>
                          {a.status}
                        </span>
                        <span className="text-[10px] font-medium text-foreground/70">{gateLabel}</span>
                        {a.threshold_triggered && (
                          <span className="text-[9px] text-muted-foreground">{a.threshold_triggered}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Requested by <span className="font-medium text-foreground/70">{a.requested_by}</span> · {formatDate(a.requested_at)}
                      </p>
                      {a.reviewed_by && (
                        <p className="text-[10px] text-muted-foreground">
                          {a.status === 'approved' ? 'Approved' : a.status === 'rejected' ? 'Rejected' : 'Reviewed'} by{' '}
                          <span className="font-medium text-foreground/70">{a.reviewed_by}</span> · {a.reviewed_at ? formatDate(a.reviewed_at) : ''}
                        </p>
                      )}
                      {a.notes && (
                        <p className="text-[11px] text-foreground/80 mt-1 bg-zinc-50 px-2 py-1.5 rounded border border-zinc-100">
                          {a.notes}
                        </p>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            /* Change Orders tab */
            <ChangeOrdersTab changeOrders={changeOrders} />
          )}
        </div>
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0 z-30 bg-black/10" onClick={onClose} />

      {/* Snapshot modal */}
      <VersionSnapshotModal
        version={snapshotVersion}
        open={!!snapshotVersion}
        onClose={() => setSnapshotVersion(null)}
      />

      {/* Rollback confirmation dialog */}
      <Dialog open={!!rollbackTarget} onOpenChange={(o) => { if (!o) setRollbackTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Rollback to Version {rollbackTarget?.version_number}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This will revert the estimate to its state at version {rollbackTarget?.version_number}.
              A new version will be created to record this rollback.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rollbackReason}
            onChange={(e) => setRollbackReason(e.target.value)}
            placeholder="Reason for rollback (required)..."
            className="text-xs min-h-[80px]"
          />
          {error && <p className="text-[11px] text-red-600">{error}</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setRollbackTarget(null)} disabled={rolling}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRollback}
              disabled={rolling || !rollbackReason.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {rolling ? 'Rolling back...' : 'Confirm Rollback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Change Orders Tab ───────────────────────────────────────────────────────

const CO_STATUS_COLOR: Record<string, string> = {
  draft: 'bg-zinc-200 text-zinc-600',
  submitted: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

function ChangeOrdersTab({ changeOrders }: { changeOrders: ChangeOrder[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (changeOrders.length === 0) {
    return <p className="text-[11px] text-muted-foreground/60 text-center py-8">No change orders yet</p>
  }

  // Compute running total from approved COs
  const approvedCOs = changeOrders.filter((co) => co.status === 'approved')
  const totalDelta = approvedCOs.reduce((sum, co) => sum + (co.delta_amount ?? 0), 0)
  const firstApproved = approvedCOs[0]
  const originalTotal = firstApproved?.baseline_total ?? 0
  const currentTotal = originalTotal + totalDelta

  return (
    <div>
      {/* Running total summary */}
      {approvedCOs.length > 0 && (
        <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
          <div className="text-[11px] text-foreground/80">
            <span className="font-medium">Original:</span> {formatDollar(originalTotal)}
            <span className="mx-1.5">→</span>
            <span className="font-medium">Current:</span> {formatDollar(currentTotal)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {approvedCOs.length} change order{approvedCOs.length !== 1 ? 's' : ''},{' '}
            <span className={totalDelta >= 0 ? 'text-red-600' : 'text-emerald-600'}>
              {totalDelta >= 0 ? '+' : ''}{formatDollar(totalDelta)}
            </span>
          </div>
        </div>
      )}

      {/* CO timeline (newest first) */}
      <div className="divide-y divide-zinc-100">
        {[...changeOrders].reverse().map((co) => {
          const isExpanded = expandedId === co.id
          const delta = co.delta_summary
          return (
            <div key={co.id} className="px-4 py-2.5">
              <button
                onClick={() => setExpandedId(isExpanded ? null : co.id)}
                className="w-full flex items-start gap-2 text-left"
              >
                <div className="mt-0.5 shrink-0">
                  {isExpanded
                    ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    : <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-blue-700">{formatCONumber(co.co_number)}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${CO_STATUS_COLOR[co.status] || 'bg-zinc-100 text-zinc-600'}`}>
                      {co.status}
                    </span>
                    {co.delta_amount != null && co.status !== 'draft' && (
                      <span className={`text-[10px] font-mono font-medium ${co.delta_amount >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {co.delta_amount >= 0 ? '+' : ''}{formatDollar(co.delta_amount)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-foreground/80 mt-0.5">{co.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Created {formatDate(co.created_at)}{co.created_by_name ? ` by ${co.created_by_name}` : ''}
                  </p>
                  {co.approved_at && (
                    <p className="text-[10px] text-muted-foreground">
                      Approved {formatDate(co.approved_at)}{co.approved_by_name ? ` by ${co.approved_by_name}` : ''}
                    </p>
                  )}
                  {co.baseline_total != null && co.revised_total != null && co.status !== 'draft' && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDollar(co.baseline_total)} → {formatDollar(co.revised_total)}
                    </p>
                  )}
                </div>
              </button>

              {/* Expanded delta detail */}
              {isExpanded && delta && (delta.added.length > 0 || delta.removed.length > 0 || delta.modified.length > 0) && (
                <div className="ml-5 mt-2 space-y-1.5 text-[11px] bg-zinc-50 rounded px-3 py-2 border border-zinc-100">
                  {delta.added.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-emerald-600/70 font-medium">Added</div>
                      {delta.added.map((item, i) => (
                        <div key={i} className="flex justify-between text-emerald-700">
                          <span>+ {item.item_name}{item.section ? ` (${item.section})` : ''}{item.quantity ? ` × ${item.quantity}` : ''}{item.days ? ` × ${item.days}d` : ''}{item.unit_rate ? ` @ $${item.unit_rate.toLocaleString()}` : ''}</span>
                          <span className="font-mono">+{formatDollar(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {delta.removed.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-red-600/70 font-medium">Removed</div>
                      {delta.removed.map((item, i) => (
                        <div key={i} className="flex justify-between text-red-700">
                          <span>- {item.item_name}{item.section ? ` (${item.section})` : ''}{item.days ? ` × ${item.days}d` : ''}{item.unit_rate ? ` @ $${item.unit_rate.toLocaleString()}` : ''}</span>
                          <span className="font-mono">-{formatDollar(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {delta.modified.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-amber-600/70 font-medium">Modified</div>
                      {delta.modified.map((item, i) => (
                        <div key={i} className="flex justify-between text-amber-800">
                          <span>~ {item.item_name} {item.field}: {item.from} → {item.to}</span>
                          <span className={`font-mono ${item.delta >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {item.delta >= 0 ? '+' : ''}{formatDollar(item.delta)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatDollar(amount: number): string {
  return '$' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// ── Trigger Button ──────────────────────────────────────────────────────────

interface HistoryButtonProps {
  onClick: () => void
}

export function HistoryButton({ onClick }: HistoryButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-[11px] gap-1.5"
      onClick={onClick}
    >
      <History className="h-3 w-3" />
      History
    </Button>
  )
}
