-- Client approval token table
-- Links a one-click approval URL (UUID token) to a segment awaiting client approval.
-- When the client clicks the email link, the token is validated, the matching
-- approval_requests row is marked approved, and the segment transitions to 'active'.
--
-- Scope note: this is the 3rd gate (the "client gate") of the existing three-gate
-- approval chain. Today that gate is cleared manually in ApprovalBanner. With this
-- table + the new GET /api/approval/confirm/{token} endpoint, it can be cleared by
-- the client directly from an email link. The manual button remains as a fallback.

BEGIN;

CREATE TABLE IF NOT EXISTS client_approval_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  approval_request_id UUID REFERENCES approval_requests(id) ON DELETE SET NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  client_email TEXT NOT NULL,
  sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  approved_at TIMESTAMPTZ,
  approved_from_ip TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'expired', 'superseded'))
);

CREATE INDEX IF NOT EXISTS idx_client_approval_tokens_token
  ON client_approval_tokens(token);

CREATE INDEX IF NOT EXISTS idx_client_approval_tokens_segment
  ON client_approval_tokens(labor_log_id, status);

ALTER TABLE client_approval_tokens ENABLE ROW LEVEL SECURITY;

-- Authenticated internal staff can read/write tokens (for listing in the UI,
-- creating new tokens on "Send to Client", superseding older tokens on resend).
-- The public confirmation endpoint bypasses RLS via the service key.
CREATE POLICY "Tokens manageable by authenticated users"
  ON client_approval_tokens FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

COMMIT;
