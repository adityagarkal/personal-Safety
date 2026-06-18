import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  UserPlus,
  Users,
  Archive,
  Activity,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { getAdminDashboardStatsFromDatabase } from "../../services/databaseService";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    activeUsers: 0,
    archivedUsers: 0,
    activeCourses: 0,
    mandatoryCourses: 0,
    completedThisMonth: 0,
    crewTrainedThisMonth: 0,
    todayCompletions: 0,
    inProgressCount: 0,
    crewInProgress: 0,
    mandatoryCompletionsThisMonth: 0,
    recommendedCompletionsThisMonth: 0,
    otherCompletionsThisMonth: 0,
    recentCompletions: [],
    inProgressRows: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminDashboardStatsFromDatabase();

      setDashboard({
        totalUsers: data?.totalUsers || 0,
        activeUsers: data?.activeUsers || 0,
        archivedUsers: data?.archivedUsers || 0,
        activeCourses: data?.activeCourses || 0,
        mandatoryCourses: data?.mandatoryCourses || 0,
        completedThisMonth: data?.completedThisMonth || 0,
        crewTrainedThisMonth: data?.crewTrainedThisMonth || 0,
        todayCompletions: data?.todayCompletions || 0,
        inProgressCount: data?.inProgressCount || 0,
        crewInProgress: data?.crewInProgress || 0,
        mandatoryCompletionsThisMonth:
          data?.mandatoryCompletionsThisMonth || 0,
        recommendedCompletionsThisMonth:
          data?.recommendedCompletionsThisMonth || 0,
        otherCompletionsThisMonth: data?.otherCompletionsThisMonth || 0,
        recentCompletions: Array.isArray(data?.recentCompletions)
          ? data.recentCompletions
          : [],
        inProgressRows: Array.isArray(data?.inProgressRows)
          ? data.inProgressRows
          : [],
      });
    } catch (err) {
      console.error("Admin Dashboard Error:", err);
      setError("Unable to load dashboard statistics from SQLite.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Training management overview for crew CBT activity.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-[#163B6D]">
            Loading dashboard statistics...
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              label="Total Crew"
              value={dashboard.totalUsers}
              subtext={`${dashboard.activeUsers} active crew`}
              color="#2554C7"
              icon={<Users className="h-5 w-5" />}
            />

            <DashboardStatCard
              label="Active CBT Courses"
              value={dashboard.activeCourses}
              subtext={`${dashboard.mandatoryCourses} mandatory courses`}
              color="#163B6D"
              icon={<BookOpen className="h-5 w-5" />}
            />

            <DashboardStatCard
              label="Completed This Month"
              value={dashboard.completedThisMonth}
              subtext={`${dashboard.crewTrainedThisMonth} crew trained`}
              color="#22C55E"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />

            <DashboardStatCard
              label="In Progress CBTs"
              value={dashboard.inProgressCount}
              subtext={`${dashboard.crewInProgress} crew currently training`}
              color="#F59E0B"
              icon={<Clock className="h-5 w-5" />}
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardSmallCard
              label="Archived Crew"
              value={dashboard.archivedUsers}
              icon={<Archive className="h-4 w-4" />}
            />

            <DashboardSmallCard
              label="Today Completions"
              value={dashboard.todayCompletions}
              icon={<Activity className="h-4 w-4" />}
            />

            <DashboardSmallCard
              label="Mandatory This Month"
              value={dashboard.mandatoryCompletionsThisMonth}
              icon={<ClipboardList className="h-4 w-4" />}
            />

            <DashboardSmallCard
              label="Recommended This Month"
              value={dashboard.recommendedCompletionsThisMonth}
              icon={<ClipboardList className="h-4 w-4" />}
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Quick Actions
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Common administrative tasks.
                </p>
              </div>

              <div className="space-y-3">
                <QuickAction
                  title="Add New Crew Member"
                  description="Register crew and login details"
                  icon={<UserPlus className="h-5 w-5" />}
                  onClick={() => navigate("/admin/users/new")}
                />

                <QuickAction
                  title="Manage Crew List"
                  description="View, edit, or archive crew"
                  icon={<Users className="h-5 w-5" />}
                  onClick={() => navigate("/admin/users")}
                />

                <QuickAction
                  title="User Wise Reports"
                  description="Check progress by crew member"
                  icon={<FileSpreadsheet className="h-5 w-5" />}
                  onClick={() => navigate("/admin/reports/users")}
                />

                <QuickAction
                  title="Monthly Report"
                  description="Preview and download monthly CSV"
                  icon={<FileSpreadsheet className="h-5 w-5" />}
                  onClick={() => navigate("/admin/reports/monthly")}
                />
              </div>
            </section>

            <section className="rounded-xl border bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    This Month Completion Split
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Course completion count by category.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin/reports/monthly")}
                  className="text-xs font-bold text-[#2554C7] hover:text-[#163B6D]"
                >
                  Open monthly report →
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <CategorySummary
                  label="Mandatory"
                  value={dashboard.mandatoryCompletionsThisMonth}
                  color="#22C55E"
                />

                <CategorySummary
                  label="Recommended"
                  value={dashboard.recommendedCompletionsThisMonth}
                  color="#F59E0B"
                />

                <CategorySummary
                  label="Other"
                  value={dashboard.otherCompletionsThisMonth}
                  color="#6B7280"
                />
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ActivityPanel
              title="Recent CBT Completions"
              subtitle="Latest completed CBT records."
              emptyTitle="No CBT completions found yet"
              emptyText="Completed courses will appear here."
              rows={dashboard.recentCompletions}
              type="completed"
              onViewAll={() => navigate("/admin/reports/monthly")}
            />

            <ActivityPanel
              title="CBTs In Progress"
              subtitle="Crew members currently working on CBTs."
              emptyTitle="No CBT currently in progress"
              emptyText="Started but incomplete courses will appear here."
              rows={dashboard.inProgressRows}
              type="in_progress"
              onViewAll={() => navigate("/admin/reports/users")}
            />
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function DashboardStatCard({ label, value, subtext, color, icon }) {
  return (
    <div
      className="rounded-xl border bg-white p-5 shadow-sm"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `${color}15`,
          color,
        }}
      >
        {icon}
      </div>

      <p className="mb-2 text-3xl font-bold leading-none text-gray-900">
        {value}
      </p>

      <p className="text-sm font-semibold text-gray-900">{label}</p>

      <p className="mt-1 text-xs text-gray-500">{subtext}</p>
    </div>
  );
}

function DashboardSmallCard({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F7FA] text-[#2554C7]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>

        <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ title, description, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2554C7]">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-gray-900">{title}</span>
        <span className="block text-xs text-gray-500">{description}</span>
      </span>

      <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
    </button>
  );
}

function CategorySummary({ label, value, color }) {
  return (
    <div className="rounded-xl border bg-[#F9FAFB] p-5">
      <p className="text-sm font-bold text-gray-900">{label}</p>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold" style={{ color }}>
          {value}
        </p>

        <div className="h-2 flex-1 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full"
            style={{
              width: value > 0 ? "100%" : "0%",
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">Completions this month</p>
    </div>
  );
}

function ActivityPanel({
  title,
  subtitle,
  rows,
  type,
  emptyTitle,
  emptyText,
  onViewAll,
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-[#2554C7] hover:text-[#163B6D]"
        >
          View all →
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} text={emptyText} />
      ) : (
        <div className="divide-y">
          {rows.map((row) => (
            <ActivityRow key={`${type}-${row.id}`} row={row} type={type} />
          ))}
        </div>
      )}
    </section>
  );
}

function ActivityRow({ row, type }) {
  const isCompleted = type === "completed";

  return (
    <div className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50">
      <div
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          isCompleted ? "bg-[#22C55E]" : "bg-[#F59E0B]"
        }`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold text-gray-900">
            {row.full_name ||
              `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
              "-"}
          </p>

          <CategoryBadge category={row.course_category} />
        </div>

        <p className="mt-1 truncate text-sm text-gray-600">
          {row.course_code ? `${row.course_code} - ` : ""}
          {row.course_name || "-"}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {row.rank || "-"} • {row.crew_id || "-"}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {isCompleted ? (
          <>
            <p className="text-xs font-semibold text-gray-700">Completed</p>
            <p className="mt-1 text-xs text-gray-500">
              {formatDateTime(row.completion_date)}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-gray-700">
              {Number(row.progress_percentage || 0)}%
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {formatDateTime(row.last_accessed_at)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <ClipboardList className="h-7 w-7 text-gray-400" />
      </div>

      <p className="text-lg font-semibold text-gray-800">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{text}</p>
    </div>
  );
}

function CategoryBadge({ category }) {
  const value = String(category || "other").toLowerCase();

  const config = {
    mandatory: "border-green-200 bg-green-50 text-green-700",
    recommended: "border-yellow-200 bg-yellow-50 text-yellow-700",
    other: "border-gray-200 bg-gray-50 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${
        config[value] || config.other
      }`}
    >
      {formatCategory(value)}
    </span>
  );
}

function formatCategory(category) {
  if (category === "mandatory") return "Mandatory";
  if (category === "recommended") return "Recommended";
  return "Other";
}

function formatDateTime(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
}

export default AdminDashboard;