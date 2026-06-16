import fs from "fs";
import path from "path";
import { app, dialog } from "electron";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true,
});

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function ensureCoursesDirectory() {
  const coursesDir = path.join(app.getPath("userData"), "courses");

  if (!fs.existsSync(coursesDir)) {
    fs.mkdirSync(coursesDir, { recursive: true });
  }

  return coursesDir;
}

function findCbtXml(startDir) {
  const entries = fs.readdirSync(startDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(startDir, entry.name);

    if (entry.isFile() && entry.name.toLowerCase() === "cbt.xml") {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const result = findCbtXml(fullPath);

      if (result) {
        return result;
      }
    }
  }

  return null;
}

function readXmlFile(filePath) {
  const xmlText = fs.readFileSync(filePath, "utf-8");
  return parser.parse(xmlText);
}

function extractCourseMetadata(cbtXmlPath) {
  const parsed = readXmlFile(cbtXmlPath);
  const module = parsed?.module;

  if (!module) {
    throw new Error("Invalid cbt.xml: module tag not found.");
  }

  const courseCode = String(module["@_OBLnr"] || "").padStart(3, "0");
  const courseName = String(module["@_name"] || "Untitled Course").trim();
  const shortName = String(module["@_shortName"] || "").trim();

  if (!courseCode || !courseName) {
    throw new Error("Course code or course name not found in cbt.xml.");
  }

  const chapters = normalizeArray(module?.chapters?.chap);

  return {
    courseCode,
    courseName,
    shortName,
    totalChapters: chapters.length,
    chapters,
  };
}

function detectLanguages(courseRootPath) {
  const languages = new Set();

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (!entry.name.toLowerCase().endsWith(".xml")) continue;

      try {
        const parsed = readXmlFile(fullPath);
        const pages = normalizeArray(parsed?.pages?.page);

        for (const page of pages) {
          const level = page?.["@_level"];

          if (level) {
            languages.add(String(level).trim());
          }
        }
      } catch {
        // Ignore invalid/non-page XML files.
      }
    }
  }

  walk(courseRootPath);

  if (languages.size === 0) {
    languages.add("EN");
  }

  return Array.from(languages).sort();
}

function countXmlPages(courseRootPath) {
  let count = 0;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".xml") &&
        entry.name.toLowerCase() !== "cbt.xml"
      ) {
        count += 1;
      }
    }
  }

  walk(courseRootPath);

  return count;
}

function safeFolderName(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-");
}

export async function selectCourseFolder() {
  const result = await dialog.showOpenDialog({
    title: "Select Extracted CBT Course Folder",
    properties: ["openDirectory"],
  });

  if (result.canceled || !result.filePaths?.length) {
    return {
      success: false,
      message: "Folder selection cancelled.",
      data: null,
    };
  }

  const selectedPath = result.filePaths[0];
  const cbtXmlPath = findCbtXml(selectedPath);

  if (!cbtXmlPath) {
    return {
      success: false,
      message: "Invalid CBT folder. cbt.xml not found.",
      data: null,
    };
  }

  const courseRootPath = path.dirname(cbtXmlPath);
  const metadata = extractCourseMetadata(cbtXmlPath);
  const languages = detectLanguages(courseRootPath);
  const totalPages = countXmlPages(courseRootPath);

  return {
    success: true,
    message: "Course folder validated successfully.",
    data: {
      sourcePath: courseRootPath,
      cbtXmlPath,
      courseCode: metadata.courseCode,
      courseName: metadata.courseName,
      shortName: metadata.shortName,
      totalChapters: metadata.totalChapters,
      totalPages,
      languages,
    },
  };
}

function isSafeCoursePath(coursePath) {
  if (!coursePath) return false;

  const coursesDir = path.resolve(app.getPath("userData"), "courses");
  const targetPath = path.resolve(coursePath);

  return targetPath.startsWith(coursesDir + path.sep);
}

function copyCourseFolder(sourceRootPath, metadata, existingCoursePath = "") {
  const coursesDir = ensureCoursesDirectory();

  const folderName = `${metadata.courseCode}-${safeFolderName(
    metadata.shortName || metadata.courseName
  )}`;

  const destinationPath = path.join(coursesDir, folderName);

  const resolvedSourcePath = path.resolve(sourceRootPath);
  const resolvedDestinationPath = path.resolve(destinationPath);

  if (resolvedSourcePath === resolvedDestinationPath) {
    throw new Error(
      "Selected folder is already inside the application course storage. Please select the original extracted CBT folder."
    );
  }

  // If old course path exists in DB, remove old physical folder first
  if (
    existingCoursePath &&
    fs.existsSync(existingCoursePath) &&
    isSafeCoursePath(existingCoursePath)
  ) {
    fs.rmSync(existingCoursePath, {
      recursive: true,
      force: true,
    });
  }

  // If same destination folder already exists, remove it and replace
  if (fs.existsSync(destinationPath)) {
    if (!isSafeCoursePath(destinationPath)) {
      throw new Error("Unsafe course destination path detected.");
    }

    fs.rmSync(destinationPath, {
      recursive: true,
      force: true,
    });
  }

  fs.cpSync(sourceRootPath, destinationPath, {
    recursive: true,
    force: true,
  });

  return destinationPath;
}

export function importValidatedCourse(courseData, existingCoursePath = "") {
  if (!courseData?.sourcePath) {
    return {
      success: false,
      message: "Course source path is required.",
      data: null,
    };
  }

  const destinationPath = copyCourseFolder(
    courseData.sourcePath,
    courseData,
    existingCoursePath
  );

  return {
    success: true,
    message: "Course copied successfully.",
    data: {
      ...courseData,
      destinationPath,
    },
  };
}