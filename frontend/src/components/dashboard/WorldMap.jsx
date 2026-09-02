import { useEffect, useState } from "react";
import { getCountries } from "../../services/api";

// Just a nice-to-have visual touch - not required for the map logic.
const countryFlags = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Singapore: "🇸🇬",
  Japan: "🇯🇵",
  Canada: "🇨🇦",
};

export default function WorldMap({ onCountryClick }) {
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
        if (isMounted) {
          setCountries(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load countries:", err);
        if (isMounted) {
          setError("Could not load country data.");
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

  // "Other" is not a real country - hide it from the UI.
  // (Backend also filters this out now, but this stays as a safety net.)
  const visibleCountries = countries.filter(
    (c) => c && c.country && c.country !== "Other"
  );

  return (
    <>
      <h2 className="text-2xl font-bold mb-2">
        🌍 Global Hiring
      </h2>

      <p className="text-gray-400 mb-6">
        Select a country
      </p>

      {loading && (
        <p className="text-gray-400">Loading countries...</p>
      )}

      {!loading && error && (
        <div className="bg-[#0B1020] border border-red-900/50 rounded-xl p-6 text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && visibleCountries.length === 0 && (
        <div className="bg-[#0B1020] border border-gray-800 rounded-xl p-6 text-center text-gray-400">
          No country-level data available.
        </div>
      )}

      {!loading && !error && visibleCountries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {visibleCountries.map((country) => (
            <button
              key={country.country}
              onClick={() => onCountryClick(country.country)}
              className="bg-[#0B1020] border border-gray-800 rounded-xl p-5 text-left hover:border-blue-500/50 transition"
            >
              <div className="text-3xl mb-3">
                {countryFlags[country.country] || "📍"}
              </div>

              <h3 className="text-lg font-semibold">
                {country.country}
              </h3>

              <p className="text-blue-400 mt-2">
                {(country.jobs ?? 0).toLocaleString()} Jobs
              </p>
            </button>
          ))}
        </div>
      )}
    </>
  );
}