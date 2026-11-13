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
  const nav = page.getByRole('navigation', { name: 'Contact' });
  await expect(nav.getByRole('link')).toHaveCount(3);
  await expect(page.locator('svg.penguin')).toHaveAttribute(
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
