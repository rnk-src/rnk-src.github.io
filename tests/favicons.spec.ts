// The PNG and ICO favicons must be the favicon.svg sprite, scaled by a whole number.
// A blurred scale adds in-between colours, so every pixel must use a sprite colour.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';

const outputs = [
  { file: 'favicon.ico', size: 48 },
  { file: 'apple-touch-icon.png', size: 180 },
];

test('the committed favicons match a fresh build from favicon.svg', () => {
  const out = mkdtempSync(join(tmpdir(), 'favicons-'));
  execFileSync('node', ['scripts/build-favicons.ts', out]);
  for (const { file } of outputs)
    expect(
      readFileSync(join(out, file)).equals(readFileSync(join('public', file))),
      `public/${file} is stale: run node scripts/build-favicons.ts`,
    ).toBe(true);
});

for (const { file, size } of outputs)
  test(`${file} uses only the sprite's colours`, async ({ page }) => {
    const svg = readFileSync('public/favicon.svg', 'utf8');
    const palette = [...new Set(svg.match(/#[0-9a-f]{6}/gi))].map((c) =>
      c.toLowerCase(),
    );
    await page.goto('/');
    const image = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colours = new Set<string>();
      for (let i = 0; i < data.length; i += 4)
        colours.add(
          '#' +
            [data[i], data[i + 1], data[i + 2]]
              .map((v) => v.toString(16).padStart(2, '0'))
              .join(''),
        );
      return {
        width: canvas.width,
        height: canvas.height,
        colours: [...colours],
      };
    }, `/${file}`);
    expect([image.width, image.height]).toEqual([size, size]);
    expect(image.colours.filter((c) => !palette.includes(c))).toEqual([]);
  });
