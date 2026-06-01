import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import CourseViewer from "../pages/CourseViewer/CourseViewer";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route
          path="/course/:chapterId/:pageNumber"
          element={<CourseViewer />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;