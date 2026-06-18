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

export function getUserTrainingProfile(userId) {
  const id = Number(userId);

  const user = getUserById(id);

  if (!user) {
    return null;
  }

  const courses = db
    .prepare(`
      SELECT
        c.id AS course_id,
        c.course_code,
        c.course_name,
        c.short_name,
        c.category AS base_category,

        CASE
          WHEN c.category = 'mandatory' THEN 'mandatory'
          WHEN EXISTS (
            SELECT 1
            FROM rank_course_matrix rcm
            WHERE rcm.course_id = c.id
              AND rcm.rank_name = ?
              AND rcm.assignment_type = 'recommended'
          ) THEN 'recommended'
          ELSE 'other'
        END AS course_category,

        COALESCE(ucp.status, 'not_started') AS status,
        COALESCE(ucp.progress_percentage, 0) AS progress_percentage,
        ucp.current_chapter,
        ucp.current_page,
        ucp.selected_language,
        ucp.started_at,
        ucp.completed_at,
        ucp.last_accessed_at

      FROM courses c

      LEFT JOIN user_course_progress ucp
        ON ucp.course_id = c.id
        AND ucp.user_id = ?

      WHERE c.is_active = 1

      ORDER BY
        CASE
          WHEN c.category = 'mandatory' THEN 1
          WHEN EXISTS (
            SELECT 1
            FROM rank_course_matrix rcm2
            WHERE rcm2.course_id = c.id
              AND rcm2.rank_name = ?
              AND rcm2.assignment_type = 'recommended'
          ) THEN 2
          ELSE 3
        END,
        c.course_code ASC
    `)
    .all(user.rank || "", id, user.rank || "");

  const completions = courses
    .filter((course) => course.status === "completed")
    .map((course) => ({
      id: `${id}-${course.course_id}`,
      course_id: course.course_id,
      course_code: course.course_code,
      course_name: course.course_name,
      course_category: course.course_category,
      completion_date: course.completed_at,
      certificate_generated: 0,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.completion_date || 0).getTime();
      const dateB = new Date(b.completion_date || 0).getTime();
      return dateB - dateA;
    });

  const mandatoryCourses = courses.filter(
    (course) => course.course_category === "mandatory"
  );

  const recommendedCourses = courses.filter(
    (course) => course.course_category === "recommended"
  );

  const otherCourses = courses.filter(
    (course) => course.course_category === "other"
  );

  const completedCourses = courses.filter(
    (course) => course.status === "completed"
  );

  const inProgressCourses = courses.filter(
    (course) => course.status === "in_progress"
  );

  const notStartedCourses = courses.filter(
    (course) => course.status === "not_started"
  );

  const assignedCourses = [...mandatoryCourses, ...recommendedCourses];

  return {
    user,
    courses,
    completions,
    summary: {
      totalCourses: courses.length,

      assignedCourses: assignedCourses.length,
      assignedCompleted: assignedCourses.filter(
        (course) => course.status === "completed"
      ).length,

      mandatoryTotal: mandatoryCourses.length,
      mandatoryCompleted: mandatoryCourses.filter(
        (course) => course.status === "completed"
      ).length,

      recommendedTotal: recommendedCourses.length,
      recommendedCompleted: recommendedCourses.filter(
        (course) => course.status === "completed"
      ).length,

      otherTotal: otherCourses.length,
      otherCompleted: otherCourses.filter(
        (course) => course.status === "completed"
      ).length,

      completedCourses: completedCourses.length,
      inProgressCourses: inProgressCourses.length,
      notStartedCourses: notStartedCourses.length,

      completionPercentage:
        assignedCourses.length > 0
          ? Math.round(
              (assignedCourses.filter((course) => course.status === "completed")
                .length /
                assignedCourses.length) *
                100
            )
          : 0,
    },
  };
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
      SELECT
        c.*,
        GROUP_CONCAT(rcm.rank_name) AS recommended_ranks
      FROM courses c
      LEFT JOIN rank_course_matrix rcm
        ON rcm.course_id = c.id
        AND rcm.assignment_type = 'recommended'
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.course_code ASC
    `)
    .all();
}

export function getAdminDashboardStats() {
  const totalUsers = db
    .prepare(`SELECT COUNT(*) AS total FROM users WHERE role != 'admin'`)
    .get().total;

  const activeUsers = db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE role != 'admin'
        AND status = 'Active'
    `)
    .get().total;

  const archivedUsers = db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE role != 'admin'
        AND status = 'Archived'
    `)
    .get().total;

  const activeCourses = db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM courses
      WHERE is_active = 1
    `)
    .get().total;

  const mandatoryCourses = db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM courses
      WHERE is_active = 1
        AND category = 'mandatory'
    `)
    .get().total;

  const nowDate = new Date();

  const monthStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
  const monthEnd = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 1);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const monthStartIso = monthStart.toISOString();
  const monthEndIso = monthEnd.toISOString();
  const todayStartIso = todayStart.toISOString();
  const todayEndIso = todayEnd.toISOString();

  const completedThisMonthRows = db
    .prepare(`
      SELECT
        ucp.id AS progress_id,
        ucp.user_id,
        ucp.course_id,
        ucp.completed_at,

        u.crew_id,
        u.first_name,
        u.last_name,
        u.full_name,
        u.rank,
        u.department,
        u.vessel,

        c.course_code,
        c.course_name,
        c.category AS base_category,

        CASE
          WHEN c.category = 'mandatory' THEN 'mandatory'
          WHEN EXISTS (
            SELECT 1
            FROM rank_course_matrix rcm
            WHERE rcm.course_id = c.id
              AND rcm.rank_name = u.rank
              AND rcm.assignment_type = 'recommended'
          ) THEN 'recommended'
          ELSE 'other'
        END AS course_category

      FROM user_course_progress ucp
      JOIN users u ON u.id = ucp.user_id
      JOIN courses c ON c.id = ucp.course_id

      WHERE ucp.status = 'completed'
        AND ucp.completed_at >= ?
        AND ucp.completed_at < ?
        AND c.is_active = 1

      ORDER BY ucp.completed_at DESC
    `)
    .all(monthStartIso, monthEndIso);

  const todayCompletions = db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM user_course_progress ucp
      JOIN courses c ON c.id = ucp.course_id
      WHERE ucp.status = 'completed'
        AND ucp.completed_at >= ?
        AND ucp.completed_at < ?
        AND c.is_active = 1
    `)
    .get(todayStartIso, todayEndIso).total;

  const inProgressCount = db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM user_course_progress ucp
      JOIN courses c ON c.id = ucp.course_id
      WHERE ucp.status = 'in_progress'
        AND c.is_active = 1
    `)
    .get().total;

  const crewInProgress = db
    .prepare(`
      SELECT COUNT(DISTINCT ucp.user_id) AS total
      FROM user_course_progress ucp
      JOIN courses c ON c.id = ucp.course_id
      WHERE ucp.status = 'in_progress'
        AND c.is_active = 1
    `)
    .get().total;

  const recentCompletions = db
    .prepare(`
      SELECT
        ucp.id,
        ucp.user_id,
        ucp.course_id,
        ucp.status,
        ucp.progress_percentage,
        ucp.completed_at AS completion_date,

        u.crew_id,
        u.first_name,
        u.last_name,
        u.full_name,
        u.rank,
        u.department,

        c.course_code,
        c.course_name,

        CASE
          WHEN c.category = 'mandatory' THEN 'mandatory'
          WHEN EXISTS (
            SELECT 1
            FROM rank_course_matrix rcm
            WHERE rcm.course_id = c.id
              AND rcm.rank_name = u.rank
              AND rcm.assignment_type = 'recommended'
          ) THEN 'recommended'
          ELSE 'other'
        END AS course_category

      FROM user_course_progress ucp
      JOIN users u ON u.id = ucp.user_id
      JOIN courses c ON c.id = ucp.course_id

      WHERE ucp.status = 'completed'
        AND c.is_active = 1

      ORDER BY ucp.completed_at DESC
      LIMIT 8
    `)
    .all();

  const inProgressRows = db
    .prepare(`
      SELECT
        ucp.id,
        ucp.user_id,
        ucp.course_id,
        ucp.status,
        ucp.progress_percentage,
        ucp.started_at,
        ucp.last_accessed_at,

        u.crew_id,
        u.first_name,
        u.last_name,
        u.full_name,
        u.rank,
        u.department,

        c.course_code,
        c.course_name,

        CASE
          WHEN c.category = 'mandatory' THEN 'mandatory'
          WHEN EXISTS (
            SELECT 1
            FROM rank_course_matrix rcm
            WHERE rcm.course_id = c.id
              AND rcm.rank_name = u.rank
              AND rcm.assignment_type = 'recommended'
          ) THEN 'recommended'
          ELSE 'other'
        END AS course_category

      FROM user_course_progress ucp
      JOIN users u ON u.id = ucp.user_id
      JOIN courses c ON c.id = ucp.course_id

      WHERE ucp.status = 'in_progress'
        AND c.is_active = 1

      ORDER BY ucp.last_accessed_at DESC
      LIMIT 8
    `)
    .all();

  const mandatoryCompletionsThisMonth = completedThisMonthRows.filter(
    (row) => row.course_category === "mandatory"
  ).length;

  const recommendedCompletionsThisMonth = completedThisMonthRows.filter(
    (row) => row.course_category === "recommended"
  ).length;

  const otherCompletionsThisMonth = completedThisMonthRows.filter(
    (row) => row.course_category === "other"
  ).length;

  const crewTrainedThisMonth = new Set(
    completedThisMonthRows.map((row) => row.user_id)
  ).size;

  return {
    totalUsers,
    activeUsers,
    archivedUsers,
    activeCourses,
    mandatoryCourses,

    completedThisMonth: completedThisMonthRows.length,
    crewTrainedThisMonth,
    todayCompletions,

    inProgressCount,
    crewInProgress,

    mandatoryCompletionsThisMonth,
    recommendedCompletionsThisMonth,
    otherCompletionsThisMonth,

    recentCompletions,
    inProgressRows,
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
      .prepare(`
        SELECT COUNT(*) AS total
        FROM courses
        WHERE category = 'mandatory'
          AND is_active = 1
      `)
      .get().total;

    const mandatoryCompleted = db
      .prepare(`
        SELECT COUNT(*) AS total
        FROM user_course_progress ucp
        JOIN courses c ON c.id = ucp.course_id
        WHERE ucp.user_id = ?
          AND ucp.status = 'completed'
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
        FROM user_course_progress ucp
        JOIN courses c ON c.id = ucp.course_id
        JOIN rank_course_matrix rcm
          ON rcm.course_id = c.id
          AND rcm.rank_name = ?
          AND rcm.assignment_type = 'recommended'
        WHERE ucp.user_id = ?
          AND ucp.status = 'completed'
          AND c.category != 'mandatory'
          AND c.is_active = 1
      `)
      .get(user.rank || "", user.id).total;

    const totalCbts = db
      .prepare(`
        SELECT COUNT(*) AS total
        FROM user_course_progress ucp
        JOIN courses c ON c.id = ucp.course_id
        WHERE ucp.user_id = ?
          AND ucp.status = 'completed'
          AND c.is_active = 1
      `)
      .get(user.id).total;

    const inProgressCbts = db
      .prepare(`
        SELECT COUNT(*) AS total
        FROM user_course_progress ucp
        JOIN courses c ON c.id = ucp.course_id
        WHERE ucp.user_id = ?
          AND ucp.status = 'in_progress'
          AND c.is_active = 1
      `)
      .get(user.id).total;

    return {
      ...user,
      mandatory_completed: mandatoryCompleted,
      mandatory_total: mandatoryTotal,
      recommended_completed: recommendedCompleted,
      recommended_total: recommendedTotal,
      total_cbts: totalCbts,
      in_progress_cbts: inProgressCbts,
    };
  });
}

export function getMonthlyReportStats(month) {
  const monthPrefix = month || new Date().toISOString().slice(0, 7);

  const monthStart = new Date(`${monthPrefix}-01T00:00:00.000Z`);
  const monthEnd = new Date(monthStart);
  monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);

  const monthStartIso = monthStart.toISOString();
  const monthEndIso = monthEnd.toISOString();

  const completionRows = db
    .prepare(`
      SELECT
        ucp.id AS progress_id,
        ucp.user_id,
        ucp.course_id,
        ucp.status,
        ucp.progress_percentage,
        ucp.selected_language,
        ucp.started_at,
        ucp.completed_at,
        ucp.last_accessed_at,

        u.crew_id,
        u.first_name,
        u.last_name,
        u.full_name,
        u.rank,
        u.department,
        u.vessel,
        u.nationality,

        c.course_code,
        c.course_name,
        c.short_name,
        c.category AS base_category,

        CASE
          WHEN c.category = 'mandatory' THEN 'mandatory'
          WHEN EXISTS (
            SELECT 1
            FROM rank_course_matrix rcm
            WHERE rcm.course_id = c.id
              AND rcm.rank_name = u.rank
              AND rcm.assignment_type = 'recommended'
          ) THEN 'recommended'
          ELSE 'other'
        END AS course_category

      FROM user_course_progress ucp
      JOIN users u ON u.id = ucp.user_id
      JOIN courses c ON c.id = ucp.course_id
      WHERE ucp.status = 'completed'
        AND ucp.completed_at >= ?
        AND ucp.completed_at < ?
        AND c.is_active = 1
      ORDER BY ucp.completed_at DESC, u.full_name ASC, c.course_code ASC
    `)
    .all(monthStartIso, monthEndIso);

  const totalCompletions = completionRows.length;

  const crewTrained = new Set(
    completionRows.map((row) => row.user_id)
  ).size;

  const mandatoryCompletions = completionRows.filter(
    (row) => row.course_category === "mandatory"
  ).length;

  const recommendedCompletions = completionRows.filter(
    (row) => row.course_category === "recommended"
  ).length;

  const otherCompletions = completionRows.filter(
    (row) => row.course_category === "other"
  ).length;

  const crewMap = new Map();

  for (const row of completionRows) {
    const existing = crewMap.get(row.user_id);

    if (!existing) {
      crewMap.set(row.user_id, {
        user_id: row.user_id,
        crew_id: row.crew_id,
        full_name: row.full_name,
        first_name: row.first_name,
        last_name: row.last_name,
        rank: row.rank,
        department: row.department,
        vessel: row.vessel,
        completed_count: 1,
        last_completion_date: row.completed_at,
      });
    } else {
      existing.completed_count += 1;

      if (
        row.completed_at &&
        (!existing.last_completion_date ||
          row.completed_at > existing.last_completion_date)
      ) {
        existing.last_completion_date = row.completed_at;
      }
    }
  }

  const crewRows = Array.from(crewMap.values()).sort(
    (a, b) => b.completed_count - a.completed_count
  );

  return {
    month: monthPrefix,
    totalCompletions,
    crewTrained,
    mandatoryCompletions,
    recommendedCompletions,
    otherCompletions,
    completionRows,
    crewRows,
  };
}

function saveRecommendedRanks(courseId, recommendedRanks = []) {
  db.prepare(`
    DELETE FROM rank_course_matrix
    WHERE course_id = ?
  `).run(courseId);

  if (!Array.isArray(recommendedRanks) || recommendedRanks.length === 0) {
    return;
  }

  const insertRank = db.prepare(`
    INSERT INTO rank_course_matrix
    (
      rank_name,
      course_id,
      assignment_type
    )
    VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((ranks) => {
    for (const rank of ranks) {
      const rankName = String(rank || "").trim();

      if (!rankName) continue;

      insertRank.run(rankName, courseId, "recommended");
    }
  });

  insertMany(recommendedRanks);
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

  const category = data.category === "mandatory" ? "mandatory" : "other";
  const recommendedRanks =
    category === "other" && Array.isArray(data.recommendedRanks)
      ? data.recommendedRanks
      : [];

  const existingCourse = db
    .prepare(`SELECT * FROM courses WHERE course_code = ?`)
    .get(courseCode);

  if (existingCourse) {
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

    saveRecommendedRanks(existingCourse.id, recommendedRanks);

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
    category,
    data.destinationPath,
    JSON.stringify(data.languages || ["EN"]),
    Number(data.totalChapters || 0),
    Number(data.totalPages || 0),
    1,
    now(),
    now()
  );

  const courseId = Number(result.lastInsertRowid);

  saveRecommendedRanks(courseId, recommendedRanks);

  return {
    success: true,
    message: "Course imported successfully.",
    courseId,
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

  db.prepare(`
    DELETE FROM rank_course_matrix
    WHERE course_id = ?
  `).run(id);

  return {
    success: true,
    message: "Course removed successfully. Completion history remains saved.",
  };
}

export function getUserCourses(data = {}) {
  const userId = Number(data.userId || 0);
  const userRank = String(data.rank || "").trim();

  const courses = db
    .prepare(`
      SELECT
        c.*,

        CASE
          WHEN c.category = 'mandatory' THEN 'mandatory'
          WHEN EXISTS (
            SELECT 1
            FROM rank_course_matrix rcm
            WHERE rcm.course_id = c.id
              AND rcm.rank_name = ?
              AND rcm.assignment_type = 'recommended'
          ) THEN 'recommended'
          ELSE 'other'
        END AS user_category,

        COALESCE(ucp.status, 'not_started') AS progress_status,
        COALESCE(ucp.progress_percentage, 0) AS progress_percentage,
        ucp.current_chapter,
        ucp.current_page,
        ucp.started_at,
        ucp.completed_at,
        ucp.last_accessed_at

      FROM courses c

      LEFT JOIN user_course_progress ucp
        ON ucp.course_id = c.id
        AND ucp.user_id = ?

      WHERE c.is_active = 1

      ORDER BY
        CASE
          WHEN c.category = 'mandatory' THEN 1
          WHEN EXISTS (
            SELECT 1
            FROM rank_course_matrix rcm2
            WHERE rcm2.course_id = c.id
              AND rcm2.rank_name = ?
              AND rcm2.assignment_type = 'recommended'
          ) THEN 2
          ELSE 3
        END,
        c.course_code ASC
    `)
    .all(userRank, userId, userRank);

  return courses;
}

export function getUserCourseProgress(data = {}) {
  const userId = Number(data.userId || 0);
  const courseId = Number(data.courseId || 0);

  if (!userId || !courseId) {
    return null;
  }

  return db
    .prepare(`
      SELECT *
      FROM user_course_progress
      WHERE user_id = ?
        AND course_id = ?
    `)
    .get(userId, courseId);
}

export function saveUserCourseProgress(data = {}) {
  const userId = Number(data.userId || 0);
  const courseId = Number(data.courseId || 0);

  if (!userId || !courseId) {
    return {
      success: false,
      message: "User ID and Course ID are required.",
    };
  }

  const status = data.status || "in_progress";
  const progressPercentage = Number(data.progressPercentage || 0);

  const currentChapter = String(data.currentChapter || "");
  const currentPage = String(data.currentPage || "");
  const selectedLanguage = String(data.selectedLanguage || "EN");

  const existing = db
    .prepare(`
      SELECT id
      FROM user_course_progress
      WHERE user_id = ?
        AND course_id = ?
    `)
    .get(userId, courseId);

  if (existing) {
    db.prepare(`
      UPDATE user_course_progress
      SET
        status = ?,
        progress_percentage = ?,
        current_chapter = ?,
        current_page = ?,
        selected_language = ?,
        last_accessed_at = ?,
        completed_at = CASE
          WHEN ? = 'completed' THEN ?
          ELSE completed_at
        END
      WHERE user_id = ?
        AND course_id = ?
    `).run(
      status,
      progressPercentage,
      currentChapter,
      currentPage,
      selectedLanguage,
      now(),
      status,
      status === "completed" ? now() : null,
      userId,
      courseId
    );
  } else {
    db.prepare(`
      INSERT INTO user_course_progress
      (
        user_id,
        course_id,
        status,
        progress_percentage,
        current_chapter,
        current_page,
        selected_language,
        started_at,
        completed_at,
        last_accessed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      courseId,
      status,
      progressPercentage,
      currentChapter,
      currentPage,
      selectedLanguage,
      now(),
      status === "completed" ? now() : null,
      now()
    );
  }

  return {
    success: true,
    message: "Progress saved successfully.",
  };
}

export function completeUserCourse(data = {}) {
  const userId = Number(data.userId || 0);
  const courseId = Number(data.courseId || 0);
  const selectedLanguage = String(data.selectedLanguage || "EN");

  if (!userId || !courseId) {
    return {
      success: false,
      message: "User ID and Course ID are required.",
    };
  }

  const completionDate = now();

  const tx = db.transaction(() => {
    saveUserCourseProgress({
      userId,
      courseId,
      status: "completed",
      progressPercentage: 100,
      currentChapter: data.currentChapter || "",
      currentPage: data.currentPage || "",
      selectedLanguage,
    });

    const existingCompletion = db
    .prepare(`
      SELECT id
      FROM course_completions
      WHERE user_id = ?
        AND course_id = ?
      ORDER BY completion_date DESC
      LIMIT 1
    `)
    .get(userId, courseId);

    if (existingCompletion) {
      db.prepare(`
        UPDATE course_completions
        SET
          completion_date = ?,
          certificate_generated = ?
        WHERE id = ?
      `).run(completionDate, 0, existingCompletion.id);
    } else {
      db.prepare(`
        INSERT INTO course_completions
        (
          user_id,
          course_id,
          completion_date,
          certificate_generated
        )
        VALUES (?, ?, ?, ?)
      `).run(userId, courseId, completionDate, 0);
    }
  });

  tx();

  return {
    success: true,
    message: "Course completed successfully.",
    completionDate,
  };
}