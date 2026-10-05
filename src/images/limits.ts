// Initial browser safety bounds, to be reviewed against real-device evidence in M4.
export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_PIXELS = 24_000_000;
export const MAX_SIDE = 8192;
export function checkDimensions(width: number, height: number) {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > MAX_SIDE ||
    height > MAX_SIDE ||
    width * height > MAX_PIXELS
  )
    throw new Error(
      "Choose an image up to 24 megapixels and 8,192 pixels per side.",
    );
}
/** Bound common raster dimensions before allocating a decoded bitmap. */
export function inspectRaster(bytes: Uint8Array) {
  if (bytes.byteLength > MAX_BYTES)
    throw new Error("Choose a JPG or PNG smaller than 10 MB.");
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (
    bytes.length >= 33 &&
    data.getUint32(0) === 0x89504e47 &&
    data.getUint32(4) === 0x0d0a1a0a &&
    data.getUint32(8) === 13 &&
    data.getUint32(12) === 0x49484452
  ) {
    const width = data.getUint32(16),
      height = data.getUint32(20);
    checkDimensions(width, height);
    return { width, height, mime: "image/png" };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 0xff) break;
      while (bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++]!;
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > bytes.length) break;
      const length = data.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if ([0xc0, 0xc1, 0xc2].includes(marker)) {
        if (length < 8) break;
        const height = data.getUint16(offset + 3),
          width = data.getUint16(offset + 5);
        checkDimensions(width, height);
        return { width, height, mime: "image/jpeg" };
      }
      offset += length;
    }
  }
  throw new Error(
    "This file is not a supported JPG or PNG. Choose another picture.",
  );
}
export function cropRectangle(
  width: number,
  height: number,
  zoom: number,
  x: number,
  y: number,
) {
  checkDimensions(width, height);
  if (![zoom, x, y].every(Number.isFinite))
    throw new Error("Invalid crop position.");
  const cropWidth =
    Math.min(width, height * 1.5) / Math.min(3, Math.max(1, zoom));
  const cropHeight = cropWidth / 1.5;
  return {
    x: ((width - cropWidth) * Math.min(100, Math.max(0, x))) / 100,
    y: ((height - cropHeight) * Math.min(100, Math.max(0, y))) / 100,
    width: cropWidth,
    height: cropHeight,
  };
}
