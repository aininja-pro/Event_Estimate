import json
import os
from pathlib import Path

import anthropic
from supabase import create_client

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"

REQUIRED_NUDGE_FIELDS = {"id", "type", "severity", "title", "message"}


def _get_supabase():
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY", "")
    return create_client(url, key)


def _read_prompt(filename: str) -> str:
    return (PROMPTS_DIR / filename).read_text()


def _fetch_rate_card(client_name: str) -> list[dict]:
    """Fetch the client's rate card items joined with fee_types."""
    supabase = _get_supabase()

    # Look up client by name
    client_resp = (
        supabase.table("clients")
        .select("id")
        .ilike("name", client_name)
        .limit(1)
        .execute()
    )
    if not client_resp.data:
        return []

    client_id = client_resp.data[0]["id"]

    # Fetch rate card items with fee_type info
    items_resp = (
        supabase.table("rate_card_items")
        .select(
            "id, section_id, unit_rate, is_rate_locked, is_from_msa, "
            "fee_types(name, gl_code, cost_type), "
            "rate_card_sections(name)"
        )
        .eq("client_id", client_id)
        .eq("is_active", True)
        .execute()
    )

    results = []
    for item in items_resp.data or []:
        fee_type = item.get("fee_types") or {}
        section = item.get("rate_card_sections") or {}
        results.append({
            "name": fee_type.get("name") or item.get("name", "Unknown"),
            "gl_code": fee_type.get("gl_code", ""),
            "section": section.get("name", ""),
            "unit_rate": item.get("unit_rate", 0),
            "is_rate_locked": item.get("is_rate_locked", False),
            "is_from_msa": item.get("is_from_msa", False),
            "cost_type": fee_type.get("cost_type", ""),
        })

    return results


async def generate_nudges(estimate_state: dict) -> list[dict]:
    """Assemble prompt, call Claude API, parse and validate nudges."""
    # Read prompt templates
    system_template = _read_prompt("nudge_system_prompt.md")
    rules = _read_prompt("nudge_rules.md")

    # Fetch rate card for this client
    client_name = estimate_state.get("client_name") or ""
    rate_card_data = _fetch_rate_card(client_name) if client_name else []

    # Assemble system prompt
    system_prompt = (
        system_template
        .replace("{nudge_rules}", rules)
        .replace("{rate_card_data}", json.dumps(rate_card_data, indent=2))
        .replace("{estimate_state}", json.dumps(estimate_state, indent=2))
    )

    # Call Claude API
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": (
                    "Analyze this estimate and return nudges as a JSON array. "
                    "Return ONLY valid JSON, no markdown, no explanation."
                ),
            }
        ],
    )

    # Parse response
    response_text = message.content[0].text.strip()
    nudges = json.loads(response_text)

    # Validate each nudge has required fields
    validated = [
        nudge for nudge in nudges
        if isinstance(nudge, dict) and REQUIRED_NUDGE_FIELDS.issubset(nudge.keys())
    ]

    return validated
