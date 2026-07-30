#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const sourceFile = path.join(ROOT, 'scripts', 'generate-audio.mjs');
const tempFile = path.join(ROOT, 'scripts', '.generate-extra-audio-runtime.mjs');

const source = await fs.readFile(sourceFile, 'utf8');
const patched = source.replace(
  "const STORIES_FILE = path.join(ROOT, 'stories-data.js');",
  "const STORIES_FILE = path.join(ROOT, 'stories-east-13-15.js');"
);

if (patched === source) {
  throw new Error('Не удалось переключить генератор на stories-east-13-15.js');
}

await fs.writeFile(tempFile, patched, 'utf8');

try {
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [tempFile, ...process.argv.slice(2)], {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env
    });
    child.once('error', reject);
    child.once('exit', code => resolve(code ?? 1));
  });
  process.exitCode = exitCode;
} finally {
  await fs.rm(tempFile, { force: true });
}
