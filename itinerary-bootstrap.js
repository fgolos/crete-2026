(() => {
  'use strict';

  const data = window.CRETE_DATA;
  if (!data) throw new Error('CRETE_DATA did not load');
  if (!window.CRETE_FORMATTERS || !window.CRETE_MODEL_API || !window.CRETE_RENDERER_MODEL_API || !window.CRETE_VALIDATION_API) {
    throw new Error('Normalized itinerary dependencies did not load');
  }

  const validation = window.CRETE_VALIDATION_API.validate(data);
  if (!validation.valid) {
    console.group('Invalid CRETE_DATA');
    validation.errors.forEach(error => console.error(error));
    console.groupEnd();
    throw new Error(`CRETE_DATA validation failed with ${validation.errors.length} error(s)`);
  }

  const model = window.CRETE_MODEL_API.createModel(data);
  const rendererModel = window.CRETE_RENDERER_MODEL_API.createRendererModel(data, model, window.CRETE_FORMATTERS);

  for (const story of window.CRETE_STORIES || []) {
    if (!story.visitId || !data.visits[story.visitId]) {
      throw new Error(`Story ${story.id} references an unknown visit`);
    }
  }

  window.CRETE_MODEL = model;
  window.CRETE_RENDERER_MODEL = rendererModel;
})();
