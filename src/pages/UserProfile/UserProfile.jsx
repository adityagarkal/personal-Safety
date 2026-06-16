import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getUserTrainingProfileFromDatabase } from "../../services/databaseService";

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserTrainingProfileFromDatabase(id);
        setProfile(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-10">Loading...</div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout>
        <div className="p-10">User not found.</div>
      </AdminLayout>
    );
  }

  const { user, courses, completions, summary } = profile;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            User Training Profile
          </h1>
          <p className="text-gray-500">
            Complete training record
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/reports/users")}
          className="px-5 py-3 rounded-lg bg-gray-200 font-semibold"
        >
          ← Back
        </button>
      </div>

      {/* USER INFO */}

      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          Crew Information
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Crew ID</p>
            <p className="font-semibold">{user.crew_id}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Name</p>
            <p className="font-semibold">{user.full_name}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Rank</p>
            <p className="font-semibold">{user.rank}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Department</p>
            <p className="font-semibold">{user.department}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Nationality</p>
            <p className="font-semibold">{user.nationality}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Passport</p>
            <p className="font-semibold">{user.passport_number}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">CDC</p>
            <p className="font-semibold">{user.cdc_number}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Vessel</p>
            <p className="font-semibold">{user.vessel}</p>
          </div>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <p className="text-gray-500 text-sm">Assigned Courses</p>
          <h2 className="text-3xl font-bold mt-2">
            {summary.assignedCourses}
          </h2>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <p className="text-gray-500 text-sm">Completed Courses</p>
          <h2 className="text-3xl font-bold mt-2">
            {summary.completedCourses}
          </h2>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <p className="text-gray-500 text-sm">Completion %</p>
          <h2 className="text-3xl font-bold mt-2">
            {summary.completionPercentage}%
          </h2>
        </div>
      </div>

      {/* COURSE PROGRESS */}

      <div className="bg-white rounded-xl border shadow-sm mb-6">
        <div className="p-5 border-b">
          <h2 className="font-bold text-lg">
            Course Progress
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-4">Course</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Progress</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="p-4 border-t">
                  {course.course_name}
                </td>

                <td className="p-4 border-t">
                  {course.category}
                </td>

                <td className="p-4 border-t">
                  {course.status}
                </td>

                <td className="p-4 border-t">
                  {course.progress_percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* COMPLETION HISTORY */}

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-5 border-b">
          <h2 className="font-bold text-lg">
            Completion History
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-4">Course</th>
              <th className="text-left p-4">Completion Date</th>
              <th className="text-left p-4">Certificate</th>
            </tr>
          </thead>

          <tbody>
            {completions.map((item) => (
              <tr key={item.id}>
                <td className="p-4 border-t">
                  {item.course_name}
                </td>

                <td className="p-4 border-t">
                  {item.completion_date}
                </td>

                <td className="p-4 border-t">
                  {item.certificate_generated ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default UserProfile;