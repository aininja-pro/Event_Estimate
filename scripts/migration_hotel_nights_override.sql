-- Migration: Add hotel_nights override to schedule_entries
-- NULL = auto-compute from days worked. Set to an integer to override.

ALTER TABLE schedule_entries
  ADD COLUMN IF NOT EXISTS hotel_nights INTEGER;
