#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const storiesPath = path.join(root, 'stories-data.js');
const selfPath = path.join(root, 'scripts', 'sync-merged-audio-once.mjs');
const workflowPath = path.join(root, '.github', 'workflows', 'sync-merged-audio-once.yml');

function synchsafeInteger(buffer, offset) {
  return ((buffer[offset] & 0x7f) << 21)
    | ((buffer[offset + 1] & 0x7f) << 14)
    | ((buffer[offset + 2] & 0x7f) << 7)
    | (buffer[offset + 3] & 0x7f);
}

function mp3DurationSeconds(buffer) {
  let offset = 0;
  if (buffer.length >= 10 && buffer.toString('ascii', 0, 3) === 'ID3') {
    offset = 10 + synchsafeInteger(buffer, 6);
  }
  const bitrates = {
    '1-3': [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0],
    '2-3': [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0],
    '2.5-3': [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0]
  };
  const sampleRates = { 1: [44100,48000,32000], 2: [22050,24000,16000], 2.5: [11025,12000,8000] };
  let totalSamples = 0;
  let sampleRate = 0;
  let frames = 0;
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff || (buffer[offset + 1] & 0xe0) !== 0xe0) { offset += 1; continue; }
    const versionBits = (buffer[offset + 1] >> 3) & 0x03;
    const layerBits = (buffer[offset + 1] >> 1) & 0x03;
    const bitrateIndex = (buffer[offset + 2] >> 4) & 0x0f;
    const sampleRateIndex = (buffer[offset + 2] >> 2) & 0x03;
    const padding = (buffer[offset + 2] >> 1) & 0x01;
    const version = versionBits === 3 ? 1 : versionBits === 2 ? 2 : versionBits === 0 ? 2.5 : null;
    const layer = layerBits === 1 ? 3 : null;
    if (!version || !layer || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) { offset += 1; continue; }
    const bitrate = bitrates[`${version}-${layer}`][bitrateIndex] * 1000;
    sampleRate = sampleRates[version][sampleRateIndex];
    const frameLength = Math.floor((version === 1 ? 144 : 72) * bitrate / sampleRate + padding);
    if (!frameLength || offset + frameLength > buffer.length) break;
    totalSamples += version === 1 ? 1152 : 576;
    frames += 1;
    offset += frameLength;
  }
  if (!frames || !sampleRate) throw new Error('Не удалось определить длительность MP3');
  return Math.round(totalSamples / sampleRate);
}

function replaceField(source, storyId, field, valuePattern, replacement) {
  const escapedStoryId = storyId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(id:\\s*['"]${escapedStoryId}['"][\\s\\S]*?${field}:\\s*)(${valuePattern})`);
  if (!pattern.test(source)) throw new Error(`Не удалось найти ${field} для ${storyId}`);
  return source.replace(pattern, `$1${replacement}`);
}

let source = await fs.readFile(storiesPath, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: storiesPath });
const stories = sandbox.window.CRETE_STORIES || [];

let synced = 0;
for (const story of stories.filter(item => ['day13', 'day14', 'day15'].includes(item.dayId))) {
  const relativeAudio = `audio/${story.id}.mp3`;
  const audioPath = path.join(root, relativeAudio);
  try {
    const buffer = await fs.readFile(audioPath);
    const duration = mp3DurationSeconds(buffer);
    source = replaceField(source, story.id, 'audio', `null|['"][^'"]*['"]`, `'${relativeAudio}'`);
    source = replaceField(source, story.id, 'durationSeconds', 'null|\\d+', String(duration));
    synced += 1;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    source = replaceField(source, story.id, 'audio', `null|['"][^'"]*['"]`, 'null');
    source = replaceField(source, story.id, 'durationSeconds', 'null|\\d+', 'null');
  }
}

await fs.writeFile(storiesPath, source, 'utf8');
await fs.rm(selfPath, { force: true });
await fs.rm(workflowPath, { force: true });
console.log(`Synced ${synced} merged story audio files.`);
