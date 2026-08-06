# Crete 2026 itinerary

Static GitHub Pages application for the family itinerary.

## Architecture

- `index.html` — semantic shell, external library loading, and the integrated story dialog/audio-guide UI.
- `styles.css` — presentation and responsive/print rules for the core itinerary interface.
- `app.js` — parser-blocking runtime bootstrap and load order.
- `app-runtime.js` — itinerary rendering, navigation, maps, routes, parking interaction, PWA status and event handling.
- `itinerary-data.js` — immutable normalized schema v2 and the single itinerary source of truth.
- `itinerary-model.js` — entity selectors and relationship traversal.
- `itinerary-renderer-model.js` — presentation-facing read model built from normalized entities.
- `formatters.js` — user-facing dates, durations, distances, statuses and labels.
- `data-validation.js` — normalized-data and reference validation.
- `itinerary-bootstrap.js` — validation and creation of `CRETE_MODEL` / `CRETE_RENDERER_MODEL`.
- `stories-data.js` — audio-guide stories attached to stable `visitId` values.
- `pronunciations-data.js` — replacements used only when generating Russian speech; display names remain unchanged.
- `scripts/generate-audio.mjs` — Azure Speech MP3 generator.
- `scripts/validate-itinerary.mjs` — schema and story-reference validation.
- `scripts/check-runtime-contract.mjs` — rejects obsolete compatibility contracts.
- `scripts/smoke-browser.mjs` — headless Chrome smoke test for overview, East and West views.
- `service-worker.js` — versioned offline caching and update lifecycle.
- `manifest.webmanifest` — installable app metadata.
- `icon.svg` — local app and browser icon.

## Editing contract

### Route and content changes

Edit the normalized entities in `itinerary-data.js`:

- days reference visits by stable `visitIds`;
- visits reference reusable places and parking entities;
- routes store ordered `visitIds`;
- numeric visit `sequence` is display order, not identity.

Do not add a second itinerary object or reconnect features through row numbers.

### Formatting and presentation data

Add user-facing formatting rules to `formatters.js`. Add presentation-facing derived fields to `itinerary-renderer-model.js`. Keep domain entities independent from HTML and interface labels whenever the value can be represented structurally.

### Audio-guide content

Edit `stories-data.js`. Every story references a stable `visitId`. Keep visible Google Maps spelling in story text; pronunciation substitutions belong in `pronunciations-data.js`.

The spoken version uses the story title, main text, and the complete `lookFor` section. A custom `narration.blocks` array may control phrasing and voice settings, but the visible main text should remain identical to the spoken main text so listeners can follow along.

### Visual changes

Edit `styles.css` for the core interface. Story-dialog and audio-guide presentation currently lives in the integrated story UI block in `index.html`.

### Behaviour changes

Use `app-runtime.js` for interface behaviour, `itinerary-model.js` for entity traversal, and `itinerary-renderer-model.js` for presentation read models. Visit rows, timeline segments, parking markers, stories, and map markers are connected through ISO `day.id` and stable `visit.id`.

### Page structure or external dependencies

Edit `index.html` when the shell, loaded assets, or integrated story UI must change. `app.js` should remain a small, explicit load-order bootstrap.

Every push to `main` automatically deploys to GitHub Pages.

## Validation

Run before merging runtime or data changes:

```bash
node scripts/validate-itinerary.mjs
node scripts/check-runtime-contract.mjs
node scripts/smoke-browser.mjs
```

The browser smoke test requires Chrome or Chromium and starts a temporary local server. GitHub Actions runs all three checks automatically.

## Generating MP3 audio with Azure Speech

Requires Node.js 18 or newer and an Azure Speech resource.

1. Copy `.env.example` to `.env`.
2. Put the local Azure Speech key and resource region in `.env`. Never commit this file.
3. Preview the expected work without calling Azure:

```bash
npm run audio:dry-run
```

4. Generate short voice or narration previews:

```bash
npm run audio:preview
node scripts/generate-audio.mjs --story mochlos --preview-variants
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

The generator sends SSML to Azure Speech, writes `audio/<story-id>.mp3`, measures the resulting MP3, and updates both `audio` and `durationSeconds` in `stories-data.js`. Existing MP3 files are skipped unless `--force` is used, but their duration is still measured and synchronized when the generator encounters them.

Before an MP3 exists, the interface estimates listening time from the title, story text, and `lookFor` content and marks the value with `≈`. Once an MP3 has been generated, the compact button still shows rounded minutes while the player shows the exact `m:ss` duration.

## Offline support

The site registers `service-worker.js` on HTTP/HTTPS and caches the local application shell, normalized data, renderer modules, Leaflet dependencies, fonts, the integrated story UI, and the overview image. MP3 files are cached by the network-first same-origin handler after they are first requested. Plan, Notes, stop details, stories, and cached UI assets remain available offline. OSRM responses and OpenStreetMap tiles are not cached; the route fallback handles routing outages and maps may have a blank background without previously available browser data.

Test locally with `python -m http.server 8000`, open `http://127.0.0.1:8000`, reload once after the service worker activates, then switch the browser network to Offline and reload. Service workers do not run from `file://` URLs.

Increase `CACHE_VERSION` in `service-worker.js` after important runtime JS/CSS changes, changes to the offline asset list, or changes to caching behaviour.

## Previewing date-aware opening

Without an explicit hash, the site opens the matching itinerary day during 11–22 August 2026. Use `?date=2026-08-12` to preview a trip date without changing the system clock. Part-aware hashes use forms such as `#east/2026-08-14`, `#west/2026-08-15`, `#east`, and `#west`.
