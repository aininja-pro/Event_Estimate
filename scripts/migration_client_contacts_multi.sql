-- Migration: support multiple external client contacts per client
-- Purpose: keep client approval recipients distinct from internal approvers.

CREATE TABLE IF NOT EXISTS client_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  title text,
  is_primary boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT client_contacts_email_not_blank CHECK (length(trim(email)) > 0),
  CONSTRAINT client_contacts_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_email ON client_contacts(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_contacts_one_primary_active
  ON client_contacts(client_id)
  WHERE is_primary = true AND active = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'estimates'
      AND column_name = 'client_contact_id'
  ) THEN
    ALTER TABLE estimates
      ADD COLUMN client_contact_id uuid REFERENCES client_contacts(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_estimates_client_contact_id ON estimates(client_contact_id);

DROP TRIGGER IF EXISTS client_contacts_updated_at ON client_contacts;
CREATE TRIGGER client_contacts_updated_at BEFORE UPDATE ON client_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO client_contacts (
  client_id,
  name,
  email,
  phone,
  is_primary
)
SELECT
  c.id,
  COALESCE(NULLIF(trim(c.billing_contact_name), ''), 'Billing Contact'),
  trim(c.billing_contact_email),
  NULLIF(trim(c.billing_phone), ''),
  true
FROM clients c
WHERE c.billing_contact_email IS NOT NULL
  AND trim(c.billing_contact_email) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM client_contacts cc
    WHERE cc.client_id = c.id
      AND lower(cc.email) = lower(trim(c.billing_contact_email))
  );

ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to client_contacts" ON client_contacts;
CREATE POLICY "Allow all access to client_contacts"
  ON client_contacts
  FOR ALL
  USING (true)
  WITH CHECK (true);
