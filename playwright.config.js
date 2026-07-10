const { defineConfig } = require('@playwright/test');
const fs = require('fs');

// Cloud dev containers pre-install Chromium at a fixed path that may not match
// the revision this @playwright/test version expects; use it when present.
const containerChromium = '/opt/pw-browsers/chromium';

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
    ...(fs.existsSync(containerChromium)
      ? { launchOptions: { executablePath: containerChromium } }
      : {}),
  },
});
