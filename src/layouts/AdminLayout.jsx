import { useState } from "react";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout({ children }) {
  const [sidebarHidden, setSidebarHidden] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader />

      <button
        type="button"
        onClick={() => setSidebarHidden((prev) => !prev)}
        className="fixed top-5 left-4 z-50 h-9 w-9 rounded-lg bg-white/15 text-white border border-white/20 hover:bg-white/25 transition"
        title={sidebarHidden ? "Show sidebar" : "Hide sidebar"}
      >
        ☰
      </button>

      <AdminSidebar hidden={sidebarHidden} />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarHidden ? "pl-0" : "pl-64"
        }`}
      >
        <div className="p-6 max-w-screen-2xl">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;