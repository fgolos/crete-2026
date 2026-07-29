(() => {
  'use strict';

  const itinerary = window.CRETE_ITINERARY;
  const day = itinerary?.days?.find(item => item.id === 'day11');
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
