export default function RoadmapModal({ job, loading, error, roadmap, onClose }) {
    if (!job) return null;

    const steps = Array.isArray(roadmap) ? roadmap : [];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Roadmap for {job.job_title}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">{job.company}</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-xl leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {loading && (
                    <p className="text-gray-400">Building your roadmap...</p>
                )}

                {!loading && error && (
                    <p className="text-red-400">{error}</p>
                )}

                {!loading && !error && steps.length === 0 && (
                    <p className="text-gray-400">
                        No roadmap steps available — you already match this job's key skills.
                    </p>
                )}

                {!loading && !error && steps.length > 0 && (
                    <div className="space-y-4">
                        {steps.map((item, idx) => (
                            <div
                                key={item.skill || idx}
                                className="bg-[#0B1020] border border-gray-800 rounded-xl p-4"
                            >
                                <h3 className="text-blue-400 font-semibold mb-2">
                                    {item.skill}
                                </h3>
                                <ul className="space-y-1">
                                    {(item.plan || []).map((step, stepIdx) => (
                                        <li
                                            key={stepIdx}
                                            className="text-gray-300 text-sm flex gap-2"
                                        >
                                            <span className="text-gray-600">{stepIdx + 1}.</span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="mt-6 bg-[#0B1020] border border-gray-800 hover:border-gray-600 transition px-5 py-2 rounded-lg text-gray-300"
                >
                    Close
                </button>
            </div>
        </div>
    );
}