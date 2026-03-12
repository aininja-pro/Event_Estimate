import { useState } from 'react'
import { Lock } from 'lucide-react'
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
import type { SegmentStatus } from '@/types/workflow'

// ── Action configs per segment status ─────────────────────────────────────

interface SegmentAction {
  label: string
  toStatus: SegmentStatus
  variant: 'default' | 'outline'
  requiresReason?: boolean
  className?: string
}

function getSegmentActions(status: SegmentStatus): SegmentAction[] {
  switch (status) {
    case 'draft':
      return [{ label: 'Submit for Review', toStatus: 'review', variant: 'outline', className: 'border-amber-300/60 text-amber-700/80 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-400/60 hover:text-amber-800' }]
    case 'review':
      return [
        { label: 'Approve', toStatus: 'approved', variant: 'outline', className: 'border-blue-300/60 text-blue-700/80 bg-blue-50/50 hover:bg-blue-100/60 hover:border-blue-400/60 hover:text-blue-800' },
        { label: 'Send Back', toStatus: 'draft', variant: 'outline', requiresReason: true, className: 'border-orange-300/60 text-orange-600/80 hover:bg-orange-50/60 hover:text-orange-700' },
      ]
    case 'approved':
      return [
        { label: 'Mark Active', toStatus: 'active', variant: 'outline', className: 'border-emerald-300/60 text-emerald-700/80 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-400/60 hover:text-emerald-800' },
        { label: 'Reopen', toStatus: 'draft', variant: 'outline', requiresReason: true, className: 'hover:text-foreground' },
      ]
    case 'active':
      return [{ label: 'Begin Recap', toStatus: 'recap', variant: 'outline', className: 'border-violet-300/60 text-violet-700/80 bg-violet-50/50 hover:bg-violet-100/60 hover:border-violet-400/60 hover:text-violet-800' }]
    case 'recap':
      return [
        { label: 'Mark Invoiced', toStatus: 'invoiced', variant: 'outline', className: 'border-teal-300/60 text-teal-700/80 bg-teal-50/50 hover:bg-teal-100/60 hover:border-teal-400/60 hover:text-teal-800' },
        { label: 'Reopen Active', toStatus: 'active', variant: 'outline', className: 'hover:text-foreground' },
      ]
    case 'invoiced':
      return [{ label: 'Mark Complete', toStatus: 'complete', variant: 'outline', className: 'border-slate-300/60 text-slate-600/80 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-400/60 hover:text-slate-700' }]
    default:
      return []
  }
}

// ── Lock banner messages ──────────────────────────────────────────────────

const LOCK_MESSAGES: Partial<Record<SegmentStatus, string>> = {
  review: 'This segment is under review. Editing is disabled.',
  approved: 'This segment is approved and locked. Reopen to modify.',
  active: 'This segment is active. Staff names can be updated. Other fields are locked.',
  recap: 'This segment is in recap. Enter actual costs and assign staff names.',
  invoiced: 'This segment is invoiced and locked.',
  complete: 'This segment is complete and locked.',
}

// ── Component ─────────────────────────────────────────────────────────────

interface SegmentTransitionBarProps {
  segmentName: string
  status: SegmentStatus
  onTransition: (toStatus: SegmentStatus, comment?: string) => Promise<{ success: boolean; error?: string }>
  disabled?: boolean
}

export function SegmentTransitionBar({ segmentName, status, onTransition, disabled }: SegmentTransitionBarProps) {
  const [confirmAction, setConfirmAction] = useState<SegmentAction | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const actions = getSegmentActions(status)
  const lockMessage = LOCK_MESSAGES[status]

  async function handleAction(action: SegmentAction) {
    if (action.requiresReason) {
      setConfirmAction(action)
      setReason('')
      setError(null)
      return
    }

    // Show confirmation for all transitions
    setConfirmAction(action)
    setReason('')
    setError(null)
  }

  async function handleConfirm() {
    if (!confirmAction) return
    if (confirmAction.requiresReason && !reason.trim()) {
      setError('Please provide a reason')
      return
    }

    setSubmitting(true)
    setError(null)
    const result = await onTransition(confirmAction.toStatus, reason.trim() || undefined)
    setSubmitting(false)

    if (result.success) {
      setConfirmAction(null)
    } else {
      setError(result.error || 'Transition failed')
    }
  }

  return (
    <div className="space-y-1.5">
      {/* Action bar */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">
            Segment
          </span>
          <div className="flex items-center gap-1.5">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                className={`h-6 text-[10px] px-2 ${action.className || ''}`}
                onClick={() => handleAction(action)}
                disabled={disabled || submitting}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Lock banner */}
      {lockMessage && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200/60 rounded text-[11px] text-zinc-500">
          <Lock className="h-3 w-3 shrink-0" />
          <span>{lockMessage}</span>
        </div>
      )}

      {/* Inline error */}
      {error && !confirmAction && (
        <p className="text-[11px] text-red-600">{error}</p>
      )}

      {/* Confirm dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{confirmAction?.label}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {confirmAction?.requiresReason
                ? `Please provide a reason for this change to "${segmentName}".`
                : `Confirm: transition "${segmentName}" to ${confirmAction?.toStatus}.`
              }
            </DialogDescription>
          </DialogHeader>

          {confirmAction?.requiresReason && (
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for this change..."
              className="text-xs min-h-[80px]"
            />
          )}

          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional comment..."
            className={`text-xs min-h-[60px] ${confirmAction?.requiresReason ? 'hidden' : ''}`}
          />

          {error && <p className="text-[11px] text-red-600">{error}</p>}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={submitting || (!!confirmAction?.requiresReason && !reason.trim())}
              className={confirmAction?.className || ''}
            >
              {submitting ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
