(() => {
  'use strict';

  const locale = 'ru-RU';
  const dateOnly = value => new Date(`${value}T12:00:00Z`);
  const monthOnly = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
  const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const weekdayOnly = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });

  function formatDateRange(startDate, endDate, includeYear = false) {
    if (!startDate || !endDate) return '';
    const start = dateOnly(startDate);
    const end = dateOnly(endDate);
    const sameMonth = start.getUTCMonth() === end.getUTCMonth();
    const year = includeYear ? ` ${end.getUTCFullYear()}` : '';
    if (sameMonth) return `${start.getUTCDate()}–${end.getUTCDate()} ${monthOnly.format(end)}${year}`;
    return `${dayMonth.format(start)} – ${dayMonth.format(end)}${year}`;
  }

  function formatLongDate(value) {
    const date = dateOnly(value);
    return `${dayMonth.format(date)}, ${weekdayOnly.format(date)}`;
  }

  function formatShortDateEn(value) {
    const date = dateOnly(value);
    return `${date.getUTCDate()} Aug`;
  }

  function formatDuration(minutes) {
    if (!Number.isFinite(minutes)) return '';
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (!hours) return `${remainder} мин`;
    return remainder ? `${hours} ч ${remainder} мин` : `${hours} ч`;
  }

  function formatDistance(km) {
    return Number.isFinite(km) ? `${km} км` : '';
  }

  function formatLegacyDuration(minutes, hint) {
    return Number.isFinite(minutes) ? formatDuration(minutes) : (hint || '—');
  }

  function sectionTitle(key) {
    return ({ essentials: 'Главное и гибкость', food: 'Питание', practical: 'Практические заметки' })[key] || key;
  }

  function buildLegacyDayMeta(day) {
    const values = day.metrics || {};
    const hints = day.metricDisplayHints || {};
    const items = [];
    if (values.status) items.push({ label: 'Статус', value: hints.status || values.status });
    if (values.departureTime) items.push({ label: 'Выезд', value: hints.departureTime || values.departureTime });
    if (values.finishTime) items.push({ label: 'Финиш', value: hints.finishTime || values.finishTime });
    if (values.carReturn) items.push({ label: 'Машина', value: hints.carReturn || values.carReturn });
    if (values.flight) items.push({ label: 'Рейс', value: hints.flight || values.flight });
    if (Number.isFinite(values.drivingDurationMinutes) || hints.drivingDurationMinutes) items.push({ label: 'Вождение', value: hints.drivingDurationMinutes || formatDuration(values.drivingDurationMinutes) });
    if (Number.isFinite(values.distanceKm) || hints.distanceKm) items.push({ label: 'Расстояние', value: hints.distanceKm || formatDistance(values.distanceKm) });
    if (values.swimming) items.push({ label: 'Купание', value: hints.swimming || values.swimming });
    return items;
  }

  function formatReservationWhen(reservation) {
    if (reservation.startsAt) {
      const date = reservation.startsAt.slice(0, 10);
      const time = reservation.startsAt.slice(11, 16);
      return `${dayMonth.format(dateOnly(date))}, ${time}`;
    }
    if (reservation.date && reservation.timeOfDay === 'evening') return `${dayMonth.format(dateOnly(reservation.date))}, вечером`;
    return reservation.date ? dayMonth.format(dateOnly(reservation.date)) : '';
  }

  function buildOverviewLogistics() {
    return [
      { label: 'Перелёт', value: 'Vilnius 05:15 → Heraklion 08:35, 11 августа' },
      { label: 'Автомобиль', value: 'Station Wagon Manual; получение около 10:00, 11 августа' },
      { label: 'Жильё в Sitia', value: '11 августа 12:00 → 15 августа 12:00' },
      { label: 'Жильё в Platanes', value: 'заселение с 13:00, 15 августа' }
    ];
  }

  window.CRETE_FORMATTERS = Object.freeze({
    formatDateRange,
    formatLongDate,
    formatShortDateEn,
    formatDuration,
    formatDistance,
    formatLegacyDuration,
    formatReservationWhen,
    sectionTitle,
    buildLegacyDayMeta,
    buildOverviewLogistics
  });
})();
