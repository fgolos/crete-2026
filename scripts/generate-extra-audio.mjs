#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const ROOT = process.cwd();
const STORIES_FILE = path.join(ROOT, 'stories-east-13-15.js');
const PRONUNCIATIONS_FILE = path.join(ROOT, 'pronunciations-data.js');
const AUDIO_DIR = path.join(ROOT, 'audio');

const args = process.argv.slice(2);
const argValue = name => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const hasFlag = name => args.includes(name);

function parseEnv(text) {
  const result = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    result[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return result;
}

async function loadLocalEnv() {
  try {
    const text = await fs.readFile(path.join(ROOT, '.env'), 'utf8');
    const values = parseEnv(text);
    for (const [key, value] of Object.entries(values)) {
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function loadWindowData(file, property, initialWindow = {}) {
  const source = await fs.readFile(file, 'utf8');
  const sandbox = { window: { ...initialWindow } };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: file });
  const value = sandbox.window[property];
  if (!value) throw new Error(`В ${path.basename(file)} не найден window.${property}`);
  return { source, value };
}

function applyPronunciations(text, dictionary) {
  return Object.entries(dictionary)
    .sort(([a], [b]) => b.length - a.length)
    .reduce((result, [written, spoken]) => result.split(written).join(spoken), text);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSsml(story, dictionary, voice, rate) {
  const blocks = [story.title, ...(story.text || [])];
  if (story.lookFor?.length) blocks.push('На что посмотреть.', ...story.lookFor);
  const paragraphs = blocks
    .map(block => `<p>${escapeXml(applyPronunciations(block, dictionary))}</p>`)
    .join('<break time="500ms"/>');
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="ru-RU"><voice name="${escapeXml(voice)}"><mstts:express-as style="lively"><prosody rate="${escapeXml(rate)}" pitch="0%">${paragraphs}</prosody></mstts:express-as></voice></speak>`;
}

async function synthesize({ ssml, outputFile, key, region }) {
  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
      'User-Agent': 'crete-2026-audio-guide'
    },
    body: ssml
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Azure Speech ${response.status}: ${details || response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, buffer);
  return buffer;
}

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
  const sampleRates = {
    1: [44100,48000,32000],
    2: [22050,24000,16000],
    2.5: [11025,12000,8000]
  };

  let totalSamples = 0;
  let sampleRate = 0;
  let frames = 0;

  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff || (buffer[offset + 1] & 0xe0) !== 0xe0) {
      offset += 1;
      continue;
    }
    const versionBits = (buffer[offset + 1] >> 3) & 0x03;
    const layerBits = (buffer[offset + 1] >> 1) & 0x03;
    const bitrateIndex = (buffer[offset + 2] >> 4) & 0x0f;
    const sampleRateIndex = (buffer[offset + 2] >> 2) & 0x03;
    const padding = (buffer[offset + 2] >> 1) & 0x01;
    const version = versionBits === 3 ? 1 : versionBits === 2 ? 2 : versionBits === 0 ? 2.5 : null;
    const layer = layerBits === 1 ? 3 : null;
    if (!version || !layer || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) {
      offset += 1;
      continue;
    }
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

function ensureFactorySupportsGeneratedFields(source) {
  return source
    .replace(
      'const story = ({ id, dayId, stopOrder, kind, buttonLabel, title, text, lookFor, sources }) => ({',
      'const story = ({ id, dayId, stopOrder, kind, buttonLabel, title, audio = null, durationSeconds = null, text, lookFor, sources }) => ({'
    )
    .replace('    audio: null,', '    audio,')
    .replace('    durationSeconds: null,', '    durationSeconds,');
}

function upsertStoryField(source, storyId, field, value) {
  const escapedId = storyId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blockPattern = new RegExp(`(story\\(\\{[\\s\\S]*?id:\\s*['"]${escapedId}['"][\\s\\S]*?)(\\n\\s*text:)`);
  const match = source.match(blockPattern);
  if (!match) throw new Error(`Не удалось найти историю ${storyId}`);

  const fieldPattern = new RegExp(`(\\b${field}:\\s*)(null|\\d+|['"][^'"]*['"])`);
  let prefix = match[1];
  if (fieldPattern.test(prefix)) {
    prefix = prefix.replace(fieldPattern, `$1${value}`);
  } else {
    prefix += `\n      ${field}: ${value},`;
  }
  return source.replace(match[1], prefix);
}

async function main() {
  await loadLocalEnv();
  const { source: rawSource, value: stories } = await loadWindowData(STORIES_FILE, 'CRETE_STORIES', { CRETE_STORIES: [] });
  const { value: pronunciations } = await loadWindowData(PRONUNCIATIONS_FILE, 'CRETE_PRONUNCIATIONS');

  const requestedStory = argValue('--story');
  const force = hasFlag('--force');
  const dryRun = hasFlag('--dry-run');
  const selected = requestedStory ? stories.filter(story => story.id === requestedStory) : stories;
  if (!selected.length) throw new Error(`История ${requestedStory} не найдена`);

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  const voice = process.env.AZURE_SPEECH_VOICE || 'ru-RU-DmitryNeural';
  const rate = process.env.AZURE_SPEECH_RATE || '0%';
  if (!dryRun && (!key || !region)) throw new Error('В .env нужны AZURE_SPEECH_KEY и AZURE_SPEECH_REGION');

  let source = ensureFactorySupportsGeneratedFields(rawSource);

  for (const story of selected) {
    const audioPath = `audio/${story.id}.mp3`;
    const outputFile = path.join(ROOT, audioPath);
    console.log(`${story.id}: ${voice}, narration lively -> ${audioPath}`);
    if (dryRun) continue;

    let buffer;
    try {
      buffer = !force ? await fs.readFile(outputFile) : null;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (!buffer) {
      const ssml = buildSsml(story, pronunciations, voice, rate);
      buffer = await synthesize({ ssml, outputFile, key, region });
    }

    const durationSeconds = mp3DurationSeconds(buffer);
    source = upsertStoryField(source, story.id, 'audio', `'${audioPath}'`);
    source = upsertStoryField(source, story.id, 'durationSeconds', String(durationSeconds));
    console.log(`✓ ${story.id}: ${durationSeconds} сек`);
  }

  if (!dryRun) await fs.writeFile(STORIES_FILE, source, 'utf8');
}

main().catch(error => {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
});
