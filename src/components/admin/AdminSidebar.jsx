import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

function Chevron({ open }) {
  return (
    <span className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`}>
      ⌄
    </span>
  );
}

function AdminSidebar({ hidden }) {
  const location = useLocation();

  const [usersOpen, setUsersOpen] = useState(
    location.pathname.startsWith("/admin/users")
  );

  const [reportsOpen, setReportsOpen] = useState(
    location.pathname.startsWith("/admin/reports")
  );

  if (hidden) return null;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
      isActive
        ? "bg-[#173f9f] text-white"
        : "text-gray-700 hover:bg-blue-50 hover:text-[#173f9f]"
    }`;

  const subLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive
        ? "bg-[#173f9f] text-white"
        : "text-gray-600 hover:bg-blue-50 hover:text-[#173f9f]"
    }`;

  const groupButtonClass =
    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#173f9f] transition";

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r shadow-sm p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
        Navigation
      </p>

      <nav className="space-y-2">
        <NavLink to="/admin" end className={linkClass}>
          <span className="flex items-center justify-center w-5 h-5 shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </span>
          <span>Dashboard</span>
        </NavLink>

        <div>
          <button
            type="button"
            onClick={() => setUsersOpen((prev) => !prev)}
            className={groupButtonClass}
          >
            <span className="flex items-center justify-center w-5 h-5 shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>

            <span>Users</span>
            <Chevron open={usersOpen} />
          </button>

          {usersOpen && (
            <div className="ml-6 mt-2 pl-3 border-l border-gray-200 space-y-1">
              <NavLink to="/admin/users/new" className={subLinkClass}>
                Add User
              </NavLink>
              <NavLink to="/admin/users" end className={subLinkClass}>
                User List
              </NavLink>
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setReportsOpen((prev) => !prev)}
            className={groupButtonClass}
          >
            <span className="flex items-center justify-center w-5 h-5 shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>

            <span>Reports</span>
            <Chevron open={reportsOpen} />
          </button>

          {reportsOpen && (
            <div className="ml-6 mt-2 pl-3 border-l border-gray-200 space-y-1">
              <NavLink to="/admin/reports/users" className={subLinkClass}>
                User Wise Reports
              </NavLink>
              <NavLink to="/admin/reports/monthly" className={subLinkClass}>
                Monthly Reports
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <div className="absolute bottom-4 left-4 right-4 border-t pt-4">
        <p className="text-xs text-gray-500">● System Online</p>
        <p className="text-xs text-gray-400 mt-1">GeminiCBT v1.0 · Local</p>
      </div>
    </aside>
  );
}

export default AdminSidebar;