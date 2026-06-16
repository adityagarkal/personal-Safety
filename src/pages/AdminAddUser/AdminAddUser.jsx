import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  createUserInDatabase,
  getUserByIdFromDatabase,
  updateUserInDatabase,
} from "../../services/databaseService";

const departmentRanks = {
  Deck: ["MASTER", "CH OFF", "2ND OFF", "3RD OFF", "DECK CADET", "BOSUN", "AB", "OS"],
  Engine: ["CH ENG", "2ND ENG", "3RD ENG", "4TH ENG", "TME", "ETO", "GAS ENGINEER", "FITTER", "OILER", "WIPER"],
  Galley: ["CH COOK", "GENERAL STEWARD"],
};

const departments = ["Deck", "Engine", "Galley"];

const vessels = [
  "MV Pacific Endeavour",
  "MV Gemini Star",
  "MV Gemini Ocean",
  "Sun Falcon",
];

function SectionHeader({ number, title, subtitle, color = "bg-[#173f9f]" }) {
  return (
    <div className="flex items-center gap-4 border-b pb-5 mb-5">
      <div className={`h-11 w-11 rounded-full ${color} text-white flex items-center justify-center text-lg font-bold`}>
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
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [message, setMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const emptyForm = {
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
  };

  const [form, setForm] = useState(emptyForm);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "username" ? value.toLowerCase() : value,
      ...(name === "department" ? { rank: "" } : {}),
    }));
  }

  useEffect(() => {
    async function loadUser() {
      if (!isEditMode) return;

      const user = await getUserByIdFromDatabase(id);
      if (!user) return;

      setForm({
        id: user.id,
        crewId: user.crew_id || "",
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        rank: user.rank || "",
        department: user.department || "",
        nationality: user.nationality || "",
        passportNumber: user.passport_number || "",
        cdcNumber: user.cdc_number || "",
        vessel: user.vessel || "",
        joiningDate: user.joining_date || "",
        contractEndDate: user.contract_end_date || "",
        username: user.username || "",
        password: "",
        status: user.status || "Active",
        role: user.role || "user",
      });
    }

    loadUser();
  }, [id, isEditMode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    let response;

    if (isEditMode) {
      response = await updateUserInDatabase(form);
    } else {
      if (form.password !== confirmPassword) {
        setMessage("Password and Confirm Password do not match.");
        return;
      }

      response = await createUserInDatabase(form);
    }

    if (response?.success) {
      if (isEditMode) {
        navigate("/admin/users");
      } else {
        setShowSuccess(true);
        return;
      }
    }

    setMessage(response?.message || "");
  }

  if (showSuccess) {
    return (
      <AdminLayout>
        <div className="max-w-3xl mx-auto mt-20 bg-white rounded-xl border shadow-sm p-12 text-center">
          <div className="mx-auto mb-8 h-20 w-20 rounded-full bg-green-50 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-green-500 flex items-center justify-center text-green-600 text-3xl">
              ✓
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Crew Member Registered
          </h2>

          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
            The new crew member has been successfully added to the system.
            They can now log in and access their assigned CBT courses.
          </p>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                setConfirmPassword("");
                setMessage("");
                setForm(emptyForm);
              }}
              className="px-8 py-3 rounded-lg border bg-white font-semibold"
            >
              Add Another Member
            </button>

            <button
  type="button"
  onClick={() => {
    setShowSuccess(false);
    setTimeout(() => {
      navigate("/admin/users");
    }, 100);
  }}
  className="px-8 py-3 rounded-lg bg-[#2554C7] text-white font-semibold"
>
  View Crew List
</button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Edit Crew Member" : "Add New Crew Member"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Register a new crew member and configure their training access
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
        <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
          <SectionHeader
            number="1"
            title="Personal Information"
            subtitle="Crew member identity and travel documents"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <FieldLabel>First Name</FieldLabel>
              <TextInput name="firstName" value={form.firstName} onChange={handleChange} placeholder="e.g. Eduardo" />
            </div>

            <div>
              <FieldLabel>Last Name</FieldLabel>
              <TextInput name="lastName" value={form.lastName} onChange={handleChange} placeholder="e.g. Ramos" />
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
              <TextInput name="passportNumber" value={form.passportNumber} onChange={handleChange} placeholder="e.g. P1234567A" />
            </div>

            <div className="md:col-span-2">
              <FieldLabel>CDC Number (Continuous Discharge Certificate)</FieldLabel>
              <p className="text-xs text-gray-500 mb-2">
                Seafarer's official document number issued by the flag state maritime authority
              </p>
              <TextInput name="cdcNumber" value={form.cdcNumber} onChange={handleChange} placeholder="e.g. CDC-MNL-2024-084521" />
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
              <TextInput name="crewId" value={form.crewId} onChange={handleChange} placeholder="e.g. C-1086" />
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
              <TextInput type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} />
            </div>

            <div>
              <FieldLabel>Contract End Date</FieldLabel>
              <p className="text-xs text-gray-500 mb-2">
                Scheduled sign-off date
              </p>
              <TextInput type="date" name="contractEndDate" value={form.contractEndDate} onChange={handleChange} />
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
              <TextInput name="username" value={form.username} onChange={handleChange} placeholder="e.g. e.ramos or c1086" autoComplete="off" />
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

            {!isEditMode && (
              <>
                <div>
                  <FieldLabel>Password</FieldLabel>
                  <p className="text-xs text-gray-500 mb-2">
                    Minimum 6 characters. Share securely with the crew member.
                  </p>
                  <TextInput
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    minLength={6}
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
                    minLength={6}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-[#173f9f] focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </>
            )}
          </div>
        </section>

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
          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-[#2554C7] text-white font-semibold"
          >
            {isEditMode ? "Update Crew Member" : "Save Crew Member"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="mt-3 w-full h-11 rounded-lg border bg-white font-medium"
          >
            ← Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default AdminAddUser;