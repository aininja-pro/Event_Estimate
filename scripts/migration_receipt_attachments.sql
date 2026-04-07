-- Migration: Receipt Attachments table + Receipts storage bucket
-- Part of Recap Entry & Actuals sprint

-- Receipt attachments: file metadata for uploaded receipts
CREATE TABLE IF NOT EXISTS receipt_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  line_item_id UUID REFERENCES estimate_line_items(id) ON DELETE CASCADE,
  labor_entry_id UUID REFERENCES labor_entries(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipt_attachments_line_item ON receipt_attachments(line_item_id);
CREATE INDEX IF NOT EXISTS idx_receipt_attachments_estimate ON receipt_attachments(estimate_id);

ALTER TABLE receipt_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage receipt attachments"
  ON receipt_attachments FOR ALL
  USING (true) WITH CHECK (true);

-- Storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for authenticated users
CREATE POLICY "Authenticated users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete receipts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');
