import { useState } from "react";
import { FaFileUpload } from "react-icons/fa";

const ALLOWED_EXTENSIONS = ["pdf", "docx"];

export default function ResumeUploadForm({ onSubmit, loading }) {
    const [file, setFile] = useState(null);
    const [targetRoles, setTargetRoles] = useState("");
    const [fileError, setFileError] = useState(null);

    function handleFileChange(e) {
        const selected = e.target.files?.[0] || null;
        setFileError(null);

        if (!selected) {
            setFile(null);
            return;
        }

        const ext = selected.name.split(".").pop().toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setFile(null);
            setFileError("Only PDF and DOCX files are supported.");
            return;
        }

        setFile(selected);
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!file) {
            setFileError("Please choose a resume file first.");
            return;
        }

        onSubmit(file, targetRoles);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-[#111827] border border-gray-800 rounded-2xl p-6"
        >
            <div className="flex items-center gap-3 mb-5">
                <FaFileUpload className="text-blue-400 text-xl" />
                <h2 className="text-xl font-semibold">Upload your resume</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Resume file (PDF or DOCX)
                    </label>
                    <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-300 bg-[#0B1020] border border-gray-800 rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-sm hover:file:bg-blue-700"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Target roles (optional, comma-separated)
                    </label>
                    <input
                        type="text"
                        value={targetRoles}
                        onChange={(e) => setTargetRoles(e.target.value)}
                        placeholder="e.g. Data Analyst, Backend Developer"
                        className="w-full bg-[#0B1020] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {file && !fileError && (
                <p className="text-sm text-gray-400 mb-4">
                    Selected: <span className="text-white">{file.name}</span>
                </p>
            )}

            {fileError && (
                <p className="text-sm text-red-400 mb-4">{fileError}</p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition px-6 py-3 rounded-lg font-semibold"
            >
                {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
        </form>
    );
}