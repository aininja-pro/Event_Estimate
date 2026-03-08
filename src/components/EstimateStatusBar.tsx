import { useState } from 'react'
import { Check, Lock } from 'lucide-react'
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
import type { EstimateStatus } from '@/types/workflow'

// ── Status definitions ──────────────────────────────────────────────────────

const STATUSES: { key: EstimateStatus; label: string; accent: string }[] = [
  { key: 'pipeline', label: 'Pipeline', accent: 'bg-zinc-400' },
  { key: 'draft', label: 'Draft', accent: 'bg-zinc-500' },
  { key: 'review', label: 'Review', accent: 'bg-amber-500' },
  { key: 'approved', label: 'Approved', accent: 'bg-emerald-600' },
  { key: 'active', label: 'Active', accent: 'bg-sky-600' },
  { key: 'recap', label: 'Recap', accent: 'bg-orange-500' },
  { key: 'complete', label: 'Complete', accent: 'bg-emerald-700' },
]

const STATUS_INDEX = Object.fromEntries(STATUSES.map((s, i) => [s.key, i]))

// ── Action configs per status ───────────────────────────────────────────────

interface StatusAction {
  label: string
  toStatus: EstimateStatus
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  requiresReason?: boolean
  className?: string
}

function getActions(status: EstimateStatus): StatusAction[] {
  switch (status) {
    case 'pipeline':
      return [{ label: 'Start Draft', toStatus: 'draft', variant: 'default' }]
    case 'draft':
      return [{ label: 'Submit for Review', toStatus: 'review', variant: 'default', className: 'bg-amber-600 hover:bg-amber-700' }]
    case 'review':
      return [
        { label: 'Approve', toStatus: 'approved', variant: 'default', className: 'bg-emerald-600 hover:bg-emerald-700' },
        { label: 'Send Back', toStatus: 'draft', variant: 'outline', requiresReason: true, className: 'border-orange-300 text-orange-700 hover:bg-orange-50' },
      ]
    case 'approved':
      return [
        { label: 'Mark Active', toStatus: 'active', variant: 'default', className: 'bg-sky-600 hover:bg-sky-700' },
        { label: 'Unlock for Editing', toStatus: 'draft', variant: 'outline', requiresReason: true },
      ]
    case 'active':
      return [{ label: 'Begin Recap', toStatus: 'recap', variant: 'default', className: 'bg-orange-600 hover:bg-orange-700' }]
    case 'recap':
      return [{ label: 'Complete', toStatus: 'complete', variant: 'default', className: 'bg-emerald-700 hover:bg-emerald-800' }]
    default:
      return []
  }
}

// ── Component ───────────────────────────────────────────────────────────────

interface EstimateStatusBarProps {
  status: EstimateStatus
  onTransition: (toStatus: EstimateStatus, reason?: string) => Promise<{ success: boolean; error?: string }>
  onSubmitForApproval?: () => Promise<{ success: boolean; error?: string; threshold?: string }>
  disabled?: boolean
}

export function EstimateStatusBar({ status, onTransition, onSubmitForApproval, disabled }: EstimateStatusBarProps) {
  const [confirmAction, setConfirmAction] = useState<StatusAction | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentIndex = STATUS_INDEX[status] ?? 0
  const actions = getActions(status)
  const currentAccent = STATUSES[currentIndex]?.accent ?? 'bg-zinc-400'

  async function handleAction(action: StatusAction) {
    if (action.requiresReason) {
      setConfirmAction(action)
      setReason('')
      setError(null)
      return
    }

    if (action.toStatus === 'review' && onSubmitForApproval) {
      setConfirmAction(action)
      setReason('')
      setError(null)
      return
    }

    setSubmitting(true)
    setError(null)
    const result = await onTransition(action.toStatus)
    setSubmitting(false)
    if (!result.success) setError(result.error || 'Transition failed')
  }

  async function handleConfirm() {
    if (!confirmAction) return

    if (confirmAction.requiresReason && !reason.trim()) {
      setError('Please provide a reason')
      return
    }

    setSubmitting(true)
    setError(null)

    let result: { success: boolean; error?: string }

    if (confirmAction.toStatus === 'review' && onSubmitForApproval) {
      result = await onSubmitForApproval()
    } else {
      result = await onTransition(confirmAction.toStatus, reason.trim() || undefined)
    }

    setSubmitting(false)
    if (result.success) {
      setConfirmAction(null)
    } else {
      setError(result.error || 'Transition failed')
    }
  }

  const isLocked = status === 'approved' || status === 'active' || status === 'complete'

  return (
    <div className="space-y-2">
      {/* Compact linear progress track */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0 shrink-0">
          {STATUSES.map((s, i) => {
            const isCurrent = s.key === status
            const isPast = i < currentIndex
            const isFuture = i > currentIndex
            const isLast = i === STATUSES.length - 1

            return (
              <div key={s.key} className="flex items-center">
                {/* Node + inline label */}
                <div className="flex items-center gap-1">
                  <div className={`
                    relative flex items-center justify-center rounded-full transition-all shrink-0
                    ${isCurrent ? `h-2.5 w-2.5 ${currentAccent} ring-[3px] ring-offset-1 ring-zinc-100` : ''}
                    ${isPast ? 'h-2 w-2 bg-zinc-300' : ''}
                    ${isFuture ? 'h-[7px] w-[7px] border-[1.5px] border-zinc-200 bg-white' : ''}
                  `}>
                    {isPast && <Check className="h-1.5 w-1.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`
                    text-[10px] whitespace-nowrap leading-none
                    ${isCurrent ? 'font-semibold text-foreground' : ''}
                    ${isPast ? 'font-medium text-zinc-400' : ''}
                    ${isFuture ? 'font-normal text-zinc-300' : ''}
                  `}>
                    {s.label}
                  </span>
                </div>

                {/* Connecting line */}
                {!isLast && (
                  <div className={`
                    w-3 h-[1px] mx-0.5
                    ${i < currentIndex ? 'bg-zinc-300' : 'bg-zinc-200'}
                  `} />
                )}
              </div>
            )
          })}
        </div>

        {/* Action buttons */}
        {actions.length > 0 && (
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                className={`h-7 text-[11px] ${action.className || ''}`}
                onClick={() => handleAction(action)}
                disabled={disabled || submitting}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Locked banner */}
      {isLocked && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200/60 rounded text-[11px] text-zinc-500">
          <Lock className="h-3 w-3" />
          <span>
            {status === 'complete' ? 'Estimate is complete and locked.' :
             status === 'approved' ? 'Estimate is approved and locked. Unlock to make changes.' :
             'Estimate is active and locked.'}
          </span>
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
            <DialogTitle className="text-sm">
              {confirmAction?.toStatus === 'review' ? 'Submit for Review' : confirmAction?.label}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {confirmAction?.toStatus === 'review'
                ? 'This will submit the estimate for approval. The estimate will become read-only until reviewed.'
                : confirmAction?.requiresReason
                ? 'Please provide a reason for this change. This will be recorded in the audit log.'
                : `Confirm: transition this estimate to "${confirmAction?.toStatus}".`
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

          {error && <p className="text-[11px] text-red-600">{error}</p>}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={submitting || (confirmAction?.requiresReason && !reason.trim())}
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
