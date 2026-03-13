-- Migration: Add cost tracking columns to rate_card_items
-- Purpose: Enable per-item GP calculation based on estimate cost_structure (corporate vs office)
--
-- corporate_cost: Dollar amount or percentage that DriveShop pays for corporate-produced events
-- corporate_cost_is_percent: If true, corporate_cost is a % of unit_rate; if false, it's a flat dollar amount
-- office_cost: Dollar amount or percentage paid for office-produced events (typically 75-80% of revenue)
-- office_cost_is_percent: If true, office_cost is a % of unit_rate; if false, it's a flat dollar amount
--
-- GP Calculation (future sprint):
--   If cost_structure = 'corporate':
--     cost = corporate_cost_is_percent ? unit_rate * (corporate_cost / 100) : corporate_cost
--   If cost_structure = 'office':
--     cost = office_cost_is_percent ? unit_rate * (office_cost / 100) : office_cost
--   GP = unit_rate - cost
--   GP% = (GP / unit_rate) * 100

ALTER TABLE rate_card_items
  ADD COLUMN corporate_cost DECIMAL(10,2) DEFAULT NULL,
  ADD COLUMN corporate_cost_is_percent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN office_cost DECIMAL(10,2) DEFAULT NULL,
  ADD COLUMN office_cost_is_percent BOOLEAN NOT NULL DEFAULT TRUE;
