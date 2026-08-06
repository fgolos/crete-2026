(() => {
  'use strict';

  if (document.readyState !== 'loading') throw new Error('app.js bootstrap must run while the document is loading');
  const scripts = [
    'formatters.js',
    'itinerary-model.js',
    'data-validation.js',
    'itinerary-renderer-model.js',
    'itinerary-bootstrap.js',
    'app-runtime.js'
  ];
  document.write(scripts.map(src => `<script src="${src}"><\/script>`).join(''));
})();
