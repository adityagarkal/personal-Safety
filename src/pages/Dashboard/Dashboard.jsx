import { useEffect, useState } from "react";
import { loadCourse } from "../../services/courseLoader";
import { Link } from "react-router-dom";

function Dashboard() {
  const [course, setCourse] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      const data = await loadCourse();
      setCourse(data);
    }

    fetchCourse();
  }, []);

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">

      <h1 className="text-4xl font-bold mb-8">
        {course.name}
      </h1>

      <h2 className="text-2xl font-semibold mb-4">
        Learning Objectives
      </h2>

      <ul className="list-disc pl-8 mb-8">
        {course.objectives.map((obj, index) => (
          <li key={index}>
            {obj}
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-semibold mb-4">
        Chapters
      </h2>

      <div className="space-y-3">
        {course.chapters.map((chapter, index) => (
  <Link
    key={index}
    to={`/course/${index + 1}/1`}
    className="block border rounded-lg p-4 hover:bg-gray-100"
  >
    <h3 className="font-bold text-lg">
      {chapter["@_name"]}
    </h3>

    <p>
      Pages: {chapter["@_nrPages"]}
    </p>

    <p>
      Questions: {chapter["@_nrQuest"]}
    </p>
  </Link>
))}
      </div>

    </div>
  );
}

export default Dashboard;