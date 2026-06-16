import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getUserWiseReportsFromDatabase } from "../../services/databaseService";
import { useNavigate } from "react-router-dom";

function ProgressBar({ value, total }) {
  const percentage = total ? Math.round((Number(value) / Number(total)) * 100) : 0;

  const color =
    percentage >= 80
      ? "bg-green-500"
      : percentage >= 50
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <div className="w-40 h-2 bg-gray-200 rounded-full">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

function getName(user) {
  if (user.first_name || user.last_name) {
    return `${user.first_name || ""} ${user.last_name || ""}`.trim();
  }

  return user.full_name || "-";
}

function AdminRecords() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        setError("");
        const data = await getUserWiseReportsFromDatabase();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("User Wise Reports Error:", err);
        setError("Unable to load user wise reports from SQLite.");
      }
    }

    loadReports();
  }, []);

  const ranks = useMemo(() => {
    return [...new Set(reports.map((item) => item.rank).filter(Boolean))];
  }, [reports]);

  const filteredUsers = reports.filter((user) => {
    const status = user.status || "Active";

    const text = `${user.crew_id || ""} ${getName(user)} ${
      user.rank || ""
    } ${status}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());
    const matchesRank = rankFilter ? user.rank === rankFilter : true;
    const matchesStatus = statusFilter ? status === statusFilter : true;

    return matchesSearch && matchesRank && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Wise Reports</h1>
        <p className="text-gray-500 mt-1">
          Training completion overview for all crew members
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-5 mb-6 flex items-center justify-between gap-4">
        <div className="flex gap-4">
          <div className="relative w-80">
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search by name, ID, or rank..."
    className="w-full border rounded-lg px-4 py-3 pr-10"
  />

  {search && (
    <button
      type="button"
      onClick={() => setSearch("")}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
    >
      ✕
    </button>
  )}
</div>

          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="w-52 border rounded-lg px-4 py-3"
          >
            <option value="">All Ranks</option>
            {ranks.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-52 border rounded-lg px-4 py-3"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <p className="text-gray-500">{filteredUsers.length} crew members</p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm uppercase text-gray-500">
              <th className="px-5 py-4 border-b">Crew ID</th>
              <th className="px-5 py-4 border-b">Name</th>
              <th className="px-5 py-4 border-b">Rank</th>
              <th className="px-5 py-4 border-b">Status</th>
              <th className="px-5 py-4 border-b">Mandatory Completed</th>
              <th className="px-5 py-4 border-b">Recommended Completed</th>
              <th className="px-5 py-4 border-b">Total CBTs</th>
              <th className="px-5 py-4 border-b text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-5 py-8 text-center text-gray-500">
                  No report records found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const status = user.status || "Active";
                const mandatoryDone = Number(user.mandatory_completed || 0);
                const mandatoryTotal = Number(user.mandatory_total || 0);
                const recommendedDone = Number(user.recommended_completed || 0);
                const recommendedTotal = Number(user.recommended_total || 0);
                const total = Number(user.total_cbts || 0);

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-5 py-5 border-b text-blue-700 font-semibold">
                      {user.crew_id || "-"}
                    </td>

                    <td className="px-5 py-5 border-b font-semibold">
                      {getName(user)}
                    </td>

                    <td className="px-5 py-5 border-b text-gray-600">
                      {user.rank || "-"}
                    </td>

                    <td className="px-5 py-5 border-b">
                      <span
                        className={`px-3 py-1 rounded-full border text-sm font-semibold ${
                          status === "Active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        ● {status}
                      </span>
                    </td>

                    <td className="px-5 py-5 border-b">
                      <div className="flex items-center gap-4">
                        <strong>
                          {mandatoryDone}/{mandatoryTotal}
                        </strong>
                        <ProgressBar value={mandatoryDone} total={mandatoryTotal} />
                      </div>
                    </td>

                    <td className="px-5 py-5 border-b">
                      <div className="flex items-center gap-4">
                        <strong>
                          {recommendedDone}/{recommendedTotal}
                        </strong>
                        <ProgressBar
                          value={recommendedDone}
                          total={recommendedTotal}
                        />
                      </div>
                    </td>

                    <td className="px-5 py-5 border-b font-bold">{total}</td>

                    <td className="px-5 py-5 border-b text-right">
                      <button
                          type="button"
                          onClick={() => {
                            console.log("VIEW DETAILS CLICKED", user.user_id || user.id);
                            navigate(`/admin/users/${user.user_id || user.id}/profile`);
                          }}
                          className="px-5 py-3 rounded-lg bg-[#2554C7] text-white font-semibold cursor-pointer"
                        >
                          View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default AdminRecords;