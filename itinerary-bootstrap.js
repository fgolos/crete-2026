(() => {
  'use strict';

  const source = window.CRETE_ITINERARY;
  if (!source) throw new Error('Itinerary source did not load');
  if (!window.CRETE_DATA_API || !window.CRETE_FORMATTERS || !window.CRETE_MODEL_API || !window.CRETE_VALIDATION_API) {
    throw new Error('Normalized itinerary dependencies did not load');
  }

  const data = window.CRETE_DATA_API.buildNormalizedData(source);
  const validation = window.CRETE_VALIDATION_API.validate(data);
  if (!validation.valid) {
    console.group('Invalid CRETE_DATA');
    validation.errors.forEach(error => console.error(error));
    console.groupEnd();
    throw new Error(`CRETE_DATA validation failed with ${validation.errors.length} error(s)`);
  }

  const projected = window.CRETE_DATA_API.projectLegacyData(data, source, window.CRETE_FORMATTERS);

  // The legacy renderer still resolves parking links through `ref`. The normalized
  // model uses `primaryId` / alternative `id`, so restore those identifiers after
  // projection instead of allowing override objects to erase them with undefined.
  for (const day of projected.days || []) {
    for (const stop of day.stops || []) {
      const visitId = data.legacyVisitIndex[`${day.id}:${stop.order}`];
      const visit = visitId ? data.visits[visitId] : null;
      if (!visit || !stop.parking) continue;

      if (stop.parking.primary && visit.parking.primaryId) {
        stop.parking.primary.ref = visit.parking.primaryId;
      }
      for (let index = 0; index < (stop.parking.alternatives || []).length; index += 1) {
        const alternativeId = visit.parking.alternatives[index]?.id;
        if (alternativeId) stop.parking.alternatives[index].ref = alternativeId;
      }
    }
  }

  window.CRETE_DATA = data;
  window.CRETE_MODEL = window.CRETE_MODEL_API.createModel(data);
  window.CRETE_ITINERARY = projected;

  if (Array.isArray(window.CRETE_STORIES)) {
    for (const story of window.CRETE_STORIES) {
      story.visitId ||= data.legacyVisitIndex[`${story.dayId}:${story.stopOrder}`] || null;
    }
  }
})();
