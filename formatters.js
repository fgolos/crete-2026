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
  function buildDayMeta(day, visits = []) {
    const items = [];

    const distanceKm = day.travelTotals?.distanceKm;
    const drivingMinutes = day.travelTotals?.drivingDurationMinutes;
    if (Number.isFinite(distanceKm) || Number.isFinite(drivingMinutes)) {
      let roadValue;
      if (distanceKm === 0 && drivingMinutes === 0) {
        roadValue = 'без машины';
      } else {
        const roadParts = [
          Number.isFinite(distanceKm) ? formatDistance(distanceKm) : '',
          Number.isFinite(drivingMinutes) ? formatDuration(drivingMinutes) : ''
        ].filter(Boolean);
        roadValue = roadParts.join(' · ');
        if (day.travelTotals?.approximate && roadValue) roadValue = `около ${roadValue}`;
      }
      if (roadValue) items.push({ label: 'Дорога', value: roadValue });
    }

    const visitTimes = visits.map(visit => visit?.timing?.start).filter(Boolean);
    const departure = visitTimes[0] || day.schedule?.departure?.start || null;
    const finish = visitTimes[visitTimes.length - 1] || day.schedule?.finish?.start || null;
    if (departure || finish) {
      const timeValue = departure && finish ? `${departure} → ${finish}` : departure || finish;
      items.push({ label: 'Время', value: timeValue });
    }

    if (day.swimming) items.push({ label: 'Купание', value: day.swimming });
    if (day.mealSummary) items.push({ label: 'Питание', value: day.mealSummary });

    const logistics = [];
    if (day.status !== 'confirmed') logistics.push(`Статус: ${statusLabel(day.status)}`);
    if (day.schedule?.carReturnDeadline) logistics.push(`Машину вернуть до ${day.schedule.carReturnDeadline}`);
    if (day.schedule?.flight) logistics.push(`Рейс ${day.schedule.flight.number} · ${day.schedule.flight.departureTime}`);
    if (logistics.length) items.push({ label: 'Логистика', value: logistics.join(' · ') });

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
