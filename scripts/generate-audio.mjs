#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import process from 'node:process';

const ROOT = process.cwd();
const STORIES_FILE = path.join(ROOT, 'stories-data.js');
const PRONUNCIATIONS_FILE = path.join(ROOT, 'pronunciations-data.js');
const AUDIO_DIR = path.join(ROOT, 'audio');
const PREVIEW_DIR = path.join(AUDIO_DIR, 'previews');

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

async function loadWindowData(file, property) {
  const source = await fs.readFile(file, 'utf8');
  const sandbox = { window: {} };
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
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function storySpeechText(story, dictionary) {
  const blocks = [story.title, ...(story.text || [])];
  if (story.lookFor?.length) {
    blocks.push(`Когда будем на месте, обратите внимание. ${story.lookFor.join('. ')}.`);
  }
  return blocks.map(block => applyPronunciations(block, dictionary));
}

function buildSsml(story, dictionary, voice, rate) {
  const paragraphs = storySpeechText(story, dictionary)
    .map(paragraph => `<p>${escapeXml(paragraph)}</p>`)
    .join('<break time="650ms"/>');
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ru-RU"><voice name="${escapeXml(voice)}"><prosody rate="${escapeXml(rate)}">${paragraphs}</prosody></voice></speak>`;
}

async function synthesize({ ssml, outputFile, key, region }) {
  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const response = await fetch(endpoint, {
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
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, Buffer.from(await response.arrayBuffer()));
}

function replaceStoryAudio(source, storyId, audioPath) {
  const idPattern = new RegExp(`(id:\\s*['"]${storyId.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}['"][\\s\\S]*?audio:\\s*)(null|['"][^'"]*['"])`);
  if (!idPattern.test(source)) throw new Error(`Не удалось найти поле audio для истории ${storyId}`);
  return source.replace(idPattern, `$1'${audioPath}'`);
}

async function main() {
  await loadLocalEnv();
  const { source: originalStoriesSource, value: stories } = await loadWindowData(STORIES_FILE, 'CRETE_STORIES');
  const { value: pronunciations } = await loadWindowData(PRONUNCIATIONS_FILE, 'CRETE_PRONUNCIATIONS');

  const requestedStory = argValue('--story');
  const force = hasFlag('--force');
  const dryRun = hasFlag('--dry-run');
  const preview = hasFlag('--preview');
  const voiceOverride = argValue('--voice');

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  const defaultVoice = voiceOverride || process.env.AZURE_SPEECH_VOICE || 'ru-RU-DmitryNeural';
  const rate = process.env.AZURE_SPEECH_RATE || '-5%';

  if (!dryRun && (!key || !region)) {
    throw new Error('Создайте локальный .env с AZURE_SPEECH_KEY и AZURE_SPEECH_REGION. Ключ в GitHub не коммитим, потому что мы всё-таки стремимся не кормить интернет секретами.');
  }

  let selected = requestedStory ? stories.filter(story => story.id === requestedStory) : stories;
  if (!selected.length) throw new Error(`История ${requestedStory} не найдена`);

  const previewVoices = [
    'ru-RU-SvetlanaNeural',
    'ru-RU-DmitryNeural',
    'ru-RU-DariyaNeural'
  ];

  let storiesSource = originalStoriesSource;
  let totalCharacters = 0;

  for (const story of selected) {
    const speechBlocks = storySpeechText(story, pronunciations);
    totalCharacters += speechBlocks.join('\n').length;

    if (preview) {
      const excerptStory = {
        ...story,
        text: (story.text || []).slice(0, 2),
        lookFor: []
      };
      for (const voice of previewVoices) {
        const filename = `${story.id}-${voice.replace(/^ru-RU-/, '').replace(/Neural$/, '').toLowerCase()}.mp3`;
        const outputFile = path.join(PREVIEW_DIR, filename);
        console.log(`${dryRun ? '[dry-run] ' : ''}${story.id}: preview ${voice} -> ${path.relative(ROOT, outputFile)}`);
        if (!dryRun) await synthesize({ ssml: buildSsml(excerptStory, pronunciations, voice, rate), outputFile, key, region });
      }
      continue;
    }

    const audioPath = `audio/${story.id}.mp3`;
    const outputFile = path.join(ROOT, audioPath);
    let exists = false;
    try {
      await fs.access(outputFile);
      exists = true;
    } catch {}

    if (exists && !force) {
      console.log(`${story.id}: уже существует, пропуск. Для замены добавьте --force.`);
      if (story.audio !== audioPath) storiesSource = replaceStoryAudio(storiesSource, story.id, audioPath);
      continue;
    }

    console.log(`${dryRun ? '[dry-run] ' : ''}${story.id}: ${defaultVoice} -> ${audioPath}`);
    if (!dryRun) {
      await synthesize({ ssml: buildSsml(story, pronunciations, defaultVoice, rate), outputFile, key, region });
      storiesSource = replaceStoryAudio(storiesSource, story.id, audioPath);
    }
  }

  console.log(`Объём выбранного текста: примерно ${totalCharacters.toLocaleString('ru-RU')} символов.`);
  if (!dryRun && !preview && storiesSource !== originalStoriesSource) {
    await fs.writeFile(STORIES_FILE, storiesSource, 'utf8');
    console.log('stories-data.js обновлён путями к MP3.');
  }
}

main().catch(error => {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
});
