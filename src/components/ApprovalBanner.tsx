import { useState } from 'react'
import { AlertCircle, Check, Undo2 } from 'lucide-react'
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
import type { ApprovalRequest } from '@/types/workflow'

// ── Component ───────────────────────────────────────────────────────────────

interface ApprovalBannerProps {
  approval: ApprovalRequest
  onApprove: (approvalId: string) => Promise<{ success: boolean; error?: string }>
  onReject: (approvalId: string, notes: string) => Promise<{ success: boolean; error?: string }>
}

export function ApprovalBanner({ approval, onApprove, onReject }: ApprovalBannerProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestedDate = new Date(approval.requested_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  async function handleConfirm() {
    if (!action) return
    setSubmitting(true)
    setError(null)

    const result = action === 'approve'
      ? await onApprove(approval.id)
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
      <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200/80 rounded text-[12px]">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-amber-900">
            This estimate is awaiting review. Submitted by{' '}
            <span className="font-medium">{approval.requested_by}</span> on {requestedDate}.
          </span>
          {approval.threshold_triggered && (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
              {approval.threshold_triggered}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            className="h-7 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => { setAction('approve'); setNotes(''); setError(null) }}
          >
            <Check className="h-3 w-3" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1 border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={() => { setAction('reject'); setNotes(''); setError(null) }}
          >
            <Undo2 className="h-3 w-3" />
            Send Back
          </Button>
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={!!action} onOpenChange={(o) => { if (!o) setAction(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {action === 'approve' ? 'Approve Estimate' : 'Send Back for Revision'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {action === 'approve'
                ? 'This will approve the estimate and lock it from further editing until unlocked.'
                : 'Please explain what needs to change. The estimate will return to Draft status for editing.'}
            </DialogDescription>
          </DialogHeader>

          {action === 'reject' && (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What needs to change? (required)"
              className="text-xs min-h-[80px]"
            />
          )}

          {error && <p className="text-[11px] text-red-600">{error}</p>}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setAction(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={submitting || (action === 'reject' && !notes.trim())}
              className={action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}
            >
              {submitting ? 'Processing...' : action === 'approve' ? 'Confirm Approval' : 'Send Back'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
