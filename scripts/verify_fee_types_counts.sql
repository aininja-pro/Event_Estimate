-- (b) Total fee types and linked rate_card_items
SELECT
  (SELECT count(*) FROM fee_types) AS total_fee_types,
  (SELECT count(*) FROM rate_card_items) AS total_rate_card_items,
  (SELECT count(*) FROM rate_card_items WHERE fee_type_id IS NOT NULL) AS linked_items;
