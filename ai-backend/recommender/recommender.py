import csv
import random

PAIN_TYPE_MODIFIERS = {
    "sharp": {"prefer": ["repetition"], "avoid": ["hold"]},
    "dull": {"prefer": ["hold"], "avoid": []},
    "throbbing": {"prefer": ["hold"], "avoid": ["repetition"]},
    "burning": {"prefer": ["hold"], "avoid": ["repetition"]},
    "stiffness": {"prefer": ["repetition"], "avoid": []},
    "aching": {"prefer": ["hold"], "avoid": []},
    "radiating": {"prefer": ["repetition"], "avoid": []},
    "cramping": {"prefer": ["repetition"], "avoid": ["hold"]},
    "tingling": {"prefer": ["hold"], "avoid": ["repetition"]},
}


def load_exercises(csv_file="exercises.csv"):
    exercises = []
    with open(csv_file, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            ex = {
                "exerciseName": row["exerciseName"],
                "exerciseType": row["exerciseType"],
                "targetArea": row["targetArea"].lower(),
                "rep": int(row["rep"]) if row["rep"] else None,
                "holdTime": int(row["holdTime"]) if row["holdTime"] else None,
                "set": int(row["set"]) if row["set"] else 3,
                "difficulty": row.get("difficulty", "easy"),
                "equipmentNeeded": row.get("equipmentNeeded", "None"),
                "aiTrackingEnabled": row.get("aiTrackingEnabled", "True").lower() == "true",
                "description": row.get("description", ""),
                "demoVideo": row.get("demoVideo", ""),
                "image": row.get("image", "")
            }
            exercises.append(ex)
    return exercises


EXERCISES_DB = load_exercises()


def recommend_exercises(injury_place: str, pain_level: int, pain_type: str):
    injury_place = injury_place.lower()
    exercises = [ex for ex in EXERCISES_DB if ex["targetArea"] == injury_place]

    # fallback if no match
    if not exercises:
        exercises = [ex for ex in EXERCISES_DB if ex["targetArea"] in ["knee", "shoulder", "spine/core"]]

    # apply pain-type modifiers
    modifiers = PAIN_TYPE_MODIFIERS.get(pain_type, {"prefer": [], "avoid": []})
    preferred = [ex for ex in exercises if ex["exerciseType"] in modifiers["prefer"]] or exercises
    filtered = [ex for ex in preferred if ex["exerciseType"] not in modifiers["avoid"]] or preferred

    # number of exercises based on pain level
    if pain_level <= 3:
        num_exercises = 3
    elif pain_level <= 7:
        num_exercises = 4
    else:
        num_exercises = 5

    if len(filtered) < num_exercises:
        remaining = [ex for ex in exercises if ex not in filtered]
        filtered.extend(remaining)

    selected = random.sample(filtered, k=min(num_exercises, len(filtered)))

    # adjust difficulty dynamically
    for ex in selected:
        if pain_level >= 8:
            ex["difficulty"] = "easy"
        elif pain_level >= 5:
            ex["difficulty"] = "medium"
        else:
            ex["difficulty"] = "hard"

    return selected