-- Rate card items linkage stats
SELECT
  count(*) AS total_items,
  count(fee_type_id) AS linked,
  count(*) - count(fee_type_id) AS unlinked
FROM rate_card_items;
