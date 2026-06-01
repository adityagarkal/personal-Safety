import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export async function loadXML(xmlPath) {
  try {
    const response = await fetch(xmlPath);

    if (!response.ok) {
      throw new Error(`Failed to load XML: ${xmlPath}`);
    }

    const xmlText = await response.text();

    return parser.parse(xmlText);
  } catch (error) {
    console.error("XML Loading Error:", error);
    throw error;
  }
}