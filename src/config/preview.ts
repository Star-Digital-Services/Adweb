import type { CSSProperties } from "react";

// Drop your preview image at: public/preview/cover.jpg
// To swap covers: replace the file, then bump PREVIEW_VERSION below (or hard-refresh).
export const PREVIEW_IMAGE = "/preview/cover.jpg";
export const PREVIEW_IMAGE_FALLBACK = "/preview/cover.svg";

// Bump this number in code when you replace public/preview/cover.jpg (cache bust).
export const PREVIEW_VERSION = "1";

/**
 * Blur strength 0–100.
 * 40 = noticeably soft. 70+ = hard to make out details. 100 = heavily obscured.
 */
export const PREVIEW_BLUR_PERCENT = 15;

/** Converts blur % into real CSS values (blur + zoom + dark overlay). */
export function getPreviewBlurStyles(percent = PREVIEW_BLUR_PERCENT) {
  const clamped = Math.min(100, Math.max(0, percent));
  const blurPx = Math.round((clamped / 100) * 60); // 40% → 24px, 100% → 60px
  const scale = 1 + (clamped / 100) * 0.15; // zoom hides soft edges from blur
  const overlay = (clamped / 100) * 0.45; // extra dimming on top of blur

  return {
    imageStyle: {
      filter: `blur(${blurPx}px)`,
      transform: `scale(${scale})`,
    } as CSSProperties,
    overlayOpacity: overlay,
  };
}

/** Appends a cache-busting query so browsers don't show an old cover. */
export function previewUrl(path: string, version = PREVIEW_VERSION): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}v=${version}`;
}
