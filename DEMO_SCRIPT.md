# CareerPilot AI — Demo Script

A suggested walkthrough order for presenting the project. Each section
says what to click and what to say about it.

---

## 1. Opening (30 sec)

> "This is a job market intelligence platform. It scrapes real job
> postings from 7 companies, stores them in MySQL, and gives three main
> things on top of that: a hiring-trends dashboard, a resume-to-job
> matching engine, and admin controls to keep the data fresh."

Open the app at `http://localhost:5173` — it lands directly on the
Dashboard (no separate landing page).

---

## 2. Dashboard tour (1–2 min)

- Point out the 4 top stat cards: Total Jobs, Companies, Locations,
  Scraper Health.
- Scroll to **Jobs by Company**, **Top Skills in Demand**, **Jobs by
  Source** charts — all pulled live from MySQL, not hardcoded.
- Show the **Recent Jobs** table at the bottom.
- Click the **search bar** in the top navbar, type a skill or company
  name (e.g. "Python") — show the live dropdown of matching jobs.
- Click the **bell icon** — show recent-activity notifications (real
  data, not mocked).
- Click the **moon icon** — toggle dark/light mode live.
- Click the **refresh icon** — re-fetches the dashboard data.

---

## 3. Location drill-down (1 min)

- On the World map panel: click a country card (e.g. **India**).
- Click a state marker (e.g. **Karnataka** or **Delhi**) on the map.
- Show the city-level breakdown that appears.
- Go **Back** twice to return to the world view, then click a
  non-India country (e.g. **United States**) to show it skips straight
  to city-level data (no state layer needed there).

> "This required actually parsing an unstructured `location` string
> field into country/state/city — there's no separate columns for
> those in the database."

---

## 4. Resume matching (2–3 min) — the centerpiece

- Go to **Resume Analysis** in the sidebar.
- Upload a real PDF or DOCX resume.
- Optionally type target roles (e.g. "Data Analyst, Backend Developer").
- Click **Analyze Career**.
- Show the **detected skills** chips pulled straight from the resume text.
- Switch between the three tabs: **Ready to Apply**, **Apply with
  Improvements**, **Not Ready Yet** — explain the score thresholds
  (85%+ / 60–84% / below 60%).
- Pick a job with missing skills, click **View Roadmap** — show the
  step-by-step learning plan generated per missing skill.

---

## 5. Scraper Controls (1–2 min)

- Go to **Scraper Controls**.
- Run one individual scraper (pick a fast one, not Wipro — that one
  scrapes 650 pages and takes a while).
- Point out the four numbers: **Scraped → Removed → Inserted →
  Skipped**.

> "Removed shows old postings from that company being cleared out
> before the new batch goes in — so postings that were taken down on
> the real site don't linger in our database forever."

- If time allows, mention **Run All Scrapers** runs all 7 sources in
  sequence, and one source failing (e.g. if a site changes its layout)
  doesn't stop the others — it just shows 0/0/0 for that one.

---

## 6. Remaining pages (1–2 min, can go quickly)

- **Jobs** — Country → State → full paginated job list (same location
  logic as the dashboard map, but as a browsable list/table instead).
- **Companies** — every hiring company, click one to see just their jobs.
- **Sources** — same idea, grouped by which scraper the job came from.
- **Analytics** — larger versions of the dashboard's charts for a
  deeper look.
- **Reports** — live summary numbers with a genuine **Export CSV**
  button (downloads real current data, not a placeholder).
- **Settings** — theme toggle and basic system info.

---

## 7. Closing (30 sec)

> "End to end: scrape → normalize → store in MySQL → analyze via
> FastAPI → visualize and match in React. Everything shown is backed
> by a real API call — nothing on screen is mocked or hardcoded."

---

## Things to avoid live during a demo

- **Don't run the Wipro scraper live** — it's configured for 650 pages
  and can take a long time. Use a lighter one (Infosys, Flipkart) to
  show the flow, or run Wipro beforehand and just show the result.
- **Don't upload a resume with sensitive personal info** on a shared
  screen — use a sample/test resume.
- If a scraper genuinely fails during the demo (e.g. Amazon), that's
  fine — it's a good moment to point out the app degrades gracefully
  (0/0/0 + a quiet note) instead of crashing.