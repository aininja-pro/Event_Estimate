-- ============================================
-- DriveShop Event Estimate Engine — Workflow Schema
-- ============================================
-- Run this AFTER the existing estimates schema is in place.
-- Adds: estimate_versions, approval_requests, status_transitions
-- Alters: labor_logs (adds segment status)
-- ============================================

-- ============================================
-- ESTIMATE VERSIONS (full snapshot at each save)
-- ============================================
CREATE TABLE estimate_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot_json JSONB NOT NULL,  -- full estimate state: labor_logs, labor_entries, line_items, totals
  status_at_version TEXT NOT NULL,  -- what status the estimate was in when this version was created
  change_summary TEXT,  -- human-readable: "Added 2 labor entries to LA segment", "Changed status to Review"
  changed_by TEXT NOT NULL,  -- user who triggered the save
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estimate_id, version_number)
);

-- ============================================
-- APPROVAL REQUESTS
-- ============================================
CREATE TABLE approval_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES estimate_versions(id),
  requested_by TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT now(),
  reviewer TEXT,  -- assigned reviewer (NULL = unassigned, routed by rules)
  reviewed_by TEXT,  -- who actually reviewed
  reviewed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'recalled')),
  threshold_triggered TEXT,  -- e.g., '$50K+ executive review', 'standard AM review'
  notes TEXT,  -- reviewer comments (especially on rejection)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STATUS TRANSITIONS (audit log)
-- ============================================
CREATE TABLE status_transitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  transitioned_by TEXT NOT NULL,
  reason TEXT,  -- required for rejections and rollbacks
  version_id UUID REFERENCES estimate_versions(id),  -- version at time of transition
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SEGMENT STATUS (per-segment tracking per Dave's request)
-- ============================================
-- Add status column to labor_logs table
ALTER TABLE labor_logs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
  CHECK (status IN ('draft', 'active', 'recap', 'invoiced'));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_versions_estimate ON estimate_versions(estimate_id);
CREATE INDEX idx_versions_estimate_number ON estimate_versions(estimate_id, version_number);
CREATE INDEX idx_approvals_estimate ON approval_requests(estimate_id);
CREATE INDEX idx_approvals_status ON approval_requests(status);
CREATE INDEX idx_transitions_estimate ON status_transitions(estimate_id);
CREATE INDEX idx_labor_logs_status ON labor_logs(status);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER approval_requests_updated_at BEFORE UPDATE ON approval_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS (permissive for now — tighten in auth sprint)
-- ============================================
ALTER TABLE estimate_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to estimate_versions" ON estimate_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to approval_requests" ON approval_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to status_transitions" ON status_transitions FOR ALL USING (true) WITH CHECK (true);
