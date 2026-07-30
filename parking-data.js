(() => {
  'use strict';

  const itinerary = window.CRETE_ITINERARY;
  if (!itinerary?.days) return;

  const verified = '2026-07-30';

  function onSite(stop, options = {}) {
    return {
      status: options.status || 'on-site',
      primary: {
        name: options.name || `${stop.name} parking`,
        lat: options.lat ?? stop.lat,
        lon: options.lon ?? stop.lon,
        navigationQuery: options.navigationQuery || `${options.lat ?? stop.lat},${options.lon ?? stop.lon}`,
        type: options.type || 'informal',
        paid: options.paid,
        priceNote: options.priceNote,
        walkMinutes: options.walkMinutes ?? 1,
        reliability: options.reliability || 'medium',
        crowding: options.crowding || '',
        summary: options.summary || 'Парковка непосредственно у точки или на ближайшей разрешённой площадке.',
        notes: options.notes || [],
        lastVerified: verified
      },
      alternatives: options.alternatives || []
    };
  }

  const rules = [
    {
      match: stop => stop.name === 'Heraklion International Airport N. Kazantzakis',
      build: stop => onSite(stop, {
        name: 'GoMega pickup / airport meeting point', type: 'rental', paid: null, walkMinutes: 0, reliability: 'high',
        summary: 'Место получения автомобиля определяется инструкциями прокатчика и шаттлом.',
        crowding: 'В августе возможны очереди и плотное движение у терминала.',
        notes: ['Следовать ваучеру и указаниям GoMega.', 'Не использовать эту точку как обычную долгосрочную парковку.']
      })
    },
    {
      match: stop => stop.name === 'Mochlos',
      build: stop => onSite(stop, {
        name: 'Mochlos village parking', status: 'street', type: 'street', paid: false, walkMinutes: 3, reliability: 'medium',
        summary: 'Искать разрешённое место на въезде в деревню или вдоль дороги до набережной.',
        crowding: 'В обеденное время августа ближайшие места у таверн могут быть заняты.',
        notes: ['Не заезжать в слишком узкие переулки у воды.', 'Багаж полностью скрыть; документы и ценности взять с собой.', 'Не использовать грунтовые карманы, если подъезд выглядит сомнительно.']
      })
    },
    {
      match: stop => stop.name === 'Sitia Airbnb',
      build: stop => onSite(stop, {
        name: 'Parking near Sitia Airbnb', status: 'street', type: 'street', paid: false, walkMinutes: 2, reliability: 'medium',
        navigationQuery: stop.navigationQuery,
        summary: 'Уличная парковка рядом с жильём; конкретное место выбирается по фактической доступности.',
        crowding: 'Вечером места рядом с центром могут быть заняты.',
        notes: ['Не перекрывать въезды и узкие повороты.', 'При заселении сначала выгрузить багаж, затем при необходимости переставить машину.']
      })
    },
    {
      match: stop => stop.name.includes('Toplou Monastery'),
      build: stop => onSite(stop, {
        name: 'Toplou Monastery parking', type: 'official', paid: false, walkMinutes: 1, reliability: 'high',
        summary: 'Парковка непосредственно у комплекса Toplou Monastery.',
        crowding: 'В высокий сезон места могут заполняться перед экскурсиями и дегустациями.',
        notes: ['Подходит для обычной арендованной машины.', 'Приехать с небольшим запасом перед подтверждённым временем.']
      })
    },
    {
      match: stop => stop.name.includes('Paralia Chiona') || stop.name.includes('Hiona Taverna'),
      build: stop => onSite(stop, {
        name: 'Hiona Taverna / Chiona beach parking', type: 'informal', paid: false, walkMinutes: 1, reliability: 'high',
        summary: 'Парковка у таверны и пляжа, рядом с конечной точкой подъезда.',
        crowding: 'В августе в обеденное время ближайшие места могут быть заняты.',
        notes: ['Следовать указаниям таверны и не перекрывать проезд.', 'Не оставлять ценности на виду.']
      })
    },
    {
      match: stop => stop.name.includes('Ancient City Itanos'),
      build: stop => onSite(stop, {
        name: 'Ancient Itanos / Erimoupolis parking', type: 'informal', paid: false, walkMinutes: 3, reliability: 'high',
        summary: 'Общая точка парковки для Ancient City Itanos и Erimoupolis beach.',
        crowding: 'Обычно проще, чем у Vai, но в августе свободное место не гарантировано.',
        notes: ['До пляжа примерно 200–250 м.', 'Не оставлять багаж и ценности на виду.']
      })
    },
    {
      match: stop => stop.name === 'Vai Beach',
      build: () => ({
        status: 'recommended',
        primary: {
          name: 'Vai Beach Parking', lat: 35.25315, lon: 26.26431, navigationQuery: '35.25315,26.26431',
          type: 'official', paid: true, priceNote: 'Оплата на месте; актуальную цену проверить при въезде.',
          walkMinutes: 3, reliability: 'high',
          crowding: 'В августе быстро заполняется; к нашему вечернему приезду часть дневных посетителей уже уезжает.',
          summary: 'Въезд в основную организованную парковку перед Vai Beach.',
          notes: ['Подъезд по асфальту.', 'Точка поставлена у въезда в основную парковку, а не у западного дорожного кармана.', 'Следовать указаниям персонала и разметке.', 'Не оставлять вещи на виду.'],
          lastVerified: verified
        },
        alternatives: []
      })
    },
    {
      match: stop => stop.name === 'Ziros',
      build: stop => onSite(stop, {
        name: 'Ziros village parking', status: 'street', type: 'street', paid: false, walkMinutes: 2, reliability: 'medium',
        summary: 'Короткая уличная парковка в центре деревни или рядом с кафе.',
        crowding: 'Обычно проще, чем на побережье; не занимать место перед частным въездом.',
        notes: ['Выбирать широкое место без помех местному движению.', 'Перед спуском к Xerokampos удобно проверить воду и навигацию.']
      })
    },
    {
      match: stop => stop.name.includes('Mazida Ammos'),
      build: stop => onSite(stop, {
        name: 'Mazida Ammos beach parking', type: 'informal', paid: false, walkMinutes: 2, reliability: 'medium',
        summary: 'Парковка у подъезда к пляжу на разрешённой ровной площадке.',
        crowding: 'В августе ближайшие места могут заполняться, но оборот обычно есть.',
        notes: ['Оставаться на асфальтированном подъезде и очевидной парковочной площадке.', 'Не съезжать на песок или грунтовые ответвления.', 'Не оставлять ценности на виду.']
      })
    },
    {
      match: stop => stop.name.includes('Xerokampos') || stop.name.includes('Taverna Kostas'),
      build: stop => onSite(stop, {
        name: 'Taverna Kostas parking', type: 'customer', paid: false, walkMinutes: 1, reliability: 'medium',
        summary: 'Парковка рядом с Taverna Kostas или на ближайшем разрешённом участке дороги.',
        crowding: 'Во время позднего обеда обычно проще, но гарантии свободного места нет.',
        notes: ['Следовать указаниям персонала таверны.', 'Не блокировать подъезд к соседним домам.']
      })
    },
    {
      match: stop => stop.name.includes('Zakros Springs') || stop.name.includes('Water Power Museum'),
      build: stop => onSite(stop, {
        name: 'Zakros village parking', status: 'street', type: 'street', paid: false, walkMinutes: 3, reliability: 'medium',
        summary: 'Парковка в деревне Zakros рядом с источниками и музеем, где разрешено и не мешает местным.',
        crowding: 'Узкие улицы ограничивают выбор; лучше не пытаться подъехать к каждой точке вплотную.',
        notes: ['Оставить машину один раз и пройти короткий участок пешком.', 'Не перекрывать проезды и входы во дворы.']
      })
    },
    {
      match: stop => stop.name.includes('Minoan Palace of Zakros'),
      build: stop => onSite(stop, {
        name: 'Minoan Palace of Zakros parking', type: 'official', paid: false, walkMinutes: 2, reliability: 'high',
        summary: 'Парковка у входа в археологический комплекс.',
        crowding: 'В высокий сезон возможна загрузка, но посещение обычно короче пляжного дня.',
        notes: ['Не путать с парковкой для Gorge of the Dead.', 'Оставить воду в доступном месте и не оставлять ценности на виду.']
      })
    },
    {
      match: stop => stop.name.includes('Kato Zakros'),
      build: stop => onSite(stop, {
        name: 'Kato Zakros seafront parking', status: 'street', type: 'street', paid: false, walkMinutes: 2, reliability: 'medium',
        summary: 'Парковка вдоль подъездной дороги или на разрешённой площадке у набережной и таверн.',
        crowding: 'В обеденное время августа места у самой воды могут быть заняты.',
        notes: ['Не заезжать на пляж и не перекрывать разворот.', 'При отсутствии места пройти несколько минут от более широкой части дороги.']
      })
    },
    {
      match: stop => stop.name.includes('Kazarma Fortress'),
      build: stop => onSite(stop, {
        name: 'Parking near Kazarma Fortress', status: 'street', type: 'street', paid: false, walkMinutes: 4, reliability: 'low',
        summary: 'Искать разрешённое место на улицах ниже крепости; подъезд непосредственно к входу может быть тесным.',
        crowding: 'Утром шансы выше, но свободное место рядом не гарантировано.',
        notes: ['Не пытаться протискиваться в узкие переулки.', 'При необходимости оставить машину ближе к центру и пройти короткий подъём.', 'Проверить знаки и не блокировать частные въезды.']
      })
    },
    {
      match: stop => stop.name.includes('Lastros') || stop.name.includes('Mathena Olive Tree'),
      build: stop => onSite(stop, {
        name: 'Lastros village parking', status: 'street', type: 'street', paid: false, walkMinutes: 3, reliability: 'medium',
        summary: 'Парковка в деревне Lastros на широком разрешённом участке рядом с остановкой.',
        crowding: 'Обычно спокойно, но улицы узкие и рассчитаны прежде всего на местное движение.',
        notes: ['Не парковаться на повороте или перед воротами.', 'До Mathena Olive Tree пройти короткий участок пешком, если подъезд выглядит тесным.']
      })
    },
    {
      match: stop => stop.name === 'Pomegranate Garden Villa',
      build: stop => onSite(stop, {
        name: 'Pomegranate Garden Villa parking', status: 'street', type: 'street', paid: false, walkMinutes: 1, reliability: 'medium',
        navigationQuery: stop.navigationQuery,
        summary: 'Парковка у виллы или на ближайшем разрешённом участке улицы.',
        crowding: 'При заселении конкретное место зависит от занятости улицы.',
        notes: ['Сначала выгрузить багаж.', 'Уточнить у хозяина предпочтительное место, если оно не очевидно.']
      })
    }
  ];

  for (const day of itinerary.days) {
    for (const stop of day.stops || []) {
      if (stop.name === 'Vilnius Airport') continue;
      const rule = rules.find(item => item.match(stop, day));
      if (!rule) continue;
      stop.parking = rule.build(stop, day);
      stop.pointNavigationQuery = stop.navigationQuery;
      const primary = stop.parking?.primary;
      if (primary?.navigationQuery) stop.navigationQuery = primary.navigationQuery;
    }
  }
})();