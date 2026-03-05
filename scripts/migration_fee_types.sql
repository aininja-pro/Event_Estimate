-- =============================================================================
-- Migration: Create fee_types master table
-- =============================================================================
-- Centralizes GL codes and fee type metadata. Dave's feedback: "Hotels is
-- always the same GL code regardless of client." Lucid tab is source of truth.
--
-- Run AFTER supabase_schema.sql. Safe to re-run (uses IF NOT EXISTS).
-- =============================================================================

-- 1. Create the fee_types master table
CREATE TABLE IF NOT EXISTS fee_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  gl_code TEXT,                    -- canonical GL code (Lucid tab = source of truth)
  cost_type TEXT NOT NULL CHECK (cost_type IN ('labor', 'flat_fee', 'pass_through')),
  unit_label TEXT,                 -- default unit (e.g., "/ hr", "/day")
  section TEXT NOT NULL CHECK (section IN (
    'planning_admin', 'onsite_labor', 'travel',
    'creative', 'production', 'logistics'
  )),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fee_types_section ON fee_types(section);
CREATE INDEX IF NOT EXISTS idx_fee_types_gl_code ON fee_types(gl_code);

-- Trigger for updated_at (reuses existing function from supabase_schema.sql)
CREATE TRIGGER update_fee_types_updated_at
  BEFORE UPDATE ON fee_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (permissive until auth is implemented, consistent with other tables)
ALTER TABLE fee_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to fee_types" ON fee_types
  FOR ALL USING (true) WITH CHECK (true);

-- 2. Add fee_type_id FK to rate_card_items (nullable for now)
ALTER TABLE rate_card_items
  ADD COLUMN IF NOT EXISTS fee_type_id UUID REFERENCES fee_types(id);

CREATE INDEX IF NOT EXISTS idx_rate_card_items_fee_type_id
  ON rate_card_items(fee_type_id);
