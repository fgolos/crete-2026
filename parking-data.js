(() => {
  'use strict';

  const itinerary = window.CRETE_ITINERARY;
  if (!itinerary?.days) return;

  const definitions = [
    {
      dayId: 'day12',
      stopOrder: 1,
      parking: {
        status: 'on-site',
        primary: {
          name: 'Toplou Monastery parking',
          lat: 35.221552,
          lon: 26.21605,
          navigationQuery: '35.221552,26.21605',
          type: 'official',
          paid: false,
          walkMinutes: 1,
          reliability: 'high',
          crowding: 'В высокий сезон места могут заполняться перед экскурсиями и дегустациями.',
          summary: 'Парковка непосредственно у комплекса Toplou Monastery.',
          notes: ['Подходит для обычной арендованной машины.', 'Приехать с небольшим запасом перед подтверждённым временем.'],
          lastVerified: '2026-07-30'
        },
        alternatives: []
      }
    },
    {
      dayId: 'day12',
      stopOrder: 3,
      parking: {
        status: 'on-site',
        primary: {
          name: 'Ancient Itanos / Erimoupolis parking',
          lat: 35.264308,
          lon: 26.262072,
          navigationQuery: '35.264308,26.262072',
          type: 'informal',
          paid: false,
          walkMinutes: 3,
          reliability: 'high',
          crowding: 'Обычно проще, чем у Vai, но в августе свободное место не гарантировано.',
          summary: 'Общая точка парковки для Ancient City Itanos и Erimoupolis beach.',
          notes: ['До пляжа примерно 200–250 м.', 'Не оставлять багаж и ценности на виду.'],
          lastVerified: '2026-07-30'
        },
        alternatives: []
      }
    },
    {
      dayId: 'day12',
      stopOrder: 4,
      parking: {
        status: 'recommended',
        primary: {
          name: 'Vai Beach Parking',
          lat: 35.25405,
          lon: 26.26241,
          navigationQuery: '35.25405,26.26241',
          type: 'official',
          paid: true,
          priceNote: 'Оплата на месте; актуальную цену проверить при въезде.',
          walkMinutes: 4,
          reliability: 'high',
          crowding: 'В августе быстро заполняется; к нашему вечернему приезду часть дневных посетителей уже уезжает.',
          summary: 'Официальная наземная парковка у входа в Palm Forest of Vai и Vai Beach.',
          notes: ['Подъезд по асфальту.', 'Следовать указаниям персонала и разметке.', 'Не оставлять вещи на виду.'],
          lastVerified: '2026-07-30'
        },
        alternatives: []
      }
    }
  ];

  for (const definition of definitions) {
    const day = itinerary.days.find(item => item.id === definition.dayId);
    const stop = day?.stops?.find(item => item.order === definition.stopOrder);
    if (!stop) continue;
    stop.parking = definition.parking;
    stop.pointNavigationQuery = stop.navigationQuery;
    const primary = definition.parking.primary;
    if (primary?.navigationQuery) stop.navigationQuery = primary.navigationQuery;
  }
})();
