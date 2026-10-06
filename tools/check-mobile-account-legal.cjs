const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({ channel: 'msedge', headless: true });
 const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
 const out = '.cache/mobile-account-legal'; fs.mkdirSync(out, { recursive: true });
 const errors = []; page.on('pageerror', e => errors.push(e.message));
 const button = name => page.getByRole('button', { name, exact: true });
 const capture = async name => {
  await page.waitForFunction(() => [...document.querySelectorAll('[data-testid="device-frame"] img')].every(n => n.complete && n.naturalWidth > 0));
  await page.getByTestId('device-frame').screenshot({ path: `${out}/${name}.png` });
 };
 try {
  await page.goto('http://localhost:8081/settings', { waitUntil: 'networkidle', timeout: 120000 });
  for (const [layout, phone] of [['0', 'iphone'], ['1', 'android']]) {
   await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
   await page.getByLabel('Settings account review').selectOption('guest');
   await button('Account').click();
   assert(await button('Save Changes').isDisabled());
   assert(await button('Delete My Account').isDisabled());
   assert.equal(await page.getByLabel('Full Name', { exact: true }).inputValue(), '');
   assert.equal(await page.getByTestId('bottom-tab-bar').count(), 0);
   await capture(`${phone}-account-guest`);
   await page.getByLabel('Settings account review').selectOption('signed-in');
   await capture(`${phone}-account`);
   const accountFit = await page.getByTestId('page-scroll').evaluate(n => n.scrollHeight <= n.clientHeight + 1 && n.scrollWidth <= n.clientWidth + 1);
   assert(accountFit, 'account default fits phone');
   const fullName = page.getByLabel('Full Name', { exact: true });
   const email = page.getByLabel('Email', { exact: true });
   await fullName.fill(''); await button('Save Changes').click();
   assert(await page.getByText('Enter your full name.', { exact: true }).isVisible());
   await fullName.fill('Sarah Johnson'); await email.fill('invalid'); await button('Save Changes').click();
   assert(await page.getByText('Enter a valid email address.', { exact: true }).isVisible());
   await email.fill('sarah@example.com'); await button('Save Changes').click();
   assert(await page.getByText(/Profile updated in this preview only/).isVisible());
   await button('Edit password').click();
   assert(await page.getByText(/No password was requested or changed/).isVisible());
   await button('Delete My Account').click();
   assert(await page.getByText(/No account, picture or puzzle was deleted/).isVisible());
   assert.equal(await fullName.inputValue(), 'Sarah Johnson');
   await button('Back').click();
   await button('Privacy & Legal').click();
   assert.equal(await page.getByTestId('bottom-tab-bar').count(), 0);
   const analytics = page.getByRole('switch', { name: 'Analytics', exact: true });
   const marketing = page.getByRole('switch', { name: 'Marketing', exact: true });
   assert.equal(await analytics.getAttribute('aria-checked'), 'false');
   assert.equal(await marketing.getAttribute('aria-checked'), 'false');
   await capture(`${phone}-legal`);
   await analytics.click(); assert.equal(await analytics.getAttribute('aria-checked'), 'true');
   await analytics.focus(); await page.keyboard.press('Space');
   assert.equal(await analytics.getAttribute('aria-checked'), 'false');
   for (const name of ['Terms & Conditions', 'Privacy Policy', 'Cookie Policy']) {
    await button(name).click(); assert(await page.getByText(`${name} is not published yet.`, { exact: false }).isVisible());
   }
   const dimensions = await page.getByTestId('page-scroll').evaluate(n => ({ content: n.scrollHeight, viewport: n.clientHeight, width: n.scrollWidth, visibleWidth: n.clientWidth }));
   assert(dimensions.content <= dimensions.viewport + 1, 'legal default fits phone');
   assert(dimensions.width <= dimensions.visibleWidth + 1, 'no horizontal overflow');
   console.log(phone, dimensions);
   await button('Back').click();
  }
  for (const layout of ['2', '3']) {
   await page.getByLabel('Preview layout', { exact: true }).selectOption(layout);
   await capture(`tablet-${layout}-settings`);
  }
  assert.deepEqual(errors, []);
  console.log('PASS: Account validation, preview-only actions, privacy defaults/switches, navigation, phone captures and tablet captures.');
 } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
