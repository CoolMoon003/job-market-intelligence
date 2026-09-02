import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaMoon, FaSun, FaSearch, FaSyncAlt, FaBars } from "react-icons/fa";
import { searchJobs, getRecentJobs } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutside();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

export default function TopNavbar({ onRefresh, onMenuClick }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Search
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  useClickOutside(searchRef, () => setSearchOpen(false));

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchJobs(query.trim());
        setSearchResults(Array.isArray(data?.jobs) ? data.jobs : []);
        setSearchOpen(true);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  function goToJob(jobId) {
    setSearchOpen(false);
    setQuery("");
    navigate(`/job/${jobId}`);
  }

  // Notifications (real data: most recently added jobs)
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifJobs, setNotifJobs] = useState([]);
  const [notifLoaded, setNotifLoaded] = useState(false);
  const notifRef = useRef(null);
  useClickOutside(notifRef, () => setNotifOpen(false));

  async function toggleNotifications() {
    const opening = !notifOpen;
    setNotifOpen(opening);

    if (opening && !notifLoaded) {
      setNotifLoading(true);
      try {
        const data = await getRecentJobs();
        setNotifJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        setNotifLoaded(true);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setNotifJobs([]);
      } finally {
        setNotifLoading(false);
      }
    }
  }

  // Refresh
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        window.location.reload();
      }
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <header className="h-auto md:h-20 bg-[#0B1020] border-b border-gray-800 px-4 md:px-8 py-3 md:py-0 flex items-center justify-between gap-3 relative flex-wrap md:flex-nowrap">
      <button
        onClick={onMenuClick}
        className="md:hidden bg-[#111827] border border-gray-800 text-gray-300 p-3 rounded-xl hover:text-white shrink-0"
        aria-label="Open menu"
      >
        <FaBars />
      </button>

      <div
        ref={searchRef}
        className="relative flex items-center gap-3 bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 flex-1 min-w-[140px] md:w-[420px] md:flex-none order-3 md:order-none w-full"
      >
        <FaSearch className="text-gray-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setSearchOpen(true)}
          placeholder="Search jobs, companies, skills..."
          className="bg-transparent outline-none text-white placeholder-gray-500 w-full min-w-0"
        />

        {searchOpen && (
          <div className="absolute top-full left-0 mt-2 w-full bg-[#111827] border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
            {searching && (
              <p className="text-gray-400 text-sm p-4">Searching...</p>
            )}

            {!searching && searchResults.length === 0 && (
              <p className="text-gray-400 text-sm p-4">
                No jobs found for "{query}".
              </p>
            )}

            {!searching &&
              searchResults.map((job) => (
                <button
                  key={job.job_id}
                  onClick={() => goToJob(job.job_id)}
                  className="w-full text-left px-4 py-3 hover:bg-[#0B1020] transition border-b border-gray-800 last:border-b-0"
                >
                  <p className="text-white text-sm font-medium">
                    {job.job_title}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {job.company} {job.location ? `· ${job.location}` : ""}
                  </p>
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh"
          className="bg-[#111827] border border-gray-800 text-gray-300 p-3 rounded-xl hover:text-white disabled:opacity-50"
        >
          <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
        </button>

        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="bg-[#111827] border border-gray-800 text-gray-300 p-3 rounded-xl hover:text-white"
        >
          {theme === "dark" ? <FaMoon /> : <FaSun />}
        </button>

        <div ref={notifRef} className="relative">
          <button
            onClick={toggleNotifications}
            title="Notifications"
            className="bg-[#111827] border border-gray-800 text-gray-300 p-3 rounded-xl hover:text-white"
          >
            <FaBell />
          </button>

          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-[#111827] border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-white text-sm font-semibold">
                  Recent activity
                </p>
              </div>

              {notifLoading && (
                <p className="text-gray-400 text-sm p-4">Loading...</p>
              )}

              {!notifLoading && notifJobs.length === 0 && (
                <p className="text-gray-400 text-sm p-4">
                  No recent activity.
                </p>
              )}

              {!notifLoading &&
                notifJobs.map((job) => (
                  <button
                    key={job.job_id}
                    onClick={() => {
                      setNotifOpen(false);
                      navigate(`/job/${job.job_id}`);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-[#0B1020] transition border-b border-gray-800 last:border-b-0"
                  >
                    <p className="text-white text-sm">
                      New job posted: {job.job_title}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {job.company}
                    </p>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3 bg-[#111827] border border-gray-800 rounded-xl px-4 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shrink-0" />
          <div>
            <p className="text-white text-sm font-semibold">Admin</p>
            <p className="text-gray-500 text-xs">System Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}