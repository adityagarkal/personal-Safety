import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";

import {
  loadCoursePage,
  getEnglishPage,
  getPageTexts,
  getPagePics,
  getPageSounds,
  isQuizPage,
} from "../../services/courseLoader";

import {
  courseStructure,
  assessmentStructure,
} from "../../data/courseStructure";

import { answerKey } from "../../data/answerKey";

import { markChapterCompletedInDatabase } from "../../services/databaseService";

const CONTENT_BASE_PATH = "/content/001-Personal_Safety_2009/p_safety";
const PASS_PERCENTAGE = 70;

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function getOptionText(option) {
  return option?.["#text"] || option?.["@_match"] || "";
}

function getPicFileName(pic) {
  const fileName = typeof pic === "string" ? pic : pic?.["#text"];
  if (!fileName || !fileName.endsWith(".swf")) return null;
  return fileName.replace(".swf", ".jpg");
}

function getStoredAssessmentAnswers() {
  const raw = localStorage.getItem("gemini_assessment_answers");
  return raw ? JSON.parse(raw) : {};
}

function saveAssessmentAnswer(questionId, isCorrect) {
  const answers = getStoredAssessmentAnswers();

  answers[questionId] = {
    isCorrect,
    submittedAt: new Date().toISOString(),
  };

  localStorage.setItem("gemini_assessment_answers", JSON.stringify(answers));
}

async function markChapterCompleted(chapterId) {
  const raw = localStorage.getItem("gemini_completed_chapters");
  const completed = raw ? JSON.parse(raw) : [];

  if (!completed.includes(String(chapterId))) {
    completed.push(String(chapterId));
  }

  localStorage.setItem("gemini_completed_chapters", JSON.stringify(completed));

  try {
    const candidateId = localStorage.getItem("gemini_candidate_id");

    if (candidateId) {
      await markChapterCompletedInDatabase({
        candidateId,
        chapterId,
      });
    }
  } catch (error) {
    console.error("Chapter Progress Save Error:", error);
  }
}

function calculateAssessmentResult() {
  const answers = getStoredAssessmentAnswers();

  const total = assessmentStructure.length;
  const correct = assessmentStructure.filter((questionId) => {
    const key = `5/${questionId}`;
    return answers[key]?.isCorrect === true;
  }).length;

  const percentage = Math.round((correct / total) * 100);
  const passed = percentage >= PASS_PERCENTAGE;

  const result = {
    total,
    correct,
    percentage,
    passed,
    passPercentage: PASS_PERCENTAGE,
    completedAt: new Date().toISOString(),
  };

  localStorage.setItem("gemini_assessment_result", JSON.stringify(result));
  return result;
}

function CourseViewer() {
  const { chapterId, pageNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isAssessment = location.pathname.startsWith("/assessment");
  const actualChapterId = isAssessment ? "5" : chapterId;

  const [pageData, setPageData] = useState(null);
  const [error, setError] = useState("");
  const [audioIndex, setAudioIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [currentAnswerCorrect, setCurrentAnswerCorrect] = useState(false);

  useEffect(() => {
    async function loadPage() {
      try {
        setError("");
        setAudioIndex(0);
        setPageData(null);
        setSelectedOptions([]);
        setSubmitted(false);
        setCurrentAnswerCorrect(false);

        const data = await loadCoursePage(actualChapterId, pageNumber);
        setPageData(data);
      } catch (err) {
        console.error(err);
        setError("Page not found");
      }
    }

    loadPage();
  }, [actualChapterId, pageNumber]);

  if (error) {
    return (
      <div className="p-10">
        <h2 className="text-red-600 text-2xl font-bold">{error}</h2>
      </div>
    );
  }

  if (!pageData) return <div className="p-10">Loading...</div>;

  const englishPage = getEnglishPage(pageData);
  const texts = getPageTexts(englishPage);
  const pics = getPagePics(englishPage);
  const sounds = getPageSounds(englishPage);

  const currentSequence = isAssessment
    ? assessmentStructure
    : courseStructure[actualChapterId] || [];

  const currentIndex = currentSequence.indexOf(pageNumber);

  const previousPage =
    currentIndex > 0 ? currentSequence[currentIndex - 1] : null;

  const nextPage =
    currentIndex < currentSequence.length - 1
      ? currentSequence[currentIndex + 1]
      : null;

  const quizPage = isQuizPage(pageNumber);
  const answerKeyId = `${actualChapterId}/${pageNumber}`;
  const currentAnswerKey = answerKey[answerKeyId];

  const question = quizPage
    ? texts.find((txt) => txt?.["@_pt"] === "1")
    : null;

  const normalOptions = quizPage
    ? texts.filter(
        (txt) =>
          txt?.["@_crct"] &&
          txt["@_crct"] !== "C" &&
          txt["@_crct"] !== "I"
      )
    : [];

  const convertedMatchingOptions = quizPage
    ? texts.filter((txt) => txt?.["@_match"])
    : [];

  const quizOptions =
    convertedMatchingOptions.length > 0
      ? convertedMatchingOptions
      : normalOptions;

  const questionType = currentAnswerKey?.type || "single";

  const selectedAnswerTexts = selectedOptions.map((index) =>
    normalizeText(getOptionText(quizOptions[index]))
  );

  const correctAnswerTexts =
    currentAnswerKey?.correctAnswers?.map((answer) => normalizeText(answer)) ||
    [];

  function checkAnswer() {
    if (!currentAnswerKey) return false;

    if (selectedAnswerTexts.length !== correctAnswerTexts.length) return false;

    return correctAnswerTexts.every((answer) =>
      selectedAnswerTexts.includes(answer)
    );
  }

  function handleOptionClick(index) {
    if (submitted) return;

    if (questionType === "multiple") {
      setSelectedOptions((prev) =>
        prev.includes(index)
          ? prev.filter((item) => item !== index)
          : [...prev, index]
      );
    } else {
      setSelectedOptions([index]);
    }
  }

  function handleSubmitAnswer() {
    const isCorrect = checkAnswer();

    setCurrentAnswerCorrect(isCorrect);
    setSubmitted(true);

    if (isAssessment) {
      saveAssessmentAnswer(answerKeyId, isCorrect);
    }
  }

  async function handleNext() {
    if (isAssessment && !nextPage) {
      calculateAssessmentResult();
      navigate("/assessment-result");
      return;
    }

    if (!isAssessment && !nextPage) {
      await markChapterCompleted(actualChapterId);
      navigate("/dashboard");
      return;
    }

    if (nextPage) {
      navigate(
        isAssessment
          ? `/assessment/${nextPage}`
          : `/course/${actualChapterId}/${nextPage}`
      );
    }
  }

  const previousLink = isAssessment
    ? `/assessment/${previousPage}`
    : `/course/${actualChapterId}/${previousPage}`;

  return (
    <div
      key={`${actualChapterId}-${pageNumber}`}
      className="max-w-5xl mx-auto p-10"
    >
      <div className="flex justify-between items-center mb-8">
        {previousPage ? (
          <Link to={previousLink} className="px-4 py-2 rounded bg-gray-200">
            Previous
          </Link>
        ) : (
          <button
            disabled
            className="px-4 py-2 rounded bg-gray-200 opacity-50"
          >
            Previous
          </button>
        )}

        <h2 className="font-bold">
          {isAssessment
            ? `Assessment - ${pageNumber}`
            : `Chapter ${actualChapterId} - ${pageNumber}`}
        </h2>

        {nextPage ? (
          <button
            onClick={handleNext}
            disabled={quizPage && !submitted}
            className="px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={quizPage && !submitted}
            className="px-4 py-2 rounded bg-green-500 text-white disabled:opacity-50"
          >
            {isAssessment ? "View Result" : "Finish Chapter"}
          </button>
        )}
      </div>

      {quizPage ? (
        <div className="bg-white rounded-xl shadow p-8">
          <h1 className="text-3xl font-bold mb-8">
            {isAssessment ? "Assessment Question" : "Quiz Question"}
          </h1>

          <h2 className="text-xl font-semibold mb-6">
            {question?.["#text"] || ""}
          </h2>

          <div className="space-y-4">
            {quizOptions.map((option, index) => {
              const isSelected = selectedOptions.includes(index);

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  className={`w-full text-left border rounded-lg p-4 transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:bg-blue-50"
                  }`}
                >
                  <span className="font-semibold mr-2">
                    {questionType === "multiple" ? "☐" : "○"}
                  </span>
                  {getOptionText(option)}
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            {!submitted ? (
              <button
                disabled={selectedOptions.length === 0}
                onClick={handleSubmitAnswer}
                className="px-6 py-3 rounded bg-blue-600 text-white disabled:opacity-50"
              >
                Submit Answer
              </button>
            ) : (
              <div
                className={`p-4 rounded font-semibold ${
                  currentAnswerCorrect
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {currentAnswerCorrect ? "Correct Answer" : "Incorrect Answer"}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-8">
            {englishPage?.title || "Untitled"}
          </h1>

          {pics.map((pic, index) => {
            const jpgFile = getPicFileName(pic);
            if (!jpgFile) return null;

            return (
              <img
                key={index}
                src={`${CONTENT_BASE_PATH}/pic/${jpgFile}`}
                alt=""
                className="w-full rounded-lg shadow mb-6"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            );
          })}

          <div className="space-y-4 mb-8">
            {texts.map((text, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                {text?.["#text"] || ""}
              </div>
            ))}
          </div>
        </>
      )}

      {sounds.length > 0 && sounds[audioIndex] ? (
        <audio
          key={audioIndex}
          controls
          autoPlay
          className="w-full mt-8"
          onEnded={() => {
            if (audioIndex < sounds.length - 1) {
              setAudioIndex((prev) => prev + 1);
            }
          }}
        >
          <source
            src={`${CONTENT_BASE_PATH}/snd/${sounds[audioIndex]}`}
            type="audio/mpeg"
          />
          Your browser does not support audio.
        </audio>
      ) : null}
    </div>
  );
}

export default CourseViewer;