const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const filePath = path.resolve(__dirname, '..', 'prototype', 'index.html');
  await page.goto(`file://${filePath}`);
  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    const l = document.getElementById('loading');
    if (l) l.remove();
    const t = document.querySelector('.tut-overlay.show');
    if (t) t.classList.remove('show');
  });
  await page.waitForTimeout(500);

  // Full-page scrollable hub
  const hubScreen = await page.$('#hub-screen');
  if (hubScreen) {
    await hubScreen.screenshot({ path: path.join(__dirname, 'hub-full.png') });
    console.log('Captured: hub-full.png');
  }

  await browser.close();
})();
