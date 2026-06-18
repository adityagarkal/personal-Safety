import { loadXML } from "./xmlParser";

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getAttributeValue(item, key, fallback = "") {
  return item?.[`@_${key}`] ?? fallback;
}

function toNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function getTextValue(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (value?.["#text"]) {
    return String(value["#text"]).trim();
  }

  return "";
}

function joinCoursePath(basePath, fileName) {
  if (!basePath) return fileName;

  const separator = basePath.includes("\\") ? "\\" : "/";

  if (basePath.endsWith("\\") || basePath.endsWith("/")) {
    return `${basePath}${fileName}`;
  }

  return `${basePath}${separator}${fileName}`;
}

function buildChapterPages(chapter, coursePath) {
  const pages = [];

  const pageCount = chapter.isAssessment
    ? chapter.questionCount
    : chapter.pageCount;

  for (let index = 1; index <= pageCount; index += 1) {
    const fileName = chapter.isAssessment ? `q${index}.xml` : `${index}.xml`;
    const relativePath = `${chapter.number}/${fileName}`;

    pages.push({
      id: `${chapter.id}-${chapter.isAssessment ? "q" : "p"}-${index}`,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      pageNumber: index,
      fileName,
      relativePath,
      filePath: joinCoursePath(coursePath, relativePath),
      coursePath,
      isAssessment: chapter.isAssessment,
      displayLabel: chapter.isAssessment
        ? `Question ${index}`
        : `Page ${index}`,
    });
  }

  return pages;
}

function getPageLanguage(page) {
  const level = page?.["@_level"];

  if (!level) return "EN";

  return String(level).trim().toUpperCase();
}

function pickPageByLanguage(pages, selectedLanguage = "EN") {
  const normalizedPages = normalizeArray(pages);

  if (normalizedPages.length === 0) {
    return null;
  }

  const language = String(selectedLanguage || "EN").trim().toUpperCase();

  const exactMatch = normalizedPages.find(
    (page) => getPageLanguage(page) === language
  );

  if (exactMatch) return exactMatch;

  const englishMatch = normalizedPages.find(
    (page) => getPageLanguage(page) === "EN"
  );

  if (englishMatch) return englishMatch;

  return normalizedPages[0];
}

function isSupportedImage(fileName) {
  return /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(fileName || "");
}

function isSupportedAudio(fileName) {
  return /\.(mp3|wav|ogg)$/i.test(fileName || "");
}

async function readAssetDataUrl(assetPath) {
  if (!assetPath) return "";

  if (!window.electronAPI?.readCourseAsset) {
    return "";
  }

  const response = await window.electronAPI.readCourseAsset(assetPath);

  if (!response?.success) {
    return "";
  }

  return response.dataUrl || "";
}

function buildAssetPath(coursePath, folderName, fileName) {
  return joinCoursePath(joinCoursePath(coursePath, folderName), fileName);
}

function parseTextBlocks(page) {
  const rawTexts = normalizeArray(page?.texts?.txt);

  return rawTexts
    .map((textItem, index) => {
      const text = getTextValue(textItem);

      if (!text) return null;

      return {
        id: `text-${index + 1}`,
        text,
        x: textItem?.["@_x"] || "",
        y: textItem?.["@_y"] || "",
        width: textItem?.["@_w"] || "",
        size: textItem?.["@_s"] || "",
        isBullet: String(textItem?.["@_bull"] || "").toUpperCase() === "X",
      };
    })
    .filter(Boolean);
}

function parseAssessmentQuestion(page) {
  const rawTexts = normalizeArray(page?.texts?.txt).filter((item) =>
    getTextValue(item)
  );

  if (rawTexts.length === 0) {
    return {
      question: "",
      options: [],
    };
  }

  const questionItem =
    rawTexts.find(
      (item) => String(item?.["@_a"] || "").toUpperCase() === "X"
    ) || rawTexts[0];

  const options = rawTexts
    .filter((item) => item !== questionItem)
    .map((item, index) => ({
      id: `option-${index + 1}`,
      label: getTextValue(item),
      correctCode: item?.["@_crct"] || "",
    }))
    .filter((item) => item.label);

  return {
    question: getTextValue(questionItem),
    options,
  };
}

async function parsePictures(page, coursePath) {
  const rawPictures = normalizeArray(page?.pics?.pic);

  const pictures = await Promise.all(
    rawPictures.map(async (picItem, index) => {
      const fileName = getTextValue(picItem);

      if (!fileName) return null;

      const isSwf = /\.swf$/i.test(fileName);

      if (isSwf) {
        return {
          id: `image-${index + 1}`,
          fileName,
          unsupported: true,
          dataUrl: "",
        };
      }

      if (!isSupportedImage(fileName)) return null;

      const assetPath = buildAssetPath(coursePath, "pic", fileName);
      const dataUrl = await readAssetDataUrl(assetPath);

      if (!dataUrl) return null;

      return {
        id: `image-${index + 1}`,
        fileName,
        assetPath,
        dataUrl,
        x: picItem?.["@_x"] || "",
        y: picItem?.["@_y"] || "",
        width: picItem?.["@_w"] || "",
        height: picItem?.["@_h"] || "",
        noFade: String(picItem?.["@_noFade"] || "").toUpperCase() === "X",
        unsupported: false,
      };
    })
  );

  return pictures.filter(Boolean);
}

async function parseSounds(page, coursePath) {
  const rawSounds = normalizeArray(page?.sounds?.snd);

  const sounds = await Promise.all(
    rawSounds.map(async (soundItem, index) => {
      const fileName = getTextValue(soundItem);

      if (!fileName) return null;
      if (!isSupportedAudio(fileName)) return null;

      const assetPath = buildAssetPath(coursePath, "snd", fileName);
      const dataUrl = await readAssetDataUrl(assetPath);

      if (!dataUrl) return null;

      return {
        id: `audio-${index + 1}`,
        fileName,
        assetPath,
        dataUrl,
      };
    })
  );

  return sounds.filter(Boolean);
}

export async function loadCourseManifest(course) {
  if (!course?.course_path) {
    throw new Error("Course path not found.");
  }

  const cbtXmlPath = joinCoursePath(course.course_path, "cbt.xml");
  const parsedXml = await loadXML(cbtXmlPath);

  const module = parsedXml?.module;

  if (!module) {
    throw new Error("Invalid cbt.xml. Module tag not found.");
  }

  const rawChapters = normalizeArray(module?.chapters?.chap);
  const rawObjectives = normalizeArray(module?.objectives?.obj);

  const chapters = rawChapters.map((chapter, index) => {
    const chapterNumber = index + 1;

    const isAssessment =
      String(getAttributeValue(chapter, "ass", "")).toUpperCase() === "X";

    const chapterData = {
      id: String(chapterNumber),
      number: chapterNumber,
      title: getAttributeValue(chapter, "name", `Chapter ${chapterNumber}`),
      pageCount: toNumber(getAttributeValue(chapter, "nrPages", 0)),
      questionCount: toNumber(getAttributeValue(chapter, "nrQuest", 0)),
      selectedQuestionCount: toNumber(
        getAttributeValue(chapter, "nrSelQuest", 0)
      ),
      isAssessment,
      background: getAttributeValue(chapter, "back", ""),
      raw: chapter,
    };

    return {
      ...chapterData,
      pages: buildChapterPages(chapterData, course.course_path),
    };
  });

  const objectives = rawObjectives
    .map((objective) => {
      if (typeof objective === "string") return objective.trim();
      if (objective?.["#text"]) return String(objective["#text"]).trim();
      return "";
    })
    .filter(Boolean);

  return {
    courseCode: String(
      getAttributeValue(module, "OBLnr", course.course_code)
    ).padStart(3, "0"),
    courseName: getAttributeValue(module, "name", course.course_name),
    shortName: getAttributeValue(module, "shortName", course.short_name),
    background: getAttributeValue(module, "back", ""),
    version: getAttributeValue(module, "v", ""),
    chapters,
    objectives,
    credits: module?.credits || "",
    disclaimer: module?.disclaimer || "",
  };
}

export async function loadCoursePageContent(pageFile, selectedLanguage = "EN") {
  if (!pageFile?.filePath) {
    throw new Error("Page file path not found.");
  }

  const parsedXml = await loadXML(pageFile.filePath);

  const selectedPage = pickPageByLanguage(
    parsedXml?.pages?.page,
    selectedLanguage
  );

  if (!selectedPage) {
    throw new Error("No page content found in XML.");
  }

  const title = getTextValue(selectedPage?.title) || pageFile.displayLabel;
  const template = getTextValue(selectedPage?.template);

  const isAssessment = Boolean(pageFile.isAssessment);

  const assessment = isAssessment
    ? parseAssessmentQuestion(selectedPage)
    : null;

  const textBlocks = isAssessment ? [] : parseTextBlocks(selectedPage);
  const images = await parsePictures(selectedPage, pageFile.coursePath);
  const audios = await parseSounds(selectedPage, pageFile.coursePath);

  return {
    title,
    template,
    language: getPageLanguage(selectedPage),
    isAssessment,
    assessment,
    textBlocks,
    images,
    audios,
    raw: selectedPage,
  };
}