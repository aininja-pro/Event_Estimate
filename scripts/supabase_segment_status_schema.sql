-- ============================================
-- DriveShop Event Estimate Engine — Segment Status Schema
-- ============================================
-- Run this AFTER supabase_workflow_schema.sql.
-- Expands labor_logs.status CHECK constraint (4 → 7 statuses),
-- adds segment_activities and recap_actuals tables.
-- ============================================

-- ============================================
-- EXPAND labor_logs.status CHECK CONSTRAINT
-- ============================================
-- The existing constraint allows: draft, active, recap, invoiced
-- We need to add: review, approved, complete
-- Drop the old constraint and re-create with all 7 statuses.
-- Existing 'draft' values remain valid — fully backwards-compatible.

ALTER TABLE labor_logs DROP CONSTRAINT IF EXISTS labor_logs_status_check;
ALTER TABLE labor_logs ADD CONSTRAINT labor_logs_status_check
  CHECK (status IN ('draft', 'review', 'approved', 'active', 'recap', 'invoiced', 'complete'));

-- ============================================
-- SEGMENT ACTIVITIES (per-segment action log)
-- ============================================
-- Tracks segment-specific actions separately from estimate-level
-- version history (estimate_versions table).
CREATE TABLE IF NOT EXISTS segment_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  action TEXT NOT NULL,  -- 'status_change', 'name_assigned', 'actuals_entered', 'note_added'
  from_status TEXT,
  to_status TEXT,
  changed_by TEXT DEFAULT 'Current User',
  comment TEXT,
  metadata JSONB,  -- flexible storage for action-specific data
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RECAP ACTUALS (actual vs estimated tracking)
-- ============================================
-- One row per labor entry, schedule entry, or line item.
-- Stores actual values alongside estimates for variance reporting.
-- Preserves original estimate numbers — variance = estimated - actual.
CREATE TABLE IF NOT EXISTS recap_actuals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,

  -- Reference to what this actual is for (one of these will be set)
  labor_entry_id UUID REFERENCES labor_entries(id) ON DELETE CASCADE,
  schedule_entry_id UUID REFERENCES schedule_entries(id) ON DELETE CASCADE,
  line_item_id UUID REFERENCES estimate_line_items(id) ON DELETE CASCADE,

  -- Actual values
  actual_quantity DECIMAL(10,2),
  actual_days DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  actual_unit_cost DECIMAL(10,2),
  actual_total DECIMAL(10,2),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_segment_activities_labor_log ON segment_activities(labor_log_id);
CREATE INDEX IF NOT EXISTS idx_segment_activities_estimate ON segment_activities(estimate_id);
CREATE INDEX IF NOT EXISTS idx_recap_actuals_labor_log ON recap_actuals(labor_log_id);
CREATE INDEX IF NOT EXISTS idx_recap_actuals_estimate ON recap_actuals(estimate_id);

-- ============================================
-- TRIGGERS
-- ============================================
-- update_updated_at() function already exists from prior schema migrations
CREATE TRIGGER recap_actuals_updated_at BEFORE UPDATE ON recap_actuals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS (permissive for now — tighten in auth sprint)
-- ============================================
ALTER TABLE segment_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recap_actuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to segment_activities" ON segment_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to recap_actuals" ON recap_actuals FOR ALL USING (true) WITH CHECK (true);
