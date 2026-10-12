const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve('.cache/puzzle-screen');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const errors = [], sizes = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const button = name => page.getByRole('button', { name, exact: true });
  const settle = async () => { await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0)); await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); };
  try {
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle', timeout: 120000 });
    await page.locator('[data-preview-ready="true"]').waitFor();
    await page.getByLabel('Fit to window').uncheck();
    await page.getByLabel('Home review state').selectOption('populated');
    for (const [index, name] of [['0','iphone'],['1','android'],['2','tablet-portrait'],['3','tablet-landscape']]) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(index);
      const row = page.getByTestId('home-puzzle-row').filter({ hasText: 'Fairy Tale Castle' });
      await row.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByTestId('puzzle-screen').waitFor();
      assert.equal(await page.getByRole('progressbar', { name: 'Puzzle progress' }).getAttribute('aria-valuenow'), '68');
      assert.equal(await page.getByTestId('puzzle-seams').getAttribute('data-rows'), '12');
      assert.equal(await page.getByTestId('puzzle-seams').getAttribute('data-columns'), '12');
      await page.getByText('98 / 144 pieces placed', { exact: true }).waitFor();
      await page.getByText('12 × 12 · Rotation on', { exact: true }).waitFor();
      assert.equal(await page.locator('[data-testid="bottom-tab-bar"]:visible').count(), 0);
      await settle();
      const scroll = page.locator('[data-testid="page-scroll"]:visible');
      const bounds = await scroll.evaluate(n => ({ client: n.clientHeight, content: n.scrollHeight }));
      sizes.push({ name, ...bounds });
      if (Number(index) < 2) assert.ok(bounds.content <= bounds.client + 1, `${name} no-scroll fit ${JSON.stringify(bounds)}`);
      await page.getByTestId('device-frame').screenshot({ path: path.join(out, `${name}-continue.png`) });
      await button('Preview').click(); await page.getByTestId('puzzle-preview').waitFor();
      await button('Close preview').click();
      const tray = page.getByTestId('piece-tray-scroll');
      await tray.scrollIntoViewIfNeeded();
      const trayBox = await tray.boundingBox();
      assert.ok(await tray.evaluate(n => n.scrollWidth > n.clientWidth), 'tray has horizontally scrollable pieces');
      assert.ok(await tray.evaluate(n => n.clientHeight >= n.firstElementChild.offsetHeight), 'pieces fit in tray');
      assert.equal(await tray.evaluate(n => getComputedStyle(n).scrollbarWidth), 'none', 'tray scrollbar is hidden');
      const pageTop = await scroll.evaluate(n => n.scrollTop);
      await tray.hover(); await page.mouse.wheel(0, 180);
      await page.waitForFunction(() => document.querySelector('[data-testid="piece-tray-scroll"]').scrollLeft > 0);
      assert.equal(await scroll.evaluate(n => n.scrollTop), pageTop, 'wheel scrolls tray without moving page');
      await tray.focus(); await page.keyboard.press('End');
      assert.ok(await tray.evaluate(n => Math.abs(n.scrollLeft + n.clientWidth - n.scrollWidth) < 1), 'End reveals last piece');
      await page.keyboard.press('Home');
      await page.mouse.move(trayBox.x + trayBox.width - 35, trayBox.y + 28); await page.mouse.down();
      await page.mouse.move(trayBox.x + 35, trayBox.y + 28, { steps: 8 }); await page.mouse.up();
      assert.ok(await tray.evaluate(n => n.scrollLeft > 100), 'mouse drag browses pieces');
      await tray.focus(); await page.keyboard.press('Home');
      await page.keyboard.press('ArrowRight');
      assert.equal(await tray.evaluate(n => n.scrollLeft), 74, 'keyboard scrolls one piece');
      await page.keyboard.press('Home');
      if (Number(index) < 2) {
        const cdp = await page.context().newCDPSession(page);
        const x = trayBox.x + trayBox.width - 30, y = trayBox.y + 30;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let step = 1; step <= 8; step++) await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove', touchPoints: [{ x: x - step * 20, y }],
        });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForFunction(() => document.querySelector('[data-testid="piece-tray-scroll"]').scrollLeft > 0);
        await tray.focus(); await page.keyboard.press('End');
        const leftX = trayBox.x + 30;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: leftX, y }] });
        for (let step = 1; step <= 8; step++) await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove', touchPoints: [{ x: leftX + step * 20, y }],
        });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForFunction(() => {
          const node = document.querySelector('[data-testid="piece-tray-scroll"]');
          return node.scrollLeft < node.scrollWidth - node.clientWidth - 20;
        });
        await cdp.detach();
      }
      const width = (await page.getByTestId('puzzle-board').boundingBox()).width;
      assert.ok(Math.abs((await page.getByTestId('puzzle-board').boundingBox()).height - width) < 1, 'square puzzle board');
      await button('Zoom in').click(); assert.ok((await page.getByTestId('puzzle-board').boundingBox()).width > width);
      await button('Fit puzzle').click();
      assert.equal(Math.round((await page.getByTestId('puzzle-board').boundingBox()).width), Math.round(width));
      await button('Hint').click(); await page.getByRole('status').filter({ hasText: 'Hint will be available' }).waitFor();
      assert.equal(await page.getByRole('progressbar', { name: 'Puzzle progress' }).getAttribute('aria-valuenow'), '68', 'tools do not fake gameplay');
      await button('Back').click();
      await page.getByRole('link', { name: 'Open Lakeside Village', exact: true }).click();
      await button('Play Again').click(); await page.getByTestId('puzzle-screen').waitFor();
      assert.equal(await page.getByRole('progressbar', { name: 'Puzzle progress' }).getAttribute('aria-valuenow'), '0');
      await button('Start Playing').waitFor();
      await settle(); await page.getByTestId('device-frame').screenshot({ path: path.join(out, `${name}-replay.png`) });
      await button('Back').click();
    }
    await page.getByLabel('Preview layout', { exact: true }).selectOption('0');
    await button('Add Puzzle').click();
    await page.getByLabel('Create Puzzle review state').selectOption('after');
    await button('25 pieces').click();
    await page.getByRole('radio', { name: 'None', exact: true }).click();
    await page.getByRole('switch', { name: 'Rotate pieces', exact: true }).uncheck();
    await button('Create Puzzle').click(); await page.getByTestId('puzzle-screen').waitFor();
    await page.getByText('0 / 25 pieces placed', { exact: true }).waitFor();
    await page.getByText('Timer off', { exact: true }).waitFor();
    await page.getByText('5 × 5 · Rotation off', { exact: true }).waitFor();
    assert.equal(await button('Rotate selected piece').count(), 0);
    await settle(); await page.getByTestId('device-frame').screenshot({ path: path.join(out, 'iphone-created-none.png') });
    await button('Back').click();
    await page.getByRole('heading', { name: 'My Puzzles (8)', exact: true }).waitFor();
    // Direct replay from Home also enters the puzzle, while the card opens setup.
    await page.getByTestId('home-puzzle-row').filter({ hasText: 'Playful Puppy' }).getByRole('button', { name: 'Play Again', exact: true }).click();
    await page.getByText('Stopwatch', { exact: true }).waitFor();
    await page.getByText('00:00', { exact: true }).waitFor();
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Choose a puzzle first', exact: true }).waitFor();
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out,'results.json'), JSON.stringify({ passed: true, sizes, errors }, null, 2));
    console.log('PASS: Home/setup/new entry, configurations, progress/reset, preview, zoom/Fit, no gameplay mutation, new Home entry, direct-load fallback, phone/tablet captures.');
  } catch (e) { await page.screenshot({ path: path.join(out,'failure.png'), fullPage: true }); throw e; }
  finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
