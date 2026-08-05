(() => {
  'use strict';

  function createModel(data) {
    if (!data) throw new Error('CRETE_DATA is required');
    const values = object => Object.values(object || {});
    return Object.freeze({
      data,
      getTrip: () => data.trip,
      getRegion: id => data.regions[id] || null,
      getRegions: () => values(data.regions),
      getDay: id => data.days[id] || null,
      getDays: () => values(data.days),
      getRegionDays: id => (data.regions[id]?.dayIds || []).map(dayId => data.days[dayId]).filter(Boolean),
      getVisit: id => data.visits[id] || null,
      getDayVisits: id => (data.days[id]?.visitIds || []).map(visitId => data.visits[visitId]).filter(Boolean),
      getPlace: id => data.places[id] || null,
      getVisitPlace: id => {
        const visit = data.visits[id];
        return visit ? data.places[visit.placeId] || null : null;
      },
      getRoute: id => data.routes[id] || null,
      getRouteVisits: id => (data.routes[id]?.visitIds || []).map(visitId => data.visits[visitId]).filter(Boolean),
      getParking: id => data.parkingLocations[id] || null,
      getReservation: id => data.reservations[id] || null,
      findVisitByLegacyKey: (dayId, stopOrder) => data.visits[data.legacyVisitIndex[`${dayId}:${stopOrder}`]] || null
    });
  }

  window.CRETE_MODEL_API = Object.freeze({ createModel });
})();
