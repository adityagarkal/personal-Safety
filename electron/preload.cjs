const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  appName: "Gemini CBT",

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
});