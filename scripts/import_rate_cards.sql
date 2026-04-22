-- =============================================================================
-- Sprint 016 — Rate Card Bulk Import
-- Generated from: DriveShop_Cost_Rate_Card_Template.xlsx
-- Safe to re-run: all operations are upserts keyed on name.
-- =============================================================================

BEGIN;

-- Fee types (auto-create only; existing rows untouched)
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT '+ each additional mile for Pick-up or Delivery', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Account Director/ hr', 'labor', 'planning_admin', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Account Director/ hr');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Account Manager/ hr', 'labor', 'planning_admin', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Account Manager/ hr');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Creative Services Management/ hr', 'labor', 'creative', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Creative Services Management/ hr');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Detailing Supplies', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Detailing Supplies');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Driving Instructor(10 hr)', 'labor', 'onsite_labor', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Driving Instructor(10 hr)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'EV Charging', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'EV Charging');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'EV Charging - Flat Rate', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'EV Charging - Flat Rate');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Equipment Storage (/pallet/day @DriveShop)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Equipment Storage (/pallet/day @DriveShop)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Equipment Storage (/pallet/month @DriveShop)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Event Director Day (10 hr)', 'labor', 'onsite_labor', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Event Director Day (10 hr)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Event Manager Day (10 hr)', 'labor', 'onsite_labor', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Event Manager Day (10 hr)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Event/Vehicle Handler Day (10 hr)', 'labor', 'onsite_labor', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Go-Jacks', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Go-Jacks');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Graphic Design/ hr', 'labor', 'planning_admin', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Graphic Design/ hr');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'In-Vehicle Host Day (10 hr)', 'labor', 'onsite_labor', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Insurance (/day)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Insurance (/day)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Insurance - Chauffeur (/day/vehicle)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Insurance - Chauffeur (/day/vehicle)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Insurance - Chauffeur (vehicle/day)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Insurance - Chauffeur (vehicle/day)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Outdoor Vehicle Storage (/vehicle/day)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Outdoor Vehicle Storage (/vehicle/month)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/month)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Per Diem', 'labor', 'onsite_labor', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Per Diem');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Power Packs', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Power Packs');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Pressure Washer (/week)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Pressure Washer (/week)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Product Specialist Day (10 hr)', 'labor', 'onsite_labor', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Product Specialist Day (10 hr)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Production Manager/ hr', 'labor', 'planning_admin', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Production Manager/ hr');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Professional Chauffeur/ hr', 'labor', 'onsite_labor', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Professional Chauffeur/ hr');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Professional Chauffeur/ hr (LA/SF/NY)', 'labor', 'onsite_labor', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Professional Chauffeur/ hr (LA/SF/NY)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Professional Chauffeur/ hr - All other Markets', 'labor', 'onsite_labor', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Professional Chauffeur/ hr - All other Markets');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Registration Host Day (10 hr)', 'labor', 'onsite_labor', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Registration Host Day (10 hr)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Safety Equipment (/event)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Safety Equipment (/event)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Social Media Creator Services Manager /hr', 'labor', 'planning_admin', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Social Media Creator Services Manager /hr');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Sr. Producer /hr', 'labor', 'planning_admin', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Sr. Producer /hr');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Support Vehicle (DS vehicle/day)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Tools (/event)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Tools (/event)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Two Way Radios (unit/day)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Two Way Radios (unit/day)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Vehicle Covers (vehicle/day)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Vehicle Delivery (<100 miles)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Vehicle Delivery (<50 miles)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Vehicle Delivery (<50 miles)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Vehicle Pickup (<100 miles)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Vehicle Pickup (<50 miles)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Vehicle Pickup (<50 miles)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Vehicle Secondary Prep (/vehicle/day)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Vehicle Show Prep (vehicle/day)', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)');
INSERT INTO fee_types (name, cost_type, section, unit_label) SELECT 'Vehicle Tracking', 'flat_fee', 'logistics', NULL WHERE NOT EXISTS (SELECT 1 FROM fee_types WHERE name = 'Vehicle Tracking');

-- Client: Audi
INSERT INTO clients (name, code)
SELECT 'Audi', 'AUDI'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Audi'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 140,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 70,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 140, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  70, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 110,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 55,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 110, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  55, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 80,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 40,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 80, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  40, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 628.6,
         has_overtime_rate = true,
         overtime_rate = 62.8,
         corporate_cost = 314.3,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 628.6, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 62.8,
  (SELECT unit_label FROM ft), NULL,
  314.3, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 514.3,
         has_overtime_rate = true,
         overtime_rate = 51.4,
         corporate_cost = 257.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 514.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 51.4,
  (SELECT unit_label FROM ft), NULL,
  257.15, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 485.7,
         has_overtime_rate = true,
         overtime_rate = 48.5,
         corporate_cost = 242.85,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 485.7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 48.5,
  (SELECT unit_label FROM ft), NULL,
  242.85, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 377.1,
         has_overtime_rate = true,
         overtime_rate = 37.7,
         corporate_cost = 188.55,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 377.1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 37.7,
  (SELECT unit_label FROM ft), NULL,
  188.55, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 320,
         has_overtime_rate = true,
         overtime_rate = 32,
         corporate_cost = 160,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 320, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32,
  (SELECT unit_label FROM ft), NULL,
  160, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 114.3,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 57.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 114.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  57.15, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Creative Costs'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Creative Services Management/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Creative Services Management/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Creative Services Management/ hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 40,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 20,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 40, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  20, false,
  175, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 289,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 144.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 289, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  144.5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10.75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 10.75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 82.5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 82.5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 60,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 60, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Audi')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Acura
INSERT INTO clients (name, code)
SELECT 'Acura', 'ACURA'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Acura'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  75, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 600,
         has_overtime_rate = true,
         overtime_rate = 60,
         corporate_cost = 300,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 600, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 60,
  (SELECT unit_label FROM ft), NULL,
  300, false,
  75, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 500,
         has_overtime_rate = true,
         overtime_rate = 50,
         corporate_cost = 250,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 500, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 50,
  (SELECT unit_label FROM ft), NULL,
  250, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 450,
         has_overtime_rate = true,
         overtime_rate = 45,
         corporate_cost = 225,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 450, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 45,
  (SELECT unit_label FROM ft), NULL,
  225, false,
  75, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 450,
         has_overtime_rate = true,
         overtime_rate = 45,
         corporate_cost = 225,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 450, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 45,
  (SELECT unit_label FROM ft), NULL,
  225, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 65,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 65, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 105,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 52.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 105, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  52.5, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  175, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Tracking'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Tracking'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Tracking', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 20,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 20, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10, false,
  75, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance - Chauffeur (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 20,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance - Chauffeur (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance - Chauffeur (vehicle/day)', 20, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10, false,
  175, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 8,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 8, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 8,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 8, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 8,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 8, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Acura')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  175, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Bentley
INSERT INTO clients (name, code)
SELECT 'Bentley', 'BENTLEY'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Bentley'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 140,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 70,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 140, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  70, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 110,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 55,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 110, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  55, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 80,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 40,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 80, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  40, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 628.6,
         has_overtime_rate = true,
         overtime_rate = 62.8,
         corporate_cost = 314.3,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 628.6, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 62.8,
  (SELECT unit_label FROM ft), NULL,
  314.3, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 514.3,
         has_overtime_rate = true,
         overtime_rate = 51.4,
         corporate_cost = 257.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 514.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 51.4,
  (SELECT unit_label FROM ft), NULL,
  257.15, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 485.7,
         has_overtime_rate = true,
         overtime_rate = 48.5,
         corporate_cost = 242.85,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 485.7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 48.5,
  (SELECT unit_label FROM ft), NULL,
  242.85, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 377.1,
         has_overtime_rate = true,
         overtime_rate = 37.7,
         corporate_cost = 188.55,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 377.1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 37.7,
  (SELECT unit_label FROM ft), NULL,
  188.55, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 320,
         has_overtime_rate = true,
         overtime_rate = 32,
         corporate_cost = 160,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 320, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32,
  (SELECT unit_label FROM ft), NULL,
  160, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 114.3,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 57.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 114.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  57.15, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Creative Costs'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Creative Services Management/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Creative Services Management/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Creative Services Management/ hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 40,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 20,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 40, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  20, false,
  175, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 289,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 144.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 289, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  144.5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10.75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 10.75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 82.5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 82.5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 60,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 60, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Bentley')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Ferrari
INSERT INTO clients (name, code)
SELECT 'Ferrari', 'FERRARI'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Ferrari'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Sr. Producer /hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 95,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 47.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Sr. Producer /hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Sr. Producer /hr', 95, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  47.5, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 750,
         has_overtime_rate = true,
         overtime_rate = 112.5,
         corporate_cost = 375,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 750, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 112.5,
  (SELECT unit_label FROM ft), NULL,
  375, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 600,
         has_overtime_rate = true,
         overtime_rate = 90,
         corporate_cost = 300,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 600, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 90,
  (SELECT unit_label FROM ft), NULL,
  300, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 500,
         has_overtime_rate = true,
         overtime_rate = 75,
         corporate_cost = 250,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 500, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 75,
  (SELECT unit_label FROM ft), NULL,
  250, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 60,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 60,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 60,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 60,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 60,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 60,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 65,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 65, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 120,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 60,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 120, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  60, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 60,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 30,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 60, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  30, false,
  175, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Tracking'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Tracking'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Tracking', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 160,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 80,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 160, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  80, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 240,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 120,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 240, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  120, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/month)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 225,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/month)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/month)', 225, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 160,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 160, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Ferrari')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 48,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 24,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 48, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  24, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Genesis
INSERT INTO clients (name, code)
SELECT 'Genesis', 'GENESIS'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Genesis'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 60,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 30,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 60, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  30, false,
  75, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 750,
         has_overtime_rate = true,
         overtime_rate = 75,
         corporate_cost = 375,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 750, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 75,
  (SELECT unit_label FROM ft), NULL,
  375, false,
  75, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 470,
         has_overtime_rate = true,
         overtime_rate = 47,
         corporate_cost = 235,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 470, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 47,
  (SELECT unit_label FROM ft), NULL,
  235, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 325,
         has_overtime_rate = true,
         overtime_rate = 32.5,
         corporate_cost = 162.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 325, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32.5,
  (SELECT unit_label FROM ft), NULL,
  162.5, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 275,
         has_overtime_rate = true,
         overtime_rate = 27.5,
         corporate_cost = 137.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 275, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 27.5,
  (SELECT unit_label FROM ft), NULL,
  137.5, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 77,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 38.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 77, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  38.5, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 65,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 65, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 40,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 20,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 40, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  20, false,
  175, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Tracking'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Tracking'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Tracking', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 250,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 125,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 250, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  125, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 180,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 180, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5.25,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 5.25, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5.25,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 5.25, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<50 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<50 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<50 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<50 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<50 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<50 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 0.87,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 0.87, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Genesis')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 39,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 19.5,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 39, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  19.5, false,
  175, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Hankook
INSERT INTO clients (name, code)
SELECT 'Hankook', 'HANKOOK'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Hankook'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 140,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 70,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 140, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  70, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 110,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 55,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 110, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  55, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 80,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 40,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 80, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  40, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 628.6,
         has_overtime_rate = true,
         overtime_rate = 62.8,
         corporate_cost = 314.3,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 628.6, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 62.8,
  (SELECT unit_label FROM ft), NULL,
  314.3, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 514.3,
         has_overtime_rate = true,
         overtime_rate = 51.4,
         corporate_cost = 257.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 514.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 51.4,
  (SELECT unit_label FROM ft), NULL,
  257.15, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 485.7,
         has_overtime_rate = true,
         overtime_rate = 48.5,
         corporate_cost = 242.85,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 485.7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 48.5,
  (SELECT unit_label FROM ft), NULL,
  242.85, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 377.1,
         has_overtime_rate = true,
         overtime_rate = 37.7,
         corporate_cost = 188.55,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 377.1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 37.7,
  (SELECT unit_label FROM ft), NULL,
  188.55, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 320,
         has_overtime_rate = true,
         overtime_rate = 32,
         corporate_cost = 160,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 320, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32,
  (SELECT unit_label FROM ft), NULL,
  160, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 114.3,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 57.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 114.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  57.15, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Creative Costs'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Creative Services Management/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Creative Services Management/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Creative Services Management/ hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 40,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 20,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 40, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  20, false,
  175, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 289,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 144.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 289, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  144.5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 47,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 47, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 48,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 48, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 49,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 49, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 50,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 50, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 51,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 51, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 52,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 52, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 53,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 53, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hankook')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 54,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 54, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 31, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Hyundai
INSERT INTO clients (name, code)
SELECT 'Hyundai', 'HYUNDAI'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Hyundai'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 60,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 30,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 60, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  30, false,
  75, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 750,
         has_overtime_rate = true,
         overtime_rate = 75,
         corporate_cost = 375,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 750, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 75,
  (SELECT unit_label FROM ft), NULL,
  375, false,
  75, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 470,
         has_overtime_rate = true,
         overtime_rate = 47,
         corporate_cost = 235,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 470, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 47,
  (SELECT unit_label FROM ft), NULL,
  235, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 325,
         has_overtime_rate = true,
         overtime_rate = 32.5,
         corporate_cost = 162.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 325, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32.5,
  (SELECT unit_label FROM ft), NULL,
  162.5, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 275,
         has_overtime_rate = true,
         overtime_rate = 27.5,
         corporate_cost = 137.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 275, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 27.5,
  (SELECT unit_label FROM ft), NULL,
  137.5, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 77,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 38.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 77, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  38.5, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 65,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 65, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 40,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 20,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 40, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  20, false,
  175, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Tracking'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Tracking'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Tracking', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 250,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 125,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 250, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  125, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 180,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 180, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5.25,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 5.25, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5.25,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 5.25, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<50 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<50 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<50 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<50 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<50 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<50 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 0.87,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 0.87, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Hyundai')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 39,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 19.5,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 39, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  19.5, false,
  175, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Honda
INSERT INTO clients (name, code)
SELECT 'Honda', 'HONDA'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Honda'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  75, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 600,
         has_overtime_rate = true,
         overtime_rate = 60,
         corporate_cost = 300,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 600, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 60,
  (SELECT unit_label FROM ft), NULL,
  300, false,
  75, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 500,
         has_overtime_rate = true,
         overtime_rate = 50,
         corporate_cost = 250,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 500, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 50,
  (SELECT unit_label FROM ft), NULL,
  250, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 450,
         has_overtime_rate = true,
         overtime_rate = 45,
         corporate_cost = 225,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 450, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 45,
  (SELECT unit_label FROM ft), NULL,
  225, false,
  75, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 450,
         has_overtime_rate = true,
         overtime_rate = 45,
         corporate_cost = 225,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 450, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 45,
  (SELECT unit_label FROM ft), NULL,
  225, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 65,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 65, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 105,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 52.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 105, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  52.5, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  175, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Tracking'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Tracking'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Tracking', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 20,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 20, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10, false,
  75, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance - Chauffeur (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 20,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance - Chauffeur (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance - Chauffeur (vehicle/day)', 20, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10, false,
  175, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 8,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 8, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 8,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 8, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 8,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 8, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Honda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  175, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: JLR
INSERT INTO clients (name, code)
SELECT 'JLR', 'JLR'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('JLR'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 140,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 70,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 140, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  70, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 110,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 55,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 110, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  55, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 80,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 40,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 80, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  40, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 628.6,
         has_overtime_rate = true,
         overtime_rate = 62.8,
         corporate_cost = 314.3,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 628.6, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 62.8,
  (SELECT unit_label FROM ft), NULL,
  314.3, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 514.3,
         has_overtime_rate = true,
         overtime_rate = 51.4,
         corporate_cost = 257.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 514.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 51.4,
  (SELECT unit_label FROM ft), NULL,
  257.15, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 485.7,
         has_overtime_rate = true,
         overtime_rate = 48.5,
         corporate_cost = 242.85,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 485.7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 48.5,
  (SELECT unit_label FROM ft), NULL,
  242.85, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 377.1,
         has_overtime_rate = true,
         overtime_rate = 37.7,
         corporate_cost = 188.55,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 377.1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 37.7,
  (SELECT unit_label FROM ft), NULL,
  188.55, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 320,
         has_overtime_rate = true,
         overtime_rate = 32,
         corporate_cost = 160,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 320, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32,
  (SELECT unit_label FROM ft), NULL,
  160, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 114.3,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 57.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 114.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  57.15, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Creative Costs'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Creative Services Management/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Creative Services Management/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Creative Services Management/ hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 40,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 20,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 40, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  20, false,
  175, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 289,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 144.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 289, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  144.5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 47,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 47, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 48,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 48, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 49,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 49, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 50,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 50, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 51,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 51, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 52,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 52, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 53,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 53, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('JLR')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 54,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 54, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 31, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Lamborghini
INSERT INTO clients (name, code)
SELECT 'Lamborghini', 'LAMBORGHINI'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Lamborghini'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 140,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 70,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 140, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  70, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 110,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 55,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 110, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  55, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 80,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 40,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 80, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  40, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 628.6,
         has_overtime_rate = true,
         overtime_rate = 62.8,
         corporate_cost = 314.3,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 628.6, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 62.8,
  (SELECT unit_label FROM ft), NULL,
  314.3, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 514.3,
         has_overtime_rate = true,
         overtime_rate = 51.4,
         corporate_cost = 257.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 514.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 51.4,
  (SELECT unit_label FROM ft), NULL,
  257.15, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 485.7,
         has_overtime_rate = true,
         overtime_rate = 48.5,
         corporate_cost = 242.85,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 485.7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 48.5,
  (SELECT unit_label FROM ft), NULL,
  242.85, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 377.1,
         has_overtime_rate = true,
         overtime_rate = 37.7,
         corporate_cost = 188.55,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 377.1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 37.7,
  (SELECT unit_label FROM ft), NULL,
  188.55, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 320,
         has_overtime_rate = true,
         overtime_rate = 32,
         corporate_cost = 160,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 320, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32,
  (SELECT unit_label FROM ft), NULL,
  160, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 114.3,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 57.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 114.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  57.15, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Creative Costs'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Creative Services Management/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Creative Services Management/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Creative Services Management/ hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 40,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 20,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 40, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  20, false,
  175, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 289,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 144.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 289, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  144.5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10.75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 10.75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 82.5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 82.5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 60,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 60, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lamborghini')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Lexus
INSERT INTO clients (name, code)
SELECT 'Lexus', 'LEXUS'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Lexus'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 800,
         has_overtime_rate = true,
         overtime_rate = 80,
         corporate_cost = 400,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 800, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 80,
  (SELECT unit_label FROM ft), NULL,
  400, false,
  75, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 500,
         has_overtime_rate = true,
         overtime_rate = 50,
         corporate_cost = 250,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 500, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 50,
  (SELECT unit_label FROM ft), NULL,
  250, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 325,
         has_overtime_rate = true,
         overtime_rate = 32.5,
         corporate_cost = 162.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 325, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32.5,
  (SELECT unit_label FROM ft), NULL,
  162.5, false,
  75, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 275,
         has_overtime_rate = true,
         overtime_rate = 27.5,
         corporate_cost = 137.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 275, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 27.5,
  (SELECT unit_label FROM ft), NULL,
  137.5, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 50,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 50, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 120,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 60,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 120, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  60, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 35,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 17.5,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 35, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  17.5, false,
  175, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Tracking'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Tracking'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Tracking', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 20,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 20, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 100,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  100, false,
  75, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 300,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 150,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 300, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  150, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance - Chauffeur (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 20,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance - Chauffeur (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance - Chauffeur (vehicle/day)', 20, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10, false,
  175, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 7,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 7,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<50 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<50 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<50 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<50 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<50 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<50 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lexus')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 35,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 17.5,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 35, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  17.5, false,
  175, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Lucid
INSERT INTO clients (name, code)
SELECT 'Lucid', 'LUCID'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Lucid'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 225,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 112.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 225, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  112.5, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Social Media Creator Services Manager /hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Social Media Creator Services Manager /hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Social Media Creator Services Manager /hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 95,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 47.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 95, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  47.5, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 700,
         has_overtime_rate = true,
         overtime_rate = 70,
         corporate_cost = 350,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 700, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 70,
  (SELECT unit_label FROM ft), NULL,
  350, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 600,
         has_overtime_rate = true,
         overtime_rate = 60,
         corporate_cost = 300,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 600, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 60,
  (SELECT unit_label FROM ft), NULL,
  300, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 800,
         has_overtime_rate = true,
         overtime_rate = 80,
         corporate_cost = 400,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 800, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 80,
  (SELECT unit_label FROM ft), NULL,
  400, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Driving Instructor(10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 800,
         has_overtime_rate = true,
         overtime_rate = 80,
         corporate_cost = 400,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Driving Instructor(10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Driving Instructor(10 hr)', 800, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 80,
  (SELECT unit_label FROM ft), NULL,
  400, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 65,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 65, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Creative Costs'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Creative Services Management/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Creative Services Management/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Creative Services Management/ hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 110,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 55,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 110, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  55, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 60,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 30,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 60, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  30, false,
  175, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 20,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 20, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Tracking'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Tracking'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Tracking', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 500,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 250,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 500, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  250, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 65,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 32.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 65, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  32.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 15,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 15, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 15,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 15, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 4,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/day @DriveShop)', 4, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 31, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Lucid')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 35,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 17.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 35, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  17.5, false,
  75, true,
  (SELECT id FROM ft), 32, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Maserati
INSERT INTO clients (name, code)
SELECT 'Maserati', 'MASERATI'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Maserati'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Sr. Producer /hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 95,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 47.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Sr. Producer /hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Sr. Producer /hr', 95, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  47.5, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 700,
         has_overtime_rate = true,
         overtime_rate = 70,
         corporate_cost = 350,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 700, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 70,
  (SELECT unit_label FROM ft), NULL,
  350, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 500,
         has_overtime_rate = true,
         overtime_rate = 50,
         corporate_cost = 250,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 500, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 50,
  (SELECT unit_label FROM ft), NULL,
  250, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 250,
         has_overtime_rate = true,
         overtime_rate = 25,
         corporate_cost = 125,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 250, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 25,
  (SELECT unit_label FROM ft), NULL,
  125, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 65,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 65, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 20,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 20, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10, false,
  75, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 65,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 32.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 65, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  32.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day)', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 120,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 120, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Maserati')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 15,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 7.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 15, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  7.5, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Mazda
INSERT INTO clients (name, code)
SELECT 'Mazda', 'MAZDA'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Mazda'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 140,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 70,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 140, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  70, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 110,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 55,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 110, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  55, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 80,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 40,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 80, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  40, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 628.6,
         has_overtime_rate = true,
         overtime_rate = 62.8,
         corporate_cost = 314.3,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 628.6, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 62.8,
  (SELECT unit_label FROM ft), NULL,
  314.3, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 514.3,
         has_overtime_rate = true,
         overtime_rate = 51.4,
         corporate_cost = 257.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 514.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 51.4,
  (SELECT unit_label FROM ft), NULL,
  257.15, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 485.7,
         has_overtime_rate = true,
         overtime_rate = 48.5,
         corporate_cost = 242.85,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 485.7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 48.5,
  (SELECT unit_label FROM ft), NULL,
  242.85, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 377.1,
         has_overtime_rate = true,
         overtime_rate = 37.7,
         corporate_cost = 188.55,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 377.1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 37.7,
  (SELECT unit_label FROM ft), NULL,
  188.55, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 320,
         has_overtime_rate = true,
         overtime_rate = 32,
         corporate_cost = 160,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 320, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32,
  (SELECT unit_label FROM ft), NULL,
  160, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 114.3,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 57.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 114.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  57.15, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Creative Costs'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Creative Services Management/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Creative Services Management/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Creative Services Management/ hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 40,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 20,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 40, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  20, false,
  175, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 289,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 144.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 289, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  144.5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 47,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 47, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 48,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 48, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 49,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 49, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 50,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 50, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 51,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 51, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 52,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 52, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 53,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 53, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Mazda')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 54,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 54, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 31, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: MB
INSERT INTO clients (name, code)
SELECT 'MB', 'MB'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('MB'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 140,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 70,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 140, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  70, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 110,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 55,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 110, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  55, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 80,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 40,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 80, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  40, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 628.6,
         has_overtime_rate = true,
         overtime_rate = 62.8,
         corporate_cost = 314.3,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 628.6, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 62.8,
  (SELECT unit_label FROM ft), NULL,
  314.3, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 514.3,
         has_overtime_rate = true,
         overtime_rate = 51.4,
         corporate_cost = 257.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 514.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 51.4,
  (SELECT unit_label FROM ft), NULL,
  257.15, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 485.7,
         has_overtime_rate = true,
         overtime_rate = 48.5,
         corporate_cost = 242.85,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 485.7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 48.5,
  (SELECT unit_label FROM ft), NULL,
  242.85, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 377.1,
         has_overtime_rate = true,
         overtime_rate = 37.7,
         corporate_cost = 188.55,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 377.1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 37.7,
  (SELECT unit_label FROM ft), NULL,
  188.55, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 320,
         has_overtime_rate = true,
         overtime_rate = 32,
         corporate_cost = 160,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 320, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32,
  (SELECT unit_label FROM ft), NULL,
  160, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 114.3,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 57.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 114.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  57.15, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Creative Costs'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Creative Services Management/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Creative Services Management/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Creative Services Management/ hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 40,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 20,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 40, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  20, false,
  175, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 289,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 144.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 289, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  144.5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 47,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 47, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 48,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 48, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 49,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 49, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 50,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 50, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 51,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 51, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 52,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 52, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 53,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 53, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('MB')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 54,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 54, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 31, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Polestar
INSERT INTO clients (name, code)
SELECT 'Polestar', 'POLESTAR'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Polestar'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 95,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 47.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 95, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  47.5, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 700,
         has_overtime_rate = true,
         overtime_rate = 70,
         corporate_cost = 350,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 700, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 70,
  (SELECT unit_label FROM ft), NULL,
  350, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 500,
         has_overtime_rate = true,
         overtime_rate = 50,
         corporate_cost = 250,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 500, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 50,
  (SELECT unit_label FROM ft), NULL,
  250, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr (LA/SF/NY)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr (LA/SF/NY)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr (LA/SF/NY)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr - All other Markets'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr - All other Markets'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr - All other Markets', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 65,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 65, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 30,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 30, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  15, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 50,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 50, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  175, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 16,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 8,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 16, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  8, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Tracking'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Tracking'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Tracking', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 160,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 80,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 160, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  80, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 240,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 120,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 240, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  120, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 8,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 8, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 8,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 8, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 80,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 80, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 160,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 160, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 31, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Polestar')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 35,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 17.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 35, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  17.5, false,
  75, true,
  (SELECT id FROM ft), 32, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Porsche
INSERT INTO clients (name, code)
SELECT 'Porsche', 'PORSCHE'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Porsche'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 95,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 47.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 95, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  47.5, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 450,
         has_overtime_rate = true,
         overtime_rate = 45,
         corporate_cost = 225,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 450, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 45,
  (SELECT unit_label FROM ft), NULL,
  225, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 250,
         has_overtime_rate = true,
         overtime_rate = 25,
         corporate_cost = 125,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 250, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 25,
  (SELECT unit_label FROM ft), NULL,
  125, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 70,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 35,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 70, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  35, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 50,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 50, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 50,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 50, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  175, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 20,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 20, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Tracking'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Tracking'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Tracking', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 100,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  100, false,
  75, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 100,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  100, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/day @DriveShop)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Porsche')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Toyota
INSERT INTO clients (name, code)
SELECT 'Toyota', 'TOYOTA'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Toyota'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 800,
         has_overtime_rate = true,
         overtime_rate = 80,
         corporate_cost = 400,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 800, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 80,
  (SELECT unit_label FROM ft), NULL,
  400, false,
  75, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 500,
         has_overtime_rate = true,
         overtime_rate = 50,
         corporate_cost = 250,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 500, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 50,
  (SELECT unit_label FROM ft), NULL,
  250, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 325,
         has_overtime_rate = true,
         overtime_rate = 32.5,
         corporate_cost = 162.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 325, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32.5,
  (SELECT unit_label FROM ft), NULL,
  162.5, false,
  75, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 275,
         has_overtime_rate = true,
         overtime_rate = 27.5,
         corporate_cost = 137.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 275, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 27.5,
  (SELECT unit_label FROM ft), NULL,
  137.5, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 50,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 50, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 120,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 60,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 120, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  60, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 35,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 17.5,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 35, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  17.5, false,
  175, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Tracking'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Tracking'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Tracking', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 20,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 20, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 100,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  100, false,
  75, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 300,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 150,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 300, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  150, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance - Chauffeur (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 20,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance - Chauffeur (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance - Chauffeur (vehicle/day)', 20, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10, false,
  175, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 7,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 7,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<50 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<50 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<50 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<50 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<50 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<50 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 200,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 25,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 200, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  25, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Toyota')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 35,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 17.5,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 35, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  17.5, false,
  175, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Volvo
INSERT INTO clients (name, code)
SELECT 'Volvo', 'VOLVO'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Volvo'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 95,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 47.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 95, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  47.5, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 700,
         has_overtime_rate = true,
         overtime_rate = 70,
         corporate_cost = 350,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 700, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 70,
  (SELECT unit_label FROM ft), NULL,
  350, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 500,
         has_overtime_rate = true,
         overtime_rate = 50,
         corporate_cost = 250,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 500, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 50,
  (SELECT unit_label FROM ft), NULL,
  250, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 350,
         has_overtime_rate = true,
         overtime_rate = 35,
         corporate_cost = 175,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 350, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 35,
  (SELECT unit_label FROM ft), NULL,
  175, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr (LA/SF/NY)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 100,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 50,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr (LA/SF/NY)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr (LA/SF/NY)', 100, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  50, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr - All other Markets'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr - All other Markets'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr - All other Markets', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 65,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 65, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Creative Costs'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Creative Services Management/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Creative Services Management/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Creative Services Management/ hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 30,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 30, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  15, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  175, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 16,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 8,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 16, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  8, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Tracking'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Tracking'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Tracking', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 160,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 80,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 160, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  80, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 240,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 120,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 240, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  120, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance - Chauffeur (/day/vehicle)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 25,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 12.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance - Chauffeur (/day/vehicle)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance - Chauffeur (/day/vehicle)', 25, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  12.5, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 8,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 4,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 8, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  4, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 16,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 8,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 16, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  8, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 37.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  37.5, false,
  75, true,
  (SELECT id FROM ft), 31, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 0.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  0.5, false,
  75, true,
  (SELECT id FROM ft), 32, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Power Packs'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 80,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 40,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Power Packs'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Power Packs', 80, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  40, false,
  75, true,
  (SELECT id FROM ft), 33, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Go-Jacks'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 160,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 80,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Go-Jacks'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Go-Jacks', 160, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  80, false,
  75, true,
  (SELECT id FROM ft), 34, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volvo')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 35,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 17.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging', 35, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  17.5, false,
  75, true,
  (SELECT id FROM ft), 35, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- Client: Volkswagen
INSERT INTO clients (name, code)
SELECT 'Volkswagen', 'VOLKSWAGEN'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('Volkswagen'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 140,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 70,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 140, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  70, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 110,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 55,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 110, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  55, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 80,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 40,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 80, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  40, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 628.6,
         has_overtime_rate = true,
         overtime_rate = 62.8,
         corporate_cost = 314.3,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 628.6, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 62.8,
  (SELECT unit_label FROM ft), NULL,
  314.3, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 514.3,
         has_overtime_rate = true,
         overtime_rate = 51.4,
         corporate_cost = 257.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 514.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 51.4,
  (SELECT unit_label FROM ft), NULL,
  257.15, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 485.7,
         has_overtime_rate = true,
         overtime_rate = 48.5,
         corporate_cost = 242.85,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 485.7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 48.5,
  (SELECT unit_label FROM ft), NULL,
  242.85, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 377.1,
         has_overtime_rate = true,
         overtime_rate = 37.7,
         corporate_cost = 188.55,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 377.1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 37.7,
  (SELECT unit_label FROM ft), NULL,
  188.55, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 320,
         has_overtime_rate = true,
         overtime_rate = 32,
         corporate_cost = 160,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 320, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32,
  (SELECT unit_label FROM ft), NULL,
  160, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 114.3,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 57.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 114.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  57.15, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Creative Costs'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Creative Services Management/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Creative Services Management/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Creative Services Management/ hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 40,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 20,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 40, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  20, false,
  175, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 289,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 144.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 289, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  144.5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10.75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 10.75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 82.5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 82.5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 60,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 60, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('Volkswagen')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

-- 'No Client' fallback rate card (seeded from Audi tab)
INSERT INTO clients (name, code)
SELECT 'No Client', 'NO_CLIENT'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE lower(name) = lower('No Client'));

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Director/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 140,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 70,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Director/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Director/ hr', 140, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  70, false,
  50, true,
  (SELECT id FROM ft), 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Account Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 110,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 55,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Account Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Account Manager/ hr', 110, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  55, false,
  50, true,
  (SELECT id FROM ft), 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Graphic Design/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 85,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 42.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Graphic Design/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Graphic Design/ hr', 85, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  42.5, false,
  75, true,
  (SELECT id FROM ft), 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Planning & Administration Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Production Manager/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 80,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 40,
         corporate_cost_is_percent = false,
         office_cost = 50,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Production Manager/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Production Manager/ hr', 80, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  40, false,
  50, true,
  (SELECT id FROM ft), 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Director Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 628.6,
         has_overtime_rate = true,
         overtime_rate = 62.8,
         corporate_cost = 314.3,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Director Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Director Day (10 hr)', 628.6, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 62.8,
  (SELECT unit_label FROM ft), NULL,
  314.3, false,
  75, true,
  (SELECT id FROM ft), 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event Manager Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 514.3,
         has_overtime_rate = true,
         overtime_rate = 51.4,
         corporate_cost = 257.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event Manager Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event Manager Day (10 hr)', 514.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 51.4,
  (SELECT unit_label FROM ft), NULL,
  257.15, false,
  75, true,
  (SELECT id FROM ft), 6, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Product Specialist Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 485.7,
         has_overtime_rate = true,
         overtime_rate = 48.5,
         corporate_cost = 242.85,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Product Specialist Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Product Specialist Day (10 hr)', 485.7, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 48.5,
  (SELECT unit_label FROM ft), NULL,
  242.85, false,
  75, true,
  (SELECT id FROM ft), 7, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'In-Vehicle Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 400,
         has_overtime_rate = true,
         overtime_rate = 40,
         corporate_cost = 200,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'In-Vehicle Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'In-Vehicle Host Day (10 hr)', 400, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 40,
  (SELECT unit_label FROM ft), NULL,
  200, false,
  75, true,
  (SELECT id FROM ft), 8, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Event/Vehicle Handler Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 377.1,
         has_overtime_rate = true,
         overtime_rate = 37.7,
         corporate_cost = 188.55,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Event/Vehicle Handler Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Event/Vehicle Handler Day (10 hr)', 377.1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 37.7,
  (SELECT unit_label FROM ft), NULL,
  188.55, false,
  75, true,
  (SELECT id FROM ft), 9, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Registration Host Day (10 hr)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 320,
         has_overtime_rate = true,
         overtime_rate = 32,
         corporate_cost = 160,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Registration Host Day (10 hr)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Registration Host Day (10 hr)', 320, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, true, 32,
  (SELECT unit_label FROM ft), NULL,
  160, false,
  75, true,
  (SELECT id FROM ft), 10, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Professional Chauffeur/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 114.3,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 57.15,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Professional Chauffeur/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Professional Chauffeur/ hr', 114.3, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  57.15, false,
  75, true,
  (SELECT id FROM ft), 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Onsite Event Labor'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Per Diem'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 100,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Per Diem'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Per Diem', 75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  100, true,
  (SELECT id FROM ft), 12, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Creative Costs'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Creative Services Management/ hr'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Creative Services Management/ hr'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Creative Services Management/ hr', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 13, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Detailing Supplies'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Detailing Supplies'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Detailing Supplies', 10, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Show Prep (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 45,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Show Prep (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Show Prep (vehicle/day)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  45, false,
  75, true,
  (SELECT id FROM ft), 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Secondary Prep (/vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 40,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 20,
         corporate_cost_is_percent = false,
         office_cost = 175,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Secondary Prep (/vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Secondary Prep (/vehicle/day)', 40, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  20, false,
  175, true,
  (SELECT id FROM ft), 16, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Support Vehicle (DS vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Support Vehicle (DS vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Support Vehicle (DS vehicle/day)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 17, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Two Way Radios (unit/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 18,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 9,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Two Way Radios (unit/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Two Way Radios (unit/day)', 18, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  9, false,
  75, true,
  (SELECT id FROM ft), 18, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Covers (vehicle/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 2.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Covers (vehicle/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Covers (vehicle/day)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  2.5, false,
  75, true,
  (SELECT id FROM ft), 19, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Tools (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 125,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 62.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Tools (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Tools (/event)', 125, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  62.5, false,
  75, true,
  (SELECT id FROM ft), 20, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Safety Equipment (/event)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 150,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Safety Equipment (/event)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Safety Equipment (/event)', 150, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  75, false,
  75, true,
  (SELECT id FROM ft), 21, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Insurance (/day)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 289,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 144.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Insurance (/day)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Insurance (/day)', 289, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  144.5, false,
  75, true,
  (SELECT id FROM ft), 22, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Pressure Washer (/week)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Pressure Washer (/week)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Pressure Washer (/week)', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 23, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Outdoor Vehicle Storage (/vehicle/day @DriveShop)', 5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  5, false,
  75, true,
  (SELECT id FROM ft), 24, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 10.75,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 10.75,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Indoor Vehicle Storage (/vehicle/day @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Indoor Vehicle Storage (/vehicle/day @DriveShop)', 10.75, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  10.75, false,
  75, true,
  (SELECT id FROM ft), 25, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Equipment Storage (/pallet/month @DriveShop)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 90,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 90,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Equipment Storage (/pallet/month @DriveShop)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Equipment Storage (/pallet/month @DriveShop)', 90, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  90, false,
  75, true,
  (SELECT id FROM ft), 26, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Delivery (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 82.5,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 82.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Delivery (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Delivery (<100 miles)', 82.5, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  82.5, false,
  75, true,
  (SELECT id FROM ft), 27, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'Vehicle Pickup (<100 miles)'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 60,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 66,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'Vehicle Pickup (<100 miles)'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'Vehicle Pickup (<100 miles)', 60, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  66, false,
  75, true,
  (SELECT id FROM ft), 28, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = '+ each additional mile for Pick-up or Delivery'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 1,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 1,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = '+ each additional mile for Pick-up or Delivery'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), '+ each additional mile for Pick-up or Delivery', 1, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  1, false,
  75, true,
  (SELECT id FROM ft), 29, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

WITH c AS (SELECT id FROM clients WHERE lower(name) = lower('No Client')),
     s AS (SELECT id FROM rate_card_sections WHERE name = 'Logistics Expenses'),
     ft AS (SELECT id, gl_code, unit_label FROM fee_types WHERE name = 'EV Charging - Flat Rate'),
     upd AS (
       UPDATE rate_card_items SET
         unit_rate = 45,
         has_overtime_rate = false,
         overtime_rate = NULL,
         corporate_cost = 22.5,
         corporate_cost_is_percent = false,
         office_cost = 75,
         office_cost_is_percent = true,
         is_active = true
       WHERE client_id = (SELECT id FROM c)
         AND name = 'EV Charging - Flat Rate'
       RETURNING id
     )
INSERT INTO rate_card_items (
  client_id, section_id, name, unit_rate, unit_label, gl_code,
  is_from_msa, is_pass_through, has_overtime_rate, overtime_rate,
  overtime_unit_label, overtime_gl_code,
  corporate_cost, corporate_cost_is_percent,
  office_cost, office_cost_is_percent,
  fee_type_id, display_order, is_active, is_rate_locked
)
SELECT
  (SELECT id FROM c), (SELECT id FROM s), 'EV Charging - Flat Rate', 45, (SELECT unit_label FROM ft), (SELECT gl_code FROM ft),
  false, false, false, NULL,
  (SELECT unit_label FROM ft), NULL,
  22.5, false,
  75, true,
  (SELECT id FROM ft), 30, true, false
WHERE NOT EXISTS (SELECT 1 FROM upd);

COMMIT;
