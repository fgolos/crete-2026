# Crete 2026 itinerary

Static GitHub Pages site for the family itinerary.

## Architecture

- `index.html` — minimal semantic shell and external library loading.
- `styles.css` — presentation and responsive/print rules.
- `app.js` — rendering, tabs, maps, route links, and list-to-marker interaction.
- `itinerary-data.js` — the single source of truth for itinerary content, stops, coordinates, timings, notes, bookings, and route order.

## Editing contract

### Route/content changes

Edit only `itinerary-data.js` whenever possible. This preserves the current look and feel and all interaction logic.

### Visual changes

Edit `styles.css`.

### Behaviour changes

Edit `app.js`. Stop rows and map markers are connected through `day.id` and `stop.order`.

### Page structure or external dependencies

Edit `index.html` only when the shell or loaded assets must change.

Every push to `main` automatically deploys to GitHub Pages.

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
