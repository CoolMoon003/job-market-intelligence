import { useEffect, useState } from "react";
import { getCities, getCitiesByCountry } from "../../services/api";

export default function CityPanel({ country, state, onBack }) {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                // BUG FIX: previous code used `const data = await getCities(...)`
                // inside the `if (state)` branch, which shadowed the outer `data`
                // variable instead of assigning to it. That left `cities` set to
                // `undefined`, and `cities.map(...)` below crashed the whole app
                // (the white-screen bug on India state clicks like Delhi).
                let data;

                if (state) {
                    data = await getCities(country, state);
                } else {
                    data = await getCitiesByCountry(country);
                }

                if (isMounted) {
                    setCities(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to load cities:", err);
                if (isMounted) {
                    setError("Could not load city data. Please try again.");
                    setCities([]);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();

        return () => {
            isMounted = false;
        };
    }, [country, state]);

    const heading = state || country;

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">📍 {heading}</h2>
                    <p className="text-gray-400">Cities with available jobs</p>
                </div>

                <button
                    onClick={onBack}
                    className="bg-blue-600 px-4 py-2 rounded-lg"
                >
                    Back
                </button>
            </div>

            {loading && (
                <p className="text-gray-400">Loading cities...</p>
            )}

            {!loading && error && (
                <div className="bg-[#0B1020] border border-red-900/50 rounded-xl p-6 text-red-400">
                    {error}
                </div>
            )}

            {!loading && !error && cities.length === 0 && (
                <div className="bg-[#0B1020] border border-gray-800 rounded-xl p-6 text-center text-gray-400">
                    No city-level data available for {heading}.
                </div>
            )}

            {!loading && !error && cities.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                    {cities.map((city) => (
                        <div
                            key={city.city}
                            className="bg-[#0B1020] border border-gray-800 rounded-xl p-5"
                        >
                            <h3 className="text-lg font-semibold">
                                {city.city}
                            </h3>

                            <p className="text-blue-400 mt-2">
                                {(city.jobs ?? 0).toLocaleString()} Jobs
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}