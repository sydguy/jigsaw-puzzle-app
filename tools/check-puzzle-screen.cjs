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
    await page.getByLabel('Fit to window').uncheck();
    await page.getByLabel('Home review state').selectOption('populated');
    for (const [index, name] of [['0','iphone'],['1','android'],['2','tablet-portrait'],['3','tablet-landscape']]) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(index);
      const row = page.getByTestId('home-puzzle-row').filter({ hasText: 'Fairy Tale Castle' });
      await row.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByTestId('puzzle-screen').waitFor();
      assert.equal(await page.getByRole('progressbar', { name: 'Puzzle progress' }).getAttribute('aria-valuenow'), '68');
      assert.equal(await page.getByTestId('puzzle-seams').getAttribute('data-rows'), '12');
      assert.equal(await page.getByTestId('puzzle-seams').getAttribute('data-columns'), '18');
      await page.getByText('147 / 216 pieces placed', { exact: true }).waitFor();
      await page.getByText('12 × 18 · Rotation on', { exact: true }).waitFor();
      assert.equal(await page.locator('[data-testid="bottom-tab-bar"]:visible').count(), 0);
      await settle();
      const scroll = page.locator('[data-testid="page-scroll"]:visible');
      const bounds = await scroll.evaluate(n => ({ client: n.clientHeight, content: n.scrollHeight }));
      sizes.push({ name, ...bounds });
      if (Number(index) < 2) assert.ok(bounds.content <= bounds.client + 1, `${name} no-scroll fit ${JSON.stringify(bounds)}`);
      await page.getByTestId('device-frame').screenshot({ path: path.join(out, `${name}-continue.png`) });
      await button('Preview').click(); await page.getByTestId('puzzle-preview').waitFor();
      await button('Close preview').click();
      const width = (await page.getByTestId('puzzle-board').boundingBox()).width;
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
    await button('54 pieces').click();
    await page.getByRole('radio', { name: 'None', exact: true }).click();
    await page.getByRole('switch', { name: 'Rotate pieces', exact: true }).uncheck();
    await button('Create Puzzle').click(); await page.getByTestId('puzzle-screen').waitFor();
    await page.getByText('0 / 54 pieces placed', { exact: true }).waitFor();
    await page.getByText('Timer off', { exact: true }).waitFor();
    await page.getByText('6 × 9 · Rotation off', { exact: true }).waitFor();
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
