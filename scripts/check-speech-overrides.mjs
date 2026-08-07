import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('stories-data.js', 'utf8'), sandbox, { filename: 'stories-data.js' });
vm.runInContext(fs.readFileSync('pronunciations-data.js', 'utf8'), sandbox, { filename: 'pronunciations-data.js' });

const stories = sandbox.window.CRETE_STORIES || [];
const phonemes = sandbox.window.CRETE_PHONEMES || {};
const CYRILLIC = /[А-Яа-яЁё]/;
const LATIN = /[A-Za-z]/;

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function narratableText(story) {
  return [
    story.title,
    ...(story.text || []),
    ...(story.lookFor || []),
    ...(story.narration?.blocks || [])
  ].filter(Boolean).join('\n');
}

if (!stories.length) throw new Error('No stories loaded');
if (!Object.keys(phonemes).length) throw new Error('CRETE_PHONEMES is empty');

const corpus = stories.map(story => ({ id: story.id, text: narratableText(story) }));
let used = 0;
let unused = 0;

for (const [written, ipa] of Object.entries(phonemes)) {
  if (!CYRILLIC.test(written) || LATIN.test(written)) throw new Error(`Invalid spoken key: ${written}`);
  if (!ipa.includes('ˈ')) throw new Error(`Primary stress marker missing for ${written}: ${ipa}`);
  if (/[<>"&]/.test(ipa)) throw new Error(`Unsafe IPA value for ${written}: ${ipa}`);

  const matcher = new RegExp(`(?<![А-Яа-яЁё])${escapeRegExp(written)}(?![А-Яа-яЁё])`, 'giu');
  const storyIds = corpus.filter(story => matcher.test(story.text)).map(story => story.id);
  matcher.lastIndex = 0;
  if (storyIds.length) {
    used += 1;
    console.log(`✓ ${written.padEnd(22)} ${ipa.padEnd(26)} ${storyIds.join(', ')}`);
  } else {
    unused += 1;
    console.log(`· ${written.padEnd(22)} ${ipa.padEnd(26)} пока не встречается в озвучиваемом тексте`);
  }
}

if (!Object.prototype.hasOwnProperty.call(phonemes, 'храмовым')) throw new Error('Regression override for храмовым is missing');
const panigiri = corpus.find(story => story.id === 'panigiri-august15');
if (!panigiri?.text.includes('храмовым')) throw new Error('Expected храмовым in panigiri-august15 narration');
console.log(`Stress audit: ${used} используемых overrides, ${unused} резервных/неиспользуемых, ${stories.length} stories.`);
