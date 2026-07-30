#!/usr/bin/env node
import fs from 'node:fs/promises';
import vm from 'node:vm';

const FILE = 'stories-data.js';
const source = await fs.readFile(FILE, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: FILE });

const stories = sandbox.window.CRETE_STORIES;
if (!Array.isArray(stories) || !stories.length) throw new Error('CRETE_STORIES not found');

const constName = id => id.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase();
const q = value => JSON.stringify(value, null, 2);
const compactArray = value => JSON.stringify(value);

const parts = [];
parts.push("function livelyNarration(title,text){return{style:'lively',voice:'ru-RU-DmitryNeural',rate:'0%',pitch:'0%',breakMs:500,blocks:[title,...text]};}");
parts.push('');

for (const story of stories) {
  const base = constName(story.id);
  parts.push(`const ${base}_TITLE = ${q(story.title)};`);
  parts.push(`const ${base}_TEXT = ${q(story.text || [])};`);
  parts.push(`const ${base}_LOOK_FOR = ${q(story.lookFor || [])};`);
  parts.push('');
}

parts.push('window.CRETE_STORIES=[');
for (const [index, story] of stories.entries()) {
  const base = constName(story.id);
  const fields = [
    `id:${q(story.id)}`,
    `dayId:${q(story.dayId)}`,
    `stopOrder:${story.stopOrder}`,
    `kind:${q(story.kind)}`,
    `buttonLabel:${q(story.buttonLabel)}`,
    `title:${base}_TITLE`,
    `audio:${story.audio == null ? 'null' : q(story.audio)}`,
    `durationSeconds:${story.durationSeconds == null ? 'null' : story.durationSeconds}`,
    `text:${base}_TEXT`,
  ];
  if (story.narration) fields.push(`narration:livelyNarration(${base}_TITLE,${base}_TEXT)`);
  fields.push(`lookFor:${base}_LOOK_FOR`);
  fields.push(`sources:${compactArray(story.sources || [])}`);
  parts.push(`{${fields.join(',')}}${index === stories.length - 1 ? '' : ','}`);
}
parts.push('];');
parts.push('');

await fs.writeFile(FILE, parts.join('\n'), 'utf8');
console.log(`Normalized ${stories.length} stories`);
