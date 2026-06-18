import {
  BookOpen,
  CheckCircle,
  Clock,
  ClipboardList,
  PlayCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import StatCard from "../../components/user/StatCard";
import SectionCard from "../../components/user/SectionCard";
import StatusBadge from "../../components/user/StatusBadge";

function getLoggedInUser() {
  try {
    const storedUser = localStorage.getItem("gemini_login_user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function UserDashboard() {
  const user = getLoggedInUser();
  const navigate = useNavigate();


  function handleStartCbt() {
    navigate("/user/courses");
  }

  const recentCompletions = [];
  const inProgressCourses = [];

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

      <div className="mb-8 grid grid-cols-4 gap-5">
        <StatCard
          title="Mandatory Completed"
          value="0 / 5"
          subtitle="Required CBT modules"
          variant="primary"
          icon={<ClipboardList className="h-6 w-6" />}
        />

        <StatCard
          title="Recommended Completed"
          value="0"
          subtitle="Based on rank"
          variant="warning"
          icon={<BookOpen className="h-6 w-6" />}
        />

        <StatCard
          title="Total Completed"
          value="0"
          subtitle="Completed CBTs"
          variant="success"
          icon={<CheckCircle className="h-6 w-6" />}
        />

        <StatCard
          title="In Progress"
          value="0"
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
              Open the CBT course catalog to view mandatory, recommended, and
              available training courses.
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
                <CourseRow key={course.id} course={course} />
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
                <CourseRow key={course.id} course={course} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
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

function CourseRow({ course }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#DDE3EA] bg-[#F5F7FA] p-4">
      <div>
        <p className="font-semibold text-[#163B6D]">{course.name}</p>
        <p className="text-sm text-gray-500">{course.date}</p>
      </div>

      <StatusBadge status={course.status} />
    </div>
  );
}

export default UserDashboard;