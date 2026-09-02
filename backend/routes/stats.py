from fastapi import APIRouter
from backend.database import get_connection
from backend.location_mapper import normalize_location
router = APIRouter(prefix="/stats", tags=["Statistics"])

COMMON_SKILLS = {
    "python", "java", "c++", "c", "javascript", "typescript",
    "react", "angular", "vue", "node.js", "nodejs",
    "sql", "mysql", "postgresql", "mongodb",
    "aws", "azure", "gcp",
    "docker", "kubernetes", "git", "linux",
    "django", "flask", "fastapi", "spring",
    "tensorflow", "pytorch", "machine learning", "deep learning",
    "artificial intelligence", "ai", "data analysis",
    "pandas", "numpy", "opencv",
    "rest api", "api", "microservices",
    "html", "css"
}

COUNTRY_MAP = {
    "india": "India",
    "ind": "India",
    "bengaluru": "India",
    "bangalore": "India",
    "hyderabad": "India",
    "chennai": "India",
    "pune": "India",
    "mumbai": "India",
    "delhi": "India",
    "noida": "India",
    "gurugram": "India",
    "gurgaon": "India",
    "kolkata": "India",
    "ahmedabad": "India",

    "united states": "United States",
    "usa": "United States",
    "us": "United States",
    "new york": "United States",
    "austin": "United States",
    "princeton": "United States",
    "irving": "United States",

    "united kingdom": "United Kingdom",
    "uk": "United Kingdom",
    "london": "United Kingdom",
    "manchester": "United Kingdom",

    "singapore": "Singapore",
    "japan": "Japan",
    "tokyo": "Japan",
    "canada": "Canada",
}


@router.get("/")
def dashboard_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) AS total FROM jobs")
    total = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(DISTINCT company) AS companies FROM jobs")
    companies = cursor.fetchone()["companies"]

    cursor.execute("SELECT COUNT(DISTINCT location) AS locations FROM jobs")
    locations = cursor.fetchone()["locations"]

    cursor.execute("""
        SELECT company, COUNT(*) AS jobs
        FROM jobs
        GROUP BY company
        ORDER BY jobs DESC
        LIMIT 5
    """)
    top_companies = cursor.fetchall()

    cursor.execute("""
        SELECT source, COUNT(*) AS jobs
        FROM jobs
        GROUP BY source
        ORDER BY jobs DESC
    """)
    sources = cursor.fetchall()

    conn.close()

    return {
        "total_jobs": total,
        "companies": companies,
        "locations": locations,
        "top_companies": top_companies,
        "sources": sources
    }


@router.get("/skills")
def top_skills():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT job_title, required_skills, job_description
        FROM jobs
    """)
    rows = cursor.fetchall()
    conn.close()

    skill_count = {}

    for row in rows:
        text = " ".join([
            row.get("job_title") or "",
            row.get("required_skills") or "",
            row.get("job_description") or "",
        ]).lower()

        for skill in COMMON_SKILLS:
            if skill in text:
                display_skill = skill.upper() if skill in {
                    "sql", "aws", "gcp", "ai", "api", "css", "html"} else skill.title()
                skill_count[display_skill] = skill_count.get(
                    display_skill, 0) + 1

    top = sorted(skill_count.items(), key=lambda x: x[1], reverse=True)[:10]

    return [
        {"skill": skill, "count": count}
        for skill, count in top
    ]


@router.get("/company-distribution")
def company_distribution():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT company, COUNT(*) AS jobs
        FROM jobs
        GROUP BY company
        ORDER BY jobs DESC
    """)

    data = cursor.fetchall()
    conn.close()

    return data


@router.get("/countries")
def country_distribution():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT location FROM jobs")
    rows = cursor.fetchall()
    conn.close()

    counts = {}

    for row in rows:
        loc = normalize_location(row["location"])
        country = (loc.get("country") or "").strip()

        if not country or country == "Other":
            continue

        counts[country] = counts.get(country, 0) + 1

    result = [{"country": k, "jobs": v} for k, v in counts.items()]
    result.sort(key=lambda x: x["jobs"], reverse=True)
    return result


@router.get("/states/{country}")
def state_distribution(country: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT location FROM jobs")
    rows = cursor.fetchall()
    conn.close()

    counts = {}

    for row in rows:
        loc = normalize_location(row["location"])

        if (loc.get("country") or "").lower() != country.lower():
            continue

        state = (loc.get("state") or "").strip()

        if not state or state == "Unknown":
            continue

        counts[state] = counts.get(state, 0) + 1

    result = [{"state": k, "jobs": v} for k, v in counts.items()]
    result.sort(key=lambda x: x["jobs"], reverse=True)
    return result


@router.get("/cities/{country}")
def country_city_distribution(country: str):
    """
    Cities directly under a country (no state level) - used for
    countries like United States, United Kingdom, Japan, Singapore
    where state-level data is not meaningful/available.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT location FROM jobs")
    rows = cursor.fetchall()
    conn.close()

    counts = {}

    for row in rows:
        loc = normalize_location(row["location"])

        if (loc.get("country") or "").lower() != country.lower():
            continue

        city = (loc.get("city") or "").strip()

        if not city or city == "Unknown":
            continue

        counts[city] = counts.get(city, 0) + 1

    result = [{"city": k, "jobs": v} for k, v in counts.items()]
    result.sort(key=lambda x: x["jobs"], reverse=True)
    return result


@router.get("/cities/{country}/{state}")
def city_distribution(country: str, state: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT location FROM jobs")
    rows = cursor.fetchall()
    conn.close()

    counts = {}

    for row in rows:
        loc = normalize_location(row["location"])

        if (
            (loc.get("country") or "").lower() == country.lower()
            and (loc.get("state") or "").lower() == state.lower()
        ):
            city = (loc.get("city") or "").strip()

            if not city or city == "Unknown":
                continue

            counts[city] = counts.get(city, 0) + 1

    result = [{"city": k, "jobs": v} for k, v in counts.items()]
    result.sort(key=lambda x: x["jobs"], reverse=True)
    return result


@router.get("/locations")
def job_locations():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT location FROM jobs")
    rows = cursor.fetchall()
    conn.close()

    counts = {}

    for row in rows:
        loc = normalize_location(row["location"])
        city = (loc.get("city") or "").strip()

        if not city or city == "Unknown":
            continue

        counts[city] = counts.get(city, 0) + 1

    result = [{"location": k, "jobs": v} for k, v in counts.items()]
    result.sort(key=lambda x: x["jobs"], reverse=True)
    return result
