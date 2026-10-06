// Isolated browser and synthetic camera; never opens the owner's physical camera or collection.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const output = path.resolve('.cache/source-review');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  await context.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    window.cameraRequests = [];
    window.cameraStreams = [];
    window.cameraFailure = '';
    navigator.mediaDevices.getUserMedia = async options => {
      window.cameraRequests.push(options);
      if (window.cameraFailure) throw new DOMException('Test failure', window.cameraFailure);
      const stream = await original(options);
      window.cameraStreams.push(stream);
      return stream;
    };
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const settle = async () => {
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  const pictures = () => page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('jigsaw-browser-preview');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const read = db.transaction('pictures').objectStore('pictures').getAll();
      read.onsuccess = () => { resolve(read.result.map(({ id, title, source, width, height }) => ({ id, title, source, width, height }))); db.close(); };
      read.onerror = () => { reject(read.error); db.close(); };
    };
  }));
  const stopped = async () => assert.ok(await page.evaluate(() => window.cameraStreams.every(s => s.getTracks().every(t => t.readyState === 'ended'))), 'all camera tracks released');
  try {
    await page.goto('http://localhost:8081/create', { waitUntil: 'networkidle', timeout: 120000 });
    await page.getByRole('button', { name: 'Add Image', exact: true }).click();
    await page.getByRole('heading', { name: 'Add Image', exact: true }).waitFor();
    const measurements = [];
    for (const [layout, label] of [['0', 'iphone'], ['1', 'android']]) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
      await page.getByRole('button', { name: 'Photo Gallery', exact: true }).click();
      await settle();
      const frame = page.getByTestId('device-frame');
      await frame.screenshot({ path: path.join(output, `${label}-gallery.png`) });
      assert.equal(await page.getByRole('button', { name: 'Photo Gallery', exact: true }).getAttribute('aria-selected'), 'true');
      const chooser = page.getByRole('button', { name: 'Choose file', exact: true });
      const fileDialog = page.waitForEvent('filechooser');
      await chooser.click();
      assert.equal((await fileDialog).isMultiple(), false, 'one photo per import');
      for (const source of ['photo', 'camera']) {
        if (source === 'camera') await page.getByRole('button', { name: 'Camera', exact: true }).click();
        await settle();
        const scroll = page.locator('[data-testid="page-scroll"]:visible');
        const size = await scroll.evaluate(n => ({ client: n.clientHeight, content: n.scrollHeight }));
        assert.ok(size.content <= size.client + 1, `${label} ${source} fits`);
        measurements.push({ layout: label, source, ...size });
      }
      await frame.screenshot({ path: path.join(output, `${label}-camera.png`) });
      assert.equal(await page.evaluate(() => window.cameraRequests.length), 0, 'source selection never requests permission');
      assert.equal(await page.locator('[data-testid="bottom-tab-bar"]:visible').count(), 0);
    }
    await page.getByLabel('Preview layout', { exact: true }).selectOption('0');
    for (const [failure, copy] of [['NotAllowedError', 'Camera permission was denied'], ['NotFoundError', 'No camera was found']]) {
      await page.evaluate(value => { window.cameraFailure = value; }, failure);
      await page.getByRole('button', { name: 'Open camera', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: copy }).waitFor();
    }
    await page.evaluate(() => { window.cameraFailure = ''; });
    await page.getByRole('button', { name: 'Open camera', exact: true }).click();
    await page.getByRole('button', { name: 'Cancel camera', exact: true }).click();
    await stopped();
    assert.equal((await pictures()).length, 0, 'cancel camera saves nothing');
    await page.getByRole('button', { name: 'Open camera', exact: true }).click();
    await page.getByRole('button', { name: 'Take photo', exact: true }).click();
    await page.getByLabel('3:2 crop preview').waitFor();
    await stopped();
    await page.getByRole('button', { name: 'Cancel crop', exact: true }).click();
    assert.equal((await pictures()).length, 0, 'cancel crop saves nothing');
    await page.getByRole('button', { name: 'Open camera', exact: true }).click();
    await page.getByRole('button', { name: 'Photo Gallery', exact: true }).click();
    await stopped();
    await page.getByRole('button', { name: 'Camera', exact: true }).click();
    await page.getByRole('button', { name: 'Open camera', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await stopped();
    await page.getByLabel('Create Puzzle review state', { exact: true }).selectOption('after');
    await page.getByRole('button', { name: 'Change image', exact: true }).click();
    await page.getByRole('button', { name: 'Camera', exact: true }).click();
    await page.getByRole('button', { name: 'Open camera', exact: true }).click();
    await page.getByRole('button', { name: 'Take photo', exact: true }).click();
    await page.getByLabel('Imported picture title', { exact: true }).fill('Camera test');
    await page.getByRole('button', { name: 'Add to My Collection', exact: true }).click();
    await page.getByRole('img', { name: 'Camera test', exact: true }).waitFor();
    const stored = await pictures();
    assert.equal(stored.length, 1);
    assert.equal(stored[0].source, 'camera');
    assert.equal(stored[0].width / stored[0].height, 1.5);
    await stopped();
    assert.ok(await page.evaluate(() => window.cameraRequests.every(r => r.audio === false)), 'never requests microphone');
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByTestId('create-mobile-header').waitFor();
    assert.equal((await pictures()).length, 1, 'camera photo survives reload');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ passed: true, measurements, errors, camera: 'synthetic browser device; physical camera unverified' }, null, 2));
    console.log('PASS: mobile gallery/camera screenshots, Add/Change entry, file chooser, permission failures, capture/crop/save, cancellation, stream cleanup and persisted camera metadata.');
  } catch (error) {
    console.error('Browser errors:', errors);
    await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
