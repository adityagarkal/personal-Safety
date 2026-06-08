import { HashRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import UserDashboard from "../pages/UserDashboard/UserDashboard";
import CourseSelection from "../pages/CourseSelection/CourseSelection";
import Dashboard from "../pages/Dashboard/Dashboard";
import CourseViewer from "../pages/CourseViewer/CourseViewer";
import AssessmentResult from "../pages/AssessmentResult/AssessmentResult";

import AdminLogin from "../pages/AdminLogin/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import AdminUsers from "../pages/AdminUsers/AdminUsers";
import AdminRecords from "../pages/AdminRecords/AdminRecords";

/*
  CREATE THESE NEXT
*/
import AdminAuditLogs from "../pages/AdminAuditLogs/AdminAuditLogs";
import MonthlyReport from "../pages/MonthlyReport/MonthlyReport";

function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/course-selection" element={<CourseSelection />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/admin-records" element={<AdminRecords />} />

        <Route
          path="/admin-audit-logs"
          element={<AdminAuditLogs />}
        />

        <Route
          path="/admin-monthly-report"
          element={<MonthlyReport />}
        />

        <Route
          path="/course/:chapterId/:pageNumber"
          element={<CourseViewer />}
        />

        <Route
          path="/assessment/:pageNumber"
          element={<CourseViewer />}
        />

        <Route
          path="/assessment-result"
          element={<AssessmentResult />}
        />
      </Routes>
    </HashRouter>
  );
}

export default AppRoutes;