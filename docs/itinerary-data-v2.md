# Itinerary data model v2

## Goal

The runtime source of truth is `window.CRETE_DATA`, a normalized graph with stable identifiers and raw domain values. UI-facing labels and formatted dates, durations, distances, statuses and section headings belong to the formatter / application layer.

## Runtime flow

1. `itinerary-source.js` preserves the current itinerary content during migration.
2. `itinerary-data.js` converts that content into schema v2.
3. `data-validation.js` checks references and primitive values.
4. `itinerary-model.js` exposes selectors for consumers.
5. `formatters.js` owns user-facing formatting.
6. `itinerary-bootstrap.js` creates `window.CRETE_DATA` and `window.CRETE_MODEL`.
7. A compatibility projection is exposed as `window.CRETE_ITINERARY` for the existing rendering runtime.

The compatibility projection is deliberately isolated. New features should read `window.CRETE_MODEL` / `window.CRETE_DATA`, not add fields to the projected legacy shape.

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

A `place` describes what and where something is. A `visit` describes how that place is used on a specific day. Routes reference visit IDs rather than display order. Story records receive a stable `visitId` during bootstrap while their old keys remain compatible.

## Validation

Run:

```bash
node scripts/validate-itinerary.mjs
```

The GitHub workflow also checks JavaScript syntax and normalized-data references on every pull request.

## Editing rules

- Do not add formatted dates or metric labels to schema v2.
- Do not use stop order as an external identifier.
- Add formatting rules to `formatters.js`.
- Add relation helpers to `itinerary-model.js`.
- Add validation when introducing a new required field or reference.
- Keep public/private-content constraints unchanged.
