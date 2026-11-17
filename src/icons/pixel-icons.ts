// Every single-colour pixel icon, drawn once as a text grid ('#' filled, '.' empty).
// The site and both demos draw these grids. Never hand-write icon path data:
// run `node scripts/pixel-icon.ts <name>` and paste the markup it prints.
// tests/pixel-icons.spec.ts checks each icon's stated symmetry and centring,
// and fails if a demo draws an icon that is not in this file.

export type Symmetry =
  | 'mirror-x' // same when flipped left to right
  | 'mirror-y' // same when flipped top to bottom
  | 'rot180' // same when rotated 180°
  | 'mirror-anti-diagonal'; // same when flipped across the top-right to bottom-left line

// How the test measures centring:
// 'box' the filled pixels' bounding box, 'weight' their mean position,
// 'holes' the bounding box of the empty pixels enclosed by the shape.
export type Centre = 'box' | 'weight' | 'holes';

export interface PixelIcon {
  rows: string[];
  symmetry: Symmetry[];
  centre: Centre;
}

export const icons = {
  // The GitHub mark: a ring around a cat head with two ears, open at the bottom.
  github: {
    symmetry: [],
    centre: 'box',
    rows: [
      '....########....',
      '..############..',
      '.##############.',
      '.###..####..###.',
      '###...####...###',
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '####........####',
      '.#####....#####.',
      '.##.##....#####.',
      '..##......####..',
      '...###....###...',
      '.....#....#.....',
    ],
  },
  // An envelope with a V flap.
  email: {
    symmetry: ['mirror-x'],
    centre: 'box',
    rows: [
      '................',
      '................',
      '................',
      '################',
      '#.##........##.#',
      '#..##......##..#',
      '#...##....##...#',
      '#....##..##....#',
      '#.....####.....#',
      '#..............#',
      '#..............#',
      '#..............#',
      '################',
      '................',
      '................',
      '................',
    ],
  },
  // The "in" mark cut out of a square. The letters are centred, not the square.
  linkedin: {
    symmetry: [],
    centre: 'holes',
    rows: [
      '.##############.',
      '################',
      '################',
      '################',
      '####.###########',
      '################',
      '####.#......####',
      '####.#.####.####',
      '####.#.####.####',
      '####.#.####.####',
      '####.#.####.####',
      '####.#.####.####',
      '################',
      '################',
      '################',
      '.##############.',
    ],
  },
  pause: {
    symmetry: ['mirror-x', 'mirror-y'],
    centre: 'box',
    rows: [
      '........',
      '.##..##.',
      '.##..##.',
      '.##..##.',
      '.##..##.',
      '.##..##.',
      '.##..##.',
      '........',
    ],
  },
  // A triangle reads as centred when its mean position is, not its bounding box.
  play: {
    symmetry: ['mirror-y'],
    centre: 'weight',
    rows: [
      '........',
      '...#....',
      '...##...',
      '...###..',
      '...###..',
      '...##...',
      '...#....',
      '........',
    ],
  },
  // A camera body with its lens. Follow cam.
  camera: {
    symmetry: ['mirror-x'],
    centre: 'box',
    rows: [
      '........',
      '..####..',
      '########',
      '###..###',
      '###..###',
      '########',
      '########',
      '........',
    ],
  },
  // Two sliders. Map settings.
  sliders: {
    symmetry: ['rot180'],
    centre: 'box',
    rows: [
      '........',
      '.##.....',
      '########',
      '.##.....',
      '.....##.',
      '########',
      '.....##.',
      '........',
    ],
  },
  // A two-headed diagonal arrow. Full screen.
  fullscreen: {
    symmetry: ['rot180', 'mirror-anti-diagonal'],
    centre: 'box',
    rows: [
      '.....###',
      '......##',
      '.....#.#',
      '....#...',
      '...#....',
      '#.#.....',
      '##......',
      '###.....',
    ],
  },
  // A one-headed diagonal arrow. Open in its own page.
  'open-page': {
    symmetry: ['mirror-anti-diagonal'],
    centre: 'box',
    rows: [
      '.....###',
      '......##',
      '.....#.#',
      '....#...',
      '...#....',
      '..#.....',
      '.#......',
      '#.......',
    ],
  },
  close: {
    symmetry: ['mirror-x', 'mirror-y'],
    centre: 'box',
    rows: [
      '........',
      '.#....#.',
      '..#..#..',
      '...##...',
      '...##...',
      '..#..#..',
      '.#....#.',
      '........',
    ],
  },
} satisfies Record<string, PixelIcon>;

export type IconName = keyof typeof icons;

// One "M x y h w v 1 H x z" rectangle per horizontal run of filled pixels.
export function toPath(rows: string[]): string {
  let d = '';
  rows.forEach((row, y) => {
    for (const m of row.matchAll(/#+/g))
      d += `M${m.index} ${y}h${m[0].length}v1H${m.index}z`;
  });
  return d;
}

// The markup for one icon, as the demos use it.
export function toSvg(name: IconName, className = 'ico'): string {
  const n = icons[name].rows.length;
  return `<svg class="${className}" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><path d="${toPath(icons[name].rows)}"/></svg>`;
}
