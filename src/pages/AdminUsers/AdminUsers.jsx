import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getAllUsersFromDatabase } from "../../services/databaseService";

function getFullName(user) {
  if (user.first_name || user.last_name) {
    return `${user.last_name || ""}, ${user.first_name || ""}`.replace(/^, /, "").trim();
  }

  return user.full_name || "-";
}

function getDepartmentBadge(department) {
  const value = String(department || "").toLowerCase();

  if (value.includes("engine")) {
    return "bg-orange-50 text-orange-700";
  }

  if (value.includes("galley") || value.includes("catering")) {
    return "bg-green-50 text-green-700";
  }

  return "bg-blue-50 text-blue-700";
}

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function loadUsers() {
      const usersData = await getAllUsersFromDatabase();
      setUsers(Array.isArray(usersData) ? usersData : []);
    }

    loadUsers();
  }, []);

  const ranks = useMemo(() => {
    return [...new Set(users.map((user) => user.rank).filter(Boolean))];
  }, [users]);

  const filteredUsers = users.filter((user) => {
    const searchableText = `${user.crew_id || ""} ${getFullName(user)} ${
      user.rank || ""
    } ${user.department || ""} ${user.vessel || ""} ${user.username || ""}`.toLowerCase();

    const matchesSearch = searchableText.includes(search.toLowerCase());
    const matchesRank = rankFilter ? user.rank === rankFilter : true;
    const matchesStatus = statusFilter ? (user.status || "Active") === statusFilter : true;

    return matchesSearch && matchesRank && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crew Members</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage all registered crew members and their training status
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-4 mb-5">
        <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, ID, or rank..."
              className="w-full md:w-72 border rounded-lg px-4 py-3 text-sm"
            />

            <select
              value={rankFilter}
              onChange={(event) => setRankFilter(event.target.value)}
              className="w-full md:w-44 border rounded-lg px-4 py-3 text-sm"
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
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full md:w-44 border rounded-lg px-4 py-3 text-sm"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              {filteredUsers.length} members found
            </p>

            <button
              onClick={() => navigate("/admin/users/new")}
              className="px-5 py-3 rounded-lg bg-[#2554C7] text-white text-sm font-semibold"
            >
              + Add Crew Member
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-4 border-b">Crew ID</th>
              <th className="px-5 py-4 border-b">Name</th>
              <th className="px-5 py-4 border-b">Rank</th>
              <th className="px-5 py-4 border-b">Department</th>
              <th className="px-5 py-4 border-b">Vessel</th>
              <th className="px-5 py-4 border-b">Joining Date</th>
              <th className="px-5 py-4 border-b">Status</th>
              <th className="px-5 py-4 border-b text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No crew members found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const status = user.status || "Active";

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 border-b">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        {user.crew_id || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 border-b font-semibold text-gray-900">
                      {getFullName(user)}
                    </td>

                    <td className="px-5 py-4 border-b text-gray-700">
                      {user.rank || "-"}
                    </td>

                    <td className="px-5 py-4 border-b">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getDepartmentBadge(
                          user.department
                        )}`}
                      >
                        {user.department || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 border-b text-gray-600">
                      {user.vessel || "-"}
                    </td>

                    <td className="px-5 py-4 border-b text-gray-600">
                      {user.joining_date || user.joiningDate || "-"}
                    </td>

                    <td className="px-5 py-4 border-b">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          status === "Active"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        }`}
                      >
                        ● {status}
                      </span>
                    </td>

                    <td className="px-5 py-4 border-b text-right">
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 text-sm font-semibold mr-2"
                      >
                        ✎ Edit
                      </button>

                      <button className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-semibold">
                        ▣ Archive
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-500">
            Showing 1-{filteredUsers.length} of {users.length} members
          </p>

          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border text-gray-400">«</button>
            <button className="px-3 py-1 rounded border bg-[#2554C7] text-white">
              1
            </button>
            <button className="px-3 py-1 rounded border text-gray-500">2</button>
            <button className="px-3 py-1 rounded border text-gray-500">›</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;