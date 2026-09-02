def generate_roadmap(missing_skills):
    roadmap = []

    for skill in missing_skills:
        roadmap.append({
            "skill": skill.title(),
            "plan": [
                f"Learn basics of {skill.title()}",
                f"Practice {skill.title()} with small exercises",
                f"Build one mini project using {skill.title()}",
                f"Add {skill.title()} project to resume/GitHub"
            ]
        })

    return roadmap