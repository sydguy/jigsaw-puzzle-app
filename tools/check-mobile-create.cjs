// Isolated mobile browser review; never uses the owner's browser storage.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve('.cache/create-review');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const settle = async () => {
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  };
  try {
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle', timeout: 120000 });
    await page.getByRole('button', { name: 'Add Puzzle', exact: true }).click();
    await page.getByTestId('create-mobile-header').waitFor();
    assert.equal(await page.getByRole('radio', { name: 'Timer', exact: true }).isChecked(), true, 'Timer is the initial mode');
    assert.equal(await page.getByRole('switch', { name: 'Rotate pieces' }).isChecked(), false);
    const frame = page.getByTestId('device-frame');
    const dimensions = [];
    for (const [layout, name] of [['0', 'iphone'], ['1', 'android']]) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
      await page.waitForFunction(() => { const f = document.querySelector('[data-testid="device-frame"]'); return Math.abs(f.getBoundingClientRect().width - parseFloat(f.style.width)) < 0.5; });
      const scroll = page.locator('[data-testid="page-scroll"]:visible');
      assert.equal(await page.getByRole('scrollbar').count(), 0, 'mobile Create has no visible scrollbar');
      assert.equal(await page.getByRole('button', { name: 'Choose from My Collection', exact: true }).count(), 0);
      await scroll.evaluate(n => { n.scrollTop = 0; });
      await settle();
      const size = await scroll.evaluate(n => ({ viewport: n.clientHeight, content: n.scrollHeight }));
      assert.ok(size.content <= size.viewport + 1, `full empty ${name} setup fits without scrolling`);
      await frame.screenshot({ path: path.join(out, `${name}-top.png`) });
      const bounds = await frame.boundingBox();
      for (const id of ['create-image-section', 'create-size-card', 'create-timer-card', 'create-rotation-card', 'create-ready-card']) {
        const box = await page.getByTestId(id).boundingBox();
        assert.ok(box.x >= bounds.x && box.x + box.width <= bounds.x + bounds.width, `${id} fits ${name}`);
        dimensions.push({ layout: name, id, width: box.width, height: box.height });
      }
      for (const control of await page.getByRole('radio').all()) {
        const box = await control.boundingBox();
        assert.ok(box.height >= 48 && box.width >= 48, 'timer targets are at least 48 points');
      }
      await scroll.evaluate(n => { n.scrollTop = n.scrollHeight; });
      await settle();
      await frame.screenshot({ path: path.join(out, `${name}-bottom.png`) });
      assert.ok(await page.getByRole('button', { name: 'Create Puzzle', exact: true }).isDisabled(), 'no fake game creation');
      assert.equal(await page.locator('[data-testid="bottom-tab-bar"]:visible').count(), 0, 'focused flow has no bottom tabs');
      await page.getByLabel('Create Puzzle review state', { exact: true }).selectOption('after');
      await page.getByRole('button', { name: 'Change image', exact: true }).waitFor();
      await settle();
      await scroll.evaluate(n => { n.scrollTop = 0; });
      await frame.screenshot({ path: path.join(out, `${name}-populated.png`) });
      const populatedSize = await scroll.evaluate(n => ({ viewport: n.clientHeight, content: n.scrollHeight }));
      assert.ok(populatedSize.content <= populatedSize.viewport + 1, `full populated ${name} setup fits without scrolling`);
      dimensions.push({ layout: name, populatedSize });
      const image = await page.getByRole('img', { name: 'Mountain lake sample', exact: true }).boundingBox();
      assert.ok(Math.abs(image.width / image.height - 1.5) < 0.01, 'sample image retains full 3:2 aspect');
      assert.ok(await page.getByRole('button', { name: 'Create Puzzle', exact: true }).isDisabled());
      await page.getByLabel('Create Puzzle review state', { exact: true }).selectOption('before');
      await page.getByRole('button', { name: 'Add Image', exact: true }).waitFor();
    }
    await page.getByLabel('Preview layout', { exact: true }).selectOption('0');
    // Both controls change the same valid pair, including boundaries.
    for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Decrease Rows', exact: true }).click();
    assert.ok(await page.getByRole('button', { name: 'Decrease Columns', exact: true }).isDisabled());
    await page.getByLabel('Rows: 2', { exact: true }).waitFor();
    await page.getByLabel('Columns: 3', { exact: true }).waitFor();
    for (let i = 0; i < 7; i++) await page.getByRole('button', { name: 'Increase Columns', exact: true }).click();
    await page.getByLabel('Rows: 16', { exact: true }).waitFor();
    await page.getByLabel('Columns: 24', { exact: true }).waitFor();
    assert.ok(await page.getByRole('button', { name: 'Increase Rows', exact: true }).isDisabled());
    for (const [pieces, rows, columns] of [[54,6,9],[96,8,12],[150,10,15],[216,12,18]]) {
      await page.getByRole('button', { name: `${pieces} pieces`, exact: true }).click();
      await page.getByLabel(`Rows: ${rows}`, { exact: true }).waitFor();
      await page.getByLabel(`Columns: ${columns}`, { exact: true }).waitFor();
    }
    for (const label of ['Stopwatch', 'None', 'Timer']) {
      await page.getByRole('radio', { name: label, exact: true }).click();
      assert.ok(await page.getByRole('radio', { name: label, exact: true }).isChecked());
      assert.equal(await page.getByRole('radio', { checked: true }).count(), 1);
    }
    await page.getByRole('radio', { name: 'None', exact: true }).focus();
    await page.keyboard.press('Space');
    assert.ok(await page.getByRole('radio', { name: 'None', exact: true }).isChecked(), 'None works with keyboard');
    await page.keyboard.press('ArrowLeft');
    assert.ok(await page.getByRole('radio', { name: 'Stopwatch', exact: true }).isChecked(), 'arrow navigation selects the previous mode');
    await page.keyboard.press('ArrowRight');
    assert.ok(await page.getByRole('radio', { name: 'None', exact: true }).isChecked());
    await page.getByRole('switch', { name: 'Rotate pieces' }).focus();
    await page.keyboard.press('Space');
    assert.ok(await page.getByRole('switch', { name: 'Rotate pieces' }).isChecked(), 'rotation works with keyboard');
    await page.getByRole('switch', { name: 'Rotate pieces' }).check();
    await page.getByRole('button', { name: 'Add Image', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByTestId('create-mobile-header').waitFor();
    assert.ok(await page.getByRole('radio', { name: 'None', exact: true }).isChecked(), 'source return keeps None');
    assert.ok(await page.getByRole('switch', { name: 'Rotate pieces' }).isChecked());
    await page.getByLabel('Rows: 12', { exact: true }).waitFor();
    await page.getByLabel('Create Puzzle review state', { exact: true }).selectOption('after');
    await page.getByLabel('Create Puzzle review state', { exact: true }).selectOption('before');
    await page.getByLabel('Rows: 12', { exact: true }).waitFor();
    assert.ok(await page.getByRole('radio', { name: 'None', exact: true }).isChecked(), 'review switching retains timer choice');
    assert.ok(await page.getByRole('switch', { name: 'Rotate pieces' }).isChecked(), 'review switching retains rotation');
    const savedPictures = await page.evaluate(() => new Promise((resolve, reject) => {
      const request = indexedDB.open('jigsaw-browser-preview');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const count = db.transaction('pictures').objectStore('pictures').count();
        count.onsuccess = () => { resolve(count.result); db.close(); };
        count.onerror = () => { reject(count.error); db.close(); };
      };
    }));
    assert.equal(savedPictures, 0, 'review samples never enter the collection');
    await page.locator('[data-testid="page-scroll"]:visible').evaluate(n => { n.scrollTop = n.scrollHeight; });
    await settle();
    await frame.screenshot({ path: path.join(out, 'iphone-none.png') });
    // Returning Home also preserves this in-progress setup, rather than applying defaults again.
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Add Puzzle', exact: true }).click();
    assert.ok(await page.getByRole('radio', { name: 'None', exact: true }).isChecked());
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ passed: true, dimensions, errors }, null, 2));
    console.log('PASS: mobile entry, default Timer, three modes/keyboard, linked grids/bounds/presets, rotation, draft retention, disabled creation, screenshots at 390/412.');
  } catch (error) {
    console.error('URL:', page.url(), 'browser errors:', errors);
    await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true });
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
