import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getJobAnalysis } from "../services/api";

function JobDetails() {
  const { jobId } = useParams();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const loadJobAnalysis = async () => {
      const saved = JSON.parse(localStorage.getItem("careerAnalysis"));
      const skills = saved?.detected_skills || [];

      const data = await getJobAnalysis(jobId, skills);
      setAnalysis(data);
    };

    loadJobAnalysis();
  }, [jobId]);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        Loading job analysis...
      </div>
    );
  }

  const job = analysis.job;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <p className="text-blue-400 mb-2">Job Analysis</p>

        <h1 className="text-4xl font-bold">{job.job_title}</h1>
        <p className="text-slate-400 mt-2">
          {job.company} • {job.location}
        </p>

        <div className="grid md:grid-cols-3 gap-5 mt-8">
          <InfoCard title="Match Score" value={`${analysis.match_score}%`} />
          <InfoCard title="Salary Range" value={`₹${job.salary_min} - ₹${job.salary_max}`} />
          <InfoCard title="Experience" value={job.experience_required} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <SkillBox title="Matched Skills" skills={analysis.matched_skills} type="matched" />
          <SkillBox title="Missing Skills" skills={analysis.missing_skills} type="missing" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Learning Roadmap</h2>

          {analysis.roadmap.length === 0 ? (
            <p className="text-green-400">
              Great! No major missing skills for this role.
            </p>
          ) : (
            <div className="space-y-5">
              {analysis.roadmap.map((item, index) => (
                <div key={index} className="bg-slate-800 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-2">{item.skill}</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {item.plan.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <a
          href={analysis.apply_link}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
        >
          Apply on Official Portal
        </a>
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <p className="text-slate-400">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function SkillBox({ title, skills, type }) {
  const color = type === "matched" ? "text-green-400" : "text-red-400";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      {skills.length === 0 ? (
        <p className="text-slate-500">None</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span key={index} className={`bg-slate-800 px-3 py-1 rounded-full ${color}`}>
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobDetails;