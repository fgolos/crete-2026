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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createPhonemeRenderer(dictionary) {
  const entries = Object.entries(dictionary || {})
    .filter(([written, ipa]) => written && ipa)
    .sort(([a], [b]) => b.length - a.length);
  if (!entries.length) return value => escapeXml(value);

  const lookup = new Map(entries.map(([written, ipa]) => [written.toLocaleLowerCase('ru-RU'), ipa]));
  const alternatives = entries.map(([written]) => escapeRegExp(written)).join('|');
  const matcher = new RegExp(`(?<![А-Яа-яЁё])(?:${alternatives})(?![А-Яа-яЁё])`, 'giu');

  return value => {
    const text = String(value);
    let result = '';
    let lastIndex = 0;
    for (const match of text.matchAll(matcher)) {
      const start = match.index ?? 0;
      result += escapeXml(text.slice(lastIndex, start));
      const written = match[0];
      const ipa = lookup.get(written.toLocaleLowerCase('ru-RU'));
      result += `<phoneme alphabet="ipa" ph="${escapeXml(ipa)}">${escapeXml(written)}</phoneme>`;
      lastIndex = start + written.length;
    }
    result += escapeXml(text.slice(lastIndex));
    return result;
  };
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function lookForSpeechBlocks(story) {
  if (!story.lookFor?.length) return [];
  return ['На что посмотреть.', ...story.lookFor];
}

function storySpeechText(story, dictionary) {
  const blocks = [story.title, ...(story.text || []), ...lookForSpeechBlocks(story)];
  return blocks.map(block => applyPronunciations(block, dictionary));
}

function narrationSpeechText(story, dictionary) {
  if (!story.narration?.blocks?.length) return null;
  const blocks = [...story.narration.blocks, ...lookForSpeechBlocks(story)];
  return blocks.map(block => applyPronunciations(block, dictionary));
}

function buildSsmlFromBlocks(blocks, {
  voice,
  rate = '0%',
  pitch = '0%',
  breakMs = 650,
  style = null,
  styleDegree = null,
  spokenLocale = null
}, phonemes = {}) {
  const renderSpeechXml = createPhonemeRenderer(phonemes);
  const paragraphs = blocks
    .map(paragraph => `<p>${renderSpeechXml(paragraph)}</p>`)
    .join(`<break time="${breakMs}ms"/>`);

  let content = `<prosody rate="${escapeXml(rate)}" pitch="${escapeXml(pitch)}">${paragraphs}</prosody>`;
  if (spokenLocale) content = `<lang xml:lang="${escapeXml(spokenLocale)}">${content}</lang>`;
  if (style) {
    const degreeAttribute = styleDegree == null ? '' : ` styledegree="${escapeXml(String(styleDegree))}"`;
    content = `<mstts:express-as style="${escapeXml(style)}"${degreeAttribute}>${content}</mstts:express-as>`;
  }

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="ru-RU"><voice name="${escapeXml(voice)}">${content}</voice></speak>`;
}

function buildStorySsml(story, dictionary, defaults) {
  const narration = story.narration;
  const blocks = narrationSpeechText(story, dictionary) || storySpeechText(story, dictionary);
  return {
    blocks,
    options: {
      voice: narration?.voice || defaults.voice,
      rate: narration?.rate || defaults.rate,
      pitch: narration?.pitch || '0%',
      breakMs: narration?.breakMs ?? 650
    },
    style: narration?.style || null
  };
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
  const audioBuffer = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, audioBuffer);
  return audioBuffer;
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

function replaceStoryField(source, storyId, field, valuePattern, replacement) {
  const escapedStoryId = storyId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(["']?id["']?\\s*:\\s*["']${escapedStoryId}["'][\\s\\S]*?["']?${field}["']?\\s*:\\s*)(${valuePattern})`);
  if (!pattern.test(source)) throw new Error(`Не удалось найти поле ${field} для истории ${storyId}`);
  return source.replace(pattern, `$1${replacement}`);
}

function replaceStoryAudio(source, storyId, audioPath) {
  return replaceStoryField(source, storyId, 'audio', `null|['"][^'"]*['"]`, `'${audioPath}'`);
}

function replaceStoryDuration(source, storyId, durationSeconds) {
  return replaceStoryField(source, storyId, 'durationSeconds', 'null|\\d+', String(durationSeconds));
}

const NARRATION_PREVIEWS = {
  mochlos: [
    { id: '01-original', label: 'исходный текст', blocks: story => [story.title, story.text?.[0] || '', story.text?.[1] || '', story.text?.[4] || ''] },
    { id: '02-conversational', label: 'разговорная подача', blocks: () => [
      'Mochlos: маленькая деревня напротив очень большого прошлого',
      'Mochlos сегодня кажется спокойной приморской деревней: несколько домов, таверны у воды и маленький остров совсем рядом. Но остров здесь не просто красивый фон для обеда. На нём находится археологический комплекс, и именно он объясняет, почему Mochlos гораздо важнее, чем кажется с первого взгляда.',
      'В раннем бронзовом веке здесь было поселение, связанное с морской торговлей. Археологи нашли каменные сосуды, печати и золотые украшения. То есть жители Mochlos не сидели на краю мира. Они были частью большой сети обмена, которая связывала Крит с восточным Средиземноморьем задолго до паспортов, аэропортов и очередей на досмотр.',
      'В районе Mochlos встречаются фиолетовые, красноватые и зеленоватые сланцы возрастом около 260–270 миллионов лет. Остров рассказывает историю людей, а местная геология напоминает о временах, когда до появления людей оставалось ещё очень и очень долго.'
    ] },
    { id: '03-lively', label: 'более живая подача', blocks: story => story.narration?.blocks?.slice(0, 3) || [] },
    { id: '04-light-humor', label: 'лёгкий юмор', blocks: () => [
      'Mochlos: маленькая деревня напротив очень большого прошлого',
      'Mochlos выглядит скромно: дома, таверны, вода и маленький остров напротив берега. Ничто особенно не кричит: здесь проходила большая история. Крит вообще редко кричит о таких вещах. Он обычно кладёт древнее поселение рядом с рыбной таверной и считает, что дальше вы как-нибудь разберётесь сами.',
      'В раннем бронзовом веке Mochlos был связан с морской торговлей. Здесь нашли каменные сосуды, печати и золотые украшения. Это значит, что местные жители участвовали в серьёзной сети обмена по восточному Средиземноморью. Ни паспортов, ни навигаторов, ни отзывов о портах у них не было, но торговля почему-то всё равно работала.',
      'Фиолетовым, красноватым и зеленоватым сланцам в районе Mochlos около 260–270 миллионов лет. На их фоне минойская цивилизация выглядит почти свежей новостью. Так что остров хранит очень большое прошлое, а местная геология хранит прошлое, которому уже просто неприлично быть таким старым.'
    ] }
  ]
};

async function generateVariantSet({ story, variants, dictionary, phonemes, dryRun, key, region }) {
  const results = [];
  for (const variant of variants) {
    const filename = `${story.id}-${variant.id}.mp3`;
    const outputFile = path.join(PREVIEW_DIR, filename);
    const rawBlocks = typeof variant.blocks === 'function' ? variant.blocks(story) : variant.blocks;
    const blocks = rawBlocks.filter(Boolean).map(block => applyPronunciations(block, dictionary));
    const detailLabel = [variant.label, `rate ${variant.rate || '0%'}`, `pitch ${variant.pitch || '0%'}`, `pause ${variant.breakMs ?? 500}ms`, variant.style ? `${variant.style} ${variant.styleDegree}` : null].filter(Boolean).join(', ');
    console.log(`${dryRun ? '[dry-run] ' : ''}${story.id}: ${variant.voice}, ${detailLabel} -> ${path.relative(ROOT, outputFile)}`);
    if (dryRun) {
      results.push({ variant, ok: true });
      continue;
    }
    try {
      const ssml = buildSsmlFromBlocks(blocks, variant, phonemes);
      await synthesize({ ssml, outputFile, key, region });
      console.log(`✓ ${filename}`);
      results.push({ variant, ok: true });
    } catch (error) {
      console.error(`✗ ${filename}: ${error.message}`);
      results.push({ variant, ok: false, error });
    }
  }
  return results;
}

async function main() {
  await loadLocalEnv();
  const { source: originalStoriesSource, value: stories } = await loadWindowData(STORIES_FILE, 'CRETE_STORIES');
  const { value: pronunciations } = await loadWindowData(PRONUNCIATIONS_FILE, 'CRETE_PRONUNCIATIONS');
  const { value: phonemes } = await loadWindowData(PRONUNCIATIONS_FILE, 'CRETE_PHONEMES');

  const requestedStory = argValue('--story');
  const force = hasFlag('--force');
  const dryRun = hasFlag('--dry-run');
  const printSsml = hasFlag('--print-ssml');
  const preview = hasFlag('--preview');
  const previewVariants = hasFlag('--preview-variants');
  const previewMai = hasFlag('--preview-mai');
  const voiceOverride = argValue('--voice');

  const previewModes = [preview, previewVariants, previewMai].filter(Boolean).length;
  if (previewModes > 1) throw new Error('Используйте только один режим: --preview, --preview-variants или --preview-mai. Azure и без нашей помощи достаточно запутан.');

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  const defaultVoice = voiceOverride || process.env.AZURE_SPEECH_VOICE || 'ru-RU-DmitryNeural';
  const rate = process.env.AZURE_SPEECH_RATE || '0%';
  if (!dryRun && !printSsml && (!key || !region)) throw new Error('Создайте локальный .env с AZURE_SPEECH_KEY и AZURE_SPEECH_REGION. Ключ в GitHub не коммитим, потому что мы всё-таки стремимся не кормить интернет секретами.');

  const selected = requestedStory ? stories.filter(story => story.id === requestedStory) : stories;
  if (!selected.length) throw new Error(`История ${requestedStory} не найдена`);
  if (printSsml && !requestedStory) throw new Error('--print-ssml требует --story <id>, иначе терминал утонет в SSML.');

  const previewVoices = ['ru-RU-SvetlanaNeural', 'ru-RU-DmitryNeural', 'ru-RU-DariyaNeural'];
  const maiPreviewVariants = [
    { id: 'mai-01-lev-friendly', label: 'MAI friendly', voice: 'ru-RU-Lev:MAI-Voice-2', rate: '0%', pitch: '0%', breakMs: 500, style: 'friendly', styleDegree: 0.8, blocks: story => [story.title, story.text?.[0] || ''] },
    { id: 'mai-02-lev-curious', label: 'MAI curious', voice: 'ru-RU-Lev:MAI-Voice-2', rate: '0%', pitch: '0%', breakMs: 500, style: 'curious', styleDegree: 0.8, blocks: story => [story.title, story.text?.[0] || ''] },
    { id: 'mai-03-lev-adventurous', label: 'MAI adventurous', voice: 'ru-RU-Lev:MAI-Voice-2', rate: '0%', pitch: '0%', breakMs: 500, style: 'adventurous', styleDegree: 0.6, blocks: story => [story.title, story.text?.[0] || ''] }
  ];

  let storiesSource = originalStoriesSource;
  let totalCharacters = 0;
  const previewResults = [];

  for (const story of selected) {
    const fullNarration = buildStorySsml(story, pronunciations, { voice: defaultVoice, rate });
    totalCharacters += fullNarration.blocks.join('\n').length;

    if (printSsml) {
      console.log(buildSsmlFromBlocks(fullNarration.blocks, fullNarration.options, phonemes));
      continue;
    }

    if (previewVariants || previewMai) {
      const variants = previewMai
        ? maiPreviewVariants
        : (NARRATION_PREVIEWS[story.id] || (() => { throw new Error(`Для истории ${story.id} ещё не подготовлены текстовые preview-варианты.`); })()).map(variant => ({ ...variant, voice: 'ru-RU-DmitryNeural', rate: '0%', pitch: '0%', breakMs: 500 }));
      const results = await generateVariantSet({ story, variants, dictionary: pronunciations, phonemes, dryRun, key, region });
      previewResults.push(...results);
      continue;
    }

    if (preview) {
      const excerptStory = { ...story, text: (story.text || []).slice(0, 2), lookFor: [], narration: null };
      for (const voice of previewVoices) {
        const filename = `${story.id}-${voice.replace(/^ru-RU-/, '').replace(/Neural$/, '').toLowerCase()}.mp3`;
        const outputFile = path.join(PREVIEW_DIR, filename);
        console.log(`${dryRun ? '[dry-run] ' : ''}${story.id}: preview ${voice} -> ${path.relative(ROOT, outputFile)}`);
        if (!dryRun) await synthesize({ ssml: buildSsmlFromBlocks(storySpeechText(excerptStory, pronunciations), { voice, rate }, phonemes), outputFile, key, region });
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
      const audioBuffer = await fs.readFile(outputFile);
      const durationSeconds = mp3DurationSeconds(audioBuffer);
      console.log(`${story.id}: уже существует, ${durationSeconds} сек, пропуск. Для замены добавьте --force.`);
      if (story.audio !== audioPath) storiesSource = replaceStoryAudio(storiesSource, story.id, audioPath);
      if (story.durationSeconds !== durationSeconds) storiesSource = replaceStoryDuration(storiesSource, story.id, durationSeconds);
      continue;
    }

    const sourceLabel = story.narration ? `narration ${story.narration.style || 'custom'}` : 'story text';
    console.log(`${dryRun ? '[dry-run] ' : ''}${story.id}: ${fullNarration.options.voice}, ${sourceLabel} -> ${audioPath}`);
    if (!dryRun) {
      const audioBuffer = await synthesize({ ssml: buildSsmlFromBlocks(fullNarration.blocks, fullNarration.options, phonemes), outputFile, key, region });
      const durationSeconds = mp3DurationSeconds(audioBuffer);
      storiesSource = replaceStoryAudio(storiesSource, story.id, audioPath);
      storiesSource = replaceStoryDuration(storiesSource, story.id, durationSeconds);
      console.log(`✓ ${story.id}: ${durationSeconds} сек`);
    }
  }

  console.log(`Объём выбранного текста: примерно ${totalCharacters.toLocaleString('ru-RU')} символов.`);
  if (previewResults.length && !dryRun) {
    const succeeded = previewResults.filter(result => result.ok).length;
    const failed = previewResults.length - succeeded;
    console.log(`Preview: создано ${succeeded}, ошибок ${failed}.`);
    if (failed) process.exitCode = 1;
  }
  if (!dryRun && !printSsml && !preview && !previewVariants && !previewMai && storiesSource !== originalStoriesSource) {
    await fs.writeFile(STORIES_FILE, storiesSource, 'utf8');
    console.log('stories-data.js обновлён путями к MP3 и длительностью.');
  }
}

main().catch(error => {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
});
