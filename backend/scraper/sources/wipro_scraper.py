import re
import requests

API_URL = "https://careers.wipro.com/services/recruiting/v1/jobs"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Origin": "https://careers.wipro.com",
    "Referer": "https://careers.wipro.com/search/%sq=&locationsearch=&searchResultView=LIST&sortBy=date&pageNumber=0",
}


def clean_html_text(text):
    if not text:
        return ""
    text = re.sub(r"<.*%s>", " ", text)
    return " ".join(text.split())


def get_first(value, default=""):
    if isinstance(value, list) and len(value) > 0:
        return value[0]
    return value or default


def scrape_jobs(max_pages=650):
    jobs = []

    for page in range(max_pages):
        payload = {
            "locale": "en_US",
            "pageNumber": page,
            "sortBy": "date",
            "keywords": "",
            "location": "",
            "facetFilters": {},
            "alertId": "",
            "brand": "",
            "categoryId": 0,
            "rcmCandidateId": "",
            "skills": [],
        }

        response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=30)
        response.raise_for_status()

        data = response.json()
        raw_jobs = data.get("jobSearchResult", [])

        for item in raw_jobs:
            info = item.get("response", {})

            job_id = info.get("id", "")
            title = info.get("unifiedStandardTitle", "")
            url_title = info.get("unifiedUrlTitle") or info.get("urlTitle") or title.replace(" ", "-")

            locations = info.get("sfstd_jobLocation_obj", [])
            location = ", ".join(locations) if locations else "Not specified"

            category = get_first(info.get("custRMKMappingPicklist"), "Not specified")
            country = get_first(info.get("jobLocationCountry"), "")
            start_date = info.get("unifiedStandardStart", "")

            apply_link = f"https://careers.wipro.com/job/{url_title}/{job_id}-en_US"

            description = f"{title}. Category: {category}. Location: {location}. Country: {country}."

            jobs.append({
                "job_title": title,
                "company": "Wipro",
                "location": location,
                "salary_min": 0,
                "salary_max": 0,
                "experience_required": "Not specified",
                "required_skills": description,
                "job_description": description,
                "apply_link": apply_link,
                "source": "Wipro Careers",
                "posted_date": start_date,
            })

    return jobs