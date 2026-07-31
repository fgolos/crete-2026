import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(path, 'utf8');
const write = (path, content) => fs.writeFileSync(path, content, 'utf8');

function replaceOnce(source, search, replacement, label) {
  const index = source.indexOf(search);
  if (index < 0) throw new Error(`Could not find ${label}`);
  return source.slice(0, index) + replacement + source.slice(index + search.length);
}

function replaceRegex(source, pattern, replacement, label) {
  if (!pattern.test(source)) throw new Error(`Could not find ${label}`);
  pattern.lastIndex = 0;
  return source.replace(pattern, replacement);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'parking';
}

function migrateItinerary() {
  const context = { window: {}, console };
  vm.createContext(context);
  vm.runInContext(read('itinerary-data.js'), context, { filename: 'itinerary-data.js' });
  const data = structuredClone(context.window.CRETE_ITINERARY);
  if (!data?.days) throw new Error('CRETE_ITINERARY is missing days');

  for (const day of data.days) {
    for (const stop of day.stops || []) {
      if (stop.name === 'Airbnb — Ioannou Kondylaki 18, Sitia') stop.name = 'Sitia Airbnb';
    }
  }

  context.window.CRETE_ITINERARY = data;
  vm.runInContext(read('parking-data.js'), context, { filename: 'parking-data.js' });

  const sitiaHome = {
    lat: 35.20981541927463,
    lon: 26.1065768823924,
    navigationQuery: '35.20981541927463,26.1065768823924'
  };
  const sitiaPortParking = {
    lat: 35.20939,
    lon: 26.10724,
    navigationQuery: '35.20939,26.10724'
  };

  for (const day of data.days) {
    for (const stop of day.stops || []) {
      if (stop.name !== 'Sitia Airbnb') continue;
      stop.lat = sitiaHome.lat;
      stop.lon = sitiaHome.lon;
      stop.pointNavigationQuery = sitiaHome.navigationQuery;
      stop.navigationQuery = sitiaPortParking.navigationQuery;
      stop.parking = {
        status: 'recommended',
        primary: {
          name: 'Sitia Port public parking',
          lat: sitiaPortParking.lat,
          lon: sitiaPortParking.lon,
          navigationQuery: sitiaPortParking.navigationQuery,
          type: 'public',
          paid: false,
          walkMinutes: 1,
          reliability: 'high',
          crowding: 'Вечером и в высокий сезон ближайшие места могут быть заняты.',
          summary: 'Бесплатная общественная парковка у порта, примерно в минуте пешком от дома.',
          notes: [
            'Cars are not allowed on Ioannou Kondylaki street.',
            'Для навигации используем парковку у порта, а не адрес дома.',
            'После парковки пройти к Ioannou Kondylaki 18 пешком.'
          ],
          lastVerified: '2026-07-31'
        },
        alternatives: []
      };
    }
  }

  const day11 = data.days.find(day => day.id === 'day11');
  const arrival = day11?.stops?.find(stop => stop.order === 1);
  if (!arrival) throw new Error('Day 11 arrival stop is missing');
  Object.assign(arrival, {
    mode: 'flight',
    drive: '3 ч 20 мин',
    distance: '2 144 км',
    includeInDrivingTotals: false,
    includeInDistanceTotals: false,
    showOnRouteMap: false
  });

  const preferredIds = new Map([
    ['GoMega pickup / airport meeting point', 'heraklion-airport-gomega'],
    ['Mochlos village parking', 'mochlos-village'],
    ['Sitia Port public parking', 'sitia-port'],
    ['Toplou Monastery parking', 'toplou-monastery'],
    ['Hiona Taverna / Chiona beach parking', 'chiona-hiona'],
    ['Ancient Itanos / Erimoupolis parking', 'itanos-erimoupolis'],
    ['Vai Beach Parking', 'vai-main'],
    ['Ziros village parking', 'ziros-village'],
    ['Mazida Ammos beach parking', 'mazida-ammos'],
    ['Taverna Kostas parking', 'taverna-kostas'],
    ['Zakros village parking', 'zakros-village'],
    ['Minoan Palace of Zakros parking', 'minoan-palace-zakros'],
    ['Kato Zakros seafront parking', 'kato-zakros-seafront'],
    ['Parking near Kazarma Fortress', 'kazarma-lower-streets'],
    ['Lastros village parking', 'lastros-village'],
    ['Pomegranate Garden Villa parking', 'pomegranate-villa']
  ]);

  const parkingLocations = {};
  const signatureToId = new Map();

  function registerParking(parking) {
    const signature = `${parking.name}|${parking.lat}|${parking.lon}|${parking.navigationQuery}`;
    if (signatureToId.has(signature)) return signatureToId.get(signature);

    const requested = preferredIds.get(parking.name) || slugify(parking.name);
    let id = requested;
    let suffix = 2;
    while (parkingLocations[id]) id = `${requested}-${suffix++}`;

    parkingLocations[id] = {
      name: parking.name,
      lat: parking.lat,
      lon: parking.lon,
      navigationQuery: parking.navigationQuery,
      type: parking.type,
      paid: parking.paid,
      priceNote: parking.priceNote,
      reliability: parking.reliability,
      crowding: parking.crowding,
      notes: parking.notes || [],
      lastVerified: parking.lastVerified
    };
    Object.keys(parkingLocations[id]).forEach(key => {
      if (parkingLocations[id][key] === undefined || parkingLocations[id][key] === '') delete parkingLocations[id][key];
    });
    signatureToId.set(signature, id);
    return id;
  }

  for (const day of data.days) {
    for (const stop of day.stops || []) {
      const parking = stop.parking;
      if (!parking?.primary) continue;
      const primary = parking.primary;
      const primaryLink = {
        ref: registerParking(primary),
        status: parking.status,
        walkMinutes: primary.walkMinutes,
        summary: primary.summary
      };
      Object.keys(primaryLink).forEach(key => primaryLink[key] === undefined && delete primaryLink[key]);

      const alternatives = (parking.alternatives || []).map(alternative => {
        const link = {
          ref: registerParking(alternative),
          status: 'alternative',
          walkMinutes: alternative.walkMinutes,
          summary: alternative.summary
        };
        Object.keys(link).forEach(key => link[key] === undefined && delete link[key]);
        return link;
      });

      stop.parking = { primary: primaryLink, alternatives };
    }
  }

  const parts = [
    {
      id: 'east',
      title: 'East Crete',
      dates: '11–15 августа',
      base: 'Sitia',
      dayIds: ['day11', 'day12', 'day13', 'day14', 'day15']
    },
    {
      id: 'west',
      title: 'West & Central Crete',
      dates: '15–22 августа',
      base: 'Platanes',
      dayIds: ['day15', 'day16', 'day17', 'day18', 'day19', 'day20', 'day21', 'day22']
    }
  ];

  const normalized = {
    project: data.project,
    parts,
    overview: data.overview,
    parkingLocations,
    days: data.days
  };
  write('itinerary-data.js', `window.CRETE_ITINERARY = ${JSON.stringify(normalized, null, 2)};\n`);
}

function migrateApp() {
  let source = read('app.js');
  const helpers = read('scripts/refactor/app-parking-helpers.txt');
  const fitDayRoute = read('scripts/refactor/app-fit-day-route.txt');
  const renderStopDetail = read('scripts/refactor/app-render-stop-detail.txt');
  const setActiveStop = read('scripts/refactor/app-set-active-stop.txt');
  const initializeMap = read('scripts/refactor/app-initialize-map.txt');

  source = replaceOnce(
    source,
    "  const markerIndex = new Map();\n  const routingIndex = new Map();",
    "  const markerIndex = new Map();\n  const parkingMarkerIndex = new Map();\n  const routingIndex = new Map();",
    'map registries'
  );

  source = replaceOnce(source, '  function buildGoogleMapsUrl(day) {', helpers + '  function buildGoogleMapsUrl(day) {', 'parking helper insertion point');

  source = replaceRegex(
    source,
    /  function buildGoogleMapsUrl\(day\) \{[\s\S]*?\n  function renderTabs\(\) \{/,
    `  function buildGoogleMapsUrl(day) {\n    const routeStops = day.routeStopOrders.map(order => day.stops.find(stop => stop.order === order));\n    const [origin, ...rest] = routeStops;\n    const destination = rest.pop();\n    const params = new URLSearchParams({\n      api: '1',\n      origin: getNavigationQuery(origin),\n      destination: getNavigationQuery(destination),\n      travelmode: 'driving'\n    });\n    if (rest.length) params.set('waypoints', rest.map(getNavigationQuery).join('|'));\n    return \`https://www.google.com/maps/dir/?\${params.toString()}\`;\n  }\n\n  function buildStopNavigationUrl(stop) {\n    const params = new URLSearchParams({\n      api:'1',\n      destination:getNavigationQuery(stop),\n      travelmode:'driving',\n      dir_action:'navigate'\n    });\n    return \`https://www.google.com/maps/dir/?\${params.toString()}\`;\n  }\n\n  function renderTabs() {`,
    'navigation URL functions'
  );

  source = replaceOnce(
    source,
    "          segments.push({\n            type: 'drive',",
    "          segments.push({\n            type: nextStop.mode === 'flight' ? 'flight' : 'drive',",
    'timeline transport type'
  );
  source = replaceOnce(
    source,
    "seg.type === 'drive' ? 'Вождение' : 'Остановка'",
    "seg.type === 'flight' ? 'Перелёт' : seg.type === 'drive' ? 'Вождение' : 'Остановка'",
    'timeline aria label'
  );
  source = replaceOnce(
    source,
    'data-stop-order="${stop.order}" aria-label=',
    'data-stop-order="${stop.order}" data-mode="${escapeHtml(stop.mode || \'stop\')}" aria-label=',
    'route row mode'
  );

  source = replaceRegex(source, /  function fitDayRoute\(dayId\) \{[\s\S]*?\n  function renderStopDetail\(dayId,order\) \{/, fitDayRoute + '  function renderStopDetail(dayId,order) {', 'fitDayRoute');
  source = replaceRegex(source, /  function renderStopDetail\(dayId,order\) \{[\s\S]*?\n  function syncSelectionUI\(/, renderStopDetail + '  function syncSelectionUI(', 'renderStopDetail');
  source = replaceRegex(source, /  function setActiveStop\(dayId,order,focusMap = false\) \{[\s\S]*?\n  function selectStop\(/, setActiveStop + '  function selectStop(', 'setActiveStop');
  source = replaceRegex(source, /  function initializeMap\(dayId\) \{[\s\S]*?\n  function activatePanel\(/, initializeMap + '  function activatePanel(', 'initializeMap');

  source = replaceOnce(
    source,
    "      markerIndex.forEach(({ element }, key) => {\n        if (key.startsWith(`${dayId}:`) && element) element.classList.remove('is-hovered');\n      });",
    "      markerIndex.forEach(({ element }, key) => {\n        if (key.startsWith(`${dayId}:`) && element) element.classList.remove('is-hovered');\n      });\n      clearParkingMarkerState(dayId, 'is-hovered');",
    'parking hover reset'
  );
  source = replaceOnce(
    source,
    "      markerIndex.forEach(({ element }, key) => {\n        if (key.startsWith(`${dayId}:`) && element) element.classList.remove('is-active');\n      });",
    "      markerIndex.forEach(({ element }, key) => {\n        if (key.startsWith(`${dayId}:`) && element) element.classList.remove('is-active');\n      });\n      clearParkingMarkerState(dayId, 'is-active');",
    'parking active reset'
  );
  source = replaceOnce(
    source,
    "      marker?.element?.classList.add(isHover ? 'is-hovered' : 'is-active');",
    "      marker?.element?.classList.add(isHover ? 'is-hovered' : 'is-active');\n      setParkingMarkerState(dayId, selectedOrder, isHover ? 'is-hovered' : 'is-active');",
    'parking marker selection'
  );

  source = replaceOnce(
    source,
    "    const bounds = day.stops.filter(stop => stop.mapVisible).map(stop => [stop.lat,stop.lon]);",
    "    const bounds = day.stops.filter(stop => stop.mapVisible).map(stop => [stop.lat,stop.lon]);\n    routeStops.forEach(stop => bounds.push(getDrivingCoordinates(stop)));",
    'route bounds'
  );
  source = replaceOnce(
    source,
    "      waypoints: routeStops.map(stop => L.latLng(stop.lat,stop.lon)),",
    "      waypoints: routeStops.map(stop => L.latLng(...getDrivingCoordinates(stop))),",
    'route parking waypoints'
  );
  source = replaceOnce(
    source,
    "      [previousStop.lat, previousStop.lon],\n      [currentStop.lat, currentStop.lon]",
    "      getDrivingCoordinates(previousStop),\n      getDrivingCoordinates(currentStop)",
    'drive fallback bounds'
  );

  source = replaceOnce(
    source,
    "          if (cellIndex === 2 && cell.textContent.trim() !== '—') {",
    "          if (row.dataset.mode !== 'flight' && cellIndex === 2 && cell.textContent.trim() !== '—') {",
    'flight table click'
  );
  source = replaceOnce(
    source,
    "        const isDriveCell = cellIndex === 2 && cell.textContent.trim() !== '—';",
    "        const isDriveCell = row.dataset.mode !== 'flight' && cellIndex === 2 && cell.textContent.trim() !== '—';",
    'flight table hover'
  );
  source = replaceOnce(
    source,
    "  function render() {\n    projectTitle.textContent",
    "  function render() {\n    validateParkingReferences();\n    projectTitle.textContent",
    'parking validation call'
  );

  write('app.js', source);
}

function migrateStyles() {
  let styles = read('styles.css').trimEnd();
  const parkingStyles = read('parking-ui.css').trim();
  styles += `\n\n/* ==================================================\n   Parking\n   ================================================== */\n${parkingStyles}\n\n/* Transport variants */\n.timeline-flight{background:#5f6bb8;color:#fff;cursor:default}.route-row[data-mode="flight"] td:nth-child(3),.route-row[data-mode="flight"] td:nth-child(4){cursor:default}\n`;
  write('styles.css', styles);
}

function migrateShell() {
  let index = read('index.html');
  index = index.replace('  <script src="itinerary-transport.js"></script>\n', '');
  write('index.html', index);

  let worker = read('service-worker.js');
  worker = worker.replace("const CACHE_VERSION = 'crete-2026-v10';", "const CACHE_VERSION = 'crete-2026-v11';");
  for (const asset of ['./parking-ui.css', './itinerary-transport.js', './parking-data.js', './parking-ui.js']) {
    worker = worker.replace(`  '${asset}',\n`, '');
  }
  write('service-worker.js', worker);
}

function updateReadme() {
  let readme = read('README.md');
  readme = readme.replace(
    '- `itinerary-data.js` — the single source of truth for itinerary content, stops, coordinates, timings, notes, bookings, and route order.',
    '- `itinerary-data.js` — the single source of truth for itinerary content, trip parts, stops, coordinates, timings, notes, bookings, route order, and reusable parking locations.'
  );
  readme = readme.replace(
    '- `stops` — visible itinerary rows and marker data;',
    '- `stops` — visible itinerary rows, marker data, and references to parking locations;'
  );
  readme = readme.replace(
    'Use `navigationQuery` for the value passed to Google Maps. It may be coordinates or a human-readable address.',
    'Use `navigationQuery` for the value passed to Google Maps. It may be coordinates or a human-readable address. Physical parking points live once in `parkingLocations`; stops reference them through `parking.primary.ref` and optional alternative references.'
  );
  write('README.md', readme);
}

function cleanUp() {
  const files = [
    'itinerary-transport.js',
    'parking-data.js',
    'parking-ui.js',
    'parking-ui.css',
    'scripts/refactor/app-parking-helpers.txt',
    'scripts/refactor/app-initialize-map.txt',
    'scripts/refactor/app-render-stop-detail.txt',
    'scripts/refactor/app-fit-day-route.txt',
    'scripts/refactor/app-set-active-stop.txt',
    'scripts/refactor-itinerary.mjs',
    '.github/workflows/refactor-itinerary.yml'
  ];
  for (const file of files) {
    if (fs.existsSync(file)) fs.rmSync(file);
  }
  if (fs.existsSync('scripts/refactor') && fs.readdirSync('scripts/refactor').length === 0) fs.rmdirSync('scripts/refactor');
}

migrateItinerary();
migrateApp();
migrateStyles();
migrateShell();
updateReadme();
cleanUp();
console.log('Itinerary, parking, transport, UI, styles, offline cache, and documentation migrated.');
