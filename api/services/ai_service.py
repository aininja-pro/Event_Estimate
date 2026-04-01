import json
import os
from pathlib import Path

import anthropic
from supabase import create_client

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"

REQUIRED_NUDGE_FIELDS = {"id", "type", "severity", "title", "message"}


def get_supabase():
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY", "")
    return create_client(url, key)


def read_prompt(filename: str) -> str:
    return (PROMPTS_DIR / filename).read_text()


def fetch_rate_card(client_name: str) -> list[dict]:
    """Fetch the client's rate card items joined with fee_types."""
    supabase = get_supabase()

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


def fetch_historical_patterns(client_name: str, event_type: str) -> str:
    """Fetch historical patterns for this client × event_type. Falls back to ALL client."""
    if not client_name and not event_type:
        return "No historical data available — client and event type not specified."

    supabase = get_supabase()
    pattern = None

    # Try exact client × event_type match
    if client_name and event_type:
        resp = (
            supabase.table("historical_patterns")
            .select("*")
            .eq("client", client_name)
            .eq("event_type", event_type)
            .limit(1)
            .execute()
        )
        if resp.data:
            pattern = resp.data[0]

    # Fallback to ALL client × event_type
    if not pattern and event_type:
        resp = (
            supabase.table("historical_patterns")
            .select("*")
            .eq("client", "ALL")
            .eq("event_type", event_type)
            .limit(1)
            .execute()
        )
        if resp.data:
            pattern = resp.data[0]

    if not pattern:
        return "No historical data available for this client and event type."

    # Format concise text block (<500 tokens)
    p = pattern
    sa = p.get("section_averages") or {}
    sv = p.get("section_variance") or {}
    roles = p.get("common_roles") or []

    client_label = p["client"] if p["client"] != "ALL" else "all clients"
    lines = [
        f"For {client_label} {p['event_type']} events ({p['event_count']} historical events):",
        f"- Average total estimate: ${p.get('avg_grand_total') or 0:,.0f}",
        f"- Average GP: {p.get('avg_gp_percent') or 0:.1f}%",
    ]

    # Section breakdown
    section_parts = []
    for sec_name, sec_data in sa.items():
        pct = sec_data.get("pct_of_total", 0)
        if pct > 0:
            short_name = sec_name.replace("PLANNING & ADMINISTRATION", "Planning").replace("ONSITE LABOR ACTIVITY", "Onsite Labor").replace("TRAVEL EXPENSES", "Travel").replace("CREATIVE COSTS", "Creative").replace("PRODUCTION EXPENSES", "Production").replace("LOGISTICS EXPENSES", "Logistics")
            section_parts.append(f"{short_name} {pct}%")
    if section_parts:
        lines.append(f"- Section breakdown (% of total): {', '.join(section_parts)}")

    # Sections that tend to go over budget
    over_budget = []
    for sec_name, var_data in sv.items():
        avg_var = var_data.get("avg_variance_pct")
        over_pct = var_data.get("over_budget_pct", 0)
        if avg_var and avg_var > 5:
            short_name = sec_name.split(" ")[0]
            over_budget.append(f"{short_name} (+{avg_var:.0f}% avg, over budget {over_pct}% of the time)")
    if over_budget:
        lines.append(f"- Sections that tend to go over budget: {'; '.join(over_budget)}")

    # Common roles
    top_roles = [r for r in roles[:5] if r.get("frequency", 0) > 0.3]
    if top_roles:
        role_parts = [f"{r['role']} ({r['frequency']*100:.0f}% of events, avg ${r['avg_rate']:,.0f})" for r in top_roles]
        lines.append(f"- Most common roles: {'; '.join(role_parts)}")

    return "\n".join(lines)


def _pre_compute_staffing_mismatches(estimate_state: dict) -> dict:
    """Compare labor log roles to schedule roles per segment. Returns pre-computed facts."""
    results = {}
    for i, segment in enumerate(estimate_state.get("segments") or []):
        seg_name = segment.get("name", f"Segment {i+1}")
        labor_entries = segment.get("labor_entries", [])
        schedule_entries = segment.get("schedule_entries", [])

        # If labor_entries is empty, the labor log is schedule-driven —
        # roles are derived from the schedule so there can be no mismatch.
        if not labor_entries:
            continue

        labor_roles = {e["role_name"] for e in labor_entries if e.get("role_name")}
        schedule_roles = {e["role_name"] for e in schedule_entries if e.get("role_name")}

        in_labor_not_schedule = sorted(labor_roles - schedule_roles)
        in_schedule_not_labor = sorted(schedule_roles - labor_roles)

        if in_labor_not_schedule or in_schedule_not_labor:
            results[seg_name] = {
                "in_labor_not_schedule": in_labor_not_schedule,
                "in_schedule_not_labor": in_schedule_not_labor,
            }

    return results


async def generate_nudges(estimate_state: dict) -> list[dict]:
    """Assemble prompt, call Claude API, parse and validate nudges."""
    # Read prompt templates
    system_template = read_prompt("nudge_system_prompt.md")
    rules = read_prompt("nudge_rules.md")

    # Fetch rate card for this client
    client_name = estimate_state.get("client_name") or ""
    event_type = estimate_state.get("event_type") or ""
    rate_card_data = fetch_rate_card(client_name) if client_name else []

    # Fetch historical patterns
    historical_patterns = fetch_historical_patterns(client_name, event_type)

    # Pre-compute staffing mismatches so Claude doesn't have to string-match
    staffing_mismatches = _pre_compute_staffing_mismatches(estimate_state)
    estimate_state = {**estimate_state, "pre_computed_staffing_mismatches": staffing_mismatches}

    # Assemble system prompt
    system_prompt = (
        system_template
        .replace("{nudge_rules}", rules)
        .replace("{rate_card_data}", json.dumps(rate_card_data, indent=2))
        .replace("{estimate_state}", json.dumps(estimate_state, indent=2))
        .replace("{historical_patterns}", historical_patterns)
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
