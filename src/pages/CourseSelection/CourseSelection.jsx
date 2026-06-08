import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserAssignmentsFromDatabase,
  getCBTModulesFromDatabase,
  getUserCBTCompletionsFromDatabase,
} from "../../services/databaseService";

const courses = [
  {
    id: "001",
    name: "Personal Safety",
    category: "Safety",
    rankRecommended: ["All"],
    folder: "001-Personal_Safety_2009",
    path: "content/001-Personal_Safety_2009/p_safety",
    available: true,
    estimatedDuration: "45 minutes",
  },
  {
    id: "002",
    name: "Ship General Safety",
    category: "Safety",
    rankRecommended: ["All"],
    folder: "002-Ship_General_Safety_2009",
    path: "content/002-Ship_General_Safety_2009/p_safety",
    available: false,
    estimatedDuration: "45 minutes",
  },
  {
    id: "003",
    name: "Fire Safety",
    category: "Safety",
    rankRecommended: ["All"],
    available: false,
    estimatedDuration: "60 minutes",
  },
  {
    id: "004",
    name: "Security Awareness",
    category: "Security",
    rankRecommended: ["All"],
    available: false,
    estimatedDuration: "35 minutes",
  },
  {
    id: "005",
    name: "Pollution Prevention",
    category: "Environment",
    rankRecommended: ["All"],
    available: false,
    estimatedDuration: "45 minutes",
  },
  {
    id: "006",
    name: "Survival Craft",
    category: "Safety",
    rankRecommended: ["Deck", "Officer", "Master", "Captain"],
    available: false,
    estimatedDuration: "50 minutes",
  },
  {
    id: "007",
    name: "First Aid",
    category: "Medical",
    rankRecommended: ["All"],
    available: false,
    estimatedDuration: "50 minutes",
  },
  {
    id: "008",
    name: "BRM",
    category: "Navigation",
    rankRecommended: ["Deck", "Officer", "Master", "Captain"],
    available: false,
    estimatedDuration: "60 minutes",
  },
  {
    id: "009",
    name: "ECDIS",
    category: "Navigation",
    rankRecommended: ["Deck", "Officer", "Master", "Captain"],
    available: false,
    estimatedDuration: "60 minutes",
  },
  {
    id: "010",
    name: "Risk Assessment",
    category: "Safety",
    rankRecommended: ["All"],
    available: false,
    estimatedDuration: "40 minutes",
  },
];

function getLoginUser() {
  const raw = localStorage.getItem("gemini_login_user");
  return raw ? JSON.parse(raw) : null;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
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

function CourseSelection() {
  const navigate = useNavigate();
  const loginUser = getLoginUser();

  const [activeTab, setActiveTab] = useState("mandatory");
  const [assignments, setAssignments] = useState([]);
  const [modules, setModules] = useState([]);
  const [completionMap, setCompletionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        if (!loginUser?.id) {
          setAssignments([]);
          setModules([]);
          setCompletionMap({});
          return;
        }

        const assignmentData = await getUserAssignmentsFromDatabase(loginUser.id);
        const moduleData = await getCBTModulesFromDatabase();
        const completionData = await getUserCBTCompletionsFromDatabase(loginUser.id);

        const safeCompletions = Array.isArray(completionData)
          ? completionData
          : [];

        const nextCompletionMap = {};
        safeCompletions.forEach((item) => {
          nextCompletionMap[item.module_name] = item;
        });

        setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
        setModules(Array.isArray(moduleData) ? moduleData : []);
        setCompletionMap(nextCompletionMap);
      } catch (err) {
        console.error("CBT Page Load Error:", err);
        setError("Unable to load CBT page data from SQLite.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [loginUser?.id]);

  const enrichedCourses = useMemo(() => {
    return courses.map((course) => {
      const assignment = assignments.find(
        (item) => normalize(item.module_name) === normalize(course.name)
      );

      const moduleRecord = modules.find(
        (item) => normalize(item.module_name) === normalize(course.name)
      );

      const completion = completionMap[course.name] || null;

      const isMandatory = Boolean(assignment);

      const rank = normalize(loginUser?.rank);
      const recommendedForRank =
        course.rankRecommended.includes("All") ||
        course.rankRecommended.some((item) => rank.includes(normalize(item)));

      return {
        ...course,
        assignment,
        moduleRecord,
        completion,
        mandatory: isMandatory,
        recommendedForRank,
        version:
          assignment?.module_version ||
          moduleRecord?.module_version ||
          "1.0",
        status: completion
          ? "Completed"
          : isMandatory
          ? "Assigned"
          : course.available
          ? "Available"
          : "Coming Soon",
      };
    });
  }, [assignments, modules, completionMap, loginUser?.rank]);

  const mandatoryCourses = enrichedCourses.filter((course) => course.mandatory);

  const recommendedCourses = enrichedCourses.filter(
    (course) => course.recommendedForRank
  );

  const visibleCourses =
    activeTab === "mandatory"
      ? mandatoryCourses
      : activeTab === "recommended"
      ? recommendedCourses
      : enrichedCourses;

  function selectCourse(course) {
    if (!course.available) return;

    localStorage.setItem("selected_course", JSON.stringify(course));
    localStorage.removeItem("gemini_assessment_result");
    localStorage.removeItem("gemini_certificate_number");
    localStorage.removeItem("gemini_completion_saved_to_db");

    navigate("/dashboard");
  }

  function getStatusClass(status) {
    if (status === "Completed") return "text-green-700";
    if (status === "Assigned") return "text-blue-700";
    if (status === "Available") return "text-green-700";
    return "text-red-600";
  }

  const fullName =
    loginUser?.fullName ||
    loginUser?.full_name ||
    `${loginUser?.first_name || ""} ${loginUser?.last_name || ""}`.trim() ||
    loginUser?.username ||
    "-";

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">CBT Training Center</h1>
            <p className="text-gray-600 mt-2">
              My Mandatory CBTs, Recommended for My Rank, and All Available CBTs.
            </p>
            <p className="text-gray-500 mt-1">
              Crew: <strong>{fullName}</strong> | Rank:{" "}
              <strong>{loginUser?.rank || "-"}</strong>
            </p>
          </div>

          <button
            onClick={() => navigate("/user-dashboard")}
            className="px-5 py-3 rounded bg-gray-200"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow mb-8">
          <div className="flex flex-wrap border-b">
            <button
              onClick={() => setActiveTab("mandatory")}
              className={`px-6 py-4 font-semibold ${
                activeTab === "mandatory"
                  ? "border-b-4 border-blue-600 text-blue-700"
                  : "text-gray-600"
              }`}
            >
              My Mandatory CBTs ({mandatoryCourses.length})
            </button>

            <button
              onClick={() => setActiveTab("recommended")}
              className={`px-6 py-4 font-semibold ${
                activeTab === "recommended"
                  ? "border-b-4 border-blue-600 text-blue-700"
                  : "text-gray-600"
              }`}
            >
              Recommended for My Rank ({recommendedCourses.length})
            </button>

            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-4 font-semibold ${
                activeTab === "all"
                  ? "border-b-4 border-blue-600 text-blue-700"
                  : "text-gray-600"
              }`}
            >
              All Available CBTs ({enrichedCourses.length})
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="p-6 text-center text-gray-600">
                Loading CBT modules...
              </div>
            ) : visibleCourses.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No CBT modules found in this section.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {visibleCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`text-left rounded-xl border p-6 shadow transition ${
                      course.available
                        ? "bg-white hover:bg-blue-50 hover:border-blue-500"
                        : "bg-gray-200 opacity-80"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm font-semibold text-gray-500">
                        CBT {course.id}
                      </div>

                      <span
                        className={`text-sm font-bold ${getStatusClass(
                          course.status
                        )}`}
                      >
                        {course.status}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold mb-2">{course.name}</h2>

                    <div className="space-y-2 text-sm text-gray-700 mb-5">
                      <p>
                        <strong>Category:</strong> {course.category}
                      </p>

                      <p>
                        <strong>Version:</strong> {course.version}
                      </p>

                      <p>
                        <strong>Duration:</strong> {course.estimatedDuration}
                      </p>

                      {course.assignment && (
                        <p>
                          <strong>Assigned:</strong>{" "}
                          {formatDate(course.assignment.assigned_at)}
                        </p>
                      )}

                      {course.completion && (
                        <p>
                          <strong>Completed:</strong>{" "}
                          {formatDate(course.completion.completion_date)}
                        </p>
                      )}

                      {course.completion && (
                        <p>
                          <strong>Score:</strong> {course.completion.score}%
                        </p>
                      )}
                    </div>

                    {course.available ? (
                      <button
                        onClick={() => selectCourse(course)}
                        className="w-full px-4 py-3 rounded bg-blue-600 text-white"
                      >
                        {course.completion ? "View CBT" : "Start CBT"}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full px-4 py-3 rounded bg-gray-300 text-gray-600"
                      >
                        Not Available Onboard
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-2">Recommendation</h2>
          <p className="text-gray-700">
            Complete at least one CBT module every month to maintain continuous
            professional development.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CourseSelection;