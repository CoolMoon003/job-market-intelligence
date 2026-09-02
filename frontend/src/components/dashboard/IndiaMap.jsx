import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { getStates } from "../../services/api";

const stateCoords = {
    Karnataka: [15.3173, 75.7139],
    "Tamil Nadu": [11.1271, 78.6569],
    Maharashtra: [19.7515, 75.7139],
    Telangana: [18.1124, 79.0193],
    Kerala: [10.8505, 76.2711],
    Delhi: [28.7041, 77.1025],
    Gujarat: [22.2587, 71.1924],
    Haryana: [29.0588, 76.0856],
    Punjab: [31.1471, 75.3412],
    Odisha: [20.9517, 85.0985],
    "Uttar Pradesh": [26.8467, 80.9462],
    "West Bengal": [22.9868, 87.8550],
};

export default function IndiaMap({
    country,
    onBack,
    onStateClick,
}) {
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

                // "Unknown" isn't a real state - don't show it as a marker.
                const filtered = list.filter(
                    (s) => s && s.state && s.state !== "Unknown"
                );

                if (isMounted) setStates(filtered);
            } catch (err) {
                console.error("Failed to load states:", err);
                if (isMounted) {
                    setError("Could not load state data.");
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

    return (
        <>
            <div className="flex justify-between mb-5">
                <div>
                    <h2 className="text-2xl font-bold">🇮🇳 {country}</h2>
                    <p className="text-gray-400">
                        Click a state.
                    </p>
                </div>

                <button
                    onClick={onBack}
                    className="bg-blue-600 px-4 py-2 rounded-lg"
                >
                    Back
                </button>
            </div>

            {loading && (
                <p className="text-gray-400 mb-4">Loading states...</p>
            )}

            {!loading && error && (
                <div className="bg-[#0B1020] border border-red-900/50 rounded-xl p-4 mb-4 text-red-400">
                    {error}
                </div>
            )}

            <MapContainer
                center={[22.5, 79]}
                zoom={5}
                className="h-[500px] rounded-2xl"
            >
                <TileLayer
                    attribution="OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {states.map((state) => {
                    const coord = stateCoords[state.state];

                    if (!coord) return null;

                    return (
                        <CircleMarker
                            key={state.state}
                            center={coord}
                            radius={10}
                            pathOptions={{
                                color: "#22c55e",
                                fillColor: "#22c55e",
                                fillOpacity: 0.8,
                            }}
                            eventHandlers={{
                                click: () => onStateClick(state.state),
                            }}
                        >
                            <Popup>
                                <b>{state.state}</b>
                                <br />
                                {(state.jobs ?? 0).toLocaleString()} Jobs
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </>
    );
}