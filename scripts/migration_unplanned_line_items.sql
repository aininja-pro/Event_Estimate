-- Migration: add is_unplanned flag to estimate_line_items
-- Purpose: mark line items that were added during recap mode (not part of the original estimate).
-- Context: planning/requirements-driveshop-recap-additions.md, Step 1.
--
-- Design notes:
--   FALSE (default) = planned line item from the original estimate.
--   TRUE = added during recap mode (e.g., emergency cleanup after a flood).
--     These items have quantity=0, unit_cost=0, markup_pct=0 on the estimate side.
--     Actual cost is captured in recap_actuals like any other line item.
--   UI uses this flag to render a rose/amber left-border accent + "UNPLANNED" badge
--     and to show dashes in the estimate columns instead of zeros.
--   Chose an explicit flag over inferring from (quantity=0 AND unit_cost=0) so that
--     a planned $0 line item (rare but possible) is not accidentally flagged.

ALTER TABLE estimate_line_items
  ADD COLUMN IF NOT EXISTS is_unplanned BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN estimate_line_items.is_unplanned IS
  'TRUE if this line item was added during recap mode (not part of the original estimate). Default FALSE.';
