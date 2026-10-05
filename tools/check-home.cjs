// Isolated Home visual review. No writes to the owner's browser profile.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const output = path.resolve('.cache/home-review');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  try {
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle', timeout: 120000 });
    const frame = page.getByTestId('device-frame');
    const state = page.getByLabel('Home review state');
    assert.equal(await state.inputValue(), 'empty');
    const names = ['iphone', 'android', 'tablet-portrait', 'tablet-landscape'];
    for (let i = 0; i < names.length; i++) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(String(i));
      await state.selectOption('empty');
      await page.getByRole('heading', { name: 'My Puzzles (0)', exact: true }).waitFor();
      assert.equal(await page.getByRole('listbox').count(), 0);
      assert.equal(await frame.getByText('75 of 100 pictures used', { exact: false }).count(), 0);
      await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
      await frame.screenshot({ path: path.join(output, names[i] + '-empty.png') });
      await page.getByRole('button', { name: 'Sort puzzles:', exact: false }).click();
      await frame.screenshot({ path: path.join(output, names[i] + '-sort.png') });
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('listbox').count(), 0);
      await state.selectOption('populated');
      await page.getByRole('heading', { name: 'Theme Collection', exact: true }).click();
      const rows = page.getByTestId('home-puzzle-row');
      assert.equal(await rows.count(), i < 2 ? 5 : 3);
      await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
      await frame.screenshot({ path: path.join(output, names[i] + '-populated.png') });
      const image = await rows.first().getByTestId('puzzle-thumbnail').boundingBox();
      assert.ok(Math.abs(image.width / image.height - 1.5) < 0.02, '3:2 thumbnail');
      const status = await rows.first().getByTestId('puzzle-status').boundingBox();
      const action = await rows.first().getByTestId('puzzle-action').boundingBox();
      if (i === 3) assert.ok(action.x >= status.x + status.width, 'landscape status beside action');
      else assert.ok(action.y >= status.y + status.height, 'status above action');
      const bounds = await frame.boundingBox();
      for (const row of await rows.all()) {
        const box = await row.boundingBox();
        assert.ok(box.x >= bounds.x && box.x + box.width <= bounds.x + bounds.width + 1, 'row fits device');
      }
      await page.getByRole('button', { name: 'Sort puzzles:', exact: false }).click();
      await page.getByRole('option', { name: 'Most Pieces' }).click();
      assert.equal(await rows.first().getAttribute('aria-label'), 'Fairy Tale Castle');
      await page.getByRole('button', { name: 'Sort puzzles:', exact: false }).click();
      await page.getByRole('option', { name: 'Latest Created' }).click();
      assert.equal(await rows.first().getAttribute('aria-label'), 'Lakeside Village');
      await page.getByRole('button', { name: 'Sort puzzles:', exact: false }).click();
      await page.getByRole('option', { name: 'Latest Played' }).click();
      await rows.first().getByRole('button', { name: 'Play Again' }).click();
      await page.getByRole('status').filter({ hasText: 'seed data' }).waitFor();
    }
    await state.selectOption('empty');
    await page.getByRole('button', { name: 'Buy theme packs' }).click();
    await page.getByRole('status').filter({ hasText: 'No purchase' }).waitFor();
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await state.inputValue(), 'empty');
    await page.getByRole('tab', { name: 'My Collection', exact: true }).click();
    await page.getByRole('heading', { name: 'Make it your collection' }).waitFor();
    assert.equal(await page.getByTestId('home-puzzle-row').count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: four Home layouts, empty/populated seed isolation, 3:2 thumbnails, responsive action placement, sorting, Escape dismissal, honest action feedback, empty on reload.');
  } catch (error) {
    await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
    console.error(errors);
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
