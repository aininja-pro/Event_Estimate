-- Fix: Update labor_logs.status default from old 'draft' to new 'estimate'
-- The workflow refinement migration renamed draft→estimate but did not update the column default.
-- This caused INSERT without explicit status to fail the CHECK constraint.

ALTER TABLE labor_logs ALTER COLUMN status SET DEFAULT 'estimate';

-- Also fix estimates.status default if it has the same issue
ALTER TABLE estimates ALTER COLUMN status SET DEFAULT 'estimate';
