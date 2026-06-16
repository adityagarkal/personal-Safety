import { useEffect, useState } from "react";
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

const years = ["2026", "2027", "2028"];

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `${color}15`,
          color,
        }}
      >
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          {label}
        </p>
        <p
          className="text-2xl font-bold tabular-nums"
          style={{ color }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function MonthlyReport() {
  const now = new Date();

  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(String(now.getFullYear()));
  const [generated, setGenerated] = useState(true);

  const [stats, setStats] = useState({
    totalCompletions: 0,
    crewTrained: 0,
    averageScore: 0,
    mandatoryCompletions: 0,
    recommendedCompletions: 0,
    crewRows: [],
    topCourses: [],
  });

  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setError("");
      setGenerated(true);

      const selectedMonth = `${year}-${month}`;
      const response = await getMonthlyReportStatsFromDatabase(selectedMonth);

      setStats({
        totalCompletions: response?.totalCompletions || 0,
        crewTrained: response?.crewTrained || 0,
        averageScore: Math.round(response?.averageScore || 0),

        mandatoryCompletions:
          response?.mandatoryCompletions || response?.totalCompletions || 0,

        recommendedCompletions: response?.recommendedCompletions || 0,

        crewRows: Array.isArray(response?.crewRows) ? response.crewRows : [],
        topCourses: Array.isArray(response?.topCourses)
          ? response.topCourses
          : [],
      });
    } catch (err) {
      console.error("Monthly Report Error:", err);
      setError("Unable to load monthly report from SQLite.");
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const selectedMonthName =
    months.find((item) => item[0] === month)?.[1] || "";

  const maxCompletions =
    stats.topCourses.length > 0
      ? Math.max(...stats.topCourses.map((course) => course.completions || 0))
      : 1;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Monthly Training Reports
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Aggregated training metrics by month and year
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm mb-6 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-500">Month</label>
          <select
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setGenerated(false);
            }}
            className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
          >
            {months.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-500">Year</label>
          <select
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              setGenerated(false);
            }}
            className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
          >
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={loadReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2554C7] text-white text-sm font-semibold hover:bg-[#173f9f]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Generate Report
        </button>
      </div>

      {generated ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total CBTs Completed"
              value={stats.totalCompletions}
              color="#2554C7"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
            />

            <StatCard
              label="Crew Trained"
              value={stats.crewTrained}
              color="#173f9f"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />

            <StatCard
              label="Mandatory Completions"
              value={stats.mandatoryCompletions}
              color="#15803D"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              }
            />

            <StatCard
              label="Recommended Completions"
              value={stats.recommendedCompletions}
              color="#B45309"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Crew Completion Summary
              </h2>

              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {stats.crewRows.length === 0 ? (
                  <div className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-300"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>

                      <p className="text-sm font-semibold text-gray-900">
                        No crew completion data available
                      </p>
                      <p className="text-xs text-gray-500">
                        Crew-wise monthly completion table will appear here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                        <th className="px-4 py-3 border-b font-semibold">
                          Crew ID
                        </th>
                        <th className="px-4 py-3 border-b font-semibold">
                          Name
                        </th>
                        <th className="px-4 py-3 border-b font-semibold">
                          Rank
                        </th>
                        <th className="px-4 py-3 border-b font-semibold">
                          CBTs Completed
                        </th>
                        <th className="px-4 py-3 border-b font-semibold">
                          Last Completion
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {stats.crewRows.map((row) => (
                        <tr
                          key={row.crewId || row.crew_id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3 border-b">
                            <span className="font-mono text-sm font-semibold text-blue-700">
                              {row.crewId || row.crew_id || "-"}
                            </span>
                          </td>

                          <td className="px-4 py-3 border-b">
                            <span className="text-sm font-semibold text-gray-900">
                              {row.name || row.full_name || "-"}
                            </span>
                          </td>

                          <td className="px-4 py-3 border-b text-sm text-gray-500">
                            {row.rank || "-"}
                          </td>

                          <td className="px-4 py-3 border-b">
                            <span className="text-sm font-bold text-gray-900">
                              {row.cbtsCompleted ||
                                row.cbts_completed ||
                                row.total_completed ||
                                0}
                            </span>
                          </td>

                          <td className="px-4 py-3 border-b text-sm text-gray-500">
                            {row.lastCompletionDate ||
                              row.last_completion_date ||
                              "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Top Completed Courses
              </h2>

              <div className="bg-white rounded-xl border shadow-sm p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
                  {selectedMonthName} {year}
                </p>

                {stats.topCourses.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-500">
                    Course-wise completion count will appear here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.topCourses.map((course, index) => {
                      const completions =
                        course.completions || course.total || 0;

                      return (
                        <div key={course.course || course.course_name}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span
                                className={`text-xs font-bold w-4 shrink-0 ${
                                  index === 0
                                    ? "text-orange-700"
                                    : "text-gray-400"
                                }`}
                              >
                                {index + 1}
                              </span>

                              <span
                                className="text-sm truncate text-gray-900"
                                title={course.course || course.course_name}
                              >
                                {course.course || course.course_name || "-"}
                              </span>
                            </div>

                            <span className="text-sm font-bold text-blue-700 ml-2 shrink-0">
                              {completions}
                            </span>
                          </div>

                          <div className="h-1.5 rounded-full ml-6 bg-gray-200">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${Math.round(
                                  (completions / maxCompletions) * 100
                                )}%`,
                                backgroundColor:
                                  index === 0
                                    ? "#2554C7"
                                    : index === 1
                                    ? "#4B7BEC"
                                    : "#7FA8E8",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400 mb-3"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>

          <p className="text-sm font-semibold text-gray-900">
            Select filters and generate report
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Choose a month and year, then click Generate Report.
          </p>
        </div>
      )}
    </AdminLayout>
  );
}

export default MonthlyReport;