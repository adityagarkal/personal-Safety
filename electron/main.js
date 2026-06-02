import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

import {
  saveCandidate,
  findCandidateByPassport,
  getCompletedChapters,
  markChapterCompleted,
  saveAssessmentResult,
  saveCertificate,
  getAllCandidates,
  getAssessmentRecords,
} from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

ipcMain.handle("db:saveCandidate", (_event, candidate) => {
  return saveCandidate(candidate);
});

ipcMain.handle("db:findCandidateByPassport", (_event, passportNumber) => {
  return findCandidateByPassport(passportNumber);
});

ipcMain.handle("db:getCompletedChapters", (_event, candidateId) => {
  return getCompletedChapters(candidateId);
});

ipcMain.handle("db:markChapterCompleted", (_event, data) => {
  return markChapterCompleted(data);
});

ipcMain.handle("db:saveAssessmentResult", (_event, result) => {
  return saveAssessmentResult(result);
});

ipcMain.handle("db:saveCertificate", (_event, certificate) => {
  return saveCertificate(certificate);
});

ipcMain.handle("db:getAllCandidates", () => {
  return getAllCandidates();
});

ipcMain.handle("db:getAssessmentRecords", () => {
  return getAssessmentRecords();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});