# Itinerary data model v2

## Goal

The checked-in runtime source of truth is `window.CRETE_DATA`, a normalized graph with stable identifiers and domain values. UI-facing labels, formatted dates, durations, distances, statuses, booking summaries and section headings belong to the formatter and renderer layers.

## Runtime flow

1. `itinerary-data.js` defines the immutable schema v2 graph.
2. `data-validation.js` checks references and domain invariants.
3. `itinerary-model.js` exposes entity selectors.
4. `formatters.js` owns user-facing formatting rules.
5. `itinerary-renderer-model.js` builds presentation-facing read models from normalized entities.
6. `itinerary-bootstrap.js` validates the graph and exposes `window.CRETE_MODEL` and `window.CRETE_RENDERER_MODEL`.
7. `app-runtime.js` renders and interacts with the read model directly.

There is no compatibility projection and no second itinerary object. Runtime code must not recreate `CRETE_ITINERARY`, `routeStopOrders`, or stop-order-based identity.

## Main entities

- `trip`
- `regions`
- `days`
- `places`
- `visits`
- `routes`
- `parkingLocations`
- `reservations`

Dates use ISO `YYYY-MM-DD`. Durations are stored in minutes, distances in kilometres, coordinates as `{ lat, lon }`, and relations use stable IDs.

A `place` describes what and where something is. A `visit` describes how that place is used on a specific day. A `day` references visits, and a `route` stores the ordered driving sequence as `visitIds`. Story records reference the same stable `visitId` used by rows, timeline segments, map markers and parking interactions.

The numeric visit `sequence` is presentation order only. It may be displayed as the stop number, but it is not an external identifier and must not be used to connect entities.

## Validation

Run:

```bash
node scripts/validate-itinerary.mjs
node scripts/check-runtime-contract.mjs
node scripts/smoke-browser.mjs
```

The GitHub workflow checks JavaScript syntax, normalized-data references, absence of legacy runtime contracts and rendered output in headless Chrome.

## Editing rules

- Store dates, durations, distances, coordinates and relationships as domain values.
- Do not use visit sequence as an external identifier.
- Add user-facing formatting rules to `formatters.js`.
- Add entity traversal helpers to `itinerary-model.js`.
- Add presentation read-model fields to `itinerary-renderer-model.js`.
- Add validation when introducing a new required field, enum or reference.
- Keep public/private-content constraints unchanged.
- Increase `CACHE_VERSION` after important runtime JS/CSS or service-worker changes.
