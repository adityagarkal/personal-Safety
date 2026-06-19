import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Search,
  Users,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { getMonthlyReportStatsFromDatabase } from "../../services/databaseService";

const months = [
  ["01", "January"],
  ["02", "February"],
  ["03", "March"],
  ["04", "April"],
  ["05", "May"],
  ["06", "June"],
  ["07", "July"],
  ["08", "August"],
  ["09", "September"],
  ["10", "October"],
  ["11", "November"],
  ["12", "December"],
];

const currentYear = new Date().getFullYear();

const years = Array.from(
  { length: 10 },
  (_, index) => String(currentYear - 2 + index)
);

function MonthlyReport() {
  const now = new Date();

  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(String(now.getFullYear()));

  const [stats, setStats] = useState({
    totalCompletions: 0,
    crewTrained: 0,
    mandatoryCompletions: 0,
    recommendedCompletions: 0,
    otherCompletions: 0,
    completionRows: [],
    crewRows: [],
  });

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const selectedMonth = `${year}-${month}`;
      const response = await getMonthlyReportStatsFromDatabase(selectedMonth);

      setStats({
        totalCompletions: response?.totalCompletions || 0,
        crewTrained: response?.crewTrained || 0,
        mandatoryCompletions: response?.mandatoryCompletions || 0,
        recommendedCompletions: response?.recommendedCompletions || 0,
        otherCompletions: response?.otherCompletions || 0,
        completionRows: Array.isArray(response?.completionRows)
          ? response.completionRows
          : [],
        crewRows: Array.isArray(response?.crewRows) ? response.crewRows : [],
      });
    } catch (err) {
      console.error("Monthly Report Error:", err);
      setError("Unable to load monthly report from SQLite.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, [month, year]);

  const selectedMonthName =
    months.find((item) => item[0] === month)?.[1] || "";

  const filteredRows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return stats.completionRows;

    return stats.completionRows.filter((row) => {
      return (
        row.full_name?.toLowerCase().includes(keyword) ||
        row.crew_id?.toLowerCase().includes(keyword) ||
        row.rank?.toLowerCase().includes(keyword) ||
        row.course_code?.toLowerCase().includes(keyword) ||
        row.course_name?.toLowerCase().includes(keyword) ||
        row.course_category?.toLowerCase().includes(keyword)
      );
    });
  }, [stats.completionRows, searchText]);

  function handleDownloadReport() {
    if (stats.completionRows.length === 0) {
      alert("No completed course data found for selected month.");
      return;
    }

    const headers = [
      "S. No.",
      "User ID",
      "Crew ID",
      "User Name",
      "Rank",
      "Department",
      "Vessel",
      "Course DB ID",
      "Course Code",
      "Course Name",
      "Course Category",
      "Start Date",
      "Completion Date",
      "Progress %",
      "Status",
      "Language",
    ];

    const rows = stats.completionRows.map((row, index) => [
      index + 1,
      row.user_id,
      row.crew_id || "",
      row.full_name || `${row.first_name || ""} ${row.last_name || ""}`.trim(),
      row.rank || "",
      row.department || "",
      row.vessel || "",
      row.course_id,
      row.course_code || "",
      row.course_name || "",
      formatCategory(row.course_category),
      formatDateTime(row.started_at),
      formatDateTime(row.completed_at),
      Number(row.progress_percentage || 100),
      formatStatus(row.status),
      row.selected_language || "EN",
    ]);

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const fileName = `monthly-training-report-${year}-${month}.csv`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Monthly Training Report
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and download completed CBT course records by month.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadReport}
          className="flex items-center gap-2 rounded-lg bg-[#2554C7] px-5 py-3 text-sm font-semibold text-white hover:bg-[#173f9f]"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-500">
              Month
            </label>

            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            >
              {months.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-500">
              Year
            </label>

            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            >
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex h-11 min-w-[280px] items-center gap-2 rounded-lg border bg-[#F5F7FA] px-3">
            <Search className="h-4 w-4 text-gray-400" />

            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search user, rank, course..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ReportStatCard
          label="Total Completed"
          value={stats.totalCompletions}
          color="#2554C7"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <ReportStatCard
          label="Crew Trained"
          value={stats.crewTrained}
          color="#173f9f"
          icon={<Users className="h-5 w-5" />}
        />

        <ReportStatCard
          label="Mandatory"
          value={stats.mandatoryCompletions}
          color="#15803D"
          icon={<FileSpreadsheet className="h-5 w-5" />}
        />

        <ReportStatCard
          label="Recommended"
          value={stats.recommendedCompletions}
          color="#B45309"
          icon={<FileSpreadsheet className="h-5 w-5" />}
        />

        <ReportStatCard
          label="Other"
          value={stats.otherCompletions}
          color="#6B7280"
          icon={<FileSpreadsheet className="h-5 w-5" />}
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Completed Courses - {selectedMonthName} {year}
          </h2>

          <p className="text-sm text-gray-500">
            One row represents one user completing one course.
          </p>
        </div>

        <p className="text-sm font-semibold text-gray-500">
          Showing {filteredRows.length} of {stats.completionRows.length} records
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center">
            <p className="font-semibold text-[#163B6D]">
              Loading monthly report...
            </p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <FileSpreadsheet className="mx-auto mb-3 h-11 w-11 text-gray-300" />

            <p className="text-sm font-semibold text-gray-900">
              No completed course records found
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Completed courses for the selected month will appear here.
            </p>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[1350px] border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="border-b px-4 py-3 font-semibold">#</th>
                  <th className="border-b px-4 py-3 font-semibold">
                    Crew ID
                  </th>
                  <th className="border-b px-4 py-3 font-semibold">
                    User Name
                  </th>
                  <th className="border-b px-4 py-3 font-semibold">Rank</th>
                  <th className="border-b px-4 py-3 font-semibold">
                    Department
                  </th>
                  <th className="border-b px-4 py-3 font-semibold">
                    Course ID
                  </th>
                  <th className="border-b px-4 py-3 font-semibold">
                    Course Code
                  </th>
                  <th className="border-b px-4 py-3 font-semibold">
                    Course Name
                  </th>
                  <th className="border-b px-4 py-3 font-semibold">
                    Category
                  </th>
                  <th className="border-b px-4 py-3 font-semibold">
                    Start Date
                  </th>
                  <th className="border-b px-4 py-3 font-semibold">
                    Completion Date
                  </th>
                  <th className="border-b px-4 py-3 font-semibold">
                    Progress
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row, index) => (
                  <tr
                    key={`${row.user_id}-${row.course_id}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="border-b px-4 py-3 text-sm text-gray-500">
                      {index + 1}
                    </td>

                    <td className="border-b px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-blue-700">
                        {row.crew_id || "-"}
                      </span>
                    </td>

                    <td className="border-b px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {row.full_name ||
                          `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
                          "-"}
                      </span>
                    </td>

                    <td className="border-b px-4 py-3 text-sm text-gray-600">
                      {row.rank || "-"}
                    </td>

                    <td className="border-b px-4 py-3 text-sm text-gray-600">
                      {row.department || "-"}
                    </td>

                    <td className="border-b px-4 py-3 text-sm text-gray-600">
                      {row.course_id}
                    </td>

                    <td className="border-b px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {row.course_code || "-"}
                      </span>
                    </td>

                    <td className="border-b px-4 py-3 text-sm font-semibold text-gray-900">
                      {row.course_name || "-"}
                    </td>

                    <td className="border-b px-4 py-3">
                      <CategoryBadge category={row.course_category} />
                    </td>

                    <td className="border-b px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(row.started_at)}
                    </td>

                    <td className="border-b px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(row.completed_at)}
                    </td>

                    <td className="border-b px-4 py-3 text-sm font-semibold text-gray-900">
                      {Number(row.progress_percentage || 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ReportStatCard({ label, value, color, icon }) {
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

function formatDateTime(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) return "";

  const text = String(value);
  const escaped = text.replace(/"/g, '""');

  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}

export default MonthlyReport;