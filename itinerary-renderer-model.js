(() => {
  'use strict';

  function createRendererModel(data, model, formatters) {
    if (!data || !model || !formatters) {
      throw new Error('CRETE_DATA, CRETE_MODEL and CRETE_FORMATTERS are required');
    }

    const values = object => Object.values(object || {});

    function getRegion(regionId) {
      return model.getRegion(regionId);
    }

    function getRegions() {
      return model.getRegions();
    }

    function getDay(dayId) {
      return model.getDay(dayId);
    }

    function getDays() {
      return model.getDays();
    }

    function getDayVisits(dayId) {
      return model.getDayVisits(dayId).map(visit => ({
        visit,
        place: model.getPlace(visit.placeId),
        primaryParking: visit.parking?.primaryId ? model.getParking(visit.parking.primaryId) : null,
        alternativeParkings: (visit.parking?.alternatives || [])
          .map(item => ({ link: item, parking: model.getParking(item.id) }))
          .filter(item => item.parking)
      }));
    }

    function getRouteVisits(routeId) {
      return model.getRouteVisits(routeId).map(visit => ({
        visit,
        place: model.getPlace(visit.placeId),
        primaryParking: visit.parking?.primaryId ? model.getParking(visit.parking.primaryId) : null
      }));
    }

    function resolveDayId(value) {
      if (!value) return null;
      if (data.days[value]) return value;
      return values(data.days).find(day => day.legacyId === value)?.id || null;
    }

    function getDayNumber(dayId) {
      const resolved = resolveDayId(dayId);
      if (!resolved) return null;
      return Number(resolved.slice(-2));
    }

    function getRegionDisplay(regionId) {
      const region = getRegion(regionId);
      if (!region) return null;
      return {
        id: region.id,
        title: region.name,
        subtitle: `${formatters.formatDateRange(region.startDate, region.endDate)} · ${region.basePlaceName}`,
        dayIds: [...region.dayIds]
      };
    }

    function getOverview() {
      return {
        title: data.trip.title,
        dateRange: formatters.formatDateRange(data.trip.startDate, data.trip.endDate, true),
        logistics: formatters.buildOverviewLogistics(),
        reservations: values(data.reservations),
        rules: [...(data.policies?.rules || [])],
        privacyNote: data.policies?.privacyNote || null
      };
    }

    return Object.freeze({
      data,
      model,
      getTrip: model.getTrip,
      getRegion,
      getRegions,
      getRegionDisplay,
      getDay,
      getDays,
      getDayVisits,
      getRouteVisits,
      getOverview,
      resolveDayId,
      getDayNumber
    });
  }

  window.CRETE_RENDERER_MODEL_API = Object.freeze({ createRendererModel });
})();
