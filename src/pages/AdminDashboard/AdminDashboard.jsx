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
    [
      "Total Users",
      dashboard.totalUsers,
      "Registered crew members",
      "bg-blue-50 text-blue-700",
    ],
    [
      "Active Users",
      dashboard.activeUsers,
      "Currently active crew",
      "bg-green-50 text-green-700",
    ],
    [
      "Archived Users",
      dashboard.archivedUsers,
      "Archived crew accounts",
      "bg-gray-100 text-gray-700",
    ],
    [
      "CBTs Completed This Month",
      dashboard.completedThisMonth,
      "Current month completions",
      "bg-yellow-50 text-yellow-700",
    ],
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {stats.map(([label, value, subtext, color]) => (
          <div key={label} className="bg-white rounded-xl border shadow-sm p-5">
            <div
              className={`w-10 h-10 rounded-lg mb-4 flex items-center justify-center ${color}`}
            >
              ●
            </div>
            <h2 className="text-3xl font-bold">{value}</h2>
            <p className="font-semibold mt-1">{label}</p>
            <p className="text-sm text-gray-500 mt-1">{subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="text-xl font-bold mb-1">Quick Actions</h2>
          <p className="text-xs text-gray-500 mb-4">
            Common administrative tasks
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/users/new")}
              className="w-full text-left border rounded-lg p-4 hover:bg-blue-50"
            >
              <p className="font-semibold">Add New Crew Member</p>
              <p className="text-sm text-gray-500">
                Register a new crew member and configure access
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/users")}
              className="w-full text-left border rounded-lg p-4 hover:bg-blue-50"
            >
              <p className="font-semibold">View Crew List</p>
              <p className="text-sm text-gray-500">
                Browse and manage all registered crew members
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/reports/users")}
              className="w-full text-left border rounded-lg p-4 hover:bg-blue-50"
            >
              <p className="font-semibold">Training Reports</p>
              <p className="text-sm text-gray-500">
                View user-wise and monthly training summaries
              </p>
            </button>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-xl border shadow-sm">
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <div>
              <h2 className="text-xl font-bold">Recent CBT Completions</h2>
              <p className="text-xs text-gray-500">
                Latest training activity across crew
              </p>
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Today: {dashboard.todayCompletions} completions
            </span>
          </div>

          <div className="divide-y">
            {dashboard.recentCompletions.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500">
                No CBT completions found yet.
              </div>
            ) : (
              dashboard.recentCompletions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.status === "PASS" ? "bg-green-600" : "bg-red-600"
                    }`}
                  />

                  <div className="w-40">
                    <p className="text-sm font-semibold">{getName(item)}</p>
                    <p className="text-xs text-gray-500">{item.rank || "-"}</p>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm">{item.module_name || "-"}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        item.status === "PASS"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {item.status || "-"}
                    </span>
                  </div>

                  <div className="text-right">
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
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;