from backend.database import get_connection
from datetime import date

sample_jobs = [
    ("Data Analyst", "TCS", "Bangalore", 300000, 600000, "0-2 years",
     "Python, SQL, Excel, Power BI", "Analyze business data and create dashboards.",
     "https://www.tcs.com/careers", "TCS Careers", "2026-07-01"),

    ("AI Engineer", "Infosys", "Hyderabad", 600000, 1000000, "1-3 years",
     "Python, Machine Learning, Deep Learning, NLP, Docker", "Build AI models and deploy ML services.",
     "https://www.infosys.com/careers/", "Infosys Careers", "2026-07-01"),

    ("Machine Learning Engineer", "Accenture", "Pune", 700000, 1200000, "1-3 years",
     "Python, Scikit-learn, SQL, Pandas, AWS", "Develop machine learning pipelines.",
     "https://www.accenture.com/in-en/careers", "Accenture Careers", "2026-07-01"),
]

def seed_jobs():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executemany("""
        INSERT INTO jobs (
            job_title, company, location, salary_min, salary_max,
            experience_required, required_skills, job_description,
            apply_link, source, posted_date, last_updated
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, [
        (*job, str(date.today())) for job in sample_jobs
    ])

    conn.commit()
    conn.close()
    print("Sample jobs inserted successfully.")

if __name__ == "__main__":
    seed_jobs()