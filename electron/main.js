import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

import {
  validateLogin,
  createUser,
  getAllUsers,
  getUserWiseReports,
  getMonthlyReportStats,
  getAdminDashboardStats,
  assignTraining,
  getUserAssignments,
  saveModuleProgress,
  getModuleProgress,
  saveCBTCompletion,
  getUserCBTCompletions,
  getAuditLogs,
  getCBTModules,
  saveCandidate,
  findCandidateByPassport,
  getCompletedChapters,
  markChapterCompleted,
  saveAssessmentResult,
  saveCertificate,
  getAllCandidates,
  getAssessmentRecords,
  archiveUser,
  getUserById,
updateUser,
getUserTrainingProfile,
} from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCourseFilePath(relativePath) {
  const cleanPath = String(relativePath).replace(/^\/+/, "");

  if (app.isPackaged) {
    return path.join(app.getAppPath(), "dist", cleanPath);
  }

  return path.join(app.getAppPath(), "public", cleanPath);
}

function encryptText(text, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  return {
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    data: encrypted.toString("hex"),
  };
}

function generateMonthlyReport(data) {
  const month = data?.month || new Date().toISOString().slice(0, 7);
  const password = data?.password || "GeminiCBT@2026";
  const users = getAllUsers();

  const report = {
    reportType: "Gemini CBT Monthly Report",
    reportMonth: month,
    generatedAt: new Date().toISOString(),
    generatedBy: data?.generatedBy || "admin",
    archiveVersion: "1.0",
    users,
    cbtModules: getCBTModules(),
    auditLogs: getAuditLogs(),
    assessmentRecords: getAssessmentRecords(),

    trainingAssignments: users.flatMap((user) =>
      getUserAssignments(user.id).map((item) => ({
        ...item,
        username: user.username,
        crew_id: user.crew_id,
        full_name: user.full_name,
      }))
    ),

    cbtCompletions: users.flatMap((user) =>
      getUserCBTCompletions(user.id).map((item) => ({
        ...item,
        username: user.username,
        crew_id: user.crew_id,
        full_name: user.full_name,
      }))
    ),

    moduleProgress: users.flatMap((user) =>
      getUserAssignments(user.id).flatMap((assignment) =>
        getModuleProgress(user.id, assignment.module_name).map((item) => ({
          ...item,
          username: user.username,
          crew_id: user.crew_id,
          full_name: user.full_name,
        }))
      )
    ),
  };

  const plainText = JSON.stringify(report, null, 2);
  const checksum = crypto.createHash("sha256").update(plainText).digest("hex");

  const encrypted = encryptText(
    JSON.stringify({ checksum, report }, null, 2),
    password
  );

  const exportDir = path.join(app.getPath("userData"), "monthly-exports");

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const baseName = `Gemini_CBT_Monthly_Report_${month}`;
  const jsonPath = path.join(exportDir, `${baseName}.json`);
  const encryptedPath = path.join(exportDir, `${baseName}.enc`);

  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ checksum, report }, null, 2),
    "utf-8"
  );

  fs.writeFileSync(encryptedPath, JSON.stringify(encrypted, null, 2), "utf-8");

  return {
    success: true,
    message: "Monthly report generated successfully.",
    month,
    checksum,
    jsonPath,
    encryptedPath,
  };
}

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

ipcMain.handle("file:readCourseFile", (_event, relativePath) => {
  const filePath = getCourseFilePath(relativePath);
  return fs.readFileSync(filePath, "utf-8");
});

ipcMain.handle("auth:validateLogin", (_event, data) => validateLogin(data));
ipcMain.handle("db:createUser", (_event, data) => createUser(data));
ipcMain.handle("db:getAllUsers", () => getAllUsers());
ipcMain.handle("db:getUserWiseReports", () => getUserWiseReports());

ipcMain.handle("db:getMonthlyReportStats", (_event, month) =>
  getMonthlyReportStats(month)
);

ipcMain.handle("db:getAdminDashboardStats", () =>
  getAdminDashboardStats()
);

ipcMain.handle("db:assignTraining", (_event, data) => assignTraining(data));

ipcMain.handle("db:getUserAssignments", (_event, userId) =>
  getUserAssignments(userId)
);

ipcMain.handle("db:saveModuleProgress", (_event, data) =>
  saveModuleProgress(data)
);

ipcMain.handle("db:getModuleProgress", (_event, data) =>
  getModuleProgress(data.userId, data.moduleName)
);

ipcMain.handle("db:saveCBTCompletion", (_event, data) =>
  saveCBTCompletion(data)
);

ipcMain.handle("db:getUserCBTCompletions", (_event, userId) =>
  getUserCBTCompletions(userId)
);

ipcMain.handle("db:getAuditLogs", () => getAuditLogs());
ipcMain.handle("db:getCBTModules", () => getCBTModules());

ipcMain.handle("db:saveCandidate", (_event, candidate) =>
  saveCandidate(candidate)
);

ipcMain.handle("db:findCandidateByPassport", (_event, passportNumber) =>
  findCandidateByPassport(passportNumber)
);

ipcMain.handle("db:getCompletedChapters", (_event, candidateId) =>
  getCompletedChapters(candidateId)
);

ipcMain.handle("db:markChapterCompleted", (_event, data) =>
  markChapterCompleted(data)
);

ipcMain.handle("db:saveAssessmentResult", (_event, result) =>
  saveAssessmentResult(result)
);

ipcMain.handle("db:saveCertificate", (_event, certificate) =>
  saveCertificate(certificate)
);

ipcMain.handle("db:getAllCandidates", () => getAllCandidates());
ipcMain.handle("db:getAssessmentRecords", () => getAssessmentRecords());

ipcMain.handle("report:generateMonthlyReport", (_event, data) =>
  generateMonthlyReport(data)
);

ipcMain.handle("db:archiveUser", (_event, userId) =>
  archiveUser(userId)
);

ipcMain.handle("db:getUserById", (_event, userId) =>
  getUserById(userId)
);

ipcMain.handle("db:updateUser", (_event, data) =>
  updateUser(data)
);

ipcMain.handle("db:getUserTrainingProfile", (_event, userId) =>
  getUserTrainingProfile(userId)
);

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});