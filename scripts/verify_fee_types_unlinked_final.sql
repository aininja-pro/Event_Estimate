-- (d) Any rate_card_items without a fee_type_id
SELECT rci.name, c.code AS client
FROM rate_card_items rci
JOIN clients c ON c.id = rci.client_id
WHERE rci.fee_type_id IS NULL
ORDER BY c.code, rci.name;
