-- Migration: clarify recap actual amount semantics
-- Purpose:
--   recap_actuals.actual_total was the original recap amount field and is
--   treated as legacy actual cost. AP/AR export preparation needs separate
--   cost-side and client-billable-side actuals without destroying old data.
--
-- Design notes:
--   actual_cost_total     = actual office/vendor cost or payout amount.
--   actual_billable_total = actual client billable amount.
--   actual_amount_notes   = optional accounting note explaining amount choices.
--
-- Existing actual_total values are preserved and remain readable as legacy
-- cost values through application fallbacks.

ALTER TABLE recap_actuals
  ADD COLUMN IF NOT EXISTS actual_cost_total NUMERIC,
  ADD COLUMN IF NOT EXISTS actual_billable_total NUMERIC,
  ADD COLUMN IF NOT EXISTS actual_amount_notes TEXT;

COMMENT ON COLUMN recap_actuals.actual_total IS
  'Legacy recap actual amount. Treated as actual cost for backward compatibility; use actual_cost_total and actual_billable_total for new work.';

COMMENT ON COLUMN recap_actuals.actual_cost_total IS
  'Actual office/vendor cost or payout amount for recap/accounting. Falls back to legacy actual_total when NULL.';

COMMENT ON COLUMN recap_actuals.actual_billable_total IS
  'Actual client billable amount for recap/accounting. Must be explicit or safely derived; do not fall back to legacy actual_total.';

COMMENT ON COLUMN recap_actuals.actual_amount_notes IS
  'Optional note explaining actual cost/billable amount handling.';
