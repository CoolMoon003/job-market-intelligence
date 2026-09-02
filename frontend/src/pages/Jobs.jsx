import { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import AppLayout from "../components/layout/AppLayout";
import JobListTable from "../components/jobs/JobListTable";
import CountryPicker from "../components/jobs/CountryPicker";
import StatePicker from "../components/jobs/StatePicker";
import { getJobsByLocation } from "../services/api";

export default function Jobs() {
    const [country, setCountry] = useState(null);
    const [state, setState] = useState(null);

    function reset() {
        setCountry(null);
        setState(null);
    }

    return (
        <AppLayout>
            <div className="mb-6">
                <p className="text-blue-400 text-sm font-semibold mb-2">
                    JOB LISTINGS
                </p>
                <h1 className="text-3xl md:text-4xl font-bold">Browse All Jobs</h1>
                <p className="text-gray-400 mt-3">
                    Every job in the database, organized by country and state.
                </p>
            </div>

            <div className="flex items-center gap-2 text-sm mb-6 text-gray-400 flex-wrap">
                <button
                    onClick={reset}
                    className={country ? "hover:text-white" : "text-white font-semibold"}
                >
                    All Countries
                </button>

                {country && (
                    <>
                        <FaChevronRight className="text-xs" />
                        <button
                            onClick={() => setState(null)}
                            className={state ? "hover:text-white" : "text-white font-semibold"}
                        >
                            {country}
                        </button>
                    </>
                )}

                {state && (
                    <>
                        <FaChevronRight className="text-xs" />
                        <span className="text-white font-semibold">{state}</span>
                    </>
                )}
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-6">
                {!country && <CountryPicker onSelect={setCountry} />}

                {country === "India" && !state && (
                    <StatePicker country={country} onSelect={setState} />
                )}

                {country && (country !== "India" || state) && (
                    <JobListTable
                        fetchJobs={(page, size) =>
                            getJobsByLocation(country, state, page, size)
                        }
                        deps={[country, state]}
                    />
                )}
            </div>
        </AppLayout>
    );
}