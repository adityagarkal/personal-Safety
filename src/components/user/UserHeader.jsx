import { LogOut, Menu, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UserHeader({ user, sidebarOpen, onToggleSidebar }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("gemini_login_user");
    navigate("/");
  }

  return (
    <header className="bg-[#163B6D] text-white shadow-sm">
      <div className="flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 hover:bg-white/10"
            title={sidebarOpen ? "Close menu" : "Open menu"}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              gemini<span className="text-orange-400">CBT</span>
            </h1>
            <p className="text-sm text-blue-100">
              Computer Based Training System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="font-semibold">{user?.fullName || "Crew Member"}</p>
              <p className="text-sm text-blue-100">
                {user?.rank || "Rank not assigned"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
              <UserCircle className="h-7 w-7" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default UserHeader;
