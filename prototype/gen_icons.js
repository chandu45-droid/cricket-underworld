// One-off: render icon.svg to icon-192.png / icon-512.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const svg = fs.readFileSync(path.join(__dirname, 'icon.svg'), 'utf8');
  for (const size of [192, 512]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(
      '<html><head><style>html,body{margin:0;padding:0;overflow:hidden}svg{display:block;width:' +
      size + 'px;height:' + size + 'px}</style></head><body>' + svg + '</body></html>'
    );
    await page.screenshot({ path: path.join(__dirname, `icon-${size}.png`) });
    await page.close();
  }
  await browser.close();
  console.log('icons generated');
})();
