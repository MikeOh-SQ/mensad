import type { CustomBlur, DetectedFace } from "../lib/faceBlur";

type FaceBlurControlsProps = {
  hasImage: boolean;
  faces: DetectedFace[];
  selectedFaceIds: string[];
  detectionStatus: "idle" | "loading" | "ready" | "error";
  customBlurs: CustomBlur[];
  onFaceToggle: (faceId: string) => void;
  onCustomBlurAdd: () => void;
  onCustomBlurChange: (
    blurId: string,
    key: "range" | "x" | "y",
    value: number,
  ) => void;
  onCustomBlurDelete: (blurId: string) => void;
};

export function FaceBlurControls({
  hasImage,
  faces,
  selectedFaceIds,
  detectionStatus,
  customBlurs,
  onFaceToggle,
  onCustomBlurAdd,
  onCustomBlurChange,
  onCustomBlurDelete,
}: FaceBlurControlsProps) {
  return (
    <section className="controlGroup">
      <h2>Face Blur</h2>

      {!hasImage && <p className="controlMessage">Upload a background image to detect faces.</p>}
      {detectionStatus === "loading" && (
        <p className="controlMessage">Detecting faces...</p>
      )}
      {detectionStatus === "error" && (
        <p className="controlMessage controlMessageError">
          Face detection failed. Custom blur is still available.
        </p>
      )}
      {detectionStatus === "ready" && faces.length === 0 && (
        <p className="controlMessage">No faces detected.</p>
      )}

      {faces.length > 0 && (
        <div className="faceGrid" aria-label="Detected faces">
          {faces.map((face, index) => (
            <button
              className="faceButton"
              type="button"
              key={face.id}
              aria-label={`Face ${index + 1}`}
              aria-pressed={selectedFaceIds.includes(face.id)}
              onClick={() => onFaceToggle(face.id)}
            >
              <img src={face.thumbnailUrl} alt="" />
              <span>{index + 1}</span>
            </button>
          ))}
        </div>
      )}

      <button
        className="secondaryButton customBlurAddButton"
        type="button"
        disabled={!hasImage}
        onClick={onCustomBlurAdd}
      >
        Add Custom Blur
      </button>

      {customBlurs.map((blur, index) => (
        <div className="sliderSet customBlurSet" key={blur.id}>
          <div className="controlRow">
            <h3>Custom Blur {index + 1}</h3>
            <button
              className="deleteButton"
              type="button"
              onClick={() => onCustomBlurDelete(blur.id)}
            >
              Delete
            </button>
          </div>
          <label>
            <span className="sliderLabel">
              Range <strong>{blur.range}%</strong>
            </span>
            <input
              type="range"
              min="5"
              max="80"
              value={blur.range}
              onChange={(event) =>
                onCustomBlurChange(blur.id, "range", Number(event.target.value))
              }
            />
          </label>
          <label>
            <span className="sliderLabel">
              X <strong>{blur.x}%</strong>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={blur.x}
              onChange={(event) =>
                onCustomBlurChange(blur.id, "x", Number(event.target.value))
              }
            />
          </label>
          <label>
            <span className="sliderLabel">
              Y <strong>{blur.y}%</strong>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={blur.y}
              onChange={(event) =>
                onCustomBlurChange(blur.id, "y", Number(event.target.value))
              }
            />
          </label>
        </div>
      ))}
    </section>
  );
}
