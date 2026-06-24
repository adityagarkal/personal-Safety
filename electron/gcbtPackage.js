import fs from "fs";
import path from "path";
import crypto from "crypto";
import zlib from "zlib";
import { XMLParser } from "fast-xml-parser";

const PACKAGE_FORMAT = "GCBT_PACKAGE";
const PACKAGE_VERSION = 1;

// Keep this value private inside the application/package script.
// This is practical offline protection, not full DRM.
const PACKAGE_SECRET = "gemini-cbt-secure-course-package-v1-2026";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true,
});

const packageCache = new Map();

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeInternalPath(value) {
  return String(value || "")
    .replace(/^[\\/]+/, "")
    .replace(/\\/g, "/");
}

function shouldSkipEntry(entryName, isDirectory = false) {
  const lowerName = String(entryName || "").toLowerCase();

  if (!lowerName) return true;

  if (isDirectory) {
    return ["temp", "tmp", "__macosx"].includes(lowerName);
  }

  if (["thumbs.db", ".ds_store"].includes(lowerName)) return true;

  // Some CBT exports contain version/helper files like ver.__ which are not needed by our player.
  if (lowerName === "ver.__" || lowerName.startsWith("ver.")) return true;

  return false;
}

function readXmlFile(filePath) {
  return parser.parse(fs.readFileSync(filePath, "utf-8"));
}

function findCbtXml(startDir) {
  const entries = fs.readdirSync(startDir, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldSkipEntry(entry.name, entry.isDirectory())) continue;

    const fullPath = path.join(startDir, entry.name);

    if (entry.isFile() && entry.name.toLowerCase() === "cbt.xml") {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const result = findCbtXml(fullPath);
      if (result) return result;
    }
  }

  return null;
}

function detectLanguages(courseRootPath) {
  const languages = new Set();

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (shouldSkipEntry(entry.name, entry.isDirectory())) continue;

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
          if (level) languages.add(String(level).trim().toUpperCase());
        }
      } catch {
        // Ignore non-page XML files.
      }
    }
  }

  walk(courseRootPath);

  if (languages.size === 0) languages.add("EN");

  return Array.from(languages).sort();
}

function countXmlPages(courseRootPath) {
  let count = 0;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (shouldSkipEntry(entry.name, entry.isDirectory())) continue;

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

function extractCourseMetadata(cbtXmlPath, courseRootPath) {
  const parsed = readXmlFile(cbtXmlPath);
  const module = parsed?.module;

  if (!module) {
    throw new Error("Invalid cbt.xml: module tag not found.");
  }

  const courseCode = String(module["@_OBLnr"] || "").padStart(3, "0");
  const courseName = String(module["@_name"] || "Untitled Course").trim();
  const shortName = String(module["@_shortName"] || "").trim();
  const chapters = normalizeArray(module?.chapters?.chap);

  if (!courseCode || !courseName) {
    throw new Error("Course code or course name not found in cbt.xml.");
  }

  return {
    courseCode,
    courseName,
    shortName,
    totalChapters: chapters.length,
    totalPages: countXmlPages(courseRootPath),
    languages: detectLanguages(courseRootPath),
    rootFolderName: path.basename(courseRootPath),
  };
}

function collectFiles(courseRootPath) {
  const files = {};

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (shouldSkipEntry(entry.name, entry.isDirectory())) continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;

      const relativePath = normalizeInternalPath(path.relative(courseRootPath, fullPath));
      files[relativePath] = fs.readFileSync(fullPath).toString("base64");
    }
  }

  walk(courseRootPath);

  return files;
}

function deriveKey(salt) {
  return crypto.scryptSync(PACKAGE_SECRET, salt, 32);
}

function encryptPayload(payloadBuffer) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(salt);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(payloadBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    format: PACKAGE_FORMAT,
    version: PACKAGE_VERSION,
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    payload: encrypted.toString("base64"),
  };
}

function decryptPayload(packageEnvelope) {
  if (packageEnvelope?.format !== PACKAGE_FORMAT) {
    throw new Error("Invalid GCBT package format.");
  }

  if (Number(packageEnvelope.version) !== PACKAGE_VERSION) {
    throw new Error("Unsupported GCBT package version.");
  }

  const salt = Buffer.from(packageEnvelope.salt, "base64");
  const iv = Buffer.from(packageEnvelope.iv, "base64");
  const tag = Buffer.from(packageEnvelope.tag, "base64");
  const encrypted = Buffer.from(packageEnvelope.payload, "base64");
  const key = deriveKey(salt);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export function createGcbtPackageFromFolder(sourceFolderPath, outputFilePath) {
  const sourcePath = path.resolve(sourceFolderPath);

  if (!fs.existsSync(sourcePath)) {
    throw new Error("Source folder not found.");
  }

  const cbtXmlPath = findCbtXml(sourcePath);

  if (!cbtXmlPath) {
    throw new Error("Invalid CBT folder. cbt.xml not found.");
  }

  const courseRootPath = path.dirname(cbtXmlPath);
  const metadata = extractCourseMetadata(cbtXmlPath, courseRootPath);
  const files = collectFiles(courseRootPath);

  if (!files["cbt.xml"]) {
    throw new Error("Package creation failed. cbt.xml was not included.");
  }

  const packageData = {
    format: PACKAGE_FORMAT,
    version: PACKAGE_VERSION,
    createdAt: new Date().toISOString(),
    metadata,
    files,
  };

  const compressed = zlib.gzipSync(Buffer.from(JSON.stringify(packageData), "utf-8"));
  const envelope = encryptPayload(compressed);

  const resolvedOutputPath = path.resolve(outputFilePath);
  fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
  fs.writeFileSync(resolvedOutputPath, JSON.stringify(envelope));

  return {
    success: true,
    packagePath: resolvedOutputPath,
    metadata,
    fileCount: Object.keys(files).length,
  };
}

export function loadGcbtPackage(packagePath) {
  const resolvedPath = path.resolve(packagePath);

  if (packageCache.has(resolvedPath)) {
    return packageCache.get(resolvedPath);
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error("GCBT package file not found.");
  }

  const envelope = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
  const decrypted = decryptPayload(envelope);
  const decompressed = zlib.gunzipSync(decrypted);
  const packageData = JSON.parse(decompressed.toString("utf-8"));

  if (packageData?.format !== PACKAGE_FORMAT) {
    throw new Error("Invalid GCBT package data.");
  }

  packageCache.set(resolvedPath, packageData);

  return packageData;
}

export function clearGcbtPackageCache(packagePath = "") {
  if (!packagePath) {
    packageCache.clear();
    return;
  }

  packageCache.delete(path.resolve(packagePath));
}

export function readGcbtMetadata(packagePath) {
  const packageData = loadGcbtPackage(packagePath);
  return packageData.metadata;
}

export function readGcbtTextFile(packagePath, internalPath) {
  const packageData = loadGcbtPackage(packagePath);
  const fileKey = normalizeInternalPath(internalPath);
  const base64 = packageData.files?.[fileKey];

  if (!base64) {
    throw new Error(`File not found inside GCBT package: ${fileKey}`);
  }

  return Buffer.from(base64, "base64").toString("utf-8");
}

export function readGcbtBinaryFile(packagePath, internalPath) {
  const packageData = loadGcbtPackage(packagePath);
  const fileKey = normalizeInternalPath(internalPath);
  const base64 = packageData.files?.[fileKey];

  if (!base64) {
    throw new Error(`Asset not found inside GCBT package: ${fileKey}`);
  }

  return Buffer.from(base64, "base64");
}

export function getGcbtFileList(packagePath) {
  const packageData = loadGcbtPackage(packagePath);
  return Object.keys(packageData.files || {});
}
