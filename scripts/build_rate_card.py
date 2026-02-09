#!/usr/bin/env python3
"""Build rate_card_master.json from scan_results.json."""

import json
import os
import re
import statistics
from collections import defaultdict

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCAN_RESULTS = os.path.join(PROJECT_ROOT, "scan_results.json")
OUTPUT = os.path.join(PROJECT_ROOT, "rate_card_master.json")


def normalize_role_name(name):
    """Normalize role name for deduplication."""
    s = name.strip()
    s = re.sub(r"\s+", " ", s)           # collapse multiple spaces
    s = re.sub(r"\(\s+", "(", s)         # remove space after opening paren
    s = re.sub(r"\s+\)", ")", s)         # remove space before closing paren
    # Normalize spaces around slashes: "Event /Vehicle" -> "Event/Vehicle"
    s = re.sub(r"\s*/\s*", "/", s)
    # But restore space after slash in known patterns like "/10 hr" "/hr"
    s = re.sub(r"\(/", "(/ ", s)         # "(/hr" -> "(/ hr" temporarily
    s = s.replace("(/ ", "(/")           # undo — keep "(/hr" and "(/10"
    # Normalize ">10hrs" variants: ">10 hrs", ">10hrs", ">10 hr"
    s = re.sub(r">\s*10\s*hrs?", ">10hrs", s)
    # Normalize "hr." -> "hr"
    s = re.sub(r"\bhr\.\b", "hr", s)
    # Ensure space before opening paren: "Driver(/hr)" -> "Driver (/hr)"
    s = re.sub(r"(\w)\(", r"\1 (", s)
    # Normalize space inside parens after slash: "(/hr>10hrs" -> "(/hr >10hrs"
    s = re.sub(r"\(/hr>", "(/hr >", s)
    # Fix title case: "labor" -> "Labor", "labor" standalone
    # Only fix known case issues
    s = re.sub(r"\blabor\b", "Labor", s)
    s = re.sub(r"\bDIem\b", "Diem", s)
    return s


def main():
    with open(SCAN_RESULTS) as f:
        data = json.load(f)

    # Aggregate by normalized role name
    role_data = defaultdict(lambda: {
        "gl_codes": set(),
        "occurrences": 0,
        "has_ot_variant": False,
        "unit_rates": [],
        "cost_rates": [],
    })

    for result in data["results"]:
        if result.get("error"):
            continue
        for role in result.get("labor_roles", []):
            name = normalize_role_name(role["role"])
            rd = role_data[name]
            rd["occurrences"] += 1
            if role.get("gl_code"):
                rd["gl_codes"].add(role["gl_code"])
            if role.get("has_ot_variant"):
                rd["has_ot_variant"] = True
            if role.get("unit_rate") is not None and role["unit_rate"] > 0:
                rd["unit_rates"].append(role["unit_rate"])
            if role.get("cost_rate") is not None and role["cost_rate"] > 0:
                rd["cost_rates"].append(role["cost_rate"])

    # Build output
    roles = []
    for name, rd in sorted(role_data.items(), key=lambda x: -x[1]["occurrences"]):
        entry = {
            "role": name,
            "gl_codes": sorted(rd["gl_codes"]),
            "occurrences": rd["occurrences"],
            "has_ot_variant": rd["has_ot_variant"],
        }

        if rd["unit_rates"]:
            rates = rd["unit_rates"]
            entry["unit_rate_range"] = {
                "min": round(min(rates), 2),
                "max": round(max(rates), 2),
                "avg": round(statistics.mean(rates), 2),
                "median": round(statistics.median(rates), 2),
            }
        else:
            entry["unit_rate_range"] = {"min": 0, "max": 0, "avg": 0, "median": 0}

        if rd["cost_rates"]:
            rates = rd["cost_rates"]
            entry["cost_rate_range"] = {
                "min": round(min(rates), 2),
                "max": round(max(rates), 2),
                "avg": round(statistics.mean(rates), 2),
                "median": round(statistics.median(rates), 2),
            }
        else:
            entry["cost_rate_range"] = None

        roles.append(entry)

    with open(OUTPUT, "w") as f:
        json.dump(roles, f, indent=2)

    print(f"Built rate card with {len(roles)} unique roles")
    print(f"\nTop 10 roles by occurrences:")
    for r in roles[:10]:
        gl_str = "/".join(r["gl_codes"][:4]) if r["gl_codes"] else "none"
        rate_str = f"${r['unit_rate_range']['min']}-${r['unit_rate_range']['max']}"
        print(f"  {r['role']}: {r['occurrences']} occurrences, GL {gl_str}, rate {rate_str}")

    print(f"\nOutput: {OUTPUT}")


if __name__ == "__main__":
    main()
