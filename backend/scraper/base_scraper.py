from datetime import date


def normalize_job(job):
    return {
        "job_title": job.get("job_title", "").strip(),
        "company": job.get("company", "").strip(),
        "location": job.get("location", "Not specified").strip() or "Not specified",
        "salary_min": job.get("salary_min", 0),
        "salary_max": job.get("salary_max", 0),
        "experience_required": job.get("experience_required", "Not specified"),
        "required_skills": job.get("required_skills", ""),
        "job_description": job.get("job_description", ""),
        "apply_link": job.get("apply_link", ""),
        "source": job.get("source", ""),
        "posted_date": job.get("posted_date", str(date.today())),
        "last_updated": str(date.today()),
    }