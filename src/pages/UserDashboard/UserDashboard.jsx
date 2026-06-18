import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  Clock,
  ClipboardList,
  PlayCircle,
} from "lucide-react";

import UserLayout from "../../components/user/UserLayout";
import StatCard from "../../components/user/StatCard";
import SectionCard from "../../components/user/SectionCard";
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

function UserDashboard() {
  const navigate = useNavigate();
  const user = getLoggedInUser();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboardData() {
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
      console.error("Dashboard load error:", err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  function handleStartCbt() {
    navigate("/user/courses");
  }

  const dashboardStats = useMemo(() => {
    const mandatoryCourses = courses.filter(
      (course) => course.user_category === "mandatory"
    );

    const recommendedCourses = courses.filter(
      (course) => course.user_category === "recommended"
    );

    const completedCourses = courses.filter(
      (course) => course.progress_status === "completed"
    );

    const inProgressCourses = courses.filter(
      (course) => course.progress_status === "in_progress"
    );

    const mandatoryCompleted = mandatoryCourses.filter(
      (course) => course.progress_status === "completed"
    ).length;

    const recommendedCompleted = recommendedCourses.filter(
      (course) => course.progress_status === "completed"
    ).length;

    return {
      mandatoryCompleted,
      mandatoryTotal: mandatoryCourses.length,
      recommendedCompleted,
      recommendedTotal: recommendedCourses.length,
      totalCompleted: completedCourses.length,
      inProgressCount: inProgressCourses.length,
      completedCourses,
      inProgressCourses,
    };
  }, [courses]);

  const recentCompletions = useMemo(() => {
    return [...dashboardStats.completedCourses]
      .sort((a, b) => {
        const dateA = new Date(a.completed_at || 0).getTime();
        const dateB = new Date(b.completed_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [dashboardStats.completedCourses]);

  const inProgressCourses = useMemo(() => {
    return [...dashboardStats.inProgressCourses]
      .sort((a, b) => {
        const dateA = new Date(a.last_accessed_at || 0).getTime();
        const dateB = new Date(b.last_accessed_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [dashboardStats.inProgressCourses]);

  return (
    <UserLayout>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#2554C7]">
          Crew Training Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#163B6D]">
          Welcome, {user?.fullName || "Crew Member"}
        </h1>

        <p className="mt-2 text-gray-600">
          Track your CBT progress, continue training, and complete required
          onboard learning modules.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#DDE3EA] bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-[#163B6D]">
            Loading dashboard data...
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-4 gap-5">
            <StatCard
              title="Mandatory Completed"
              value={`${dashboardStats.mandatoryCompleted} / ${dashboardStats.mandatoryTotal}`}
              subtitle="Required CBT modules"
              variant="primary"
              icon={<ClipboardList className="h-6 w-6" />}
            />

            <StatCard
              title="Recommended Completed"
              value={`${dashboardStats.recommendedCompleted} / ${dashboardStats.recommendedTotal}`}
              subtitle="Based on rank"
              variant="warning"
              icon={<BookOpen className="h-6 w-6" />}
            />

            <StatCard
              title="Total Completed"
              value={dashboardStats.totalCompleted}
              subtitle="Completed CBTs"
              variant="success"
              icon={<CheckCircle className="h-6 w-6" />}
            />

            <StatCard
              title="In Progress"
              value={dashboardStats.inProgressCount}
              subtitle="Ongoing CBTs"
              variant="secondary"
              icon={<Clock className="h-6 w-6" />}
            />
          </div>

          <section className="mb-8 rounded-2xl border border-[#DDE3EA] bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-[#163B6D]">
                  Start CBT Training
                </h2>

                <p className="mt-2 max-w-2xl text-gray-600">
                  Open the CBT course catalog to view mandatory, recommended,
                  and available training courses.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartCbt}
                className="flex items-center gap-2 rounded-xl bg-[#2554C7] px-6 py-4 font-semibold text-white shadow-sm hover:bg-[#163B6D]"
              >
                <PlayCircle className="h-5 w-5" />
                Start CBT
              </button>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <SectionCard
              title="In Progress CBTs"
              subtitle="Continue from where you left off."
            >
              {inProgressCourses.length === 0 ? (
                <EmptyState
                  title="No CBT in progress"
                  text="Once you start a CBT course, it will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {inProgressCourses.map((course) => (
                    <CourseRow
                      key={course.id}
                      course={course}
                      actionLabel="Continue"
                      onAction={() =>
                        navigate(`/user/courses/${course.id}/language`)
                      }
                    />
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Recent Completed CBTs"
              subtitle="Your latest completed training records."
            >
              {recentCompletions.length === 0 ? (
                <EmptyState
                  title="No completed CBT yet"
                  text="Completed CBT courses will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {recentCompletions.map((course) => (
                    <CourseRow
                      key={course.id}
                      course={course}
                      actionLabel="Retake"
                      onAction={() =>
                        navigate(`/user/courses/${course.id}/language`)
                      }
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </UserLayout>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="rounded-xl border border-dashed border-[#DDE3EA] bg-[#F5F7FA] p-8 text-center">
      <p className="font-semibold text-[#163B6D]">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{text}</p>
    </div>
  );
}

function CourseRow({ course, actionLabel, onAction }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#DDE3EA] bg-[#F5F7FA] p-4">
      <div className="min-w-0">
        <p className="truncate font-semibold text-[#163B6D]">
          {course.course_name}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span>Code: {course.course_code}</span>
          <span>•</span>
          <span>{Number(course.progress_percentage || 0)}%</span>
          {course.completed_at && (
            <>
              <span>•</span>
              <span>{formatDate(course.completed_at)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={formatStatus(course.progress_status)} />

        <button
          type="button"
          onClick={onAction}
          className="rounded-lg bg-[#2554C7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163B6D]"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function formatStatus(status) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In Progress";
  return "Not Started";
}

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
}

export default UserDashboard;