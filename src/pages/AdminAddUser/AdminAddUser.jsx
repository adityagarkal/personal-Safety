import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  KeyRound,
  Save,
  Ship,
  UserRound,
  X,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import {
  createUserInDatabase,
  getUserByIdFromDatabase,
  updateUserInDatabase,
} from "../../services/databaseService";

const departmentRanks = {
  Deck: [
    "Master",
    "Chief Off",
    "2nd Off",
    "3rd Off",
    "Jr. Off",
    "Cadet",
    "Bosun",
    "AB",
  ],
  Engine: [
    "Chief Eng",
    "2nd Eng",
    "3rd Eng",
    "4th Eng",
    "Jr. Eng",
    "TME",
    "Gas Eng",
    "ETO",
    "Fitter",
    "Oiler",
    "Wiper",
  ],
  Galley: ["Chief Cook", "Messman"],
};

const departments = ["Deck", "Engine", "Galley"];

const emptyForm = {
  crewId: "",
  firstName: "",
  lastName: "",
  rank: "",
  department: "",
  nationality: "",
  passportNumber: "",
  cdcNumber: "",
  vessel: "Sun Falcon",
  joiningDate: "",
  contractEndDate: "",
  username: "",
  password: "",
  status: "Active",
  role: "user",
};

function AdminAddUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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
        vessel: "Sun Falcon",
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

    const payload = {
      ...form,
      vessel: "Sun Falcon",
    };

    let response;

    if (isEditMode) {
      response = await updateUserInDatabase(id, payload);
    } else {
      if (form.password !== confirmPassword) {
        setMessage("Password and Confirm Password do not match.");
        return;
      }

      response = await createUserInDatabase(payload);
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
        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-[#DDE3EA] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Crew Member Registered
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-lg leading-7 text-gray-500">
            The new crew member has been successfully added to the system. They
            can now log in and access their assigned CBT courses.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                setConfirmPassword("");
                setMessage("");
                setForm(emptyForm);
              }}
              className="rounded-xl border border-[#DDE3EA] bg-white px-8 py-3 font-semibold text-gray-700 hover:bg-[#F5F7FA]"
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
              className="rounded-xl bg-[#2554C7] px-8 py-3 font-semibold text-white hover:bg-[#163B6D]"
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
      <div className="mb-6 rounded-2xl border border-[#DDE3EA] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#2554C7]">
              Crew Management
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {isEditMode ? "Edit Crew Member" : "Add New Crew Member"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Register crew details, vessel assignment, rank information, and
              CBT login credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#F5F7FA]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Crew List
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
        <FormSection
          number="1"
          icon={<UserRound className="h-5 w-5" />}
          title="Personal Information"
          subtitle="Crew member identity and travel document details"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="First Name">
              <TextInput
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="e.g. Eduardo"
              />
            </FormField>

            <FormField label="Last Name">
              <TextInput
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="e.g. Ramos"
              />
            </FormField>

            <FormField label="Nationality">
              <SelectInput
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
              >
                <option value="">Select nationality</option>
                <option value="INDIAN">INDIAN</option>
                <option value="FILIPINO">FILIPINO</option>
                <option value="INDONESIAN">INDONESIAN</option>
                <option value="SRI LANKAN">SRI LANKAN</option>
                <option value="BANGLADESHI">BANGLADESHI</option>
                <option value="OTHER">OTHER</option>
              </SelectInput>
            </FormField>

            <FormField
              label="Passport Number"
              helper="International travel document number"
            >
              <TextInput
                name="passportNumber"
                value={form.passportNumber}
                onChange={handleChange}
                placeholder="e.g. P1234567A"
              />
            </FormField>

            <FormField
              label="CDC Number"
              helper="Continuous Discharge Certificate number"
              className="md:col-span-2"
            >
              <TextInput
                name="cdcNumber"
                value={form.cdcNumber}
                onChange={handleChange}
                placeholder="e.g. CDC-MNL-2024-084521"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          number="2"
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          title="Employment Details"
          subtitle="Rank, department, vessel, and contract information"
          accentColor="#2554C7"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Crew ID"
              helper="Unique internal identifier for this crew member"
            >
              <TextInput
                name="crewId"
                value={form.crewId}
                onChange={handleChange}
                placeholder="e.g. C-1086"
              />
            </FormField>

            <FormField label="Department">
              <SelectInput
                name="department"
                value={form.department}
                onChange={handleChange}
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Rank">
              <SelectInput
                name="rank"
                value={form.rank}
                onChange={handleChange}
                disabled={!form.department}
              >
                <option value="">
                  {form.department ? "Select rank" : "Select department first"}
                </option>

                {(departmentRanks[form.department] || []).map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Vessel Assignment">
              <div className="flex h-12 items-center gap-3 rounded-xl border border-[#DDE3EA] bg-[#F5F7FA] px-4">
                <Ship className="h-5 w-5 text-[#2554C7]" />
                <span className="text-sm font-bold text-[#163B6D]">
                  Sun Falcon
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Vessel is fixed for all crew members.
              </p>
            </FormField>

            <FormField label="Joining Date">
              <TextInput
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Contract End Date">
              <TextInput
                type="date"
                name="contractEndDate"
                value={form.contractEndDate}
                onChange={handleChange}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          number="3"
          icon={<KeyRound className="h-5 w-5" />}
          title="Login Credentials"
          subtitle="CBT login access and account status"
          accentColor="#334155"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Username"
              helper="Use lowercase letters, numbers, dots, or underscores"
            >
              <TextInput
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. e.ramos or c1086"
                autoComplete="off"
              />
            </FormField>

            <FormField label="Account Status">
              <SelectInput
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </SelectInput>
            </FormField>

            {!isEditMode && (
              <>
                <FormField
                  label="Password"
                  helper="Minimum 6 characters"
                >
                  <TextInput
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    minLength={6}
                  />
                </FormField>

                <FormField label="Confirm Password">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Confirm password"
                    required
                    minLength={6}
                    className="h-12 w-full rounded-xl border border-[#DDE3EA] px-4 text-sm outline-none transition focus:border-[#2554C7] focus:ring-2 focus:ring-blue-100"
                  />
                </FormField>
              </>
            )}
          </div>
        </FormSection>

        {message && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <div className="sticky bottom-4 z-20 rounded-2xl border border-[#DDE3EA] bg-white/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              <strong className="text-gray-800">Note:</strong> All fields marked
              with <span className="font-bold text-red-500">*</span> are required
              for crew registration.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="flex items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-[#F5F7FA]"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[#2554C7] px-7 py-3 font-semibold text-white shadow-sm hover:bg-[#163B6D]"
              >
                <Save className="h-4 w-4" />
                {isEditMode ? "Update Crew Member" : "Save Crew Member"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

function FormSection({
  number,
  icon,
  title,
  subtitle,
  children,
  accentColor = "#173f9f",
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#DDE3EA] bg-white shadow-sm">
      <div className="border-b border-[#DDE3EA] bg-[#F8FAFC] px-6 py-5">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
            style={{ backgroundColor: accentColor }}
          >
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                Section {number}
              </span>

              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function FormField({ label, helper, children, required = true, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {helper && <p className="mb-2 text-xs text-gray-500">{helper}</p>}

      {children}
    </div>
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
      className="h-12 w-full rounded-xl border border-[#DDE3EA] px-4 text-sm outline-none transition focus:border-[#2554C7] focus:ring-2 focus:ring-blue-100"
    />
  );
}

function SelectInput({
  name,
  value,
  onChange,
  children,
  required = true,
  disabled = false,
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="h-12 w-full rounded-xl border border-[#DDE3EA] px-4 text-sm outline-none transition focus:border-[#2554C7] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
    >
      {children}
    </select>
  );
}

export default AdminAddUser;
