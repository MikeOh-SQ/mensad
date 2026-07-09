import { useEffect, useRef, useState } from "react";
import { DownloadButton } from "./DownloadButton";
import { ImageUploader } from "./ImageUploader";
import { PosterCanvas } from "./PosterCanvas";
import { TextControls } from "./TextControls";
import { exportPoster } from "../lib/exportImage";
import { DEFAULT_POSTER_INPUT, POSTER_SIZE, type PosterInput } from "../lib/posterTemplate";

export function PosterEditor() {
  const [input, setInput] = useState<PosterInput>(DEFAULT_POSTER_INPUT);
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.4);
  const previewStageRef = useRef<HTMLElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (input.backgroundImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(input.backgroundImageUrl);
      }
      if (input.iconUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(input.iconUrl);
      }
    };
  }, [input.backgroundImageUrl, input.iconUrl]);

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

        <ImageUploader
          imagePositionX={input.imagePositionX}
          imagePositionY={input.imagePositionY}
          onImageChange={updateBackground}
          onLogoChange={updateLogo}
          onLogoClear={clearLogo}
          onPositionChange={(axis, value) =>
            updateInput(axis === "x" ? "imagePositionX" : "imagePositionY", value)
          }
        />

        <TextControls input={input} onChange={updateInput} />

        <section className="controlGroup">
          <div className="controlRow">
            <h2>Style</h2>
            <button className="secondaryButton" type="button" onClick={resetStyle}>
              Default
            </button>
          </div>
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
        </section>

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
          <PosterCanvas input={input} exportRef={posterRef} scale={previewScale} />
        </div>
      </section>
    </main>
  );
}
