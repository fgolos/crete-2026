# Crete 2026 itinerary

Static GitHub Pages site for the family itinerary.

## Architecture

- `index.html` — minimal semantic shell and external library loading.
- `styles.css` — presentation and responsive/print rules.
- `app.js` — rendering, tabs, maps, route links, and list-to-marker interaction.
- `itinerary-data.js` — the single source of truth for itinerary content, stops, coordinates, timings, notes, bookings, and route order.
- `stories-data.js` — audio-guide stories attached to itinerary stops.
- `pronunciations-data.js` — replacements used only when generating Russian speech; display names remain unchanged.
- `story-ui.js` and `story-ui.css` — story dialog and MP3 player.
- `scripts/generate-audio.mjs` — Azure Speech MP3 generator.
- `service-worker.js` — versioned offline caching and update lifecycle.
- `manifest.webmanifest` — installable app metadata.
- `icon.svg` — local app and browser icon.

## Editing contract

### Route/content changes

Edit only `itinerary-data.js` whenever possible. This preserves the current look and feel and all interaction logic.

### Audio-guide content

Edit `stories-data.js`. Keep the visible Google Maps spelling in story text; pronunciation substitutions belong in `pronunciations-data.js`.

### Visual changes

Edit `styles.css`. Audio-guide-only presentation belongs in `story-ui.css`.

### Behaviour changes

Edit `app.js`. Stop rows and map markers are connected through `day.id` and `stop.order`. Audio-guide-only behaviour belongs in `story-ui.js`.

### Page structure or external dependencies

Edit `index.html` only when the shell or loaded assets must change.

Every push to `main` automatically deploys to GitHub Pages.

## Generating MP3 audio with Azure Speech

Requires Node.js 18 or newer and an Azure Speech resource.

1. Copy `.env.example` to `.env`.
2. Put the local Azure Speech key and resource region in `.env`. Never commit this file.
3. Preview the expected work without calling Azure:

```bash
npm run audio:dry-run
```

4. Generate three short voice previews for the Mochlos story:

```bash
npm run audio:preview
```

Preview files are written to `audio/previews/` and intentionally ignored by Git.

5. Generate all missing story MP3 files:

```bash
npm run audio:generate
```

Useful targeted commands:

```bash
node scripts/generate-audio.mjs --story mochlos
node scripts/generate-audio.mjs --story mochlos --force
node scripts/generate-audio.mjs --story mochlos --voice ru-RU-SvetlanaNeural
```

The generator sends SSML to Azure Speech, writes `audio/<story-id>.mp3`, and updates that story's `audio` field in `stories-data.js`. Existing MP3 files are skipped unless `--force` is used.

## Offline support

The site registers `service-worker.js` on HTTP/HTTPS and caches the local application shell, Leaflet dependencies, fonts, story UI, and the overview image. MP3 files are cached by the network-first same-origin handler after they are first requested. Plan, Notes, stop details, stories, and cached UI assets remain available offline. OSRM responses and OpenStreetMap tiles are not cached; the existing route fallback handles routing outages and maps may have a blank background without previously available browser data.

Test locally with `python -m http.server 8000`, open `http://127.0.0.1:8000`, reload once after the service worker activates, then switch the browser network to Offline and reload. Service workers do not run from `file://` URLs.

Increment `CACHE_VERSION` in `service-worker.js` when changing the offline asset list or caching behavior. Normal local app updates use network-first caching and do not require a version bump.

## Previewing date-aware opening

Without a day in the URL hash, the site opens the matching itinerary day from 11–15 August 2026 and opens Overview on other dates. Use `?date=2026-08-12` to preview a trip date without changing the system clock. An explicit hash still wins, for example `?date=2026-08-12#day14` opens 14 August.

## Data notes

Each day contains:

- `meta` — compact summary fields;
- `stops` — visible itinerary rows and marker data;
- `routeStopOrders` — the exact driving-route sequence;
- `sections` — essentials, food, and practical notes.

For a stop that should appear in the text but not on the map, set `mapVisible: false`.
Use `navigationQuery` for the value passed to Google Maps. It may be coordinates or a human-readable address.
