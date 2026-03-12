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
import type { EstimateVersion, ApprovalRequest } from '@/types/workflow'

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' at '
    + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const STATUS_COLOR: Record<string, string> = {
  pipeline: 'bg-zinc-200 text-zinc-600',
  draft: 'bg-zinc-200 text-zinc-600',
  review: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  active: 'bg-fuchsia-100 text-fuchsia-700',
  recap: 'bg-violet-100 text-violet-700',
  complete: 'bg-green-100 text-green-800',
  // Approval statuses
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  recalled: 'bg-zinc-200 text-zinc-600',
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
  const [activeTab, setActiveTab] = useState<'versions' | 'approvals'>('versions')
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
        if (!cancelled) { setVersions(v); setApprovals(a) }
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
                            <p className="text-[11px] text-foreground/80 mt-0.5 line-clamp-2">{v.change_summary}</p>
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
          ) : (
            /* Approvals tab */
            <div className="divide-y divide-zinc-100">
              {approvals.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/60 text-center py-8">No approvals yet</p>
              ) : (
                approvals.map((a) => (
                  <div key={a.id} className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[a.status] || 'bg-zinc-100 text-zinc-600'}`}>
                        {a.status}
                      </span>
                      {a.threshold_triggered && (
                        <span className="text-[9px] text-muted-foreground">{a.threshold_triggered}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Requested by {a.requested_by} · {formatDate(a.requested_at)}
                    </p>
                    {a.reviewed_by && (
                      <p className="text-[10px] text-muted-foreground">
                        Reviewed by {a.reviewed_by} · {a.reviewed_at ? formatDate(a.reviewed_at) : ''}
                      </p>
                    )}
                    {a.notes && (
                      <p className="text-[11px] text-foreground/80 mt-1 bg-zinc-50 px-2 py-1.5 rounded border border-zinc-100">
                        {a.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
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
