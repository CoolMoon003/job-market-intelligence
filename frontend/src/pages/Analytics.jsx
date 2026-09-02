import { useEffect, useState } from "react";
import {
    BarChart,
    Bar as RechartsBar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import AppLayout from "../components/layout/AppLayout";
import { getStats, getTopSkills, getCompanyDistribution } from "../services/api";

function Chart({ data, xKey, yKey, height = 320 }) {
    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey={xKey} stroke="#9CA3AF" interval={0} angle={-30} textAnchor="end" height={70} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#111827",
                            border: "1px solid #374151",
                            borderRadius: "10px",
                            color: "#ffffff",
                        }}
                        labelStyle={{ color: "#ffffff" }}
                        itemStyle={{ color: "#ffffff" }}
                    />
                    <RechartsBar dataKey={yKey} radius={[8, 8, 0, 0]} fill="#3B82F6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function Panel({ title, children }) {
    return (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-5">{title}</h2>
            {children}
        </div>
    );
}

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [skills, setSkills] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const [statsData, skillsData, companyData] = await Promise.all([
                    getStats(),
                    getTopSkills(),
                    getCompanyDistribution(),
                ]);

                if (isMounted) {
                    setStats(statsData);
                    setSkills(Array.isArray(skillsData) ? skillsData : []);
                    setCompanies(Array.isArray(companyData) ? companyData : []);
                }
            } catch (err) {
                console.error("Failed to load analytics:", err);
                if (isMounted) setError("Could not load analytics data.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-blue-400 text-sm font-semibold mb-2">
                    ANALYTICS
                </p>
                <h1 className="text-3xl md:text-4xl font-bold">Market Analytics</h1>
                <p className="text-gray-400 mt-3">
                    A deeper look at hiring trends, skills demand, and source volume.
                </p>
            </div>

            {loading && <p className="text-gray-400">Loading analytics...</p>}

            {!loading && error && (
                <div className="bg-[#111827] border border-red-900/50 rounded-2xl p-6 text-red-400">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-6">
                    <Panel title="Top Skills in Demand">
                        <Chart data={skills} xKey="skill" yKey="count" height={360} />
                    </Panel>

                    <Panel title="Jobs by Company (Top 15)">
                        <Chart
                            data={companies.slice(0, 15)}
                            xKey="company"
                            yKey="jobs"
                            height={400}
                        />
                    </Panel>

                    <Panel title="Jobs by Source">
                        <Chart data={stats?.sources || []} xKey="source" yKey="jobs" height={320} />
                    </Panel>
                </div>
            )}
        </AppLayout>
    );
}