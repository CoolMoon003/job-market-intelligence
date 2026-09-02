# Database Schema Reference

## Important caveat

`backend/models.py`'s `create_tables()` currently returns immediately
without executing anything — the actual `jobs` table was created
manually (or was migrated in via `migrate_sqlite_to_mysql.py`), not by
that function. This document lists the columns as reconstructed from
every `INSERT`/`SELECT` statement across the codebase — it's accurate
on **column names and how they're used**, but I don't have exact data
types, lengths, or constraints since I never saw a `CREATE TABLE`
statement.

**To get the real, exact schema, run this in MySQL and paste the
result back if you want it documented precisely:**

```sql
DESCRIBE jobs;
```

## `jobs` table — columns in use

| Column | Used as | Notes |
|---|---|---|
| `job_id` | Primary key | Referenced in `/job-analysis/{job_id}`, `/jobs/by-*` results, used as React `key` in job lists |
| `job_title` | Text | Searched via `LIKE` in `/jobs/search`; matched against target roles via fuzzy matching in `/analyze-career` |
| `company` | Text | Grouped for `/stats/company-distribution`; filtered exactly in `/jobs/by-company` |
| `location` | Text, unstructured | **Single free-text field** — parsed at query time by `normalize_location()` in `location_mapper.py` into country/state/city. There are no separate columns for these. |
| `salary_min` | Numeric | Selected via `SELECT *`, not currently displayed anywhere in the frontend |
| `salary_max` | Numeric | Same as above |
| `experience_required` | Text/Numeric | Selected via `SELECT *`, not currently surfaced in the UI |
| `required_skills` | Text, comma-separated | Parsed by `job_matcher.split_skills()`; searched via `LIKE` in `/jobs/search` |
| `job_description` | Text | Scanned for skill keywords in `skill_extractor`/`stats.py`'s `top_skills` |
| `apply_link` | Text, treated as unique | Used to detect duplicate postings (before the per-source delete-and-replace change); linked as "View Job" in the UI |
| `source` | Text | Which scraper produced the row (`Wipro`, `Infosys`, etc.) — grouped for the Sources page, and used to scope the delete-and-replace on each scraper run |
| `posted_date` | Date | Selected via `SELECT *`, not currently surfaced in the UI |
| `last_updated` | Date/Timestamp | Selected via `SELECT *`, not currently surfaced in the UI |

## Known gaps / unused columns

`salary_min`, `salary_max`, `experience_required`, `posted_date`, and
`last_updated` are all stored and inserted, but nothing in the current
frontend displays them. That's a legitimate small feature opportunity —
e.g. showing a salary range or "posted X days ago" on job cards — if
you want it added later.

## Related, non-DB files that matter for scraped data

- `backend/scraper/base_scraper.py` — `normalize_job()` shapes raw
  scraper output into the dict that gets inserted (I haven't seen this
  file's contents directly, so field-level normalization logic there
  is inferred from how it's consumed in `scraper_manager.py`).
- `backend/location_mapper.py` — `normalize_location()` turns the raw
  `location` string into `{"country", "state", "city"}` at query time.
  This is where any alias-merging logic (e.g. Bengaluru/Bangalore)
  would live.