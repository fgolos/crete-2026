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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyInodionConfirmation, { once: true });
  } else {
    applyInodionConfirmation();
  }
})();
