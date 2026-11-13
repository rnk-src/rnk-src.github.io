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
