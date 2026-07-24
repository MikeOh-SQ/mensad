type ImageUploaderProps = {
  imagePositionX: number;
  imagePositionY: number;
  showLogoControls: boolean;
  onImageChange: (url: string) => void;
  onLogoChange: (url: string) => void;
  onLogoClear: () => void;
  onPositionChange: (axis: "x" | "y", value: number) => void;
};

export function ImageUploader({
  imagePositionX,
  imagePositionY,
  showLogoControls,
  onImageChange,
  onLogoChange,
  onLogoClear,
  onPositionChange,
}: ImageUploaderProps) {
  return (
    <section className="controlGroup">
      <h2>Background</h2>
      <label className="fileInput">
        <span>Upload JPG, PNG, or WebP</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            onImageChange(URL.createObjectURL(file));
          }}
        />
      </label>
      {showLogoControls && (
        <>
          <label className="fileInput">
            <span>Logo update - SVG or PNG (업로드 없을시 멘사 로고 적용)</span>
            <input
              type="file"
              accept="image/svg+xml,image/png"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                onLogoChange(URL.createObjectURL(file));
              }}
            />
          </label>
          <button className="secondaryButton" type="button" onClick={onLogoClear}>
            Clear logo
          </button>
        </>
      )}
      <label>
        <span className="sliderLabel">
          Horizontal crop <strong>{imagePositionX}</strong>
        </span>
        <input type="range" min="0" max="100" value={imagePositionX} onChange={(event) => onPositionChange("x", Number(event.target.value))} />
      </label>
      <label>
        <span className="sliderLabel">
          Vertical crop <strong>{imagePositionY}</strong>
        </span>
        <input type="range" min="0" max="100" value={imagePositionY} onChange={(event) => onPositionChange("y", Number(event.target.value))} />
      </label>
    </section>
  );
}
