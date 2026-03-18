BEGIN;

-- Add segment-level and phase columns to approval_requests
ALTER TABLE approval_requests
  ADD COLUMN IF NOT EXISTS labor_log_id UUID REFERENCES labor_logs(id),
  ADD COLUMN IF NOT EXISTS approval_phase TEXT DEFAULT 'internal'
    CHECK (approval_phase IN ('internal', 'client')),
  ADD COLUMN IF NOT EXISTS approval_role TEXT;

-- Index for fast per-segment lookups
CREATE INDEX IF NOT EXISTS idx_approval_requests_labor_log
  ON approval_requests(labor_log_id) WHERE labor_log_id IS NOT NULL;

COMMIT;
