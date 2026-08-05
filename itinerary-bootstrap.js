(() => {
  'use strict';

  const source = window.CRETE_ITINERARY;
  if (!source) throw new Error('Itinerary source did not load');
  if (!window.CRETE_DATA_API || !window.CRETE_FORMATTERS || !window.CRETE_MODEL_API || !window.CRETE_RENDERER_MODEL_API || !window.CRETE_VALIDATION_API) {
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
  const model = window.CRETE_MODEL_API.createModel(data);

  window.CRETE_DATA = data;
  window.CRETE_MODEL = model;
  window.CRETE_RENDERER_MODEL = window.CRETE_RENDERER_MODEL_API.createRendererModel(data, model, window.CRETE_FORMATTERS);
  window.CRETE_ITINERARY = projected;

  if (Array.isArray(window.CRETE_STORIES)) {
    for (const story of window.CRETE_STORIES) {
      story.visitId ||= data.legacyVisitIndex[`${story.dayId}:${story.stopOrder}`] || null;
    }
  }
})();
