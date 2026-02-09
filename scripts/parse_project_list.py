#!/usr/bin/env python3
"""Parse DriveShop_Project_List.xlsx into project_list_parsed.json."""

import json
import os
from collections import Counter
from urllib.parse import unquote

import openpyxl

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_LIST = os.path.join(PROJECT_ROOT, "DriveShop_Project_List.xlsx")
OUTPUT = os.path.join(PROJECT_ROOT, "project_list_parsed.json")

# Column mapping (1-indexed)
COLUMN_MAP = {
    1: "submission_date",       # A
    2: "download_url",          # B
    3: "client",                # C
    4: "client_contact",        # D
    5: "lead_office",           # E
    6: "project_id",            # F
    7: "submitter_name",        # G
    9: "event_manager",         # I
    10: "recap_submit_date",    # J
    11: "po_number",            # K
    12: "pipeline_probability", # L
    13: "event_location_state", # M
    14: "revision_notes",       # N
    15: "net_revenue",          # O
    16: "processed_for_billing",# P
    17: "invoice_number",       # Q
    18: "status",               # R
    19: "event_name",           # S
    20: "event_start_date",     # T
    21: "event_end_date",       # U
    22: "initial_estimate_amount",  # V
    23: "revenue_segment",      # W
    26: "approved_by",          # Z
    27: "approved_date",        # AA
    28: "final_invoice_amount", # AB
    30: "submission_id",        # AD
}


def safe_str(val):
    """Convert value to string, handling dates and None."""
    if val is None:
        return None
    if hasattr(val, "strftime"):
        return val.strftime("%Y-%m-%d")
    return str(val).strip() if str(val).strip() else None


def safe_numeric(val):
    """Convert value to float if numeric, else None."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    try:
        cleaned = str(val).replace("$", "").replace(",", "").strip()
        if cleaned:
            return float(cleaned)
    except (ValueError, TypeError):
        pass
    return None


def extract_filename_from_url(url_str):
    """Extract decoded filename from a URL (or multi-URL cell, take last)."""
    if not url_str:
        return None
    urls = str(url_str).strip().split("\n")
    # Use the last URL's filename as the canonical one
    last_url = urls[-1].strip()
    if not last_url.startswith("http"):
        return None
    return unquote(last_url.split("/")[-1])


def main():
    wb = openpyxl.load_workbook(PROJECT_LIST, read_only=True, data_only=True)
    ws = wb.active

    records = []
    filename_counts = Counter()

    for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
        record = {}
        for col_idx, field_name in COLUMN_MAP.items():
            val = row[col_idx - 1] if col_idx - 1 < len(row) else None

            if field_name in ("net_revenue", "initial_estimate_amount", "final_invoice_amount"):
                record[field_name] = safe_numeric(val)
            elif field_name == "download_url":
                record[field_name] = str(val).strip() if val else None
            else:
                record[field_name] = safe_str(val)

        # Extract filename as join key
        filename = extract_filename_from_url(record.get("download_url"))
        record["filename"] = filename
        filename_counts[filename] += 1

        records.append(record)

    wb.close()

    # Flag duplicates
    duplicate_filenames = {fn: count for fn, count in filename_counts.items() if count > 1 and fn}
    for record in records:
        fn = record.get("filename")
        record["is_duplicate_filename"] = fn in duplicate_filenames

    output = {
        "total_rows": len(records),
        "duplicate_filenames": duplicate_filenames,
        "duplicate_count": len(duplicate_filenames),
        "records": records,
    }

    with open(OUTPUT, "w") as f:
        json.dump(output, f, indent=2, default=str)

    print(f"Parsed {len(records)} rows from Project List")
    print(f"Duplicate filenames: {len(duplicate_filenames)}")
    for fn, count in sorted(duplicate_filenames.items(), key=lambda x: -x[1])[:10]:
        print(f"  {fn}: {count} occurrences")
    print(f"Output: {OUTPUT}")


if __name__ == "__main__":
    main()
