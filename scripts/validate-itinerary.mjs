import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ window: {}, console, Intl, Date, Object, Array, Map, Set, Number, String, RegExp, Error });

for (const file of ['formatters.js', 'itinerary-model.js', 'data-validation.js', 'itinerary-data.js', 'itinerary-source.js']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(source, context, { filename: file });
}

const normalized = context.window.CRETE_DATA_API.buildNormalizedData(context.window.CRETE_ITINERARY);
const validation = context.window.CRETE_VALIDATION_API.validate(normalized);

if (!validation.valid) {
  for (const error of validation.errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated schema v${normalized.schemaVersion}: ${Object.keys(normalized.days).length} days, ${Object.keys(normalized.visits).length} visits, ${Object.keys(normalized.places).length} places.`);
}
