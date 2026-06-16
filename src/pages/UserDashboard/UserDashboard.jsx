import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  // getUserAssignmentsFromDatabase,
  // getModuleProgressFromDatabase,
  // getUserCBTCompletionsFromDatabase,
} from "../../services/databaseService";

const allCBTs = [
  {
    id: "001",
    name: "Personal Safety",
    category: "Safety",
    estimatedDuration: "45 minutes",
    folder: "001-Personal_Safety_2009",
    path: "content/001-Personal_Safety_2009/p_safety",
    available: true,
    totalChapters: 4,
  },
  {
    id: "002",
    name: "Ship General Safety",
    category: "Safety",
    estimatedDuration: "45 minutes",
    available: false,
    totalChapters: 4,
  },
  { id: "003", name: "Fire Safety", category: "Safety", estimatedDuration: "60 minutes", available: false, totalChapters: 4 },
  { id: "004", name: "Enclosed Space Entry", category: "Safety", estimatedDuration: "40 minutes", available: false, totalChapters: 4 },
  { id: "005", name: "BRM", category: "Navigation", estimatedDuration: "60 minutes", available: false, totalChapters: 4 },
  { id: "006", name: "ECDIS", category: "Navigation", estimatedDuration: "60 minutes", available: false, totalChapters: 4 },
  { id: "007", name: "Security Awareness", category: "Security", estimatedDuration: "35 minutes", available: false, totalChapters: 4 },
  { id: "008", name: "Pollution Prevention", category: "Environment", estimatedDuration: "45 minutes", available: false, totalChapters: 4 },
  { id: "009", name: "Survival Craft", category: "Safety", estimatedDuration: "50 minutes", available: false, totalChapters: 4 },
  { id: "010", name: "First Aid", category: "Medical", estimatedDuration: "50 minutes", available: false, totalChapters: 4 },
];

function getLoginUser() {
  const raw = localStorage.getItem("gemini_login_user");
  return raw ? JSON.parse(raw) : null;
}

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function formatDateTime(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("en-IN");
  } catch {
    return value;
  }
}

function addDays(dateValue, days) {
  const date = dateValue ? new Date(dateValue) : new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function UserDashboard() {
  const navigate = useNavigate();
  const loginUser = getLoginUser();

  const [assignments, setAssignments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [completionMap, setCompletionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [assignmentError, setAssignmentError] = useState("");

  useEffect(() => {
    // async function loadDashboardData() {
    //   try {
    //     setLoading(true);
    //     setAssignmentError("");

    //     if (!loginUser?.id) {
    //       setAssignments([]);
    //       setProgressMap({});
    //       setCompletionMap({});
    //       return;
    //     }

    //     const assignmentData = await getUserAssignmentsFromDatabase(loginUser.id);
    //     const safeAssignments = Array.isArray(assignmentData) ? assignmentData : [];

    //     const completionsData = await getUserCBTCompletionsFromDatabase(loginUser.id);
    //     const safeCompletions = Array.isArray(completionsData) ? completionsData : [];

    //     const nextCompletionMap = {};
    //     safeCompletions.forEach((item) => {
    //       nextCompletionMap[item.module_name] = item;
    //     });

    //     const nextProgressMap = {};

    //     for (const assignment of safeAssignments) {
    //       const moduleName = assignment.module_name;

    //       const progressData = await getModuleProgressFromDatabase({
    //         userId: loginUser.id,
    //         moduleName,
    //       });

    //       nextProgressMap[moduleName] = Array.isArray(progressData)
    //         ? progressData
    //         : [];
    //     }

    //     setAssignments(safeAssignments);
    //     setCompletionMap(nextCompletionMap);
    //     setProgressMap(nextProgressMap);
    //   } catch (err) {
    //     console.error("Dashboard Load Error:", err);
    //     setAssignmentError("Unable to load CBT progress from SQLite.");
    //   } finally {
    //     setLoading(false);
    //   }
    // }

    // loadDashboardData();
  }, [loginUser?.id]);

  const assignedCBTs = useMemo(() => {
    const assignedNames = assignments.map((item) =>
      String(item.module_name || "").trim()
    );

    return allCBTs.filter((course) => assignedNames.includes(course.name));
  }, [assignments]);

  function getAssignment(course) {
    return assignments.find((item) => item.module_name === course.name);
  }

  function getCourseCompletion(course) {
    return completionMap[course.name] || null;
  }

  function getDueDate(course) {
    const assignment = getAssignment(course);
    return addDays(assignment?.assigned_at, 30);
  }

  function isOverdue(course) {
    const completion = getCourseCompletion(course);
    if (completion) return false;
    return new Date() > getDueDate(course);
  }

  function getCourseProgress(course) {
    const completion = getCourseCompletion(course);

    if (completion) return 100;
    if (!course.available) return 0;

    const progressRows = progressMap[course.name] || [];
    const totalChapters = course.totalChapters || 4;

    return Math.min(
      100,
      Math.round((progressRows.length / totalChapters) * 100)
    );
  }

  function getCourseStatus(course) {
    const completion = getCourseCompletion(course);
    const progress = getCourseProgress(course);

    if (completion) return "Completed";
    if (isOverdue(course)) return "Overdue";
    if (progress > 0) return "In Progress";
    return "Not Started";
  }

  const completedCourses = assignedCBTs.filter(
    (course) => getCourseStatus(course) === "Completed"
  ).length;

  const overdueCourses = assignedCBTs.filter(
    (course) => getCourseStatus(course) === "Overdue"
  ).length;

  const pendingCourses = assignedCBTs.length - completedCourses;

  const totalProgress =
    assignedCBTs.length > 0
      ? Math.round((completedCourses / assignedCBTs.length) * 100)
      : 0;

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const completedLast30Days = Object.values(completionMap).filter(
    (item) => item?.completion_date && new Date(item.completion_date) >= last30Days
  ).length;

  const assignedLast30Days = assignments.filter(
    (item) => item?.assigned_at && new Date(item.assigned_at) >= last30Days
  ).length;

  const monthlyCompletionPercentage =
    assignedLast30Days > 0
      ? Math.round((completedLast30Days / assignedLast30Days) * 100)
      : 0;

  const recommendedCourse =
    assignedCBTs.find((course) => getCourseStatus(course) === "Overdue") ||
    assignedCBTs.find((course) => getCourseStatus(course) === "In Progress") ||
    assignedCBTs.find((course) => getCourseStatus(course) === "Not Started") ||
    null;

  function openCourse(course) {
    if (!course.available) return;

    localStorage.setItem("selected_course", JSON.stringify(course));
    localStorage.removeItem("gemini_assessment_result");
    localStorage.removeItem("gemini_certificate_number");
    localStorage.removeItem("gemini_completion_saved_to_db");

    navigate("/dashboard");
  }

  function goToCBTPage() {
    navigate("/course-selection");
  }

  function logout() {
    localStorage.removeItem("gemini_login_user");
    localStorage.removeItem("selected_course");
    navigate("/");
  }

  const fullName =
    loginUser?.fullName ||
    loginUser?.full_name ||
    `${loginUser?.first_name || ""} ${loginUser?.last_name || ""}`.trim() ||
    loginUser?.username ||
    "-";

  const welcomeName = `${loginUser?.rank || ""} ${fullName}`.trim();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold">Welcome {welcomeName}</h1>
            <p className="text-gray-600 mt-2">
              You have completed {completedCourses} CBT modules since joining Sun Falcon.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={goToCBTPage}
              className="px-5 py-3 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Go To CBT Page
            </button>

            <button
              onClick={logout}
              className="px-5 py-3 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <p className="text-gray-500">Vessel</p>
              <h2 className="text-xl font-bold">{loginUser?.vessel || "-"}</h2>
            </div>

            <div>
              <p className="text-gray-500">Date of Joining</p>
              <h2 className="text-xl font-bold">
                {formatDate(loginUser?.joining_date)}
              </h2>
            </div>

            <div>
              <p className="text-gray-500">Last Login</p>
              <h2 className="text-xl font-bold">
                {formatDateTime(loginUser?.loginAt)}
              </h2>
            </div>

            <div>
              <p className="text-gray-500">Crew ID</p>
              <h2 className="text-xl font-bold">{loginUser?.crew_id || "-"}</h2>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <p className="font-semibold">Current Progress</p>
              <p className="font-bold">{totalProgress}%</p>
            </div>

            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>

            <p className="text-sm text-gray-600 mt-3">
              Recommendation: Complete at least one CBT module every month to maintain continuous professional development.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Lifetime Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Total CBTs Assigned</p>
            <h2 className="text-3xl font-bold mt-1">{assignedCBTs.length}</h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Completed CBTs</p>
            <h2 className="text-3xl font-bold text-green-700 mt-1">
              {completedCourses}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Pending CBTs</p>
            <h2 className="text-3xl font-bold text-yellow-700 mt-1">
              {pendingCourses}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Overdue CBTs</p>
            <h2 className="text-3xl font-bold text-red-700 mt-1">
              {overdueCourses}
            </h2>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Monthly Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Completed Last 30 Days</p>
            <h2 className="text-3xl font-bold text-green-700 mt-1">
              {completedLast30Days}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Assigned Last 30 Days</p>
            <h2 className="text-3xl font-bold text-blue-700 mt-1">
              {assignedLast30Days}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Monthly Completion</p>
            <h2 className="text-3xl font-bold text-purple-700 mt-1">
              {monthlyCompletionPercentage}%
            </h2>
          </div>
        </div>

        {recommendedCourse && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-3">Recommended Next CBT</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <p className="text-gray-500">CBT Title</p>
                <p className="font-bold">{recommendedCourse.name}</p>
              </div>

              <div>
                <p className="text-gray-500">Estimated Duration</p>
                <p className="font-bold">{recommendedCourse.estimatedDuration}</p>
              </div>

              <div>
                <p className="text-gray-500">Due Date</p>
                <p className="font-bold">{formatDate(getDueDate(recommendedCourse))}</p>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => openCourse(recommendedCourse)}
                  disabled={!recommendedCourse.available}
                  className="px-5 py-3 rounded bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-600"
                >
                  Start Recommended CBT
                </button>
              </div>
            </div>
          </div>
        )}

        {assignmentError && (
          <div className="mb-5 rounded bg-red-100 p-4 text-red-700">
            {assignmentError}
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-auto mb-8">
          <div className="p-5 border-b">
            <h2 className="text-2xl font-bold">Pending CBT List</h2>
          </div>

          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3 text-left">CBT Name</th>
                <th className="border p-3">Category</th>
                <th className="border p-3">Assigned Date</th>
                <th className="border p-3">Due Date</th>
                <th className="border p-3">Status</th>
                <th className="border p-3">Progress</th>
                <th className="border p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="border p-4 text-center" colSpan="7">
                    Loading CBT modules...
                  </td>
                </tr>
              ) : assignedCBTs.length === 0 ? (
                <tr>
                  <td className="border p-4 text-center" colSpan="7">
                    No CBT modules assigned.
                  </td>
                </tr>
              ) : (
                assignedCBTs.map((course) => {
                  const assignment = getAssignment(course);
                  const status = getCourseStatus(course);
                  const progress = getCourseProgress(course);

                  return (
                    <tr key={course.id}>
                      <td className="border p-3 font-semibold">{course.name}</td>
                      <td className="border p-3 text-center">{course.category}</td>
                      <td className="border p-3 text-center">
                        {formatDate(assignment?.assigned_at)}
                      </td>
                      <td className="border p-3 text-center">
                        {formatDate(getDueDate(course))}
                      </td>
                      <td className="border p-3 text-center font-bold">
                        <span
                          className={
                            status === "Completed"
                              ? "text-green-700"
                              : status === "Overdue"
                              ? "text-red-700"
                              : status === "In Progress"
                              ? "text-blue-700"
                              : "text-yellow-700"
                          }
                        >
                          {status}
                        </span>
                      </td>
                      <td className="border p-3 text-center">{progress}%</td>
                      <td className="border p-3 text-center">
                        {course.available ? (
                          <button
                            onClick={() => openCourse(course)}
                            className="px-4 py-2 rounded bg-blue-600 text-white"
                          >
                            Open
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 rounded bg-gray-300 text-gray-600"
                          >
                            Not Available
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow overflow-auto">
          <div className="p-5 border-b">
            <h2 className="text-2xl font-bold">Training History</h2>
          </div>

          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3 text-left">Module Name</th>
                <th className="border p-3">Version</th>
                <th className="border p-3">Completion Date</th>
                <th className="border p-3">Score</th>
                <th className="border p-3">Status</th>
                <th className="border p-3">Certificate</th>
              </tr>
            </thead>

            <tbody>
              {Object.values(completionMap).length === 0 ? (
                <tr>
                  <td className="border p-4 text-center" colSpan="6">
                    No completed CBT history found.
                  </td>
                </tr>
              ) : (
                Object.values(completionMap).map((item) => (
                  <tr key={item.id}>
                    <td className="border p-3 font-semibold">
                      {item.module_name}
                    </td>
                    <td className="border p-3 text-center">
                      {item.module_version || "1.0"}
                    </td>
                    <td className="border p-3 text-center">
                      {formatDate(item.completion_date)}
                    </td>
                    <td className="border p-3 text-center">
                      {item.score ?? "-"}%
                    </td>
                    <td className="border p-3 text-center">
                      {item.status || "-"}
                    </td>
                    <td className="border p-3 text-center">
                      {item.certificate_number || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;