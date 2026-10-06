// Real local crop/save workflow in an isolated browser; synthetic input never touches owner data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { chromium } = require('playwright');
const out = '.cache/crop-review';
fs.mkdirSync(out, { recursive: true });
const prior = require.extensions['.ts'];
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { initialCrop, moveCrop, resizeCrop, validateCrop } = require('../src/images/cropGeometry.ts');
require.extensions['.ts'] = prior;
let seed = 29011;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
for (const [w, h] of [[1800, 800], [800, 1200], [900, 600], [1000, 1000], [1, 1], [8192, 1]]) {
  let crop = initialCrop(w, h);
  assert.ok(Math.abs(crop.width - w) < 1e-6 || Math.abs(crop.height - h) < 1e-6);
  assert.ok(Math.abs(crop.x * 2 + crop.width - w) < 1e-6 && Math.abs(crop.y * 2 + crop.height - h) < 1e-6);
  for (let i = 0; i < 2000; i++) {
    const dx = (random() - .5) * w * 4, dy = (random() - .5) * h * 4;
    crop = i % 2 ? moveCrop(crop, dx, dy, w, h) : resizeCrop(crop, ['nw', 'ne', 'sw', 'se'][Math.floor(random() * 4)], dx, dy, w, h);
    validateCrop(crop, w, h);
    assert.ok(Math.abs(crop.width / crop.height - 1.5) < 1e-6);
  }
}
assert.throws(() => validateCrop({ x: 0, y: 0, width: Infinity, height: 2 }, 100, 100));
assert.throws(() => validateCrop({ x: 80, y: 0, width: 60, height: 40 }, 100, 100));
assert.throws(() => validateCrop({ x: 0, y: 0 }, 100, 100));
if (process.argv.includes('--geometry-only')) {
  console.log('PASS: 12,000 crop move/resize invariants and malformed crop rejection.');
  process.exit(0);
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const geometry = () => page.getByTestId('crop-selection').evaluate(n => JSON.parse(n.dataset.crop));
  const stored = () => page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('jigsaw-browser-preview');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => { const db = request.result; const read = db.transaction('pictures').objectStore('pictures').getAll();
      read.onsuccess = () => { resolve(read.result); db.close(); }; read.onerror = () => { reject(read.error); db.close(); }; };
  }));
  try {
    await page.goto('http://localhost:8081/create', { waitUntil: 'networkidle', timeout: 120000 });
    await page.getByRole('button', { name: '96 pieces', exact: true }).click();
    await page.getByRole('radio', { name: 'None', exact: true }).click();
    await page.getByRole('button', { name: 'Add Image', exact: true }).click();
    await page.getByRole('button', { name: 'Choose file', exact: true }).waitFor();
    for (const [layout, name, w, h] of [['0', 'iphone', 800, 1200], ['1', 'android', 1800, 800]]) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
      const png = await page.evaluate(([w, h]) => {
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const ctx = c.getContext('2d'); const data = ctx.createImageData(w, h);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4;
          data.data[i] = Math.round(x / w * 255); data.data[i + 1] = Math.round(y / h * 255); data.data[i + 2] = 70; data.data[i + 3] = 255; }
        ctx.putImageData(data, 0, 0); return c.toDataURL('image/png').split(',')[1];
      }, [w, h]);
      await page.getByLabel('Choose photo file').setInputFiles({ name: `${name}-gradient.png`, mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
      await page.getByRole('dialog', { name: 'Crop your picture' }).waitFor();
      assert.deepEqual(await geometry(), initialCrop(w, h), 'largest centred initial crop');
      await page.getByTestId('crop-drag-hint').waitFor();
      await page.waitForFunction(() => [...document.images].every(img => img.complete));
      await page.getByTestId('device-frame').screenshot({ path: `${out}/${name}-hint.png` });
      await page.getByTestId('crop-editor').dispatchEvent('pointerdown', { pointerType: 'touch', pointerId: 99 });
      assert.equal(await page.getByTestId('crop-drag-hint').count(), 0, 'first touch anywhere dismisses visual hint');
      for (const label of ['Cancel', 'Done']) {
        const button = await page.getByRole('button', { name: label, exact: true }).evaluate(n => ({ height: n.offsetHeight, radius: getComputedStyle(n).borderRadius }));
        assert.ok(button.height >= 48, 'design-system action height');
        assert.equal(button.radius, '12px', 'design-system control radius');
      }
      for (const [corner, dx, dy] of [['top left', 35, 25], ['top right', -35, 25], ['bottom left', 35, -25], ['bottom right', -35, -25]]) {
        await page.getByRole('button', { name: 'Reset crop' }).click();
        assert.equal(await page.getByTestId('crop-drag-hint').count(), 0, 'hint stays dismissed during the current crop');
        const before = await geometry();
        const box = await page.getByRole('button', { name: `Resize crop ${corner}` }).boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 6 }); await page.mouse.up();
        const after = await geometry(); validateCrop(after, w, h);
        assert.ok(after.width < before.width, `corner ${corner} resizes`);
      }
      const selection = await page.getByTestId('crop-selection').boundingBox();
      await page.mouse.move(selection.x + selection.width / 2, selection.y + selection.height / 2); await page.mouse.down();
      await page.mouse.move(selection.x + selection.width / 2 + 24, selection.y + selection.height / 2 + 28, { steps: 6 }); await page.mouse.up();
      await page.getByRole('button', { name: 'Move crop selection' }).focus(); await page.keyboard.press('ArrowRight');
      const selected = await geometry(); validateCrop(selected, w, h);
      await page.getByTestId('device-frame').screenshot({ path: `${out}/${name}-selection.png` });
      await page.getByRole('button', { name: 'Done', exact: true }).click();
      await page.getByTestId('create-selected-picture').waitFor();
      await page.getByRole('img', { name: `${name}-gradient.png`, exact: true }).waitFor();
      assert.ok(await page.getByRole('radio', { name: 'None', exact: true }).isChecked());
      await page.getByLabel('Rows: 8', { exact: true }).waitFor();
      const pictures = await stored(), picture = pictures.find(p => p.title === `${name}-gradient.png`);
      assert.equal(picture.width / picture.height, 1.5);
      const rgb = await page.evaluate(async data => {
        const img = new Image(); img.src = data; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0); return [...ctx.getImageData(768, 512, 1, 1).data];
      }, picture.data);
      assert.ok(Math.abs(rgb[0] - (selected.x + selected.width / 2) / w * 255) < 5, 'saved crop matches selected horizontal pixels');
      assert.ok(Math.abs(rgb[1] - (selected.y + selected.height / 2) / h * 255) < 5, 'saved crop matches selected vertical pixels');
      await page.getByTestId('device-frame').screenshot({ path: `${out}/${name}-populated.png` });
      await page.getByRole('button', { name: 'Change image', exact: true }).click();
    }
    await page.getByLabel('Choose photo file').setInputFiles(path.resolve('graphics/curated-review/nature.png'));
    await page.getByRole('dialog', { name: 'Crop your picture' }).waitFor();
    for (const [layout, name] of [['0', 'iphone'], ['1', 'android']]) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
      await page.getByTestId('device-frame').screenshot({ path: `${out}/${name}-artwork.png` });
    }
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    assert.equal((await stored()).length, 2, 'cancellation adds nothing');
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('img', { name: 'android-gradient.png', exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log('PASS: 12,000 crop invariant steps; full image, all four corner drags, movement, keyboard, preview scaling, exact saved pixels, Cancel/Done, draft preservation and populated Create on both phones.');
  } catch (e) { await page.screenshot({ path: `${out}/failure.png`, fullPage: true }); throw e; }
  finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
