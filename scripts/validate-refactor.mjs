import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const read = path => fs.readFileSync(path, 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

for (const file of ['app.js', 'itinerary-data.js', 'stories-data.js', 'service-worker.js']) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}

const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(read('itinerary-data.js'), context, { filename: 'itinerary-data.js' });
const data = context.window.CRETE_ITINERARY;

assert(data?.days?.length === 5, 'Expected the five current East Crete days');
assert(Array.isArray(data.parts) && data.parts.length === 2, 'Expected East and West trip parts');
assert(data.parts.find(part => part.id === 'east')?.dayIds.includes('day15'), 'day15 must belong to East');
assert(data.parts.find(part => part.id === 'west')?.dayIds.includes('day15'), 'day15 must belong to West');
assert(data.parkingLocations && Object.keys(data.parkingLocations).length >= 10, 'Parking catalogue is missing');

const missingRefs = [];
const stopsWithoutParking = [];
for (const day of data.days) {
  for (const stop of day.stops || []) {
    const links = [stop.parking?.primary, ...(stop.parking?.alternatives || [])].filter(Boolean);
    for (const link of links) {
      if (!data.parkingLocations[link.ref]) missingRefs.push(`${day.id}:${stop.order}:${link.ref}`);
    }
    if (stop.name !== 'Vilnius Airport' && !stop.parking?.primary) {
      stopsWithoutParking.push(`${day.id}:${stop.order}:${stop.name}`);
    }
  }
}
assert(missingRefs.length === 0, `Missing parking references: ${missingRefs.join(', ')}`);
assert(stopsWithoutParking.length === 0, `Stops without parking: ${stopsWithoutParking.join(', ')}`);

const sitiaStops = data.days.flatMap(day => day.stops).filter(stop => stop.name === 'Sitia Airbnb');
assert(sitiaStops.length >= 5, 'Expected repeated Sitia Airbnb stops');
assert(sitiaStops.every(stop => stop.parking?.primary?.ref === 'sitia-port'), 'All Sitia Airbnb stops must reuse sitia-port');
assert(!data.days.flatMap(day => day.stops).some(stop => stop.name.includes('Ioannou Kondylaki 18')), 'Old public stop name remains');

const arrival = data.days.find(day => day.id === 'day11')?.stops.find(stop => stop.order === 1);
assert(arrival?.mode === 'flight', 'Day 11 arrival must use flight mode');
assert(arrival?.includeInDrivingTotals === false, 'Flight must be excluded from driving totals');
assert(arrival?.includeInDistanceTotals === false, 'Flight must be excluded from distance totals');

for (const removed of ['itinerary-transport.js', 'parking-data.js', 'parking-ui.js', 'parking-ui.css']) {
  assert(!fs.existsSync(removed), `${removed} should be removed`);
}

const app = read('app.js');
const index = read('index.html');
const worker = read('service-worker.js');
const styles = read('styles.css');
assert(!app.includes('L.map = function patchedMap'), 'Leaflet map monkey patch remains');
assert(!app.includes('MutationObserver'), 'Parking MutationObserver remains');
assert(!index.includes('itinerary-transport.js'), 'index still loads itinerary-transport.js');
for (const removed of ['parking-ui.css', 'parking-data.js', 'parking-ui.js', 'itinerary-transport.js']) {
  assert(!worker.includes(removed), `service worker still caches ${removed}`);
}
assert(worker.includes("crete-2026-v11"), 'Cache version was not incremented');
assert(styles.includes('.parking-marker'), 'Parking styles were not merged');
assert(app.includes('getDrivingCoordinates'), 'Parking-aware route logic is missing');
assert(app.includes('parkingCardHtml'), 'Parking details are missing');

fs.rmSync('scripts/validate-refactor.mjs');
fs.rmSync('.github/workflows/validate-refactor.yml');
console.log('Refactor validation passed.');
