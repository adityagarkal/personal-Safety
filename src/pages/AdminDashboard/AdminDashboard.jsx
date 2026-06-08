import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("gemini_admin_user");
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage crew profiles, login access, CBT assignments, completion
              records, audit logs, and monthly office reports.
            </p>
          </div>

          <button
            onClick={logout}
            className="px-5 py-3 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/admin-users")}
            className="bg-white rounded-xl shadow p-8 text-left hover:bg-blue-50 transition"
          >
            <h2 className="text-2xl font-bold mb-3">
              Crew & Login Management
            </h2>
            <p className="text-gray-600">
              Create crew profiles, vessel details, usernames, passwords,
              account status, and CBT assignments.
            </p>
          </button>

          <button
            onClick={() => navigate("/admin-records")}
            className="bg-white rounded-xl shadow p-8 text-left hover:bg-green-50 transition"
          >
            <h2 className="text-2xl font-bold mb-3">
              CBT Completion Records
            </h2>
            <p className="text-gray-600">
              View read-only CBT completion records, scores, status,
              certificates, and module versions.
            </p>
          </button>

          <button
            onClick={() => navigate("/admin-audit-logs")}
            className="bg-white rounded-xl shadow p-8 text-left hover:bg-yellow-50 transition"
          >
            <h2 className="text-2xl font-bold mb-3">Audit Logs</h2>
            <p className="text-gray-600">
              Review user logins, training assignments, CBT completion events,
              certificate generation, and system activity.
            </p>
          </button>

          <button
            onClick={() => navigate("/admin-monthly-report")}
            className="bg-white rounded-xl shadow p-8 text-left hover:bg-purple-50 transition"
          >
            <h2 className="text-2xl font-bold mb-3">Monthly Report</h2>
            <p className="text-gray-600">
              Prepare month-wise CBT completion records for office submission.
              Future step: encrypted export.
            </p>
          </button>

          <div className="bg-white rounded-xl shadow p-8 text-left border-l-4 border-red-500">
            <h2 className="text-2xl font-bold mb-3">
              Completion Record Security
            </h2>
            <p className="text-gray-600">
              Completed CBT records are locked and read-only. Admin cannot edit
              scores, completion dates, answers, certificates, or completion
              status.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-8 text-left border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold mb-3">
              Module Version Control
            </h2>
            <p className="text-gray-600">
              CBT completion records retain their module version. Future module
              revisions will create new assignments without changing historical
              records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;