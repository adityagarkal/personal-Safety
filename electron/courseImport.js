import fs from "fs";
import path from "path";
import { app, dialog } from "electron";
import { readGcbtMetadata, clearGcbtPackageCache } from "./gcbtPackage.js";

function ensureCoursePackagesDirectory() {
  const packagesDir = path.join(app.getPath("userData"), "course-packages");

  if (!fs.existsSync(packagesDir)) {
    fs.mkdirSync(packagesDir, { recursive: true });
  }

  return packagesDir;
}

function safeFolderName(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isSafeCourseStoragePath(coursePath) {
  if (!coursePath) return false;

  const targetPath = path.resolve(coursePath);
  const userDataPath = path.resolve(app.getPath("userData"));
  const coursesDir = path.join(userDataPath, "courses");
  const packagesDir = path.join(userDataPath, "course-packages");

  return (
    targetPath.startsWith(coursesDir + path.sep) ||
    targetPath.startsWith(packagesDir + path.sep)
  );
}

function removeExistingCourseStorage(existingCoursePath = "") {
  if (!existingCoursePath) return;
  if (!fs.existsSync(existingCoursePath)) return;

  if (!isSafeCourseStoragePath(existingCoursePath)) {
    throw new Error("Unsafe existing course path detected.");
  }

  const stat = fs.statSync(existingCoursePath);

  if (stat.isDirectory()) {
    fs.rmSync(existingCoursePath, { recursive: true, force: true });
    return;
  }

  fs.rmSync(existingCoursePath, { force: true });
}

export async function selectCoursePackage() {
  const result = await dialog.showOpenDialog({
    title: "Select Encrypted GCBT Course Package",
    properties: ["openFile"],
    filters: [
      { name: "Gemini CBT Package", extensions: ["gcbt"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (result.canceled || !result.filePaths?.length) {
    return {
      success: false,
      message: "Package selection cancelled.",
      data: null,
    };
  }

  const selectedPath = result.filePaths[0];

  if (path.extname(selectedPath).toLowerCase() !== ".gcbt") {
    return {
      success: false,
      message: "Invalid file selected. Please select a .gcbt course package.",
      data: null,
    };
  }

  try {
    const metadata = readGcbtMetadata(selectedPath);

    return {
      success: true,
      message: "GCBT package validated successfully.",
      data: {
        sourcePath: selectedPath,
        packagePath: selectedPath,
        packageType: "gcbt",
        courseCode: metadata.courseCode,
        courseName: metadata.courseName,
        shortName: metadata.shortName,
        totalChapters: metadata.totalChapters,
        totalPages: metadata.totalPages,
        languages: metadata.languages || ["EN"],
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Invalid or unreadable GCBT package.",
      data: null,
    };
  }
}

// Backward-compatible name used by the existing renderer service.
export async function selectCourseFolder() {
  return selectCoursePackage();
}

function copyCoursePackage(sourcePackagePath, metadata, existingCoursePath = "") {
  const packagesDir = ensureCoursePackagesDirectory();

  const fileName = `${metadata.courseCode}-${safeFolderName(
    metadata.shortName || metadata.courseName
  )}.gcbt`;

  const destinationPath = path.join(packagesDir, fileName);
  const resolvedSourcePath = path.resolve(sourcePackagePath);
  const resolvedDestinationPath = path.resolve(destinationPath);

  if (resolvedSourcePath === resolvedDestinationPath) {
    throw new Error(
      "Selected package is already inside the application course storage. Please select the original .gcbt file."
    );
  }

  removeExistingCourseStorage(existingCoursePath);

  if (fs.existsSync(destinationPath)) {
    removeExistingCourseStorage(destinationPath);
  }

  fs.copyFileSync(sourcePackagePath, destinationPath);
  clearGcbtPackageCache(destinationPath);

  return destinationPath;
}

export function importValidatedCourse(courseData, existingCoursePath = "") {
  if (!courseData?.sourcePath) {
    return {
      success: false,
      message: "Course package path is required.",
      data: null,
    };
  }

  if (path.extname(courseData.sourcePath).toLowerCase() !== ".gcbt") {
    return {
      success: false,
      message: "Only encrypted .gcbt course packages are supported.",
      data: null,
    };
  }

  const destinationPath = copyCoursePackage(
    courseData.sourcePath,
    courseData,
    existingCoursePath
  );

  return {
    success: true,
    message: "Course package copied successfully.",
    data: {
      ...courseData,
      destinationPath,
    },
  };
}
