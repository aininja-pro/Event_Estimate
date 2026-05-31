import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface SendClientApprovalParams {
  estimateId: string
  laborLogId: string
  approvalRequestId?: string | null
  recipientEmail: string
  note?: string
  sentBy?: string | null
}

export interface SendClientApprovalResult {
  ok: boolean
  tokenId?: string
  sentTo?: string
  pdfFilename?: string
  resendId?: string | null
  emailSent?: boolean
  emailDisabled?: boolean
  approvalUrl?: string
  message?: string
  error?: string
}

/** Whether client-facing approval email is enabled in the backend.
 *  Source of truth is the backend env var, surfaced via /api/health. Used only
 *  for UI presentation — the backend enforces the gate regardless. Defaults to
 *  enabled on error so the control isn't hidden during a transient outage. */
export async function getClientApprovalEmailEnabled(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/health`)
    if (!res.ok) return true
    const body = (await res.json()) as { client_approval_email_enabled?: boolean }
    return body.client_approval_email_enabled !== false
  } catch {
    return true
  }
}

/** Trigger the backend to generate the client PDF + send the approval email. */
export async function sendClientApproval(
  params: SendClientApprovalParams,
): Promise<SendClientApprovalResult> {
  const res = await fetch(`${API_URL}/api/email/send-client-approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      estimate_id: params.estimateId,
      labor_log_id: params.laborLogId,
      approval_request_id: params.approvalRequestId ?? null,
      recipient_email: params.recipientEmail,
      note: params.note ?? '',
      sent_by: params.sentBy ?? null,
    }),
  })

  if (!res.ok) {
    return { ok: false, error: `Request failed (${res.status})` }
  }

  const body = (await res.json()) as {
    ok: boolean
    token_id?: string
    sent_to?: string
    pdf_filename?: string
    resend_id?: string | null
    email_sent?: boolean
    client_email_disabled?: boolean
    approval_url?: string
    message?: string
    error?: string
  }

  if (!body.ok) {
    return { ok: false, error: body.error || 'Send failed' }
  }

  return {
    ok: true,
    tokenId: body.token_id,
    sentTo: body.sent_to,
    pdfFilename: body.pdf_filename,
    resendId: body.resend_id ?? null,
    emailSent: body.email_sent,
    emailDisabled: body.client_email_disabled,
    approvalUrl: body.approval_url,
    message: body.message,
  }
}

export interface ClientApprovalToken {
  id: string
  estimate_id: string
  labor_log_id: string
  client_email: string
  status: 'pending' | 'approved' | 'expired' | 'superseded' | 'rejected'
  sent_at: string
  expires_at: string
  approved_at: string | null
  rejected_at: string | null
  rejection_notes: string | null
}

/** Fetch the most recent token for a segment so the banner can show
 *  "Sent to X on Y, awaiting response" (or "Client approved via email").
 *  Returns null when no tokens exist. */
export async function getLatestClientApprovalToken(
  laborLogId: string,
): Promise<ClientApprovalToken | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('client_approval_tokens')
    .select('id, estimate_id, labor_log_id, client_email, status, sent_at, expires_at, approved_at, rejected_at, rejection_notes')
    .eq('labor_log_id', laborLogId)
    .order('sent_at', { ascending: false })
    .limit(1)
  if (error) throw error
  return (data?.[0] as ClientApprovalToken) ?? null
}
