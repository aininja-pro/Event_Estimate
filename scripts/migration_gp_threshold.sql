-- Migration: Add GP threshold to system_settings
-- Purpose: Configurable minimum GP% before flagging for review
-- Sprint: Financial Controls (Step 4)
-- Date: 2026-03-25

INSERT INTO system_settings (key, value)
VALUES ('gp_threshold_pct', '{"pct": 20}')
ON CONFLICT (key) DO NOTHING;
