(() => {
  'use strict';

  const itinerary = window.CRETE_ITINERARY;
  if (!itinerary) return;

  const booking = itinerary.overview?.bookings?.find(item => item.name === 'Toplou Fabrica');
  if (booking) {
    booking.note = 'Подтверждено для 4 человек: 1 Classic Wine Tasting, 1 бокал вина 40 мл для водителя, сок или sparkling water для двух детей и local food platter для всей семьи за €8.';
    booking.status = 'confirmed';
  }

  const visit = findObject(itinerary, item =>
    item?.name === 'Toplou Monastery & Toplou Fabrica' && item?.time === '10:10–12:10'
  );
  if (visit) {
    visit.role = 'Монастырь, музей и подтверждённая семейная дегустация';
  }

  const practical = findObject(itinerary, item =>
    item?.title === 'Практические заметки' &&
    Array.isArray(item.items) &&
    item.items.some(note => note.includes('Toplou Fabrica находится'))
  );
  if (practical) {
    practical.items = practical.items.map(note => {
      if (note.includes('подтверждение ожидается')) {
        return 'Toplou Fabrica подтверждена на 12 августа в 11:00 для 4 человек.';
      }
      if (note === 'Водитель не участвует в полноценной дегустации.') {
        return 'Формат подтверждён: Classic Wine Tasting для Лиды; 40 мл вина для водителя; сок или sparkling water для двух детей; local food platter для семьи за €8.';
      }
      return note;
    });
    practical.items.splice(3, 0, 'Организаторов попросили по возможности подробнее рассказать о сортах винограда, производственных процессах и характере вин.');
  }

  function findObject(value, predicate) {
    if (!value || typeof value !== 'object') return null;
    if (predicate(value)) return value;
    for (const child of Object.values(value)) {
      const match = findObject(child, predicate);
      if (match) return match;
    }
    return null;
  }
})();
