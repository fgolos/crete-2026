(() => {
  function applyInodionConfirmation() {
    document.querySelectorAll('.booking-card').forEach(card => {
      const title = card.querySelector('strong');
      if (!title || title.textContent.trim() !== 'Inodion') return;
      card.classList.remove('pending');
      const details = card.querySelector('p');
      if (details) {
        details.textContent = 'Стол для 4 человек подтверждён. Забронирован ближайший доступный стол к морю; столы непосредственно у моря предоставляются в порядке живой очереди. Если такой стол будет свободен при прибытии, можно пересесть.';
      }
    });

    const replacements = [
      ['На 21:00 запрошен стол в Inodion для 4 человек; подтверждение ожидается.', 'Inodion: стол для 4 человек подтверждён на 21:00. Забронирован ближайший доступный стол к морю.'],
      ['Inodion: бронь на 21:00 запрошена; после возвращения остаётся около двух часов на отдых.', 'Inodion: бронь на 21:00 подтверждена; после возвращения остаётся около двух часов на отдых. Столы непосредственно у моря занимают в порядке живой очереди.'],
      ['Inodion запрошен на 21:00.', 'Inodion подтверждён на 21:00.'],
      ['Письмо на стол для 4 человек отправлено; ответ ожидается.', 'Стол для 4 человек подтверждён; забронирован ближайший доступный стол к морю.']
    ];

    document.querySelectorAll('li, p, td, span').forEach(element => {
      const original = element.textContent.trim();
      for (const [from, to] of replacements) {
        if (original === from) {
          element.textContent = to;
          break;
        }
      }
    });
  }

  function installMapOverlayStyles() {
    if (document.getElementById('map-overlay-styles')) return;

    const style = document.createElement('style');
    style.id = 'map-overlay-styles';
    style.textContent = `
      .map-google-button {
        position: absolute;
        top: 14px;
        right: 14px;
        z-index: 800;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 38px;
        padding: 8px 12px;
        border: 1px solid rgba(23, 32, 24, .18);
        border-radius: 10px;
        background: rgba(255, 255, 255, .96);
        color: #172018;
        text-decoration: none;
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
        box-shadow: 0 4px 16px rgba(20, 35, 22, .18);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        transition: transform .16s ease, box-shadow .16s ease, background .16s ease;
      }
      .map-google-button::before {
        content: '↗';
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: #415a3b;
        color: #fff;
        font-size: 12px;
      }
      .map-google-button:hover {
        transform: translateY(-1px);
        background: #fff;
        box-shadow: 0 7px 20px rgba(20, 35, 22, .23);
      }
      .map-google-button:focus-visible {
        outline: 3px solid rgba(65, 90, 59, .35);
        outline-offset: 2px;
      }
      .action-row:empty { display: none !important; }
      @media (max-width: 800px) {
        .map-google-button {
          top: 12px;
          right: 12px;
          min-height: 36px;
          padding: 7px 10px;
          font-size: 11px;
        }
      }
      @media print {
        .map-google-button { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function moveGoogleMapsButtonsOntoMaps() {
    installMapOverlayStyles();

    document.querySelectorAll('.day-panel').forEach(panel => {
      const actionRow = panel.querySelector('.action-row');
      const button = actionRow?.querySelector('a.primary-button');
      const mapWrap = panel.querySelector('.map-wrap');

      if (!button || !mapWrap || mapWrap.querySelector('.map-google-button')) return;

      button.classList.remove('primary-button');
      button.classList.add('map-google-button');
      button.textContent = 'Открыть в Google Maps';
      button.setAttribute('aria-label', 'Открыть автомобильный маршрут этого дня в Google Maps');

      mapWrap.appendChild(button);
      if (actionRow && !actionRow.children.length) actionRow.remove();
    });
  }

  function applyAllPatches() {
    applyInodionConfirmation();
    moveGoogleMapsButtonsOntoMaps();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllPatches, { once: true });
  } else {
    applyAllPatches();
  }
})();