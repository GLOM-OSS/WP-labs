const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const urlArg = process.argv[2];
const stack = process.argv[3];
if (!urlArg || !stack) {
  console.error('Usage: node screenshot-test.js <url> <stack-name>');
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(urlArg);
} catch (e) {
  console.error('Invalid URL: ' + urlArg);
  process.exit(1);
}

const rawSlug = decodeURIComponent(parsed.pathname).replace(/^\/+|\/+$/g, '');
if (rawSlug.includes('..')) {
  console.error('Refusing URL path containing ".."');
  process.exit(1);
}

const dir = path.join('/qa/artifacts', stack, rawSlug || 'home');
fs.mkdirSync(dir, { recursive: true });

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = now.getFullYear().toString() +
  pad(now.getMonth() + 1) + pad(now.getDate()) + '-' +
  pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());

const outPath = path.join(dir, timestamp + '.png');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(urlArg, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log('Screenshot saved to ' + outPath);
})();
