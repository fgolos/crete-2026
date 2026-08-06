(() => {
  'use strict';

  const locale = 'ru-RU';
  const dateOnly = value => new Date(`${value}T12:00:00Z`);
  const monthOnly = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
  const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const weekdayOnly = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  const integer = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

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
    return remainder ? `${hours} ч ${String(remainder).padStart(2, '0')} мин` : `${hours} ч`;
  }

  function formatDistance(km) {
    return Number.isFinite(km) ? `${integer.format(km)} км` : '';
  }

  function formatTimeRange(timing) {
    if (!timing?.start) return '';
    const value = timing.end ? `${timing.start}–${timing.end}` : timing.start;
    return timing.approximate ? `около ${value}` : value;
  }

  function formatVisitDuration(minutes, kind) {
    if (Number.isFinite(minutes)) return formatDuration(minutes);
    return ({
      departure: 'Вылет',
      'check-in-rest': 'Заселение и отдых',
      start: 'Старт',
      finish: 'Финиш',
      airport: 'Аэропорт'
    })[kind] || '—';
  }

  function formatInboundDuration(travel) {
    if (travel?.status === 'none') return '—';
    if (travel?.status === 'rental-shuttle') return 'шаттл прокатчика';
    return formatDuration(travel?.durationMinutes) || '—';
  }

  function formatInboundDistance(travel) {
    if (travel?.status === 'none') return '—';
    if (travel?.status === 'rental-shuttle') return 'несколько минут';
    return formatDistance(travel?.distanceKm) || '—';
  }

  function sectionTitle(key) {
    return ({ essentials: 'Главное и гибкость', food: 'Питание', practical: 'Практические заметки' })[key] || key;
  }

  function statusLabel(status) {
    return ({ draft: 'Черновик', 'draft-reserve': 'Черновик / резерв', confirmed: 'Подтверждено' })[status] || status;
  }

  function buildDayMeta(day) {
    const items = [];
    if (day.status !== 'confirmed') items.push({ label: 'Статус', value: statusLabel(day.status) });
    if (day.schedule?.departure) items.push({ label: 'Выезд', value: formatTimeRange(day.schedule.departure) });
    if (day.schedule?.finish) items.push({ label: 'Финиш', value: formatTimeRange(day.schedule.finish) });
    if (day.schedule?.carReturnDeadline) items.push({ label: 'Машина', value: `вернуть до ${day.schedule.carReturnDeadline}` });
    if (day.schedule?.flight) items.push({ label: 'Рейс', value: `${day.schedule.flight.number} · ${day.schedule.flight.departureTime}` });
    if (Number.isFinite(day.travelTotals?.drivingDurationMinutes)) {
      const value = formatDuration(day.travelTotals.drivingDurationMinutes);
      items.push({ label: 'Вождение', value: day.travelTotals.approximate ? `около ${value}` : value });
    }
    if (Number.isFinite(day.travelTotals?.distanceKm)) {
      const value = formatDistance(day.travelTotals.distanceKm);
      items.push({ label: 'Расстояние', value: day.travelTotals.approximate ? `около ${value}` : value });
    }
    if (day.swimming) items.push({ label: 'Купание', value: day.swimming });
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

  function dateTimeParts(value) {
    return value ? { date: value.slice(0, 10), time: value.slice(11, 16) } : { date: null, time: null };
  }

  function buildOverviewLogistics(trip) {
    const logistics = trip.logistics || {};
    const outbound = logistics.flights?.find(flight => flight.direction === 'outbound');
    const car = logistics.carRental;
    const stays = logistics.accommodations || [];
    const items = [];

    if (outbound) {
      const departure = dateTimeParts(outbound.departureAt);
      const arrival = dateTimeParts(outbound.arrivalAt);
      items.push({
        label: 'Перелёт',
        value: `${outbound.origin} ${departure.time} → ${outbound.destination} ${arrival.time}, ${dayMonth.format(dateOnly(departure.date))}`
      });
    }
    if (car) {
      const pickup = dateTimeParts(car.pickupAt);
      items.push({
        label: 'Автомобиль',
        value: `${car.category}; получение ${car.pickupApproximate ? 'около ' : ''}${pickup.time}, ${dayMonth.format(dateOnly(pickup.date))}`
      });
    }
    stays.forEach((stay, index) => {
      const checkIn = dateTimeParts(stay.checkInAt);
      const checkOut = dateTimeParts(stay.checkOutAt);
      items.push({
        label: `Жильё в ${stay.baseName}`,
        value: index === 0
          ? `${dayMonth.format(dateOnly(checkIn.date))} ${checkIn.time} → ${dayMonth.format(dateOnly(checkOut.date))} ${checkOut.time}`
          : `заселение с ${checkIn.time}, ${dayMonth.format(dateOnly(checkIn.date))}`
      });
    });
    return items;
  }

  window.CRETE_FORMATTERS = Object.freeze({
    formatDateRange,
    formatLongDate,
    formatShortDateEn,
    formatDuration,
    formatDistance,
    formatTimeRange,
    formatVisitDuration,
    formatInboundDuration,
    formatInboundDistance,
    formatReservationWhen,
    sectionTitle,
    buildDayMeta,
    buildOverviewLogistics
  });
})();
