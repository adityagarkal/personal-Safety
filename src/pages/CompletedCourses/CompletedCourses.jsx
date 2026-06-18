import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  RotateCcw,
  Search,
} from "lucide-react";

import UserLayout from "../../components/user/UserLayout";
import StatusBadge from "../../components/user/StatusBadge";
import { getUserCoursesFromDatabase } from "../../services/databaseService";

function getLoggedInUser() {
  try {
    const storedUser = localStorage.getItem("gemini_login_user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function CompletedCourses() {
  const navigate = useNavigate();
  const user = getLoggedInUser();

  const [courses, setCourses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCompletedCourses() {
    try {
      setLoading(true);
      setError("");

      const response = await getUserCoursesFromDatabase({
        userId: user?.id,
        rank: user?.rank,
      });

      if (Array.isArray(response)) {
        setCourses(response);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Completed courses load error:", err);
      setError("Unable to load completed courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompletedCourses();
  }, []);

  const completedCourses = useMemo(() => {
    return courses
      .filter((course) => course.progress_status === "completed")
      .filter((course) => {
        const keyword = searchText.trim().toLowerCase();

        if (!keyword) return true;

        return (
          course.course_name?.toLowerCase().includes(keyword) ||
          course.course_code?.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.completed_at || 0).getTime();
        const dateB = new Date(b.completed_at || 0).getTime();
        return dateB - dateA;
      });
  }, [courses, searchText]);

  function handleRetake(course) {
    navigate(`/user/courses/${course.id}/language`);
  }

  function formatCategory(category) {
    if (category === "mandatory") return "Mandatory";
    if (category === "recommended") return "Recommended";
    return "Other";
  }

  return (
    <UserLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2554C7]">
            Training Records
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#163B6D]">
            Completed Courses
          </h1>

          <p className="mt-2 text-gray-600">
            View CBT courses you have completed and retake courses if required.
          </p>
        </div>

        <div className="rounded-2xl border border-[#DDE3EA] bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22C55E] text-white">
              <CheckCircle className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-500">
                Total Completed
              </p>
              <p className="text-2xl font-bold text-[#163B6D]">
                {completedCourses.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-[#DDE3EA] bg-white p-5 shadow-sm">
        <div className="flex h-12 max-w-md items-center gap-2 rounded-xl border border-[#DDE3EA] bg-[#F5F7FA] px-4">
          <Search className="h-5 w-5 text-gray-500" />

          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search completed course..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#DDE3EA] bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-[#163B6D]">
            Loading completed courses...
          </p>
        </div>
      ) : completedCourses.length === 0 ? (
        <EmptyCompletedCourses />
      ) : (
        <div className="space-y-4">
          {completedCourses.map((course) => (
            <CompletedCourseCard
              key={course.id}
              course={course}
              category={formatCategory(course.user_category)}
              onRetake={() => handleRetake(course)}
            />
          ))}
        </div>
      )}
    </UserLayout>
  );
}

function CompletedCourseCard({ course, category, onRetake }) {
  return (
    <div className="rounded-2xl border border-[#DDE3EA] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status="Completed" />
            <StatusBadge status={category} />
          </div>

          <h2 className="truncate text-xl font-bold text-[#163B6D]">
            {course.course_name}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#2554C7]" />
              Code: {course.course_code}
            </span>

            <span className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-[#22C55E]" />
              Completed: {formatDate(course.completed_at)}
            </span>

            <span className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#F59E0B]" />
              Progress: {Number(course.progress_percentage || 100)}%
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetake}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-5 py-3 font-semibold text-[#163B6D] hover:bg-[#F5F7FA]"
        >
          <RotateCcw className="h-5 w-5" />
          Retake
        </button>
      </div>
    </div>
  );
}

function EmptyCompletedCourses() {
  return (
    <div className="rounded-2xl border border-dashed border-[#DDE3EA] bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F7FA]">
        <CheckCircle className="h-9 w-9 text-[#2554C7]" />
      </div>

      <h2 className="text-xl font-bold text-[#163B6D]">
        No completed courses yet
      </h2>

      <p className="mt-2 text-gray-600">
        Once you complete a CBT course, it will appear here.
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
}

export default CompletedCourses;