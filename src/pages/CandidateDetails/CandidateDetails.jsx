import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    localStorage.setItem(
      "gemini_candidate_details",
      JSON.stringify({
        ...formData,
        savedAt: new Date().toISOString(),
      })
    );

    localStorage.removeItem("gemini_assessment_answers");
    localStorage.removeItem("gemini_assessment_result");
    localStorage.removeItem("gemini_certificate_number");

    navigate("/dashboard");
  }

  return (
    <div className="max-w-3xl mx-auto p-10">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-6">Candidate Details</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-2">Candidate Name</label>
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
            <label className="block font-semibold mb-2">Passport Number</label>
            <input
              type="text"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
              placeholder="Enter passport number"
            />
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
              className="px-6 py-3 rounded bg-blue-600 text-white"
            >
              Enter CBT
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