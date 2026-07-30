(() => {
  'use strict';

  const itinerary = window.CRETE_ITINERARY;
  if (!itinerary?.days || !window.L) return;

  const mapRegistry = new Map();
  const parkingLayerRegistry = new Map();
  const parkingMarkerRegistry = new Map();
  const originalMapFactory = L.map.bind(L);
  const originalRoutingControl = L.Routing?.control?.bind(L.Routing);
  const mobileViewport = window.matchMedia('(max-width: 800px)');

  const parkingKey = (dayId, order) => `${dayId}:${order}`;

  function getParkingStopByCoordinates(lat, lon) {
    const epsilon = 0.00002;
    for (const day of itinerary.days) {
      for (const stop of day.stops || []) {
        if (Math.abs(stop.lat - lat) < epsilon && Math.abs(stop.lon - lon) < epsilon) return stop;
      }
    }
    return null;
  }

  function drivingCoordinates(stop) {
    const primary = stop?.parking?.primary;
    if (primary && Number.isFinite(primary.lat) && Number.isFinite(primary.lon)) {
      return L.latLng(primary.lat, primary.lon);
    }
    return L.latLng(stop.lat, stop.lon);
  }

  L.map = function patchedMap(container, options) {
    const map = originalMapFactory(container, options);
    const id = typeof container === 'string' ? container : container?.id;
    if (id) {
      mapRegistry.set(id, map);
      queueMicrotask(() => addParkingMarkers(id, map));
    }
    return map;
  };
  Object.assign(L.map, originalMapFactory);

  if (originalRoutingControl) {
    L.Routing.control = function patchedRoutingControl(options = {}) {
      const replacement = { ...options };
      if (Array.isArray(options.waypoints)) {
        replacement.waypoints = options.waypoints.map(waypoint => {
          const stop = getParkingStopByCoordinates(waypoint.lat, waypoint.lng);
          return stop ? drivingCoordinates(stop) : waypoint;
        });
      }
      return originalRoutingControl(replacement);
    };
  }

  function parkingMarkerIcon() {
    return L.divIcon({
      className: '',
      html: '<div class="parking-marker" aria-label="Парковка">P</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  }

  function isSeparateParking(stop) {
    const primary = stop?.parking?.primary;
    if (!primary || !Number.isFinite(primary.lat) || !Number.isFinite(primary.lon)) return false;
    if (stop.parking.status === 'on-site') return false;
    return Math.abs(primary.lat - stop.lat) > 0.00005 || Math.abs(primary.lon - stop.lon) > 0.00005;
  }

  function clearActiveParking(dayId) {
    for (const [key, marker] of parkingMarkerRegistry) {
      if (!key.startsWith(`${dayId}:`)) continue;
      marker.getElement()?.querySelector('.parking-marker')?.classList.remove('is-active');
    }
  }

  function setActiveParking(dayId, stopOrder) {
    clearActiveParking(dayId);
    parkingMarkerRegistry
      .get(parkingKey(dayId, stopOrder))
      ?.getElement()
      ?.querySelector('.parking-marker')
      ?.classList.add('is-active');
  }

  function focusParkingAfterSelection(dayId, stop) {
    const parking = stop?.parking?.primary;
    if (!parking) return;

    appendParkingDetail(dayId, stop);
    setActiveParking(dayId, stop.order);

    const map = mapRegistry.get(`map-${dayId}`);
    if (map && Number.isFinite(parking.lat) && Number.isFinite(parking.lon)) {
      map.setView([parking.lat, parking.lon], Math.max(map.getZoom(), 16), { animate: true });
    }
  }

  function scheduleParkingFocus(dayId, stop) {
    // The core mobile row handler changes views and refocuses after 100 ms.
    // Waiting slightly longer ensures the parking, not the POI, is the final focus.
    const delay = mobileViewport.matches ? 160 : 0;
    setTimeout(() => focusParkingAfterSelection(dayId, stop), delay);
  }

  function addParkingMarkers(mapId, map) {
    if (!mapId.startsWith('map-') || parkingLayerRegistry.has(mapId)) return;
    const dayId = mapId.slice(4);
    const day = itinerary.days.find(item => item.id === dayId);
    if (!day) return;

    const group = L.layerGroup().addTo(map);
    parkingLayerRegistry.set(mapId, group);

    for (const stop of day.stops || []) {
      if (!isSeparateParking(stop)) continue;
      const parking = stop.parking.primary;
      const marker = L.marker([parking.lat, parking.lon], {
        icon: parkingMarkerIcon(),
        keyboard: true,
        title: parking.name || 'Парковка'
      }).addTo(group);
      parkingMarkerRegistry.set(parkingKey(dayId, stop.order), marker);

      L.polyline([[stop.lat, stop.lon], [parking.lat, parking.lon]], {
        color: '#5d6f73',
        weight: 2,
        opacity: 0.65,
        dashArray: '4,5',
        interactive: false
      }).addTo(group);

      marker.on('click', () => {
        const row = document.querySelector(`#${dayId} .route-row[data-stop-order="${stop.order}"]`);
        row?.click();
      });
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function googleMapsUrl(parking) {
    const params = new URLSearchParams({
      api: '1',
      destination: parking.navigationQuery || `${parking.lat},${parking.lon}`,
      travelmode: 'driving',
      dir_action: 'navigate'
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function wazeUrl(parking) {
    const params = new URLSearchParams({
      ll: `${parking.lat},${parking.lon}`,
      navigate: 'yes'
    });
    return `https://www.waze.com/ul?${params.toString()}`;
  }

  function reliabilityLabel(value) {
    return ({ high: 'Надёжная точка', medium: 'Вероятный вариант', low: 'Проверить на месте' })[value] || '';
  }

  function paymentLabel(parking) {
    if (parking.paid === true) return 'Платная';
    if (parking.paid === false) return 'Бесплатная';
    return 'Оплата неизвестна';
  }

  function parkingCardHtml(stop) {
    const parking = stop?.parking?.primary;
    if (!parking) return '';
    const facts = [
      paymentLabel(parking),
      Number.isFinite(parking.walkMinutes) ? `${parking.walkMinutes} мин пешком` : '',
      reliabilityLabel(parking.reliability)
    ].filter(Boolean);
    const notes = parking.notes?.length
      ? `<ul>${parking.notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul>`
      : '';
    const details = [parking.priceNote, parking.crowding].filter(Boolean)
      .map(item => `<p>${escapeHtml(item)}</p>`).join('');

    return `<section class="parking-detail" data-parking-detail>
      <div class="parking-detail-heading"><span class="parking-badge">P</span><div><strong>${escapeHtml(parking.name || 'Парковка')}</strong><span>${escapeHtml(facts.join(' · '))}</span></div></div>
      <p class="parking-summary">${escapeHtml(parking.summary || '')}</p>
      ${details}
      ${notes}
      <div class="parking-actions">
        <a href="${escapeHtml(googleMapsUrl(parking))}" target="_blank" rel="noopener">Google Maps</a>
        <a href="${escapeHtml(wazeUrl(parking))}" target="_blank" rel="noopener">Waze</a>
      </div>
    </section>`;
  }

  function appendParkingDetail(dayId, explicitStop = null) {
    const panel = document.getElementById(dayId);
    const detail = panel?.querySelector('.stop-detail');
    if (!detail || detail.hidden || detail.querySelector('[data-parking-detail]')) return;
    const activeRow = panel.querySelector('.route-row.is-active');
    const stopOrder = explicitStop?.order ?? Number(activeRow?.dataset.stopOrder);
    const day = itinerary.days.find(item => item.id === dayId);
    const stop = explicitStop || day?.stops?.find(item => item.order === stopOrder);
    if (!stop?.parking?.primary) return;
    detail.insertAdjacentHTML('beforeend', parkingCardHtml(stop));
  }

  function installDetailObservers() {
    for (const day of itinerary.days) {
      const detail = document.querySelector(`#${day.id} .stop-detail`);
      if (!detail) continue;
      const observer = new MutationObserver(() => appendParkingDetail(day.id));
      observer.observe(detail, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    }
  }

  function installRowParkingFocus() {
    for (const day of itinerary.days) {
      for (const stop of day.stops || []) {
        if (!stop.parking?.primary) continue;
        const row = document.querySelector(`#${day.id} .route-row[data-stop-order="${stop.order}"]`);
        if (!row || row.dataset.parkingFocusInstalled === 'true') continue;
        row.dataset.parkingFocusInstalled = 'true';
        row.addEventListener('click', () => scheduleParkingFocus(day.id, stop));
      }
    }
  }

  function init() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      installDetailObservers();
      installRowParkingFocus();
      for (const [id, map] of mapRegistry) addParkingMarkers(id, map);
    }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();