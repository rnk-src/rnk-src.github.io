import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  readFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const script = resolve('scripts/sync-mortar-demo.sh');

// A fake repo and a fake npm. The fake `npm run build` makes dist only when asked.
function setup(buildMakesDist: boolean) {
  const dir = mkdtempSync(join(tmpdir(), 'sync-'));
  const src = join(dir, 'repo');
  const bin = join(dir, 'bin');
  const dest = join(dir, 'dest');
  mkdirSync(join(src, 'web'), { recursive: true });
  mkdirSync(bin);
  mkdirSync(dest);
  writeFileSync(join(dest, 'old.txt'), 'keep me');
  writeFileSync(
    join(bin, 'npm'),
    `#!/usr/bin/env bash\n${
      buildMakesDist
        ? '[ "$1" = run ] && mkdir -p dist && echo new > dist/index.html'
        : 'true'
    }\nexit 0\n`,
    { mode: 0o755 },
  );
  const run = () =>
    spawnSync('bash', [script, src], {
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, DEST: dest },
      encoding: 'utf8',
    });
  return { dest, run };
}

test('a build that makes no dist fails and keeps the committed demo', () => {
  const { dest, run } = setup(false);
  const result = run();
  expect(result.status).not.toBe(0);
  expect(readFileSync(join(dest, 'old.txt'), 'utf8')).toBe('keep me');
});

test('a good build replaces the committed demo', () => {
  const { dest, run } = setup(true);
  const result = run();
  expect(result.status).toBe(0);
  expect(existsSync(join(dest, 'old.txt'))).toBe(false);
  expect(readFileSync(join(dest, 'index.html'), 'utf8').trim()).toBe('new');
});
