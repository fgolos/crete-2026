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

    for (const [regionKey, region] of Object.entries(data?.regions || {})) {
      if (region.id !== regionKey) warn(`Region key ${regionKey} does not match id ${region.id}`);
      for (const dayId of region.dayIds || []) if (!data.days?.[dayId]) warn(`Region ${region.id} references missing day ${dayId}`);
    }

    for (const [dayKey, day] of Object.entries(data?.days || {})) {
      if (day.id !== dayKey) warn(`Day key ${dayKey} does not match id ${day.id}`);
      if (!ISO_DATE.test(day.id)) warn(`Invalid day id ${day.id}`);
      if (!data.routes?.[day.routeId]) warn(`Day ${day.id} references missing route ${day.routeId}`);
      const sequences = new Set();
      for (const visitId of day.visitIds || []) {
        const visit = data.visits?.[visitId];
        if (!visit) {
          warn(`Day ${day.id} references missing visit ${visitId}`);
          continue;
        }
        if (visit.dayId !== day.id) warn(`Day ${day.id} contains visit ${visitId} from ${visit.dayId}`);
        if (sequences.has(visit.sequence)) warn(`Day ${day.id} has duplicate visit sequence ${visit.sequence}`);
        sequences.add(visit.sequence);
      }
    }

    for (const [visitKey, visit] of Object.entries(data?.visits || {})) {
      if (visit.id !== visitKey) warn(`Visit key ${visitKey} does not match id ${visit.id}`);
      if (!visit.id.startsWith(`${visit.dayId}-`)) warn(`Visit ${visit.id} must start with its day id ${visit.dayId}`);
      if (!data.days?.[visit.dayId]) warn(`Visit ${visit.id} references missing day ${visit.dayId}`);
      if (!data.places?.[visit.placeId]) warn(`Visit ${visit.id} references missing place ${visit.placeId}`);
      if (!Number.isInteger(visit.sequence) || visit.sequence < 0) warn(`Visit ${visit.id} has invalid sequence`);
      if (typeof visit.role !== 'string' || !visit.role.trim()) warn(`Visit ${visit.id} must have a role`);
      if (typeof visit.timing?.label !== 'string' || !visit.timing.label.trim()) warn(`Visit ${visit.id} must have a timing label`);
      if (!Number.isFinite(visit.durationMinutes) && !visit.durationDisplayHint) warn(`Visit ${visit.id} needs durationMinutes or durationDisplayHint`);
      if (typeof visit.inboundTravel?.displayHints?.duration !== 'string') warn(`Visit ${visit.id} needs an inbound duration display hint`);
      if (typeof visit.inboundTravel?.displayHints?.distance !== 'string') warn(`Visit ${visit.id} needs an inbound distance display hint`);
      const parkingIds = [visit.parking?.primaryId, ...(visit.parking?.alternatives || []).map(item => item.id)].filter(Boolean);
      for (const parkingId of parkingIds) if (!data.parkingLocations?.[parkingId]) warn(`Visit ${visit.id} references missing parking ${parkingId}`);
    }

    for (const [routeKey, route] of Object.entries(data?.routes || {})) {
      if (route.id !== routeKey) warn(`Route key ${routeKey} does not match id ${route.id}`);
      if (!data.days?.[route.dayId]) warn(`Route ${route.id} references missing day ${route.dayId}`);
      if ((route.visitIds || []).length < 2) warn(`Route ${route.id} must contain at least two visits`);
      const seen = new Set();
      for (const visitId of route.visitIds || []) {
        const visit = data.visits?.[visitId];
        if (!visit) {
          warn(`Route ${route.id} references missing visit ${visitId}`);
          continue;
        }
        if (visit.dayId !== route.dayId) warn(`Route ${route.id} contains visit ${visitId} from another day`);
        if (seen.has(visitId)) warn(`Route ${route.id} contains duplicate visit ${visitId}`);
        seen.add(visitId);
      }
    }

    for (const [placeKey, place] of Object.entries(data?.places || {})) {
      if (place.id !== placeKey) warn(`Place key ${placeKey} does not match id ${place.id}`);
      if (!validCoordinate(place.coordinates?.lat) || !validCoordinate(place.coordinates?.lon)) warn(`Place ${place.id} has invalid coordinates`);
    }

    for (const [parkingKey, parking] of Object.entries(data?.parkingLocations || {})) {
      if (parking.id !== parkingKey) warn(`Parking key ${parkingKey} does not match id ${parking.id}`);
      if (!Number.isFinite(parking.coordinates?.lat) || !Number.isFinite(parking.coordinates?.lon)) warn(`Parking ${parking.id} has invalid coordinates`);
    }

    for (const [reservationKey, reservation] of Object.entries(data?.reservations || {})) {
      if (reservation.id !== reservationKey) warn(`Reservation key ${reservationKey} does not match id ${reservation.id}`);
      if (!data.places?.[reservation.placeId]) warn(`Reservation ${reservation.id} references missing place ${reservation.placeId}`);
    }

    return { valid: errors.length === 0, errors };
  }

  window.CRETE_VALIDATION_API = Object.freeze({ validate });
})();
