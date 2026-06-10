import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from models import SendMatchRequest, SendMatchResponse
from auth import get_current_matchmaker

router = APIRouter(prefix="/send-match", tags=["send-match"])

CUSTOMERS_PATH = Path(__file__).parent.parent / "data" / "customers.json"
POOL_PATH      = Path(__file__).parent.parent / "data" / "profiles_pool.json"


def load_json(path: Path) -> list[dict]:
    with open(path) as f:
        return json.load(f)


def build_email_preview(customer: dict, match: dict, matchmaker_name: str) -> tuple[str, str]:
    subject = f"TDC: A Special Introduction for {customer['first_name']} — Meet {match['first_name']}"

    body = f"""Dear {customer['first_name']},

We at The Date Crew are delighted to present a potential match we've carefully curated for you.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTRODUCING: {match['first_name']} {match['last_name']}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Age       : {match['age']} years
City      : {match['city']}, {match['country']}
Profession: {match['designation']} at {match['current_company']}
Education : {match['degree']} — {match['undergraduate_college']}
Religion  : {match['religion']}
Values    : {match.get('family_values', 'Moderate').capitalize()}

Why we think you'd connect:
Both of you share compatible views on family, lifestyle, and life goals — 
making this a match worth exploring.

If you'd like to take this forward, please let your matchmaker know and 
we'll facilitate a formal introduction.

With warm regards,
{matchmaker_name}
The Date Crew Matchmaking Team
contact@thedatecrew.com
"""
    return subject, body


@router.post("", response_model=SendMatchResponse)
def send_match(body: SendMatchRequest, matchmaker: dict = Depends(get_current_matchmaker)):
    if body.customer_id not in matchmaker["assigned_customer_ids"]:
        raise HTTPException(status_code=403, detail="Customer not assigned to you")

    customers = load_json(CUSTOMERS_PATH)
    pool      = load_json(POOL_PATH)

    customer = next((c for c in customers if c["id"] == body.customer_id), None)
    match    = next((p for p in pool if p["id"] == body.match_id), None)

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if not match:
        raise HTTPException(status_code=404, detail="Match profile not found")

    subject, email_body = build_email_preview(customer, match, matchmaker["full_name"])

    return SendMatchResponse(
        success=True,
        message=f"Match introduction for {match['first_name']} {match['last_name']} sent to {customer['first_name']}.",
        preview_subject=subject,
        preview_body=email_body,
    )
