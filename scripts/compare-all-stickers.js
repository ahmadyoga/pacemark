/**
 * compare-all-stickers.js
 * ──────────────────────────────────────────────────────────────────────────
 * For every sticker tile on the studio page:
 *   1. Screenshot the preview (tile-stage-inner)
 *   2. Screenshot the off-screen captureRef (what html2canvas will see)
 *   3. Scale the captureRef screenshot down to match preview size
 *   4. Pixel-compare with pixelmatch and report similarity %
 *
 * Usage:  node scripts/compare-all-stickers.js
 * Output: reports/sticker-comparison/   — side-by-side PNGs + summary.json
 */

const fs   = require('fs');
const path = require('path');
const puppeteer  = require('puppeteer');
const { PNG }    = require('pngjs');
const pixelmatch = require('pixelmatch');

const STUDIO_URL   = 'http://localhost:3000/studio/18614354583';
const REPORT_DIR   = path.resolve(__dirname, '../reports/sticker-comparison');
const DOWNLOADS_DIR = path.resolve(__dirname, '../downloads-compare');
const E2E_SECRET   = 'local-e2e-dev';

// Clean / create output dirs
[REPORT_DIR, DOWNLOADS_DIR].forEach(d => {
  if (fs.existsSync(d)) fs.rmSync(d, { recursive: true });
  fs.mkdirSync(d, { recursive: true });
});

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Resize `src` PNG to exactly (targetW × targetH) using nearest-neighbour. */
function resizePNG(src, targetW, targetH) {
  const dst = new PNG({ width: targetW, height: targetH });
  const scaleX = src.width  / targetW;
  const scaleY = src.height / targetH;
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const sx = Math.min(Math.floor(x * scaleX), src.width  - 1);
      const sy = Math.min(Math.floor(y * scaleY), src.height - 1);
      const si = (sy * src.width  + sx) * 4;
      const di = (y  * targetW   + x ) * 4;
      dst.data[di]     = src.data[si];
      dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2];
      dst.data[di + 3] = src.data[si + 3];
    }
  }
  return dst;
}

/** Save a horizontal side-by-side of two equal-sized PNGs. */
function saveSideBySide(a, b, outPath) {
  const w = a.width + b.width + 10;
  const h = Math.max(a.height, b.height);
  const out = new PNG({ width: w, height: h });
  // fill with mid-grey separator
  out.data.fill(0x88);

  const copy = (src, offsetX) => {
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        const si = (y * src.width  + x) * 4;
        const di = (y * w          + x + offsetX) * 4;
        out.data[di]     = src.data[si];
        out.data[di + 1] = src.data[si + 1];
        out.data[di + 2] = src.data[si + 2];
        out.data[di + 3] = 255; // force opaque so PNG shows correctly
      }
    }
  };
  copy(a, 0);
  copy(b, a.width + 10);
  fs.writeFileSync(outPath, PNG.sync.write(out));
}

async function run() {
  console.log('🔍  All-Sticker Preview vs. Export Comparison\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  // Send the bypass header on every request so middleware lets us through without a real session
  await page.setExtraHTTPHeaders({ 'x-e2e-test': E2E_SECRET });

  // Allow downloads into DOWNLOADS_DIR
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOADS_DIR,
  });

  console.log(`🌐  Navigating to ${STUDIO_URL} …`);
  await page.goto(STUDIO_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const actualUrl = page.url();
  const actualTitle = await page.title();
  console.log(`   → landed on: ${actualUrl} ("${actualTitle}")`);
  await page.waitForSelector('.studio-grid', { timeout: 30000 });
  await wait(2000); // let fonts / SVGs settle

  // Collect all tile names
  const tileNames = await page.evaluate(() =>
    [...document.querySelectorAll('.tile-name')].map(el => el.textContent.trim())
  );
  console.log(`📋  Found ${tileNames.length} sticker tiles: ${tileNames.join(', ')}\n`);

  const results = [];

  for (const name of tileNames) {
    process.stdout.write(`   [${name}] … `);

    // Find the tile element
    const tile = await page.evaluateHandle((n) => {
      const all = document.querySelectorAll('.tile');
      for (const t of all) {
        const nameEl = t.querySelector('.tile-name');
        if (nameEl && nameEl.textContent.trim() === n) return t;
      }
      return null;
    }, name);

    if (!tile || !(await tile.asElement())) {
      console.log('⚠️  tile element not found — skip');
      results.push({ name, status: 'skip', reason: 'element not found' });
      continue;
    }

    // 1. Screenshot the visible preview (tile-stage-inner)
    const previewEl = await tile.$('.tile-stage-inner');
    if (!previewEl) {
      console.log('⚠️  .tile-stage-inner not found — skip');
      results.push({ name, status: 'skip', reason: '.tile-stage-inner missing' });
      continue;
    }
    const previewPath = path.join(REPORT_DIR, `${name.replace(/[^a-z0-9]/gi, '_')}_preview.png`);
    await previewEl.screenshot({ path: previewPath, omitBackground: true });

    // 2. Screenshot the off-screen captureRef
    //    It's the first [aria-hidden=true] child → its first child div
    const captureHandle = await tile.evaluateHandle(() => {
      // tile > div[aria-hidden] > div (the captureRef)
      const tile = document.querySelector
        ? undefined // eslint
        : null;
      return null;
    });

    // Simpler: use page.$ on a known positional selector relative to the tile
    const captureEl = await tile.evaluateHandle(tileEl => {
      const ariaHidden = tileEl.querySelector('[aria-hidden="true"]');
      return ariaHidden ? ariaHidden.firstElementChild : null;
    });

    let capturePath = null;
    if (captureEl && await captureEl.asElement()) {
      capturePath = path.join(REPORT_DIR, `${name.replace(/[^a-z0-9]/gi, '_')}_export.png`);
      await captureEl.asElement().screenshot({
        path: capturePath,
        omitBackground: true,
      });
    }

    // 3. Pixel-compare
    let result = { name, status: 'ok', similarity: null, reason: null };

    if (!capturePath || !fs.existsSync(capturePath)) {
      result = { name, status: 'skip', reason: 'captureRef screenshot failed' };
      console.log('⚠️  captureRef screenshot failed — skip');
      results.push(result);
      continue;
    }

    const previewPng   = PNG.sync.read(fs.readFileSync(previewPath));
    const capturePng   = PNG.sync.read(fs.readFileSync(capturePath));

    // Scale capture down to preview size for comparison
    const scaled = resizePNG(capturePng, previewPng.width, previewPng.height);

    const diffPng  = new PNG({ width: previewPng.width, height: previewPng.height });
    const mismatch = pixelmatch(
      previewPng.data, scaled.data, diffPng.data,
      previewPng.width, previewPng.height,
      { threshold: 0.15 }  // generous threshold to account for sub-pixel rendering
    );

    const totalPx   = previewPng.width * previewPng.height;
    const similarity = (((totalPx - mismatch) / totalPx) * 100).toFixed(1);
    const passed     = parseFloat(similarity) >= 90;

    // Save side-by-side comparison
    const sbsPath = path.join(REPORT_DIR, `${name.replace(/[^a-z0-9]/gi, '_')}_compare.png`);
    saveSideBySide(previewPng, scaled, sbsPath);

    result.similarity = similarity + '%';
    result.status      = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${result.status}  (${similarity}% similar)`);
    results.push(result);
  }

  await browser.close();

  // Print summary table
  console.log('\n══════════════════════════════════════════════════');
  console.log('  Sticker Comparison Summary');
  console.log('══════════════════════════════════════════════════');
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`  ${pad('Name', 20)}  ${pad('Status', 10)}  Similarity`);
  console.log('  ' + '─'.repeat(46));
  for (const r of results) {
    console.log(`  ${pad(r.name, 20)}  ${pad(r.status, 10)}  ${r.similarity || r.reason || ''}`);
  }

  const passes = results.filter(r => r.status.includes('PASS')).length;
  const fails  = results.filter(r => r.status.includes('FAIL')).length;
  const skips  = results.filter(r => r.status === 'skip').length;
  console.log(`\n  Total: ${results.length}  ✅ ${passes} pass  ❌ ${fails} fail  ⚠️  ${skips} skip`);

  // Save JSON report
  const reportPath = path.join(REPORT_DIR, 'summary.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📁  Side-by-side PNGs + summary saved to: ${REPORT_DIR}`);

  process.exit(fails > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
