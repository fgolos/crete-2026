(() => {
  'use strict';

  const stories = Array.isArray(window.CRETE_STORIES) ? window.CRETE_STORIES : [];
  if (!stories.length) return;

  let activeUtterance = null;
  let activeStoryId = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function buildSpeechText(story) {
    const lookFor = story.lookFor?.length
      ? `Когда будем на месте, обратите внимание: ${story.lookFor.join('. ')}.`
      : '';
    return [story.title, ...(story.text || []), lookFor].filter(Boolean).join('\n\n');
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    activeUtterance = null;
    activeStoryId = null;
    updateSpeechButtons();
  }

  function updateSpeechButtons() {
    document.querySelectorAll('[data-story-speak]').forEach(button => {
      const isActive = button.dataset.storySpeak === activeStoryId && window.speechSynthesis?.speaking;
      button.textContent = isActive ? 'Пауза' : 'Слушать';
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function speakStory(story) {
    if (!('speechSynthesis' in window)) return;

    if (activeStoryId === story.id && window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.pause();
      }
      updateSpeechButtons();
      return;
    }

    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(buildSpeechText(story));
    utterance.lang = 'ru-RU';
    utterance.rate = 0.94;
    utterance.pitch = 1;
    utterance.onend = stopSpeech;
    utterance.onerror = stopSpeech;
    activeUtterance = utterance;
    activeStoryId = story.id;
    window.speechSynthesis.speak(utterance);
    updateSpeechButtons();
  }

  function createDialog() {
    const dialog = document.createElement('dialog');
    dialog.className = 'story-dialog';
    dialog.setAttribute('aria-labelledby', 'story-title');
    dialog.innerHTML = '<div class="story-dialog-shell"><button class="story-close" type="button" aria-label="Закрыть рассказ">×</button><div class="story-content"></div></div>';
    document.body.appendChild(dialog);

    dialog.querySelector('.story-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', stopSpeech);
    return dialog;
  }

  const dialog = createDialog();
  const content = dialog.querySelector('.story-content');

  function renderStory(story) {
    const paragraphs = (story.text || []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
    const lookFor = story.lookFor?.length
      ? `<section class="story-look-for"><h3>На что посмотреть</h3><ul>${story.lookFor.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`
      : '';
    const sources = story.sources?.length
      ? `<details class="story-sources"><summary>Источники</summary><ul>${story.sources.map(source => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.title)}</a></li>`).join('')}</ul></details>`
      : '';
    const speechControls = 'speechSynthesis' in window
      ? `<div class="story-audio-controls"><button type="button" data-story-speak="${escapeHtml(story.id)}">Слушать</button><button type="button" data-story-stop>Стоп</button><span>Озвучивание устройством</span></div>`
      : '<p class="story-audio-unavailable">На этом устройстве браузерное озвучивание недоступно.</p>';

    content.innerHTML = `
      <div class="story-eyebrow">${escapeHtml(story.kind === 'road' ? 'Рассказ о дороге' : 'Рассказ о месте')} · ${escapeHtml(story.durationMinutes)} мин</div>
      <h2 id="story-title">${escapeHtml(story.title)}</h2>
      ${speechControls}
      <div class="story-text">${paragraphs}</div>
      ${lookFor}
      ${sources}
    `;

    content.querySelector('[data-story-speak]')?.addEventListener('click', event => {
      event.stopPropagation();
      speakStory(story);
    });
    content.querySelector('[data-story-stop]')?.addEventListener('click', event => {
      event.stopPropagation();
      stopSpeech();
    });
    updateSpeechButtons();
  }

  function openStory(story) {
    stopSpeech();
    renderStory(story);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function attachStoryButtons() {
    for (const story of stories) {
      const panel = document.getElementById(story.dayId);
      const row = panel?.querySelector(`.route-row[data-stop-order="${story.stopOrder}"]`);
      const cell = row?.querySelector('.stop-name');
      if (!cell || cell.querySelector(`[data-story-id="${story.id}"]`)) continue;

      let actions = cell.querySelector('.story-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'story-actions';
        cell.appendChild(actions);
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = `story-open story-open-${story.kind}`;
      button.dataset.storyId = story.id;
      button.textContent = `${story.buttonLabel} · ${story.durationMinutes} мин`;
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        openStory(story);
      });
      actions.appendChild(button);
    }
  }

  function init() {
    requestAnimationFrame(() => requestAnimationFrame(attachStoryButtons));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
