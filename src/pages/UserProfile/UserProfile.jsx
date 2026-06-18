import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  User,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { getUserTrainingProfileFromDatabase } from "../../services/databaseService";

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserTrainingProfileFromDatabase(id);
        setProfile(data);
      } catch (error) {
        console.error("User profile load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [id]);

  const filteredCourses = useMemo(() => {
    const courses = profile?.courses || [];
    const keyword = searchText.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesCategory =
        categoryFilter === "all"
          ? true
          : course.course_category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ? true : course.status === statusFilter;

      const matchesSearch = keyword
        ? `${course.course_code || ""} ${course.course_name || ""}`
            .toLowerCase()
            .includes(keyword)
        : true;

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [profile, categoryFilter, statusFilter, searchText]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-[#163B6D]">
            Loading user training profile...
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout>
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-red-600">User not found.</p>
        </div>
      </AdminLayout>
    );
  }

  const { user, completions, summary } = profile;

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            User Training Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Detailed CBT training status for selected crew member.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/reports/users")}
          className="flex items-center gap-2 rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <section className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#163B6D] text-white">
            <User className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user.full_name || `${user.first_name || ""} ${user.last_name || ""}`}
            </h2>

            <p className="text-sm text-gray-500">
              {user.rank || "-"} • {user.department || "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <InfoItem label="Crew ID" value={user.crew_id} />
          <InfoItem label="Username" value={user.username} />
          <InfoItem label="Rank" value={user.rank} />
          <InfoItem label="Department" value={user.department} />
          <InfoItem label="Nationality" value={user.nationality} />
          <InfoItem label="Vessel" value={user.vessel} />
          <InfoItem label="Passport" value={user.passport_number} />
          <InfoItem label="CDC" value={user.cdc_number} />
          <InfoItem label="Joining Date" value={formatDate(user.joining_date)} />
          <InfoItem
            label="Contract End"
            value={formatDate(user.contract_end_date)}
          />
          <InfoItem label="Status" value={user.status} />
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Assigned Completed"
          value={`${summary.assignedCompleted} / ${summary.assignedCourses}`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="#2554C7"
        />

        <SummaryCard
          label="Mandatory"
          value={`${summary.mandatoryCompleted} / ${summary.mandatoryTotal}`}
          icon={<BookOpen className="h-5 w-5" />}
          color="#15803D"
        />

        <SummaryCard
          label="Recommended"
          value={`${summary.recommendedCompleted} / ${summary.recommendedTotal}`}
          icon={<BookOpen className="h-5 w-5" />}
          color="#B45309"
        />

        <SummaryCard
          label="In Progress"
          value={summary.inProgressCourses}
          icon={<Clock className="h-5 w-5" />}
          color="#F59E0B"
        />

        <SummaryCard
          label="Completion"
          value={`${summary.completionPercentage}%`}
          icon={<FileText className="h-5 w-5" />}
          color="#163B6D"
        />
      </div>

      <section className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 min-w-[280px] items-center gap-2 rounded-lg border bg-[#F5F7FA] px-3">
            <Search className="h-4 w-4 text-gray-400" />

            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search course..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-400"
          >
            <option value="all">All Categories</option>
            <option value="mandatory">Mandatory</option>
            <option value="recommended">Recommended</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-400"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
          </select>

          <div className="ml-auto text-sm font-semibold text-gray-500">
            Showing {filteredCourses.length} of {profile.courses.length} courses
          </div>
        </div>
      </section>

      <section className="mb-6 overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold text-gray-900">Course Status</h2>
          <p className="mt-1 text-sm text-gray-500">
            Includes completed, in-progress, and not-started CBT courses.
          </p>
        </div>

        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="border-b px-4 py-3 font-semibold">Course ID</th>
                <th className="border-b px-4 py-3 font-semibold">Code</th>
                <th className="border-b px-4 py-3 font-semibold">Course</th>
                <th className="border-b px-4 py-3 font-semibold">Category</th>
                <th className="border-b px-4 py-3 font-semibold">Status</th>
                <th className="border-b px-4 py-3 font-semibold">Progress</th>
                <th className="border-b px-4 py-3 font-semibold">Started</th>
                <th className="border-b px-4 py-3 font-semibold">Completed</th>
                <th className="border-b px-4 py-3 font-semibold">
                  Last Accessed
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-14 text-center text-gray-500">
                    No courses match selected filters.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr
                    key={course.course_id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="border-b px-4 py-3 text-sm text-gray-600">
                      {course.course_id}
                    </td>

                    <td className="border-b px-4 py-3">
                      <span className="font-mono text-sm font-bold text-blue-700">
                        {course.course_code}
                      </span>
                    </td>

                    <td className="border-b px-4 py-3 text-sm font-semibold text-gray-900">
                      {course.course_name}
                    </td>

                    <td className="border-b px-4 py-3">
                      <CategoryBadge category={course.course_category} />
                    </td>

                    <td className="border-b px-4 py-3">
                      <StatusBadge status={course.status} />
                    </td>

                    <td className="border-b px-4 py-3">
                      <ProgressBar value={course.progress_percentage} />
                    </td>

                    <td className="border-b px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(course.started_at)}
                    </td>

                    <td className="border-b px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(course.completed_at)}
                    </td>

                    <td className="border-b px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(course.last_accessed_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold text-gray-900">
            Completion Records
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            One record per completed user-course. Retakes do not create duplicate rows.
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="border-b px-4 py-3 font-semibold">Course ID</th>
              <th className="border-b px-4 py-3 font-semibold">Course Code</th>
              <th className="border-b px-4 py-3 font-semibold">Course Name</th>
              <th className="border-b px-4 py-3 font-semibold">Category</th>
              <th className="border-b px-4 py-3 font-semibold">
                Completion Date
              </th>
              <th className="border-b px-4 py-3 font-semibold">Certificate</th>
            </tr>
          </thead>

          <tbody>
            {completions.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-500">
                  No completed CBT courses yet.
                </td>
              </tr>
            ) : (
              completions.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border-b px-4 py-3 text-sm text-gray-600">
                    {item.course_id}
                  </td>

                  <td className="border-b px-4 py-3">
                    <span className="font-mono text-sm font-bold text-blue-700">
                      {item.course_code}
                    </span>
                  </td>

                  <td className="border-b px-4 py-3 text-sm font-semibold text-gray-900">
                    {item.course_name}
                  </td>

                  <td className="border-b px-4 py-3">
                    <CategoryBadge category={item.course_category} />
                  </td>

                  <td className="border-b px-4 py-3 text-sm text-gray-600">
                    {formatDateTime(item.completion_date)}
                  </td>

                  <td className="border-b px-4 py-3 text-sm text-gray-600">
                    {item.certificate_generated ? "Generated" : "Pending"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900">{value || "-"}</p>
    </div>
  );
}

function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-white p-5 shadow-sm">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `${color}15`,
          color,
        }}
      >
        {icon}
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>

        <p className="text-2xl font-bold tabular-nums" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function CategoryBadge({ category }) {
  const value = String(category || "other").toLowerCase();

  const config = {
    mandatory: "bg-green-50 text-green-700 border-green-200",
    recommended: "bg-yellow-50 text-yellow-700 border-yellow-200",
    other: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${
        config[value] || config.other
      }`}
    >
      {formatCategory(value)}
    </span>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "not_started").toLowerCase();

  const config = {
    completed: "bg-green-50 text-green-700 border-green-200",
    in_progress: "bg-blue-50 text-blue-700 border-blue-200",
    not_started: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${
        config[value] || config.not_started
      }`}
    >
      {formatStatus(value)}
    </span>
  );
}

function ProgressBar({ value }) {
  const progress = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <div className="flex min-w-[130px] items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-[#2554C7]"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <span className="w-10 text-right text-xs font-bold text-gray-700">
        {progress}%
      </span>
    </div>
  );
}

function formatCategory(category) {
  if (category === "mandatory") return "Mandatory";
  if (category === "recommended") return "Recommended";
  return "Other";
}

function formatStatus(status) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In Progress";
  return "Not Started";
}

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
}

function formatDateTime(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
}

export default UserProfile;