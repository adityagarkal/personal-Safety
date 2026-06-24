function ensureElectronApi(methodName) {
  if (!window.electronAPI?.[methodName]) {
    throw new Error(`Electron API method not available: ${methodName}`);
  }

  return window.electronAPI[methodName];
}

export async function validateLoginFromDatabase(data) {
  return ensureElectronApi("validateLogin")(data);
}

export async function createUserInDatabase(data) {
  return ensureElectronApi("createUser")(data);
}

export async function updateUserInDatabase(id, data) {
  return ensureElectronApi("updateUser")(id, data);
}

export async function archiveUserInDatabase(id) {
  return ensureElectronApi("archiveUser")(id);
}

export async function getUserByIdFromDatabase(id) {
  return ensureElectronApi("getUserById")(id);
}

export async function getAllUsersFromDatabase() {
  return ensureElectronApi("getAllUsers")();
}

export async function getCoursesFromDatabase() {
  return ensureElectronApi("getCourses")();
}

export async function getUserWiseReportsFromDatabase() {
  return ensureElectronApi("getUserWiseReports")();
}

export async function getMonthlyReportStatsFromDatabase(month) {
  return ensureElectronApi("getMonthlyReportStats")(month);
}

export async function getAdminDashboardStatsFromDatabase() {
  return ensureElectronApi("getAdminDashboardStats")();
}

export async function getUserTrainingProfileFromDatabase(userId) {
  if (!window.electronAPI?.getUserTrainingProfile) {
    throw new Error("Electron user training profile API not available");
  }

  return window.electronAPI.getUserTrainingProfile(userId);
}
export async function selectCoursePackageFromSystem() {
  return ensureElectronApi("selectCoursePackage")();
}

export async function selectCourseFolderFromSystem() {
  return ensureElectronApi("selectCourseFolder")();
}

export async function importSelectedCourseToSystem(courseData) {
  return ensureElectronApi("importSelectedCourse")(courseData);
}

export async function deleteCourseFromSystem(courseId) {
  return ensureElectronApi("deleteCourse")(courseId);
}

export async function getUserCoursesFromDatabase(data) {
  return ensureElectronApi("getUserCourses")(data);
}

export async function getUserCourseProgressFromDatabase(data) {
  return ensureElectronApi("getUserCourseProgress")(data);
}

export async function saveUserCourseProgressToDatabase(data) {
  return ensureElectronApi("saveUserCourseProgress")(data);
}

export async function completeUserCourseInDatabase(data) {
  return ensureElectronApi("completeUserCourse")(data);
}