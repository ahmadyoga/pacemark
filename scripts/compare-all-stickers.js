/**
 * compare-all-stickers.js
 * ──────────────────────────────────────────────────────────────────────────
 * For every sticker tile on the studio page:
 *   1. Screenshot the preview  (.tile-stage-inner > div  — the captureRef node)
 *   2. Click the "PNG" button and wait for the file to land in downloads-compare/
 *   3. Scale the downloaded PNG down to match the preview screenshot size
 *   4. Pixel-compare with pixelmatch and report similarity %
 *
 * Usage:  node scripts/compare-all-stickers.js
 * Output: reports/sticker-comparison/  — side-by-side PNGs + summary.json
 */

const fs        = require('fs');
const path      = require('path');
const puppeteer = require('puppeteer');
const { PNG }   = require('pngjs');
const _pm = require('pixelmatch');
const pixelmatch = typeof _pm === 'function' ? _pm : (_pm.default ?? _pm);

const STUDIO_URL    = 'http://localhost:3000/studio/18689236960';
const REPORT_DIR    = path.resolve(__dirname, '../reports/sticker-comparison');
const DOWNLOADS_DIR = path.resolve(__dirname, '../downloads-compare');
const E2E_SECRET    = 'local-e2e-dev';

// Download poll settings
const POLL_INTERVAL_MS = 200;
const DOWNLOAD_TIMEOUT_MS = 15000;

// ── helpers ─────────────────────────────────────────────────────────────────

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Wait until a NEW .png file appears in dir that wasn't there before snapshot.
 * Returns the full path of the new file, or null on timeout.
 */
async function waitForNewPng(dir, beforeSnapshot) {
  const deadline = Date.now() + DOWNLOAD_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const current = new Set(fs.readdirSync(dir).filter(f => f.endsWith('.png')));
    for (const f of current) {
      if (!beforeSnapshot.has(f)) {
        const full = path.join(dir, f);
        // Wait until the file isn't still being written (size stable)
        let size = -1;
        for (let i = 0; i < 10; i++) {
          await wait(150);
          const s = fs.statSync(full).size;
          if (s === size && s > 0) return full;
          size = s;
        }
        return full;
      }
    }
    await wait(POLL_INTERVAL_MS);
  }
  return null;
}

/**
 * Resize `src` PNG to exactly (targetW × targetH) using area-average (box) downscaling.
 * This is much closer to browser bilinear scaling than nearest-neighbour and avoids
 * the harsh pixel-grid differences that make font rendering look mis-matched.
 */
function resizePNG(src, targetW, targetH) {
  const dst = new PNG({ width: targetW, height: targetH });
  const scaleX = src.width  / targetW;
  const scaleY = src.height / targetH;
  for (let dy = 0; dy < targetH; dy++) {
    for (let dx = 0; dx < targetW; dx++) {
      const x0 = dx * scaleX, x1 = x0 + scaleX;
      const y0 = dy * scaleY, y1 = y0 + scaleY;
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let sy = Math.floor(y0); sy < Math.ceil(y1); sy++) {
        const wy = Math.min(sy + 1, y1) - Math.max(sy, y0);
        for (let sx = Math.floor(x0); sx < Math.ceil(x1); sx++) {
          const wx = Math.min(sx + 1, x1) - Math.max(sx, x0);
          const w  = wx * wy;
          const si = (Math.min(sy, src.height - 1) * src.width + Math.min(sx, src.width - 1)) * 4;
          r += src.data[si]     * w;
          g += src.data[si + 1] * w;
          b += src.data[si + 2] * w;
          a += src.data[si + 3] * w;
          n += w;
        }
      }
      const di = (dy * targetW + dx) * 4;
      dst.data[di]     = Math.round(r / n);
      dst.data[di + 1] = Math.round(g / n);
      dst.data[di + 2] = Math.round(b / n);
      dst.data[di + 3] = Math.round(a / n);
    }
  }
  return dst;
}

/**
 * Flatten a PNG (which may have transparent/semi-transparent pixels from the checker
 * preview background or the export's transparent bg) onto a solid colour so that
 * transparency differences don't count as pixel mismatches.
 */
function flattenPNG(src, bgR = 26, bgG = 26, bgB = 31) {
  const dst = new PNG({ width: src.width, height: src.height });
  for (let i = 0; i < src.width * src.height; i++) {
    const si = i * 4;
    const alpha = src.data[si + 3] / 255;
    dst.data[si]     = Math.round(src.data[si]     * alpha + bgR * (1 - alpha));
    dst.data[si + 1] = Math.round(src.data[si + 1] * alpha + bgG * (1 - alpha));
    dst.data[si + 2] = Math.round(src.data[si + 2] * alpha + bgB * (1 - alpha));
    dst.data[si + 3] = 255;
  }
  return dst;
}

/** Save a horizontal side-by-side of two equal-sized PNGs separated by a 4 px grey bar. */
function saveSideBySide(a, b, outPath) {
  const SEP = 4;
  const w = a.width + b.width + SEP;
  const h = Math.max(a.height, b.height);
  const out = new PNG({ width: w, height: h });
  out.data.fill(0x80); // mid-grey separator

  const copy = (src, offsetX) => {
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        const si = (y * src.width + x) * 4;
        const di = (y * w + x + offsetX) * 4;
        out.data[di]     = src.data[si];
        out.data[di + 1] = src.data[si + 1];
        out.data[di + 2] = src.data[si + 2];
        out.data[di + 3] = 255; // force opaque for side-by-side readability
      }
    }
  };
  copy(a, 0);
  copy(b, a.width + SEP);
  fs.writeFileSync(outPath, PNG.sync.write(out));
}

// ── main ────────────────────────────────────────────────────────────────────

async function run() {
  console.log('🔍  Pacemark — Sticker Preview vs. Export Comparison\n');

  // Clean / create output dirs
  [REPORT_DIR, DOWNLOADS_DIR].forEach(d => {
    if (fs.existsSync(d)) fs.rmSync(d, { recursive: true });
    fs.mkdirSync(d, { recursive: true });
  });

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      // Prevent the x-e2e-test header from triggering CORS preflight on
      // cross-origin requests (Google Fonts). Has no security impact in CI.
      '--disable-web-security',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900 });

  // Bypass auth middleware in E2E mode
  await page.setExtraHTTPHeaders({ 'x-e2e-test': E2E_SECRET });

  // Wire up download destination
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOADS_DIR,
  });

  // Capture JS console errors for debugging
  const jsErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') jsErrors.push(msg.text()); });
  page.on('pageerror', err => jsErrors.push(err.message));

  console.log(`🌐  Navigating to ${STUDIO_URL} …`);
  await page.goto(STUDIO_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  console.log(`   → title: "${await page.title()}"`);

  // Wait for React hydration + activity fetch
  await page.waitForSelector('.studio-grid', { timeout: 30000 });
  await wait(3000); // let fonts, SVGs and map routes finish rendering

  if (jsErrors.length) console.warn(`   ⚠  JS errors: ${jsErrors.join(' | ')}`);

  // Collect tile names in DOM order
  const tileNames = await page.evaluate(() =>
    [...document.querySelectorAll('.tile-name')].map(el => el.textContent.trim())
  );
  console.log(`📋  ${tileNames.length} sticker tiles: ${tileNames.join(', ')}\n`);

  const results = [];

  for (const name of tileNames) {
    process.stdout.write(`   [${name}] … `);

    // ── locate the tile ──────────────────────────────────────────────────
    const tileHandle = await page.evaluateHandle(n => {
      for (const t of document.querySelectorAll('.tile')) {
        const el = t.querySelector('.tile-name');
        if (el && el.textContent.trim() === n) return t;
      }
      return null;
    }, name);

    if (!tileHandle || !(await tileHandle.asElement())) {
      console.log('⚠️   tile not found — skip');
      results.push({ name, status: 'skip', reason: 'tile not found' });
      continue;
    }

    // Scroll the tile into view so Puppeteer can screenshot it reliably
    await tileHandle.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await wait(300);

    // ── 1. Screenshot the preview node ───────────────────────────────────
    // Capture the captureRef div directly: .tile-stage-inner > div
    // This is the exact node html2canvas will see (same node, same CSS cascade).
    // We screenshot it without the checker backdrop so we're comparing
    // sticker pixels only — identical to what the PNG export should contain.
    const previewNodeHandle = await tileHandle.evaluateHandle(tileEl => {
      const inner = tileEl.querySelector('.tile-stage-inner');
      return inner ? inner.firstElementChild : null;
    });

    if (!previewNodeHandle || !(await previewNodeHandle.asElement())) {
      console.log('⚠️   .tile-stage-inner > div not found — skip');
      results.push({ name, status: 'skip', reason: 'preview node missing' });
      continue;
    }

    const safeName    = name.replace(/[^a-z0-9]/gi, '_');
    const previewPath = path.join(REPORT_DIR, `${safeName}_preview.png`);

    await previewNodeHandle.asElement().screenshot({
      path: previewPath,
      omitBackground: true,   // transparent PNG — matches export intent
    });

    // ── 2. Click PNG button & wait for the downloaded file ───────────────
    const pngBtn = await tileHandle.$('.tile-btn-save');
    if (!pngBtn) {
      console.log('⚠️   PNG button not found — skip');
      results.push({ name, status: 'skip', reason: 'PNG button missing' });
      continue;
    }

    // Snapshot what's already in downloads dir before clicking
    const beforeSnapshot = new Set(
      fs.readdirSync(DOWNLOADS_DIR).filter(f => f.endsWith('.png'))
    );

    await pngBtn.click();

    const downloadedPath = await waitForNewPng(DOWNLOADS_DIR, beforeSnapshot);
    if (!downloadedPath) {
      console.log('⚠️   download timed out — skip');
      results.push({ name, status: 'skip', reason: 'download timeout' });
      continue;
    }

    // Copy to report dir with a predictable name for side-by-side
    const exportPath = path.join(REPORT_DIR, `${safeName}_export.png`);
    fs.copyFileSync(downloadedPath, exportPath);

    // ── 3. Pixel-compare ─────────────────────────────────────────────────
    const previewPng  = PNG.sync.read(fs.readFileSync(previewPath));
    const downloadPng = PNG.sync.read(fs.readFileSync(exportPath));

    // Scale the 4× hi-res export down to the preview screenshot's pixel dimensions
    const scaled = resizePNG(downloadPng, previewPng.width, previewPng.height);

    // Flatten both images onto a solid dark background (#1a1a1f) before comparing.
    // The preview screenshot has the checker grid showing through transparent areas;
    // the export PNG is fully transparent outside the sticker. Flattening both onto
    // the same solid colour makes transparency differences invisible to pixelmatch,
    // so only actual content differences count.
    const flatPreview = flattenPNG(previewPng);
    const flatScaled  = flattenPNG(scaled);

    const diffPng  = new PNG({ width: previewPng.width, height: previewPng.height });
    const mismatch = pixelmatch(
      flatPreview.data, flatScaled.data, diffPng.data,
      previewPng.width, previewPng.height,
      { threshold: 0.20 }   // absorbs sub-pixel font-hinting differences between
                            // Puppeteer native screenshot and html2canvas render
    );

    // Save diff image
    const diffPath = path.join(REPORT_DIR, `${safeName}_diff.png`);
    fs.writeFileSync(diffPath, PNG.sync.write(diffPng));

    // Save side-by-side (flattened, so they look the same on any background)
    const sbsPath = path.join(REPORT_DIR, `${safeName}_compare.png`);
    saveSideBySide(flatPreview, flatScaled, sbsPath);

    const totalPx    = previewPng.width * previewPng.height;
    const similarity = (((totalPx - mismatch) / totalPx) * 100).toFixed(1);
    const passed     = parseFloat(similarity) >= 90;

    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}  (${similarity}% similar)`);
    results.push({ name, status, similarity: similarity + '%', mismatch, totalPx });
  }

  await browser.close();

  // ── summary ─────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  Sticker Comparison Summary');
  console.log('══════════════════════════════════════════════════════');
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`  ${pad('Name', 22)} ${pad('Status', 12)} Similarity`);
  console.log('  ' + '─'.repeat(50));
  for (const r of results) {
    console.log(`  ${pad(r.name, 22)} ${pad(r.status, 12)} ${r.similarity || r.reason || ''}`);
  }

  const passes = results.filter(r => String(r.status).includes('PASS')).length;
  const fails  = results.filter(r => String(r.status).includes('FAIL')).length;
  const skips  = results.filter(r => r.status === 'skip').length;
  console.log(`\n  Total: ${results.length}   ✅ ${passes} pass   ❌ ${fails} fail   ⚠️  ${skips} skip`);

  const reportPath = path.join(REPORT_DIR, 'summary.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📁  Side-by-side PNGs + diff + summary saved to:\n    ${REPORT_DIR}\n`);

  process.exit(fails > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
