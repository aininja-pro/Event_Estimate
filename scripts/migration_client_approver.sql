-- Migration: add primary_approver_id to clients
-- Purpose: route first-gate approval notifications to a client-specific designated approver.
-- Context: planning/requirements-driveshop-approval-routing.md, Step 1.
--
-- Design notes:
--   NULL (default) = fall back to existing behavior (broadcast to all account_managers).
--     Every existing client row gets NULL after this migration, so no approval flows break.
--   Set to a profiles.id = targeted notification dispatch to that user when an estimate
--     for this client is submitted for review.
--   Role-based-via-indirection: the column stores a user id, not a name. When the assigned
--     approver leaves, the admin updates this column rather than every rate card reference.
--   ON DELETE SET NULL so removing a profile cleanly falls back to broadcast routing
--     instead of blocking estimate submission or orphaning an FK.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS primary_approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN clients.primary_approver_id IS
  'The designated internal approver (account_manager or admin) for estimates from this client. NULL = broadcast to all account_managers.';
