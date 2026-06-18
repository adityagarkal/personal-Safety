import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import UserLayout from "../../components/user/UserLayout";
import CourseCard from "../../components/user/CourseCard";
import { getUserCoursesFromDatabase } from "../../services/databaseService";

function getLoggedInUser() {
  try {
    const storedUser = localStorage.getItem("gemini_login_user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function UserCourses() {
  const navigate = useNavigate();
  const user = getLoggedInUser();

  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCourses() {
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
      console.error("Load user courses error:", err);
      setError("Unable to load courses. Please open this page in Electron app.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const category = course.user_category || "other";
      const matchesTab = activeTab === "all" || category === activeTab;
      const keyword = searchText.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        course.course_name?.toLowerCase().includes(keyword) ||
        course.course_code?.toLowerCase().includes(keyword);

      return matchesTab && matchesSearch;
    });
  }, [courses, activeTab, searchText]);

  const counts = useMemo(() => {
    return {
      all: courses.length,
      mandatory: courses.filter((course) => course.user_category === "mandatory").length,
      recommended: courses.filter((course) => course.user_category === "recommended").length,
      other: courses.filter((course) => course.user_category === "other").length,
    };
  }, [courses]);

  return (
    <UserLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2554C7]">
            CBT Course Catalog
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#163B6D]">
            Available CBT Courses
          </h1>

          <p className="mt-2 text-gray-600">
            Select a CBT course to start, continue, or retake training.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-4 py-3 text-sm font-semibold text-[#163B6D] shadow-sm hover:bg-[#F5F7FA]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-[#DDE3EA] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <TabButton
              label="All Courses"
              count={counts.all}
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
            />

            <TabButton
              label="Mandatory"
              count={counts.mandatory}
              active={activeTab === "mandatory"}
              onClick={() => setActiveTab("mandatory")}
            />

            <TabButton
              label="Recommended"
              count={counts.recommended}
              active={activeTab === "recommended"}
              onClick={() => setActiveTab("recommended")}
            />

            <TabButton
              label="Other"
              count={counts.other}
              active={activeTab === "other"}
              onClick={() => setActiveTab("other")}
            />
          </div>

          <div className="flex h-11 w-80 items-center gap-2 rounded-xl border border-[#DDE3EA] bg-[#F5F7FA] px-4">
            <Search className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search course..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#DDE3EA] bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-[#163B6D]">Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DDE3EA] bg-white p-10 text-center shadow-sm">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-[#2554C7]" />
          <h2 className="text-lg font-bold text-[#163B6D]">
            No courses found
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Imported CBT courses will appear here. Please import courses from
            the hidden system import screen first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </UserLayout>
  );
}

function TabButton({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[#163B6D] text-white"
          : "bg-[#F5F7FA] text-[#163B6D] hover:bg-[#EAF0F8]"
      }`}
    >
      {label} ({count})
    </button>
  );
}

export default UserCourses;
