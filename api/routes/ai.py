import hashlib
import json
import time
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from services.ai_service import generate_nudges

router = APIRouter(prefix="/api/ai")

# In-memory cache: hash -> (response_dict, timestamp)
_cache: dict[str, tuple[dict, float]] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes


class EstimateState(BaseModel):
    client_name: str | None = None
    event_type: str | None = None
    event_name: str | None = None
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    cost_structure: str | None = None
    attendance: int | None = None
    segments: list[dict] = []
    summary: dict = {}


class NudgeRequest(BaseModel):
    estimate_id: str
    estimate_state: EstimateState


@router.post("/nudges")
async def get_nudges(request: NudgeRequest):
    # Hash the estimate state for caching
    state_json = json.dumps(request.estimate_state.model_dump(), sort_keys=True)
    state_hash = hashlib.sha256(state_json.encode()).hexdigest()

    # Check cache
    now = time.time()
    if state_hash in _cache:
        cached_response, cached_at = _cache[state_hash]
        if now - cached_at < CACHE_TTL_SECONDS:
            return {**cached_response, "cached": True}

    # Generate nudges via Claude API
    try:
        nudges = await generate_nudges(request.estimate_state.model_dump())
        response = {
            "nudges": nudges,
            "cached": False,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
        # Store in cache
        _cache[state_hash] = (response, now)
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "nudges": [],
            "error": "AI service temporarily unavailable",
            "cached": False,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
