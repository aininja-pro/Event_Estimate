-- Migration: Add resource_type to schedule_entries and labor_entries
-- Purpose: Track internal/external/vendor classification per staff row
-- Sprint: Financial Controls (Step 2)
-- Date: 2026-03-25

ALTER TABLE schedule_entries
  ADD COLUMN IF NOT EXISTS resource_type TEXT DEFAULT 'external'
  CHECK (resource_type IN ('internal', 'external', 'vendor'));

ALTER TABLE labor_entries
  ADD COLUMN IF NOT EXISTS resource_type TEXT DEFAULT 'external'
  CHECK (resource_type IN ('internal', 'external', 'vendor'));
