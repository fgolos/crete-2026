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
          <h2>Дни маршрута</h2>
          <table class="days-summary"><tbody>${data.days.map((day, index) => {
            const metaValues = day.meta.slice(0, 4).map(item => `<td>${escapeHtml(item.value)}</td>`).join('');
            return `<tr class="summary-day" data-day-id="${day.id}" tabindex="0" role="button" aria-label="Перейти к ${escapeHtml(day.title)}"><td class="summary-day-label"><strong>${escapeHtml(day.short)}</strong><span>${escapeHtml(day.title)}</span></td>${metaValues}</tr>`;
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

  function isFlexibleStop(day, stop) {
    return day.sections.essentials.items.some(item =>
      /^Гибкая остановка:/i.test(item) && item.toLocaleLowerCase('ru').includes(stop.name.split('/')[0].trim().toLocaleLowerCase('ru'))
    );
  }

  function parseTimeToMinutes(timeStr) {
    if (!timeStr || timeStr === '—' || timeStr === '-') return 0;
    const compactMatch = timeStr.match(/^(\d+):(\d{2})$/);
    if (compactMatch) return Number(compactMatch[1]) * 60 + Number(compactMatch[2]);
    let minutes = 0;
    const hourMatch = timeStr.match(/(\d+)\s*(?:h|ч)/i);
    const minMatch = timeStr.match(/(\d+)\s*(?:m|мин)/i);
    if (hourMatch) minutes += Number(hourMatch[1]) * 60;
    if (minMatch) minutes += Number(minMatch[1]);
    return minutes;
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

  function formatClockTime(minutesSinceMidnight) {
    const hours = Math.floor(minutesSinceMidnight / 60);
    const minutes = minutesSinceMidnight % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
    let timelineEvents = []; // Track events with actual clock times
    
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
      
      // Add events to timeline
      if (stopStartTime !== null) {
        timelineEvents.push({
          time: stopStartTime,
          type: 'stop-start',
          stopIndex: i,
          stopName: stop.name
        });
        if (stopEndTime !== null) {
          timelineEvents.push({
            time: stopEndTime,
            type: 'stop-end',
            stopIndex: i,
            stopName: stop.name
          });
          maxEndTime = Math.max(maxEndTime, stopEndTime);
        } else {
          maxEndTime = Math.max(maxEndTime, stopStartTime);
        }
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
            type: 'drive',
            minutes: driveMinutes,
            fullLabel: driveLabel,
            shortLabel: abbreviateTime(driveLabel),
            description: description,
            stopOrder: nextStop.order,
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
            stopOrder: stop.order,
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
    
    console.log(`DEBUG: ${day.id} - startMinutes: ${startMinutes} (${formatClockTime(startMinutes)}), endTime: ${maxEndTime} (${formatClockTime(maxEndTime)}), total: ${totalMinutes}`);
    
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
      const offsetStart = (seg.clockStart - startMinutes) / totalMinutes * 100;
      const offsetEnd = (seg.clockEnd - startMinutes) / totalMinutes * 100;
      const width = offsetEnd - offsetStart;
      
      const fullTooltip = `${seg.description} (${escapeHtml(seg.fullLabel)})`;
      return `<div class="timeline-segment timeline-${seg.type}" data-stop-order="${seg.stopOrder}" data-segment-type="${seg.type}" data-width-percent="${width}" tabindex="0" role="button" aria-label="${seg.type === 'drive' ? 'Вождение' : 'Остановка'}: ${fullTooltip}" title="${fullTooltip}" style="left:${offsetStart}%; width:${width}%;"><span class="timeline-time">${escapeHtml(seg.shortLabel)}</span></div>`;
    }).join('');
    
    const timelineHtml = `<div class="timeline-container" data-timeline="day-${data.days.findIndex(d => d === day)}" aria-label="Визуальный обзор дня: вождение и остановки">${segmentHtml}</div>`;
    
    return { ruler: rulerHtml, timeline: timelineHtml };
  }

  function renderDay(day) {
    const timelineData = renderTimeline(day);
    const metaOrder = ['выезд', 'финиш', 'расстояние', 'вождение', 'купание', 'питание'];
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

    const meta = orderedMeta.map((item,index) => `<div class="meta-item ${index < 4 ? 'primary' : 'secondary'}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join('');
    const rows = day.stops.map(stop => {
      const flexible = isFlexibleStop(day, stop);
      const stopDuration = stop.duration && stop.duration !== '—' && stop.duration !== '-' ? stop.duration : '';
      return `<tr class="route-row${flexible?' is-flexible':''}" tabindex="0" data-day-id="${day.id}" data-stop-order="${stop.order}" aria-label="Показать ${escapeHtml(stop.name)} на карте">
        <td class="stop-order">${stop.order}</td><td class="stop-name"><strong>${escapeHtml(stop.name)}</strong>${flexible?'<span class="flexible-label">Гибко</span>':''}<span class="role">${escapeHtml(stop.role)}</span></td>
        <td data-label="Расстояние">${escapeHtml(stop.distance)}<span class="drive-time">${escapeHtml(stop.drive)}</span></td><td data-label="Время">${escapeHtml(stop.time)}${stopDuration ? `<span class="stop-time">${escapeHtml(stopDuration)}</span>` : ''}</td></tr>`;
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
          <table class="route-table"><thead><tr><th>№</th><th>Точка</th><th>Км / В пути</th><th>Время</th></tr></thead><tbody>${rows}</tbody></table>
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
    projectTitle.textContent = 'Крит · 11–15 августа';
    renderTabs();
    app.innerHTML = renderOverview() + data.days.map(renderDay).join('');
    setupTimelineListeners();
    adjustTimelineSegmentDisplay();
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
      <div class="stop-detail-kicker">Остановка ${escapeHtml(stop.order)}</div>
      <h2><a class="stop-maps-link" href="${navigationUrl}" target="_blank" rel="noopener" aria-label="Открыть ${escapeHtml(stop.name)} в Google Maps">${escapeHtml(stop.name)}<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg></a></h2>
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

  function syncSelectionUI(dayId, selectedType, selectedOrder, isHover = false) {
    const panel = document.getElementById(dayId);
    if (!panel) return;
    
    // Determine CSS class suffix based on hover/selected
    const suffix = isHover ? 'hovered' : 'active';
    const selectionClass = isHover ? 'is-hovered' : 'is-selected';
    const rowActiveClass = isHover ? 'is-hovered' : 'is-active';
    
    // Clear previous hover states if this is a hover, or selection states if not
    if (isHover) {
      panel.querySelectorAll('.route-row.is-hovered, .route-row.is-stop-hovered, .route-row.is-drive-hovered').forEach(row => {
        row.classList.remove('is-hovered', 'is-stop-hovered', 'is-drive-hovered');
      });
      panel.querySelectorAll('.timeline-segment.is-hovered').forEach(seg => {
        seg.classList.remove('is-hovered');
      });
      markerIndex.forEach(({ element }, key) => {
        if (key.startsWith(`${dayId}:`) && element) element.classList.remove('is-hovered');
      });
    } else {
      // Clear all previous selections
      panel.querySelectorAll('.route-row').forEach(row => {
        row.classList.remove('is-active', 'is-drive-selected', 'is-stop-selected');
      });
      panel.querySelectorAll('.timeline-segment').forEach(seg => {
        seg.classList.remove('is-selected');
      });
      markerIndex.forEach(({ element }, key) => {
        if (key.startsWith(`${dayId}:`) && element) element.classList.remove('is-active');
      });
    }
    
    if (!selectedType || selectedOrder === null) return; // Cleared but no new selection/hover
    
    // Apply selection/hover based on type
    if (selectedType === 'stop') {
      // Highlight the stop row
      const row = panel.querySelector(`.route-row[data-stop-order="${selectedOrder}"]`);
      if (isHover) {
        row?.classList.add('is-hovered', 'is-stop-hovered');
      } else {
        row?.classList.add('is-active', 'is-stop-selected');
      }
      
      // Highlight the stop timeline segment
      const segment = panel.querySelector(`.timeline-segment[data-stop-order="${selectedOrder}"][data-segment-type="stop"]`);
      segment?.classList.add(selectionClass);
      
      // Highlight the map marker
      const marker = markerIndex.get(markerKey(dayId, selectedOrder));
      marker?.element?.classList.add(isHover ? 'is-hovered' : 'is-active');
      
    } else if (selectedType === 'drive') {
      // Highlight the destination stop's row with drive column styling (Км + В пути)
      const row = panel.querySelector(`.route-row[data-stop-order="${selectedOrder}"]`);
      if (isHover) {
        row?.classList.add('is-hovered', 'is-drive-hovered');
      } else {
        row?.classList.add('is-active', 'is-drive-selected');
      }
      
      // Highlight the drive timeline segment
      const segment = panel.querySelector(`.timeline-segment[data-stop-order="${selectedOrder}"][data-segment-type="drive"]`);
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
    clearActiveDrive(dayId);
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
    clearActiveDrive(dayId);
    setActiveStop(dayId,order,focusMap);
    renderStopDetail(dayId,order);
    syncSelectionUI(dayId, 'stop', order);
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

  function setActiveDrive(dayId, stopOrder, driveCoordinates) {
    const panel = document.getElementById(dayId);
    const map = maps.get(dayId);
    const state = routingIndex.get(dayId);
    if (!panel) return;
    clearActiveDrive(dayId);
    if (map && state && Array.isArray(driveCoordinates) && driveCoordinates.length > 1) {
      state.driveHighlight = L.polyline(driveCoordinates, { color:'#f3b11f', weight:6, opacity:.92, lineCap:'round' }).addTo(map);
    }
    syncSelectionUI(dayId, 'drive', stopOrder);
  }

  function setHoverDrive(dayId, stopOrder) {
    const panel = document.getElementById(dayId);
    const map = maps.get(dayId);
    const state = routingIndex.get(dayId);
    if (!panel || !map || !state) return;
    
    // Clear previous hover highlight
    if (state.driveHoverHighlight) {
      map.removeLayer(state.driveHoverHighlight);
      state.driveHoverHighlight = null;
    }
    
    const day = data.days.find(item => item.id === dayId);
    if (!day) return;
    
    const currentOrderIndex = day.routeStopOrders.indexOf(Number(stopOrder));
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

  function focusTimelineStop(dayId, stopOrder) {
    const panel = document.getElementById(dayId);
    if (!panel) return;
    const row = panel.querySelector(`.route-row[data-stop-order="${stopOrder}"]`);
    if (row) {
      activateStopRow(row);
      return;
    }
    setActiveStop(dayId, stopOrder, true);
    renderStopDetail(dayId, stopOrder);
  }

  function focusTimelineDrive(dayId, stopOrder) {
    const panel = document.getElementById(dayId);
    const day = data.days.find(item => item.id === dayId);
    if (!panel || !day) return;
    if (mobileViewport.matches && panel.classList.contains('mobile-plan-view')) {
      setMobileView(dayId, 'map');
      setTimeout(() => focusTimelineDrive(dayId, stopOrder), 100);
      return;
    }

    const map = maps.get(dayId);
    const currentOrderIndex = day.routeStopOrders.indexOf(Number(stopOrder));
    if (!map || currentOrderIndex <= 0) return;

    const currentStop = day.stops.find(item => item.order === Number(stopOrder));
    const previousStop = day.stops.find(item => item.order === day.routeStopOrders[currentOrderIndex - 1]);
    if (!currentStop || !previousStop) return;
    const segmentCoordinates = routeSegmentCoordinates(dayId, currentOrderIndex - 1, currentOrderIndex);

    closeStopDetail(dayId, false, false);
    setActiveDrive(dayId, stopOrder, segmentCoordinates);
    map.invalidateSize({ pan:false });
    if (segmentCoordinates) {
      map.fitBounds(segmentCoordinates, { padding:[60,60], maxZoom:13, animate:true });
      return;
    }
    map.fitBounds([
      [previousStop.lat, previousStop.lon],
      [currentStop.lat, currentStop.lon]
    ], { padding:[60,60], maxZoom:13, animate:true });
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
    if (previous?.driveHighlight) map.removeLayer(previous.driveHighlight);
    previous?.segmentOverlays?.forEach(l => map.removeLayer(l));
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
    routingIndex.set(dayId,{ control:routing,fallback:null,driveHighlight:null,driveHoverHighlight:null,lastRoute:null,segmentOverlays:[] });
    routing.on('routesfound', event => {
      if (routingIndex.get(dayId)?.control !== routing) return;
      const state = routingIndex.get(dayId);
      if (state) state.lastRoute = event.routes?.[0] || null;
      setRouteFailure(dayId,false);
      // Add invisible wide overlays on each segment so they're clickable
      state.segmentOverlays?.forEach(l => map.removeLayer(l));
      state.segmentOverlays = [];
      for (let i = 1; i < day.routeStopOrders.length; i++) {
        const segCoords = routeSegmentCoordinates(dayId, i - 1, i);
        if (!segCoords) continue;
        const stopOrder = day.routeStopOrders[i];
        const overlay = L.polyline(segCoords, { weight:20, opacity:0.001, interactive:true, pane:'routeOverlays' }).addTo(map);
        overlay.on('click', () => focusTimelineDrive(dayId, stopOrder));
        // Add hover listeners to route overlay
        overlay.on('mouseover', () => {
          syncSelectionUI(dayId, 'drive', stopOrder, true);
          setHoverDrive(dayId, stopOrder);
        });
        overlay.on('mouseout', () => {
          syncSelectionUI(dayId, null, null, true);
          clearHoverDrive(dayId);
        });
        state.segmentOverlays.push(overlay);
      }
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
    map.createPane('routeOverlays');
    map.getPane('routeOverlays').style.zIndex = 450;
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
        // Add hover listeners to marker
        if (element) {
          element.addEventListener('mouseover', () => {
            syncSelectionUI(dayId, 'stop', stop.order, true);
          });
          element.addEventListener('mouseout', () => {
            syncSelectionUI(dayId, null, null, true);
            clearHoverDrive(dayId);
          });
        }
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
    adjustTimelineSegmentDisplay();
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
      if (closeButton) {
        const panelId = closeButton.closest('.day-panel').id;
        clearActiveDrive(panelId);
        closeStopDetail(panelId, false);
        return;
      }
      const viewButton = event.target.closest('.mobile-view-button');
      if (viewButton) {
        const panel = viewButton.closest('.day-panel');
        delete panel.dataset.focusStop;
        clearActiveDrive(panel.id);
        setMobileView(panel.id, viewButton.dataset.view);
        return;
      }
      const timelineSegment = event.target.closest('.timeline-segment');
      if (timelineSegment) {
        const container = timelineSegment.closest('.timeline-container');
        if (container) {
          const dayPanel = container.closest('.day-panel');
          const stopOrder = Number(timelineSegment.dataset.stopOrder);
          const segmentType = timelineSegment.dataset.segmentType;
          setActiveTimelineSegment(container, timelineSegment);
          if (dayPanel && stopOrder) {
            if (segmentType === 'drive') focusTimelineDrive(dayPanel.id, stopOrder);
            if (segmentType === 'stop') focusTimelineStop(dayPanel.id, stopOrder);
          }
        }
        return;
      }
      const summaryDay = event.target.closest('.summary-day');
      if (summaryDay) {
        const dayId = summaryDay.dataset.dayId;
        const dayTab = document.getElementById(`tab-${dayId}`);
        if (dayTab) {
          dayTab.click();
          return;
        }
      }
      const row = event.target.closest('.route-row');
      if (row) {
        // Click on merged distance/drive column triggers drive selection.
        const cell = event.target.closest('td');
        if (cell) {
          const cellIndex = [...row.cells].indexOf(cell);
          if (cellIndex === 2 && cell.textContent.trim() !== '—') {
            focusTimelineDrive(row.dataset.dayId, Number(row.dataset.stopOrder));
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
        const stopOrder = Number(segment.dataset.stopOrder);
        const segmentType = segment.dataset.segmentType;
        syncSelectionUI(dayPanel.id, segmentType, stopOrder, true);
        // Show drive highlight on map when hovering over drive segment
        if (segmentType === 'drive') {
          setHoverDrive(dayPanel.id, stopOrder);
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
      const stopOrder = Number(row.dataset.stopOrder);
      const cell = event.target.closest('td');
      if (cell) {
        const cellIndex = [...row.cells].indexOf(cell);
        // Hover on merged distance/drive column highlights drive, otherwise highlights stop.
        const isDriveCell = cellIndex === 2 && cell.textContent.trim() !== '—';
        const selectedType = isDriveCell ? 'drive' : 'stop';
        syncSelectionUI(dayId, selectedType, stopOrder, true);
        // Show drive highlight on map when hovering over drive columns
        if (isDriveCell) {
          setHoverDrive(dayId, stopOrder);
        }
      } else {
        syncSelectionUI(dayId, 'stop', stopOrder, true);
      }
    });
    app.addEventListener('mouseout', event => {
      const row = event.target.closest('.route-row');
      if (!row) return;
      const dayId = row.dataset.dayId;
      syncSelectionUI(dayId, null, null, true);
      clearHoverDrive(dayId);
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
