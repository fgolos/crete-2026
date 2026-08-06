import fs from 'node:fs';

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`Missing expected source for ${label}`);
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected exactly one source occurrence for ${label}`);
  }
  return source.replace(before, after);
}

const runtimePath = 'app-runtime.js';
let runtime = fs.readFileSync(runtimePath, 'utf8');
runtime = replaceOnce(
  runtime,
  "    const detail = document.querySelector(`#${dayId} .stop-detail`);",
  "    const detail = document.getElementById(dayId)?.querySelector('.stop-detail');",
  'stop detail lookup'
);
runtime = replaceOnce(
  runtime,
  "      document.querySelector(`#${dayId} .stop-detail`)?.focus({ preventScroll:true });",
  "      document.getElementById(dayId)?.querySelector('.stop-detail')?.focus({ preventScroll:true });",
  'stop detail focus'
);
runtime = replaceOnce(
  runtime,
  "    const status = document.querySelector(`#${dayId} .route-status`);",
  "    const status = document.getElementById(dayId)?.querySelector('.route-status');",
  'route status lookup'
);
runtime = replaceOnce(
  runtime,
  "    const visibleStops = day.stops.filter(stop => stop.mapVisible !== false);",
  "    fitDayRoute(dayId);\n\n    const visibleStops = day.stops.filter(stop => stop.mapVisible !== false);",
  'initial day map bounds'
);
if (runtime.includes('document.querySelector(`#${dayId}')) {
  throw new Error('Unsafe ISO day ID selector remains in app-runtime.js');
}
fs.writeFileSync(runtimePath, runtime);

const contractPath = 'scripts/check-runtime-contract.mjs';
let contract = fs.readFileSync(contractPath, 'utf8');
contract = replaceOnce(
  contract,
  "  'buildLegacyDayMeta'\n];",
  "  'buildLegacyDayMeta',\n  'document.querySelector(`#${dayId}'\n];",
  'unsafe day selector contract'
);
fs.writeFileSync(contractPath, contract);

const smokePath = 'scripts/smoke-browser.mjs';
let smoke = fs.readFileSync(smokePath, 'utf8');
smoke = replaceOnce(
  smoke,
  "      finish(null, stdout);",
  "      if (/Failed to execute 'querySelector'|Set map center and zoom first/.test(stderr)) {\n        finish(new Error(`Browser runtime error for ${url}: ${stderr}`));\n        return;\n      }\n      finish(null, stdout);",
  'browser runtime error detection'
);
smoke = replaceOnce(
  smoke,
  "  assertIncludes(eastDay, 'Открыть в Google Maps', 'east day map action');",
  "  assertIncludes(eastDay, 'Открыть в Google Maps', 'east day map action');\n  assertIncludes(eastDay, 'class=\"numbered-marker', 'east day Leaflet markers');",
  'east day marker assertion'
);
smoke = replaceOnce(
  smoke,
  "  assertIncludes(westDay, 'Памятка', 'west day mobile controls');",
  "  assertIncludes(westDay, 'Памятка', 'west day mobile controls');\n  assertIncludes(westDay, 'class=\"numbered-marker', 'west day Leaflet markers');",
  'west day marker assertion'
);
fs.writeFileSync(smokePath, smoke);

console.log('Day map selectors, initial bounds and smoke coverage were updated.');
