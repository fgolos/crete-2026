# Crete 2026 itinerary

Static GitHub Pages site for the family itinerary.

## Architecture

- `index.html` — semantic shell, external library loading, and the integrated story dialog/audio-guide UI.
- `styles.css` — presentation and responsive/print rules for the core itinerary interface.
- `app.js` — rendering, trip-part and day navigation, maps, route links, parking UI, and list-to-marker interaction.
- `itinerary-data.js` — the single source of truth for itinerary content, trip parts, stops, coordinates, timings, notes, bookings, route order, and reusable parking locations.
- `stories-data.js` — audio-guide stories attached to itinerary stops, including optional narration settings, generated MP3 paths, and measured audio duration.
- `pronunciations-data.js` — replacements used only when generating Russian speech; display names remain unchanged.
- `scripts/generate-audio.mjs` — Azure Speech MP3 generator.
- `service-worker.js` — versioned offline caching and update lifecycle.
- `manifest.webmanifest` — installable app metadata.
- `icon.svg` — local app and browser icon.

## Editing contract

### Route/content changes

Edit only `itinerary-data.js` whenever possible. This preserves the current look and feel and all interaction logic.

### Audio-guide content

Edit `stories-data.js`. Keep the visible Google Maps spelling in story text; pronunciation substitutions belong in `pronunciations-data.js`.

The spoken version uses the story title, main text, and the complete `lookFor` section. A custom `narration.blocks` array may control phrasing and voice settings, but the visible main text should remain identical to the spoken main text so listeners can follow along.

### Visual changes

Edit `styles.css` for the core interface. Story-dialog and audio-guide presentation currently lives in the integrated story UI block in `index.html`.

### Behaviour changes

Edit `app.js` for the core itinerary interface. Visit rows, timeline segments, parking markers, stories, and map markers are connected through stable ISO `day.id` and `visit.id`. Story-dialog and audio-guide behaviour currently lives in the integrated story UI block in `index.html`.

### Page structure or external dependencies

Edit `index.html` when the shell, loaded assets, or integrated story UI must change.

Every push to `main` automatically deploys to GitHub Pages.

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

The site registers `service-worker.js` on HTTP/HTTPS and caches the local application shell, Leaflet dependencies, fonts, the integrated story UI, and the overview image. MP3 files are cached by the network-first same-origin handler after they are first requested. Plan, Notes, stop details, stories, and cached UI assets remain available offline. OSRM responses and OpenStreetMap tiles are not cached; the existing route fallback handles routing outages and maps may have a blank background without previously available browser data.

Test locally with `python -m http.server 8000`, open `http://127.0.0.1:8000`, reload once after the service worker activates, then switch the browser network to Offline and reload. Service workers do not run from `file://` URLs.

Increment `CACHE_VERSION` in `service-worker.js` when changing the offline asset list or caching behavior. Normal local app updates use network-first caching and do not require a version bump.

## Previewing date-aware opening

Without an explicit hash, the site opens the matching ready itinerary day during 11–22 August 2026. Dates whose days are not added yet open the relevant trip-part overview. Use `?date=2026-08-12` to preview a trip date without changing the system clock. Part-aware hashes use forms such as `#east/2026-08-14`, `#west/2026-08-15`, `#east`, and `#west`.

## Data notes

The checked-in `itinerary-data.js` contains the normalized schema v2 graph. Days reference stable visit IDs; visits reference reusable places and parking entities; routes contain ordered `visitIds`. User-facing dates, durations, statuses, booking summaries, and section titles are created by `formatters.js` and `itinerary-renderer-model.js`.
