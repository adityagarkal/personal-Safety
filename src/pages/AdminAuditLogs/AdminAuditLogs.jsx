import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuditLogsFromDatabase } from "../../services/databaseService";

function AdminAuditLogs() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        setError("");
        const data = await getAuditLogsFromDatabase();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Audit Logs Error:", err);
        setError("Unable to load audit logs from SQLite.");
      }
    }

    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return logs;

    return logs.filter((log) =>
      [
        log.user_id,
        log.action,
        log.performed_by,
        log.previous_value,
        log.new_value,
        log.performed_at,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [logs, search]);

  function formatDate(value) {
    if (!value) return "-";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  }

  function formatValue(value) {
    if (!value) return "-";

    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(value);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Audit Logs</h1>
            <p className="text-gray-600 mt-2">
              Complete system activity history for login, user creation,
              training assignment, CBT completion, assessment, and certificates.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-5 py-3 rounded bg-gray-300"
          >
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Total Logs</p>
            <h2 className="text-3xl font-bold">{logs.length}</h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">User Logins</p>
            <h2 className="text-3xl font-bold text-blue-700">
              {logs.filter((log) => log.action === "USER_LOGIN").length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">CBT Completed</p>
            <h2 className="text-3xl font-bold text-green-700">
              {logs.filter((log) => log.action === "CBT_COMPLETED").length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Training Assigned</p>
            <h2 className="text-3xl font-bold text-yellow-700">
              {
                logs.filter((log) => log.action === "TRAINING_ASSIGNED")
                  .length
              }
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by action, user id, performed by, or values..."
            className="w-full border rounded-lg p-3"
          />
        </div>

        {error && (
          <div className="mb-5 rounded bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3">Date / Time</th>
                <th className="border p-3">User ID</th>
                <th className="border p-3">Action</th>
                <th className="border p-3">Performed By</th>
                <th className="border p-3">Previous Value</th>
                <th className="border p-3">New Value</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td className="border p-4 text-center" colSpan="6">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="border p-3 whitespace-nowrap">
                      {formatDate(log.performed_at)}
                    </td>

                    <td className="border p-3 text-center">
                      {log.user_id || "-"}
                    </td>

                    <td className="border p-3 font-semibold">
                      {log.action || "-"}
                    </td>

                    <td className="border p-3">
                      {log.performed_by || "-"}
                    </td>

                    <td className="border p-3 text-xs whitespace-pre-wrap max-w-sm">
                      {formatValue(log.previous_value)}
                    </td>

                    <td className="border p-3 text-xs whitespace-pre-wrap max-w-sm">
                      {formatValue(log.new_value)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminAuditLogs;