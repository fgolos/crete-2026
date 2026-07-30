#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import process from 'node:process';

const ROOT = process.cwd();
const STORIES_FILE = path.join(ROOT, 'stories-data.js');
const PRONUNCIATIONS_FILE = path.join(ROOT, 'pronunciations-data.js');
const NARRATIONS_FILE = path.join(ROOT, 'narration-data.js');
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

async function loadWindowData(file, property, { optional = false } = {}) {
  try {
    const source = await fs.readFile(file, 'utf8');
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox, { filename: file });
    const value = sandbox.window[property];
    if (!value && !optional) {
      throw new Error(`В ${path.basename(file)} не найден window.${property}`);
    }
    return { source, value: value || {} };
  } catch (error) {
    if (optional && error.code === 'ENOENT') return { source: '', value: {} };
    throw error;
  }
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

function storySpeechText(story, dictionary) {
  const blocks = [story.title, ...(story.text || [])];
  if (story.lookFor?.length) {
    blocks.push(`Когда будем на месте, обратите внимание. ${story.lookFor.join('. ')}.`);
  }
  return blocks.map(block => applyPronunciations(block, dictionary));
}

function narrationSpeechText(story, narrations, dictionary) {
  const narration = narrations[story.id];
  if (!narration?.blocks?.length) return null;
  return narration.blocks.map(block => applyPronunciations(block, dictionary));
}

function buildSsmlFromBlocks(blocks, {
  voice,
  rate = '0%',
  pitch = '0%',
  breakMs = 650,
  style = null,
  styleDegree = null,
  spokenLocale = null
}) {
  const paragraphs = blocks
    .map(paragraph => `<p>${escapeXml(paragraph)}</p>`)
    .join(`<break time="${breakMs}ms"/>`);

  let content = `<prosody rate="${escapeXml(rate)}" pitch="${escapeXml(pitch)}">${paragraphs}</prosody>`;
  if (spokenLocale) {
    content = `<lang xml:lang="${escapeXml(spokenLocale)}">${content}</lang>`;
  }
  if (style) {
    const degreeAttribute = styleDegree == null
      ? ''
      : ` styledegree="${escapeXml(String(styleDegree))}"`;
    content = `<mstts:express-as style="${escapeXml(style)}"${degreeAttribute}>${content}</mstts:express-as>`;
  }

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="ru-RU"><voice name="${escapeXml(voice)}">${content}</voice></speak>`;
}

function buildStorySsml(story, narrations, dictionary, defaults) {
  const narration = narrations[story.id];
  const blocks = narrationSpeechText(story, narrations, dictionary)
    || storySpeechText(story, dictionary);
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
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, Buffer.from(await response.arrayBuffer()));
}

function replaceStoryAudio(source, storyId, audioPath) {
  const escapedStoryId = storyId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const idPattern = new RegExp(`(id:\\s*['"]${escapedStoryId}['"][\\s\\S]*?audio:\\s*)(null|['"][^'"]*['"])`);
  if (!idPattern.test(source)) throw new Error(`Не удалось найти поле audio для истории ${storyId}`);
  return source.replace(idPattern, `$1'${audioPath}'`);
}

const NARRATION_PREVIEWS = {
  mochlos: [
    {
      id: '01-original',
      label: 'исходный текст',
      blocks: story => [story.title, story.text?.[0] || '', story.text?.[1] || '', story.text?.[4] || '']
    },
    {
      id: '02-conversational',
      label: 'разговорная подача',
      blocks: () => [
        'Mochlos: маленькая деревня напротив очень большого прошлого',
        'Перед нами Mochlos. Сегодня это спокойная приморская деревня: несколько домов, таверны у воды и маленький остров совсем рядом. Но остров здесь не просто красивый фон для обеда. На нём находится археологический комплекс, и именно он объясняет, почему Mochlos гораздо важнее, чем кажется с первого взгляда.',
        'В раннем бронзовом веке здесь было поселение, связанное с морской торговлей. Археологи нашли каменные сосуды, печати и золотые украшения. То есть жители Mochlos не сидели на краю мира. Они были частью большой сети обмена, которая связывала Крит с восточным Средиземноморьем задолго до паспортов, аэропортов и очередей на досмотр.',
        'И ещё одна деталь находится буквально под ногами. В районе Mochlos встречаются фиолетовые, красноватые и зеленоватые сланцы возрастом около 260–270 миллионов лет. Остров рассказывает историю людей, а берег напоминает о временах, когда до появления людей оставалось ещё очень и очень долго.'
      ]
    },
    {
      id: '03-lively',
      label: 'более живая подача',
      blocks: () => [
        'Mochlos: маленькая деревня напротив очень большого прошлого',
        'Посмотрите на остров прямо перед нами. Он маленький, почти игрушечный, и до него всего несколько сотен метров. Но именно там скрывается главное прошлое Mochlos: древнее поселение, гавань и археологический комплекс, из-за которого эта тихая деревня занимает на карте истории куда больше места, чем на обычной карте Крита.',
        'Несколько тысяч лет назад сюда заходили корабли, шли товары, а местные жители явно не бедствовали. Среди находок есть каменные сосуды, печати и золотые украшения. Mochlos был включён в морскую торговую сеть восточного Средиземноморья. И всё это происходило задолго до того, как путешествие начали измерять временем ожидания багажа.',
        'Теперь посмотрим ближе, буквально себе под ноги. Местные фиолетовые, красноватые и зеленоватые сланцы появились примерно 260–270 миллионов лет назад. Получается редкая многослойная экскурсия: перед глазами история цивилизаций, а под ногами геология настолько древняя, что человеческая история рядом с ней выглядит короткой заметкой.'
      ]
    },
    {
      id: '04-light-humor',
      label: 'лёгкий юмор',
      blocks: () => [
        'Mochlos: маленькая деревня напротив очень большого прошлого',
        'Mochlos выглядит скромно: дома, таверны, вода и маленький остров напротив. Ничто особенно не кричит: здесь проходила большая история. Крит вообще редко кричит о таких вещах. Он обычно кладёт древнее поселение рядом с рыбной таверной и считает, что дальше вы как-нибудь разберётесь сами.',
        'В раннем бронзовом веке Mochlos был связан с морской торговлей. Здесь нашли каменные сосуды, печати и золотые украшения. Это значит, что местные жители участвовали в серьёзной сети обмена по восточному Средиземноморью. Ни паспортов, ни навигаторов, ни отзывов о портах у них не было, но торговля почему-то всё равно работала.',
        'А теперь геология решила окончательно испортить нам чувство масштаба. Фиолетовым, красноватым и зеленоватым сланцам в районе Mochlos около 260–270 миллионов лет. На их фоне минойская цивилизация выглядит почти свежей новостью. Так что остров напротив хранит очень большое прошлое, а берег под ногами хранит прошлое, которому уже просто неприлично быть таким старым.'
      ]
    }
  ]
};

async function generateVariantSet({ story, variants, dictionary, dryRun, key, region }) {
  const results = [];
  for (const variant of variants) {
    const filename = `${story.id}-${variant.id}.mp3`;
    const outputFile = path.join(PREVIEW_DIR, filename);
    const rawBlocks = typeof variant.blocks === 'function' ? variant.blocks(story) : variant.blocks;
    const blocks = rawBlocks.filter(Boolean).map(block => applyPronunciations(block, dictionary));
    const detailLabel = [
      variant.label,
      `rate ${variant.rate || '0%'}`,
      `pitch ${variant.pitch || '0%'}`,
      `pause ${variant.breakMs ?? 500}ms`,
      variant.style ? `${variant.style} ${variant.styleDegree}` : null
    ].filter(Boolean).join(', ');

    console.log(`${dryRun ? '[dry-run] ' : ''}${story.id}: ${variant.voice}, ${detailLabel} -> ${path.relative(ROOT, outputFile)}`);
    if (dryRun) {
      results.push({ variant, ok: true });
      continue;
    }
    try {
      const ssml = buildSsmlFromBlocks(blocks, variant);
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
  const { value: narrations } = await loadWindowData(NARRATIONS_FILE, 'CRETE_NARRATIONS', { optional: true });

  const requestedStory = argValue('--story');
  const force = hasFlag('--force');
  const dryRun = hasFlag('--dry-run');
  const preview = hasFlag('--preview');
  const previewVariants = hasFlag('--preview-variants');
  const previewMai = hasFlag('--preview-mai');
  const voiceOverride = argValue('--voice');

  const previewModes = [preview, previewVariants, previewMai].filter(Boolean).length;
  if (previewModes > 1) {
    throw new Error('Используйте только один режим: --preview, --preview-variants или --preview-mai. Azure и без нашей помощи достаточно запутан.');
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  const defaultVoice = voiceOverride || process.env.AZURE_SPEECH_VOICE || 'ru-RU-DmitryNeural';
  const rate = process.env.AZURE_SPEECH_RATE || '0%';
  if (!dryRun && (!key || !region)) {
    throw new Error('Создайте локальный .env с AZURE_SPEECH_KEY и AZURE_SPEECH_REGION. Ключ в GitHub не коммитим, потому что мы всё-таки стремимся не кормить интернет секретами.');
  }

  const selected = requestedStory ? stories.filter(story => story.id === requestedStory) : stories;
  if (!selected.length) throw new Error(`История ${requestedStory} не найдена`);

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
    const fullNarration = buildStorySsml(story, narrations, pronunciations, { voice: defaultVoice, rate });
    totalCharacters += fullNarration.blocks.join('\n').length;

    if (previewVariants || previewMai) {
      let variants;
      if (previewMai) {
        variants = maiPreviewVariants;
      } else {
        const narrationVariants = NARRATION_PREVIEWS[story.id];
        if (!narrationVariants) throw new Error(`Для истории ${story.id} ещё не подготовлены текстовые preview-варианты.`);
        variants = narrationVariants.map(variant => ({ ...variant, voice: 'ru-RU-DmitryNeural', rate: '0%', pitch: '0%', breakMs: 500 }));
      }
      const results = await generateVariantSet({ story, variants, dictionary: pronunciations, dryRun, key, region });
      previewResults.push(...results);
      continue;
    }

    if (preview) {
      const excerptStory = { ...story, text: (story.text || []).slice(0, 2), lookFor: [] };
      for (const voice of previewVoices) {
        const filename = `${story.id}-${voice.replace(/^ru-RU-/, '').replace(/Neural$/, '').toLowerCase()}.mp3`;
        const outputFile = path.join(PREVIEW_DIR, filename);
        console.log(`${dryRun ? '[dry-run] ' : ''}${story.id}: preview ${voice} -> ${path.relative(ROOT, outputFile)}`);
        if (!dryRun) {
          const ssml = buildSsmlFromBlocks(storySpeechText(excerptStory, pronunciations), { voice, rate });
          await synthesize({ ssml, outputFile, key, region });
        }
      }
      continue;
    }

    const audioPath = `audio/${story.id}.mp3`;
    const outputFile = path.join(ROOT, audioPath);
    let exists = false;
    try { await fs.access(outputFile); exists = true; } catch {}

    if (exists && !force) {
      console.log(`${story.id}: уже существует, пропуск. Для замены добавьте --force.`);
      if (story.audio !== audioPath) storiesSource = replaceStoryAudio(storiesSource, story.id, audioPath);
      continue;
    }

    const sourceLabel = narrations[story.id] ? `narration ${narrations[story.id].style || 'custom'}` : 'story text';
    console.log(`${dryRun ? '[dry-run] ' : ''}${story.id}: ${fullNarration.options.voice}, ${sourceLabel} -> ${audioPath}`);
    if (!dryRun) {
      const ssml = buildSsmlFromBlocks(fullNarration.blocks, fullNarration.options);
      await synthesize({ ssml, outputFile, key, region });
      storiesSource = replaceStoryAudio(storiesSource, story.id, audioPath);
    }
  }

  console.log(`Объём выбранного текста: примерно ${totalCharacters.toLocaleString('ru-RU')} символов.`);
  if (previewResults.length && !dryRun) {
    const succeeded = previewResults.filter(result => result.ok).length;
    const failed = previewResults.length - succeeded;
    console.log(`Preview: создано ${succeeded}, ошибок ${failed}.`);
    if (failed) process.exitCode = 1;
  }
  if (!dryRun && !preview && !previewVariants && !previewMai && storiesSource !== originalStoriesSource) {
    await fs.writeFile(STORIES_FILE, storiesSource, 'utf8');
    console.log('stories-data.js обновлён путями к MP3.');
  }
}

main().catch(error => {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
});
