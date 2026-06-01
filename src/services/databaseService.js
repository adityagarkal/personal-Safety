export async function saveCandidateToDatabase(candidate) {
  if (!window.electronAPI?.saveCandidate) return null;
  return window.electronAPI.saveCandidate(candidate);
}

export async function saveAssessmentResultToDatabase(result) {
  if (!window.electronAPI?.saveAssessmentResult) return null;
  return window.electronAPI.saveAssessmentResult(result);
}

export async function saveCertificateToDatabase(certificate) {
  if (!window.electronAPI?.saveCertificate) return null;
  return window.electronAPI.saveCertificate(certificate);
}

export async function getAllCandidatesFromDatabase() {
  if (!window.electronAPI?.getAllCandidates) return [];
  return window.electronAPI.getAllCandidates();
}