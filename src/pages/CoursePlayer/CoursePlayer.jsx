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

function CoursePlayer() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const selectedCourse = getSelectedCourse();
  const user = getLoggedInUser();

  const courseName =
    selectedCourse?.courseName || selectedCourse?.course_name || "CBT Course";

  const selectedLanguage = selectedCourse?.language || "EN";

  const chapters = [
    {
      id: "1",
      title: "Introduction",
      status: "completed",
    },
    {
      id: "2",
      title: "Safety Overview",
      status: "active",
    },
    {
      id: "3",
      title: "Training Content",
      status: "pending",
    },
    {
      id: "4",
      title: "Assessment",
      status: "pending",
    },
  ];

  function handleExitCourse() {
    const confirmed = window.confirm(
      "Are you sure you want to exit this course? Your progress will be saved later when progress tracking is added."
    );

    if (confirmed) {
      navigate("/user/courses");
    }
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

      <div className="flex h-[calc(100vh-140px)] flex-1 overflow-hidden">
        <aside className="w-80 border-r border-[#DDE3EA] bg-white shadow-sm">
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
                  Overall Progress
                </span>
                <span className="font-semibold text-[#163B6D]">25%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-1/4 rounded-full bg-[#22C55E]" />
              </div>
            </div>
          </div>

          <nav className="space-y-3 p-4">
            {chapters.map((chapter) => (
              <ChapterItem key={chapter.id} chapter={chapter} />
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-5 grid grid-cols-4 gap-4">
            <InfoBox
              icon={<BookOpen className="h-5 w-5" />}
              label="Current Chapter"
              value="Safety Overview"
            />

            <InfoBox
              icon={<FileText className="h-5 w-5" />}
              label="Current Page"
              value="Page 1"
            />

            <InfoBox
              icon={<Clock className="h-5 w-5" />}
              label="Session"
              value="In Progress"
            />

            <InfoBox
              icon={<Volume2 className="h-5 w-5" />}
              label="Audio"
              value="Available"
            />
          </div>

          <section className="min-h-[520px] rounded-2xl border border-[#DDE3EA] bg-white p-8 shadow-sm">
            <div className="mb-6 border-b border-[#DDE3EA] pb-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#2554C7]">
                Chapter 2
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#163B6D]">
                Safety Overview
              </h2>

              <p className="mt-2 text-gray-600">
                This is a static CBT player layout. In the next step, this area
                will start rendering real XML course content.
              </p>
            </div>

            <div className="grid grid-cols-[1fr_320px] gap-8">
              <div>
                <h3 className="text-xl font-bold text-[#163B6D]">
                  Training Content Area
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  The course page content will be displayed here. This area will
                  support text, images, audio, and assessment-style screens from
                  imported CBT XML files.
                </p>

                <div className="mt-8 rounded-2xl border border-dashed border-[#DDE3EA] bg-[#F5F7FA] p-10 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-[#2554C7]" />

                  <h4 className="text-lg font-bold text-[#163B6D]">
                    XML Content Preview Area
                  </h4>

                  <p className="mt-2 text-sm text-gray-600">
                    Dynamic CBT content will appear here after parser integration.
                  </p>
                </div>
              </div>

              <aside className="hidden rounded-2xl border border-[#DDE3EA] bg-[#F5F7FA] p-5">
                <h3 className="text-lg font-bold text-[#163B6D]">
                  Page Details
                </h3>

                <div className="mt-5 space-y-4">
                  <DetailRow label="Course" value={courseName} />
                  <DetailRow label="Language" value={selectedLanguage} />
                  <DetailRow label="Chapter" value="2" />
                  <DetailRow label="Page" value="1" />
                  <DetailRow label="Status" value="In Progress" />
                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>

      <footer className="flex h-20 items-center justify-between border-t border-[#DDE3EA] bg-white px-6 shadow-sm">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-5 py-3 font-semibold text-[#163B6D] hover:bg-[#F5F7FA]"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-[#163B6D]">
            Page 1 of 4
          </p>
          <p className="text-xs text-gray-500">
            Static player shell — real navigation will be added next
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
            className="flex items-center gap-2 rounded-xl bg-[#2554C7] px-5 py-3 font-semibold text-white hover:bg-[#163B6D]"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}

function ChapterItem({ chapter }) {
  const isActive = chapter.status === "active";
  const isCompleted = chapter.status === "completed";

  return (
    <button
      type="button"
      className={`w-full rounded-xl border p-4 text-left transition ${
        isActive
          ? "border-[#2554C7] bg-blue-50"
          : "border-[#DDE3EA] bg-white hover:bg-[#F5F7FA]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
            isCompleted
              ? "bg-[#22C55E] text-white"
              : isActive
              ? "bg-[#2554C7] text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {isCompleted ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <span className="text-sm font-bold">{chapter.id}</span>
          )}
        </div>

        <div>
          <p className="font-semibold text-[#163B6D]">{chapter.title}</p>
          <p className="mt-1 text-xs text-gray-500">
            {isCompleted
              ? "Completed"
              : isActive
              ? "Current chapter"
              : "Pending"}
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

      <p className="font-bold text-[#163B6D]">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-[#DDE3EA] pb-3 last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-[#163B6D]">{value}</p>
    </div>
  );
}

export default CoursePlayer;
