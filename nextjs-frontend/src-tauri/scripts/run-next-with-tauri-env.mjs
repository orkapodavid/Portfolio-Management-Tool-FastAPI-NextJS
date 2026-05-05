/* eslint-env node */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { buildSidecarBinary } from './build-sidecar.mjs';

const require = createRequire(import.meta.url);

const nextBin = require.resolve('next/dist/bin/next');
const mode = process.argv[2];

if (mode !== 'dev' && mode !== 'build') {
  console.error(`Unsupported mode: ${mode ?? '<missing>'}`);
  process.exit(1);
}

const args = [nextBin, mode, '--webpack'];
const env = {
  ...process.env,
  NEXT_PUBLIC_DESKTOP_TARGET:
    process.env.NEXT_PUBLIC_DESKTOP_TARGET ?? '1',
  NEXT_PUBLIC_DESKTOP_API_BASE_URL:
    process.env.NEXT_PUBLIC_DESKTOP_API_BASE_URL ?? 'http://127.0.0.1:18475',
};

if (mode === 'build') {
  env.TAURI_BUILD = process.env.TAURI_BUILD ?? '1';
}

buildSidecarBinary();

const result = spawnSync(process.execPath, args, {
  stdio: 'inherit',
  env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
