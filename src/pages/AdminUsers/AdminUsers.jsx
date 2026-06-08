import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserInDatabase,
  getAllUsersFromDatabase,
  getCBTModulesFromDatabase,
} from "../../services/databaseService";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    crewId: "",
    firstName: "",
    lastName: "",
    rank: "",
    department: "",
    nationality: "",

    vessel: "",
    joiningDate: "",
    contractEndDate: "",

    username: "",
    password: "",
    forcePasswordChange: "No",
    status: "Active",
    role: "user",

    trainingAssignments: "Personal Safety",
  });

  async function loadData() {
    const usersData = await getAllUsersFromDatabase();
    const modulesData = await getCBTModulesFromDatabase();

    setUsers(Array.isArray(usersData) ? usersData : []);
    setModules(Array.isArray(modulesData) ? modulesData : []);
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "username" ? value.toLowerCase() : value,
    }));
  }

  function toggleModule(moduleName) {
    const current = form.trainingAssignments
      ? form.trainingAssignments
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    let updated;

    if (current.includes(moduleName)) {
      updated = current.filter((item) => item !== moduleName);
    } else {
      updated = [...current, moduleName];
    }

    setForm((prev) => ({
      ...prev,
      trainingAssignments: updated.join("\n"),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const response = await createUserInDatabase(form);
    setMessage(response.message);

    if (response.success) {
      setForm({
        crewId: "",
        firstName: "",
        lastName: "",
        rank: "",
        department: "",
        nationality: "",

        vessel: "",
        joiningDate: "",
        contractEndDate: "",

        username: "",
        password: "",
        forcePasswordChange: "No",
        status: "Active",
        role: "user",

        trainingAssignments: "Personal Safety",
      });

      loadData();
    }
  }

  function isModuleSelected(moduleName) {
    return form.trainingAssignments
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .includes(moduleName);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Crew & Login Management</h1>
            <p className="text-gray-600 mt-2">
              Create admin-controlled crew accounts and assign CBT training.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-5 py-3 rounded bg-gray-300"
          >
            Back
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-5">Create Crew Login</h2>

          {message && (
            <div className="mb-5 rounded bg-blue-100 p-3 text-blue-800">
              {message}
            </div>
          )}

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4">
              Section A – Personal Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <input
                name="crewId"
                value={form.crewId}
                onChange={handleChange}
                placeholder="Crew ID"
                className="border rounded-lg p-3"
              />

              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                className="border rounded-lg p-3"
              />

              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                className="border rounded-lg p-3"
              />

              <input
                name="rank"
                value={form.rank}
                onChange={handleChange}
                placeholder="Rank"
                className="border rounded-lg p-3"
              />

              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
                className="border rounded-lg p-3"
              />

              <input
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                placeholder="Nationality"
                className="border rounded-lg p-3"
              />
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4">
              Section B – Vessel Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <input
                name="vessel"
                value={form.vessel}
                onChange={handleChange}
                placeholder="Vessel"
                className="border rounded-lg p-3"
              />

              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                className="border rounded-lg p-3"
              />

              <input
                type="date"
                name="contractEndDate"
                value={form.contractEndDate}
                onChange={handleChange}
                className="border rounded-lg p-3"
              />
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4">
              Section C – Login Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                required
                autoComplete="off"
                className="border rounded-lg p-3"
              />

              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="border rounded-lg p-3"
              />

              <select
                name="forcePasswordChange"
                value={form.forcePasswordChange}
                onChange={handleChange}
                className="border rounded-lg p-3"
              >
                <option value="No">Force Password Change: No</option>
                <option value="Yes">Force Password Change: Yes</option>
              </select>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border rounded-lg p-3"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border rounded-lg p-3"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4">
              Section D – Training Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modules.length === 0 ? (
                <div className="border rounded-lg p-4 text-gray-600">
                  No CBT modules found.
                </div>
              ) : (
                modules.map((module) => {
                  const selected = isModuleSelected(module.module_name);

                  return (
                    <label
                      key={module.id}
                      className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleModule(module.module_name)}
                      />

                      <div>
                        <div className="font-semibold">
                          {module.module_name}
                        </div>

                        <div className="text-sm text-gray-500">
                          Version {module.module_version} |{" "}
                          {module.status || "Active"}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Assigned CBT modules are stored in the Training Assignment table.
              Completion records remain immutable after completion.
            </p>
          </section>

          <button className="px-6 py-3 rounded bg-blue-600 text-white">
            Create Crew Login
          </button>
        </form>

        <div className="bg-white rounded-xl shadow overflow-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3">Crew ID</th>
                <th className="border p-3">Name</th>
                <th className="border p-3">Rank</th>
                <th className="border p-3">Department</th>
                <th className="border p-3">Nationality</th>
                <th className="border p-3">Vessel</th>
                <th className="border p-3">Username</th>
                <th className="border p-3">Role</th>
                <th className="border p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="9" className="border p-4 text-center">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="border p-3">{user.crew_id || "-"}</td>

                    <td className="border p-3">
                      {user.first_name || user.last_name
                        ? `${user.first_name || ""} ${user.last_name || ""}`
                        : user.full_name || "-"}
                    </td>

                    <td className="border p-3">{user.rank || "-"}</td>
                    <td className="border p-3">{user.department || "-"}</td>
                    <td className="border p-3">{user.nationality || "-"}</td>
                    <td className="border p-3">{user.vessel || "-"}</td>
                    <td className="border p-3">{user.username}</td>
                    <td className="border p-3">{user.role}</td>
                    <td className="border p-3">{user.status || "Active"}</td>
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

export default AdminUsers;