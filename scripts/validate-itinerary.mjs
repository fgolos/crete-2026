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

const source = context.window.CRETE_ITINERARY;
const normalized = context.window.CRETE_DATA_API.buildNormalizedData(source);
const validation = context.window.CRETE_VALIDATION_API.validate(normalized);
const projected = context.window.CRETE_DATA_API.projectLegacyData(
  normalized,
  source,
  context.window.CRETE_FORMATTERS
);

for (const day of projected.days || []) {
  for (const stop of day.stops || []) {
    const visitId = normalized.legacyVisitIndex[`${day.id}:${stop.order}`];
    const visit = visitId ? normalized.visits[visitId] : null;
    if (!visit || !stop.parking) continue;

    if (stop.parking.primary && visit.parking.primaryId) {
      stop.parking.primary.ref = visit.parking.primaryId;
    }
    for (let index = 0; index < (stop.parking.alternatives || []).length; index += 1) {
      const alternativeId = visit.parking.alternatives[index]?.id;
      if (alternativeId) stop.parking.alternatives[index].ref = alternativeId;
    }

    const links = [stop.parking.primary, ...(stop.parking.alternatives || [])].filter(Boolean);
    for (const link of links) {
      if (!link.ref || !projected.parkingLocations?.[link.ref]) {
        validation.errors.push(`Projected parking reference is invalid for ${day.id}: ${stop.name}`);
      }
    }
  }
}
validation.valid = validation.errors.length === 0;

if (!validation.valid) {
  for (const error of validation.errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated schema v${normalized.schemaVersion}: ${Object.keys(normalized.days).length} days, ${Object.keys(normalized.visits).length} visits, ${Object.keys(normalized.places).length} places.`);
}
