-- Migration: Add is_rate_locked flag to rate_card_items
-- Purpose: Lock rates on DriveShop internal rate card (and any future locked items)
-- Sprint: Financial Controls (Step 3)
-- Date: 2026-03-25

ALTER TABLE rate_card_items
  ADD COLUMN IF NOT EXISTS is_rate_locked BOOLEAN DEFAULT FALSE;
