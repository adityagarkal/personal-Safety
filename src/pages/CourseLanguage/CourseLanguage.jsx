import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle, Globe2, PlayCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout from "../../components/user/UserLayout";
import StatusBadge from "../../components/user/StatusBadge";
import { getCoursesFromDatabase } from "../../services/databaseService";

const languageLabels = {
  EN: "English",
  FR: "French",
  CH: "Chinese",
  CN: "Chinese",
  DE: "German",
  ES: "Spanish",
};

function CourseLanguage() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function parseLanguages(value) {
    try {
        let languages = [];

        if (!value) {
        languages = ["EN"];
        } else if (Array.isArray(value)) {
        languages = value;
        } else {
        const parsed = JSON.parse(value);
        languages = Array.isArray(parsed) && parsed.length > 0 ? parsed : ["EN"];
        }

        const cleanedLanguages = languages
        .map((lang) => String(lang || "").trim().toUpperCase())
        .filter(Boolean);

        const uniqueLanguages = [...new Set(cleanedLanguages)];

        if (uniqueLanguages.includes("EN")) {
        return ["EN", ...uniqueLanguages.filter((lang) => lang !== "EN")];
        }

        return ["EN", ...uniqueLanguages];
    } catch {
        return ["EN"];
    }
  }

  async function loadCourse() {
    try {
      setLoading(true);
      setError("");

      const courses = await getCoursesFromDatabase();

      if (!Array.isArray(courses)) {
        setError("Unable to load course details.");
        return;
      }

      const selectedCourse = courses.find(
        (item) => Number(item.id) === Number(courseId)
      );

      if (!selectedCourse) {
        setError("Course not found.");
        return;
      }

      const languages = parseLanguages(selectedCourse.available_languages);

      setCourse(selectedCourse);
      setSelectedLanguage(languages[0] || "EN");
    } catch (err) {
      console.error("Load course language error:", err);
      setError("Unable to load course language details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const languages = useMemo(() => {
    return parseLanguages(course?.available_languages);
  }, [course]);

  function getCategoryLabel(category) {
    if (category === "mandatory") return "Mandatory";
    if (category === "recommended") return "Recommended";
    return "Other";
  }

  function handleStartCourse() {
    const startData = {
        courseId: course.id,
        courseCode: course.course_code,
        courseName: course.course_name,
        language: selectedLanguage,
        startedAt: new Date().toISOString(),
    };

    localStorage.setItem("gemini_selected_course", JSON.stringify(startData));

    navigate(`/user/player/${course.id}`);
  }

  return (
    <UserLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2554C7]">
            Course Language
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#163B6D]">
            Select Course Language
          </h1>

          <p className="mt-2 text-gray-600">
            Choose the language before starting the CBT course.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/user/courses")}
          className="flex items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-4 py-3 text-sm font-semibold text-[#163B6D] shadow-sm hover:bg-[#F5F7FA]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#DDE3EA] bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-[#163B6D]">
            Loading course details...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_380px] gap-6">
          <section className="rounded-2xl border border-[#DDE3EA] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Course Code: {course.course_code}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#163B6D]">
                  {course.course_name}
                </h2>

                <p className="mt-2 text-gray-600">
                  Review the course details and select your preferred language
                  to begin training.
                </p>
              </div>

              <StatusBadge status={getCategoryLabel(course.category)} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <InfoBox
                icon={<BookOpen className="h-5 w-5" />}
                label="Total Chapters"
                value={course.total_chapters || 0}
              />

              <InfoBox
                icon={<CheckCircle className="h-5 w-5" />}
                label="Progress"
                value="0%"
              />

              <InfoBox
                icon={<Globe2 className="h-5 w-5" />}
                label="Languages"
                value={languages.length}
              />
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-[#163B6D]">
                Available Languages
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                Select one language for this CBT session.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                {languages.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => setSelectedLanguage(language)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      selectedLanguage === language
                        ? "border-[#2554C7] bg-blue-50 ring-2 ring-[#2554C7]/20"
                        : "border-[#DDE3EA] bg-white hover:bg-[#F5F7FA]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-[#163B6D]">
                          {languageLabels[language] || language}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Language Code: {language}
                        </p>
                      </div>

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          selectedLanguage === language
                            ? "bg-[#2554C7] text-white"
                            : "bg-[#F5F7FA] text-gray-400"
                        }`}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-[#DDE3EA] bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-[#163B6D]">
              Ready to Start?
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Your selected language will be used for course content rendering.
            </p>

            <div className="my-6 rounded-xl bg-[#F5F7FA] p-4">
              <p className="text-sm font-semibold text-gray-500">
                Selected Language
              </p>

              <p className="mt-2 text-2xl font-bold text-[#163B6D]">
                {languageLabels[selectedLanguage] || selectedLanguage}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Code: {selectedLanguage}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartCourse}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2554C7] px-5 py-4 font-semibold text-white hover:bg-[#163B6D]"
            >
              <PlayCircle className="h-5 w-5" />
              Start Course
            </button>

            <button
              type="button"
              onClick={() => navigate("/user/courses")}
              className="mt-3 w-full rounded-xl border border-[#DDE3EA] bg-white px-5 py-4 font-semibold text-[#163B6D] hover:bg-[#F5F7FA]"
            >
              Cancel
            </button>
          </aside>
        </div>
      )}
    </UserLayout>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-[#DDE3EA] bg-[#F5F7FA] p-4">
      <div className="mb-3 flex items-center gap-2 text-[#2554C7]">
        {icon}
        <p className="text-sm font-semibold text-gray-500">{label}</p>
      </div>

      <p className="text-2xl font-bold text-[#163B6D]">{value}</p>
    </div>
  );
}

export default CourseLanguage;
