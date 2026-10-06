// Requires Playwright (or the workstation's bundled packages via NODE_PATH).
// Uses an isolated browser context; never touches the owner's browser collection.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const output = path.resolve(".cache/browser-check");
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", response => { if (response.status() >= 400) errors.push(response.status() + " " + response.url()); });
  try {
    await page.goto("http://localhost:8081", {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    await page.getByRole("heading", { name: "My Puzzles (0)" }).waitFor();
    await page
      .getByText("Loading your local collection…", { exact: true })
      .waitFor({ state: "hidden" });
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete),
    );
    await page.screenshot({
      path: path.join(output, "phone-home.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Add Puzzle", exact: true }).click();
    await page.getByRole("radio", { name: "None", exact: true }).click();
    await page.getByRole("button", { name: "216 pieces" }).click();
    assert.equal(
      await page.getByLabel("Rows: 12", { exact: true }).innerText(),
      "12",
    );
    assert.equal(
      await page.getByLabel("Columns: 18", { exact: true }).innerText(),
      "18",
    );
    await page.getByRole("switch", { name: "Rotate pieces" }).check();
    await page.getByRole("button", { name: "Add Image", exact: true }).click();
    await page.getByRole("button", { name: "Photo Gallery", exact: true }).click();
    const file = page.getByLabel("Choose photo file");
    await file.setInputFiles({
      name: "not-a-photo.png",
      mimeType: "image/png",
      buffer: Buffer.from('<svg onload="alert(1)"/>'),
    });
    await page
      .getByRole("alert")
      .filter({ hasText: "not a supported JPG or PNG" })
      .waitFor();
    const image = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#27763D";
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = "#F3BA43";
      ctx.fillRect(100, 60, 240, 200);
      return canvas.toDataURL("image/png").split(",")[1];
    });
    await file.setInputFiles({
      name: "Test landscape.png",
      mimeType: "image/png",
      buffer: Buffer.from(image, "base64"),
    });
    await page.getByRole("dialog", { name: "Crop your picture" }).waitFor();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    assert.equal(await page.getByRole("dialog", { name: "Crop your picture" }).count(), 0);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await page.getByLabel("Rows: 12", { exact: true }).waitFor();
    assert.equal(
      await page.getByRole("switch", { name: "Rotate pieces" }).isChecked(),
      true,
    );
    await page.getByRole("button", { name: "Add Image", exact: true }).click();
    await page.getByRole("button", { name: "Photo Gallery", exact: true }).click();
    await page
      .getByLabel("Choose photo file")
      .setInputFiles({
        name: "Test landscape.png",
        mimeType: "image/png",
        buffer: Buffer.from(image, "base64"),
      });
    await page.getByRole("dialog", { name: "Crop your picture" }).waitFor();
    await page.evaluate(() => {
      const original = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (...args) {
        IDBObjectStore.prototype.put = original;
        throw new DOMException("Test-only full storage", "QuotaExceededError");
      };
    });
    await page
      .getByRole("button", { name: "Done", exact: true })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Storage may be full or blocked" })
      .waitFor();
    await page.getByRole("dialog", { name: "Crop your picture" }).waitFor();
    await page
      .getByRole("button", { name: "Done", exact: true })
      .click();
    await page.getByRole("img", { name: "Test landscape.png" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Choose from My Collection", exact: true }).count(), 0, "removed shortcut stays absent with a saved picture");
    await page.getByLabel("Rows: 12", { exact: true }).waitFor();
    assert.ok(await page.getByRole("radio", { name: "None", exact: true }).isChecked(), "import preserves timer-off choice");
    await page.getByLabel("Columns: 18", { exact: true }).waitFor();
    const createScroll = page.locator('[data-testid="page-scroll"]:visible');
    await createScroll.evaluate(node => { node.scrollTop = 0; });
    await page.getByTestId("device-frame").screenshot({ path: path.join(output, "create-selected-image.png") });
    await createScroll.evaluate(node => { node.scrollTop = node.scrollHeight; });
    await page.getByTestId("device-frame").screenshot({ path: path.join(output, "create-selected-none.png") });
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await page.getByRole("tab", { name: "My Collection", exact: true }).click();
    await page.getByRole("button", { name: "Open Test landscape.png" }).click();
    await page
      .getByLabel("Picture title", { exact: true })
      .fill("Garden study");
    await page.getByRole("button", { name: "Save title" }).click();
    await page.getByText("Title saved.", { exact: true }).waitFor();
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForFunction(() => document.querySelector('input[aria-label="Picture title"]')?.value === "Garden study");
    assert.equal(
      await page.getByLabel("Picture title", { exact: true }).inputValue(),
      "Garden study",
    );
    await page
      .getByRole("button", { name: "Delete picture", exact: true })
      .click();
    await page.getByText(/0 associated puzzles/).waitFor();
    await page.getByRole("button", { name: "Cancel deletion" }).click();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await page.getByRole("button", { name: "Details", exact: true }).click();
    await page.getByText(/Times Used: 0/).waitFor();
    await page.getByLabel("Search collection").fill("no matches");
    await page.getByRole("heading", { name: "No matching pictures" }).waitFor();
    await page.getByRole("button", { name: "Clear search" }).click();
    await page.getByRole("button", { name: "Grid", exact: true }).click();
    for (const [layout, name, columns] of [
      ["0", "phone-collection", 3],
      ["1", "android-collection", 3],
      ["2", "tablet-portrait", 6],
      ["3", "tablet-landscape", 6],
    ]) {
      await page
        .getByLabel("Preview layout", { exact: true })
        .selectOption(layout);
      const grid = page.getByTestId("collection-grid");
      const sizes = await grid.evaluate((node) => ({
        grid: node.getBoundingClientRect().width,
        child: node.firstElementChild.getBoundingClientRect().width,
      }));
      assert.ok(Math.abs(sizes.child / sizes.grid - 1 / columns) < 0.005);
      await page.screenshot({
        path: path.join(output, name + ".png"),
        fullPage: true,
      });
    }
    await page.getByRole("tab", { name: "Settings", exact: true }).click();
    await page.getByRole("switch", { name: "Sound effects" }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('input[aria-label="Sound effects"]')?.checked ===
        false,
    );
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForFunction(() => document.querySelector('input[aria-label="Sound effects"]')?.checked === false);
    assert.equal(
      await page.getByRole("switch", { name: "Sound effects" }).isChecked(),
      false,
    );
    await page.getByLabel("Preview layout", { exact: true }).selectOption("0");
    await page.getByRole("button", { name: "Billing", exact: true }).click();
    assert.equal(
      await page.getByRole("tab", { name: "Home", exact: true }).count(),
      0,
    );
    await page.getByLabel("Preview layout", { exact: true }).selectOption("3");
    assert.equal(
      await page.getByRole("tab", { name: "Home", exact: true }).count(),
      1,
    );
    await page.getByRole("tab", { name: "My Collection", exact: true }).click();
    await page.getByRole("button", { name: "Open Garden study" }).click();
    await page
      .getByRole("button", { name: "Delete picture", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Delete picture permanently" })
      .click();
    await page
      .getByRole("heading", { name: "Make it your collection" })
      .waitFor();
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
    await page
      .getByRole("heading", { name: "Make it your collection" })
      .waitFor();
    await page.evaluate(
      () =>
        new Promise((resolve, reject) => {
          const request = indexedDB.open("jigsaw-browser-preview", 2);
          request.onupgradeneeded = () =>
            request.result.createObjectStore("future-data");
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            request.result.close();
            resolve();
          };
        }),
    );
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
    await page
      .getByRole("alert")
      .filter({ hasText: "newer version" })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () =>
          new Promise((resolve) => {
            const r = indexedDB.open("jigsaw-browser-preview");
            r.onsuccess = () => {
              const version = r.result.version;
              r.result.close();
              resolve(version);
            };
          }),
      ),
      2,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: navigation, four layouts, linked grids, draft retention, image rejection/cancellation/import, quota failure/retry, future-version preservation, rename/delete persistence, collection columns/search, preferences and Billing navigation.",
    );
  } catch (error) {
    await page.screenshot({
      path: path.join(output, "failure.png"),
      fullPage: true,
    });
    console.error("Browser page errors:", errors);
    throw error;
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
