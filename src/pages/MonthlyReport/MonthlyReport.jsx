import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { generateMonthlyReportInDatabase } from "../../services/databaseService";

function MonthlyReport() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [month, setMonth] = useState(currentMonth);
  const [password, setPassword] = useState("GeminiCBT@2026");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function generateReport(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setResult(null);

      if (!month) {
        setError("Please select report month.");
        return;
      }

      if (!password) {
        setError("Please enter export encryption password.");
        return;
      }

      const response = await generateMonthlyReportInDatabase({
        month,
        password,
        generatedBy: "admin",
      });

      if (!response?.success) {
        setError(response?.message || "Unable to generate monthly report.");
        return;
      }

      setResult(response);
    } catch (err) {
      console.error("Monthly Report Error:", err);
      setError("Monthly report export failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Monthly Reports</h1>
        <p className="text-gray-500 mt-1">
          Generate encrypted month-wise CBT completion archive for office submission.
        </p>
      </div>

      <form
        onSubmit={generateReport}
        className="bg-white rounded-xl border shadow-sm p-8 mb-8"
      >
        <h2 className="text-2xl font-bold mb-5">
          Generate Monthly Export
        </h2>

        {error && (
          <div className="mb-5 rounded bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block font-semibold mb-2">Report Month</label>
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Encryption Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="px-6 py-3 rounded bg-[#173f9f] text-white disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Encrypted Report"}
        </button>

        <p className="text-sm text-gray-600 mt-4">
          This creates a JSON report and encrypted ENC archive inside the
          application user data folder. The checksum is used for tamper detection.
        </p>
      </form>

      {result && (
        <div className="bg-white rounded-xl border shadow-sm p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-5">
            Report Generated Successfully
          </h2>

          <div className="space-y-3">
            <p>
              <strong>Month:</strong> {result.month}
            </p>

            <p>
              <strong>Checksum:</strong>
            </p>

            <div className="bg-gray-100 rounded p-3 break-all text-sm">
              {result.checksum}
            </div>

            <p>
              <strong>JSON File:</strong>
            </p>

            <div className="bg-gray-100 rounded p-3 break-all text-sm">
              {result.jsonPath}
            </div>

            <p>
              <strong>Encrypted File:</strong>
            </p>

            <div className="bg-gray-100 rounded p-3 break-all text-sm">
              {result.encryptedPath}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default MonthlyReport;