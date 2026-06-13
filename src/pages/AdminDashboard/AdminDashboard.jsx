import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";

const stats = [
  ["Total Users", "85", "Registered crew members", "bg-blue-50 text-blue-700"],
  ["Active Users", "82", "Currently on active duty", "bg-green-50 text-green-700"],
  ["Archived Users", "3", "Departed or off-signed crew", "bg-gray-100 text-gray-700"],
  ["CBTs Completed This Month", "127", "June completions", "bg-yellow-50 text-yellow-700"],
];

const recent = [
  ["Ramos, Eduardo", "Chief Officer", "Personal Safety", "Mandatory", "13 Jun 2026, 09:14", "C-1044"],
  ["Petrov, Nikolai", "AB Seaman", "Fire Safety", "Mandatory", "13 Jun 2026, 08:52", "C-1031"],
  ["Dela Cruz, Mark", "2nd Engineer", "BRM", "Recommended", "12 Jun 2026, 16:30", "C-1018"],
  ["Santos, Arjun", "Bosun", "Enclosed Space Entry", "Mandatory", "12 Jun 2026, 14:11", "C-1027"],
];

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Training management overview · Gemini CBT
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {stats.map(([label, value, subtext, color]) => (
          <div key={label} className="bg-white rounded-xl border shadow-sm p-5">
            <div className={`w-10 h-10 rounded-lg mb-4 flex items-center justify-center ${color}`}>
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
          <p className="text-xs text-gray-500 mb-4">Common administrative tasks</p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/users/new")}
              className="w-full text-left border rounded-lg p-4 hover:bg-blue-50"
            >
              <p className="font-semibold">Add New Crew Member</p>
              <p className="text-sm text-gray-500">
                Register a new crew member and assign training
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
              Today: 12 completions
            </span>
          </div>

          <div className="divide-y">
            {recent.map(([name, rank, course, type, date, crewId]) => (
              <div key={`${crewId}-${course}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${type === "Mandatory" ? "bg-blue-600" : "bg-green-600"}`} />

                <div className="w-40">
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-gray-500">{rank}</p>
                </div>

                <div className="flex-1">
                  <p className="text-sm">{course}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    type === "Mandatory"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-green-50 text-green-700"
                  }`}>
                    {type}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">{date}</p>
                  <p className="text-xs text-gray-500">{crewId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;