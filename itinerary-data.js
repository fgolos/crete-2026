(() => {
  'use strict';

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
    return value;
  }

  window.CRETE_DATA = deepFreeze({
  "schemaVersion": 2,
  "trip": {
    "id": "crete-2026",
    "title": "Крит 2026",
    "startDate": "2026-08-11",
    "endDate": "2026-08-22",
    "timezone": "Europe/Athens",
    "locale": "ru-RU",
    "logistics": {
      "flights": [
        {
          "id": "flight-outbound",
          "direction": "outbound",
          "number": "HN 2321",
          "origin": "Vilnius",
          "destination": "Heraklion",
          "departureAt": "2026-08-11T05:15:00+03:00",
          "arrivalAt": "2026-08-11T08:35:00+03:00"
        },
        {
          "id": "flight-return",
          "direction": "return",
          "number": "HN 2322",
          "origin": "Heraklion",
          "destination": "Vilnius",
          "departureAt": "2026-08-22T17:55:00+03:00",
          "arrivalAt": "2026-08-22T21:20:00+03:00"
        }
      ],
      "carRental": {
        "category": "Station Wagon Manual",
        "pickupAt": "2026-08-11T10:00:00+03:00",
        "pickupApproximate": true,
        "returnDeadline": "2026-08-22T14:00:00+03:00"
      },
      "accommodations": [
        {
          "id": "stay-sitia",
          "baseName": "Sitia",
          "checkInAt": "2026-08-11T12:00:00+03:00",
          "checkOutAt": "2026-08-15T12:00:00+03:00"
        },
        {
          "id": "stay-platanes",
          "baseName": "Platanes",
          "checkInAt": "2026-08-15T13:00:00+03:00",
          "checkOutAt": "2026-08-22T11:00:00+03:00"
        }
      ]
    }
  },
  "regions": {
    "east": {
      "id": "east",
      "name": "Восточный Крит",
      "basePlaceName": "Sitia",
      "startDate": "2026-08-11",
      "endDate": "2026-08-15",
      "dayIds": [
        "2026-08-11",
        "2026-08-12",
        "2026-08-13",
        "2026-08-14",
        "2026-08-15"
      ]
    },
    "west": {
      "id": "west",
      "name": "Западный Крит",
      "basePlaceName": "Platanes",
      "startDate": "2026-08-15",
      "endDate": "2026-08-22",
      "dayIds": [
        "2026-08-15",
        "2026-08-16",
        "2026-08-17",
        "2026-08-18",
        "2026-08-19",
        "2026-08-20",
        "2026-08-21",
        "2026-08-22"
      ]
    }
  },
  "days": {
    "2026-08-11": {
      "id": "2026-08-11",
      "title": "Прилёт, Mochlos и Sitia",
      "status": "confirmed",
      "visitIds": [
        "2026-08-11-vilnius-airport",
        "2026-08-11-heraklion-international-airport-n-kazantzakis",
        "2026-08-11-mochlos",
        "2026-08-11-sitia-airbnb"
      ],
      "routeId": "route-2026-08-11",
      "sections": {
        "essentials": {
          "items": [
            "Главное: Mochlos, заселение и спокойный вечер в Sitia.",
            "Необязательно: купание в Mochlos или Sitia Beach.",
            "Первый ужин: Tavern - Restaurant Me Raki, без брони."
          ]
        },
        "food": {
          "items": [
            "Mochlos: обед в таверне у моря.",
            "Sitia: вечером Tavern - Restaurant Me Raki.",
            "Ориентир на общий ужин с вином для взрослых: около €100–110 с чаевыми."
          ]
        },
        "practical": {
          "items": [
            "После прилёта закладываем время на багаж, шаттл и оформление автомобиля.",
            "В Mochlos багаж полностью скрыть в машине; документы и ценности взять с собой.",
            "При задержке получения машины сокращаем Mochlos, а не устраиваем ралли."
          ]
        }
      },
      "mealSummary": "обед в Mochlos; ужин в Me Raki",
      "schedule": {
        "departure": {
          "start": "05:15",
          "end": null,
          "approximate": false
        },
        "finish": {
          "start": "15:00",
          "end": null,
          "approximate": false
        },
        "carReturnDeadline": null,
        "flight": null
      },
      "travelTotals": {
        "drivingDurationMinutes": 150,
        "distanceKm": 133,
        "approximate": false
      },
      "swimming": "Mochlos или Sitia Beach"
    },
    "2026-08-12": {
      "id": "2026-08-12",
      "title": "Toplou, Chiona, Itanos и Vai",
      "status": "confirmed",
      "visitIds": [
        "2026-08-12-sitia-airbnb",
        "2026-08-12-toplou-monastery-and-toplou-fabrica",
        "2026-08-12-paralia-chiona-hiona-taverna",
        "2026-08-12-ancient-city-itanos-erimoupolis-beach-parking",
        "2026-08-12-vai-beach",
        "2026-08-12-sitia-airbnb-2"
      ],
      "routeId": "route-2026-08-12",
      "sections": {
        "essentials": {
          "items": [
            "Главное: Toplou Monastery, Paralia Chiona и Vai Beach.",
            "Гибкая остановка: Ancient City Itanos; сокращаем первой при жаре или задержке.",
            "Вечер оставляем свободным: Vai может съесть запас времени."
          ]
        },
        "food": {
          "items": [
            "Toplou Fabrica: local food platter для всей семьи за €8 включён в подтверждённый план.",
            "Hiona Taverna: поздний обед рядом с водой.",
            "После возвращения в Sitia — без жёсткой вечерней брони."
          ]
        },
        "practical": {
          "items": [
            "Toplou Fabrica находится в комплексе Toplou Monastery; отдельного переезда нет.",
            "Toplou Fabrica подтверждена на 12 августа в 11:00 для 4 человек.",
            "Формат подтверждён: Classic Wine Tasting для Лиды; 40 мл вина для водителя; juice или sparkling water для двух детей; local food platter для семьи за €8.",
            "Организаторов попросили по возможности подробнее рассказать о сортах винограда, производственных процессах и характере вин.",
            "Ancient City Itanos и Erimoupolis beach используют одну парковку; до пляжа около 200–250 м.",
            "Vai Beach имеет официальную платную парковку."
          ]
        }
      },
      "mealSummary": "Toplou Fabrica tasting и local food platter; поздний обед в Hiona Taverna; ужин свободно",
      "schedule": {
        "departure": {
          "start": "09:45",
          "end": null,
          "approximate": false
        },
        "finish": {
          "start": "18:50",
          "end": null,
          "approximate": false
        },
        "carReturnDeadline": null,
        "flight": null
      },
      "travelTotals": {
        "drivingDurationMinutes": 115,
        "distanceKm": 67,
        "approximate": false
      },
      "swimming": "Chiona, Erimoupolis, Vai"
    },
    "2026-08-13": {
      "id": "2026-08-13",
      "title": "Ziros и Xerokampos",
      "status": "confirmed",
      "visitIds": [
        "2026-08-13-sitia-airbnb",
        "2026-08-13-ziros",
        "2026-08-13-mazida-ammos-beach",
        "2026-08-13-xerokampos-taverna-kostas",
        "2026-08-13-sitia-airbnb-2"
      ],
      "routeId": "route-2026-08-13",
      "sections": {
        "essentials": {
          "items": [
            "Главное: Ziros, панорамная дорога и Mazida Ammos beach.",
            "Второй пляж не добавляем.",
            "Inodion: стол для 4 человек подтверждён на 21:00. Забронирован ближайший доступный стол к морю."
          ]
        },
        "food": {
          "items": [
            "Ziros: кофе и короткая остановка.",
            "Taverna Kostas: поздний обед в Xerokampos.",
            "Inodion: бронь на 21:00 подтверждена; после возвращения остаётся время на отдых. Столы непосредственно у моря занимают в порядке живой очереди."
          ]
        },
        "practical": {
          "items": [
            "Дорога от Ziros к морю крутая и извилистая; фотоостановка только в безопасном месте.",
            "Mazida Ammos beach доступен по асфальту.",
            "Katsounaki / Krinakia полностью исключён.",
            "Если день сдвинется, не добавляем вечерние остановки до Inodion."
          ]
        }
      },
      "mealSummary": "кофе в Ziros; поздний обед в Taverna Kostas; Inodion в 21:00",
      "schedule": {
        "departure": {
          "start": "09:30",
          "end": null,
          "approximate": false
        },
        "finish": {
          "start": "17:50",
          "end": null,
          "approximate": false
        },
        "carReturnDeadline": null,
        "flight": null
      },
      "travelTotals": {
        "drivingDurationMinutes": 195,
        "distanceKm": 98,
        "approximate": false
      },
      "swimming": "Mazida Ammos beach"
    },
    "2026-08-14": {
      "id": "2026-08-14",
      "title": "Zakros и Kato Zakros",
      "status": "confirmed",
      "visitIds": [
        "2026-08-14-sitia-airbnb",
        "2026-08-14-zakros-springs-and-water-and-water-power-museum-of-zakros",
        "2026-08-14-minoan-palace-of-zakros",
        "2026-08-14-kato-zakros-nostos-beach",
        "2026-08-14-sitia-airbnb-2"
      ],
      "routeId": "route-2026-08-14",
      "sections": {
        "essentials": {
          "items": [
            "Главное: Zakros, Minoan Palace of Zakros и Kato Zakros.",
            "Необязательно: короткий взгляд на нижний выход Gorge of the Dead.",
            "Kipseli и последний ужин в Sitia — только по времени и силам."
          ]
        },
        "food": {
          "items": [
            "Nostos: основной кандидат для долгого обеда в Kato Zakros.",
            "Вечером в Sitia — без жёсткой брони."
          ]
        },
        "practical": {
          "items": [
            "Zakros Springs и Water & Water Power Museum объединены в одну остановку.",
            "На Minoan Palace of Zakros почти нет тени; взять воду и головные уборы.",
            "Нижний выход Gorge of the Dead — только короткий взгляд, без похода.",
            "Kipseli остаётся необязательным и не вынесен отдельной автомобильной точкой."
          ]
        }
      },
      "mealSummary": "обед в Nostos; ужин свободно в Sitia",
      "schedule": {
        "departure": {
          "start": "09:30",
          "end": null,
          "approximate": false
        },
        "finish": {
          "start": "18:05",
          "end": null,
          "approximate": false
        },
        "carReturnDeadline": null,
        "flight": null
      },
      "travelTotals": {
        "drivingDurationMinutes": 160,
        "distanceKm": 98,
        "approximate": false
      },
      "swimming": "Kato Zakros"
    },
    "2026-08-15": {
      "id": "2026-08-15",
      "title": "Kazarma, Lastros, переезд в Platanes и panigiri",
      "status": "confirmed",
      "visitIds": [
        "2026-08-15-sitia-airbnb",
        "2026-08-15-kazarma-fortress",
        "2026-08-15-sitia-airbnb-2",
        "2026-08-15-mathena-olive-tree-lastros",
        "2026-08-15-pomegranate-garden-villa",
        "2026-08-15-panigiri-village-tbd"
      ],
      "routeId": "route-2026-08-15",
      "sections": {
        "essentials": {
          "items": [
            "Главное: Kazarma Fortress, Mathena Olive Tree Lastros и переезд.",
            "Lastros — финальная остановка восточной части, но обед не задерживает трансфер.",
            "После Platanes — только заселение и отдых.",
            "Вечером — традиционный критский panigiri; конкретную деревню выберем ближе к дате."
          ]
        },
        "food": {
          "items": [
            "09:15–10:30: завтрак и завершение сборов в Sitia.",
            "Lastros: ранний обед в деревне.",
            "15 августа — большой праздник; при переполненных тавернах переносим обед дальше.",
            "На panigiri рассчитываем на деревенский ужин; перед выездом достаточно лёгкого перекуса."
          ]
        },
        "practical": {
          "items": [
            "Kazarma посещаем до окончательной загрузки машины.",
            "После крепости возвращаемся к жилью на завтрак и сборы.",
            "Mathena Olive Tree Lastros — точная промежуточная точка.",
            "Не задерживать переезд ради необязательных остановок.",
            "После заселения оставить несколько часов на отдых перед вечерним panigiri.",
            "Водитель не пьёт раки; точную афишу и парковку перепроверить за несколько дней."
          ]
        }
      },
      "mealSummary": "завтрак в Sitia; ранний обед в Lastros; ужин на panigiri",
      "schedule": {
        "departure": {
          "start": "08:30",
          "end": null,
          "approximate": false
        },
        "finish": {
          "start": "23:59",
          "end": null,
          "approximate": true
        },
        "carReturnDeadline": null,
        "flight": null
      },
      "travelTotals": {
        "drivingDurationMinutes": 200,
        "distanceKm": 166,
        "approximate": true
      },
      "swimming": "без пляжной остановки"
    },
    "2026-08-16": {
      "id": "2026-08-16",
      "title": "Поздний Rethymno и пляж",
      "status": "confirmed",
      "visitIds": [
        "2026-08-16-pomegranate-garden-villa-start",
        "2026-08-16-rethymno-old-town-and-venetian-harbour",
        "2026-08-16-platanes-beach",
        "2026-08-16-pomegranate-garden-villa-end"
      ],
      "routeId": "route-2026-08-16",
      "sections": {
        "essentials": {
          "items": [
            "Начало дня около 12:00.",
            "Rethymno — обед, знакомый город и море без гонки по достопримечательностям.",
            "Если покупок немного и не жарко — вернуться в Platanes пешком вдоль пляжа."
          ]
        },
        "food": {
          "items": [
            "Обед в Rethymno.",
            "Ужин свободно возле жилья."
          ]
        },
        "practical": {
          "items": [
            "Логичнее ехать в город автобусом.",
            "Керамические лавки можно посмотреть в Old Town вместо повторной поездки в Margarites.",
            "Пеший возврат зависит от жары, ветра и количества покупок."
          ]
        }
      },
      "mealSummary": "обед в Rethymno; ужин у базы",
      "schedule": {
        "departure": {
          "start": "12:00",
          "end": null,
          "approximate": true
        },
        "finish": {
          "start": "20:05",
          "end": null,
          "approximate": true
        },
        "carReturnDeadline": null,
        "flight": null
      },
      "travelTotals": {
        "drivingDurationMinutes": 0,
        "distanceKm": 0,
        "approximate": true
      },
      "swimming": "Platanes Beach"
    },
    "2026-08-17": {
      "id": "2026-08-17",
      "title": "Полный пляжный день №1",
      "status": "confirmed",
      "visitIds": [
        "2026-08-17-pomegranate-garden-villa-start",
        "2026-08-17-platanes-beach",
        "2026-08-17-pomegranate-garden-villa-end"
      ],
      "routeId": "route-2026-08-17",
      "sections": {
        "essentials": {
          "items": [
            "Весь день провести на пляже возле Airbnb.",
            "Без машины, экскурсий и дополнительных задач.",
            "Это один из двух защищённых пляжных дней."
          ]
        },
        "food": {
          "items": [
            "Обед и напитки — на пляже или рядом.",
            "Ужин после возвращения домой."
          ]
        },
        "practical": {
          "items": [
            "Утром занять лежаки.",
            "Если у Platanes красный флаг, южный маршрут через Sellia → Kato Rodakino → Korakas Beach остаётся только погодным запасным вариантом, а не экскурсией ради галочки."
          ]
        }
      },
      "mealSummary": "обед на пляже; ужин у базы",
      "schedule": {
        "departure": {
          "start": "09:15",
          "end": null,
          "approximate": true
        },
        "finish": {
          "start": "19:10",
          "end": null,
          "approximate": true
        },
        "carReturnDeadline": null,
        "flight": null
      },
      "travelTotals": {
        "drivingDurationMinutes": 0,
        "distanceKm": 0,
        "approximate": true
      },
      "swimming": "Platanes Beach"
    },
    "2026-08-18": {
      "id": "2026-08-18",
      "title": "Горные деревни Amari",
      "status": "confirmed",
      "visitIds": [
        "2026-08-18-pomegranate-garden-villa-start",
        "2026-08-18-apostoloi-amari",
        "2026-08-18-nefs-amari",
        "2026-08-18-opsigias",
        "2026-08-18-monastiraki-amari",
        "2026-08-18-meronas",
        "2026-08-18-elenes",
        "2026-08-18-gerakari",
        "2026-08-18-pomegranate-garden-villa-end"
      ],
      "routeId": "route-2026-08-18",
      "sections": {
        "essentials": {
          "items": [
            "Маршрут: Apostoloi → Nefs Amari → Opsigias → Monastiraki → Meronas → Elenes → Gerakari.",
            "Цель — жилой, нетуристический Крит: кафенио, разговоры и небольшие деревенские остановки.",
            "Ищем домашнее оливковое масло, раки, травы, мёд и другие локальные продукты."
          ]
        },
        "food": {
          "items": [
            "Обед — в Meronas или другой деревне, где найдётся живое подходящее место.",
            "Кофе и небольшие покупки — по ситуации, без жёстких броней."
          ]
        },
        "practical": {
          "items": [
            "Не ждать, что в каждой деревне будут магазины и производители открыты.",
            "Маршрут по времени приблизительный; любую промежуточную деревню можно пропустить, если день начинает превращаться в чек-лист."
          ]
        }
      },
      "mealSummary": "деревенский обед; кофе и локальные продукты по пути",
      "schedule": {
        "departure": {
          "start": "09:30",
          "end": null,
          "approximate": true
        },
        "finish": {
          "start": "18:15",
          "end": null,
          "approximate": true
        },
        "carReturnDeadline": null,
        "flight": null
      },
      "travelTotals": {
        "drivingDurationMinutes": 180,
        "distanceKm": 109,
        "approximate": true
      },
      "swimming": null
    },
    "2026-08-19": {
      "id": "2026-08-19",
      "title": "Organic Farmers’ Market, Stavros и Marathi",
      "status": "confirmed",
      "visitIds": [
        "2026-08-19-pomegranate-garden-villa-start",
        "2026-08-19-organic-farmers-market-rethymno",
        "2026-08-19-stavros-beach",
        "2026-08-19-kouzina-epe",
        "2026-08-19-marathi-beach",
        "2026-08-19-pomegranate-garden-villa-end"
      ],
      "routeId": "route-2026-08-19",
      "sections": {
        "essentials": {
          "items": [
            "Основной план: Organic Farmers’ Market → Stavros Beach → Kouzina EPE → Marathi Beach.",
            "После Organic Farmers’ Market можно по настроению свернуть дальнюю часть дня: вернуться в Airbnb и провести остаток дня на Platanes Beach.",
            "Если едем на Akrotiri, обед в Kouzina EPE обязателен."
          ]
        },
        "food": {
          "items": [
            "На Organic Farmers’ Market — свежие продукты по желанию.",
            "Основной обед — Kouzina EPE.",
            "При раннем возвращении после рынка — еда дома или возле Platanes Beach."
          ]
        },
        "practical": {
          "items": [
            "Решение продолжать ли после рынка на Akrotiri принимаем на месте по настроению, погоде и покупкам.",
            "Если купили много скоропортящихся овощей и фруктов, разумнее вернуться домой и убрать их в холодильник.",
            "Полный вариант — дальний день: ориентировочно около 180 км и примерно четыре часа транспортного времени.",
            "Не добавляем прогулку по Chania: город уже хорошо знаком и не является целью этого дня."
          ]
        }
      },
      "mealSummary": "Organic Farmers’ Market; обед в Kouzina EPE; при сокращении дня — еда у базы",
      "schedule": {
        "departure": {
          "start": "10:20",
          "end": null,
          "approximate": true
        },
        "finish": {
          "start": "20:50",
          "end": null,
          "approximate": true
        },
        "carReturnDeadline": null,
        "flight": null
      },
      "travelTotals": {
        "drivingDurationMinutes": 245,
        "distanceKm": 182,
        "approximate": true
      },
      "swimming": "Stavros Beach и Marathi Beach; Platanes Beach при сокращении дня"
    },
    "2026-08-20": {
      "id": "2026-08-20",
      "title": "Laiki, Eleutherna и Panormo по желанию",
      "status": "confirmed",
      "visitIds": [
        "2026-08-20-pomegranate-garden-villa-start",
        "2026-08-20-laiki-market-rethymno",
        "2026-08-20-eleftherna",
        "2026-08-20-panormo",
        "2026-08-20-pomegranate-garden-villa-end"
      ],
      "routeId": "route-2026-08-20",
      "sections": {
        "essentials": {
          "items": [
            "Laiki Market обязателен: приехать рано и оставить нескоропортящиеся покупки в машине.",
            "Eleutherna Archaeological Museum — главная культурная остановка дня.",
            "Panormo — только короткая необязательная проверка, не цель путешествия."
          ]
        },
        "food": {
          "items": [
            "После Laiki можно ехать дальше без возвращения домой.",
            "Обед — после музея или в Panormo по ситуации."
          ]
        },
        "practical": {
          "items": [
            "Margarites и Arkadi Monastery исключены: семья уже была.",
            "Вечером начать сборы и убрать большую часть вещей.",
            "Не оставлять упаковку чемоданов на 22 августа."
          ]
        }
      },
      "mealSummary": "обед после музея или в Panormo",
      "schedule": {
        "departure": {
          "start": "07:45",
          "end": null,
          "approximate": true
        },
        "finish": {
          "start": "16:45",
          "end": null,
          "approximate": true
        },
        "carReturnDeadline": null,
        "flight": null
      },
      "travelTotals": {
        "drivingDurationMinutes": 140,
        "distanceKm": 85,
        "approximate": true
      },
      "swimming": "Panormo по желанию"
    },
    "2026-08-21": {
      "id": "2026-08-21",
      "title": "Полный пляжный день №2",
      "status": "confirmed",
      "visitIds": [
        "2026-08-21-pomegranate-garden-villa-start",
        "2026-08-21-platanes-beach",
        "2026-08-21-pomegranate-garden-villa-end"
      ],
      "routeId": "route-2026-08-21",
      "sections": {
        "essentials": {
          "items": [
            "Утром практически закончить сборы.",
            "После 09:00 — пляж возле Airbnb до вечера.",
            "Без машины, поездок и переноса сюда несостоявшихся экскурсий."
          ]
        },
        "food": {
          "items": [
            "Обед на пляже или рядом.",
            "Последний ужин — спокойно возле жилья."
          ]
        },
        "practical": {
          "items": [
            "К вечеру 20 августа уже должна быть собрана основная часть вещей.",
            "Оставить отдельную компактную сумку на последнее утро и дорогу.",
            "При красном флаге южный Korakas Beach остаётся только погодным резервом."
          ]
        }
      },
      "mealSummary": "обед на пляже; последний ужин у базы",
      "schedule": {
        "departure": {
          "start": "08:00",
          "end": null,
          "approximate": true
        },
        "finish": {
          "start": "19:10",
          "end": null,
          "approximate": true
        },
        "carReturnDeadline": null,
        "flight": null
      },
      "travelTotals": {
        "drivingDurationMinutes": 0,
        "distanceKm": 0,
        "approximate": true
      },
      "swimming": "Platanes Beach"
    },
    "2026-08-22": {
      "id": "2026-08-22",
      "title": "Расслабленное утро и вылет",
      "status": "confirmed",
      "visitIds": [
        "2026-08-22-pomegranate-garden-villa",
        "2026-08-22-gomega-car-rentals-heraklion",
        "2026-08-22-heraklion-international-airport-n-kazantzakis"
      ],
      "routeId": "route-2026-08-22",
      "sections": {
        "essentials": {
          "items": [
            "Утро оставить спокойным: завтрак и расслабон без больших сборов.",
            "Выезд из Platanes около 10:30–10:45.",
            "Автомобиль вернуть до 14:00; рейс HN 2322 вылетает в 17:55."
          ]
        },
        "food": {
          "items": [
            "Нормальный завтрак дома.",
            "Перекус после возврата машины или в аэропорту."
          ]
        },
        "practical": {
          "items": [
            "Основные сборы закончены утром 21 августа.",
            "Перед выездом проверить только документы, ручную кладь, холодильник и зарядки.",
            "Не планировать остановки и достопримечательности по пути в аэропорт.",
            "Накануне уточнить у GoMega точную процедуру возврата."
          ]
        }
      },
      "mealSummary": "завтрак дома; перекус в аэропорту",
      "schedule": {
        "departure": {
          "start": "10:30",
          "end": "10:45",
          "approximate": false
        },
        "finish": null,
        "carReturnDeadline": "14:00",
        "flight": {
          "number": "HN 2322",
          "departureTime": "17:55"
        }
      },
      "travelTotals": {
        "drivingDurationMinutes": 75,
        "distanceKm": 80,
        "approximate": true
      },
      "swimming": null
    }
  },
  "places": {
    "vilnius-airport": {
      "id": "vilnius-airport",
      "name": "Vilnius Airport",
      "coordinates": {
        "lat": 54.6341,
        "lon": 25.2858
      },
      "navigationQuery": "54.6341,25.2858",
      "transportMode": "driving"
    },
    "heraklion-international-airport-n-kazantzakis": {
      "id": "heraklion-international-airport-n-kazantzakis",
      "name": "Heraklion International Airport N. Kazantzakis",
      "coordinates": {
        "lat": 35.33972,
        "lon": 25.18028
      },
      "navigationQuery": "35.33972,25.18028",
      "transportMode": "flight"
    },
    "mochlos": {
      "id": "mochlos",
      "name": "Mochlos",
      "coordinates": {
        "lat": 35.18377,
        "lon": 25.9054
      },
      "navigationQuery": "35.18377,25.9054",
      "transportMode": "driving"
    },
    "sitia-airbnb": {
      "id": "sitia-airbnb",
      "name": "Sitia Airbnb",
      "coordinates": {
        "lat": 35.20981541927463,
        "lon": 26.1065768823924
      },
      "navigationQuery": "35.20939,26.10724",
      "transportMode": "driving"
    },
    "toplou-monastery-and-toplou-fabrica": {
      "id": "toplou-monastery-and-toplou-fabrica",
      "name": "Toplou Monastery & Toplou Fabrica",
      "coordinates": {
        "lat": 35.221552,
        "lon": 26.21605
      },
      "navigationQuery": "35.221552,26.21605",
      "transportMode": "driving"
    },
    "paralia-chiona-hiona-taverna": {
      "id": "paralia-chiona-hiona-taverna",
      "name": "Paralia Chiona / Hiona Taverna",
      "coordinates": {
        "lat": 35.19776,
        "lon": 26.27745
      },
      "navigationQuery": "35.19776,26.27745",
      "transportMode": "driving"
    },
    "ancient-city-itanos-erimoupolis-beach-parking": {
      "id": "ancient-city-itanos-erimoupolis-beach-parking",
      "name": "Ancient City Itanos / Erimoupolis beach parking",
      "coordinates": {
        "lat": 35.264308,
        "lon": 26.262072
      },
      "navigationQuery": "35.264308,26.262072",
      "transportMode": "driving"
    },
    "vai-beach": {
      "id": "vai-beach",
      "name": "Vai Beach",
      "coordinates": {
        "lat": 35.2544,
        "lon": 26.26493
      },
      "navigationQuery": "35.25315,26.26431",
      "transportMode": "driving"
    },
    "ziros": {
      "id": "ziros",
      "name": "Ziros",
      "coordinates": {
        "lat": 35.07531,
        "lon": 26.13951
      },
      "navigationQuery": "35.07531,26.13951",
      "transportMode": "driving"
    },
    "mazida-ammos-beach": {
      "id": "mazida-ammos-beach",
      "name": "Mazida Ammos beach",
      "coordinates": {
        "lat": 35.03626,
        "lon": 26.22006
      },
      "navigationQuery": "35.03626,26.22006",
      "transportMode": "driving"
    },
    "xerokampos-taverna-kostas": {
      "id": "xerokampos-taverna-kostas",
      "name": "Xerokampos / Taverna Kostas",
      "coordinates": {
        "lat": 35.04422,
        "lon": 26.22672
      },
      "navigationQuery": "35.04422,26.22672",
      "transportMode": "driving"
    },
    "zakros-springs-and-water-and-water-power-museum-of-zakros": {
      "id": "zakros-springs-and-water-and-water-power-museum-of-zakros",
      "name": "Zakros Springs & Water & Water Power Museum of Zakros",
      "coordinates": {
        "lat": 35.11312,
        "lon": 26.218
      },
      "navigationQuery": "35.11312,26.218",
      "transportMode": "driving"
    },
    "minoan-palace-of-zakros": {
      "id": "minoan-palace-of-zakros",
      "name": "Minoan Palace of Zakros",
      "coordinates": {
        "lat": 35.09806,
        "lon": 26.26139
      },
      "navigationQuery": "35.09806,26.26139",
      "transportMode": "driving"
    },
    "kato-zakros-nostos-beach": {
      "id": "kato-zakros-nostos-beach",
      "name": "Kato Zakros / Nostos / beach",
      "coordinates": {
        "lat": 35.09765,
        "lon": 26.26355
      },
      "navigationQuery": "35.09765,26.26355",
      "transportMode": "driving"
    },
    "kazarma-fortress": {
      "id": "kazarma-fortress",
      "name": "Kazarma Fortress",
      "coordinates": {
        "lat": 35.21114,
        "lon": 26.10752
      },
      "navigationQuery": "35.21114,26.10752",
      "transportMode": "driving"
    },
    "mathena-olive-tree-lastros": {
      "id": "mathena-olive-tree-lastros",
      "name": "Mathena Olive Tree Lastros",
      "coordinates": {
        "lat": 35.1411116,
        "lon": 25.900172
      },
      "navigationQuery": "35.1411116,25.900172",
      "transportMode": "driving"
    },
    "pomegranate-garden-villa": {
      "id": "pomegranate-garden-villa",
      "name": "Pomegranate Garden Villa",
      "coordinates": {
        "lat": 35.36855713304881,
        "lon": 24.530239843450914
      },
      "navigationQuery": "Lasithiou 4, Rethymno 741 50, Greece",
      "transportMode": "driving"
    },
    "rethymno-old-town-and-venetian-harbour": {
      "id": "rethymno-old-town-and-venetian-harbour",
      "name": "Rethymno Old Town & Venetian Harbour",
      "coordinates": {
        "lat": 35.36955,
        "lon": 24.47383
      },
      "navigationQuery": "Rethymno Old Town, Greece",
      "transportMode": "driving"
    },
    "platanes-beach": {
      "id": "platanes-beach",
      "name": "Platanes Beach",
      "coordinates": {
        "lat": 35.3713,
        "lon": 24.5279
      },
      "navigationQuery": "Platanes Beach, Rethymno, Greece",
      "transportMode": "driving"
    },
    "marathi-beach": {
      "id": "marathi-beach",
      "name": "Marathi Beach",
      "coordinates": {
        "lat": 35.5057,
        "lon": 24.1691
      },
      "navigationQuery": "Marathi Beach, Crete, Greece",
      "transportMode": "driving"
    },
    "eleftherna": {
      "id": "eleftherna",
      "name": "Eleutherna Archaeological Museum",
      "coordinates": {
        "lat": 35.3246,
        "lon": 24.6754
      },
      "navigationQuery": "Museum of Ancient Eleutherna, Crete, Greece",
      "transportMode": "driving"
    },
    "panormo": {
      "id": "panormo",
      "name": "Panormo",
      "coordinates": {
        "lat": 35.4173,
        "lon": 24.6912
      },
      "navigationQuery": "Panormo, Rethymno, Greece",
      "transportMode": "driving"
    },
    "gomega-car-rentals-heraklion": {
      "id": "gomega-car-rentals-heraklion",
      "name": "GoMega Car Rentals — Heraklion",
      "coordinates": {
        "lat": 35.3397,
        "lon": 25.1685
      },
      "navigationQuery": "GoMega Car Rentals, Leoforos Ikarou 83, Nea Alikarnassos, Greece",
      "transportMode": "driving"
    },
    "toplou-fabrica": {
      "id": "toplou-fabrica",
      "name": "Toplou Fabrica",
      "coordinates": {
        "lat": null,
        "lon": null
      },
      "navigationQuery": "Toplou Fabrica",
      "transportMode": "driving"
    },
    "tavern-restaurant-me-raki": {
      "id": "tavern-restaurant-me-raki",
      "name": "Tavern - Restaurant Me Raki",
      "coordinates": {
        "lat": null,
        "lon": null
      },
      "navigationQuery": "Tavern - Restaurant Me Raki",
      "transportMode": "driving"
    },
    "inodion": {
      "id": "inodion",
      "name": "Inodion",
      "coordinates": {
        "lat": null,
        "lon": null
      },
      "navigationQuery": "Inodion",
      "transportMode": "driving"
    },
    "panigiri-village-tbd": {
      "id": "panigiri-village-tbd",
      "name": "Panigiri — деревня уточняется",
      "coordinates": {
        "lat": null,
        "lon": null
      },
      "navigationQuery": "Rethymno panigiri 15 August 2026",
      "transportMode": "driving"
    },
    "organic-farmers-market-rethymno": {
      "id": "organic-farmers-market-rethymno",
      "name": "Organic Farmers’ Market Rethymno",
      "coordinates": {
        "lat": 35.366,
        "lon": 24.471
      },
      "navigationQuery": "Koumoundourou Street, Rethymno, Greece",
      "transportMode": "driving"
    },
    "laiki-market-rethymno": {
      "id": "laiki-market-rethymno",
      "name": "Laiki Market Rethymno",
      "coordinates": {
        "lat": 35.366,
        "lon": 24.4718
      },
      "navigationQuery": "Municipal Garden, Rethymno, Greece",
      "transportMode": "driving"
    },
    "stavros-beach": {
      "id": "stavros-beach",
      "name": "Stavros Beach",
      "coordinates": {
        "lat": 35.5914,
        "lon": 24.0955
      },
      "navigationQuery": "Stavros Beach, Akrotiri, Crete, Greece",
      "transportMode": "driving"
    },
    "kouzina-epe": {
      "id": "kouzina-epe",
      "name": "Kouzina EPE",
      "coordinates": {
        "lat": null,
        "lon": null
      },
      "navigationQuery": "Kouzina EPE, Chania, Greece",
      "transportMode": "driving"
    },
    "apostoloi-amari": {
      "id": "apostoloi-amari",
      "name": "Apostoloi",
      "coordinates": {
        "lat": 35.25455,
        "lon": 24.62762
      },
      "navigationQuery": "Apostoloi, Amari, Crete, Greece",
      "transportMode": "driving"
    },
    "nefs-amari": {
      "id": "nefs-amari",
      "name": "Nefs Amari",
      "coordinates": {
        "lat": 35.23333,
        "lon": 24.65
      },
      "navigationQuery": "Nefs Amari, Crete, Greece",
      "transportMode": "driving"
    },
    "opsigias": {
      "id": "opsigias",
      "name": "Opsigias",
      "coordinates": {
        "lat": 35.22732,
        "lon": 24.65987
      },
      "navigationQuery": "Opsigias, Amari, Crete, Greece",
      "transportMode": "driving"
    },
    "monastiraki-amari": {
      "id": "monastiraki-amari",
      "name": "Monastiraki",
      "coordinates": {
        "lat": 35.22788,
        "lon": 24.66781
      },
      "navigationQuery": "Monastiraki, Amari, Crete, Greece",
      "transportMode": "driving"
    },
    "meronas": {
      "id": "meronas",
      "name": "Meronas",
      "coordinates": {
        "lat": 35.23379,
        "lon": 24.6292
      },
      "navigationQuery": "Meronas, Amari, Crete, Greece",
      "transportMode": "driving"
    },
    "elenes": {
      "id": "elenes",
      "name": "Elenes",
      "coordinates": {
        "lat": 35.2198,
        "lon": 24.61411
      },
      "navigationQuery": "Elenes, Amari, Crete, Greece",
      "transportMode": "driving"
    },
    "gerakari": {
      "id": "gerakari",
      "name": "Gerakari",
      "coordinates": {
        "lat": 35.21422,
        "lon": 24.60925
      },
      "navigationQuery": "Gerakari, Amari, Crete, Greece",
      "transportMode": "driving"
    }
  },
  "visits": {
    "2026-08-11-vilnius-airport": {
      "id": "2026-08-11-vilnius-airport",
      "dayId": "2026-08-11",
      "placeId": "vilnius-airport",
      "sequence": 0,
      "role": "Вылет в Heraklion",
      "timing": {
        "start": "05:15",
        "end": null,
        "approximate": false
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "Автомобильная карта начинается в Heraklion.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": false
      },
      "durationKind": "departure"
    },
    "2026-08-11-heraklion-international-airport-n-kazantzakis": {
      "id": "2026-08-11-heraklion-international-airport-n-kazantzakis",
      "dayId": "2026-08-11",
      "placeId": "heraklion-international-airport-n-kazantzakis",
      "sequence": 1,
      "role": "Прилёт, багаж, шаттл и машина",
      "timing": {
        "start": "08:35",
        "end": "10:30",
        "approximate": false
      },
      "durationMinutes": 115,
      "inboundTravel": {
        "mode": "flight",
        "durationMinutes": 200,
        "distanceKm": 2144,
        "status": "standard"
      },
      "note": "Выезд после оформления аренды.",
      "parking": {
        "primaryId": "heraklion-airport-gomega",
        "primaryOverrides": {
          "status": "on-site",
          "walkMinutes": 0,
          "summary": "Место получения автомобиля определяется инструкциями прокатчика и шаттлом."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-11-mochlos": {
      "id": "2026-08-11-mochlos",
      "dayId": "2026-08-11",
      "placeId": "mochlos",
      "sequence": 2,
      "role": "Прогулка, обед, возможное купание",
      "timing": {
        "start": "12:15",
        "end": "14:15",
        "approximate": false
      },
      "durationMinutes": 120,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 105,
        "distanceKm": 98,
        "status": "standard"
      },
      "note": "Не затягивать при позднем выезде.",
      "parking": {
        "primaryId": "mochlos-village",
        "primaryOverrides": {
          "status": "street",
          "walkMinutes": 3,
          "summary": "Искать разрешённое место на въезде в деревню или вдоль дороги до набережной."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-11-sitia-airbnb": {
      "id": "2026-08-11-sitia-airbnb",
      "dayId": "2026-08-11",
      "placeId": "sitia-airbnb",
      "sequence": 3,
      "role": "База 11–15 августа",
      "timing": {
        "start": "15:00",
        "end": null,
        "approximate": false
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 45,
        "distanceKm": 35,
        "status": "standard"
      },
      "note": "После 18:30 — Marina Sitia, набережная, Sitia Beach по силам и Me Raki.",
      "parking": {
        "primaryId": "sitia-port",
        "primaryOverrides": {},
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "check-in-rest"
    },
    "2026-08-12-sitia-airbnb": {
      "id": "2026-08-12-sitia-airbnb",
      "dayId": "2026-08-12",
      "placeId": "sitia-airbnb",
      "sequence": 0,
      "role": "Выезд",
      "timing": {
        "start": "09:45",
        "end": null,
        "approximate": false
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "Старт можно заменить на адрес жилья.",
      "parking": {
        "primaryId": "sitia-port",
        "primaryOverrides": {},
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "start"
    },
    "2026-08-12-toplou-monastery-and-toplou-fabrica": {
      "id": "2026-08-12-toplou-monastery-and-toplou-fabrica",
      "dayId": "2026-08-12",
      "placeId": "toplou-monastery-and-toplou-fabrica",
      "sequence": 1,
      "role": "Монастырь, музей и подтверждённая семейная дегустация",
      "timing": {
        "start": "10:10",
        "end": "12:10",
        "approximate": false
      },
      "durationMinutes": 120,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 25,
        "distanceKm": 15,
        "status": "standard"
      },
      "note": "10:15–10:50 монастырь; Toplou Fabrica подтверждена на 11:00 для 4 человек.",
      "parking": {
        "primaryId": "toplou-monastery",
        "primaryOverrides": {
          "status": "on-site",
          "walkMinutes": 1,
          "summary": "Парковка непосредственно у комплекса Toplou Monastery."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-12-paralia-chiona-hiona-taverna": {
      "id": "2026-08-12-paralia-chiona-hiona-taverna",
      "dayId": "2026-08-12",
      "placeId": "paralia-chiona-hiona-taverna",
      "sequence": 2,
      "role": "Поздний обед и купание",
      "timing": {
        "start": "12:30",
        "end": "15:10",
        "approximate": false
      },
      "durationMinutes": 160,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 20,
        "distanceKm": 11,
        "status": "standard"
      },
      "note": "Главная длинная остановка.",
      "parking": {
        "primaryId": "chiona-hiona",
        "primaryOverrides": {
          "status": "on-site",
          "walkMinutes": 1,
          "summary": "Парковка у таверны и пляжа, рядом с конечной точкой подъезда."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-12-ancient-city-itanos-erimoupolis-beach-parking": {
      "id": "2026-08-12-ancient-city-itanos-erimoupolis-beach-parking",
      "dayId": "2026-08-12",
      "placeId": "ancient-city-itanos-erimoupolis-beach-parking",
      "sequence": 3,
      "role": "Археология и короткое купание",
      "timing": {
        "start": "15:35",
        "end": "16:35",
        "approximate": false
      },
      "durationMinutes": 60,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 25,
        "distanceKm": 14,
        "status": "standard"
      },
      "note": "При жаре сокращаем или пропускаем руины.",
      "parking": {
        "primaryId": "itanos-erimoupolis",
        "primaryOverrides": {
          "status": "on-site",
          "walkMinutes": 3,
          "summary": "Общая точка парковки для Ancient City Itanos и Erimoupolis beach."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-12-vai-beach": {
      "id": "2026-08-12-vai-beach",
      "dayId": "2026-08-12",
      "placeId": "vai-beach",
      "sequence": 4,
      "role": "Пальмовый лес и вечерний пляж",
      "timing": {
        "start": "16:45",
        "end": "18:15",
        "approximate": false
      },
      "durationMinutes": 90,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 10,
        "distanceKm": 3,
        "status": "standard"
      },
      "note": "После Vai не ставим обязательный ужин.",
      "parking": {
        "primaryId": "vai-main",
        "primaryOverrides": {
          "status": "recommended",
          "walkMinutes": 3,
          "summary": "Въезд в основную организованную парковку перед Vai Beach."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-12-sitia-airbnb-2": {
      "id": "2026-08-12-sitia-airbnb-2",
      "dayId": "2026-08-12",
      "placeId": "sitia-airbnb",
      "sequence": 5,
      "role": "Возвращение",
      "timing": {
        "start": "18:50",
        "end": null,
        "approximate": false
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 35,
        "distanceKm": 24,
        "status": "standard"
      },
      "note": "Лёгкий ужин по аппетиту.",
      "parking": {
        "primaryId": "sitia-port",
        "primaryOverrides": {},
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "finish"
    },
    "2026-08-13-sitia-airbnb": {
      "id": "2026-08-13-sitia-airbnb",
      "dayId": "2026-08-13",
      "placeId": "sitia-airbnb",
      "sequence": 0,
      "role": "Выезд",
      "timing": {
        "start": "09:30",
        "end": null,
        "approximate": false
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "Заправиться и взять воду.",
      "parking": {
        "primaryId": "sitia-port",
        "primaryOverrides": {},
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "start"
    },
    "2026-08-13-ziros": {
      "id": "2026-08-13-ziros",
      "dayId": "2026-08-13",
      "placeId": "ziros",
      "sequence": 1,
      "role": "Кофе и короткая прогулка",
      "timing": {
        "start": "10:25",
        "end": "10:55",
        "approximate": false
      },
      "durationMinutes": 30,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 55,
        "distanceKm": 31,
        "status": "standard"
      },
      "note": "Перед панорамным спуском.",
      "parking": {
        "primaryId": "ziros-village",
        "primaryOverrides": {
          "status": "street",
          "walkMinutes": 2,
          "summary": "Короткая уличная парковка в центре деревни или рядом с кафе."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-13-mazida-ammos-beach": {
      "id": "2026-08-13-mazida-ammos-beach",
      "dayId": "2026-08-13",
      "placeId": "mazida-ammos-beach",
      "sequence": 2,
      "role": "Главный пляж",
      "timing": {
        "start": "11:30",
        "end": "14:45",
        "approximate": false
      },
      "durationMinutes": 195,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 35,
        "distanceKm": 13,
        "status": "standard"
      },
      "note": "Последний участок асфальтирован.",
      "parking": {
        "primaryId": "mazida-ammos",
        "primaryOverrides": {
          "status": "on-site",
          "walkMinutes": 2,
          "summary": "Парковка у подъезда к пляжу на разрешённой ровной площадке."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-13-xerokampos-taverna-kostas": {
      "id": "2026-08-13-xerokampos-taverna-kostas",
      "dayId": "2026-08-13",
      "placeId": "xerokampos-taverna-kostas",
      "sequence": 3,
      "role": "Поздний обед",
      "timing": {
        "start": "14:55",
        "end": "16:15",
        "approximate": false
      },
      "durationMinutes": 80,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 10,
        "distanceKm": 2,
        "status": "standard"
      },
      "note": "Проверить открытие и столик.",
      "parking": {
        "primaryId": "taverna-kostas",
        "primaryOverrides": {
          "status": "on-site",
          "walkMinutes": 1,
          "summary": "Парковка рядом с Taverna Kostas или на ближайшем разрешённом участке дороги."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-13-sitia-airbnb-2": {
      "id": "2026-08-13-sitia-airbnb-2",
      "dayId": "2026-08-13",
      "placeId": "sitia-airbnb",
      "sequence": 4,
      "role": "Возвращение и отдых",
      "timing": {
        "start": "17:50",
        "end": null,
        "approximate": false
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 95,
        "distanceKm": 52,
        "status": "standard"
      },
      "note": "Inodion подтверждён на 21:00.",
      "parking": {
        "primaryId": "sitia-port",
        "primaryOverrides": {},
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "finish"
    },
    "2026-08-14-sitia-airbnb": {
      "id": "2026-08-14-sitia-airbnb",
      "dayId": "2026-08-14",
      "placeId": "sitia-airbnb",
      "sequence": 0,
      "role": "Выезд",
      "timing": {
        "start": "09:30",
        "end": null,
        "approximate": false
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "Заправиться и взять воду.",
      "parking": {
        "primaryId": "sitia-port",
        "primaryOverrides": {},
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "start"
    },
    "2026-08-14-zakros-springs-and-water-and-water-power-museum-of-zakros": {
      "id": "2026-08-14-zakros-springs-and-water-and-water-power-museum-of-zakros",
      "dayId": "2026-08-14",
      "placeId": "zakros-springs-and-water-and-water-power-museum-of-zakros",
      "sequence": 1,
      "role": "Источники, мельницы, музей и деревня",
      "timing": {
        "start": "10:30",
        "end": "11:30",
        "approximate": false
      },
      "durationMinutes": 60,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 60,
        "distanceKm": 44,
        "status": "standard"
      },
      "note": "Короткая прогулка.",
      "parking": {
        "primaryId": "zakros-village",
        "primaryOverrides": {
          "status": "street",
          "walkMinutes": 3,
          "summary": "Парковка в деревне Zakros рядом с источниками и музеем, где разрешено и не мешает местным."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-14-minoan-palace-of-zakros": {
      "id": "2026-08-14-minoan-palace-of-zakros",
      "dayId": "2026-08-14",
      "placeId": "minoan-palace-of-zakros",
      "sequence": 2,
      "role": "Археологический участок",
      "timing": {
        "start": "11:50",
        "end": "13:05",
        "approximate": false
      },
      "durationMinutes": 75,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 20,
        "distanceKm": 8,
        "status": "standard"
      },
      "note": "Мало тени.",
      "parking": {
        "primaryId": "minoan-palace-zakros",
        "primaryOverrides": {
          "status": "on-site",
          "walkMinutes": 2,
          "summary": "Парковка у входа в археологический комплекс."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-14-kato-zakros-nostos-beach": {
      "id": "2026-08-14-kato-zakros-nostos-beach",
      "dayId": "2026-08-14",
      "placeId": "kato-zakros-nostos-beach",
      "sequence": 3,
      "role": "Обед, пляж и купание",
      "timing": {
        "start": "13:10",
        "end": "16:50",
        "approximate": false
      },
      "durationMinutes": 220,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 5,
        "distanceKm": 1,
        "status": "standard"
      },
      "note": "Около 17:00 — короткий взгляд на Gorge of the Dead по силам.",
      "parking": {
        "primaryId": "kato-zakros-seafront",
        "primaryOverrides": {
          "status": "street",
          "walkMinutes": 2,
          "summary": "Парковка вдоль подъездной дороги или на разрешённой площадке у набережной и таверн."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-14-sitia-airbnb-2": {
      "id": "2026-08-14-sitia-airbnb-2",
      "dayId": "2026-08-14",
      "placeId": "sitia-airbnb",
      "sequence": 4,
      "role": "Возвращение",
      "timing": {
        "start": "18:05",
        "end": null,
        "approximate": false
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 75,
        "distanceKm": 45,
        "status": "standard"
      },
      "note": "Kipseli и ужин только по времени и силам.",
      "parking": {
        "primaryId": "sitia-port",
        "primaryOverrides": {},
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "finish"
    },
    "2026-08-15-sitia-airbnb": {
      "id": "2026-08-15-sitia-airbnb",
      "dayId": "2026-08-15",
      "placeId": "sitia-airbnb",
      "sequence": 0,
      "role": "Начало дня",
      "timing": {
        "start": "08:30",
        "end": null,
        "approximate": false
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "После крепости возвращаемся к жилью.",
      "parking": {
        "primaryId": "sitia-port",
        "primaryOverrides": {},
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "start"
    },
    "2026-08-15-kazarma-fortress": {
      "id": "2026-08-15-kazarma-fortress",
      "dayId": "2026-08-15",
      "placeId": "kazarma-fortress",
      "sequence": 1,
      "role": "Крепость изнутри",
      "timing": {
        "start": "08:35",
        "end": "09:20",
        "approximate": false
      },
      "durationMinutes": 45,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 5,
        "distanceKm": 1,
        "status": "standard"
      },
      "note": "Утренний визит.",
      "parking": {
        "primaryId": "kazarma-lower-streets",
        "primaryOverrides": {
          "status": "street",
          "walkMinutes": 4,
          "summary": "Искать разрешённое место на улицах ниже крепости; подъезд непосредственно к входу может быть тесным."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-15-sitia-airbnb-2": {
      "id": "2026-08-15-sitia-airbnb-2",
      "dayId": "2026-08-15",
      "placeId": "sitia-airbnb",
      "sequence": 2,
      "role": "Завтрак, сборы и загрузка",
      "timing": {
        "start": "09:25",
        "end": "10:40",
        "approximate": false
      },
      "durationMinutes": 75,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 5,
        "distanceKm": 1,
        "status": "standard"
      },
      "note": "Окончательный выезд около 10:30.",
      "parking": {
        "primaryId": "sitia-port",
        "primaryOverrides": {},
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-15-mathena-olive-tree-lastros": {
      "id": "2026-08-15-mathena-olive-tree-lastros",
      "dayId": "2026-08-15",
      "placeId": "mathena-olive-tree-lastros",
      "sequence": 3,
      "role": "Древняя олива, прогулка и ранний обед",
      "timing": {
        "start": "11:20",
        "end": "12:45",
        "approximate": false
      },
      "durationMinutes": 85,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 40,
        "distanceKm": 34,
        "status": "standard"
      },
      "note": "При очередях переносим обед.",
      "parking": {
        "primaryId": "lastros-village",
        "primaryOverrides": {
          "status": "street",
          "walkMinutes": 3,
          "summary": "Парковка в деревне Lastros на широком разрешённом участке рядом с остановкой."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-15-pomegranate-garden-villa": {
      "id": "2026-08-15-pomegranate-garden-villa",
      "dayId": "2026-08-15",
      "placeId": "pomegranate-garden-villa",
      "sequence": 4,
      "role": "Заселение и отдых",
      "timing": {
        "start": "15:15",
        "end": null,
        "approximate": false
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 150,
        "distanceKm": 130,
        "status": "standard"
      },
      "note": "Airbnb в Platanes: Lasithiou 4, Rethymno 741 50, Greece.",
      "parking": {
        "primaryId": "pomegranate-villa",
        "primaryOverrides": {
          "status": "street",
          "walkMinutes": 1,
          "summary": "Парковка у виллы или на ближайшем разрешённом участке улицы."
        },
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "finish"
    },
    "2026-08-22-pomegranate-garden-villa": {
      "id": "2026-08-22-pomegranate-garden-villa",
      "dayId": "2026-08-22",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Выселение и выезд",
      "timing": {
        "start": "10:30",
        "end": "10:45",
        "approximate": false
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "Выселение до 11:00; выезжаем раньше предельного времени.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "start"
    },
    "2026-08-22-gomega-car-rentals-heraklion": {
      "id": "2026-08-22-gomega-car-rentals-heraklion",
      "dayId": "2026-08-22",
      "placeId": "gomega-car-rentals-heraklion",
      "sequence": 1,
      "role": "Дозаправка по пути, возврат автомобиля и шаттл",
      "timing": {
        "start": "12:15",
        "end": "13:30",
        "approximate": false
      },
      "durationMinutes": 75,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 75,
        "distanceKm": 80,
        "status": "standard"
      },
      "note": "Точный порядок возврата подтвердить у прокатчика при получении машины.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-22-heraklion-international-airport-n-kazantzakis": {
      "id": "2026-08-22-heraklion-international-airport-n-kazantzakis",
      "dayId": "2026-08-22",
      "placeId": "heraklion-international-airport-n-kazantzakis",
      "sequence": 2,
      "role": "Багаж, регистрация и вылет",
      "timing": {
        "start": "13:30",
        "end": "17:55",
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "flight",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "rental-shuttle"
      },
      "note": "Рейс HN 2322 вылетает в 17:55.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "airport"
    },
    "2026-08-15-panigiri-village-tbd": {
      "id": "2026-08-15-panigiri-village-tbd",
      "dayId": "2026-08-15",
      "placeId": "panigiri-village-tbd",
      "sequence": 5,
      "role": "Традиционный критский panigiri",
      "timing": {
        "start": "21:00",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 30,
        "distanceKm": 20,
        "status": "standard"
      },
      "note": "Конкретную деревню, парковку и необходимость бронирования стола уточнить ближе к дате. Вечерний пробег пока ориентировочный.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": false
      },
      "durationKind": "finish"
    },
    "2026-08-16-pomegranate-garden-villa-start": {
      "id": "2026-08-16-pomegranate-garden-villa-start",
      "dayId": "2026-08-16",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Позднее спокойное начало",
      "timing": {
        "start": "12:00",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "walking",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "После panigiri никаких ранних подвигов.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "start"
    },
    "2026-08-16-rethymno-old-town-and-venetian-harbour": {
      "id": "2026-08-16-rethymno-old-town-and-venetian-harbour",
      "dayId": "2026-08-16",
      "placeId": "rethymno-old-town-and-venetian-harbour",
      "sequence": 1,
      "role": "Обед и неспешный Rethymno",
      "timing": {
        "start": "13:00",
        "end": "17:00",
        "approximate": true
      },
      "durationMinutes": 240,
      "inboundTravel": {
        "mode": "transit",
        "durationMinutes": 25,
        "distanceKm": 7,
        "status": "standard"
      },
      "note": "Лучше приехать автобусом; без обязательных музеев и повторного туристического марафона.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-16-platanes-beach": {
      "id": "2026-08-16-platanes-beach",
      "dayId": "2026-08-16",
      "placeId": "platanes-beach",
      "sequence": 2,
      "role": "Пляж и возможный пеший возврат вдоль моря",
      "timing": {
        "start": "17:30",
        "end": "20:00",
        "approximate": true
      },
      "durationMinutes": 150,
      "inboundTravel": {
        "mode": "walking",
        "durationMinutes": 75,
        "distanceKm": 6,
        "status": "standard"
      },
      "note": "Пешком только если не накупили тележку сувениров.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-16-pomegranate-garden-villa-end": {
      "id": "2026-08-16-pomegranate-garden-villa-end",
      "dayId": "2026-08-16",
      "placeId": "pomegranate-garden-villa",
      "sequence": 3,
      "role": "Свободный вечер",
      "timing": {
        "start": "20:05",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "walking",
        "durationMinutes": 5,
        "distanceKm": 0.4,
        "status": "standard"
      },
      "note": "",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "finish"
    },
    "2026-08-17-pomegranate-garden-villa-start": {
      "id": "2026-08-17-pomegranate-garden-villa-start",
      "dayId": "2026-08-17",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Выход на пляж без машины",
      "timing": {
        "start": "09:15",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "walking",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "start"
    },
    "2026-08-17-platanes-beach": {
      "id": "2026-08-17-platanes-beach",
      "dayId": "2026-08-17",
      "placeId": "platanes-beach",
      "sequence": 1,
      "role": "Полный пляжный день",
      "timing": {
        "start": "09:25",
        "end": "19:00",
        "approximate": true
      },
      "durationMinutes": 575,
      "inboundTravel": {
        "mode": "walking",
        "durationMinutes": 10,
        "distanceKm": 0.7,
        "status": "standard"
      },
      "note": "Утром занять лежаки; никаких поездок и «маленьких остановок».",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-17-pomegranate-garden-villa-end": {
      "id": "2026-08-17-pomegranate-garden-villa-end",
      "dayId": "2026-08-17",
      "placeId": "pomegranate-garden-villa",
      "sequence": 2,
      "role": "Возвращение домой",
      "timing": {
        "start": "19:10",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "walking",
        "durationMinutes": 10,
        "distanceKm": 0.7,
        "status": "standard"
      },
      "note": "",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "finish"
    },
    "2026-08-18-pomegranate-garden-villa-start": {
      "id": "2026-08-18-pomegranate-garden-villa-start",
      "dayId": "2026-08-18",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Выезд из Platanes",
      "timing": {
        "start": "09:30",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "Остановка гибкая: важнее атмосфера, открытое кафенио и разговоры, чем выполнение списка.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "start"
    },
    "2026-08-18-apostoloi-amari": {
      "id": "2026-08-18-apostoloi-amari",
      "dayId": "2026-08-18",
      "placeId": "apostoloi-amari",
      "sequence": 1,
      "role": "Первая деревенская остановка",
      "timing": {
        "start": "10:30",
        "end": "11:10",
        "approximate": true
      },
      "durationMinutes": 40,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 60,
        "distanceKm": 45,
        "status": "standard"
      },
      "note": "Остановка гибкая: важнее атмосфера, открытое кафенио и разговоры, чем выполнение списка.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-18-nefs-amari": {
      "id": "2026-08-18-nefs-amari",
      "dayId": "2026-08-18",
      "placeId": "nefs-amari",
      "sequence": 2,
      "role": "Кафенио и знакомство с долиной Amari",
      "timing": {
        "start": "11:25",
        "end": "12:05",
        "approximate": true
      },
      "durationMinutes": 40,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 15,
        "distanceKm": 7,
        "status": "standard"
      },
      "note": "Остановка гибкая: важнее атмосфера, открытое кафенио и разговоры, чем выполнение списка.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-18-opsigias": {
      "id": "2026-08-18-opsigias",
      "dayId": "2026-08-18",
      "placeId": "opsigias",
      "sequence": 3,
      "role": "Короткая остановка без формальной программы",
      "timing": {
        "start": "12:10",
        "end": "12:35",
        "approximate": true
      },
      "durationMinutes": 25,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 5,
        "distanceKm": 2,
        "status": "standard"
      },
      "note": "Остановка гибкая: важнее атмосфера, открытое кафенио и разговоры, чем выполнение списка.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-18-monastiraki-amari": {
      "id": "2026-08-18-monastiraki-amari",
      "dayId": "2026-08-18",
      "placeId": "monastiraki-amari",
      "sequence": 4,
      "role": "Деревня и поиск локальных продуктов",
      "timing": {
        "start": "12:45",
        "end": "13:20",
        "approximate": true
      },
      "durationMinutes": 35,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 10,
        "distanceKm": 4,
        "status": "standard"
      },
      "note": "Остановка гибкая: важнее атмосфера, открытое кафенио и разговоры, чем выполнение списка.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-18-meronas": {
      "id": "2026-08-18-meronas",
      "dayId": "2026-08-18",
      "placeId": "meronas",
      "sequence": 5,
      "role": "Главная остановка и обед",
      "timing": {
        "start": "13:35",
        "end": "15:30",
        "approximate": true
      },
      "durationMinutes": 115,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 15,
        "distanceKm": 6,
        "status": "standard"
      },
      "note": "Остановка гибкая: важнее атмосфера, открытое кафенио и разговоры, чем выполнение списка.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-18-elenes": {
      "id": "2026-08-18-elenes",
      "dayId": "2026-08-18",
      "placeId": "elenes",
      "sequence": 6,
      "role": "Небольшая деревенская пауза",
      "timing": {
        "start": "15:40",
        "end": "16:10",
        "approximate": true
      },
      "durationMinutes": 30,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 10,
        "distanceKm": 4,
        "status": "standard"
      },
      "note": "Остановка гибкая: важнее атмосфера, открытое кафенио и разговоры, чем выполнение списка.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-18-gerakari": {
      "id": "2026-08-18-gerakari",
      "dayId": "2026-08-18",
      "placeId": "gerakari",
      "sequence": 7,
      "role": "Финальная остановка: травы, раки, масло",
      "timing": {
        "start": "16:20",
        "end": "17:20",
        "approximate": true
      },
      "durationMinutes": 60,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 10,
        "distanceKm": 3,
        "status": "standard"
      },
      "note": "Остановка гибкая: важнее атмосфера, открытое кафенио и разговоры, чем выполнение списка.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-18-pomegranate-garden-villa-end": {
      "id": "2026-08-18-pomegranate-garden-villa-end",
      "dayId": "2026-08-18",
      "placeId": "pomegranate-garden-villa",
      "sequence": 8,
      "role": "Возвращение в Platanes",
      "timing": {
        "start": "18:15",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 55,
        "distanceKm": 38,
        "status": "standard"
      },
      "note": "Остановка гибкая: важнее атмосфера, открытое кафенио и разговоры, чем выполнение списка.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "finish"
    },
    "2026-08-20-pomegranate-garden-villa-start": {
      "id": "2026-08-20-pomegranate-garden-villa-start",
      "dayId": "2026-08-20",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Ранний выезд на Laiki",
      "timing": {
        "start": "07:45",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "start"
    },
    "2026-08-20-laiki-market-rethymno": {
      "id": "2026-08-20-laiki-market-rethymno",
      "dayId": "2026-08-20",
      "placeId": "laiki-market-rethymno",
      "sequence": 1,
      "role": "Обязательный Laiki Market",
      "timing": {
        "start": "08:10",
        "end": "10:10",
        "approximate": true
      },
      "durationMinutes": 120,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 25,
        "distanceKm": 8,
        "status": "standard"
      },
      "note": "Приехать пораньше на машине; майки и оливковое масло смогут ждать в машине.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-20-eleftherna": {
      "id": "2026-08-20-eleftherna",
      "dayId": "2026-08-20",
      "placeId": "eleftherna",
      "sequence": 2,
      "role": "Eleutherna Archaeological Museum",
      "timing": {
        "start": "11:00",
        "end": "13:00",
        "approximate": true
      },
      "durationMinutes": 120,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 50,
        "distanceKm": 30,
        "status": "standard"
      },
      "note": "Музей обязателен; во вторник он закрыт.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-20-panormo": {
      "id": "2026-08-20-panormo",
      "dayId": "2026-08-20",
      "placeId": "panormo",
      "sequence": 3,
      "role": "Panormo по желанию",
      "timing": {
        "start": "13:35",
        "end": "16:15",
        "approximate": true
      },
      "durationMinutes": 160,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 35,
        "distanceKm": 25,
        "status": "standard"
      },
      "note": "Короткая прогулка, обед или купание. Если атмосфера не нравится — уехать без чувства долга.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-20-pomegranate-garden-villa-end": {
      "id": "2026-08-20-pomegranate-garden-villa-end",
      "dayId": "2026-08-20",
      "placeId": "pomegranate-garden-villa",
      "sequence": 4,
      "role": "Возвращение и начало сборов",
      "timing": {
        "start": "16:45",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 30,
        "distanceKm": 22,
        "status": "standard"
      },
      "note": "Вечером начать собирать чемоданы.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "finish"
    },
    "2026-08-21-pomegranate-garden-villa-start": {
      "id": "2026-08-21-pomegranate-garden-villa-start",
      "dayId": "2026-08-21",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Практически закончить сборы",
      "timing": {
        "start": "08:00",
        "end": "09:00",
        "approximate": true
      },
      "durationMinutes": 60,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "Оставить снаружи только купальные вещи, одежду на дорогу и необходимые мелочи.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-21-platanes-beach": {
      "id": "2026-08-21-platanes-beach",
      "dayId": "2026-08-21",
      "placeId": "platanes-beach",
      "sequence": 1,
      "role": "Полный расслабленный день на пляже",
      "timing": {
        "start": "09:15",
        "end": "19:00",
        "approximate": true
      },
      "durationMinutes": 585,
      "inboundTravel": {
        "mode": "walking",
        "durationMinutes": 10,
        "distanceKm": 0.7,
        "status": "standard"
      },
      "note": "После утренних сборов день полностью принадлежит пляжу.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-21-pomegranate-garden-villa-end": {
      "id": "2026-08-21-pomegranate-garden-villa-end",
      "dayId": "2026-08-21",
      "placeId": "pomegranate-garden-villa",
      "sequence": 2,
      "role": "Последний спокойный вечер",
      "timing": {
        "start": "19:10",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "walking",
        "durationMinutes": 10,
        "distanceKm": 0.7,
        "status": "standard"
      },
      "note": "",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "finish"
    },
    "2026-08-19-pomegranate-garden-villa-start": {
      "id": "2026-08-19-pomegranate-garden-villa-start",
      "dayId": "2026-08-19",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Выезд на Organic Farmers’ Market",
      "timing": {
        "start": "10:20",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "status": "none"
      },
      "note": "Основной план дня начинается с рынка.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "start"
    },
    "2026-08-19-organic-farmers-market-rethymno": {
      "id": "2026-08-19-organic-farmers-market-rethymno",
      "dayId": "2026-08-19",
      "placeId": "organic-farmers-market-rethymno",
      "sequence": 1,
      "role": "Organic Farmers’ Market",
      "timing": {
        "start": "10:45",
        "end": "11:45",
        "approximate": true
      },
      "durationMinutes": 60,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 25,
        "distanceKm": 8,
        "status": "standard"
      },
      "note": "Рынок желательный. После него по настроению можно отменить дальнюю часть дня, вернуться домой и тюленить на Platanes Beach.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-19-stavros-beach": {
      "id": "2026-08-19-stavros-beach",
      "dayId": "2026-08-19",
      "placeId": "stavros-beach",
      "sequence": 2,
      "role": "Stavros Beach — место съёмок «Грека Зорбы»",
      "timing": {
        "start": "13:10",
        "end": "14:25",
        "approximate": true
      },
      "durationMinutes": 75,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 85,
        "distanceKm": 70,
        "status": "standard"
      },
      "note": "Основной план: после рынка едем на Akrotiri. Купание и короткая прогулка без длинной жары.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-19-kouzina-epe": {
      "id": "2026-08-19-kouzina-epe",
      "dayId": "2026-08-19",
      "placeId": "kouzina-epe",
      "sequence": 3,
      "role": "Обязательный обед в Kouzina EPE",
      "timing": {
        "start": "14:50",
        "end": "16:20",
        "approximate": true
      },
      "durationMinutes": 90,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 25,
        "distanceKm": 15,
        "status": "standard"
      },
      "note": "Если продолжаем маршрут на Akrotiri, Kouzina EPE — обязательная часть дня.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-19-marathi-beach": {
      "id": "2026-08-19-marathi-beach",
      "dayId": "2026-08-19",
      "placeId": "marathi-beach",
      "sequence": 4,
      "role": "Купание и отдых на Marathi Beach",
      "timing": {
        "start": "16:50",
        "end": "19:30",
        "approximate": true
      },
      "durationMinutes": 160,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 30,
        "distanceKm": 17,
        "status": "standard"
      },
      "note": "Спокойное завершение дальнего дня у моря.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": null
    },
    "2026-08-19-pomegranate-garden-villa-end": {
      "id": "2026-08-19-pomegranate-garden-villa-end",
      "dayId": "2026-08-19",
      "placeId": "pomegranate-garden-villa",
      "sequence": 5,
      "role": "Возвращение в Platanes",
      "timing": {
        "start": "20:50",
        "end": null,
        "approximate": true
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 80,
        "distanceKm": 72,
        "status": "standard"
      },
      "note": "После возвращения никаких дополнительных планов.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationKind": "finish"
    }
  },
  "routes": {
    "route-2026-08-11": {
      "id": "route-2026-08-11",
      "dayId": "2026-08-11",
      "mode": "driving",
      "visitIds": [
        "2026-08-11-heraklion-international-airport-n-kazantzakis",
        "2026-08-11-mochlos",
        "2026-08-11-sitia-airbnb"
      ]
    },
    "route-2026-08-12": {
      "id": "route-2026-08-12",
      "dayId": "2026-08-12",
      "mode": "driving",
      "visitIds": [
        "2026-08-12-sitia-airbnb",
        "2026-08-12-toplou-monastery-and-toplou-fabrica",
        "2026-08-12-paralia-chiona-hiona-taverna",
        "2026-08-12-ancient-city-itanos-erimoupolis-beach-parking",
        "2026-08-12-vai-beach",
        "2026-08-12-sitia-airbnb-2"
      ]
    },
    "route-2026-08-13": {
      "id": "route-2026-08-13",
      "dayId": "2026-08-13",
      "mode": "driving",
      "visitIds": [
        "2026-08-13-sitia-airbnb",
        "2026-08-13-ziros",
        "2026-08-13-mazida-ammos-beach",
        "2026-08-13-xerokampos-taverna-kostas",
        "2026-08-13-sitia-airbnb-2"
      ]
    },
    "route-2026-08-14": {
      "id": "route-2026-08-14",
      "dayId": "2026-08-14",
      "mode": "driving",
      "visitIds": [
        "2026-08-14-sitia-airbnb",
        "2026-08-14-zakros-springs-and-water-and-water-power-museum-of-zakros",
        "2026-08-14-minoan-palace-of-zakros",
        "2026-08-14-kato-zakros-nostos-beach",
        "2026-08-14-sitia-airbnb-2"
      ]
    },
    "route-2026-08-15": {
      "id": "route-2026-08-15",
      "dayId": "2026-08-15",
      "mode": "driving",
      "visitIds": [
        "2026-08-15-sitia-airbnb",
        "2026-08-15-kazarma-fortress",
        "2026-08-15-sitia-airbnb-2",
        "2026-08-15-mathena-olive-tree-lastros",
        "2026-08-15-pomegranate-garden-villa",
        "2026-08-15-panigiri-village-tbd"
      ]
    },
    "route-2026-08-22": {
      "id": "route-2026-08-22",
      "dayId": "2026-08-22",
      "mode": "driving",
      "visitIds": [
        "2026-08-22-pomegranate-garden-villa",
        "2026-08-22-gomega-car-rentals-heraklion"
      ]
    },
    "route-2026-08-16": {
      "id": "route-2026-08-16",
      "dayId": "2026-08-16",
      "visitIds": [
        "2026-08-16-pomegranate-garden-villa-start",
        "2026-08-16-rethymno-old-town-and-venetian-harbour",
        "2026-08-16-platanes-beach",
        "2026-08-16-pomegranate-garden-villa-end"
      ]
    },
    "route-2026-08-17": {
      "id": "route-2026-08-17",
      "dayId": "2026-08-17",
      "visitIds": [
        "2026-08-17-pomegranate-garden-villa-start",
        "2026-08-17-platanes-beach",
        "2026-08-17-pomegranate-garden-villa-end"
      ]
    },
    "route-2026-08-18": {
      "id": "route-2026-08-18",
      "dayId": "2026-08-18",
      "visitIds": [
        "2026-08-18-pomegranate-garden-villa-start",
        "2026-08-18-apostoloi-amari",
        "2026-08-18-nefs-amari",
        "2026-08-18-opsigias",
        "2026-08-18-monastiraki-amari",
        "2026-08-18-meronas",
        "2026-08-18-elenes",
        "2026-08-18-gerakari",
        "2026-08-18-pomegranate-garden-villa-end"
      ]
    },
    "route-2026-08-19": {
      "id": "route-2026-08-19",
      "dayId": "2026-08-19",
      "visitIds": [
        "2026-08-19-pomegranate-garden-villa-start",
        "2026-08-19-organic-farmers-market-rethymno",
        "2026-08-19-stavros-beach",
        "2026-08-19-kouzina-epe",
        "2026-08-19-marathi-beach",
        "2026-08-19-pomegranate-garden-villa-end"
      ]
    },
    "route-2026-08-20": {
      "id": "route-2026-08-20",
      "dayId": "2026-08-20",
      "visitIds": [
        "2026-08-20-pomegranate-garden-villa-start",
        "2026-08-20-laiki-market-rethymno",
        "2026-08-20-eleftherna",
        "2026-08-20-panormo",
        "2026-08-20-pomegranate-garden-villa-end"
      ]
    },
    "route-2026-08-21": {
      "id": "route-2026-08-21",
      "dayId": "2026-08-21",
      "visitIds": [
        "2026-08-21-pomegranate-garden-villa-start",
        "2026-08-21-platanes-beach",
        "2026-08-21-pomegranate-garden-villa-end"
      ]
    }
  },
  "parkingLocations": {
    "heraklion-airport-gomega": {
      "id": "heraklion-airport-gomega",
      "name": "GoMega pickup / airport meeting point",
      "coordinates": {
        "lat": 35.33972,
        "lon": 25.18028
      },
      "navigationQuery": "35.33972,25.18028",
      "category": "rental",
      "payment": {
        "type": "unknown"
      },
      "reliability": "high",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "В августе возможны очереди и плотное движение у терминала.",
      "notes": [
        {
          "type": "general",
          "text": "Следовать ваучеру и указаниям GoMega."
        },
        {
          "type": "general",
          "text": "Не использовать эту точку как обычную долгосрочную парковку."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "mochlos-village": {
      "id": "mochlos-village",
      "name": "Mochlos village parking",
      "coordinates": {
        "lat": 35.18377,
        "lon": 25.9054
      },
      "navigationQuery": "35.18377,25.9054",
      "category": "street",
      "payment": {
        "type": "free"
      },
      "reliability": "medium",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "В обеденное время августа ближайшие места у таверн могут быть заняты.",
      "notes": [
        {
          "type": "general",
          "text": "Не заезжать в слишком узкие переулки у воды."
        },
        {
          "type": "general",
          "text": "Багаж полностью скрыть; документы и ценности взять с собой."
        },
        {
          "type": "general",
          "text": "Не использовать грунтовые карманы, если подъезд выглядит сомнительно."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "sitia-port": {
      "id": "sitia-port",
      "name": "Sitia Port public parking",
      "coordinates": {
        "lat": 35.20939,
        "lon": 26.10724
      },
      "navigationQuery": "35.20939,26.10724",
      "category": "public",
      "payment": {
        "type": "free"
      },
      "reliability": "high",
      "walking": {
        "durationMinutes": 1
      },
      "status": "recommended",
      "summary": "Бесплатная общественная парковка у порта, примерно в минуте пешком от дома.",
      "priceNote": null,
      "crowdingNote": "Вечером и в высокий сезон ближайшие места могут быть заняты.",
      "notes": [
        {
          "type": "general",
          "text": "Cars are not allowed on Ioannou Kondylaki street."
        },
        {
          "type": "general",
          "text": "Для навигации используем парковку у порта, а не адрес дома."
        },
        {
          "type": "general",
          "text": "После парковки пройти к Ioannou Kondylaki 18 пешком."
        },
        {
          "type": "general",
          "text": "Следовать дорожным знакам и не блокировать проезд по территории порта."
        }
      ],
      "verification": {
        "date": "2026-07-31",
        "source": "manual"
      }
    },
    "toplou-monastery": {
      "id": "toplou-monastery",
      "name": "Toplou Monastery parking",
      "coordinates": {
        "lat": 35.221552,
        "lon": 26.21605
      },
      "navigationQuery": "35.221552,26.21605",
      "category": "official",
      "payment": {
        "type": "free"
      },
      "reliability": "high",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "В высокий сезон места могут заполняться перед экскурсиями и дегустациями.",
      "notes": [
        {
          "type": "general",
          "text": "Подходит для обычной арендованной машины."
        },
        {
          "type": "general",
          "text": "Приехать с небольшим запасом перед подтверждённым временем."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "chiona-hiona": {
      "id": "chiona-hiona",
      "name": "Hiona Taverna / Chiona beach parking",
      "coordinates": {
        "lat": 35.19776,
        "lon": 26.27745
      },
      "navigationQuery": "35.19776,26.27745",
      "category": "informal",
      "payment": {
        "type": "free"
      },
      "reliability": "high",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "В августе в обеденное время ближайшие места могут быть заняты.",
      "notes": [
        {
          "type": "general",
          "text": "Следовать указаниям таверны и не перекрывать проезд."
        },
        {
          "type": "general",
          "text": "Не оставлять ценности на виду."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "itanos-erimoupolis": {
      "id": "itanos-erimoupolis",
      "name": "Ancient Itanos / Erimoupolis parking",
      "coordinates": {
        "lat": 35.264308,
        "lon": 26.262072
      },
      "navigationQuery": "35.264308,26.262072",
      "category": "informal",
      "payment": {
        "type": "free"
      },
      "reliability": "high",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "Обычно проще, чем у Vai, но в августе свободное место не гарантировано.",
      "notes": [
        {
          "type": "general",
          "text": "До пляжа примерно 200–250 м."
        },
        {
          "type": "general",
          "text": "Не оставлять багаж и ценности на виду."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "vai-main": {
      "id": "vai-main",
      "name": "Vai Beach Parking",
      "coordinates": {
        "lat": 35.25315,
        "lon": 26.26431
      },
      "navigationQuery": "35.25315,26.26431",
      "category": "official",
      "payment": {
        "type": "paid"
      },
      "reliability": "high",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": "Оплата на месте; актуальную цену проверить при въезде.",
      "crowdingNote": "В августе быстро заполняется; к нашему вечернему приезду часть дневных посетителей уже уезжает.",
      "notes": [
        {
          "type": "general",
          "text": "Подъезд по асфальту."
        },
        {
          "type": "general",
          "text": "Точка поставлена у въезда в основную парковку, а не у западного дорожного кармана."
        },
        {
          "type": "general",
          "text": "Следовать указаниям персонала и разметке."
        },
        {
          "type": "general",
          "text": "Не оставлять вещи на виду."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "ziros-village": {
      "id": "ziros-village",
      "name": "Ziros village parking",
      "coordinates": {
        "lat": 35.07531,
        "lon": 26.13951
      },
      "navigationQuery": "35.07531,26.13951",
      "category": "street",
      "payment": {
        "type": "free"
      },
      "reliability": "medium",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "Обычно проще, чем на побережье; не занимать место перед частным въездом.",
      "notes": [
        {
          "type": "general",
          "text": "Выбирать широкое место без помех местному движению."
        },
        {
          "type": "general",
          "text": "Перед спуском к Xerokampos удобно проверить воду и навигацию."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "mazida-ammos": {
      "id": "mazida-ammos",
      "name": "Mazida Ammos beach parking",
      "coordinates": {
        "lat": 35.03626,
        "lon": 26.22006
      },
      "navigationQuery": "35.03626,26.22006",
      "category": "informal",
      "payment": {
        "type": "free"
      },
      "reliability": "medium",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "В августе ближайшие места могут заполняться, но оборот обычно есть.",
      "notes": [
        {
          "type": "general",
          "text": "Оставаться на асфальтированном подъезде и очевидной парковочной площадке."
        },
        {
          "type": "general",
          "text": "Не съезжать на песок или грунтовые ответвления."
        },
        {
          "type": "general",
          "text": "Не оставлять ценности на виду."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "taverna-kostas": {
      "id": "taverna-kostas",
      "name": "Taverna Kostas parking",
      "coordinates": {
        "lat": 35.04422,
        "lon": 26.22672
      },
      "navigationQuery": "35.04422,26.22672",
      "category": "customer",
      "payment": {
        "type": "free"
      },
      "reliability": "medium",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "Во время позднего обеда обычно проще, но гарантии свободного места нет.",
      "notes": [
        {
          "type": "general",
          "text": "Следовать указаниям персонала таверны."
        },
        {
          "type": "general",
          "text": "Не блокировать подъезд к соседним домам."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "zakros-village": {
      "id": "zakros-village",
      "name": "Zakros village parking",
      "coordinates": {
        "lat": 35.11312,
        "lon": 26.218
      },
      "navigationQuery": "35.11312,26.218",
      "category": "street",
      "payment": {
        "type": "free"
      },
      "reliability": "medium",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "Узкие улицы ограничивают выбор; лучше не пытаться подъехать к каждой точке вплотную.",
      "notes": [
        {
          "type": "general",
          "text": "Оставить машину один раз и пройти короткий участок пешком."
        },
        {
          "type": "general",
          "text": "Не перекрывать проезды и входы во дворы."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "minoan-palace-zakros": {
      "id": "minoan-palace-zakros",
      "name": "Minoan Palace of Zakros parking",
      "coordinates": {
        "lat": 35.09806,
        "lon": 26.26139
      },
      "navigationQuery": "35.09806,26.26139",
      "category": "official",
      "payment": {
        "type": "free"
      },
      "reliability": "high",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "В высокий сезон возможна загрузка, но посещение обычно короче пляжного дня.",
      "notes": [
        {
          "type": "general",
          "text": "Не путать с парковкой для Gorge of the Dead."
        },
        {
          "type": "general",
          "text": "Оставить воду в доступном месте и не оставлять ценности на виду."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "kato-zakros-seafront": {
      "id": "kato-zakros-seafront",
      "name": "Kato Zakros seafront parking",
      "coordinates": {
        "lat": 35.09765,
        "lon": 26.26355
      },
      "navigationQuery": "35.09765,26.26355",
      "category": "street",
      "payment": {
        "type": "free"
      },
      "reliability": "medium",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "В обеденное время августа места у самой воды могут быть заняты.",
      "notes": [
        {
          "type": "general",
          "text": "Не заезжать на пляж и не перекрывать разворот."
        },
        {
          "type": "general",
          "text": "При отсутствии места пройти несколько минут от более широкой части дороги."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "kazarma-lower-streets": {
      "id": "kazarma-lower-streets",
      "name": "Parking near Kazarma Fortress",
      "coordinates": {
        "lat": 35.21114,
        "lon": 26.10752
      },
      "navigationQuery": "35.21114,26.10752",
      "category": "street",
      "payment": {
        "type": "free"
      },
      "reliability": "low",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "Утром шансы выше, но свободное место рядом не гарантировано.",
      "notes": [
        {
          "type": "general",
          "text": "Не пытаться протискиваться в узкие переулки."
        },
        {
          "type": "general",
          "text": "При необходимости оставить машину ближе к центру и пройти короткий подъём."
        },
        {
          "type": "general",
          "text": "Проверить знаки и не блокировать частные въезды."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "lastros-village": {
      "id": "lastros-village",
      "name": "Lastros village parking",
      "coordinates": {
        "lat": 35.1411116,
        "lon": 25.900172
      },
      "navigationQuery": "35.1411116,25.900172",
      "category": "street",
      "payment": {
        "type": "free"
      },
      "reliability": "medium",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "Обычно спокойно, но улицы узкие и рассчитаны прежде всего на местное движение.",
      "notes": [
        {
          "type": "general",
          "text": "Не парковаться на повороте или перед воротами."
        },
        {
          "type": "general",
          "text": "До Mathena Olive Tree пройти короткий участок пешком, если подъезд выглядит тесным."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    },
    "pomegranate-villa": {
      "id": "pomegranate-villa",
      "name": "Pomegranate Garden Villa parking",
      "coordinates": {
        "lat": 35.36855713304881,
        "lon": 24.530239843450914
      },
      "navigationQuery": "Lasithiou 4, Rethymno 741 50, Greece",
      "category": "street",
      "payment": {
        "type": "free"
      },
      "reliability": "medium",
      "walking": null,
      "status": null,
      "summary": null,
      "priceNote": null,
      "crowdingNote": "При заселении конкретное место зависит от занятости улицы.",
      "notes": [
        {
          "type": "general",
          "text": "Сначала выгрузить багаж."
        },
        {
          "type": "general",
          "text": "Уточнить у хозяина предпочтительное место, если оно не очевидно."
        }
      ],
      "verification": {
        "date": "2026-07-30",
        "source": "manual"
      }
    }
  },
  "reservations": {
    "reservation-toplou-fabrica": {
      "id": "reservation-toplou-fabrica",
      "placeId": "toplou-fabrica",
      "status": "confirmed",
      "startsAt": "2026-08-12T11:00:00+03:00",
      "date": null,
      "timeOfDay": null,
      "partySize": 4,
      "notes": [
        {
          "type": "public",
          "text": "Подтверждено для 4 человек: 1 Classic Wine Tasting для Лиды, 1 бокал вина 40 мл для водителя, juice или sparkling water для двух детей и local food platter для всей семьи за €8."
        }
      ]
    },
    "reservation-tavern-restaurant-me-raki": {
      "id": "reservation-tavern-restaurant-me-raki",
      "placeId": "tavern-restaurant-me-raki",
      "status": "confirmed",
      "startsAt": null,
      "date": "2026-08-11",
      "timeOfDay": "evening",
      "partySize": 4,
      "notes": [
        {
          "type": "public",
          "text": "План первого ужина; без брони."
        }
      ]
    },
    "reservation-inodion": {
      "id": "reservation-inodion",
      "placeId": "inodion",
      "status": "confirmed",
      "startsAt": "2026-08-13T21:00:00+03:00",
      "date": null,
      "timeOfDay": null,
      "partySize": 4,
      "notes": [
        {
          "type": "public",
          "text": "Стол для 4 человек подтверждён. Забронирован ближайший доступный стол к морю; столы непосредственно у моря предоставляются в порядке живой очереди. Если такой стол будет свободен при прибытии, можно пересесть."
        }
      ]
    }
  },
  "policies": {
    "rules": [
      "Дни 12–14 августа переставляем только из-за ветра или погоды.",
      "Не выполняем необязательные пункты ценой спешки.",
      "В жару сокращаем прогулки, а не пляж и обед.",
      "Не съезжаем на грунтовые дороги без ясного разрешения прокатчика.",
      "Перед поездкой проверяем ветер, часы работы, парковку и открытие таверн.",
      "Katsounaki / Krinakia исключён: прокатчик не рекомендует подъезд на арендованной машине."
    ],
    "privacyNote": "Этот публичный HTML не содержит кодов бронирований и телефонов. Точный адрес жилья в Sitia включён только как навигационная точка маршрута."
  }
});
})();
