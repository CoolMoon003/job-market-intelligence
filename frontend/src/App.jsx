import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import Dashboard from "./pages/Dashboard";
import JobDetails from "./pages/JobDetails";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import AdminScrapers from "./pages/AdminScrapers";
import Jobs from "./pages/Jobs";
import Companies from "./pages/Companies";
import Analytics from "./pages/Analytics";
import Sources from "./pages/Sources";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/job/:jobId" element={<JobDetails />} />
        <Route path="/resume" element={<ResumeAnalysis />} />
        <Route path="/admin" element={<AdminScrapers />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <VercelAnalytics />
    </BrowserRouter>
  );
}

export default App;