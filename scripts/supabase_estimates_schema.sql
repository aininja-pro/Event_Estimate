-- =============================================================================
-- DriveShop Event Estimate Engine — Estimate Builder Schema
-- =============================================================================
-- Run this SQL in the Supabase SQL Editor to create the Estimate Builder
-- tables. This builds on the existing Rate Card schema (clients, rate_card_sections,
-- rate_card_items) and the update_updated_at() trigger function.
--
-- Tables:
--   1. estimates            — Main estimate entity (one per event)
--   2. labor_logs           — One per location within an estimate
--   3. labor_entries        — Individual role rows within a labor log
--   4. estimate_line_items  — Non-labor line items (production, travel, etc.)
-- =============================================================================

-- Estimates table (the main entity)
CREATE TABLE estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id),
  event_name TEXT NOT NULL,
  event_type TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  expected_attendance INTEGER,
  po_number TEXT,
  project_id TEXT,
  cost_structure TEXT DEFAULT 'corporate' CHECK (cost_structure IN ('corporate', 'office')),
  project_notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('pipeline', 'draft', 'review', 'approved', 'active', 'recap', 'complete')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Labor logs (one per location within an estimate)
CREATE TABLE labor_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  location_order INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Labor entries (individual role rows within a labor log)
CREATE TABLE labor_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  rate_card_item_id UUID REFERENCES rate_card_items(id),
  role_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  days INTEGER NOT NULL DEFAULT 1,
  unit_rate DECIMAL(10,2) NOT NULL,
  cost_rate DECIMAL(10,2),
  override_rate DECIMAL(10,2),
  override_reason TEXT,
  has_overtime BOOLEAN DEFAULT false,
  overtime_rate DECIMAL(10,2),
  overtime_hours DECIMAL(5,1),
  gl_code TEXT,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Estimate line items (for non-labor sections: production, travel, creative, etc.)
CREATE TABLE estimate_line_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  rate_card_item_id UUID REFERENCES rate_card_items(id),
  item_name TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  markup_pct DECIMAL(5,2) DEFAULT 0,
  gl_code TEXT,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_estimates_client ON estimates(client_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_labor_logs_estimate ON labor_logs(estimate_id);
CREATE INDEX idx_labor_entries_log ON labor_entries(labor_log_id);
CREATE INDEX idx_estimate_line_items_estimate ON estimate_line_items(estimate_id);
CREATE INDEX idx_estimate_line_items_section ON estimate_line_items(section);

-- Updated_at triggers (reuses update_updated_at() from rate card schema)
CREATE TRIGGER estimates_updated_at BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER labor_logs_updated_at BEFORE UPDATE ON labor_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER labor_entries_updated_at BEFORE UPDATE ON labor_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER estimate_line_items_updated_at BEFORE UPDATE ON estimate_line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (permissive for now — no auth yet)
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to estimates" ON estimates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to labor_logs" ON labor_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to labor_entries" ON labor_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to estimate_line_items" ON estimate_line_items FOR ALL USING (true) WITH CHECK (true);
