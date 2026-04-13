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
  error?: string
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
  }
}

export interface ClientApprovalToken {
  id: string
  estimate_id: string
  labor_log_id: string
  client_email: string
  status: 'pending' | 'approved' | 'expired' | 'superseded'
  sent_at: string
  expires_at: string
  approved_at: string | null
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
    .select('id, estimate_id, labor_log_id, client_email, status, sent_at, expires_at, approved_at')
    .eq('labor_log_id', laborLogId)
    .order('sent_at', { ascending: false })
    .limit(1)
  if (error) throw error
  return (data?.[0] as ClientApprovalToken) ?? null
}
