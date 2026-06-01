import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { loadCourse } from "../../services/courseLoader";

function getCompletedChapters() {
  const raw = localStorage.getItem("gemini_completed_chapters");
  return raw ? JSON.parse(raw) : [];
}

function Dashboard() {
  const [course, setCourse] = useState(null);
  const [completedChapters, setCompletedChapters] = useState([]);

  useEffect(() => {
    async function fetchCourse() {
      const data = await loadCourse();
      setCourse(data);
      setCompletedChapters(getCompletedChapters());
    }

    fetchCourse();
  }, []);

  if (!course) {
    return <div className="p-8 text-lg font-semibold">Loading...</div>;
  }

  const trainingChapters = course.chapters.filter(
    (chapter) => chapter["@_ass"] !== "X"
  );

  const assessmentChapter = course.chapters.find(
    (chapter) => chapter["@_ass"] === "X"
  );

  const candidateRaw = localStorage.getItem("gemini_candidate_details");
  const candidate = candidateRaw ? JSON.parse(candidateRaw) : null;

  const allChaptersCompleted = trainingChapters.every((_, index) =>
    completedChapters.includes(String(index + 1))
  );

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">{course.name}</h1>

          {candidate && (
            <p className="mt-3 text-gray-700">
              Candidate: <strong>{candidate.candidateName}</strong>
              {candidate.passportNumber ? (
                <> | Passport: <strong>{candidate.passportNumber}</strong></>
              ) : null}
            </p>
          )}
        </div>

        <Link to="/" className="px-4 py-2 rounded bg-gray-200">
          Change Candidate
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Learning Objectives</h2>

        <ul className="list-disc pl-8 space-y-2">
          {course.objectives.map((obj, index) => (
            <li key={index}>{obj}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Training Chapters</h2>

        <div className="space-y-3">
          {trainingChapters.map((chapter, index) => {
            const chapterId = String(index + 1);
            const isCompleted = completedChapters.includes(chapterId);

            return (
              <Link
                key={chapterId}
                to={`/course/${chapterId}/1`}
                className={`block border rounded-lg p-5 transition ${
                  isCompleted
                    ? "bg-green-50 border-green-300 hover:bg-green-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      Chapter {chapterId}: {chapter["@_name"]}
                    </h3>

                    <p>Pages: {chapter["@_nrPages"]}</p>
                    <p>Questions: {chapter["@_nrQuest"]}</p>
                  </div>

                  <div
                    className={`font-bold ${
                      isCompleted ? "text-green-700" : "text-yellow-700"
                    }`}
                  >
                    {isCompleted ? "Completed" : "Pending"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {assessmentChapter && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Final Assessment</h2>

          {allChaptersCompleted ? (
            <Link
              to="/assessment/q1"
              className="block border rounded-lg p-5 bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <h3 className="font-bold text-lg mb-2">
                {assessmentChapter["@_name"] || "Assessment"}
              </h3>

              <p>Questions: {assessmentChapter["@_nrQuest"]}</p>
              <p className="mt-2 text-sm opacity-90">
                All chapters completed. You can now start the final assessment.
              </p>
            </Link>
          ) : (
            <div className="block border rounded-lg p-5 bg-gray-100 text-gray-600">
              <h3 className="font-bold text-lg mb-2">
                {assessmentChapter["@_name"] || "Assessment"}
              </h3>

              <p>Questions: {assessmentChapter["@_nrQuest"]}</p>
              <p className="mt-2 text-sm">
                Complete all training chapters before starting the final assessment.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default Dashboard;