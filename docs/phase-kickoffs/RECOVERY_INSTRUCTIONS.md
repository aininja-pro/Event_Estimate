# EMERGENCY RECOVERY: Real Data Rebuild

## WHAT HAPPENED
A sample data generator (generate-sample-data.ts) overwrote real extraction output files. The original xlsx files and extraction script are gone from this project. We need to recover everything.

## RULES FOR THIS RECOVERY
- COMMIT to git after EVERY step
- NEVER .gitignore JSON output files
- DELETE generate-sample-data.ts permanently
- Test with 5 files first before full batch runs

---

## STEP 1: Re-download the spreadsheets

The file `DriveShop_Project_List.xlsx` in the project root has ~1,576 rows. Column B contains download URLs for every estimate spreadsheet (JotForm URLs).

1. Read the Project List with openpyxl
2. Extract all URLs from column B
3. Download each file into a directory called `historical_estimates/`
4. URL-decode filenames (e.g. %20 becomes space)
5. Skip non-xlsx URLs (there are ~13 PDFs and JPGs)
6. Log progress every 50 files
7. Report total downloaded and any failures
8. Expect ~1,550 xlsx files when done

GIT COMMIT after this step.

---

## STEP 2: Parse the Project List into a lookup table

Read `DriveShop_Project_List.xlsx` and build a JSON lookup.

Column mapping:
- A: submission_date
- B: download_url (extract filename as join key)
- C: client
- D: client_contact
- E: lead_office
- F: project_id
- G: submitter_name
- I: event_manager
- J: recap_submit_date
- K: po_number
- L: pipeline_probability
- M: event_location_state
- N: revision_notes
- O: net_revenue (numeric)
- P: processed_for_billing
- Q: invoice_number
- R: status (Invoiced, Recap, Duplicate, Billed In FMS, Cancelled)
- S: event_name
- T: event_start_date
- U: event_end_date
- V: initial_estimate_amount (numeric)
- W: revenue_segment
- Z: approved_by
- AA: approved_date
- AB: final_invoice_amount (numeric)
- AD: submission_id

Save as `project_list_parsed.json`

Note: ~18 filenames appear more than once. Keep all rows, flag duplicates.

GIT COMMIT after this step.

---

## STEP 3: Scan every spreadsheet and extract data

For each .xlsx file in `historical_estimates/`, extract the following. Use openpyxl with data_only=True.

### A. Basic file info
- filename (this is the join key to the Project List)
- sheet_names (list of all tab names)
- sheet_row_counts (dict of tab name → row count)

### B. Detect template format

**FORMAT_A** (96% of files): Has an "Overview" tab AND any tab with "Templates" in the name AND GL codes in column A (decimal numbers like 4000.16, 4000.26).

**FORMAT_B** (rare): Has P&L summary rows 4-13 with keywords like "Revenue", "Net Rev", "Per Activation Total" in columns B or O. No GL codes.

**FORMAT_UNKNOWN**: Neither pattern matches.

### C. Section detection

This is the most critical part. Scan ALL rows in column B of every client/estimate tab.

Match against this EXACT whitelist only. No substring matching. Strip whitespace before comparing.

```
SECTION_HEADERS = {
    "PLANNING & ADMINISTRATION",
    "ACCESS/SPONSORSHIP FEES",
    "VENUE ACCESS & FEES",
    "ONSITE LABOR ACTIVITY",
    "TRAVEL EXPENSES",
    "TRAVEL EXPENSES & FEES",
    "CREATIVE COSTS",
    "CREATIVE EXPENSES",
    "PRODUCTION EXPENSES",
    "MISC EXPENSES",
    "LOGISTICS EXPENSES",
    "OTHER",
    "AGENCY FEES",
}
```

CRITICAL RULES:
- "Production Manager" is a LINE ITEM, NOT a section. Do not match it.
- "Production Manager, Accounting Services" is a LINE ITEM. Do not match it.
- Match must be exact (after strip/upper). No partial or substring matching.
- Scan ALL rows from row 1 to max_row. Never stop early.

Map aliases to canonical names:
- "VENUE ACCESS & FEES" → "ACCESS/SPONSORSHIP FEES"
- "TRAVEL EXPENSES & FEES" → "TRAVEL EXPENSES"
- "CREATIVE EXPENSES" → "CREATIVE COSTS"
- "MISC EXPENSES" → "PRODUCTION EXPENSES"

For each section found, record:
- canonical_name
- section_exists: true
- start_row: row of the section header
- total_row: row of the "Total ..." line for that section
- bid_total: value in column H at total_row
- recap_total: value in column V at total_row (FORMAT_A only)

Also find and record:
- grand_total: value in column H at the "Grand Total" row

### D. Financial header extraction

**FORMAT_A** — from the first client-specific tab (not Overview, not Templates), rows 3-7:
- bid_gross: cell K4
- bid_net: cell K5
- bid_margin_dollars: cell L4
- bid_margin_pct: cell M4
- recap_gross: cell X4
- recap_net: cell X5
- recap_margin_dollars: cell Y4
- recap_margin_pct: cell Z4
- payout: cell N4

**FORMAT_B** — rows 4-9, columns O-P:
- revenue: cell P4
- net_rev: cell P5
- gm: cell P7

### E. Labor roles and rates

From ONSITE LABOR ACTIVITY section ONLY (rows between the section header and the total row):

For each row:
- role: column B value
- unit_rate: column E value (the client-facing rate)
- gl_code: column A value (FORMAT_A only — decimal format like 4000.26, 4000.17, 4000.32)
- cost_rate: column M value (if present)
- has_ot_variant: true if role name contains "OT", ">10hrs", or ">10 hrs"

Only include rows where unit_rate > 0.
Skip rows where column B is empty, "---", or is the section header/total row.

### F. Recap data detection

Check if columns T through Z have any non-zero numeric values in rows 10-110. If yes, has_recap_data = true.

### G. Multi-version detection

Look for multiple tabs that share a common prefix with date suffixes (e.g. "Audi Event 1/15", "Audi Event 2/20"). Record as version_tabs if found.

### H. Client tabs

List all tabs that are NOT "Overview", "Templates", "ROS", "Labor Log", or "Template". These are client-specific tabs.

---

## STEP 4: Build the rate card master

From ALL scanned files, aggregate labor roles:

For each unique role name (normalized — strip extra spaces, normalize parentheses):
- role: the role name
- gl_codes: list of all unique GL codes seen for this role
- occurrences: how many files this role appeared in
- has_ot_variant: true if an OT version exists
- unit_rate_range: {min, max, avg, median} across all files
- cost_rate_range: {min, max, avg, median} across all files (if available)

Save as `rate_card_master.json`

Expected output: ~136 unique roles. The most common should be:
- Professional Chauffeur ( / hr): ~1,676 occurrences, GL codes 4000.16/4000.19/4000.21/4000.32, rate $70-$115
- Per Diem: ~1,643 occurrences
- In-Vehicle Host ( / 10 hr day): ~1,478 occurrences, rate $325-$400
- Product Specialist ( / 10 hr day): ~1,420 occurrences, rate $350-$486
- Program Director ( / 10 hr day): ~1,223 occurrences, GL 4000.16/4000.17/4000.26, rate $550-$1,000

If your output shows fewer than 100 roles or the top role has fewer than 1,000 occurrences, something is wrong.

GIT COMMIT after this step.

---

## STEP 5: Join scan results to Project List

For each scanned file, match to Project List by filename.

Create `enriched_master_index.json` — one record per scanned file with ALL Project List fields merged in plus ALL scan fields.

Also create `join_report.json`:
- matched: files in both scan and Project List
- scan_only: files scanned but not in Project List (these are revised/updated versions)
- list_only: files in Project List but not scanned (PDFs, corrupted files)
- duplicate_filenames: filenames appearing multiple times in Project List

Expected: ~1,518 matched, ~141 scan-only, ~36 list-only.

GIT COMMIT after this step.

---

## STEP 6: Build summary files

### financial_summary.json
Aggregate from enriched_master_index:
- total events, total revenue (sum of grand_total)
- grand_total_ranges: min, max, avg, median, total
- files_with_bid_and_recap: count where has_recap_data = true
- by_client: dict of client → {event_count, total_revenue, avg_event_size}
- by_lead_office: dict of office → {event_count, total_revenue, avg_event_size}
- by_revenue_segment: dict of segment → {event_count, total_revenue}
- by_status: dict of status → count

### section_summary.json
For each canonical section name:
- files_where_exists: count
- files_with_nonzero_bid: count
- files_with_nonzero_recap: count
- total_bid_dollars: sum across all files
- total_recap_dollars: sum across all files

Expected cost distribution:
- Onsite Labor: ~$7.4M (49%)
- Logistics: ~$3.2M (21%)
- Production: ~$1.8M (12%)
- Planning & Admin: ~$1.7M (11%)
- Travel: ~$1.1M (7%)

GIT COMMIT after this step.

---

## STEP 7: Rebuild the React app with real data

Once all JSON files are regenerated with real data:

1. Delete generate-sample-data.ts permanently
2. Update all three views (Historical Dashboard, Historical Rate Analysis, AI Scoping Assistant) to load from the real JSON files
3. Verify the Historical Rate Analysis shows ~136 roles with Professional Chauffeur at the top
4. Verify the Dashboard shows $15.3M total revenue, 1,659 events
5. Verify the AI Scoping system prompt uses real DriveShop role names and rates

GIT COMMIT after this step.

---

## VALIDATION CHECKLIST

After everything is rebuilt, verify:

- [ ] rate_card_master.json has ~136 roles
- [ ] Top role is "Professional Chauffeur ( / hr)" with ~1,676 occurrences
- [ ] GL codes are decimal format: 4000.16, 4000.26, 4000.32 etc.
- [ ] enriched_master_index.json has ~1,659 records
- [ ] ~1,518 records have both PL metadata and scan data
- [ ] ~997 files have has_recap_data = true
- [ ] Grand total sum is approximately $15.3M
- [ ] Section totals sum to grand total for individual records (spot check 3 files)
- [ ] Historical Rate Analysis UI shows real role names
- [ ] Dashboard shows real revenue numbers
- [ ] generate-sample-data.ts is deleted
- [ ] All output files are committed to git
