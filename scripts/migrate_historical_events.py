"""
Migrate enriched_master_index.json into Supabase historical_events table.
Idempotent — uses upsert on filename.

Usage: cd scripts && python migrate_historical_events.py [--dry-run]
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

# Load env from api/.env
load_dotenv(Path(__file__).resolve().parent.parent / "api" / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "enriched_master_index.json"
BATCH_SIZE = 50


def sections_to_array(sections_dict: dict) -> list[dict]:
    """Convert sections dict to array format for JSONB storage."""
    result = []
    for key, val in (sections_dict or {}).items():
        if isinstance(val, dict):
            result.append({
                "canonical_name": val.get("canonical_name", key),
                "section_exists": val.get("section_exists", False),
                "bid_total": val.get("bid_total"),
                "recap_total": val.get("recap_total"),
            })
    return result


def compute_totals(sections_dict: dict) -> tuple[float, float]:
    """Sum bid_total and recap_total across all sections."""
    bid = 0.0
    recap = 0.0
    for val in (sections_dict or {}).values():
        if isinstance(val, dict):
            bid += val.get("bid_total") or 0
            recap += val.get("recap_total") or 0
    return round(bid, 2), round(recap, 2)


def map_record(record: dict) -> dict:
    """Map a JSON record to the historical_events table schema."""
    sections_dict = record.get("sections") or {}
    bid_total, recap_total = compute_totals(sections_dict)

    return {
        "filename": record.get("filename"),
        "client": record.get("client"),
        "event_name": record.get("event_name"),
        "event_type": None,  # Filled in Step 3 (classification)
        "event_manager": record.get("event_manager"),
        "lead_office": record.get("lead_office"),
        "status": record.get("status"),
        "revenue_segment": record.get("revenue_segment"),
        "location": record.get("event_location_state"),
        "initial_estimate_amount": record.get("initial_estimate_amount"),
        "final_invoice_amount": record.get("final_invoice_amount"),
        "grand_total": record.get("grand_total"),
        "bid_total": bid_total,
        "recap_total": recap_total,
        "has_recap_data": record.get("has_recap_data", False),
        "template_format": record.get("format"),
        "financials": record.get("financials") or {},
        "sections": sections_to_array(sections_dict),
        "labor_roles": record.get("labor_roles") or [],
    }


def main():
    dry_run = "--dry-run" in sys.argv

    # Load data
    print(f"Reading {DATA_FILE}...")
    with open(DATA_FILE) as f:
        data = json.load(f)

    total = len(data)
    recap_count = sum(1 for r in data if r.get("has_recap_data"))
    print(f"Total records: {total}")
    print(f"Records with recap data: {recap_count}")
    print(f"Records without recap: {total - recap_count}")

    # Filter out records with no filename and deduplicate by filename
    seen_filenames: set[str] = set()
    records = []
    skipped = 0
    dupes = 0
    for r in data:
        fn = r.get("filename")
        if not fn:
            skipped += 1
            continue
        if fn in seen_filenames:
            dupes += 1
            continue
        seen_filenames.add(fn)
        records.append(r)
    if skipped:
        print(f"Skipped {skipped} records with no filename")
    if dupes:
        print(f"Skipped {dupes} duplicate filenames")

    if dry_run:
        print(f"\n[DRY RUN] Would insert/upsert {len(records)} records.")
        # Show sample mapped record
        if records:
            sample = map_record(records[0])
            print(f"\nSample mapped record:")
            print(json.dumps(sample, indent=2, default=str))
        return

    # Connect to Supabase
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"\nConnected to Supabase. Starting migration...")

    inserted = 0
    errors = 0

    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i : i + BATCH_SIZE]
        mapped = [map_record(r) for r in batch]

        try:
            supabase.table("historical_events").upsert(
                mapped, on_conflict="filename"
            ).execute()
            inserted += len(mapped)
        except Exception as e:
            print(f"  ERROR on batch {i // BATCH_SIZE + 1}: {e}")
            errors += len(mapped)

        if (i + BATCH_SIZE) % 100 < BATCH_SIZE:
            print(f"  Progress: {min(i + BATCH_SIZE, len(records))}/{len(records)}")

    print(f"\n=== Migration Complete ===")
    print(f"Inserted/updated: {inserted}")
    print(f"Errors: {errors}")
    print(f"Skipped (no filename): {skipped}")


if __name__ == "__main__":
    main()
