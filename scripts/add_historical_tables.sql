-- ============================================
-- Historical Events Table
-- ============================================
CREATE TABLE IF NOT EXISTS historical_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL UNIQUE,
  client TEXT,
  event_name TEXT,
  event_type TEXT CHECK (event_type IN (
    'Ride & Drive', 'Static Display', 'Press Event', 'Chauffeur',
    'Auto Show', 'Tour', 'Fleet', 'Other'
  )),
  event_manager TEXT,
  lead_office TEXT,
  status TEXT,
  revenue_segment TEXT,
  location TEXT,
  initial_estimate_amount NUMERIC,
  final_invoice_amount NUMERIC,
  grand_total NUMERIC,
  bid_total NUMERIC,
  recap_total NUMERIC,
  has_recap_data BOOLEAN DEFAULT FALSE,
  template_format TEXT,
  financials JSONB DEFAULT '{}',
  sections JSONB DEFAULT '[]',
  labor_roles JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_historical_events_client ON historical_events(client);
CREATE INDEX idx_historical_events_event_type ON historical_events(event_type);
CREATE INDEX idx_historical_events_client_type ON historical_events(client, event_type);

ALTER TABLE historical_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Historical events are readable by all authenticated users"
  ON historical_events FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- Historical Patterns Table
-- ============================================
CREATE TABLE IF NOT EXISTS historical_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'Ride & Drive', 'Static Display', 'Press Event', 'Chauffeur',
    'Auto Show', 'Tour', 'Fleet', 'Other'
  )),
  event_count INTEGER NOT NULL DEFAULT 0,
  avg_total_revenue NUMERIC,
  avg_grand_total NUMERIC,
  avg_gp_percent NUMERIC,
  avg_staff_count NUMERIC,
  avg_duration_days NUMERIC,
  section_averages JSONB DEFAULT '{}',
  section_variance JSONB DEFAULT '{}',
  common_roles JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client, event_type)
);

ALTER TABLE historical_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Historical patterns are readable by all authenticated users"
  ON historical_patterns FOR SELECT
  USING (auth.role() = 'authenticated');
