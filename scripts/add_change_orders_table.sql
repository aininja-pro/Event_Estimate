-- Migration: Change Orders table
-- Part of Change Orders sprint (Outputs Phase 2)

-- Change orders: formal scope change tracking per segment
CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  co_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  baseline_version_id UUID REFERENCES estimate_versions(id),
  revised_version_id UUID REFERENCES estimate_versions(id),
  delta_summary JSONB DEFAULT '{}',
  baseline_total NUMERIC,
  revised_total NUMERIC,
  delta_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  UNIQUE(estimate_id, labor_log_id, co_number)
);

CREATE INDEX IF NOT EXISTS idx_change_orders_estimate ON change_orders(estimate_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_labor_log ON change_orders(labor_log_id);

ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage change orders"
  ON change_orders FOR ALL
  USING (true) WITH CHECK (true);
