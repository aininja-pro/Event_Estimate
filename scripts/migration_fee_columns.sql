-- Migration: Add fee tracking columns to estimate_line_items
-- Purpose: Support auto-generated agency fees and custom fee lines
-- Sprint: Financial Controls (Step 1)
-- Date: 2026-03-25

-- is_auto_generated: True for system-generated fee lines (e.g., agency fee from client rate card)
ALTER TABLE estimate_line_items
  ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT FALSE;

-- fee_basis: What the fee percentage applies against. NULL for regular line items.
-- Values: 'subtotal_minus_passthrough', 'total_estimate', 'labor_only', 'flat_amount'
ALTER TABLE estimate_line_items
  ADD COLUMN IF NOT EXISTS fee_basis TEXT;
