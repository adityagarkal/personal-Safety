import { HashRouter, Routes, Route } from "react-router-dom";

import CandidateDetails from "../pages/CandidateDetails/CandidateDetails";
import Dashboard from "../pages/Dashboard/Dashboard";
import CourseViewer from "../pages/CourseViewer/CourseViewer";
import AssessmentResult from "../pages/AssessmentResult/AssessmentResult";
import AdminRecords from "../pages/AdminRecords/AdminRecords";

function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CandidateDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/course/:chapterId/:pageNumber"
          element={<CourseViewer />}
        />

        <Route
          path="/assessment/:pageNumber"
          element={<CourseViewer />}
        />

        <Route path="/assessment-result" element={<AssessmentResult />} />

        <Route path="/admin-records" element={<AdminRecords />} />
      </Routes>
    </HashRouter>
  );
}

export default AppRoutes;