import { useState } from 'react'
import { Lock, AlertTriangle, User, Users } from 'lucide-react'
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
import { hasPermission } from '@/lib/permissions'
import type { Permission } from '@/lib/permissions'
import type { AccountingReview, SegmentStatus } from '@/types/workflow'

// -- Action configs per segment status --

interface SegmentAction {
  label: string
  toStatus: SegmentStatus
  variant: 'default' | 'outline'
  requiresReason?: boolean
  className?: string
  permission: Permission
  action?: 'transition' | 'create_co' | 'submit_co' | 'submit_recap' | 'approve_recap' | 'request_corrections'
}

function getSegmentActions(status: SegmentStatus, hasDraftCO?: boolean, isOfficeEvent?: boolean): SegmentAction[] {
  switch (status) {
    case 'pipeline':
      return [{ label: 'Begin Estimating', toStatus: 'estimate', variant: 'outline', permission: 'transition_segment', className: 'border-zinc-300/60 text-zinc-600/80 bg-zinc-50/50 hover:bg-zinc-100/60 hover:border-zinc-400/60 hover:text-zinc-800' }]
    case 'estimate':
      // When a draft CO exists, replace "Submit for Review" with "Submit Change Order"
      if (hasDraftCO) {
        return [
          { label: 'Submit Change Order', toStatus: 'in_review', variant: 'outline', permission: 'submit_for_review', action: 'submit_co', className: 'border-blue-300/60 text-blue-700/80 bg-blue-50/50 hover:bg-blue-100/60 hover:border-blue-400/60 hover:text-blue-800' },
          { label: 'Mark Lost', toStatus: 'lost', variant: 'outline', requiresReason: true, permission: 'transition_segment', className: 'border-red-300/60 text-red-600/80 hover:bg-red-50/60 hover:text-red-700' },
          { label: 'Cancel', toStatus: 'cancelled', variant: 'outline', requiresReason: true, permission: 'transition_segment', className: 'border-slate-300/60 text-slate-500/80 hover:bg-slate-50/60 hover:text-slate-600' },
        ]
      }
      return [
        { label: 'Submit for Review', toStatus: 'in_review', variant: 'outline', permission: 'submit_for_review', className: 'border-amber-300/60 text-amber-700/80 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-400/60 hover:text-amber-800' },
        { label: 'Mark Lost', toStatus: 'lost', variant: 'outline', requiresReason: true, permission: 'transition_segment', className: 'border-red-300/60 text-red-600/80 hover:bg-red-50/60 hover:text-red-700' },
        { label: 'Cancel', toStatus: 'cancelled', variant: 'outline', requiresReason: true, permission: 'transition_segment', className: 'border-slate-300/60 text-slate-500/80 hover:bg-slate-50/60 hover:text-slate-600' },
      ]
    case 'in_review':
      return [
        { label: 'Send Back to Estimate', toStatus: 'estimate', variant: 'outline', requiresReason: true, permission: 'approve_standard', className: 'border-orange-300/60 text-orange-600/80 hover:bg-orange-50/60 hover:text-orange-700' },
        { label: 'Mark Lost', toStatus: 'lost', variant: 'outline', requiresReason: true, permission: 'transition_segment', className: 'border-red-300/60 text-red-600/80 hover:bg-red-50/60 hover:text-red-700' },
        { label: 'Cancel', toStatus: 'cancelled', variant: 'outline', requiresReason: true, permission: 'transition_segment', className: 'border-slate-300/60 text-slate-500/80 hover:bg-slate-50/60 hover:text-slate-600' },
      ]
    case 'active':
      return [
        { label: 'Request Edit', toStatus: 'estimate', variant: 'outline', requiresReason: true, permission: 'transition_segment', className: 'border-orange-300/60 text-orange-600/80 hover:bg-orange-50/60 hover:text-orange-700' },
        { label: 'Create Change Order', toStatus: 'estimate', variant: 'outline', requiresReason: true, permission: 'transition_segment', action: 'create_co', className: 'border-blue-300/60 text-blue-700/80 bg-blue-50/50 hover:bg-blue-100/60 hover:border-blue-400/60 hover:text-blue-800' },
        { label: 'Begin Recap', toStatus: 'recap', variant: 'outline', permission: 'transition_segment', className: 'border-violet-300/60 text-violet-700/80 bg-violet-50/50 hover:bg-violet-100/60 hover:border-violet-400/60 hover:text-violet-800' },
      ]
    case 'recap':
      if (isOfficeEvent) {
        return [{ label: 'Submit to Accounting', toStatus: 'accounting_review', variant: 'outline', permission: 'submit_recap_for_accounting', action: 'submit_recap', className: 'border-sky-300/60 text-sky-700/80 bg-sky-50/50 hover:bg-sky-100/60 hover:border-sky-400/60 hover:text-sky-800' }]
      }
      return [{ label: 'Mark Invoiced', toStatus: 'invoiced', variant: 'outline', permission: 'mark_invoiced', className: 'border-teal-300/60 text-teal-700/80 bg-teal-50/50 hover:bg-teal-100/60 hover:border-teal-400/60 hover:text-teal-800' }]
    case 'accounting_review':
      return [
        { label: 'Approve Recap', toStatus: 'export_ready', variant: 'outline', permission: 'approve_recap', action: 'approve_recap', className: 'border-emerald-300/60 text-emerald-700/80 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-400/60 hover:text-emerald-800' },
        { label: 'Request Corrections', toStatus: 'recap', variant: 'outline', requiresReason: true, permission: 'request_recap_corrections', action: 'request_corrections', className: 'border-orange-300/60 text-orange-600/80 hover:bg-orange-50/60 hover:text-orange-700' },
      ]
    case 'export_ready':
      return [{ label: 'Mark Invoiced', toStatus: 'invoiced', variant: 'outline', permission: 'mark_export_ready_invoiced', className: 'border-teal-300/60 text-teal-700/80 bg-teal-50/50 hover:bg-teal-100/60 hover:border-teal-400/60 hover:text-teal-800' }]
    case 'invoiced':
      return [{ label: 'Reopen to Recap', toStatus: 'recap', variant: 'outline', requiresReason: true, permission: 'transition_segment', className: 'border-orange-300/60 text-orange-600/80 hover:bg-orange-50/60 hover:text-orange-700' }]
    case 'lost':
      return [{ label: 'Reopen', toStatus: 'estimate', variant: 'outline', requiresReason: true, permission: 'transition_segment', className: 'border-orange-300/60 text-orange-600/80 hover:bg-orange-50/60 hover:text-orange-700' }]
    case 'cancelled':
      return [{ label: 'Reopen', toStatus: 'estimate', variant: 'outline', requiresReason: true, permission: 'transition_segment', className: 'border-orange-300/60 text-orange-600/80 hover:bg-orange-50/60 hover:text-orange-700' }]
    default:
      return []
  }
}

// -- Lock banner messages --

const LOCK_MESSAGES: Partial<Record<SegmentStatus, string>> = {
  in_review: 'This segment is under review. Editing is disabled.',
  active: 'This segment is active. Staff names can be updated. Other fields are locked.',
  recap: 'This segment is in recap. Enter actual costs and assign staff names.',
  accounting_review: 'This recap is under Accounting Review. Recap actuals are locked for office users.',
  export_ready: 'This segment is ready for future AP/AR Intacct import.',
  invoiced: 'This segment is invoiced and locked.',
  lost: 'This segment is marked as lost and locked.',
  cancelled: 'This segment is cancelled and locked.',
}

// -- Component --

interface SegmentTransitionBarProps {
  segmentName: string
  status: SegmentStatus
  userRole: string
  primaryApprover?: { id: string; full_name: string } | null
  isOfficeEvent?: boolean
  accountingReview?: AccountingReview | null
  onTransition: (toStatus: SegmentStatus, comment?: string) => Promise<{ success: boolean; error?: string }>
  onSubmitRecapForAccounting?: (notes?: string) => Promise<{ success: boolean; error?: string }>
  onApproveRecap?: (notes?: string) => Promise<{ success: boolean; error?: string }>
  onRequestCorrections?: (notes: string) => Promise<{ success: boolean; error?: string }>
  onCreateChangeOrder?: (description: string) => Promise<{ success: boolean; error?: string }>
  onSubmitChangeOrder?: () => Promise<{ success: boolean; error?: string }>
  disabled?: boolean
  unnamedStaffCount?: number
  hasDraftCO?: boolean
}

export function SegmentTransitionBar({
  segmentName,
  status,
  userRole,
  primaryApprover,
  isOfficeEvent,
  accountingReview,
  onTransition,
  onSubmitRecapForAccounting,
  onApproveRecap,
  onRequestCorrections,
  onCreateChangeOrder,
  onSubmitChangeOrder,
  disabled,
  unnamedStaffCount,
  hasDraftCO,
}: SegmentTransitionBarProps) {
  const [confirmAction, setConfirmAction] = useState<SegmentAction | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const actions = getSegmentActions(status, hasDraftCO, isOfficeEvent).filter(
    (action) => hasPermission(userRole, action.permission)
  )
  const lockMessage = LOCK_MESSAGES[status]
  const namesBlocking = status === 'recap' && (unnamedStaffCount ?? 0) > 0

  async function handleAction(action: SegmentAction) {
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

    let result: { success: boolean; error?: string }

    if (confirmAction.action === 'create_co' && onCreateChangeOrder) {
      result = await onCreateChangeOrder(reason.trim())
    } else if (confirmAction.action === 'submit_co' && onSubmitChangeOrder) {
      result = await onSubmitChangeOrder()
    } else if (confirmAction.action === 'submit_recap' && onSubmitRecapForAccounting) {
      result = await onSubmitRecapForAccounting(reason.trim() || undefined)
    } else if (confirmAction.action === 'approve_recap' && onApproveRecap) {
      result = await onApproveRecap(reason.trim() || undefined)
    } else if (confirmAction.action === 'request_corrections' && onRequestCorrections) {
      result = await onRequestCorrections(reason.trim())
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

  return (
    <div className="space-y-1.5">
      {/* Action bar */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">
            Segment
          </span>
          <div className="flex items-center gap-1.5">
            {actions.map((action) => {
              const isInvoiceBlocked = action.toStatus === 'invoiced' && namesBlocking
              return (
                <Button
                  key={action.label}
                  variant={action.variant}
                  size="sm"
                  className={`h-6 text-[10px] px-2 ${action.className || ''}`}
                  onClick={() => handleAction(action)}
                  disabled={disabled || submitting || isInvoiceBlocked}
                >
                  {action.label}
                </Button>
              )
            })}
          </div>
          {namesBlocking && (
            <div className="flex items-center gap-1.5 text-[10px] text-amber-600">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>{unnamedStaffCount} staff still need{unnamedStaffCount === 1 ? 's' : ''} names assigned before invoicing</span>
            </div>
          )}
        </div>
      )}

      {/* Lock banner */}
      {lockMessage && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200/60 rounded text-[11px] text-zinc-500">
          <Lock className="h-3 w-3 shrink-0" />
          <span>{lockMessage}</span>
        </div>
      )}

      {accountingReview?.correction_notes && status === 'recap' && (
        <div className="flex items-start gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200/60 rounded text-[11px] text-orange-800">
          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
          <span><span className="font-medium">Accounting corrections:</span> {accountingReview.correction_notes}</span>
        </div>
      )}

      {accountingReview?.review_notes && status === 'export_ready' && (
        <div className="flex items-start gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded text-[11px] text-emerald-800">
          <span><span className="font-medium">Accounting note:</span> {accountingReview.review_notes}</span>
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
              {confirmAction?.action === 'create_co'
                ? `Describe the scope change for "${segmentName}". This will create a numbered change order and unlock the segment for editing.`
                : confirmAction?.action === 'submit_co'
                ? `Submit the change order for "${segmentName}". The delta will be auto-computed and sent for approval.`
                : confirmAction?.action === 'submit_recap'
                ? `Submit "${segmentName}" recap actuals and receipts to accounting for review.`
                : confirmAction?.action === 'approve_recap'
                ? `Approve "${segmentName}" recap and mark it ready for future Intacct import.`
                : confirmAction?.action === 'request_corrections'
                ? `Explain what needs to be corrected. The segment will return to Recap.`
                : confirmAction?.requiresReason
                ? `Please provide a reason for this change to "${segmentName}".`
                : `Confirm: transition "${segmentName}" to ${confirmAction?.toStatus === 'in_review' ? 'In Review' : confirmAction?.toStatus}.`
              }
            </DialogDescription>
          </DialogHeader>

          {/* Routing info — only for Submit for Review / Submit Change Order transitions */}
          {confirmAction?.toStatus === 'in_review' && (
            <div className="flex items-start gap-2 px-3 py-2 bg-amber-50/40 border border-amber-200/50 rounded text-[11px]">
              {primaryApprover ? (
                <>
                  <User className="h-3.5 w-3.5 shrink-0 mt-[1px] text-amber-700/80" />
                  <div className="leading-tight">
                    <span className="text-muted-foreground">This will be sent to </span>
                    <span className="font-medium text-foreground">{primaryApprover.full_name}</span>
                    <span className="text-muted-foreground"> for review.</span>
                  </div>
                </>
              ) : (
                <>
                  <Users className="h-3.5 w-3.5 shrink-0 mt-[1px] text-amber-700/80" />
                  <div className="leading-tight text-muted-foreground">
                    This will be sent to all account managers for review.
                    <span className="block text-[10px] text-muted-foreground/70 mt-0.5">
                      No primary approver is set on this client.
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

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
