import { useEffect, useState } from "react";
import { FaChevronRight, FaDatabase } from "react-icons/fa";
import AppLayout from "../components/layout/AppLayout";
import JobListTable from "../components/jobs/JobListTable";
import { getStats, getJobsBySource } from "../services/api";

export default function Sources() {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const data = await getStats();
                if (isMounted) setSources(Array.isArray(data?.sources) ? data.sources : []);
            } catch (err) {
                console.error("Failed to load sources:", err);
                if (isMounted) {
                    setError("Could not load sources.");
                    setSources([]);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AppLayout>
            <div className="mb-6">
                <p className="text-blue-400 text-sm font-semibold mb-2">
                    SOURCES
                </p>
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                    <FaDatabase /> Job Sources
                </h1>
                <p className="text-gray-400 mt-3">
                    Where each job in the database was scraped from.
                </p>
            </div>

            <div className="flex items-center gap-2 text-sm mb-6 text-gray-400 flex-wrap">
                <button
                    onClick={() => setSelectedSource(null)}
                    className={selectedSource ? "hover:text-white" : "text-white font-semibold"}
                >
                    All Sources
                </button>

                {selectedSource && (
                    <>
                        <FaChevronRight className="text-xs" />
                        <span className="text-white font-semibold">{selectedSource}</span>
                    </>
                )}
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-6">
                {!selectedSource && (
                    <>
                        {loading && <p className="text-gray-400">Loading sources...</p>}

                        {!loading && error && <p className="text-red-400">{error}</p>}

                        {!loading && !error && sources.length === 0 && (
                            <div className="bg-[#0B1020] border border-gray-800 rounded-xl p-6 text-center text-gray-400">
                                No sources found.
                            </div>
                        )}

                        {!loading && !error && sources.length > 0 && (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sources.map((s) => (
                                    <button
                                        key={s.source}
                                        onClick={() => setSelectedSource(s.source)}
                                        className="bg-[#0B1020] border border-gray-800 rounded-xl p-5 text-left hover:border-blue-500/50 transition"
                                    >
                                        <h3 className="text-lg font-semibold text-white">
                                            {s.source}
                                        </h3>
                                        <p className="text-blue-400 mt-2">
                                            {(s.jobs ?? 0).toLocaleString()} Jobs
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {selectedSource && (
                    <JobListTable
                        fetchJobs={(page, size) =>
                            getJobsBySource(selectedSource, page, size)
                        }
                        deps={[selectedSource]}
                    />
                )}
            </div>
        </AppLayout>
    );
}