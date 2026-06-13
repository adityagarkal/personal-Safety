import { NavLink } from "react-router-dom";

function AdminSidebar() {
  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-[#173f9f] text-white"
        : "text-gray-700 hover:bg-blue-50 hover:text-[#173f9f]"
    }`;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r shadow-sm p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
        Navigation
      </p>

      <nav className="space-y-2">
        <NavLink to="/admin" end className={linkClass}>
          Dashboard
        </NavLink>

        <div className="pt-4">
          <p className="px-4 mb-2 text-xs font-bold uppercase text-gray-400">
            Users
          </p>
          <NavLink to="/admin/users/new" className={linkClass}>
            Add User
          </NavLink>
          <NavLink to="/admin/users" end className={linkClass}>
            User List
          </NavLink>
        </div>

        <div className="pt-4">
          <p className="px-4 mb-2 text-xs font-bold uppercase text-gray-400">
            Reports
          </p>
          <NavLink to="/admin/reports/users" className={linkClass}>
            User Wise Reports
          </NavLink>
          <NavLink to="/admin/reports/monthly" className={linkClass}>
            Monthly Reports
          </NavLink>
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