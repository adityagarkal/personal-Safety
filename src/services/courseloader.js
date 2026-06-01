import { loadXML } from "./xmlParser";

export async function loadCourse() {
  const data = await loadXML(
    "/content/001-Personal_Safety_2009/p_safety/cbt.xml"
  );

  const module = data.module;

  return {
    name: module["@_name"],
    shortName: module["@_shortName"],

    objectives: module.objectives?.obj || [],

    chapters: module.chapters?.chap || [],

    levels: module.levels?.level || [],
  };
}