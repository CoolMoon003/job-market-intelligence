import { useState } from "react";
import { FaRobot } from "react-icons/fa";
import AppLayout from "../components/layout/AppLayout";
import ScraperCard from "../components/admin/ScraperCard";
import { runAllScrapers } from "../services/api";

// Must match backend/scraper/scraper_manager.py admin endpoints exactly.
// Note: Amazon is capitalized on the backend (/admin/update-jobs/Amazon).
const SCRAPERS = [
    { label: "Wipro", endpoint: "wipro" },
    { label: "Infosys", endpoint: "infosys" },
    { label: "Accenture", endpoint: "accenture" },
    { label: "Microsoft", endpoint: "microsoft" },
    { label: "BNY", endpoint: "bny" },
    { label: "Amazon", endpoint: "Amazon" },
    { label: "Flipkart", endpoint: "flipkart" },
];

export default function AdminScrapers() {
    const [runningAll, setRunningAll] = useState(false);
    const [allResult, setAllResult] = useState(null);
    const [allError, setAllError] = useState(null);

    async function handleRunAll() {
        setRunningAll(true);
        setAllError(null);
        setAllResult(null);

        try {
            const data = await runAllScrapers();
            setAllResult(data);
        } catch (err) {
            console.error("Run all scrapers failed:", err);
            setAllError("Failed to run all scrapers. Check the backend logs.");
        } finally {
            setRunningAll(false);
        }
    }

    return (
        <AppLayout>
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p className="text-blue-400 text-sm font-semibold mb-2">
                        ADMIN
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                        <FaRobot /> Scraper Controls
                    </h1>
                    <p className="text-gray-400 mt-3">
                        Trigger individual scrapers or run all of them to refresh the job database.
                    </p>
                </div>

                <button
                    onClick={handleRunAll}
                    disabled={runningAll}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition px-6 py-3 rounded-lg font-semibold whitespace-nowrap"
                >
                    {runningAll ? "Running All Scrapers..." : "Run All Scrapers"}
                </button>
            </div>

            {allError && (
                <div className="bg-[#111827] border border-red-900/50 rounded-2xl p-6 text-red-400 mb-8">
                    {allError}
                </div>
            )}

            {allResult && !allError && (
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">
                        Last "Run All" Result
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {(allResult.results || []).map((r, idx) => (
                            <div
                                key={idx}
                                className="bg-[#0B1020] border border-gray-800 rounded-xl p-4 flex justify-between items-center flex-wrap gap-2"
                            >
                                <span className="text-white font-medium">
                                    {r.source}
                                </span>
                                <span className="text-gray-400 text-sm">
                                    {r.inserted} inserted · {r.deleted_old ?? 0} removed · {r.skipped} skipped
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-5">Individual Scrapers</h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SCRAPERS.map((scraper) => (
                        <ScraperCard
                            key={scraper.endpoint}
                            label={scraper.label}
                            endpoint={scraper.endpoint}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}