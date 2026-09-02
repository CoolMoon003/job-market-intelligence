function scoreColor(score) {
    if (score >= 85) return "text-green-400 border-green-500/30";
    if (score >= 60) return "text-yellow-400 border-yellow-500/30";
    return "text-red-400 border-red-500/30";
}

export default function JobMatchCard({ job, onViewRoadmap }) {
    const matched = Array.isArray(job.matched_skills) ? job.matched_skills : [];
    const missing = Array.isArray(job.missing_skills) ? job.missing_skills : [];

    return (
        <div className="bg-[#0B1020] border border-gray-800 rounded-xl p-5">
            <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                    <h3 className="text-white font-semibold text-lg">
                        {job.job_title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                        {job.company} {job.location ? `· ${job.location}` : ""}
                    </p>
                </div>

                <div
                    className={`shrink-0 border rounded-lg px-3 py-1 text-sm font-semibold ${scoreColor(
                        job.match_score ?? 0
                    )}`}
                >
                    {job.match_score ?? 0}%
                </div>
            </div>

            {matched.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Matched skills</p>
                    <div className="flex flex-wrap gap-2">
                        {matched.map((skill) => (
                            <span
                                key={skill}
                                className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-md"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {missing.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Missing skills</p>
                    <div className="flex flex-wrap gap-2">
                        {missing.map((skill) => (
                            <span
                                key={skill}
                                className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-md"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                {missing.length > 0 && (
                    <button
                        onClick={() => onViewRoadmap(job)}
                        className="bg-blue-600 hover:bg-blue-700 transition text-sm px-4 py-2 rounded-lg"
                    >
                        View Roadmap
                    </button>
                )}

                {job.apply_link && (
                    <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#111827] border border-gray-800 hover:border-gray-600 transition text-sm px-4 py-2 rounded-lg text-gray-300"
                    >
                        View Job
                    </a>
                )}
            </div>
        </div>
    );
}