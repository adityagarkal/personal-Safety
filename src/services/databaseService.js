export async function validateLoginFromDatabase(data) {
  if (!window.electronAPI?.validateLogin) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.validateLogin(data);
}

export async function createUserInDatabase(data) {
  if (!window.electronAPI?.createUser) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.createUser(data);
}

export async function getAllUsersFromDatabase() {
  if (!window.electronAPI?.getAllUsers) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.getAllUsers();
}

export async function assignTrainingInDatabase(data) {
  if (!window.electronAPI?.assignTraining) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.assignTraining(data);
}

export async function getUserAssignmentsFromDatabase(userId) {
  if (!window.electronAPI?.getUserAssignments) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.getUserAssignments(userId);
}

export async function saveModuleProgressToDatabase(data) {
  if (!window.electronAPI?.saveModuleProgress) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.saveModuleProgress(data);
}

export async function getModuleProgressFromDatabase(data) {
  if (!window.electronAPI?.getModuleProgress) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.getModuleProgress(data);
}

export async function saveCBTCompletionToDatabase(data) {
  if (!window.electronAPI?.saveCBTCompletion) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.saveCBTCompletion(data);
}

export async function getUserCBTCompletionsFromDatabase(userId) {
  if (!window.electronAPI?.getUserCBTCompletions) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.getUserCBTCompletions(userId);
}

export async function saveCandidateToDatabase(candidate) {
  if (!window.electronAPI?.saveCandidate) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.saveCandidate(candidate);
}

export async function findCandidateByPassportFromDatabase(passportNumber) {
  if (!window.electronAPI?.findCandidateByPassport) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.findCandidateByPassport(passportNumber);
}

export async function getCompletedChaptersFromDatabase(candidateId) {
  if (!window.electronAPI?.getCompletedChapters) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.getCompletedChapters(candidateId);
}

export async function markChapterCompletedInDatabase(data) {
  if (!window.electronAPI?.markChapterCompleted) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.markChapterCompleted(data);
}

export async function saveAssessmentResultToDatabase(result) {
  if (!window.electronAPI?.saveAssessmentResult) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.saveAssessmentResult(result);
}

export async function saveCertificateToDatabase(certificate) {
  if (!window.electronAPI?.saveCertificate) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.saveCertificate(certificate);
}

export async function getAllCandidatesFromDatabase() {
  if (!window.electronAPI?.getAllCandidates) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.getAllCandidates();
}

export async function getAssessmentRecordsFromDatabase() {
  if (!window.electronAPI?.getAssessmentRecords) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.getAssessmentRecords();
}

export async function getAuditLogsFromDatabase() {
  if (!window.electronAPI?.getAuditLogs) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.getAuditLogs();
}

export async function getCBTModulesFromDatabase() {
  if (!window.electronAPI?.getCBTModules) {
    throw new Error("Electron database API not available");
  }

  return window.electronAPI.getCBTModules();
}

export async function generateMonthlyReportInDatabase(data) {
  if (!window.electronAPI?.generateMonthlyReport) {
    throw new Error("Electron report API not available");
  }

  return window.electronAPI.generateMonthlyReport(data);
}