"""
Classify historical events by type using Claude Haiku.
Processes events where event_type IS NULL in batches of 20.

Usage: cd scripts && python classify_event_types.py [--test] [--limit N]
  --test    Process only the first batch (20 records)
  --limit N Process only the first N records
"""

import json
import os
import sys
import time
from pathlib import Path

import anthropic
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).resolve().parent.parent / "api" / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
BATCH_SIZE = 20
DELAY_BETWEEN_BATCHES = 0.5

VALID_TYPES = {
    "Ride & Drive", "Static Display", "Press Event", "Chauffeur",
    "Auto Show", "Tour", "Fleet", "Other",
}

SYSTEM_PROMPT = (
    "You are classifying DriveShop event estimates by type. "
    "For each event, return the best matching type from this exact list: "
    "Ride & Drive, Static Display, Press Event, Chauffeur, Auto Show, Tour, Fleet, Other. "
    "Consider the event name, client name, and revenue segment. "
    "Return ONLY a JSON array of objects with 'filename' and 'event_type' fields. "
    "No explanation."
)


def classify_batch(client: anthropic.Anthropic, events: list[dict]) -> list[dict]:
    """Send a batch to Claude Haiku and parse the response."""
    batch_input = [
        {
            "filename": e["filename"],
            "event_name": e.get("event_name") or "",
            "client": e.get("client") or "",
            "revenue_segment": e.get("revenue_segment") or "",
        }
        for e in events
    ]

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": json.dumps(batch_input)}],
    )

    response_text = message.content[0].text.strip()
    # Strip markdown code fences if present
    if response_text.startswith("```"):
        response_text = response_text.split("\n", 1)[1]  # remove first line
        response_text = response_text.rsplit("```", 1)[0].strip()
    results = json.loads(response_text)

    # Validate and sanitize
    for r in results:
        if r.get("event_type") not in VALID_TYPES:
            print(f"  WARNING: Invalid type '{r.get('event_type')}' for {r.get('filename')} — setting to Other")
            r["event_type"] = "Other"

    return results


def main():
    test_mode = "--test" in sys.argv
    limit = None
    if "--limit" in sys.argv:
        idx = sys.argv.index("--limit")
        limit = int(sys.argv[idx + 1])

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    claude = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

    # Fetch unclassified events
    query = supabase.table("historical_events").select("filename, event_name, client, revenue_segment").is_("event_type", "null")
    resp = query.execute()
    events = resp.data

    print(f"Unclassified events: {len(events)}")

    if limit:
        events = events[:limit]
        print(f"Limiting to {limit} records")
    if test_mode:
        events = events[:BATCH_SIZE]
        print(f"Test mode — processing first {len(events)} records only")

    total_batches = (len(events) + BATCH_SIZE - 1) // BATCH_SIZE
    type_counts: dict[str, int] = {}
    classified = 0

    for i in range(0, len(events), BATCH_SIZE):
        batch = events[i : i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1

        try:
            results = classify_batch(claude, batch)

            # Update each record in Supabase
            for r in results:
                supabase.table("historical_events").update(
                    {"event_type": r["event_type"]}
                ).eq("filename", r["filename"]).execute()
                type_counts[r["event_type"]] = type_counts.get(r["event_type"], 0) + 1
                classified += 1

            print(f"  Classified batch {batch_num}/{total_batches} ({min(i + BATCH_SIZE, len(events))}/{len(events)} events)")

        except Exception as e:
            print(f"  ERROR on batch {batch_num}: {e}")

        if i + BATCH_SIZE < len(events):
            time.sleep(DELAY_BETWEEN_BATCHES)

    print(f"\n=== Classification Complete ===")
    print(f"Classified: {classified}")
    print(f"\nBreakdown by type:")
    for t, c in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f"  {t}: {c}")


if __name__ == "__main__":
    main()
