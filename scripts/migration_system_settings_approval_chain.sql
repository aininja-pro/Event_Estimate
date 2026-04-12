-- Migration: System settings table + approval_gate column
-- Run against Supabase SQL Editor

-- 1. system_settings table for configurable threshold
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

INSERT INTO system_settings (key, value) VALUES
  ('approval_threshold', '{"amount": 50000, "currency": "USD"}')
ON CONFLICT (key) DO NOTHING;

-- 2. approval_gate column to distinguish AM / executive / client gates
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS approval_gate TEXT DEFAULT 'am';

-- Backfill existing rows
UPDATE approval_requests SET approval_gate = 'am' WHERE approval_phase = 'internal' AND approval_gate IS NULL;
UPDATE approval_requests SET approval_gate = 'client' WHERE approval_phase = 'client' AND approval_gate IS NULL;

-- 3. RLS for system_settings (admin read/write, all authenticated read)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_settings_read" ON system_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "system_settings_write" ON system_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
