CREATE TABLE IF NOT EXISTS estimate_nudge_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  nudge_id TEXT NOT NULL,
  dismissed_by UUID REFERENCES profiles(id),
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(estimate_id, nudge_id)
);

ALTER TABLE estimate_nudge_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage nudge dismissals"
  ON estimate_nudge_dismissals
  FOR ALL
  USING (true)
  WITH CHECK (true);
