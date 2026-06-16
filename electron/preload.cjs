const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  appName: "Gemini CBT",

  readCourseFile: (relativePath) =>
    ipcRenderer.invoke("file:readCourseFile", relativePath),

  validateLogin: (data) =>
    ipcRenderer.invoke("auth:validateLogin", data),

  createUser: (data) =>
    ipcRenderer.invoke("db:createUser", data),

  updateUser: (id, data) =>
    ipcRenderer.invoke("db:updateUser", id, data),

  archiveUser: (id) =>
    ipcRenderer.invoke("db:archiveUser", id),

  getUserById: (id) =>
    ipcRenderer.invoke("db:getUserById", id),

  getAllUsers: () =>
    ipcRenderer.invoke("db:getAllUsers"),

  getCourses: () =>
    ipcRenderer.invoke("db:getCourses"),

  getUserWiseReports: () =>
    ipcRenderer.invoke("db:getUserWiseReports"),

  getMonthlyReportStats: (month) =>
    ipcRenderer.invoke("db:getMonthlyReportStats", month),

  getAdminDashboardStats: () =>
    ipcRenderer.invoke("db:getAdminDashboardStats"),

  selectCourseFolder: () =>
    ipcRenderer.invoke("course:selectFolder"),

  importSelectedCourse: (courseData) =>
    ipcRenderer.invoke("course:importSelected", courseData),

  deleteCourse: (courseId) =>
    ipcRenderer.invoke("course:delete", courseId),
});