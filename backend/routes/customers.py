import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from models import CustomerSummary, Profile
from auth import get_current_matchmaker

router = APIRouter(prefix="/customers", tags=["customers"])

DATA_PATH = Path(__file__).parent.parent / "data" / "customers.json"

def load_customers() -> list[dict]:
    with open(DATA_PATH) as f:
        return json.load(f)

@router.get("", response_model=list[CustomerSummary])
def get_customers(matchmaker: dict = Depends(get_current_matchmaker)):
    """Return summary list of customers assigned to this matchmaker."""
    all_customers = load_customers()
    assigned_ids = set(matchmaker["assigned_customer_ids"])
    assigned = [c for c in all_customers if c["id"] in assigned_ids]

    return [
        CustomerSummary(
            id=c["id"],
            first_name=c["first_name"],
            last_name=c["last_name"],
            age=c["age"],
            city=c["city"],
            marital_status=c["marital_status"],
            status_tag=c.get("status_tag", "active"),
            gender=c["gender"],
        )
        for c in assigned
    ]

@router.get("/{customer_id}", response_model=Profile)
def get_customer(customer_id: str, matchmaker: dict = Depends(get_current_matchmaker)):
    """Return full biodata for a single customer."""
    if customer_id not in matchmaker["assigned_customer_ids"]:
        raise HTTPException(status_code=403, detail="Customer not assigned to you")

    all_customers = load_customers()
    customer = next((c for c in all_customers if c["id"] == customer_id), None)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return Profile(**customer)
