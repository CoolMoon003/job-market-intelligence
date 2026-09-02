import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JobListTable({ fetchJobs, deps = [], pageSize = 20 }) {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Reset to page 1 whenever the filter (deps) changes
    useEffect(() => {
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const data = await fetchJobs(page, pageSize);
                if (isMounted) {
                    setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
                    setTotal(data?.total ?? 0);
                }
            } catch (err) {
                console.error("Failed to load jobs:", err);
                if (isMounted) {
                    setError("Could not load jobs.");
                    setJobs([]);
                    setTotal(0);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, ...deps]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (loading) {
        return <p className="text-gray-400 p-4">Loading jobs...</p>;
    }

    if (error) {
        return (
            <div className="bg-[#0B1020] border border-red-900/50 rounded-xl p-6 text-red-400">
                {error}
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="bg-[#0B1020] border border-gray-800 rounded-xl p-6 text-center text-gray-400">
                No jobs found.
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm min-w-[640px]">
                    <thead className="bg-[#0B1020] text-gray-400">
                        <tr>
                            <th className="text-left p-4">Role</th>
                            <th className="text-left p-4">Company</th>
                            <th className="text-left p-4">Location</th>
                            <th className="text-left p-4">Source</th>
                            <th className="text-left p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job) => (
                            <tr
                                key={job.job_id}
                                className="border-t border-gray-800 text-gray-300"
                            >
                                <td className="p-4 text-white">{job.job_title}</td>
                                <td className="p-4">{job.company}</td>
                                <td className="p-4">{job.location}</td>
                                <td className="p-4">{job.source}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => navigate(`/job/${job.job_id}`)}
                                        className="text-blue-400 hover:text-blue-300 text-sm"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
                <p>
                    Page {page} of {totalPages} · {total.toLocaleString()} jobs
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="bg-[#111827] border border-gray-800 px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="bg-[#111827] border border-gray-800 px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}