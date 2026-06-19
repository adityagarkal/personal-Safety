import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Home,
  LogOut,
  Volume2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  completeUserCourseInDatabase,
  getCoursesFromDatabase,
  getUserCourseProgressFromDatabase,
  saveUserCourseProgressToDatabase,
} from "../../services/databaseService";
import { loadCourseManifest, loadCoursePageContent} from "../../services/coursePlayerService";
import CoursePageRenderer from "../../components/course-player/CoursePageRenderer";

function getSelectedCourse() {
  try {
    const storedCourse = localStorage.getItem("gemini_selected_course");
    return storedCourse ? JSON.parse(storedCourse) : null;
  } catch {
    return null;
  }
}

function getLoggedInUser() {
  try {
    const storedUser = localStorage.getItem("gemini_login_user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function getResumePosition(courseManifest, savedProgress) {
  const chapters = courseManifest?.chapters || [];

  if (!savedProgress || savedProgress.status !== "in_progress") {
    const firstChapter = chapters[0];

    return {
      chapterId: firstChapter?.id || "",
      pageIndex: 0,
    };
  }

  const savedChapter = chapters.find(
    (chapter) => String(chapter.id) === String(savedProgress.current_chapter)
  );

  if (!savedChapter) {
    const firstChapter = chapters[0];

    return {
      chapterId: firstChapter?.id || "",
      pageIndex: 0,
    };
  }

  const savedPageIndex = savedChapter.pages?.findIndex(
    (page) => String(page.id) === String(savedProgress.current_page)
  );

  return {
    chapterId: savedChapter.id,
    pageIndex: savedPageIndex >= 0 ? savedPageIndex : 0,
  };
}

function calculateProgressPercentage(chapters, chapterId, pageIndex) {
  const totalPages = chapters.reduce((total, chapter) => {
    return total + (chapter.pages?.length || 0);
  }, 0);

  if (!totalPages) return 0;

  const chapterIndex = chapters.findIndex(
    (chapter) => String(chapter.id) === String(chapterId)
  );

  if (chapterIndex < 0) return 0;

  const completedBefore = chapters.slice(0, chapterIndex).reduce(
    (total, chapter) => total + (chapter.pages?.length || 0),
    0
  );

  const currentPageNumber = completedBefore + pageIndex + 1;

  return Math.min(
    100,
    Math.max(0, Math.round((currentPageNumber / totalPages) * 100))
  );
}

function getAssessmentPages(chapters = []) {
  return chapters.flatMap((chapter) =>
    (chapter.pages || []).filter((page) => page.isAssessment)
  );
}

function getAnsweredAssessmentCount(assessmentPages, answers) {
  return assessmentPages.filter((page) => answers?.[page.id]).length;
}

function CoursePlayer() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const selectedCourse = getSelectedCourse();
  const user = getLoggedInUser();

  const [course, setCourse] = useState(null);
  const [manifest, setManifest] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pageContent, setPageContent] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [assessmentAnswers, setAssessmentAnswers] = useState({});

  const selectedLanguage = selectedCourse?.language || "EN";

  async function saveProgress(chapterId, pageIndex, status = "in_progress") {
    try {
      const chapter = chapters.find(
        (item) => String(item.id) === String(chapterId)
      );

      if (!chapter) return;

      const page = chapter.pages?.[pageIndex];

      if (!page) return;

      const progressValue =
        status === "completed"
          ? 100
          : calculateProgressPercentage(chapters, chapterId, pageIndex);

      await saveUserCourseProgressToDatabase({
        userId: user?.id,
        courseId: Number(courseId),
        status,
        progressPercentage: progressValue,
        currentChapter: chapter.id,
        currentPage: page.id,
        selectedLanguage,
      });
    } catch (err) {
      console.error("Save progress error:", err);
    }
  }

  async function loadPlayerData() {
    try {
      setLoading(true);
      setError("");

      const courses = await getCoursesFromDatabase();

      if (!Array.isArray(courses)) {
        setError("Unable to load course details.");
        return;
      }

      const selectedDbCourse = courses.find(
        (item) => Number(item.id) === Number(courseId)
      );

      if (!selectedDbCourse) {
        setError("Course not found or inactive.");
        return;
      }

      const courseManifest = await loadCourseManifest(selectedDbCourse);

      const savedProgress = await getUserCourseProgressFromDatabase({
        userId: user?.id,
        courseId: Number(courseId),
      });

      const resumePosition = getResumePosition(courseManifest, savedProgress);

      setCourse(selectedDbCourse);
      setManifest(courseManifest);
      setSelectedChapterId(resumePosition.chapterId);
      setSelectedPageIndex(resumePosition.pageIndex);
    } catch (err) {
      console.error("Course player load error:", err);
      setError(err?.message || "Unable to load course player.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCurrentPageContent(pageFile) {
    try {
      if (!pageFile) {
        setPageContent(null);
        return;
      }

      setPageLoading(true);
      setPageError("");

      const content = await loadCoursePageContent(pageFile, selectedLanguage);

      setPageContent(content);
    } catch (err) {
      console.error("Load page content error:", err);
      setPageContent(null);
      setPageError(err?.message || "Unable to load page content.");
    } finally {
      setPageLoading(false);
    }
  }

  const chapters = manifest?.chapters || [];

  const selectedChapter = useMemo(() => {
    return (
      chapters.find((chapter) => chapter.id === selectedChapterId) ||
      chapters[0] ||
      null
    );
  }, [chapters, selectedChapterId]);

  const currentPages = selectedChapter?.pages || [];
  const selectedPage = currentPages[selectedPageIndex] || currentPages[0] || null;
  const selectedAssessmentAnswer = selectedPage
    ? assessmentAnswers[selectedPage.id] || ""
    : "";

  const assessmentPages = getAssessmentPages(chapters);
  const answeredAssessmentCount = getAnsweredAssessmentCount(
    assessmentPages,
    assessmentAnswers
  );
  const totalAssessmentQuestions = assessmentPages.length;
  const currentChapterIndex = selectedChapter
    ? chapters.findIndex((chapter) => chapter.id === selectedChapter.id)
    : -1;

  const totalPagesInCourse = chapters.reduce((total, chapter) => {
    return total + (chapter.pages?.length || 0);
  }, 0);

  const completedPagesBeforeCurrentChapter =
    currentChapterIndex > 0
      ? chapters.slice(0, currentChapterIndex).reduce((total, chapter) => {
          return total + (chapter.pages?.length || 0);
        }, 0)
      : 0;

  const currentGlobalPageNumber =
    selectedPage && totalPagesInCourse > 0
      ? completedPagesBeforeCurrentChapter + selectedPageIndex + 1
      : 0;

  const progressPercentage =
    totalPagesInCourse > 0
      ? Math.round((currentGlobalPageNumber / totalPagesInCourse) * 100)
      : 0;

  const courseName =
    manifest?.courseName ||
    selectedCourse?.courseName ||
    course?.course_name ||
    "CBT Course";

  const hasPrevious =
    currentChapterIndex > 0 || selectedPageIndex > 0;

  const hasNext =
    currentChapterIndex < chapters.length - 1 ||
    selectedPageIndex < currentPages.length - 1;


  useEffect(() => {
    if (selectedPage) {
      loadCurrentPageContent(selectedPage);
    }
  }, [selectedPage?.filePath, selectedLanguage]);

  useEffect(() => {
    loadPlayerData();
  }, [courseId]);

  async function handleSelectChapter(chapterId) {
    setSelectedChapterId(chapterId);
    setSelectedPageIndex(0);

    await saveProgress(chapterId, 0);
  }

  async function handlePreviousPage() {
    if (!hasPrevious) return;

    if (selectedPageIndex > 0) {
      const newPageIndex = selectedPageIndex - 1;

      setSelectedPageIndex(newPageIndex);
      await saveProgress(selectedChapter.id, newPageIndex);

      return;
    }

    const previousChapter = chapters[currentChapterIndex - 1];

    if (previousChapter) {
      const newPageIndex = Math.max((previousChapter.pages?.length || 1) - 1, 0);

      setSelectedChapterId(previousChapter.id);
      setSelectedPageIndex(newPageIndex);

      await saveProgress(previousChapter.id, newPageIndex);
    }
  }

  function handleSelectAssessmentAnswer(optionId) {
    if (!selectedPage) return;

    setAssessmentAnswers((prev) => ({
      ...prev,
      [selectedPage.id]: optionId,
    }));
  }

  async function handleNextPage() {
    if (selectedPage?.isAssessment && !assessmentAnswers[selectedPage.id]) {
      alert("Please select an answer before moving to the next question.");
      return;
    }
    if (!selectedChapter || !selectedPage) return;

    if (selectedPageIndex < currentPages.length - 1) {
      const newPageIndex = selectedPageIndex + 1;

      setSelectedPageIndex(newPageIndex);
      await saveProgress(selectedChapter.id, newPageIndex);

      return;
    }

    const nextChapter = chapters[currentChapterIndex + 1];

    if (nextChapter) {
      setSelectedChapterId(nextChapter.id);
      setSelectedPageIndex(0);

      await saveProgress(nextChapter.id, 0);

      return;
    }

    if (
      totalAssessmentQuestions > 0 &&
      answeredAssessmentCount < totalAssessmentQuestions
    ) {
      alert(
        `Please answer all assessment questions before completing the course. Answered ${answeredAssessmentCount} of ${totalAssessmentQuestions}.`
      );
      return;
    }

    const confirmed = window.confirm(
      "You have reached the end of this CBT course. Do you want to mark this course as completed?"
    );

    if (!confirmed) return;

    try {
      const response = await completeUserCourseInDatabase({
        userId: user?.id,
        courseId: Number(courseId),
        selectedLanguage,
        currentChapter: selectedChapter.id,
        currentPage: selectedPage.id,
      });

      if (!response?.success) {
        alert(response?.message || "Unable to complete course.");
        return;
      }

      alert("Course completed successfully.");
      navigate("/user/courses");
    } catch (err) {
      console.error("Complete course error:", err);
      alert("Unable to complete course.");
    }
  }

  async function handleExitCourse() {
    const confirmed = window.confirm(
      "Are you sure you want to exit this course? Your current progress will be saved."
    );

    if (!confirmed) return;

    await saveProgress(selectedChapter?.id, selectedPageIndex);

    navigate("/user/courses");
  }

  function handleBackDashboard() {
    navigate("/dashboard");
  }

  return (
    <div className="flex h-screen flex-col bg-[#F5F7FA]">
      <header className="flex h-20 items-center justify-between bg-[#163B6D] px-6 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/user/courses")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 hover:bg-white/10"
            title="Back to courses"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              gemini<span className="text-orange-400">CBT</span>
            </h1>
            <p className="text-sm text-blue-100">
              Computer Based Training Player
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1 px-8">
          <p className="truncate text-center text-lg font-bold">{courseName}</p>
          <p className="text-center text-sm text-blue-100">
            Language: {selectedLanguage} | Course ID: {courseId}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold">{user?.fullName || "Crew Member"}</p>
            <p className="text-sm text-blue-100">{user?.rank || "Rank"}</p>
          </div>

          <button
            type="button"
            onClick={handleBackDashboard}
            className="flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-2xl border border-[#DDE3EA] bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-bold text-[#163B6D]">
              Loading CBT course...
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Reading course metadata and chapter structure.
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            <p className="text-lg font-bold">Unable to load course</p>
            <p className="mt-2">{error}</p>

            <button
              type="button"
              onClick={() => navigate("/user/courses")}
              className="mt-6 rounded-xl bg-[#2554C7] px-5 py-3 font-semibold text-white hover:bg-[#163B6D]"
            >
              Back to Courses
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex h-[calc(100vh-160px)] flex-1 overflow-hidden">
            <aside className="flex h-full w-80 flex-col border-r border-[#DDE3EA] bg-white shadow-sm">
              <div className="border-b border-[#DDE3EA] p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#2554C7]">
                  Course Navigation
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#163B6D]">
                  Chapters
                </h2>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-600">
                      Course Progress
                    </span>
                    <span className="font-semibold text-[#163B6D]">
                      {progressPercentage}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-[#22C55E]"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <nav className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {chapters.map((chapter) => (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    active={chapter.id === selectedChapter?.id}
                    onClick={() => handleSelectChapter(chapter.id)}
                  />
                ))}
              </nav>
            </aside>

            <main className="flex-1 overflow-y-auto p-6">
              <div className="mb-5 grid grid-cols-4 gap-4">
                <InfoBox
                  icon={<BookOpen className="h-5 w-5" />}
                  label="Current Chapter"
                  value={selectedChapter?.title || "-"}
                />

                <InfoBox
                  icon={<FileText className="h-5 w-5" />}
                  label="Current Page"
                  value={
                    selectedPage
                      ? `${selectedPage.displayLabel} of ${currentPages.length}`
                      : "-"
                  }
                />

                <InfoBox
                  icon={<Clock className="h-5 w-5" />}
                  label="Course Version"
                  value={manifest?.version || "-"}
                />

                <InfoBox
                  icon={<Volume2 className="h-5 w-5" />}
                  label="Language"
                  value={selectedLanguage}
                />
              </div>

              <section className="min-h-[520px] rounded-2xl border border-[#DDE3EA] bg-white p-8 shadow-sm">
                <div className="mb-6 border-b border-[#DDE3EA] pb-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#2554C7]">
                    Chapter {selectedChapter?.number || "-"}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-[#163B6D]">
                    {selectedChapter?.title || "Course Chapter"}
                  </h2>
                </div>

                <CoursePageRenderer
                  pageContent={pageContent}
                  pageLoading={pageLoading}
                  pageError={pageError}
                  selectedPage={selectedPage}
                  selectedAssessmentAnswer={selectedAssessmentAnswer}
                  onSelectAssessmentAnswer={handleSelectAssessmentAnswer}
                />
              </section>
            </main>
          </div>

          <footer className="flex h-20 items-center justify-between border-t border-[#DDE3EA] bg-white px-6 shadow-sm">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={!hasPrevious}
              className="flex items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-5 py-3 font-semibold text-[#163B6D] hover:bg-[#F5F7FA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            <div className="text-center">
              <p className="text-sm font-semibold text-[#163B6D]">
                {selectedPage
                  ? `${selectedPage.displayLabel} | Chapter ${
                      selectedChapter?.number || "-"
                    } of ${chapters.length}`
                  : "No page selected"}
              </p>
              <p className="text-xs text-gray-500">
                Overall page {currentGlobalPageNumber} of {totalPagesInCourse}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExitCourse}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Exit Course
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                className="flex items-center gap-2 rounded-xl bg-[#2554C7] px-5 py-3 font-semibold text-white hover:bg-[#163B6D]"
              >
                {hasNext ? "Next" : "Complete"}
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

function ChapterItem({ chapter, active, onClick }) {
  const isAssessment = chapter.isAssessment;
  const totalItems = chapter.pages?.length || 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition ${
        active
          ? "border-[#2554C7] bg-blue-50"
          : "border-[#DDE3EA] bg-white hover:bg-[#F5F7FA]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
            active
              ? "bg-[#2554C7] text-white"
              : isAssessment
              ? "bg-[#F59E0B] text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {isAssessment ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <span className="text-sm font-bold">{chapter.number}</span>
          )}
        </div>

        <div>
          <p className="font-semibold text-[#163B6D]">{chapter.title}</p>
          <p className="mt-1 text-xs text-gray-500">
            {isAssessment
              ? `${totalItems} Questions`
              : `${totalItems} Pages`}
          </p>
        </div>
      </div>
    </button>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-[#DDE3EA] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-[#2554C7]">
        {icon}
        <p className="text-sm font-semibold text-gray-500">{label}</p>
      </div>

      <p className="truncate font-bold text-[#163B6D]">{value}</p>
    </div>
  );
}

export default CoursePlayer;
