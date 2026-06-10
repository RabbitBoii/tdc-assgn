"""
TDC Matching Algorithm
======================
Two-phase pipeline:
  1. Rule-based scoring  → weighted score 0–100 + match_reasons list
  2. AI layer (Groq)     → label + 1-2 sentence human explanation

Male matching   : strict filters (younger, shorter, earns less, kids match)
                  + soft compatibility scoring
Female matching : holistic compatibility (profession tier, values, relocation,
                  lifestyle, education parity, age range)
"""

from typing import List, Tuple
import math


# ─── Weights ──────────────────────────────────────────────────────────────────

MALE_WEIGHTS = {
    "age":          20,   # woman younger than man
    "height":       10,   # woman shorter than man
    "income":       15,   # woman earns less
    "kids":         20,   # same stance on kids
    "religion":     10,   # same religion preferred
    "relocate":     10,   # compatible relocation views
    "diet":          5,   # same diet
    "family_values": 5,   # same family values
    "marital":       5,   # never_married preferred
}

FEMALE_WEIGHTS = {
    "age":           15,  # within reasonable range (3 yrs younger to 7 yrs older)
    "profession":    15,  # compatible profession tier
    "education":     10,  # education parity
    "values":        15,  # family values alignment
    "relocate":      15,  # relocation compatibility
    "kids":          15,  # kids stance match
    "lifestyle":     10,  # diet / drinking / smoking compatibility
    "religion":       5,  # same religion preferred
}


# ─── Profession tier mapping ──────────────────────────────────────────────────

PROFESSION_TIER = {
    # tier 1 — high-growth / high-comp
    "software engineer": 1, "product manager": 1, "data scientist": 1,
    "investment banker": 1, "consultant": 1, "doctor": 1, "lawyer": 1,
    "entrepreneur": 1, "founder": 1, "ca": 1, "chartered accountant": 1,
    # tier 2 — stable professional
    "manager": 2, "analyst": 2, "engineer": 2, "teacher": 2,
    "professor": 2, "nurse": 2, "architect": 2, "designer": 2,
    "hr manager": 2, "marketing manager": 2,
    # tier 3 — entry level / other
    "executive": 3, "associate": 3, "assistant": 3, "intern": 3,
}

def get_profession_tier(designation: str) -> int:
    d = designation.lower()
    for key, tier in PROFESSION_TIER.items():
        if key in d:
            return tier
    return 2   # default to mid-tier if unknown


# ─── Individual scoring functions ─────────────────────────────────────────────

def score_age_male(customer_age: int, candidate_age: int) -> Tuple[float, str]:
    """Woman should be younger. Bigger age gap = higher score, capped."""
    diff = customer_age - candidate_age
    if diff < 0:
        return 0.0, None   # candidate older than male customer — skip
    if diff == 0:
        return 0.3, "Same age"
    score = min(1.0, diff / 10)   # max score at 10yr gap
    return score, f"She is {diff} year(s) younger"

def score_age_female(customer_age: int, candidate_age: int) -> Tuple[float, str]:
    """Man should be 0–7 years older. Penalise outside that range."""
    diff = candidate_age - customer_age   # positive = man older
    if -3 <= diff <= 7:
        score = 1.0 - abs(diff - 3) / 10   # peak at 3yr older
        return max(0.3, score), f"Age gap is {diff} years (ideal range)"
    return 0.1, f"Age gap is {diff} years (outside preferred range)"

def score_height(customer_height: int, candidate_height: int) -> Tuple[float, str]:
    """Candidate (woman) should be shorter."""
    diff = customer_height - candidate_height
    if diff < 0:
        return 0.0, None   # taller woman — hard filter for male matching
    score = min(1.0, diff / 20)
    return score, f"She is {diff}cm shorter"

def score_income_male(customer_income: float, candidate_income: float) -> Tuple[float, str]:
    """Woman earns less (traditional Indian matrimonial expectation)."""
    if candidate_income >= customer_income:
        return 0.2, "Similar or higher income (less traditional fit)"
    ratio = (customer_income - candidate_income) / customer_income
    score = min(1.0, ratio * 2)
    return score, f"He earns more (₹{customer_income}L vs ₹{candidate_income}L)"

def score_kids(want_a: str, want_b: str) -> Tuple[float, str]:
    if want_a == want_b:
        return 1.0, f"Both feel the same about kids ({want_a})"
    if "maybe" in (want_a, want_b):
        return 0.5, "One is open to kids, other is undecided"
    return 0.0, "Conflicting views on having kids"

def score_religion(rel_a: str, rel_b: str) -> Tuple[float, str]:
    if rel_a.lower() == rel_b.lower():
        return 1.0, f"Same religion ({rel_a})"
    return 0.3, f"Different religions ({rel_a} / {rel_b})"

def score_relocate(a: str, b: str) -> Tuple[float, str]:
    if a == b:
        return 1.0, "Both have the same stance on relocation"
    if "yes" in (a, b) and "maybe" in (a, b):
        return 0.7, "One open to relocation, other considering it"
    if "no" in (a, b) and "maybe" in (a, b):
        return 0.4, "Relocation views may conflict"
    return 0.0, "Conflicting relocation preferences"

def score_diet(diet_a: str, diet_b: str) -> Tuple[float, str]:
    if diet_a == diet_b:
        return 1.0, f"Same diet preference ({diet_a})"
    if "vegetarian" in diet_a and "vegetarian" in diet_b:
        return 0.8, "Both vegetarian-leaning"
    return 0.3, "Different dietary preferences"

def score_family_values(val_a: str, val_b: str) -> Tuple[float, str]:
    order = {"traditional": 0, "moderate": 1, "liberal": 2}
    a, b = order.get(val_a or "moderate", 1), order.get(val_b or "moderate", 1)
    diff = abs(a - b)
    scores = {0: 1.0, 1: 0.5, 2: 0.1}
    label_map = {0: "Aligned family values", 1: "Slightly different outlook on family", 2: "Very different family values"}
    return scores[diff], label_map[diff]

def score_profession_tier(cust_desig: str, cand_desig: str) -> Tuple[float, str]:
    t1, t2 = get_profession_tier(cust_desig), get_profession_tier(cand_desig)
    diff = abs(t1 - t2)
    if diff == 0:
        return 1.0, "Similar professional level"
    if diff == 1:
        return 0.6, "Compatible professional backgrounds"
    return 0.2, "Very different career levels"

def score_education(deg_a: str, deg_b: str) -> Tuple[float, str]:
    """Simple tier check: PhD > Masters > Bachelors > Diploma"""
    tier_map = {"phd": 4, "m.tech": 3, "mba": 3, "m.sc": 3, "ma": 3,
                "b.tech": 2, "b.e": 2, "b.sc": 2, "bba": 2, "ba": 2, "b.com": 2,
                "diploma": 1}
    def get_tier(deg):
        d = deg.lower()
        for k, v in tier_map.items():
            if k in d:
                return v
        return 2
    t1, t2 = get_tier(deg_a), get_tier(deg_b)
    diff = abs(t1 - t2)
    if diff == 0:
        return 1.0, "Same education level"
    if diff == 1:
        return 0.6, "Compatible education backgrounds"
    return 0.2, "Very different education levels"

def score_lifestyle(cust: dict, cand: dict) -> Tuple[float, str]:
    fields = ["diet", "drinking", "smoking"]
    matches = sum(1 for f in fields if cust.get(f) == cand.get(f))
    score = matches / len(fields)
    if matches == 3:
        return 1.0, "Fully aligned lifestyle (diet, drinking, smoking)"
    if matches == 2:
        return 0.7, "Mostly aligned lifestyle"
    if matches == 1:
        return 0.4, "Some lifestyle differences"
    return 0.1, "Very different lifestyle choices"

def score_marital(status_a: str, status_b: str) -> Tuple[float, str]:
    if status_a == "never_married" and status_b == "never_married":
        return 1.0, "Both never married"
    if status_a == status_b:
        return 0.8, f"Same marital background ({status_a.replace('_', ' ')})"
    return 0.5, "Different marital backgrounds"


# ─── Main scoring functions ───────────────────────────────────────────────────

def score_match_for_male(customer: dict, candidate: dict) -> Tuple[float, List[str]]:
    """
    Male customer matching logic.
    Hard filters applied first — if any fail, return 0.
    Then weighted scoring on soft criteria.
    """
    reasons = []

    # ── Hard filters ──
    age_score, age_reason = score_age_male(customer["age"], candidate["age"])
    if age_score == 0:
        return 0.0, ["Candidate is older than customer (hard filter)"]

    height_score, height_reason = score_height(customer["height_cm"], candidate["height_cm"])
    if height_score == 0:
        return 0.0, ["Candidate is taller than customer (hard filter)"]

    # ── Soft scoring ──
    income_score, income_reason = score_income_male(customer["income_lpa"], candidate["income_lpa"])
    kids_score, kids_reason = score_kids(customer["want_kids"], candidate["want_kids"])
    religion_score, religion_reason = score_religion(customer["religion"], candidate["religion"])
    relocate_score, relocate_reason = score_relocate(customer["open_to_relocate"], candidate["open_to_relocate"])
    diet_score, diet_reason = score_diet(customer.get("diet", ""), candidate.get("diet", ""))
    values_score, values_reason = score_family_values(customer.get("family_values"), candidate.get("family_values"))
    marital_score, marital_reason = score_marital(customer["marital_status"], candidate["marital_status"])

    w = MALE_WEIGHTS
    total_weight = sum(w.values())

    weighted_score = (
        age_score     * w["age"] +
        height_score  * w["height"] +
        income_score  * w["income"] +
        kids_score    * w["kids"] +
        religion_score * w["religion"] +
        relocate_score * w["relocate"] +
        diet_score    * w["diet"] +
        values_score  * w["family_values"] +
        marital_score * w["marital"]
    ) / total_weight * 100

    # Collect reasons (only meaningful ones)
    for score, reason in [
        (age_score, age_reason), (height_score, height_reason),
        (income_score, income_reason), (kids_score, kids_reason),
        (religion_score, religion_reason), (relocate_score, relocate_reason),
        (diet_score, diet_reason), (values_score, values_reason),
        (marital_score, marital_reason),
    ]:
        if reason and score >= 0.4:
            reasons.append(reason)

    return round(weighted_score, 1), reasons


def score_match_for_female(customer: dict, candidate: dict) -> Tuple[float, List[str]]:
    """
    Female customer matching logic.
    Holistic compatibility — no hard filters beyond basic gender and age range.
    """
    reasons = []

    age_score, age_reason = score_age_female(customer["age"], candidate["age"])
    profession_score, profession_reason = score_profession_tier(customer["designation"], candidate["designation"])
    education_score, education_reason = score_education(customer["degree"], candidate["degree"])
    values_score, values_reason = score_family_values(customer.get("family_values"), candidate.get("family_values"))
    relocate_score, relocate_reason = score_relocate(customer["open_to_relocate"], candidate["open_to_relocate"])
    kids_score, kids_reason = score_kids(customer["want_kids"], candidate["want_kids"])
    lifestyle_score, lifestyle_reason = score_lifestyle(customer, candidate)
    religion_score, religion_reason = score_religion(customer["religion"], candidate["religion"])

    w = FEMALE_WEIGHTS
    total_weight = sum(w.values())

    weighted_score = (
        age_score        * w["age"] +
        profession_score * w["profession"] +
        education_score  * w["education"] +
        values_score     * w["values"] +
        relocate_score   * w["relocate"] +
        kids_score       * w["kids"] +
        lifestyle_score  * w["lifestyle"] +
        religion_score   * w["religion"]
    ) / total_weight * 100

    for score, reason in [
        (age_score, age_reason), (profession_score, profession_reason),
        (education_score, education_reason), (values_score, values_reason),
        (relocate_score, relocate_reason), (kids_score, kids_reason),
        (lifestyle_score, lifestyle_reason), (religion_score, religion_reason),
    ]:
        if reason and score >= 0.4:
            reasons.append(reason)

    return round(weighted_score, 1), reasons


# ─── Main entry point ─────────────────────────────────────────────────────────

def get_ranked_matches(customer: dict, pool: List[dict], top_n: int = 15) -> List[dict]:
    """
    Filter pool to opposite gender, score all candidates,
    return top_n sorted by score descending.
    """
    target_gender = "female" if customer["gender"] == "male" else "male"
    opposite_pool = [p for p in pool if p["gender"] == target_gender]

    score_fn = score_match_for_male if customer["gender"] == "male" else score_match_for_female

    scored = []
    for candidate in opposite_pool:
        score, reasons = score_fn(customer, candidate)
        if score > 0:
            scored.append({
                "candidate": candidate,
                "score": score,
                "match_reasons": reasons,
            })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_n]


def get_ai_label(score: float) -> str:
    """Quick label without calling AI — used as fallback."""
    if score >= 80:
        return "Excellent Match"
    if score >= 65:
        return "High Potential Match"
    if score >= 50:
        return "Good Match"
    if score >= 35:
        return "Possible Match"
    return "Low Compatibility"
