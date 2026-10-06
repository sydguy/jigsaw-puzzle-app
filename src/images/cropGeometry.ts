import { checkDimensions } from "./limits";

export type Crop = { x: number; y: number; width: number; height: number };
export type Corner = "nw" | "ne" | "sw" | "se";
const ratio = 1.5;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Largest centred 3:2 rectangle: one pair of sides meets the image boundary. */
export function initialCrop(width: number, height: number): Crop {
  checkDimensions(width, height);
  const w = Math.min(width, height * ratio), h = w / ratio;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}

export function validateCrop(crop: Crop, width: number, height: number) {
  checkDimensions(width, height);
  if (![crop.x, crop.y, crop.width, crop.height].every(Number.isFinite) || crop.width <= 0 || crop.height <= 0 ||
    crop.x < -1e-6 || crop.y < -1e-6 || crop.x + crop.width > width + 1e-6 ||
    crop.y + crop.height > height + 1e-6 || Math.abs(crop.width / crop.height - ratio) > 1e-6)
    throw new Error("The crop must stay inside the picture with a 3:2 shape.");
}

export function moveCrop(crop: Crop, dx: number, dy: number, width: number, height: number): Crop {
  validateCrop(crop, width, height);
  if (![dx, dy].every(Number.isFinite)) return crop;
  return { ...crop, x: clamp(crop.x + dx, 0, width - crop.width), y: clamp(crop.y + dy, 0, height - crop.height) };
}

/** Opposite corner stays anchored; pointer movement is projected onto the 3:2 diagonal. */
export function resizeCrop(crop: Crop, corner: Corner, dx: number, dy: number, width: number, height: number): Crop {
  validateCrop(crop, width, height);
  if (![dx, dy].every(Number.isFinite)) return crop;
  const sx = corner.endsWith("e") ? 1 : -1, sy = corner.startsWith("s") ? 1 : -1;
  const ax = sx > 0 ? crop.x : crop.x + crop.width;
  const ay = sy > 0 ? crop.y : crop.y + crop.height;
  const maxWidth = Math.min(sx > 0 ? width - ax : ax, (sy > 0 ? height - ay : ay) * ratio);
  const minWidth = Math.min(48, maxWidth);
  const w = clamp(crop.width + (sx * dx + sy * dy / ratio) / (1 + 1 / ratio ** 2), minWidth, maxWidth);
  const h = w / ratio;
  return { x: sx > 0 ? ax : ax - w, y: sy > 0 ? ay : ay - h, width: w, height: h };
}
