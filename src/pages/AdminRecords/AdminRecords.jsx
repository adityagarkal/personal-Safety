import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssessmentRecordsFromDatabase } from "../../services/databaseService";

function AdminRecords() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecords() {
      try {
        setError("");
        const assessmentRecords = await getAssessmentRecordsFromDatabase();
        setRecords(assessmentRecords);
      } catch (err) {
        console.error("Admin Records Error:", err);
        setError("Unable to load completion records from SQLite.");
      }
    }

    loadRecords();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">CBT Completion Records</h1>
          <p className="mt-2 text-gray-600">
            Completion records are read-only and must not be modified by admin.
          </p>
        </div>

        <Link to="/admin-dashboard" className="px-4 py-2 rounded bg-gray-200">
          Back to Admin Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded bg-red-100 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8 bg-yellow-50 border border-yellow-300 rounded-xl p-5">
        <h2 className="text-xl font-bold mb-3">
          CBT Completion Record Security Requirements
        </h2>

        <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
          <li>Completion records are locked after submission.</li>
          <li>Admin cannot modify completion status, date/time, score, answers, or certificates.</li>
          <li>Any correction or retraining must create a new transaction record.</li>
          <li>Historical completion records must remain permanently available for audit.</li>
          <li>Training module revisions must be version-controlled.</li>
          <li>Monthly reports should be exported and encrypted before sending to office.</li>
        </ul>
      </div>

      <div className="overflow-auto bg-white rounded-xl shadow">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3">User / Candidate</th>
              <th className="border p-3">Module</th>
              <th className="border p-3">Version</th>
              <th className="border p-3">Score</th>
              <th className="border p-3">Percentage</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Certificate No</th>
              <th className="border p-3">Completion Date/Time</th>
              <th className="border p-3">Record Status</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td className="border p-4 text-center" colSpan="9">
                  No CBT completion records found.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td className="border p-3">{record.candidate_name || "-"}</td>
                  <td className="border p-3">{record.course_name || "-"}</td>
                  <td className="border p-3">v1.0</td>
                  <td className="border p-3">{record.correct_answers ?? "-"}</td>
                  <td className="border p-3">
                    {record.percentage !== null && record.percentage !== undefined
                      ? `${record.percentage}%`
                      : "-"}
                  </td>
                  <td className="border p-3">
                    {record.result_status ?? "NOT COMPLETED"}
                  </td>
                  <td className="border p-3">
                    {record.certificate_number ?? "-"}
                  </td>
                  <td className="border p-3">
                    {record.completed_at
                      ? new Date(record.completed_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="border p-3 font-bold text-green-700">
                    READ ONLY
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminRecords;