import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarCheck,
  Download,
  FileBadge,
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

function Certificates() {
  const user = getLoggedInUser();

  const [courses, setCourses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCertificateCourses() {
    try {
      setLoading(true);
      setError("");

      const response = await getUserCoursesFromDatabase({
        userId: user?.id,
        rank: user?.rank,
      });

      setCourses(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Certificates load error:", err);
      setError("Unable to load certificate records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCertificateCourses();
  }, []);

  const certificateCourses = useMemo(() => {
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

  return (
    <UserLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2554C7]">
            Certification
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#163B6D]">
            View Certificates
          </h1>

          <p className="mt-2 text-gray-600">
            Certificates will be available for completed CBT courses once
            certificate generation is enabled.
          </p>
        </div>

        <div className="rounded-2xl border border-[#DDE3EA] bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2554C7] text-white">
              <Award className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-500">
                Eligible Courses
              </p>
              <p className="text-2xl font-bold text-[#163B6D]">
                {certificateCourses.length}
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
            placeholder="Search certificate course..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {/* <div className="mb-6 rounded-2xl border border-[#F59E0B]/30 bg-[#FFFBEB] p-5">
        <div className="flex items-start gap-3">
          <FileBadge className="mt-1 h-6 w-6 shrink-0 text-[#F59E0B]" />

          <div>
            <h2 className="font-bold text-[#163B6D]">
              Certificate generation is planned for the next phase
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-700">
              This page is ready to display certificate records. Download and
              PDF generation will be connected later after finalizing the
              certificate format.
            </p>
          </div>
        </div>
      </div> */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#DDE3EA] bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-[#163B6D]">
            Loading certificates...
          </p>
        </div>
      ) : certificateCourses.length === 0 ? (
        <EmptyCertificates />
      ) : (
        <div className="space-y-4">
          {certificateCourses.map((course) => (
            <CertificateCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </UserLayout>
  );
}

function CertificateCard({ course }) {
  return (
    <div className="rounded-2xl border border-[#DDE3EA] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status="Completed" />
            <StatusBadge status="Certificate Pending" />
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
              Progress: 100%
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="flex shrink-0 cursor-not-allowed items-center gap-2 rounded-xl bg-gray-200 px-5 py-3 font-semibold text-gray-500"
          title="Certificate generation will be added later"
        >
          <Download className="h-5 w-5" />
          Download
        </button>
      </div>
    </div>
  );
}

function EmptyCertificates() {
  return (
    <div className="rounded-2xl border border-dashed border-[#DDE3EA] bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F7FA]">
        <Award className="h-9 w-9 text-[#2554C7]" />
      </div>

      <h2 className="text-xl font-bold text-[#163B6D]">
        No certificate records yet
      </h2>

      <p className="mt-2 text-gray-600">
        Complete a CBT course to make it eligible for certificate generation.
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

export default Certificates;