# PHASE 2: Estimate Builder & Labor Log (Weeks 3-5)

## CONTEXT

We are building the core Estimate Builder — the primary tool Dan, Tim, and Kim use daily to create event estimates. This replaces their current spreadsheet workflow.

The Rate Card Management Engine is already complete and operational in Supabase. The Estimate Builder pulls rates from those tables when building line items.

**Before writing any code, read:**
- `CLAUDE.md` — full project context and business domain knowledge
- `docs/ARCHITECTURE.md` — current app structure
- `src/pages/EstimateBuilderPage.tsx` — existing UI mockup (this becomes the real page)
- `src/lib/rate-card-service.ts` — existing Supabase data layer for rate cards
- `src/lib/supabase.ts` — Supabase client

The existing `EstimateBuilderPage.tsx` is a ~400 line mockup with hardcoded sample data. The layout, component structure, and visual design are already correct. **Do not redesign the page.** Evolve it from static mockup to functional production page backed by Supabase.

---

## WHAT WE'RE BUILDING

A functional Estimate Builder where users can:
1. Create a new estimate for a client
2. Build a labor log (staffing plan) by picking roles from the client's rate card
3. Add line items to other sections (Production, Travel, Creative, etc.)
4. See auto-calculated totals, margins, and gross profit per line item
5. Support multi-location labor logs (one estimate → multiple locations)
6. Save everything to Supabase, come back and edit later

**What we are NOT building in this sprint:**
- No AI functionality (nudges, chat, scoping bridge) — that's Weeks 8-10
- No approval workflow — that's Weeks 6-7
- No PDF generation — that's Weeks 10-11
- No Intacct integration — that's Week 12
- No version history or change orders — that's Weeks 6-7

The AI panel should remain as a static visual placeholder (keep the existing nudge cards and chat input as read-only mockup). We'll wire it up in the Intelligence phase.

---

## STEP 1: DATABASE SCHEMA

Add these tables to Supabase. Save as `scripts/supabase_estimates_schema.sql`.

```sql
-- Estimates table (the main entity)
CREATE TABLE estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id),
  event_name TEXT NOT NULL,
  event_type TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  expected_attendance INTEGER,
  po_number TEXT,
  project_id TEXT,
  cost_structure TEXT DEFAULT 'corporate' CHECK (cost_structure IN ('corporate', 'office')),
  project_notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('pipeline', 'draft', 'review', 'approved', 'active', 'recap', 'complete')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Labor logs (one per location within an estimate)
CREATE TABLE labor_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  location_order INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Labor entries (individual role rows within a labor log)
CREATE TABLE labor_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  labor_log_id UUID NOT NULL REFERENCES labor_logs(id) ON DELETE CASCADE,
  rate_card_item_id UUID REFERENCES rate_card_items(id),
  role_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  days INTEGER NOT NULL DEFAULT 1,
  unit_rate DECIMAL(10,2) NOT NULL,
  cost_rate DECIMAL(10,2),
  override_rate DECIMAL(10,2),
  override_reason TEXT,
  has_overtime BOOLEAN DEFAULT false,
  overtime_rate DECIMAL(10,2),
  overtime_hours DECIMAL(5,1),
  gl_code TEXT,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Estimate line items (for non-labor sections)
CREATE TABLE estimate_line_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  rate_card_item_id UUID REFERENCES rate_card_items(id),
  item_name TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  markup_pct DECIMAL(5,2) DEFAULT 0,
  gl_code TEXT,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_estimates_client ON estimates(client_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_labor_logs_estimate ON labor_logs(estimate_id);
CREATE INDEX idx_labor_entries_log ON labor_entries(labor_log_id);
CREATE INDEX idx_estimate_line_items_estimate ON estimate_line_items(estimate_id);
CREATE INDEX idx_estimate_line_items_section ON estimate_line_items(section);

-- Updated_at triggers (reuses function from rate card schema)
CREATE TRIGGER estimates_updated_at BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER labor_logs_updated_at BEFORE UPDATE ON labor_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER labor_entries_updated_at BEFORE UPDATE ON labor_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER estimate_line_items_updated_at BEFORE UPDATE ON estimate_line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (permissive for now)
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to estimates" ON estimates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to labor_logs" ON labor_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to labor_entries" ON labor_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to estimate_line_items" ON estimate_line_items FOR ALL USING (true) WITH CHECK (true);
```

---

## STEP 2: ESTIMATE SERVICE LAYER

Create `src/lib/estimate-service.ts` — thin wrappers around Supabase queries.

Functions needed:

```typescript
// Estimates
getEstimates()                              // list all estimates with client name joined
getEstimate(id)                             // single estimate with client info
createEstimate(data)                        // create new, returns estimate
updateEstimate(id, data)                    // update header fields
deleteEstimate(id)                          // delete with cascade

// Labor Logs
getLaborLogs(estimateId)                    // all labor logs for an estimate
createLaborLog(estimateId, locationName, isPrimary)
updateLaborLog(id, data)
deleteLaborLog(id)

// Labor Entries
getLaborEntries(laborLogId)                 // all entries for a labor log
createLaborEntry(laborLogId, data)          // add a role
updateLaborEntry(id, data)                  // edit qty, days, override rate
deleteLaborEntry(id)

// Estimate Line Items
getLineItems(estimateId, section?)          // items filtered by section
createLineItem(estimateId, data)
updateLineItem(id, data)
deleteLineItem(id)
```

Import the existing supabase client. Handle the null case gracefully.

---

## STEP 3: ESTIMATES LIST PAGE

Create `src/pages/EstimatesListPage.tsx` — the entry point for all estimates.

### Layout:
- Page title: "Estimates" with "+ New Estimate" button top-right
- Table: Event Name | Client | Status (badge) | Location | Dates | Last Updated
- Click row → navigate to `/estimates/:id`
- Empty state: "No estimates yet. Create your first estimate."

### "New Estimate" Modal:
- Client (dropdown from clients table — required)
- Event Name (text — required)
- Event Type (dropdown: Ride & Drive, Static Display, Press Event, Chauffeur, Auto Show, Tour, Fleet, Other)
- Location (text — this becomes the primary labor log location)
- Start Date / End Date
- Cost Structure (Corporate / Office toggle — default: Corporate)

On save:
1. Create estimate record
2. Auto-create one labor log with `is_primary = true` using the location field
3. Navigate to `/estimates/:id`

### Navigation Update:
Reorganize sidebar with a "Production" section:
```
Production               ← NEW SECTION
  📋 Estimates           ← NEW (estimates list)
  💰 Rate Cards          ← MOVE existing Rate Card Management here
```

Keep Discovery Intelligence and Phase 1 Deliverables sections as-is.

### Routing:
Add to App.tsx:
- `/estimates` → EstimatesListPage
- `/estimates/:id` → EstimateBuilderPage

---

## STEP 4: EVOLVE THE ESTIMATE BUILDER PAGE

Modify `src/pages/EstimateBuilderPage.tsx`. The page now receives an estimate ID from URL params.

### Remove:
- `ConceptBanner` component and all references
- All hardcoded data arrays (`laborRows`, `productionRows`, `travelRows`, `creativeRows`, `accessRows`, `summaryData`)
- Subtitle "Interactive concept mockup"

### Keep as static mockup (for now):
- `AINudgePanel` with hardcoded nudge cards and read-only chat input
- The 70/30 split layout

### EventHeader Changes:
- Load estimate from Supabase using URL param ID
- Fields are editable (except Client — read-only after creation)
- Add: PO Number, Project ID fields
- Add: Cost Structure toggle (Corporate / Office)
- Add: Project Notes (expandable textarea below the field grid)
- Save on blur or debounced auto-save

### LaborLogTab Changes:
- Load labor logs for this estimate
- Location tabs: each labor log shows as a button/tab (like the existing LA/San Diego mockup)
- Active location tab loads its labor entries
- "+ Add Location" prompts for location name, creates labor log, switches to it
- Delete location (with confirmation — "This will delete all staffing for this location")

**Adding a role (the key interaction):**
- Click "+ Add Role"
- Opens modal with searchable dropdown
- Dropdown shows roles from the CLIENT's rate card, filtered to Labor sections only (Planning & Admin Labor, Onsite Event Labor)
- Display: Role Name — Unit Rate — Unit Label (e.g., "Event Director — $700.00 — /10 hr day")
- On select: create labor_entry with role_name, unit_rate, cost_rate, gl_code all copied from rate card item
- Set quantity = 1, days = estimate's duration_days as defaults
- User edits Qty and Days inline

**Editable fields per row:**
- Qty — number input, recalculates on change
- Days — number input, recalculates on change
- Unit Rate — shows rate card default. If user changes it, store as override_rate, show visual indicator (e.g., orange text or small "overridden" badge), prompt for override_reason
- Cost Rate — editable for corporate. For office: auto-calculate as unit_rate × (1 - client.office_payout_pct)
- Notes — small icon that opens a text input for per-line notes

**Auto-calculated per row (read-only, computed client-side):**
- Line Total = Qty × Days × Unit Rate (or override_rate if set)
- Cost Total = Qty × Days × Cost Rate
- GP = Line Total - Cost Total
- GP% = GP / Line Total × 100

**Labor Summary bar:**
- Calculate from live labor entry data
- Show: Total Revenue, Total Cost, Gross Profit, GP%, Staff Count, Per Diem Total, Total with Per Diem
- Updates as user edits any field

### LineItemTab Changes:
- Load items from `estimate_line_items` filtered by section
- "Add Line Item" modal with:
  - Searchable dropdown from client's rate card (filtered to matching section by cost_type)
  - OR free-text for custom items
  - Item Name, Description, Quantity, Unit Cost
  - Markup % (default to client's `third_party_markup` for pass-through sections, 0 for others)
- Auto-calculate: Total = Qty × Unit Cost, Client Total = Total × (1 + Markup%)
- Editable inline, deletable

### Tab Updates:
Add Misc tab:
```
Labor Log | Production | Travel & Logistics | Creative | Access Fees & Insurance | Misc | Summary
```

### SummaryTab Changes:
- Calculate from live data across all labor entries and line items
- Group by: Labor, Per Diem (if per diem entries exist), Production, Travel/Logistics, Creative, Access/Insurance, Misc
- Show: Section | Revenue | Cost | GP | GP%
- Grand Total row
- All computed client-side from the loaded data

---

## STEP 5: VERIFY AND TEST

1. Create a new estimate from the list page for Mazda
2. Labor Log loads with primary location
3. Add Event Director from rate card — verify $700/day auto-fills
4. Set Qty: 2, Days: 4 — verify Line Total = $5,600
5. Add a second location (San Diego) — verify separate labor log
6. Add Production line items — verify markup auto-applies
7. Summary tab totals are correct
8. Refresh page — all data persists
9. Navigate back to estimates list — estimate shows with correct status
10. Edit the estimate — changes save correctly

---

## IMPORTANT RULES

1. **Snapshot rates.** Copy rate data into labor_entry/line_item at creation. Don't reference rate card live.
2. **Don't store calculated totals.** Line Total, GP, GP% are derived client-side from Qty × Days × Rate.
3. **Pass-through markup defaults.** When adding a line item to a pass-through section, default markup_pct to client's third_party_markup.
4. **Office cost calculation.** When cost_structure = 'office', labor cost_rate = unit_rate × (1 - office_payout_pct). Pass-throughs at 100% (0% margin).
5. **Keep AI panel static.** Don't remove it, don't wire it up. It stays as a visual placeholder until Weeks 8-10.
6. **Build incrementally.** Schema → Service layer → Estimates list → Builder page (Labor Log first, then other tabs, then Summary last).

---

## FILES TO CREATE/MODIFY

| File | Action |
|------|--------|
| `scripts/supabase_estimates_schema.sql` | CREATE |
| `src/lib/estimate-service.ts` | CREATE |
| `src/pages/EstimatesListPage.tsx` | CREATE |
| `src/pages/EstimateBuilderPage.tsx` | MODIFY |
| `src/App.tsx` | MODIFY (add routes) |
| `src/components/layout/Sidebar.tsx` | MODIFY (reorganize nav) |
| `docs/ARCHITECTURE.md` | UPDATE |
