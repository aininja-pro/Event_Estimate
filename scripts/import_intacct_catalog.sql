-- =============================================================================
-- Sprint 019 — Intacct Data: Start Fresh from DriveShop's Catalog
-- Generated from: Item IDs - Dave M Edits_06.24.26.xlsx + Intacct Coding.xlsx
-- FULL REPLACE of test items/prices with the real 160-item catalog.
-- Atomic: the whole load is one transaction. Review before applying.
-- historical_events / historical_patterns are JSON-only and untouched.
-- =============================================================================

BEGIN;

-- A. Detach rate_card_item_id soft-links on existing (test) estimates.
--    Estimate rows copy unit_rate/unit_cost/gl_code/name at creation, so
--    nulling the FK does not change any stored estimate number.
UPDATE estimate_line_items SET rate_card_item_id = NULL WHERE rate_card_item_id IS NOT NULL;
UPDATE schedule_entries    SET rate_card_item_id = NULL WHERE rate_card_item_id IS NOT NULL;
UPDATE labor_entries       SET rate_card_item_id = NULL WHERE rate_card_item_id IS NOT NULL;

-- B. Clear the test per-client prices (rate cards stay EMPTY until real pricing).
DELETE FROM rate_card_items;

-- C. Remove the test fee/item records (now unreferenced).
DELETE FROM fee_types;

-- D. Load the 160 catalog items as the real item foundation.
INSERT INTO fee_types
  (name, section, cost_type, gl_code, intacct_ar_item_id, intacct_ap_gl_account_no, accounting_memo, display_order)
VALUES
  ('Creative', 'creative', 'labor', '4000.04', 'I0007', '5000.04', 'LABOR:Creative', 1),
  ('Route Books', 'logistics', 'flat_fee', '4025.12', 'I0160', '5025.12', 'PASS THROUGH:On-site Equipment', 2),
  ('Route Signs', 'logistics', 'flat_fee', '4025.12', 'I0161', '5025.12', 'PASS THROUGH:On-site Equipment', 3),
  ('Breathalyzers', 'logistics', 'flat_fee', '4025.12', 'I0112', '5025.12', 'PASS THROUGH:On-site Equipment', 4),
  ('Chair Rental', 'logistics', 'flat_fee', '4025.12', 'I0108', '5025.12', 'PASS THROUGH:On-site Equipment', 5),
  ('Cones', 'logistics', 'flat_fee', '4025.12', 'I0109', '5025.12', 'PASS THROUGH:On-site Equipment', 6),
  ('Detailing Supplies', 'logistics', 'flat_fee', '4025.05', 'I0140', '5025.05', 'PASS THROUGH:Detailing', 7),
  ('Fire Extinguishers', 'logistics', 'flat_fee', '4025.12', 'I0113', '5025.12', 'PASS THROUGH:On-site Equipment', 8),
  ('Flat Fee', 'logistics', 'labor', '4000.10', 'I0012', '5000.10', 'LABOR:Flat Fee', 9),
  ('Full Detail', 'logistics', 'flat_fee', '4025.18', 'I0139', '5025.18', 'PASS THROUGH:Show Prep', 10),
  ('Generator', 'logistics', 'flat_fee', '4025.12', 'I0116', '5025.12', 'PASS THROUGH:On-site Equipment', 11),
  ('Insurance', 'logistics', 'flat_fee', '4025.09', 'I0024', '5025.09', 'PASS THROUGH:Insurance', 12),
  ('iPad & Driver''s License Scanner Rental', 'logistics', 'flat_fee', '4025.12', 'I0195', '5025.12', 'PASS THROUGH:On-site Equipment', 13),
  ('LSM Media Research & Vetting', 'logistics', 'flat_fee', '4025.35', 'I0263', '5025.35', 'PASS THROUGH:LSM Media Research & Vetting', 14),
  ('Mileage', 'logistics', 'labor', '4000.13', 'I0050', '5000.13', 'LABOR:Miles', 15),
  ('On Site Equipment', 'logistics', 'flat_fee', '4025.12', 'I0053', '5025.12', 'PASS THROUGH:On-site Equipment', 16),
  ('Power Cords', 'logistics', 'flat_fee', '4025.12', 'I0115', '5025.12', 'PASS THROUGH:On-site Equipment', 17),
  ('Pressure Washer', 'logistics', 'flat_fee', '4025.12', 'I0197', '5025.12', 'PASS THROUGH:On-site Equipment', 18),
  ('Radios', 'logistics', 'flat_fee', '4025.12', 'I0114', '5025.12', 'PASS THROUGH:On-site Equipment', 19),
  ('Registration Materials', 'logistics', 'flat_fee', '4025.12', 'I0105', '5025.12', 'PASS THROUGH:On-site Equipment', 20),
  ('Safety Equipment', 'logistics', 'flat_fee', '4025.12', 'I0153', '5025.12', 'PASS THROUGH:On-site Equipment', 21),
  ('Secondary Prep', 'logistics', 'flat_fee', '4025.18', 'I0151', '5025.18', 'PASS THROUGH:Show Prep', 22),
  ('Service Delivery/Pickup Fee', 'logistics', 'labor', '4000.22', 'I0076', '5000.22', 'LABOR:Vehicle Delivery/Pickup Fee', 23),
  ('Show Prep', 'logistics', 'flat_fee', '4025.18', 'I0149', '5025.18', 'PASS THROUGH:Show Prep', 24),
  ('Spotlight', 'logistics', 'flat_fee', '4000.34', 'I0275', '5000.34', 'LABOR: Spotlight', 25),
  ('Stanchions', 'logistics', 'flat_fee', '4025.12', 'I0110', '5025.12', 'PASS THROUGH:On-site Equipment', 26),
  ('Storage', 'logistics', 'flat_fee', '4025.20', 'I0067', '5025.20', 'PASS THROUGH:Storage', 27),
  ('Support Vehicle(s)', 'logistics', 'flat_fee', '4025.12', 'I0199', '5025.12', 'PASS THROUGH:On-site Equipment', 28),
  ('Table Rental', 'logistics', 'flat_fee', '4025.12', 'I0107', '5025.12', 'PASS THROUGH:On-site Equipment', 29),
  ('Tent Rental', 'logistics', 'flat_fee', '4025.12', 'I0106', '5025.12', 'PASS THROUGH:On-site Equipment', 30),
  ('Tools', 'logistics', 'flat_fee', '4025.12', 'I0154', '5025.12', 'PASS THROUGH:On-site Equipment', 31),
  ('Trailer', 'logistics', 'flat_fee', '4025.12', 'I0117', '5025.12', 'PASS THROUGH:On-site Equipment', 32),
  ('Truck Loading/Unloading & Inspection', 'logistics', 'labor', '4000.10', 'I0157', '5000.10', 'LABOR:Flat Fee', 33),
  ('Vehicle Covers', 'logistics', 'flat_fee', '4025.12', 'I0193', '5025.12', 'PASS THROUGH:On-site Equipment', 34),
  ('Vehicle Pick-up or Delivery', 'logistics', 'labor', '4000.22', 'I0264', '5000.22', 'LABOR:Vehicle Delivery/Pickup Fee', 35),
  ('Vehicle Prep', 'logistics', 'flat_fee', '4025.27', 'I0094', '5025.27', 'PASS THROUGH:Vehicle Prep', 36),
  ('Vehicle Tracking', 'logistics', 'flat_fee', '4025.12', 'I0152', '5025.12', 'PASS THROUGH:On-site Equipment', 37),
  ('Wax', 'logistics', 'flat_fee', '4000.24', 'I0096', '5000.24', 'LABOR:Wax', 38),
  ('Wristbands', 'logistics', 'flat_fee', '4025.28', 'I0111', '5025.28', 'PASS THROUGH:Wristbands', 39),
  ('Production Labor-Route Design', 'onsite_labor', 'labor', '4000.08', 'I0163', '5000.08', 'LABOR:Event Staff', 40),
  ('Assistant Event Manager Days', 'onsite_labor', 'labor', '4000.27', 'I0250', '5000.27', 'LABOR:Assistant Event Manager', 41),
  ('Assistant Event Manager Training or O/T Hours', 'onsite_labor', 'labor', '4000.27.01', 'I0251', '5000.27.01', 'LABOR:Assistant Event Manager Training or O/T', 42),
  ('CDL/DOT Days', 'onsite_labor', 'labor', '4000.30', 'I0256', '5000.30', 'LABOR:CDL/DOT', 43),
  ('CDL/DOT O/T Hours', 'onsite_labor', 'labor', '4000.30.01', 'I0257', '5000.30.01', 'LABOR:CDL/DOT O/T', 44),
  ('Contract Labor', 'onsite_labor', 'labor', '4000.02', 'I0099', '5000.02', 'LABOR:Contract Labor', 45),
  ('Course Development Labor', 'onsite_labor', 'labor', '4000.03', 'I0100', '5000.03', 'LABOR: Course Engineer', 46),
  ('Course Engineer Days', 'onsite_labor', 'labor', '4000.03', 'I0242', '5000.03', 'LABOR: Course Engineer', 47),
  ('Course Engineer O/T', 'onsite_labor', 'labor', '4000.03.01', 'I0243', '5000.03.01', 'LABOR: Course Engineer O/T', 48),
  ('Course Labor Days', 'onsite_labor', 'labor', '4000.08', 'I0244', '5000.08', 'LABOR:Event Staff', 49),
  ('Course Labor O/T Hours', 'onsite_labor', 'labor', '4000.08.01', 'I0245', '5000.08.01', 'LABOR:Event Staff/Course Labor O/T', 50),
  ('Curriculum Developer/Trainer', 'onsite_labor', 'labor', '4000.05', 'I0102', '5000.05', 'LABOR:Curriculum Developer/Trainer', 51),
  ('Drive Experience Manager Days', 'onsite_labor', 'labor', '4000.28', 'I0252', '5000.28', 'LABOR:Drive Experience Manager', 52),
  ('Drive Experience Manager O/T Hours', 'onsite_labor', 'labor', '4000.28.01', 'I0253', '5000.28.01', 'LABOR:Drive Experience Manager O/T', 53),
  ('Event Director Days', 'onsite_labor', 'labor', '4000.26', 'I0248', '5000.26', 'LABOR:Program/Event Director', 54),
  ('Event Director O/T Hours', 'onsite_labor', 'labor', '4000.26.01', 'I0249', '5000.26.01', 'LABOR:Program/Event Director O/T', 55),
  ('Event Labor', 'onsite_labor', 'labor', '4000.08', 'I0027', '5000.08', 'LABOR:Event Staff', 56),
  ('Event Labor OT Hours', 'onsite_labor', 'labor', '4000.08.01', 'I0028', '5000.08.01', 'LABOR:Event Staff/Course Labor O/T', 57),
  ('Event Manager Days', 'onsite_labor', 'labor', '4000.17', 'I0208', '5000.17', 'LABOR:Program/Event/Vehicle Manager', 58),
  ('Event Manager O/T Hours', 'onsite_labor', 'labor', '4000.17.01', 'I0209', '5000.17.01', 'LABOR:Program/Event/Vehicle Manager O/T', 59),
  ('Event Staff', 'onsite_labor', 'labor', '4000.08', 'I0029', '5000.08', 'LABOR:Event Staff', 60),
  ('Event Staff- OT', 'onsite_labor', 'labor', '4000.08.01', 'I0030', '5000.08.01', 'LABOR:Event Staff/Course Labor O/T', 61),
  ('Field Management', 'onsite_labor', 'labor', '4000.09', 'I0103', '5000.09', 'LABOR:Field Management', 62),
  ('Front of House Manager Days', 'onsite_labor', 'labor', '4000.29', 'I0254', '5000.29', 'LABOR:Front of House Manager', 63),
  ('Front of House Manager O/T hours', 'onsite_labor', 'labor', '4000.29.01', 'I0255', '5000.29.01', 'LABOR:Front of House Manager O/T', 64),
  ('Host/Promotional Model Days', 'onsite_labor', 'labor', '4000.25', 'I0246', '5000.25', 'LABOR:Host/Promotional Model', 65),
  ('Host/Promotional Model O/T Hours', 'onsite_labor', 'labor', '4000.25.01', 'I0247', '5000.25.01', 'LABOR:Host/Promotional Model O/T', 66),
  ('In-Vehicle Host Days', 'onsite_labor', 'labor', '4000.21', 'I0212', '5000.21', 'LABOR:Right Seat Driver/In-Vehicle Host', 67),
  ('In-Vehicle Host O/T Hours', 'onsite_labor', 'labor', '4000.21.01', 'I0213', '5000.21.01', 'LABOR:Right Seat Driver/In-Vehicle Host O/T', 68),
  ('Mechanic', 'onsite_labor', 'labor', '4000.12', 'I0104', '5000.12', 'LABOR:Mechanic', 69),
  ('Mobile Instructor Days', 'onsite_labor', 'labor', '4000.17', 'I0276', '5000.17', 'LABOR:Program/Event/Vehicle Manager', 70),
  ('Mobile Instructor OT Hours', 'onsite_labor', 'labor', '4000.17.01', 'I0277', '5000.17.01', 'LABOR:Program/Event/Vehicle Manager O/T', 71),
  ('Performance Driver', 'onsite_labor', 'labor', '4000.14', 'I0032', '5000.14', 'LABOR:Performance Driver', 72),
  ('Performance Driver OT Hours', 'onsite_labor', 'labor', '4000.14.01', 'I0033', '5000.14.01', 'LABOR:Performance Driver O/T', 73),
  ('Performance Driver- Travel', 'onsite_labor', 'labor', '4000.14', 'I0118', '5000.14', 'LABOR:Performance Driver', 74),
  ('Performance Driver- Travel O/T', 'onsite_labor', 'labor', '4000.14.01', 'I0119', '5000.14.01', 'LABOR:Performance Driver O/T', 75),
  ('Product Specialist Days', 'onsite_labor', 'labor', '4000.16', 'I0210', '5000.16', 'LABOR:Product Specialist', 76),
  ('Product Specialist O/T Hours', 'onsite_labor', 'labor', '4000.16.01', 'I0211', '5000.16.01', 'LABOR:Product Specialist O/T', 77),
  ('Product Specialist- Travel', 'onsite_labor', 'labor', '4000.16', 'I0120', '5000.16', 'LABOR:Product Specialist', 78),
  ('Product Specialist- Travel O/T', 'onsite_labor', 'labor', '4000.16.01', 'I0121', '5000.16.01', 'LABOR:Product Specialist O/T', 79),
  ('Production Manager Days', 'onsite_labor', 'labor', '4000.17', 'I0268', '5000.17', 'LABOR:Program/Event/Vehicle Manager', 80),
  ('Production Manager O/T Hours', 'onsite_labor', 'labor', '4000.17.01', 'I0269', '5000.17.01', 'LABOR:Program/Event/Vehicle Manager O/T', 81),
  ('Professional Chauffeur Days', 'onsite_labor', 'labor', '4000.32', 'I0216', '5000.32', 'LABOR:Professional Chauffeur', 82),
  ('Professional Chauffeur Hours', 'onsite_labor', 'labor', '4000.32', 'I0217', '5000.32', 'LABOR:Professional Chauffeur', 83),
  ('Program Coordinator', 'onsite_labor', 'labor', '4000.18', 'I0037', '5000.18', 'LABOR:Program Operations', 84),
  ('Program Director Days', 'onsite_labor', 'labor', '4000.26', 'I0200', '5000.26', 'LABOR:Program/Event Director', 85),
  ('Program Director O/T Hours', 'onsite_labor', 'labor', '4000.26.01', 'I0201', '5000.26.01', 'LABOR:Program/Event Director O/T', 86),
  ('Program Manager Days', 'onsite_labor', 'labor', '4000.17', 'I0206', '5000.17', 'LABOR:Program/Event/Vehicle Manager', 87),
  ('Program Manager O/T Hours', 'onsite_labor', 'labor', '4000.17.01', 'I0207', '5000.17.01', 'LABOR:Program/Event/Vehicle Manager O/T', 88),
  ('Promo Specialist Days', 'onsite_labor', 'labor', '4000.19', 'I0038', '5000.19', 'LABOR:Registration Host/Promo Specialist', 89),
  ('Promo Specialist O/T Hours', 'onsite_labor', 'labor', '4000.19.01', 'I0039', '5000.19.01', 'LABOR:Registration Host/Promo Specialist O/T', 90),
  ('Promo Specialist- Travel', 'onsite_labor', 'labor', '4000.19', 'I0122', '5000.19', 'LABOR:Registration Host/Promo Specialist', 91),
  ('Promo Specialist- Travel O/T', 'onsite_labor', 'labor', '4000.19.01', 'I0123', '5000.19.01', 'LABOR:Registration Host/Promo Specialist O/T', 92),
  ('Registration Host Days', 'onsite_labor', 'labor', '4000.19', 'I0214', '5000.19', 'LABOR:Registration Host/Promo Specialist', 93),
  ('Registration Host O/T Hours', 'onsite_labor', 'labor', '4000.19.01', 'I0215', '5000.19.01', 'LABOR:Registration Host/Promo Specialist O/T', 94),
  ('Right Seat Chaperone', 'onsite_labor', 'labor', '4000.21', 'I0040', '5000.21', 'LABOR:Right Seat Driver/In-Vehicle Host', 95),
  ('Right Seat Driver', 'onsite_labor', 'labor', '4000.21', 'I0041', '5000.21', 'LABOR:Right Seat Driver/In-Vehicle Host', 96),
  ('Right Seat Driver - Travel O/T', 'onsite_labor', 'labor', '4000.21.01', 'I0125', '5000.21.01', 'LABOR:Right Seat Driver/In-Vehicle Host O/T', 97),
  ('Right Seat Driver OT Hours', 'onsite_labor', 'labor', '4000.21.01', 'I0042', '5000.21.01', 'LABOR:Right Seat Driver/In-Vehicle Host O/T', 98),
  ('Right Seat Driver- Travel', 'onsite_labor', 'labor', '4000.21', 'I0124', '5000.21', 'LABOR:Right Seat Driver/In-Vehicle Host', 99),
  ('Talent/Recruiter', 'onsite_labor', 'labor', '4000.23', 'I0079', '5000.23', 'LABOR:Talent Recruiter', 100),
  ('Team Lead', 'onsite_labor', 'labor', '4000.07', 'I0043', '5000.07', 'LABOR:Event Lead', 101),
  ('Team Lead OT Hours', 'onsite_labor', 'labor', '4000.07.01', 'I0044', '5000.07.01', 'LABOR:Event Lead O/T', 102),
  ('Team Lead- Travel', 'onsite_labor', 'labor', '4000.07', 'I0126', '5000.07', 'LABOR:Event Lead', 103),
  ('Team Lead- Travel O/T', 'onsite_labor', 'labor', '4000.07.01', 'I0127', '5000.07.01', 'LABOR:Event Lead O/T', 104),
  ('Vehicle Labor Days', 'onsite_labor', 'labor', '4000.31', 'I0204', '5000.31', 'LABOR:Vehicle Labor', 105),
  ('Vehicle Labor O/T Hours', 'onsite_labor', 'labor', '4000.31.01', 'I0205', '5000.31.01', 'LABOR:Vehicle Labor O/T', 106),
  ('Vehicle Manager Days', 'onsite_labor', 'labor', '4000.17', 'I0202', '5000.17', 'LABOR:Program/Event/Vehicle Manager', 107),
  ('Vehicle Manager O/T Hours', 'onsite_labor', 'labor', '4000.17.01', 'I0203', '5000.17.01', 'LABOR:Program/Event/Vehicle Manager O/T', 108),
  ('Account Management', 'planning_admin', 'labor', '4000.01', 'I0002', '5000.01', 'LABOR:Account Management', 109),
  ('Account/Program Director', 'planning_admin', 'labor', '4000.01', 'I0184', '5000.01', 'LABOR:Account Management', 110),
  ('Account/Program Manager', 'planning_admin', 'labor', '4000.01', 'I0186', '5000.01', 'LABOR:Account Management', 111),
  ('Customer Service', 'planning_admin', 'labor', '4000.01', 'I0183', '5000.01', 'LABOR:Account Management', 112),
  ('Management Fee - Planning & Administration', 'planning_admin', 'labor', '4000.01', 'I0155', '5000.01', 'LABOR:Account Management', 113),
  ('Production/Event Manager', 'planning_admin', 'labor', '4000.01', 'I0187', '5000.01', 'LABOR:Account Management', 114),
  ('Vehicle Manager', 'planning_admin', 'labor', '4000.01', 'I0185', '5000.01', 'LABOR:Account Management', 115),
  ('EV Charging', 'production', 'pass_through', '4025.08', 'I00601', '5025.08', 'PASS THROUGH:Fuel', 116),
  ('Auto Transport', 'production', 'pass_through', '4025.01', 'I0055', '5025.01', 'PASS THROUGH:Auto Transport', 117),
  ('Box Truck Rental', 'production', 'pass_through', '4025.02', 'I0056', '5025.02', 'PASS THROUGH:Box Truck Rental', 118),
  ('Catering/Guest Food & Beverage', 'production', 'pass_through', '4025.30', 'I0162', '5025.30', 'PASS THROUGH:Catering/Guest Food & Beverage', 119),
  ('Detailing', 'production', 'pass_through', '4025.05', 'I0057', '5025.05', 'PASS THROUGH:Detailing', 120),
  ('Electrical/Setup, Union Labor', 'production', 'pass_through', '4025.31', 'I0259', '5025.31', 'PASS THROUGH:Electrical/Setup, Union Labor', 121),
  ('Equipment Purchases', 'production', 'pass_through', '4025.06', 'I0058', '5025.06', 'PASS THROUGH:Equipment Purchases', 122),
  ('Equipment Rental', 'production', 'pass_through', '4025.07', 'I0059', '5025.07', 'PASS THROUGH:Equipment Rental', 123),
  ('Event Access Fee', 'production', 'pass_through', '4050.01', 'I0009', '5050.01', 'ACCESS & SPONSORSHIPS:Event Access Fee', 124),
  ('Fuel/Mileage Operations', 'production', 'pass_through', '4025.08', 'I0060', '5025.08', 'PASS THROUGH:Fuel', 125),
  ('IPad Monthly Fees', 'production', 'pass_through', '4025.29', 'I0258', '5025.29', 'PASS THROUGH:IPad Monthly Fees', 126),
  ('Parking Operations', 'production', 'pass_through', '4025.13', 'I0061', '5025.13', 'PASS THROUGH:Parking', 127),
  ('Permits', 'production', 'pass_through', '4025.14', 'I0062', '5025.14', 'PASS THROUGH:Permits', 128),
  ('Premiums', 'production', 'pass_through', '4025.16', 'I0063', '5025.16', 'PASS THROUGH:Premiums', 129),
  ('Printing', 'production', 'pass_through', '4025.17', 'I0064', '5025.17', 'PASS THROUGH:Printing', 130),
  ('Security', 'production', 'pass_through', '4025.32', 'I0260', '5025.32', 'PASS THROUGH:Security', 131),
  ('Shipping', 'production', 'pass_through', '4025.15', 'I0065', '5025.15', 'PASS THROUGH:Postage & Shipping', 132),
  ('Site Cost', 'production', 'pass_through', '4025.19', 'I0066', '5025.19', 'PASS THROUGH:Site Costs', 133),
  ('Social Influencer Placement', 'production', 'pass_through', '4025.33', 'I0261', '5025.33', 'PASS THROUGH:Social Influencer Placement', 134),
  ('Supplies', 'production', 'pass_through', '4025.21', 'I0068', '5025.21', 'PASS THROUGH:Supplies', 135),
  ('Tolls Operations', 'production', 'pass_through', '4025.23', 'I0070', '5025.23', 'PASS THROUGH:Tolls', 136),
  ('Training Venue Rental', 'production', 'pass_through', '4025.34', 'I0262', '5025.34', 'PASS THROUGH:Training Venue Rental', 137),
  ('Transportation', 'production', 'pass_through', '4025.24', 'I0071', '5025.24', 'PASS THROUGH:Transportation', 138),
  ('Uniforms', 'production', 'pass_through', '4025.25', 'I0072', '5025.25', 'PASS THROUGH:Uniforms', 139),
  ('Vehicle Maintenance', 'production', 'pass_through', '4025.26', 'I0073', '5025.26', 'PASS THROUGH:Vehicle Maintenance', 140),
  ('Event Travel - Airfare', 'travel', 'pass_through', '4075.01', 'I0081', '5075.01', 'EVENT TRAVEL:Airfare', 141),
  ('Event Travel - Car Rental', 'travel', 'pass_through', '4075.02', 'I0082', '5075.02', 'EVENT TRAVEL:Car Rental', 142),
  ('Event Travel - Gas', 'travel', 'pass_through', '4075.03', 'I0083', '5075.03', 'EVENT TRAVEL:Gas/Mileage', 143),
  ('Event Travel - Hotel', 'travel', 'pass_through', '4075.04', 'I0084', '5075.04', 'EVENT TRAVEL:Hotel', 144),
  ('Event Travel - Meals', 'travel', 'pass_through', '4075.05', 'I0085', '5075.05', 'EVENT TRAVEL:Meals', 145),
  ('Event Travel - Mileage', 'travel', 'pass_through', '4075.03', 'I0086', '5075.03', 'EVENT TRAVEL:Gas/Mileage', 146),
  ('Event Travel - Parking', 'travel', 'pass_through', '4075.06', 'I0087', '5075.06', 'EVENT TRAVEL:Parking', 147),
  ('Event Travel - Taxi', 'travel', 'pass_through', '4075.08', 'I0088', '5075.08', 'EVENT TRAVEL:Taxi', 148),
  ('Event Travel - Tolls', 'travel', 'pass_through', '4075.09', 'I0089', '5075.09', 'EVENT TRAVEL:Tolls', 149),
  ('Per Diem', 'travel', 'pass_through', '4075.07', 'I0090', '5075.07', 'EVENT TRAVEL:Per Diem', 150),
  ('Site Inspection - Airfare', 'travel', 'pass_through', '4075.11', 'I0128', '5075.11', 'EVENT TRAVEL:Site Inspection - Airfare', 151),
  ('Site Inspection - Car Rental', 'travel', 'pass_through', '4075.12', 'I0129', '5075.12', 'EVENT TRAVEL:Site Inspection - Car Rental', 152),
  ('Site Inspection - Fuel', 'travel', 'pass_through', '4075.13', 'I0130', '5075.13', 'EVENT TRAVEL:Site Inspection - Fuel', 153),
  ('Site Inspection - Hotel', 'travel', 'pass_through', '4075.14', 'I0132', '5075.14', 'EVENT TRAVEL:Site Inspection - Hotel', 154),
  ('Site Inspection - Meals', 'travel', 'pass_through', '4075.05', 'I0133', '5075.05', 'EVENT TRAVEL:Meals', 155),
  ('Site Inspection - Mileage', 'travel', 'pass_through', '4075.15', 'I0131', '5075.15', 'EVENT TRAVEL:Site Inspection - Mileage', 156),
  ('Site Inspection - Parking', 'travel', 'pass_through', '4075.16', 'I0134', '5075.16', 'EVENT TRAVEL:Site Inspection - Parking', 157),
  ('Site Inspection - Per Diem', 'travel', 'pass_through', '4075.17', 'I0135', '5075.17', 'EVENT TRAVEL:Site Inspection - Per Diem', 158),
  ('Site Inspection - Taxi', 'travel', 'pass_through', '4075.18', 'I0136', '5075.18', 'EVENT TRAVEL:Site Inspection - Taxi', 159),
  ('Site Inspection - Tolls', 'travel', 'pass_through', '4075.19', 'I0137', '5075.19', 'EVENT TRAVEL:Site Inspection - Tolls', 160);

-- E1. office_accounting_profiles (15) — idempotent on office_name.
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('Atlanta', 'Dynamic Automotive & Media, LLC', 'V00302', '45', '1000-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('Charlotte', 'Performance Logistics', 'V02086', '30', '1900-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('Chicago', 'MMH Automotive LLC', 'V00583', '45', '1050-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('Commerce', 'Perfect Circle, Inc.', 'V00696', '45', '1650-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('Dallas', 'Three Two Media Inc.', 'V00953', '45', '1100-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('Denver', 'Three Two Media Inc.', 'V00953', '45', '1150-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('Detroit', 'Kittenzo LLC', 'V03331', '45', '1200-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('Houston', 'Three Two Media Inc.', 'V00953', '45', '1600-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('LA', 'Perfect Circle, Inc.', 'V00696', '45', '1250-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('Miami', 'Dynamic Automotive & Media, LLC', 'V00302', '45', '1300-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('NY', 'SHO Entertainment Group LLC', 'V03330', '45', '1350-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('Phoenix', 'Three Two Media Inc.', 'V00953', '45', '1400-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('SF', 'ALCP Services, LLC', 'V00036', '30', '1460-100')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('Seattle', 'ALCP Services, LLC', 'V00036', '30', '1500-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;
INSERT INTO office_accounting_profiles (office_name, legal_name, intacct_vendor_id, default_payment_terms, default_location_id)
  VALUES ('DC', 'Dynamic Automotive & Media, LLC', 'V00302', '45', '1550-200')
  ON CONFLICT (office_name) DO UPDATE SET legal_name = EXCLUDED.legal_name, intacct_vendor_id = EXCLUDED.intacct_vendor_id, default_payment_terms = EXCLUDED.default_payment_terms, default_location_id = EXCLUDED.default_location_id, active = true;

-- E2. revenue_segments (10) — idempotent on name.
INSERT INTO revenue_segments (name, code, sort_order) VALUES ('Auto Media Events', '150', 1) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, sort_order = EXCLUDED.sort_order, active = true;
INSERT INTO revenue_segments (name, code, sort_order) VALUES ('Auto Media Loans', '200', 2) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, sort_order = EXCLUDED.sort_order, active = true;
INSERT INTO revenue_segments (name, code, sort_order) VALUES ('Experiential', '300', 3) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, sort_order = EXCLUDED.sort_order, active = true;
INSERT INTO revenue_segments (name, code, sort_order) VALUES ('Exp Affiliate Events', '310', 4) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, sort_order = EXCLUDED.sort_order, active = true;
INSERT INTO revenue_segments (name, code, sort_order) VALUES ('Exp Affiliate Fleet', '320', 5) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, sort_order = EXCLUDED.sort_order, active = true;
INSERT INTO revenue_segments (name, code, sort_order) VALUES ('Lifestyle Media Events', '450', 6) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, sort_order = EXCLUDED.sort_order, active = true;
INSERT INTO revenue_segments (name, code, sort_order) VALUES ('Lifestyle Media Loans', '500', 7) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, sort_order = EXCLUDED.sort_order, active = true;
INSERT INTO revenue_segments (name, code, sort_order) VALUES ('Content Production', '700', 8) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, sort_order = EXCLUDED.sort_order, active = true;
INSERT INTO revenue_segments (name, code, sort_order) VALUES ('Media Buying', '750', 9) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, sort_order = EXCLUDED.sort_order, active = true;
INSERT INTO revenue_segments (name, code, sort_order) VALUES ('Admin Services', '800', 10) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, sort_order = EXCLUDED.sort_order, active = true;

-- E3. clients.intacct_customer_id — 7 clean name matches (guarded).
UPDATE clients SET intacct_customer_id = 'C0121' WHERE lower(name) = lower('Genesis');  -- Genesis
UPDATE clients SET intacct_customer_id = 'C0019' WHERE lower(name) = lower('Hyundai');  -- Hyundai
UPDATE clients SET intacct_customer_id = 'C0156' WHERE lower(name) = lower('Lamborghini');  -- Lamborghini
UPDATE clients SET intacct_customer_id = 'C0028' WHERE lower(name) = lower('Maserati');  -- Maserati
UPDATE clients SET intacct_customer_id = 'C0029' WHERE lower(name) = lower('Mazda');  -- Mazda
UPDATE clients SET intacct_customer_id = 'C0048' WHERE lower(name) = lower('Toyota');  -- Toyota
UPDATE clients SET intacct_customer_id = 'C0099' WHERE lower(name) = lower('Volvo');  -- Volvo

COMMIT;
