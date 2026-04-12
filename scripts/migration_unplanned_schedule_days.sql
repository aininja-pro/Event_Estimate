-- Migration: add is_unplanned flag to schedule_day_types
-- Purpose: mark schedule date columns that were added during recap mode (not
-- part of the originally approved schedule).
-- Context: planning/requirements-driveshop-recap-additions.md, Step 4.
--
-- Design notes:
--   FALSE (default) = planned day from the original schedule (segment dates).
--   TRUE = added during recap (e.g., "event ran an extra day due to storm").
--     Schedule grid header renders unplanned columns with a rose tint + badge.
--     Actual hours entered on these days flow into the actual-side rollup.
--     Planned-side rollup already filters `hours > 0` (see computeScheduleRollup)
--     so unplanned days with hours=0 never inflate planned totals.
--   Explicit flag chosen over inference (e.g., detecting hours=0 everywhere) so
--     that a day with genuinely zero planned hours isn't miscategorized.

ALTER TABLE schedule_day_types
  ADD COLUMN IF NOT EXISTS is_unplanned BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN schedule_day_types.is_unplanned IS
  'TRUE if this day was added during recap mode (not part of the original schedule). Default FALSE.';
