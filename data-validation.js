(() => {
  'use strict';

  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const CLOCK = /^\d{2}:\d{2}$/;
  const DAY_STATUSES = new Set(['confirmed', 'draft', 'draft-reserve']);
  const DURATION_KINDS = new Set(['departure', 'check-in-rest', 'start', 'finish', 'airport']);
  const TRAVEL_STATUSES = new Set(['standard', 'none', 'rental-shuttle']);
  const validCoordinate = value => value === null || Number.isFinite(value);

  function validateTiming(value, path, errors) {
    if (!value) return;
    if (!CLOCK.test(value.start || '')) errors.push(`${path}.start must use HH:MM`);
    if (value.end !== null && !CLOCK.test(value.end || '')) errors.push(`${path}.end must use HH:MM or null`);
    if (typeof value.approximate !== 'boolean') errors.push(`${path}.approximate must be boolean`);
    if ('label' in value) errors.push(`${path} must not contain a formatted label`);
  }

  function validate(data) {
    const errors = [];
    const warn = message => errors.push(message);
    if (!data || data.schemaVersion !== 2) warn('schemaVersion must be 2');
    if (!ISO_DATE.test(data?.trip?.startDate || '')) warn('trip.startDate must be an ISO date');
    if (!ISO_DATE.test(data?.trip?.endDate || '')) warn('trip.endDate must be an ISO date');

    const logistics = data?.trip?.logistics;
    if (!Array.isArray(logistics?.flights) || !logistics.flights.length) warn('trip.logistics.flights is required');
    if (!logistics?.carRental?.pickupAt) warn('trip.logistics.carRental.pickupAt is required');
    if (!Array.isArray(logistics?.accommodations) || logistics.accommodations.length !== 2) warn('trip.logistics.accommodations must contain two stays');

    for (const [regionKey, region] of Object.entries(data?.regions || {})) {
      if (region.id !== regionKey) warn(`Region key ${regionKey} does not match id ${region.id}`);
      for (const dayId of region.dayIds || []) if (!data.days?.[dayId]) warn(`Region ${region.id} references missing day ${dayId}`);
    }

    for (const [dayKey, day] of Object.entries(data?.days || {})) {
      if (day.id !== dayKey) warn(`Day key ${dayKey} does not match id ${day.id}`);
      if (!ISO_DATE.test(day.id)) warn(`Invalid day id ${day.id}`);
      if (!DAY_STATUSES.has(day.status)) warn(`Day ${day.id} has invalid status ${day.status}`);
      if ('metrics' in day || 'metricDisplayHints' in day) warn(`Day ${day.id} still contains presentation metrics`);
      validateTiming(day.schedule?.departure, `Day ${day.id} departure`, errors);
      validateTiming(day.schedule?.finish, `Day ${day.id} finish`, errors);
      if (!day.schedule?.departure) warn(`Day ${day.id} needs a departure schedule`);
      if (!Number.isFinite(day.travelTotals?.drivingDurationMinutes)) warn(`Day ${day.id} needs drivingDurationMinutes`);
      if (!Number.isFinite(day.travelTotals?.distanceKm)) warn(`Day ${day.id} needs distanceKm`);
      if (typeof day.travelTotals?.approximate !== 'boolean') warn(`Day ${day.id} travelTotals.approximate must be boolean`);
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
      validateTiming(visit.timing, `Visit ${visit.id} timing`, errors);
      if (!visit.timing) warn(`Visit ${visit.id} must have timing`);
      if ('durationDisplayHint' in visit) warn(`Visit ${visit.id} still contains durationDisplayHint`);
      if (!Number.isFinite(visit.durationMinutes) && !DURATION_KINDS.has(visit.durationKind)) warn(`Visit ${visit.id} needs durationMinutes or a valid durationKind`);
      if (Number.isFinite(visit.durationMinutes) && visit.durationKind !== null) warn(`Visit ${visit.id} must not combine durationMinutes and durationKind`);

      const travel = visit.inboundTravel;
      if (!TRAVEL_STATUSES.has(travel?.status)) warn(`Visit ${visit.id} has invalid inbound travel status`);
      if ('displayHints' in (travel || {})) warn(`Visit ${visit.id} still contains inbound displayHints`);
      if (travel?.status === 'standard' && (!Number.isFinite(travel.durationMinutes) || !Number.isFinite(travel.distanceKm))) {
        warn(`Visit ${visit.id} standard inbound travel needs numeric duration and distance`);
      }
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
