-- Add billing contact fields to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_contact_name text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_contact_email text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_address text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_phone text;
