import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getUserWiseReportsFromDatabase } from "../../services/databaseService";
import { useNavigate } from "react-router-dom";

function CompletionBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  const barColor = isComplete
    ? "#22C55E"
    : pct >= 60
    ? "#F59E0B"
    : "#EF4444";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm font-semibold tabular-nums ${
          isComplete ? "text-green-700" : "text-gray-900"
        }`}
        style={{ minWidth: 42 }}
      >
        {completed}/{total}
      </span>

      <div
        className="flex-1 h-1.5 rounded-full bg-gray-200"
        style={{ minWidth: 70 }}
      >
        <div
          className="h-1.5 rounded-full transition-all"
          style={{
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}

function getName(user) {
  if (user.first_name || user.last_name) {
    return `${user.first_name || ""} ${user.last_name || ""}`.trim();
  }

  return user.full_name || "-";
}

function getStatusStyle(status) {
  if (status === "Archived") {
    return "bg-gray-100 text-gray-700 border border-gray-200";
  }

  if (status === "Inactive") {
    return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  }

  return "bg-green-50 text-green-700 border border-green-200";
}

function AdminRecords() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("All Ranks");
  const [statusFilter, setStatusFilter] = useState("All Status");
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

  const filteredUsers = useMemo(() => {
    return reports.filter((user) => {
      const status = user.status || "Active";

      const text = `${user.crew_id || ""} ${getName(user)} ${
        user.rank || ""
      } ${status}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesRank =
        rankFilter === "All Ranks" ? true : user.rank === rankFilter;
      const matchesStatus =
        statusFilter === "All Status" ? true : status === statusFilter;

      return matchesSearch && matchesRank && matchesStatus;
    });
  }, [reports, search, rankFilter, statusFilter]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Wise Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Training completion overview for all crew members
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm mb-4 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, ID, or rank..."
            className="w-72 border rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none focus:border-blue-400"
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
          onChange={(event) => setRankFilter(event.target.value)}
          className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
        >
          <option value="All Ranks">All Ranks</option>
          {ranks.map((rank) => (
            <option key={rank} value={rank}>
              {rank}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
        >
          <option value="All Status">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Archived">Archived</option>
        </select>

        <div className="ml-auto">
          <span className="text-sm text-gray-500">
            {filteredUsers.length} crew member
            {filteredUsers.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 border-b font-semibold">Crew ID</th>
              <th className="px-4 py-3 border-b font-semibold">Name</th>
              <th className="px-4 py-3 border-b font-semibold">Rank</th>
              <th className="px-4 py-3 border-b font-semibold">Status</th>
              <th className="px-4 py-3 border-b font-semibold">
                Mandatory Completed
              </th>
              <th className="px-4 py-3 border-b font-semibold">
                Recommended Completed
              </th>
              <th className="px-4 py-3 border-b font-semibold">Total CBTs</th>
              <th className="px-4 py-3 border-b font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-16 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-300"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>

                    <span className="text-sm">
                      No crew members match your filters
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const status = user.status || "Active";

                const mandatoryDone = Number(user.mandatory_completed || 0);
                const mandatoryTotal = Number(user.mandatory_total || 0);
                const recommendedDone = Number(user.recommended_completed || 0);
                const recommendedTotal = Number(user.recommended_total || 0);

                const total =
                  Number(user.total_cbts || 0) ||
                  mandatoryDone + recommendedDone;

                return (
                  <tr key={user.id || user.crew_id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 border-b">
                      <span className="font-mono text-sm font-semibold text-blue-700">
                        {user.crew_id || "-"}
                      </span>
                    </td>

                    <td className="px-4 py-3 border-b">
                      <span className="text-sm font-semibold text-gray-900">
                        {getName(user)}
                      </span>
                    </td>

                    <td className="px-4 py-3 border-b">
                      <span className="text-sm text-gray-500">
                        {user.rank || "-"}
                      </span>
                    </td>

                    <td className="px-4 py-3 border-b">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                          status
                        )}`}
                      >
                        ● {status}
                      </span>
                    </td>

                    <td className="px-4 py-3 border-b" style={{ minWidth: 160 }}>
                      <CompletionBar
                        completed={mandatoryDone}
                        total={mandatoryTotal}
                      />
                    </td>

                    <td className="px-4 py-3 border-b" style={{ minWidth: 160 }}>
                      <CompletionBar
                        completed={recommendedDone}
                        total={recommendedTotal}
                      />
                    </td>

                    <td className="px-4 py-3 border-b">
                      <span className="text-sm font-bold text-gray-900 tabular-nums">
                        {total}
                      </span>
                    </td>

                    <td className="px-4 py-3 border-b text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/users/${user.user_id || user.id}/profile`
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-[#2554C7] text-white text-sm font-semibold hover:bg-[#173f9f]"
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