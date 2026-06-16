import { HashRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import UserDashboard from "../pages/UserDashboard/UserDashboard";

import AdminLogin from "../pages/AdminLogin/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import AdminUsers from "../pages/AdminUsers/AdminUsers";
import AdminAddUser from "../pages/AdminAddUser/AdminAddUser";
import AdminRecords from "../pages/AdminRecords/AdminRecords";
import MonthlyReport from "../pages/MonthlyReport/MonthlyReport";


function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<UserDashboard />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/new" element={<AdminAddUser />} />
        <Route path="/admin/users/:id/edit" element={<AdminAddUser />} />

        <Route path="/admin/reports/users" element={<AdminRecords />} />
        <Route path="/admin/reports/users/:id" element={<AdminRecords />} />
        <Route path="/admin/reports/monthly" element={<MonthlyReport />} />
      </Routes>
    </HashRouter>
  );
}

export default AppRoutes;