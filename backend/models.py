from pydantic import BaseModel
from typing import Optional, List


# ─── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Profile (shared base for both customers and pool profiles) ───────────────

class Profile(BaseModel):
    id: str
    first_name: str
    last_name: str
    gender: str                        # "male" | "female"
    date_of_birth: str                 # "YYYY-MM-DD"
    age: int
    country: str
    city: str
    height_cm: int
    email: str
    phone: str
    undergraduate_college: str
    degree: str
    income_lpa: float                  # in LPA (lakhs per annum)
    current_company: str
    designation: str
    marital_status: str                # "never_married" | "divorced" | "widowed"
    languages_known: List[str]
    siblings: int
    caste: str
    religion: str
    want_kids: str                     # "yes" | "no" | "maybe"
    open_to_relocate: str              # "yes" | "no" | "maybe"
    open_to_pets: str                  # "yes" | "no" | "maybe"
    # Extra fields for Indian matrimonial context
    manglik: Optional[str] = None      # "yes" | "no" | "unknown"
    mother_tongue: Optional[str] = None
    family_type: Optional[str] = None  # "nuclear" | "joint"
    family_values: Optional[str] = None  # "traditional" | "moderate" | "liberal"
    diet: Optional[str] = None         # "vegetarian" | "non_vegetarian" | "eggetarian" | "vegan"
    drinking: Optional[str] = None     # "never" | "occasionally" | "regularly"
    smoking: Optional[str] = None      # "never" | "occasionally" | "regularly"
    photo_url: Optional[str] = None
    status_tag: Optional[str] = None   # "new" | "active" | "on_hold" | "matched"
    notes: Optional[str] = None


# ─── Customer summary (for dashboard list) ───────────────────────────────────

class CustomerSummary(BaseModel):
    id: str
    first_name: str
    last_name: str
    age: int
    city: str
    marital_status: str
    status_tag: str
    gender: str


# ─── Match result ─────────────────────────────────────────────────────────────

class MatchResult(BaseModel):
    profile: Profile
    score: float                       # 0–100
    ai_label: str                      # e.g. "High Potential Match"
    ai_explanation: str                # 1–2 sentence explanation
    match_reasons: List[str]           # bullet points from rule-based layer


# ─── Send match ───────────────────────────────────────────────────────────────

class SendMatchRequest(BaseModel):
    customer_id: str
    match_id: str

class SendMatchResponse(BaseModel):
    success: bool
    message: str
    preview_subject: str
    preview_body: str
