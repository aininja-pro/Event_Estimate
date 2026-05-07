import { useEffect, useState } from 'react'
import { Eye, Mail, Paperclip } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { previewPDF } from '@/lib/pdf-service'
import type { ClientContact } from '@/types/rate-card'

const CUSTOM_RECIPIENT = '__custom__'

export interface SendToClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-filled from clients.billing_contact_email; user can override. */
  defaultEmail: string | null
  /** External client contacts available for this estimate's client. */
  contacts?: Pick<ClientContact, 'id' | 'name' | 'email' | 'title'>[]
  /** Event name, used in the PDF filename preview. */
  eventName: string
  /** Client name, used in the PDF filename preview. */
  clientName: string
  /** Estimate id — used to render a preview of the exact PDF that will be sent. */
  estimateId: string
  /** Segment id — the send flow scopes the PDF to this segment. */
  segmentId: string
  /** Whether a previous token is still pending — flips copy to "Resend". */
  hasPendingToken?: boolean
  /** Returns {ok, error?} so the modal can surface backend errors inline. */
  onSend: (params: {
    recipientEmail: string
    note: string
  }) => Promise<{ ok: boolean; error?: string }>
}

export function SendToClientModal({
  open,
  onOpenChange,
  defaultEmail,
  contacts = [],
  eventName,
  clientName,
  estimateId,
  segmentId,
  hasPendingToken = false,
  onSend,
}: SendToClientModalProps) {
  const [email, setEmail] = useState(defaultEmail ?? '')
  const [selectedRecipient, setSelectedRecipient] = useState(CUSTOM_RECIPIENT)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when the modal opens (re-seeds from the latest defaultEmail).
  useEffect(() => {
    if (open) {
      setEmail(defaultEmail ?? '')
      const matchingContact = contacts.find((contact) => contact.email === defaultEmail)
      setSelectedRecipient(matchingContact?.id ?? CUSTOM_RECIPIENT)
      setNote('')
      setError(null)
      setSubmitting(false)
    }
  }, [open, defaultEmail, contacts])

  const pdfFilename = `${safePart(clientName)}_${safePart(eventName)}_Estimate_${todayISO()}.pdf`
  const trimmedEmail = email.trim()
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)

  async function handlePreview() {
    setPreviewing(true)
    setError(null)
    try {
      await previewPDF(estimateId, 'client_summary', segmentId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed.')
    } finally {
      setPreviewing(false)
    }
  }

  async function handleSubmit() {
    if (!emailValid) {
      setError('Please enter a valid email address.')
      return
    }
    setSubmitting(true)
    setError(null)
    const result = await onSend({ recipientEmail: trimmedEmail, note: note.trim() })
    setSubmitting(false)
    if (result.ok) {
      onOpenChange(false)
    } else {
      setError(result.error || 'Send failed.')
    }
  }

  function handleRecipientChange(value: string) {
    setSelectedRecipient(value)
    if (value === CUSTOM_RECIPIENT) return
    const contact = contacts.find((c) => c.id === value)
    if (contact) setEmail(contact.email)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!submitting ? onOpenChange(o) : undefined)}>
      <DialogContent className="sm:max-w-xl overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" />
            {hasPendingToken ? 'Resend Estimate to Client' : 'Send Estimate to Client'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            The client will receive the attached PDF and a one-click approval link.
            {hasPendingToken && ' The previously sent link will be invalidated.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">
              Approval Recipient
            </label>
            {contacts.length > 0 && (
              <Select value={selectedRecipient} onValueChange={handleRecipientChange}>
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Choose client contact" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[70]">
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id} className="text-xs">
                      <span className="font-medium">{contact.name}</span>
                      <span className="text-muted-foreground">{contact.email}</span>
                      {contact.title && <span className="text-muted-foreground/70">{contact.title}</span>}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_RECIPIENT} className="text-xs italic text-muted-foreground">
                    Custom email
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setSelectedRecipient(CUSTOM_RECIPIENT)
              }}
              placeholder="client@example.com"
              className="text-xs h-8"
              autoComplete="off"
            />
            {!defaultEmail && (
              <p className="text-[10px] text-amber-600">
                No billing contact on file. Enter an address above.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">
              Note (optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Please review the attached estimate when you get a chance."
              className="text-xs min-h-[72px]"
            />
          </div>

          <div className="flex min-w-0 items-center gap-2 rounded bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-600">
            <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate font-mono">{pdfFilename}</span>
            <button
              type="button"
              onClick={handlePreview}
              disabled={previewing}
              className="ml-auto shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <Eye className="h-3 w-3" />
              {previewing ? 'Opening…' : 'Preview'}
            </button>
          </div>

          {error && <p className="text-[11px] text-red-600">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !emailValid}
            className="bg-blue-600 hover:bg-blue-700 gap-1"
          >
            <Mail className="h-3 w-3" />
            {submitting ? 'Sending...' : hasPendingToken ? 'Resend' : 'Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function safePart(value: string): string {
  return (value || '').replace(/\s+/g, '_') || 'Estimate'
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
