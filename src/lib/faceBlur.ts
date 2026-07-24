import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import { POSTER_SIZE } from "./posterTemplate";

export type DetectedFace = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  thumbnailUrl: string;
};

export type CustomBlur = {
  id: string;
  x: number;
  y: number;
  range: number;
};

type RenderBlurredBackgroundOptions = {
  imageUrl: string;
  imagePositionX: number;
  imagePositionY: number;
  faces: DetectedFace[];
  selectedFaceIds: string[];
  customBlurs: CustomBlur[];
};

let detectorPromise: Promise<FaceDetector> | undefined;

function getAssetUrl(path: string) {
  return new URL(`${import.meta.env.BASE_URL}${path}`, window.location.href).href;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = url;
  });
}

async function getFaceDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        getAssetUrl("mediapipe/wasm"),
      );

      return FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: getAssetUrl(
            "mediapipe/models/blaze_face_full_range_sparse.tflite",
          ),
          delegate: "CPU",
        },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.5,
        minSuppressionThreshold: 0.3,
      });
    })();
  }

  return detectorPromise;
}

function createFaceThumbnail(
  image: HTMLImageElement,
  box: { x: number; y: number; width: number; height: number },
) {
  const thumbnailSize = 180;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = thumbnailSize;
  canvas.height = thumbnailSize;

  if (!context) {
    return "";
  }

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const cropSize = Math.min(
    Math.max(box.width, box.height) * 1.35,
    image.naturalWidth,
    image.naturalHeight,
  );
  const sourceX = Math.max(
    0,
    Math.min(centerX - cropSize / 2, image.naturalWidth - cropSize),
  );
  const sourceY = Math.max(
    0,
    Math.min(centerY - cropSize / 2, image.naturalHeight - cropSize),
  );

  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropSize,
    cropSize,
    0,
    0,
    thumbnailSize,
    thumbnailSize,
  );

  return canvas.toDataURL("image/jpeg", 0.82);
}

export async function detectFaces(imageUrl: string): Promise<DetectedFace[]> {
  const [detector, image] = await Promise.all([
    getFaceDetector(),
    loadImage(imageUrl),
  ]);
  const result = detector.detect(image);

  return result.detections.flatMap((detection, index) => {
    const box = detection.boundingBox;
    if (!box) return [];

    const boundedBox = {
      x: Math.max(0, box.originX),
      y: Math.max(0, box.originY),
      width: Math.min(box.width, image.naturalWidth - Math.max(0, box.originX)),
      height: Math.min(box.height, image.naturalHeight - Math.max(0, box.originY)),
    };

    return [
      {
        id: `face-${index}`,
        x: boundedBox.x / image.naturalWidth,
        y: boundedBox.y / image.naturalHeight,
        width: boundedBox.width / image.naturalWidth,
        height: boundedBox.height / image.naturalHeight,
        thumbnailUrl: createFaceThumbnail(image, boundedBox),
      },
    ];
  });
}

function drawBlurredEllipse(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  drawX: number,
  drawY: number,
  drawWidth: number,
  drawHeight: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
) {
  context.save();
  context.beginPath();
  context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  context.clip();
  context.filter = "blur(28px)";
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.restore();
}

export async function renderBlurredBackground({
  imageUrl,
  imagePositionX,
  imagePositionY,
  faces,
  selectedFaceIds,
  customBlurs,
}: RenderBlurredBackgroundOptions) {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = POSTER_SIZE.width;
  canvas.height = POSTER_SIZE.height;

  if (!context) {
    throw new Error("Canvas is not available.");
  }

  const scale = Math.max(
    POSTER_SIZE.width / image.naturalWidth,
    POSTER_SIZE.height / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = (POSTER_SIZE.width - drawWidth) * (imagePositionX / 100);
  const drawY = (POSTER_SIZE.height - drawHeight) * (imagePositionY / 100);

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  const selectedIds = new Set(selectedFaceIds);
  faces
    .filter((face) => selectedIds.has(face.id))
    .forEach((face) => {
      const faceX = drawX + face.x * image.naturalWidth * scale;
      const faceY = drawY + face.y * image.naturalHeight * scale;
      const faceWidth = face.width * image.naturalWidth * scale;
      const faceHeight = face.height * image.naturalHeight * scale;

      drawBlurredEllipse(
        context,
        image,
        drawX,
        drawY,
        drawWidth,
        drawHeight,
        faceX + faceWidth / 2,
        faceY + faceHeight / 2,
        faceWidth * 0.68,
        faceHeight * 0.72,
      );
    });

  customBlurs.forEach((blur) => {
    const radius = (POSTER_SIZE.width * blur.range) / 200;
    drawBlurredEllipse(
      context,
      image,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
      (POSTER_SIZE.width * blur.x) / 100,
      (POSTER_SIZE.height * blur.y) / 100,
      radius,
      radius,
    );
  });

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Blurred image could not be created."));
        return;
      }
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}
