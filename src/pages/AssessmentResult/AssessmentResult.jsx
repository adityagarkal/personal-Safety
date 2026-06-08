import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { assessmentStructure } from "../../data/courseStructure";
import { saveCBTCompletionToDatabase } from "../../services/databaseService";

const PASS_PERCENTAGE = 70;

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

function getLoginUser() {
  const raw = localStorage.getItem("gemini_login_user");
  return raw ? JSON.parse(raw) : null;
}

function getSelectedCourse() {
  const raw = localStorage.getItem("selected_course");
  return raw ? JSON.parse(raw) : null;
}

function AssessmentResult() {
  const resultRaw = localStorage.getItem("gemini_assessment_result");
  const result = resultRaw ? JSON.parse(resultRaw) : null;

  const loginUser = getLoginUser();
  const selectedCourse = getSelectedCourse();

  const passed = result ? result.percentage >= PASS_PERCENTAGE : false;

  const certificateNumber = useMemo(() => {
    const existing = localStorage.getItem("gemini_certificate_number");

    if (existing) return existing;

    const generated = generateCertificateNumber();
    localStorage.setItem("gemini_certificate_number", generated);
    return generated;
  }, []);

  const crewName =
    loginUser?.fullName ||
    loginUser?.full_name ||
    `${loginUser?.first_name || ""} ${loginUser?.last_name || ""}`.trim() ||
    loginUser?.username ||
    "Crew Member";

  const crewId = loginUser?.crew_id || "-";
  const rank = loginUser?.rank || "-";
  const department = loginUser?.department || "-";
  const nationality = loginUser?.nationality || "-";
  const vessel = loginUser?.vessel || "-";

  const courseName = selectedCourse?.name || "Personal Safety";
  const moduleVersion = "1.0";

  useEffect(() => {
    async function saveCompletionRecord() {
      try {
        if (!result || !loginUser?.id) return;

        const alreadySaved = localStorage.getItem(
          "gemini_completion_saved_to_db"
        );

        if (alreadySaved === "yes") return;

        await saveCBTCompletionToDatabase({
          userId: Number(loginUser.id),
          moduleName: courseName,
          moduleVersion,
          score: result.percentage,
          status: passed ? "PASS" : "FAIL",
          certificateNumber: passed ? certificateNumber : "",
        });

        localStorage.setItem("gemini_completion_saved_to_db", "yes");
      } catch (error) {
        console.error("CBT Completion Save Error:", error);
      }
    }

    saveCompletionRecord();
  }, [result, loginUser?.id, courseName, moduleVersion, passed, certificateNumber]);

  function retakeAssessment() {
    sessionStorage.removeItem("gemini_assessment_answers_session");
    localStorage.removeItem("gemini_assessment_result");
    localStorage.removeItem("gemini_certificate_number");
    localStorage.removeItem("gemini_completion_saved_to_db");

    window.location.href = "#/assessment/q1";
  }

  function printCertificate() {
    window.print();
  }

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto p-10">
        <h1 className="text-3xl font-bold mb-4">
          No Assessment Result Found
        </h1>

        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 rounded bg-blue-600 text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <div className="bg-white rounded-xl shadow p-8 mb-8 no-print">
        <h1 className="text-4xl font-bold mb-6">Assessment Result</h1>

        <div className="space-y-4 text-lg">
          <p>
            <strong>Crew Name:</strong> {crewName}
          </p>

          <p>
            <strong>Crew ID:</strong> {crewId}
          </p>

          <p>
            <strong>Rank:</strong> {rank}
          </p>

          <p>
            <strong>Vessel:</strong> {vessel}
          </p>

          <p>
            <strong>Course:</strong> {courseName}
          </p>

          <p>
            <strong>Version:</strong> {moduleVersion}
          </p>

          <p>
            <strong>Total Questions:</strong> {assessmentStructure.length}
          </p>

          <p>
            <strong>Correct Answers:</strong> {result.correct}
          </p>

          <p>
            <strong>Wrong Answers:</strong> {result.total - result.correct}
          </p>

          <p>
            <strong>Score:</strong> {result.correct} / {result.total}
          </p>

          <p>
            <strong>Percentage:</strong> {result.percentage}%
          </p>

          <p
            className={`text-2xl font-bold ${
              passed ? "text-green-700" : "text-red-700"
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

          <Link to="/dashboard" className="px-6 py-3 rounded bg-gray-200">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {passed && (
        <div className="certificate bg-white border-4 border-gray-800 p-12 text-center">
          <h1 className="text-4xl font-bold mb-4">GEMINI CBT</h1>

          <p className="text-2xl font-semibold mb-8">
            Certificate of Completion
          </p>

          <p className="text-xl mb-6">This is to certify that</p>

          <h2 className="text-3xl font-bold mb-6">{crewName}</h2>

          <p className="text-xl mb-6">
            has successfully completed the CBT course
          </p>

          <h3 className="text-2xl font-bold mb-8">{courseName}</h3>

          <div className="grid grid-cols-2 gap-6 text-left max-w-3xl mx-auto mb-10">
            <p>
              <strong>Certificate No:</strong> {certificateNumber}
            </p>

            <p>
              <strong>Issue Date:</strong> {getTodayDate()}
            </p>

            <p>
              <strong>Crew ID:</strong> {crewId}
            </p>

            <p>
              <strong>Username:</strong> {loginUser?.username || "-"}
            </p>

            <p>
              <strong>Rank:</strong> {rank}
            </p>

            <p>
              <strong>Department:</strong> {department}
            </p>

            <p>
              <strong>Nationality:</strong> {nationality}
            </p>

            <p>
              <strong>Vessel:</strong> {vessel}
            </p>

            <p>
              <strong>Course Version:</strong> {moduleVersion}
            </p>

            <p>
              <strong>Score:</strong> {result.correct} / {result.total}
            </p>

            <p>
              <strong>Percentage:</strong> {result.percentage}%
            </p>

            <p>
              <strong>Status:</strong> PASS
            </p>

            <p>
              <strong>Pass Mark:</strong> {PASS_PERCENTAGE}%
            </p>
          </div>

          <div className="mt-12 text-center">
            <p className="font-semibold">
              Gemini Ship Management in association with Nordic Seascape
            </p>
            <p className="text-sm mt-2">
              This certificate is system generated and linked with immutable CBT
              completion records.
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