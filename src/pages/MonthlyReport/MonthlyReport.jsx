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

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <p className="text-sm uppercase text-gray-500 font-semibold">{label}</p>
      <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
    </div>
  );
}

function MonthlyReport() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [stats, setStats] = useState({
    totalCompletions: 0,
    crewTrained: 0,
    averageScore: 0,
  });
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setError("");
      const selectedMonth = `${year}-${month}`;
      const response = await getMonthlyReportStatsFromDatabase(selectedMonth);

      setStats({
        totalCompletions: response?.totalCompletions || 0,
        crewTrained: response?.crewTrained || 0,
        averageScore: Math.round(response?.averageScore || 0),
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
    months.find((item) => item[0] === month)?.[1]?.toUpperCase() || "";

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Monthly Training Reports
        </h1>
        <p className="text-gray-500 mt-1">
          Aggregated training metrics by month and year
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-5 mb-6 flex gap-4 items-center">
        <label className="font-semibold">Month</label>
        <select
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="border rounded-lg px-4 py-3 w-44"
        >
          {months.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label className="font-semibold">Year</label>
        <select
          value={year}
          onChange={(event) => setYear(event.target.value)}
          className="border rounded-lg px-4 py-3 w-44"
        >
          <option value="2026">2026</option>
          <option value="2027">2027</option>
          <option value="2028">2028</option>
        </select>

        <button
          onClick={loadReport}
          className="px-6 py-3 rounded-lg bg-[#2554C7] text-white font-semibold"
        >
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Total CBTs Completed"
          value={stats.totalCompletions}
          color="text-blue-700"
        />
        <StatCard
          label="Crew Trained"
          value={stats.crewTrained}
          color="text-blue-900"
        />
        <StatCard
          label="Mandatory Completions"
          value={stats.totalCompletions}
          color="text-green-700"
        />
        <StatCard
          label="Recommended Completions"
          value="0"
          color="text-orange-700"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <h2 className="font-bold mb-3">Crew Completion Summary</h2>

          <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-gray-500">
            Crew-wise monthly completion table will be connected in the next step.
          </div>
        </div>

        <div>
          <h2 className="font-bold mb-3">Top Completed Courses</h2>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-5">
              {selectedMonthName} {year}
            </p>

            <div className="text-gray-500 text-sm">
              Course-wise completion count will be connected in the next step.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default MonthlyReport;