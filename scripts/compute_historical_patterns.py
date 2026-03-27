"""
Compute aggregated patterns from historical_events into historical_patterns.
Groups by client × event_type. Skips groups with < 3 events.

Usage: cd scripts && python compute_historical_patterns.py
"""

import json
import os
from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).resolve().parent.parent / "api" / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
MIN_EVENTS = 3

CANONICAL_SECTIONS = [
    "PLANNING & ADMINISTRATION",
    "ONSITE LABOR ACTIVITY",
    "TRAVEL EXPENSES",
    "CREATIVE COSTS",
    "PRODUCTION EXPENSES",
    "LOGISTICS EXPENSES",
]


def safe_avg(values: list) -> float | None:
    cleaned = [v for v in values if v is not None]
    return round(sum(cleaned) / len(cleaned), 2) if cleaned else None


def compute_group_patterns(events: list[dict]) -> dict:
    """Compute patterns for a group of events."""
    event_count = len(events)

    # Revenue and totals
    revenues = [e.get("initial_estimate_amount") for e in events]
    grand_totals = [e.get("grand_total") for e in events]

    # GP% from financials
    gp_pcts = []
    for e in events:
        fin = e.get("financials") or {}
        if fin.get("bid_margin_pct") is not None:
            gp_pcts.append(fin["bid_margin_pct"] * 100)

    # Staff count from labor_roles
    staff_counts = []
    for e in events:
        roles = e.get("labor_roles") or []
        if isinstance(roles, list):
            staff_counts.append(len(roles))

    # Section averages and variance
    section_averages = {}
    section_variance = {}

    for section_name in CANONICAL_SECTIONS:
        bid_totals = []
        recap_totals = []

        for e in events:
            sections = e.get("sections") or []
            if isinstance(sections, list):
                for s in sections:
                    if s.get("canonical_name") == section_name:
                        bt = s.get("bid_total")
                        rt = s.get("recap_total")
                        if bt is not None:
                            bid_totals.append(bt)
                        if rt is not None:
                            recap_totals.append(rt)

        avg_bid = safe_avg(bid_totals)
        avg_recap = safe_avg(recap_totals)

        # Percentage of total (using grand_total)
        avg_gt = safe_avg([g for g in grand_totals if g])
        pct_of_total = round((avg_bid / avg_gt) * 100, 1) if avg_bid and avg_gt and avg_gt > 0 else 0

        section_averages[section_name] = {
            "avg_bid": avg_bid,
            "avg_recap": avg_recap,
            "pct_of_total": pct_of_total,
        }

        # Variance: (recap - bid) / bid * 100
        variances = []
        over_budget_count = 0
        for bt, rt in zip(bid_totals, recap_totals):
            if bt and bt > 0:
                var_pct = ((rt or 0) - bt) / bt * 100
                variances.append(var_pct)
                if (rt or 0) > bt:
                    over_budget_count += 1

        section_variance[section_name] = {
            "avg_variance_pct": safe_avg(variances),
            "over_budget_pct": round((over_budget_count / len(variances)) * 100) if variances else 0,
        }

    # Common roles
    role_counts: dict[str, list[float]] = defaultdict(list)
    for e in events:
        roles = e.get("labor_roles") or []
        if isinstance(roles, list):
            seen_roles: set[str] = set()
            for r in roles:
                role_name = r.get("role", "")
                if role_name and role_name not in seen_roles:
                    seen_roles.add(role_name)
                    rate = r.get("unit_rate") or 0
                    role_counts[role_name].append(rate)

    common_roles = []
    for role_name, rates in role_counts.items():
        freq = len(rates) / event_count
        avg_rate = safe_avg(rates)
        common_roles.append({
            "role": role_name,
            "frequency": round(freq, 2),
            "avg_rate": avg_rate,
        })
    common_roles.sort(key=lambda x: x["frequency"], reverse=True)
    common_roles = common_roles[:10]  # Top 10

    return {
        "event_count": event_count,
        "avg_total_revenue": safe_avg(revenues),
        "avg_grand_total": safe_avg(grand_totals),
        "avg_gp_percent": safe_avg(gp_pcts),
        "avg_staff_count": safe_avg(staff_counts),
        "avg_duration_days": None,  # Not available in source data
        "section_averages": section_averages,
        "section_variance": section_variance,
        "common_roles": common_roles,
    }


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Fetch all recap events
    all_events = []
    for offset in range(0, 2000, 1000):
        batch = (
            supabase.table("historical_events")
            .select("*")
            .eq("has_recap_data", True)
            .range(offset, offset + 999)
            .execute()
        )
        all_events.extend(batch.data)
        if len(batch.data) < 1000:
            break

    print(f"Loaded {len(all_events)} recap events")

    # Group by client × event_type
    groups: dict[tuple[str, str], list[dict]] = defaultdict(list)
    all_by_type: dict[str, list[dict]] = defaultdict(list)

    for e in all_events:
        client = e.get("client") or "Unknown"
        event_type = e.get("event_type") or "Other"
        groups[(client, event_type)].append(e)
        all_by_type[event_type].append(e)

    print(f"Found {len(groups)} client × event_type groups")

    # Compute patterns
    patterns = []
    skipped = 0

    for (client, event_type), events in groups.items():
        if len(events) < MIN_EVENTS:
            skipped += 1
            continue
        pattern = compute_group_patterns(events)
        pattern["client"] = client
        pattern["event_type"] = event_type
        patterns.append(pattern)

    # Compute "ALL" client fallback rows per event_type
    all_client_patterns = 0
    for event_type, events in all_by_type.items():
        if len(events) < MIN_EVENTS:
            continue
        pattern = compute_group_patterns(events)
        pattern["client"] = "ALL"
        pattern["event_type"] = event_type
        patterns.append(pattern)
        all_client_patterns += 1

    print(f"Computed {len(patterns)} patterns ({all_client_patterns} ALL-client fallbacks)")
    print(f"Skipped {skipped} groups with < {MIN_EVENTS} events")

    # Upsert into historical_patterns
    inserted = 0
    for p in patterns:
        try:
            supabase.table("historical_patterns").upsert(
                {
                    "client": p["client"],
                    "event_type": p["event_type"],
                    "event_count": p["event_count"],
                    "avg_total_revenue": p["avg_total_revenue"],
                    "avg_grand_total": p["avg_grand_total"],
                    "avg_gp_percent": p["avg_gp_percent"],
                    "avg_staff_count": p["avg_staff_count"],
                    "avg_duration_days": p["avg_duration_days"],
                    "section_averages": p["section_averages"],
                    "section_variance": p["section_variance"],
                    "common_roles": p["common_roles"],
                },
                on_conflict="client,event_type",
            ).execute()
            inserted += 1
        except Exception as e:
            print(f"  ERROR upserting {p['client']} × {p['event_type']}: {e}")

    print(f"\nUpserted {inserted} patterns into historical_patterns")

    # Show top groups
    patterns.sort(key=lambda x: x["event_count"], reverse=True)
    print(f"\nTop 10 largest groups:")
    for p in patterns[:10]:
        print(f"  {p['client']} × {p['event_type']}: {p['event_count']} events, avg ${p['avg_grand_total']:,.0f}, GP {p['avg_gp_percent']:.1f}%")


if __name__ == "__main__":
    main()
