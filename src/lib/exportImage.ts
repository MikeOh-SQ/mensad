import { toBlob } from "html-to-image";
import { POSTER_SIZE } from "./posterTemplate";

export async function exportPoster(node: HTMLElement) {
  await document.fonts.ready;
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      if (!image.complete) {
        await new Promise<void>((resolve, reject) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => reject(new Error("Image loading failed.")), {
            once: true,
          });
        });
      }
      await image.decode().catch(() => undefined);
    }),
  );

  const previousTransform = node.style.transform;
  const previousWidth = node.style.width;
  const previousHeight = node.style.height;

  node.style.transform = "none";
  node.style.width = `${POSTER_SIZE.width}px`;
  node.style.height = `${POSTER_SIZE.height}px`;

  let blob: Blob | null;

  try {
    blob = await toBlob(node, {
      width: POSTER_SIZE.width,
      height: POSTER_SIZE.height,
      pixelRatio: 1,
      cacheBust: false,
      backgroundColor: "#111111",
      style: {
        transform: "none",
        width: `${POSTER_SIZE.width}px`,
        height: `${POSTER_SIZE.height}px`,
      },
    });
  } finally {
    node.style.transform = previousTransform;
    node.style.width = previousWidth;
    node.style.height = previousHeight;
  }

  if (!blob) {
    throw new Error("PNG export failed.");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = "poster.png";
  link.href = url;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
