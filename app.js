(() => {
  'use strict';

  const data = window.CRETE_ITINERARY;
  if (!data) throw new Error('CRETE_ITINERARY is not loaded');

  const app = document.getElementById('app');
  const tabs = document.getElementById('tabs');
  const projectTitle = document.getElementById('project-title');
  const maps = new Map();
  const markerIndex = new Map();
  let activePanel = 'overview';

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

  function renderTabs() {
    const items = [
      { id:'overview', label:'Overview', subtitle:'11–15 Aug' },
      ...data.days.map(day => ({ id:day.id, label:day.short, subtitle:day.title }))
    ];
    tabs.innerHTML = items.map((item,index) => `
      <button class="tab-button${index===0?' active':''}" data-target="${item.id}" type="button">
        <span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.subtitle)}</small>
      </button>`).join('');
  }

  function renderOverview() {
    const overview = data.overview;
    return `<section id="overview" class="panel active">
      <div class="overview-shell">
        <div class="overview-hero">
          <div class="eyebrow">${escapeHtml(data.project.part)}</div>
          <h1>${escapeHtml(data.project.heading)}</h1>
          <p class="lead">${escapeHtml(data.project.lead)}</p>
        </div>
        <div class="overview-grid">
          <article class="overview-card">
            <h2>Логистика</h2>
            <table class="overview-table">${overview.logistics.map(row => `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`).join('')}</table>
          </article>
          <article class="overview-card">
            <h2>Бронирования и ожидания</h2>
            <div class="booking-list">${overview.bookings.map(item => `<div class="booking-card ${item.status}"><div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.when)}</span></div><p>${escapeHtml(item.note)}</p></div>`).join('')}</div>
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

  function renderDay(day) {
    const meta = day.meta.map(item => `<div class="meta-item"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join('');
    const rows = day.stops.map(stop => `<tr class="route-row" tabindex="0" data-day-id="${day.id}" data-stop-order="${stop.order}">
      <td>${stop.order}</td><td><strong>${escapeHtml(stop.name)}</strong><span class="role">${escapeHtml(stop.role)}</span></td>
      <td>${escapeHtml(stop.time)}</td><td>${escapeHtml(stop.drive)}</td><td>${escapeHtml(stop.distance)}</td></tr>`).join('');
    const sections = ['essentials','food','practical'].map(key => {
      const section = day.sections[key];
      return `<section class="info-card ${key}"><h3>${escapeHtml(section.title)}</h3><ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`;
    }).join('');
    const mapsUrl = buildGoogleMapsUrl(day);
    return `<section id="${day.id}" class="panel day-panel">
      <div class="day-shell">
        <aside class="itinerary">
          <header class="day-header"><div class="eyebrow">${escapeHtml(day.date)}</div><h1>${escapeHtml(day.title)}</h1></header>
          <div class="meta-grid">${meta}</div>
          <h2>Расписание и плечи маршрута</h2>
          <table class="route-table"><thead><tr><th>№</th><th>Точка</th><th>Время</th><th>Ехать</th><th>Км</th></tr></thead><tbody>${rows}</tbody></table>
          <div class="info-grid">${sections}</div>
        </aside>
        <div class="map-wrap">
          <div id="map-${day.id}" class="map"></div>
          <a class="map-overlay-link" href="${mapsUrl}" target="_blank" rel="noopener" aria-label="Открыть маршрут в Google Maps">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>
            <span>Открыть в Google Maps</span>
          </a>
          <div class="map-caption">Карта интерактивна. Нажмите на строку остановки, чтобы открыть точку.</div>
        </div>
      </div>
    </section>`;
  }

  function render() {
    projectTitle.textContent = data.project.title;
    renderTabs();
    app.innerHTML = renderOverview() + data.days.map(renderDay).join('');
  }

  function markerKey(dayId, order) { return `${dayId}:${order}`; }

  function setActiveStop(dayId, order, openPopup = false) {
    document.querySelectorAll(`.route-row[data-day-id="${dayId}"]`).forEach(row => {
      row.classList.toggle('is-active', Number(row.dataset.stopOrder) === Number(order));
    });
    const record = markerIndex.get(markerKey(dayId, order));
    if (!record) return;
    markerIndex.forEach(({ element }, key) => {
      if (key.startsWith(`${dayId}:`) && element) element.classList.remove('is-active');
    });
    if (record.element) record.element.classList.add('is-active');
    if (openPopup) {
      record.map.setView(record.marker.getLatLng(), Math.max(record.map.getZoom(), 13), { animate:true });
      record.marker.openPopup();
    }
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
      marker.bindPopup(`<b>${escapeHtml(stop.order)}. ${escapeHtml(stop.name)}</b><br><b>Время:</b> ${escapeHtml(stop.time)}<br><b>Остановка:</b> ${escapeHtml(stop.duration)}<br><b>От предыдущей:</b> ${escapeHtml(stop.drive)}, ${escapeHtml(stop.distance)}<br><b>Роль:</b> ${escapeHtml(stop.role)}<br><b>Примечание:</b> ${escapeHtml(stop.note)}`);
      marker.on('click', () => setActiveStop(dayId, stop.order));
      marker.on('add', () => {
        const element = marker.getElement()?.querySelector('.numbered-marker');
        markerIndex.set(markerKey(dayId,stop.order), { marker,map,element });
      });
      marker.addTo(map);
      bounds.push([stop.lat,stop.lon]);
    });

    const routeStops = day.routeStopOrders.map(order => day.stops.find(stop => stop.order === order));
    const routing = L.Routing.control({
      waypoints: routeStops.map(stop => L.latLng(stop.lat,stop.lon)),
      router:L.Routing.osrmv1({ serviceUrl:'https://router.project-osrm.org/route/v1' }),
      addWaypoints:false, draggableWaypoints:false, routeWhileDragging:false,
      showAlternatives:false, fitSelectedRoutes:true, createMarker:() => null
    }).addTo(map);
    routing.on('routingerror', () => {
      if (bounds.length > 1) { L.polyline(bounds,{dashArray:'8,8',weight:3}).addTo(map); map.fitBounds(bounds,{padding:[30,30]}); }
    });
    setTimeout(() => map.invalidateSize(), 150);
  }

  function activatePanel(panelId, updateHash = true) {
    activePanel = panelId;
    document.querySelectorAll('.panel').forEach(panel => panel.classList.toggle('active',panel.id===panelId));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.toggle('active',button.dataset.target===panelId));
    initializeMap(panelId);
    if (updateHash) history.replaceState(null,'',`#${panelId}`);
    window.scrollTo({ top:0, behavior:'instant' });
  }

  function bindEvents() {
    tabs.addEventListener('click', event => {
      const button = event.target.closest('.tab-button');
      if (button) activatePanel(button.dataset.target);
    });
    app.addEventListener('click', event => {
      const row = event.target.closest('.route-row');
      if (row) setActiveStop(row.dataset.dayId, Number(row.dataset.stopOrder), true);
    });
    app.addEventListener('keydown', event => {
      const row = event.target.closest('.route-row');
      if (row && (event.key==='Enter' || event.key===' ')) { event.preventDefault(); setActiveStop(row.dataset.dayId, Number(row.dataset.stopOrder), true); }
    });
    app.addEventListener('pointerover', event => {
      const row = event.target.closest('.route-row');
      if (row) setActiveStop(row.dataset.dayId, Number(row.dataset.stopOrder));
    });
    window.addEventListener('beforeprint', () => { data.days.forEach(day => initializeMap(day.id)); setTimeout(() => [...maps.values()].forEach(map => map.invalidateSize()),300); });
  }

  render();
  bindEvents();
  const hash = location.hash.slice(1);
  activatePanel(hash && (hash==='overview' || data.days.some(day => day.id===hash)) ? hash : 'overview', false);
})();
