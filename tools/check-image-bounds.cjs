const assert = require("node:assert/strict");
const {
  cropRectangle,
  inspectRaster,
  checkDimensions,
} = require("../src/images/limits.ts");
for (const [w, h] of [
  [600, 400],
  [400, 600],
  [1, 1],
  [8192, 2],
]) {
  for (const zoom of [1, 1.5, 3])
    for (const x of [0, 50, 100])
      for (const y of [0, 50, 100]) {
        const crop = cropRectangle(w, h, zoom, x, y);
        assert.ok(
          crop.x >= 0 &&
            crop.y >= 0 &&
            crop.x + crop.width <= w + 0.001 &&
            crop.y + crop.height <= h + 0.001,
        );
        assert.ok(Math.abs(crop.width / crop.height - 1.5) < 0.0001);
      }
}
assert.throws(() => inspectRaster(new Uint8Array([1, 2, 3])));
assert.throws(() => inspectRaster(new TextEncoder().encode("<svg/>")));
assert.throws(() => checkDimensions(9000, 10));
assert.throws(() => checkDimensions(6000, 6000));
assert.throws(() => cropRectangle(100, 100, NaN, 50, 50));
const png = new Uint8Array(33),
  view = new DataView(png.buffer);
view.setUint32(0, 0x89504e47);
view.setUint32(4, 0x0d0a1a0a);
view.setUint32(8, 13);
view.setUint32(12, 0x49484452);
view.setUint32(16, 600);
view.setUint32(20, 400);
assert.deepEqual(inspectRaster(png), {
  width: 600,
  height: 400,
  mime: "image/png",
});
view.setUint32(16, 100000);
assert.throws(() => inspectRaster(png));
console.log(
  "PASS: 108 bounded 3:2 crop cases, invalid formats, invalid crop and oversized allocation rejection.",
);
