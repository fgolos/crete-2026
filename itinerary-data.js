(() => {
  'use strict';

  const DATE_BY_LEGACY_DAY = Object.freeze({
    day11: '2026-08-11', day12: '2026-08-12', day13: '2026-08-13', day14: '2026-08-14',
    day15: '2026-08-15', day16: '2026-08-16', day17: '2026-08-17', day18: '2026-08-18',
    day19: '2026-08-19', day20: '2026-08-20', day21: '2026-08-21', day22: '2026-08-22'
  });

  const META_KEY_BY_LABEL = Object.freeze({
    'Статус': 'status', 'Выезд': 'departureTime', 'Финиш': 'finishTime', 'Вождение': 'drivingDurationMinutes',
    'Расстояние': 'distanceKm', 'Купание': 'swimming', 'Машина': 'carReturn', 'Рейс': 'flight'
  });

  const KNOWN_RESERVATIONS = Object.freeze({
    'Toplou Fabrica': { startsAt: '2026-08-12T11:00:00+03:00', placeName: 'Toplou Fabrica' },
    'Tavern - Restaurant Me Raki': { date: '2026-08-11', timeOfDay: 'evening', placeName: 'Tavern - Restaurant Me Raki' },
    'Inodion': { startsAt: '2026-08-13T21:00:00+03:00', placeName: 'Inodion' }
  });

  function slugify(value) {
    return String(value || '')
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
  }

  function parseDurationMinutes(value) {
    const text = String(value || '').trim().toLowerCase();
    if (!text || text === '—' || /^(старт|финиш|вылет|аэропорт)$/.test(text)) return null;
    let minutes = 0;
    const hours = text.match(/(\d+)\s*ч/);
    const mins = text.match(/(\d+)\s*мин/);
    if (hours) minutes += Number(hours[1]) * 60;
    if (mins) minutes += Number(mins[1]);
    return minutes || null;
  }

  function parseDistanceKm(value) {
    const text = String(value || '').replace(/\s/g, '').replace(',', '.');
    if (!text || text === '—') return null;
    const match = text.match(/([\d.]+)км/i);
    return match ? Number(match[1]) : null;
  }

  function parseTimeWindow(value) {
    const text = String(value || '').trim();
    const matches = [...text.matchAll(/(?:^|\D)(\d{1,2}:\d{2})(?=$|\D)/g)].map(match => match[1]);
    if (!matches.length) return { label: text || null, start: null, end: null };
    return { label: text, start: matches[0], end: matches[1] || null };
  }

  function normalizePayment(paid) {
    if (paid === true) return { type: 'paid' };
    if (paid === false) return { type: 'free' };
    return { type: 'unknown' };
  }

  function parkingOverrides(link) {
    if (!link) return null;
    const { ref: _ref, ...overrides } = link;
    return overrides;
  }

  function normalizeParkingLocations(source) {
    const result = {};
    for (const [id, item] of Object.entries(source || {})) {
      result[id] = {
        id,
        name: item.name,
        coordinates: { lat: item.lat, lon: item.lon },
        navigationQuery: item.navigationQuery || null,
        category: item.type || 'unknown',
        payment: normalizePayment(item.paid),
        reliability: item.reliability || 'unknown',
        walking: Number.isFinite(item.walkMinutes) ? { durationMinutes: item.walkMinutes } : null,
        status: item.status || null,
        summary: item.summary || null,
        priceNote: item.priceNote || null,
        crowdingNote: item.crowding || null,
        notes: (item.notes || []).map(text => ({ type: 'general', text })),
        verification: item.lastVerified ? { date: item.lastVerified, source: 'manual' } : null
      };
    }
    return result;
  }

  function createPlaceRegistry() {
    const places = {};
    const byFingerprint = new Map();
    const collisions = new Map();

    function register(stop) {
      const fingerprint = [stop.name, stop.lat, stop.lon].join('|');
      if (byFingerprint.has(fingerprint)) return byFingerprint.get(fingerprint);
      const base = slugify(stop.name);
      const count = (collisions.get(base) || 0) + 1;
      collisions.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;
      places[id] = {
        id,
        name: stop.name,
        coordinates: { lat: stop.lat, lon: stop.lon },
        navigationQuery: stop.navigationQuery || null,
        transportMode: stop.mode || 'driving'
      };
      byFingerprint.set(fingerprint, id);
      return id;
    }

    return { places, register };
  }

  function normalizeMeta(meta) {
    const result = {};
    const displayHints = {};
    for (const item of meta || []) {
      const key = META_KEY_BY_LABEL[item.label] || `custom:${slugify(item.label)}`;
      displayHints[key] = item.value;
      if (key === 'drivingDurationMinutes') result[key] = parseDurationMinutes(item.value);
      else if (key === 'distanceKm') result[key] = parseDistanceKm(item.value);
      else result[key] = item.value;
    }
    return { values: result, displayHints };
  }

  function normalizeReservations(bookings, registerPlace) {
    const reservations = {};
    for (const booking of bookings || []) {
      const known = KNOWN_RESERVATIONS[booking.name] || {};
      const placeId = registerPlace({ name: known.placeName || booking.name, lat: null, lon: null, navigationQuery: booking.name });
      const id = `reservation-${slugify(booking.name)}`;
      reservations[id] = {
        id,
        placeId,
        status: booking.status || 'planned',
        startsAt: known.startsAt || null,
        date: known.date || null,
        timeOfDay: known.timeOfDay || null,
        partySize: 4,
        notes: booking.note ? [{ type: 'public', text: booking.note }] : []
      };
    }
    return reservations;
  }

  function buildNormalizedData(source) {
    if (!source) throw new Error('Legacy itinerary source is not loaded');

    const registry = createPlaceRegistry();
    const parkingLocations = normalizeParkingLocations(source.parkingLocations);
    const days = {};
    const visits = {};
    const routes = {};
    const legacyVisitIndex = {};

    for (const legacyDay of source.days || []) {
      const date = DATE_BY_LEGACY_DAY[legacyDay.id];
      if (!date) throw new Error(`Unknown legacy day id: ${legacyDay.id}`);
      const dayId = date;
      const occurrenceByPlace = new Map();
      const visitIds = [];

      for (const stop of legacyDay.stops || []) {
        const placeId = registry.register(stop);
        const occurrence = (occurrenceByPlace.get(placeId) || 0) + 1;
        occurrenceByPlace.set(placeId, occurrence);
        const visitId = `${date}-${placeId}${occurrence > 1 ? `-${occurrence}` : ''}`;
        const timing = parseTimeWindow(stop.time);
        const parking = stop.parking || {};

        visits[visitId] = {
          id: visitId,
          dayId,
          placeId,
          sequence: stop.order,
          role: stop.role || null,
          timing,
          durationMinutes: parseDurationMinutes(stop.duration),
          inboundTravel: {
            mode: stop.mode || 'driving',
            durationMinutes: parseDurationMinutes(stop.drive),
            distanceKm: parseDistanceKm(stop.distance),
            displayHints: { duration: stop.drive || null, distance: stop.distance || null }
          },
          note: stop.note || null,
          parking: {
            primaryId: parking.primary?.ref || null,
            primaryOverrides: parkingOverrides(parking.primary),
            alternatives: (parking.alternatives || []).map(link => ({ id: link.ref, overrides: parkingOverrides(link) }))
          },
          map: { visible: stop.mapVisible !== false },
          legacy: { dayId: legacyDay.id, stopOrder: stop.order }
        };
        visitIds.push(visitId);
        legacyVisitIndex[`${legacyDay.id}:${stop.order}`] = visitId;
      }

      const routeVisitIds = (legacyDay.routeStopOrders || [])
        .map(order => legacyVisitIndex[`${legacyDay.id}:${order}`])
        .filter(Boolean);
      const routeId = `route-${date}`;
      routes[routeId] = { id: routeId, dayId, mode: 'driving', visitIds: routeVisitIds };

      const meta = normalizeMeta(legacyDay.meta);
      days[dayId] = {
        id: dayId,
        legacyId: legacyDay.id,
        title: legacyDay.title,
        status: meta.values.status?.toLowerCase().includes('чернов') ? 'draft' : 'confirmed',
        metrics: meta.values,
        metricDisplayHints: meta.displayHints,
        visitIds,
        routeId,
        sections: Object.fromEntries(Object.entries(legacyDay.sections || {}).map(([key, section]) => [key, { items: section.items || [] }])),
        mealSummary: legacyDay.mealSummary || null
      };
    }

    const regions = {};
    for (const part of source.parts || []) {
      const dayIds = (part.dayIds || []).map(id => DATE_BY_LEGACY_DAY[id]).filter(Boolean);
      regions[part.id] = {
        id: part.id,
        name: part.title,
        basePlaceName: part.base,
        startDate: dayIds[0] || null,
        endDate: dayIds.at(-1) || null,
        dayIds
      };
    }

    const reservations = normalizeReservations(source.overview?.bookings, registry.register);

    return {
      schemaVersion: 2,
      trip: {
        id: 'crete-2026',
        title: source.project?.title || 'Crete 2026',
        startDate: '2026-08-11',
        endDate: '2026-08-22',
        timezone: 'Europe/Athens',
        locale: 'ru-RU'
      },
      regions,
      days,
      places: registry.places,
      visits,
      routes,
      parkingLocations,
      reservations,
      policies: {
        rules: source.overview?.rules || [],
        privacyNote: source.overview?.privacyNote || null
      },
      legacyVisitIndex
    };
  }

  function projectLegacyData(data, source, formatters) {
    const fmt = formatters || window.CRETE_FORMATTERS;
    const parkingLocations = Object.fromEntries(Object.values(data.parkingLocations).map(item => [item.id, {
      name: item.name,
      lat: item.coordinates.lat,
      lon: item.coordinates.lon,
      navigationQuery: item.navigationQuery,
      type: item.category,
      paid: item.payment.type === 'free' ? false : item.payment.type === 'paid' ? true : null,
      reliability: item.reliability,
      walkMinutes: item.walking?.durationMinutes,
      status: item.status,
      summary: item.summary,
      priceNote: item.priceNote,
      crowding: item.crowdingNote,
      notes: item.notes.map(note => note.text),
      lastVerified: item.verification?.date
    }]));

    const parts = Object.values(data.regions).map(region => ({
      id: region.id,
      title: region.name,
      dates: fmt.formatDateRange(region.startDate, region.endDate),
      base: region.basePlaceName,
      dayIds: region.dayIds.map(id => data.days[id]?.legacyId).filter(Boolean)
    }));

    const days = Object.values(data.days).map(day => ({
      id: day.legacyId,
      short: fmt.formatShortDateEn(day.id),
      date: fmt.formatLongDate(day.id),
      title: day.title,
      meta: fmt.buildLegacyDayMeta(day),
      stops: day.visitIds.map(visitId => {
        const visit = data.visits[visitId];
        const place = data.places[visit.placeId];
        const primary = visit.parking.primaryId ? {
          ref: visit.parking.primaryId,
          ...(visit.parking.primaryOverrides || {})
        } : null;
        const alternatives = visit.parking.alternatives.map(item => ({ ref: item.id, ...(item.overrides || {}) }));
        return {
          order: visit.sequence,
          name: place.name,
          role: visit.role,
          time: visit.timing.label,
          duration: fmt.formatLegacyDuration(visit.durationMinutes, source.days.find(item => item.id === day.legacyId)?.stops?.find(item => item.order === visit.sequence)?.duration),
          drive: visit.inboundTravel.displayHints.duration,
          distance: visit.inboundTravel.displayHints.distance,
          note: visit.note,
          lat: place.coordinates.lat,
          lon: place.coordinates.lon,
          navigationQuery: place.navigationQuery,
          mapVisible: visit.map.visible,
          mode: visit.inboundTravel.mode === 'driving' ? undefined : visit.inboundTravel.mode,
          visitId,
          parking: primary || alternatives.length ? { primary, alternatives } : undefined
        };
      }),
      sections: Object.fromEntries(Object.entries(day.sections).map(([key, section]) => [key, {
        title: fmt.sectionTitle(key),
        items: section.items
      }])),
      routeStopOrders: data.routes[day.routeId].visitIds.map(id => data.visits[id].sequence),
      mealSummary: day.mealSummary
    }));

    const bookings = Object.values(data.reservations).map(reservation => ({
      name: data.places[reservation.placeId]?.name || reservation.id,
      when: fmt.formatReservationWhen(reservation),
      note: reservation.notes.map(note => note.text).join(' '),
      status: reservation.status
    }));

    return {
      project: { title: data.trip.title, dateRange: fmt.formatDateRange(data.trip.startDate, data.trip.endDate, true) },
      parts,
      overview: {
        logistics: fmt.buildOverviewLogistics(),
        bookings,
        rules: data.policies.rules,
        privacyNote: data.policies.privacyNote
      },
      parkingLocations,
      days
    };
  }

  window.CRETE_DATA_API = Object.freeze({ buildNormalizedData, projectLegacyData });
})();
