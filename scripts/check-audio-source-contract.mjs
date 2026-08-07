import fs from 'node:fs';
import vm from 'node:vm';

const storiesSource = fs.readFileSync('stories-data.js', 'utf8');
const generatorSource = fs.readFileSync('scripts/generate-audio.mjs', 'utf8');
const context = vm.createContext({ window: {} });
vm.runInContext(storiesSource, context, { filename: 'stories-data.js' });
const stories = context.window.CRETE_STORIES || [];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceStoryField(source, storyId, field, valuePattern, replacement) {
  const escapedStoryId = escapeRegExp(storyId);
  const pattern = new RegExp(`(["']?id["']?\\s*:\\s*["']${escapedStoryId}["'][\\s\\S]*?["']?${field}["']?\\s*:\\s*)(${valuePattern})`);
  if (!pattern.test(source)) throw new Error(`Cannot find ${field} for story ${storyId}`);
  return source.replace(pattern, `$1${replacement}`);
}

if (!stories.length) throw new Error('No stories were loaded');
const LATIN = /[A-Za-z]/;
function narrationStrings(story) {
  return [
    ['buttonLabel', story.buttonLabel],
    ['title', story.title],
    ...(story.text || []).map((value, index) => [`text[${index}]`, value]),
    ...(story.lookFor || []).map((value, index) => [`lookFor[${index}]`, value]),
    ...((story.narration?.blocks || []).map((value, index) => [`narration.blocks[${index}]`, value]))
  ];
}

for (const story of stories) {
  for (const [field, value] of narrationStrings(story)) {
    if (typeof value === 'string' && LATIN.test(value)) {
      throw new Error(`Latin letters in narratable field ${story.id}.${field}: ${value}`);
    }
  }
}

if (!generatorSource.includes('["\']?id["\']?')) {
  throw new Error('Audio generator does not support quoted story object keys');
}
if (!generatorSource.includes('CRETE_PHONEMES') || !generatorSource.includes('<phoneme alphabet=\"ipa\"')) {
  throw new Error('Audio generator does not support curated SSML phoneme overrides');
}

const sample = stories[0];
let updated = replaceStoryField(storiesSource, sample.id, 'audio', `null|["'][^"']*["']`, `'audio/contract-test.mp3'`);
updated = replaceStoryField(updated, sample.id, 'durationSeconds', 'null|\\d+', '123');
if (!updated.includes("'audio/contract-test.mp3'")) throw new Error('Audio field replacement did not apply');
if (!updated.includes('durationSeconds": 123') && !updated.includes('durationSeconds: 123')) {
  throw new Error('Duration field replacement did not apply');
}

for (const story of stories) {
  replaceStoryField(storiesSource, story.id, 'audio', `null|["'][^"']*["']`, `'audio/test.mp3'`);
  replaceStoryField(storiesSource, story.id, 'durationSeconds', 'null|\\d+', '1');
}

console.log(`Audio source update contract passed for ${stories.length} stories.`);
