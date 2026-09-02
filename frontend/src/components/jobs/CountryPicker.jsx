import { useEffect, useState } from "react";
import { getCountries } from "../../services/api";

export default function CountryPicker({ onSelect }) {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const data = await getCountries();
                if (isMounted) setCountries(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load countries:", err);
                if (isMounted) {
                    setError("Could not load countries.");
                    setCountries([]);
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

    if (loading) return <p className="text-gray-400">Loading countries...</p>;
    if (error) return <p className="text-red-400">{error}</p>;

    if (countries.length === 0) {
        return (
            <div className="bg-[#0B1020] border border-gray-800 rounded-xl p-6 text-center text-gray-400">
                No country-level data available.
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-3 gap-4">
            {countries.map((c) => (
                <button
                    key={c.country}
                    onClick={() => onSelect(c.country)}
                    className="bg-[#0B1020] border border-gray-800 rounded-xl p-5 text-left hover:border-blue-500/50 transition"
                >
                    <h3 className="text-lg font-semibold text-white">{c.country}</h3>
                    <p className="text-blue-400 mt-2">
                        {(c.jobs ?? 0).toLocaleString()} Jobs
                    </p>
                </button>
            ))}
        </div>
    );
}