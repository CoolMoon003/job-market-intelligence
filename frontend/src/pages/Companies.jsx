import { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import AppLayout from "../components/layout/AppLayout";
import JobListTable from "../components/jobs/JobListTable";
import { getCompanyDistribution, getJobsByCompany } from "../services/api";

export default function Companies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const data = await getCompanyDistribution();
                if (isMounted) setCompanies(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load companies:", err);
                if (isMounted) {
                    setError("Could not load companies.");
                    setCompanies([]);
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
                    COMPANIES
                </p>
                <h1 className="text-3xl md:text-4xl font-bold">Hiring Companies</h1>
                <p className="text-gray-400 mt-3">
                    Every company with jobs in the database.
                </p>
            </div>

            <div className="flex items-center gap-2 text-sm mb-6 text-gray-400 flex-wrap">
                <button
                    onClick={() => setSelectedCompany(null)}
                    className={selectedCompany ? "hover:text-white" : "text-white font-semibold"}
                >
                    All Companies
                </button>

                {selectedCompany && (
                    <>
                        <FaChevronRight className="text-xs" />
                        <span className="text-white font-semibold">{selectedCompany}</span>
                    </>
                )}
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-6">
                {!selectedCompany && (
                    <>
                        {loading && <p className="text-gray-400">Loading companies...</p>}

                        {!loading && error && <p className="text-red-400">{error}</p>}

                        {!loading && !error && companies.length === 0 && (
                            <div className="bg-[#0B1020] border border-gray-800 rounded-xl p-6 text-center text-gray-400">
                                No companies found.
                            </div>
                        )}

                        {!loading && !error && companies.length > 0 && (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {companies.map((c) => (
                                    <button
                                        key={c.company}
                                        onClick={() => setSelectedCompany(c.company)}
                                        className="bg-[#0B1020] border border-gray-800 rounded-xl p-5 text-left hover:border-blue-500/50 transition"
                                    >
                                        <h3 className="text-lg font-semibold text-white">
                                            {c.company}
                                        </h3>
                                        <p className="text-blue-400 mt-2">
                                            {(c.jobs ?? 0).toLocaleString()} Jobs
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {selectedCompany && (
                    <JobListTable
                        fetchJobs={(page, size) =>
                            getJobsByCompany(selectedCompany, page, size)
                        }
                        deps={[selectedCompany]}
                    />
                )}
            </div>
        </AppLayout>
    );
}