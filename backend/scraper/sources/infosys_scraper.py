import requests

API_URL = "https://intapgateway.infosysapps.com/careersci/search/intapjbsrch/getCareerSearchJobs"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
    "Origin": "https://career.infosys.com",
    "Referer": "https://career.infosys.com/",
}


def clean_text(text):
    if not text:
        return ""
    return " ".join(str(text).replace("•", " ").split())


def scrape_jobs():
    params = {
        "sourceId": "1,21",
        "searchText": "ALL",
    }

    response = requests.get(API_URL, headers=HEADERS, params=params, timeout=40)
    response.raise_for_status()

    data = response.json()
    jobs = []

    for item in data:
        title = item.get("postingTitle", "")
        reference_code = item.get("referenceCode", "")
        location = item.get("location", "Not specified")
        company = item.get("company", "Infosys Limited")

        description = " ".join([
            clean_text(item.get("postingDescription", "")),
            clean_text(item.get("technicalRequirement", "")),
            clean_text(item.get("rolesResponsibilities", "")),
            clean_text(item.get("preferredSkills", "")),
        ])

        min_exp = item.get("minExperienceLevel")
        max_exp = item.get("maxExperienceLevel")

        experience = "Not specified"
        if min_exp is not None and max_exp is not None:
            experience = f"{min_exp}-{max_exp} years"

        apply_link = (
            f"https://career.infosys.com/jobdesc%s"
            f"jobReferenceCode={reference_code}&rc=0&jobType=normal"
        )

        jobs.append({
            "job_title": title,
            "company": company,
            "location": location.title(),
            "salary_min": 0,
            "salary_max": 0,
            "experience_required": experience,
            "required_skills": clean_text(item.get("preferredSkills", "")) or description,
            "job_description": description,
            "apply_link": apply_link,
            "source": "Infosys Careers",
            "posted_date": item.get("createdOn", ""),
        })

    return jobs