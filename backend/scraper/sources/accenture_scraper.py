import requests

API_URL = "https://www.accenture.com/api/accenture/elastic/findjobs"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
    "Origin": "https://www.accenture.com",
    "Referer": "https://www.accenture.com/in-en/careers/jobsearch",
}


def clean_text(text):
    if not text:
        return ""
    return " ".join(str(text).replace("<br>", " ").replace("<b>", " ").replace("</b>", " ").split())


def scrape_jobs(max_pages=300):
    jobs = []

    for page in range(max_pages):
        start_index = page * 12

        payload = {
            "startIndex": start_index,
            "maxResultSize": 12,
            "jobKeyword": "",
            "jobCountry": "India",
            "jobLanguage": "en",
            "countrySite": "in-en",
            "sortBy": 2,
            "searchType": "vectorSearch",
            "enableQueryBoost": True,
            "minScore": 0.6,
            "getFeedbackJudgmentEnabled": True,
            "useCleanEmbedding": True,
            "score": True,
            "totalHits": True,
            "debugQuery": False,
            "jobFilters": [],
        }

        response = requests.post(API_URL, headers=HEADERS, data=payload, timeout=40)
        response.raise_for_status()

        data = response.json()
        raw_jobs = data.get("data", [])

        if not raw_jobs:
            break

        for item in raw_jobs:
            title = item.get("title", "")
            location = ", ".join(item.get("location", [])) or item.get("feedCity", "Not specified")

            detail_url = item.get("jobDetailUrl", "")
            detail_url = detail_url.replace("{0}", "in-en")

            skills = []
            skills.extend(item.get("mustHaveSkills", []) or [])
            skills.extend(item.get("goodToHaveSkills", []) or [])

            description = (
                item.get("jobDescriptionClean")
                or item.get("staticExtractiveSummary")
                or item.get("azureopenaiSummary")
                or ""
            )

            jobs.append({
                "job_title": title,
                "company": "Accenture",
                "location": location,
                "salary_min": 0,
                "salary_max": 0,
                "experience_required": item.get("yearsOfExperience", "Not specified"),
                "required_skills": ", ".join([s for s in skills if s and s != "NA"]) or description,
                "job_description": clean_text(description),
                "apply_link": detail_url,
                "source": "Accenture Careers",
                "posted_date": item.get("updateDate", ""),
            })
        return jobs