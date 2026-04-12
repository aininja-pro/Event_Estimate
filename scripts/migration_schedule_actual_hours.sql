-- Migration: add actual_hours to schedule_day_entries
-- Purpose: capture day-level actual hours during recap mode for the schedule grid.
-- Context: planning/requirements-driveshop-schedule-recap.md, Step 1.
--
-- Design notes:
--   NULL = no actual recorded yet. Pre-filled to equal `hours` on active -> recap transition.
--   Estimate-phase writes (upsertScheduleDayEntry) touch only `hours` and leave this column alone.
--   Edit rules already enforce phase separation: schedule_hours is locked in recap,
--   actuals is locked outside recap, so there is no risk of cross-phase writes.

ALTER TABLE schedule_day_entries
  ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(4,1);

COMMENT ON COLUMN schedule_day_entries.actual_hours IS
  'Actual hours worked this day. NULL until recap pre-fill. Editable only when labor_log is in recap status.';
