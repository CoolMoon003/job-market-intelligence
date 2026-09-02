import { FaMoon, FaSun, FaServer, FaCode } from "react-icons/fa";
import AppLayout from "../components/layout/AppLayout";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
    const { theme, toggleTheme } = useTheme();

    return (
        <AppLayout>
            <div className="max-w-3xl">
                <div className="mb-8">
                    <p className="text-blue-400 text-sm font-semibold mb-2">
                        SETTINGS
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
                    <p className="text-gray-400 mt-3">
                        Preferences and system information for this deployment.
                    </p>
                </div>

                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Appearance</h2>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0B1020] border border-gray-800 rounded-xl p-5">
                        <div>
                            <p className="text-white font-medium">Theme</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Currently using {theme === "dark" ? "dark" : "light"} mode.
                            </p>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg flex items-center gap-2 shrink-0"
                        >
                            {theme === "dark" ? <FaSun /> : <FaMoon />}
                            Switch to {theme === "dark" ? "Light" : "Dark"}
                        </button>
                    </div>
                </div>

                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-6">
                    <h2 className="text-lg font-semibold mb-4">System Information</h2>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-[#0B1020] border border-gray-800 rounded-xl p-4">
                            <FaServer className="text-blue-400 shrink-0" />
                            <div>
                                <p className="text-white text-sm font-medium">Backend API</p>
                                <p className="text-gray-400 text-xs">http://127.0.0.1:8000</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-[#0B1020] border border-gray-800 rounded-xl p-4">
                            <FaCode className="text-blue-400 shrink-0" />
                            <div>
                                <p className="text-white text-sm font-medium">Stack</p>
                                <p className="text-gray-400 text-xs">
                                    FastAPI + MySQL backend · React 19 + Vite frontend
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-500 text-xs mt-4">
                        User accounts and authentication aren't part of this project's
                        scope, so there's no login/profile management here.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}