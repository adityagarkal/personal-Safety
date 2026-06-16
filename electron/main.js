import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import {
  validateLogin,
  createUser,
  updateUser,
  archiveUser,
  getUserById,
  getAllUsers,
  getCourses,
  getCourseByCode,
  getCourseById,
  createCourse,
  deleteCourseRecordById,
  getUserWiseReports,
  getMonthlyReportStats,
  getAdminDashboardStats,
} from "./database.js";

import {
  selectCourseFolder,
  importValidatedCourse,
} from "./courseImport.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.maximize();

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

function getCourseFilePath(relativePath) {
  const cleanPath = String(relativePath || "").replace(/^\/+/, "");

  if (path.isAbsolute(cleanPath)) {
    return cleanPath;
  }

  return path.join(app.getPath("userData"), cleanPath);
}

ipcMain.handle("file:readCourseFile", (_event, relativePath) => {
  const filePath = getCourseFilePath(relativePath);
  return fs.readFileSync(filePath, "utf-8");
});

ipcMain.handle("auth:validateLogin", (_event, data) => validateLogin(data));

ipcMain.handle("db:createUser", (_event, data) => createUser(data));
ipcMain.handle("db:updateUser", (_event, id, data) => updateUser(id, data));
ipcMain.handle("db:archiveUser", (_event, id) => archiveUser(id));
ipcMain.handle("db:getUserById", (_event, id) => getUserById(id));
ipcMain.handle("db:getAllUsers", () => getAllUsers());

ipcMain.handle("db:getCourses", () => getCourses());

ipcMain.handle("db:getUserWiseReports", () => getUserWiseReports());

ipcMain.handle("db:getMonthlyReportStats", (_event, month) =>
  getMonthlyReportStats(month)
);

ipcMain.handle("db:getAdminDashboardStats", () => getAdminDashboardStats());

ipcMain.handle("course:selectFolder", async () => {
  return selectCourseFolder();
});

ipcMain.handle("course:importSelected", async (_event, courseData) => {
  try {
    const existingCourse = getCourseByCode(courseData.courseCode);

    const copiedResult = importValidatedCourse(
      courseData,
      existingCourse?.course_path || ""
    );

    if (!copiedResult.success) {
      return copiedResult;
    }

    const dbResult = createCourse(copiedResult.data);

    if (!dbResult.success) {
      return dbResult;
    }

    return {
      success: true,
      message: dbResult.replaced
        ? "Course replaced successfully."
        : "Course imported and registered successfully.",
      data: {
        ...copiedResult.data,
        courseId: dbResult.courseId,
        replaced: dbResult.replaced,
      },
    };
  } catch (error) {
    console.error("Course import error:", error);

    return {
      success: false,
      message: error.message || "Unable to import course.",
    };
  }
});

ipcMain.handle("course:delete", async (_event, courseId) => {
  const course = getCourseById(courseId);

  if (!course) {
    return {
      success: false,
      message: "Course not found.",
    };
  }

  try {
    if (course.course_path && fs.existsSync(course.course_path)) {
      if (!isSafeCoursePath(course.course_path)) {
        return {
          success: false,
          message: "Unsafe course path detected. Delete cancelled.",
        };
      }

      fs.rmSync(course.course_path, {
        recursive: true,
        force: true,
      });
    }

    const dbResult = deleteCourseRecordById(courseId);

    return dbResult;
  } catch (error) {
    console.error("Course delete error:", error);

    return {
      success: false,
      message: "Unable to delete course folder.",
    };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function isSafeCoursePath(coursePath) {
  if (!coursePath) return false;

  const coursesDir = path.resolve(app.getPath("userData"), "courses");
  const targetPath = path.resolve(coursePath);

  return targetPath.startsWith(coursesDir + path.sep);
}