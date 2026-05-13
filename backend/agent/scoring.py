"""
Lead scoring engine.
Weights: specialty_match 30 | budget_fit 25 | timeline_urgency 25 | tower_availability 20
"""
from typing import Optional

SCORE_WEIGHTS = {
    "specialty_match": 30,
    "budget_fit": 25,
    "timeline_urgency": 25,
    "tower_availability": 20,
}

# In-demand specialties get full marks; less common get partial
HIGH_DEMAND_SPECIALTIES = {
    "cardiology", "dermatology", "ophthalmology", "orthopedics", "pediatrics",
    "gynecology", "internal medicine", "general practice", "dental",
}
MEDIUM_DEMAND_SPECIALTIES = {
    "psychiatry", "urology", "neurology", "nephrology", "endocrinology",
    "gastroenterology", "oncology", "radiology", "physiotherapy",
}

TIMELINE_SCORES = {
    "within_1_month": 25,
    "1_3_months": 20,
    "3_6_months": 10,
    "just_exploring": 5,
}

# Budget bands per tower (KD/month)
TOWER_BUDGET_BANDS: dict = {
    "clinic_i":    {"min": 800,  "max": 2500},
    "clinic_ii":   {"min": 800,  "max": 2500},
    "clinic_iii":  {"min": 1200, "max": 3000},
    "clinic_iv":   {"min": 900,  "max": 2000},
    "clinic_v":    {"min": 900,  "max": 2200},
    "clinic_vi":   {"min": 1100, "max": 2800},
    "clinic_vii":  {"min": 700,  "max": 1800},
    "clinic_viii": {"min": 700,  "max": 1800},
}

# Towers currently considered to have space available (configurable)
TOWERS_WITH_AVAILABILITY = {
    "clinic_i", "clinic_ii", "clinic_iii", "clinic_iv",
    "clinic_v", "clinic_vi", "clinic_vii", "clinic_viii",
}


def _parse_budget(budget_range: Optional[str]) -> Optional[float]:
    """Extract an approximate monthly budget figure from a free-text range string."""
    if not budget_range:
        return None
    import re
    numbers = re.findall(r"\d[\d,]*", budget_range.replace(",", ""))
    values = [int(n) for n in numbers]
    if not values:
        return None
    return sum(values) / len(values)


def _score_specialty(specialty: Optional[str]) -> int:
    if not specialty:
        return 0
    s = specialty.lower().strip()
    if s in HIGH_DEMAND_SPECIALTIES:
        return 30
    if s in MEDIUM_DEMAND_SPECIALTIES:
        return 15
    return 8


def _score_budget(budget_range: Optional[str], tower_preference: Optional[str]) -> int:
    budget = _parse_budget(budget_range)
    if budget is None:
        return 12  # neutral — no budget info

    tower_key = (tower_preference or "").lower().replace(" ", "_")
    band = TOWER_BUDGET_BANDS.get(tower_key)
    if band is None:
        # Use average band across all towers
        mins = [b["min"] for b in TOWER_BUDGET_BANDS.values()]
        maxs = [b["max"] for b in TOWER_BUDGET_BANDS.values()]
        band = {"min": sum(mins) / len(mins), "max": sum(maxs) / len(maxs)}

    if budget >= band["min"]:
        return 25
    if budget >= band["min"] * 0.7:
        return 12
    return 0


def _score_timeline(timeline: Optional[str]) -> int:
    if not timeline:
        return 5
    t = timeline.lower().replace(" ", "_")
    for key, pts in TIMELINE_SCORES.items():
        if key in t:
            return pts
    if "month" in t or "urgent" in t or "asap" in t:
        return 20
    return 5


def _score_tower_availability(tower_preference: Optional[str]) -> int:
    if not tower_preference:
        return 10  # partial — no preference expressed
    key = tower_preference.lower().replace(" ", "_")
    return 20 if key in TOWERS_WITH_AVAILABILITY else 0


def calculate_lead_score(
    specialty: Optional[str],
    tower_preference: Optional[str],
    budget_range: Optional[str],
    timeline: Optional[str],
    clinic_size: Optional[str] = None,
) -> dict:
    specialty_pts = _score_specialty(specialty)
    budget_pts = _score_budget(budget_range, tower_preference)
    timeline_pts = _score_timeline(timeline)
    availability_pts = _score_tower_availability(tower_preference)

    total = specialty_pts + budget_pts + timeline_pts + availability_pts
    total = min(total, 100)

    tier = "hot" if total >= 70 else "warm" if total >= 40 else "cold"

    breakdown = {
        "specialty_match": specialty_pts,
        "budget_fit": budget_pts,
        "timeline_urgency": timeline_pts,
        "tower_availability": availability_pts,
        "total": total,
        "tier": tier,
    }
    return {"score": total, "tier": tier, "breakdown": breakdown}
