import json
import os
import httpx
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from models import MatchResult, Profile
from auth import get_current_matchmaker
from matching.algo import get_ranked_matches, get_ai_label

router = APIRouter(prefix="/matches", tags=["matches"])

CUSTOMERS_PATH = Path(__file__).parent.parent / "data" / "customers.json"
POOL_PATH      = Path(__file__).parent.parent / "data" / "profiles_pool.json"
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
GROQ_URL       = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL     = "llama-3.3-70b-versatile"


def load_json(path: Path) -> list[dict]:
    with open(path) as f:
        return json.load(f)


async def get_ai_explanation(customer: dict, candidate: dict, score: float, reasons: list[str]) -> tuple[str, str]:
    """
    Call Groq to get a human-readable label + explanation for a match.
    Falls back to rule-based label if Groq call fails.
    """
    if not GROQ_API_KEY:
        return get_ai_label(score), "Matched based on compatibility criteria."

    prompt = f"""You are a warm, professional matchmaker at a premium Indian matrimonial service.

Customer profile:
- Name: {customer['first_name']} {customer['last_name']}, {customer['age']} years old
- City: {customer['city']} | Religion: {customer['religion']} | Values: {customer.get('family_values', 'moderate')}
- Profession: {customer['designation']} at {customer['current_company']}
- Income: ₹{customer['income_lpa']}L | Wants kids: {customer['want_kids']} | Relocate: {customer['open_to_relocate']}

Suggested match profile:
- Name: {candidate['first_name']} {candidate['last_name']}, {candidate['age']} years old
- City: {candidate['city']} | Religion: {candidate['religion']} | Values: {candidate.get('family_values', 'moderate')}
- Profession: {candidate['designation']} at {candidate['current_company']}
- Income: ₹{candidate['income_lpa']}L | Wants kids: {candidate['want_kids']} | Relocate: {candidate['open_to_relocate']}

Compatibility score: {score}/100
Key matching reasons: {', '.join(reasons[:3]) if reasons else 'general compatibility'}

Return ONLY a JSON object with exactly two keys:
- "label": a short 2-4 word label (e.g. "Excellent Match", "High Potential Match", "Good Match", "Possible Match")
- "explanation": one warm, specific sentence (max 25 words) explaining why they'd be a good fit

No preamble. No markdown. Just the JSON."""

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 100,
                    "temperature": 0.4,
                }
            )
            data = resp.json()
            content = data["choices"][0]["message"]["content"].strip()
            # Strip markdown fences if present
            content = content.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(content)
            return parsed.get("label", get_ai_label(score)), parsed.get("explanation", "")
    except Exception:
        return get_ai_label(score), f"Compatible on {', '.join(reasons[:2])}." if reasons else "Good overall compatibility."


@router.get("/{customer_id}", response_model=list[MatchResult])
async def get_matches(
    customer_id: str,
    matchmaker: dict = Depends(get_current_matchmaker),
):
    if customer_id not in matchmaker["assigned_customer_ids"]:
        raise HTTPException(status_code=403, detail="Customer not assigned to you")

    customers = load_json(CUSTOMERS_PATH)
    pool      = load_json(POOL_PATH)

    customer = next((c for c in customers if c["id"] == customer_id), None)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    ranked = get_ranked_matches(customer, pool, top_n=15)

    results = []
    for item in ranked:
        candidate = item["candidate"]
        score     = item["score"]
        reasons   = item["match_reasons"]

        label, explanation = await get_ai_explanation(customer, candidate, score, reasons)

        results.append(MatchResult(
            profile=Profile(**candidate),
            score=score,
            ai_label=label,
            ai_explanation=explanation,
            match_reasons=reasons,
        ))

    return results
