import { useEffect, useState } from "react";
import { getCountries, getStates, getCities } from "../../services/api";

export default function GlobeCard() {
    const [level, setLevel] = useState("countries");
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [items, setItems] = useState([]);

    useEffect(() => {
        loadCountries();
    }, []);

    async function loadCountries() {
        const data = await getCountries();
        setItems(data);
        setLevel("countries");
        setSelectedCountry(null);
        setSelectedState(null);
    }

    async function loadStates(country) {
        const data = await getStates(country);
        setItems(data);
        setLevel("states");
        setSelectedCountry(country);
        setSelectedState(null);
    }

    async function loadCities(state) {
        const data = await getCities(selectedCountry, state);
        setItems(data);
        setLevel("cities");
        setSelectedState(state);
    }

    const title =
        level === "countries"
            ? "Global Job Locations"
            : level === "states"
                ? `${selectedCountry} Hiring Map`
                : `${selectedState} Job Cities`;

    return (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between mb-5">
                <div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Drill down from country → state → city.
                    </p>
                </div>

                {level !== "countries" && (
                    <button
                        onClick={
                            level === "cities"
                                ? () => loadStates(selectedCountry)
                                : loadCountries
                        }
                        className="bg-[#0B1020] border border-gray-700 px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white"
                    >
                        Back
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 h-[420px] rounded-2xl border border-gray-800 bg-[#020617] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e3a8a_0%,#020617_65%)]" />

                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px]" />

                    <div className="absolute top-5 left-5 z-20">
                        <p className="text-xs text-gray-500 uppercase tracking-widest">
                            {level === "countries"
                                ? "Global View"
                                : level === "states"
                                    ? selectedCountry
                                    : selectedState}
                        </p>

                        <h3 className="text-2xl font-bold mt-1">
                            {items[0]?.jobs?.toLocaleString() || 0} jobs
                        </h3>
                    </div>



                    <div className="absolute inset-0 flex items-center justify-center z-10">
                    {level === "states" && selectedCountry === "India" ? (
                        <div className="w-[80%] grid grid-cols-3 gap-4">
                        {items.slice(0, 9).map((item) => (
                            <button
                            key={item.state}
                            onClick={() => loadCities(item.state)}
                            className="relative bg-[#0B1020]/90 border border-blue-500/30 hover:border-cyan-400 rounded-2xl p-5 text-left transition hover:scale-[1.03]"
                            >
                            <div className="absolute right-4 top-4 w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
                            <p className="text-white font-semibold">{item.state}</p>
                            <p className="text-blue-300 text-sm mt-2">
                                {item.jobs.toLocaleString()} jobs
                            </p>
                            </button>
                        ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 w-[72%]">
                        {items.slice(0, 8).map((item) => {
                            const name = item.country || item.state || item.city;

                            return (
                            <button
                                key={name}
                                onClick={() => {
                                if (level === "countries") loadStates(name);
                                if (level === "states") loadCities(name);
                                }}
                                className="bg-[#0B1020]/90 border border-blue-500/30 hover:border-blue-400 rounded-xl p-4 text-left transition hover:scale-[1.02]"
                            >
                                <p className="text-white font-semibold">{name}</p>
                                <p className="text-blue-300 text-sm mt-1">
                                {item.jobs.toLocaleString()} jobs
                                </p>
                            </button>
                            );
                        })}
                        </div>
                    )}
                    </div>
                </div>

                <div className="bg-[#0B1020] border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold mb-4">
                        {level === "countries"
                            ? "Top Countries"
                            : level === "states"
                                ? "Top States"
                                : "Top Cities"}
                    </h3>

                    <div className="space-y-4">
                        {items.slice(0, 10).map((item) => {
                            const name = item.country || item.state || item.city;

                            return (
                                <div
                                    key={name}
                                    className="flex justify-between border-b border-gray-800 pb-3"
                                >
                                    <span className="text-gray-300">{name}</span>
                                    <span className="text-blue-400 font-semibold">
                                        {item.jobs.toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}