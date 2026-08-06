import fs from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({ window: {}, Object, Array, Map, Set, Number, String, RegExp, Error });
vm.runInContext(fs.readFileSync('itinerary-data.js', 'utf8'), context, { filename: 'itinerary-data.js' });
const data = JSON.parse(JSON.stringify(context.window.CRETE_DATA));

function parseTimeRange(value) {
  if (!value) return null;
  const text = String(value).trim();
  const times = text.match(/\d{1,2}:\d{2}/g) || [];
  if (!times.length) throw new Error(`Cannot parse time range: ${value}`);
  return {
    start: times[0].padStart(5, '0'),
    end: times[1]?.padStart(5, '0') || null,
    approximate: /^около\s+/i.test(text)
  };
}

function parseDeadline(value) {
  return value?.match(/\d{1,2}:\d{2}/)?.[0]?.padStart(5, '0') || null;
}

function parseFlight(value) {
  if (!value) return null;
  const [numberPart] = value.split('·');
  const departureTime = parseDeadline(value);
  return numberPart.trim() && departureTime
    ? { number: numberPart.trim(), departureTime }
    : null;
}

const durationKindByLabel = {
  'Вылет': 'departure',
  'Заселение и отдых': 'check-in-rest',
  'Старт': 'start',
  'Финиш': 'finish',
  'Аэропорт': 'airport'
};

data.trip.logistics = {
  flights: [
    {
      id: 'flight-outbound',
      direction: 'outbound',
      number: 'HN 2321',
      origin: 'Vilnius',
      destination: 'Heraklion',
      departureAt: '2026-08-11T05:15:00+03:00',
      arrivalAt: '2026-08-11T08:35:00+03:00'
    },
    {
      id: 'flight-return',
      direction: 'return',
      number: 'HN 2322',
      origin: 'Heraklion',
      destination: 'Vilnius',
      departureAt: '2026-08-22T17:55:00+03:00',
      arrivalAt: '2026-08-22T21:20:00+03:00'
    }
  ],
  carRental: {
    category: 'Station Wagon Manual',
    pickupAt: '2026-08-11T10:00:00+03:00',
    pickupApproximate: true,
    returnDeadline: '2026-08-22T14:00:00+03:00'
  },
  accommodations: [
    {
      id: 'stay-sitia',
      baseName: 'Sitia',
      checkInAt: '2026-08-11T12:00:00+03:00',
      checkOutAt: '2026-08-15T12:00:00+03:00'
    },
    {
      id: 'stay-platanes',
      baseName: 'Platanes',
      checkInAt: '2026-08-15T13:00:00+03:00',
      checkOutAt: '2026-08-22T11:00:00+03:00'
    }
  ]
};

for (const day of Object.values(data.days)) {
  const metrics = day.metrics || {};
  const hints = day.metricDisplayHints || {};
  if (String(metrics.status || '').toLowerCase().includes('резерв')) day.status = 'draft-reserve';
  day.schedule = {
    departure: parseTimeRange(metrics.departureTime),
    finish: parseTimeRange(metrics.finishTime),
    carReturnDeadline: parseDeadline(metrics.carReturn),
    flight: parseFlight(metrics.flight)
  };
  day.travelTotals = {
    drivingDurationMinutes: metrics.drivingDurationMinutes,
    distanceKm: metrics.distanceKm,
    approximate: /^около\s+/i.test(hints.drivingDurationMinutes || '')
      || /^около\s+/i.test(hints.distanceKm || '')
  };
  day.swimming = metrics.swimming || null;
  delete day.metrics;
  delete day.metricDisplayHints;
}

for (const visit of Object.values(data.visits)) {
  const timingLabel = visit.timing?.label;
  visit.timing = parseTimeRange(timingLabel);
  visit.durationKind = Number.isFinite(visit.durationMinutes)
    ? null
    : durationKindByLabel[visit.durationDisplayHint] || null;
  delete visit.durationDisplayHint;

  const travel = visit.inboundTravel || {};
  const durationHint = travel.displayHints?.duration;
  if (Number.isFinite(travel.durationMinutes) && Number.isFinite(travel.distanceKm)) {
    travel.status = 'standard';
  } else if (durationHint === 'шаттл прокатчика') {
    travel.status = 'rental-shuttle';
  } else {
    travel.status = 'none';
  }
  delete travel.displayHints;
}

const output = `(() => {\n  'use strict';\n\n  function deepFreeze(value) {\n    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;\n    Object.freeze(value);\n    for (const child of Object.values(value)) deepFreeze(child);\n    return value;\n  }\n\n  window.CRETE_DATA = deepFreeze(${JSON.stringify(data, null, 2)});\n})();\n`;
fs.writeFileSync('itinerary-data.js', output);

const indexPath = 'index.html';
let index = fs.readFileSync(indexPath, 'utf8');
const oldInit = `      function init() {\n        requestAnimationFrame(() => requestAnimationFrame(attachStoryButtons));\n      }`;
const newInit = `      function init() {\n        attachStoryButtons();\n        requestAnimationFrame(() => requestAnimationFrame(attachStoryButtons));\n      }`;
if (!index.includes(oldInit)) throw new Error('Story initialization patch target was not found');
fs.writeFileSync(indexPath, index.replace(oldInit, newInit));

const serviceWorkerPath = 'service-worker.js';
let serviceWorker = fs.readFileSync(serviceWorkerPath, 'utf8');
if (!serviceWorker.includes("const CACHE_VERSION = 'crete-2026-v22';")) throw new Error('Expected cache v22');
serviceWorker = serviceWorker.replace("const CACHE_VERSION = 'crete-2026-v22';", "const CACHE_VERSION = 'crete-2026-v23';");
fs.writeFileSync(serviceWorkerPath, serviceWorker);

fs.rmSync('scripts/report-data-hints.mjs', { force: true });
console.log('Presentation hints were replaced with structured domain values.');
