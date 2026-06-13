import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader />
      <AdminSidebar />

      <main className="pt-16 pl-64 min-h-screen">
        <div className="p-6 max-w-screen-2xl">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;