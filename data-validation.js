(() => {
  'use strict';

  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const validCoordinate = value => value === null || Number.isFinite(value);

  function validate(data) {
    const errors = [];
    const warn = message => errors.push(message);
    if (!data || data.schemaVersion !== 2) warn('schemaVersion must be 2');
    if (!ISO_DATE.test(data?.trip?.startDate || '')) warn('trip.startDate must be an ISO date');
    if (!ISO_DATE.test(data?.trip?.endDate || '')) warn('trip.endDate must be an ISO date');

    for (const region of Object.values(data?.regions || {})) {
      for (const dayId of region.dayIds || []) if (!data.days?.[dayId]) warn(`Region ${region.id} references missing day ${dayId}`);
    }

    for (const day of Object.values(data?.days || {})) {
      if (!ISO_DATE.test(day.id)) warn(`Invalid day id ${day.id}`);
      if (!data.routes?.[day.routeId]) warn(`Day ${day.id} references missing route ${day.routeId}`);
      for (const visitId of day.visitIds || []) if (!data.visits?.[visitId]) warn(`Day ${day.id} references missing visit ${visitId}`);
    }

    for (const visit of Object.values(data?.visits || {})) {
      if (!data.days?.[visit.dayId]) warn(`Visit ${visit.id} references missing day ${visit.dayId}`);
      if (!data.places?.[visit.placeId]) warn(`Visit ${visit.id} references missing place ${visit.placeId}`);
      const parkingIds = [visit.parking?.primaryId, ...(visit.parking?.alternatives || []).map(item => item.id)].filter(Boolean);
      for (const parkingId of parkingIds) if (!data.parkingLocations?.[parkingId]) warn(`Visit ${visit.id} references missing parking ${parkingId}`);
    }

    for (const route of Object.values(data?.routes || {})) {
      if (!data.days?.[route.dayId]) warn(`Route ${route.id} references missing day ${route.dayId}`);
      for (const visitId of route.visitIds || []) if (!data.visits?.[visitId]) warn(`Route ${route.id} references missing visit ${visitId}`);
    }

    for (const place of Object.values(data?.places || {})) {
      if (!validCoordinate(place.coordinates?.lat) || !validCoordinate(place.coordinates?.lon)) warn(`Place ${place.id} has invalid coordinates`);
    }

    for (const parking of Object.values(data?.parkingLocations || {})) {
      if (!Number.isFinite(parking.coordinates?.lat) || !Number.isFinite(parking.coordinates?.lon)) warn(`Parking ${parking.id} has invalid coordinates`);
    }

    for (const reservation of Object.values(data?.reservations || {})) {
      if (!data.places?.[reservation.placeId]) warn(`Reservation ${reservation.id} references missing place ${reservation.placeId}`);
    }

    return { valid: errors.length === 0, errors };
  }

  window.CRETE_VALIDATION_API = Object.freeze({ validate });
})();
