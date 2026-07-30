(() => {
  'use strict';

  const stories = Array.isArray(window.CRETE_STORIES) ? window.CRETE_STORIES : [];
  if (!stories.length) return;

  let activeAudio = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function stopAudio() {
    if (!activeAudio) return;
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
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
    dialog.addEventListener('close', stopAudio);
    return dialog;
  }

  const dialog = createDialog();
  const content = dialog.querySelector('.story-content');

  function renderAudio(story) {
    if (!story.audio) {
      return '<div class="story-audio-pending"><strong>Аудиоверсия готовится</strong><span>Текст уже можно читать. MP3 появится здесь после генерации.</span></div>';
    }

    return `<div class="story-audio-player">
      <div class="story-audio-heading"><strong>Аудиогид</strong><span>${escapeHtml(story.durationMinutes)} мин</span></div>
      <audio controls preload="metadata" src="${escapeHtml(story.audio)}">Ваш браузер не поддерживает воспроизведение MP3.</audio>
    </div>`;
  }

  function renderStory(story) {
    stopAudio();
    const paragraphs = (story.text || []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
    const lookFor = story.lookFor?.length
      ? `<section class="story-look-for"><h3>На что посмотреть</h3><ul>${story.lookFor.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`
      : '';
    const sources = story.sources?.length
      ? `<details class="story-sources"><summary>Источники</summary><ul>${story.sources.map(source => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.title)}</a></li>`).join('')}</ul></details>`
      : '';

    content.innerHTML = `
      <div class="story-eyebrow">${escapeHtml(story.kind === 'road' ? 'Рассказ о дороге' : 'Рассказ о месте')} · ${escapeHtml(story.durationMinutes)} мин</div>
      <h2 id="story-title">${escapeHtml(story.title)}</h2>
      ${renderAudio(story)}
      <div class="story-text">${paragraphs}</div>
      ${lookFor}
      ${sources}
    `;

    activeAudio = content.querySelector('audio');
  }

  function openStory(story) {
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
