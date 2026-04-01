from services.ai_service import get_supabase, fetch_rate_card

# Map AI scope section names to the section keys used in estimate_line_items
SECTION_MAP = {
    "planning": "production",
    "planning & administration": "production",
    "onsite labor": "production",
    "onsite labor activity": "production",
    "production": "production",
    "production expenses": "production",
    "travel": "travel",
    "travel expenses": "travel",
    "logistics": "travel",
    "logistics expenses": "travel",
    "creative": "creative",
    "creative costs": "creative",
    "access": "access",
    "access fees": "access",
    "access fees & insurance": "access",
    "insurance": "access",
    "fees": "fees",
    "fees & markups": "fees",
    "misc": "misc",
}


def _normalize_role_name(name: str) -> str:
    """Strip common suffixes to normalize role names for matching."""
    import re
    name = name.lower().strip()
    # Remove common suffixes: "Day (10 hr)", "(10 hr)", "/ hr", "/hr", "(/hr)", etc.
    name = re.sub(r'\s*\(?(?:/?\s*(?:\d+\s*)?hr|day\s*\(\d+\s*hr\))\)?\s*$', '', name)
    # Remove trailing slashes and spaces
    name = re.sub(r'\s*/\s*$', '', name).strip()
    return name


def _find_rate_card_match(role_name: str, rate_card_items: list[dict]) -> dict | None:
    """Find the best matching rate card item for a role name."""
    role_lower = role_name.lower().strip()
    role_normalized = _normalize_role_name(role_name)

    # Exact match first
    for item in rate_card_items:
        if item["name"].lower().strip() == role_lower:
            return item

    # Normalized match — strip suffixes and compare
    for item in rate_card_items:
        if _normalize_role_name(item["name"]) == role_normalized:
            return item

    # Partial match — normalized name contains or is contained by
    for item in rate_card_items:
        item_normalized = _normalize_role_name(item["name"])
        if role_normalized in item_normalized or item_normalized in role_normalized:
            return item

    return None


def _map_section(section_name: str) -> str:
    """Map a scope section name to a line item section key."""
    return SECTION_MAP.get(section_name.lower().strip(), "misc")


def _fetch_client_by_id(client_id: str) -> dict | None:
    """Fetch client record by ID."""
    supabase = get_supabase()
    resp = (
        supabase.table("clients")
        .select("id, name, agency_fee, third_party_markup")
        .eq("id", client_id)
        .limit(1)
        .execute()
    )
    return resp.data[0] if resp.data else None


def match_scope_to_rate_card(
    staffing: list[dict],
    cost_breakdown: list[dict],
    client_id: str,
) -> dict:
    """Match AI scope output to client rate card items and fee types."""

    client = _fetch_client_by_id(client_id)
    if not client:
        return {"labor_entries": [], "line_items": [], "error": "Client not found"}

    rate_card_items = fetch_rate_card(client["name"])
    default_markup = client.get("third_party_markup", 0)

    # Match staffing roles to rate card items
    labor_entries = []
    for i, item in enumerate(staffing):
        role_name = item.get("role", "")
        match = _find_rate_card_match(role_name, rate_card_items)

        entry = {
            "role_name": role_name,
            "quantity": item.get("quantity", 1),
            "days": item.get("days", 1),
            "unit_rate": match["unit_rate"] if match else item.get("dailyRate", 0),
            "resource_type": "external",
            "display_order": i,
            "rate_card_item_id": None,
            "gl_code": None,
        }

        if match:
            entry["gl_code"] = match.get("gl_code")
            # rate_card_item_id requires fetching the actual item ID
            # The rate card data from fetch_rate_card doesn't include the ID
            # We'll look it up separately
            entry["_matched_name"] = match["name"]

        labor_entries.append(entry)

    # Look up actual rate_card_item IDs for matched items
    if any(e.get("_matched_name") for e in labor_entries):
        supabase = get_supabase()
        client_resp = (
            supabase.table("clients")
            .select("id")
            .eq("id", client_id)
            .limit(1)
            .execute()
        )
        if client_resp.data:
            items_resp = (
                supabase.table("rate_card_items")
                .select("id, fee_types(name, gl_code)")
                .eq("client_id", client_id)
                .eq("is_active", True)
                .execute()
            )
            for rci in items_resp.data or []:
                ft = rci.get("fee_types") or {}
                rci_name = ft.get("name", "").lower().strip()
                for entry in labor_entries:
                    matched = entry.pop("_matched_name", None)
                    if matched and matched.lower().strip() == rci_name:
                        entry["rate_card_item_id"] = rci["id"]
                        entry["gl_code"] = ft.get("gl_code") or entry["gl_code"]

    # Clean up any remaining _matched_name keys
    for entry in labor_entries:
        entry.pop("_matched_name", None)

    # Map cost breakdown sections to line items
    line_items = []
    for i, item in enumerate(cost_breakdown):
        section_name = item.get("section", "")
        section_key = _map_section(section_name)

        # Skip sections that map to labor (already handled via staffing)
        # Only create line items for non-labor sections
        if section_key in ("production", "travel", "creative", "access", "misc"):
            line_items.append({
                "section": section_key,
                "item_name": section_name,
                "quantity": 1,
                "unit_cost": item.get("estimatedCost", 0),
                "markup_pct": default_markup * 100 if section_key in ("production", "travel") else 0,
                "gl_code": None,
                "rate_card_item_id": None,
                "display_order": i,
            })

    return {
        "labor_entries": labor_entries,
        "line_items": line_items,
    }
