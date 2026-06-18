import {
  BookOpen,
  CheckCircle,
  Languages,
  PlayCircle,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatusBadge from "./StatusBadge";

function CourseCard({ course }) {
  const navigate = useNavigate();

  function formatLanguages(value) {
    try {
      if (!value) return "EN";

      if (Array.isArray(value)) return value.join(", ");

      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.join(", ") : String(value);
    } catch {
      return String(value || "EN");
    }
  }

  function getCategoryLabel(category) {
    if (category === "mandatory") return "Mandatory";
    if (category === "recommended") return "Recommended";
    return "Other";
  }

  function handleStartCourse() {
    navigate(`/user/courses/${course.id}/language`);
  }

  const status = "Not Started";

  return (
    <div className="rounded-2xl border border-[#DDE3EA] bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-500">
            Course Code: {course.course_code}
          </p>

          <h3 className="mt-2 text-xl font-bold text-[#163B6D]">
            {course.course_name}
          </h3>
        </div>

        <StatusBadge status={getCategoryLabel(course.category)} />
      </div>

      <div className="mb-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen className="h-4 w-4 text-[#2554C7]" />
          <span>{course.total_chapters || 0} Chapters</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Languages className="h-4 w-4 text-[#2554C7]" />
          <span>{formatLanguages(course.available_languages)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-[#22C55E]" />
          <span>{status}</span>
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-600">Progress</span>
          <span className="font-semibold text-[#163B6D]">0%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-0 rounded-full bg-[#22C55E]" />
        </div>
      </div>

      <button
        type="button"
        onClick={handleStartCourse}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2554C7] px-4 py-3 font-semibold text-white hover:bg-[#163B6D]"
      >
        <PlayCircle className="h-5 w-5" />
        Start Course
      </button>

      <button
        type="button"
        onClick={handleStartCourse}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-4 py-3 font-semibold text-[#163B6D] hover:bg-[#F5F7FA]"
      >
        <RotateCcw className="h-5 w-5" />
        Retake / Continue
      </button>
    </div>
  );
}

export default CourseCard;
