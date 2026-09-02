# CareerPilot AI — Job Market Intelligence Platform

A full-stack application that scrapes real job listings, stores them in MySQL,
and helps users understand hiring trends, skills demand, and how their resume
matches available jobs.

## Tech Stack

**Backend:** Python, FastAPI, MySQL (PyMySQL), Uvicorn
**Frontend:** React 19, Vite, Tailwind CSS, React Router, Recharts, React
Leaflet, React Icons

## Project Structure

```
job_market_intelligence/
│
├── backend/
│   ├── main.py                  # FastAPI app, jobs/resume/admin routes
│   ├── database.py              # MySQL connection
│   ├── models.py                # Table setup
│   ├── resume_parser.py         # PDF/DOCX text extraction
│   ├── skill_extractor.py       # Keyword-based skill detection
│   ├── job_matcher.py           # Resume-to-job match scoring
│   ├── roadmap_generator.py     # Missing-skill learning roadmap
│   ├── location_mapper.py       # Location string -> country/state/city
│   ├── routes/
│   │   └── stats.py             # Dashboard + location analytics endpoints
│   ├── scraper/
│   │   ├── scraper_manager.py   # Runs and inserts scraped jobs
│   │   └── sources/             # One scraper module per company
│   └── uploads/                 # Uploaded resumes (gitignored)
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx        # Main stats + map + charts
        │   ├── ResumeAnalysis.jsx   # Resume upload + job matching
        │   ├── AdminScrapers.jsx    # Scraper controls
        │   ├── Home.jsx             # (unused, superseded by Dashboard as root)
        │   └── JobDetails.jsx
        ├── components/
        │   ├── dashboard/    # Sidebar, TopNavbar, WorldMap, IndiaMap, CityPanel
        │   ├── resume/       # Upload form, job match cards, roadmap modal
        │   └── admin/        # Scraper control cards
        ├── context/
        │   └── ThemeContext.jsx   # Dark/light mode toggle
        └── services/
            └── api.js         # All backend API calls
```

## Setup

### 1. Database

Create a MySQL database matching what's configured in `backend/database.py`
(database name, user, password). The `jobs` table needs at minimum:

```
job_id, job_title, company, location, salary_min, salary_max,
experience_required, required_skills, job_description, apply_link,
source, posted_date, last_updated
```

### 2. Backend

```bash
cd job_market_intelligence
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

Backend: http://127.0.0.1:8000
Swagger docs: http://127.0.0.1:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Core Features

- **Dashboard** — total jobs, companies, locations, jobs-by-company /
  jobs-by-skill / jobs-by-source charts, recent jobs table
- **Location Intelligence** — World → country click → India shows state
  markers → state click shows cities; other countries go straight to
  city-level data where available
- **Resume Matching** — upload a PDF/DOCX resume, get detected skills,
  and see jobs categorized as Ready to Apply / Apply with Improvements /
  Not Ready Yet, each with a match score and a per-job learning roadmap
  for missing skills
- **Scraper Controls** — trigger any individual company scraper or run
  all of them, with inserted/skipped counts per source
- **Live search** — search jobs/companies/skills from the top navbar
- **Dark/light theme toggle**, real refresh and notifications in the top bar

## Key API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/jobs` | Paginated job listings |
| GET | `/jobs/search?q=` | Search jobs by title/company/skills |
| GET | `/jobs/count` | Total job count |
| GET | `/stats` | Dashboard summary stats |
| GET | `/stats/skills` | Top in-demand skills |
| GET | `/stats/countries` | Jobs by country |
| GET | `/stats/states/{country}` | Jobs by state within a country |
| GET | `/stats/cities/{country}` | Jobs by city (no state level) |
| GET | `/stats/cities/{country}/{state}` | Jobs by city within a state |
| POST | `/upload-resume` | Upload resume, extract detected skills |
| POST | `/analyze-career` | Upload resume + get categorized job matches |
| POST | `/job-analysis/{job_id}` | Match score + roadmap for one job |
| POST | `/match-jobs` | Match a given skill list against all jobs |
| POST | `/admin/update-jobs/{source}` | Run one scraper (wipro, infosys, accenture, microsoft, bny, Amazon, flipkart) |
| POST | `/admin/update-jobs/all` | Run all scrapers |

Full interactive docs at `/docs` once the backend is running.

## Known Limitations / Follow-ups

- `pages/Home.jsx` is no longer routed (root path now opens the Dashboard
  directly) — safe to delete if unused.
- Scraper page-count limits (e.g. Wipro at 650 pages) are production
  values and can take a long time to complete; consider lowering them
  for quick demo runs.
- `backend/requirements.txt` was reconstructed from visible imports —
  run `pip freeze > requirements.txt` in your working venv for an exact,
  version-pinned list before final delivery.
- Location alias normalization (e.g. merging "Bengaluru"/"Bangalore")
  lives in `backend/location_mapper.py` — review that file directly if
  duplicate-looking locations still appear.

## Status

Core flow (scrape → store → analyze → dashboard → resume match → roadmap →
admin controls) is functional end-to-end. Remaining work before final
submission: responsive-layout pass, removing any last dead code, and
final screenshots for the presentation.