#!/usr/bin/env python3
"""Build financial_summary.json and section_summary.json from enriched_master_index.json."""

import json
import os
import statistics
from collections import defaultdict

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENRICHED = os.path.join(PROJECT_ROOT, "enriched_master_index.json")
FINANCIAL_OUT = os.path.join(PROJECT_ROOT, "financial_summary.json")
SECTION_OUT = os.path.join(PROJECT_ROOT, "section_summary.json")


def safe_float(val):
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    try:
        return float(str(val).replace("$", "").replace(",", "").strip())
    except (ValueError, TypeError):
        return None


def build_financial_summary(records):
    grand_totals = []
    by_client = defaultdict(lambda: {"event_count": 0, "total_revenue": 0.0, "grand_totals": []})
    by_lead_office = defaultdict(lambda: {"event_count": 0, "total_revenue": 0.0, "grand_totals": []})
    by_revenue_segment = defaultdict(lambda: {"event_count": 0, "total_revenue": 0.0})
    by_status = defaultdict(int)
    files_with_recap = 0

    for r in records:
        gt = safe_float(r.get("grand_total"))
        if gt is not None and gt > 0:
            grand_totals.append(gt)

        client = r.get("client") or "Unknown"
        office = r.get("lead_office") or "Unknown"
        segment = r.get("revenue_segment") or "Unknown"
        status = r.get("status") or "Unknown"

        gt_val = gt if gt and gt > 0 else 0

        by_client[client]["event_count"] += 1
        by_client[client]["total_revenue"] += gt_val
        if gt_val > 0:
            by_client[client]["grand_totals"].append(gt_val)

        by_lead_office[office]["event_count"] += 1
        by_lead_office[office]["total_revenue"] += gt_val
        if gt_val > 0:
            by_lead_office[office]["grand_totals"].append(gt_val)

        by_revenue_segment[segment]["event_count"] += 1
        by_revenue_segment[segment]["total_revenue"] += gt_val

        by_status[status] += 1

        if r.get("has_recap_data"):
            files_with_recap += 1

    total_revenue = sum(grand_totals)

    # Compute avg_event_size for clients and offices
    client_summary = {}
    for client, data in sorted(by_client.items(), key=lambda x: -x[1]["total_revenue"]):
        client_summary[client] = {
            "event_count": data["event_count"],
            "total_revenue": round(data["total_revenue"], 2),
            "avg_event_size": round(data["total_revenue"] / data["event_count"], 2) if data["event_count"] > 0 else 0,
        }

    office_summary = {}
    for office, data in sorted(by_lead_office.items(), key=lambda x: -x[1]["total_revenue"]):
        office_summary[office] = {
            "event_count": data["event_count"],
            "total_revenue": round(data["total_revenue"], 2),
            "avg_event_size": round(data["total_revenue"] / data["event_count"], 2) if data["event_count"] > 0 else 0,
        }

    segment_summary = {}
    for segment, data in sorted(by_revenue_segment.items(), key=lambda x: -x[1]["total_revenue"]):
        segment_summary[segment] = {
            "event_count": data["event_count"],
            "total_revenue": round(data["total_revenue"], 2),
        }

    return {
        "total_events": len(records),
        "total_revenue": round(total_revenue, 2),
        "grand_total_ranges": {
            "min": round(min(grand_totals), 2) if grand_totals else 0,
            "max": round(max(grand_totals), 2) if grand_totals else 0,
            "avg": round(statistics.mean(grand_totals), 2) if grand_totals else 0,
            "median": round(statistics.median(grand_totals), 2) if grand_totals else 0,
            "total": round(total_revenue, 2),
            "count_nonzero": len(grand_totals),
        },
        "files_with_bid_and_recap": files_with_recap,
        "by_client": client_summary,
        "by_lead_office": office_summary,
        "by_revenue_segment": segment_summary,
        "by_status": dict(sorted(by_status.items(), key=lambda x: -x[1])),
    }


def build_section_summary(records):
    section_data = defaultdict(lambda: {
        "files_where_exists": 0,
        "files_with_nonzero_bid": 0,
        "files_with_nonzero_recap": 0,
        "total_bid_dollars": 0.0,
        "total_recap_dollars": 0.0,
    })

    for r in records:
        sections = r.get("sections", {})
        for name, info in sections.items():
            sd = section_data[name]
            sd["files_where_exists"] += 1

            bid = safe_float(info.get("bid_total"))
            if bid and bid > 0:
                sd["files_with_nonzero_bid"] += 1
                sd["total_bid_dollars"] += bid

            recap = safe_float(info.get("recap_total"))
            if recap and recap > 0:
                sd["files_with_nonzero_recap"] += 1
                sd["total_recap_dollars"] += recap

    # Round and sort by total_bid_dollars
    result = {}
    for name, data in sorted(section_data.items(), key=lambda x: -x[1]["total_bid_dollars"]):
        result[name] = {
            "files_where_exists": data["files_where_exists"],
            "files_with_nonzero_bid": data["files_with_nonzero_bid"],
            "files_with_nonzero_recap": data["files_with_nonzero_recap"],
            "total_bid_dollars": round(data["total_bid_dollars"], 2),
            "total_recap_dollars": round(data["total_recap_dollars"], 2),
        }

    return result


def main():
    with open(ENRICHED) as f:
        records = json.load(f)

    print(f"Processing {len(records)} enriched records")

    financial = build_financial_summary(records)
    with open(FINANCIAL_OUT, "w") as f:
        json.dump(financial, f, indent=2)

    section = build_section_summary(records)
    with open(SECTION_OUT, "w") as f:
        json.dump(section, f, indent=2)

    print(f"\n--- FINANCIAL SUMMARY ---")
    print(f"Total events: {financial['total_events']}")
    print(f"Total revenue (grand_total sum): ${financial['total_revenue']:,.2f}")
    print(f"Files with recap data: {financial['files_with_bid_and_recap']}")
    print(f"Grand total range: ${financial['grand_total_ranges']['min']:,.2f} - ${financial['grand_total_ranges']['max']:,.2f}")
    print(f"Grand total median: ${financial['grand_total_ranges']['median']:,.2f}")

    print(f"\n--- SECTION SUMMARY ---")
    total_bid = sum(s["total_bid_dollars"] for s in section.values())
    for name, data in section.items():
        pct = (data["total_bid_dollars"] / total_bid * 100) if total_bid > 0 else 0
        print(f"  {name}: ${data['total_bid_dollars']:,.0f} ({pct:.0f}%) in {data['files_where_exists']} files")

    print(f"\nOutputs:")
    print(f"  {FINANCIAL_OUT}")
    print(f"  {SECTION_OUT}")


if __name__ == "__main__":
    main()
