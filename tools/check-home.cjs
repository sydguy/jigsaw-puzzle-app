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
      await page.waitForFunction(() => { const f = document.querySelector('[data-testid="device-frame"]'); return Math.abs(f.getBoundingClientRect().width - parseFloat(f.style.width)) < 0.5; });
      assert.equal(await page.getByRole('listbox').count(), 0);
      assert.equal(await frame.getByText('75 of 100 pictures used', { exact: false }).count(), 0);
      await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
      const emptyHero = await page.getByTestId('home-add-puzzle').boundingBox();
      const emptyHeroText = await page.getByTestId('home-add-puzzle').innerText();
      const emptySortFace = await page.getByTestId('sort-trigger-face').boundingBox();
      if (i < 2) {
        await frame.getByText('Sort by:', { exact: true }).waitFor();
        const circle = await page.getByTestId('add-puzzle-circle').boundingBox();
        const plus = await page.getByTestId('add-puzzle-plus').boundingBox();
        assert.ok(Math.abs(circle.x + circle.width / 2 - plus.x - plus.width / 2) < 0.5, 'plus centered horizontally');
        assert.ok(Math.abs(circle.y + circle.height / 2 - plus.y - plus.height / 2) < 0.5, 'plus centered vertically');
      }
      await frame.screenshot({ path: path.join(output, names[i] + '-empty.png') });
      await page.getByRole('button', { name: 'Sort puzzles:', exact: false }).click();
      const emptyMenu = await page.getByRole('listbox').boundingBox();
      await frame.screenshot({ path: path.join(output, names[i] + '-sort.png') });
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('listbox').count(), 0);
      await state.selectOption('populated');
      await page.getByRole('heading', { name: 'Theme Collection', exact: true }).click();
      const rows = page.getByTestId('home-puzzle-row');
      assert.equal(await rows.count(), i < 2 ? 7 : 5);
      await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
      await frame.screenshot({ path: path.join(output, names[i] + '-populated.png') });
      if (i < 2) {
        assert.deepEqual(await page.getByTestId('home-add-puzzle').boundingBox(), emptyHero, 'same Add Puzzle geometry in both states');
        assert.equal(await page.getByTestId('home-add-puzzle').innerText(), emptyHeroText, 'same Add Puzzle copy in both states');
        assert.deepEqual(await page.getByTestId('sort-trigger-face').boundingBox(), emptySortFace, 'same closed sort geometry in both states');
        await page.getByRole('button', { name: 'Sort puzzles:', exact: false }).click();
        assert.deepEqual(await page.getByRole('listbox').boundingBox(), emptyMenu, 'same open sort geometry in both states');
        await frame.screenshot({ path: path.join(output, names[i] + '-populated-sort.png') });
        await page.keyboard.press('Escape');
      }
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
        if (i < 2) {
          for (const label of await row.locator('div[dir="auto"]').all()) {
            const text = await label.boundingBox();
            if (text) assert.ok(text.x >= box.x && text.x + text.width <= box.x + box.width + 1, 'mobile text stays within row');
          }
        }
      }
      const scroll = page.getByTestId('page-scroll');
      const bar = page.getByRole('scrollbar', { name: 'Page scrollbar' });
      await bar.waitFor();
      assert.ok(await scroll.evaluate(node => node.scrollHeight > node.clientHeight), 'extra fixtures produce scrolling');
      const navBefore = await page.getByTestId('bottom-tab-bar').boundingBox();
      const headerBefore = await page.getByTestId('home-list-header').boundingBox();
      const heroBefore = await page.getByTestId('home-add-puzzle').boundingBox();
      if (i < 2) {
        const railBounds = await page.getByTestId('scrollbar-rail').boundingBox();
        const firstCard = await rows.first().boundingBox();
        assert.ok(Math.abs(railBounds.y - firstCard.y) < 1, 'scrollbar starts exactly at first card');
        assert.ok(Math.abs(railBounds.y + railBounds.height - (navBefore.y - 8)) < 1, 'scrollbar retains its lower endpoint');
        assert.equal(await page.getByTestId('bottom-tab-bar').evaluate(node => getComputedStyle(node).position), 'absolute', 'tabs float over scrolling content');
      }
      const thumbBefore = await page.getByTestId('scrollbar-thumb').boundingBox();
      await bar.focus(); await page.keyboard.press('End');
      await page.waitForFunction(() => { const n = document.querySelector('[data-testid="page-scroll"]'); return Math.abs(n.scrollHeight - n.clientHeight - n.scrollTop) < 2; });
      await page.waitForFunction(() => { const n = document.querySelector('[role="scrollbar"]'); return n.getAttribute('aria-valuenow') === n.getAttribute('aria-valuemax'); });
      assert.ok((await page.getByTestId('scrollbar-thumb').boundingBox()).y > thumbBefore.y, 'thumb follows scroll position');
      assert.deepEqual(await page.getByTestId('bottom-tab-bar').boundingBox(), navBefore, 'tab bar stays fixed while content scrolls');
      if (i < 2) {
        assert.deepEqual(await page.getByTestId('home-list-header').boundingBox(), headerBefore, 'heading and sort stay fixed');
        assert.deepEqual(await page.getByTestId('home-add-puzzle').boundingBox(), heroBefore, 'Add Puzzle stays fixed');
        const viewport = await scroll.boundingBox();
        assert.ok((await rows.first().boundingBox()).y < viewport.y, 'cards scroll out at list boundary');
        assert.ok((await rows.last().boundingBox()).y + (await rows.last().boundingBox()).height <= navBefore.y, 'last card can be reached above floating tabs');
      }
      await bar.evaluate(node => node.blur());
      await frame.screenshot({ path: path.join(output, names[i] + '-scrolled.png') });
      const rail = await bar.boundingBox();
      const thumbEnd = await page.getByTestId('scrollbar-thumb').boundingBox();
      await page.mouse.move(thumbEnd.x + thumbEnd.width / 2, thumbEnd.y + thumbEnd.height / 2);
      await page.mouse.down(); await page.mouse.move(rail.x + rail.width / 2, rail.y, { steps: 8 }); await page.mouse.up();
      await page.waitForFunction(() => document.querySelector('[data-testid="page-scroll"]').scrollTop < 2);
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
    await page.getByRole('button', { name: /^Buy theme packs$/i }).click();
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
