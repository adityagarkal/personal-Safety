import { loadXML } from "./xmlParser";

export const COURSE_BASE_PATH =
  "/content/001-Personal_Safety_2009/p_safety";

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function loadCourse() {
  const data = await loadXML(`${COURSE_BASE_PATH}/cbt.xml`);

  const module = data.module;

  return {
    name: module["@_name"] || "Untitled Course",
    shortName: module["@_shortName"] || "",

    objectives: normalizeArray(module.objectives?.obj),

    chapters: normalizeArray(module.chapters?.chap),

    levels: normalizeArray(module.levels?.level),
  };
}

export async function loadCoursePage(chapterId, pageNumber) {
  const actualChapterId = chapterId || "5";

  return loadXML(
    `${COURSE_BASE_PATH}/${actualChapterId}/${pageNumber}.xml`
  );
}

export function getEnglishPage(pageData) {
  const pages = normalizeArray(pageData?.pages?.page);

  return (
    pages.find((page) => page["@_level"] === "EN") ||
    pages[0] ||
    null
  );
}

export function getPageTexts(englishPage) {
  return normalizeArray(englishPage?.texts?.txt);
}

export function getPagePics(englishPage) {
  return normalizeArray(englishPage?.pics?.pic);
}

export function getPageSounds(englishPage) {
  return normalizeArray(englishPage?.sounds?.snd).filter(
    (sound) =>
      sound &&
      typeof sound === "string" &&
      sound.trim() !== ""
  );
}

export function isQuizPage(pageNumber) {
  return String(pageNumber).startsWith("q");
}

export function isAssessmentChapter(chapterId) {
  return String(chapterId) === "5";
}