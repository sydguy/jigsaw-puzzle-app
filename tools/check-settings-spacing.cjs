const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({ channel: 'msedge', headless: true });
 const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
 const out = '.cache/settings-spacing'; fs.mkdirSync(out, { recursive: true });
 const errors = []; page.on('pageerror', e => errors.push(e.message));
 try {
  await page.goto('http://localhost:8081/settings', { waitUntil: 'networkidle', timeout: 120000 });
  for (const [layout, phone] of [['0', 'iphone'], ['1', 'android']]) {
   await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
   let signedInGeometry;
   for (const state of ['signed-in', 'guest']) {
    await page.getByLabel('Settings account review').selectOption(state);
    await page.waitForFunction(() => [...document.querySelectorAll('[data-testid="device-frame"] img')].every(n => n.complete && n.naturalWidth > 0));
    const panel = await page.getByTestId('mobile-settings-panel').boundingBox();
    const tabs = await page.getByTestId('bottom-tab-bar').boundingBox();
    const scroll = await page.getByTestId('page-scroll').evaluate(n => ({ content: n.scrollHeight, viewport: n.clientHeight }));
    await page.getByTestId('device-frame').screenshot({ path: `${out}/${phone}-${state}.png` });
    console.log(phone, state, { panelHeight: panel.height, bottomGap: tabs.y - panel.y - panel.height, scroll });
    assert(scroll.content <= scroll.viewport + 1, 'Settings does not need scrolling');
    const bottomGap = tabs.y - panel.y - panel.height;
    assert(bottomGap >= 2 && bottomGap <= 8, 'reference panel/tab gap');
    const action = page.getByRole('button', { name: state === 'guest' ? 'Sign In' : 'Sign Out', exact: true });
    const actionBox = await action.boundingBox(), preferences = await page.getByTestId('settings-play-preferences').boundingBox();
    assert(actionBox.y >= preferences.y + preferences.height + 10);
    const account = await page.getByRole('button', { name: 'Account', exact: true }).boundingBox();
    assert(account.height >= 52, 'generous menu row');
    const footer = await page.getByTestId('settings-account-actions').boundingBox();
    const geometry = { preferences, account, footer, bottomPadding: panel.y + panel.height - footer.y - footer.height };
    if (state === 'signed-in') assert.equal(panel.y + panel.height - actionBox.y - actionBox.height, 14, 'Sign Out matches guest visible bottom inset');
    if (state === 'signed-in') signedInGeometry = geometry;
    else {
     assert.deepEqual(preferences, signedInGeometry.preferences, 'Play preferences position and size match guest exactly');
     assert.deepEqual(account, signedInGeometry.account, 'menu row spacing matches guest');
     const signUp = await page.getByRole('button', { name: 'Sign Up', exact: true }).boundingBox();
     assert.equal(actionBox.width, preferences.width, 'full-width Sign In matches preferences');
     assert(signUp.y >= actionBox.y + actionBox.height, 'sign-up prompt below Sign In');
     assert(Math.abs(signUp.x + signUp.width / 2 - panel.x - panel.width / 2) < 1, 'centered sign-up prompt');
     assert(signUp.height >= 48);
    }
   }
  }
  assert.deepEqual(errors, []); console.log('PASS: Settings spacing and no-scroll fit in both account states on both phones.');
 } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
