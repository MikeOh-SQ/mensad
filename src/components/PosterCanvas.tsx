import mensaLogo from "../../Mensa.svg";
import { POSTER_TOKENS, type PosterInput } from "../lib/posterTemplate";
import type { CSSProperties, Ref } from "react";

type PosterCanvasProps = {
  input: PosterInput;
  exportRef?: Ref<HTMLDivElement>;
  scale?: number;
};

export function PosterCanvas({ input, exportRef, scale = 1 }: PosterCanvasProps) {
  return (
    <div
      className="poster"
      ref={exportRef}
      style={
        {
          "--overlay-opacity": input.overlayOpacity,
          "--gradient-opacity": input.gradientOpacity,
          "--image-position-x": `${input.imagePositionX}%`,
          "--image-position-y": `${input.imagePositionY}%`,
          transform: `scale(${scale})`,
        } as CSSProperties
      }
    >
      {input.backgroundImageUrl ? (
        <img className="background" src={input.backgroundImageUrl} alt="" />
      ) : (
        <div className="backgroundPlaceholder" aria-hidden="true" />
      )}
      <div className="darkOverlay" />
      <div className="bottomGradient" />
      {!input.logoHidden && (
        <img
          className="topIcon"
          src={input.iconUrl || mensaLogo}
          alt=""
          style={{
            left: POSTER_TOKENS.iconLeft,
            top: POSTER_TOKENS.iconTop,
            width: POSTER_TOKENS.iconWidth,
            height: POSTER_TOKENS.iconHeight,
          }}
        />
      )}
      <div
        className="topText"
        style={{
          top: input.topTextY,
          fontSize: input.topTextSize,
        }}
      >
        <div className="topMain">{input.topTitle}</div>
        <div className="topSub">{input.topSubtitle}</div>
      </div>
      <div
        className="mainTitle"
        style={{
          top: input.mainTitleY,
          fontSize: input.mainTitleSize,
        }}
      >
        <div className="mainRegular">{input.mainTitleLine1}</div>
        <div className="mainBold">{input.mainTitleLine2}</div>
      </div>
      <div
        className="subtitle"
        style={{
          top: input.subtitleY,
          fontSize: input.subtitleSize,
        }}
      >
        {input.subtitle}
      </div>
    </div>
  );
}
