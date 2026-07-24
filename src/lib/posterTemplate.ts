export type PosterInput = {
  backgroundImageUrl: string;
  topTitle: string;
  topSubtitle: string;
  mainTitleLine1: string;
  mainTitleLine2: string;
  subtitle: string;
  iconUrl?: string;
  logoHidden: boolean;
  overlayOpacity: number;
  gradientOpacity: number;
  imagePositionX: number;
  imagePositionY: number;
  imageZoom: number;
  topTextSize: number;
  topTextY: number;
  mainTitleSize: number;
  mainTitleY: number;
  subtitleSize: number;
  subtitleY: number;
  subtitleAlignment: "left" | "center" | "right";
};

export type PageType = "title" | "sub";

export const POSTER_SIZE = {
  width: 1080,
  height: 1350,
};

export const POSTER_TOKENS = {
  safeLeft: 92,
  mainTitleTop: 888,
  subtitleTop: 1157,
  topTextLeft: 307,
  topTextTop: 220,
  topTextWidth: 464,
  iconLeft: 508,
  iconTop: 85,
  iconWidth: 64,
  iconHeight: 92,
  bottomGradientHeight: 650,
};

export const DEFAULT_POSTER_INPUT: PosterInput = {
  backgroundImageUrl: "",
  topTitle: "SIG NAME",
  topSubtitle: "SESSION NAME",
  mainTitleLine1: "제목내용 1",
  mainTitleLine2: "제목 내용2.",
  subtitle: "세션 행사에 대한 소개",
  logoHidden: false,
  overlayOpacity: 0.2,
  gradientOpacity: 0.75,
  imagePositionX: 50,
  imagePositionY: 50,
  imageZoom: 100,
  topTextSize: 41,
  topTextY: POSTER_TOKENS.topTextTop,
  mainTitleSize: 112,
  mainTitleY: POSTER_TOKENS.mainTitleTop,
  subtitleSize: 45,
  subtitleY: POSTER_TOKENS.subtitleTop,
  subtitleAlignment: "left",
};
