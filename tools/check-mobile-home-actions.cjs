// Isolated browser checks for mobile header and swipe deletion; no owner data.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const output = path.resolve('.cache/home-review');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle', timeout: 120000 });
    const frame = page.getByTestId('device-frame');
    const state = page.getByLabel('Home review state');
    const rows = page.getByTestId('swipe-puzzle-row');
    const swipe = async (row, dx, dy = 0) => {
      const b = await row.boundingBox();
      const x = b.x + b.width - 18;
      const y = b.y + b.height / 2;
      await page.mouse.move(x, y); await page.mouse.down();
      await page.mouse.move(x + dx, y + dy, { steps: 8 }); await page.mouse.up();
    };
    for (const [layout, name] of [['0', 'iphone'], ['1', 'android']]) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
      await state.selectOption('empty');
      await page.getByRole('heading', { name: 'My Puzzles (0)', exact: true }).waitFor();
      await page.waitForFunction(() => { const f = document.querySelector('[data-testid="device-frame"]'); return Math.abs(f.getBoundingClientRect().width - parseFloat(f.style.width)) < 0.5; });
      await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
      const header = page.getByTestId('home-allowance');
      const emptyHeader = await header.boundingBox();
      await frame.screenshot({ path: path.join(output, name + '-header-empty.png') });
      await state.selectOption('populated');
      await page.getByRole('heading', { name: 'My Puzzles (7)', exact: true }).waitFor();
      await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
      assert.deepEqual(await header.boundingBox(), emptyHeader, 'same compact header size in both states');
      const title = await header.getByRole('heading').boundingBox();
      const buy = await header.getByRole('button').boundingBox();
      assert.ok(title.x + title.width <= buy.x, 'header title does not collide with purchase button');
      assert.ok(await header.getByLabel('75 of 100 pictures used; 2 of 3 themes used').isVisible());
      const sort = await page.getByTestId('sort-trigger-face').boundingBox();
      const label = await frame.getByText('Sort by:', { exact: true }).boundingBox();
      assert.ok(sort.x - label.x - label.width >= 9, 'sort label has horizontal breathing room');
      await frame.screenshot({ path: path.join(output, name + '-header-populated.png') });
      await swipe(rows.first(), -16);
      assert.equal(await rows.first().getByRole('button', { name: 'Delete Lakeside Village', exact: true }).isVisible(), false, 'short swipe closes');
      await swipe(rows.first(), -2, 48);
      assert.equal(await rows.first().getByRole('button', { name: 'Delete Lakeside Village', exact: true }).isVisible(), false, 'vertical motion does not reveal delete');
      await swipe(rows.first(), -100);
      await rows.first().getByRole('button', { name: 'Delete Lakeside Village', exact: true }).waitFor();
      assert.equal(await page.getByRole('status').count(), 0, 'swiping the action button does not accidentally activate it');
      await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await frame.screenshot({ path: path.join(output, name + '-swipe-delete.png') });
      await rows.first().getByRole('button', { name: 'Delete Lakeside Village', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByText('Lakeside Village. Your picture stays in My Collection.').waitFor();
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      assert.equal(await rows.count(), 7, 'cancellation preserves puzzle');
      await swipe(rows.nth(1), -100);
      assert.equal(await rows.first().getByRole('button', { name: 'Delete Lakeside Village', exact: true }).isVisible(), false, 'only one row stays open');
      await rows.nth(1).getByRole('button', { name: 'Delete Playful Puppy', exact: true }).click();
      await dialog.getByRole('button', { name: 'Delete puzzle', exact: true }).click();
      await page.getByRole('heading', { name: 'My Puzzles (6)', exact: true }).waitFor();
      assert.equal(await frame.getByText('Playful Puppy', { exact: true }).count(), 0, 'only selected puzzle removed');
      // Keyboard alternative, and deleting the final puzzle must not revoke theme balances.
      while (await rows.count()) {
        await rows.first().focus(); await page.keyboard.press('ArrowLeft');
        await rows.first().getByRole('button', { name: /^Delete / }).click();
        await dialog.getByRole('button', { name: 'Delete puzzle', exact: true }).click();
      }
      await page.getByRole('heading', { name: 'My Puzzles (0)', exact: true }).waitFor();
      assert.ok(await header.getByLabel('75 of 100 pictures used; 2 of 3 themes used').isVisible());
      await state.selectOption('empty'); await state.selectOption('populated');
      assert.equal(await rows.count(), 7, 'switching review states resets fixtures');
    }
    // Real touch events with a scaled browser frame exercise the Windows review path.
    await page.setViewportSize({ width: 800, height: 700 });
    const b = await rows.first().boundingBox();
    const cdp = await context.newCDPSession(page);
    const x = b.x + b.width - 12, y = b.y + b.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 6; step++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - step * 10, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.ok(await rows.first().getByRole('button', { name: 'Delete Lakeside Village', exact: true }).isVisible(), 'touch swipe works in scaled preview');
    await page.reload({ waitUntil: 'networkidle', timeout: 120000 });
    assert.equal(await state.inputValue(), 'empty');
    await page.getByRole('tab', { name: 'My Collection', exact: true }).click();
    // Collection now combines personal photos and curated fixtures by default.
    await page.getByRole('button', { name: 'Filter by Theme: All pictures', exact: true }).click();
    await page.getByRole('option', { name: 'My Pictures', exact: true }).click();
    await page.getByRole('heading', { name: 'Make it your collection' }).waitFor();
    assert.deepEqual(errors, []);
    console.log('PASS: compact headers, horizontal spacing, mouse/touch swipe, short/vertical gestures, cancellation, isolated deletion, last-row balances, keyboard access and fixture reset.');
  } catch (error) {
    await page.screenshot({ path: path.join(output, 'actions-failure.png'), fullPage: true });
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
