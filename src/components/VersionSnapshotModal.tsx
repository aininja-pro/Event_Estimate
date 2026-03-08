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
import type { ScheduleEntry } from '@/types/schedule'
import { computeScheduleRollup } from '@/lib/schedule-service'

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
            const logRecord = log as Record<string, unknown>
            const logName = logRecord.location_name as string
            const logId = logRecord.id as string

            // Check if this log has schedule data in the snapshot
            const logScheduleEntries = (snapshot.schedule_entries || []).filter(
              (se) => se.labor_log_id === logId
            )
            const hasSchedule = logScheduleEntries.length > 0

            // Build rollup from schedule if available
            let scheduleRollup: ReturnType<typeof computeScheduleRollup> = []
            if (hasSchedule) {
              // Construct fully typed ScheduleEntry[] with nested day entries
              const typedEntries: ScheduleEntry[] = logScheduleEntries.map((se) => ({
                id: se.id as string,
                labor_log_id: se.labor_log_id as string,
                rate_card_item_id: (se.rate_card_item_id as string) || null,
                role_name: (se.role_name as string) || '',
                person_name: (se.person_name as string) || null,
                row_index: Number(se.row_index) || 0,
                staff_group_id: (se.staff_group_id as string) || null,
                needs_airfare: Boolean(se.needs_airfare),
                needs_hotel: Boolean(se.needs_hotel),
                needs_per_diem: Boolean(se.needs_per_diem),
                day_rate: Number(se.day_rate) || 0,
                cost_rate: Number(se.cost_rate) || 0,
                ot_hourly_rate: Number(se.ot_hourly_rate) || 0,
                ot_cost_rate: Number(se.ot_cost_rate) || 0,
                gl_code: (se.gl_code as string) || null,
                notes: (se.notes as string) || null,
                created_at: (se.created_at as string) || '',
                updated_at: (se.updated_at as string) || '',
                day_entries: (snapshot.schedule_day_entries || [])
                  .filter((de) => de.schedule_entry_id === se.id)
                  .map((de) => ({
                    id: de.id as string,
                    schedule_entry_id: de.schedule_entry_id as string,
                    work_date: de.work_date as string,
                    hours: Number(de.hours) || 0,
                    per_diem_override: (de.per_diem_override as boolean | null) ?? null,
                    created_at: (de.created_at as string) || '',
                    updated_at: (de.updated_at as string) || '',
                  })),
              }))
              scheduleRollup = computeScheduleRollup(typedEntries)
            }

            return (
              <div key={logIdx}>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
                  {logName || `Segment ${logIdx + 1}`} — Labor
                  {hasSchedule && <span className="ml-1 text-muted-foreground/60">(from schedule)</span>}
                </p>
                {hasSchedule && scheduleRollup.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[10px]">
                        <TableHead className="h-7">Role</TableHead>
                        <TableHead className="h-7 text-right w-12">Staff</TableHead>
                        <TableHead className="h-7 text-right w-12">Days</TableHead>
                        <TableHead className="h-7 text-right w-20">Rate</TableHead>
                        <TableHead className="h-7 text-right w-20">Revenue</TableHead>
                        <TableHead className="h-7 text-right w-20">Cost</TableHead>
                        <TableHead className="h-7 text-right w-16">GP%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduleRollup.map((row, i) => (
                        <TableRow key={i} className="text-[11px]">
                          <TableCell className="py-1">{row.role_name}</TableCell>
                          <TableCell className="py-1 text-right">{row.quantity}</TableCell>
                          <TableCell className="py-1 text-right">{row.total_days}</TableCell>
                          <TableCell className="py-1 text-right">{fmt(row.day_rate)}</TableCell>
                          <TableCell className="py-1 text-right font-medium">{fmt(row.revenue_total)}</TableCell>
                          <TableCell className="py-1 text-right">{fmt(row.cost_total)}</TableCell>
                          <TableCell className="py-1 text-right">{row.gp_pct.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : entries.length > 0 ? (
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
