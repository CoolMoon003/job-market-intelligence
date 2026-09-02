SKILL_KEYWORDS = [
    "python", "java", "c", "c++", "sql", "excel", "power bi", "tableau",
    "machine learning", "deep learning", "nlp", "pandas", "numpy",
    "scikit-learn", "tensorflow", "pytorch", "docker", "aws", "azure",
    "git", "github", "html", "css", "javascript", "react", "fastapi",
    "flask", "django", "spark", "etl", "statistics", "data analysis"
]


def extract_skills(text):
    text_lower = text.lower()

    found_skills = []

    for skill in SKILL_KEYWORDS:
        if skill in text_lower:
            found_skills.append(skill.title())

    return sorted(list(set(found_skills)))