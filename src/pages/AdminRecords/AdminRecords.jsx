import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllCandidatesFromDatabase,
  getAssessmentRecordsFromDatabase,
} from "../../services/databaseService";

function AdminRecords() {
  const [records, setRecords] = useState([]);
  const [candidateCount, setCandidateCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecords() {
      try {
        setError("");

        const candidates = await getAllCandidatesFromDatabase();
        const assessmentRecords = await getAssessmentRecordsFromDatabase();

        setCandidateCount(candidates.length);
        setRecords(assessmentRecords);
      } catch (err) {
        console.error("Admin Records Error:", err);
        setError("Unable to load records from SQLite.");
      }
    }

    loadRecords();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Candidate Records</h1>
          <p className="mt-2 text-gray-600">
            SQLite Candidates Found: <strong>{candidateCount}</strong>
          </p>
        </div>

        <Link to="/dashboard" className="px-4 py-2 rounded bg-gray-200">
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded bg-red-100 text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-auto bg-white rounded-xl shadow">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3">Name</th>
              <th className="border p-3">Passport</th>
              <th className="border p-3">Rank</th>
              <th className="border p-3">CDC</th>
              <th className="border p-3">Course</th>
              <th className="border p-3">Score</th>
              <th className="border p-3">%</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Certificate No</th>
              <th className="border p-3">Completed At</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td className="border p-4 text-center" colSpan="10">
                  No records found.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td className="border p-3">{record.candidate_name}</td>
                  <td className="border p-3">{record.passport_number}</td>
                  <td className="border p-3">{record.rank || "-"}</td>
                  <td className="border p-3">{record.cdc_number || "-"}</td>
                  <td className="border p-3">{record.course_name}</td>
                  <td className="border p-3">{record.correct_answers ?? "-"}</td>
                  <td className="border p-3">{record.percentage ?? "-"}</td>
                  <td className="border p-3">
                    {record.result_status ?? "NOT ATTEMPTED"}
                  </td>
                  <td className="border p-3">
                    {record.certificate_number ?? "-"}
                  </td>
                  <td className="border p-3">
                    {record.completed_at
                      ? new Date(record.completed_at).toLocaleString()
                      : "-"}
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