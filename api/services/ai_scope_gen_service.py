import json
import os

import anthropic

from services.ai_service import get_supabase, fetch_rate_card


# Historical section averages (from static ai-context.json)
SECTION_AVERAGES = [
    ("ONSITE LABOR ACTIVITY", 4773, 4723),
    ("LOGISTICS EXPENSES", 1862, 2297),
    ("PRODUCTION EXPENSES", 1281, 1401),
    ("PLANNING & ADMINISTRATION", 1091, 1132),
    ("TRAVEL EXPENSES", 595, 1525),
    ("CREATIVE COSTS", 11, 371),
]


def _fetch_client_name(client_id: str) -> str | None:
    """Look up client name by ID."""
    supabase = get_supabase()
    resp = (
        supabase.table("clients")
        .select("name")
        .eq("id", client_id)
        .limit(1)
        .execute()
    )
    return resp.data[0]["name"] if resp.data else None


def _format_rate_card_for_prompt(rate_card: list[dict]) -> str:
    """Format client rate card items for the system prompt."""
    if not rate_card:
        return "No rate card available for this client."

    # Group by section
    sections: dict[str, list[dict]] = {}
    for item in rate_card:
        sec = item.get("section", "Other")
        sections.setdefault(sec, []).append(item)

    lines = []
    for sec_name, items in sections.items():
        lines.append(f"\n{sec_name}:")
        for item in items:
            name = item["name"]
            rate = item.get("unit_rate") or 0
            gl = item.get("gl_code", "")
            source = "MSA" if item.get("is_from_msa") else "Custom"
            cost_type = item.get("cost_type", "")
            gl_str = f", GL {gl}" if gl else ""
            lines.append(f"  - {name}: ${rate:,.2f}/day{gl_str} ({source}, {cost_type})")

    return "\n".join(lines)


def _build_scope_prompt(client_name: str, rate_card: list[dict]) -> str:
    """Build the system prompt with client-specific rate card data."""
    rate_card_text = _format_rate_card_for_prompt(rate_card)

    # Separate labor roles from non-labor items
    labor_items = [r for r in rate_card if r.get("cost_type") == "labor"]
    labor_names = [r["name"] for r in labor_items]

    section_lines = "\n".join(
        f"- {name}: avg bid ${bid:,}, avg actual ${actual:,}"
        for name, bid, actual in SECTION_AVERAGES
    )

    return f"""You are an expert DriveShop event scoping specialist. You have deep knowledge of experiential marketing, auto shows, ride & drive events, and corporate events.

You are building a scope estimate for a {client_name} event.

HISTORICAL SECTION COST AVERAGES (across 1,675 events):
{section_lines}

{client_name.upper()} RATE CARD — use ONLY these roles and rates for staffing:
{rate_card_text}

CRITICAL RULES FOR STAFFING:
- Use ONLY the role names from the {client_name} rate card above. Match names EXACTLY as written.
- Use the rate card's unit_rate as the dailyRate. Do not invent or adjust rates.
- Labor roles (cost_type: labor) go in the "staffing" array.
- Non-labor items (Per Diem, travel, production items) go in "costBreakdown", NOT in staffing.
- Per Diem is a flat fee, not a staffing role. Include it in costBreakdown under Travel Expenses.
- SKIP Agency Fees in costBreakdown — agency fees are auto-calculated by the system. Do NOT include an AGENCY FEES section.
- Available labor roles: {', '.join(labor_names) if labor_names else 'None found'}

INSTRUCTIONS:
- Base recommendations on historical data patterns and the client's rate card.
- Scale section costs relative to historical averages based on event parameters.
- In costBreakdown "notes", explain relationship to historical averages.
- The mid estimate should roughly equal the sum of costBreakdown items + staffing costs.
- Default margin recommendation: 25-30%.
- Respond with ONLY valid JSON wrapped in ```json fences.

REQUIRED JSON RESPONSE STRUCTURE:
```json
{{
  "summary": "Brief 2-3 sentence scope overview",
  "staffing": [
    {{ "role": "Exact Role Name From Rate Card", "quantity": 2, "days": 3, "dailyRate": 850, "totalCost": 5100, "rationale": "Why this role/count" }}
  ],
  "costBreakdown": [
    {{ "section": "SECTION NAME", "estimatedCost": 45000, "percentOfTotal": 35, "notes": "Based on..." }}
  ],
  "totalEstimate": {{ "low": 80000, "mid": 95000, "high": 115000 }},
  "confidenceNotes": ["Note about data backing", "Note about assumptions"],
  "marginRecommendation": {{ "suggestedMarginPct": 28, "rationale": "Based on historical..." }}
}}
```"""


def _build_user_message(params: dict) -> str:
    """Build the user message from event parameters."""
    lines = [
        "Please generate a scope estimate for the following event:",
        "",
        f"Event Type: {params.get('event_type', 'Unknown')}",
        f"Duration: {params.get('duration', 1)} day(s)",
        f"Estimated Attendance: {params.get('attendance', 'Unknown')}",
    ]
    if params.get("event_name"):
        lines.append(f"Event Name: {params['event_name']}")
    if params.get("location"):
        lines.append(f"Location: {params['location']}")
    if params.get("budget_range"):
        lines.append(f"Budget Range: {params['budget_range']}")
    if params.get("sections"):
        lines.append(f"\nSections to include: {', '.join(params['sections'])}")
    if params.get("special_requirements"):
        lines.append(f"\nSpecial Requirements: {params['special_requirements']}")
    return "\n".join(lines)


async def generate_scope(params: dict, client_id: str) -> dict:
    """Generate an AI scope estimate using the client's actual rate card."""

    # Fetch client name and rate card
    client_name = _fetch_client_name(client_id)
    if not client_name:
        return {"error": "Client not found"}

    rate_card = fetch_rate_card(client_name)

    # Build prompt with real rate card data
    system_prompt = _build_scope_prompt(client_name, rate_card)
    user_message = _build_user_message(params)

    # Call Claude
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    response_text = response.content[0].text.strip()

    # Extract JSON from ```json fences
    import re
    match = re.search(r"```json\s*([\s\S]*?)```", response_text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            return {"error": "Failed to parse AI response", "raw": response_text}

    # Try parsing the entire response as JSON
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response", "raw": response_text}
