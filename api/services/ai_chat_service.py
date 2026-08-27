import json
import os

import anthropic

from services.ai_service import (
    get_supabase,
    read_prompt,
    fetch_rate_card,
    fetch_historical_patterns,
)

MAX_CONVERSATION_MESSAGES = 20


def _fetch_historical_events(client_name: str) -> list[dict]:
    """Fetch up to 20 most recent historical events for this client."""
    if not client_name:
        return []

    supabase = get_supabase()
    resp = (
        supabase.table("historical_events")
        .select(
            "event_name, event_type, location, grand_total, bid_total, "
            "recap_total, has_recap_data, sections, labor_roles"
        )
        .ilike("client", client_name)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    return resp.data or []


def _fetch_cross_client_events(event_type: str, exclude_client: str) -> list[dict]:
    """Fetch up to 10 events of the same type from OTHER clients for comparison."""
    if not event_type:
        return []

    supabase = get_supabase()
    resp = (
        supabase.table("historical_events")
        .select(
            "client, event_name, event_type, location, grand_total, bid_total, "
            "recap_total, has_recap_data, sections, labor_roles"
        )
        .eq("event_type", event_type)
        .neq("client", exclude_client)
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    )
    return resp.data or []


def _format_amount(amount) -> str:
    """Format a dollar amount concisely. Rounds to nearest $1K for amounts >= $1000."""
    if not amount:
        return "$0"
    amount = float(amount)
    if amount >= 1000:
        return f"${amount / 1000:,.0f}K"
    return f"${amount:,.0f}"


def _format_historical_events(events: list[dict], include_client: bool = False) -> str:
    """Format historical events as concise text for the system prompt."""
    if not events:
        return "No historical events found." if include_client else "No historical events found for this client."

    lines = []
    for i, event in enumerate(events, 1):
        name = event.get("event_name") or "Unnamed Event"
        etype = event.get("event_type") or ""
        location = event.get("location") or ""
        client = event.get("client") or ""

        # Identity line
        parts = [name]
        if etype:
            parts.append(etype)
        if location:
            parts.append(location)
        if include_client and client:
            parts.append(client)
        lines.append(f"{i}. {' | '.join(parts)}")

        # Financials line
        fin_parts = []
        bid = event.get("bid_total")
        if bid:
            fin_parts.append(f"Bid: {_format_amount(bid)}")
        actual = event.get("recap_total")
        if actual and event.get("has_recap_data"):
            fin_parts.append(f"Actual: {_format_amount(actual)}")
        grand = event.get("grand_total")
        if grand and not bid:
            fin_parts.append(f"Total: {_format_amount(grand)}")

        # Section breakdown from sections JSONB
        sections = event.get("sections") or []
        if sections and isinstance(sections, list):
            sec_parts = []
            for sec in sections[:6]:
                sec_name = sec.get("canonical_name") or sec.get("name") or ""
                sec_total = sec.get("bid_total") or sec.get("total")
                if sec_name and sec_total:
                    short_name = (
                        sec_name
                        .replace("PLANNING & ADMINISTRATION", "Planning")
                        .replace("ONSITE LABOR ACTIVITY", "Onsite Labor")
                        .replace("TRAVEL EXPENSES", "Travel")
                        .replace("CREATIVE COSTS", "Creative")
                        .replace("PRODUCTION EXPENSES", "Production")
                        .replace("LOGISTICS EXPENSES", "Logistics")
                    )
                    sec_parts.append(f"{short_name} {_format_amount(sec_total)}")
            if sec_parts:
                fin_parts.append(f"Sections: {', '.join(sec_parts)}")

        if fin_parts:
            lines.append(f"   {' | '.join(fin_parts)}")

        # Roles line from labor_roles JSONB
        roles = event.get("labor_roles") or []
        if roles and isinstance(roles, list):
            role_parts = []
            for role in roles[:5]:
                rname = role.get("role") or role.get("name") or ""
                count = role.get("quantity") or role.get("count")
                if rname:
                    if count and count > 1:
                        role_parts.append(f"{rname} ({count})")
                    else:
                        role_parts.append(rname)
            if role_parts:
                lines.append(f"   Roles: {', '.join(role_parts)}")

    return "\n".join(lines)


def _extract_sources(response_text: str, events: list[dict]) -> list[str]:
    """Find which historical events were referenced in the response."""
    if not events or not response_text:
        return []

    response_lower = response_text.lower()
    sources = []
    for event in events:
        name = event.get("event_name")
        if not name:
            continue
        # Check if a significant portion of the event name appears in the response
        # Use the full name or the first 15+ chars for matching
        if name.lower() in response_lower:
            location = event.get("location") or ""
            label = f"{name} - {location}" if location else name
            if label not in sources:
                sources.append(label)

    return sources


async def generate_chat_response(
    message: str,
    conversation_history: list[dict],
    estimate_state: dict,
    estimate_id: str,
) -> dict:
    """Generate a conversational chat response using Claude."""

    # Cap conversation history at 20 messages (keep most recent)
    if len(conversation_history) > MAX_CONVERSATION_MESSAGES:
        conversation_history = conversation_history[-MAX_CONVERSATION_MESSAGES:]

    # Extract context
    client_name = estimate_state.get("client_name") or ""
    event_type = estimate_state.get("event_type") or ""

    # Fetch contextual data
    rate_card_data = fetch_rate_card(client_name) if client_name else []
    client_patterns = fetch_historical_patterns(client_name, event_type)
    all_patterns = fetch_historical_patterns("ALL", event_type) if event_type else ""
    historical_events = _fetch_historical_events(client_name)
    cross_client_events = _fetch_cross_client_events(event_type, client_name)
    formatted_events = _format_historical_events(historical_events)
    formatted_cross_client = _format_historical_events(cross_client_events, include_client=True)

    # Assemble system prompt
    system_template = read_prompt("chat_system_prompt.md")
    system_prompt = (
        system_template
        .replace("{estimate_state}", json.dumps(estimate_state, indent=2))
        .replace("{historical_events}", formatted_events)
        .replace("{historical_patterns}", client_patterns)
        .replace("{cross_client_events}", formatted_cross_client)
        .replace("{all_client_patterns}", all_patterns)
        .replace("{rate_card_data}", json.dumps(rate_card_data, indent=2))
        .replace("{client_name}", client_name or "Unknown Client")
        .replace("{event_type}", event_type or "Unknown Type")
    )

    # Build messages array: conversation history + new user message
    messages = []
    for msg in conversation_history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    # Call Claude API
    try:
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
        response = client.messages.create(
            model="claude-opus-5",
            max_tokens=6000,
            system=system_prompt,
            messages=messages,
        )
        response_text = next(b.text for b in response.content if b.type == "text").strip()
    except Exception:
        return {
            "response": "I'm having trouble connecting right now. Please try again.",
            "sources": [],
        }

    # Extract which historical events were referenced
    all_events = historical_events + cross_client_events
    sources = _extract_sources(response_text, all_events)

    return {
        "response": response_text,
        "sources": sources,
    }
