(() => {
  'use strict';

  const data = window.CRETE_ITINERARY;
  if (!data) throw new Error('CRETE_ITINERARY is not loaded');

  const app = document.getElementById('app');
  const tabs = document.getElementById('tabs');
  const projectTitle = document.getElementById('project-title');
  const appStatus = document.getElementById('app-status');
  const appStatusText = document.getElementById('app-status-text');
  const appStatusAction = document.getElementById('app-status-action');
  const maps = new Map();
  const markerIndex = new Map();
  const routingIndex = new Map();
  const mobileViewport = window.matchMedia('(max-width: 800px)');
  let activePanel = 'overview';
  let isOffline = !navigator.onLine;
  let waitingWorker = null;
  let reloadingForUpdate = false;

  const escapeHtml = value => String(value)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  function buildGoogleMapsUrl(day) {
    const routeStops = day.routeStopOrders.map(order => day.stops.find(stop => stop.order === order));
    const [origin, ...rest] = routeStops;
    const destination = rest.pop();
    const params = new URLSearchParams({
      api: '1',
      origin: origin.navigationQuery,
      destination: destination.navigationQuery,
      travelmode: 'driving'
    });
    if (rest.length) params.set('waypoints', rest.map(stop => stop.navigationQuery).join('|'));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function buildStopNavigationUrl(stop) {
    const params = new URLSearchParams({
      api:'1',
      destination:stop.navigationQuery,
      travelmode:'driving',
      dir_action:'navigate'
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function renderTabs() {
    const items = [
      { id:'overview', label:'Обзор', subtitle:'11–15 августа' },
      ...data.days.map(day => ({ id:day.id, label:`${day.short.split(' ')[0]} авг`, subtitle:day.title }))
    ];
    tabs.innerHTML = items.map((item,index) => `
      <button id="tab-${item.id}" class="tab-button${index===0?' active':''}" data-target="${item.id}" type="button" role="tab" aria-controls="${item.id}" aria-selected="${index===0?'true':'false'}" tabindex="${index===0?'0':'-1'}">
        <span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.subtitle)}</small>
      </button>`).join('');
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
    return `<section id="overview" class="panel active" role="tabpanel" aria-labelledby="tab-overview">
      <div class="overview-shell">
        <div class="overview-hero">
          <div class="overview-hero-content">
            <div class="eyebrow">Восточный Крит</div>
            <h1>Крит 2026</h1>
            <p class="lead">${escapeHtml(data.project.lead)}</p>
          </div>
          <div class="photo-credit">Фото: <a href="https://commons.wikimedia.org/wiki/File:Vai_R01.jpg" target="_blank" rel="noopener">Marc Ryckaert</a> · <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a></div>
        </div>
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
          <h2>Правила маршрута</h2>
          <ul class="rules-list">${overview.rules.map(rule => `<li>${escapeHtml(rule)}</li>`).join('')}</ul>
        </article>
        <div class="privacy-note">${escapeHtml(overview.privacyNote)}</div>
      </div>
    </section>`;
  }

  function isFlexibleStop(day, stop) {
    return day.sections.essentials.items.some(item =>
      /^Гибкая остановка:/i.test(item) && item.toLocaleLowerCase('ru').includes(stop.name.split('/')[0].trim().toLocaleLowerCase('ru'))
    );
  }

  function parseTimeToMinutes(timeStr) {
    if (!timeStr || timeStr === '—' || timeStr === '-') return 0;
    let minutes = 0;
    const hourMatch = timeStr.match(/(\d+)\s*(?:h|ч)/i);
    const minMatch = timeStr.match(/(\d+)\s*(?:m|мин)/i);
    if (hourMatch) minutes += Number(hourMatch[1]) * 60;
    if (minMatch) minutes += Number(minMatch[1]);
    return minutes;
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
    let totalMinutes = 0;
    
    // Build segments array: alternating between drive and stop durations
    for (let i = 0; i < day.stops.length; i++) {
      const stop = day.stops[i];
      const nextStop = day.stops[i + 1];
      
      // Add drive time (except for first stop)
      if (i > 0 && stop.drive && stop.drive !== '—' && stop.drive !== '-') {
        const driveMinutes = parseTimeToMinutes(stop.drive);
        if (driveMinutes > 0) {
          const prevStop = day.stops[i - 1];
          const description = `${prevStop.name} → ${stop.name}`;
          segments.push({ 
            type: 'drive', 
            minutes: driveMinutes, 
            fullLabel: stop.drive, 
            shortLabel: abbreviateTime(stop.drive),
            description: description,
            stopOrder: stop.order
          });
          totalMinutes += driveMinutes;
        }
      }
      
      // Add stop duration
      if (stop.duration && stop.duration !== '—' && stop.duration !== '-' && stop.duration !== 'Вылет') {
        const stopMinutes = parseTimeToMinutes(stop.duration);
        if (stopMinutes > 0) {
          // Extract key activity from role (first part before comma)
          const activity = stop.role.split(',')[0].trim();
          const description = `${stop.name}: ${activity}`;
          segments.push({ 
            type: 'stop', 
            minutes: stopMinutes, 
            fullLabel: stop.duration, 
            shortLabel: abbreviateTime(stop.duration),
            description: description,
            stopOrder: stop.order
          });
          totalMinutes += stopMinutes;
        }
      }
    }
    
    if (segments.length === 0 || totalMinutes === 0) return '';
    
    // Render timeline segments
    const segmentHtml = segments.map((seg, idx) => {
      const percentage = (seg.minutes / totalMinutes * 100).toFixed(1);
      const fullTooltip = `${seg.description} (${escapeHtml(seg.fullLabel)})`;
      const dayIndex = data.days.findIndex(d => d === day);
      const segmentId = `day-${dayIndex}-seg-${idx}`;
      return `<div class="timeline-segment timeline-${seg.type}" data-segment-id="${segmentId}" data-stop-order="${seg.stopOrder}" data-segment-type="${seg.type}" data-expanded="false" style="flex:${seg.minutes} 0 0" aria-label="${seg.type === 'drive' ? 'Вождение' : 'Остановка'}: ${fullTooltip}"><span class="timeline-time">${escapeHtml(seg.shortLabel)}</span><span class="timeline-fulltime">${escapeHtml(seg.fullLabel)}</span><span class="timeline-desc">${escapeHtml(seg.description)}</span></div>`;
    }).join('');
    
    return `<div class="timeline-container" data-timeline="day-${data.days.findIndex(d => d === day)}" aria-label="Визуальный обзор дня: вождение и остановки">${segmentHtml}</div>`;
  }

  function renderDay(day) {
    const meta = day.meta.map((item,index) => `<div class="meta-item ${index < 3 ? 'primary' : 'secondary'}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join('');
    const rows = day.stops.map(stop => {
      const flexible = isFlexibleStop(day, stop);
      return `<tr class="route-row${flexible?' is-flexible':''}" tabindex="0" data-day-id="${day.id}" data-stop-order="${stop.order}" aria-label="Показать ${escapeHtml(stop.name)} на карте">
        <td class="stop-order">${stop.order}</td><td class="stop-name"><strong>${escapeHtml(stop.name)}</strong>${flexible?'<span class="flexible-label">Гибко</span>':''}<span class="role">${escapeHtml(stop.role)}</span></td>
        <td data-label="Расстояние">${escapeHtml(stop.distance)}</td><td data-label="В пути">${escapeHtml(stop.drive)}</td><td data-label="Время">${escapeHtml(stop.time)}</td></tr>`;
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
          ${renderTimeline(day)}
          <table class="route-table"><thead><tr><th>№</th><th>Точка</th><th>Км</th><th>В пути</th><th>Время</th></tr></thead><tbody>${rows}</tbody></table>
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

  function setupTimelineListeners() {
    document.querySelectorAll('.timeline-container').forEach(container => {
      container.addEventListener('mouseleave', () => {
        container.querySelectorAll('.timeline-segment').forEach(seg => seg.dataset.expanded = 'false');
      });
    });
  }

  function render() {
    projectTitle.textContent = 'Крит · 11–15 августа';
    renderTabs();
    app.innerHTML = renderOverview() + data.days.map(renderDay).join('');
    setupTimelineListeners();
  }

  function markerKey(dayId, order) { return `${dayId}:${order}`; }

  function fitDayRoute(dayId) {
    const day = data.days.find(item => item.id === dayId);
    const map = maps.get(dayId);
    if (!day || !map) return;
    const bounds = L.latLngBounds(day.routeStopOrders.map(order => {
      const stop = day.stops.find(item => item.order === order);
      return [stop.lat,stop.lon];
    }));
    map.invalidateSize({ pan:false });
    if (bounds.isValid()) map.fitBounds(bounds,{ padding:[30,30],animate:false });
  }

  function renderStopDetail(dayId,order) {
    const day = data.days.find(item => item.id === dayId);
    const stop = day?.stops.find(item => item.order === Number(order));
    const detail = document.querySelector(`#${dayId} .stop-detail`);
    if (!stop || !detail) return;
    const navigationUrl = buildStopNavigationUrl(stop);
    detail.innerHTML = `<button class="stop-detail-close" type="button" aria-label="Закрыть информацию об остановке">×</button>
      <a class="stop-maps-link" href="${navigationUrl}" target="_blank" rel="noopener" aria-label="Открыть ${escapeHtml(stop.name)} в Google Maps">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>
      </a>
      <div class="stop-detail-kicker">Остановка ${escapeHtml(stop.order)}</div>
      <h2>${escapeHtml(stop.name)}</h2>
      <p class="stop-detail-role">${escapeHtml(stop.role)}</p>
      <dl class="stop-detail-facts">
        <div><dt>Время</dt><dd>${escapeHtml(stop.time)}</dd></div>
        <div><dt>Остановка</dt><dd>${escapeHtml(stop.duration)}</dd></div>
        <div><dt>От предыдущей</dt><dd>${escapeHtml(stop.drive)}, ${escapeHtml(stop.distance)}</dd></div>
      </dl>
      <p class="stop-detail-note"><strong>Примечание:</strong> ${escapeHtml(stop.note)}</p>`;
    detail.hidden = false;
    detail.closest('.map-wrap').classList.add('has-stop-detail');
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
    panel.querySelectorAll('.route-row').forEach(row => row.classList.remove('is-active'));
    markerIndex.forEach(({ element },key) => {
      if (key.startsWith(`${dayId}:`) && element) element.classList.remove('is-active');
    });
    delete panel.dataset.focusStop;
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
    const order = Number(row.dataset.stopOrder);
    if (!mobileViewport.matches) { selectStop(dayId,order,true); return; }
    document.getElementById(dayId).dataset.focusStop = String(order);
    selectStop(dayId,order);
    setMobileView(dayId, 'map');
    setTimeout(() => {
      selectStop(dayId,order,true);
      document.querySelector(`#${dayId} .stop-detail`)?.focus({ preventScroll:true });
    },100);
  }

  function setActiveStop(dayId,order,focusMap = false) {
    document.querySelectorAll(`.route-row[data-day-id="${dayId}"]`).forEach(row => {
      row.classList.toggle('is-active', Number(row.dataset.stopOrder) === Number(order));
    });
    const record = markerIndex.get(markerKey(dayId, order));
    if (!record) return;
    markerIndex.forEach(({ element }, key) => {
      if (key.startsWith(`${dayId}:`) && element) element.classList.remove('is-active');
    });
    if (record.element) record.element.classList.add('is-active');
    if (focusMap) {
      record.map.setView(record.marker.getLatLng(), Math.max(record.map.getZoom(), 13), { animate:true });
    }
  }

  function selectStop(dayId,order,focusMap = false) {
    setActiveStop(dayId,order,focusMap);
    renderStopDetail(dayId,order);
  }

  function setRouteFailure(dayId,failed) {
    const status = document.querySelector(`#${dayId} .route-status`);
    if (status) status.hidden = !failed;
  }

  function initializeRoute(dayId) {
    const day = data.days.find(item => item.id === dayId);
    const map = maps.get(dayId);
    if (!day || !map) return;

    const previous = routingIndex.get(dayId);
    routingIndex.delete(dayId);
    if (previous?.control) map.removeControl(previous.control);
    if (previous?.fallback) map.removeLayer(previous.fallback);
    setRouteFailure(dayId,false);

    const routeStops = day.routeStopOrders.map(order => day.stops.find(stop => stop.order === order));
    const bounds = day.stops.filter(stop => stop.mapVisible).map(stop => [stop.lat,stop.lon]);
    const routing = L.Routing.control({
      waypoints: routeStops.map(stop => L.latLng(stop.lat,stop.lon)),
      router:L.Routing.osrmv1({ serviceUrl:'https://router.project-osrm.org/route/v1' }),
      addWaypoints:false, draggableWaypoints:false, routeWhileDragging:false,
      showAlternatives:false, fitSelectedRoutes:true, createMarker:() => null,
      lineOptions:{ styles:[{ color:'#fffdf8',opacity:.9,weight:7 },{ color:'#078b9d',opacity:.92,weight:4 }] }
    }).addTo(map);
    routingIndex.set(dayId,{ control:routing,fallback:null });
    routing.on('routesfound', () => {
      if (routingIndex.get(dayId)?.control !== routing) return;
      setRouteFailure(dayId,false);
      const panel = document.getElementById(dayId);
      if (panel?.classList.contains('mobile-map-view') && !panel.dataset.focusStop) fitDayRoute(dayId);
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
    const day = data.days.find(item => item.id === dayId);
    if (!day) return;
    if (maps.has(dayId)) { setTimeout(() => maps.get(dayId).invalidateSize(), 70); return; }

    const map = L.map(`map-${dayId}`, { zoomControl:true });
    maps.set(dayId, map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap contributors' }).addTo(map);

    const visibleStops = day.stops.filter(stop => stop.mapVisible);
    const bounds = [];
    visibleStops.forEach(stop => {
      const icon = L.divIcon({ className:'', html:`<div class="numbered-marker" data-marker-order="${stop.order}">${stop.order}</div>`, iconSize:[36,36], iconAnchor:[18,18] });
      const marker = L.marker([stop.lat,stop.lon], { icon });
      marker.on('click', () => selectStop(dayId,stop.order));
      marker.on('add', () => {
        const element = marker.getElement()?.querySelector('.numbered-marker');
        markerIndex.set(markerKey(dayId,stop.order), { marker,map,element });
      });
      marker.addTo(map);
      bounds.push([stop.lat,stop.lon]);
    });

    initializeRoute(dayId);
    setTimeout(() => map.invalidateSize(), 150);
  }

  function activatePanel(panelId, updateHash = true) {
    if (activePanel !== panelId && activePanel !== 'overview') closeStopDetail(activePanel,false,false);
    activePanel = panelId;
    document.querySelectorAll('.panel').forEach(panel => panel.classList.toggle('active',panel.id===panelId));
    document.querySelectorAll('.tab-button').forEach(button => {
      const isActive = button.dataset.target === panelId;
      button.classList.toggle('active',isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });
    initializeMap(panelId);
    if (mobileViewport.matches && panelId !== 'overview') {
      delete document.getElementById(panelId).dataset.focusStop;
      setMobileView(panelId, 'plan', false);
    }
    if (updateHash) history.replaceState(null,'',`#${panelId}`);
    window.scrollTo({ top:0, behavior:'instant' });
    const activeButton = document.querySelector(`.tab-button[data-target="${panelId}"]`);
    if (activeButton) tabs.scrollLeft = activeButton.offsetLeft - (tabs.clientWidth - activeButton.offsetWidth) / 2;
  }

  function bindEvents() {
    tabs.addEventListener('click', event => {
      const button = event.target.closest('.tab-button');
      if (button) activatePanel(button.dataset.target);
    });
    tabs.addEventListener('keydown', event => {
      if (!event.target.matches('.tab-button')) return;
      const buttons = [...tabs.querySelectorAll('.tab-button')];
      const current = buttons.indexOf(event.target);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : event.key === 'ArrowRight' ? (current + 1) % buttons.length : event.key === 'ArrowLeft' ? (current - 1 + buttons.length) % buttons.length : -1;
      if (next >= 0) { event.preventDefault(); buttons[next].focus(); activatePanel(buttons[next].dataset.target); }
    });
    app.addEventListener('click', event => {
      const retryButton = event.target.closest('.route-retry');
      if (retryButton) { initializeRoute(retryButton.closest('.day-panel').id); return; }
      const closeButton = event.target.closest('.stop-detail-close');
      if (closeButton) { closeStopDetail(closeButton.closest('.day-panel').id); return; }
      const viewButton = event.target.closest('.mobile-view-button');
      if (viewButton) {
        const panel = viewButton.closest('.day-panel');
        delete panel.dataset.focusStop;
        setMobileView(panel.id, viewButton.dataset.view);
        return;
      }
      const timelineSegment = event.target.closest('.timeline-segment');
      if (timelineSegment) {
        const container = timelineSegment.closest('.timeline-container');
        if (container) {
          const allSegments = container.querySelectorAll('.timeline-segment');
          const isExpanded = timelineSegment.dataset.expanded === 'true';
          // Collapse all segments
          allSegments.forEach(seg => seg.dataset.expanded = 'false');
          // Toggle the clicked segment (if it wasn't expanded, expand it; if it was, leave it collapsed)
          if (!isExpanded) timelineSegment.dataset.expanded = 'true';
        }
        return;
      }
      const row = event.target.closest('.route-row');
      if (row) activateStopRow(row);
    });
    app.addEventListener('mouseover', event => {
      const timelineSegment = event.target.closest('.timeline-segment');
      if (!timelineSegment) return;
      const container = timelineSegment.closest('.timeline-container');
      if (!container) return;
      const dayPanel = container.closest('.panel');
      if (!dayPanel) return;
      const stopOrder = timelineSegment.dataset.stopOrder;
      const segmentType = timelineSegment.dataset.segmentType;
      if (!stopOrder) return;
      const row = dayPanel.querySelector(`.route-row[data-stop-order="${stopOrder}"]`);
      if (row) {
        row.classList.add(segmentType === 'stop' ? 'highlight-time' : 'highlight-drive');
      }
    });
    app.addEventListener('mouseout', event => {
      const timelineSegment = event.target.closest('.timeline-segment');
      if (!timelineSegment) return;
      const container = timelineSegment.closest('.timeline-container');
      if (!container) return;
      const dayPanel = container.closest('.panel');
      if (!dayPanel) return;
      dayPanel.querySelectorAll('.route-row').forEach(row => {
        row.classList.remove('highlight-time', 'highlight-drive');
      });
    });
    app.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        const detail = event.target.closest('.stop-detail');
        if (detail) { closeStopDetail(detail.closest('.day-panel').id); return; }
      }
      const row = event.target.closest('.route-row');
      if (row && (event.key==='Enter' || event.key===' ')) { event.preventDefault(); activateStopRow(row); }
    });
    app.addEventListener('pointerover', event => {
      const row = event.target.closest('.route-row');
      if (row) setActiveStop(row.dataset.dayId, Number(row.dataset.stopOrder));
    });
    window.addEventListener('beforeprint', () => { data.days.forEach(day => initializeMap(day.id)); setTimeout(() => [...maps.values()].forEach(map => map.invalidateSize()),300); });
  }

  function openingDate() {
    const preview = new URLSearchParams(location.search).get('date');
    const match = preview?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return new Date();
    const [,year,month,day] = match.map(Number);
    const date = new Date(year,month - 1,day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : new Date();
  }

  function panelForDate(date) {
    if (date.getFullYear() !== 2026 || date.getMonth() !== 7) return 'overview';
    const panelId = `day${date.getDate()}`;
    return data.days.some(day => day.id === panelId) ? panelId : 'overview';
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
  const hash = location.hash.slice(1);
  const hashPanel = hash && (hash === 'overview' || data.days.some(day => day.id === hash)) ? hash : null;
  activatePanel(hashPanel || panelForDate(openingDate()), false);
  registerServiceWorker();
})();
