import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getAllUsersFromDatabase,
  archiveUserInDatabase,
} from "../../services/databaseService";

const PAGE_SIZE_OPTIONS = [10, 15, 25];

function getFullName(user) {
  if (user.first_name || user.last_name) {
    return `${user.last_name || ""}, ${user.first_name || ""}`
      .replace(/^, /, "")
      .trim();
  }

  return user.full_name || "-";
}

function getDepartmentStyle(department) {
  const value = String(department || "").toLowerCase();

  if (value.includes("engine")) {
    return { backgroundColor: "#FFF7ED", color: "#C2410C" };
  }

  if (value.includes("galley") || value.includes("catering")) {
    return { backgroundColor: "#F0FDF4", color: "#15803D" };
  }

  return { backgroundColor: "#EFF6FF", color: "#2554C7" };
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

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("All Ranks");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadUsers() {
      const usersData = await getAllUsersFromDatabase();
      setUsers(Array.isArray(usersData) ? usersData : []);
    }

    loadUsers();
  }, []);

  async function confirmArchive() {
    if (!archiveTarget) return;

    const response = await archiveUserInDatabase(archiveTarget.id);

    if (response.success) {
      const usersData = await getAllUsersFromDatabase();
      setUsers(Array.isArray(usersData) ? usersData : []);
      setSuccessMsg(`${getFullName(archiveTarget)} has been archived.`);
      setArchiveTarget(null);
      setTimeout(() => setSuccessMsg(""), 3500);
    } else {
      alert(response.message);
    }
  }

  const ranks = useMemo(() => {
    return [...new Set(users.map((user) => user.rank).filter(Boolean))];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchableText = `${user.crew_id || ""} ${getFullName(user)} ${
        user.rank || ""
      } ${user.department || ""} ${user.vessel || ""} ${
        user.username || ""
      }`.toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());
      const matchesRank =
        rankFilter === "All Ranks" ? true : user.rank === rankFilter;
      const matchesStatus =
        statusFilter === "All Status"
          ? true
          : (user.status || "Active") === statusFilter;

      return matchesSearch && matchesRank && matchesStatus;
    });
  }, [users, search, rankFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <AdminLayout>
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg bg-green-50 border-green-200 text-green-700">
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-600 shrink-0">
                ⚠
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Archive Crew Member
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Archive <strong>{getFullName(archiveTarget)}</strong>? Their
                  training records will be preserved.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setArchiveTarget(null)}
                className="px-4 py-2 rounded-lg border text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={confirmArchive}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold"
              >
                Archive Member
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Crew Members</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage all registered crew members and their training status
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm mb-4 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, ID, or rank..."
            className="w-72 border rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none focus:border-blue-400"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={rankFilter}
          onChange={(event) => {
            setRankFilter(event.target.value);
            setCurrentPage(1);
          }}
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
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
        >
          <option value="All Status">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Archived">Archived</option>
        </select>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {filteredUsers.length} member
            {filteredUsers.length !== 1 ? "s" : ""} found
          </span>

          <button
            onClick={() => navigate("/admin/users/new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2554C7] text-white text-sm font-semibold hover:bg-[#173f9f]"
          >
            <span>+</span>
            Add Crew Member
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[18%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="hidden xl:table-column w-[16%]" />
            <col className="hidden 2xl:table-column w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
          </colgroup>

          <thead>
            <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-3 py-3 border-b font-semibold">Crew ID</th>
              <th className="px-3 py-3 border-b font-semibold">Name</th>
              <th className="px-3 py-3 border-b font-semibold">Rank</th>
              <th className="px-3 py-3 border-b font-semibold">Department</th>
              <th className="hidden xl:table-cell px-3 py-3 border-b font-semibold">
                Vessel
              </th>
              <th className="hidden 2xl:table-cell px-3 py-3 border-b font-semibold">
                Joining Date
              </th>
              <th className="px-3 py-3 border-b font-semibold">Status</th>
              <th className="px-3 py-3 border-b font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-16 text-center text-gray-500">
                  No crew members found.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => {
                const status = user.status || "Active";

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-3 border-b">
                      <span className="block truncate font-mono text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">
                        {user.crew_id || "-"}
                      </span>
                    </td>

                    <td className="px-3 py-3 border-b">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {getFullName(user)}
                      </p>
                    </td>

                    <td className="px-3 py-3 border-b text-sm text-gray-700">
                      <p className="truncate">{user.rank || "-"}</p>
                    </td>

                    <td className="px-3 py-3 border-b">
                      <span
                        className="inline-flex max-w-full truncate text-xs px-2 py-1 rounded font-semibold"
                        style={getDepartmentStyle(user.department)}
                      >
                        {user.department || "-"}
                      </span>
                    </td>

                    <td className="hidden xl:table-cell px-3 py-3 border-b text-sm text-gray-500">
                      <p className="truncate">{user.vessel || "-"}</p>
                    </td>

                    <td className="hidden 2xl:table-cell px-3 py-3 border-b text-sm text-gray-500">
                      <p className="truncate">
                        {user.joining_date || user.joiningDate || "-"}
                      </p>
                    </td>

                    <td className="px-3 py-3 border-b">
                      <span
                        className={`inline-flex items-center gap-1 whitespace-nowrap px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                          status
                        )}`}
                      >
                        <span>●</span>
                        <span>{status}</span>
                      </span>
                    </td>

                    <td className="px-3 py-3 border-b text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                          className="px-2.5 py-1.5 rounded-lg border border-blue-300 text-blue-700 text-xs font-semibold hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        {status !== "Archived" && (
                          <button
                            onClick={() => setArchiveTarget(user)}
                            className="px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * pageSize + 1,
                  filteredUsers.length
                )}
                –
                {Math.min(currentPage * pageSize, filteredUsers.length)} of{" "}
                {filteredUsers.length} members
              </span>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Rows:</label>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1 text-xs"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded border text-sm disabled:opacity-40"
              >
                «
              </button>

              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded border text-sm disabled:opacity-40"
              >
                ‹
              </button>

              {pageNumbers
                .slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2)
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded border text-sm ${
                      currentPage === page
                        ? "bg-[#2554C7] text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}

              <button
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded border text-sm disabled:opacity-40"
              >
                ›
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded border text-sm disabled:opacity-40"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;