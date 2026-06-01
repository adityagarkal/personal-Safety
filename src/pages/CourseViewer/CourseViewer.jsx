import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { loadXML } from "../../services/xmlParser";
import { courseStructure } from "../../data/courseStructure";

function CourseViewer() {
  const { chapterId, pageNumber } = useParams();

  const [pageData, setPageData] = useState(null);
  const [error, setError] = useState("");
  const [audioIndex, setAudioIndex] = useState(0);

  useEffect(() => {
  async function loadPage() {
    try {
      setError("");
      setAudioIndex(0);

      // Clear previous page completely
      setPageData(null);

      const data = await loadXML(
        `/content/001-Personal_Safety_2009/p_safety/${chapterId}/${pageNumber}.xml`
      );

      setPageData(data);
    } catch (err) {
      console.error(err);
      setError("Page not found");
    }
  }

  loadPage();
}, [chapterId, pageNumber]);

  if (error) {
    return (
      <div className="p-10">
        <h2 className="text-red-600 text-2xl font-bold">
          {error}
        </h2>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  const englishPage = Array.isArray(pageData.pages.page)
    ? pageData.pages.page.find(
        (page) => page["@_level"] === "EN"
      )
    : pageData.pages.page;

  const texts = Array.isArray(englishPage?.texts?.txt)
    ? englishPage.texts.txt
    : englishPage?.texts?.txt
    ? [englishPage.texts.txt]
    : [];

  const pics = Array.isArray(englishPage?.pics?.pic)
    ? englishPage.pics.pic
    : englishPage?.pics?.pic
    ? [englishPage.pics.pic]
    : [];

  const sounds = (
    Array.isArray(englishPage?.sounds?.snd)
      ? englishPage.sounds.snd
      : englishPage?.sounds?.snd
      ? [englishPage.sounds.snd]
      : []
  ).filter(
    (sound) =>
      sound &&
      typeof sound === "string" &&
      sound.trim() !== ""
  );

  const currentChapter = courseStructure[chapterId] || [];
  const currentIndex = currentChapter.indexOf(pageNumber);

  const previousPage =
    currentIndex > 0
      ? currentChapter[currentIndex - 1]
      : null;

  const nextPage =
    currentIndex < currentChapter.length - 1
      ? currentChapter[currentIndex + 1]
      : null;

  return (
    <div
  key={`${chapterId}-${pageNumber}`}
  className="max-w-5xl mx-auto p-10"
>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">

        {previousPage ? (
          <Link
            to={`/course/${chapterId}/${previousPage}`}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Previous
          </Link>
        ) : (
          <button
            disabled
            className="px-4 py-2 rounded bg-gray-200 opacity-50"
          >
            Previous
          </button>
        )}

        <h2 className="font-bold">
          Chapter {chapterId} - {pageNumber}
        </h2>

        {nextPage ? (
          <Link
            to={`/course/${chapterId}/${nextPage}`}
            className="px-4 py-2 rounded bg-blue-500 text-white"
          >
            Next
          </Link>
        ) : (
          <button
            disabled
            className="px-4 py-2 rounded bg-green-500 text-white"
          >
            Chapter Complete
          </button>
        )}

      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-8">
        {englishPage?.title || "Untitled"}
      </h1>

      {/* Images */}
      {pics.map((pic, index) => {
        const fileName =
          typeof pic === "string"
            ? pic
            : pic?.["#text"];

        if (!fileName || !fileName.endsWith(".swf")) {
          return null;
        }

        const jpgFile = fileName.replace(".swf", ".jpg");

        return (
          <img
            key={index}
            src={`/content/001-Personal_Safety_2009/p_safety/pic/${jpgFile}`}
            alt=""
            className="w-full rounded-lg shadow mb-6"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        );
      })}

      {/* Text Content */}
      <div className="space-y-4 mb-8">
        {texts.map((text, index) => (
          <div
            key={index}
            className="border-l-4 border-blue-500 pl-4"
          >
            {text?.["#text"] || ""}
          </div>
        ))}
      </div>

      {/* Continuous Audio Playback */}
      {sounds.length > 0 && sounds[audioIndex] ? (
        <audio
          key={audioIndex}
          controls
          autoPlay
          className="w-full mt-8"
          onEnded={() => {
            if (audioIndex < sounds.length - 1) {
              setAudioIndex((prev) => prev + 1);
            }
          }}
        >
          <source
            src={`/content/001-Personal_Safety_2009/p_safety/snd/${sounds[audioIndex]}`}
            type="audio/mpeg"
          />
          Your browser does not support audio.
        </audio>
      ) : null}

    </div>
  );
}

export default CourseViewer;