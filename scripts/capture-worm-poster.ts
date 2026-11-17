// Recaptures the Navigating Worm card poster from the live demo in its card frame.
// Uses the running dev server, or starts one. Runs the demo at 8x to a fixed goal,
// and saves the frame at 2x pixel density once the worm has arrived.
// Run it again after any change to the worm demo's interface.
// Usage: node scripts/capture-worm-poster.ts
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

// Astro allows one dev server per project, on port 4321 by default.
const base = 'http://localhost:4321';
const up = () =>
  fetch(base).then(
    (r) => r.ok,
    () => false,
  );
const out = 'src/assets/projects/navigating-worm/poster.png';
// The goal, as a fraction of the map's width and height. Same goal as earlier posters.
const goal = { x: 0.615, y: 0.29 };

const server = (await up())
  ? null
  : spawn('npx', ['astro', 'dev'], { stdio: 'ignore', detached: true });
const stop = () => {
  if (server) process.kill(-server.pid!);
};

try {
  for (let i = 0; ; i++) {
    if (await up()) break;
    if (i === 60) throw new Error(`No dev server at ${base} after 30 s`);
    await new Promise((r) => setTimeout(r, 500));
  }

  // Software WebGL, as in playwright.config.ts.
  const browser = await chromium.launch({
    args: [
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
    ],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await page.goto(base);
  const card = page.locator('a.video[data-sim*="navigating-worm"]');
  await card.scrollIntoViewIfNeeded();
  await card.click();

  const frame = page.locator('iframe.sim-frame[src*="navigating-worm"]');
  const demo = frame.contentFrame();
  await demo
    .locator('#boot[data-state="ready"]')
    .waitFor({ state: 'attached', timeout: 120_000 });
  await demo.locator('#boot').waitFor({ state: 'hidden', timeout: 30_000 });

  const map = await demo.locator('#map').boundingBox();
  if (!map) throw new Error('The demo has no #map');
  await page.mouse.click(
    map.x + map.width * goal.x,
    map.y + map.height * goal.y,
  );
  await demo.locator('[data-speed="8"]').click();
  await demo
    .locator('#state-text')
    .filter({ hasText: 'Arrived' })
    .waitFor({ timeout: 180_000 });

  // Move the pointer off the frame so no button shows its hover state.
  await page.mouse.move(1, 1);
  await page.waitForTimeout(500);
  await frame.screenshot({ path: out });
  await browser.close();
  console.log(`Saved ${out}`);
} finally {
  stop();
}
