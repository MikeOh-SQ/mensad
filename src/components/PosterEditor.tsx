import { useEffect, useRef, useState } from "react";
import { DownloadButton } from "./DownloadButton";
import { FaceBlurControls } from "./FaceBlurControls";
import { ImageUploader } from "./ImageUploader";
import { PosterCanvas } from "./PosterCanvas";
import { TextControls } from "./TextControls";
import { exportPoster } from "../lib/exportImage";
import {
  detectFaces,
  renderBlurredBackground,
  type CustomBlur,
  type DetectedFace,
} from "../lib/faceBlur";
import {
  DEFAULT_POSTER_INPUT,
  POSTER_SIZE,
  type PageType,
  type PosterInput,
} from "../lib/posterTemplate";

export function PosterEditor() {
  const [input, setInput] = useState<PosterInput>(DEFAULT_POSTER_INPUT);
  const [pageType, setPageType] = useState<PageType>("title");
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [selectedFaceIds, setSelectedFaceIds] = useState<string[]>([]);
  const [customBlurs, setCustomBlurs] = useState<CustomBlur[]>([]);
  const [detectionStatus, setDetectionStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [renderedBackgroundUrl, setRenderedBackgroundUrl] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.4);
  const previewStageRef = useRef<HTMLElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const renderedBackgroundRef = useRef("");

  function replaceRenderedBackground(url: string) {
    if (renderedBackgroundRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(renderedBackgroundRef.current);
    }
    renderedBackgroundRef.current = url;
    setRenderedBackgroundUrl(url);
  }

  useEffect(() => {
    return () => {
      if (input.backgroundImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(input.backgroundImageUrl);
      }
    };
  }, [input.backgroundImageUrl]);

  useEffect(() => {
    return () => {
      if (input.iconUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(input.iconUrl);
      }
    };
  }, [input.iconUrl]);

  useEffect(() => {
    return () => {
      if (renderedBackgroundRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(renderedBackgroundRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!input.backgroundImageUrl) {
      setDetectionStatus("idle");
      setFaces([]);
      return;
    }

    let cancelled = false;
    setDetectionStatus("loading");

    detectFaces(input.backgroundImageUrl)
      .then((nextFaces) => {
        if (cancelled) return;
        setFaces(nextFaces);
        setDetectionStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setFaces([]);
        setDetectionStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [input.backgroundImageUrl]);

  useEffect(() => {
    const hasBlur = selectedFaceIds.length > 0 || customBlurs.length > 0;

    if (!input.backgroundImageUrl || !hasBlur) {
      replaceRenderedBackground("");
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      renderBlurredBackground({
        imageUrl: input.backgroundImageUrl,
        imagePositionX: input.imagePositionX,
        imagePositionY: input.imagePositionY,
        faces,
        selectedFaceIds,
        customBlurs,
      })
        .then((url) => {
          if (cancelled) {
            URL.revokeObjectURL(url);
            return;
          }
          replaceRenderedBackground(url);
        })
        .catch((error) => {
          if (!cancelled) {
            console.error(error);
          }
        });
    }, 80);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    customBlurs,
    faces,
    input.backgroundImageUrl,
    input.imagePositionX,
    input.imagePositionY,
    selectedFaceIds,
  ]);

  useEffect(() => {
    const previewStage = previewStageRef.current;
    if (!previewStage) return;

    const updatePreviewScale = () => {
      const { width, height } = previewStage.getBoundingClientRect();
      const availableWidth = Math.max(width, 0);
      const availableHeight = Math.max(height - 64, 0);
      const nextScale = Math.min(
        availableWidth / POSTER_SIZE.width,
        availableHeight / POSTER_SIZE.height,
      );

      setPreviewScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 0.4);
    };

    updatePreviewScale();

    const resizeObserver = new ResizeObserver(updatePreviewScale);
    resizeObserver.observe(previewStage);
    window.addEventListener("resize", updatePreviewScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePreviewScale);
    };
  }, []);

  function updateInput<K extends keyof PosterInput>(key: K, value: PosterInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function updateBackground(url: string) {
    setFaces([]);
    setSelectedFaceIds([]);
    setCustomBlurs([]);
    setDetectionStatus(url ? "loading" : "idle");
    replaceRenderedBackground("");

    setInput((current) => {
      if (current.backgroundImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(current.backgroundImageUrl);
      }
      return { ...current, backgroundImageUrl: url };
    });
  }

  function updateLogo(url: string) {
    setInput((current) => {
      if (current.iconUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(current.iconUrl);
      }
      return { ...current, iconUrl: url, logoHidden: false };
    });
  }

  function clearLogo() {
    setInput((current) => {
      if (current.iconUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(current.iconUrl);
      }
      return { ...current, iconUrl: undefined, logoHidden: true };
    });
  }

  function resetStyle() {
    setInput((current) => ({
      ...current,
      overlayOpacity: DEFAULT_POSTER_INPUT.overlayOpacity,
      gradientOpacity: DEFAULT_POSTER_INPUT.gradientOpacity,
    }));
  }

  function toggleFaceBlur(faceId: string) {
    setSelectedFaceIds((current) =>
      current.includes(faceId)
        ? current.filter((currentId) => currentId !== faceId)
        : [...current, faceId],
    );
  }

  function addCustomBlur() {
    const id =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `custom-${Date.now()}-${customBlurs.length}`;

    setCustomBlurs((current) => [
      ...current,
      {
        id,
        x: 50,
        y: 50,
        range: 20,
      },
    ]);
  }

  function updateCustomBlur(
    blurId: string,
    key: "range" | "x" | "y",
    value: number,
  ) {
    setCustomBlurs((current) =>
      current.map((blur) => (blur.id === blurId ? { ...blur, [key]: value } : blur)),
    );
  }

  function deleteCustomBlur(blurId: string) {
    setCustomBlurs((current) => current.filter((blur) => blur.id !== blurId));
  }

  async function handleDownload() {
    if (!posterRef.current) return;

    setIsExporting(true);
    try {
      await exportPoster(posterRef.current);
    } catch (error) {
      console.error(error);
      window.alert("PNG 다운로드를 만들지 못했습니다. 이미지를 다시 업로드한 뒤 시도해 주세요.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="appShell">
      <aside className="editorPanel">
        <div className="panelHeader">
          <h1>Instagram Poster</h1>
          <p>1080 x 1350 template</p>
        </div>

        <div className="pageTypeControl" role="group" aria-label="Page type">
          <button
            className="pageTypeButton"
            type="button"
            aria-pressed={pageType === "title"}
            onClick={() => setPageType("title")}
          >
            Title Page
          </button>
          <button
            className="pageTypeButton"
            type="button"
            aria-pressed={pageType === "sub"}
            onClick={() => setPageType("sub")}
          >
            Sub Page
          </button>
        </div>

        <ImageUploader
          imagePositionX={input.imagePositionX}
          imagePositionY={input.imagePositionY}
          showLogoControls={pageType === "title"}
          onImageChange={updateBackground}
          onLogoChange={updateLogo}
          onLogoClear={clearLogo}
          onPositionChange={(axis, value) =>
            updateInput(axis === "x" ? "imagePositionX" : "imagePositionY", value)
          }
        />

        <FaceBlurControls
          hasImage={Boolean(input.backgroundImageUrl)}
          faces={faces}
          selectedFaceIds={selectedFaceIds}
          detectionStatus={detectionStatus}
          customBlurs={customBlurs}
          onFaceToggle={toggleFaceBlur}
          onCustomBlurAdd={addCustomBlur}
          onCustomBlurChange={updateCustomBlur}
          onCustomBlurDelete={deleteCustomBlur}
        />

        <TextControls input={input} pageType={pageType} onChange={updateInput} />

        {pageType === "title" && (
          <details className="controlGroup collapsibleGroup">
            <summary className="collapsibleSummary">
              <span className="collapsibleTitle collapsibleTitleSection">Style</span>
              <button
                className="secondaryButton"
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  resetStyle();
                }}
              >
                Default
              </button>
            </summary>
            <label>
              <span className="sliderLabel">
                Overlay <strong>{input.overlayOpacity.toFixed(2)}</strong>
              </span>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.01"
                value={input.overlayOpacity}
                onChange={(event) => updateInput("overlayOpacity", Number(event.target.value))}
              />
            </label>
            <label>
              <span className="sliderLabel">
                Bottom gradient <strong>{input.gradientOpacity.toFixed(2)}</strong>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={input.gradientOpacity}
                onChange={(event) => updateInput("gradientOpacity", Number(event.target.value))}
              />
            </label>
          </details>
        )}

        <DownloadButton isExporting={isExporting} onDownload={handleDownload} />
      </aside>

      <section className="previewStage" ref={previewStageRef} aria-label="Poster preview">
        <div
          className="previewScaler"
          style={{
            width: POSTER_SIZE.width * previewScale,
            height: POSTER_SIZE.height * previewScale,
          }}
        >
          <PosterCanvas
            input={input}
            pageType={pageType}
            backgroundImageUrl={renderedBackgroundUrl || input.backgroundImageUrl}
            backgroundIsRendered={Boolean(renderedBackgroundUrl)}
            exportRef={posterRef}
            scale={previewScale}
          />
        </div>
      </section>
    </main>
  );
}
