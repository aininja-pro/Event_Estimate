#!/usr/bin/env python3
"""Build rate_card_master.json from scan_results.json.

Aggressively normalizes role names to collapse scheduling suffixes,
date labels, OT/DT/Weekend/Afterhours variants, rate unit variants,
and typos into base roles. Target: ~50-80 unique base roles.
"""

import json
import os
import re
import statistics
from collections import defaultdict

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCAN_RESULTS = os.path.join(PROJECT_ROOT, "scan_results.json")
OUTPUT = os.path.join(PROJECT_ROOT, "rate_card_master.json")


def detect_flags(name):
    """Detect OT/DT/Weekend/Afterhours flags from role name string."""
    return {
        "has_ot_variant": bool(re.search(r"\bOT\b|\bOvertime\b", name)),
        "has_dt_variant": bool(re.search(r"\bDT\b", name)),
        "has_weekend_variant": bool(re.search(r"\bWeekend\b", name, re.I)),
        "has_afterhours_variant": bool(
            re.search(r"After\s*Hours?|\bAfterhours\b", name, re.I)
        ),
    }


def extract_rate_unit(name):
    """Extract rate unit from the end of a cleaned role name.

    Returns (base_name, rate_unit_string_or_None).
    """
    m = re.search(
        r"\s*\("
        r"(/hr(?:\s+>(?:10|8)hrs(?:\s+or\s+shared\s+hourly)?)?|"
        r"/\d+\s+hr\s+day|"
        r"/day|"
        r"Flat Rate)"
        r"\)\s*$",
        name,
    )
    if m:
        return name[: m.start()].strip(), m.group(1)
    return name.strip(), None


def normalize_role_name(raw_name):
    """Normalize role name aggressively.

    Returns (base_role_name, rate_unit_or_None).
    Rate unit is stripped from the name and returned separately.
    """
    s = raw_name.strip()
    s = re.sub(r"\s+", " ", s)

    # ═══ PHASE 1: Fix known typos ═══
    s = s.replace("Event Manader", "Event Manager")
    s = re.sub(r"\bUnformed\b", "Uniformed", s)
    s = re.sub(r"\bDispatche\b", "Dispatcher", s)
    s = re.sub(r"\bWeeknd\b", "Weekend", s)
    s = re.sub(r"\bMinumum\b", "Minimum", s)
    s = re.sub(r"\bDIem\b", "Diem", s)

    # ═══ PHASE 2: Clean inside rate unit parens ═══
    # "/Weekend Rate)" → ")"
    s = re.sub(r"/Weekend\s*Rate\s*\)", ")", s)
    # " - Weekend)" → ")"
    s = re.sub(r"\s*-\s*Weekend\s*\)", ")", s)
    # "| Weekend Rate)" → ")"
    s = re.sub(r"\s*\|\s*Weekend\s*Rate\s*\)", ")", s)
    # "/After Hours/day)" → ")" — malformed rate unit
    # Actually: "Vehicle Manager (After Hours/day)" → strip whole paren as qualifier
    # Handled below

    # ═══ PHASE 3: Strip qualifying parentheticals ═══
    # (Weekend Rate), (Weekend), (Holiday Rate), (Afterhours), (After Hours)
    s = re.sub(r"\s*\(\s*Weekend(?:\s+Rate)?\s*\)", "", s)
    s = re.sub(r"\s*\(\s*Holiday\s*Rate\s*\)", "", s)
    s = re.sub(r"\s*\(\s*After\s*Hours?\s*\)", "", s, flags=re.I)
    s = re.sub(r"\s*\(\s*Afterhours\s*\)", "", s, flags=re.I)
    # (Afterhours Rate)
    s = re.sub(r"\s*\(\s*Afterhours\s*Rate\s*\)", "", s, flags=re.I)
    # (Six Hour Minimum)
    s = re.sub(r"\s*\(\s*Six\s+Hour\s+Minimum\s*\)", "", s, flags=re.I)
    # (Rate) — leftover from stripping "Weekend" out of "(Weekend Rate)"
    s = re.sub(r"\s*\(\s*Rate\s*\)", "", s)
    # (2-days)
    s = re.sub(r"\s*\(\d+-days?\)", "", s, flags=re.I)
    # (After Hours/day) or ( After Hours / day) — malformed, just strip
    s = re.sub(r"\s*\(\s*After\s*Hours?\s*/\s*day\s*\)", "", s, flags=re.I)
    # (/ day) — malformed leftover
    s = re.sub(r"\s*\(/\s*day\s*\)", "", s)

    # ═══ PHASE 4: Strip OT/DT trailing markers ═══
    s = re.sub(r"\s+OT\s*Rate\s*$", "", s)
    s = re.sub(r"\s+OT\s*$", "", s)
    s = re.sub(r"\s+DT\s*$", "", s)

    # ═══ PHASE 5: Strip qualifying words between role name and rate unit ═══
    # "Weekend Rate" anywhere
    s = re.sub(r"\s+Weekend\s+Rate\b", "", s)
    s = re.sub(r"\s+Weekend\b", "", s)
    # "Afterhours/Weekend Rate"
    s = re.sub(r"\s+Afterhours/Weekend\s*Rate?\b", "", s, flags=re.I)
    # "Afterhours" standalone
    s = re.sub(r"\s+Afterhours\b", "", s, flags=re.I)
    # "After Hours" between words
    s = re.sub(r"\s+After\s+Hours?\b", "", s, flags=re.I)
    # "Overtime"
    s = re.sub(r"\bOvertime\s+", "", s)

    # ═══ PHASE 6: Strip slash-prefixed qualifiers ═══
    # "/After Hours (/..." → " (/..."
    s = re.sub(r"/After\s+Hours?\s*(?=\()", " ", s, flags=re.I)
    # "/Weekend Rate (/..." → " (/..."
    s = re.sub(r"/Weekend\s*Rate?\s*(?=\()", " ", s, flags=re.I)
    # Trailing "/Weekend" on role name
    s = re.sub(r"/Weekend\b", "", s)
    # "Per Diem/Chauffeur Drivers" → "Per Diem"
    s = re.sub(r"Per Diem/Chauffeur\s+Drivers", "Per Diem", s)

    # ═══ PHASE 7: Strip Six Hour Minimum (if still present) ═══
    s = re.sub(r"\bSix\s+Hour\s+Minimum\b", "", s, flags=re.I)

    # ═══ PHASE 8: Normalize rate unit formatting ═══
    s = s.replace("hr.", "hr")
    s = re.sub(r"\(per hour\)", "(/hr)", s, flags=re.I)
    s = re.sub(r"\(days/per hour\)", "(/hr)", s, flags=re.I)
    s = re.sub(r"\(hr\)", "(/hr)", s)
    s = re.sub(r"\(10hrs?\s*day\)", "(/10 hr day)", s)
    # "(/hr >10hrs day)" → "(/hr >10hrs)" — trailing "day" is noise
    s = re.sub(r"(/hr\s*>10hrs)\s+day\)", r"\1)", s)
    # "(/hr >/10 hr day)" → malformed, normalize to "(/hr >10hrs)"
    s = re.sub(r"\(/hr\s*>/10\s*hr\s*day\)", "(/hr >10hrs)", s)
    # Normalize ">10hrs" variants
    s = re.sub(r">\s*10\s*hrs?", ">10hrs", s)
    # Normalize ">8hrs" variants
    s = re.sub(r">\s*8\s*hrs?", ">8hrs", s)

    # ═══ PHASE 9: Strip date/number suffixes after rate unit paren ═══
    # Dates: 9/9, 11/5, 11/3-11/9, 11/3,4,7,9
    s = re.sub(r"\)\s+\d{1,2}/\d{1,2}[\s\S]*$", ")", s)
    # Ordinals: 14th, 15th, 10th, 17th, 8th - 18th
    s = re.sub(r"\)\s+\d{1,2}(?:st|nd|rd|th)[\s\S]*$", ")", s)
    # Plain numbers: "19, 21", "20"
    s = re.sub(r"\)\s+\d{1,2}(?:,\s*\d{1,2})*\s*$", ")", s)
    # Day counts: "8 HOURS DAY", "8 HOUR DAY", "10 HOUR DAY"
    s = re.sub(r"\)\s+\d+\s+HOURS?\s+DAY[\s\S]*$", ")", s, flags=re.I)

    # ═══ PHASE 10: Strip post-rate-unit word qualifiers ═══
    s = re.sub(r"\)\s+Dispatcher\b.*$", ")", s)
    s = re.sub(r"\)\s+Drivers?\b.*$", ")", s)
    s = re.sub(r"\)\s+On-site\s+Coordinator\b.*$", ")", s)
    s = re.sub(r"\)\s+Total\b.*$", ")", s)
    s = re.sub(r"\)\s+Request\b.*$", ")", s)
    # No-space dash before "After Hours": "(/10 hr day)-After Hours"
    s = re.sub(r"\)\s*-\s*After\s+Hours?\b", ")", s, flags=re.I)

    # ═══ PHASE 11: Strip dash qualifiers ═══
    s = re.sub(r"\s*-\s*Site Inspection", "", s)
    s = re.sub(r"\s*-\s*DriveShop Staff", "", s)
    s = re.sub(r"\s*-\s*Dispatcher(?:/Chauffeur Drivers)?", "", s)
    s = re.sub(r"\s*-\s*all other markets", "", s)
    s = re.sub(r"\s*-\s*LA\.?,?\s*SF,?\s*NY", "", s)

    # ═══ PHASE 12: Strip misc ═══
    # # numbering: #1 & #2, #1, #2
    s = re.sub(r"\s*#\d+(?:\s*&\s*#\d+)?", "", s)
    # (s) plural marker
    s = re.sub(r"\s*\(s\)", "", s)
    # Excel artifacts "+28:36"
    s = re.sub(r"\+\d+:\d+", "", s)
    # /Vehs.
    s = re.sub(r"/Vehs\.?", "", s)

    # ═══ PHASE 13: Normalize role name variants ═══
    # Plurals → singular
    s = re.sub(r"\bGreeters\b", "Greeter", s)
    s = re.sub(r"\bVehicle Handlers\b", "Vehicle Handler", s)
    s = re.sub(r"\bProfessional Drivers\b", "Professional Driver", s)
    s = re.sub(r"\bProfessional Track Drivers\b", "Professional Track Driver", s)
    s = re.sub(r"\bConcierge Managers\b", "Concierge Manager", s)

    # Specific merges
    s = re.sub(r"Concierge Manager\s+\d+\b", "Concierge Manager", s)
    s = re.sub(r"Vehicle Handler\s+Labor\b", "Vehicle Handler", s)
    s = re.sub(r"Vehicle Handler\s+Request\b", "Vehicle Handler", s)
    s = s.replace("Vehicle/Event", "Event/Vehicle")
    s = re.sub(r"Per Diem\s*\(/day\)", "Per Diem", s)
    s = re.sub(r"Event Manager\s*/\s*Staff\b", "Event Manager", s)
    s = s.replace("Vehicle Handling Labor & Wait Time", "Vehicle Handler")
    # "Professional Chauffeur/Dispatcher" → "Professional Chauffeur"
    s = re.sub(r"Professional Chauffeur/Dispatcher\b", "Professional Chauffeur", s)
    # Per Diem dash variants → Per Diem
    s = re.sub(r"^Per Diem\s*-.*$", "Per Diem", s)
    s = re.sub(r"^Per Diem\s+Professional Chauffeur$", "Per Diem", s)
    # "Vehicle Logistics" (without Staff) → "Vehicle Logistics Staff"
    s = re.sub(r"^Vehicle Logistics(?!\s+Staff)\b", "Vehicle Logistics Staff", s)
    # "Event/Logistics Staff" and "Event/Logistics" → "Event/Logistics Staff"
    s = re.sub(r"^Event/Logistics(?!\s+Staff)\b", "Event/Logistics Staff", s)
    # "Vehicle Staff" → "Vehicle Labor"
    s = re.sub(r"^Vehicle Staff\b", "Vehicle Labor", s)
    # "Uniformed Chauffeur Driver (/hr) - Dispatcher" handled by dash strip
    # But in case it's still there:
    s = re.sub(r"\s*-\s*Dispatcher\s*$", "", s)

    # Normalize slashes in role names (not rate units)
    # "Event /Vehicle" → "Event/Vehicle" but keep "(/hr >10hrs or shared hourly)"
    s = re.sub(r"(\w)\s*/\s*(\w)", r"\1/\2", s)
    # Restore slash-space in rate unit parens
    s = re.sub(r"\(/", "(/ ", s)
    s = s.replace("(/ ", "(/")

    # ═══ PHASE 14: Cleanup ═══
    # Empty parens from stripping content
    s = re.sub(r"\s*\(\s*\)", "", s)
    # Trailing slash
    s = re.sub(r"/\s*$", "", s)
    # Trailing dash
    s = re.sub(r"-\s*$", "", s)
    # Slash before paren: "Vehicle Manager/ (/10 hr day)" → "Vehicle Manager (/10 hr day)"
    s = re.sub(r"/\s*\(", " (", s)
    # Collapse whitespace
    s = re.sub(r"\s+", " ", s).strip()
    # Clean parens
    s = re.sub(r"\(\s+", "(", s)
    s = re.sub(r"\s+\)", ")", s)
    # Space before paren: "Driver(/hr)" → "Driver (/hr)"
    s = re.sub(r"(\w)\(", r"\1 (", s)
    # "(/hr>10hrs" → "(/hr >10hrs"
    s = re.sub(r"\(/hr>", "(/hr >", s)
    # Fix "labor" → "Labor"
    s = re.sub(r"\blabor\b", "Labor", s)

    # ═══ PHASE 15: Extract rate unit ═══
    base, rate_unit = extract_rate_unit(s)

    # Final base cleanup
    base = base.strip()
    # Remove trailing paren junk from malformed entries
    base = re.sub(r"\s*\(\s*$", "", base)

    return base, rate_unit


def main():
    with open(SCAN_RESULTS) as f:
        data = json.load(f)

    # Aggregate by normalized base role name
    role_data = defaultdict(lambda: {
        "gl_codes": set(),
        "rate_units": set(),
        "occurrences": 0,
        "has_ot_variant": False,
        "has_dt_variant": False,
        "has_weekend_variant": False,
        "has_afterhours_variant": False,
        "unit_rates": [],
        "cost_rates": [],
    })

    for result in data["results"]:
        if result.get("error"):
            continue
        for role in result.get("labor_roles", []):
            raw = role["role"]
            flags = detect_flags(raw)
            base_name, rate_unit = normalize_role_name(raw)

            rd = role_data[base_name]
            rd["occurrences"] += 1
            if rate_unit:
                rd["rate_units"].add(rate_unit)
            if role.get("gl_code"):
                rd["gl_codes"].add(role["gl_code"])
            # Merge flags
            if flags["has_ot_variant"] or role.get("has_ot_variant"):
                rd["has_ot_variant"] = True
            if flags["has_dt_variant"]:
                rd["has_dt_variant"] = True
            if flags["has_weekend_variant"]:
                rd["has_weekend_variant"] = True
            if flags["has_afterhours_variant"]:
                rd["has_afterhours_variant"] = True
            if role.get("unit_rate") is not None and role["unit_rate"] > 0:
                rd["unit_rates"].append(role["unit_rate"])
            if role.get("cost_rate") is not None and role["cost_rate"] > 0:
                rd["cost_rates"].append(role["cost_rate"])

    # Build output
    roles = []
    for name, rd in sorted(role_data.items(), key=lambda x: -x[1]["occurrences"]):
        entry = {
            "role": name,
            "rate_units": sorted(rd["rate_units"]),
            "gl_codes": sorted(rd["gl_codes"]),
            "occurrences": rd["occurrences"],
            "has_ot_variant": rd["has_ot_variant"],
            "has_dt_variant": rd["has_dt_variant"],
            "has_weekend_variant": rd["has_weekend_variant"],
            "has_afterhours_variant": rd["has_afterhours_variant"],
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
    print(f"\nTop 20 roles by occurrences:")
    for r in roles[:20]:
        gl_str = "/".join(r["gl_codes"][:3]) if r["gl_codes"] else "none"
        rate_str = f"${r['unit_rate_range']['min']}-${r['unit_rate_range']['max']}"
        units = ", ".join(r["rate_units"][:3]) if r["rate_units"] else "—"
        flags = []
        if r["has_ot_variant"]:
            flags.append("OT")
        if r["has_dt_variant"]:
            flags.append("DT")
        if r["has_weekend_variant"]:
            flags.append("WE")
        if r["has_afterhours_variant"]:
            flags.append("AH")
        flag_str = f" [{'/'.join(flags)}]" if flags else ""
        print(
            f"  {r['role']}: {r['occurrences']} occ, "
            f"rate {rate_str}, units=[{units}]{flag_str}"
        )

    print(f"\nAll roles:")
    for i, r in enumerate(roles):
        print(f"  {i + 1:3d}. [{r['occurrences']:5d}] {r['role']}")

    print(f"\nOutput: {OUTPUT}")


if __name__ == "__main__":
    main()
