import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

function App() {
  useEffect(() => {
    function handleHiddenShortcut(event) {
      const isCourseImportShortcut =
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "c";

      if (!isCourseImportShortcut) return;

      const currentHash = window.location.hash || "#/";
      const currentRoute = currentHash.replace("#", "") || "/";

      const isAdminRoute =
        currentRoute === "/admin" || currentRoute.startsWith("/admin/");

      if (!isAdminRoute) {
        return;
      }

      event.preventDefault();
      window.location.hash = "#/system/import-course";
    }

    window.addEventListener("keydown", handleHiddenShortcut);

    return () => {
      window.removeEventListener("keydown", handleHiddenShortcut);
    };
  }, []);

  return <AppRoutes />;
}

export default App;