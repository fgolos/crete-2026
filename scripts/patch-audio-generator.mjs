import fs from 'node:fs';

const path = 'scripts/generate-audio.mjs';
const source = fs.readFileSync(path, 'utf8');
const before = "  const pattern = new RegExp(`(id:\\\\s*['\"]${escapedStoryId}['\"][\\\\s\\\\S]*?${field}:\\\\s*)(${valuePattern})`);";
const after = "  const pattern = new RegExp(`([\"']?id[\"']?\\\\s*:\\\\s*[\"']${escapedStoryId}[\"'][\\\\s\\\\S]*?[\"']?${field}[\"']?\\\\s*:\\\\s*)(${valuePattern})`);";

if (!source.includes(before)) throw new Error('Audio generator patch target was not found');
fs.writeFileSync(path, source.replace(before, after));
console.log('Audio generator now supports quoted and unquoted story keys.');
