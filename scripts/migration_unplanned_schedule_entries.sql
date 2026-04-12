-- Migration: add is_unplanned flag to schedule_entries
-- Purpose: mark staff rows that were added during recap mode (not part of the
-- originally approved staff plan).
-- Context: planning/requirements-driveshop-recap-additions.md, unplanned roles extension.
--
-- Design notes:
--   FALSE (default) = planned staff row from the original estimate.
--   TRUE = added during recap (e.g., "had to bring in a freelance A/V tech").
--     New unplanned rows have no schedule_day_entries at creation time.
--     Users enter per-day actual_hours via the grid cells in recap mode.
--     Planned hours stay 0, so planned-side rollup contributes nothing.
--   UI renders unplanned staff rows with a rose left-border + UNPLANNED badge,
--     matching the pattern used for unplanned line items and schedule days.

ALTER TABLE schedule_entries
  ADD COLUMN IF NOT EXISTS is_unplanned BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN schedule_entries.is_unplanned IS
  'TRUE if this staff row was added during recap mode (not part of the original staff plan). Default FALSE.';
