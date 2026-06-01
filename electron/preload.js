import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  appName: "Gemini CBT",

  saveCandidate: (candidate) =>
    ipcRenderer.invoke("db:saveCandidate", candidate),

  saveAssessmentResult: (result) =>
    ipcRenderer.invoke("db:saveAssessmentResult", result),

  saveCertificate: (certificate) =>
    ipcRenderer.invoke("db:saveCertificate", certificate),

  getAllCandidates: () =>
    ipcRenderer.invoke("db:getAllCandidates"),
});