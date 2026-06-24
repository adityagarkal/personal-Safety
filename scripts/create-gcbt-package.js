import path from "path";
import { fileURLToPath } from "url";
import { createGcbtPackageFromFolder } from "../electron/gcbtPackage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFolder = process.argv[2];
const outputFile = process.argv[3];

if (!sourceFolder) {
  console.error("Usage: npm run gcbt:pack -- <source-cbt-folder> [output-file.gcbt]");
  process.exit(1);
}

try {
  const fallbackOutput = path.join(
    __dirname,
    "..",
    "gcbt-output",
    `${path.basename(path.resolve(sourceFolder))}.gcbt`
  );

  const result = createGcbtPackageFromFolder(
    sourceFolder,
    outputFile || fallbackOutput
  );

  console.log("GCBT package created successfully.");
  console.log(`Output: ${result.packagePath}`);
  console.log(`Course: ${result.metadata.courseCode} - ${result.metadata.courseName}`);
  console.log(`Languages: ${result.metadata.languages.join(", ")}`);
  console.log(`Chapters: ${result.metadata.totalChapters}`);
  console.log(`XML Pages: ${result.metadata.totalPages}`);
  console.log(`Files packed: ${result.fileCount}`);
} catch (error) {
  console.error("GCBT package creation failed:", error.message);
  process.exit(1);
}
