// Builds favicon.ico and apple-touch-icon.png from the public/favicon.svg sprite.
// Each sprite pixel becomes a whole-number block, so no new colours appear.
// The sprite's background colour fills the rest of the square.
// Usage: node scripts/build-favicons.ts [out-dir]   (default: public)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const outDir = process.argv[2] ?? 'public';
const svg = readFileSync('public/favicon.svg', 'utf8');

// Paint the sprite's <rect> elements in order onto a grid of hex colours.
const [, , w, h] = svg
  .match(/viewBox="([^"]+)"/)![1]
  .split(' ')
  .map(Number);
const sprite: string[][] = Array.from({ length: h }, () => Array(w).fill(''));
for (const [rect] of svg.matchAll(/<rect\b[^>]*>/g)) {
  const attr = (name: string, fallback: number) =>
    Number(rect.match(new RegExp(`\\s${name}="([^"]+)"`))?.[1] ?? fallback);
  const fill = rect.match(/fill="(#[0-9a-f]{6})"/i)![1].toLowerCase();
  const [x0, y0] = [attr('x', 0), attr('y', 0)];
  for (let y = y0; y < y0 + attr('height', h); y++)
    for (let x = x0; x < x0 + attr('width', w); x++) sprite[y][x] = fill;
}
const background = sprite[0][0];

// Scale by the largest whole number that fits, centred on a square.
function render(size: number): Buffer {
  const scale = Math.floor(size / Math.max(w, h));
  const left = Math.floor((size - w * scale) / 2);
  const top = Math.floor((size - h * scale) / 2);
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const sx = Math.floor((x - left) / scale);
      const sy = Math.floor((y - top) / scale);
      const hex =
        x >= left && y >= top && sx < w && sy < h ? sprite[sy][sx] : background;
      const i = (y * size + x) * 4;
      rgba.writeUIntBE(parseInt(hex.slice(1), 16), i, 3);
      rgba[i + 3] = 255;
    }
  return png(size, rgba);
}

// A minimal RGBA PNG: one IDAT, filter 0 on every row.
function png(size: number, rgba: Buffer): Buffer {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
    return n >>> 0;
  });
  const crc = (buf: Buffer) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc(body), body.length + 4);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA, no interlace
  const rows = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++)
    rgba.copy(rows, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// An ICO file that holds one PNG image.
function ico(size: number): Buffer {
  const image = render(size);
  const head = Buffer.alloc(22);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(1, 4); // one image
  head[6] = size;
  head[7] = size;
  head.writeUInt16LE(1, 10); // colour planes
  head.writeUInt16LE(32, 12); // bits per pixel
  head.writeUInt32LE(image.length, 14);
  head.writeUInt32LE(22, 18); // image offset
  return Buffer.concat([head, image]);
}

writeFileSync(join(outDir, 'favicon.ico'), ico(48));
writeFileSync(join(outDir, 'apple-touch-icon.png'), render(180));
console.log(
  `Wrote favicon.ico (48 px) and apple-touch-icon.png (180 px) to ${outDir}`,
);
