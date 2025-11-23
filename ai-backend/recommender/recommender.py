# recommender.py
import csv
import random
from typing import List, Dict, Optional, Any
from math import ceil

# ---------- Configuration: tune these weights to match clinician preferences ----------
WEIGHTS = {
    "target_match": 3.0,
    "pain_type_compat": 2.5,
    "pain_level_suitability": 2.0,
    "contraindication_penalty": 5.0,
    "equipment_match": 0.5,
    "intensity_match": 1.5,
    "diversity_bonus": 0.5,   # prefer mixing types (hold + repetition)
    "progression_bonus": 0.75 # prefer exercises that have a clear progression path
}

# ---------- Clinical knowledge mappings (editable) ----------
PAIN_TYPE_PREFERENCES = {
    # prefer / avoid exerciseType or intended_effects
    "sharp": {"prefer_effects": ["motor_control", "low_load_strength"], "avoid_effects": ["end_range_load", "high_load"]},
    "dull": {"prefer_effects": ["mobility", "end_range_control"], "avoid_effects": []},
    "throbbing": {"prefer_effects": ["gentle_isometrics", "graded_movement"], "avoid_effects": ["high_repetition"]},
    "burning": {"prefer_effects": ["neural_gliding", "graded_exposure"], "avoid_effects": ["sustained_compression"]},
    "stiffness": {"prefer_effects": ["mobilisation", "hold", "end_range_mobilty"], "avoid_effects": []},
    "aching": {"prefer_effects": ["isometrics", "low_load_strength"], "avoid_effects": []},
    "radiating": {"prefer_effects": ["neural_tension_reduction", "stability"], "avoid_effects": ["end_range_spine_loading"]},
    "cramping": {"prefer_effects": ["gentle_lengthening", "neuromuscular_retrain"], "avoid_effects": ["fatiguing_reps"]},
    "tingling": {"prefer_effects": ["neurodynamic", "gentle_isometrics"], "avoid_effects": ["sustained_compression"]}
}

# Contraindication keywords mapped to pain_types or injury places:
CONTRAINDICATION_TAGS = {
    # if an exercise has any of these tags, it's unsafe for the corresponding pain patterns
    "red_flags": ["high_load", "impact", "inversion", "spinal_twist_with_load"]
}

# ---------- CSV loading & expected fields ----------
EXPECTED_FIELDS = [
    "exerciseName", "exerciseType", "targetArea", "rep", "holdTime", "set",
    "difficulty", "equipmentNeeded", "aiTrackingEnabled", "description",
    "demoVideo", "image", "intensity", "intended_effects", "contraindications",
    "movement_plane", "progressions"
]
def safe_int(value):
    try:
        if value is None or value == "":
            return None
        return int(float(value))
    except ValueError:
        return None



def load_exercises(csv_file: str = "exercises.csv") -> List[Dict[str, Any]]:
    exercises = []
    seen = set()  # to track unique exercise names
    with open(csv_file, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("exerciseName", "").strip()
            if not name or name.lower() in seen:
                continue  # skip duplicates or empty names
            seen.add(name.lower())

            intended_effects = [s.strip().lower() for s in (row.get("intended_effects") or "").split("|") if s.strip()]
            contraindications = [s.strip().lower() for s in (row.get("contraindications") or "").split("|") if s.strip()]
            progressions = [s.strip() for s in (row.get("progressions") or "").split("|") if s.strip()]
            ex = {
                "exerciseName": name,
                "exerciseType": row.get("exerciseType", "").strip().lower(),
                "targetArea": row.get("targetArea", "").strip().lower(),
                "rep": safe_int(row.get("rep")),
                "holdTime": safe_int(row.get("holdTime")),
                "set": int(row["set"]) if row.get("set") else 3,
                "difficulty": row.get("difficulty", "easy").strip().lower(),
                "equipmentNeeded": row.get("equipmentNeeded", "none").strip().lower(),
                "aiTrackingEnabled": (row.get("aiTrackingEnabled", "True").strip().lower() == "true"),
                "description": row.get("description", ""),
                "demoVideo": row.get("demoVideo", ""),
                "image": row.get("image", ""),
                "intensity": row.get("intensity", "low").strip().lower(),
                "intended_effects": intended_effects,
                "contraindications": contraindications,
                "movement_plane": row.get("movement_plane", "").strip().lower(),
                "progressions": progressions
            }
            exercises.append(ex)
    return exercises


EXERCISES_DB = load_exercises()

# ---------- Utility scoring helpers ----------
def _target_match_score(ex: Dict, injury_place: str) -> float:
    return 1.0 if ex["targetArea"] == injury_place else 0.0

def _pain_type_compat_score(ex: Dict, pain_type: str) -> float:
    prefs = PAIN_TYPE_PREFERENCES.get(pain_type, {})
    prefer_effects = set(prefs.get("prefer_effects", []))
    avoid_effects = set(prefs.get("avoid_effects", []))
    ex_effects = set(ex.get("intended_effects", []))
    score = 0.0
    if prefer_effects & ex_effects:
        score += 1.0
    if avoid_effects & ex_effects:
        score -= 1.0
    # mild bonus if exerciseType matches common preference for pain_type
    return max(0.0, score + 0.0)

def _pain_level_suitability_score(ex: Dict, pain_level: int) -> float:
    # prefer low intensity for high pain levels, and allow progressive challenge for low pain.
    intensity = ex.get("intensity", "low")
    if pain_level >= 8:
        return 1.0 if intensity == "low" else 0.0
    elif pain_level >= 5:
        return 1.0 if intensity in ("low", "medium") else 0.0
    else:
        return 1.0  # low pain can accept any intensity

def _contraindication_penalty(ex: Dict, pain_type: str, injury_place: str) -> float:
    penalty = 0.0
    ex_contras = set(ex.get("contraindications", []))
    # red flag presence: large penalty
    if ex_contras & set(CONTRAINDICATION_TAGS.get("red_flags", [])):
        penalty += 2.0
    # if contraindication mentions the specific injury place or pain pattern
    if any(pain_type in c or injury_place in c for c in ex_contras):
        penalty += 1.0
    return penalty

def _equipment_match_score(ex: Dict, available_equipment: List[str]) -> float:
    needed = ex.get("equipmentNeeded", "").lower()
    if needed in ("none", "", "bodyweight"):
        return 1.0
    if needed in [e.lower() for e in (available_equipment or [])]:
        return 1.0
    return 0.0

def _intensity_match_bonus(ex: Dict, pain_level: int) -> float:
    # small bonus if exercise intensity logically fits pain level
    intensity = ex.get("intensity", "low")
    if pain_level >= 7 and intensity == "low":
        return 1.0
    if 4 <= pain_level <= 6 and intensity in ("low", "medium"):
        return 0.8
    if pain_level < 4:
        return 1.0
    return 0.0

# ---------- Main recommendation function ----------
def recommend_exercises(
    injury_place: str,
    pain_level: int,
    pain_type: str,
    patient_history: Optional[Dict[str, Any]] = None,
    available_equipment: Optional[List[str]] = None,
    desired_count: Optional[int] = None,
    random_seed: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Returns a list of recommended exercises with rationale and a confidence score.
    patient_history: optional dict e.g. {"previous_exercises": [...], "tolerated": {"exerciseName": True/False}, "days_since_injury": 10}
    """

    if random_seed is not None:
        random.seed(random_seed)

    injury_place = injury_place.lower()
    pain_type = pain_type.lower()
    available_equipment = available_equipment or []
    patient_history = patient_history or {}

    # 1) shortlist by targetArea (primary) then fallback to related areas
    candidates = [ex for ex in EXERCISES_DB if ex["targetArea"] == injury_place]
    if not candidates:
        # fallback mapping — common related areas; extend as needed
        RELATED = {
            "wrist": ["forearm", "hand"],
            "knee": ["hip", "ankle"],
            "shoulder": ["neck", "thoracic"],
            "spine/core": ["lumbar", "thoracic", "pelvis"],
            "hip": ["knee", "lumbar"]
        }
        fallback_areas = RELATED.get(injury_place, ["shoulder", "knee", "spine/core"])
        candidates = [ex for ex in EXERCISES_DB if ex["targetArea"] in fallback_areas]

    # 2) compute a composite score per exercise
    scored = []
    for ex in candidates:
        score = 0.0
        score += WEIGHTS["target_match"] * _target_match_score(ex, injury_place)
        score += WEIGHTS["pain_type_compat"] * _pain_type_compat_score(ex, pain_type)
        score += WEIGHTS["pain_level_suitability"] * _pain_level_suitability_score(ex, pain_level)
        # subtract contraindication penalties
        score -= WEIGHTS["contraindication_penalty"] * _contraindication_penalty(ex, pain_type, injury_place)
        # equipment & intensity
        score += WEIGHTS["equipment_match"] * _equipment_match_score(ex, available_equipment)
        score += WEIGHTS["intensity_match"] * _intensity_match_bonus(ex, pain_level)
        # small bonus for having a progression
        if ex.get("progressions"):
            score += WEIGHTS["progression_bonus"]

        # small diversity bonus to encourage mixing types
        # (we will apply diversity at selection time by preferring type-mixed lists)
        scored.append({"exercise": ex, "raw_score": score})

    # 3) filter out strongly contraindicated exercises (negative net or large penalty)
    filtered = [s for s in scored if s["raw_score"] > -1.0]  # keep borderline items; tune threshold as needed

    # 4) sort by raw_score descending
    filtered.sort(key=lambda x: x["raw_score"], reverse=True)

    # 5) determine desired_count based on pain level if not provided
    if desired_count is None:
        if pain_level <= 3:
            desired_count = 4
        elif pain_level <= 7:
            desired_count = 4
        else:
            desired_count = 3  # fewer exercises but safer for severe pain

    # 6) select exercises, ensuring diversity (mix of hold/repetition and different effects)
    selected = []
    types_seen = set()
    effects_seen = set()
    for item in filtered:
        ex = item["exercise"]
        # try to keep variety: prefer adding different type than already present
        if len(selected) >= desired_count:
            break
        if len(selected) == 0:
            selected.append(item)
            types_seen.add(ex["exerciseType"])
            effects_seen.update(ex.get("intended_effects", []))
            continue

        # if candidate adds diversity, prefer it; otherwise still can add if good score
        adds_diversity = ex["exerciseType"] not in types_seen or not (set(ex.get("intended_effects", [])) & effects_seen)
        if adds_diversity:
            selected.append(item)
            types_seen.add(ex["exerciseType"])
            effects_seen.update(ex.get("intended_effects", []))
        else:
            # allow similar items if we still need count and score remains high
            if len(selected) < desired_count and item["raw_score"] >= (filtered[0]["raw_score"] * 0.35):
                selected.append(item)

    # if we couldn't reach desired_count, fill with the top remaining
    idx = 0
    while len(selected) < desired_count and idx < len(filtered):
        candidate = filtered[idx]
        if candidate not in selected:
            selected.append(candidate)
        idx += 1

    # remove duplicate exercise names before final output
    unique_selected = []
    seen_names = set()
    for item in selected:
        ex_name = item["exercise"]["exerciseName"].lower()
        if ex_name not in seen_names:
            seen_names.add(ex_name)
            unique_selected.append(item)
    selected = unique_selected


    # 7) build output with dosages, rationale, and a confidence estimate
    results = []
    max_score = max((s["raw_score"] for s in filtered), default=1.0)
    min_score = min((s["raw_score"] for s in filtered), default=0.0)
    score_range = max_score - min_score if max_score != min_score else 1.0

    for s in selected:
        ex = s["exercise"].copy()
        raw = s["raw_score"]
        # normalized score 0..1
        normalized = (raw - min_score) / score_range

        # build sets/reps/hold based on exerciseType & pain_level
        if ex["exerciseType"] == "repetition":
            # reduce reps for high pain levels
            base_rep = ex.get("rep") or 8
            if pain_level >= 8:
                rep = max(4, int(base_rep * 0.5))
                sets = max(1, int(ex.get("set", 3)))
            elif pain_level >= 5:
                rep = max(6, int(base_rep * 0.75))
                sets = int(ex.get("set", 3))
            else:
                rep = base_rep
                sets = int(ex.get("set", 3))
            dosage = {"sets": sets, "reps": rep}
        else:  # hold
            base_hold = ex.get("holdTime") or 5
            if pain_level >= 8:
                hold = max(3, int(base_hold * 0.6))
                sets = max(1, int(ex.get("set", 3)))
            elif pain_level >= 5:
                hold = max(4, int(base_hold * 0.8))
                sets = int(ex.get("set", 3))
            else:
                hold = base_hold
                sets = int(ex.get("set", 3))
            dosage = {"sets": sets, "hold_seconds": hold}

        # confidence: combination of normalized score and dataset coverage factors
        # If normalized is high and there are many similar target-area entries, boost confidence.
        same_area_count = sum(1 for e in EXERCISES_DB if e["targetArea"] == injury_place)
        dataset_factor = min(1.0, 0.5 + (same_area_count / 20.0))  # more samples -> slightly higher confidence
        confidence = round(0.7 * normalized + 0.3 * dataset_factor, 3)  # tune these multipliers to reach ~0.75 target

        # rationale
        rationale_parts = []
        if _target_match_score(ex, injury_place):
            rationale_parts.append("Targets reported injury area")
        ptc = _pain_type_compat_score(ex, pain_type)
        if ptc > 0:
            rationale_parts.append(f"Matches pain-type preferences ({pain_type})")
        elif ptc < 0:
            rationale_parts.append(f"Some effects not ideal for pain-type ({pain_type})")
        if ex.get("progressions"):
            rationale_parts.append("Has clear progression(s)")
        if ex.get("intended_effects"):
            rationale_parts.append("Intended effects: " + ",".join(ex.get("intended_effects")))
        if ex.get("contraindications"):
            rationale_parts.append("Contraindications: " + ",".join(ex.get("contraindications")))

        results.append({
            "exerciseName": ex["exerciseName"],
            "exerciseType": ex["exerciseType"],
            "dosage": dosage,
            "targetArea": ex["targetArea"],
            "difficulty": ex.get("difficulty"),
            "equipmentNeeded": ex.get("equipmentNeeded"),
            "aiTrackingEnabled": ex.get("aiTrackingEnabled"),
            "description": ex.get("description"),
            "demoVideo": ex.get("demoVideo"),
            "image": ex.get("image"),
            "intended_effects": ex.get("intended_effects"),
            "progressions": ex.get("progressions"),
            "raw_score": round(raw, 3),
            "confidence": confidence,
            "rationale": rationale_parts
        })

    # 8) Final ordering — place lower-impact, neuromotor, activation exercises first (idea: warm-up -> activation -> strength -> mobility)
    def ordering_key(item):
        effects = item.get("intended_effects") or []
        if "motor_control" in effects or "activation" in effects or "neural_gliding" in effects:
            return 0
        if "mobility" in effects or "end_range_mobility" in effects:
            return 1
        if "low_load_strength" in effects or "graded_exposure" in effects:
            return 2
        return 3

    results.sort(key=ordering_key)
    return results

# ---------- Optional helper: simple training hook (placeholder) ----------
def train_simple_model(training_data: List[Dict[str, Any]]) -> None:
    """
    Placeholder for training a lightweight model if you collect clinician-labeled outcomes.
    training_data could be a list of dicts with keys:
      - features: dict
      - label: 0/1 whether clinician approved
    Implement offline training (sklearn) and persist weights for runtime inference.
    """
    # Example: use logistic regression on engineered features (target match, pain_type compat, intensity)
    # Not implemented here. Keep as a hook.
    pass

