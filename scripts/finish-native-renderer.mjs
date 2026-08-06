import fs from 'node:fs';
import vm from 'node:vm';

function replaceRequired(content, search, replacement, label) {
  if (typeof search === 'string') {
    if (!content.includes(search)) throw new Error(`Migration target not found: ${label}`);
    return content.replace(search, replacement);
  }
  if (!search.test(content)) throw new Error(`Migration target not found: ${label}`);
  return content.replace(search, replacement);
}

function write(path, content) {
  fs.writeFileSync(path, content.endsWith('\n') ? content : `${content}\n`);
}

function loadLegacyData() {
  const context = vm.createContext({
    window: {}, console, Intl, Date, Object, Array, Map, Set, Number, String, RegExp, Error
  });
  for (const file of ['formatters.js', 'itinerary-data.js', 'itinerary-source.js', 'stories-data.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  }
  const source = context.window.CRETE_ITINERARY;
  const normalized = context.window.CRETE_DATA_API.buildNormalizedData(source);
  return { context, source, normalized };
}

const { context, source, normalized } = loadLegacyData();
const legacyVisitIndex = { ...normalized.legacyVisitIndex };

for (const day of Object.values(normalized.days)) delete day.legacyId;
for (const visit of Object.values(normalized.visits)) {
  const legacy = visit.legacy;
  const sourceDay = source.days.find(day => day.id === legacy?.dayId);
  const sourceStop = sourceDay?.stops.find(stop => stop.order === legacy?.stopOrder);
  visit.durationDisplayHint = sourceStop?.duration || null;
  delete visit.legacy;
}
delete normalized.legacyVisitIndex;

const staticData = `(() => {\n  'use strict';\n\n  function deepFreeze(value) {\n    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;\n    Object.freeze(value);\n    for (const child of Object.values(value)) deepFreeze(child);\n    return value;\n  }\n\n  window.CRETE_DATA = deepFreeze(${JSON.stringify(normalized, null, 2)});\n})();\n`;
write('itinerary-data.js', staticData);

const stories = (context.window.CRETE_STORIES || []).map(story => {
  const visitId = story.visitId || legacyVisitIndex[`${story.dayId}:${story.stopOrder}`];
  if (!visitId) throw new Error(`Story ${story.id} has no matching visit`);
  const { dayId: _dayId, stopOrder: _stopOrder, ...rest } = story;
  return { ...rest, visitId };
});
write('stories-data.js', `window.CRETE_STORIES = ${JSON.stringify(stories, null, 2)};\n`);

write('itinerary-bootstrap.js', `(() => {
  'use strict';

  const data = window.CRETE_DATA;
  if (!data) throw new Error('CRETE_DATA did not load');
  if (!window.CRETE_FORMATTERS || !window.CRETE_MODEL_API || !window.CRETE_RENDERER_MODEL_API || !window.CRETE_VALIDATION_API) {
    throw new Error('Normalized itinerary dependencies did not load');
  }

  const validation = window.CRETE_VALIDATION_API.validate(data);
  if (!validation.valid) {
    console.group('Invalid CRETE_DATA');
    validation.errors.forEach(error => console.error(error));
    console.groupEnd();
    throw new Error(\`CRETE_DATA validation failed with \${validation.errors.length} error(s)\`);
  }

  const model = window.CRETE_MODEL_API.createModel(data);
  const rendererModel = window.CRETE_RENDERER_MODEL_API.createRendererModel(data, model, window.CRETE_FORMATTERS);

  for (const story of window.CRETE_STORIES || []) {
    if (!story.visitId || !data.visits[story.visitId]) {
      throw new Error(\`Story \${story.id} references an unknown visit\`);
    }
  }

  window.CRETE_MODEL = model;
  window.CRETE_RENDERER_MODEL = rendererModel;
})();
`);

let modelSource = fs.readFileSync('itinerary-model.js', 'utf8');
modelSource = replaceRequired(
  modelSource,
  /,\n\s*findVisitByLegacyKey:[\s\S]*?\n\s*\}\);/,
  '\n    });',
  'legacy model lookup'
);
write('itinerary-model.js', modelSource);

let app = fs.readFileSync('app-runtime.js', 'utf8');
app = replaceRequired(app,
  "  const data = window.CRETE_ITINERARY;\n  if (!data) throw new Error('CRETE_ITINERARY is not loaded');",
  "  const data = window.CRETE_RENDERER_MODEL;\n  if (!data) throw new Error('CRETE_RENDERER_MODEL is not loaded');",
  'runtime data source'
);
app = replaceRequired(app,
  /  function resolveParkingLink\(link\) \{[\s\S]*?  function parkingMarkerKey\(dayId, order\) \{\n    return `\$\{dayId\}:\$\{order\}`;\n  \}/,
  `  function getPrimaryParking(stop) {\n    return stop?.parking?.primary || null;\n  }\n\n  function getAlternativeParkings(stop) {\n    return stop?.parking?.alternatives || [];\n  }\n\n  function parkingMarkerKey(_dayId, visitId) {\n    return visitId;\n  }`,
  'parking resolution block'
);
app = replaceRequired(app,
  /\n  function validateParkingReferences\(\) \{[\s\S]*?\n  \}\n\n  function buildGoogleMapsUrl/,
  '\n  function buildGoogleMapsUrl',
  'legacy parking validator'
);
app = app.replaceAll(
  'const routeStops = day.routeStopOrders.map(order => day.stops.find(stop => stop.order === order));',
  'const routeStops = day.routeVisitIds.map(visitId => day.stops.find(stop => stop.id === visitId)).filter(Boolean);'
);
app = replaceRequired(app,
  "  function dayNumber(dayId) {\n    return Number(String(dayId).replace(/^day/, ''));\n  }",
  "  function dayNumber(dayId) {\n    return data.getDayNumber(dayId);\n  }",
  'ISO day number'
);
app = replaceRequired(app,
  "  function isTransitionDay(dayId) {\n    return dayId === 'day15';\n  }",
  "  function isTransitionDay(dayId) {\n    return dayId === '2026-08-15';\n  }",
  'transition day'
);
app = replaceRequired(app,
  /  function dayRoutePoints\(day\) \{[\s\S]*?\n  \}\n\n  function visiblePartStops/,
  `  function dayRoutePoints(day) {\n    return day.routeVisitIds\n      .map(visitId => day.stops.find(stop => stop.id === visitId))\n      .filter(Boolean)\n      .map(getDrivingCoordinates);\n  }\n\n  function visiblePartStops`,
  'day route points'
);
app = app.replace(/\brouteStopOrders\b/g, 'routeVisitIds');
app = app.replace(/\bstopOrder\b/g, 'visitId');
app = app.replace(/\bselectedOrder\b/g, 'selectedVisitId');
app = app.replaceAll('data-stop-order', 'data-visit-id');
app = app.replaceAll('dataset.stopOrder', 'dataset.visitId');
app = app.replaceAll('data.days.findIndex(d => d === day)', 'day.id');
app = app.replaceAll('data.days.find(item => item.id === dayId)', 'getDay(dayId)');
app = app.replaceAll('data.days.find(item => item.id === activePanel)', 'getDay(activePanel)');
app = app.replaceAll('key.startsWith(`${dayId}:`)', 'key.startsWith(dayId)');
app = app.replaceAll('visitId: nextStop.order', 'visitId: nextStop.id');
app = app.replaceAll('visitId: stop.order', 'visitId: stop.id');
app = app.replaceAll('data-visit-id="${stop.order}"', 'data-visit-id="${stop.id}"');
app = app.replaceAll('markerKey(dayId, selectedVisitId)', 'markerKey(selectedVisitId)');
app = app.replaceAll('parkingMarkerKey(dayId, selectedVisitId)', 'parkingMarkerKey(dayId, selectedVisitId)');
app = app.replaceAll('markerKey(dayId, visitId)', 'markerKey(visitId)');
app = app.replaceAll('Number(timelineSegment.dataset.visitId)', 'timelineSegment.dataset.visitId');
app = app.replaceAll('Number(segment.dataset.visitId)', 'segment.dataset.visitId');
app = app.replaceAll('Number(row.dataset.visitId)', 'row.dataset.visitId');
app = app.replaceAll('Number(visitId)', 'visitId');
app = app.replaceAll('panel.dataset.focusStop', 'panel.dataset.focusVisit');
app = app.replaceAll('dataset.focusStop', 'dataset.focusVisit');
app = app.replaceAll('delete panel.dataset.focusStop', 'delete panel.dataset.focusVisit');
app = app.replaceAll('validateParkingReferences();\n    ', '');

app = replaceRequired(app,
  "  function markerKey(dayId, order) { return `${dayId}:${order}`; }",
  "  function markerKey(visitId) { return visitId; }",
  'marker identity'
);
app = replaceRequired(app,
  /  function fitDayRoute\(dayId\) \{[\s\S]*?\n  \}\n\n  function renderStopDetail/,
  `  function fitDayRoute(dayId) {\n    const day = getDay(dayId);\n    const map = maps.get(dayId);\n    if (!day || !map) return;\n    const points = [];\n    for (const visitId of day.routeVisitIds) {\n      const stop = day.stops.find(item => item.id === visitId);\n      if (stop) points.push(getDrivingCoordinates(stop));\n    }\n    for (const stop of day.stops.filter(item => item.mapVisible !== false)) points.push([stop.lat, stop.lon]);\n    const bounds = L.latLngBounds(points);\n    map.invalidateSize({ pan:false });\n    if (bounds.isValid()) map.fitBounds(bounds,{ padding:[30,30],animate:false });\n  }\n\n  function renderStopDetail`,
  'fit day route'
);
app = app.replace(
  '  function renderStopDetail(dayId,order) {\n    const day = getDay(dayId);\n    const stop = day?.stops.find(item => item.order === Number(order));',
  '  function renderStopDetail(dayId, visitId) {\n    const day = getDay(dayId);\n    const stop = day?.stops.find(item => item.id === visitId);'
);
app = replaceRequired(app,
  /  function activateStopRow\(row\) \{[\s\S]*?\n  \}\n\n  function setActiveStop/,
  `  function activateStopRow(row) {\n    const dayId = row.dataset.dayId;\n    const visitId = row.dataset.visitId;\n    clearActiveDrive(dayId);\n    if (!mobileViewport.matches) { selectStop(dayId, visitId, true); return; }\n    document.getElementById(dayId).dataset.focusVisit = visitId;\n    selectStop(dayId, visitId);\n    setMobileView(dayId, 'map');\n    setTimeout(() => {\n      selectStop(dayId, visitId, true);\n      document.querySelector(\`#\${dayId} .stop-detail\`)?.focus({ preventScroll:true });\n    },100);\n  }\n\n  function setActiveStop`,
  'activate stop row'
);
app = replaceRequired(app,
  /  function setActiveStop\(dayId,order,focusMap = false\) \{[\s\S]*?\n  \}\n\n  function selectStop\(dayId,order,focusMap = false\) \{[\s\S]*?\n  \}/,
  `  function setActiveStop(dayId, visitId, focusMap = false) {\n    document.querySelectorAll(\`.route-row[data-day-id="\${dayId}"]\`).forEach(row => {\n      row.classList.toggle('is-active', row.dataset.visitId === visitId);\n    });\n    const record = markerIndex.get(markerKey(visitId));\n    if (!record) return;\n    markerIndex.forEach(({ element }, key) => {\n      if (key.startsWith(dayId) && element) element.classList.remove('is-active');\n    });\n    clearParkingMarkerState(dayId, 'is-active');\n    if (record.element) record.element.classList.add('is-active');\n    setParkingMarkerState(dayId, visitId, 'is-active');\n    if (focusMap) {\n      const day = getDay(dayId);\n      const stop = day?.stops.find(item => item.id === visitId);\n      const parking = getPrimaryParking(stop);\n      if (stop && isSeparateParking(stop) && parking) {\n        record.map.fitBounds([[stop.lat, stop.lon], [parking.lat, parking.lon]], { padding:[70,70], maxZoom:17, animate:true });\n      } else {\n        record.map.setView(record.marker.getLatLng(), Math.max(record.map.getZoom(), 13), { animate:true });\n      }\n    }\n  }\n\n  function selectStop(dayId, visitId, focusMap = false) {\n    const day = getDay(dayId);\n    const stop = day?.stops.find(item => item.id === visitId);\n    clearActiveDrive(dayId);\n    setActiveStop(dayId, visitId, focusMap);\n    renderStopDetail(dayId, visitId);\n    syncSelectionUI(dayId, 'stop', visitId);\n    if (stop) scheduleParkingFocus(dayId, stop);\n  }`,
  'stable stop selection'
);
app = app.replaceAll('day.routeVisitIds.indexOf(visitId)', 'day.routeVisitIds.indexOf(visitId)');
app = app.replaceAll('day.stops.find(item => item.order === visitId)', 'day.stops.find(item => item.id === visitId)');
app = app.replaceAll('day.stops.find(item => item.order === day.routeVisitIds[currentOrderIndex - 1])', 'day.stops.find(item => item.id === day.routeVisitIds[currentOrderIndex - 1])');
app = app.replaceAll('day.stops.find(stop => stop.order === visitId)', 'day.stops.find(stop => stop.id === visitId)');
app = app.replaceAll('selectStop(dayId,stop.order)', 'selectStop(dayId, stop.id)');
app = app.replaceAll('selectStop(dayId, stop.order, true)', 'selectStop(dayId, stop.id, true)');
app = app.replaceAll('markerKey(dayId,stop.order)', 'markerKey(stop.id)');
app = app.replaceAll("syncSelectionUI(dayId, 'stop', stop.order, true)", "syncSelectionUI(dayId, 'stop', stop.id, true)");
app = app.replaceAll('parkingMarkerKey(dayId, stop.order)', 'parkingMarkerKey(dayId, stop.id)');
app = app.replaceAll('const dayId = `day${date.getDate()}`;', "const dayId = `2026-08-${String(date.getDate()).padStart(2, '0')}`;");
app = app.replace("const scoped = hash.match(/^(east|west)\\/(day\\d+)$/);", "const scoped = hash.match(/^(east|west)\\/(2026-08-\\d{2})$/);");

write('app-runtime.js', app);

let index = fs.readFileSync('index.html', 'utf8');
index = replaceRequired(index,
  `          const panel = document.getElementById(story.dayId);\n          const row = panel?.querySelector(\`.route-row[data-stop-order="\${story.stopOrder}"]\`);`,
  `          const row = story.visitId\n            ? document.querySelector(\`.route-row[data-visit-id="\${CSS.escape(story.visitId)}"]\`)\n            : null;`,
  'story visit attachment'
);
write('index.html', index);

write('scripts/validate-itinerary.mjs', `import fs from 'node:fs';
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
    if (!day.stops.some(stop => stop.id === visitId)) validation.errors.push(\`Renderer day \${day.id} misses route visit \${visitId}\`);
  }
}
for (const story of context.window.CRETE_STORIES || []) {
  if (!story.visitId || !data.visits[story.visitId]) validation.errors.push(\`Story \${story.id} references an unknown visit\`);
  if ('dayId' in story || 'stopOrder' in story) validation.errors.push(\`Story \${story.id} still contains legacy location fields\`);
}
validation.valid = validation.errors.length === 0;

if (!validation.valid) {
  validation.errors.forEach(error => console.error(\`- \${error}\`));
  process.exitCode = 1;
} else {
  console.log(\`Validated native schema v\${data.schemaVersion}: \${renderer.days.length} days, \${Object.keys(data.visits).length} visits, \${Object.keys(data.places).length} places.\`);
}
`);

write('scripts/check-runtime-contract.mjs', `import fs from 'node:fs';

const app = fs.readFileSync('app-runtime.js', 'utf8');
const bootstrap = fs.readFileSync('itinerary-bootstrap.js', 'utf8');
const stories = fs.readFileSync('stories-data.js', 'utf8');
const forbidden = ['window.CRETE_ITINERARY', 'projectLegacyData', 'routeStopOrders', 'data-stop-order', 'dataset.stopOrder', 'legacyVisitIndex'];
const required = ['window.CRETE_RENDERER_MODEL', 'routeVisitIds', 'data-visit-id', 'dataset.visitId'];

for (const token of forbidden) {
  if (app.includes(token) || bootstrap.includes(token) || stories.includes(token)) {
    console.error(\`Native runtime contract failed: legacy token remains: \${token}\`);
    process.exitCode = 1;
  }
}
for (const token of required) {
  if (!app.includes(token) && !bootstrap.includes(token)) {
    console.error(\`Native runtime contract failed: missing \${token}\`);
    process.exitCode = 1;
  }
}
if (!process.exitCode) console.log('Native normalized renderer contract is present.');
`);

let serviceWorker = fs.readFileSync('service-worker.js', 'utf8');
serviceWorker = serviceWorker.replace("const CACHE_VERSION = 'crete-2026-v20';", "const CACHE_VERSION = 'crete-2026-v21';");
serviceWorker = serviceWorker.replace("  './itinerary-source.js',\n", '');
write('service-worker.js', serviceWorker);

write('app.js', `(() => {
  'use strict';

  if (document.readyState !== 'loading') throw new Error('app.js bootstrap must run while the document is loading');
  const scripts = [
    'formatters.js',
    'itinerary-model.js',
    'data-validation.js',
    'itinerary-renderer-model.js',
    'itinerary-bootstrap.js',
    'app-runtime.js'
  ];
  document.write(scripts.map(src => \`<script src="\${src}"><\\/script>\`).join(''));
})();
`);

let readme = fs.readFileSync('README.md', 'utf8');
readme = readme.replace('Stop rows and map markers are connected through `day.id` and `stop.order`.', 'Visit rows, timeline segments, parking markers, stories, and map markers are connected through stable ISO `day.id` and `visit.id`.');
readme = readme.replace('Part-aware hashes use forms such as `#east/day14`, `#west/day15`, `#east`, and `#west`; legacy `#day14` links remain supported.', 'Part-aware hashes use forms such as `#east/2026-08-14`, `#west/2026-08-15`, `#east`, and `#west`.');
readme = readme.replace(/## Data notes[\s\S]*$/, `## Data notes\n\nThe checked-in \`itinerary-data.js\` contains the normalized schema v2 graph. Days reference stable visit IDs; visits reference reusable places and parking entities; routes contain ordered \`visitIds\`. User-facing dates, durations, statuses, booking summaries, and section titles are created by \`formatters.js\` and \`itinerary-renderer-model.js\`.\n`);
write('README.md', readme);

fs.rmSync('itinerary-source.js');
console.log('Native normalized renderer migration prepared.');
