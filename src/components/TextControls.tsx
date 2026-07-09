import { DEFAULT_POSTER_INPUT, type PosterInput } from "../lib/posterTemplate";

type TextControlsProps = {
  input: PosterInput;
  onChange: <K extends keyof PosterInput>(key: K, value: PosterInput[K]) => void;
};

export function TextControls({ input, onChange }: TextControlsProps) {
  function resetTopText() {
    onChange("topTextSize", DEFAULT_POSTER_INPUT.topTextSize);
    onChange("topTextY", DEFAULT_POSTER_INPUT.topTextY);
  }

  function resetMainTitle() {
    onChange("mainTitleSize", DEFAULT_POSTER_INPUT.mainTitleSize);
    onChange("mainTitleY", DEFAULT_POSTER_INPUT.mainTitleY);
  }

  function resetSubtitle() {
    onChange("subtitleSize", DEFAULT_POSTER_INPUT.subtitleSize);
    onChange("subtitleY", DEFAULT_POSTER_INPUT.subtitleY);
  }

  return (
    <section className="controlGroup">
      <h2>Text</h2>
      <label>
        Top title
        <input
          value={input.topTitle}
          onChange={(event) => onChange("topTitle", event.target.value)}
        />
      </label>
      <label>
        Top subtitle
        <input
          value={input.topSubtitle}
          onChange={(event) => onChange("topSubtitle", event.target.value)}
        />
      </label>
      <div className="sliderSet">
        <div className="controlRow">
          <h3>Top text layout</h3>
          <button className="secondaryButton" type="button" onClick={resetTopText}>
            Default
          </button>
        </div>
        <label>
          <span className="sliderLabel">
            Text size <strong>{input.topTextSize}</strong>
          </span>
          <input
            type="range"
            min="24"
            max="72"
            value={input.topTextSize}
            onChange={(event) => onChange("topTextSize", Number(event.target.value))}
          />
        </label>
        <label>
          <span className="sliderLabel">
            Vertical position <strong>{input.topTextY}</strong>
          </span>
          <input
            type="range"
            min="80"
            max="420"
            value={input.topTextY}
            onChange={(event) => onChange("topTextY", Number(event.target.value))}
          />
        </label>
      </div>
      <label>
        Main title line 1
        <input
          value={input.mainTitleLine1}
          onChange={(event) => onChange("mainTitleLine1", event.target.value)}
        />
      </label>
      <label>
        Main title line 2
        <input
          value={input.mainTitleLine2}
          onChange={(event) => onChange("mainTitleLine2", event.target.value)}
        />
      </label>
      <div className="sliderSet">
        <div className="controlRow">
          <h3>Main title layout</h3>
          <button className="secondaryButton" type="button" onClick={resetMainTitle}>
            Default
          </button>
        </div>
        <label>
          <span className="sliderLabel">
            Text size <strong>{input.mainTitleSize}</strong>
          </span>
          <input
            type="range"
            min="64"
            max="150"
            value={input.mainTitleSize}
            onChange={(event) => onChange("mainTitleSize", Number(event.target.value))}
          />
        </label>
        <label>
          <span className="sliderLabel">
            Vertical position <strong>{input.mainTitleY}</strong>
          </span>
          <input
            type="range"
            min="640"
            max="1040"
            value={input.mainTitleY}
            onChange={(event) => onChange("mainTitleY", Number(event.target.value))}
          />
        </label>
      </div>
      <label>
        Subtitle
        <textarea
          rows={3}
          value={input.subtitle}
          onChange={(event) => onChange("subtitle", event.target.value)}
        />
      </label>
      <div className="sliderSet">
        <div className="controlRow">
          <h3>Subtitle layout</h3>
          <button className="secondaryButton" type="button" onClick={resetSubtitle}>
            Default
          </button>
        </div>
        <label>
          <span className="sliderLabel">
            Text size <strong>{input.subtitleSize}</strong>
          </span>
          <input
            type="range"
            min="24"
            max="72"
            value={input.subtitleSize}
            onChange={(event) => onChange("subtitleSize", Number(event.target.value))}
          />
        </label>
        <label>
          <span className="sliderLabel">
            Vertical position <strong>{input.subtitleY}</strong>
          </span>
          <input
            type="range"
            min="980"
            max="1260"
            value={input.subtitleY}
            onChange={(event) => onChange("subtitleY", Number(event.target.value))}
          />
        </label>
      </div>
    </section>
  );
}
