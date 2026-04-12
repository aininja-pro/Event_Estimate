-- (c) Spot check: Event Director, Hotels, Radio Rental through fee_types
SELECT
  c.code AS client,
  rci.name AS item_name,
  rci.gl_code AS item_gl_code,
  ft.gl_code AS canonical_gl_code,
  CASE WHEN rci.gl_code = ft.gl_code THEN 'MATCH' ELSE 'MISMATCH' END AS status,
  ft.section,
  ft.cost_type
FROM rate_card_items rci
JOIN fee_types ft ON ft.id = rci.fee_type_id
JOIN clients c ON c.id = rci.client_id
WHERE ft.name IN ('Event Director Day (10 hr)', 'Hotels', 'Radio Rental (unit/day)')
ORDER BY ft.name, c.code;
