from backend.database import get_connection
from backend.scraper.base_scraper import normalize_job
from backend.scraper.sources.wipro_scraper import scrape_jobs as scrape_wipro_jobs
from backend.scraper.sources.infosys_scraper import scrape_jobs as scrape_infosys_jobs
from backend.scraper.sources.accenture_scraper import scrape_jobs as scrape_accenture_jobs
from backend.scraper.sources.microsoft_scraper import scrape_jobs as scrape_microsoft_jobs
from backend.scraper.sources.bny_scraper import scrape_jobs as scrape_bny_jobs
from backend.scraper.sources.amazon_scraper import scrape_jobs as scrape_amazon_jobs
from backend.scraper.sources.flipkart_scraper import scrape_jobs as scrape_flipkart_jobs


def insert_jobs(jobs):
    """
    Normalizes and inserts a freshly scraped batch of jobs.

    Behavior change: this used to only skip duplicates (matched by
    apply_link) and otherwise kept accumulating jobs forever, so postings
    that were taken down on the company's site never left the database.

    Now: before inserting, it deletes existing rows whose `source` matches
    the source of the incoming batch, so each scrape run fully replaces
    that source's data with only what's currently live. Only the source(s)
    present in `jobs` are touched - other companies' data is untouched
    until they're re-scraped themselves.

    Safety rail: if nothing in the batch is valid (empty scrape, site
    down, structure changed), nothing is deleted - we don't want a failed
    scrape to wipe out otherwise-good existing data.
    """
    normalized_jobs = []
    skipped = 0

    for raw_job in jobs:
        job = normalize_job(raw_job)

        if not job["job_title"] or not job["company"]:
            skipped += 1
            continue

        normalized_jobs.append(job)

    inserted = 0
    deleted_old = 0

    conn = get_connection()
    cursor = conn.cursor()

    if normalized_jobs:
        # Derive the source value from the data itself (rather than a
        # hardcoded guess) so it always matches exactly what's inserted,
        # regardless of casing used inside normalize_job().
        sources_in_batch = {
            job["source"] for job in normalized_jobs if job.get("source")
        }

        for source_value in sources_in_batch:
            cursor.execute(
                "DELETE FROM jobs WHERE source = %s",
                (source_value,),
            )
            deleted_old += cursor.rowcount

        seen_links = set()

        for job in normalized_jobs:
            if job["apply_link"] in seen_links:
                skipped += 1
                continue
            seen_links.add(job["apply_link"])

            cursor.execute(
                """
                INSERT INTO jobs (
                    job_title, company, location, salary_min, salary_max,
                    experience_required, required_skills, job_description,
                    apply_link, source, posted_date, last_updated
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    job["job_title"],
                    job["company"],
                    job["location"],
                    job["salary_min"],
                    job["salary_max"],
                    job["experience_required"],
                    job["required_skills"],
                    job["job_description"],
                    job["apply_link"],
                    job["source"],
                    job["posted_date"],
                    job["last_updated"],
                ),
            )
            inserted += 1

        conn.commit()

    conn.close()

    return {
        "inserted": inserted,
        "skipped": skipped,
        "deleted_old": deleted_old,
        "total_received": len(jobs),
    }


def _failed_result(source, error):
    """Consistent shape for a failed scraper run, so the frontend can
    just render 0/0/0 instead of crashing or showing a raw stack trace."""
    return {
        "source": source,
        "scraped": 0,
        "inserted": 0,
        "skipped": 0,
        "deleted_old": 0,
        "total_received": 0,
        "error": str(error),
    }


def run_all_scrapers():
    results = []

    # NOTE: this previously only ran Wipro + Infosys despite the
    # "Run All Scrapers" label - the other 5 scrapers were defined but
    # never actually called here. Now all 7 run, and each is isolated:
    # one scraper failing (e.g. Amazon's page structure changing) no
    # longer stops the rest of the batch.
    scrapers = [
        ("Wipro", run_wipro_scraper),
        ("Infosys", run_infosys_scraper),
        ("Accenture", run_accenture_scraper),
        ("Microsoft", run_microsoft_scraper),
        ("BNY", run_bny_scraper),
        ("Amazon", run_amazon_scraper),
        ("Flipkart", run_flipkart_scraper),
    ]

    for name, scraper_fn in scrapers:
        try:
            results.append(scraper_fn())
        except Exception as exc:
            results.append(_failed_result(name, exc))

    return {
        "message": "All scrapers completed",
        "results": results
    }

def run_wipro_scraper():
    try:
        jobs = scrape_wipro_jobs(max_pages=650)
        result = insert_jobs(jobs)
        return {"source": "Wipro", "scraped": len(jobs), **result}
    except Exception as exc:
        return _failed_result("Wipro", exc)

def run_infosys_scraper():
    try:
        jobs = scrape_infosys_jobs()
        result = insert_jobs(jobs)
        return {"source": "Infosys", "scraped": len(jobs), **result}
    except Exception as exc:
        return _failed_result("Infosys", exc)

def run_accenture_scraper():
    try:
        jobs = scrape_accenture_jobs(max_pages=300)
        result = insert_jobs(jobs)
        return {"source": "Accenture", "scraped": len(jobs), **result}
    except Exception as exc:
        return _failed_result("Accenture", exc)

def run_microsoft_scraper():
    try:
        jobs = scrape_microsoft_jobs(max_pages=70)
        result = insert_jobs(jobs)
        return {"source": "Microsoft", "scraped": len(jobs), **result}
    except Exception as exc:
        return _failed_result("Microsoft", exc)

def run_bny_scraper():
    try:
        jobs = scrape_bny_jobs(max_pages=112)
        result = insert_jobs(jobs)
        return {"source": "BNY", "scraped": len(jobs), **result}
    except Exception as exc:
        return _failed_result("BNY", exc)

def run_amazon_scraper():
    try:
        jobs = scrape_amazon_jobs(max_pages=50)
        result = insert_jobs(jobs)
        return {"source": "Amazon", "scraped": len(jobs), **result}
    except Exception as exc:
        return _failed_result("Amazon", exc)

def run_flipkart_scraper():
    try:
        jobs = scrape_flipkart_jobs()
        result = insert_jobs(jobs)
        return {"source": "Flipkart", "scraped": len(jobs), **result}
    except Exception as exc:
        return _failed_result("Flipkart", exc)