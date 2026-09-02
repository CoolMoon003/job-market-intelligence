import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import ResumeUploadForm from "../components/resume/ResumeUploadForm";
import JobMatchList from "../components/resume/JobMatchList";
import RoadmapModal from "../components/resume/RoadmapModal";
import { analyzeCareer, getJobAnalysis } from "../services/api";

const TABS = [
    { key: "ready", label: "Ready to Apply" },
    { key: "improve", label: "Apply with Improvements" },
    { key: "not_ready", label: "Not Ready Yet" },
];

export default function ResumeAnalysis() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState("ready");

    const [roadmapJob, setRoadmapJob] = useState(null);
    const [roadmapLoading, setRoadmapLoading] = useState(false);
    const [roadmapError, setRoadmapError] = useState(null);
    const [roadmapSteps, setRoadmapSteps] = useState([]);

    async function handleAnalyze(file, targetRoles) {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await analyzeCareer(file, targetRoles);

            if (data?.error) {
                setError(data.error);
                return;
            }

            setResult(data);
            setActiveTab("ready");
        } catch (err) {
            console.error("Resume analysis failed:", err);
            setError("Something went wrong analyzing your resume. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleViewRoadmap(job) {
        setRoadmapJob(job);
        setRoadmapLoading(true);
        setRoadmapError(null);
        setRoadmapSteps([]);

        try {
            const detectedSkills = result?.detected_skills || [];
            const data = await getJobAnalysis(job.job_id, detectedSkills);

            if (data?.error) {
                setRoadmapError(data.error);
                return;
            }

            setRoadmapSteps(Array.isArray(data.roadmap) ? data.roadmap : []);
        } catch (err) {
            console.error("Failed to load roadmap:", err);
            setRoadmapError("Could not load the roadmap for this job.");
        } finally {
            setRoadmapLoading(false);
        }
    }

    function closeRoadmap() {
        setRoadmapJob(null);
        setRoadmapSteps([]);
        setRoadmapError(null);
    }

    const readyJobs = result?.ready_to_apply_jobs || [];
    const improveJobs = result?.apply_with_improvements_jobs || [];
    const notReadyJobs = result?.not_ready_yet_jobs || [];

    const tabJobs = {
        ready: readyJobs,
        improve: improveJobs,
        not_ready: notReadyJobs,
    };

    const tabCounts = {
        ready: result?.ready_to_apply_count ?? readyJobs.length,
        improve: result?.apply_with_improvements_count ?? improveJobs.length,
        not_ready: result?.not_ready_yet_count ?? notReadyJobs.length,
    };

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-blue-400 text-sm font-semibold mb-2">
                    RESUME INTELLIGENCE
                </p>
                <h1 className="text-3xl md:text-4xl font-bold">Resume &amp; Job Matching</h1>
                <p className="text-gray-400 mt-3">
                    Upload your resume to see how well it matches current job listings,
                    what skills you're missing, and how to close the gap.
                </p>
            </div>

            <div className="mb-8">
                <ResumeUploadForm onSubmit={handleAnalyze} loading={loading} />
            </div>

            {error && (
                <div className="bg-[#111827] border border-red-900/50 rounded-2xl p-6 text-red-400 mb-8">
                    {error}
                </div>
            )}

            {result && (
                <>
                    {result.detected_skills?.length > 0 && (
                        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 mb-8">
                            <h2 className="text-lg font-semibold mb-4">
                                Skills detected in your resume
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {result.detected_skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="bg-blue-500/10 text-blue-400 text-sm px-3 py-1 rounded-lg"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
                        <div className="flex flex-wrap gap-3 mb-6">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.key
                                            ? "bg-blue-600 text-white"
                                            : "bg-[#0B1020] border border-gray-800 text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {tab.label} ({tabCounts[tab.key]})
                                </button>
                            ))}
                        </div>

                        <JobMatchList
                            jobs={tabJobs[activeTab]}
                            onViewRoadmap={handleViewRoadmap}
                            emptyMessage="No jobs in this category yet."
                        />
                    </div>
                </>
            )}

            <RoadmapModal
                job={roadmapJob}
                loading={roadmapLoading}
                error={roadmapError}
                roadmap={roadmapSteps}
                onClose={closeRoadmap}
            />
        </AppLayout>
    );
}