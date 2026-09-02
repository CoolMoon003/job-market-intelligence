import { useEffect, useState } from "react";
import { FaFileAlt, FaDownload } from "react-icons/fa";
import AppLayout from "../components/layout/AppLayout";
import { getStats, getTopSkills, getCompanyDistribution } from "../services/api";

function toCsv(rows) {
    return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCsv(filename, csvContent) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function Reports() {
    const [stats, setStats] = useState(null);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const [statsData, skillsData] = await Promise.all([
                    getStats(),
                    getTopSkills(),
                    getCompanyDistribution(),
                ]);

                if (isMounted) {
                    setStats(statsData);
                    setSkills(Array.isArray(skillsData) ? skillsData : []);
                }
            } catch (err) {
                console.error("Failed to load report data:", err);
                if (isMounted) setError("Could not load report data.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();
        return () => {
            isMounted = false;
        };
    }, []);

    function handleExport() {
        if (!stats) return;

        const rows = [
            ["Metric", "Value"],
            ["Total Jobs", stats.total_jobs],
            ["Companies", stats.companies],
            ["Locations", stats.locations],
            [],
            ["Top Companies", "Jobs"],
            ...(stats.top_companies || []).map((c) => [c.company, c.jobs]),
            [],
            ["Top Skills", "Count"],
            ...skills.map((s) => [s.skill, s.count]),
            [],
            ["Source", "Jobs"],
            ...(stats.sources || []).map((s) => [s.source, s.jobs]),
        ];

        downloadCsv(
            `job-market-report-${new Date().toISOString().slice(0, 10)}.csv`,
            toCsv(rows)
        );
    }

    return (
        <AppLayout>
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p className="text-blue-400 text-sm font-semibold mb-2">
                        REPORTS
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                        <FaFileAlt /> Market Summary Report
                    </h1>
                    <p className="text-gray-400 mt-3">
                        A snapshot of current hiring data, exportable for presentations.
                    </p>
                </div>

                <button
                    onClick={handleExport}
                    disabled={!stats}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                    <FaDownload /> Export CSV
                </button>
            </div>

            {loading && <p className="text-gray-400">Loading report...</p>}

            {!loading && error && (
                <div className="bg-[#111827] border border-red-900/50 rounded-2xl p-6 text-red-400">
                    {error}
                </div>
            )}

            {!loading && !error && stats && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-5">
                            <p className="text-gray-400 text-sm">Total Jobs</p>
                            <h3 className="text-2xl md:text-3xl font-bold mt-2">{stats.total_jobs}</h3>
                        </div>
                        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-5">
                            <p className="text-gray-400 text-sm">Companies</p>
                            <h3 className="text-2xl md:text-3xl font-bold mt-2">{stats.companies}</h3>
                        </div>
                        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-5 col-span-2 lg:col-span-1">
                            <p className="text-gray-400 text-sm">Locations</p>
                            <h3 className="text-2xl md:text-3xl font-bold mt-2">{stats.locations}</h3>
                        </div>
                    </div>

                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-6">
                        <h2 className="text-lg font-semibold mb-4">Top Companies</h2>
                        <div className="space-y-2">
                            {(stats.top_companies || []).map((c) => (
                                <div
                                    key={c.company}
                                    className="flex justify-between border-b border-gray-800 pb-2 gap-2"
                                >
                                    <span className="truncate">{c.company}</span>
                                    <span className="text-blue-400 shrink-0">{c.jobs} jobs</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-6">
                        <h2 className="text-lg font-semibold mb-4">Top Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((s) => (
                                <span
                                    key={s.skill}
                                    className="bg-blue-500/10 text-blue-400 text-sm px-3 py-1 rounded-lg"
                                >
                                    {s.skill} · {s.count}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}