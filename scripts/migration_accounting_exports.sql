-- Migration: Accounting export audit records
-- Records each generated AP Bill Upload or AR Invoice Upload CSV.

CREATE TABLE IF NOT EXISTS accounting_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  accounting_review_id UUID REFERENCES accounting_reviews(id) ON DELETE SET NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('ap_bill', 'ar_invoice')),
  file_name TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  generated_by UUID REFERENCES profiles(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checksum TEXT,
  warnings JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounting_exports_labor_log ON accounting_exports(labor_log_id);
CREATE INDEX IF NOT EXISTS idx_accounting_exports_estimate ON accounting_exports(estimate_id);
CREATE INDEX IF NOT EXISTS idx_accounting_exports_export_type ON accounting_exports(export_type);
CREATE INDEX IF NOT EXISTS idx_accounting_exports_generated_at ON accounting_exports(generated_at);

ALTER TABLE accounting_exports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to accounting_exports" ON accounting_exports;
CREATE POLICY "Allow all access to accounting_exports"
  ON accounting_exports FOR ALL
  USING (true) WITH CHECK (true);
