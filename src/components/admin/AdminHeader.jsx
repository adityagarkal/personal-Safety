import { useNavigate } from "react-router-dom";

function AdminHeader() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("gemini_admin_user");
    navigate("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-[#173f9f] flex items-center justify-between px-6 shadow">
      <div className="flex items-center gap-3 ml-14">
        <div className="w-9 h-9 rounded bg-white/15 flex items-center justify-center text-white font-bold">
          G
        </div>
        <div>
          <h1 className="text-white font-semibold leading-tight">GeminiCBT</h1>
          <p className="text-blue-200 text-xs">Admin Panel</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-white text-sm font-medium">System Administrator</p>
          <p className="text-blue-200 text-xs">Admin</p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded bg-white/15 text-white text-sm hover:bg-white/25"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;