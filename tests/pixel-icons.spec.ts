// Checks the shared pixel icon grids in src/icons/pixel-icons.ts.
// Each icon states its symmetry and how it is centred. These tests hold it to that,
// and check that the site and the synced demos draw exactly those grids.
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import {
  icons,
  toPath,
  type Centre,
  type Symmetry,
} from '../src/icons/pixel-icons';

type Grid = string[];

const at = (g: Grid, x: number, y: number) => g[y]?.[x] === '#';

// The cell each symmetry maps (x, y) to, on a square grid of side n.
const maps: Record<Symmetry, (x: number, y: number, n: number) => number[]> = {
  'mirror-x': (x, y, n) => [n - 1 - x, y],
  'mirror-y': (x, y, n) => [x, n - 1 - y],
  rot180: (x, y, n) => [n - 1 - x, n - 1 - y],
  'mirror-anti-diagonal': (x, y, n) => [n - 1 - y, n - 1 - x],
};

// Lists every filled cell whose partner under the symmetry is empty.
function symmetryErrors(g: Grid, s: Symmetry): string[] {
  const n = g.length;
  const errors: string[] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const [px, py] = maps[s](x, y, n);
      if (at(g, x, y) && !at(g, px, py))
        errors.push(`(${x},${y}) has no partner at (${px},${py})`);
    }
  return errors;
}

// Empty cells that the outside cannot reach, like the counters of the LinkedIn "in".
function holes(g: Grid): Grid {
  const n = g.length;
  const outside = new Set<string>();
  const stack: number[][] = [];
  for (let i = 0; i < n; i++)
    stack.push([i, 0], [i, n - 1], [0, i], [n - 1, i]);
  while (stack.length) {
    const [x, y] = stack.pop()!;
    const key = `${x},${y}`;
    if (x < 0 || y < 0 || x >= n || y >= n || outside.has(key) || at(g, x, y))
      continue;
    outside.add(key);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return g.map((row, y) =>
    [...row]
      .map((c, x) => (c === '.' && !outside.has(`${x},${y}`) ? '#' : '.'))
      .join(''),
  );
}

// How far the shape sits from the grid centre, in pixels, on each axis.
function offset(g: Grid, centre: Centre): { x: number; y: number } {
  const shape = centre === 'holes' ? holes(g) : g;
  const n = shape.length;
  const xs: number[] = [];
  const ys: number[] = [];
  shape.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c !== '#') return;
      xs.push(x);
      ys.push(y);
    }),
  );
  const mid = (n - 1) / 2;
  if (centre === 'weight') {
    const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
    return { x: mean(xs) - mid, y: mean(ys) - mid };
  }
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2 - mid,
    y: (Math.min(...ys) + Math.max(...ys)) / 2 - mid,
  };
}

// Off by at most half a pixel: the best an odd-sized shape can do on an even grid.
const centred = (g: Grid, centre: Centre) => {
  const o = offset(g, centre);
  return Math.abs(o.x) <= 0.5 && Math.abs(o.y) <= 0.5;
};

// Fills the grid cells inside an SVG path made of straight runs (M, H, V, h, v, z).
// Uses the nonzero rule, as the browser does, unless evenOdd is set.
function pathToGrid(d: string, n: number, evenOdd = false): Grid {
  const polys: number[][][] = [];
  let x = 0;
  let y = 0;
  let poly: number[][] = [];
  for (const [, cmd, args] of d.matchAll(/([MHVhvz])([^MHVhvz]*)/g)) {
    const v = args
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    if (cmd === 'M') {
      [x, y] = v;
      poly = [[x, y]];
      polys.push(poly);
    } else if (cmd === 'z') continue;
    else {
      if (cmd === 'H') x = v[0];
      if (cmd === 'V') y = v[0];
      if (cmd === 'h') x += v[0];
      if (cmd === 'v') y += v[0];
      poly.push([x, y]);
    }
  }
  const winding = (px: number, py: number, p: number[][]) => {
    let w = 0;
    for (let i = 0; i < p.length; i++) {
      const [x1, y1] = p[i];
      const [x2, y2] = p[(i + 1) % p.length];
      if (x1 !== x2) continue; // only vertical edges cross a horizontal ray
      if (x1 > px && Math.min(y1, y2) < py && py < Math.max(y1, y2))
        w += y2 > y1 ? 1 : -1;
    }
    return w;
  };
  const rows: Grid = [];
  for (let cy = 0; cy < n; cy++) {
    let row = '';
    for (let cx = 0; cx < n; cx++) {
      const ws = polys.map((p) => winding(cx + 0.5, cy + 0.5, p));
      const fill = evenOdd
        ? ws.reduce((a, w) => a + Math.abs(w), 0) % 2 === 1
        : ws.reduce((a, w) => a + w, 0) !== 0;
      row += fill ? '#' : '.';
    }
    rows.push(row);
  }
  return rows;
}

// Every <svg viewBox="0 0 n n"><path d="..."/></svg> icon in an HTML file, as grids.
function svgIcons(html: string): Grid[] {
  const found: Grid[] = [];
  for (const [svg] of html.matchAll(/<svg[^>]*>.*?<\/svg>/gs)) {
    const box = svg.match(/viewBox="0 0 (\d+) \1"/);
    const paths = [...svg.matchAll(/<path([^>]*?)d="([^"]+)"/g)];
    if (!box || paths.length !== 1) continue;
    found.push(
      pathToGrid(paths[0][2], Number(box[1]), /evenodd/.test(paths[0][1])),
    );
  }
  return found;
}

const show = (g: Grid) => '\n' + g.join('\n');

for (const [name, icon] of Object.entries(icons)) {
  test(`pixel icon "${name}" is a square grid of # and .`, () => {
    const n = icon.rows.length;
    for (const row of icon.rows)
      expect(row).toMatch(new RegExp(`^[#.]{${n}}$`));
  });

  for (const s of icon.symmetry)
    test(`pixel icon "${name}" keeps its ${s} symmetry`, () => {
      expect(symmetryErrors(icon.rows, s)).toEqual([]);
    });

  test(`pixel icon "${name}" is centred by ${icon.centre}`, () => {
    const o = offset(icon.rows, icon.centre);
    expect(centred(icon.rows, icon.centre), `off by ${o.x}, ${o.y}`).toBe(true);
  });

  test(`pixel icon "${name}" path draws its grid exactly`, () => {
    expect(show(pathToGrid(toPath(icon.rows), icon.rows.length))).toBe(
      show(icon.rows),
    );
  });
}

test('the checks catch the icon bugs fixed on 2026-11-17', () => {
  // Full-screen arrow with an extra pixel on its upper head.
  const arrow = pathToGrid(
    'M4 0h4v3H7V1H4zM0 5h1v2h2v1H0zM6 1h1v1H6zM5 2h1v1H5zM4 3h1v1H4zM3 4h1v1H3zM2 5h1v1H2zM1 6h1v1H1z',
    8,
  );
  expect(symmetryErrors(arrow, 'rot180')).not.toEqual([]);
  // Play triangle one pixel left of centre.
  expect(
    centred(pathToGrid('M2 1h1v6H2zM3 2h1v4H3zM4 3h1v2H4z', 8), 'weight'),
  ).toBe(false);
  // Map-settings sliders one row high.
  const sliders = pathToGrid('M0 1h8v1H0zM1 0h2v3H1zM0 5h8v1H0zM5 4h2v3H5z', 8);
  expect(symmetryErrors(sliders, 'rot180')).not.toEqual([]);
});

for (const demo of ['navigating-worm', 'mortar-pestle']) {
  test(`every ${demo} demo icon is a shared pixel icon`, () => {
    const html = readFileSync(`public/demos/${demo}/index.html`, 'utf8');
    const shared = new Set(Object.values(icons).map((i) => show(i.rows)));
    const drawn = svgIcons(html);
    expect(drawn.length).toBeGreaterThan(0);
    for (const g of drawn)
      expect(shared, 'drawn icon:' + show(g)).toContain(show(g));
  });
}

test('the contact links draw the shared pixel icons', async ({ page }) => {
  await page.goto('/');
  const svgs = await page.evaluate(() =>
    ['GitHub', 'LinkedIn', 'Email'].map(
      (label) =>
        [...document.querySelectorAll('a')]
          .find((a) => a.textContent?.trim() === label)!
          .querySelector('svg')!.outerHTML,
    ),
  );
  expect(svgs.map((s) => show(svgIcons(s)[0] ?? []))).toEqual(
    [icons.github, icons.linkedin, icons.email].map((i) => show(i.rows)),
  );
});
