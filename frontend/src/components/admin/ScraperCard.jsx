import { useState } from "react";
import { FaPlay } from "react-icons/fa";
import { runScraperUpdate } from "../../services/api";

export default function ScraperCard({ label, endpoint }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    async function handleRun() {
        setLoading(true);
        setResult(null);

        try {
            const data = await runScraperUpdate(endpoint);
            setResult(data);
        } catch (err) {
            // Network-level failure (backend unreachable, etc). The backend
            // itself now catches scraper errors internally and always returns
            // a valid 0/0/0 shape, so this only fires for true connection issues.
            console.error(`Scraper failed (${endpoint}):`, err);
            setResult({ scraped: 0, inserted: 0, skipped: 0, error: "unreachable" });
        } finally {
            setLoading(false);
        }
    }

    const failed = Boolean(result?.error);

    return (
        <div className="bg-[#0B1020] border border-gray-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">{label}</h3>
                <button
                    onClick={handleRun}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <FaPlay className="text-xs" />
                    {loading ? "Running..." : "Run"}
                </button>
            </div>

            {result && (
                <>
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-[#111827] rounded-lg p-2">
                            <p className="text-lg font-bold text-blue-400">
                                {result.scraped ?? 0}
                            </p>
                            <p className="text-xs text-gray-500">Scraped</p>
                        </div>
                        <div className="bg-[#111827] rounded-lg p-2">
                            <p className="text-lg font-bold text-red-400">
                                {result.deleted_old ?? 0}
                            </p>
                            <p className="text-xs text-gray-500">Removed</p>
                        </div>
                        <div className="bg-[#111827] rounded-lg p-2">
                            <p className="text-lg font-bold text-green-400">
                                {result.inserted ?? 0}
                            </p>
                            <p className="text-xs text-gray-500">Inserted</p>
                        </div>
                        <div className="bg-[#111827] rounded-lg p-2">
                            <p className="text-lg font-bold text-gray-400">
                                {result.skipped ?? 0}
                            </p>
                            <p className="text-xs text-gray-500">Skipped</p>
                        </div>
                    </div>

                    {failed && (
                        <p className="text-gray-500 text-xs mt-3">
                            Source unavailable right now — try again later.
                        </p>
                    )}
                </>
            )}

            {!result && !loading && (
                <p className="text-gray-500 text-sm">Not run yet this session.</p>
            )}
        </div>
    );
}