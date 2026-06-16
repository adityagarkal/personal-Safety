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
  getUserWiseReports,
  getMonthlyReportStats,
  getAdminDashboardStats,
} from "./database.js";

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