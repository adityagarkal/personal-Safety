import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { createUserInDatabase } from "../../services/databaseService";


const departmentRanks = {
  Deck: [
    "MASTER",
    "CH OFF",
    "2ND OFF",
    "3RD OFF",
    "DECK CADET",
    "BOSUN",
    "AB",
    "OS",
  ],
  Engine: [
    "CH ENG",
    "2ND ENG",
    "3RD ENG",
    "4TH ENG",
    "TME",
    "ETO",
    "GAS ENGINEER",
    "FITTER",
    "OILER",
    "WIPER",
  ],
  Galley: ["CH COOK", "GENERAL STEWARD"],
};

const departments = ["Deck", "Engine", "Galley"];

const ranks = [
  "MASTER",
  "CH OFF",
  "2ND OFF",
  "3RD OFF",
  "DECK CADET",
  "BOSUN",
  "AB 1",
  "AB 2",
  "AB 3",
  "OS",
  "CH ENG",
  "2ND ENG",
  "3RD ENG",
  "4TH ENG",
  "TME",
  "ETO",
  "GAS ENGINEER",
  "FITTER",
  "OILER",
  "WIPER",
  "CH COOK",
  "GENERAL STEWARD",
  "MESSMAN",
];



const vessels = [
  "MV Pacific Endeavour",
  "MV Gemini Star",
  "MV Gemini Ocean",
  "Sun Falcon",
];

function SectionHeader({ number, title, subtitle, color = "bg-[#173f9f]" }) {
  return (
    <div className="flex items-center gap-4 border-b pb-5 mb-5">
      <div
        className={`h-11 w-11 rounded-full ${color} text-white flex items-center justify-center text-lg font-bold`}
      >
        {number}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldLabel({ children, required = true }) {
  return (
    <label className="block text-sm font-semibold text-gray-900 mb-2">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function TextInput({
  name,
  value,
  onChange,
  placeholder,
  required = true,
  type = "text",
  autoComplete,
  minLength,
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      minLength={minLength}
      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-[#173f9f] focus:ring-2 focus:ring-blue-100"
    />
  );
}

function AdminAddUser() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [form, setForm] = useState({
    crewId: "",
    firstName: "",
    lastName: "",
    rank: "",
    department: "",
    nationality: "",
    passportNumber: "",
    cdcNumber: "",
    vessel: "",
    joiningDate: "",
    contractEndDate: "",
    username: "",
    password: "",
    status: "Active",
    role: "user",
  });

  function handleChange(event) {
  const { name, value } = event.target;

  setForm((prev) => ({
    ...prev,
    [name]: name === "username" ? value.toLowerCase() : value,
    ...(name === "department" ? { rank: "" } : {}),
  }));
}

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (form.password !== confirmPassword) {
      setMessage("Password and Confirm Password do not match.");
      return;
    }

    const response = await createUserInDatabase(form);
    setMessage(response?.message || "Crew member saved.");

    if (response?.success) {
      navigate("/admin/users");
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Add New Crew Member
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Register a new crew member and configure their training access
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
            <SectionHeader
              number="1"
              title="Personal Information"
              subtitle="Crew member identity and travel documents"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FieldLabel>First Name</FieldLabel>
                <TextInput
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Eduardo"
                />
              </div>

              <div>
                <FieldLabel>Last Name</FieldLabel>
                <TextInput
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Ramos"
                />
              </div>

              <div>
                <FieldLabel>Nationality</FieldLabel>
                <select
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  required
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-[#173f9f] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select nationality</option>
                  <option value="INDIAN">INDIAN</option>
                  <option value="FILIPINO">FILIPINO</option>
                  <option value="INDONESIAN">INDONESIAN</option>
                  <option value="SRI LANKAN">SRI LANKAN</option>
                  <option value="BANGLADESHI">BANGLADESHI</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <FieldLabel>Passport Number</FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  International travel document number
                </p>
                <TextInput
                  name="passportNumber"
                  value={form.passportNumber}
                  onChange={handleChange}
                  placeholder="e.g. P1234567A"
                />
              </div>

              <div className="md:col-span-2">
                <FieldLabel>CDC Number (Continuous Discharge Certificate)</FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  Seafarer's official document number issued by the flag state maritime authority
                </p>
                <TextInput
                  name="cdcNumber"
                  value={form.cdcNumber}
                  onChange={handleChange}
                  placeholder="e.g. CDC-MNL-2024-084521"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
            <SectionHeader
              number="2"
              title="Employment Details"
              subtitle="Vessel assignment, rank, and contract information"
              color="bg-[#2554C7]"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FieldLabel>Crew ID</FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  Unique internal identifier for this crew member
                </p>
                <TextInput
                  name="crewId"
                  value={form.crewId}
                  onChange={handleChange}
                  placeholder="e.g. C-1086"
                />
              </div>

              <div>
                <FieldLabel>Rank</FieldLabel>
                <select
                    name="rank"
                    value={form.rank}
                    onChange={handleChange}
                    required
                    disabled={!form.department}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-[#173f9f] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                    <option value="">
                        {form.department ? "Select rank" : "Select department first"}
                    </option>

                    {(departmentRanks[form.department] || []).map((rank) => (
                        <option key={rank} value={rank}>
                        {rank}
                        </option>
                    ))}
                </select>
              </div>

              <div>
                <FieldLabel>Department</FieldLabel>
                <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-[#173f9f] focus:ring-2 focus:ring-blue-100"
                    >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                        <option key={department} value={department}>
                        {department}
                        </option>
                    ))}
                    </select>
              </div>

              <div>
                <FieldLabel>Vessel Assignment</FieldLabel>
                <select
                  name="vessel"
                  value={form.vessel}
                  onChange={handleChange}
                  required
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-[#173f9f] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select vessel</option>
                  {vessels.map((vessel) => (
                    <option key={vessel} value={vessel}>
                      {vessel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Joining Date</FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  Date crew member joined the vessel
                </p>
                <TextInput
                  type="date"
                  name="joiningDate"
                  value={form.joiningDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <FieldLabel>Contract End Date</FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  Scheduled sign-off date
                </p>
                <TextInput
                  type="date"
                  name="contractEndDate"
                  value={form.contractEndDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
            <SectionHeader
              number="3"
              title="Login Credentials"
              subtitle="System access credentials for the crew member's CBT login"
              color="bg-[#334155]"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FieldLabel>Username</FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  Used to log in to the CBT system. Lowercase letters, numbers, and underscores only.
                </p>
                <TextInput
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="e.g. e.ramos or c1086"
                  autoComplete="off"
                />
              </div>

              <div>
                <FieldLabel>Account Status</FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  Active accounts can log in. Archived accounts cannot access the system.
                </p>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-[#173f9f] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <FieldLabel>Password</FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  Minimum 8 characters. Share securely with the crew member.
                </p>
                <TextInput
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  minLength={8}
                />
              </div>

              <div>
                <FieldLabel>Confirm Password</FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  Re-enter the password to confirm
                </p>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                  required
                  minLength={8}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-[#173f9f] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-sm text-blue-700">
            <strong>ⓘ All fields marked with * are required</strong>
            <p className="mt-1">
              Ensure passport and CDC numbers are accurate — these are used for compliance records.
            </p>
          </div>

          {message && (
            <div className="rounded-xl border bg-blue-50 p-4 text-sm text-blue-800">
              {message}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-5">
            <h2 className="font-bold mb-4">Registration Checklist</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>○ Personal details verified</li>
              <li>○ Travel documents checked</li>
              <li>○ Rank and department confirmed</li>
              <li>○ Vessel assignment approved</li>
              <li>○ Contract dates recorded</li>
              <li>○ Login credentials set</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-5">
            <h2 className="font-bold mb-4">After Registration</h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>1. Crew member receives login credentials</li>
              <li>2. Mandatory CBT courses auto-assigned by rank</li>
              <li>3. Crew member appears in training reports</li>
              <li>4. Administrator can monitor progress in User Reports</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-5">
            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-[#2554C7] text-white font-semibold"
            >
              Save Crew Member
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="mt-3 w-full h-11 rounded-lg border bg-white font-medium"
            >
              ← Cancel
            </button>
          </div>
        </aside>
      </form>
    </AdminLayout>
  );
}

export default AdminAddUser;