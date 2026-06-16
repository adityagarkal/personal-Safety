import { useState } from "react";
import UserHeader from "./UserHeader";
import UserSidebar from "./UserSidebar";

function getLoggedInUser() {
  try {
    const storedUser = localStorage.getItem("gemini_login_user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function UserLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = getLoggedInUser();

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <UserHeader
        user={user}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex">
        <UserSidebar
          open={sidebarOpen}
          user={user}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}

export default UserLayout;
