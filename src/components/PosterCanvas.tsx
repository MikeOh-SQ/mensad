import mensaLogo from "../../Mensa.svg";
import { POSTER_TOKENS, type PageType, type PosterInput } from "../lib/posterTemplate";
import type { CSSProperties, Ref } from "react";

type PosterCanvasProps = {
  input: PosterInput;
  pageType: PageType;
  backgroundImageUrl: string;
  backgroundIsRendered: boolean;
  exportRef?: Ref<HTMLDivElement>;
  scale?: number;
};

export function PosterCanvas({
  input,
  pageType,
  backgroundImageUrl,
  backgroundIsRendered,
  exportRef,
  scale = 1,
}: PosterCanvasProps) {
  const isTitlePage = pageType === "title";

  return (
    <div
      className="poster"
      ref={exportRef}
      style={
        {
          "--overlay-opacity": isTitlePage ? input.overlayOpacity : 0,
          "--gradient-opacity": isTitlePage ? input.gradientOpacity : 0,
          "--image-position-x": `${input.imagePositionX}%`,
          "--image-position-y": `${input.imagePositionY}%`,
          "--image-zoom": input.imageZoom / 100,
          transform: `scale(${scale})`,
        } as CSSProperties
      }
    >
      {backgroundImageUrl ? (
        <img
          className={`background${backgroundIsRendered ? " backgroundRendered" : ""}`}
          src={backgroundImageUrl}
          alt=""
        />
      ) : (
        <div className="backgroundPlaceholder" aria-hidden="true" />
      )}
      <div className="darkOverlay" />
      <div className="bottomGradient" />
      {isTitlePage && !input.logoHidden && (
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
      {isTitlePage && (
        <>
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
        </>
      )}
      <div
        className="subtitle"
        style={{
          top: input.subtitleY,
          fontSize: input.subtitleSize,
          textAlign: isTitlePage ? "left" : input.subtitleAlignment,
        }}
      >
        {input.subtitle}
      </div>
    </div>
  );
}
