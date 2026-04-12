-- Migration: add is_unplanned flag to labor_entries
-- Purpose: mark labor entries that were added during recap mode (not part of
-- the originally approved staff plan). Used on manual-labor segments (no
-- schedule grid).
-- Context: planning/requirements-driveshop-recap-additions.md, unplanned roles extension.
--
-- Design notes:
--   FALSE (default) = planned labor entry from the original estimate.
--   TRUE = added during recap on a manual segment (e.g., last-minute contractor).
--     These rows carry quantity=0, days=0, unit_rate=0, cost_rate=0 on the
--     estimate side. Actual cost lives in recap_actuals (keyed on labor_entry_id).
--   UI renders unplanned labor rows with a rose left-border + UNPLANNED badge
--     and dashes in the estimate columns, matching the line item pattern.

ALTER TABLE labor_entries
  ADD COLUMN IF NOT EXISTS is_unplanned BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN labor_entries.is_unplanned IS
  'TRUE if this labor entry was added during recap mode (not part of the original staff plan). Default FALSE.';
