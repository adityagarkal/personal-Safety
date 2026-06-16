const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  appName: "Gemini CBT",

  readCourseFile: (relativePath) =>
    ipcRenderer.invoke("file:readCourseFile", relativePath),

  validateLogin: (data) =>
    ipcRenderer.invoke("auth:validateLogin", data),

  createUser: (data) =>
    ipcRenderer.invoke("db:createUser", data),

  getAllUsers: () =>
    ipcRenderer.invoke("db:getAllUsers"),

  assignTraining: (data) =>
    ipcRenderer.invoke("db:assignTraining", data),

  getUserAssignments: (userId) =>
    ipcRenderer.invoke("db:getUserAssignments", userId),

  saveModuleProgress: (data) =>
    ipcRenderer.invoke("db:saveModuleProgress", data),

  getModuleProgress: (data) =>
    ipcRenderer.invoke("db:getModuleProgress", data),

  saveCBTCompletion: (data) =>
    ipcRenderer.invoke("db:saveCBTCompletion", data),

  getUserCBTCompletions: (userId) =>
    ipcRenderer.invoke("db:getUserCBTCompletions", userId),

  getAuditLogs: () =>
    ipcRenderer.invoke("db:getAuditLogs"),

  getCBTModules: () =>
    ipcRenderer.invoke("db:getCBTModules"),

  generateMonthlyReport: (data) =>
    ipcRenderer.invoke("report:generateMonthlyReport", data),

  saveCandidate: (candidate) =>
    ipcRenderer.invoke("db:saveCandidate", candidate),

  findCandidateByPassport: (passportNumber) =>
    ipcRenderer.invoke("db:findCandidateByPassport", passportNumber),

  getCompletedChapters: (candidateId) =>
    ipcRenderer.invoke("db:getCompletedChapters", candidateId),

  markChapterCompleted: (data) =>
    ipcRenderer.invoke("db:markChapterCompleted", data),

  saveAssessmentResult: (result) =>
    ipcRenderer.invoke("db:saveAssessmentResult", result),

  saveCertificate: (certificate) =>
    ipcRenderer.invoke("db:saveCertificate", certificate),

  getAllCandidates: () =>
    ipcRenderer.invoke("db:getAllCandidates"),

  getAssessmentRecords: () =>
    ipcRenderer.invoke("db:getAssessmentRecords"),

  getUserWiseReports: () =>
  ipcRenderer.invoke("db:getUserWiseReports"),

  getMonthlyReportStats: (month) =>
  ipcRenderer.invoke("db:getMonthlyReportStats", month),

  getAdminDashboardStats: () =>
  ipcRenderer.invoke("db:getAdminDashboardStats"),

  archiveUser: (userId) =>
  ipcRenderer.invoke("db:archiveUser", userId),

  getUserById: (userId) =>
  ipcRenderer.invoke("db:getUserById", userId),

updateUser: (data) =>
  ipcRenderer.invoke("db:updateUser", data),

getUserTrainingProfile: (userId) =>
  ipcRenderer.invoke("db:getUserTrainingProfile", userId),
});