# Estimate Validation Rules

## Missing Item Checks
- If the event spans multiple days AND the location is not the client's home market, check for travel day columns in the schedule. Flag if missing.
- If out-of-market staff are scheduled (resource_type = external), check for per diem, hotel, and airfare line items. Flag any that are missing.
- If the event type is "Ride & Drive", check for vehicle detailing line items in Production. Flag if missing.
- If the event has any labor scheduled, check for insurance line items in Access Fees & Insurance section. Flag if missing.
- If the event spans 3+ days, check for a site survey or advance day. Flag if missing.

## Rate Validation
- Compare each labor entry's unit_rate against the client's MSA rate card. If a rate is more than 15% above or below the MSA rate for that role, flag it.
- If any labor entry has a $0 rate, flag it as likely missing data.
- If custom line items (items not matching any fee_type) represent more than 20% of total revenue, flag for review.

## Staffing Checks
- If the schedule has event days with zero staff assigned, flag it.
- Check the `pre_computed_staffing_mismatches` field. If it is empty or missing, there are NO mismatches — do not flag anything. If it contains entries, report only the exact role names listed there. Never invent or infer role names that are not explicitly in this field.
- If total staff count is less than 3 for a multi-day event, flag as potentially understaffed.

## Financial Guardrails
- If any section's gross profit percentage is below 20%, flag it with the section name and current GP%.
- If the overall estimate GP% is below 20%, flag it as a critical margin warning.
- If pass-through items exist but the client's markup percentage is 0% AND the client normally has a markup, flag it.
- If the cost structure field (corporate vs office) is not set, flag it — the system cannot calculate correct costs without this.

## Structural Validation
- If the estimate has no segments, flag it.
- If any segment has zero line items across all sections, flag it.
- If start_date or end_date is missing, flag it.
- If end_date is before start_date, flag it.
- If attendance is null or zero for event types that typically track attendance (Ride & Drive, Launch Event, Family Day), flag it.

## Historical Comparison (only apply when historical patterns are available)
- If a section's estimated cost is more than 30% below the historical average for this client × event type, flag it as potentially underestimated. Reference the historical average.
- If a section's estimated cost is more than 50% above the historical average, flag it as potentially overestimated. Reference the historical average.
- If the overall estimate total is more than 40% below the historical average for this event type, flag it as unusually low.
- If commonly used roles (frequency > 70%) for this client × event type are missing from the labor log, suggest adding them.
- If a section historically goes over budget more than 60% of the time for this client × event type, proactively warn the estimator to add buffer.
