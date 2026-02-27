-- Migration: Add labor_log_id FK to estimate_line_items
-- This makes line items per-location (tied to a labor_log) instead of estimate-level.
-- Run this in the Supabase SQL Editor.

-- Step 1: Add nullable column
ALTER TABLE estimate_line_items
  ADD COLUMN labor_log_id UUID REFERENCES labor_logs(id) ON DELETE CASCADE;

-- Step 2: Backfill existing rows to their estimate's primary labor_log
UPDATE estimate_line_items eli
SET labor_log_id = (
  SELECT ll.id
  FROM labor_logs ll
  WHERE ll.estimate_id = eli.estimate_id
    AND ll.is_primary = true
  LIMIT 1
)
WHERE eli.labor_log_id IS NULL;

-- Step 3: Set NOT NULL now that all rows are backfilled
ALTER TABLE estimate_line_items
  ALTER COLUMN labor_log_id SET NOT NULL;

-- Step 4: Add index for fast per-location queries
CREATE INDEX idx_estimate_line_items_labor_log_id
  ON estimate_line_items(labor_log_id);
