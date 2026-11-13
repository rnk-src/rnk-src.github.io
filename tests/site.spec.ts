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

test('shows all six projects in resume order', async ({ page }) => {
  await page.goto('/');
  const titles = await page.locator('article h3').allTextContents();
  expect(titles).toEqual([
    'Beverage Disposal Arm',
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
  expect(hrefs.length + soon).toBe(6);
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

test('each project has a media slot: one demo video, three images, two placeholders', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('section.showcase')).toHaveCount(6);
  await expect(page.getByText('Demo coming soon')).toHaveCount(2);
  const video = page.locator('a[data-youtube]');
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute('href', /ugVnFpN2Pz0/);
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
  const imgs = page.locator('.media img');
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

test('two decorative penguins flank the play button', async ({ page }) => {
  await page.goto('/');
  const pals = page.locator('a[data-youtube] .pal svg.penguin');
  await expect(pals).toHaveCount(2);
  await expect(page.locator('a[data-youtube] .pals')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
});
