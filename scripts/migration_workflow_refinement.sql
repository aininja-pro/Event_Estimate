BEGIN;

-- 0. Drop CHECK constraints that restrict status values to old names
--    (Supabase auto-names these; find and drop them dynamically)

-- labor_logs.status check constraint
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

-- estimates.status check constraint
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

-- estimate_versions.status_at_version check constraint
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

-- status_transitions from_status / to_status check constraints
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'status_transitions'::regclass
      AND con.contype = 'c'
      AND att.attname IN ('from_status', 'to_status')
  LOOP
    EXECUTE format('ALTER TABLE status_transitions DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- 1. labor_logs (segment-level status)
UPDATE labor_logs SET status = 'estimate' WHERE status = 'draft';
UPDATE labor_logs SET status = 'in_review' WHERE status = 'review';
UPDATE labor_logs SET status = 'active' WHERE status = 'approved';
UPDATE labor_logs SET status = 'invoiced' WHERE status = 'complete';

-- 2. estimates (computed estimate-level status)
UPDATE estimates SET status = 'estimate' WHERE status = 'draft';
UPDATE estimates SET status = 'in_review' WHERE status = 'review';
UPDATE estimates SET status = 'active' WHERE status = 'approved';
UPDATE estimates SET status = 'invoiced' WHERE status = 'complete';

-- 3. estimate_versions.status_at_version (NOT snapshot_json -- that's historical)
UPDATE estimate_versions SET status_at_version = 'estimate' WHERE status_at_version = 'draft';
UPDATE estimate_versions SET status_at_version = 'in_review' WHERE status_at_version = 'review';
UPDATE estimate_versions SET status_at_version = 'active' WHERE status_at_version = 'approved';
UPDATE estimate_versions SET status_at_version = 'invoiced' WHERE status_at_version = 'complete';

-- 4. status_transitions audit log
UPDATE status_transitions SET from_status = 'estimate' WHERE from_status = 'draft';
UPDATE status_transitions SET from_status = 'in_review' WHERE from_status = 'review';
UPDATE status_transitions SET from_status = 'active' WHERE from_status = 'approved';
UPDATE status_transitions SET from_status = 'invoiced' WHERE from_status = 'complete';
UPDATE status_transitions SET to_status = 'estimate' WHERE to_status = 'draft';
UPDATE status_transitions SET to_status = 'in_review' WHERE to_status = 'review';
UPDATE status_transitions SET to_status = 'active' WHERE to_status = 'approved';
UPDATE status_transitions SET to_status = 'invoiced' WHERE to_status = 'complete';

-- 5. Re-add CHECK constraints with new allowed values
ALTER TABLE labor_logs ADD CONSTRAINT labor_logs_status_check
  CHECK (status IN ('pipeline', 'estimate', 'in_review', 'active', 'recap', 'invoiced', 'lost', 'cancelled'));

ALTER TABLE estimates ADD CONSTRAINT estimates_status_check
  CHECK (status IN ('pipeline', 'estimate', 'in_review', 'active', 'recap', 'invoiced', 'lost', 'cancelled', 'archived'));

-- 6. Verify
SELECT 'labor_logs' AS tbl, status, COUNT(*) FROM labor_logs GROUP BY status ORDER BY status;
SELECT 'estimates' AS tbl, status, COUNT(*) FROM estimates GROUP BY status ORDER BY status;

COMMIT;
