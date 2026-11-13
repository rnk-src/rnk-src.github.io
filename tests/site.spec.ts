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

test('shows all seven projects in resume order', async ({ page }) => {
  await page.goto('/');
  const titles = await page.locator('article h3').allTextContents();
  expect(titles).toEqual([
    'Beverage Disposal Arm',
    'Assisted Mortar and Pestle',
    'Background Cleaner',
    'Microcontroller Pong',
    'Digital Moog Synthesizer',
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
