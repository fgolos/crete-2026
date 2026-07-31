import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(path, 'utf8');
const write = (path, content) => fs.writeFileSync(path, content, 'utf8');

function replaceOnce(source, search, replacement, label) {
  const index = source.indexOf(search);
  if (index < 0) throw new Error(`Could not find ${label}`);
  return source.slice(0, index) + replacement + source.slice(index + search.length);
}

const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(read('itinerary-data.js'), context, { filename: 'itinerary-data.js' });
const data = context.window.CRETE_ITINERARY;

const sitiaNotes = [
  'Cars are not allowed on Ioannou Kondylaki street.',
  'Для навигации используем парковку у порта, а не адрес дома.',
  'После парковки пройти к Ioannou Kondylaki 18 пешком.'
];
if (data.parkingLocations?.['sitia-port']) {
  data.parkingLocations['sitia-port'].notes = [
    'Следовать дорожным знакам и не блокировать проезд по территории порта.'
  ];
}
for (const day of data.days || []) {
  for (const stop of day.stops || []) {
    if (stop.name === 'Sitia Airbnb' && stop.parking?.primary?.ref === 'sitia-port') {
      stop.parking.primary.notes = sitiaNotes;
    }
  }
}
write('itinerary-data.js', `window.CRETE_ITINERARY = ${JSON.stringify(data, null, 2)};\n`);

let app = read('app.js');
const focusHelpers = `  function positionParkingBesideDetail(dayId, stop) {
    const parking = getPrimaryParking(stop);
    const map = maps.get(dayId);
    if (!parking || !map) return;

    const panel = document.getElementById(dayId);
    const detail = panel?.querySelector('.stop-detail');
    const coordinates = isSeparateParking(stop) ? [parking.lat, parking.lon] : [stop.lat, stop.lon];
    const zoom = Math.max(map.getZoom(), 16);
    map.setView(coordinates, zoom, { animate:true });
    if (!detail || detail.hidden) return;

    requestAnimationFrame(() => requestAnimationFrame(() => {
      map.invalidateSize({ pan:false });
      const mapSize = map.getSize();
      const cardRect = detail.getBoundingClientRect();
      const mapRect = map.getContainer().getBoundingClientRect();
      const currentPoint = map.latLngToContainerPoint(coordinates);
      let desiredX;
      let desiredY;

      if (mobileViewport.matches) {
        const cardTopInsideMap = Math.max(0, Math.min(mapSize.y, cardRect.top - mapRect.top));
        const freeBottom = Math.max(96, cardTopInsideMap - 20);
        desiredX = mapSize.x * 0.5;
        desiredY = Math.max(72, freeBottom * 0.48);
      } else {
        const cardRightInsideMap = Math.max(0, Math.min(mapSize.x, cardRect.right - mapRect.left));
        const freeLeft = Math.min(mapSize.x - 48, cardRightInsideMap + 32);
        desiredX = freeLeft + Math.max(0, mapSize.x - freeLeft) * 0.52;
        desiredY = Math.max(72, mapSize.y * 0.34);
      }

      map.panBy([
        Math.round(currentPoint.x - desiredX),
        Math.round(currentPoint.y - desiredY)
      ], { animate:true, duration:.35 });
    }));
  }

  function scheduleParkingFocus(dayId, stop) {
    const delay = mobileViewport.matches ? 180 : 0;
    setTimeout(() => positionParkingBesideDetail(dayId, stop), delay);
  }

`;
app = replaceOnce(app, '  function clearParkingMarkerState(dayId, className) {', focusHelpers + '  function clearParkingMarkerState(dayId, className) {', 'parking focus insertion point');
app = replaceOnce(
  app,
  `  function selectStop(dayId,order,focusMap = false) {
    clearActiveDrive(dayId);
    setActiveStop(dayId,order,focusMap);
    renderStopDetail(dayId,order);
    syncSelectionUI(dayId, 'stop', order);
  }`,
  `  function selectStop(dayId,order,focusMap = false) {
    const day = data.days.find(item => item.id === dayId);
    const stop = day?.stops.find(item => item.order === Number(order));
    clearActiveDrive(dayId);
    setActiveStop(dayId,order,focusMap);
    renderStopDetail(dayId,order);
    syncSelectionUI(dayId, 'stop', order);
    if (stop) scheduleParkingFocus(dayId, stop);
  }`,
  'selectStop'
);
write('app.js', app);

fs.rmSync('scripts/finalize-refactor.mjs');
fs.rmSync('.github/workflows/finalize-refactor.yml');
console.log('Refactor focus behaviour and parking relation data finalized.');
