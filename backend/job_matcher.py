def split_skills(skills_text):
    if not skills_text:
        return []

    return [
        skill.strip().lower()
        for skill in skills_text.split(",")
        if skill.strip()
    ]


def calculate_match(user_skills, required_skills_text):
    required_skills = split_skills(required_skills_text)
    user_skills = [skill.lower().strip() for skill in user_skills]

    matched_skills = []
    missing_skills = []

    for skill in required_skills:
        if skill in user_skills:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    if len(required_skills) == 0:
        match_score = 0
    else:
        match_score = round((len(matched_skills) / len(required_skills)) * 100, 2)

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }