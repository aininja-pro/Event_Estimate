import { useState } from 'react'
import { AlertCircle, Check, Undo2, ShieldCheck, Globe, ChevronDown, ChevronUp } from 'lucide-react'
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
import type { ApprovalRequest, ApprovalGate } from '@/types/workflow'
import type { ChangeOrder } from '@/types/change-order'
import { canUserApprove } from '@/lib/workflow-service'
import { formatCONumber } from '@/lib/change-order-service'

// ── Gate-specific config ──────────────────────────────────────────────────────

interface GateConfig {
  bannerText: string
  waitingText: string
  approveLabel: string
  rejectLabel: string
  dialogApproveTitle: string
  dialogApproveDesc: string
  dialogRejectTitle: string
  dialogRejectDesc: string
  bannerBg: string
  bannerBorder: string
  bannerIcon: string
}

function getGateConfig(gate: ApprovalGate, threshold: string | null): GateConfig {
  switch (gate) {
    case 'executive':
      return {
        bannerText: `AM approved. Executive review required (${threshold || '≥ threshold'}).`,
        waitingText: 'Awaiting CFO / Admin approval',
        approveLabel: 'Approve',
        rejectLabel: 'Send Back',
        dialogApproveTitle: 'Executive Approval',
        dialogApproveDesc: 'This will pass executive review and advance to client approval.',
        dialogRejectTitle: 'Send Back for Revision',
        dialogRejectDesc: 'Please explain what needs to change. The segment will return to Estimate status for editing.',
        bannerBg: 'bg-amber-50',
        bannerBorder: 'border-amber-200/80',
        bannerIcon: 'text-amber-600',
      }
    case 'client':
      return {
        bannerText: 'Internally approved. Pending client approval.',
        waitingText: 'Awaiting client response',
        approveLabel: 'Mark Client Approved',
        rejectLabel: 'Client Requested Changes',
        dialogApproveTitle: 'Mark Client Approved',
        dialogApproveDesc: 'This will mark the segment as client-approved and move it to Active status.',
        dialogRejectTitle: 'Client Requested Changes',
        dialogRejectDesc: 'Record what the client requested. The segment will return to Estimate status for revision.',
        bannerBg: 'bg-blue-50',
        bannerBorder: 'border-blue-200/80',
        bannerIcon: 'text-blue-600',
      }
    case 'am':
    default:
      return {
        bannerText: 'Submitted for review. Awaiting AM approval.',
        waitingText: 'Awaiting AM approval',
        approveLabel: 'Approve',
        rejectLabel: 'Send Back',
        dialogApproveTitle: 'Approve Segment',
        dialogApproveDesc: threshold?.includes('executive')
          ? 'This will pass AM review and advance to executive review (threshold exceeded).'
          : 'This will pass AM review and advance to client approval.',
        dialogRejectTitle: 'Send Back for Revision',
        dialogRejectDesc: 'Please explain what needs to change. The segment will return to Estimate status for editing.',
        bannerBg: 'bg-amber-50',
        bannerBorder: 'border-amber-200/80',
        bannerIcon: 'text-amber-600',
      }
  }
}

// ── Component ───────────────────────────────────────────────────────────────

interface ApprovalBannerProps {
  approval: ApprovalRequest
  userRole: string
  onApprove: (approvalId: string, notes?: string) => Promise<{ success: boolean; error?: string }>
  onReject: (approvalId: string, notes: string) => Promise<{ success: boolean; error?: string }>
  changeOrder?: ChangeOrder
}

export function ApprovalBanner({ approval, userRole, onApprove, onReject, changeOrder }: ApprovalBannerProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deltaExpanded, setDeltaExpanded] = useState(false)

  const requestedDate = new Date(approval.requested_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const gate = (approval.approval_gate || 'am') as ApprovalGate
  const config = getGateConfig(gate, approval.threshold_triggered)
  const canApprove = canUserApprove(approval, userRole)
  const isClient = gate === 'client'
  const IconComponent = isClient ? Globe : AlertCircle

  async function handleConfirm() {
    if (!action) return
    setSubmitting(true)
    setError(null)

    const result = action === 'approve'
      ? await onApprove(approval.id, notes.trim() || undefined)
      : await onReject(approval.id, notes.trim())

    setSubmitting(false)
    if (result.success) {
      setAction(null)
      setNotes('')
    } else {
      setError(result.error || 'Action failed')
    }
  }

  return (
    <>
      <div className={`flex items-center gap-3 px-4 py-2.5 ${config.bannerBg} border ${config.bannerBorder} rounded text-[12px]`}>
        <IconComponent className={`h-4 w-4 ${config.bannerIcon} shrink-0`} />
        <div className="flex-1 min-w-0">
          <span className={isClient ? 'text-blue-900' : 'text-amber-900'}>
            {config.bannerText} Submitted by{' '}
            <span className="font-medium">{approval.requested_by}</span> on {requestedDate}.
          </span>
          {approval.threshold_triggered && (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
              {approval.threshold_triggered}
            </span>
          )}
          <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-medium ${isClient ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
            {gate === 'client' ? 'Client Approval' : gate === 'executive' ? 'Executive Review' : 'AM Review'}
          </span>
        </div>

        {canApprove ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              className={`h-7 text-[11px] gap-1 ${isClient ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              onClick={() => { setAction('approve'); setNotes(''); setError(null) }}
            >
              <Check className="h-3 w-3" />
              {config.approveLabel}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] gap-1 border-orange-300 text-orange-700 hover:bg-orange-50"
              onClick={() => { setAction('reject'); setNotes(''); setError(null) }}
            >
              <Undo2 className="h-3 w-3" />
              {config.rejectLabel}
            </Button>
          </div>
        ) : (
          <div className={`flex items-center gap-1.5 shrink-0 text-[11px] ${isClient ? 'text-blue-700' : 'text-amber-700'}`}>
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{config.waitingText}</span>
          </div>
        )}
      </div>

      {/* Change Order delta summary (collapsible) */}
      {changeOrder && changeOrder.delta_summary && (
        <div className="border border-blue-200/60 rounded bg-blue-50/50 text-[11px]">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-blue-800 hover:bg-blue-100/50"
            onClick={() => setDeltaExpanded(!deltaExpanded)}
          >
            {deltaExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            <span className="font-medium">{formatCONumber(changeOrder.co_number)} Delta</span>
            <span className="text-blue-600/70">— {changeOrder.description}</span>
            <span className={`ml-auto font-mono font-medium ${(changeOrder.delta_amount ?? 0) >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {(changeOrder.delta_amount ?? 0) >= 0 ? '+' : ''}{formatDollar(changeOrder.delta_amount ?? 0)}
            </span>
          </button>
          {deltaExpanded && (
            <div className="px-3 pb-2 space-y-1.5 border-t border-blue-200/40">
              {changeOrder.delta_summary.added.length > 0 && (
                <div className="pt-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-600/70 font-medium mb-0.5">Added</div>
                  {changeOrder.delta_summary.added.map((item, i) => (
                    <div key={i} className="flex justify-between text-emerald-700">
                      <span>+ {item.item_name}{item.section ? ` (${item.section})` : ''}{item.quantity ? ` × ${item.quantity}` : ''}</span>
                      <span className="font-mono">+{formatDollar(item.total)}</span>
                    </div>
                  ))}
                </div>
              )}
              {changeOrder.delta_summary.removed.length > 0 && (
                <div className="pt-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-red-600/70 font-medium mb-0.5">Removed</div>
                  {changeOrder.delta_summary.removed.map((item, i) => (
                    <div key={i} className="flex justify-between text-red-700">
                      <span>- {item.item_name}{item.section ? ` (${item.section})` : ''}</span>
                      <span className="font-mono">-{formatDollar(item.total)}</span>
                    </div>
                  ))}
                </div>
              )}
              {changeOrder.delta_summary.modified.length > 0 && (
                <div className="pt-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-amber-600/70 font-medium mb-0.5">Modified</div>
                  {changeOrder.delta_summary.modified.map((item, i) => (
                    <div key={i} className="flex justify-between text-amber-800">
                      <span>~ {item.item_name} {item.field}: {item.from} → {item.to}</span>
                      <span className={`font-mono ${item.delta >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {item.delta >= 0 ? '+' : ''}{formatDollar(item.delta)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between pt-1.5 border-t border-blue-200/40 font-medium text-blue-900">
                <span>Net Change</span>
                <span className="font-mono">
                  {formatDollar(changeOrder.baseline_total ?? 0)} → {formatDollar(changeOrder.revised_total ?? 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation dialog */}
      <Dialog open={!!action} onOpenChange={(o) => { if (!o) setAction(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {action === 'approve' ? config.dialogApproveTitle : config.dialogRejectTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {action === 'approve' ? config.dialogApproveDesc : config.dialogRejectDesc}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={action === 'reject' ? 'What needs to change? (required)' : 'Optional notes...'}
            className="text-xs min-h-[80px]"
          />

          {error && <p className="text-[11px] text-red-600">{error}</p>}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setAction(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={submitting || (action === 'reject' && !notes.trim())}
              className={action === 'approve'
                ? (isClient ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700')
                : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {submitting ? 'Processing...' : action === 'approve' ? config.approveLabel : config.rejectLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function formatDollar(amount: number): string {
  return '$' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
