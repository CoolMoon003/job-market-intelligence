import { useState } from "react";
import WorldMap from "./WorldMap";
import IndiaMap from "./IndiaMap";
import CityPanel from "./CityPanel";

export default function MapDashboard() {
    const [country, setCountry] = useState(null);
    const [state, setState] = useState(null);

    return (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">

            {!country && (
                <WorldMap
                    onCountryClick={(name) => {
                        setCountry(name);
                        setState(null);
                    }}
                />
            )}

            {country === "India" && !state && (
                <IndiaMap
                    country={country}
                    onBack={() => {
                        setCountry(null);
                        setState(null);
                    }}
                    onStateClick={(name) => {
                        setState(name);
                    }}
                />
            )}

            {country === "India" && state && (
                <CityPanel
                    country={country}
                    state={state}
                    onBack={() => setState(null)}
                />
            )}

            {country && country !== "India" && (
                <CityPanel
                    country={country}
                    state={null}
                    onBack={() => {
                        setCountry(null);
                        setState(null);
                    }}
                />
            )}

        </div>
    );
}