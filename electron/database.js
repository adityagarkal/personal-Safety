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

  CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_code TEXT UNIQUE,
  course_name TEXT NOT NULL,
  category TEXT,
  folder_path TEXT NOT NULL,
  available_languages TEXT,
  total_chapters INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  imported_at TEXT
);

CREATE TABLE IF NOT EXISTS rank_course_matrix (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rank_name TEXT NOT NULL,
  course_id INTEGER NOT NULL,
  assignment_type TEXT DEFAULT 'recommended',
  FOREIGN KEY(course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS user_course_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  status TEXT DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0,
  current_chapter TEXT,
  current_page TEXT,
  started_at TEXT,
  completed_at TEXT,
  last_accessed_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS course_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  completion_date TEXT NOT NULL,
  certificate_generated INTEGER DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(course_id) REFERENCES courses(id)
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

function migrateCBTModulesToCourses() {
  const existingCourses = db.prepare(`
    SELECT COUNT(*) AS total FROM courses
  `).get();

  if (existingCourses.total > 0) return;

  const modules = db.prepare(`
    SELECT * FROM cbt_modules
    ORDER BY module_id ASC
  `).all();

  const insertCourse = db.prepare(`
    INSERT INTO courses
    (
      course_code,
      course_name,
      category,
      folder_path,
      available_languages,
      total_chapters,
      total_pages,
      is_active,
      imported_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const module of modules) {
    insertCourse.run(
      module.module_id,
      module.module_name,
      module.module_id === "001" ? "mandatory" : "recommended",
      `/content/${module.module_id}`,
      JSON.stringify(["EN"]),
      0,
      0,
      module.status === "Active" ? 1 : 0,
      new Date().toISOString()
    );
  }

  writeAuditLog({
    action: "CBT_MODULES_MIGRATED_TO_COURSES",
    newValue: JSON.stringify(modules),
    performedBy: "system",
  });
}

function seedRankCourseMatrix() {
  db.prepare(`DELETE FROM rank_course_matrix`).run();

  const personalSafety = db.prepare(`
    SELECT id, course_name
    FROM courses
    WHERE course_code = ?
  `).get("001");

  if (!personalSafety) return;

  const ranks = [
    "MASTER",
    "CH OFF",
    "2ND OFF",
    "3RD OFF",
    "DECK CADET",
    "BOSUN",
    "AB",
    "AB 1",
    "AB 2",
    "AB 3",
    "OS",
    "CH ENG",
    "2ND ENG",
    "3RD ENG",
    "4TH ENG",
    "TME",
    "ETO",
    "GAS ENGINEER",
    "FITTER",
    "OILER",
    "WIPER",
    "CH COOK",
    "GENERAL STEWARD",
  ];

  const insert = db.prepare(`
    INSERT INTO rank_course_matrix
    (rank_name, course_id, assignment_type)
    VALUES (?, ?, ?)
  `);

  for (const rank of ranks) {
    insert.run(rank, personalSafety.id, "mandatory");
  }

  writeAuditLog({
    action: "RANK_COURSE_MATRIX_RESET",
    newValue: JSON.stringify({
      course: personalSafety.course_name,
      ranks,
    }),
    performedBy: "system",
  });
}

ensureDefaultAdmin();
seedDefaultCBTModules();
migrateCBTModulesToCourses();
seedRankCourseMatrix();

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

function createUserCourseProgressFromRank(userId, rankName) {
  const courses = db.prepare(`
    SELECT
      rcm.course_id,
      rcm.assignment_type
    FROM rank_course_matrix rcm
    JOIN courses c ON c.id = rcm.course_id
    WHERE rcm.rank_name = ?
      AND c.is_active = 1
  `).all(rankName);

  if (courses.length === 0) return;

  const insertProgress = db.prepare(`
    INSERT OR IGNORE INTO user_course_progress
    (
      user_id,
      course_id,
      status,
      progress_percentage,
      current_chapter,
      current_page,
      started_at,
      completed_at,
      last_accessed_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const course of courses) {
    insertProgress.run(
      Number(userId),
      Number(course.course_id),
      "not_started",
      0,
      "",
      "",
      "",
      "",
      new Date().toISOString()
    );
  }

  writeAuditLog({
    userId: Number(userId),
    action: "RANK_BASED_COURSES_ASSIGNED",
    newValue: JSON.stringify({
      rank: rankName,
      coursesAssigned: courses.length,
    }),
    performedBy: "system",
  });
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
  createUserCourseProgressFromRank(userId, data.rank || "");

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

  const completionDate = new Date().toISOString();

  db.prepare(`
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
    completionDate,
    score,
    status,
    certificateNumber,
    completionDate
  );

  const course = db.prepare(`
    SELECT id
    FROM courses
    WHERE course_name = ?
  `).get(moduleName);

  if (course) {

    db.prepare(`
      INSERT OR IGNORE INTO course_completions
      (
        user_id,
        course_id,
        completion_date,
        certificate_generated
      )
      VALUES (?, ?, ?, ?)
    `).run(
      userId,
      course.id,
      completionDate,
      certificateNumber ? 1 : 0
    );

    db.prepare(`
      UPDATE user_course_progress
      SET
        status = 'completed',
        progress_percentage = 100,
        completed_at = ?
      WHERE user_id = ?
        AND course_id = ?
    `).run(
      completionDate,
      userId,
      course.id
    );
  }

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

export function getUserById(userId) {
  return db.prepare(`
    SELECT
      id,
      crew_id,
      first_name,
      last_name,
      full_name,
      rank,
      department,
      nationality,
      vessel,
      joining_date,
      contract_end_date,
      username,
      force_password_change,
      status,
      role,
      passport_number,
      cdc_number,
      training_assignments,
      created_at
    FROM users
    WHERE id = ?
  `).get(Number(userId));
}

export function getUserTrainingProfile(userId) {
  const id = Number(userId);

  const user = getUserById(id);

  if (!user) {
    return null;
  }

  const courses = db.prepare(`
    SELECT
      ucp.id,
      c.course_code,
      c.course_name,
      c.category,
      ucp.status,
      ucp.progress_percentage,
      ucp.current_chapter,
      ucp.current_page,
      ucp.started_at,
      ucp.completed_at,
      ucp.last_accessed_at
    FROM user_course_progress ucp
    JOIN courses c ON c.id = ucp.course_id
    WHERE ucp.user_id = ?
    ORDER BY c.course_code ASC
  `).all(id);

  const completions = db.prepare(`
    SELECT
      cc.id,
      c.course_code,
      c.course_name,
      c.category,
      cc.completion_date,
      cc.certificate_generated
    FROM course_completions cc
    JOIN courses c ON c.id = cc.course_id
    WHERE cc.user_id = ?
    ORDER BY cc.completion_date DESC
  `).all(id);

  return {
    user,
    courses,
    completions,
    summary: {
      assignedCourses: courses.length,
      completedCourses: completions.length,
      completionPercentage:
        courses.length > 0
          ? Math.round((completions.length / courses.length) * 100)
          : 0,
    },
  };
}

export function updateUser(data) {
  const id = Number(data.id);

  if (!id) {
    return {
      success: false,
      message: "User ID is required.",
    };
  }

  const existing = db.prepare(`
    SELECT *
    FROM users
    WHERE id = ?
  `).get(id);

  if (!existing) {
    return {
      success: false,
      message: "User not found.",
    };
  }

  const username = String(data.username || "").trim().toLowerCase();

  const duplicate = db.prepare(`
    SELECT id
    FROM users
    WHERE username = ?
      AND id != ?
  `).get(username, id);

  if (duplicate) {
    return {
      success: false,
      message: "Username already exists.",
    };
  }

  const firstName = data.firstName || data.first_name || "";
  const lastName = data.lastName || data.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  db.prepare(`
    UPDATE users
    SET
      crew_id = ?,
      first_name = ?,
      last_name = ?,
      full_name = ?,
      rank = ?,
      department = ?,
      nationality = ?,
      vessel = ?,
      joining_date = ?,
      contract_end_date = ?,
      username = ?,
      status = ?,
      role = ?,
      passport_number = ?,
      cdc_number = ?
    WHERE id = ?
  `).run(
    data.crewId || data.crew_id || "",
    firstName,
    lastName,
    fullName,
    data.rank || "",
    data.department || "",
    data.nationality || "",
    data.vessel || "",
    data.joiningDate || data.joining_date || "",
    data.contractEndDate || data.contract_end_date || "",
    username,
    data.status || "Active",
    data.role || "user",
    data.passportNumber || data.passport_number || "",
    data.cdcNumber || data.cdc_number || "",
    id
  );

  writeAuditLog({
    userId: id,
    action: "USER_UPDATED",
    previousValue: JSON.stringify({
      username: existing.username,
      rank: existing.rank,
      status: existing.status,
    }),
    newValue: JSON.stringify({
      username,
      rank: data.rank || "",
      status: data.status || "Active",
    }),
    performedBy: "admin",
  });

  return {
    success: true,
    message: "Crew member updated successfully.",
  };
}

export function archiveUser(userId) {
  const id = Number(userId);

  const user = db.prepare(`
    SELECT id, username, status
    FROM users
    WHERE id = ?
  `).get(id);

  if (!user) {
    return {
      success: false,
      message: "User not found.",
    };
  }

  db.prepare(`
    UPDATE users
    SET status = ?
    WHERE id = ?
  `).run("Archived", id);

  writeAuditLog({
    userId: id,
    action: "USER_ARCHIVED",
    previousValue: user.status || "",
    newValue: "Archived",
    performedBy: "admin",
  });

  return {
    success: true,
    message: "User archived successfully.",
  };
}

export function getUserWiseReports() {
  return db.prepare(`
    SELECT
      u.id AS user_id,
      u.id,
      u.crew_id,
      u.first_name,
      u.last_name,
      u.full_name,
      u.rank,
      u.status,

      COALESCE(up.total_assigned, 0) AS mandatory_total,

      COALESCE(cp.total_completed, 0) AS mandatory_completed,

      0 AS recommended_total,
      0 AS recommended_completed,

      COALESCE(cp.total_completed, 0) AS total_cbts

    FROM users u

    LEFT JOIN (
      SELECT
        user_id,
        COUNT(*) AS total_assigned
      FROM user_course_progress
      GROUP BY user_id
    ) up ON up.user_id = u.id

    LEFT JOIN (
      SELECT
        user_id,
        COUNT(*) AS total_completed
      FROM course_completions
      GROUP BY user_id
    ) cp ON cp.user_id = u.id

    WHERE u.role != 'admin'

    ORDER BY u.id DESC
  `).all();
}

export function getMonthlyReportStats(month) {
  return db.prepare(`
    SELECT
      COUNT(*) AS totalCompletions,
      COUNT(DISTINCT user_id) AS crewTrained
    FROM course_completions
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
    FROM course_completions
    WHERE substr(completion_date, 1, 7) = substr(date('now'), 1, 7)
  `).get();

  const todayCompletions = db.prepare(`
    SELECT COUNT(*) AS total
    FROM course_completions
    WHERE substr(completion_date, 1, 10) = date('now')
  `).get();

  const recentCompletions = db.prepare(`
    SELECT
      cc.id,
      cc.completion_date,
      c.course_name AS module_name,

      u.crew_id,
      u.first_name,
      u.last_name,
      u.full_name,
      u.rank

    FROM course_completions cc

    JOIN users u
      ON u.id = cc.user_id

    JOIN courses c
      ON c.id = cc.course_id

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