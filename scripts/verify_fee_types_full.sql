-- (a) Full fee_types table sorted by section and display_order
SELECT name, gl_code, cost_type, unit_label, section, display_order
FROM fee_types
ORDER BY section, display_order;
