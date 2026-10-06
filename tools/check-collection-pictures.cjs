const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  fs.mkdirSync('.cache/collection-picture-review', { recursive: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const storedCount = () => page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('jigsaw-browser-preview');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const count = db.transaction('pictures').objectStore('pictures').count();
      count.onsuccess = () => { resolve(count.result); db.close(); };
      count.onerror = () => { reject(count.error); db.close(); };
    };
  }));
  try {
    for (const layout of ['0', '1']) {
      await page.goto('http://localhost:8081/sources?returnTo=create', { waitUntil: 'networkidle', timeout: 120000 });
      await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
      await page.getByRole('button', { name: 'Curated Collections', exact: true }).click();
      await page.getByTestId('curated-card-nature').click();
      const screen = page.getByTestId('collection-picture-screen');
      await screen.waitFor();
      await page.waitForFunction(() => {
        const images = [...document.querySelectorAll('[data-testid="collection-picture-screen"] img')];
        return images.length >= 22 && images.every(image => image.complete && image.naturalWidth > 0);
      }, undefined, { timeout: 60000 });
      await page.getByRole('heading', { name: 'Nature Collection', exact: true }).waitFor();
      assert.equal(await screen.getByRole('button', { name: 'Add Picture', exact: true }).isDisabled(), true);
      assert.equal(await screen.getByText('AI Pack', { exact: true }).count(), 0);
      const owned = screen.getByRole('button', { name: /already in collection/ });
      assert.equal(await owned.count(), 4);
      for (const item of await owned.all()) assert.equal(await item.isDisabled(), true);
      const toggle = screen.getByRole('switch', { name: 'Exclude already in collection' });
      await toggle.click();
      assert.equal(await owned.count(), 0);
      await toggle.click();
      assert.equal(await owned.count(), 4);
      await page.getByTestId('collection-picture-sample-2').click();
      await page.waitForFunction(() => document.querySelector('[data-testid="collection-picture-sample-2"]')?.getAttribute('aria-pressed') === 'true');
      const boundary = await page.getByTestId('collection-picture-boundary').boundingBox();
      const rail = await screen.getByTestId('scrollbar-rail').boundingBox();
      assert(rail && Math.abs(rail.y - boundary.y) < 1);
      assert(Math.abs(rail.y + rail.height - boundary.y - boundary.height) < 1);
      const headerBefore = await page.getByTestId('collection-picture-header').boundingBox();
      const footerBefore = await page.getByTestId('collection-picture-footer').boundingBox();
      const first = await page.getByTestId('collection-picture-sample-1').boundingBox();
      const second = await page.getByTestId('collection-picture-sample-2').boundingBox();
      const third = await page.getByTestId('collection-picture-sample-3').boundingBox();
      assert(Math.abs(first.y - second.y) < 1 && Math.abs(first.y - third.y) < 1);
      assert(third.x + third.width < rail.x);
      await page.getByTestId('device-frame').screenshot({ path: `.cache/collection-picture-review/phone-${layout}-selected.png` });
      await screen.getByRole('scrollbar').focus();
      await page.keyboard.press('End');
      await page.waitForFunction(() => {
        const root = document.querySelector('[data-testid="collection-picture-screen"]');
        const n = root?.querySelector('[data-testid="page-scroll"]');
        return n && Math.abs(n.scrollHeight - n.clientHeight - n.scrollTop) < 2;
      });
      assert.deepEqual(await page.getByTestId('collection-picture-header').boundingBox(), headerBefore);
      assert.deepEqual(await page.getByTestId('collection-picture-footer').boundingBox(), footerBefore);
      const last = await page.getByTestId('collection-picture-sample-21').boundingBox();
      assert(last.y + last.height <= footerBefore.y);
      await page.getByTestId('device-frame').screenshot({ path: `.cache/collection-picture-review/phone-${layout}-scrolled.png` });
      await screen.getByRole('button', { name: 'Add Picture', exact: true }).click();
      await page.waitForURL('**/create');
      await page.getByRole('img', { name: 'Alpine Meadow', exact: true }).waitFor();
      await page.getByTestId('device-frame').screenshot({ path: `.cache/collection-picture-review/phone-${layout}-create.png` });
      await page.getByRole('button', { name: 'Change image', exact: true }).click();
      await page.getByRole('button', { name: 'Curated Collections', exact: true }).click();
      await page.getByRole('button', { name: 'Open Free Collection', exact: true }).click();
      await page.getByRole('heading', { name: 'Free Collection', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Back', exact: true }).click();
      await page.getByRole('heading', { name: 'Choose a collection', exact: true }).waitFor();
      assert.equal(await storedCount(), 0, 'sample selection never writes a saved picture');
    }
    // A real photo picked after a sample must replace the ephemeral preview.
    await page.getByRole('button', { name: 'Photo Gallery', exact: true }).click();
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Choose file', exact: true }).click();
    await (await chooser).setFiles('graphics/create-review/mountain-lake.png');
    await page.getByRole('dialog').getByRole('button', { name: 'Done', exact: true }).click();
    await page.waitForURL('**/create');
    await page.getByTestId('create-selected-picture').getByRole('img', { name: 'mountain-lake.png', exact: true }).waitFor();
    assert.equal(await storedCount(), 1, 'only the explicitly imported test photo was saved');
    await page.getByRole('button', { name: 'Change image', exact: true }).click();
    // Mobile scope: tablet source layouts remain unchanged; capture for regression review.
    for (const layout of ['2', '3']) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
      await page.getByRole('heading', { name: 'Add Picture', exact: true }).waitFor();
      await page.getByTestId('device-frame').screenshot({ path: `.cache/collection-picture-review/tablet-${layout}-unchanged.png` });
    }
    assert.deepEqual(errors, []);
    console.log('PASS: both phones: card navigation, three columns, owned filtering, selection, outside scrollbar bounds, fixed header/footer, last row visibility, image handoff and Back. Samples never saved; real photo replaces sample. Tablet source layouts captured unchanged.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
