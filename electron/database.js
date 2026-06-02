import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

const dbPath = path.join(app.getPath("userData"), "gemini-cbt.db");
console.log("DATABASE PATH:", dbPath);

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT NOT NULL,
    passport_number TEXT NOT NULL UNIQUE,
    rank TEXT,
    cdc_number TEXT,
    course_name TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS chapter_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER,
    chapter_id TEXT,
    completed_at TEXT,
    UNIQUE(candidate_id, chapter_id),
    FOREIGN KEY(candidate_id) REFERENCES candidates(id)
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

export function findCandidateByPassport(passportNumber) {
  return db.prepare(`
    SELECT *
    FROM candidates
    WHERE passport_number = ?
  `).get(passportNumber);
}

export function saveCandidate(candidate) {
  const existing = findCandidateByPassport(candidate.passportNumber);

  if (existing) {
    return Number(existing.id);
  }

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

  return Number(result.lastInsertRowid);
}

export function getCompletedChapters(candidateId) {
  return db.prepare(`
    SELECT chapter_id
    FROM chapter_progress
    WHERE candidate_id = ?
    ORDER BY chapter_id ASC
  `).all(Number(candidateId));
}

export function markChapterCompleted(data) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO chapter_progress
    (candidate_id, chapter_id, completed_at)
    VALUES (?, ?, ?)
  `);

  return stmt.run(
    Number(data.candidateId),
    String(data.chapterId),
    new Date().toISOString()
  );
}

export function saveAssessmentResult(data) {
  const stmt = db.prepare(`
    INSERT INTO assessment_results
    (candidate_id, total_questions, correct_answers, percentage, result_status, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    Number(data.candidateId),
    Number(data.total),
    Number(data.correct),
    Number(data.percentage),
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
    Number(data.candidateId),
    data.certificateNumber,
    data.courseName,
    new Date().toISOString()
  );
}

export function getAllCandidates() {
  return db.prepare(`
    SELECT *
    FROM candidates
    ORDER BY id DESC
  `).all();
}

export function getAssessmentRecords() {
  return db.prepare(`
    SELECT
      c.id,
      c.candidate_name,
      c.passport_number,
      c.rank,
      c.cdc_number,
      c.course_name,
      c.created_at,
      a.correct_answers,
      a.percentage,
      a.result_status,
      a.completed_at,
      cert.certificate_number
    FROM candidates c
    LEFT JOIN assessment_results a
      ON c.id = a.candidate_id
    LEFT JOIN certificates cert
      ON c.id = cert.candidate_id
    ORDER BY c.id DESC
  `).all();
}