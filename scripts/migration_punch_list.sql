-- Migration: Punch List — admin-only working tracker for bugs/features/questions
-- Replaces the Ray+Dave email-a-spreadsheet loop. Seeded below with the items
-- from Dave's "Event Estimator Punch List.xlsx" (received 2026-08-27).

CREATE TABLE IF NOT EXISTS punch_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  notes TEXT,
  item_type TEXT NOT NULL DEFAULT 'task'
    CHECK (item_type IN ('bug', 'feature', 'question', 'task')),
  area TEXT NOT NULL DEFAULT 'general'
    CHECK (area IN ('accounting', 'operations', 'rates', 'ai', 'general')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'done')),
  resolution_note TEXT,
  created_by TEXT,
  resolved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_punch_list_status ON punch_list_items(status);

ALTER TABLE punch_list_items ENABLE ROW LEVEL SECURITY;

-- Admin-only, read and write. The page and sidebar are also admin-gated;
-- this is the backstop.
DROP POLICY IF EXISTS "Admins manage punch list" ON punch_list_items;
CREATE POLICY "Admins manage punch list"
  ON punch_list_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ---------------------------------------------------------------------------
-- Seed: Dave's spreadsheet, transcribed. Guarded so a re-run does not duplicate.
-- Two items are already resolved and land in Done with a resolution note.
-- ---------------------------------------------------------------------------
INSERT INTO punch_list_items (title, notes, item_type, area, status, created_by, resolved_by, resolved_at, resolution_note)
SELECT * FROM (VALUES
  ('Review rates', NULL, 'task', 'accounting', 'open', 'Dave Morck', NULL, NULL::timestamptz, NULL),
  ('Set office cost to 75% for all flat fee items - Chauffeur rates at 90%', NULL, 'task', 'accounting', 'open', 'Dave Morck', NULL, NULL, NULL),
  ('Set corp cost to 50% for all flat fee items', NULL, 'task', 'accounting', 'open', 'Dave Morck', NULL, NULL, NULL),
  ('How do we set planning and admin fees (labor)', NULL, 'question', 'operations', 'open', 'Dave Morck', NULL, NULL, NULL),
  ('Can we add attachments to the estimates?', NULL, 'feature', 'operations', 'open', 'Dave Morck', NULL, NULL, NULL),
  ('How to export all rates by client', NULL, 'feature', 'accounting', 'open', 'Dave Morck', NULL, NULL, NULL),
  ('Account director, manager - those are hours. How do we just enter them as such', NULL, 'question', 'rates', 'open', 'Dave Morck', NULL, NULL, NULL),
  ('The intelligence (AI) part is not working', NULL, 'bug', 'ai', 'done', 'Dave Morck', 'Ray', now(), 'Fixed 2026-08-27 - the AI services were pinned to a retired Claude model. Updated to the current model and running on DriveShop''s own API key.'),
  ('Updated Chauffeur hours to Flat fee yet still shows as a pass through', NULL, 'bug', 'rates', 'done', 'Dave Morck', 'Dave Morck', now(), 'Closed on Dave''s spreadsheet before import.'),
  ('User guide', NULL, 'feature', 'general', 'done', 'Dave Morck', 'Ray', now(), 'Shipped 2026-08-27 - User Guide lives in the app sidebar, covering the full estimate lifecycle.'),
  ('Link to data format - Dave to provide to Ray', NULL, 'task', 'general', 'open', 'Dave Morck', NULL, NULL, NULL),
  ('EV Charging item codes', 'I0012 = EV Charging (Flat Rate); I00601 = EV Charging (Pass Through)', 'task', 'accounting', 'open', 'Dave Morck', NULL, NULL, NULL)
) AS seed(title, notes, item_type, area, status, created_by, resolved_by, resolved_at, resolution_note)
WHERE NOT EXISTS (SELECT 1 FROM punch_list_items);
