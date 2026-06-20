import { useEffect, useRef } from "react";
import { FileText, Volume2 } from "lucide-react";

function AssessmentSlide({ assessment, selectedAnswer, onSelectAnswer }) {
  const question = assessment?.question || "";
  const options = assessment?.options || [];

  if (!assessment?.isValid) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-[#F59E0B]/30 bg-[#FFFBEB] p-8 text-center">
        <h3 className="text-xl font-bold text-[#163B6D]">
          Skipping unsupported assessment question
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-700">
          This question format is not MCQ-based, so it will be skipped
          automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 rounded-2xl border border-[#DDE3EA] bg-[#F5F7FA] p-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#2554C7]">
          Assessment Question
        </p>

        <h3 className="text-xl font-bold leading-8 text-[#163B6D]">
          {question || "Question text not found."}
        </h3>
      </div>

      {options.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#DDE3EA] bg-white p-8 text-center text-gray-600">
          No answer options found for this question.
        </div>
      ) : (
        <div className="space-y-4">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectAnswer?.(option.id)}
                className={`flex w-full items-start gap-4 rounded-xl border p-5 text-left transition ${
                  isSelected
                    ? "border-[#2554C7] bg-blue-50 shadow-sm"
                    : "border-[#DDE3EA] bg-white hover:border-[#2554C7] hover:bg-[#F5F7FA]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                    isSelected
                      ? "border-[#2554C7] bg-[#2554C7] text-white"
                      : "border-[#DDE3EA] bg-white text-gray-600"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>

                <span className="flex-1 text-base leading-7 text-gray-800">
                  {option.label}
                </span>

                <span
                  className={`mt-1 h-5 w-5 shrink-0 rounded-full border ${
                    isSelected
                      ? "border-[#2554C7] bg-[#2554C7]"
                      : "border-gray-300 bg-white"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-5 rounded-xl bg-[#FFFBEB] px-4 py-3 text-sm text-gray-700">
        Select one answer, then click <b>Next</b> to continue.
      </p>
    </div>
  );
}

function CoursePageRenderer({
  pageContent,
  pageLoading,
  pageError,
  selectedPage,
  selectedAssessmentAnswer,
  onSelectAssessmentAnswer,
}) {
  const audioRefs = useRef([]);
  const autoPlayTimerRef = useRef(null);

const audioSignature = (pageContent?.audios || [])
  .map((audio) => audio.dataUrl)
  .join("|");

useEffect(() => {
  let cancelled = false;
  const timeoutIds = [];

  function wait(ms) {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(resolve, ms);
      timeoutIds.push(timeoutId);
    });
  }

  function resetAudio(audio) {
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.onended = null;
    audio.onerror = null;
  }

  function playAudio(audio, index) {
    return new Promise((resolve) => {
      if (!audio || cancelled) {
        resolve();
        return;
      }

      audio.currentTime = 0;

      audio.onended = () => {
        audio.onended = null;
        audio.onerror = null;
        resolve();
      };

      audio.onerror = () => {
        audio.onended = null;
        audio.onerror = null;
        resolve();
      };

      const playPromise = audio.play();

      if (playPromise?.catch) {
        playPromise.catch((error) => {
          console.warn(`Audio ${index + 1} autoplay failed:`, error);

          audio.onended = null;
          audio.onerror = null;
          resolve();
        });
      }
    });
  }

  async function playAudioSequence() {
    const audioElements = audioRefs.current.filter(Boolean);

    audioElements.forEach(resetAudio);

    if (!pageContent?.audios?.length || audioElements.length === 0) {
      return;
    }

    // Wait 1 second after page opens
    await wait(500);

    for (let index = 0; index < audioElements.length; index += 1) {
      if (cancelled) return;

      await playAudio(audioElements[index], index);

      if (cancelled) return;

      // Wait 0.5 second before next audio
      if (index < audioElements.length - 1) {
        await wait(400);
      }
    }
  }

  playAudioSequence();

  return () => {
    cancelled = true;

    timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));

    audioRefs.current.forEach(resetAudio);
  };
}, [selectedPage?.id, audioSignature]);

  if (pageLoading) {
    return (
      <div className="rounded-2xl border border-[#DDE3EA] bg-[#F5F7FA] p-14 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-[#2554C7]" />
        <h4 className="text-xl font-bold text-[#163B6D]">
          Loading page content...
        </h4>
        <p className="mt-2 text-sm text-gray-600">Preparing CBT screen.</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
        <h4 className="text-lg font-bold">Unable to load page</h4>
        <p className="mt-2 text-sm">{pageError}</p>
      </div>
    );
  }

  if (!pageContent) {
    return (
      <div className="rounded-2xl border border-dashed border-[#DDE3EA] bg-[#F5F7FA] p-14 text-center">
        <FileText className="mx-auto mb-4 h-14 w-14 text-[#2554C7]" />
        <h4 className="text-xl font-bold text-[#163B6D]">
          No page content loaded
        </h4>
        <p className="mt-2 text-sm text-gray-600">
          Select a page to render CBT content.
        </p>
      </div>
    );
  }

  const supportedImages =
    pageContent.images?.filter((image) => !image.unsupported) || [];

  const audios = pageContent.audios || [];
  const textBlocks = pageContent.textBlocks || [];

  return (
    <div className="rounded-2xl border border-[#DDE3EA] bg-[#F5F7FA] p-5">
      <div className="flex h-[520px] flex-col overflow-hidden rounded-xl border border-[#DDE3EA] bg-white shadow-sm">
        <div className="shrink-0 border-b border-[#DDE3EA] px-8 py-5">
          <h3 className="text-2xl font-bold text-[#163B6D]">
            {pageContent.title || selectedPage?.displayLabel}
          </h3>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6"
          style={
            pageContent.background?.dataUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.78), rgba(255,255,255,0.78)), url(${pageContent.background.dataUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }
              : undefined
          }
        >
          {pageContent.isAssessment ? (
            <AssessmentSlide
              assessment={pageContent.assessment}
              selectedAnswer={selectedAssessmentAnswer}
              onSelectAnswer={onSelectAssessmentAnswer}
            />
          ) : textBlocks.length === 0 && supportedImages.length === 0 ? (
            <EmptyContent />
          ) : (
            <div
              className={`grid gap-8 ${
                supportedImages.length > 0
                  ? "grid-cols-[minmax(0,1fr)_360px]"
                  : "grid-cols-1"
              }`}
            >
              <div className="min-w-0 space-y-4">
                {textBlocks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#DDE3EA] bg-[#F5F7FA] p-6 text-center text-sm text-gray-600">
                    No visible text found on this page.
                  </div>
                ) : (
                  textBlocks.map((block, index) => (
                    <TextBlock key={block.id} block={block} index={index} />
                  ))
                )}
              </div>

              {supportedImages.length > 0 && (
                <div className="space-y-4">
                  {supportedImages.map((image, index) => (
                    <ImageBlock key={image.id} image={image} index={index} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {audios.length > 0 && (
        <div className="mt-4 rounded-xl border border-[#DDE3EA] bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-[#163B6D]">
            <Volume2 className="h-5 w-5" />
            <p className="font-bold">Audio</p>
          </div>

          <div className="space-y-3">
            {audios.map((audio, index) => (
              <audio
                key={audio.id}
                ref={(element) => {
                  audioRefs.current[index] = element;
                }}
                src={audio.dataUrl}
                controls
                preload="auto"
                className="w-full"
              />
            ))}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

function TextBlock({ block, index }) {
  const cleanedText = String(block.text || "").trim();

  if (!cleanedText) return null;

  return (
    <div
      className={`leading-7 text-gray-800 ${
        block.isBullet
          ? "relative pl-6 before:absolute before:left-0 before:top-3 before:h-2 before:w-2 before:rounded-full before:bg-[#2554C7]"
          : ""
      }`}
      style={{
        animation: "fadeInUp 0.35s ease both",
        animationDelay: `${1 + index * 0.35}s`,
        fontSize: block.size === "1" ? "15px" : "17px",
        whiteSpace: "pre-line",
        wordBreak: "break-word",
      }}
    >
      {cleanedText}
    </div>
  );
}

function ImageBlock({ image, index }) {
  return (
    <div className="rounded-xl border border-[#DDE3EA] bg-white/40 p-3"
      style={{
        animation: "fadeInUp 0.35s ease both",
        animationDelay: `${1 + index * 0.35}s`,
      }}
    >
      <img
        src={image.dataUrl}
        alt=""
        className="mx-auto max-h-[300px] max-w-full rounded-lg object-contain"
        draggable={false}
      />
    </div>
  );
}

function EmptyContent() {
  return (
    <div className="rounded-xl border border-dashed border-[#DDE3EA] bg-[#F5F7FA] p-8 text-center">
      <FileText className="mx-auto mb-3 h-10 w-10 text-[#2554C7]" />

      <p className="font-semibold text-[#163B6D]">
        No visible text or image found on this page
      </p>

      <p className="mt-1 text-sm text-gray-600">
        This page may contain Flash animation, audio, or assessment content.
      </p>
    </div>
  );
}

export default CoursePageRenderer;