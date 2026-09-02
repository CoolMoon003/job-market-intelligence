import requests

API_URL = "https://amazon.jobs/api/jobs/search%sis_als=true"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
    "Content-Type": "text/plain;charset=UTF-8",
    "Origin": "https://amazon.jobs",
    "Referer": "https://amazon.jobs/content/en/teams/amazon-web-services/data-centers",
    "x-api-key": "PbxxNwIlTi4FP5oijKdtk3IrBF5CLd4R4oPHsKNh",
}


def scrape_jobs(max_pages=50):
    jobs = []

    for page in range(max_pages):
        start = page * 10

        payload = {
            "accessLevel": "EXTERNAL",
            "query": "",
            "size": 10,
            "start": start,
            "sort": {
                "sortOrder": "DESCENDING",
                "sortType": "SCORE",
            },
            "treatment": "OM",
            "contentFilterFacets": [
                {"name": "primarySearchLabel", "requestedFacetCount": 9999}
            ],
            "excludeFacets": [
                {"name": "isConfidential", "values": [{"name": "1"}]}
            ],
            "filterFacets": [
                {
                    "name": "optionalSearchLabels",
                    "requestedFacetCount": 9999,
                    "values": [{"name": "aws.team-dc"}],
                }
            ],
            "includeFacets": [],
            "jobTypeFacets": [],
            "locationFacets": [
                [
                    {"name": "country", "requestedFacetCount": 9999},
                    {"name": "state", "requestedFacetCount": 9999},
                    {"name": "city", "requestedFacetCount": 9999},
                ]
            ],
        }

        response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=40)
        response.raise_for_status()

        data = response.json()
        raw_jobs = data.get("jobs", []) or data.get("hits", []) or data.get("searchHits", [])

        if not raw_jobs:
            print(data.keys())
            break

        for item in raw_jobs:
            job = item.get("job", item)

            title = job.get("title") or job.get("jobTitle") or ""
            job_id = job.get("id") or job.get("jobId") or job.get("job_path") or ""
            location = job.get("location") or job.get("normalized_location") or "Not specified"

            description = (
                job.get("description")
                or job.get("short_description")
                or job.get("basic_qualifications")
                or title
            )

            apply_link = job.get("url") or job.get("job_path") or ""
            if apply_link and apply_link.startswith("/"):
                apply_link = f"https://amazon.jobs{apply_link}"

            if not apply_link and job_id:
                apply_link = f"https://amazon.jobs/jobs/{job_id}"

            jobs.append({
                "job_title": title,
                "company": "Amazon",
                "location": location,
                "salary_min": 0,
                "salary_max": 0,
                "experience_required": "Not specified",
                "required_skills": description,
                "job_description": description,
                "apply_link": apply_link,
                "source": "Amazon Jobs",
                "posted_date": job.get("posted_date") or job.get("updated_time") or "",
            })

    return jobs