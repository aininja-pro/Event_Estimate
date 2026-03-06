-- =============================================================================
-- DriveShop Event Estimate Engine — Schedule Tab Schema
-- =============================================================================
-- Run this SQL in the Supabase SQL Editor to create the Schedule (Staffing Grid)
-- tables. This builds on the existing Estimate Builder schema (labor_logs,
-- rate_card_items) and the update_updated_at() trigger function.
--
-- Tables:
--   1. schedule_entries      — Grid rows (one per person in the staffing grid)
--   2. schedule_day_entries  — Grid cells (one per person × date)
--   3. schedule_day_types    — Column headers (one per date per segment)
-- =============================================================================

-- Schedule entries: one row per person in the staffing grid
CREATE TABLE schedule_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,

  -- Role info (snapshotted from rate card at creation time)
  rate_card_item_id UUID REFERENCES rate_card_items(id),
  role_name TEXT NOT NULL,
  person_name TEXT,  -- nullable during estimate, filled in during recap

  -- Grid position
  row_index INTEGER NOT NULL DEFAULT 0,  -- for ordering rows in the grid
  staff_group_id UUID,  -- groups rows of the same role together

  -- Per-person travel/expense flags
  needs_airfare BOOLEAN DEFAULT true,
  needs_hotel BOOLEAN DEFAULT true,
  needs_per_diem BOOLEAN DEFAULT true,

  -- Rate snapshot (copied from rate card at creation)
  day_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  ot_hourly_rate DECIMAL(10,2) GENERATED ALWAYS AS (day_rate / 10) STORED,
  ot_cost_rate DECIMAL(10,2) GENERATED ALWAYS AS (cost_rate / 10) STORED,

  -- Metadata
  gl_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Schedule day entries: one row per cell in the grid (person × date)
CREATE TABLE schedule_day_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_entry_id UUID NOT NULL REFERENCES schedule_entries(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  hours DECIMAL(4,1) NOT NULL DEFAULT 10,  -- 10 = standard day
  per_diem_override BOOLEAN,  -- null = use parent default, true/false = explicit override

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One cell per person per date
  UNIQUE(schedule_entry_id, work_date)
);

-- Day type definitions per date per labor log (column-level, not cell-level)
CREATE TABLE schedule_day_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  day_type TEXT NOT NULL DEFAULT 'event' CHECK (day_type IN ('event', 'setup', 'training', 'travel', 'off')),
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One day type per date per labor log
  UNIQUE(labor_log_id, work_date)
);

-- Indexes
CREATE INDEX idx_schedule_entries_labor_log ON schedule_entries(labor_log_id);
CREATE INDEX idx_schedule_entries_group ON schedule_entries(staff_group_id);
CREATE INDEX idx_schedule_day_entries_entry ON schedule_day_entries(schedule_entry_id);
CREATE INDEX idx_schedule_day_entries_date ON schedule_day_entries(work_date);
CREATE INDEX idx_schedule_day_types_labor_log ON schedule_day_types(labor_log_id);

-- Updated_at triggers (reuses update_updated_at() from rate card schema)
CREATE TRIGGER schedule_entries_updated_at BEFORE UPDATE ON schedule_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER schedule_day_entries_updated_at BEFORE UPDATE ON schedule_day_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER schedule_day_types_updated_at BEFORE UPDATE ON schedule_day_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (permissive for now — no auth yet)
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_day_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_day_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to schedule_entries" ON schedule_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to schedule_day_entries" ON schedule_day_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to schedule_day_types" ON schedule_day_types FOR ALL USING (true) WITH CHECK (true);
