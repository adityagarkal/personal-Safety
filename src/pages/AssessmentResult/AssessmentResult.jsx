import { Link } from "react-router-dom";
import { useEffect } from "react";
import { assessmentStructure } from "../../data/courseStructure";
import {
  saveAssessmentResultToDatabase,
  saveCertificateToDatabase,
} from "../../services/databaseService";

function generateCertificateNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `GCBT-${year}-${random}`;
}

function getTodayDate() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function AssessmentResult() {
  const resultRaw = localStorage.getItem("gemini_assessment_result");
  const candidateRaw = localStorage.getItem("gemini_candidate_details");

  const result = resultRaw ? JSON.parse(resultRaw) : null;
  const candidate = candidateRaw ? JSON.parse(candidateRaw) : null;

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto p-10">
        <h1 className="text-3xl font-bold mb-4">
          No Assessment Result Found
        </h1>

        <Link
          to="/candidate-details"
          className="inline-block px-6 py-3 rounded bg-blue-600 text-white"
        >
          Start Assessment
        </Link>
      </div>
    );
  }

  const passed = result.percentage >= 70;

  const certificateNumber =
    localStorage.getItem("gemini_certificate_number") ||
    generateCertificateNumber();

  localStorage.setItem("gemini_certificate_number", certificateNumber);

  const candidateName = candidate?.candidateName || "Candidate Name";
  const passportNumber = candidate?.passportNumber || "N/A";
  const rank = candidate?.rank || "N/A";
  const cdcNumber = candidate?.cdcNumber || "N/A";
  const courseName = candidate?.courseName || "Personal Safety";

  useEffect(() => {
    async function saveToDatabase() {
      try {
        const alreadySaved = localStorage.getItem(
          "gemini_result_saved_to_db"
        );

        if (alreadySaved === "yes") return;

        const candidateId = localStorage.getItem(
          "gemini_candidate_id"
        );

        if (!candidateId) return;

        await saveAssessmentResultToDatabase({
          candidateId: Number(candidateId),
          total: result.total,
          correct: result.correct,
          percentage: result.percentage,
          passed,
        });

        if (passed) {
          await saveCertificateToDatabase({
            candidateId: Number(candidateId),
            certificateNumber,
            courseName,
          });
        }

        localStorage.setItem(
          "gemini_result_saved_to_db",
          "yes"
        );
      } catch (error) {
        console.error("Database Save Error:", error);
      }
    }

    saveToDatabase();
  }, []);

  function retakeAssessment() {
    localStorage.removeItem("gemini_assessment_answers");
    localStorage.removeItem("gemini_assessment_result");
    localStorage.removeItem("gemini_certificate_number");
    localStorage.removeItem("gemini_result_saved_to_db");

    window.location.href = "#/candidate-details";
  }

  function printCertificate() {
    window.print();
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <div className="bg-white rounded-xl shadow p-8 mb-8 no-print">
        <h1 className="text-4xl font-bold mb-6">
          Assessment Result
        </h1>

        <div className="space-y-4 text-lg">
          <p>
            <strong>Candidate Name:</strong> {candidateName}
          </p>

          <p>
            <strong>Passport Number:</strong> {passportNumber}
          </p>

          <p>
            <strong>Course:</strong> {courseName}
          </p>

          <p>
            <strong>Total Questions:</strong>{" "}
            {assessmentStructure.length}
          </p>

          <p>
            <strong>Correct Answers:</strong> {result.correct}
          </p>

          <p>
            <strong>Wrong Answers:</strong>{" "}
            {result.total - result.correct}
          </p>

          <p>
            <strong>Score:</strong>{" "}
            {result.correct} / {result.total}
          </p>

          <p>
            <strong>Percentage:</strong>{" "}
            {result.percentage}%
          </p>

          <p
            className={`text-2xl font-bold ${
              passed
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            Status: {passed ? "PASS" : "FAIL"}
          </p>
        </div>

        <div className="flex gap-4 mt-8">
          {passed && (
            <button
              onClick={printCertificate}
              className="px-6 py-3 rounded bg-green-600 text-white"
            >
              Print / Save Certificate
            </button>
          )}

          <button
            onClick={retakeAssessment}
            className="px-6 py-3 rounded bg-blue-600 text-white"
          >
            Retake Assessment
          </button>

          <Link
            to="/dashboard"
            className="px-6 py-3 rounded bg-gray-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {passed && (
        <div className="certificate bg-white border-4 border-gray-800 p-12 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Gemini CBT Certificate
          </h1>

          <p className="text-lg mb-8">
            Certificate of Successful Completion
          </p>

          <p className="text-xl mb-6">
            This is to certify that
          </p>

          <h2 className="text-3xl font-bold mb-6">
            {candidateName}
          </h2>

          <p className="text-xl mb-6">
            has successfully completed the course
          </p>

          <h3 className="text-2xl font-bold mb-8">
            {courseName}
          </h3>

          <div className="grid grid-cols-2 gap-6 text-left max-w-2xl mx-auto mb-10">
            <p>
              <strong>Certificate No:</strong>{" "}
              {certificateNumber}
            </p>

            <p>
              <strong>Issue Date:</strong>{" "}
              {getTodayDate()}
            </p>

            <p>
              <strong>Passport No:</strong>{" "}
              {passportNumber}
            </p>

            <p>
              <strong>CDC No:</strong> {cdcNumber}
            </p>

            <p>
              <strong>Rank:</strong> {rank}
            </p>

            <p>
              <strong>Score:</strong>{" "}
              {result.correct} / {result.total}
            </p>

            <p>
              <strong>Percentage:</strong>{" "}
              {result.percentage}%
            </p>

            <p>
              <strong>Status:</strong> PASS
            </p>

            <p>
              <strong>Pass Mark:</strong> 70%
            </p>
          </div>

          <div className="flex justify-between mt-16 text-center">
            <div>
              <div className="border-t border-black w-48 mb-2"></div>
              <p>Candidate Signature</p>
            </div>

            <div>
              <div className="border-t border-black w-48 mb-2"></div>
              <p>Authorized Signature</p>
            </div>
          </div>
        </div>
      )}

      {!passed && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-6 text-red-800">
          Certificate is available only after passing the assessment.
        </div>
      )}

      <style>
        {`
          @media print {
            body {
              background: white;
            }

            .no-print {
              display: none !important;
            }

            .certificate {
              border: 4px solid #111;
              box-shadow: none;
              margin: 0;
              width: 100%;
              min-height: 90vh;
            }
          }
        `}
      </style>
    </div>
  );
}

export default AssessmentResult;