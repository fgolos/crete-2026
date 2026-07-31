import fs from 'node:fs';
import vm from 'node:vm';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function write(path, content) {
  fs.writeFileSync(path, content);
}

function replaceExact(content, before, after, label) {
  if (!content.includes(before)) throw new Error(`Missing exact block: ${label}`);
  return content.replace(before, after);
}

function replaceRegex(content, pattern, replacement, label) {
  if (!pattern.test(content)) throw new Error(`Missing regex block: ${label}`);
  return content.replace(pattern, replacement);
}

// itinerary-data.js
{
  const source = read('itinerary-data.js');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'itinerary-data.js' });
  const itinerary = sandbox.window.CRETE_ITINERARY;
  if (!itinerary) throw new Error('CRETE_ITINERARY was not loaded');

  itinerary.project.title = 'Crete 2026 — Full Trip MASTER | 11–22 August';
  itinerary.project.part = 'FULL TRIP';
  itinerary.project.heading = 'Crete 2026';
  itinerary.project.dateRange = '11–22 августа 2026';
  itinerary.project.overviewEyebrow = 'Крит · семейный маршрут';
  itinerary.project.lead = '11–22 августа · базы Sitia и Platanes · спокойный семейный маршрут с пляжами, деревнями, локальной едой и реалистичным вождением.';

  const east = itinerary.parts.find(part => part.id === 'east');
  const west = itinerary.parts.find(part => part.id === 'west');
  if (!east || !west) throw new Error('Both east and west parts are required');
  east.kicker = 'PART 1';
  east.description = 'Готовая восточная часть маршрута с базой в Sitia.';
  west.kicker = 'PART 2';
  west.description = 'Переезд 15 августа уже готов; дни 16–22 будут добавляться после согласования.';

  write('itinerary-data.js', `window.CRETE_ITINERARY = ${JSON.stringify(itinerary, null, 2)};\n`);
}

// index.html
{
  let html = read('index.html');
  html = replaceExact(
    html,
    '<meta name="description" content="Crete 2026 — East Crete master itinerary, 11–15 August">',
    '<meta name="description" content="Crete 2026 — interactive family itinerary, 11–22 August">',
    'document description'
  );
  html = replaceExact(
    html,
    '  <header class="topbar">\n    <div id="project-title" class="project-title"></div>\n    <nav id="tabs" class="tabs" aria-label="Дни маршрута"></nav>\n  </header>',
    '  <header class="topbar">\n    <div id="project-title" class="project-title"></div>\n    <nav id="part-tabs" class="part-tabs" aria-label="Части поездки"></nav>\n    <nav id="tabs" class="tabs" aria-label="Дни выбранной части"></nav>\n  </header>',
    'topbar navigation shell'
  );
  write('index.html', html);
}

// manifest.webmanifest
{
  const manifest = JSON.parse(read('manifest.webmanifest'));
  manifest.description = 'Interactive family itinerary for Crete, 11-22 August 2026.';
  write('manifest.webmanifest', `${JSON.stringify(manifest, null, 2)}\n`);
}

// app.js
{
  let app = read('app.js');

  app = replaceExact(
    app,
    "  const tabs = document.getElementById('tabs');\n  const projectTitle = document.getElementById('project-title');",
    "  const partTabs = document.getElementById('part-tabs');\n  const tabs = document.getElementById('tabs');\n  const projectTitle = document.getElementById('project-title');",
    'part tabs element'
  );

  app = replaceExact(
    app,
    "  let activePanel = 'overview';\n  let isOffline = !navigator.onLine;",
    "  let activePanel = 'overview';\n  let activePartId = 'overview';\n  let isOffline = !navigator.onLine;",
    'active part state'
  );

  const navigationFunctions = `  function dayNumber(dayId) {
    return Number(String(dayId).replace(/^day/, ''));
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

  function partProgress(part) {
    const ready = part.dayIds.filter(dayId => Boolean(getDay(dayId))).length;
    return { ready, total: part.dayIds.length, complete: ready === part.dayIds.length };
  }

  function renderPartTabs() {
    const items = [
      { id:'overview', target:'overview', label:'Обзор', subtitle:data.project.dateRange },
      ...(data.parts || []).map(part => ({
        id:part.id,
        target:\`part-\${part.id}\`,
        label:part.title,
        subtitle:\`\${part.dates} · \${part.base}\`
      }))
    ];

    partTabs.innerHTML = items.map((item, index) => \`
      <button id="part-tab-\${item.id}" class="part-button\${index === 0 ? ' active' : ''}" data-part-id="\${item.id}" data-target="\${item.target}" type="button" role="tab" aria-controls="\${item.target}" aria-selected="\${index === 0 ? 'true' : 'false'}" tabindex="\${index === 0 ? '0' : '-1'}">
        <span>\${escapeHtml(item.label)}</span><small>\${escapeHtml(item.subtitle)}</small>
      </button>\`).join('');
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
      return \`<button id="tab-\${dayId}" class="tab-button\${active ? ' active' : ''}\${disabled ? ' is-planned' : ''}" data-target="\${dayId}" type="button" role="tab" aria-controls="\${dayId}" aria-selected="\${active ? 'true' : 'false'}" tabindex="\${active ? '0' : '-1'}" \${disabled ? 'disabled aria-disabled="true"' : ''}>
        <span>\${number} авг</span><small>\${escapeHtml(day?.title || 'Планируется')}</small>
      </button>\`;
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

`;

  app = replaceRegex(
    app,
    /  function renderTabs\(\) \{[\s\S]*?\n  \}\n\n  function bookingStatus/,
    `${navigationFunctions}  function bookingStatus`,
    'old tab renderer'
  );

  const overviewFunctions = `  function renderPartCards() {
    return \`<div class="trip-parts-grid">\${data.parts.map(part => {
      const progress = partProgress(part);
      const status = progress.complete ? 'Маршрут готов' : \`Готово дней: \${progress.ready} из \${progress.total}\`;
      return \`<button class="part-card" type="button" data-part-id="\${part.id}" aria-label="Открыть \${escapeHtml(part.title)}">
        <span class="part-card-kicker">\${escapeHtml(part.kicker || '')}</span>
        <strong>\${escapeHtml(part.title)}</strong>
        <span>\${escapeHtml(part.dates)} · база \${escapeHtml(part.base)}</span>
        <small>\${escapeHtml(status)}</small>
      </button>\`;
    }).join('')}</div>\`;
  }

  function renderOverview() {
    const overview = data.overview;
    return \`<section id="overview" class="panel active" role="tabpanel" aria-labelledby="part-tab-overview">
      <div class="overview-shell">
        <div class="overview-hero">
          <div class="overview-hero-content">
            <div class="eyebrow">\${escapeHtml(data.project.overviewEyebrow || 'Крит')}</div>
            <h1>\${escapeHtml(data.project.heading)}</h1>
            <p class="lead">\${escapeHtml(data.project.lead)}</p>
          </div>
          <div class="photo-credit">Фото: <a href="https://commons.wikimedia.org/wiki/File:Vai_R01.jpg" target="_blank" rel="noopener">Marc Ryckaert</a> · <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a></div>
        </div>
        \${renderPartCards()}
        <div class="overview-grid">
          <article class="overview-card">
            <h2>Логистика</h2>
            <table class="overview-table">\${overview.logistics.map(row => \`<tr><th>\${escapeHtml(row.label)}</th><td>\${escapeHtml(row.value)}</td></tr>\`).join('')}</table>
          </article>
          <article class="overview-card">
            <h2>Бронирования и ожидания</h2>
            <div class="booking-list">\${overview.bookings.map(item => {
              const status = bookingStatus(item);
              return \`<div class="booking-card \${status.key}"><div class="booking-heading"><strong>\${escapeHtml(item.name)}</strong><span class="status-label">\${status.label}</span></div><time>\${escapeHtml(item.when)}</time><p>\${escapeHtml(bookingSummary(item.note))}</p></div>\`;
            }).join('')}</div>
          </article>
        </div>
        <article class="overview-card">
          <h2>Готовые дни маршрута</h2>
          <table class="days-summary"><tbody>\${data.days.map(day => {
            const metaValues = day.meta.slice(0, 4).map(item => \`<td>\${escapeHtml(item.value)}</td>\`).join('');
            const partId = defaultPartForDay(day.id);
            return \`<tr class="summary-day" data-day-id="\${day.id}" data-part-id="\${partId}" tabindex="0" role="button" aria-label="Перейти к \${escapeHtml(day.title)}"><td class="summary-day-label"><strong>\${escapeHtml(day.short)}</strong><span>\${escapeHtml(day.title)}</span></td>\${metaValues}</tr>\`;
          }).join('')}</tbody></table>
        </article>
        <article class="overview-card">
          <h2>Правила маршрута</h2>
          <ul class="rules-list">\${overview.rules.map(rule => \`<li>\${escapeHtml(rule)}</li>\`).join('')}</ul>
        </article>
        <div class="privacy-note">\${escapeHtml(overview.privacyNote)}</div>
      </div>
    </section>\`;
  }

  function renderPartOverview(part) {
    const progress = partProgress(part);
    const status = progress.complete
      ? 'Все дни этой части готовы.'
      : \`Готово дней: \${progress.ready} из \${progress.total}. Остальные дни пока планируются.\`;

    const dayItems = part.dayIds.map(dayId => {
      const day = getDay(dayId);
      const number = dayNumber(dayId);
      if (!day) {
        return \`<div class="part-day-item is-planned" aria-disabled="true">
          <span class="part-day-date">\${number} августа</span>
          <strong>Планируется</strong>
          <small>Маршрут дня ещё не согласован.</small>
        </div>\`;
      }
      return \`<button class="part-day-item" type="button" data-day-id="\${day.id}" data-part-id="\${part.id}">
        <span class="part-day-date">\${escapeHtml(day.date)}</span>
        <strong>\${escapeHtml(day.title)}</strong>
        <small>\${escapeHtml(day.meta.slice(0, 4).map(item => item.value).join(' · '))}</small>
      </button>\`;
    }).join('');

    return \`<section id="part-\${part.id}" class="panel part-panel" role="tabpanel" aria-labelledby="part-tab-\${part.id}">
      <div class="part-overview-shell">
        <header class="part-overview-hero part-overview-\${part.id}">
          <div class="part-card-kicker">\${escapeHtml(part.kicker || '')}</div>
          <h1>\${escapeHtml(part.title)}</h1>
          <p>\${escapeHtml(part.dates)} · база \${escapeHtml(part.base)}</p>
          <span class="part-progress">\${escapeHtml(status)}</span>
        </header>
        <article class="overview-card part-description">
          <p>\${escapeHtml(part.description || '')}</p>
        </article>
        <div class="part-day-list">\${dayItems}</div>
      </div>
    </section>\`;
  }

`;

  app = replaceRegex(
    app,
    /  function renderOverview\(\) \{[\s\S]*?\n  \}\n\n  function isFlexibleStop/,
    `${overviewFunctions}  function isFlexibleStop`,
    'overview renderer'
  );

  app = replaceRegex(
    app,
    /  function render\(\) \{[\s\S]*?\n  \}\n\n  function markerKey/,
    `  function render() {
    validateParkingReferences();
    projectTitle.textContent = 'Крит · 11–22 августа';
    renderPartTabs();
    app.innerHTML = renderOverview() + data.parts.map(renderPartOverview).join('') + data.days.map(renderDay).join('');
    setActivePart('overview');
    setupTimelineListeners();
    adjustTimelineSegmentDisplay();
  }

  function markerKey`,
    'main renderer'
  );

  const activationFunctions = `  function hashForNavigation(panelId, partId) {
    if (panelId === 'overview') return '#overview';
    if (panelId === \`part-\${partId}\`) return \`#\${partId}\`;
    return \`#\${partId}/\${panelId}\`;
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
        delete document.getElementById(panelId).dataset.focusStop;
        setMobileView(panelId, 'plan', false);
      }
    }

    if (updateHash) history.replaceState(null, '', hashForNavigation(panelId, partId));
    window.scrollTo({ top:0, behavior:'instant' });

    const activeButton = tabs.querySelector(\`.tab-button[data-target="\${panelId}"]\`);
    if (activeButton) tabs.scrollLeft = activeButton.offsetLeft - (tabs.clientWidth - activeButton.offsetWidth) / 2;
  }

`;

  app = replaceRegex(
    app,
    /  function activatePanel\(panelId, updateHash = true\) \{[\s\S]*?\n  \}\n\n  function bindEvents/,
    `${activationFunctions}  function bindEvents`,
    'panel activation'
  );

  app = replaceExact(
    app,
    `  function bindEvents() {
    tabs.addEventListener('click', event => {`,
    `  function bindEvents() {
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
    tabs.addEventListener('click', event => {`,
    'part navigation events'
  );

  app = replaceExact(
    app,
    `      const summaryDay = event.target.closest('.summary-day');
      if (summaryDay) {
        const dayId = summaryDay.dataset.dayId;
        const dayTab = document.getElementById(\`tab-\${dayId}\`);
        if (dayTab) {
          dayTab.click();
          return;
        }
      }`,
    `      const partCard = event.target.closest('.part-card');
      if (partCard) {
        const partId = partCard.dataset.partId;
        activatePanel(\`part-\${partId}\`, true, partId);
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
      }`,
    'overview navigation events'
  );

  app = replaceRegex(
    app,
    /  function panelForDate\(date\) \{[\s\S]*?\n  \}\n\n  function registerServiceWorker/,
    `  function navigationForDate(date) {
    if (date.getFullYear() !== 2026 || date.getMonth() !== 7) {
      return { panelId:'overview', partId:'overview' };
    }
    const dayId = \`day\${date.getDate()}\`;
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
    if (!hash || hash === 'overview') return null;
    if (getPart(hash)) return { panelId:\`part-\${hash}\`, partId:hash };

    const scoped = hash.match(/^(east|west)\/(day\d+)$/);
    if (scoped) {
      const [, partId, dayId] = scoped;
      return getDay(dayId) && getPart(partId)?.dayIds.includes(dayId)
        ? { panelId:dayId, partId }
        : { panelId:\`part-\${partId}\`, partId };
    }

    if (getDay(hash)) return { panelId:hash, partId:defaultPartForDay(hash) };
    return null;
  }

  function registerServiceWorker`,
    'date and hash navigation'
  );

  app = replaceExact(
    app,
    `  render();
  bindEvents();
  const hash = location.hash.slice(1);
  const hashPanel = hash && (hash === 'overview' || data.days.some(day => day.id === hash)) ? hash : null;
  activatePanel(hashPanel || panelForDate(openingDate()), false);
  registerServiceWorker();`,
    `  render();
  bindEvents();
  const initialNavigation = navigationFromHash() || navigationForDate(openingDate());
  activatePanel(initialNavigation.panelId, false, initialNavigation.partId);
  registerServiceWorker();`,
    'initial navigation'
  );

  write('app.js', app);
}

// styles.css
{
  let css = read('styles.css');
  css = replaceExact(
    css,
    '.topbar { position:sticky; top:0; z-index:1000; display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:18px; background:rgba(255,253,248,.96); border-bottom:1px solid var(--line); padding:9px 18px; backdrop-filter:blur(12px); }',
    '.topbar { position:sticky; top:0; z-index:1000; display:grid; grid-template-columns:auto auto minmax(0,1fr); align-items:center; gap:12px; background:rgba(255,253,248,.96); border-bottom:1px solid var(--line); padding:8px 14px; backdrop-filter:blur(12px); }',
    'desktop topbar layout'
  );

  css = replaceExact(
    css,
    '.project-title { margin:0; font-size:15px; font-weight:700; white-space:nowrap; }\n.tabs { display:flex;',
    `.project-title { margin:0; font-size:15px; font-weight:700; white-space:nowrap; }
.part-tabs { display:flex; gap:5px; min-width:0; }
.part-button { flex:0 0 auto; min-width:112px; padding:6px 9px 7px; border:1px solid #c6d2cf; border-radius:7px; background:var(--paper); color:var(--ink); cursor:pointer; text-align:left; }
.part-button span { display:block; font-size:12px; font-weight:700; }
.part-button small { display:block; margin-top:1px; max-width:150px; overflow:hidden; color:var(--muted); font-size:9px; line-height:1.2; text-overflow:ellipsis; white-space:nowrap; }
.part-button.active { border-color:var(--accent-dark); background:var(--accent-dark); color:#fff; box-shadow:0 2px 8px rgba(8,101,116,.2); }
.part-button.active small { color:#d7efec; }
.tabs { display:flex;`,
    'part navigation styles'
  );

  css = replaceExact(
    css,
    '.tab-button.active small { color:#3f747a; }',
    `.tab-button.active small { color:#3f747a; }
.tab-button:disabled { cursor:default; opacity:.58; }
.tab-button.is-planned { border-style:dashed; background:#f3f4ef; }
.tabs[hidden] { display:none; }`,
    'planned day tabs'
  );

  css = replaceExact(
    css,
    '.overview-shell { padding:12px; }',
    `.overview-shell { padding:12px; }
.trip-parts-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px; }
.part-card { display:grid; grid-template-columns:1fr auto; gap:2px 12px; align-items:start; padding:11px 12px; border:1px solid var(--line); border-radius:7px; background:var(--paper); color:var(--ink); text-align:left; cursor:pointer; box-shadow:0 1px 5px rgba(24,62,67,.05); }
.part-card:hover,.part-card:focus-visible { border-color:#79bec4; background:var(--accent-soft); }
.part-card-kicker { grid-column:1; color:var(--accent); font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.part-card strong { grid-column:1; font-size:16px; }
.part-card > span:not(.part-card-kicker) { grid-column:1; color:var(--muted); font-size:11px; }
.part-card small { grid-column:2; grid-row:1/4; align-self:center; padding:4px 7px; border-radius:999px; background:var(--olive-soft); color:#566136; font-size:10px; font-weight:700; white-space:nowrap; }
.part-overview-shell { max-width:1000px; margin:0 auto; padding:16px; }
.part-overview-hero { padding:22px 24px; border-radius:9px; background:linear-gradient(135deg,#0a6f7d,#0e505c); color:#fff; box-shadow:var(--shadow); }
.part-overview-west { background:linear-gradient(135deg,#6f7b46,#3f6158); }
.part-overview-hero .part-card-kicker { color:#ccefed; }
.part-overview-hero h1 { margin-bottom:5px; }
.part-overview-hero p { margin:0; color:#e0f1ee; font-size:15px; }
.part-progress { display:inline-block; margin-top:12px; padding:5px 9px; border-radius:999px; background:rgba(255,255,255,.16); font-size:11px; font-weight:700; }
.part-description { margin-top:9px; }
.part-description p { margin:0; font-size:13px; line-height:1.45; }
.part-day-list { display:grid; gap:7px; margin-top:9px; }
.part-day-item { display:grid; grid-template-columns:150px minmax(0,1fr); gap:2px 12px; width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:7px; background:var(--paper); color:var(--ink); text-align:left; cursor:pointer; }
.part-day-item:hover,.part-day-item:focus-visible { border-color:#79bec4; background:var(--accent-soft); }
.part-day-item .part-day-date { grid-row:1/3; color:var(--accent-dark); font-size:11px; font-weight:700; }
.part-day-item strong { font-size:13px; }
.part-day-item small { color:var(--muted); font-size:10px; }
.part-day-item.is-planned { border-style:dashed; background:#f5f5f0; cursor:default; opacity:.72; }
.part-day-item.is-planned:hover { border-color:var(--line); background:#f5f5f0; }`,
    'part overview styles'
  );

  css = replaceExact(
    css,
    '  .topbar { position:sticky; display:block; padding:7px 8px 6px; }\n  .project-title { display:none; }\n  .tabs { gap:6px;',
    `  .topbar { position:sticky; display:block; padding:6px 6px 5px; }
  .project-title { display:none; }
  .part-tabs { gap:5px; overflow-x:auto; padding:1px 8px 5px; scrollbar-width:none; }
  .part-tabs::-webkit-scrollbar { display:none; }
  .part-button { min-width:104px; padding:5px 8px 6px; }
  .part-button span { font-size:11px; }
  .part-button small { max-width:126px; font-size:8px; }
  .tabs { gap:6px;`,
    'mobile navigation layout'
  );

  css = replaceExact(
    css,
    '  .overview-grid { grid-template-columns:1fr; }',
    `  .overview-grid { grid-template-columns:1fr; }
  .trip-parts-grid { grid-template-columns:1fr; }
  .part-card { grid-template-columns:1fr; }
  .part-card small { grid-column:1; grid-row:auto; justify-self:start; margin-top:4px; }
  .part-overview-shell { padding:10px 8px 18px; }
  .part-overview-hero { padding:17px 15px; }
  .part-overview-hero h1 { font-size:29px; }
  .part-day-item { grid-template-columns:1fr; gap:2px; }
  .part-day-item .part-day-date { grid-row:auto; }`,
    'mobile part overview'
  );

  css = replaceExact(css, '  .mobile-view-switch { position:sticky; top:62px;', '  .mobile-view-switch { position:sticky; top:108px;', 'mobile switch offset');
  css = replaceExact(css, '  .mobile-map-view .map-wrap { height:calc(100dvh - 117px);', '  .mobile-map-view .map-wrap { height:calc(100dvh - 163px);', 'mobile map height');

  write('styles.css', css);
}

// service-worker.js
{
  let sw = read('service-worker.js');
  sw = replaceExact(sw, "const CACHE_VERSION = 'crete-2026-v11';", "const CACHE_VERSION = 'crete-2026-v12';", 'cache version');
  write('service-worker.js', sw);
}

// README.md
{
  let readme = read('README.md');
  readme = replaceExact(
    readme,
    '- `app.js` — rendering, tabs, maps, route links, and list-to-marker interaction.',
    '- `app.js` — rendering, trip-part and day navigation, maps, route links, parking UI, and list-to-marker interaction.',
    'README app architecture'
  );
  readme = replaceExact(
    readme,
    'Without a day in the URL hash, the site opens the matching itinerary day from 11–15 August 2026 and opens Overview on other dates. Use `?date=2026-08-12` to preview a trip date without changing the system clock. An explicit hash still wins, for example `?date=2026-08-12#day14` opens 14 August.',
    'Without an explicit hash, the site opens the matching ready itinerary day during 11–22 August 2026. Dates whose days are not added yet open the relevant trip-part overview. Use `?date=2026-08-12` to preview a trip date without changing the system clock. Part-aware hashes use forms such as `#east/day14`, `#west/day15`, `#east`, and `#west`; legacy `#day14` links remain supported.',
    'README navigation description'
  );
  write('README.md', readme);
}

// Validation
for (const file of ['app.js', 'itinerary-data.js', 'stories-data.js', 'service-worker.js']) {
  const source = read(file);
  new vm.Script(source, { filename:file });
}

{
  const sandbox = { window: {} };
  vm.runInNewContext(read('itinerary-data.js'), sandbox);
  const itinerary = sandbox.window.CRETE_ITINERARY;
  if (itinerary.project.dateRange !== '11–22 августа 2026') throw new Error('Full trip date range missing');
  if (!itinerary.parts.find(part => part.id === 'east')?.dayIds.includes('day15')) throw new Error('day15 missing from east');
  if (!itinerary.parts.find(part => part.id === 'west')?.dayIds.includes('day15')) throw new Error('day15 missing from west');
}

const appSource = read('app.js');
for (const token of ['renderPartTabs', 'renderPartOverview', 'part-west', 'navigationFromHash', "#${partId}/${panelId}"]) {
  if (!appSource.includes(token)) throw new Error(`Missing app token: ${token}`);
}
if (!read('index.html').includes('id="part-tabs"')) throw new Error('Part tabs shell missing');
if (!read('styles.css').includes('.part-button.active')) throw new Error('Part tab styles missing');
if (!read('service-worker.js').includes('crete-2026-v12')) throw new Error('Cache version was not bumped');

fs.rmSync('scripts/apply-full-trip-navigation.mjs');
fs.rmSync('.github/workflows/apply-full-trip-navigation.yml');
