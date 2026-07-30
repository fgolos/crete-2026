#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const sourceFile = path.join(ROOT, 'scripts', 'generate-audio.mjs');
const tempFile = path.join(ROOT, 'scripts', '.generate-extra-audio-runtime.mjs');

const source = await fs.readFile(sourceFile, 'utf8');
let patched = source.replace(
  "const STORIES_FILE = path.join(ROOT, 'stories-data.js');",
  "const STORIES_FILE = path.join(ROOT, 'stories-east-13-15.js');"
);

patched = patched.replace(
  "const { source: originalStoriesSource, value: stories } = await loadWindowData(STORIES_FILE, 'CRETE_STORIES');",
  `const loadedStories = await loadWindowData(STORIES_FILE, 'CRETE_STORIES');
  const stories = loadedStories.value;
  const originalStoriesSource = loadedStories.source
    .replace(
      "const story = ({ id, dayId, stopOrder, kind, buttonLabel, title, text, lookFor, sources }) => ({",
      "const story = ({ id, dayId, stopOrder, kind, buttonLabel, title, audio = null, durationSeconds = null, text, lookFor, sources }) => ({"
    )
    .replace("    audio: null,", "    audio,")
    .replace("    durationSeconds: null,", "    durationSeconds,");`
);

patched = patched.replace(
  /function replaceStoryAudio\([\s\S]*?\n}\n\nfunction replaceStoryDuration\([\s\S]*?\n}/,
  `function upsertStoryArgument(source, storyId, field, replacement) {
  const escapedStoryId = storyId.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
  const storyPattern = new RegExp(\`(story\\\\(\\\\{[\\\\s\\\\S]*?id:\\\\s*['\"]\${escapedStoryId}['\"][\\\\s\\\\S]*?)(\\\\n\\\\s*text:)\`);
  const match = source.match(storyPattern);
  if (!match) throw new Error(\`Не удалось найти историю \${storyId}\`);

  const fieldPattern = new RegExp(\`(\\\\b\${field}:\\\\s*)(null|\\\\d+|['\"][^'\"]*['\"])\`);
  if (fieldPattern.test(match[1])) {
    const updatedPrefix = match[1].replace(fieldPattern, \`$1\${replacement}\`);
    return source.replace(match[1], updatedPrefix);
  }

  return source.replace(storyPattern, \`$1\\n      \${field}: \${replacement},$2\`);
}

function replaceStoryAudio(source, storyId, audioPath) {
  return upsertStoryArgument(source, storyId, 'audio', \`'\${audioPath}'\`);
}

function replaceStoryDuration(source, storyId, durationSeconds) {
  return upsertStoryArgument(source, storyId, 'durationSeconds', String(durationSeconds));
}`
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
