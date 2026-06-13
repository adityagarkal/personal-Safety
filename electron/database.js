import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

const dbPath = path.join(app.getPath("userData"), "gemini-cbt.db");
console.log("DATABASE PATH:", dbPath);

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crew_id TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    rank TEXT,
    department TEXT,
    nationality TEXT,
    vessel TEXT,
    joining_date TEXT,
    contract_end_date TEXT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    force_password_change TEXT DEFAULT 'No',
    status TEXT DEFAULT 'Active',
    role TEXT DEFAULT 'user',
    passport_number TEXT,
    cdc_number TEXT,
    training_assignments TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS training_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    module_name TEXT NOT NULL,
    module_version TEXT DEFAULT '1.0',
    assigned_by TEXT,
    assigned_at TEXT,
    status TEXT DEFAULT 'ASSIGNED',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS cbt_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    module_name TEXT NOT NULL,
    module_version TEXT DEFAULT '1.0',
    completion_date TEXT,
    score INTEGER,
    status TEXT,
    certificate_number TEXT,
    created_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id, module_name, module_version)
  );

  CREATE TABLE IF NOT EXISTS user_module_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    module_name TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    completed_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id, module_name, chapter_id)
  );

  CREATE TABLE IF NOT EXISTS cbt_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id TEXT NOT NULL UNIQUE,
    module_name TEXT NOT NULL,
    module_version TEXT DEFAULT '1.0',
    status TEXT DEFAULT 'Active',
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    login_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

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

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    previous_value TEXT,
    new_value TEXT,
    performed_by TEXT,
    performed_at TEXT
  );

  CREATE TRIGGER IF NOT EXISTS trg_cbt_completion_no_update
  BEFORE UPDATE ON cbt_completions
  BEGIN
    SELECT RAISE(ABORT, 'CBT completion records are immutable');
  END;

  CREATE TRIGGER IF NOT EXISTS trg_cbt_completion_no_delete
  BEFORE DELETE ON cbt_completions
  BEGIN
    SELECT RAISE(ABORT, 'CBT completion records cannot be deleted');
  END;

  CREATE TRIGGER IF NOT EXISTS trg_assessment_no_update
  BEFORE UPDATE ON assessment_results
  BEGIN
    SELECT RAISE(ABORT, 'Assessment results are immutable');
  END;

  CREATE TRIGGER IF NOT EXISTS trg_assessment_no_delete
  BEFORE DELETE ON assessment_results
  BEGIN
    SELECT RAISE(ABORT, 'Assessment results cannot be deleted');
  END;

  CREATE TRIGGER IF NOT EXISTS trg_certificate_no_update
  BEFORE UPDATE ON certificates
  BEGIN
    SELECT RAISE(ABORT, 'Certificates are immutable');
  END;

  CREATE TRIGGER IF NOT EXISTS trg_certificate_no_delete
  BEFORE DELETE ON certificates
  BEGIN
    SELECT RAISE(ABORT, 'Certificates cannot be deleted');
  END;
`);

function addColumnIfMissing(tableName, columnName, columnDefinition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    db.exec(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`
    );
  }
}

function migrateUsersTable() {
  addColumnIfMissing("users", "crew_id", "TEXT");
  addColumnIfMissing("users", "first_name", "TEXT");
  addColumnIfMissing("users", "last_name", "TEXT");
  addColumnIfMissing("users", "department", "TEXT");
  addColumnIfMissing("users", "nationality", "TEXT");
  addColumnIfMissing("users", "vessel", "TEXT");
  addColumnIfMissing("users", "joining_date", "TEXT");
  addColumnIfMissing("users", "contract_end_date", "TEXT");
  addColumnIfMissing("users", "force_password_change", "TEXT DEFAULT 'No'");
  addColumnIfMissing("users", "status", "TEXT DEFAULT 'Active'");
  addColumnIfMissing("users", "training_assignments", "TEXT");
}

migrateUsersTable();

function writeAuditLog({
  userId = null,
  action,
  previousValue = "",
  newValue = "",
  performedBy = "system",
}) {
  db.prepare(`
    INSERT INTO audit_logs
    (user_id, action, previous_value, new_value, performed_by, performed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    action,
    previousValue,
    newValue,
    performedBy,
    new Date().toISOString()
  );
}

function syncTrainingAssignments(
  userId,
  trainingAssignments,
  assignedBy = "admin"
) {
  const modules = String(trainingAssignments || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const insertStmt = db.prepare(`
    INSERT INTO training_assignments
    (user_id, module_name, module_version, assigned_by, assigned_at, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const moduleName of modules) {
    insertStmt.run(
      Number(userId),
      moduleName,
      "1.0",
      assignedBy,
      new Date().toISOString(),
      "ASSIGNED"
    );
  }

  if (modules.length > 0) {
    writeAuditLog({
      userId: Number(userId),
      action: "TRAINING_ASSIGNED",
      newValue: JSON.stringify(modules),
      performedBy: assignedBy,
    });
  }
}

function ensureDefaultAdmin() {
  const admin = db.prepare(`SELECT id FROM users WHERE username = ?`).get("admin");

  if (!admin) {
    db.prepare(`
      INSERT INTO users
      (
        crew_id, first_name, last_name, full_name, rank, department,
        nationality, vessel, joining_date, contract_end_date,
        username, password, force_password_change, status, role,
        passport_number, cdc_number, training_assignments, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "ADMIN001",
      "Administrator",
      "",
      "Administrator",
      "Admin",
      "Administration",
      "",
      "",
      "",
      "",
      "admin",
      "admin123",
      "No",
      "Active",
      "admin",
      "",
      "",
      "All",
      new Date().toISOString()
    );

    writeAuditLog({
      action: "DEFAULT_ADMIN_CREATED",
      newValue: "admin",
      performedBy: "system",
    });
  }
}

function seedDefaultCBTModules() {
  const modules = [
    ["001", "Personal Safety", "1.0", "Active"],
    ["002", "Ship General Safety", "1.0", "Inactive"],
    ["003", "Fire Safety", "1.0", "Inactive"],
    ["004", "Enclosed Space Entry", "1.0", "Inactive"],
    ["005", "BRM", "1.0", "Inactive"],
    ["006", "ECDIS", "1.0", "Inactive"],
    ["007", "Security Awareness", "1.0", "Inactive"],
    ["008", "Pollution Prevention", "1.0", "Inactive"],
    ["009", "Survival Craft", "1.0", "Inactive"],
    ["010", "First Aid", "1.0", "Inactive"],
  ];

  const existing = db.prepare(`SELECT COUNT(*) AS total FROM cbt_modules`).get();

  if (existing.total === 0) {
    const stmt = db.prepare(`
      INSERT INTO cbt_modules
      (module_id, module_name, module_version, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const module of modules) {
      stmt.run(module[0], module[1], module[2], module[3], new Date().toISOString());
    }

    writeAuditLog({
      action: "CBT_MODULES_SEEDED",
      newValue: JSON.stringify(modules),
      performedBy: "system",
    });
  }
}

ensureDefaultAdmin();
seedDefaultCBTModules();

export function validateLogin(data) {
  const username = String(data.username || "").trim().toLowerCase();
  const password = String(data.password || "").trim();

  if (!username || !password) {
    return {
      success: false,
      message: "Username and password are required.",
      user: null,
    };
  }

  const user = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);

  if (!user) {
    return {
      success: false,
      message: "User not found. Login can only be created by admin.",
      user: null,
    };
  }

  if (user.status === "Inactive") {
    return {
      success: false,
      message: "This user account is inactive. Contact admin.",
      user: null,
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      message: "Invalid username or password.",
      user: null,
    };
  }

  db.prepare(`
    INSERT INTO login_history
    (user_id, username, login_at)
    VALUES (?, ?, ?)
  `).run(user.id, user.username, new Date().toISOString());

  writeAuditLog({
    userId: user.id,
    action: "USER_LOGIN",
    newValue: user.username,
    performedBy: user.username,
  });

  return {
    success: true,
    message: "Login successful.",
    user: {
      ...user,
      password: undefined,
      assignments: getUserAssignments(user.id),
      completions: getUserCBTCompletions(user.id),
    },
  };
}

export function createUser(data) {
  const username = String(data.username || "").trim().toLowerCase();
  const password = String(data.password || "").trim();

  if (!username || !password) {
    return {
      success: false,
      message: "Username and password are required.",
    };
  }

  const existing = db.prepare(`SELECT id FROM users WHERE username = ?`).get(username);

  if (existing) {
    return {
      success: false,
      message: "Username already exists.",
    };
  }

  const firstName = data.firstName || "";
  const lastName = data.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || data.fullName || "";

  const result = db.prepare(`
    INSERT INTO users
    (
      crew_id, first_name, last_name, full_name, rank, department,
      nationality, vessel, joining_date, contract_end_date,
      username, password, force_password_change, status, role,
      passport_number, cdc_number, training_assignments, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.crewId || "",
    firstName,
    lastName,
    fullName,
    data.rank || "",
    data.department || "",
    data.nationality || "",
    data.vessel || "",
    data.joiningDate || "",
    data.contractEndDate || "",
    username,
    password,
    data.forcePasswordChange || "No",
    data.status || "Active",
    data.role || "user",
    data.passportNumber || "",
    data.cdcNumber || "",
    data.trainingAssignments || "",
    new Date().toISOString()
  );

  const userId = Number(result.lastInsertRowid);

  syncTrainingAssignments(userId, data.trainingAssignments || "", "admin");

  writeAuditLog({
    userId,
    action: "USER_CREATED",
    newValue: JSON.stringify({
      username,
      crewId: data.crewId || "",
      fullName,
      role: data.role || "user",
      status: data.status || "Active",
      trainingAssignments: data.trainingAssignments || "",
    }),
    performedBy: "admin",
  });

  return {
    success: true,
    message: "Crew login created successfully.",
  };
}

export function assignTraining(data) {
  const result = db.prepare(`
    INSERT INTO training_assignments
    (user_id, module_name, module_version, assigned_by, assigned_at, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    Number(data.userId),
    data.moduleName,
    data.moduleVersion || "1.0",
    data.assignedBy || "admin",
    new Date().toISOString(),
    "ASSIGNED"
  );

  writeAuditLog({
    userId: Number(data.userId),
    action: "TRAINING_ASSIGNED",
    newValue: JSON.stringify({
      moduleName: data.moduleName,
      moduleVersion: data.moduleVersion || "1.0",
    }),
    performedBy: data.assignedBy || "admin",
  });

  return result;
}

export function getUserAssignments(userId) {
  return db.prepare(`
    SELECT *
    FROM training_assignments
    WHERE user_id = ?
    ORDER BY id DESC
  `).all(Number(userId));
}

export function saveModuleProgress(data) {
  const userId = Number(data.userId);
  const moduleName = String(data.moduleName || "").trim();
  const chapterId = String(data.chapterId || "").trim();

  if (!userId || !moduleName || !chapterId) {
    return {
      success: false,
      message: "User ID, module name, and chapter ID are required.",
    };
  }

  const existing = db.prepare(`
    SELECT id
    FROM user_module_progress
    WHERE user_id = ?
      AND module_name = ?
      AND chapter_id = ?
  `).get(userId, moduleName, chapterId);

  if (existing) {
    return {
      success: true,
      message: "Progress already recorded.",
    };
  }

  db.prepare(`
    INSERT INTO user_module_progress
    (user_id, module_name, chapter_id, completed_at)
    VALUES (?, ?, ?, ?)
  `).run(userId, moduleName, chapterId, new Date().toISOString());

  writeAuditLog({
    userId,
    action: "MODULE_PROGRESS",
    newValue: JSON.stringify({ moduleName, chapterId }),
    performedBy: "system",
  });

  return {
    success: true,
    message: "Progress saved.",
  };
}

export function getModuleProgress(userId, moduleName) {
  return db.prepare(`
    SELECT *
    FROM user_module_progress
    WHERE user_id = ?
      AND module_name = ?
    ORDER BY chapter_id ASC
  `).all(Number(userId), moduleName);
}

export function saveCBTCompletion(data) {
  const userId = Number(data.userId);
  const moduleName = String(data.moduleName || "").trim();
  const moduleVersion = String(data.moduleVersion || "1.0").trim();
  const score = Number(data.score || 0);
  const status = String(data.status || "PASS").trim();
  const certificateNumber = String(data.certificateNumber || "").trim();

  if (!userId || !moduleName) {
    return {
      success: false,
      message: "User ID and module name are required.",
    };
  }

  const existing = db.prepare(`
    SELECT id
    FROM cbt_completions
    WHERE user_id = ?
      AND module_name = ?
      AND module_version = ?
  `).get(userId, moduleName, moduleVersion);

  if (existing) {
    return {
      success: false,
      message: "Completion record already exists and is locked.",
    };
  }

  const result = db.prepare(`
    INSERT INTO cbt_completions
    (
      user_id,
      module_name,
      module_version,
      completion_date,
      score,
      status,
      certificate_number,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    moduleName,
    moduleVersion,
    new Date().toISOString(),
    score,
    status,
    certificateNumber,
    new Date().toISOString()
  );

  writeAuditLog({
    userId,
    action: "CBT_COMPLETED",
    newValue: JSON.stringify({
      moduleName,
      moduleVersion,
      score,
      status,
      certificateNumber,
    }),
    performedBy: "system",
  });

  return {
    success: true,
    message: "CBT completion saved and locked.",
    result,
  };
}

export function getUserCBTCompletions(userId) {
  return db.prepare(`
    SELECT *
    FROM cbt_completions
    WHERE user_id = ?
    ORDER BY completion_date DESC
  `).all(Number(userId));
}

export function getAllUsers() {
  return db.prepare(`
    SELECT
      id, crew_id, first_name, last_name, full_name, rank, department,
      nationality, vessel, joining_date, contract_end_date, username,
      force_password_change, status, role, passport_number, cdc_number,
      training_assignments, created_at
    FROM users
    ORDER BY id DESC
  `).all();
}

export function getUserWiseReports() {
  return db.prepare(`
    SELECT
      u.id,
      u.crew_id,
      u.first_name,
      u.last_name,
      u.full_name,
      u.rank,
      u.status,

      COALESCE(ta.total_assigned, 0) AS mandatory_total,
      COALESCE(cc.total_completed, 0) AS mandatory_completed,

      0 AS recommended_total,
      0 AS recommended_completed,

      COALESCE(cc.total_completed, 0) AS total_cbts

    FROM users u

    LEFT JOIN (
      SELECT user_id, COUNT(*) AS total_assigned
      FROM training_assignments
      GROUP BY user_id
    ) ta ON ta.user_id = u.id

    LEFT JOIN (
      SELECT user_id, COUNT(*) AS total_completed
      FROM cbt_completions
      GROUP BY user_id
    ) cc ON cc.user_id = u.id

    WHERE u.role != 'admin'
    ORDER BY u.id DESC
  `).all();
}

export function getMonthlyReportStats(month) {
  return db.prepare(`
    SELECT
      COUNT(*) AS totalCompletions,
      COUNT(DISTINCT user_id) AS crewTrained,
      AVG(score) AS averageScore
    FROM cbt_completions
    WHERE substr(completion_date, 1, 7) = ?
  `).get(month);
}

export function getAdminDashboardStats() {
  const totalUsers = db.prepare(`
    SELECT COUNT(*) AS total
    FROM users
    WHERE role != 'admin'
  `).get();

  const activeUsers = db.prepare(`
    SELECT COUNT(*) AS total
    FROM users
    WHERE role != 'admin'
      AND status = 'Active'
  `).get();

  const archivedUsers = db.prepare(`
    SELECT COUNT(*) AS total
    FROM users
    WHERE role != 'admin'
      AND status = 'Archived'
  `).get();

  const completedThisMonth = db.prepare(`
    SELECT COUNT(*) AS total
    FROM cbt_completions
    WHERE substr(completion_date, 1, 7) = substr(date('now'), 1, 7)
  `).get();

  const todayCompletions = db.prepare(`
    SELECT COUNT(*) AS total
    FROM cbt_completions
    WHERE substr(completion_date, 1, 10) = date('now')
  `).get();

  const recentCompletions = db.prepare(`
    SELECT
      cc.id,
      cc.module_name,
      cc.completion_date,
      cc.status,
      cc.score,
      u.crew_id,
      u.first_name,
      u.last_name,
      u.full_name,
      u.rank
    FROM cbt_completions cc
    JOIN users u ON u.id = cc.user_id
    ORDER BY cc.completion_date DESC
    LIMIT 8
  `).all();

  return {
    totalUsers: totalUsers.total || 0,
    activeUsers: activeUsers.total || 0,
    archivedUsers: archivedUsers.total || 0,
    completedThisMonth: completedThisMonth.total || 0,
    todayCompletions: todayCompletions.total || 0,
    recentCompletions,
  };
}

export function getCBTModules() {
  return db.prepare(`
    SELECT *
    FROM cbt_modules
    ORDER BY module_id ASC
  `).all();
}

export function getAuditLogs() {
  return db.prepare(`
    SELECT
      id,
      user_id,
      action,
      previous_value,
      new_value,
      performed_by,
      performed_at
    FROM audit_logs
    ORDER BY id DESC
  `).all();
}

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

  const result = db.prepare(`
    INSERT INTO candidates
    (candidate_name, passport_number, rank, cdc_number, course_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
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
  const existing = db.prepare(`
    SELECT id
    FROM chapter_progress
    WHERE candidate_id = ? AND chapter_id = ?
  `).get(Number(data.candidateId), String(data.chapterId));

  if (existing) {
    return {
      success: true,
      message: "Chapter completion already recorded and locked.",
    };
  }

  const result = db.prepare(`
    INSERT INTO chapter_progress
    (candidate_id, chapter_id, completed_at)
    VALUES (?, ?, ?)
  `).run(
    Number(data.candidateId),
    String(data.chapterId),
    new Date().toISOString()
  );

  writeAuditLog({
    userId: Number(data.candidateId),
    action: "CHAPTER_COMPLETED",
    newValue: JSON.stringify({
      chapterId: String(data.chapterId),
    }),
    performedBy: "system",
  });

  return result;
}

export function saveAssessmentResult(data) {
  const existing = db.prepare(`
    SELECT id
    FROM assessment_results
    WHERE candidate_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(Number(data.candidateId));

  if (existing) {
    return {
      success: false,
      message:
        "Assessment completion already exists and is read-only. Retraining must create a new transaction.",
    };
  }

  const result = db.prepare(`
    INSERT INTO assessment_results
    (candidate_id, total_questions, correct_answers, percentage, result_status, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    Number(data.candidateId),
    Number(data.total),
    Number(data.correct),
    Number(data.percentage),
    data.passed ? "PASS" : "FAIL",
    new Date().toISOString()
  );

  writeAuditLog({
    userId: Number(data.candidateId),
    action: "ASSESSMENT_COMPLETED",
    newValue: JSON.stringify({
      total: data.total,
      correct: data.correct,
      percentage: data.percentage,
      status: data.passed ? "PASS" : "FAIL",
    }),
    performedBy: "system",
  });

  return result;
}

export function saveCertificate(data) {
  const existing = db.prepare(`
    SELECT id
    FROM certificates
    WHERE candidate_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(Number(data.candidateId));

  if (existing) {
    return {
      success: false,
      message:
        "Certificate already exists and is read-only. Existing certificate cannot be overwritten.",
    };
  }

  const result = db.prepare(`
    INSERT INTO certificates
    (candidate_id, certificate_number, course_name, issue_date)
    VALUES (?, ?, ?, ?)
  `).run(
    Number(data.candidateId),
    data.certificateNumber,
    data.courseName,
    new Date().toISOString()
  );

  writeAuditLog({
    userId: Number(data.candidateId),
    action: "CERTIFICATE_CREATED",
    newValue: JSON.stringify({
      certificateNumber: data.certificateNumber,
      courseName: data.courseName,
    }),
    performedBy: "system",
  });

  return result;
}

export function getAllCandidates() {
  return db.prepare(`SELECT * FROM candidates ORDER BY id DESC`).all();
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