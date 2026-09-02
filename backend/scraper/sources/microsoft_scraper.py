import requests

SEARCH_URL = "https://apply.careers.microsoft.com/api/pcsx/search"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
    "Referer": "https://apply.careers.microsoft.com/careers",
}


def scrape_jobs(max_pages=70):
    jobs = []

    for page in range(max_pages):
        start = page * 20

        params = {
            "domain": "microsoft.com",
            "query": "",
            "location": "",
            "start": start,
            "sort_by": "timestamp",
        }

        response = requests.get(SEARCH_URL, headers=HEADERS, params=params, timeout=40)
        response.raise_for_status()

        data = response.json()
        positions = data.get("data", {}).get("positions", [])

        if not positions:
            break

        for position in positions:
            position_id = position.get("id")

            title = position.get("name", "")
            locations = position.get("locations", [])
            location = ", ".join(locations) if locations else "Not specified"

            department = position.get("department", "")
            public_url = f"https://apply.careers.microsoft.com/careers/job/{position_id}"

            description = f"{title}. Department: {department}. Location: {location}."

            jobs.append({
                "job_title": title,
                "company": "Microsoft",
                "location": location,
                "salary_min": 0,
                "salary_max": 0,
                "experience_required": "Not specified",
                "required_skills": description,
                "job_description": description,
                "apply_link": public_url,
                "source": "Microsoft Careers",
                "posted_date": str(position.get("postedTs", "")),
            })

    return jobs