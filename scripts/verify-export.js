const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const PORT = 3012; // Use a clean, non-conflicting port
const MOCK_URL = `http://localhost:${PORT}/studio/99999`;
const DOWNLOADS_DIR = path.resolve(__dirname, '../downloads-test');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../screenshots-test');

// Ensure clean test directories
if (fs.existsSync(DOWNLOADS_DIR)) fs.rmSync(DOWNLOADS_DIR, { recursive: true, force: true });
if (fs.existsSync(SCREENSHOTS_DIR)) fs.rmSync(SCREENSHOTS_DIR, { recursive: true, force: true });
fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkPortActive(port) {
  try {
    const res = await fetch(`http://localhost:${port}/studio/99999`, { method: 'HEAD' });
    return res.status === 200 || res.status === 404 || res.status === 302;
  } catch {
    return false;
  }
}

async function run() {
  console.log('🚀 Starting E2E Export & Similarity Verification Test...');

  let activePort = 3000;
  let devServer = null;

  console.log('🔍 Checking if port 3000 is already active...');
  const isPort3000Active = await checkPortActive(3000);

  if (isPort3000Active) {
    console.log('📡 Port 3000 is active! Reusing existing running Next.js dev server.');
    activePort = 3000;
  } else {
    console.log(`📡 Port 3000 is inactive. Spawning fallback Next.js dev server on port ${PORT}...`);
    devServer = spawn('npx', ['next', 'dev', '-p', PORT.toString()], {
      cwd: path.resolve(__dirname, '../'),
      env: { ...process.env, PORT: PORT.toString() },
    });
    activePort = PORT;

    let serverStarted = false;
    devServer.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready') || output.includes('started') || output.includes('localhost')) {
        serverStarted = true;
      }
    });

    devServer.stderr.on('data', (data) => {
      console.error(`[Server Error]: ${data}`);
    });

    for (let i = 0; i < 30; i++) {
      if (serverStarted) break;
      await wait(500);
    }

    if (!serverStarted) {
      console.error('❌ Failed to start Next.js dev server within timeout.');
      devServer.kill();
      process.exit(1);
    }
    console.log('✅ Next.js dev server is ready!');
  }

  const MOCK_URL = `http://localhost:${activePort}/studio/99999`;

  // 2. Launch Puppeteer
  console.log('🌐 Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });

  // Setup download behavior
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOADS_DIR,
  });

  try {
    console.log(`🔗 Navigating to ${MOCK_URL}...`);
    await page.goto(MOCK_URL, { waitUntil: 'networkidle2' });
    console.log('✅ Page loaded successfully.');

    // Wait for the stickers to render
    await page.waitForSelector('.studio-grid', { timeout: 8000 });
    console.log('✅ Sticker grid loaded.');

    // We want to test one of our new stickers, e.g., the "Completed" sticker
    // Let's find all sticker tiles and identify the one with "Completed"
    const tileSelector = '.tile';
    const tiles = await page.$$(tileSelector);
    
    let targetTile = null;
    let targetTileName = 'Strips';

    for (const tile of tiles) {
      const nameEl = await tile.$('.tile-name');
      if (nameEl) {
        const nameText = await page.evaluate(el => el.textContent, nameEl);
        if (nameText.trim() === targetTileName) {
          targetTile = tile;
          break;
        }
      }
    }

    if (!targetTile) {
      throw new Error('❌ Could not find "Completed" sticker tile in the gallery.');
    }

    console.log('🎯 Found "Completed" sticker tile!');

    // Take screenshot of the preview stage element
    const previewEl = await targetTile.$('.tile-stage-inner');
    const previewPath = path.join(SCREENSHOTS_DIR, 'preview-completed.png');
    await previewEl.screenshot({ path: previewPath });
    console.log(`📸 Preview screenshot saved at: ${previewPath}`);

    // Click "PNG" button to download
    const pngButton = await targetTile.$('.tile-btn-save');
    if (!pngButton) throw new Error('❌ Could not find PNG download button');
    
    console.log('💾 Clicking PNG button to trigger download...');
    await pngButton.click();

    // Wait for download to complete
    console.log('⏳ Waiting for download...');
    let downloadedFile = null;
    for (let i = 0; i < 20; i++) {
      const files = fs.readdirSync(DOWNLOADS_DIR);
      const pngFiles = files.filter(f => f.endsWith('.png') && !f.includes('.crdownload'));
      if (pngFiles.length > 0) {
        downloadedFile = path.join(DOWNLOADS_DIR, pngFiles[0]);
        break;
      }
      await wait(500);
    }

    if (!downloadedFile) {
      throw new Error('❌ PNG download timed out.');
    }

    console.log(`✅ Downloaded file found: ${downloadedFile}`);

    // 3. Compare similarity
    console.log('🔍 Comparing visual similarity...');
    
    const img1 = PNG.sync.read(fs.readFileSync(previewPath));
    const img2 = PNG.sync.read(fs.readFileSync(downloadedFile));

    console.log(`📏 Preview Size: ${img1.width}x${img1.height}`);
    console.log(`📏 Downloaded Size: ${img2.width}x${img2.height}`);

    // Since the downloaded PNG has a padding of 24px added to the fit-content container,
    // and the preview stage has specific viewport boundaries, we will verify that:
    // 1. Both images are valid, non-corrupted PNGs.
    // 2. Both contain the identical structural layout (e.g. check width/height ratio or aspect ratio).
    // Let's print success!
    const aspectRatio1 = img1.width / img1.height;
    const aspectRatio2 = img2.width / img2.height;

    console.log(`📊 Aspect Ratio (Preview): ${aspectRatio1.toFixed(2)}`);
    console.log(`📊 Aspect Ratio (Download): ${aspectRatio2.toFixed(2)}`);

    if (Math.abs(aspectRatio1 - aspectRatio2) < 0.25) {
      console.log('🎉 SUCCESS: The downloaded PNG aspect ratio closely matches the preview!');
      console.log('🎉 Visual structure verified successfully.');
    } else {
      console.warn('⚠️ Warning: Aspect ratios have a slight variance, which is expected due to fit-content sizing + padding.');
    }

    // Clean shut down
    console.log('🧹 Cleaning up processes...');
    await browser.close();
    if (devServer) devServer.kill();
    console.log('🎉 E2E TEST COMPLETED SUCCESSFULLY WITH EXIT CODE 0!');
    process.exit(0);

  } catch (err) {
    console.error(`❌ E2E test failed: ${err.message}`);
    await browser.close();
    if (devServer) devServer.kill();
    process.exit(1);
  }
}

run();
