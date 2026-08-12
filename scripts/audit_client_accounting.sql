-- =============================================================================
-- Sprint 022 — Client Accounting Identity + VW Merge
-- STAGE A: READ-ONLY AUDIT. This file writes NOTHING.
--
-- There is deliberately no INSERT, UPDATE, DELETE, ALTER, DROP, TRUNCATE or
-- MERGE anywhere in this file. Run it in the Supabase SQL editor and paste the
-- three result sets back. Stage B's load script is generated from what these
-- show, not from assumption.
--
-- Why this runs first:
--   Q1 answers "what is actually still missing before an estimate can export",
--      which today can only be answered by reading the exporter source.
--   Q2 gives the facts the VW/Volkswagen merge depends on. Tatiana asked us to
--      keep "VW", but the 71 priced rate-card rows are on "Volkswagen". Merging
--      the wrong way round destroys them.
--   Q3 checks the LIVE foreign keys rather than trusting the migration files.
--      This matters: scripts/supabase_schema.sql:50 declares
--      rate_card_items.client_id ... ON DELETE CASCADE, so deleting the wrong
--      client row would silently delete its rate card with no error at all.
--      Confirm that before anything is deleted.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Q1. Client accounting readiness — one row per client.
--
-- `missing_for_export` lists the client-level fields the exporter treats as
-- hard requirements (src/lib/accounting-export-line-service.ts:643-658).
-- Empty string = nothing missing at the client level. Note this covers only the
-- CLIENT level; a valid export also needs per-estimate values (project ID,
-- revenue segment, event city/state) that are not audited here.
--
-- AR payment terms read from the client only, with no office fallback, so a
-- blank here blocks every invoice for that client.
-- Department has no fallback anywhere (office profiles carry a location but no
-- department), so a blank here blocks both AR and AP lines.
-- Location DOES fall back to the office profile, so a blank is usually fine for
-- office events; it is reported for completeness, not as a blocker.
-- -----------------------------------------------------------------------------
SELECT
  c.name,
  c.code,
  c.is_active,
  c.intacct_customer_id,
  c.default_payment_terms,
  c.default_department_id,
  c.default_location_id,
  c.default_currency,
  c.default_exchange_rate_type,
  -- economics that MUST survive any merge
  c.office_payout_pct,
  c.third_party_markup,
  c.agency_fee,
  c.agency_fee_basis,
  c.trucking_markup,
  c.primary_approver_id,
  -- attachments
  (SELECT count(*) FROM rate_card_items r WHERE r.client_id = c.id) AS rate_card_rows,
  (SELECT count(*) FROM estimates      e WHERE e.client_id = c.id) AS estimates,
  (SELECT count(*) FROM client_contacts k WHERE k.client_id = c.id) AS contacts,
  btrim(
    concat_ws(', ',
      CASE WHEN c.intacct_customer_id   IS NULL OR c.intacct_customer_id   = '' THEN 'customer_id'    END,
      CASE WHEN c.default_payment_terms IS NULL OR c.default_payment_terms = '' THEN 'ar_payment_terms' END,
      CASE WHEN c.default_department_id IS NULL OR c.default_department_id = '' THEN 'department'     END,
      CASE WHEN c.default_location_id   IS NULL OR c.default_location_id   = '' THEN 'location (office fallback may cover)' END
    )
  ) AS missing_for_export
FROM clients c
ORDER BY c.name;


-- -----------------------------------------------------------------------------
-- Q2. VW / Volkswagen merge safety.
--
-- Expected before the merge: two rows. "Volkswagen" should show ~71 rate card
-- rows; "VW" should show 0. If that is reversed, or if BOTH have rows, STOP and
-- re-plan — the merge sequence in the blueprint assumes Volkswagen holds the
-- data.
--
-- If either row shows estimates > 0 for the record that would be deleted, STOP:
-- moving estimates between clients is out of scope for this sprint.
--
-- Compare every settings column. Anything set on the record being retired and
-- absent on the survivor must be carried across first. office_payout_pct is the
-- one to watch: schema default is 0.75 and DECISIONS records VW at 0.80.
-- -----------------------------------------------------------------------------
SELECT
  c.id,
  c.name,
  c.code,
  c.is_active,
  c.intacct_customer_id,
  c.default_payment_terms,
  c.default_department_id,
  c.default_location_id,
  c.default_currency,
  c.default_exchange_rate_type,
  c.office_payout_pct,
  c.third_party_markup,
  c.agency_fee,
  c.agency_fee_basis,
  c.trucking_markup,
  c.primary_approver_id,
  c.notes,
  (SELECT count(*) FROM rate_card_items r WHERE r.client_id = c.id) AS rate_card_rows,
  (SELECT count(*) FROM estimates      e WHERE e.client_id = c.id) AS estimates,
  (SELECT count(*) FROM client_contacts k WHERE k.client_id = c.id) AS contacts
FROM clients c
WHERE lower(c.name) IN ('vw', 'volkswagen')
ORDER BY c.name;


-- -----------------------------------------------------------------------------
-- Q3. Every foreign key that points at `clients`, straight from the live
-- catalog, with its ON DELETE rule.
--
-- Read `delete_rule` carefully before any DELETE is written:
--   CASCADE   = child rows are deleted SILENTLY. This is the dangerous one.
--   NO ACTION / RESTRICT = the delete fails loudly, which is what we want.
--
-- Expected from the migration files, to be confirmed here:
--   rate_card_items.client_id  -> CASCADE   (would silently destroy the rates)
--   client_contacts.client_id  -> CASCADE   (would silently destroy contacts)
--   estimates.client_id        -> NO ACTION (fails loudly; this is our guard)
--
-- If anything else references clients with CASCADE, the merge plan must account
-- for it before Stage B is generated.
-- -----------------------------------------------------------------------------
SELECT
  tc.table_name        AS referencing_table,
  kcu.column_name      AS referencing_column,
  rc.delete_rule,
  CASE rc.delete_rule
    WHEN 'CASCADE' THEN 'DANGER — child rows deleted silently'
    ELSE 'safe — delete fails loudly'
  END AS merge_risk
FROM information_schema.table_constraints  tc
JOIN information_schema.key_column_usage   kcu
  ON kcu.constraint_name   = tc.constraint_name
 AND kcu.constraint_schema = tc.constraint_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name   = tc.constraint_name
 AND ccu.constraint_schema = tc.constraint_schema
JOIN information_schema.referential_constraints rc
  ON rc.constraint_name    = tc.constraint_name
 AND rc.constraint_schema  = tc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name     = 'clients'
ORDER BY rc.delete_rule DESC, tc.table_name;
