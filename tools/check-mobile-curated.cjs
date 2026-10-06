// Browser UI fixtures only; isolated profile and no catalogue/payment services.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = '.cache/curated-review';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('http://localhost:8081/create', { waitUntil: 'networkidle', timeout: 120000 });
    await page.getByRole('button', { name: 'Add Image', exact: true }).click();
    const measurements = [];
    for (const [layout, name] of [['0', 'iphone'], ['1', 'android']]) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
      await page.getByRole('button', { name: 'Photo Gallery', exact: true }).click();
      const originalTiles = await page.getByTestId('mobile-image-sources').boundingBox();
      await page.getByRole('button', { name: 'Curated Collections', exact: true }).click();
      await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
      const scroll = page.locator('[data-testid="page-scroll"]:visible');
      await scroll.evaluate(n => { n.scrollTop = 0; });
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const tiles = await page.getByTestId('mobile-image-sources').boundingBox();
      assert.equal(tiles.height, originalTiles.height, 'curated keeps approved option-panel height');
      assert.equal(tiles.height, 154);
      const heading = await page.getByTestId('curated-heading').boundingBox();
      const shop = await page.getByTestId('curated-shop').boundingBox();
      const boundary = await page.getByTestId('curated-scroll-boundary').boundingBox();
      const first = await page.getByTestId('curated-card-free').boundingBox();
      const overflowing = await scroll.evaluate(n => n.scrollHeight - n.clientHeight > 1);
      assert.equal(await page.locator('[data-testid^="curated-card-"]').count(), 7, 'seven review cards');
      assert.ok(overflowing, 'both phone layouts must exercise scrolling');
      const rail = overflowing ? await page.getByTestId('scrollbar-rail').boundingBox() : null;
      assert.ok(Math.abs(first.y - boundary.y) < 1, 'first card starts at clip boundary');
      assert.ok(Math.abs(first.x - heading.x) < 1 && Math.abs(first.width - heading.width) < 1, 'heading and cards align on both sides');
      const artwork = await page.getByRole('img', { name: 'Free Collection artwork', exact: true }).boundingBox();
      const inset = artwork.x - first.x;
      assert.ok(Math.abs(artwork.y - first.y - inset) < 1, 'image top padding matches left padding');
      assert.ok(Math.abs(first.y + first.height - artwork.y - artwork.height - inset) < 1, 'image bottom padding matches left padding');
      if (rail) {
        assert.ok(Math.abs(rail.y - boundary.y) < 1, 'rail starts exactly at first card boundary');
        assert.ok(Math.abs(rail.y + rail.height - boundary.y - boundary.height) < 1, 'rail ends at list boundary');
        assert.equal(rail.width, 6);
        assert.ok(rail.x >= first.x + first.width + 4, 'scrollbar has a separate gutter outside the cards');
      } else assert.equal(await page.getByRole('scrollbar').count(), 0, 'no scrollbar when every card fits');
      assert.ok(boundary.y >= heading.y + heading.height - 1);
      assert.ok(boundary.y + boundary.height < shop.y, 'list ends above fixed shop panel');
      const access = await page.getByRole('button', { name: 'Free: Free Collection', exact: true }).boundingBox();
      assert.ok(access.height >= 48, 'slim visible button retains a 48-point tap target');
      await page.getByTestId('device-frame').screenshot({ path: `${out}/${name}-top.png` });
      if (overflowing) {
        await page.getByRole('scrollbar').focus();
        await page.keyboard.press('End');
        await page.waitForFunction(node => node.scrollTop > 0, await scroll.elementHandle());
      }
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const afterHeading = await page.getByTestId('curated-heading').boundingBox();
      const afterShop = await page.getByTestId('curated-shop').boundingBox();
      const afterTiles = await page.getByTestId('mobile-image-sources').boundingBox();
      assert.deepEqual(afterHeading, heading, 'heading stays fixed');
      assert.deepEqual(afterShop, shop, 'shop stays fixed');
      assert.deepEqual(afterTiles, tiles, 'source panel stays fixed');
      if (overflowing) assert.ok((await page.getByTestId('curated-card-free').boundingBox()).y < boundary.y, 'top card scrolls behind upper clipping boundary');
      const last = await page.getByTestId('curated-card-tropical').boundingBox();
      assert.ok(last.y + last.height <= boundary.y + boundary.height + 1, 'last card fully visible above shop');
      assert.equal(await page.getByTestId('curated-scroll-boundary').evaluate(n => getComputedStyle(n).overflow), 'hidden');
      await page.getByTestId('device-frame').screenshot({ path: `${out}/${name}-bottom.png` });
      measurements.push({ layout: name, optionsHeight: tiles.height, heading, boundary, shop, rail });
      await page.getByRole('button', { name: 'Buy Theme Packs', exact: true }).click();
      await page.getByRole('status').filter({ hasText: 'does not make purchases' }).waitFor();
      await page.getByRole('button', { name: 'Camera', exact: true }).click();
      await page.getByRole('button', { name: 'Open camera', exact: true }).waitFor();
    }
    // Fit-to-window must not make Android typography look smaller than iPhone.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole('button', { name: 'Curated Collections', exact: true }).click();
    const phoneScales = [];
    for (const [layout, name] of [['0', 'iphone'], ['1', 'android']]) {
      await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      phoneScales.push(await page.getByTestId('device-frame').evaluate(n => new DOMMatrix(getComputedStyle(n).transform).a));
      await page.getByTestId('device-frame').screenshot({ path: `${out}/${name}-fitted.png` });
    }
    assert.ok(phoneScales[0] < 1, 'test exercises a scaled-down preview');
    assert.equal(phoneScales[0], phoneScales[1], 'both phones use identical preview zoom');
    await page.getByLabel('Fit to window').uncheck();
    assert.equal(await page.getByTestId('device-frame').evaluate(n => new DOMMatrix(getComputedStyle(n).transform).a), 1, 'unfitted preview retains actual logical pixels');
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('radio', { name: 'Timer', exact: true }).waitFor();
    assert.deepEqual(errors, []);
    fs.writeFileSync(`${out}/results.json`, JSON.stringify({ passed: true, measurements, errors }, null, 2));
    console.log('PASS: curated phone screenshots, option height, list clipping, fixed heading/shop, scrollbar endpoints/keyboard, final-card visibility and source navigation.');
  } catch (error) { console.error(error); throw error; }
  finally { await browser.close(); }
})().catch(() => { process.exitCode = 1; });
