import {
  Award,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  Home,
  UserCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function UserSidebar({ open, user, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!open) return null;

  return (
    <aside className="min-h-[calc(100vh-80px)] w-72 border-r border-[#DDE3EA] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#DDE3EA] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">Crew Menu</p>
          <h2 className="text-lg font-bold text-[#163B6D]">Navigation</h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE3EA] text-[#163B6D] hover:bg-[#F5F7FA]"
          title="Close menu"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-[#DDE3EA] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#163B6D] text-white">
            <UserCircle className="h-7 w-7" />
          </div>

          <div>
            <p className="font-semibold text-[#163B6D]">
              {user?.fullName || "Crew Member"}
            </p>
            <p className="text-sm text-gray-500">{user?.rank || "Rank"}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2 p-4">
        <SidebarButton
          icon={<Home className="h-5 w-5" />}
          label="Dashboard"
          active={location.pathname === "/dashboard"}
          onClick={() => navigate("/dashboard")}
        />

        <SidebarButton
          icon={<BookOpen className="h-5 w-5" />}
          label="Courses"
          active={location.pathname === "/user/courses"}
          onClick={() => navigate("/user/courses")}
        />

        <SidebarButton
          icon={<CheckCircle className="h-5 w-5" />}
          label="Completed Courses"
          active={location.pathname === "/user/completed-courses"}
          onClick={() => navigate("/user/completed-courses")}
        />

        <SidebarButton
          icon={<Award className="h-5 w-5" />}
          label="View Certificates"
          active={location.pathname === "/user/certificates"}
          onClick={() => navigate("/user/certificates")}
        />
      </nav>
    </aside>
  );
}

function SidebarButton({ icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? "bg-[#163B6D] text-white"
          : "text-[#163B6D] hover:bg-[#F5F7FA]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default UserSidebar;
