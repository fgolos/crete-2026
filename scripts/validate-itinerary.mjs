import fs from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({ window: {}, console, Intl, Date, Object, Array, Map, Set, Number, String, RegExp, Error });
for (const file of ['formatters.js', 'itinerary-model.js', 'itinerary-renderer-model.js', 'data-validation.js', 'itinerary-data.js', 'stories-data.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}

const data = context.window.CRETE_DATA;
const validation = context.window.CRETE_VALIDATION_API.validate(data);
const model = context.window.CRETE_MODEL_API.createModel(data);
const renderer = context.window.CRETE_RENDERER_MODEL_API.createRendererModel(data, model, context.window.CRETE_FORMATTERS);

for (const day of renderer.days) {
  for (const visitId of day.routeVisitIds) {
    if (!day.stops.some(stop => stop.id === visitId)) validation.errors.push(`Renderer day ${day.id} misses route visit ${visitId}`);
  }
}
for (const story of context.window.CRETE_STORIES || []) {
  if (!story.visitId || !data.visits[story.visitId]) validation.errors.push(`Story ${story.id} references an unknown visit`);
  if ('dayId' in story || 'stopOrder' in story) validation.errors.push(`Story ${story.id} still contains legacy location fields`);
}
validation.valid = validation.errors.length === 0;

if (!validation.valid) {
  validation.errors.forEach(error => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Validated native schema v${data.schemaVersion}: ${renderer.days.length} days, ${Object.keys(data.visits).length} visits, ${Object.keys(data.places).length} places.`);
}
