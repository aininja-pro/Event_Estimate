-- Migration: Change expected_attendance from INTEGER to TEXT
-- Reason: The UI stores attendance as range strings ("1–25", "50–100", etc.)
-- but the column was defined as INTEGER, causing silent save failures.

ALTER TABLE estimates
  ALTER COLUMN expected_attendance TYPE TEXT
  USING expected_attendance::TEXT;
