import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test('home page loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  expect(errors).toEqual([]);
});

test('no horizontal scroll at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390);
});

test('hero shows name, contact links and a decorative penguin', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Rounak Rai' }),
  ).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Contact', exact: true });
  await expect(nav.getByRole('link')).toHaveCount(3);
  await expect(page.locator('svg.penguin').first()).toHaveAttribute(
    'aria-hidden',
    'true',
  );
});

test('reduced motion stops the penguin blink and star twinkle', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const blink = await page
    .locator('.penguin-eye')
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(blink).toBe('none');
});

test('shows all seven projects in order', async ({ page }) => {
  await page.goto('/');
  const titles = await page.locator('article h3').allTextContents();
  expect(titles).toEqual([
    'Beverage Disposal Arm',
    'Navigating Worm',
    'Assisted Mortar and Pestle',
    'Background Cleaner',
    'Microcontroller Pong',
    'Interactive Gradient Descent',
    'Kingdom Builder',
  ]);
});

test('repo links point to GitHub and missing repos say so', async ({
  page,
}) => {
  await page.goto('/');
  const hrefs = await page
    .locator('a.repo')
    .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).href));
  for (const href of hrefs) expect(new URL(href).hostname).toBe('github.com');
  const soon = await page.getByText('Repo link coming soon').count();
  expect(hrefs.length + soon).toBe(7);
});

test('every card is readable and fits at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const card of await page.locator('article').all()) {
    const box = await card.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  }
});

test('contact links keep a text label and hide their pixel icons', async ({
  page,
}) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Contact', exact: true });
  for (const name of ['GitHub', 'LinkedIn', 'Email']) {
    await expect(nav.getByRole('link', { name })).toBeVisible();
  }
  await expect(nav.locator('svg.pixel-icon[aria-hidden="true"]')).toHaveCount(
    3,
  );
});

test('each project has a media slot: one video, two simulations, three images, one placeholder', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('section.showcase')).toHaveCount(7);
  await expect(page.getByText('Demo coming soon')).toHaveCount(1);
  await expect(page.locator('a[data-sim]')).toHaveCount(2);
  const video = page.locator('a[data-youtube]');
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute('href', /ugVnFpN2Pz0/);
  await expect(video.locator('img.thumb')).toHaveAttribute(
    'src',
    /i\.ytimg\.com\/vi\/ugVnFpN2Pz0\//,
  );
});

test('the demo video loads only after a click', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.locator('a[data-youtube]').click();
  const frame = page.locator('iframe.player');
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute(
    'src',
    /youtube-nocookie\.com\/embed\/ugVnFpN2Pz0/,
  );
});

test('card and media sit side by side on desktop and stack on mobile', async ({
  page,
}) => {
  // Measure layout without the scroll animation's transforms.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const first = page.locator('section.showcase').first();
  const card = await first.locator('article').boundingBox();
  const media = await first.locator('.media').boundingBox();
  expect(media!.x).toBeGreaterThan(card!.x + card!.width - 1);
  await page.setViewportSize({ width: 390, height: 844 });
  const card2 = await first.locator('article').boundingBox();
  const media2 = await first.locator('.media').boundingBox();
  expect(media2!.y).toBeGreaterThan(card2!.y + card2!.height - 1);
});

test('rows animate in on scroll and settle fully visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const row = page.locator('section.showcase').nth(3);
  const name = await row
    .locator('.card-side')
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe('rise');
  await row.scrollIntoViewIfNeeded();
  await row.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await expect
    .poll(() =>
      row.locator('.card-side').evaluate((el) => getComputedStyle(el).opacity),
    )
    .toBe('1');
  await expect
    .poll(() =>
      row.locator('.media-side').evaluate((el) => getComputedStyle(el).opacity),
    )
    .toBe('1');
});

test('reduced motion turns off the scroll animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const row = page.locator('section.showcase').nth(3);
  const name = await row
    .locator('.card-side')
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe('none');
  const opacity = await row
    .locator('.card-side')
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe('1');
});

test('link preview metadata and icons are present and resolve', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const og = await page
    .locator('meta[property="og:image"]')
    .getAttribute('content');
  expect(og).toBe('https://rnk-src.github.io/og.png');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  for (const path of [
    '/og.png',
    '/favicon.svg',
    '/favicon.ico',
    '/apple-touch-icon.png',
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test('planets are spread down the whole page and scroll with it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const planets = page.locator('.cosmos svg.planet');
  await expect(planets).toHaveCount(5);
  await expect(planets.first()).toHaveAttribute('aria-hidden', 'true');
  const docHeight = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  const tops = await planets.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().top + window.scrollY),
  );
  expect(Math.max(...tops) - Math.min(...tops)).toBeGreaterThan(
    docHeight * 0.5,
  );
  const before = await planets.first().boundingBox();
  await page.evaluate(() => window.scrollTo(0, 800));
  const after = await planets.first().boundingBox();
  expect(after!.y).toBeLessThan(before!.y - 400);
});

test('shooting stars live in the fixed sky', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.sky .shoot')).toHaveCount(4);
  expect(
    await page.locator('.sky').evaluate((el) => getComputedStyle(el).position),
  ).toBe('fixed');
});

test('shooting stars are hidden with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const display = await page
    .locator('.shoot')
    .first()
    .evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe('none');
});

test('axe finds no accessibility violations at desktop and phone width', async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    // Reveal every row so the scroll animation does not hide content from the scan.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`),
      `axe at ${width}px`,
    ).toEqual([]);
  }
});

test('demo images have alt text, fixed size, lazy loading and load', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const imgs = page.locator('.shots img');
  const count = await imgs.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const img = imgs.nth(i);
    await expect(img).toHaveAttribute('alt', /\S/);
    await expect(img).toHaveAttribute('width', /\d+/);
    await expect(img).toHaveAttribute('height', /\d+/);
    await expect(img).toHaveAttribute('loading', 'lazy');
    // A toggled-away image is hidden and never loads until it is selected.
    if (!(await img.isVisible())) continue;
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
});

test('demo images stay inside the frame with no horizontal scroll at 390px', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const media of await page.locator('.media:has(img)').all()) {
    const box = await media.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  }
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390);
});

test('a decorative penguin peeks out from behind a card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page
    .locator('section.showcase')
    .nth(2)
    .evaluate((el) => el.scrollIntoView({ block: 'center' }));
  const peek = page.locator('.peek.out');
  await expect(peek).toHaveCount(1, { timeout: 12_000 });
  await expect(peek).toHaveAttribute('aria-hidden', 'true');
  expect(
    await peek.evaluate((el) => getComputedStyle(el).zIndex),
    'sits behind the card',
  ).toBe('-1');
  expect(await peek.evaluate((el) => el.parentElement?.className)).toMatch(
    /card-side|media-side/,
  );
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(1440);
});

test('the peeking penguin stays away with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForTimeout(4000);
  await expect(page.locator('.peek')).toHaveCount(0);
});

// The guide chick waits for the page's own `sim-running` event, which ProjectMedia sends
// when the simulation starts. Most tests send it by hand so they need no network.
const startGuide = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    document
      .querySelector('a[data-sim*="mortar-pestle"]')!
      .dispatchEvent(new CustomEvent('sim-running', { bubbles: true })),
  );

test('a guide chick pops up when the simulation starts, waves bye and leaves', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('a[data-sim*="mortar-pestle"]').scrollIntoViewIfNeeded();
  await expect(page.locator('.guide')).toHaveCount(0);
  await startGuide(page);

  const guide = page.locator('.guide');
  await expect(guide).toHaveClass(/out/, { timeout: 4000 });
  await expect(guide).toHaveAttribute('aria-hidden', 'true');
  expect(await guide.evaluate((el) => el.parentElement?.className)).toMatch(
    /media-side/,
  );
  await expect(guide.locator('svg.penguin')).toHaveClass(/happy/);
  await expect(guide.locator('.bubble.on')).toContainText('My hand');
  await expect(guide.locator('.bubble.on')).toContainText('blue mortar');
  expect(
    await guide.evaluate((el) => getComputedStyle(el).zIndex),
    'the chick rises from behind the frame',
  ).toBe('-1');
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(1440);

  // A second bubble follows the first and covers the force keys and the unit.
  await expect(guide.locator('.bubble.on')).toContainText('arrow keys', {
    timeout: 10_000,
  });
  await expect(guide.locator('.bubble.on')).toContainText('newtons');
  await expect(guide.locator('.bubble.on')).toHaveCount(1);
  await expect(guide.locator('svg.penguin')).toHaveClass(/waving/, {
    timeout: 12_000,
  });
  await expect(guide.locator('.bubble.on')).toContainText('Bye');
  await expect(page.locator('.guide')).toHaveCount(0, { timeout: 8000 });
});

test('the happy face has two eyes on white, blushing cheeks and an open beak', async ({
  page,
}) => {
  await page.goto('/');
  const face = await page.evaluate(() => {
    const svg = document
      .querySelector<HTMLTemplateElement>('#sim-guide')!
      .content.querySelector('svg')!;
    const cell = new Map<string, string>();
    for (const r of svg.querySelectorAll('rect')) {
      if (r.closest('g')) continue; // flipper poses
      const x = Number(r.getAttribute('x'));
      const y = Number(r.getAttribute('y'));
      const w = Number(r.getAttribute('width'));
      for (let i = 0; i < w; i++)
        cell.set(`${x + i},${y}`, r.getAttribute('fill')!);
    }
    const count = (fill: string) =>
      [...cell.values()].filter((f) => f === fill).length;
    const touching: string[] = [];
    for (const [key, fill] of cell) {
      if (fill !== 'var(--pg-eye)') continue;
      const [x, y] = key.split(',').map(Number);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        if (cell.get(`${x + dx},${y + dy}`) === 'var(--pg-head)')
          touching.push(key);
      }
    }
    return {
      eyes: count('var(--pg-eye)'),
      blush: count('var(--accent)'),
      beak: count('var(--pg-beak)'),
      touching,
    };
  });
  expect(face.eyes, 'one pixel per eye').toBe(2);
  expect(face.blush, 'one cheek pixel per side').toBe(2);
  expect(face.beak, 'a beak two pixels wide and two tall').toBe(4);
  expect(face.touching, 'eyes never touch the dark head').toEqual([]);
});

test('the guide chick stays away with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await startGuide(page);
  await page.waitForTimeout(2500);
  await expect(page.locator('.guide')).toHaveCount(0);
});

test('the guide chick appears only once and keeps the page from scrolling sideways at 390px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await startGuide(page);
  await startGuide(page);
  await expect(page.locator('.guide')).toHaveCount(1, { timeout: 4000 });
  await expect(page.locator('.guide.out')).toHaveCount(1, { timeout: 4000 });
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390);
});

test('no other chick peeks out while the guide chick is on screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('a[data-sim*="mortar-pestle"]').scrollIntoViewIfNeeded();
  await startGuide(page);
  await expect(page.locator('.guide.out')).toHaveCount(1, { timeout: 4000 });
  await page.waitForTimeout(4000);
  await expect(page.locator('.peek')).toHaveCount(0);
});

test('the simulation shows live newtons beside the bars, even in a small frame', async ({
  page,
}) => {
  test.skip(!(await cdnReachable()), 'jsDelivr is not reachable');
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('a[data-sim*="mortar-pestle"]').click();
  const frame = page.frameLocator('iframe.sim-frame');
  await expect(frame.locator('body[data-state="running"]')).toBeAttached({
    timeout: 120_000,
  });
  // The frame is under 380 px tall, so the compact layout hides the text readout.
  const height = await page
    .locator('iframe.sim-frame')
    .evaluate((el) => el.clientHeight);
  expect(height).toBeLessThan(380);
  const newtons = /^\d+(\.\d)? N$/;
  await expect(frame.locator('#g-leader .val')).toBeVisible();
  await expect(frame.locator('#g-leader .val')).toHaveText(newtons);
  await expect(frame.locator('#g-follower .val')).toBeVisible();
  await expect(frame.locator('#g-follower .val')).toHaveText(newtons);
  // The push setting sits between the minus and plus buttons and follows the arrow keys.
  await expect(frame.locator('#force-val')).toHaveText('6 N');
  await page.keyboard.press('ArrowUp');
  await expect(frame.locator('#force-val')).toHaveText('7 N');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(frame.locator('#force-val')).toHaveText('5 N');
});

test('the real simulation starting sends the guide chick', async ({ page }) => {
  test.skip(!(await cdnReachable()), 'jsDelivr is not reachable');
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('a[data-sim*="mortar-pestle"]').click();
  await expect(
    page.frameLocator('iframe.sim-frame').locator('body[data-state="running"]'),
  ).toBeAttached({ timeout: 120_000 });
  await expect(page.locator('.guide')).toHaveCount(1, { timeout: 4000 });
});

test('the before/after slider can be set by hand and keeps its labels', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const box = page.locator('[data-compare]').first();
  await expect(box).toHaveAttribute('style', /--pos: 50%/);
  const input = box.locator('input[type="range"]');
  await input.fill('20');
  await expect(box).toHaveAttribute('style', /--pos: 20%/);
  await expect(input).toHaveAttribute('aria-label', /before and after/i);
});

test('the before/after slider sweeps by itself without reduced motion', async ({
  page,
}) => {
  await page.goto('/');
  const box = page.locator('[data-compare]').first();
  await box.scrollIntoViewIfNeeded();
  const first = await box.getAttribute('style');
  await expect
    .poll(async () => box.getAttribute('style'), { timeout: 5000 })
    .not.toBe(first);
});

test('switching between All removed and One removed keeps a working slider', async ({
  page,
}) => {
  await page.goto('/');
  const section = page.locator('section.showcase', {
    has: page.locator('[data-compare]'),
  });
  await section.scrollIntoViewIfNeeded();
  const shown = () =>
    page.locator('figure:not([hidden]) [data-compare]').first();
  for (let i = 0; i < 4; i++) {
    await page
      .getByRole('button', { name: i % 2 ? 'All removed' : 'One removed' })
      .click();
    const frame = await shown().boundingBox();
    expect(frame!.width).toBeGreaterThan(200);
    expect(frame!.height).toBeGreaterThan(100);
    // A freshly shown slider starts near the middle, not stuck at an edge.
    await expect
      .poll(async () => {
        const pos = parseFloat(
          (await shown().getAttribute('style'))!.match(/--pos: ([\d.]+)%/)![1],
        );
        return pos > 5 && pos < 95;
      })
      .toBe(true);
  }
});

test('the slider bar and grip stay inside the frame at both edges', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const box = page.locator('[data-compare]').first();
  await box.scrollIntoViewIfNeeded();
  for (const value of ['0', '100']) {
    await box.locator('input').fill(value);
    const frame = (await box.boundingBox())!;
    for (const part of ['.bar', '.grip']) {
      const r = (await box.locator(part).boundingBox())!;
      expect(r.x).toBeGreaterThanOrEqual(frame.x - 0.5);
      expect(r.x + r.width).toBeLessThanOrEqual(frame.x + frame.width + 0.5);
    }
  }
});

test('the simulation shows a poster and a play link and loads nothing heavy before a click', async ({
  page,
}) => {
  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const link = page.locator('a[data-sim*="mortar-pestle"]');
  await link.scrollIntoViewIfNeeded();
  await expect(link).toHaveAccessibleName(/Run the simulation in your browser/);
  await expect(link).toContainText('about 9 MB to download');
  await expect(link).toHaveAccessibleDescription(/yellow SO-101/);
  await expect(link).toHaveAttribute(
    'href',
    /\/demos\/mortar-pestle\/index\.html$/,
  );
  const poster = link.locator('img.poster');
  await expect
    .poll(() => poster.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.locator('iframe.sim-frame')).toHaveCount(0);
  expect(requested.filter((u) => /\/demos\/|jsdelivr|pyodide/.test(u))).toEqual(
    [],
  );
});

// The demo loads Python (Pyodide) from jsDelivr. Skip the tests that run it when offline.
async function cdnReachable() {
  try {
    const r = await fetch(
      'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js',
      { method: 'HEAD', signal: AbortSignal.timeout(5000) },
    );
    return r.ok;
  } catch {
    return false;
  }
}

test('clicking play runs the simulation in the page', async ({ page }) => {
  test.skip(!(await cdnReachable()), 'jsDelivr is not reachable');
  test.setTimeout(180_000);
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('a[data-sim*="mortar-pestle"]').click();

  const iframe = page.locator('iframe.sim-frame');
  await expect(iframe).toHaveCount(1);
  await expect(page.locator('a[data-sim*="mortar-pestle"]')).toHaveCount(0);
  const frame = page.frameLocator('iframe.sim-frame');
  await expect(frame.locator('body[data-state="running"]')).toBeAttached({
    timeout: 120_000,
  });
  const canvas = frame.locator('canvas#view');
  const box = await canvas.boundingBox();
  expect(box!.width).toBeGreaterThan(200);

  await expect(frame.getByRole('button', { name: 'Interpret' })).toBeVisible();
  expect(problems).toEqual([]);
});

test('the open simulation fits at 390px with no horizontal scroll', async ({
  page,
}) => {
  test.skip(!(await cdnReachable()), 'jsDelivr is not reachable');
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('a[data-sim*="mortar-pestle"]').click();
  const frame = page.frameLocator('iframe.sim-frame');
  await expect(frame.locator('body[data-state="running"]')).toBeAttached({
    timeout: 120_000,
  });
  const box = await page.locator('iframe.sim-frame').boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390);
});

test('the simulation frame is dark from the first moment, before the demo paints', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/demos/mortar-pestle/index.html', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<body><canvas id="view"></canvas></body>',
    }),
  );
  await page.goto('/');
  await page.locator('a[data-sim*="mortar-pestle"]').click();
  await expect(page.locator('iframe.sim-frame')).toHaveCSS(
    'background-color',
    'rgb(16, 20, 28)',
  );
});

test('when the demo page does not load, the play link comes back', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/demos/mortar-pestle/index.html', (route) =>
    route.fulfill({
      status: 404,
      contentType: 'text/html',
      body: '<body>Not found</body>',
    }),
  );
  await page.goto('/');
  await page.locator('a[data-sim*="mortar-pestle"]').click();
  await expect(page.locator('iframe.sim-frame')).toHaveCount(0);
  await expect(page.locator('a[data-sim*="mortar-pestle"]')).toBeVisible();
});

test('when the demo reports an error, the play link comes back', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/demos/mortar-pestle/index.html', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<body data-state="loading"><script>setTimeout(() => (document.body.dataset.state = "error"), 100)</script></body>',
    }),
  );
  await page.goto('/');
  await page.locator('a[data-sim*="mortar-pestle"]').click();
  await expect(page.locator('iframe.sim-frame')).toHaveCount(0);
  await expect(page.locator('a[data-sim*="mortar-pestle"]')).toBeVisible();
  await expect(page.locator('a[data-sim*="mortar-pestle"]')).toHaveAttribute(
    'href',
    /\/demos\/mortar-pestle\/index\.html$/,
  );
});

// The worm demo has its own page, so the project file names the elements the card watches.
const WORM_PAGE = '**/demos/navigating-worm/index.html';

test('the worm card shows a poster and a play link and loads nothing heavy before a click', async ({
  page,
}) => {
  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const link = page.locator('a[data-sim*="navigating-worm"]');
  await link.scrollIntoViewIfNeeded();
  await expect(link).toHaveAccessibleName(/Run the simulation in your browser/);
  await expect(link).toHaveAttribute(
    'href',
    /\/demos\/navigating-worm\/index\.html$/,
  );
  await expect(link).toHaveAccessibleDescription(/worm/i);
  await expect
    .poll(() =>
      link
        .locator('img.poster')
        .evaluate((el) => (el as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(page.locator('iframe.sim-frame')).toHaveCount(0);
  expect(requested.filter((u) => /\/demos\/|jsdelivr|pyodide/.test(u))).toEqual(
    [],
  );
});

test('when the worm demo reports a start-up error, the play link comes back', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(WORM_PAGE, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<body><section id="boot" data-state="loading"></section><script>setTimeout(() => (document.getElementById("boot").dataset.state = "error"), 100)</script></body>',
    }),
  );
  await page.goto('/');
  await page.locator('a[data-sim*="navigating-worm"]').click();
  await expect(page.locator('iframe.sim-frame')).toHaveCount(0);
  await expect(page.locator('a[data-sim*="navigating-worm"]')).toBeVisible();
});

test('a worm demo that starts keeps its frame and does not call the guide chick', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(WORM_PAGE, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<body><section id="boot" data-state="loading"></section><script>setTimeout(() => (document.getElementById("boot").dataset.state = "ready"), 100)</script></body>',
    }),
  );
  await page.goto('/');
  await page.locator('a[data-sim*="navigating-worm"]').scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    (window as unknown as { heard: number }).heard = 0;
    document.addEventListener(
      'sim-running',
      () => (window as unknown as { heard: number }).heard++,
    );
  });
  await page.locator('a[data-sim*="navigating-worm"]').click();
  await page.waitForTimeout(600);
  await expect(page.locator('iframe.sim-frame')).toHaveCount(1);
  expect(
    await page.evaluate(() => (window as unknown as { heard: number }).heard),
  ).toBe(0);
});

test('clicking play runs the real worm demo and a map click makes a route, at 390px', async ({
  page,
}) => {
  test.skip(!(await cdnReachable()), 'jsDelivr is not reachable');
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('a[data-sim*="navigating-worm"]').click();
  const frame = page.frameLocator('iframe.sim-frame');
  await expect(frame.locator('#boot[data-state="ready"]')).toBeAttached({
    timeout: 120_000,
  });
  await frame.locator('#map').click({ position: { x: 60, y: 60 } });
  await expect(frame.locator('#verdict')).toContainText(/Route|Can/, {
    timeout: 10_000,
  });
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390);
});
