import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

function Chevron({ open }) {
  return (
    <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
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
    `block px-4 py-3 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-[#173f9f] text-white"
        : "text-gray-700 hover:bg-blue-50 hover:text-[#173f9f]"
    }`;

  const groupButtonClass =
    "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#173f9f] transition";

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r shadow-sm p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
        Navigation
      </p>

      <nav className="space-y-2">
        <NavLink to="/admin" end className={linkClass}>
          Dashboard
        </NavLink>

        <div>
          <button
            type="button"
            onClick={() => setUsersOpen((prev) => !prev)}
            className={groupButtonClass}
          >
            <span>Users</span>
            <Chevron open={usersOpen} />
          </button>

          {usersOpen && (
            <div className="ml-4 mt-2 pl-3 border-l space-y-1">
              <NavLink to="/admin/users/new" className={linkClass}>
                Add User
              </NavLink>
              <NavLink to="/admin/users" end className={linkClass}>
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
            <span>Reports</span>
            <Chevron open={reportsOpen} />
          </button>

          {reportsOpen && (
            <div className="ml-4 mt-2 pl-3 border-l space-y-1">
              <NavLink to="/admin/reports/users" className={linkClass}>
                User Wise Reports
              </NavLink>
              <NavLink to="/admin/reports/monthly" className={linkClass}>
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