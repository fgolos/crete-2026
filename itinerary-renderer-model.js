(() => {
  'use strict';

  function createRendererModel(data, model, formatters) {
    if (!data || !model || !formatters) {
      throw new Error('CRETE_DATA, CRETE_MODEL and CRETE_FORMATTERS are required');
    }

    const values = object => Object.values(object || {});

    function parkingView(parkingId, overrides = null) {
      const parking = parkingId ? model.getParking(parkingId) : null;
      if (!parking) return null;
      const extraNotes = (overrides?.notes || []).map(note => typeof note === 'string' ? note : note?.text).filter(Boolean);
      return {
        id: parking.id,
        name: overrides?.name || parking.name,
        lat: parking.coordinates.lat,
        lon: parking.coordinates.lon,
        navigationQuery: overrides?.navigationQuery || parking.navigationQuery,
        type: overrides?.type || parking.category,
        paid: parking.payment.type === 'free' ? false : parking.payment.type === 'paid' ? true : null,
        reliability: overrides?.reliability || parking.reliability,
        walkMinutes: Number.isFinite(overrides?.walkMinutes)
          ? overrides.walkMinutes
          : parking.walking?.durationMinutes,
        status: overrides?.status || parking.status,
        summary: overrides?.summary || parking.summary,
        priceNote: overrides?.priceNote || parking.priceNote,
        crowding: overrides?.crowding || parking.crowdingNote,
        notes: [...parking.notes.map(note => note.text), ...extraNotes],
        lastVerified: parking.verification?.date || null
      };
    }

    function visitView(visitId) {
      const visit = model.getVisit(visitId);
      if (!visit) return null;
      const place = model.getPlace(visit.placeId);
      if (!place) return null;
      const primary = visit.parking?.primaryId
        ? parkingView(visit.parking.primaryId, visit.parking.primaryOverrides)
        : null;
      const alternatives = (visit.parking?.alternatives || [])
        .map(item => parkingView(item.id, item.overrides))
        .filter(Boolean);
      return {
        id: visit.id,
        order: visit.sequence,
        name: place.name,
        role: visit.role,
        time: formatters.formatTimeRange(visit.timing),
        duration: formatters.formatVisitDuration(visit.durationMinutes, visit.durationKind),
        drive: formatters.formatInboundDuration(visit.inboundTravel),
        distance: formatters.formatInboundDistance(visit.inboundTravel),
        note: visit.note,
        lat: place.coordinates.lat,
        lon: place.coordinates.lon,
        navigationQuery: place.navigationQuery,
        mapVisible: visit.map.visible,
        mode: visit.inboundTravel.mode === 'driving' ? undefined : visit.inboundTravel.mode,
        parking: primary || alternatives.length ? { primary, alternatives } : undefined
      };
    }

    function dayView(dayId) {
      const day = model.getDay(dayId);
      if (!day) return null;
      const route = model.getRoute(day.routeId);
      return {
        id: day.id,
        short: formatters.formatShortDateEn(day.id),
        date: formatters.formatLongDate(day.id),
        title: day.title,
        status: day.status,
        meta: formatters.buildDayMeta(day),
        stops: day.visitIds.map(visitView).filter(Boolean),
        routeVisitIds: [...(route?.visitIds || [])],
        sections: Object.fromEntries(Object.entries(day.sections || {}).map(([key, section]) => [key, {
          title: formatters.sectionTitle(key),
          items: [...(section.items || [])]
        }])),
        mealSummary: day.mealSummary
      };
    }

    function partView(regionId) {
      const region = model.getRegion(regionId);
      if (!region) return null;
      return {
        id: region.id,
        title: region.name,
        dates: formatters.formatDateRange(region.startDate, region.endDate),
        base: region.basePlaceName,
        dayIds: [...region.dayIds]
      };
    }

    function bookingView(reservation) {
      return {
        id: reservation.id,
        name: model.getPlace(reservation.placeId)?.name || reservation.id,
        when: formatters.formatReservationWhen(reservation),
        note: reservation.notes.map(note => note.text).join(' '),
        status: reservation.status
      };
    }

    const parts = model.getRegions().map(region => partView(region.id)).filter(Boolean);
    const days = model.getDays().map(day => dayView(day.id)).filter(Boolean);
    const dayIndex = new Map(days.map(day => [day.id, day]));
    const partIndex = new Map(parts.map(part => [part.id, part]));
    const parkingLocations = Object.fromEntries(values(data.parkingLocations).map(item => [item.id, parkingView(item.id)]));
    const overview = {
      title: data.trip.title,
      dateRange: formatters.formatDateRange(data.trip.startDate, data.trip.endDate, true),
      logistics: formatters.buildOverviewLogistics(data.trip),
      bookings: values(data.reservations).map(bookingView),
      rules: [...(data.policies?.rules || [])],
      privacyNote: data.policies?.privacyNote || null
    };

    return Object.freeze({
      data,
      model,
      parts,
      days,
      overview,
      parkingLocations,
      getTrip: model.getTrip,
      getPart: id => partIndex.get(id) || null,
      getParts: () => [...parts],
      getDay: id => dayIndex.get(id) || null,
      getDays: () => [...days],
      getVisit: visitView,
      getDayVisits: id => dayIndex.get(id)?.stops || [],
      getRouteVisits: id => (model.getRoute(id)?.visitIds || []).map(visitView).filter(Boolean),
      getParking: parkingView,
      getOverview: () => overview,
      getDayNumber: dayId => Number(String(dayId).slice(-2))
    });
  }

  window.CRETE_RENDERER_MODEL_API = Object.freeze({ createRendererModel });
})();
