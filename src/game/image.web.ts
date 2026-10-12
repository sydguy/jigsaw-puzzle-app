import { Image } from "react-native";
import type { HomePuzzle } from "../home/review";
import { checkDimensions, inspectRaster } from "../images/limits";
/** Snapshot the approved image/crop once. Saves contain local pixels, never expiring asset URLs. */
export async function snapshotImage(puzzle: HomePuzzle): Promise<string> {
  const source = puzzle.mobileCrop && puzzle.mobileImage ? puzzle.mobileImage : puzzle.image;
  const uri = typeof source === "string" ? source : typeof source === "number" ? Image.resolveAssetSource(source).uri : !Array.isArray(source) ? source.uri : source[0]?.uri;
  if (!uri) throw new Error("The puzzle picture is unavailable.");
  const url = new URL(uri, window.location.href);
  if (url.protocol !== "data:" && url.origin !== window.location.origin) throw new Error("Only local puzzle pictures are supported.");
  if (url.protocol === "data:") {
    if (uri.length > 6_000_000 || !/^data:image\/(jpeg|png);base64,/.test(uri)) throw new Error("Unsupported puzzle picture.");
    const binary = atob(uri.slice(uri.indexOf(",") + 1, uri.indexOf(",") + 1 + 131072));
    inspectRaster(Uint8Array.from(binary, c => c.charCodeAt(0)));
  }
  const img = new window.Image();
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error("Could not load this puzzle picture.")); img.src = uri; });
  checkDimensions(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Image rendering is unavailable.");
  const crop = puzzle.mobileCrop;
  if (crop && puzzle.mobileImage) ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, 1024, 1024);
  else ctx.drawImage(img, 0, 0, 1024, 1024);
  return canvas.toDataURL("image/jpeg", .92);
}
