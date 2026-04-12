-- Migration: Add 'archived' to estimates.status allowed values
-- Run this against your Supabase database

-- Drop existing constraint (if any) and add updated one
ALTER TABLE estimates
  DROP CONSTRAINT IF EXISTS estimates_status_check;

ALTER TABLE estimates
  ADD CONSTRAINT estimates_status_check
  CHECK (status IN ('pipeline', 'draft', 'review', 'approved', 'active', 'recap', 'complete', 'archived'));
