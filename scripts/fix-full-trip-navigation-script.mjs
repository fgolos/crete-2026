import fs from 'node:fs';

const path = 'scripts/apply-full-trip-navigation.mjs';
let source = fs.readFileSync(path, 'utf8');
const before = String.raw`hash.match(/^(east|west)\/(day\d+)$/)`;
const after = String.raw`hash.match(/^(east|west)\\/(day\\d+)$/)`;
if (!source.includes(before)) throw new Error('Scoped navigation regex source was not found');
source = source.replace(before, after);
fs.writeFileSync(path, source);
fs.rmSync('scripts/fix-full-trip-navigation-script.mjs');
