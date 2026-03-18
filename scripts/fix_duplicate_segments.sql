-- Fix duplicate segments created by rollback
-- For each (estimate_id, location_name) pair with duplicates, keeps the OLDEST row and deletes the rest

BEGIN;

-- Find the duplicate labor_log IDs to delete (newer copies)
WITH dupes AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY estimate_id, location_name ORDER BY created_at ASC) AS rn
  FROM labor_logs
)
, to_delete AS (
  SELECT id FROM dupes WHERE rn > 1
)

-- Preview what will be deleted (comment out the DELETEs below and run this first)
-- SELECT ll.id, ll.location_name, ll.status, ll.created_at
-- FROM labor_logs ll JOIN to_delete td ON ll.id = td.id;

-- Clean up all child tables then delete the duplicate labor_logs
, del_approvals AS (
  DELETE FROM approval_requests WHERE labor_log_id IN (SELECT id FROM to_delete)
)
, del_activities AS (
  DELETE FROM segment_activities WHERE labor_log_id IN (SELECT id FROM to_delete)
)
, del_recaps AS (
  DELETE FROM recap_actuals WHERE labor_log_id IN (SELECT id FROM to_delete)
)
, del_sde AS (
  DELETE FROM schedule_day_entries WHERE schedule_entry_id IN (
    SELECT id FROM schedule_entries WHERE labor_log_id IN (SELECT id FROM to_delete)
  )
)
, del_sdt AS (
  DELETE FROM schedule_day_types WHERE labor_log_id IN (SELECT id FROM to_delete)
)
, del_se AS (
  DELETE FROM schedule_entries WHERE labor_log_id IN (SELECT id FROM to_delete)
)
, del_le AS (
  DELETE FROM labor_entries WHERE labor_log_id IN (SELECT id FROM to_delete)
)
, del_li AS (
  DELETE FROM estimate_line_items WHERE labor_log_id IN (SELECT id FROM to_delete)
)
DELETE FROM labor_logs WHERE id IN (SELECT id FROM to_delete);

COMMIT;
