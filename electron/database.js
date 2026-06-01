import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

const dbPath = path.join(app.getPath("userData"), "gemini-cbt.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT NOT NULL,
    passport_number TEXT NOT NULL,
    rank TEXT,
    cdc_number TEXT,
    course_name TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS assessment_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER,
    total_questions INTEGER,
    correct_answers INTEGER,
    percentage INTEGER,
    result_status TEXT,
    completed_at TEXT,
    FOREIGN KEY(candidate_id) REFERENCES candidates(id)
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER,
    certificate_number TEXT,
    course_name TEXT,
    issue_date TEXT,
    FOREIGN KEY(candidate_id) REFERENCES candidates(id)
  );
`);

export function saveCandidate(candidate) {
  const stmt = db.prepare(`
    INSERT INTO candidates 
    (candidate_name, passport_number, rank, cdc_number, course_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    candidate.candidateName,
    candidate.passportNumber,
    candidate.rank || "",
    candidate.cdcNumber || "",
    candidate.courseName || "Personal Safety",
    new Date().toISOString()
  );

  return result.lastInsertRowid;
}

export function saveAssessmentResult(data) {
  const stmt = db.prepare(`
    INSERT INTO assessment_results
    (candidate_id, total_questions, correct_answers, percentage, result_status, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    data.candidateId,
    data.total,
    data.correct,
    data.percentage,
    data.passed ? "PASS" : "FAIL",
    new Date().toISOString()
  );
}

export function saveCertificate(data) {
  const stmt = db.prepare(`
    INSERT INTO certificates
    (candidate_id, certificate_number, course_name, issue_date)
    VALUES (?, ?, ?, ?)
  `);

  return stmt.run(
    data.candidateId,
    data.certificateNumber,
    data.courseName,
    new Date().toISOString()
  );
}

export function getAllCandidates() {
  return db.prepare(`
    SELECT * FROM candidates
    ORDER BY id DESC
  `).all();
}