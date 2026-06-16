import { useNavigate } from "react-router-dom";

function AdminHeader() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("gemini_admin_user");
    navigate("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-[#163B6D] flex items-center justify-between px-6 shadow">
      <div className="flex items-center gap-3 ml-10">
        <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-white font-bold text-sm">
          G
        </div>

        <div className="flex flex-col">
          <span className="text-white  font-semibold text-base leading-tight tracking-tight">
            GeminiCBT
          </span>
          <span className="text-blue-200 text-xs leading-tight">
            Admin Panel
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold">
            SA
          </div>

          <div className="flex flex-col">
            <span className="text-white text-sm font-medium leading-tight">
              System Administrator
            </span>
            <span className="text-blue-200 text-xs leading-tight">
              Admin
            </span>
          </div>
        </div>

        <div className="w-px h-8 bg-white/20" />

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;