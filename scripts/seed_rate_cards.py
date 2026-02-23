"""
Seed Rate Cards from Tatiana's Event Estimate Template.

Reads DriveShop_Event_Estimate_Template_12_01_25.xlsx and generates
SQL INSERT statements for the clients and rate_card_items tables.

Usage:
    python scripts/seed_rate_cards.py

Output:
    scripts/seed_rate_cards.sql
"""

import re
from pathlib import Path

import openpyxl

EXCEL_PATH = Path("data/DriveShop Event Estimate Template_12.01.25.xlsx")
OUTPUT_PATH = Path("scripts/seed_rate_cards.sql")

# Only process visible client tabs (skip 3 hidden: Templates Event Admin, Templates - Admin Labor, Ineos)
VISIBLE_TABS = ["LUCID", "VW", "JLR", "Hankook", "Mazda", "MB", "Volvo", "Volvo MS"]

# Map tab names to short codes
CLIENT_CODES = {
    "LUCID": "LUCID",
    "VW": "VW",
    "JLR": "JLR",
    "Hankook": "HANKOOK",
    "Mazda": "MAZDA",
    "MB": "MB",
    "Volvo": "VOLVO",
    "Volvo MS": "VOLVO_MS",
}

# Map section header keywords to the seeded section names
SECTION_MAP = {
    "PLANNING & ADMINISTRATION LABOR": "Planning & Administration Labor",
    "ONSITE EVENT LABOR": "Onsite Event Labor",
    "TRAVEL EXPENSES": "Travel Expenses",
    "PRODUCTION EXPENSES": "Production Expenses",
    "LOGISTICS EXPENSES": "Logistics Expenses",
}


def sql_str(val):
    """Escape a value for SQL. Returns 'NULL' for None."""
    if val is None:
        return "NULL"
    s = str(val).replace("'", "''").strip()
    return f"'{s}'"


def sql_num(val):
    """Format a numeric value for SQL. Returns 'NULL' for None."""
    if val is None:
        return "NULL"
    return str(val)


def is_section_header(text):
    """Check if a cell value is a section header."""
    if not text or not isinstance(text, str):
        return False
    t = text.strip().upper()
    return any(keyword in t for keyword in SECTION_MAP)


def match_section(text):
    """Return the seeded section name for a header string, or None."""
    t = text.strip().upper()
    for keyword, section_name in SECTION_MAP.items():
        if keyword in t:
            return section_name
    return None


def is_skip_row(name):
    """Return True if this row should be skipped."""
    if not name or not isinstance(name, str):
        return True
    n = name.strip()
    if not n or n == "---":
        return True
    low = n.lower()
    if low.startswith("total "):
        return True
    if low in ("unit", "unit rate"):
        return True
    return False


def is_msa_marker(name):
    """Check if this row is a 'From MSA:' type marker."""
    if not name or not isinstance(name, str):
        return False
    low = name.strip().lower()
    return low.startswith("from msa") or low.startswith("from 20")


def is_custom_marker(name):
    """Check if this row marks the start of custom/project-scope rates."""
    if not name or not isinstance(name, str):
        return False
    return "added rates determined by project scope" in name.strip().lower()


def is_overtime_row(name):
    """Check if this row is an overtime variant."""
    if not name or not isinstance(name, str):
        return False
    low = name.strip().lower()
    return " ot" in low or low.endswith(" ot") or ">10hrs" in low or ">10 hrs" in low


def format_gl_code(val):
    """Normalize GL code to string format."""
    if val is None:
        return None
    # Round floats first to eliminate precision artifacts (e.g., 4075.1400000000003 → 4075.14)
    if isinstance(val, float):
        val = round(val, 2)
    s = str(val).strip()
    if not s:
        return None
    try:
        float(s)
        parts = s.split(".")
        if len(parts) == 2:
            int_part = parts[0]
            dec_part = parts[1]
            if len(dec_part) < 2:
                dec_part = dec_part.ljust(2, "0")
            return f"{int_part}.{dec_part}"
        return s
    except ValueError:
        return s


def load_grid(ws, max_row=150, max_col=8):
    """Load worksheet data into a dict of (row, col) -> value."""
    grid = {}
    for r, row in enumerate(
        ws.iter_rows(min_row=1, max_row=max_row, max_col=max_col, values_only=True),
        start=1,
    ):
        for c, val in enumerate(row, start=1):
            if val is not None:
                grid[(r, c)] = val
    return grid


def parse_client_header(grid, tab_name):
    """Extract client metadata from the header rows."""
    client_name = grid.get((1, 3), tab_name)  # C1
    code = CLIENT_CODES.get(tab_name, tab_name.upper().replace(" ", "_"))

    third_party = 0
    agency_fee = 0
    trucking = 0
    office_payout = 0.75  # default

    # VW has an extra row 2 (Bill Rate / Cost Corp headers), so markups shift down
    # Volvo/Volvo MS have a trucking row between third_party and agency_fee
    # We scan rows 2-5 looking for the label text in column B
    for r in range(2, 6):
        label = grid.get((r, 2))
        val = grid.get((r, 3))
        if not label or not isinstance(label, str):
            continue
        low = label.strip().lower()
        if "third party cost markup" in low:
            third_party = float(val) if val else 0
        elif "trucking" in low:
            trucking = float(val) if val else 0
        elif "agency fee" in low:
            agency_fee = float(val) if val else 0

    # VW gets 80% office payout
    if code == "VW":
        office_payout = 0.80

    return {
        "name": str(client_name).strip(),
        "code": code,
        "third_party_markup": third_party,
        "agency_fee": agency_fee,
        "trucking_markup": trucking,
        "office_payout_pct": office_payout,
    }


def parse_rate_items(grid, tab_name):
    """Extract rate card items from a tab's grid."""
    items = []
    current_section = None
    is_msa = True
    display_order = 0

    # VW has an extra column D (Cost Corp) — we note it but only store bill rate (C)
    is_vw = tab_name == "VW"

    # Find all rows, sorted
    max_row = max((r for r, c in grid.keys()), default=0)

    for r in range(1, max_row + 1):
        b_val = grid.get((r, 2))  # Column B — item names, section headers, markers
        c_val = grid.get((r, 3))  # Column C — unit rate / bill rate
        e_val = grid.get((r, 5))  # Column E — GL code

        # Check for section header
        if is_section_header(b_val):
            current_section = match_section(b_val)
            is_msa = True  # reset to MSA at each new section
            display_order = 0
            continue

        if current_section is None:
            continue

        # Check for MSA/custom markers
        if is_msa_marker(b_val):
            is_msa = True
            continue
        if is_custom_marker(b_val):
            is_msa = False
            continue

        # Skip non-data rows
        if is_skip_row(b_val):
            continue

        name = str(b_val).strip()

        # Determine if this is an overtime row
        if is_overtime_row(name):
            # Attach OT info to the previous item
            if items and items[-1]["section"] == current_section:
                prev = items[-1]
                prev["has_overtime_rate"] = True
                prev["overtime_rate"] = float(c_val) if c_val else None
                # Derive OT unit label from the name
                prev["overtime_unit_label"] = "/hr >10hrs"
                # OT GL code
                ot_gl = format_gl_code(e_val)
                if not ot_gl:
                    ot_gl = format_gl_code(grid.get((r, 1)))
                prev["overtime_gl_code"] = ot_gl
            continue

        # Regular rate item
        display_order += 1
        gl_code = format_gl_code(e_val)
        if not gl_code:
            gl_code = format_gl_code(grid.get((r, 1)))

        unit_rate = float(c_val) if c_val and isinstance(c_val, (int, float)) else None

        # Determine if pass-through based on current section
        is_pass_through = current_section in ("Travel Expenses", "Production Expenses")

        # Extract unit label only when name ends with "/ <unit>" (slash + space + unit abbrev)
        # e.g., "Account Director/ hr" → "/ hr", but NOT "Fuel/Mileage" (no space after /)
        unit_label = None
        unit_match = re.search(r"(/\s+(?:hr|mnth|day|each|event))\s*$", name, re.IGNORECASE)
        if unit_match:
            unit_label = unit_match.group(1).strip()

        items.append(
            {
                "section": current_section,
                "name": name,
                "unit_rate": unit_rate,
                "unit_label": unit_label,
                "gl_code": gl_code,
                "is_from_msa": is_msa,
                "is_pass_through": is_pass_through,
                "has_overtime_rate": False,
                "overtime_rate": None,
                "overtime_unit_label": None,
                "overtime_gl_code": None,
                "display_order": display_order,
            }
        )

    return items


def generate_sql():
    """Main entry point: read the Excel, generate SQL."""
    wb = openpyxl.load_workbook(EXCEL_PATH, read_only=True, data_only=True)
    lines = []

    lines.append("-- =============================================================================")
    lines.append("-- Seed data for DriveShop Rate Card Management")
    lines.append(f"-- Generated from: {EXCEL_PATH.name}")
    lines.append("-- =============================================================================")
    lines.append("-- Run this AFTER supabase_schema.sql has been executed.")
    lines.append("-- =============================================================================\n")

    # ---- CLIENT INSERTS ----
    lines.append("-- Clients")
    clients = []
    for tab_name in VISIBLE_TABS:
        ws = wb[tab_name]
        grid = load_grid(ws)
        client = parse_client_header(grid, tab_name)
        clients.append((tab_name, client, grid))

    for tab_name, client, _ in clients:
        lines.append(
            f"INSERT INTO clients (name, code, third_party_markup, agency_fee, trucking_markup, office_payout_pct) VALUES "
            f"({sql_str(client['name'])}, {sql_str(client['code'])}, "
            f"{client['third_party_markup']}, {client['agency_fee']}, "
            f"{client['trucking_markup']}, {client['office_payout_pct']});"
        )

    lines.append("")

    # ---- RATE CARD ITEM INSERTS ----
    total_items = 0
    for tab_name, client, grid in clients:
        items = parse_rate_items(grid, tab_name)
        if not items:
            continue

        lines.append(f"\n-- Rate card items for {client['name']} ({len(items)} items)")
        for item in items:
            ot_rate = sql_num(item["overtime_rate"])
            ot_label = sql_str(item["overtime_unit_label"]) if item["has_overtime_rate"] else "NULL"
            ot_gl = sql_str(item["overtime_gl_code"]) if item["overtime_gl_code"] else "NULL"

            lines.append(
                f"INSERT INTO rate_card_items "
                f"(client_id, section_id, name, unit_rate, unit_label, gl_code, "
                f"is_from_msa, is_pass_through, has_overtime_rate, overtime_rate, "
                f"overtime_unit_label, overtime_gl_code, display_order) VALUES ("
                f"(SELECT id FROM clients WHERE code = {sql_str(client['code'])}), "
                f"(SELECT id FROM rate_card_sections WHERE name = {sql_str(item['section'])}), "
                f"{sql_str(item['name'])}, {sql_num(item['unit_rate'])}, {sql_str(item['unit_label'])}, "
                f"{sql_str(item['gl_code']) if item['gl_code'] else 'NULL'}, "
                f"{str(item['is_from_msa']).lower()}, {str(item['is_pass_through']).lower()}, "
                f"{str(item['has_overtime_rate']).lower()}, {ot_rate}, "
                f"{ot_label}, {ot_gl}, {item['display_order']});"
            )
        total_items += len(items)

    wb.close()

    # Write output
    sql = "\n".join(lines) + "\n"
    OUTPUT_PATH.write_text(sql)
    print(f"Generated {OUTPUT_PATH} with {len(clients)} clients and {total_items} rate items.")


if __name__ == "__main__":
    generate_sql()
