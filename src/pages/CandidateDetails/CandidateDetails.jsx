import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  saveCandidateToDatabase,
  findCandidateByPassportFromDatabase,
  getCompletedChaptersFromDatabase,
} from "../../services/databaseService";

function CandidateDetails() {
  const navigate = useNavigate();

  const existingRaw = localStorage.getItem("gemini_candidate_details");
  const existing = existingRaw ? JSON.parse(existingRaw) : {};

  const [formData, setFormData] = useState({
    candidateName: existing.candidateName || "",
    passportNumber: existing.passportNumber || "",
    rank: existing.rank || "",
    cdcNumber: existing.cdcNumber || "",
    courseName: existing.courseName || "Personal Safety",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const passportNumber = formData.passportNumber.trim();

      let candidatePayload = {
        ...formData,
        passportNumber,
        savedAt: new Date().toISOString(),
      };

      const existingCandidate =
        await findCandidateByPassportFromDatabase(passportNumber);

      let candidateId;

      if (existingCandidate) {
        candidateId = existingCandidate.id;

        candidatePayload = {
          candidateName: existingCandidate.candidate_name,
          passportNumber: existingCandidate.passport_number,
          rank: existingCandidate.rank || "",
          cdcNumber: existingCandidate.cdc_number || "",
          courseName: existingCandidate.course_name || "Personal Safety",
          savedAt: new Date().toISOString(),
        };

        const completedRows =
          await getCompletedChaptersFromDatabase(candidateId);

        const completedChapters = completedRows.map((row) =>
          String(row.chapter_id)
        );

        localStorage.setItem(
          "gemini_completed_chapters",
          JSON.stringify(completedChapters)
        );
      } else {
        candidateId = await saveCandidateToDatabase(candidatePayload);

        localStorage.removeItem("gemini_completed_chapters");
      }

      if (!candidateId) {
        throw new Error("Candidate ID not returned from database");
      }

      localStorage.setItem(
        "gemini_candidate_details",
        JSON.stringify(candidatePayload)
      );

      localStorage.setItem("gemini_candidate_id", String(candidateId));

      localStorage.removeItem("gemini_assessment_answers");
      localStorage.removeItem("gemini_assessment_result");
      localStorage.removeItem("gemini_certificate_number");
      localStorage.removeItem("gemini_result_saved_to_db");

      navigate("/dashboard");
    } catch (err) {
      console.error("Candidate Save Error:", err);
      setError(
        "Candidate could not be loaded or saved. Check Electron terminal error."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-10">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-6">
          Candidate Login / Details
        </h1>

        {error && (
          <div className="mb-5 p-4 rounded bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-2">
              Candidate Name
            </label>
            <input
              type="text"
              name="candidateName"
              value={formData.candidateName}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
              placeholder="Enter candidate name"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Passport Number
            </label>
            <input
              type="text"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
              placeholder="Enter passport number"
            />
            <p className="text-sm text-gray-500 mt-1">
              If this passport already exists, previous progress will be loaded.
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-2">Rank</label>
            <input
              type="text"
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="Enter rank"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">CDC Number</label>
            <input
              type="text"
              name="cdcNumber"
              value={formData.cdcNumber}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="Enter CDC number"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Course Name</label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {saving ? "Loading..." : "Enter CBT"}
            </button>

            <Link to="/" className="px-6 py-3 rounded bg-gray-200">
              Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CandidateDetails;