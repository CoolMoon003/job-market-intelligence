import { Link, useLocation } from "react-router-dom";
import {
  FaChartLine,
  FaBriefcase,
  FaBuilding,
  FaChartBar,
  FaFileUpload,
  FaDatabase,
  FaFileAlt,
  FaRobot,
  FaCog,
  FaTimes
} from "react-icons/fa";

// All items now have real pages behind them.
const menu = [
  { icon: <FaChartLine />, title: "Dashboard", path: "/dashboard" },
  { icon: <FaFileUpload />, title: "Resume Analysis", path: "/resume" },
  { icon: <FaRobot />, title: "Scraper Controls", path: "/admin" },
  { icon: <FaBriefcase />, title: "Jobs", path: "/jobs" },
  { icon: <FaBuilding />, title: "Companies", path: "/companies" },
  { icon: <FaChartBar />, title: "Analytics", path: "/analytics" },
  { icon: <FaDatabase />, title: "Sources", path: "/sources" },
  { icon: <FaFileAlt />, title: "Reports", path: "/reports" },
  { icon: <FaCog />, title: "Settings", path: "/settings" }
];

export default function Sidebar({ open = false, onClose = () => { } }) {
  const location = useLocation();

  return (
    <>
      {/* Backdrop - mobile only, shown while the drawer is open */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50
          w-64 h-screen bg-[#0D1117] border-r border-gray-800 flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="p-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Job<span className="text-blue-500">Intel</span>
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              Market Intelligence Platform
            </p>
          </div>

          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white text-xl mt-1"
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 mt-6 overflow-y-auto">

          {menu.map((item, index) => {
            const isActive = item.path && location.pathname === item.path;

            const content = (
              <>
                <div className="text-lg">
                  {item.icon}
                </div>
                <span>{item.title}</span>
              </>
            );

            const className = `w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 ${isActive
                ? "bg-[#151B23] text-white border-r-2 border-blue-500"
                : "text-gray-400 hover:bg-[#151B23] hover:text-white"
              }`;

            if (item.path) {
              return (
                <Link key={index} to={item.path} className={className} onClick={onClose}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={index} className={className}>
                {content}
              </button>
            );
          })}

        </div>

        <div className="p-6 border-t border-gray-800">

          <div className="rounded-xl bg-[#151B23] p-4">

            <p className="text-white font-semibold">
              Database
            </p>

            <p className="text-green-400 text-sm mt-2">
              ● Connected
            </p>

          </div>

        </div>

      </aside>
    </>
  );
}