import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import type { EstimateVersion } from '@/types/workflow'
import type { EstimateSnapshot } from '@/types/workflow'

function fmt(n: number): string {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

interface VersionSnapshotModalProps {
  version: EstimateVersion | null
  open: boolean
  onClose: () => void
}

export function VersionSnapshotModal({ version, open, onClose }: VersionSnapshotModalProps) {
  if (!version) return null

  const snapshot = version.snapshot_json as EstimateSnapshot
  const est = snapshot.estimate as Record<string, unknown>

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">
            Version {version.version_number} Snapshot
          </DialogTitle>
          <p className="text-[11px] text-muted-foreground">
            {new Date(version.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' at '}
            {new Date(version.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            {' · '}
            {version.changed_by}
            {' · Status: '}
            {version.status_at_version}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Estimate header */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[12px]">
            <div><span className="text-muted-foreground">Event:</span> {est.event_name as string}</div>
            <div><span className="text-muted-foreground">Type:</span> {(est.event_type as string) || '—'}</div>
            <div><span className="text-muted-foreground">Location:</span> {(est.location as string) || '—'}</div>
            <div><span className="text-muted-foreground">Dates:</span> {(est.start_date as string) || '—'} to {(est.end_date as string) || '—'}</div>
            <div><span className="text-muted-foreground">Structure:</span> {(est.cost_structure as string) || '—'}</div>
            <div><span className="text-muted-foreground">Status:</span> {est.status as string}</div>
          </div>

          {/* Totals bar */}
          {snapshot.totals && (
            <div className="flex gap-6 px-3 py-2 bg-zinc-50 rounded border border-zinc-200/60 text-[11px]">
              <div><span className="text-muted-foreground">Revenue:</span> <span className="font-medium">{fmt(snapshot.totals.total_revenue)}</span></div>
              <div><span className="text-muted-foreground">Cost:</span> <span className="font-medium">{fmt(snapshot.totals.total_cost)}</span></div>
              <div><span className="text-muted-foreground">GP:</span> <span className="font-medium">{fmt(snapshot.totals.gross_profit)}</span></div>
              <div><span className="text-muted-foreground">GP%:</span> <span className="font-medium">{snapshot.totals.gross_margin_pct.toFixed(1)}%</span></div>
            </div>
          )}

          {/* Labor logs */}
          {snapshot.labor_logs?.map((log, logIdx) => {
            const entries = (log as Record<string, unknown>).entries as Record<string, unknown>[] || []
            const logName = (log as Record<string, unknown>).location_name as string
            return (
              <div key={logIdx}>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
                  {logName || `Segment ${logIdx + 1}`} — Labor
                </p>
                {entries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[10px]">
                        <TableHead className="h-7">Role</TableHead>
                        <TableHead className="h-7 text-right w-12">Qty</TableHead>
                        <TableHead className="h-7 text-right w-12">Days</TableHead>
                        <TableHead className="h-7 text-right w-20">Rate</TableHead>
                        <TableHead className="h-7 text-right w-20">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry, i) => {
                        const qty = (entry.quantity as number) || 0
                        const days = (entry.days as number) || 0
                        const rate = (entry.unit_rate as number) || 0
                        return (
                          <TableRow key={i} className="text-[11px]">
                            <TableCell className="py-1">{entry.role_name as string}</TableCell>
                            <TableCell className="py-1 text-right">{qty}</TableCell>
                            <TableCell className="py-1 text-right">{days}</TableCell>
                            <TableCell className="py-1 text-right">{fmt(rate)}</TableCell>
                            <TableCell className="py-1 text-right font-medium">{fmt(qty * days * rate)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-[11px] text-muted-foreground/60 italic">No labor entries</p>
                )}
              </div>
            )
          })}

          {/* Line items by section */}
          {snapshot.line_items?.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
                Non-Labor Line Items
              </p>
              <Table>
                <TableHeader>
                  <TableRow className="text-[10px]">
                    <TableHead className="h-7">Section</TableHead>
                    <TableHead className="h-7">Item</TableHead>
                    <TableHead className="h-7 text-right w-12">Qty</TableHead>
                    <TableHead className="h-7 text-right w-20">Unit Cost</TableHead>
                    <TableHead className="h-7 text-right w-20">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.line_items.map((item, i) => {
                    const qty = (item.quantity as number) || 0
                    const unitCost = (item.unit_cost as number) || 0
                    return (
                      <TableRow key={i} className="text-[11px]">
                        <TableCell className="py-1 capitalize">{(item.section as string)?.replace(/_/g, ' ')}</TableCell>
                        <TableCell className="py-1">{item.item_name as string}</TableCell>
                        <TableCell className="py-1 text-right">{qty}</TableCell>
                        <TableCell className="py-1 text-right">{fmt(unitCost)}</TableCell>
                        <TableCell className="py-1 text-right font-medium">{fmt(qty * unitCost)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
