import { useEffect, useState } from "react";
import { getStates } from "../../services/api";

export default function StatePicker({ country, onSelect }) {
    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const data = await getStates(country);
                const list = Array.isArray(data) ? data : [];
                if (isMounted) {
                    setStates(list.filter((s) => s && s.state && s.state !== "Unknown"));
                }
            } catch (err) {
                console.error("Failed to load states:", err);
                if (isMounted) {
                    setError("Could not load states.");
                    setStates([]);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();
        return () => {
            isMounted = false;
        };
    }, [country]);

    if (loading) return <p className="text-gray-400">Loading states...</p>;
    if (error) return <p className="text-red-400">{error}</p>;

    if (states.length === 0) {
        return (
            <div className="bg-[#0B1020] border border-gray-800 rounded-xl p-6 text-center text-gray-400">
                No state-level data available for {country}.
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-3 gap-4">
            {states.map((s) => (
                <button
                    key={s.state}
                    onClick={() => onSelect(s.state)}
                    className="bg-[#0B1020] border border-gray-800 rounded-xl p-5 text-left hover:border-blue-500/50 transition"
                >
                    <h3 className="text-lg font-semibold text-white">{s.state}</h3>
                    <p className="text-blue-400 mt-2">
                        {(s.jobs ?? 0).toLocaleString()} Jobs
                    </p>
                </button>
            ))}
        </div>
    );
}