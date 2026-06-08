import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true,
});

export async function loadXML(filePath) {
  let xmlText = "";

  if (window.electronAPI?.readCourseFile) {
    xmlText = await window.electronAPI.readCourseFile(filePath);
  } else {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`XML file not found: ${filePath}`);
    }

    xmlText = await response.text();
  }

  return parser.parse(xmlText);
}