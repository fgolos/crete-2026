(() => {
  'use strict';

  const data = window.CRETE_RENDERER_MODEL;
  if (!data) throw new Error('CRETE_RENDERER_MODEL is not loaded');

  const app = document.getElementById('app');
  const partTabs = document.getElementById('part-tabs');
  const tabs = document.getElementById('tabs');
  const appStatus = document.getElementById('app-status');
  const appStatusText = document.getElementById('app-status-text');
  const appStatusAction = document.getElementById('app-status-action');
  const maps = new Map();
  const partOverviewMaps = new Map();
  const markerIndex = new Map();
  const parkingMarkerIndex = new Map();
  const partRouteLabelLayoutIndex = new Map();
  const routingIndex = new Map();
  const mobileViewport = window.matchMedia('(max-width: 800px)');
  let activePanel = 'overview';
  let activePartId = 'overview';
  let isOffline = !navigator.onLine;
  let waitingWorker = null;
  let reloadingForUpdate = false;

  const dayRoutePalette = [
    '#0b7f91', '#c46e32', '#6a8d29', '#9f3f58', '#5e63b6', '#a07c17',
    '#00846a', '#b64d3d', '#4a7ea5', '#7a5a36', '#8e4fb3', '#4d7f78'
  ];

  const escapeHtml = value => String(value)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  function getPrimaryParking(stop) {
    return stop?.parking?.primary || null;
  }

  function getAlternativeParkings(stop) {
    return stop?.parking?.alternatives || [];
  }

  function parkingMarkerKey(_dayId, visitId) {
    return visitId;
  }

  function schedulePartRouteLabelLayout(partId) {
    const map = partOverviewMaps.get(partId)?.map;
    if (!map) return;
    if (partRouteLabelLayoutIndex.has(partId)) return;
    const handle = window.requestAnimationFrame(() => {
      partRouteLabelLayoutIndex.delete(partId);
      layoutPartRouteLabels(partId);
    });
    partRouteLabelLayoutIndex.set(partId, handle);
  }

  function routePointLatLngAtFraction(coordinates, fraction) {
    return routePointAtFraction(coordinates, fraction);
  }

  function routePointProjectionAtFraction(coordinates, fraction, map, zoom) {
    const latLng = routePointLatLngAtFraction(coordinates, fraction);
    return latLng ? map.project(latLng, zoom) : null;
  }

  function routeLabelNormalVector(coordinates, fraction, map, zoom) {
    const before = routePointProjectionAtFraction(coordinates, Math.max(0.02, fraction - 0.02), map, zoom);
    const after = routePointProjectionAtFraction(coordinates, Math.min(0.98, fraction + 0.02), map, zoom);
    if (!before || !after) return null;
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const length = Math.hypot(dx, dy);
    if (length < 0.001) return null;
    return L.point(-dy / length, dx / length);
  }

  function layoutPartRouteLabels(partId) {
    const record = partOverviewMaps.get(partId);
    const map = record?.map;
    if (!record || !map) return;

    const zoom = map.getZoom();
    if (!Number.isFinite(zoom)) return;

    const overlapArea = (left, right) => {
      const width = Math.min(left.right, right.right) - Math.max(left.left, right.left);
      const height = Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top);
      return width > 0 && height > 0 ? width * height : 0;
    };

    const rectForPoint = (point, size) => ({
      left: point.x - size.width / 2,
      right: point.x + size.width / 2,
      top: point.y - size.height / 2,
      bottom: point.y + size.height / 2
    });

    const dayRecords = Array.from(record.days.values());
    const labels = [];
    record.days.forEach((dayRecord, dayId) => {
      if (!dayRecord?.label || !Array.isArray(dayRecord.routeCoordinates) || dayRecord.routeCoordinates.length < 2) return;
      const element = dayRecord.label.getElement()?.querySelector('.part-route-label');
      const size = element
        ? { width: element.offsetWidth || 28, height: element.offsetHeight || 18 }
        : { width: 28, height: 18 };
      const preferredFraction = routeLabelFraction(dayRecord.dayIndex);
      const basePoint = routePointProjectionAtFraction(dayRecord.routeCoordinates, preferredFraction, map, zoom);
      if (!basePoint) return;
      const density = dayRecords.reduce((count, otherRecord) => {
        if (otherRecord === dayRecord || !Array.isArray(otherRecord.routeCoordinates)) return count;
        const otherBase = routePointProjectionAtFraction(otherRecord.routeCoordinates, routeLabelFraction(otherRecord.dayIndex), map, zoom);
        return otherBase && Math.hypot(otherBase.x - basePoint.x, otherBase.y - basePoint.y) < 120 ? count + 1 : count;
      }, 0);
      labels.push({ dayId, dayRecord, element, size, preferredFraction, basePoint, density });
    });

    if (!labels.length) return;

    labels.sort((left, right) => {
      if (right.density !== left.density) return right.density - left.density;
      if (left.dayRecord.dayIndex !== right.dayRecord.dayIndex) return left.dayRecord.dayIndex - right.dayRecord.dayIndex;
      return left.dayId.localeCompare(right.dayId);
    });

    const placed = [];
    const desiredGap = 16;
    const labelRadius = size => Math.max(size.width, size.height) * 0.5 + desiredGap;
    const fractionOffsets = Array.from({ length: 41 }, (_, index) => (index - 20) * 0.025);
    const normalOffsets = [0, 8, -8, 16, -16, 24, -24, 34, -34, 46, -46, 58, -58];

    for (const label of labels) {
      const { dayRecord, preferredFraction, basePoint, size } = label;
      const candidates = [];
      for (const fractionOffset of fractionOffsets) {
        const fraction = Math.max(0.06, Math.min(0.94, preferredFraction + fractionOffset));
        const point = routePointProjectionAtFraction(dayRecord.routeCoordinates, fraction, map, zoom);
        if (!point) continue;
        const normal = routeLabelNormalVector(dayRecord.routeCoordinates, fraction, map, zoom) || L.point(0, -1);
        for (const normalOffset of normalOffsets) {
          const candidatePoint = L.point(point.x + normal.x * normalOffset, point.y + normal.y * normalOffset);
          const weight = Math.abs(fractionOffset) * 30 + Math.abs(normalOffset) * 0.35;
          candidates.push({ fraction, point: candidatePoint, weight });
        }
      }

      let bestCandidate = null;
      let bestScore = Number.POSITIVE_INFINITY;
      for (const candidate of candidates) {
        const candidateBox = rectForPoint(candidate.point, size);
        const candidateRadius = labelRadius(size);
        let score = candidate.weight + Math.hypot(candidate.point.x - basePoint.x, candidate.point.y - basePoint.y) * 0.12;
        for (const placedLabel of placed) {
          const dist = Math.hypot(candidate.point.x - placedLabel.point.x, candidate.point.y - placedLabel.point.y);
          const minDistance = candidateRadius + placedLabel.radius;
          if (dist < minDistance) {
            score += Math.pow(minDistance - dist, 2) * 14;
          }
          const overlap = overlapArea(candidateBox, placedLabel.box);
          if (overlap > 0) {
            score += overlap * 600;
          }
        }
        const routeDistance = Math.hypot(candidate.point.x - basePoint.x, candidate.point.y - basePoint.y);
        score += routeDistance * 0.08;
        if (score < bestScore) {
          bestScore = score;
          bestCandidate = candidate;
        }
      }

      if (!bestCandidate) continue;
      dayRecord.label.setLatLng(map.unproject(bestCandidate.point, zoom));
      placed.push({
        dayRecord,
        point: bestCandidate.point,
        radius: labelRadius(size),
        box: rectForPoint(bestCandidate.point, size),
        anchor: basePoint,
        size
      });
    }

    if (placed.length < 2) return;

    const resolveBox = item => rectForPoint(item.point, item.size);
    const relaxIterations = 32;
    const repelStrength = 0.6;
    const anchorStrength = 0.04;
    const maxDrift = 90;

    for (let iteration = 0; iteration < relaxIterations; iteration++) {
      for (let i = 0; i < placed.length; i++) {
        for (let j = i + 1; j < placed.length; j++) {
          const left = placed[i];
          const right = placed[j];

          let dx = right.point.x - left.point.x;
          let dy = right.point.y - left.point.y;
          let distance = Math.hypot(dx, dy);
          const desired = left.radius + right.radius;
          if (distance >= desired) continue;

          if (distance < 0.001) {
            const angle = (i * 97 + j * 57) % 360 * Math.PI / 180;
            dx = Math.cos(angle);
            dy = Math.sin(angle);
            distance = 1;
          }

          const push = (desired - distance) * 0.5 * repelStrength;
          const nx = dx / distance;
          const ny = dy / distance;

          left.point = L.point(left.point.x - nx * push, left.point.y - ny * push);
          right.point = L.point(right.point.x + nx * push, right.point.y + ny * push);
          left.box = resolveBox(left);
          right.box = resolveBox(right);
        }
      }

      for (const item of placed) {
        const anchorDx = item.anchor.x - item.point.x;
        const anchorDy = item.anchor.y - item.point.y;
        item.point = L.point(
          item.point.x + anchorDx * anchorStrength,
          item.point.y + anchorDy * anchorStrength
        );
        const driftX = item.point.x - item.anchor.x;
        const driftY = item.point.y - item.anchor.y;
        const drift = Math.hypot(driftX, driftY);
        if (drift > maxDrift) {
          const scale = maxDrift / drift;
          item.point = L.point(item.anchor.x + driftX * scale, item.anchor.y + driftY * scale);
        }
        item.box = resolveBox(item);
      }
    }

    for (const item of placed) {
      item.dayRecord.label.setLatLng(map.unproject(item.point, zoom));
    }
  }

  function getDrivingCoordinates(stop) {
    const parking = getPrimaryParking(stop);
    if (parking && Number.isFinite(parking.lat) && Number.isFinite(parking.lon)) {
      return [parking.lat, parking.lon];
    }
    return [stop.lat, stop.lon];
  }

  function getNavigationQuery(stop) {
    const parking = getPrimaryParking(stop);
    return parking?.navigationQuery || stop.navigationQuery || `${stop.lat},${stop.lon}`;
  }

  function isSeparateParking(stop) {
    const parking = getPrimaryParking(stop);
    if (!parking || stop.parking?.primary?.status === 'on-site') return false;
    if (!Number.isFinite(parking.lat) || !Number.isFinite(parking.lon)) return false;
    return Math.abs(parking.lat - stop.lat) > 0.00005 || Math.abs(parking.lon - stop.lon) > 0.00005;
  }

  function googleMapsParkingUrl(parking) {
    const params = new URLSearchParams({
      api: '1',
      destination: parking.navigationQuery || `${parking.lat},${parking.lon}`,
      travelmode: 'driving',
      dir_action: 'navigate'
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function wazeParkingUrl(parking) {
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

  function parkingEntryHtml(parking, heading = '') {
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
    const practicalDetails = details || notes
      ? `<details class="parking-more"><summary>Практические детали</summary><div class="parking-more-content">${details}${notes}</div></details>`
      : '';
    return `<div class="parking-entry">
      ${heading ? `<div class="parking-entry-label">${escapeHtml(heading)}</div>` : ''}
      <div class="parking-detail-heading">
        <span class="parking-badge">P</span>
        <div class="parking-detail-heading-main"><strong>${escapeHtml(parking.name || 'Парковка')}</strong><span>${escapeHtml(facts.join(' · '))}</span></div>
        <div class="parking-actions" aria-label="Навигация">
          <a class="parking-action parking-action-google" href="${escapeHtml(googleMapsParkingUrl(parking))}" target="_blank" rel="noopener" aria-label="Открыть маршрут в Google Maps" title="Google Maps"><span class="parking-action-dot" aria-hidden="true">G</span></a>
          <a class="parking-action parking-action-waze" href="${escapeHtml(wazeParkingUrl(parking))}" target="_blank" rel="noopener" aria-label="Открыть маршрут в Waze" title="Waze"><span class="parking-action-dot" aria-hidden="true">W</span></a>
        </div>
      </div>
      <p class="parking-summary">${escapeHtml(parking.summary || '')}</p>
      ${practicalDetails}
    </div>`;
  }

  function parkingCardHtml(stop) {
    const primary = getPrimaryParking(stop);
    if (!primary) return '';
    const alternatives = getAlternativeParkings(stop);
    return `<section class="parking-detail" data-parking-detail>
      ${parkingEntryHtml(primary)}
      ${alternatives.map((parking, index) => parkingEntryHtml(parking, `Альтернатива ${index + 1}`)).join('')}
    </section>`;
  }

  function parkingMarkerIcon() {
    return L.divIcon({
      className: '',
      html: '<div class="parking-marker" aria-label="Парковка">P</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  }

  function positionParkingBesideDetail(dayId, stop) {
    const parking = getPrimaryParking(stop);
    const map = maps.get(dayId);
    if (!parking || !map) return;

    const panel = document.getElementById(dayId);
    const detail = panel?.querySelector('.stop-detail');
    const coordinates = isSeparateParking(stop) ? [parking.lat, parking.lon] : [stop.lat, stop.lon];
    const zoom = Math.max(map.getZoom(), 16);
    map.setView(coordinates, zoom, { animate:true });
    if (!detail || detail.hidden) return;

    requestAnimationFrame(() => requestAnimationFrame(() => {
      map.invalidateSize({ pan:false });
      const mapSize = map.getSize();
      const cardRect = detail.getBoundingClientRect();
      const mapRect = map.getContainer().getBoundingClientRect();
      const currentPoint = map.latLngToContainerPoint(coordinates);
      let desiredX;
      let desiredY;

      if (mobileViewport.matches) {
        const cardTopInsideMap = Math.max(0, Math.min(mapSize.y, cardRect.top - mapRect.top));
        const freeBottom = Math.max(96, cardTopInsideMap - 20);
        desiredX = mapSize.x * 0.5;
        desiredY = Math.max(72, freeBottom * 0.48);
      } else {
        const cardRightInsideMap = Math.max(0, Math.min(mapSize.x, cardRect.right - mapRect.left));
        const freeLeft = Math.min(mapSize.x - 48, cardRightInsideMap + 32);
        desiredX = freeLeft + Math.max(0, mapSize.x - freeLeft) * 0.52;
        desiredY = Math.max(72, mapSize.y * 0.34);
      }

      map.panBy([
        Math.round(currentPoint.x - desiredX),
        Math.round(currentPoint.y - desiredY)
      ], { animate:true, duration:.35 });
    }));
  }

  function scheduleParkingFocus(dayId, stop) {
    const delay = mobileViewport.matches ? 180 : 0;
    setTimeout(() => positionParkingBesideDetail(dayId, stop), delay);
  }

  function clearParkingMarkerState(dayId, className) {
    parkingMarkerIndex.forEach(({ element }, key) => {
      if (key.startsWith(dayId) && element) element.classList.remove(className);
    });
  }

  function setParkingMarkerState(dayId, visitId, className) {
    clearParkingMarkerState(dayId, className);
    parkingMarkerIndex.get(parkingMarkerKey(dayId, visitId))?.element?.classList.add(className);
  }

  function buildGoogleMapsUrl(day) {
    const routeStops = day.routeVisitIds.map(visitId => day.stops.find(stop => stop.id === visitId)).filter(Boolean);
    const [origin, ...rest] = routeStops;
    const destination = rest.pop();
    const params = new URLSearchParams({
      api: '1',
      origin: getNavigationQuery(origin),
      destination: getNavigationQuery(destination),
      travelmode: 'driving'
    });
    if (rest.length) params.set('waypoints', rest.map(getNavigationQuery).join('|'));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function buildStopNavigationUrl(stop) {
    const params = new URLSearchParams({
      api:'1',
      destination:getNavigationQuery(stop),
      travelmode:'driving',
      dir_action:'navigate'
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function dayNumber(dayId) {
    return data.getDayNumber(dayId);
  }

  function dayRouteColor(dayId) {
    const index = Math.max(0, dayNumber(dayId) - 11) % dayRoutePalette.length;
    return dayRoutePalette[index];
  }

  function getPart(partId) {
    return data.parts?.find(part => part.id === partId) || null;
  }

  function getDay(dayId) {
    return data.days.find(day => day.id === dayId) || null;
  }

  function defaultPartForDay(dayId) {
    return data.parts?.find(part => part.dayIds.includes(dayId))?.id || 'east';
  }

  function firstAvailableDay(part) {
    return part?.dayIds.find(dayId => Boolean(getDay(dayId))) || null;
  }

  function readyPartDays(part) {
    return (part?.dayIds || []).map(getDay).filter(Boolean);
  }

  function isTransitionDay(dayId) {
    return dayId === '2026-08-15';
  }

  function dayRouteStops(day) {
    return day.routeVisitIds
      .map(visitId => day.stops.find(stop => stop.id === visitId))
      .filter(Boolean)
      .filter(stop => {
        const [lat, lon] = getDrivingCoordinates(stop);
        return Number.isFinite(lat) && Number.isFinite(lon);
      });
  }

  function dayRoutePoints(day) {
    return dayRouteStops(day).map(getDrivingCoordinates);
  }

  function visiblePartStops(day) {
    return day.stops.filter(stop =>
      stop.mapVisible !== false && Number.isFinite(stop.lat) && Number.isFinite(stop.lon)
    );
  }

  async function fetchRoadRouteCoordinates(day) {
    const routeStops = dayRouteStops(day);
    const routePoints = routeStops.map(getDrivingCoordinates);
    if (routePoints.length < 2) return routePoints;

    // If the day has no driving legs (for example the protected Platanes beach days),
    // draw the simple direct path instead of asking the driving router to invent a road detour.
    const hasDrivingLeg = routeStops.slice(1).some(stop => stop.mode === undefined);
    if (!hasDrivingLeg) return routePoints;

    const coordinates = routePoints
      .map(([lat, lon]) => `${lon},${lat}`)
      .join(';');
    const params = new URLSearchParams({
      overview: 'full',
      geometries: 'geojson',
      alternatives: 'false',
      steps: 'false'
    });

    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?${params.toString()}`);
      if (!response.ok) throw new Error(`OSRM responded with ${response.status}`);
      const payload = await response.json();
      const geometry = payload?.routes?.[0]?.geometry?.coordinates;
      if (!Array.isArray(geometry) || geometry.length < 2) return routePoints;
      return geometry
        .map(point => Array.isArray(point) && point.length >= 2 ? [point[1], point[0]] : null)
        .filter(Boolean);
    } catch (error) {
      console.warn(`Part overview route fallback for ${day.id}.`, error);
      return routePoints;
    }
  }

  function renderPartTabs() {
    const items = [
      { id:'overview', target:'overview', label:'Крит', subtitle:'11–22 августа' },
      ...(data.parts || []).map(part => ({
        id:part.id,
        target:`part-${part.id}`,
        label:part.title,
        subtitle:`${part.dates} · ${part.base}`
      }))
    ];

    partTabs.innerHTML = items.map((item, index) => `
      <button id="part-tab-${item.id}" class="part-button${index === 0 ? ' active' : ''}" data-part-id="${item.id}" data-target="${item.target}" type="button" role="tab" aria-controls="${item.target}" aria-selected="${index === 0 ? 'true' : 'false'}" tabindex="${index === 0 ? '0' : '-1'}">
        <span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.subtitle)}</small>
      </button>`).join('');
  }

  function renderDayTabs(partId) {
    if (partId === 'overview') {
      tabs.innerHTML = '';
      tabs.hidden = true;
      return;
    }

    const part = getPart(partId);
    if (!part) return;
    tabs.hidden = false;
    tabs.innerHTML = part.dayIds.map(dayId => {
      const day = getDay(dayId);
      const number = dayNumber(dayId);
      const disabled = !day;
      const active = dayId === activePanel;
      return `<button id="tab-${dayId}" class="tab-button${active ? ' active' : ''}${disabled ? ' is-planned' : ''}" data-target="${dayId}" type="button" role="tab" aria-controls="${dayId}" aria-selected="${active ? 'true' : 'false'}" tabindex="${active ? '0' : '-1'}" ${disabled ? 'disabled aria-disabled="true"' : ''}>
        <span>${number} авг</span><small>${escapeHtml(day?.title || 'Планируется')}</small>
      </button>`;
    }).join('');
  }

  function setActivePart(partId) {
    activePartId = partId === 'overview' || getPart(partId) ? partId : 'overview';
    partTabs.querySelectorAll('.part-button').forEach(button => {
      const active = button.dataset.partId === activePartId;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    renderDayTabs(activePartId);
  }

  function bookingStatus(item) {
    if (/без брони/i.test(item.note)) return { key:'unreserved', label:'Без брони' };
    if (item.status === 'pending') return { key:'pending', label:'Ожидается' };
    return { key:'confirmed', label:'Подтверждено' };
  }

  function bookingSummary(note) {
    return note.match(/^.*?[.!?](?:\s|$)/)?.[0].trim() || note;
  }

  function renderOverview() {
    const overview = data.overview;
    return `<section id="overview" class="panel active" role="tabpanel" aria-labelledby="part-tab-overview">
      <div class="overview-shell">
        <div class="overview-grid">
          <article class="overview-card">
            <h2>Логистика</h2>
            <table class="overview-table">${overview.logistics.map(row => `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`).join('')}</table>
          </article>
          <article class="overview-card">
            <h2>Бронирования и ожидания</h2>
            <div class="booking-list">${overview.bookings.map(item => {
              const status = bookingStatus(item);
              return `<div class="booking-card ${status.key}"><div class="booking-heading"><strong>${escapeHtml(item.name)}</strong><span class="status-label">${status.label}</span></div><time>${escapeHtml(item.when)}</time><p>${escapeHtml(bookingSummary(item.note))}</p></div>`;
            }).join('')}</div>
          </article>
        </div>
        <article class="overview-card">
          <h2>Готовые дни маршрута</h2>
          <table class="days-summary"><tbody>${data.days.map(day => {
            const metaValues = day.meta.slice(0, 4).map(item => `<td>${escapeHtml(item.value)}</td>`).join('');
            const partId = defaultPartForDay(day.id);
            return `<tr class="summary-day" data-day-id="${day.id}" data-part-id="${partId}" tabindex="0" role="button" aria-label="Перейти к ${escapeHtml(day.title)}"><td class="summary-day-label"><strong>${escapeHtml(day.short)}</strong><span>${escapeHtml(day.title)}</span></td>${metaValues}</tr>`;
          }).join('')}</tbody></table>
        </article>
        <article class="overview-card">
          <h2>Правила маршрута</h2>
          <ul class="rules-list">${overview.rules.map(rule => `<li>${escapeHtml(rule)}</li>`).join('')}</ul>
        </article>
        <div class="privacy-note">${escapeHtml(overview.privacyNote)}</div>
      </div>
    </section>`;
  }

  function renderPartOverview(part) {
    const dayItems = part.dayIds.map(dayId => {
      const day = getDay(dayId);
      const number = dayNumber(dayId);
      if (!day) {
        return `<div class="part-day-item is-planned" aria-disabled="true">
          <span class="part-day-date">${number} августа</span>
          <strong>Планируется</strong>
          <small>Маршрут дня ещё не согласован.</small>
        </div>`;
      }
      const routeColor = dayRouteColor(day.id);
      const transitionBadge = isTransitionDay(day.id)
        ? '<span class="part-day-transition">Переезд между базами</span>'
        : '';
      return `<button class="part-day-item" type="button" data-day-id="${day.id}" data-part-id="${part.id}" style="--day-accent:${escapeHtml(routeColor)}">
        <span class="part-day-date">${escapeHtml(day.date)}</span>
        <span class="part-day-swatch" aria-hidden="true"></span>
        <strong>${escapeHtml(day.title)}${transitionBadge}</strong>
        <small>${escapeHtml(day.meta.slice(0, 4).map(item => item.value).join(' · '))}</small>
      </button>`;
    }).join('');

    return `<section id="part-${part.id}" class="panel part-panel" role="tabpanel" aria-labelledby="part-tab-${part.id}">
      <div class="part-overview-shell">
        <div id="part-map-${part.id}" class="part-overview-map" aria-label="Карта маршрутов части ${escapeHtml(part.title)}"></div>
        <div class="part-day-list">${dayItems}</div>
      </div>
    </section>`;
  }

  function isFlexibleStop(day, stop) {
    return day.sections.essentials.items.some(item =>
      /^Гибкая остановка:/i.test(item) && item.toLocaleLowerCase('ru').includes(stop.name.split('/')[0].trim().toLocaleLowerCase('ru'))
    );
  }

  function parseClockTime(timeStr) {
    // Parse "HH:MM" format to minutes since midnight
    if (!timeStr) return null;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    return hours * 60 + minutes;
  }

  function formatHourLabel(minutesSinceMidnight) {
    const hours = Math.floor(minutesSinceMidnight / 60);
    return hours.toString().padStart(2, '0');
  }

  function abbreviateTime(fullLabel) {
    if (!fullLabel || fullLabel === '—' || fullLabel === '-') return fullLabel;
    
    let minutes = 0;
    
    // Pattern 1: "≈1 ч 30 мин – 2 ч" (hours:minutes to hours)
    let match = fullLabel.match(/([0-9]+)\s*ч\s*([0-9]+)\s*мин?\s*[–—-]\s*([0-9]+)\s*ч/i);
    if (match) {
      const startMin = parseInt(match[1]) * 60 + parseInt(match[2]);
      const endMin = parseInt(match[3]) * 60;
      minutes = Math.ceil((startMin + endMin) / 2 / 5) * 5;
      return formatTimeShort(minutes);
    }
    
    // Pattern 2: "1 ч 35–50 мин" (hours + minute range)
    match = fullLabel.match(/([0-9]+)\s*ч\s*([0-9]+)\s*[–—-]\s*([0-9]+)\s*мин/i);
    if (match) {
      const hours = parseInt(match[1]);
      const minStart = parseInt(match[2]);
      const minEnd = parseInt(match[3]);
      const start = hours * 60 + minStart;
      const end = hours * 60 + minEnd;
      minutes = Math.ceil((start + end) / 2 / 5) * 5;
      return formatTimeShort(minutes);
    }
    
    // Pattern 3: "40–45 мин" (minutes only range)
    match = fullLabel.match(/([0-9]+)\s*[–—-]\s*([0-9]+)\s*мин/i);
    if (match) {
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);
      minutes = Math.ceil((start + end) / 2 / 5) * 5;
      return formatTimeShort(minutes);
    }
    
    // Pattern 4: "≈2 ч 40 мин" or "≈2 ч" (exact times with hours)
    match = fullLabel.match(/([0-9]+)\s*ч\s*(?:([0-9]+)\s*мин)?/i);
    if (match) {
      const hours = parseInt(match[1]);
      const mins = match[2] ? parseInt(match[2]) : 0;
      minutes = hours * 60 + mins;
      minutes = Math.ceil(minutes / 5) * 5;
      return formatTimeShort(minutes);
    }
    
    // Pattern 5: "≈30 мин" (exact minutes only)
    match = fullLabel.match(/([0-9]+)\s*мин/i);
    if (match) {
      minutes = parseInt(match[1]);
      minutes = Math.ceil(minutes / 5) * 5;
      return formatTimeShort(minutes);
    }
    
    return fullLabel;
  }

  function formatTimeShort(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }

  function renderTimeline(day) {
    const segments = [];
    // Extract start time
    let startMinutes = null;
    const startMeta = day.meta.find(m => /выезд/i.test(m.label));
    if (startMeta) {
      startMinutes = parseClockTime(startMeta.value);
    }
    if (startMinutes === null && day.stops[0]) {
      startMinutes = parseClockTime(day.stops[0].time);
    }
    
    if (startMinutes === null) {
      return { ruler: '', timeline: '' };
    }
    
    // Build timeline events with wall-clock times
    let maxEndTime = startMinutes;
    
    for (let i = 0; i < day.stops.length; i++) {
      const stop = day.stops[i];
      
      // For each stop, extract its time range
      const stopTimeStr = stop.time;
      let stopStartTime = null;
      let stopEndTime = null;
      
      // Try to parse time range (e.g., "10:15-12:15")
      const rangeMatch = stopTimeStr.match(/^(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})$/);
      if (rangeMatch) {
        const startHour = parseInt(rangeMatch[1]);
        const startMin = parseInt(rangeMatch[2]);
        const endHour = parseInt(rangeMatch[3]);
        const endMin = parseInt(rangeMatch[4]);
        stopStartTime = startHour * 60 + startMin;
        stopEndTime = endHour * 60 + endMin;
      } else {
        // Single time (like departure point)
        stopStartTime = parseClockTime(stopTimeStr);
      }
      
      if (stopStartTime !== null) {
        maxEndTime = Math.max(maxEndTime, stopEndTime ?? stopStartTime);
      }
      
      // Add drive segment BETWEEN consecutive stops (regardless of stop.drive property)
      if (i < day.stops.length - 1) {
        const nextStop = day.stops[i + 1];
        const nextTimeStr = nextStop.time;
        
        // Try to extract next stop's start time
        let nextStartTime = null;
        const nextRangeMatch = nextTimeStr.match(/^(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})$/);
        if (nextRangeMatch) {
          const nextStartHour = parseInt(nextRangeMatch[1]);
          const nextStartMin = parseInt(nextRangeMatch[2]);
          nextStartTime = nextStartHour * 60 + nextStartMin;
        } else {
          // Single time
          nextStartTime = parseClockTime(nextTimeStr);
        }
        
        // Current stop's end time (for calculating drive duration)
        const currentStopEnd = stopEndTime || stopStartTime;
        
        // If both times are valid, create a drive segment for the gap
        if (nextStartTime !== null && currentStopEnd !== null && nextStartTime > currentStopEnd) {
          const driveMinutes = nextStartTime - currentStopEnd;
          const description = `${stop.name} → ${nextStop.name}`;
          
          // Use nextStop.drive label (the drive time TO reach the next stop), otherwise calculate from minutes
          let driveLabel = nextStop.drive && nextStop.drive !== '—' && nextStop.drive !== '-' 
            ? nextStop.drive 
            : formatTimeShort(driveMinutes);
          
          segments.push({
            type: nextStop.mode === 'flight' ? 'flight' : 'drive',
            minutes: driveMinutes,
            fullLabel: driveLabel,
            shortLabel: abbreviateTime(driveLabel),
            description: description,
            visitId: nextStop.id,
            clockStart: currentStopEnd,
            clockEnd: nextStartTime
          });
        }
      }
    }
    
    // Build activity segments from clock times
    for (let i = 0; i < day.stops.length; i++) {
      const stop = day.stops[i];
      const stopTimeStr = stop.time;
      
      // Try to parse time range for activity
      const rangeMatch = stopTimeStr.match(/^(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})$/);
      if (rangeMatch) {
        const startHour = parseInt(rangeMatch[1]);
        const startMin = parseInt(rangeMatch[2]);
        const endHour = parseInt(rangeMatch[3]);
        const endMin = parseInt(rangeMatch[4]);
        const clockStart = startHour * 60 + startMin;
        const clockEnd = endHour * 60 + endMin;
        const activityMinutes = clockEnd - clockStart;
        
        if (activityMinutes > 0) {
          const activity = stop.role.split(',')[0].trim();
          const description = `${stop.name}: ${activity}`;
          segments.push({
            type: 'stop',
            minutes: activityMinutes,
            fullLabel: stop.duration,
            shortLabel: abbreviateTime(stop.duration),
            description: description,
            visitId: stop.id,
            clockStart: clockStart,
            clockEnd: clockEnd
          });
        }
      }
    }
    
    // Sort segments by clock start time
    segments.sort((a, b) => (a.clockStart || 0) - (b.clockStart || 0));
    
    // Calculate total timeline span
    const totalMinutes = maxEndTime - startMinutes;
    
    if (segments.length === 0 || totalMinutes === 0) return { ruler: '', timeline: '' };
    
    // Generate hour grid based on full hours
    const hourMarks = [];
    const startHour = Math.ceil(startMinutes / 60);
    const endHour = Math.ceil(maxEndTime / 60);
    
    for (let h = startHour; h <= endHour; h++) {
      const hourMinutes = h * 60;
      const offsetFromStart = hourMinutes - startMinutes;
      if (offsetFromStart >= 0 && offsetFromStart <= totalMinutes) {
        hourMarks.push({
          time: formatHourLabel(hourMinutes),
          offsetPercent: (offsetFromStart / totalMinutes) * 100
        });
      }
    }
    
    // Render timeline ruler with full hour marks
    let rulerHtml = '<div class="timeline-ruler">';
    if (hourMarks.length > 0) {
      rulerHtml += '<div class="timeline-hour-grid">';
      hourMarks.forEach(mark => {
        rulerHtml += `<div class="timeline-hour-mark" style="left:${mark.offsetPercent}%;" data-time="${escapeHtml(mark.time)}"><div class="timeline-hour-label">${escapeHtml(mark.time)}</div><div class="timeline-hour-line"></div></div>`;
      });
      rulerHtml += '</div>';
    }
    rulerHtml += '</div>';
    
    // Render timeline segments with proper wall-clock positioning
    const segmentHtml = segments.map(seg => {
      // Calculate position and width based on wall-clock time
      const visibleStart = Math.max(seg.clockStart, startMinutes);
      const visibleEnd = Math.min(seg.clockEnd, maxEndTime);
      if (visibleEnd <= visibleStart) return '';
      const offsetStart = (visibleStart - startMinutes) / totalMinutes * 100;
      const offsetEnd = (visibleEnd - startMinutes) / totalMinutes * 100;
      const width = Math.max(0, offsetEnd - offsetStart);
      
      const fullTooltip = `${seg.description} (${escapeHtml(seg.fullLabel)})`;
      return `<div class="timeline-segment timeline-${seg.type}" data-visit-id="${seg.visitId}" data-segment-type="${seg.type}" data-width-percent="${width}" tabindex="0" role="button" aria-label="${seg.type === 'flight' ? 'Перелёт' : seg.type === 'drive' ? 'Вождение' : 'Остановка'}: ${fullTooltip}" title="${fullTooltip}" style="left:${offsetStart}%; width:${width}%;"><span class="timeline-time">${escapeHtml(seg.shortLabel)}</span></div>`;
    }).join('');
    
    const timelineHtml = `<div class="timeline-container" data-timeline="day-${day.id}" aria-label="Визуальный обзор дня: вождение и остановки">${segmentHtml}</div>`;
    
    return { ruler: rulerHtml, timeline: timelineHtml };
  }

  function renderDay(day) {
    const timelineData = renderTimeline(day);
    const metaOrder = ['дорога', 'время', 'купание', 'питание', 'логистика'];
    const normalizeLabel = value => value.trim().toLowerCase();
    const metaItems = Array.isArray(day.meta) ? [...day.meta] : [];
    const hasExplicitFood = metaItems.some(item => normalizeLabel(item.label) === 'питание');
    if (!hasExplicitFood && day.mealSummary) {
      metaItems.push({ label: 'Питание', value: day.mealSummary });
    }

    const rankByLabel = new Map(metaOrder.map((label, index) => [label, index]));
    const orderedMeta = metaItems
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const rankA = rankByLabel.get(normalizeLabel(a.item.label));
        const rankB = rankByLabel.get(normalizeLabel(b.item.label));
        const safeRankA = rankA === undefined ? metaOrder.length + a.index : rankA;
        const safeRankB = rankB === undefined ? metaOrder.length + b.index : rankB;
        return safeRankA - safeRankB;
      })
      .map(({ item }) => item);

    const metaLayoutClass = new Map([
      ['дорога', 'meta-road'],
      ['время', 'meta-time'],
      ['купание', 'meta-swimming'],
      ['питание', 'meta-food'],
      ['логистика', 'meta-logistics']
    ]);
    const coreMetaLabels = new Set(['дорога', 'время']);
    const meta = orderedMeta.map(item => {
      const label = normalizeLabel(item.label);
      const emphasisClass = coreMetaLabels.has(label) ? 'primary' : 'secondary';
      const layoutClass = metaLayoutClass.get(label) || 'meta-extra';
      return `<div class="meta-item ${emphasisClass} ${layoutClass}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`;
    }).join('');
    const rows = day.stops.map(stop => {
      const flexible = isFlexibleStop(day, stop);
      const stopDuration = stop.duration && stop.duration !== '—' && stop.duration !== '-' ? stop.duration : '';
      return `<tr class="route-row${flexible?' is-flexible':''}" tabindex="0" data-day-id="${day.id}" data-visit-id="${stop.id}" data-mode="${escapeHtml(stop.mode || 'stop')}" aria-label="Показать ${escapeHtml(stop.name)} на карте">
        <td class="stop-order">${stop.order}</td><td class="stop-name"><strong>${escapeHtml(stop.name)}</strong>${flexible?'<span class="flexible-label">Гибко</span>':''}<span class="role">${escapeHtml(stop.role)}</span></td>
        <td data-label="Дорога">${escapeHtml(stop.distance)}<span class="drive-time">${escapeHtml(stop.drive)}</span></td><td data-label="Время">${escapeHtml(stop.time)}${stopDuration ? `<span class="stop-time">${escapeHtml(stopDuration)}</span>` : ''}</td></tr>`;
    }).join('');
    const sections = ['essentials','food','practical'].map(key => {
      const section = day.sections[key];
      return `<section class="info-card ${key}"><h3>${escapeHtml(section.title)}</h3><ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`;
    }).join('');
    const mapsUrl = buildGoogleMapsUrl(day);
    return `<section id="${day.id}" class="panel day-panel mobile-plan-view" role="tabpanel" aria-labelledby="tab-${day.id}">
      <div class="day-shell">
        <div class="mobile-view-switch" role="group" aria-label="Вид маршрута">
          <button class="mobile-view-button active" type="button" data-view="plan" aria-pressed="true">План</button>
          <button class="mobile-view-button" type="button" data-view="map" aria-pressed="false">Карта</button>
          <button class="mobile-view-button" type="button" data-view="notes" aria-pressed="false">Памятка</button>
        </div>
        <aside class="itinerary">
          <header class="day-header"><div class="eyebrow">${escapeHtml(day.date)}</div><h1>${escapeHtml(day.title)}</h1></header>
          <div class="meta-grid">${meta}</div>
          <div class="timeline-wrapper">
            ${timelineData.ruler}
            ${timelineData.timeline}
          </div>
          <table class="route-table"><thead><tr><th>№</th><th>Точка</th><th>Дорога</th><th>Время</th></tr></thead><tbody>${rows}</tbody></table>
        </aside>
        <div class="map-wrap">
          <div id="map-${day.id}" class="map"></div>
          <a class="map-overlay-link" href="${mapsUrl}" target="_blank" rel="noopener" aria-label="Открыть маршрут в Google Maps">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>
            <span>Открыть в Google Maps</span>
          </a>
          <div class="route-status" role="status" aria-live="polite" hidden>
            <span>Маршрут временно недоступен. Показаны точки по прямой.</span>
            <button class="route-retry" type="button">Повторить</button>
          </div>
          <aside class="stop-detail" hidden tabindex="-1" aria-live="polite" aria-label="Выбранная остановка"></aside>
          <div class="map-caption">Маршрут дня и выбранная остановка</div>
        </div>
        <div class="info-grid day-notes">${sections}</div>
      </div>
    </section>`;
  }

  function adjustTimelineSegmentDisplay() {
    // Use requestAnimationFrame to ensure DOM is fully laid out
    requestAnimationFrame(() => {
      document.querySelectorAll('.timeline-container').forEach(container => {
        const containerWidth = container.offsetWidth;
        if (containerWidth === 0) return; // Not visible yet
        
        container.querySelectorAll('.timeline-segment').forEach(seg => {
          const segWidthPercent = parseFloat(seg.dataset.widthPercent) || 0;
          const segWidthPixels = (segWidthPercent / 100) * containerWidth;
          
          // Remove all display mode classes
          seg.classList.remove('is-narrow', 'is-ultra-narrow');
          
          // Classify based on width:
          // ≥35px: normal (show text)
          // <35px: narrow (hide text, show colored segment only)
          if (segWidthPixels < 35) {
            seg.classList.add('is-narrow');
          }
        });
      });
    });
  }

  function setupTimelineListeners() {
    document.querySelectorAll('.timeline-container').forEach(container => {
      container.addEventListener('mouseleave', () => {
        const focusedSegment = container.querySelector('.timeline-segment:focus');
        if (focusedSegment instanceof HTMLElement) focusedSegment.blur();
        container.querySelectorAll('.timeline-segment').forEach(seg => {
          seg.classList.remove('is-selected');
        });
      });
    });
  }

  function setActiveTimelineSegment(container, segment) {
    if (!container || !segment) return;
    container.querySelectorAll('.timeline-segment').forEach(seg => seg.classList.remove('is-selected'));
    segment.classList.add('is-selected');
  }

  function render() {
    renderPartTabs();
    app.innerHTML = renderOverview() + data.parts.map(renderPartOverview).join('') + data.days.map(renderDay).join('');
    setActivePart('overview');
    setupTimelineListeners();
    adjustTimelineSegmentDisplay();
  }

  function partRouteStyle(color, state = 'rest') {
    if (state === 'active') {
      return { color, weight:6, opacity:.95, lineCap:'round', lineJoin:'round' };
    }
    if (state === 'dim') {
      return { color, weight:3, opacity:.3, lineCap:'round', lineJoin:'round' };
    }
    return { color, weight:4, opacity:.6, lineCap:'round', lineJoin:'round' };
  }

  function partStopStyle(color, state = 'rest') {
    if (state === 'active') {
      return { radius:6, color:'#fffdf8', weight:2, fillColor:color, fillOpacity:.96, opacity:1 };
    }
    if (state === 'dim') {
      return { radius:4, color:'#fffdf8', weight:1.5, fillColor:color, fillOpacity:.28, opacity:.45 };
    }
    return { radius:4.5, color:'#fffdf8', weight:1.5, fillColor:color, fillOpacity:.72, opacity:.88 };
  }

  function routeLabelText(dayId) {
    return String(dayNumber(dayId));
  }

  function routeLabelFraction(dayIndex) {
    const preferredFractions = [0.18, 0.36, 0.54, 0.72, 0.84, 0.27, 0.63, 0.45];
    return preferredFractions[dayIndex % preferredFractions.length];
  }

  function routePointAtFraction(coordinates, fraction) {
    if (!Array.isArray(coordinates) || coordinates.length === 0) return null;
    if (coordinates.length === 1) return coordinates[0];

    const segmentLengths = [];
    let totalLength = 0;
    for (let index = 1; index < coordinates.length; index += 1) {
      const [prevLat, prevLon] = coordinates[index - 1];
      const [nextLat, nextLon] = coordinates[index];
      const length = Math.hypot(nextLat - prevLat, nextLon - prevLon);
      segmentLengths.push(length);
      totalLength += length;
    }
    if (!totalLength) return coordinates[Math.floor((coordinates.length - 1) * fraction)];

    const targetLength = totalLength * Math.max(0.08, Math.min(0.9, fraction));
    let traversed = 0;
    for (let index = 1; index < coordinates.length; index += 1) {
      const segmentLength = segmentLengths[index - 1];
      if (traversed + segmentLength >= targetLength) {
        const segmentFraction = segmentLength ? (targetLength - traversed) / segmentLength : 0;
        const [prevLat, prevLon] = coordinates[index - 1];
        const [nextLat, nextLon] = coordinates[index];
        return [
          prevLat + (nextLat - prevLat) * segmentFraction,
          prevLon + (nextLon - prevLon) * segmentFraction
        ];
      }
      traversed += segmentLength;
    }
    return coordinates[coordinates.length - 1];
  }

  function createRouteLabel(dayId, color, coordinates, dayIndex) {
    const latLng = routePointAtFraction(coordinates, routeLabelFraction(dayIndex));
    if (!latLng) return null;
    return L.marker(latLng, {
      icon: L.divIcon({
        className: '',
        html: `<span class="part-route-label" style="--route-label-color:${escapeHtml(color)}">${escapeHtml(routeLabelText(dayId))}</span>`,
        iconSize: [30, 20],
        iconAnchor: [15, 10]
      }),
      interactive: true,
      keyboard: false,
      zIndexOffset: 500
    });
  }

  function fitPartOverview(partId) {
    const record = partOverviewMaps.get(partId);
    if (!record?.map || !record.bounds?.isValid()) return;
    record.map.invalidateSize({ pan:false });
    record.autoFitting = true;
    record.map.fitBounds(record.bounds, {
      padding: mobileViewport.matches ? [18, 18] : [28, 28],
      animate:false
    });
    record.autoFitting = false;
  }

  function syncPartOverviewState(partId) {
    const record = partOverviewMaps.get(partId);
    if (!record) return;
    const hoveredDayId = record.hoveredDayId;
    record.days.forEach((dayRecord, dayId) => {
      const state = !hoveredDayId ? 'rest' : dayId === hoveredDayId ? 'active' : 'dim';
      dayRecord.route?.setStyle(partRouteStyle(dayRecord.color, state));
      dayRecord.stops.forEach(marker => marker.setStyle(partStopStyle(dayRecord.color, state)));
      dayRecord.label?.setOpacity(state === 'dim' ? 0.55 : 1);
      const labelElement = dayRecord.label?.getElement()?.querySelector('.part-route-label');
      if (labelElement) {
        labelElement.classList.toggle('is-active', state === 'active');
        labelElement.classList.toggle('is-dim', state === 'dim');
      }
      const row = document.querySelector(`#part-${partId} .part-day-item[data-day-id="${dayId}"]`);
      if (row) row.classList.toggle('is-map-hovered', dayId === hoveredDayId);
    });
  }

  function setPartOverviewHover(partId, dayId) {
    const record = partOverviewMaps.get(partId);
    if (!record || record.hoveredDayId === dayId) return;
    record.hoveredDayId = dayId;
    syncPartOverviewState(partId);
  }

  function clearPartOverviewHover(partId) {
    const record = partOverviewMaps.get(partId);
    if (!record || !record.hoveredDayId) return;
    record.hoveredDayId = null;
    syncPartOverviewState(partId);
  }

  function openPartDay(partId, dayId) {
    activatePanel(dayId, true, partId);
  }

  function initializePartOverviewMap(partId) {
    const part = getPart(partId);
    const container = document.getElementById(`part-map-${partId}`);
    if (!part || !container) return;
    if (partOverviewMaps.has(partId)) {
      setTimeout(() => fitPartOverview(partId), 80);
      return;
    }

    const map = L.map(`part-map-${partId}`, {
      zoomControl:true,
      scrollWheelZoom:true
    });
    map.createPane('partRouteHits');
    map.getPane('partRouteHits').style.zIndex = 425;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom:19,
      attribution:'&copy; OpenStreetMap contributors'
    }).addTo(map);

    const days = new Map();
    const bounds = L.latLngBounds([]);
    readyPartDays(part).forEach((day, dayIndex) => {
      const color = dayRouteColor(day.id);
      const routePoints = dayRoutePoints(day);
      routePoints.forEach(point => bounds.extend(point));

      const stops = visiblePartStops(day).map(stop => {
        bounds.extend([stop.lat, stop.lon]);
        const marker = L.circleMarker([stop.lat, stop.lon], partStopStyle(color)).addTo(map);
        marker.on('mouseover', () => setPartOverviewHover(partId, day.id));
        marker.on('mouseout', () => clearPartOverviewHover(partId));
        marker.on('click', () => openPartDay(partId, day.id));
        return marker;
      });

      days.set(day.id, { color, dayIndex, routeCoordinates:null, route:null, routeHitArea:null, label:null, stops });

      fetchRoadRouteCoordinates(day).then(roadCoordinates => {
        const record = partOverviewMaps.get(partId)?.days.get(day.id);
        if (!record || !Array.isArray(roadCoordinates) || roadCoordinates.length < 2) return;
        record.routeCoordinates = roadCoordinates;
        const route = L.polyline(roadCoordinates, { ...partRouteStyle(color), interactive:false }).addTo(map);
        const routeHitArea = L.polyline(roadCoordinates, {
          weight:22,
          opacity:0.001,
          interactive:true,
          pane:'partRouteHits'
        }).addTo(map);
        routeHitArea.on('mouseover', () => setPartOverviewHover(partId, day.id));
        routeHitArea.on('mouseout', () => clearPartOverviewHover(partId));
        routeHitArea.on('click', () => openPartDay(partId, day.id));
        const label = createRouteLabel(day.id, color, roadCoordinates, dayIndex);
        label?.on('mouseover', () => setPartOverviewHover(partId, day.id));
        label?.on('mouseout', () => clearPartOverviewHover(partId));
        label?.on('click', () => openPartDay(partId, day.id));
        label?.addTo(map);
        record.route = route;
        record.routeHitArea = routeHitArea;
        record.label = label;
        syncPartOverviewState(partId);
        schedulePartRouteLabelLayout(partId);
        const overview = partOverviewMaps.get(partId);
        if (overview && !overview.userInteracted) {
          roadCoordinates.forEach(point => overview.bounds.extend(point));
          fitPartOverview(partId);
        }
      });
    });

    partOverviewMaps.set(partId, { map, bounds, days, hoveredDayId:null, userInteracted:false, autoFitting:false });
    map.on('movestart', () => {
      const overview = partOverviewMaps.get(partId);
      if (overview && !overview.autoFitting) overview.userInteracted = true;
    });
    map.on('zoomend', () => schedulePartRouteLabelLayout(partId));
    fitPartOverview(partId);
  }

  function markerKey(visitId) { return visitId; }

  function fitDayRoute(dayId) {
    const day = getDay(dayId);
    const map = maps.get(dayId);
    if (!day || !map) return;
    const points = [];
    for (const visitId of day.routeVisitIds) {
      const stop = day.stops.find(item => item.id === visitId);
      if (stop) points.push(getDrivingCoordinates(stop));
    }
    for (const stop of day.stops.filter(item => item.mapVisible !== false)) points.push([stop.lat, stop.lon]);
    const bounds = L.latLngBounds(points);
    map.invalidateSize({ pan:false });
    if (bounds.isValid()) map.fitBounds(bounds,{ padding:[30,30],animate:false });
  }

  function renderStopDetail(dayId, visitId) {
    const day = getDay(dayId);
    const stop = day?.stops.find(item => item.id === visitId);
    const detail = document.getElementById(dayId)?.querySelector('.stop-detail');
    if (!stop || !detail) return;
    const navigationUrl = buildStopNavigationUrl(stop);
    detail.innerHTML = `<button class="stop-detail-close" type="button" aria-label="Закрыть информацию об остановке">×</button>
      <div class="stop-detail-kicker">Остановка ${escapeHtml(stop.order)}</div>
      <h2><a class="stop-maps-link" href="${navigationUrl}" target="_blank" rel="noopener" aria-label="Открыть ${escapeHtml(stop.name)} в Google Maps">${escapeHtml(stop.name)}<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg></a></h2>
      <p class="stop-detail-role">${escapeHtml(stop.role)}</p>
      <dl class="stop-detail-facts">
        <div><dt>Время</dt><dd>${escapeHtml(stop.time)}</dd></div>
        <div><dt>Остановка</dt><dd>${escapeHtml(stop.duration)}</dd></div>
        <div><dt>От предыдущей</dt><dd>${escapeHtml(stop.drive)}, ${escapeHtml(stop.distance)}</dd></div>
      </dl>
      <p class="stop-detail-note"><strong>Примечание:</strong> ${escapeHtml(stop.note)}</p>
      ${parkingCardHtml(stop)}`;
    detail.hidden = false;
    detail.closest('.map-wrap').classList.add('has-stop-detail');
  }

  function syncSelectionUI(dayId, selectedType, selectedVisitId, isHover = false) {
    const panel = document.getElementById(dayId);
    if (!panel) return;
    
    const selectionClass = isHover ? 'is-hovered' : 'is-selected';
    
    // Clear previous hover states if this is a hover, or selection states if not
    if (isHover) {
      panel.querySelectorAll('.route-row.is-hovered, .route-row.is-stop-hovered, .route-row.is-drive-hovered').forEach(row => {
        row.classList.remove('is-hovered', 'is-stop-hovered', 'is-drive-hovered');
      });
      panel.querySelectorAll('.timeline-segment.is-hovered').forEach(seg => {
        seg.classList.remove('is-hovered');
      });
      markerIndex.forEach(({ element }, key) => {
        if (key.startsWith(dayId) && element) element.classList.remove('is-hovered');
      });
      clearParkingMarkerState(dayId, 'is-hovered');
    } else {
      // Clear all previous selections
      panel.querySelectorAll('.route-row').forEach(row => {
        row.classList.remove('is-active', 'is-drive-selected', 'is-stop-selected');
      });
      panel.querySelectorAll('.timeline-segment').forEach(seg => {
        seg.classList.remove('is-selected');
      });
      markerIndex.forEach(({ element }, key) => {
        if (key.startsWith(dayId) && element) element.classList.remove('is-active');
      });
      clearParkingMarkerState(dayId, 'is-active');
    }
    
    if (!selectedType || selectedVisitId === null) return; // Cleared but no new selection/hover
    
    // Apply selection/hover based on type
    if (selectedType === 'stop') {
      // Highlight the stop row
      const row = panel.querySelector(`.route-row[data-visit-id="${selectedVisitId}"]`);
      if (isHover) {
        row?.classList.add('is-hovered', 'is-stop-hovered');
      } else {
        row?.classList.add('is-active', 'is-stop-selected');
      }
      
      // Highlight the stop timeline segment
      const segment = panel.querySelector(`.timeline-segment[data-visit-id="${selectedVisitId}"][data-segment-type="stop"]`);
      segment?.classList.add(selectionClass);
      
      // Highlight the map marker
      const marker = markerIndex.get(markerKey(selectedVisitId));
      marker?.element?.classList.add(isHover ? 'is-hovered' : 'is-active');
      setParkingMarkerState(dayId, selectedVisitId, isHover ? 'is-hovered' : 'is-active');
      
    } else if (selectedType === 'drive') {
      // Highlight the destination stop's row with drive column styling (Км + В пути)
      const row = panel.querySelector(`.route-row[data-visit-id="${selectedVisitId}"]`);
      if (isHover) {
        row?.classList.add('is-hovered', 'is-drive-hovered');
      } else {
        row?.classList.add('is-active', 'is-drive-selected');
      }
      
      // Highlight the drive timeline segment
      const segment = panel.querySelector(`.timeline-segment[data-visit-id="${selectedVisitId}"][data-segment-type="drive"]`);
      segment?.classList.add(selectionClass);
    }
  }

  function closeStopDetail(dayId,fitRoute = true,restoreFocus = true) {
    const panel = document.getElementById(dayId);
    const detail = panel?.querySelector('.stop-detail');
    if (!detail) return;
    const activeRow = panel.querySelector('.route-row.is-active');
    const focusTarget = mobileViewport.matches && panel.classList.contains('mobile-map-view')
      ? panel.querySelector('[data-view="map"]')
      : activeRow;
    detail.hidden = true;
    detail.innerHTML = '';
    detail.closest('.map-wrap').classList.remove('has-stop-detail');
    syncSelectionUI(dayId, null, null);
    clearHoverDrive(dayId);
    delete panel.dataset.focusVisit;
    if (fitRoute && (!mobileViewport.matches || panel.classList.contains('mobile-map-view'))) fitDayRoute(dayId);
    if (restoreFocus) focusTarget?.focus({ preventScroll:true });
  }

  function setMobileView(dayId, view, restoreScroll = true) {
    const panel = document.getElementById(dayId);
    if (!panel || !mobileViewport.matches) return;
    const showPlan = view === 'plan';
    const showMap = view === 'map';
    if (!showPlan && panel.classList.contains('mobile-plan-view')) panel.dataset.planScroll = String(window.scrollY);
    panel.classList.toggle('mobile-plan-view', showPlan);
    panel.classList.toggle('mobile-map-view', showMap);
    panel.classList.toggle('mobile-notes-view', view === 'notes');
    panel.querySelectorAll('.mobile-view-button').forEach(button => {
      const isActive = button.dataset.view === view;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    if (showMap) {
      window.scrollTo({ top:0, behavior:'instant' });
      setTimeout(() => fitDayRoute(dayId), 70);
    } else if (showPlan && restoreScroll) {
      void panel.offsetHeight;
      window.scrollTo({ top:Number(panel.dataset.planScroll) || 0, behavior:'instant' });
    } else {
      window.scrollTo({ top:0, behavior:'instant' });
    }
  }

  function activateStopRow(row) {
    const dayId = row.dataset.dayId;
    const visitId = row.dataset.visitId;
    clearActiveDrive(dayId);
    if (!mobileViewport.matches) { selectStop(dayId, visitId, true); return; }
    document.getElementById(dayId).dataset.focusVisit = visitId;
    selectStop(dayId, visitId);
    setMobileView(dayId, 'map');
    setTimeout(() => {
      selectStop(dayId, visitId, true);
      document.getElementById(dayId)?.querySelector('.stop-detail')?.focus({ preventScroll:true });
    },100);
  }

  function setActiveStop(dayId, visitId, focusMap = false) {
    document.querySelectorAll(`.route-row[data-day-id="${dayId}"]`).forEach(row => {
      row.classList.toggle('is-active', row.dataset.visitId === visitId);
    });
    const record = markerIndex.get(markerKey(visitId));
    if (!record) return;
    markerIndex.forEach(({ element }, key) => {
      if (key.startsWith(dayId) && element) element.classList.remove('is-active');
    });
    clearParkingMarkerState(dayId, 'is-active');
    if (record.element) record.element.classList.add('is-active');
    setParkingMarkerState(dayId, visitId, 'is-active');
    if (focusMap) {
      const day = getDay(dayId);
      const stop = day?.stops.find(item => item.id === visitId);
      const parking = getPrimaryParking(stop);
      if (stop && isSeparateParking(stop) && parking) {
        record.map.fitBounds([[stop.lat, stop.lon], [parking.lat, parking.lon]], { padding:[70,70], maxZoom:17, animate:true });
      } else {
        record.map.setView(record.marker.getLatLng(), Math.max(record.map.getZoom(), 13), { animate:true });
      }
    }
  }

  function selectStop(dayId, visitId, focusMap = false) {
    const day = getDay(dayId);
    const stop = day?.stops.find(item => item.id === visitId);
    clearActiveDrive(dayId);
    setActiveStop(dayId, visitId, focusMap);
    renderStopDetail(dayId, visitId);
    syncSelectionUI(dayId, 'stop', visitId);
    if (stop) scheduleParkingFocus(dayId, stop);
  }

  function clearMapDriveHighlight(dayId) {
    const map = maps.get(dayId);
    const state = routingIndex.get(dayId);
    if (!map || !state?.driveHighlight) return;
    map.removeLayer(state.driveHighlight);
    state.driveHighlight = null;
  }

  function clearActiveDrive(dayId) {
    const panel = document.getElementById(dayId);
    if (!panel) return;
    clearMapDriveHighlight(dayId);
  }

  function routeSegmentCoordinates(dayId, fromRouteIndex, toRouteIndex) {
    const state = routingIndex.get(dayId);
    const route = state?.lastRoute;
    if (!route || !Array.isArray(route.coordinates) || !Array.isArray(route.waypointIndices)) return null;
    const startCoordIndex = route.waypointIndices[fromRouteIndex];
    const endCoordIndex = route.waypointIndices[toRouteIndex];
    if (!Number.isInteger(startCoordIndex) || !Number.isInteger(endCoordIndex) || endCoordIndex <= startCoordIndex) return null;
    const segmentCoords = route.coordinates.slice(startCoordIndex, endCoordIndex + 1)
      .map(point => {
        if (Array.isArray(point) && point.length >= 2) return [point[0], point[1]];
        if (point && typeof point.lat === 'number' && typeof point.lng === 'number') return [point.lat, point.lng];
        if (point && typeof point.lat === 'number' && typeof point.lon === 'number') return [point.lat, point.lon];
        return null;
      })
      .filter(Boolean);
    return segmentCoords.length > 1 ? segmentCoords : null;
  }

  function setActiveDrive(dayId, visitId, driveCoordinates) {
    const panel = document.getElementById(dayId);
    const map = maps.get(dayId);
    const state = routingIndex.get(dayId);
    if (!panel) return;
    clearActiveDrive(dayId);
    if (map && state && Array.isArray(driveCoordinates) && driveCoordinates.length > 1) {
      state.driveHighlight = L.polyline(driveCoordinates, { color:'#f3b11f', weight:6, opacity:.92, lineCap:'round' }).addTo(map);
    }
    syncSelectionUI(dayId, 'drive', visitId);
  }

  function setHoverDrive(dayId, visitId) {
    const panel = document.getElementById(dayId);
    const map = maps.get(dayId);
    const state = routingIndex.get(dayId);
    if (!panel || !map || !state) return;
    
    // Clear previous hover highlight
    if (state.driveHoverHighlight) {
      map.removeLayer(state.driveHoverHighlight);
      state.driveHoverHighlight = null;
    }
    
    const day = getDay(dayId);
    if (!day) return;
    
    const currentOrderIndex = day.routeVisitIds.indexOf(visitId);
    if (currentOrderIndex <= 0) return;
    
    // Get coordinates for this drive segment
    const segCoords = routeSegmentCoordinates(dayId, currentOrderIndex - 1, currentOrderIndex);
    if (segCoords && segCoords.length > 1) {
      state.driveHoverHighlight = L.polyline(segCoords, { color:'#f3b11f', weight:4, opacity:.6, lineCap:'round', dashArray:'5,5' }).addTo(map);
    }
  }

  function clearHoverDrive(dayId) {
    const map = maps.get(dayId);
    const state = routingIndex.get(dayId);
    if (!map || !state) return;
    if (state.driveHoverHighlight) {
      map.removeLayer(state.driveHoverHighlight);
      state.driveHoverHighlight = null;
    }
  }

  function focusTimelineStop(dayId, visitId) {
    const panel = document.getElementById(dayId);
    if (!panel) return;
    const row = panel.querySelector(`.route-row[data-visit-id="${visitId}"]`);
    if (row) {
      activateStopRow(row);
      return;
    }
    setActiveStop(dayId, visitId, true);
    renderStopDetail(dayId, visitId);
  }

  function focusTimelineDrive(dayId, visitId) {
    const panel = document.getElementById(dayId);
    const day = getDay(dayId);
    if (!panel || !day) return;
    if (mobileViewport.matches && panel.classList.contains('mobile-plan-view')) {
      setMobileView(dayId, 'map');
      setTimeout(() => focusTimelineDrive(dayId, visitId), 100);
      return;
    }

    const map = maps.get(dayId);
    const currentOrderIndex = day.routeVisitIds.indexOf(visitId);
    if (!map || currentOrderIndex <= 0) return;

    const currentStop = day.stops.find(item => item.id === visitId);
    const previousStop = day.stops.find(item => item.id === day.routeVisitIds[currentOrderIndex - 1]);
    if (!currentStop || !previousStop) return;
    const segmentCoordinates = routeSegmentCoordinates(dayId, currentOrderIndex - 1, currentOrderIndex);

    closeStopDetail(dayId, false, false);
    setActiveDrive(dayId, visitId, segmentCoordinates);
    map.invalidateSize({ pan:false });
    if (segmentCoordinates) {
      map.fitBounds(segmentCoordinates, { padding:[60,60], maxZoom:13, animate:true });
      return;
    }
    map.fitBounds([
      getDrivingCoordinates(previousStop),
      getDrivingCoordinates(currentStop)
    ], { padding:[60,60], maxZoom:13, animate:true });
  }

  function setRouteFailure(dayId,failed) {
    const status = document.getElementById(dayId)?.querySelector('.route-status');
    if (status) status.hidden = !failed;
  }

  function initializeRoute(dayId) {
    const day = getDay(dayId);
    const map = maps.get(dayId);
    if (!day || !map) return;

    const previous = routingIndex.get(dayId);
    routingIndex.delete(dayId);
    if (previous?.control) map.removeControl(previous.control);
    if (previous?.fallback) map.removeLayer(previous.fallback);
    if (previous?.driveHighlight) map.removeLayer(previous.driveHighlight);
    previous?.segmentOverlays?.forEach(l => map.removeLayer(l));
    setRouteFailure(dayId,false);

    const routeStops = day.routeVisitIds.map(visitId => day.stops.find(stop => stop.id === visitId)).filter(Boolean);
    const bounds = day.stops.filter(stop => stop.mapVisible !== false).map(stop => [stop.lat,stop.lon]);
    routeStops.forEach(stop => bounds.push(getDrivingCoordinates(stop)));
    const routing = L.Routing.control({
      waypoints: routeStops.map(stop => L.latLng(...getDrivingCoordinates(stop))),
      router:L.Routing.osrmv1({ serviceUrl:'https://router.project-osrm.org/route/v1' }),
      addWaypoints:false, draggableWaypoints:false, routeWhileDragging:false,
      showAlternatives:false, fitSelectedRoutes:true, createMarker:() => null,
      lineOptions:{ styles:[{ color:'#fffdf8',opacity:.9,weight:7 },{ color:'#078b9d',opacity:.92,weight:4 }] }
    }).addTo(map);
    routingIndex.set(dayId,{ control:routing,fallback:null,driveHighlight:null,driveHoverHighlight:null,lastRoute:null,segmentOverlays:[] });
    routing.on('routesfound', event => {
      if (routingIndex.get(dayId)?.control !== routing) return;
      const state = routingIndex.get(dayId);
      if (state) state.lastRoute = event.routes?.[0] || null;
      setRouteFailure(dayId,false);
      // Add invisible wide overlays on each segment so they're clickable
      state.segmentOverlays?.forEach(l => map.removeLayer(l));
      state.segmentOverlays = [];
      for (let i = 1; i < day.routeVisitIds.length; i++) {
        const segCoords = routeSegmentCoordinates(dayId, i - 1, i);
        if (!segCoords) continue;
        const visitId = day.routeVisitIds[i];
        const overlay = L.polyline(segCoords, { weight:20, opacity:0.001, interactive:true, pane:'routeOverlays' }).addTo(map);
        overlay.on('click', () => focusTimelineDrive(dayId, visitId));
        // Add hover listeners to route overlay
        overlay.on('mouseover', () => {
          syncSelectionUI(dayId, 'drive', visitId, true);
          setHoverDrive(dayId, visitId);
        });
        overlay.on('mouseout', () => {
          syncSelectionUI(dayId, null, null, true);
          clearHoverDrive(dayId);
        });
        state.segmentOverlays.push(overlay);
      }
      const panel = document.getElementById(dayId);
      if (panel?.classList.contains('mobile-map-view') && !panel.dataset.focusVisit) fitDayRoute(dayId);
    });
    routing.on('routingerror', () => {
      const state = routingIndex.get(dayId);
      if (state?.control !== routing) return;
      if (bounds.length > 1) {
        if (state.fallback) map.removeLayer(state.fallback);
        state.fallback = L.polyline(bounds,{color:'#078b9d',dashArray:'8,8',weight:3}).addTo(map);
        map.fitBounds(bounds,{padding:[30,30]});
      }
      setRouteFailure(dayId,true);
    });
  }

  function initializeMap(dayId) {
    const day = getDay(dayId);
    if (!day) return;
    if (maps.has(dayId)) { setTimeout(() => maps.get(dayId).invalidateSize(), 70); return; }

    const map = L.map(`map-${dayId}`, { zoomControl:true });
    maps.set(dayId, map);
    map.createPane('routeOverlays');
    map.getPane('routeOverlays').style.zIndex = 450;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap contributors' }).addTo(map);

    fitDayRoute(dayId);

    const visibleStops = day.stops.filter(stop => stop.mapVisible !== false);
    visibleStops.forEach(stop => {
      const icon = L.divIcon({ className:'', html:`<div class="numbered-marker" data-marker-order="${stop.order}">${stop.order}</div>`, iconSize:[36,36], iconAnchor:[18,18] });
      const marker = L.marker([stop.lat,stop.lon], { icon });
      marker.on('click', () => selectStop(dayId, stop.id));
      marker.on('add', () => {
        const element = marker.getElement()?.querySelector('.numbered-marker');
        markerIndex.set(markerKey(stop.id), { marker,map,element,baseLatLng:L.latLng(stop.lat, stop.lon) });
        if (element) {
          element.addEventListener('mouseover', () => syncSelectionUI(dayId, 'stop', stop.id, true));
          element.addEventListener('mouseout', () => {
            syncSelectionUI(dayId, null, null, true);
            clearHoverDrive(dayId);
          });
        }
      });
      marker.addTo(map);

      const parking = getPrimaryParking(stop);
      if (!isSeparateParking(stop) || !parking) return;
      const parkingMarker = L.marker([parking.lat, parking.lon], {
        icon: parkingMarkerIcon(),
        keyboard: true,
        title: parking.name || 'Парковка'
      });
      parkingMarker.on('click', () => selectStop(dayId, stop.id, true));
      parkingMarker.on('add', () => {
        const element = parkingMarker.getElement()?.querySelector('.parking-marker');
        parkingMarkerIndex.set(parkingMarkerKey(dayId, stop.id), { marker:parkingMarker, map, element });
      });
      parkingMarker.addTo(map);
      L.polyline([[stop.lat, stop.lon], [parking.lat, parking.lon]], {
        color:'#5d6f73', weight:2, opacity:.65, dashArray:'4,5', interactive:false
      }).addTo(map);
    });

    initializeRoute(dayId);
    setTimeout(() => map.invalidateSize(), 150);
  }

  function hashForNavigation(panelId, partId) {
    if (panelId === 'overview') return '#overview';
    if (panelId === `part-${partId}`) return `#${partId}`;
    return `#${partId}/${panelId}`;
  }

  function activatePanel(panelId, updateHash = true, requestedPartId = null) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    let partId = requestedPartId;
    if (panelId === 'overview') partId = 'overview';
    else if (panelId.startsWith('part-')) partId = panelId.slice(5);
    else if (!getPart(partId)?.dayIds.includes(panelId)) {
      const currentPart = getPart(activePartId);
      partId = currentPart?.dayIds.includes(panelId) ? activePartId : defaultPartForDay(panelId);
    }

    if (activePanel !== panelId && getDay(activePanel)) closeStopDetail(activePanel, false, false);
    activePanel = panelId;
    setActivePart(partId);

    document.querySelectorAll('.panel').forEach(item => item.classList.toggle('active', item.id === panelId));
    document.querySelectorAll('.tab-button').forEach(button => {
      const active = button.dataset.target === panelId;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });

    if (getDay(panelId)) {
      initializeMap(panelId);
      adjustTimelineSegmentDisplay();
      if (mobileViewport.matches) {
        delete document.getElementById(panelId).dataset.focusVisit;
        setMobileView(panelId, 'plan', false);
      }
    } else if (panelId.startsWith('part-')) {
      initializePartOverviewMap(partId);
    }

    if (updateHash) history.replaceState(null, '', hashForNavigation(panelId, partId));
    window.scrollTo({ top:0, behavior:'instant' });

    const activeButton = tabs.querySelector(`.tab-button[data-target="${panelId}"]`);
    if (activeButton) tabs.scrollLeft = activeButton.offsetLeft - (tabs.clientWidth - activeButton.offsetWidth) / 2;
  }

  function bindEvents() {
    partTabs.addEventListener('click', event => {
      const button = event.target.closest('.part-button');
      if (button) activatePanel(button.dataset.target, true, button.dataset.partId);
    });
    partTabs.addEventListener('keydown', event => {
      if (!event.target.matches('.part-button')) return;
      const buttons = [...partTabs.querySelectorAll('.part-button')];
      const current = buttons.indexOf(event.target);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : event.key === 'ArrowRight' ? (current + 1) % buttons.length : event.key === 'ArrowLeft' ? (current - 1 + buttons.length) % buttons.length : -1;
      if (next >= 0) {
        event.preventDefault();
        buttons[next].focus();
        activatePanel(buttons[next].dataset.target, true, buttons[next].dataset.partId);
      }
    });
    tabs.addEventListener('click', event => {
      const button = event.target.closest('.tab-button');
      if (button) activatePanel(button.dataset.target);
    });
    tabs.addEventListener('keydown', event => {
      if (!event.target.matches('.tab-button')) return;
      const buttons = [...tabs.querySelectorAll('.tab-button:not(:disabled)')];
      const current = buttons.indexOf(event.target);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : event.key === 'ArrowRight' ? (current + 1) % buttons.length : event.key === 'ArrowLeft' ? (current - 1 + buttons.length) % buttons.length : -1;
      if (next >= 0) { event.preventDefault(); buttons[next].focus(); activatePanel(buttons[next].dataset.target); }
    });
    app.addEventListener('click', event => {
      const retryButton = event.target.closest('.route-retry');
      if (retryButton) { initializeRoute(retryButton.closest('.day-panel').id); return; }
      const closeButton = event.target.closest('.stop-detail-close');
      if (closeButton) {
        const panelId = closeButton.closest('.day-panel').id;
        clearActiveDrive(panelId);
        closeStopDetail(panelId, false);
        return;
      }
      const viewButton = event.target.closest('.mobile-view-button');
      if (viewButton) {
        const panel = viewButton.closest('.day-panel');
        delete panel.dataset.focusVisit;
        clearActiveDrive(panel.id);
        setMobileView(panel.id, viewButton.dataset.view);
        return;
      }
      const timelineSegment = event.target.closest('.timeline-segment');
      if (timelineSegment) {
        const container = timelineSegment.closest('.timeline-container');
        if (container) {
          const dayPanel = container.closest('.day-panel');
          const visitId = timelineSegment.dataset.visitId;
          const segmentType = timelineSegment.dataset.segmentType;
          setActiveTimelineSegment(container, timelineSegment);
          if (dayPanel && visitId) {
            if (segmentType === 'drive') focusTimelineDrive(dayPanel.id, visitId);
            if (segmentType === 'stop') focusTimelineStop(dayPanel.id, visitId);
          }
        }
        return;
      }
      const partDay = event.target.closest('.part-day-item[data-day-id]');
      if (partDay) {
        activatePanel(partDay.dataset.dayId, true, partDay.dataset.partId);
        return;
      }
      const summaryDay = event.target.closest('.summary-day');
      if (summaryDay) {
        activatePanel(summaryDay.dataset.dayId, true, summaryDay.dataset.partId || defaultPartForDay(summaryDay.dataset.dayId));
        return;
      }
      const row = event.target.closest('.route-row');
      if (row) {
        // Click on merged distance/drive column triggers drive selection.
        const cell = event.target.closest('td');
        if (cell) {
          const cellIndex = [...row.cells].indexOf(cell);
          if (row.dataset.mode !== 'flight' && cellIndex === 2 && cell.textContent.trim() !== '—') {
            focusTimelineDrive(row.dataset.dayId, row.dataset.visitId);
            return;
          }
        }
        activateStopRow(row);
      }
    });
    app.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        const detail = event.target.closest('.stop-detail');
        if (detail) { closeStopDetail(detail.closest('.day-panel').id); return; }
      }
      const summaryDay = event.target.closest('.summary-day');
      if (summaryDay && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        summaryDay.click();
        return;
      }
      const timelineSegment = event.target.closest('.timeline-segment');
      if (timelineSegment) {
        const container = timelineSegment.closest('.timeline-container');
        const segments = container ? [...container.querySelectorAll('.timeline-segment')] : [];
        const currentIndex = segments.indexOf(timelineSegment);
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          timelineSegment.click();
          return;
        }
        const targetIndex = event.key === 'Home' ? 0
          : event.key === 'End' ? segments.length - 1
          : event.key === 'ArrowRight' ? Math.min(currentIndex + 1, segments.length - 1)
          : event.key === 'ArrowLeft' ? Math.max(currentIndex - 1, 0)
          : -1;
        if (targetIndex >= 0 && segments[targetIndex]) {
          event.preventDefault();
          const nextSegment = segments[targetIndex];
          nextSegment.focus();
        }
        return;
      }
      const partDay = event.target.closest('.part-day-item[data-day-id]');
      if (partDay && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        partDay.click();
        return;
      }
      const row = event.target.closest('.route-row');
      if (row && (event.key==='Enter' || event.key===' ')) { event.preventDefault(); activateStopRow(row); }
    });
    // Add hover listeners to timeline segments using mouseover/mouseout (bubbling events)
    app.addEventListener('mouseover', event => {
      const segment = event.target.closest('.timeline-segment');
      if (!segment) return;
      const container = segment.closest('.timeline-container');
      const dayPanel = container?.closest('.day-panel');
      if (dayPanel) {
        const visitId = segment.dataset.visitId;
        const segmentType = segment.dataset.segmentType;
        syncSelectionUI(dayPanel.id, segmentType, visitId, true);
        // Show drive highlight on map when hovering over drive segment
        if (segmentType === 'drive') {
          setHoverDrive(dayPanel.id, visitId);
        }
      }
    });
    app.addEventListener('mouseout', event => {
      const segment = event.target.closest('.timeline-segment');
      if (!segment) return;
      const container = segment.closest('.timeline-container');
      const dayPanel = container?.closest('.day-panel');
      if (dayPanel) {
        syncSelectionUI(dayPanel.id, null, null, true);
        clearHoverDrive(dayPanel.id);
      }
    });
    
    // Add hover listeners to table rows using mouseover/mouseout (bubbling events)
    app.addEventListener('mouseover', event => {
      const row = event.target.closest('.route-row');
      if (!row) return;
      const dayId = row.dataset.dayId;
      const visitId = row.dataset.visitId;
      const cell = event.target.closest('td');
      if (cell) {
        const cellIndex = [...row.cells].indexOf(cell);
        // Hover on merged distance/drive column highlights drive, otherwise highlights stop.
        const isDriveCell = row.dataset.mode !== 'flight' && cellIndex === 2 && cell.textContent.trim() !== '—';
        const selectedType = isDriveCell ? 'drive' : 'stop';
        syncSelectionUI(dayId, selectedType, visitId, true);
        // Show drive highlight on map when hovering over drive columns
        if (isDriveCell) {
          setHoverDrive(dayId, visitId);
        }
      } else {
        syncSelectionUI(dayId, 'stop', visitId, true);
      }
    });
    app.addEventListener('mouseout', event => {
      const row = event.target.closest('.route-row');
      if (!row) return;
      if (row.contains(event.relatedTarget)) return;
      const dayId = row.dataset.dayId;
      syncSelectionUI(dayId, null, null, true);
      clearHoverDrive(dayId);
    });

    app.addEventListener('mouseover', event => {
      const partDay = event.target.closest('.part-day-item[data-day-id]');
      if (!partDay) return;
      setPartOverviewHover(partDay.dataset.partId, partDay.dataset.dayId);
    });
    app.addEventListener('mouseout', event => {
      const partDay = event.target.closest('.part-day-item[data-day-id]');
      if (!partDay) return;
      if (partDay.contains(event.relatedTarget)) return;
    });
    app.addEventListener('focusin', event => {
      const partDay = event.target.closest('.part-day-item[data-day-id]');
      if (!partDay) return;
      setPartOverviewHover(partDay.dataset.partId, partDay.dataset.dayId);
    });
    app.addEventListener('focusout', event => {
      const partDay = event.target.closest('.part-day-item[data-day-id]');
      if (!partDay) return;
      if (partDay.contains(event.relatedTarget)) return;
      clearPartOverviewHover(partDay.dataset.partId);
    });
    app.addEventListener('mouseleave', event => {
      const partList = event.target instanceof Element && event.target.matches('.part-day-list')
        ? event.target
        : null;
      if (!partList) return;
      const panel = partList.closest('.part-panel');
      if (!panel) return;
      clearPartOverviewHover(panel.id.slice(5));
    }, true);
    app.addEventListener('mouseleave', event => {
      const partMap = event.target instanceof Element && event.target.matches('.part-overview-map')
        ? event.target
        : null;
      if (!partMap) return;
      const panel = partMap.closest('.part-panel');
      if (!panel) return;
      clearPartOverviewHover(panel.id.slice(5));
    }, true);
    
    window.addEventListener('beforeprint', () => {
      data.parts?.forEach(part => initializePartOverviewMap(part.id));
      data.days.forEach(day => initializeMap(day.id));
      setTimeout(() => {
        [...partOverviewMaps.values()].forEach(record => record.map.invalidateSize());
        [...maps.values()].forEach(map => map.invalidateSize());
      },300);
    });
  }

  function openingDate() {
    const preview = new URLSearchParams(location.search).get('date');
    const match = preview?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return new Date();
    const [,year,month,day] = match.map(Number);
    const date = new Date(year,month - 1,day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : new Date();
  }

  function navigationForDate(date) {
    if (date.getFullYear() !== 2026 || date.getMonth() !== 7) {
      return { panelId:'overview', partId:'overview' };
    }
    const dayId = `2026-08-${String(date.getDate()).padStart(2, '0')}`;
    if (getDay(dayId)) {
      return { panelId:dayId, partId:date.getDate() <= 15 ? 'east' : 'west' };
    }
    if (date.getDate() >= 15 && date.getDate() <= 22) {
      return { panelId:'part-west', partId:'west' };
    }
    return { panelId:'overview', partId:'overview' };
  }

  function navigationFromHash() {
    const hash = location.hash.slice(1);
    if (!hash) return null;
    if (hash === 'overview') return { panelId:'overview', partId:'overview' };
    if (getPart(hash)) return { panelId:`part-${hash}`, partId:hash };

    const scoped = hash.match(/^(east|west)\/(2026-08-\d{2})$/);
    if (scoped) {
      const [, partId, dayId] = scoped;
      return getDay(dayId) && getPart(partId)?.dayIds.includes(dayId)
        ? { panelId:dayId, partId }
        : { panelId:`part-${partId}`, partId };
    }

    if (getDay(hash)) return { panelId:hash, partId:defaultPartForDay(hash) };
    return null;
  }

  function registerServiceWorker() {
    function refreshStatus() {
      if (waitingWorker) {
        appStatusText.textContent = 'Доступна новая версия маршрута.';
        appStatusAction.hidden = false;
        appStatus.hidden = false;
      } else if (isOffline) {
        appStatusText.textContent = 'Офлайн · план и памятка доступны';
        appStatusAction.hidden = true;
        appStatus.hidden = false;
      } else {
        appStatus.hidden = true;
      }
    }

    async function checkConnection() {
      if (!navigator.onLine) {
        isOffline = true;
      } else if (location.protocol === 'file:') {
        isOffline = false;
      } else {
        try {
          const response = await fetch('./',{ method:'HEAD',cache:'no-store' });
          isOffline = !response.ok;
        } catch {
          isOffline = true;
        }
      }
      refreshStatus();
    }

    function trackInstalling(worker) {
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          waitingWorker = worker;
          refreshStatus();
        }
      });
    }

    window.addEventListener('online',checkConnection);
    window.addEventListener('offline', () => { isOffline = true; refreshStatus(); });
    checkConnection();
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;

    appStatusAction.addEventListener('click', () => waitingWorker?.postMessage({ type:'SKIP_WAITING' }));
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!waitingWorker || reloadingForUpdate) return;
      reloadingForUpdate = true;
      location.reload();
    });
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
      if (registration.waiting) {
        waitingWorker = registration.waiting;
        refreshStatus();
      }
      registration.addEventListener('updatefound', () => trackInstalling(registration.installing));
    }).catch(error => {
      console.warn('Offline support is unavailable.',error);
    });
  }

  render();
  bindEvents();
  const initialNavigation = navigationFromHash() || navigationForDate(openingDate());
  activatePanel(initialNavigation.panelId, false, initialNavigation.partId);
  registerServiceWorker();
})();
