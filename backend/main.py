import os
import shutil
from fastapi import FastAPI, UploadFile, File
from backend.resume_parser import extract_resume_text
from backend.skill_extractor import extract_skills
from pydantic import BaseModel
from typing import List, Optional
from rapidfuzz import fuzz
from backend.roadmap_generator import generate_roadmap
from backend.models import create_tables
from backend.database import get_connection
from backend.job_matcher import calculate_match
from fastapi.middleware.cors import CORSMiddleware
from backend.scraper.scraper_manager import run_bny_scraper
from backend.scraper.scraper_manager import run_wipro_scraper
from backend.scraper.scraper_manager import run_wipro_scraper, run_infosys_scraper
from backend.scraper.scraper_manager import run_wipro_scraper, run_infosys_scraper, run_accenture_scraper, run_microsoft_scraper, run_all_scrapers
from backend.scraper.scraper_manager import run_amazon_scraper
from backend.scraper.scraper_manager import run_flipkart_scraper
from backend.routes.stats import router as stats_router
from backend.location_mapper import normalize_location

# NOTE: A second, duplicate APIRouter(prefix="/stats") used to be defined here,
# redefining /cities/{country} and /cities/{country}/{state} using columns
# (country, state, city) that do not exist on the jobs table (the real schema
# only has a single `location` column, parsed via normalize_location() in
# backend/routes/stats.py). That duplicate router was the cause of the
# 500 error on /stats/cities/United%20States. It has been removed.
# All location/stats endpoints now live in backend/routes/stats.py only.

app = FastAPI(title="CareerPilot AI Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(stats_router)
create_tables()


class JobAnalysisRequest(BaseModel):
    skills: List[str]


class MatchRequest(BaseModel):
    skills: List[str]
    target_roles: Optional[List[str]] = []


def filter_jobs_by_roles(all_jobs, target_roles, threshold=60):
    if not target_roles:
        return all_jobs

    matched_jobs = []

    for job in all_jobs:
        job_title = job["job_title"].lower()

        for role in target_roles:
            role = role.lower()

            score = fuzz.partial_ratio(role, job_title)

            if score >= threshold:
                matched_jobs.append(job)
                break

    return matched_jobs


@app.get("/")
def home():
    return {"message": "CareerPilot AI Backend Running"}


@app.get("/jobs")
def get_jobs(page: int = 1, size: int = 50):
    conn = get_connection()
    cursor = conn.cursor()

    offset = (page - 1) * size

    cursor.execute("SELECT COUNT(*) AS total FROM jobs")
    total = cursor.fetchone()["total"]

    cursor.execute(
        """
        SELECT *
        FROM jobs
        ORDER BY job_id DESC
        LIMIT %s OFFSET %s
        """,
        (size, offset)
    )

    rows = cursor.fetchall()
    conn.close()

    return {
        "total_jobs": total,
        "page": page,
        "size": size,
        "jobs": rows
    }


@app.get("/jobs/by-location")
def jobs_by_location(country: str, state: Optional[str] = None, page: int = 1, size: int = 20):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM jobs")
    rows = cursor.fetchall()
    conn.close()

    matched = []
    for row in rows:
        loc = normalize_location(row.get("location"))

        if (loc.get("country") or "").lower() != country.lower():
            continue

        if state and (loc.get("state") or "").lower() != state.lower():
            continue

        matched.append(row)

    total = len(matched)
    offset = (page - 1) * size
    page_jobs = matched[offset:offset + size]

    return {
        "total": total,
        "page": page,
        "size": size,
        "jobs": page_jobs,
    }


@app.get("/jobs/by-company")
def jobs_by_company(company: str, page: int = 1, size: int = 20):
    conn = get_connection()
    cursor = conn.cursor()

    offset = (page - 1) * size

    cursor.execute(
        "SELECT COUNT(*) AS total FROM jobs WHERE company = %s",
        (company,),
    )
    total = cursor.fetchone()["total"]

    cursor.execute(
        """
        SELECT * FROM jobs
        WHERE company = %s
        ORDER BY job_id DESC
        LIMIT %s OFFSET %s
        """,
        (company, size, offset),
    )
    rows = cursor.fetchall()
    conn.close()

    return {
        "total": total,
        "page": page,
        "size": size,
        "jobs": rows,
    }


@app.get("/jobs/by-source")
def jobs_by_source(source: str, page: int = 1, size: int = 20):
    conn = get_connection()
    cursor = conn.cursor()

    offset = (page - 1) * size

    cursor.execute(
        "SELECT COUNT(*) AS total FROM jobs WHERE source = %s",
        (source,),
    )
    total = cursor.fetchone()["total"]

    cursor.execute(
        """
        SELECT * FROM jobs
        WHERE source = %s
        ORDER BY job_id DESC
        LIMIT %s OFFSET %s
        """,
        (source, size, offset),
    )
    rows = cursor.fetchall()
    conn.close()

    return {
        "total": total,
        "page": page,
        "size": size,
        "jobs": rows,
    }


@app.get("/jobs/search")
def search_jobs(q: str = "", limit: int = 8):
    query = (q or "").strip()

    if not query:
        return {"jobs": []}

    conn = get_connection()
    cursor = conn.cursor()

    like = f"%{query}%"

    cursor.execute(
        """
        SELECT job_id, job_title, company, location, source
        FROM jobs
        WHERE job_title LIKE %s
           OR company LIKE %s
           OR required_skills LIKE %s
        ORDER BY job_id DESC
        LIMIT %s
        """,
        (like, like, like, limit),
    )

    rows = cursor.fetchall()
    conn.close()

    return {"jobs": rows}


@app.post("/match-jobs")
def match_jobs(request: MatchRequest):
    conn = get_connection()
    cursor = conn.cursor()

    if request.target_roles:
        placeholders = ",".join(["%s"] * len(request.target_roles))
        query = f"""
            SELECT * FROM jobs
            WHERE LOWER(job_title) IN ({placeholders})
        """
        params = [role.lower() for role in request.target_roles]
        cursor.execute(query, params)
    else:
        cursor.execute("SELECT * FROM jobs")

    jobs = cursor.fetchall()
    conn.close()

    ready_to_apply = []
    apply_with_improvements = []
    not_ready_yet = []

    for job in jobs:
        job_dict = dict(job)

        match_result = calculate_match(
            request.skills,
            job_dict["required_skills"]
        )

        final_job = {
            **job_dict,
            **match_result
        }

        score = match_result["match_score"]

        if score >= 85:
            final_job["category"] = "Ready to Apply"
            ready_to_apply.append(final_job)

        elif score >= 60:
            final_job["category"] = "Apply with Improvements"
            apply_with_improvements.append(final_job)

        else:
            final_job["category"] = "Not Ready Yet"
            not_ready_yet.append(final_job)

    return {
        "user_skills": request.skills,
        "target_roles": request.target_roles,
        "ready_to_apply_count": len(ready_to_apply),
        "apply_with_improvements_count": len(apply_with_improvements),
        "not_ready_yet_count": len(not_ready_yet),
        "ready_to_apply_jobs": ready_to_apply,
        "apply_with_improvements_jobs": apply_with_improvements,
        "not_ready_yet_jobs": not_ready_yet
    }


UPLOAD_FOLDER = "backend/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in ["pdf", "docx"]:
        return {
            "error": "Only PDF and DOCX resume files are supported"
        }

    file_path = f"{UPLOAD_FOLDER}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text = extract_resume_text(file_path)
    detected_skills = extract_skills(resume_text)

    return {
        "filename": file.filename,
        "detected_skills": detected_skills,
        "resume_text_preview": resume_text[:1000]
    }


@app.post("/analyze-career")
async def analyze_career(
    file: UploadFile = File(...),
    target_roles: Optional[str] = ""
):
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in ["pdf", "docx"]:
        return {"error": "Only PDF and DOCX resume files are supported"}

    file_path = f"{UPLOAD_FOLDER}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text = extract_resume_text(file_path)
    detected_skills = extract_skills(resume_text)

    roles_list = []
    if target_roles:
        roles_list = [
            role.strip()
            for role in target_roles.split(",")
            if role.strip()
        ]

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM jobs")
    all_jobs = [dict(row) for row in cursor.fetchall()]
    jobs = filter_jobs_by_roles(all_jobs, roles_list)
    conn.close()
    ready_to_apply = []
    apply_with_improvements = []
    not_ready_yet = []

    for job in jobs:
        job_dict = job

        match_result = calculate_match(
            detected_skills,
            job_dict["required_skills"]
        )

        final_job = {
            **job_dict,
            **match_result
        }

        score = match_result["match_score"]

        if score >= 85:
            final_job["category"] = "Ready to Apply"
            ready_to_apply.append(final_job)

        elif score >= 60:
            final_job["category"] = "Apply with Improvements"
            apply_with_improvements.append(final_job)

        else:
            final_job["category"] = "Not Ready Yet"
            not_ready_yet.append(final_job)

    ready_to_apply = sorted(
        ready_to_apply,
        key=lambda job: job["match_score"],
        reverse=True
    )

    apply_with_improvements = sorted(
        apply_with_improvements,
        key=lambda job: job["match_score"],
        reverse=True
    )

    not_ready_yet = sorted(
        not_ready_yet,
        key=lambda job: job["match_score"],
        reverse=True
    )

    return {
        "filename": file.filename,
        "detected_skills": detected_skills,
        "target_roles": roles_list,

        "ready_to_apply_count": len(ready_to_apply),
        "apply_with_improvements_count": len(apply_with_improvements),
        "not_ready_yet_count": len(not_ready_yet),

        "ready_to_apply_jobs": ready_to_apply[:50],
        "apply_with_improvements_jobs": apply_with_improvements[:50],
        "not_ready_yet_jobs": not_ready_yet[:50],
    }


@app.post("/job-analysis/{job_id}")
def job_analysis(job_id: int, request: JobAnalysisRequest):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM jobs WHERE job_id = %s", (job_id,))
    job = cursor.fetchone()
    conn.close()

    if not job:
        return {"error": "Job not found"}

    job_dict = dict(job)

    match_result = calculate_match(
        request.skills,
        job_dict["required_skills"]
    )

    roadmap = generate_roadmap(match_result["missing_skills"])

    return {
        "job": job_dict,
        "match_score": match_result["match_score"],
        "matched_skills": match_result["matched_skills"],
        "missing_skills": match_result["missing_skills"],
        "roadmap": roadmap,
        "apply_link": job_dict["apply_link"]
    }


@app.post("/admin/update-jobs/wipro")
def update_wipro_jobs():
    return run_wipro_scraper()


@app.post("/admin/update-jobs/infosys")
def update_infosys_jobs():
    return run_infosys_scraper()


@app.post("/admin/update-jobs/all")
def update_all_jobs():
    return run_all_scrapers()


@app.post("/admin/update-jobs/accenture")
def update_accenture_jobs():
    return run_accenture_scraper()


@app.post("/admin/update-jobs/microsoft")
def update_microsoft_jobs():
    return run_microsoft_scraper()


@app.post("/admin/update-jobs/bny")
def update_bny_jobs():
    return run_bny_scraper()


@app.post("/admin/update-jobs/Amazon")
def update_amazon_jobs():
    return run_amazon_scraper()


@app.post("/admin/update-jobs/flipkart")
def update_flipkart_jobs():
    return run_flipkart_scraper()


@app.get("/jobs/count")
def get_jobs_count():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM jobs")
    total = cursor.fetchone()["total"]

    conn.close()

    return {"total_jobs": total}
