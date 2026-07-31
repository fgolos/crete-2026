(() => {
  'use strict';

  const itinerary = window.CRETE_ITINERARY;
  if (!itinerary) return;

  itinerary.days?.forEach(day => {
    day.stops?.forEach(stop => {
      if (stop.name === 'Airbnb — Ioannou Kondylaki 18, Sitia') {
        stop.name = 'Sitia Airbnb';
      }
    });
  });

  if (document.readyState === 'loading') {
    document.write('<link rel="stylesheet" href="parking-ui.css">');
    document.write('<script src="parking-data.js"><\/script>');
    document.write('<script src="parking-ui.js"><\/script>');
  }

  const sitiaHome = {
    lat: 35.20981541927463,
    lon: 26.1065768823924,
    navigationQuery: '35.20981541927463,26.1065768823924'
  };
  const sitiaPortParking = {
    lat: 35.20939,
    lon: 26.10724,
    navigationQuery: '35.20939,26.10724'
  };

  itinerary.days?.forEach(day => {
    day.stops?.forEach(stop => {
      if (stop.name !== 'Sitia Airbnb') return;

      stop.lat = sitiaHome.lat;
      stop.lon = sitiaHome.lon;
      stop.pointNavigationQuery = sitiaHome.navigationQuery;
      stop.navigationQuery = sitiaPortParking.navigationQuery;
      stop.parking = {
        status: 'recommended',
        primary: {
          name: 'Sitia Port public parking',
          lat: sitiaPortParking.lat,
          lon: sitiaPortParking.lon,
          navigationQuery: sitiaPortParking.navigationQuery,
          type: 'public',
          paid: false,
          walkMinutes: 1,
          reliability: 'high',
          crowding: 'Вечером и в высокий сезон ближайшие места могут быть заняты.',
          summary: 'Бесплатная общественная парковка у порта, примерно в минуте пешком от дома.',
          notes: [
            'Cars are not allowed on Ioannou Kondylaki street.',
            'Для навигации используем парковку у порта, а не адрес дома.',
            'После парковки пройти к Ioannou Kondylaki 18 пешком.'
          ],
          lastVerified: '2026-07-31'
        },
        alternatives: []
      };
    });
  });

  const day = itinerary.days?.find(item => item.id === 'day11');
  const arrival = day?.stops?.find(stop => stop.order === 1);
  if (!arrival) return;

  Object.assign(arrival, {
    mode: 'flight',
    drive: '3 ч 20 мин',
    distance: '2 144 км',
    includeInDrivingTotals: false,
    includeInDistanceTotals: false,
    showOnRouteMap: false
  });

  window.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('day11');
    const row = panel?.querySelector('.route-row[data-stop-order="1"]');
    if (row) row.dataset.mode = 'flight';

    const segment = panel?.querySelector('.timeline-segment[data-stop-order="1"]');
    if (segment) {
      segment.dataset.segmentType = 'flight';
      segment.classList.add('timeline-flight');
      const aria = segment.getAttribute('aria-label');
      if (aria?.startsWith('Вождение:')) {
        segment.setAttribute('aria-label', aria.replace(/^Вождение:/, 'Перелёт:'));
      }
    }
  });

  document.addEventListener('click', event => {
    const cell = event.target.closest?.('td');
    const row = cell?.closest?.('.route-row[data-mode="flight"]');
    if (!cell || !row) return;
    const index = [...row.cells].indexOf(cell);
    if (index === 2 || index === 3) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
})();
