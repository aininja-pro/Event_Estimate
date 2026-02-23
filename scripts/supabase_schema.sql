-- =============================================================================
-- DriveShop Event Estimate Engine — Phase 2 Database Schema
-- =============================================================================
-- Run this SQL in the Supabase SQL Editor to create the Rate Card Management
-- tables. This is the foundation for the Phase 2 production system.
--
-- Tables:
--   1. clients             — OEM clients with markup rules
--   2. rate_card_sections   — 6 standard section groupings (seeded)
--   3. rate_card_items      — Individual rate line items per client/section
-- =============================================================================

-- Clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,  -- short code like 'LUCID', 'VW', 'MAZDA'
  third_party_markup DECIMAL(5,4) DEFAULT 0,  -- e.g., 0.015 for 1.5%
  agency_fee DECIMAL(5,4) DEFAULT 0,  -- e.g., 0.10 for 10%
  agency_fee_basis TEXT DEFAULT 'total_event_bid',  -- what the agency fee applies to
  trucking_markup DECIMAL(5,4) DEFAULT 0,  -- e.g., 0.20 for 20% (Volvo)
  office_payout_pct DECIMAL(5,4) DEFAULT 0.75,  -- office gets 75% of revenue (80% for VW)
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rate card sections (standard groupings)
CREATE TABLE rate_card_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('labor', 'flat_fee', 'pass_through')),
  description TEXT
);

-- Seed the standard sections
INSERT INTO rate_card_sections (name, display_order, cost_type) VALUES
  ('Planning & Administration Labor', 1, 'labor'),
  ('Onsite Event Labor', 2, 'labor'),
  ('Travel Expenses', 3, 'pass_through'),
  ('Creative Costs', 4, 'labor'),
  ('Production Expenses', 5, 'pass_through'),
  ('Logistics Expenses', 6, 'flat_fee');

-- Rate card items (the actual rates per client)
CREATE TABLE rate_card_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES rate_card_sections(id),
  name TEXT NOT NULL,
  unit_rate DECIMAL(10,2),  -- dollar amount (NULL for pass-through items with no fixed rate)
  unit_label TEXT,  -- e.g., '/10 hr day', '/hr', '/vehicle/prep', '/day', '/event'
  gl_code TEXT,  -- e.g., '4000.26', '4025.12'
  is_from_msa BOOLEAN DEFAULT true,  -- false = added by account manager for project scope
  is_pass_through BOOLEAN DEFAULT false,  -- true = receipt-based, subject to client markup
  has_overtime_rate BOOLEAN DEFAULT false,
  overtime_rate DECIMAL(10,2),  -- hourly OT rate if applicable
  overtime_unit_label TEXT DEFAULT '/hr >10hrs',
  overtime_gl_code TEXT,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT  -- who added this rate (for non-MSA tracking)
);

-- Index for common queries
CREATE INDEX idx_rate_card_items_client ON rate_card_items(client_id);
CREATE INDEX idx_rate_card_items_section ON rate_card_items(section_id);
CREATE INDEX idx_rate_card_items_gl ON rate_card_items(gl_code);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER rate_card_items_updated_at BEFORE UPDATE ON rate_card_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS but keep it permissive for now (no auth yet)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_card_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_card_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to rate_card_sections" ON rate_card_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to rate_card_items" ON rate_card_items FOR ALL USING (true) WITH CHECK (true);
