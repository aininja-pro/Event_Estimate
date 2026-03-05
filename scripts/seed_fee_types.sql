-- =============================================================================
-- Seed data for fee_types master table
-- Generated from: LUCID tab (source of truth for GL codes)
-- Total Lucid fee types: 47
-- =============================================================================
-- Run AFTER migration_fee_types.sql.
-- Safe to re-run: clears fee_type_id references first, then deletes/reinserts.
-- =============================================================================

-- Clear existing references before re-seeding
UPDATE rate_card_items SET fee_type_id = NULL;
DELETE FROM fee_types;

-- ============================
-- Fee types from LUCID tab
-- ============================

-- Section: planning_admin
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Account Director/ hr', '4000.01', 'labor', '/ hr', 'planning_admin', 1);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Social Media Creator Services Manager/ hr', '4000.01', 'labor', '/ hr', 'planning_admin', 2);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Production Manager/ hr', '4000.01', 'labor', '/ hr', 'planning_admin', 3);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Data Services Manager/ hr', '4000.01', 'labor', '/ hr', 'planning_admin', 4);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Graphic Design/ hr', '4000.04', 'labor', '/ hr', 'planning_admin', 5);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Tech support for FMS development, data reporting/ hr', '4000.01', 'labor', '/ hr', 'planning_admin', 6);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Social Media Content Reporting Campaign/ mnth', '4000.34', 'labor', '/ mnth', 'planning_admin', 7);

-- Section: onsite_labor
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Event Director Day (10 hr)', '4000.26', 'labor', NULL, 'onsite_labor', 1);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Event Manager Day (10 hr)', '4000.17', 'labor', NULL, 'onsite_labor', 2);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Driving Instructor Day (10 hr)', '4000.21', 'labor', NULL, 'onsite_labor', 3);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Product Specialist Day (10 hr)', '4000.16', 'labor', NULL, 'onsite_labor', 4);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Handler Day (10 hr)', '4000.31', 'labor', NULL, 'onsite_labor', 5);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Uniformed Chauffeur Driver (hr)', '4000.32', 'labor', NULL, 'onsite_labor', 6);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Regional Office Manager (hr)', '4000.18', 'labor', NULL, 'onsite_labor', 7);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Per Diem', '4075.07', 'labor', NULL, 'onsite_labor', 8);

-- Section: travel
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Hotels', '4075.04', 'pass_through', NULL, 'travel', 1);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Airfare', '4075.01', 'pass_through', NULL, 'travel', 2);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Rental Vehicles', '4075.02', 'pass_through', NULL, 'travel', 3);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Fuel/Mileage', '4075.03', 'pass_through', NULL, 'travel', 4);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Hotel - Site Inspection', '4075.04', 'pass_through', NULL, 'travel', 5);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Airfare - Site Inspection', '4075.01', 'pass_through', NULL, 'travel', 6);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Rental Vehicles - Site Inspection', '4075.02', 'pass_through', NULL, 'travel', 7);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Fuel/Mileage - Site Inspection', '4075.03', 'pass_through', NULL, 'travel', 8);

-- Section: production
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Venue Fee', '4050.01', 'pass_through', NULL, 'production', 1);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Fuel', '4025.08', 'pass_through', NULL, 'production', 2);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Parking', '4075.16', 'pass_through', NULL, 'production', 3);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Tolls', '4075.19', 'pass_through', NULL, 'production', 4);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Supplies', '4025.21', 'pass_through', NULL, 'production', 5);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Printing', '4025.17', 'pass_through', NULL, 'production', 6);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Shipping', '4025.15', 'pass_through', NULL, 'production', 7);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Permits', '4025.14', 'pass_through', NULL, 'production', 8);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Course Supplies', '4025.21', 'pass_through', NULL, 'production', 9);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Uniforms', '4025.25', 'pass_through', NULL, 'production', 10);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Equipment Rental', '4025.07', 'pass_through', NULL, 'production', 11);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Site Costs', '4025.19', 'pass_through', NULL, 'production', 12);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Public Transportation', '4075.08', 'pass_through', NULL, 'production', 13);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('EV Charging - Pass Through', '4025.08', 'pass_through', NULL, 'production', 14);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Transport', '4025.01', 'pass_through', NULL, 'production', 15);

-- Section: logistics
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Detailing Supplies (vehicle prep)', '4025.05', 'flat_fee', NULL, 'logistics', 1);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Radio Rental (unit/day)', '4025.12', 'flat_fee', '/ day', 'logistics', 2);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Go-Jacks (set/event)', '4025.12', 'flat_fee', '/ event', 'logistics', 3);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Floor Jack (event)', '4025.12', 'flat_fee', NULL, 'logistics', 4);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Tool Kit (event)', '4025.12', 'flat_fee', NULL, 'logistics', 5);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Safety Kit (event)', '4025.12', 'flat_fee', NULL, 'logistics', 6);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Covers (vehicle/day)', '4025.12', 'flat_fee', '/ day', 'logistics', 7);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Pressure Washer (event)', '4025.12', 'flat_fee', NULL, 'logistics', 8);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Event Insurance (day)', '4025.09', 'flat_fee', NULL, 'logistics', 9);

-- ============================
-- Fee types from other clients (not in Lucid): 78
-- GL codes may be NULL or from non-Lucid sources — review these
-- ============================
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Account Manager/ hr', NULL, 'labor', '/ hr', 'planning_admin', 101);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Accounting & Admin Services/ hr', NULL, 'labor', '/ hr', 'planning_admin', 102);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Cellular Phones and Air Time (day)', NULL, 'flat_fee', NULL, 'logistics', 101);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Chauffer Driver Services/ hr', '4000.31.01', 'labor', '/ hr', 'onsite_labor', 101);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Creator Services Manager/ hr', NULL, 'labor', '/ hr', 'planning_admin', 103);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Curriculum  Development/ each', NULL, 'labor', '/ each', 'planning_admin', 104);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Detailing Supplies (each)', NULL, 'flat_fee', NULL, 'logistics', 102);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Detailing Supplies (vehicle/ day)', NULL, 'flat_fee', NULL, 'logistics', 103);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('EV Charging', NULL, 'flat_fee', NULL, 'logistics', 104);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Equipment & Tire Storage/ pallet/month', NULL, 'flat_fee', NULL, 'logistics', 105);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Event Director Day /10 hr', '4000.26', 'labor', NULL, 'onsite_labor', 102);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Event Equipment Storage (pallet/day)', NULL, 'flat_fee', NULL, 'logistics', 106);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Event Insurance Test Drive/ test drive', NULL, 'flat_fee', NULL, 'logistics', 107);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Event Insurance/ day', NULL, 'flat_fee', '/ day', 'logistics', 108);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Event Manager Day /10 hr', '4000.17', 'labor', NULL, 'onsite_labor', 103);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Event/Vehicle Labor Day (10 hr)', NULL, 'labor', NULL, 'onsite_labor', 104);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Fleet Management System & Social Media Content Reporting/ mnth', NULL, 'labor', '/ mnth', 'planning_admin', 105);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Go Jacks (unit/event)', NULL, 'flat_fee', NULL, 'logistics', 109);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Go-Jacks/ set/week', NULL, 'flat_fee', NULL, 'logistics', 110);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Graphic Design/hr', NULL, 'labor', NULL, 'planning_admin', 106);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('In-Vehicle Host Day (10 hr)', NULL, 'labor', NULL, 'onsite_labor', 105);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('In-Vehicle Host Day /10 hr', NULL, 'labor', NULL, 'onsite_labor', 106);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('In-Vehilce Host Day (10 hr)', NULL, 'labor', NULL, 'onsite_labor', 107);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Insurance (day)', NULL, 'flat_fee', NULL, 'logistics', 111);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('LSM Manager/ hr', NULL, 'labor', '/ hr', 'planning_admin', 107);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Liability Insurance (day)', NULL, 'flat_fee', NULL, 'logistics', 112);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Mobile Detailing Sled (unit/day)', NULL, 'flat_fee', NULL, 'logistics', 113);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Office Manager/ hr', NULL, 'labor', '/ hr', 'planning_admin', 108);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Office Operator/ hr', '4000.01', 'labor', '/ hr', 'planning_admin', 109);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Per diem', NULL, 'labor', NULL, 'onsite_labor', 108);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Performance Driver Day (10 hr)', '4000.26.01', 'labor', NULL, 'onsite_labor', 109);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Permit Fee', NULL, 'pass_through', NULL, 'production', 101);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Permit Research/ hr', NULL, 'labor', '/ hr', 'planning_admin', 110);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Power Jacks (unit/event)', NULL, 'flat_fee', NULL, 'logistics', 114);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Power Packs/ pack/week', NULL, 'flat_fee', NULL, 'logistics', 115);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Pressure Washer (unit/day)', NULL, 'flat_fee', NULL, 'logistics', 116);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Pressure Washer/ week', NULL, 'flat_fee', NULL, 'logistics', 117);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Product Specialist Day /10 hr', NULL, 'labor', NULL, 'onsite_labor', 110);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Production Director/ hr', NULL, 'labor', '/ hr', 'planning_admin', 111);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Production Manager Day (10 hr)', '4000.26', 'labor', NULL, 'onsite_labor', 111);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Professional Chauffer Hr', NULL, 'labor', NULL, 'onsite_labor', 112);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Professional Chauffeur Insurance (vehicle)', NULL, 'labor', NULL, 'onsite_labor', 113);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Professional Chauffeur NY, SF, LA Markets (hr)', NULL, 'labor', NULL, 'onsite_labor', 114);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Program Director Day (10 hr)', '4000.26', 'labor', NULL, 'onsite_labor', 115);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Program Labor Day (10 hr)', NULL, 'labor', NULL, 'onsite_labor', 116);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Program Manager Day (10 hr)', '4000.17', 'labor', NULL, 'onsite_labor', 117);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Program Staff Day (10 hr)', NULL, 'labor', NULL, 'onsite_labor', 118);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Promotional Model Day (10 hr)', '4000.17.01', 'labor', NULL, 'onsite_labor', 119);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Promotional Model Day / 10 hr', NULL, 'labor', NULL, 'onsite_labor', 120);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('RSD Day (10 hr)', NULL, 'labor', NULL, 'onsite_labor', 121);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Radios (each/day)', NULL, 'flat_fee', NULL, 'logistics', 118);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Real-time GPS Tracking (vehicle/day)', NULL, 'flat_fee', NULL, 'logistics', 119);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Registration Host Day (10 hr)', NULL, 'labor', NULL, 'onsite_labor', 122);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Registration Staff Day/ 10 hr', NULL, 'labor', NULL, 'onsite_labor', 123);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Registration/Promotional Staff Day (10 hr)', NULL, 'labor', NULL, 'onsite_labor', 124);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Ride & Drive Insurance (per participant)', NULL, 'flat_fee', NULL, 'logistics', 120);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Safety Equipment (event)', NULL, 'flat_fee', NULL, 'logistics', 121);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Safety Equipment/ event', NULL, 'flat_fee', '/ event', 'logistics', 122);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Secondary Prep (vehicle/ day)', NULL, 'flat_fee', NULL, 'logistics', 123);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Show Prep (vehicle/ day)', NULL, 'flat_fee', NULL, 'logistics', 124);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Sterilization and Detailing Supplies (vehicle/ day)', NULL, 'flat_fee', NULL, 'logistics', 125);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Support Vehicle (DS vehicle/day)', NULL, 'flat_fee', NULL, 'logistics', 126);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Support Vehicle (unit/day)', NULL, 'flat_fee', NULL, 'logistics', 127);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Support Vehicles /day', NULL, 'flat_fee', NULL, 'logistics', 128);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Tools (event)', NULL, 'flat_fee', NULL, 'logistics', 129);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Tools/ event', NULL, 'flat_fee', '/ event', 'logistics', 130);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Track Instructor Day (10 hr)', NULL, 'labor', NULL, 'onsite_labor', 125);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Two Way Radios (unit/day)', NULL, 'flat_fee', NULL, 'logistics', 131);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Two-Way Radios/ day/radio', NULL, 'flat_fee', NULL, 'logistics', 132);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Covers (each/day)', NULL, 'flat_fee', NULL, 'logistics', 133);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Covers (unit/day)', NULL, 'flat_fee', NULL, 'logistics', 134);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Handler Day/ 10 hr', NULL, 'labor', NULL, 'onsite_labor', 126);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Handler Hr', NULL, 'labor', NULL, 'onsite_labor', 127);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Show Prep (vehicle/ day)', NULL, 'flat_fee', NULL, 'logistics', 135);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Show Prep /vehicle', NULL, 'flat_fee', NULL, 'logistics', 136);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Storage (vehicle/day@DS)', NULL, 'flat_fee', NULL, 'logistics', 137);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Tracking (per vehicle, key, plates, etc)', NULL, 'flat_fee', NULL, 'logistics', 138);
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order) VALUES ('Vehicle Tracking /vehicle', NULL, 'flat_fee', NULL, 'logistics', 139);

-- ============================
-- Backfill fee_type_id on rate_card_items
-- ============================
UPDATE rate_card_items rci SET fee_type_id = ft.id FROM fee_types ft WHERE rci.name = ft.name;

-- Verify: show any rate_card_items that didn't match a fee_type
-- SELECT rci.name, c.code AS client
-- FROM rate_card_items rci
-- JOIN clients c ON c.id = rci.client_id
-- WHERE rci.fee_type_id IS NULL
-- ORDER BY c.code, rci.name;
