// Isolated browser review. Sample puzzles never enter the owner's storage.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve('.cache/home-replay');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  const errors = [], sizes = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const button = name => page.getByRole('button', { name, exact: true });
  const settle = async () => {
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  };
  const back = () => button('Back').click();
  const assertActions = async (changed, unfinished = false) => {
    const expected = changed ? ['Create Puzzle'] : unfinished ? ['Play Again', 'Continue Playing'] : ['Play Again'];
    assert.deepEqual(await page.getByTestId('home-puzzle-actions').getByRole('button').allTextContents()
      .then(texts => texts.map(t => t.replace(/^[↻▶]/, '').trim())), expected);
  };
  try {
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle', timeout: 120000 });
    await page.getByLabel('Fit to window').uncheck();
    await page.getByLabel('Home review state').selectOption('populated');
    for (const [layout, name] of [['0', 'iphone'], ['1', 'android'], ['2', 'tablet-portrait'], ['3', 'tablet-landscape']]) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
      for (const [title, unfinished, rows] of [['Lakeside Village', false, 8], ['Fairy Tale Castle', true, 12]]) {
        await page.getByRole('link', { name: 'Open ' + title, exact: true }).click();
        await page.getByRole('heading', { name: title, exact: true }).waitFor();
        await page.getByLabel('Rows: ' + rows, { exact: true }).waitFor();
        await assertActions(false, unfinished);
        await page.getByRole('heading', { name: unfinished
          ? 'Continue Playing or Play Again or create a new Puzzle?' : 'Play Again or create a new Puzzle?', exact: true }).waitFor();
        await settle();
        const scroll = page.locator('[data-testid="page-scroll"]:visible');
        await scroll.evaluate(n => { n.scrollTop = 0; });
        const dimensions = await scroll.evaluate(n => ({ viewport: n.clientHeight, content: n.scrollHeight }));
        sizes.push({ name, unfinished, ...dimensions });
        if (Number(layout) < 2) {
          assert.ok(dimensions.content <= dimensions.viewport + 1, `${name} ${unfinished ? 'unfinished' : 'completed'} fits without scrolling: ${JSON.stringify(dimensions)}`);
          const body = await page.getByTestId('create-ready-card').locator('div').last().evaluate(n => ({ h: n.getBoundingClientRect().height, text: n.textContent }));
          assert.ok(body.h <= 37, `two-line supporting copy: ${JSON.stringify(body)}`);
          if (unfinished) {
            const a = await button('Play Again').boundingBox(), b = await button('Continue Playing').boundingBox();
            assert.ok(Math.abs(a.width - b.width) < 1 && a.height >= 48 && b.height >= 48, 'equal half-width accessible actions');
          }
        }
        await page.getByTestId('device-frame').screenshot({ path: path.join(out, `${name}-${unfinished ? 'unfinished' : 'completed'}.png`) });
        if (Number(layout) >= 2) {
          await scroll.evaluate(n => { n.scrollTop = n.scrollHeight; });
          await settle();
          await page.getByTestId('device-frame').screenshot({ path: path.join(out, `${name}-${unfinished ? 'unfinished' : 'completed'}-actions.png`) });
        }
        for (const [increase, decrease] of [['Increase Rows', 'Decrease Rows'], ['Increase Columns', 'Decrease Columns']]) {
          await button(increase).click(); await assertActions(true);
          await button(decrease).click(); await assertActions(false, unfinished);
        }
        if (Number(layout) < 2) {
          for (const mode of ['Stopwatch', 'None']) {
            await page.getByRole('radio', { name: mode, exact: true }).click(); await assertActions(true);
            await page.getByRole('radio', { name: 'Timer', exact: true }).click(); await assertActions(false, unfinished);
          }
          const rotation = page.getByRole('switch', { name: 'Rotate pieces', exact: true });
          assert.equal(await rotation.isChecked(), unfinished, 'preload rotation');
          await rotation.click(); await assertActions(true);
          await button('Increase Rows').click();
          await rotation.click(); await assertActions(true); // One changed value still creates a new puzzle.
          await button('Decrease Rows').click(); await assertActions(false, unfinished);
          await button('Change image').click(); await back(); await assertActions(false, unfinished);
        }
        await button('Play Again').click();
        await page.getByRole('status').filter({ hasText: 'Gameplay is not connected' }).waitFor();
        if (unfinished) await button('Continue Playing').click();
        await back();
        assert.equal(await page.getByTestId('home-puzzle-row').count(), Number(layout) < 2 ? 7 : 5);
      }
    }
    await page.getByLabel('Preview layout', { exact: true }).selectOption('0');
    await page.getByRole('link', { name: 'Open Fairy Tale Castle', exact: true }).click();
    await button('Increase Rows').click();
    await page.getByRole('radio', { name: 'None', exact: true }).click();
    await settle();
    await page.getByTestId('device-frame').screenshot({ path: path.join(out, 'iphone-new-settings.png') });
    // Dispatch twice to the same target before navigation, rather than double-clicking
    // screen coordinates that become a Home tab after the first click navigates.
    await button('Create Puzzle').evaluate(n => { n.click(); n.click(); });
    await page.getByRole('heading', { name: 'My Puzzles (8)', exact: true }).waitFor();
    const castles = page.getByTestId('home-puzzle-row').filter({ hasText: 'Fairy Tale Castle' });
    assert.equal(await castles.count(), 2, 'new identity, original retained');
    assert.ok((await castles.allTextContents()).some(t => t.includes('68%') && t.includes('216')), 'original progress/grid retained');
    assert.ok((await castles.allTextContents()).some(t => t.includes('0%') && t.includes('294') && t.includes('Not yet')), 'new settings registered once');
    await castles.filter({ hasText: '294' }).click();
    await page.getByLabel('Rows: 14', { exact: true }).waitFor();
    assert.ok(await page.getByRole('radio', { name: 'None', exact: true }).isChecked(), 'new record retains settings');
    await assertActions(false, true);
    await back();
    await button('Add Puzzle').click();
    await page.getByRole('heading', { name: 'Create Puzzle', exact: true }).waitFor();
    await page.getByRole('heading', { name: 'Ready to Create?', exact: true }).waitFor();
    assert.equal(await page.getByTestId('home-puzzle-actions').count(), 0, 'normal Create is separate');
    const count = await page.evaluate(() => new Promise((resolve, reject) => {
      const request = indexedDB.open('jigsaw-browser-preview');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => { const db = request.result; const r = db.transaction('pictures').objectStore('pictures').count(); r.onsuccess = () => { resolve(r.result); db.close(); }; };
    }));
    assert.equal(count, 0, 'fixtures never persisted as pictures');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ passed: true, sizes, errors }, null, 2));
    console.log('PASS: Home entry, completed/unfinished variants, every setting change/revert, source cancellation, isolated creation, original preserved, duplicate-submit protection, phone fit and tablet captures.');
  } catch (e) { await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }); throw e; }
  finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
