import fs from 'node:fs';

const runtimePaths = [
  'app.js',
  'app-runtime.js',
  'index.html',
  'itinerary-bootstrap.js',
  'itinerary-data.js',
  'itinerary-model.js',
  'itinerary-renderer-model.js',
  'formatters.js',
  'stories-data.js',
  'service-worker.js'
];
const runtime = Object.fromEntries(runtimePaths.map(file => [file, fs.readFileSync(file, 'utf8')]));
const combined = Object.values(runtime).join('\n');
const forbidden = [
  'window.CRETE_ITINERARY',
  'projectLegacyData',
  'routeStopOrders',
  'stopOrder',
  'data-stop-order',
  'dataset.stopOrder',
  'legacyVisitIndex',
  'itinerary-source.js',
  'formatLegacyDuration',
  'buildLegacyDayMeta',
  'metricDisplayHints',
  'durationDisplayHint',
  'displayHints',
  'timing.label'
];
const required = [
  ['app-runtime.js', 'window.CRETE_RENDERER_MODEL'],
  ['app-runtime.js', 'routeVisitIds'],
  ['app-runtime.js', 'data-visit-id'],
  ['app-runtime.js', 'dataset.visitId'],
  ['itinerary-bootstrap.js', 'window.CRETE_DATA'],
  ['itinerary-bootstrap.js', 'window.CRETE_RENDERER_MODEL'],
  ['itinerary-data.js', 'schemaVersion'],
  ['itinerary-data.js', 'travelTotals'],
  ['itinerary-data.js', 'durationKind'],
  ['itinerary-data.js', 'trip'],
  ['stories-data.js', 'visitId'],
  ['service-worker.js', './itinerary-renderer-model.js']
];

for (const token of forbidden) {
  if (combined.includes(token)) {
    console.error(`Native runtime contract failed: legacy or presentation token remains: ${token}`);
    process.exitCode = 1;
  }
}
for (const [file, token] of required) {
  if (!runtime[file].includes(token)) {
    console.error(`Native runtime contract failed: ${file} is missing ${token}`);
    process.exitCode = 1;
  }
}
if (fs.existsSync('itinerary-source.js')) {
  console.error('Native runtime contract failed: itinerary-source.js still exists');
  process.exitCode = 1;
}

if (!process.exitCode) console.log('Native normalized renderer contract is present.');
