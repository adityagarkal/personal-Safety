import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

const dbPath = path.join(app.getPath("userData"), "gemini-cbt.db");

console.log("DATABASE PATH:", dbPath);

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    crew_id TEXT UNIQUE,

    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT,

    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,

    rank TEXT,
    department TEXT,
    nationality TEXT,
    vessel TEXT,

    joining_date TEXT,
    contract_end_date TEXT,

    passport_number TEXT,
    cdc_number TEXT,

    status TEXT DEFAULT 'Active',
    role TEXT DEFAULT 'user',

    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    course_code TEXT UNIQUE NOT NULL,
    course_name TEXT NOT NULL,
    short_name TEXT,

    category TEXT DEFAULT 'other',

    course_path TEXT NOT NULL,
    available_languages TEXT DEFAULT '["EN"]',

    total_chapters INTEGER DEFAULT 0,
    total_pages INTEGER DEFAULT 0,

    is_active INTEGER DEFAULT 1,

    imported_at TEXT,
    updated_at TEXT
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

    selected_language TEXT DEFAULT 'EN',

    started_at TEXT,
    completed_at TEXT,
    last_accessed_at TEXT,

    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(course_id) REFERENCES courses(id),

    UNIQUE(user_id, course_id)
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
`);

function now() {
  return new Date().toISOString();
}

function getFullName(firstName, lastName, fallback = "") {
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  return fullName || fallback || "";
}

function ensureDefaultAdmin() {
  const existingAdmin = db
    .prepare(`SELECT id FROM users WHERE username = ?`)
    .get("admin");

  if (existingAdmin) return;

  db.prepare(`
    INSERT INTO users
    (
      crew_id,
      first_name,
      last_name,
      full_name,
      username,
      password,
      rank,
      department,
      nationality,
      vessel,
      joining_date,
      contract_end_date,
      passport_number,
      cdc_number,
      status,
      role,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "ADMIN001",
    "System",
    "Administrator",
    "System Administrator",
    "admin",
    "admin123",
    "Admin",
    "Administration",
    "",
    "",
    "",
    "",
    "",
    "",
    "Active",
    "admin",
    now(),
    now()
  );
}

ensureDefaultAdmin();

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

  const user = db
    .prepare(`SELECT * FROM users WHERE username = ?`)
    .get(username);

  if (!user) {
    return {
      success: false,
      message: "User not found.",
      user: null,
    };
  }

  if (user.status === "Archived" || user.status === "Inactive") {
    return {
      success: false,
      message: "This account is not active.",
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

  return {
    success: true,
    message: "Login successful.",
    user: {
      ...user,
      password: undefined,
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

  const existingUser = db
    .prepare(`SELECT id FROM users WHERE username = ?`)
    .get(username);

  if (existingUser) {
    return {
      success: false,
      message: "Username already exists.",
    };
  }

  const firstName = String(data.firstName || "").trim();
  const lastName = String(data.lastName || "").trim();

  const fullName = getFullName(firstName, lastName, data.fullName);

  db.prepare(`
    INSERT INTO users
    (
      crew_id,
      first_name,
      last_name,
      full_name,
      username,
      password,
      rank,
      department,
      nationality,
      vessel,
      joining_date,
      contract_end_date,
      passport_number,
      cdc_number,
      status,
      role,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.crewId || "",
    firstName,
    lastName,
    fullName,
    username,
    password,
    data.rank || "",
    data.department || "",
    data.nationality || "",
    data.vessel || "",
    data.joiningDate || "",
    data.contractEndDate || "",
    data.passportNumber || "",
    data.cdcNumber || "",
    data.status || "Active",
    data.role || "user",
    now(),
    now()
  );

  return {
    success: true,
    message: "Crew member created successfully.",
  };
}

export function updateUser(id, data) {
  const userId = Number(id);

  if (!userId) {
    return {
      success: false,
      message: "Valid user ID is required.",
    };
  }

  const firstName = String(data.firstName || "").trim();
  const lastName = String(data.lastName || "").trim();
  const fullName = getFullName(firstName, lastName, data.fullName);

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
      passport_number = ?,
      cdc_number = ?,
      status = ?,
      updated_at = ?
    WHERE id = ?
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
    data.passportNumber || "",
    data.cdcNumber || "",
    data.status || "Active",
    now(),
    userId
  );

  return {
    success: true,
    message: "Crew member updated successfully.",
  };
}

export function archiveUser(id) {
  const userId = Number(id);

  if (!userId) {
    return {
      success: false,
      message: "Valid user ID is required.",
    };
  }

  db.prepare(`
    UPDATE users
    SET status = 'Archived', updated_at = ?
    WHERE id = ?
  `).run(now(), userId);

  return {
    success: true,
    message: "Crew member archived successfully.",
  };
}

export function getUserById(id) {
  return db
    .prepare(`
      SELECT
        id,
        crew_id,
        first_name,
        last_name,
        full_name,
        username,
        rank,
        department,
        nationality,
        vessel,
        joining_date,
        contract_end_date,
        passport_number,
        cdc_number,
        status,
        role,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
    `)
    .get(Number(id));
}

export function getAllUsers() {
  return db
    .prepare(`
      SELECT
        id,
        crew_id,
        first_name,
        last_name,
        full_name,
        username,
        rank,
        department,
        nationality,
        vessel,
        joining_date,
        contract_end_date,
        passport_number,
        cdc_number,
        status,
        role,
        created_at,
        updated_at
      FROM users
      ORDER BY id DESC
    `)
    .all();
}

export function getCourses() {
  return db
    .prepare(`
      SELECT *
      FROM courses
      WHERE is_active = 1
      ORDER BY course_code ASC
    `)
    .all();
}

export function getAdminDashboardStats() {
  const totalUsers = db
    .prepare(`SELECT COUNT(*) AS total FROM users WHERE role != 'admin'`)
    .get().total;

  const activeUsers = db
    .prepare(
      `SELECT COUNT(*) AS total FROM users WHERE role != 'admin' AND status = 'Active'`
    )
    .get().total;

  const archivedUsers = db
    .prepare(
      `SELECT COUNT(*) AS total FROM users WHERE role != 'admin' AND status = 'Archived'`
    )
    .get().total;

  const monthPrefix = new Date().toISOString().slice(0, 7);

  const completedThisMonth = db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM course_completions
      WHERE completion_date LIKE ?
    `)
    .get(`${monthPrefix}%`).total;

  const recentCompletions = db
    .prepare(`
      SELECT
        cc.id,
        cc.completion_date,
        u.crew_id,
        u.first_name,
        u.last_name,
        u.full_name,
        u.rank,
        c.course_name
      FROM course_completions cc
      JOIN users u ON u.id = cc.user_id
      JOIN courses c ON c.id = cc.course_id
      ORDER BY cc.completion_date DESC
      LIMIT 10
    `)
    .all();

  return {
    totalUsers,
    activeUsers,
    archivedUsers,
    completedThisMonth,
    todayCompletions: 0,
    recentCompletions,
  };
}

export function getUserWiseReports() {
  const users = db
    .prepare(`
      SELECT
        id,
        crew_id,
        first_name,
        last_name,
        full_name,
        rank,
        department,
        vessel,
        status
      FROM users
      WHERE role != 'admin'
      ORDER BY full_name ASC
    `)
    .all();

  return users.map((user) => {
    const mandatoryTotal = db
      .prepare(`SELECT COUNT(*) AS total FROM courses WHERE category = 'mandatory' AND is_active = 1`)
      .get().total;

    const mandatoryCompleted = db
      .prepare(`
        SELECT COUNT(*) AS total
        FROM course_completions cc
        JOIN courses c ON c.id = cc.course_id
        WHERE cc.user_id = ?
          AND c.category = 'mandatory'
          AND c.is_active = 1
      `)
      .get(user.id).total;

    const recommendedTotal = db
      .prepare(`
        SELECT COUNT(*) AS total
        FROM rank_course_matrix rcm
        JOIN courses c ON c.id = rcm.course_id
        WHERE rcm.rank_name = ?
          AND rcm.assignment_type = 'recommended'
          AND c.is_active = 1
      `)
      .get(user.rank || "").total;

    const recommendedCompleted = db
      .prepare(`
        SELECT COUNT(*) AS total
        FROM course_completions cc
        JOIN courses c ON c.id = cc.course_id
        JOIN rank_course_matrix rcm ON rcm.course_id = c.id
        WHERE cc.user_id = ?
          AND rcm.rank_name = ?
          AND rcm.assignment_type = 'recommended'
          AND c.is_active = 1
      `)
      .get(user.id, user.rank || "").total;

    const totalCbts = db
      .prepare(`SELECT COUNT(*) AS total FROM course_completions WHERE user_id = ?`)
      .get(user.id).total;

    return {
      ...user,
      mandatory_completed: mandatoryCompleted,
      mandatory_total: mandatoryTotal,
      recommended_completed: recommendedCompleted,
      recommended_total: recommendedTotal,
      total_cbts: totalCbts,
    };
  });
}

export function getMonthlyReportStats(month) {
  const monthPrefix = month || new Date().toISOString().slice(0, 7);

  const totalCompletions = db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM course_completions
      WHERE completion_date LIKE ?
    `)
    .get(`${monthPrefix}%`).total;

  const crewTrained = db
    .prepare(`
      SELECT COUNT(DISTINCT user_id) AS total
      FROM course_completions
      WHERE completion_date LIKE ?
    `)
    .get(`${monthPrefix}%`).total;

  const mandatoryCompletions = db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM course_completions cc
      JOIN courses c ON c.id = cc.course_id
      WHERE cc.completion_date LIKE ?
        AND c.category = 'mandatory'
    `)
    .get(`${monthPrefix}%`).total;

  const recommendedCompletions = db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM course_completions cc
      JOIN courses c ON c.id = cc.course_id
      WHERE cc.completion_date LIKE ?
        AND c.category = 'recommended'
    `)
    .get(`${monthPrefix}%`).total;

  const crewRows = db
    .prepare(`
      SELECT
        u.crew_id,
        u.full_name,
        u.first_name,
        u.last_name,
        u.rank,
        COUNT(cc.id) AS completed_count,
        MAX(cc.completion_date) AS last_completion_date
      FROM course_completions cc
      JOIN users u ON u.id = cc.user_id
      WHERE cc.completion_date LIKE ?
      GROUP BY u.id
      ORDER BY completed_count DESC
    `)
    .all(`${monthPrefix}%`);

  return {
    totalCompletions,
    crewTrained,
    mandatoryCompletions,
    recommendedCompletions,
    crewRows,
  };
}

export function createCourse(data) {
  const courseCode = String(data.courseCode || "").trim();
  const courseName = String(data.courseName || "").trim();

  if (!courseCode || !courseName) {
    return {
      success: false,
      message: "Course code and course name are required.",
    };
  }

  const existingCourse = db
    .prepare(`SELECT * FROM courses WHERE course_code = ?`)
    .get(courseCode);

  if (existingCourse) {
    const category = data.category || existingCourse.category || "other";

    db.prepare(`
      UPDATE courses
      SET
        course_name = ?,
        short_name = ?,
        category = ?,
        course_path = ?,
        available_languages = ?,
        total_chapters = ?,
        total_pages = ?,
        is_active = 1,
        updated_at = ?
      WHERE course_code = ?
    `).run(
      courseName,
      data.shortName || "",
      category,
      data.destinationPath,
      JSON.stringify(data.languages || ["EN"]),
      Number(data.totalChapters || 0),
      Number(data.totalPages || 0),
      now(),
      courseCode
    );

    db.prepare(`
      UPDATE user_course_progress
      SET
        status = 'not_started',
        progress_percentage = 0,
        current_chapter = NULL,
        current_page = NULL,
        selected_language = 'EN',
        started_at = NULL,
        completed_at = NULL,
        last_accessed_at = NULL
      WHERE course_id = ?
        AND status != 'completed'
    `).run(existingCourse.id);

    return {
      success: true,
      message: "Existing course replaced successfully.",
      courseId: existingCourse.id,
      replaced: true,
    };
  }

  const result = db.prepare(`
    INSERT INTO courses
    (
      course_code,
      course_name,
      short_name,
      category,
      course_path,
      available_languages,
      total_chapters,
      total_pages,
      is_active,
      imported_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    courseCode,
    courseName,
    data.shortName || "",
    data.category || "other",
    data.destinationPath,
    JSON.stringify(data.languages || ["EN"]),
    Number(data.totalChapters || 0),
    Number(data.totalPages || 0),
    1,
    now(),
    now()
  );

  return {
    success: true,
    message: "Course imported successfully.",
    courseId: Number(result.lastInsertRowid),
    replaced: false,
  };
}

export function getCourseByCode(courseCode) {
  return db
    .prepare(`SELECT * FROM courses WHERE course_code = ?`)
    .get(String(courseCode || "").trim());
}

export function getCourseById(courseId) {
  return db
    .prepare(`SELECT * FROM courses WHERE id = ?`)
    .get(Number(courseId));
}

export function deleteCourseRecordById(courseId) {
  const id = Number(courseId);

  if (!id) {
    return {
      success: false,
      message: "Valid course ID is required.",
    };
  }

  db.prepare(`
    UPDATE courses
    SET
      is_active = 0,
      course_path = '',
      updated_at = ?
    WHERE id = ?
  `).run(now(), id);

  db.prepare(`
    UPDATE user_course_progress
    SET
      status = 'not_started',
      progress_percentage = 0,
      current_chapter = NULL,
      current_page = NULL,
      started_at = NULL,
      completed_at = NULL,
      last_accessed_at = NULL
    WHERE course_id = ?
      AND status != 'completed'
  `).run(id);

  return {
    success: true,
    message: "Course removed successfully. Completion history remains saved.",
  };
}