import json
import re
import requests

API_URL = "https://thapi.azurewebsites.net/api/careerpagev2/filteredjobs"
ORG_ID = "4d757ba0-3d57-448a-b82c-238ed87ac90f"

TOKEN = "PASTE_FULL_BEARER_TOKEN_ONLY_HERE"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": "https://flipkart.turbohire.co",
    "Referer": "https://flipkart.turbohire.co/",
    "User-Agent": "Mozilla/5.0",
    "X-Client-Version": "8",
}


def clean_html(text):
    if not text:
        return ""
    text = re.sub(r"<.*%s>", " ", text)
    return " ".join(text.split())


def parse_location(raw):
    try:
        data = json.loads(raw)
        return data[0].get("Address", "Not specified")
    except Exception:
        return "Not specified"


def safe_int(value):
    try:
        return int(value)
    except Exception:
        return 0


def scrape_jobs():
    payload = {
    "SortByV2": {
        "Key": "PostedDate",
        "Order": 2
    },
    "BunitIds": {
        "Value": None,
        "FilterType": 0
    },
    "Experience": {
        "Value": None,
        "FilterType": 0
    },
    "JobTypes": {
        "Value": None,
        "FilterType": 0
    },
    "JobTypeV2": {
        "Value": None,
        "FilterType": 0
    },
    "Locations": {
        "Value": None,
        "FilterType": 0
    },
    "CreatedDate": {
        "Value": None,
        "FilterType": 0
    },
    "Compensation": {
        "Value": None,
        "FilterType": 0
    },
    "Skills": {
        "Value": None,
        "FilterType": 0
    },
    "Keyword": "",
    "ClientIds": {
        "Value": None,
        "FilterType": 0
    },
    "Department": "",
    "CustomFields": {}
}

    response = requests.post(
        API_URL,
        headers=HEADERS,
        params={"orgId": ORG_ID, "pageType": 0},
        json=payload,
        timeout=40,
    )

    print("FLIPKART STATUS:", response.status_code)
    print("FLIPKART RESPONSE:", response.text[:1000])

    if response.status_code != 200:
        return []

    data = response.json()
    jobs = []

    for item in data.get("Result", []):
        exp = item.get("Experience", {}) or {}
        min_exp = exp.get("MinExp")
        max_exp = exp.get("MaxExp")

        if min_exp is not None and max_exp is not None:
            experience = f"{min_exp}-{max_exp} years"
        elif min_exp is not None:
            experience = f"{min_exp}+ years"
        else:
            experience = "Not specified"

        skills = item.get("Skills", []) or []
        description = clean_html(item.get("JobDescV2", ""))

        ctc = item.get("CTCInfo", {}) or {}

        jobs.append({
            "job_title": item.get("JobTitle", ""),
            "company": "Flipkart",
            "location": parse_location(item.get("Location", "")),
            "salary_min": safe_int(ctc.get("Min")),
            "salary_max": safe_int(ctc.get("Max")),
            "experience_required": experience,
            "required_skills": ", ".join(skills) or description,
            "job_description": description,
            "apply_link": f"https://flipkart.turbohire.co/dashboardv2%sorgId={ORG_ID}&type=0",
            "source": "Flipkart TurboHire",
            "posted_date": item.get("PublishedDate", ""),
        })

    return jobs