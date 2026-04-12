-- Fee types count by section
SELECT section, count(*) FROM fee_types GROUP BY section ORDER BY section;
