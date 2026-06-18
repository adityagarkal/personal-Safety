import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Database,
  FileText,
  FolderOpen,
  Hash,
  Languages,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";

import {
  deleteCourseFromSystem,
  getCoursesFromDatabase,
  importSelectedCourseToSystem,
  selectCourseFolderFromSystem,
} from "../../services/databaseService";

function SystemCourseImport() {
  const navigate = useNavigate();

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showCourses, setShowCourses] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);

  function showAlert(type, text) {
    setAlert({ type, text });
  }

  async function loadCourses() {
    try {
      setLoading(true);

      const response = await getCoursesFromDatabase();

      if (Array.isArray(response)) {
        setCourses(response);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Load courses error:", err);
      showAlert("error", "Unable to load imported courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (showCourses) {
      loadCourses();
    }
  }, [showCourses]);

  async function handleSelectFolder() {
    try {
      setAlert(null);
      setSelectedCourse(null);
      setShowCourses(false);
      setLoading(true);

      const response = await selectCourseFolderFromSystem();

      if (!response?.success) {
        const message = response?.message || "Course folder selection failed.";

        if (message.toLowerCase().includes("cancel")) {
          showAlert("info", "Folder selection cancelled.");
        } else {
          showAlert("error", message);
        }

        return;
      }

      setSelectedCourse(response.data);
      showAlert("success", "Course folder validated successfully.");
    } catch (err) {
      console.error("Select folder error:", err);
      showAlert("error", "Unable to select course folder.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImportCourse() {
    try {
      if (!selectedCourse) {
        showAlert("error", "Please select a valid course folder first.");
        return;
      }

      setAlert(null);
      setLoading(true);

      const response = await importSelectedCourseToSystem(selectedCourse);

      if (!response?.success) {
        showAlert("error", response?.message || "Course import failed.");
        return;
      }

      showAlert(
        "success",
        response?.data?.replaced
          ? "Course replaced successfully."
          : "Course imported successfully."
      );

      setSelectedCourse(null);

      if (showCourses) {
        await loadCourses();
      }
    } catch (err) {
      console.error("Import course error:", err);
      showAlert("error", "Unable to import course.");
    } finally {
      setLoading(false);
    }
  }

  function toggleCourseSelection(courseId) {
    setSelectedCourseIds((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      }

      return [...prev, courseId];
    });
  }

  function toggleSelectAll() {
    if (courses.length === 0) return;

    if (selectedCourseIds.length === courses.length) {
      setSelectedCourseIds([]);
      return;
    }

    setSelectedCourseIds(courses.map((course) => course.id));
  }

  async function handleDeleteSelectedCourses() {
    if (selectedCourseIds.length === 0) {
      showAlert("error", "Please select at least one course to delete.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedCourseIds.length} selected course(s)? This will remove course files and hide the course from users. Completion history will remain saved.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setAlert(null);

      for (const courseId of selectedCourseIds) {
        const response = await deleteCourseFromSystem(courseId);

        if (!response?.success) {
          showAlert(
            "error",
            response?.message || `Unable to delete course ID ${courseId}.`
          );

          await loadCourses();
          return;
        }
      }

      setSelectedCourseIds([]);
      await loadCourses();

      showAlert("success", "Selected course(s) deleted successfully.");
    } catch (err) {
      console.error("Delete courses error:", err);
      showAlert("error", "Unable to delete selected courses.");
    } finally {
      setLoading(false);
    }
  }

  function formatLanguages(value) {
    try {
      if (!value) return "EN";

      if (Array.isArray(value)) {
        return value.join(", ");
      }

      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.join(", ");
      }

      return String(value);
    } catch {
      return String(value || "EN");
    }
  }

  const alertStyles = {
    success: "border-green-200 bg-green-50 text-green-700",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  const alertIcon = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <AlertCircle className="h-5 w-5" />,
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-8 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#2554C7]">
              System Utility
            </p>

            <h1 className="text-3xl font-bold text-[#163B6D]">
              Import CBT Course
            </h1>

            <p className="mt-2 max-w-3xl text-gray-600">
              Select an extracted CBT folder. The system will locate{" "}
              <span className="font-semibold text-gray-800">cbt.xml</span>,
              detect metadata, copy the course, and register it for users.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg border border-[#DDE3EA] bg-white px-4 py-2 text-sm font-semibold text-[#163B6D] shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-4">
          <StepCard number="1" title="Select Folder" />
          <StepCard number="2" title="Validate CBT" />
          <StepCard number="3" title="Copy Course" />
          <StepCard number="4" title="Register DB" />
        </div>

        <div className="rounded-2xl border border-[#DDE3EA] bg-white p-6 shadow-sm">
          {alert && (
            <div
              className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 ${
                alertStyles[alert.type]
              }`}
            >
              {alertIcon[alert.type]}
              <span className="font-medium">{alert.text}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSelectFolder}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#2554C7] px-5 py-3 font-semibold text-white shadow-sm hover:bg-[#163B6D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FolderOpen className="h-5 w-5" />
              {loading ? "Processing..." : "Select Course Folder"}
            </button>

            {selectedCourse && (
              <button
                type="button"
                onClick={handleImportCourse}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UploadCloud className="h-5 w-5" />
                {loading ? "Importing..." : "Import Course"}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowCourses((prev) => !prev);
                setSelectedCourse(null);
                setSelectedCourseIds([]);
                setAlert(null);
              }}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-5 py-3 font-semibold text-[#163B6D] shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Database className="h-5 w-5" />
              {showCourses ? "Hide Courses" : "View Courses"}
            </button>

            {showCourses && (
              <button
                type="button"
                onClick={loadCourses}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-5 py-3 font-semibold text-[#163B6D] shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh
              </button>
            )}

            {showCourses && selectedCourseIds.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelectedCourses}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-5 w-5" />
                Delete Selected ({selectedCourseIds.length})
              </button>
            )}
          </div>

          {!selectedCourse && !showCourses && (
            <div className="mt-8 rounded-2xl border border-dashed border-[#DDE3EA] bg-[#F5F7FA] p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                <FolderOpen className="h-8 w-8 text-[#2554C7]" />
              </div>

              <h2 className="text-lg font-semibold text-[#163B6D]">
                No course folder selected
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Select an extracted CBT folder like{" "}
                <span className="font-semibold">001</span> or{" "}
                <span className="font-semibold">p_safety</span>. The importer
                will find <span className="font-semibold">cbt.xml</span>{" "}
                automatically.
              </p>
            </div>
          )}

          {selectedCourse && (
            <div className="mt-8 rounded-2xl border border-[#DDE3EA] bg-[#F5F7FA] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#163B6D]">
                    Course Preview
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    Review course information before importing.
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
                  Valid CBT Folder
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  icon={<Hash className="h-5 w-5" />}
                  label="Course Code"
                  value={selectedCourse.courseCode}
                />

                <InfoCard
                  icon={<FileText className="h-5 w-5" />}
                  label="Course Name"
                  value={selectedCourse.courseName}
                />

                <InfoCard
                  icon={<FileText className="h-5 w-5" />}
                  label="Short Name"
                  value={selectedCourse.shortName || "-"}
                />

                <InfoCard
                  icon={<Languages className="h-5 w-5" />}
                  label="Languages"
                  value={selectedCourse.languages?.join(", ") || "EN"}
                />

                <InfoCard
                  icon={<FileText className="h-5 w-5" />}
                  label="Total Chapters"
                  value={selectedCourse.totalChapters}
                />

                <InfoCard
                  icon={<FileText className="h-5 w-5" />}
                  label="Total XML Pages"
                  value={selectedCourse.totalPages}
                />
              </div>

              <div className="mt-5 rounded-xl border border-[#DDE3EA] bg-white p-4">
                <p className="text-sm font-semibold text-gray-500">
                  Source Folder
                </p>

                <p className="mt-1 break-all text-sm font-medium text-gray-800">
                  {selectedCourse.sourcePath}
                </p>
              </div>
            </div>
          )}

          {showCourses && (
            <div className="mt-8 rounded-2xl border border-[#DDE3EA] bg-[#F5F7FA] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#163B6D]">
                    Imported Courses
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    View imported CBT courses and remove courses when updated
                    versions need to be imported.
                  </p>
                </div>

                <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
                  {courses.length} Course(s)
                </span>
              </div>

              {courses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#DDE3EA] bg-white p-8 text-center">
                  <Database className="mx-auto mb-3 h-8 w-8 text-[#2554C7]" />
                  <p className="font-semibold text-[#163B6D]">
                    No courses imported yet
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Import a CBT course first, then it will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-[#DDE3EA] bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#163B6D] text-white">
                      <tr>
                        <th className="w-12 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={
                              courses.length > 0 &&
                              selectedCourseIds.length === courses.length
                            }
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Course Name</th>
                        <th className="px-4 py-3">Languages</th>
                        <th className="px-4 py-3">Chapters</th>
                        <th className="px-4 py-3">Pages</th>
                        <th className="px-4 py-3">Imported At</th>
                      </tr>
                    </thead>

                    <tbody>
                      {courses.map((course) => (
                        <tr
                          key={course.id}
                          className="border-t border-[#DDE3EA] hover:bg-[#F5F7FA]"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedCourseIds.includes(course.id)}
                              onChange={() => toggleCourseSelection(course.id)}
                            />
                          </td>

                          <td className="px-4 py-3 font-semibold text-[#163B6D]">
                            {course.course_code}
                          </td>

                          <td className="px-4 py-3">
                            {course.course_name}
                          </td>

                          <td className="px-4 py-3">
                            {formatLanguages(course.available_languages)}
                          </td>

                          <td className="px-4 py-3">
                            {course.total_chapters}
                          </td>

                          <td className="px-4 py-3">
                            {course.total_pages}
                          </td>

                          <td className="px-4 py-3">
                            {course.imported_at
                              ? new Date(course.imported_at).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          Hidden system screen for importing CBT packages. Normal users will not
          access this page.
        </p>
      </div>
    </div>
  );
}

function StepCard({ number, title }) {
  return (
    <div className="rounded-xl border border-[#DDE3EA] bg-white p-4 shadow-sm">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#163B6D] text-sm font-bold text-white">
        {number}
      </div>

      <p className="text-sm font-semibold text-[#163B6D]">{title}</p>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-[#DDE3EA] bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-[#2554C7]">
        {icon}
        <p className="text-sm font-semibold text-gray-500">{label}</p>
      </div>

      <p className="break-words text-base font-bold text-[#163B6D]">
        {value || "-"}
      </p>
    </div>
  );
}

export default SystemCourseImport;