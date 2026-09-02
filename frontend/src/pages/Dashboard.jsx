import { useEffect, useState, useCallback } from "react";
import {
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaDatabase,
} from "react-icons/fa";
import {
  BarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import AppLayout from "../components/layout/AppLayout";
import MapDashboard from "../components/dashboard/MapDashboard";
import { getStats, getRecentJobs, getTopSkills } from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [skills, setSkills] = useState([]);

  const loadDashboard = useCallback(async () => {
    try {
      const statsData = await getStats();
      const jobsData = await getRecentJobs();
      const skillsData = await getTopSkills();

      setStats(statsData);
      setRecentJobs(jobsData.jobs || []);
      setSkills(skillsData || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (!stats) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B1020] text-white text-xl">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <AppLayout onRefresh={loadDashboard}>
      <div className="mb-8">
        <p className="text-blue-400 text-sm font-semibold mb-2">
          JOB MARKET INTELLIGENCE
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">
          Global Hiring Intelligence Dashboard
        </h1>
        <p className="text-gray-400 mt-3">
          Track scraped jobs, company hiring trends, skills demand, and scraper health.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        <StatCard icon={<FaBriefcase />} title="Total Jobs" value={stats.total_jobs} />
        <StatCard icon={<FaBuilding />} title="Companies" value={stats.companies} />
        <StatCard icon={<FaMapMarkerAlt />} title="Locations" value={stats.locations} />
        <StatCard icon={<FaDatabase />} title="Scraper Health" value="5/5 Active" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <MapDashboard />
        </div>
        <Panel title="AI Insights">
          <div className="space-y-4 text-sm">
            <Insight text="Python demand increased this week." />
            <Insight text="Bengaluru has the highest job openings." />
            <Insight text="Backend and AI roles are trending." />
            <Insight text="Wipro posted the most jobs." />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Panel title="Jobs by Company">
          <Chart data={stats.top_companies || []} xKey="company" yKey="jobs" />
        </Panel>

        <Panel title="Top Skills in Demand">
          <Chart data={skills} xKey="skill" yKey="count" />
        </Panel>

        <Panel title="Jobs by Source">
          {stats.sources?.map((source) => (
            <Activity
              key={source.source}
              company={source.source}
              status={`${source.jobs} jobs`}
            />
          ))}
        </Panel>
      </div>

      <Panel title="Recent Jobs">
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-[#0B1020] text-gray-400">
              <tr>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Company</th>
                <th className="text-left p-4">Location</th>
                <th className="text-left p-4">Source</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.job_id} className="border-t border-gray-800 text-gray-300">
                  <td className="p-4 text-white">{job.job_title}</td>
                  <td className="p-4">{job.company}</td>
                  <td className="p-4">{job.location}</td>
                  <td className="p-4">{job.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppLayout>
  );
}

function Chart({ data, xKey, yKey }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey={xKey} stroke="#9CA3AF" />
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
          <RechartsBar dataKey={yKey} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-5 hover:border-blue-500/40 transition">
      <div className="text-blue-400 text-xl mb-3 md:mb-4">{icon}</div>
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-xl md:text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-5">{title}</h2>
      {children}
    </div>
  );
}

function Insight({ text }) {
  return (
    <div className="bg-[#0B1020] border border-gray-800 rounded-xl p-4 text-gray-300">
      {text}
    </div>
  );
}

function Activity({ company, status }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-3">
      <p className="text-white">{company}</p>
      <p className="text-green-400 text-sm">{status}</p>
    </div>
  );
}

export default Dashboard;