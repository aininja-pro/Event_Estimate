BEGIN;

-- Add the Accounting role used for internal recap review/export readiness.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'profiles'::regclass
      AND con.contype = 'c'
      AND att.attname = 'role'
  LOOP
    EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'cfo', 'operations', 'production_manager', 'account_manager', 'accounting'));

-- Expand status constraints for the Office Event accounting review gate.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'labor_logs'::regclass
      AND con.contype = 'c'
      AND att.attname = 'status'
  LOOP
    EXECUTE format('ALTER TABLE labor_logs DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

UPDATE labor_logs SET status = 'estimate' WHERE status = 'draft';
UPDATE labor_logs SET status = 'in_review' WHERE status = 'review';
UPDATE labor_logs SET status = 'active' WHERE status = 'approved';
UPDATE labor_logs SET status = 'invoiced' WHERE status = 'complete';

ALTER TABLE labor_logs ADD CONSTRAINT labor_logs_status_check
  CHECK (status IN ('pipeline', 'estimate', 'in_review', 'active', 'recap', 'accounting_review', 'export_ready', 'invoiced', 'lost', 'cancelled'));

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'estimates'::regclass
      AND con.contype = 'c'
      AND att.attname = 'status'
  LOOP
    EXECUTE format('ALTER TABLE estimates DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

UPDATE estimates SET status = 'estimate' WHERE status = 'draft';
UPDATE estimates SET status = 'in_review' WHERE status = 'review';
UPDATE estimates SET status = 'active' WHERE status = 'approved';
UPDATE estimates SET status = 'invoiced' WHERE status = 'complete';

ALTER TABLE estimates ADD CONSTRAINT estimates_status_check
  CHECK (status IN ('pipeline', 'estimate', 'in_review', 'active', 'recap', 'accounting_review', 'export_ready', 'invoiced', 'lost', 'cancelled', 'archived'));

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'estimate_versions'::regclass
      AND con.contype = 'c'
      AND att.attname = 'status_at_version'
  LOOP
    EXECUTE format('ALTER TABLE estimate_versions DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

UPDATE estimate_versions SET status_at_version = 'estimate' WHERE status_at_version = 'draft';
UPDATE estimate_versions SET status_at_version = 'in_review' WHERE status_at_version = 'review';
UPDATE estimate_versions SET status_at_version = 'active' WHERE status_at_version = 'approved';
UPDATE estimate_versions SET status_at_version = 'invoiced' WHERE status_at_version = 'complete';

-- estimate_versions.status_at_version may not have had a constraint in older installs.
ALTER TABLE estimate_versions ADD CONSTRAINT estimate_versions_status_at_version_check
  CHECK (status_at_version IN ('pipeline', 'estimate', 'in_review', 'active', 'recap', 'accounting_review', 'export_ready', 'invoiced', 'lost', 'cancelled', 'archived', 'rollback'));

CREATE TABLE IF NOT EXISTS accounting_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'corrections_requested', 'superseded')),
  submitted_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  correction_notes TEXT,
  review_notes TEXT,
  submitted_version_id UUID REFERENCES estimate_versions(id),
  approved_version_id UUID REFERENCES estimate_versions(id),
  recap_revision TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounting_reviews_estimate ON accounting_reviews(estimate_id);
CREATE INDEX IF NOT EXISTS idx_accounting_reviews_labor_log ON accounting_reviews(labor_log_id);
CREATE INDEX IF NOT EXISTS idx_accounting_reviews_status ON accounting_reviews(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounting_reviews_one_pending
  ON accounting_reviews(labor_log_id)
  WHERE status = 'pending';

DROP TRIGGER IF EXISTS accounting_reviews_updated_at ON accounting_reviews;
CREATE TRIGGER accounting_reviews_updated_at BEFORE UPDATE ON accounting_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE accounting_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to accounting_reviews" ON accounting_reviews;
CREATE POLICY "Allow all access to accounting_reviews"
  ON accounting_reviews FOR ALL
  USING (true) WITH CHECK (true);

COMMIT;
