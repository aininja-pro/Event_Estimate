-- Migration: Add 'rejected' status to client_approval_tokens + rejection metadata columns
-- Date: 2026-04-16

BEGIN;

-- Expand the status CHECK to include 'rejected'
ALTER TABLE client_approval_tokens
  DROP CONSTRAINT IF EXISTS client_approval_tokens_status_check;

ALTER TABLE client_approval_tokens
  ADD CONSTRAINT client_approval_tokens_status_check
  CHECK (status IN ('pending', 'approved', 'expired', 'superseded', 'rejected'));

-- Rejection metadata columns
ALTER TABLE client_approval_tokens
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_from_ip TEXT,
  ADD COLUMN IF NOT EXISTS rejection_notes TEXT;

COMMIT;
