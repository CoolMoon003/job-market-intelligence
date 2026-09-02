import requests

API_URL = "https://eofe.fa.us2.oraclecloud.com/hcmRestApi/resources/latest/recruitingCEJobRequisitions"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
    "Content-Type": "application/vnd.oracle.adf.resourceitem+json;charset=utf-8",
    "Referer": "https://eofe.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/BNY-Careers/jobs%smode=location",
    "ora-irc-language": "en",
}


def scrape_jobs(max_pages=112):
    jobs = []

    for page in range(max_pages):
        offset = page * 15

        params = {
            "onlyData": "true",
            "expand": "requisitionList.workLocation,requisitionList.otherWorkLocations,requisitionList.secondaryLocations,flexFieldsFacet.values,requisitionList.requisitionFlexFields",
            "finder": f"findReqs;siteNumber=CX_3001,facetsList=LOCATIONS;WORK_LOCATIONS;WORKPLACE_TYPES;TITLES;CATEGORIES;ORGANIZATIONS;POSTING_DATES;FLEX_FIELDS,limit=15,offset={offset},sortBy=POSTING_DATES_DESC",
        }

        response = requests.get(API_URL, headers=HEADERS, params=params, timeout=40)
        response.raise_for_status()

        data = response.json()
        items = data.get("items", [])

        if not items:
            break

        search_block = items[0]
        requisitions = search_block.get("requisitionList", [])

        if not requisitions:
            break

        for req in requisitions:
            job_id = req.get("Id", "")
            title = req.get("Title", "")
            location = req.get("PrimaryLocation", "Not specified")
            posted_date = req.get("PostedDate", "")

            description = " ".join([
                req.get("ShortDescriptionStr") or "",
                req.get("ExternalQualificationsStr") or "",
                req.get("ExternalResponsibilitiesStr") or "",
            ]).strip()

            if not description:
                description = f"{title}. Location: {location}. Country: {req.get('PrimaryLocationCountry', '')}."

            apply_link = (
                "https://eofe.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/BNY-Careers/job/"
                f"{job_id}"
            )

            jobs.append({
                "job_title": title,
                "company": "BNY",
                "location": location,
                "salary_min": 0,
                "salary_max": 0,
                "experience_required": "Not specified",
                "required_skills": description,
                "job_description": description,
                "apply_link": apply_link,
                "source": "BNY Careers",
                "posted_date": posted_date,
            })

    return jobs