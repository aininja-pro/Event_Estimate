#!/usr/bin/env python3
"""Join scan results to Project List, creating enriched_master_index.json and join_report.json."""

import json
import os
from collections import defaultdict

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCAN_RESULTS = os.path.join(PROJECT_ROOT, "scan_results.json")
PROJECT_LIST = os.path.join(PROJECT_ROOT, "project_list_parsed.json")
OUTPUT_INDEX = os.path.join(PROJECT_ROOT, "enriched_master_index.json")
OUTPUT_REPORT = os.path.join(PROJECT_ROOT, "join_report.json")


def main():
    with open(SCAN_RESULTS) as f:
        scan_data = json.load(f)

    with open(PROJECT_LIST) as f:
        pl_data = json.load(f)

    # Build lookup from Project List by filename
    pl_by_filename = defaultdict(list)
    for record in pl_data["records"]:
        fn = record.get("filename")
        if fn:
            pl_by_filename[fn].append(record)

    # Build lookup from scan results by filename
    scan_by_filename = {}
    for result in scan_data["results"]:
        fn = result.get("filename")
        if fn:
            scan_by_filename[fn] = result

    # Join
    enriched = []
    matched_filenames = set()
    scan_only = []
    list_only = []

    # For each scanned file, try to match to Project List
    for fn, scan_result in scan_by_filename.items():
        pl_records = pl_by_filename.get(fn, [])
        if pl_records:
            # Use first matching PL record (they might be duplicates)
            pl_record = pl_records[0]
            merged = {**pl_record, **scan_result}
            merged["join_status"] = "matched"
            enriched.append(merged)
            matched_filenames.add(fn)
        else:
            # Scan-only: file exists but not in Project List
            merged = {**scan_result}
            merged["join_status"] = "scan_only"
            enriched.append(merged)
            scan_only.append(fn)

    # Find list-only entries (in PL but not scanned)
    for fn, records in pl_by_filename.items():
        if fn not in scan_by_filename:
            for record in records:
                merged = {**record}
                merged["join_status"] = "list_only"
                enriched.append(merged)
                list_only.append(fn)

    # Find duplicates
    duplicate_filenames = {fn: len(records) for fn, records in pl_by_filename.items() if len(records) > 1}

    # Count matched
    matched_count = sum(1 for r in enriched if r.get("join_status") == "matched")

    # Write enriched index
    with open(OUTPUT_INDEX, "w") as f:
        json.dump(enriched, f, indent=2, default=str)

    # Write join report
    report = {
        "matched": matched_count,
        "scan_only": len(scan_only),
        "list_only": len(set(list_only)),
        "duplicate_filenames": duplicate_filenames,
        "duplicate_count": len(duplicate_filenames),
        "total_enriched_records": len(enriched),
        "scan_only_files": sorted(scan_only)[:20],
        "list_only_files": sorted(set(list_only))[:20],
    }

    with open(OUTPUT_REPORT, "w") as f:
        json.dump(report, f, indent=2, default=str)

    print(f"--- JOIN RESULTS ---")
    print(f"Matched: {matched_count}")
    print(f"Scan-only: {len(scan_only)} (files scanned but not in Project List)")
    print(f"List-only: {len(set(list_only))} (in Project List but not scanned)")
    print(f"Duplicate filenames in PL: {len(duplicate_filenames)}")
    print(f"Total enriched records: {len(enriched)}")
    print(f"\nOutputs:")
    print(f"  {OUTPUT_INDEX}")
    print(f"  {OUTPUT_REPORT}")


if __name__ == "__main__":
    main()
