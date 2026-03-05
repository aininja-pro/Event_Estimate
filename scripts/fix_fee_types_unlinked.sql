-- Add the 2 missing fee types
INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order)
VALUES ('Each Add''l Social Media Content Reporting Campaign/ mnth', NULL, 'labor', '/ mnth', 'planning_admin', 112);

INSERT INTO fee_types (name, gl_code, cost_type, unit_label, section, display_order)
VALUES ('Test Coordinator', NULL, 'labor', NULL, 'onsite_labor', 128);

-- Link them
UPDATE rate_card_items rci
SET fee_type_id = ft.id
FROM fee_types ft
WHERE rci.name = ft.name AND rci.fee_type_id IS NULL;
