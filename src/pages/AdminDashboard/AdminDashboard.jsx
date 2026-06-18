import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminDashboardStatsFromDatabase } from "../../services/databaseService";

function getName(item) {
  if (item.first_name || item.last_name) {
    return `${item.last_name || ""}, ${item.first_name || ""}`
      .replace(/^, /, "")
      .trim();
  }

  return item.full_name || "-";
}

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    activeUsers: 0,
    archivedUsers: 0,
    completedThisMonth: 0,
    todayCompletions: 0,
    recentCompletions: [],
  });

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");
        const data = await getAdminDashboardStatsFromDatabase();

        setDashboard({
          totalUsers: data?.totalUsers || 0,
          activeUsers: data?.activeUsers || 0,
          archivedUsers: data?.archivedUsers || 0,
          completedThisMonth: data?.completedThisMonth || 0,
          todayCompletions: data?.todayCompletions || 0,
          recentCompletions: Array.isArray(data?.recentCompletions)
            ? data.recentCompletions
            : [],
        });
      } catch (err) {
        console.error("Admin Dashboard Error:", err);
        setError("Unable to load dashboard statistics from SQLite.");
      }
    }

    loadDashboard();
  }, []);

  const stats = [
    {
      id: "stat-total-users",
      label: "Total Users",
      value: dashboard.totalUsers,
      subtext: "Registered crew members",
      iconBg: "#EFF6FF",
      iconColor: "#2554C7",
      borderAccent: "#2554C7",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "stat-active-users",
      label: "Active Users",
      value: dashboard.activeUsers,
      subtext: "Currently active crew",
      iconBg: "#F0FDF4",
      iconColor: "#15803D",
      borderAccent: "#22C55E",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: "stat-archived-users",
      label: "Archived Users",
      value: dashboard.archivedUsers,
      subtext: "Archived crew accounts",
      iconBg: "#F9FAFB",
      iconColor: "#6B7280",
      borderAccent: "#9CA3AF",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      ),
    },
    {
      id: "stat-cbts-this-month",
      label: "CBTs Completed This Month",
      value: dashboard.completedThisMonth,
      subtext: "Current month completions",
      iconBg: "#FFFBEB",
      iconColor: "#B45309",
      borderAccent: "#F59E0B",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
  ];

  const actions = [
    {
      label: "Add New Crew Member",
      description: "Register a new crew member and assign training",
      path: "/admin/users/new",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      ),
    },
    {
      label: "View Crew List",
      description: "Browse and manage all registered crew members",
      path: "/admin/users",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Training Reports",
      description: "View user-wise and monthly training summaries",
      path: "/admin/reports/users",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Training management overview · Gemini CBT
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-xl border shadow-sm p-5"
            style={{ borderTop: `3px solid ${stat.borderAccent}` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: stat.iconBg,
                  color: stat.iconColor,
                }}
              >
                {stat.icon}
              </div>
            </div>

            <p className="text-3xl font-bold leading-none mb-2 text-gray-900">
              {stat.value}
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {stat.label}
            </p>
            <p className="text-xs text-gray-500">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-xs text-gray-500 mt-1">
              Common administrative tasks
            </p>
          </div>

          <div className="space-y-2">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 rounded-lg border p-3 text-left transition hover:bg-blue-50 hover:border-blue-200"
              >
                <span className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 bg-gray-100 text-[#2554C7]">
                  {action.icon}
                </span>

                <span className="flex flex-col flex-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {action.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {action.description}
                  </span>
                </span>

                <svg
                  className="flex-shrink-0 text-gray-400"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent CBT Completions
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Latest training activity across all crew
              </p>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Today: {dashboard.todayCompletions} completions
            </span>
          </div>

          <div className="divide-y">
            {dashboard.recentCompletions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400"
    >
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
    </svg>
  </div>

  <p className="text-lg font-semibold text-gray-800">
    No CBT completions found yet.
  </p>

  <p className="text-sm text-gray-500 mt-2">
    Completions will appear here once crew members finish training.
  </p>
</div>
            ) : (
              dashboard.recentCompletions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-3 transition hover:bg-gray-50"
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      item.status === "PASS" ? "bg-blue-700" : "bg-red-600"
                    }`}
                  />

                  <div className="w-32 flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {getName(item)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.rank || "-"}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {item.module_name || "-"}
                    </p>

                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        item.status === "PASS"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {item.status || "-"}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">
                      {formatDate(item.completion_date)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.crew_id || "-"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-5 py-3 border-t flex items-center justify-between bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {dashboard.recentCompletions.length} of{" "}
              {dashboard.completedThisMonth} completions this month
            </p>

            <button
              onClick={() => navigate("/admin/reports/users")}
              className="text-xs font-semibold text-[#2554C7] hover:text-[#173f9f]"
            >
              View all reports →
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;