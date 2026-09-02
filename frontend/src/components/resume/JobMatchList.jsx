import JobMatchCard from "./JobMatchCard";

export default function JobMatchList({ jobs, emptyMessage, onViewRoadmap }) {
    const list = Array.isArray(jobs) ? jobs : [];

    if (list.length === 0) {
        return (
            <div className="bg-[#0B1020] border border-gray-800 rounded-xl p-6 text-center text-gray-400">
                {emptyMessage || "No jobs in this category."}
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {list.map((job) => (
                <JobMatchCard
                    key={job.job_id}
                    job={job}
                    onViewRoadmap={onViewRoadmap}
                />
            ))}
        </div>
    );
}