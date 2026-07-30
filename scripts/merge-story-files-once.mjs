#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const mainPath = path.join(root, 'stories-data.js');
const extraPath = path.join(root, 'stories-east-13-15.js');
const indexPath = path.join(root, 'index.html');
const packagePath = path.join(root, 'package.json');
const workerPath = path.join(root, 'service-worker.js');
const extraGeneratorPath = path.join(root, 'scripts', 'generate-extra-audio.mjs');
const selfPath = path.join(root, 'scripts', 'merge-story-files-once.mjs');
const workflowPath = path.join(root, '.github', 'workflows', 'merge-story-files-once.yml');

const [mainSource, extraSourceRaw, indexSource, packageSource, workerSource] = await Promise.all([
  fs.readFile(mainPath, 'utf8'),
  fs.readFile(extraPath, 'utf8'),
  fs.readFile(indexPath, 'utf8'),
  fs.readFile(packagePath, 'utf8'),
  fs.readFile(workerPath, 'utf8')
]);

let extraSource = extraSourceRaw
  .replace(
    'const story = ({ id, dayId, stopOrder, kind, buttonLabel, title, text, lookFor, sources }) => ({',
    'const story = ({ id, dayId, stopOrder, kind, buttonLabel, title, audio = null, durationSeconds = null, text, lookFor, sources }) => ({'
  )
  .replace('    audio: null,', '    audio,')
  .replace('    durationSeconds: null,', '    durationSeconds,');

extraSource = extraSource.replace(
  /(title:\s*'[^'\n]*',\n)(\s*text:)/g,
  '$1      audio: null,\n      durationSeconds: null,\n$2'
);

const mergedSource = `${mainSource.trimEnd()}\n\n${extraSource.trim()}\n`;
await fs.writeFile(mainPath, mergedSource, 'utf8');

const updatedIndex = indexSource
  .split(/\r?\n/)
  .filter(line => !line.includes('stories-east-13-15.js'))
  .join('\n');
await fs.writeFile(indexPath, `${updatedIndex.trimEnd()}\n`, 'utf8');

const packageJson = JSON.parse(packageSource);
delete packageJson.scripts['audio:dry-run:extra'];
delete packageJson.scripts['audio:generate:extra'];
await fs.writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');

const updatedWorker = workerSource
  .replace("const CACHE_VERSION = 'crete-2026-v7';", "const CACHE_VERSION = 'crete-2026-v8';")
  .split(/\r?\n/)
  .filter(line => !line.includes('stories-east-13-15.js'))
  .join('\n');
await fs.writeFile(workerPath, `${updatedWorker.trimEnd()}\n`, 'utf8');

await Promise.all([
  fs.rm(extraPath, { force: true }),
  fs.rm(extraGeneratorPath, { force: true }),
  fs.rm(selfPath, { force: true }),
  fs.rm(workflowPath, { force: true })
]);

console.log('Merged all stories into stories-data.js and removed temporary split-file tooling.');
