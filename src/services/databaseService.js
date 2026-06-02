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