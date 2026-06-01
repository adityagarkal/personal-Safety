import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  appName: "Gemini CBT",
});