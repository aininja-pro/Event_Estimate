# PHASE 2 KICKOFF: Rate Card Management Engine

## CONTEXT

We are transitioning this app from a Phase 1 demo/discovery tool into a Phase 2 production system. The existing React UI is our foundation. This sprint focuses on making the Rate Card Management page functional with real database persistence.

**Before writing any code, read:**
- `docs/ARCHITECTURE.md` — current app structure
- `src/pages/RateCardManagementPage.tsx` — existing UI mockup (this becomes the real page)
- `src/lib/supabase.ts` — existing Supabase client setup
- `src/App.tsx` — routing structure

**Reference data files (read these to understand the data model):**
- `/data/DriveShop_Event_Estimate_Template_12_01_25.xlsx` — Tatiana's event rate cards (8 client tabs). This is the PRIMARY data source.
- `FMS_Rate_Matrix.xlsx` — Dave's fleet management rates (secondary, for later)

---

## WHAT WE'RE BUILDING

A functional Rate Card Management system where users can:
1. View all client rate cards
2. View rate card items organized by section
3. Add new custom rates (flagged as non-MSA)
4. Edit existing rates
5. All changes persist to Supabase

This is NOT a demo or mockup. This is production functionality.

---

## STEP 1: SUPABASE DATABASE SCHEMA

Create these tables in Supabase. The SQL below should be run in the Supabase SQL Editor. Save it as `scripts/supabase_schema.sql` for version control.

```sql
-- Clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,  -- short code like 'LUCID', 'VW', 'MAZDA'
  third_party_markup DECIMAL(5,4) DEFAULT 0,  -- e.g., 0.015 for 1.5%
  agency_fee DECIMAL(5,4) DEFAULT 0,  -- e.g., 0.10 for 10%
  agency_fee_basis TEXT DEFAULT 'total_event_bid',  -- what the agency fee applies to
  trucking_markup DECIMAL(5,4) DEFAULT 0,  -- e.g., 0.20 for 20% (Volvo)
  office_payout_pct DECIMAL(5,4) DEFAULT 0.75,  -- office gets 75% of revenue (80% for VW)
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rate card sections (standard groupings)
CREATE TABLE rate_card_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('labor', 'flat_fee', 'pass_through')),
  description TEXT
);

-- Seed the standard sections
INSERT INTO rate_card_sections (name, display_order, cost_type) VALUES
  ('Planning & Administration Labor', 1, 'labor'),
  ('Onsite Event Labor', 2, 'labor'),
  ('Travel Expenses', 3, 'pass_through'),
  ('Creative Costs', 4, 'labor'),
  ('Production Expenses', 5, 'pass_through'),
  ('Logistics Expenses', 6, 'flat_fee');

-- Rate card items (the actual rates per client)
CREATE TABLE rate_card_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES rate_card_sections(id),
  name TEXT NOT NULL,
  unit_rate DECIMAL(10,2),  -- dollar amount (NULL for pass-through items with no fixed rate)
  unit_label TEXT,  -- e.g., '/10 hr day', '/hr', '/vehicle/prep', '/day', '/event'
  gl_code TEXT,  -- e.g., '4000.26', '4025.12'
  is_from_msa BOOLEAN DEFAULT true,  -- false = added by account manager for project scope
  is_pass_through BOOLEAN DEFAULT false,  -- true = receipt-based, subject to client markup
  has_overtime_rate BOOLEAN DEFAULT false,
  overtime_rate DECIMAL(10,2),  -- hourly OT rate if applicable
  overtime_unit_label TEXT DEFAULT '/hr >10hrs',
  overtime_gl_code TEXT,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT  -- who added this rate (for non-MSA tracking)
);

-- Index for common queries
CREATE INDEX idx_rate_card_items_client ON rate_card_items(client_id);
CREATE INDEX idx_rate_card_items_section ON rate_card_items(section_id);
CREATE INDEX idx_rate_card_items_gl ON rate_card_items(gl_code);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER rate_card_items_updated_at BEFORE UPDATE ON rate_card_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS but keep it permissive for now (no auth yet)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_card_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_card_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to rate_card_sections" ON rate_card_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to rate_card_items" ON rate_card_items FOR ALL USING (true) WITH CHECK (true);
```

**Action:** Save this SQL to `scripts/supabase_schema.sql`. The user will run it in the Supabase SQL Editor manually.

---

## STEP 2: SEED DATA SCRIPT

Create a Python script that reads `DriveShop_Event_Estimate_Template_12_01_25.xlsx` and generates SQL INSERT statements (or uses the Supabase Python client) to seed the database with all 8 client rate cards.

Save as `scripts/seed_rate_cards.py`.

**What to extract from each client tab:**

Row 1: Client Name → `clients.name`
Row 2: Third Party Cost Markup → `clients.third_party_markup`
Row 3: Agency Fee (if present) → `clients.agency_fee`
Row 3: Trucking Markup (Volvo tabs) → `clients.trucking_markup`

Then for each section, extract all rate items:
- Column B: Item name → `rate_card_items.name`
- Column C: Unit rate → `rate_card_items.unit_rate`
- Column A or E: GL code → `rate_card_items.gl_code`
- Section header determines → `rate_card_items.section_id`
- "From MSA:" marker → `rate_card_items.is_from_msa = true`
- "Added rates determined by project scope:" marker → subsequent items get `is_from_msa = false`
- Items with OT variants (next row with "OT" or ">10hrs") → set `has_overtime_rate = true` and populate `overtime_rate`

**Special handling:**
- VW tab has TWO rate columns: C = Bill Rate, D = Cost Corp. Store bill rate as `unit_rate`. We'll add a `cost_rate` column later for margin calculations.
- Skip rows that are just "---" (placeholder/empty rows)
- Skip total rows (e.g., "Total Onsite Labor Activity")
- Skip the 3 hidden tabs (Templates Event Admin, Templates - Admin Labor, Ineos) — only process visible client tabs
- Handle the pass-through sections (Travel Expenses, Production Expenses) — these items typically have no unit_rate but are still valid line items

**Output:** Either a `.sql` file with INSERT statements, or a script that connects directly to Supabase via the REST API. User preference — ask before implementing.

---

## STEP 3: SUPABASE DATA SERVICE

Create `src/lib/rate-card-service.ts` — a clean data access layer that wraps Supabase queries.

```typescript
// Functions needed:
getClients()                              // list all clients
getClient(id)                             // single client with markup rules
getRateCardSections()                     // list sections in display order
getRateCardItems(clientId)                // all items for a client
getRateCardItemsBySection(clientId)       // items grouped by section
createRateCardItem(item)                  // add new custom rate
updateRateCardItem(id, updates)           // edit existing rate
deleteRateCardItem(id)                    // soft delete (set is_active = false)
```

Keep it simple. Each function is a thin wrapper around a Supabase query. No caching, no state management — just async functions that return data.

**Import the existing supabase client from `src/lib/supabase.ts`.** Handle the null case (supabase not configured) gracefully — return empty arrays or throw a clear error.

---

## STEP 4: UPDATE RATE CARD MANAGEMENT PAGE

Rewrite `src/pages/RateCardManagementPage.tsx` to be functional instead of a static mockup.

**Keep the existing visual design** — same layout, same shadcn components, same styling. Just replace hardcoded data with live Supabase data.

### Layout:

**Top bar:** Client selector dropdown. When you pick a client, the page loads that client's rate card.

**Below client selector:** Show the client's markup rules as a summary bar:
- Third Party Markup: X%
- Agency Fee: X%
- Trucking Markup: X% (if applicable)

**Main content:** Rate card items grouped by section, displayed in a table format:
- Section headers as group dividers
- Columns: Item Name | Unit Rate | Unit Label | GL Code | Source (MSA badge or "Custom" badge)
- Items with OT rates show the OT rate in a sub-row or secondary column

**Actions:**
- "Add Rate" button per section → opens a simple form/modal to add a new custom rate to that section
- Click on a rate to edit inline or in a modal
- New custom rates automatically get `is_from_msa = false` and show a "Custom" badge

### Important UX Details (from Tatiana's requirements):
- MSA rates should be visually distinguished from custom/project rates
- Items should be grouped by section with section totals visible
- The interface should "look like a spreadsheet" (Tatiana's words) — familiar to the team
- Pass-through items don't need a rate column — they're estimated per project
- GL codes should be visible but not editable by regular users

---

## STEP 5: VERIFY AND TEST

After building, verify:
1. Client dropdown loads all 8 clients from Supabase
2. Selecting a client shows their rate card with correct sections
3. Rates match the source spreadsheet (spot-check Lucid Event Director = $700, Mazda Program Director = $600, VW Event Director Bill = $628.60)
4. Adding a new custom rate persists and shows "Custom" badge
5. Editing a rate updates in Supabase
6. Page works gracefully if Supabase is not configured (show the existing demo data as fallback)

---

## WHAT NOT TO DO IN THIS SPRINT

- Do NOT build the Estimate Builder yet
- Do NOT build the Labor Log yet
- Do NOT add authentication or user roles
- Do NOT integrate with Intacct
- Do NOT add the FMS rates (Dave's matrix) — that's a later sprint
- Do NOT change any other existing pages
- Do NOT over-engineer — no Redux, no complex state management, no caching layer. Simple React state + Supabase queries.

---

## FILES TO CREATE/MODIFY

| File | Action |
|------|--------|
| `scripts/supabase_schema.sql` | CREATE (database schema) |
| `scripts/seed_rate_cards.py` | CREATE (data seeder) |
| `src/lib/rate-card-service.ts` | CREATE (Supabase data layer) |
| `src/pages/RateCardManagementPage.tsx` | MODIFY (make functional) |
| `docs/ARCHITECTURE.md` | UPDATE (document new Supabase tables and data service) |

That's it. Five files. Keep it simple.
