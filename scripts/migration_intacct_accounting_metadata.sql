BEGIN;

-- Client-level Sage Intacct defaults for AR invoice readiness.
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS intacct_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS default_payment_terms TEXT,
  ADD COLUMN IF NOT EXISTS default_department_id TEXT,
  ADD COLUMN IF NOT EXISTS default_location_id TEXT,
  ADD COLUMN IF NOT EXISTS default_currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS default_exchange_rate_type TEXT NOT NULL DEFAULT 'Intacct Daily Rate';

-- Canonical fee type accounting mappings. Existing gl_code remains available
-- as the legacy/canonical GL fallback; the Intacct fields make export intent explicit.
ALTER TABLE fee_types
  ADD COLUMN IF NOT EXISTS intacct_ar_item_id TEXT,
  ADD COLUMN IF NOT EXISTS intacct_ap_gl_account_no TEXT,
  ADD COLUMN IF NOT EXISTS default_unit TEXT NOT NULL DEFAULT 'Each',
  ADD COLUMN IF NOT EXISTS accounting_memo TEXT;

-- Client-specific rate-card overrides for accounting mappings.
ALTER TABLE rate_card_items
  ADD COLUMN IF NOT EXISTS intacct_ar_item_id TEXT,
  ADD COLUMN IF NOT EXISTS intacct_ap_gl_account_no TEXT,
  ADD COLUMN IF NOT EXISTS default_unit TEXT,
  ADD COLUMN IF NOT EXISTS accounting_memo TEXT;

CREATE TABLE IF NOT EXISTS office_accounting_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_name TEXT NOT NULL UNIQUE,
  legal_name TEXT,
  intacct_vendor_id TEXT,
  default_payment_terms TEXT,
  default_department_id TEXT,
  default_location_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revenue_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Estimate-level accounting overrides and required event tax/accounting data.
ALTER TABLE estimates
  ADD COLUMN IF NOT EXISTS revenue_segment_id UUID REFERENCES revenue_segments(id),
  ADD COLUMN IF NOT EXISTS event_city TEXT,
  ADD COLUMN IF NOT EXISTS event_state TEXT,
  ADD COLUMN IF NOT EXISTS intacct_project_id TEXT,
  ADD COLUMN IF NOT EXISTS accounting_department_id TEXT,
  ADD COLUMN IF NOT EXISTS accounting_location_id TEXT,
  ADD COLUMN IF NOT EXISTS accounting_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS accounting_payment_terms TEXT,
  ADD COLUMN IF NOT EXISTS office_accounting_profile_id UUID REFERENCES office_accounting_profiles(id);

CREATE INDEX IF NOT EXISTS idx_clients_intacct_customer_id ON clients(intacct_customer_id);
CREATE INDEX IF NOT EXISTS idx_fee_types_intacct_ar_item_id ON fee_types(intacct_ar_item_id);
CREATE INDEX IF NOT EXISTS idx_rate_card_items_intacct_ar_item_id ON rate_card_items(intacct_ar_item_id);
CREATE INDEX IF NOT EXISTS idx_estimates_revenue_segment_id ON estimates(revenue_segment_id);
CREATE INDEX IF NOT EXISTS idx_estimates_office_accounting_profile_id ON estimates(office_accounting_profile_id);

DROP TRIGGER IF EXISTS office_accounting_profiles_updated_at ON office_accounting_profiles;
CREATE TRIGGER office_accounting_profiles_updated_at BEFORE UPDATE ON office_accounting_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS revenue_segments_updated_at ON revenue_segments;
CREATE TRIGGER revenue_segments_updated_at BEFORE UPDATE ON revenue_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE office_accounting_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_segments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to office_accounting_profiles" ON office_accounting_profiles;
CREATE POLICY "Allow all access to office_accounting_profiles"
  ON office_accounting_profiles FOR ALL
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to revenue_segments" ON revenue_segments;
CREATE POLICY "Allow all access to revenue_segments"
  ON revenue_segments FOR ALL
  USING (true) WITH CHECK (true);

COMMIT;
