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
    "locale": "ru-RU"
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
      "metrics": {
        "departureTime": "05:15",
        "finishTime": "15:00",
        "drivingDurationMinutes": 150,
        "distanceKm": 133,
        "swimming": "Mochlos или Sitia Beach"
      },
      "metricDisplayHints": {
        "departureTime": "05:15",
        "finishTime": "15:00",
        "drivingDurationMinutes": "2 ч 30 мин",
        "distanceKm": "133 км",
        "swimming": "Mochlos или Sitia Beach"
      },
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
      "mealSummary": "обед в Mochlos; ужин в Me Raki"
    },
    "2026-08-12": {
      "id": "2026-08-12",
      "title": "Toplou, Chiona, Itanos и Vai",
      "status": "confirmed",
      "metrics": {
        "departureTime": "09:45",
        "finishTime": "18:50",
        "drivingDurationMinutes": 115,
        "distanceKm": 67,
        "swimming": "Chiona, Erimoupolis, Vai"
      },
      "metricDisplayHints": {
        "departureTime": "09:45",
        "finishTime": "18:50",
        "drivingDurationMinutes": "1 ч 55 мин",
        "distanceKm": "67 км",
        "swimming": "Chiona, Erimoupolis, Vai"
      },
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
      "mealSummary": "Toplou Fabrica tasting и local food platter; поздний обед в Hiona Taverna; ужин свободно"
    },
    "2026-08-13": {
      "id": "2026-08-13",
      "title": "Ziros и Xerokampos",
      "status": "confirmed",
      "metrics": {
        "departureTime": "09:30",
        "finishTime": "17:50",
        "drivingDurationMinutes": 195,
        "distanceKm": 98,
        "swimming": "Mazida Ammos beach"
      },
      "metricDisplayHints": {
        "departureTime": "09:30",
        "finishTime": "17:50",
        "drivingDurationMinutes": "3 ч 15 мин",
        "distanceKm": "98 км",
        "swimming": "Mazida Ammos beach"
      },
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
      "mealSummary": "кофе в Ziros; поздний обед в Taverna Kostas; Inodion в 21:00"
    },
    "2026-08-14": {
      "id": "2026-08-14",
      "title": "Zakros и Kato Zakros",
      "status": "confirmed",
      "metrics": {
        "departureTime": "09:30",
        "finishTime": "18:05",
        "drivingDurationMinutes": 160,
        "distanceKm": 98,
        "swimming": "Kato Zakros"
      },
      "metricDisplayHints": {
        "departureTime": "09:30",
        "finishTime": "18:05",
        "drivingDurationMinutes": "2 ч 40 мин",
        "distanceKm": "98 км",
        "swimming": "Kato Zakros"
      },
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
      "mealSummary": "обед в Nostos; ужин свободно в Sitia"
    },
    "2026-08-15": {
      "id": "2026-08-15",
      "title": "Kazarma Fortress, Lastros и переезд в Platanes",
      "status": "confirmed",
      "metrics": {
        "departureTime": "08:30",
        "finishTime": "15:15",
        "drivingDurationMinutes": 200,
        "distanceKm": 166,
        "swimming": "без пляжной остановки"
      },
      "metricDisplayHints": {
        "departureTime": "08:30",
        "finishTime": "15:15",
        "drivingDurationMinutes": "3 ч 20 мин",
        "distanceKm": "166 км",
        "swimming": "без пляжной остановки"
      },
      "visitIds": [
        "2026-08-15-sitia-airbnb",
        "2026-08-15-kazarma-fortress",
        "2026-08-15-sitia-airbnb-2",
        "2026-08-15-mathena-olive-tree-lastros",
        "2026-08-15-pomegranate-garden-villa"
      ],
      "routeId": "route-2026-08-15",
      "sections": {
        "essentials": {
          "items": [
            "Главное: Kazarma Fortress, Mathena Olive Tree Lastros и переезд.",
            "Lastros — финальная остановка восточной части, но обед не задерживает трансфер.",
            "После Platanes — только заселение и отдых."
          ]
        },
        "food": {
          "items": [
            "09:15–10:30: завтрак и завершение сборов в Sitia.",
            "Lastros: ранний обед в деревне.",
            "15 августа — большой праздник; при переполненных тавернах переносим обед дальше."
          ]
        },
        "practical": {
          "items": [
            "Kazarma посещаем до окончательной загрузки машины.",
            "После крепости возвращаемся к жилью на завтрак и сборы.",
            "Mathena Olive Tree Lastros — точная промежуточная точка.",
            "Не задерживать переезд ради необязательных остановок."
          ]
        }
      },
      "mealSummary": "завтрак в Sitia; ранний обед в Lastros"
    },
    "2026-08-16": {
      "id": "2026-08-16",
      "title": "Rethymno и спокойный день у моря",
      "status": "draft",
      "metrics": {
        "status": "Черновик",
        "departureTime": "около 10:30",
        "finishTime": "около 18:15",
        "drivingDurationMinutes": 50,
        "distanceKm": 25,
        "swimming": "Platanes Beach"
      },
      "metricDisplayHints": {
        "status": "Черновик",
        "departureTime": "около 10:30",
        "finishTime": "около 18:15",
        "drivingDurationMinutes": "около 50 мин",
        "distanceKm": "около 25 км",
        "swimming": "Platanes Beach"
      },
      "visitIds": [
        "2026-08-16-pomegranate-garden-villa",
        "2026-08-16-rethymno-old-town-and-venetian-harbour",
        "2026-08-16-platanes-beach",
        "2026-08-16-pomegranate-garden-villa-2"
      ],
      "routeId": "route-2026-08-16",
      "sections": {
        "essentials": {
          "items": [
            "Черновой лёгкий день: Rethymno, обед и пляж у базы.",
            "Fortezza и дополнительные музеи пока не являются обязательными.",
            "При усталости сокращаем город и раньше переходим к пляжу."
          ]
        },
        "food": {
          "items": [
            "Обед — в Rethymno Old Town или у Venetian Harbour.",
            "Ужин — свободно в Platanes, без брони на этом этапе."
          ]
        },
        "practical": {
          "items": [
            "16 августа — воскресенье: обычные крупные супермаркеты, вероятнее всего, закрыты; рассчитываем на mini market и туристические магазины.",
            "Полноценную закупку разумнее сделать в понедельник 17 августа.",
            "Парковку для Rethymno уточним при детальном планировании."
          ]
        }
      },
      "mealSummary": "обед в Rethymno; ужин свободно в Platanes"
    },
    "2026-08-17": {
      "id": "2026-08-17",
      "title": "Chania и Marathi",
      "status": "draft",
      "metrics": {
        "status": "Черновик",
        "departureTime": "около 09:45",
        "finishTime": "около 19:15",
        "drivingDurationMinutes": 165,
        "distanceKm": 165,
        "swimming": "Marathi Beach"
      },
      "metricDisplayHints": {
        "status": "Черновик",
        "departureTime": "около 09:45",
        "finishTime": "около 19:15",
        "drivingDurationMinutes": "около 2 ч 45 мин",
        "distanceKm": "около 165 км",
        "swimming": "Marathi Beach"
      },
      "visitIds": [
        "2026-08-17-pomegranate-garden-villa",
        "2026-08-17-chania-old-town-and-venetian-port",
        "2026-08-17-marathi-beach",
        "2026-08-17-pomegranate-garden-villa-2"
      ],
      "routeId": "route-2026-08-17",
      "sections": {
        "essentials": {
          "items": [
            "Главное: Chania Old Town, Venetian Port и купание в Marathi.",
            "При жаре сокращаем прогулку по Chania, а не пляжную паузу.",
            "При сильном ветре день можно поменять местами с деревнями или резервным днём."
          ]
        },
        "food": {
          "items": [
            "Основной обед — в Chania.",
            "На пляж взять воду; дополнительную таверну пока не фиксируем."
          ]
        },
        "practical": {
          "items": [
            "Нужно отдельно выбрать удобную парковку у Chania Old Town.",
            "Marathi остаётся рабочим пляжным кандидатом; окончательный выбор зависит от ветра.",
            "Полноценную закупку продуктов можно сделать утром или вечером 17 августа."
          ]
        }
      },
      "mealSummary": "обед в Chania; вечером лёгкий ужин у базы"
    },
    "2026-08-18": {
      "id": "2026-08-18",
      "title": "Margarites, Eleftherna и Panormo",
      "status": "draft",
      "metrics": {
        "status": "Черновик",
        "departureTime": "около 10:00",
        "finishTime": "около 18:30",
        "drivingDurationMinutes": 120,
        "distanceKm": 80,
        "swimming": "Panormo"
      },
      "metricDisplayHints": {
        "status": "Черновик",
        "departureTime": "около 10:00",
        "finishTime": "около 18:30",
        "drivingDurationMinutes": "около 2 ч",
        "distanceKm": "около 80 км",
        "swimming": "Panormo"
      },
      "visitIds": [
        "2026-08-18-pomegranate-garden-villa",
        "2026-08-18-margarites",
        "2026-08-18-eleftherna",
        "2026-08-18-panormo",
        "2026-08-18-pomegranate-garden-villa-2"
      ],
      "routeId": "route-2026-08-18",
      "sections": {
        "essentials": {
          "items": [
            "Главное: Margarites и длинная остановка в Panormo.",
            "Eleftherna остаётся гибкой: музей, археологический участок или короткая остановка в районе.",
            "При жаре сокращаем историческую часть и раньше едем к морю."
          ]
        },
        "food": {
          "items": [
            "Кофе или лёгкий перекус — в Margarites.",
            "Основной поздний обед — в Panormo."
          ]
        },
        "practical": {
          "items": [
            "Парковки и точный формат Eleftherna уточним в детальной версии.",
            "День подходит для ветреной погоды лучше, чем Falassarna.",
            "Не добавляем Arkadi Monastery: семья уже была там раньше."
          ]
        }
      },
      "mealSummary": "перекус в Margarites; поздний обед в Panormo"
    },
    "2026-08-19": {
      "id": "2026-08-19",
      "title": "Plakias и южное побережье",
      "status": "draft",
      "metrics": {
        "status": "Черновик",
        "departureTime": "около 09:45",
        "finishTime": "около 18:15",
        "drivingDurationMinutes": 120,
        "distanceKm": 95,
        "swimming": "Plakias Beach"
      },
      "metricDisplayHints": {
        "status": "Черновик",
        "departureTime": "около 09:45",
        "finishTime": "около 18:15",
        "drivingDurationMinutes": "около 2 ч",
        "distanceKm": "около 95 км",
        "swimming": "Plakias Beach"
      },
      "visitIds": [
        "2026-08-19-pomegranate-garden-villa",
        "2026-08-19-plakias",
        "2026-08-19-pomegranate-garden-villa-2"
      ],
      "routeId": "route-2026-08-19",
      "sections": {
        "essentials": {
          "items": [
            "Главное: сама дорога через внутренний Крит и длинная остановка в Plakias.",
            "Второй пляж пока не добавляем.",
            "День можно менять местами с Falassarna или резервным днём по погоде."
          ]
        },
        "food": {
          "items": [
            "Обед — в Plakias рядом с пляжем.",
            "Воду и небольшой перекус взять с собой в машину."
          ]
        },
        "practical": {
          "items": [
            "Маршрут и безопасные места для коротких фотоостановок уточним отдельно.",
            "При сильной жаре не добавляем прогулки и ущелья.",
            "Перед поездкой проверить ветер, дорожную обстановку и сообщения 112."
          ]
        }
      },
      "mealSummary": "обед в Plakias; ужин свободно у базы"
    },
    "2026-08-20": {
      "id": "2026-08-20",
      "title": "Falassarna",
      "status": "draft",
      "metrics": {
        "status": "Черновик",
        "departureTime": "около 09:00",
        "finishTime": "около 19:30",
        "drivingDurationMinutes": 250,
        "distanceKm": 280,
        "swimming": "Falassarna"
      },
      "metricDisplayHints": {
        "status": "Черновик",
        "departureTime": "около 09:00",
        "finishTime": "около 19:30",
        "drivingDurationMinutes": "около 4 ч 10 мин",
        "distanceKm": "около 280 км",
        "swimming": "Falassarna"
      },
      "visitIds": [
        "2026-08-20-pomegranate-garden-villa",
        "2026-08-20-falassarna-beach",
        "2026-08-20-pomegranate-garden-villa-2"
      ],
      "routeId": "route-2026-08-20",
      "sections": {
        "essentials": {
          "items": [
            "Один дальний выезд и одна главная остановка: Falassarna.",
            "Не добавляем Chania, Kissamos или другие пункты по дороге только ради количества.",
            "При плохом ветре переносим день, а не пытаемся победить море силой расписания."
          ]
        },
        "food": {
          "items": [
            "Обед — на пляже или рядом с Falassarna.",
            "Взять воду и запасной перекус на дорогу."
          ]
        },
        "practical": {
          "items": [
            "Это единственный действительно тяжёлый автомобильный день варианта 1.",
            "Парковку и конкретный сектор пляжа уточним после выбора окончательной точки.",
            "День свободно меняется местами с 17 или 21 августа."
          ]
        }
      },
      "mealSummary": "обед у Falassarna; вечером отдых у базы"
    },
    "2026-08-21": {
      "id": "2026-08-21",
      "title": "Lake Kournas и Georgioupoli",
      "status": "draft",
      "metrics": {
        "status": "Черновик / резерв",
        "departureTime": "около 10:00",
        "finishTime": "около 18:15",
        "drivingDurationMinutes": 105,
        "distanceKm": 105,
        "swimming": "Georgioupoli"
      },
      "metricDisplayHints": {
        "status": "Черновик / резерв",
        "departureTime": "около 10:00",
        "finishTime": "около 18:15",
        "drivingDurationMinutes": "около 1 ч 45 мин",
        "distanceKm": "около 105 км",
        "swimming": "Georgioupoli"
      },
      "visitIds": [
        "2026-08-21-pomegranate-garden-villa",
        "2026-08-21-lake-kournas",
        "2026-08-21-georgioupoli",
        "2026-08-21-pomegranate-garden-villa-2"
      ],
      "routeId": "route-2026-08-21",
      "sections": {
        "essentials": {
          "items": [
            "Это резервный день, а не обязательная экскурсионная программа.",
            "Lake Kournas и Georgioupoli — базовый лёгкий сценарий.",
            "День может принять на себя Falassarna, Plakias или другой маршрут, перенесённый из-за погоды."
          ]
        },
        "food": {
          "items": [
            "Основной обед — в Georgioupoli.",
            "Ужин — рядом с домом после сборов."
          ]
        },
        "practical": {
          "items": [
            "Не бронировать ничего невозвратного до проверки погоды.",
            "При накопившейся усталости остаёмся в Platanes / Rethymno без чувства долга перед картой.",
            "Вечером проверить заправку, документы, багаж и порядок возврата машины."
          ]
        }
      },
      "mealSummary": "обед в Georgioupoli; вечером ужин и сборы у базы"
    },
    "2026-08-22": {
      "id": "2026-08-22",
      "title": "Выезд в Heraklion Airport",
      "status": "draft",
      "metrics": {
        "status": "Черновик",
        "departureTime": "10:30–10:45",
        "carReturn": "вернуть до 14:00",
        "flight": "HN 2322 · 17:55",
        "drivingDurationMinutes": 75,
        "distanceKm": 80
      },
      "metricDisplayHints": {
        "status": "Черновик",
        "departureTime": "10:30–10:45",
        "carReturn": "вернуть до 14:00",
        "flight": "HN 2322 · 17:55",
        "drivingDurationMinutes": "около 1 ч 15 мин",
        "distanceKm": "около 80 км"
      },
      "visitIds": [
        "2026-08-22-pomegranate-garden-villa",
        "2026-08-22-gomega-car-rentals-heraklion",
        "2026-08-22-heraklion-international-airport-n-kazantzakis"
      ],
      "routeId": "route-2026-08-22",
      "sections": {
        "essentials": {
          "items": [
            "Выезд из Platanes около 10:30–10:45.",
            "Автомобиль нужно вернуть до 14:00.",
            "Рейс Heraklion → Vilnius вылетает в 17:55."
          ]
        },
        "food": {
          "items": [
            "Нормальный завтрак дома перед выездом.",
            "В аэропорту предусмотреть перекус после возврата машины."
          ]
        },
        "practical": {
          "items": [
            "Заложен запас на дорогу, дозаправку, возврат машины, шаттл и багаж.",
            "Не планируем остановки и достопримечательности по пути в аэропорт.",
            "Накануне уточнить у GoMega точную точку и процедуру возврата."
          ]
        }
      },
      "mealSummary": "завтрак дома; перекус в аэропорту"
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
    "chania-old-town-and-venetian-port": {
      "id": "chania-old-town-and-venetian-port",
      "name": "Chania Old Town & Venetian Port",
      "coordinates": {
        "lat": 35.5156,
        "lon": 24.0173
      },
      "navigationQuery": "Chania Old Town, Greece",
      "transportMode": "driving"
    },
    "marathi-beach": {
      "id": "marathi-beach",
      "name": "Marathi Beach",
      "coordinates": {
        "lat": 35.5059,
        "lon": 24.1738
      },
      "navigationQuery": "Marathi Beach, Chania, Greece",
      "transportMode": "driving"
    },
    "margarites": {
      "id": "margarites",
      "name": "Margarites",
      "coordinates": {
        "lat": 35.3408,
        "lon": 24.6862
      },
      "navigationQuery": "Margarites, Rethymno, Greece",
      "transportMode": "driving"
    },
    "eleftherna": {
      "id": "eleftherna",
      "name": "Eleftherna",
      "coordinates": {
        "lat": 35.3263,
        "lon": 24.6774
      },
      "navigationQuery": "Ancient Eleftherna, Crete, Greece",
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
    "plakias": {
      "id": "plakias",
      "name": "Plakias",
      "coordinates": {
        "lat": 35.1907,
        "lon": 24.3943
      },
      "navigationQuery": "Plakias Beach, Crete, Greece",
      "transportMode": "driving"
    },
    "falassarna-beach": {
      "id": "falassarna-beach",
      "name": "Falassarna Beach",
      "coordinates": {
        "lat": 35.4947,
        "lon": 23.5797
      },
      "navigationQuery": "Falassarna Beach, Crete, Greece",
      "transportMode": "driving"
    },
    "lake-kournas": {
      "id": "lake-kournas",
      "name": "Lake Kournas",
      "coordinates": {
        "lat": 35.3312,
        "lon": 24.2769
      },
      "navigationQuery": "Lake Kournas, Crete, Greece",
      "transportMode": "driving"
    },
    "georgioupoli": {
      "id": "georgioupoli",
      "name": "Georgioupoli",
      "coordinates": {
        "lat": 35.3629,
        "lon": 24.2606
      },
      "navigationQuery": "Georgioupoli Beach, Crete, Greece",
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
        "label": "05:15",
        "start": "05:15",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
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
      "durationDisplayHint": "Вылет"
    },
    "2026-08-11-heraklion-international-airport-n-kazantzakis": {
      "id": "2026-08-11-heraklion-international-airport-n-kazantzakis",
      "dayId": "2026-08-11",
      "placeId": "heraklion-international-airport-n-kazantzakis",
      "sequence": 1,
      "role": "Прилёт, багаж, шаттл и машина",
      "timing": {
        "label": "08:35–10:30",
        "start": "08:35",
        "end": "10:30"
      },
      "durationMinutes": 115,
      "inboundTravel": {
        "mode": "flight",
        "durationMinutes": 200,
        "distanceKm": 2144,
        "displayHints": {
          "duration": "3 ч 20 мин",
          "distance": "2 144 км"
        }
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
      "durationDisplayHint": "1 ч 55 мин"
    },
    "2026-08-11-mochlos": {
      "id": "2026-08-11-mochlos",
      "dayId": "2026-08-11",
      "placeId": "mochlos",
      "sequence": 2,
      "role": "Прогулка, обед, возможное купание",
      "timing": {
        "label": "12:15–14:15",
        "start": "12:15",
        "end": "14:15"
      },
      "durationMinutes": 120,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 105,
        "distanceKm": 98,
        "displayHints": {
          "duration": "1 ч 45 мин",
          "distance": "98 км"
        }
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
      "durationDisplayHint": "2 ч"
    },
    "2026-08-11-sitia-airbnb": {
      "id": "2026-08-11-sitia-airbnb",
      "dayId": "2026-08-11",
      "placeId": "sitia-airbnb",
      "sequence": 3,
      "role": "База 11–15 августа",
      "timing": {
        "label": "15:00",
        "start": "15:00",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 45,
        "distanceKm": 35,
        "displayHints": {
          "duration": "45 мин",
          "distance": "35 км"
        }
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
      "durationDisplayHint": "Заселение и отдых"
    },
    "2026-08-12-sitia-airbnb": {
      "id": "2026-08-12-sitia-airbnb",
      "dayId": "2026-08-12",
      "placeId": "sitia-airbnb",
      "sequence": 0,
      "role": "Выезд",
      "timing": {
        "label": "09:45",
        "start": "09:45",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
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
      "durationDisplayHint": "Старт"
    },
    "2026-08-12-toplou-monastery-and-toplou-fabrica": {
      "id": "2026-08-12-toplou-monastery-and-toplou-fabrica",
      "dayId": "2026-08-12",
      "placeId": "toplou-monastery-and-toplou-fabrica",
      "sequence": 1,
      "role": "Монастырь, музей и подтверждённая семейная дегустация",
      "timing": {
        "label": "10:10–12:10",
        "start": "10:10",
        "end": "12:10"
      },
      "durationMinutes": 120,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 25,
        "distanceKm": 15,
        "displayHints": {
          "duration": "25 мин",
          "distance": "15 км"
        }
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
      "durationDisplayHint": "2 ч"
    },
    "2026-08-12-paralia-chiona-hiona-taverna": {
      "id": "2026-08-12-paralia-chiona-hiona-taverna",
      "dayId": "2026-08-12",
      "placeId": "paralia-chiona-hiona-taverna",
      "sequence": 2,
      "role": "Поздний обед и купание",
      "timing": {
        "label": "12:30–15:10",
        "start": "12:30",
        "end": "15:10"
      },
      "durationMinutes": 160,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 20,
        "distanceKm": 11,
        "displayHints": {
          "duration": "20 мин",
          "distance": "11 км"
        }
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
      "durationDisplayHint": "2 ч 40 мин"
    },
    "2026-08-12-ancient-city-itanos-erimoupolis-beach-parking": {
      "id": "2026-08-12-ancient-city-itanos-erimoupolis-beach-parking",
      "dayId": "2026-08-12",
      "placeId": "ancient-city-itanos-erimoupolis-beach-parking",
      "sequence": 3,
      "role": "Археология и короткое купание",
      "timing": {
        "label": "15:35–16:35",
        "start": "15:35",
        "end": "16:35"
      },
      "durationMinutes": 60,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 25,
        "distanceKm": 14,
        "displayHints": {
          "duration": "25 мин",
          "distance": "14 км"
        }
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
      "durationDisplayHint": "1 ч"
    },
    "2026-08-12-vai-beach": {
      "id": "2026-08-12-vai-beach",
      "dayId": "2026-08-12",
      "placeId": "vai-beach",
      "sequence": 4,
      "role": "Пальмовый лес и вечерний пляж",
      "timing": {
        "label": "16:45–18:15",
        "start": "16:45",
        "end": "18:15"
      },
      "durationMinutes": 90,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 10,
        "distanceKm": 3,
        "displayHints": {
          "duration": "10 мин",
          "distance": "3 км"
        }
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
      "durationDisplayHint": "1 ч 30 мин"
    },
    "2026-08-12-sitia-airbnb-2": {
      "id": "2026-08-12-sitia-airbnb-2",
      "dayId": "2026-08-12",
      "placeId": "sitia-airbnb",
      "sequence": 5,
      "role": "Возвращение",
      "timing": {
        "label": "18:50",
        "start": "18:50",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 35,
        "distanceKm": 24,
        "displayHints": {
          "duration": "35 мин",
          "distance": "24 км"
        }
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
      "durationDisplayHint": "Финиш"
    },
    "2026-08-13-sitia-airbnb": {
      "id": "2026-08-13-sitia-airbnb",
      "dayId": "2026-08-13",
      "placeId": "sitia-airbnb",
      "sequence": 0,
      "role": "Выезд",
      "timing": {
        "label": "09:30",
        "start": "09:30",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
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
      "durationDisplayHint": "Старт"
    },
    "2026-08-13-ziros": {
      "id": "2026-08-13-ziros",
      "dayId": "2026-08-13",
      "placeId": "ziros",
      "sequence": 1,
      "role": "Кофе и короткая прогулка",
      "timing": {
        "label": "10:25–10:55",
        "start": "10:25",
        "end": "10:55"
      },
      "durationMinutes": 30,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 55,
        "distanceKm": 31,
        "displayHints": {
          "duration": "55 мин",
          "distance": "31 км"
        }
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
      "durationDisplayHint": "30 мин"
    },
    "2026-08-13-mazida-ammos-beach": {
      "id": "2026-08-13-mazida-ammos-beach",
      "dayId": "2026-08-13",
      "placeId": "mazida-ammos-beach",
      "sequence": 2,
      "role": "Главный пляж",
      "timing": {
        "label": "11:30–14:45",
        "start": "11:30",
        "end": "14:45"
      },
      "durationMinutes": 195,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 35,
        "distanceKm": 13,
        "displayHints": {
          "duration": "35 мин",
          "distance": "13 км"
        }
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
      "durationDisplayHint": "3 ч 15 мин"
    },
    "2026-08-13-xerokampos-taverna-kostas": {
      "id": "2026-08-13-xerokampos-taverna-kostas",
      "dayId": "2026-08-13",
      "placeId": "xerokampos-taverna-kostas",
      "sequence": 3,
      "role": "Поздний обед",
      "timing": {
        "label": "14:55–16:15",
        "start": "14:55",
        "end": "16:15"
      },
      "durationMinutes": 80,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 10,
        "distanceKm": 2,
        "displayHints": {
          "duration": "10 мин",
          "distance": "2 км"
        }
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
      "durationDisplayHint": "1 ч 20 мин"
    },
    "2026-08-13-sitia-airbnb-2": {
      "id": "2026-08-13-sitia-airbnb-2",
      "dayId": "2026-08-13",
      "placeId": "sitia-airbnb",
      "sequence": 4,
      "role": "Возвращение и отдых",
      "timing": {
        "label": "17:50",
        "start": "17:50",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 95,
        "distanceKm": 52,
        "displayHints": {
          "duration": "1 ч 35 мин",
          "distance": "52 км"
        }
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
      "durationDisplayHint": "Финиш"
    },
    "2026-08-14-sitia-airbnb": {
      "id": "2026-08-14-sitia-airbnb",
      "dayId": "2026-08-14",
      "placeId": "sitia-airbnb",
      "sequence": 0,
      "role": "Выезд",
      "timing": {
        "label": "09:30",
        "start": "09:30",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
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
      "durationDisplayHint": "Старт"
    },
    "2026-08-14-zakros-springs-and-water-and-water-power-museum-of-zakros": {
      "id": "2026-08-14-zakros-springs-and-water-and-water-power-museum-of-zakros",
      "dayId": "2026-08-14",
      "placeId": "zakros-springs-and-water-and-water-power-museum-of-zakros",
      "sequence": 1,
      "role": "Источники, мельницы, музей и деревня",
      "timing": {
        "label": "10:30–11:30",
        "start": "10:30",
        "end": "11:30"
      },
      "durationMinutes": 60,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 60,
        "distanceKm": 44,
        "displayHints": {
          "duration": "1 ч",
          "distance": "44 км"
        }
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
      "durationDisplayHint": "1 ч"
    },
    "2026-08-14-minoan-palace-of-zakros": {
      "id": "2026-08-14-minoan-palace-of-zakros",
      "dayId": "2026-08-14",
      "placeId": "minoan-palace-of-zakros",
      "sequence": 2,
      "role": "Археологический участок",
      "timing": {
        "label": "11:50–13:05",
        "start": "11:50",
        "end": "13:05"
      },
      "durationMinutes": 75,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 20,
        "distanceKm": 8,
        "displayHints": {
          "duration": "20 мин",
          "distance": "8 км"
        }
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
      "durationDisplayHint": "1 ч 15 мин"
    },
    "2026-08-14-kato-zakros-nostos-beach": {
      "id": "2026-08-14-kato-zakros-nostos-beach",
      "dayId": "2026-08-14",
      "placeId": "kato-zakros-nostos-beach",
      "sequence": 3,
      "role": "Обед, пляж и купание",
      "timing": {
        "label": "13:10–16:50",
        "start": "13:10",
        "end": "16:50"
      },
      "durationMinutes": 220,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 5,
        "distanceKm": 1,
        "displayHints": {
          "duration": "5 мин",
          "distance": "1 км"
        }
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
      "durationDisplayHint": "3 ч 40 мин"
    },
    "2026-08-14-sitia-airbnb-2": {
      "id": "2026-08-14-sitia-airbnb-2",
      "dayId": "2026-08-14",
      "placeId": "sitia-airbnb",
      "sequence": 4,
      "role": "Возвращение",
      "timing": {
        "label": "18:05",
        "start": "18:05",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 75,
        "distanceKm": 45,
        "displayHints": {
          "duration": "1 ч 15 мин",
          "distance": "45 км"
        }
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
      "durationDisplayHint": "Финиш"
    },
    "2026-08-15-sitia-airbnb": {
      "id": "2026-08-15-sitia-airbnb",
      "dayId": "2026-08-15",
      "placeId": "sitia-airbnb",
      "sequence": 0,
      "role": "Начало дня",
      "timing": {
        "label": "08:30",
        "start": "08:30",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
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
      "durationDisplayHint": "Старт"
    },
    "2026-08-15-kazarma-fortress": {
      "id": "2026-08-15-kazarma-fortress",
      "dayId": "2026-08-15",
      "placeId": "kazarma-fortress",
      "sequence": 1,
      "role": "Крепость изнутри",
      "timing": {
        "label": "08:35–09:20",
        "start": "08:35",
        "end": "09:20"
      },
      "durationMinutes": 45,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 5,
        "distanceKm": 1,
        "displayHints": {
          "duration": "5 мин",
          "distance": "1 км"
        }
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
      "durationDisplayHint": "45 мин"
    },
    "2026-08-15-sitia-airbnb-2": {
      "id": "2026-08-15-sitia-airbnb-2",
      "dayId": "2026-08-15",
      "placeId": "sitia-airbnb",
      "sequence": 2,
      "role": "Завтрак, сборы и загрузка",
      "timing": {
        "label": "09:25–10:40",
        "start": "09:25",
        "end": "10:40"
      },
      "durationMinutes": 75,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 5,
        "distanceKm": 1,
        "displayHints": {
          "duration": "5 мин",
          "distance": "1 км"
        }
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
      "durationDisplayHint": "1 ч 15 мин"
    },
    "2026-08-15-mathena-olive-tree-lastros": {
      "id": "2026-08-15-mathena-olive-tree-lastros",
      "dayId": "2026-08-15",
      "placeId": "mathena-olive-tree-lastros",
      "sequence": 3,
      "role": "Древняя олива, прогулка и ранний обед",
      "timing": {
        "label": "11:20–12:45",
        "start": "11:20",
        "end": "12:45"
      },
      "durationMinutes": 85,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 40,
        "distanceKm": 34,
        "displayHints": {
          "duration": "40 мин",
          "distance": "34 км"
        }
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
      "durationDisplayHint": "1 ч 25 мин"
    },
    "2026-08-15-pomegranate-garden-villa": {
      "id": "2026-08-15-pomegranate-garden-villa",
      "dayId": "2026-08-15",
      "placeId": "pomegranate-garden-villa",
      "sequence": 4,
      "role": "Заселение и отдых",
      "timing": {
        "label": "15:15",
        "start": "15:15",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 150,
        "distanceKm": 130,
        "displayHints": {
          "duration": "2 ч 30 мин",
          "distance": "130 км"
        }
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
      "durationDisplayHint": "Финиш"
    },
    "2026-08-16-pomegranate-garden-villa": {
      "id": "2026-08-16-pomegranate-garden-villa",
      "dayId": "2026-08-16",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Спокойное начало дня",
      "timing": {
        "label": "10:30",
        "start": "10:30",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
      },
      "note": "Без раннего подъёма после переезда.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Старт"
    },
    "2026-08-16-rethymno-old-town-and-venetian-harbour": {
      "id": "2026-08-16-rethymno-old-town-and-venetian-harbour",
      "dayId": "2026-08-16",
      "placeId": "rethymno-old-town-and-venetian-harbour",
      "sequence": 1,
      "role": "Прогулка, обед и первое знакомство с городом",
      "timing": {
        "label": "11:00–14:15",
        "start": "11:00",
        "end": "14:15"
      },
      "durationMinutes": 195,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 25,
        "distanceKm": 8,
        "displayHints": {
          "duration": "25 мин",
          "distance": "8 км"
        }
      },
      "note": "Короткая прогулка без задачи осмотреть весь старый город.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "3 ч 15 мин"
    },
    "2026-08-16-platanes-beach": {
      "id": "2026-08-16-platanes-beach",
      "dayId": "2026-08-16",
      "placeId": "platanes-beach",
      "sequence": 2,
      "role": "Отдых и купание рядом с базой",
      "timing": {
        "label": "15:00–18:00",
        "start": "15:00",
        "end": "18:00"
      },
      "durationMinutes": 180,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 25,
        "distanceKm": 9,
        "displayHints": {
          "duration": "25 мин",
          "distance": "9 км"
        }
      },
      "note": "Главная цель второй половины дня — спокойно отдохнуть.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "3 ч"
    },
    "2026-08-16-pomegranate-garden-villa-2": {
      "id": "2026-08-16-pomegranate-garden-villa-2",
      "dayId": "2026-08-16",
      "placeId": "pomegranate-garden-villa",
      "sequence": 3,
      "role": "Возвращение",
      "timing": {
        "label": "18:10",
        "start": "18:10",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 10,
        "distanceKm": 3,
        "displayHints": {
          "duration": "10 мин",
          "distance": "3 км"
        }
      },
      "note": "Ужин в Platanes или рядом с домом.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Финиш"
    },
    "2026-08-17-pomegranate-garden-villa": {
      "id": "2026-08-17-pomegranate-garden-villa",
      "dayId": "2026-08-17",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Выезд",
      "timing": {
        "label": "09:45",
        "start": "09:45",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
      },
      "note": "Оставляем запас на парковку в Chania.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Старт"
    },
    "2026-08-17-chania-old-town-and-venetian-port": {
      "id": "2026-08-17-chania-old-town-and-venetian-port",
      "dayId": "2026-08-17",
      "placeId": "chania-old-town-and-venetian-port",
      "sequence": 1,
      "role": "Город, прогулка и обед",
      "timing": {
        "label": "10:50–14:10",
        "start": "10:50",
        "end": "14:10"
      },
      "durationMinutes": 200,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 65,
        "distanceKm": 70,
        "displayHints": {
          "duration": "1 ч 05 мин",
          "distance": "70 км"
        }
      },
      "note": "Осматриваем компактно, без долгой прогулки по жаре.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "3 ч 20 мин"
    },
    "2026-08-17-marathi-beach": {
      "id": "2026-08-17-marathi-beach",
      "dayId": "2026-08-17",
      "placeId": "marathi-beach",
      "sequence": 2,
      "role": "Пляж и купание в бухте",
      "timing": {
        "label": "14:45–17:45",
        "start": "14:45",
        "end": "17:45"
      },
      "durationMinutes": 180,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 35,
        "distanceKm": 18,
        "displayHints": {
          "duration": "35 мин",
          "distance": "18 км"
        }
      },
      "note": "Пляжная часть дня зависит от ветра и состояния моря.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "3 ч"
    },
    "2026-08-17-pomegranate-garden-villa-2": {
      "id": "2026-08-17-pomegranate-garden-villa-2",
      "dayId": "2026-08-17",
      "placeId": "pomegranate-garden-villa",
      "sequence": 3,
      "role": "Возвращение",
      "timing": {
        "label": "19:15",
        "start": "19:15",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 90,
        "distanceKm": 77,
        "displayHints": {
          "duration": "1 ч 30 мин",
          "distance": "77 км"
        }
      },
      "note": "Вечером только лёгкий ужин по аппетиту.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Финиш"
    },
    "2026-08-18-pomegranate-garden-villa": {
      "id": "2026-08-18-pomegranate-garden-villa",
      "dayId": "2026-08-18",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Выезд",
      "timing": {
        "label": "10:00",
        "start": "10:00",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
      },
      "note": "Лёгкий сельский день без раннего старта.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Старт"
    },
    "2026-08-18-margarites": {
      "id": "2026-08-18-margarites",
      "dayId": "2026-08-18",
      "placeId": "margarites",
      "sequence": 1,
      "role": "Деревня, керамика и короткая прогулка",
      "timing": {
        "label": "10:40–12:10",
        "start": "10:40",
        "end": "12:10"
      },
      "durationMinutes": 90,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 40,
        "distanceKm": 28,
        "displayHints": {
          "duration": "40 мин",
          "distance": "28 км"
        }
      },
      "note": "Не пытаемся зайти во все мастерские.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "1 ч 30 мин"
    },
    "2026-08-18-eleftherna": {
      "id": "2026-08-18-eleftherna",
      "dayId": "2026-08-18",
      "placeId": "eleftherna",
      "sequence": 2,
      "role": "История региона и короткая остановка",
      "timing": {
        "label": "12:25–13:45",
        "start": "12:25",
        "end": "13:45"
      },
      "durationMinutes": 80,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 15,
        "distanceKm": 8,
        "displayHints": {
          "duration": "15 мин",
          "distance": "8 км"
        }
      },
      "note": "Формат посещения уточним после проверки часов работы и жары.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "1 ч 20 мин"
    },
    "2026-08-18-panormo": {
      "id": "2026-08-18-panormo",
      "dayId": "2026-08-18",
      "placeId": "panormo",
      "sequence": 3,
      "role": "Поздний обед, деревня и купание",
      "timing": {
        "label": "14:20–18:00",
        "start": "14:20",
        "end": "18:00"
      },
      "durationMinutes": 220,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 35,
        "distanceKm": 25,
        "displayHints": {
          "duration": "35 мин",
          "distance": "25 км"
        }
      },
      "note": "Главная спокойная остановка второй половины дня.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "3 ч 40 мин"
    },
    "2026-08-18-pomegranate-garden-villa-2": {
      "id": "2026-08-18-pomegranate-garden-villa-2",
      "dayId": "2026-08-18",
      "placeId": "pomegranate-garden-villa",
      "sequence": 4,
      "role": "Возвращение",
      "timing": {
        "label": "18:25",
        "start": "18:25",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 25,
        "distanceKm": 19,
        "displayHints": {
          "duration": "25 мин",
          "distance": "19 км"
        }
      },
      "note": "Свободный вечер.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Финиш"
    },
    "2026-08-19-pomegranate-garden-villa": {
      "id": "2026-08-19-pomegranate-garden-villa",
      "dayId": "2026-08-19",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Выезд на юг",
      "timing": {
        "label": "09:45",
        "start": "09:45",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
      },
      "note": "Перед выездом проверить ветер и пожарные ограничения.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Старт"
    },
    "2026-08-19-plakias": {
      "id": "2026-08-19-plakias",
      "dayId": "2026-08-19",
      "placeId": "plakias",
      "sequence": 1,
      "role": "Живописная дорога, обед, пляж и купание",
      "timing": {
        "label": "10:45–17:10",
        "start": "10:45",
        "end": "17:10"
      },
      "durationMinutes": 385,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 60,
        "distanceKm": 47,
        "displayHints": {
          "duration": "1 ч",
          "distance": "47 км"
        }
      },
      "note": "Один основной пляж без гонки между бухтами.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "6 ч 25 мин"
    },
    "2026-08-19-pomegranate-garden-villa-2": {
      "id": "2026-08-19-pomegranate-garden-villa-2",
      "dayId": "2026-08-19",
      "placeId": "pomegranate-garden-villa",
      "sequence": 2,
      "role": "Возвращение",
      "timing": {
        "label": "18:10",
        "start": "18:10",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 60,
        "distanceKm": 47,
        "displayHints": {
          "duration": "1 ч",
          "distance": "47 км"
        }
      },
      "note": "Свободный вечер после горной дороги.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Финиш"
    },
    "2026-08-20-pomegranate-garden-villa": {
      "id": "2026-08-20-pomegranate-garden-villa",
      "dayId": "2026-08-20",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Выезд на запад",
      "timing": {
        "label": "09:00",
        "start": "09:00",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
      },
      "note": "Самый длинный автомобильный день западной части.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Старт"
    },
    "2026-08-20-falassarna-beach": {
      "id": "2026-08-20-falassarna-beach",
      "dayId": "2026-08-20",
      "placeId": "falassarna-beach",
      "sequence": 1,
      "role": "Главный западный пляж и долгий отдых",
      "timing": {
        "label": "11:05–17:20",
        "start": "11:05",
        "end": "17:20"
      },
      "durationMinutes": 375,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 125,
        "distanceKm": 140,
        "displayHints": {
          "duration": "2 ч 05 мин",
          "distance": "140 км"
        }
      },
      "note": "Едем только при подходящем ветре и нормальном состоянии моря.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "6 ч 15 мин"
    },
    "2026-08-20-pomegranate-garden-villa-2": {
      "id": "2026-08-20-pomegranate-garden-villa-2",
      "dayId": "2026-08-20",
      "placeId": "pomegranate-garden-villa",
      "sequence": 2,
      "role": "Возвращение",
      "timing": {
        "label": "19:25",
        "start": "19:25",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 125,
        "distanceKm": 140,
        "displayHints": {
          "duration": "2 ч 05 мин",
          "distance": "140 км"
        }
      },
      "note": "После возвращения не планируем обязательных дел.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Финиш"
    },
    "2026-08-21-pomegranate-garden-villa": {
      "id": "2026-08-21-pomegranate-garden-villa",
      "dayId": "2026-08-21",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Гибкий старт",
      "timing": {
        "label": "10:00",
        "start": "10:00",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
      },
      "note": "Можно полностью заменить отдыхом у базы или перенесённой поездкой.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Старт"
    },
    "2026-08-21-lake-kournas": {
      "id": "2026-08-21-lake-kournas",
      "dayId": "2026-08-21",
      "placeId": "lake-kournas",
      "sequence": 1,
      "role": "Озеро и спокойная утренняя остановка",
      "timing": {
        "label": "10:45–13:00",
        "start": "10:45",
        "end": "13:00"
      },
      "durationMinutes": 135,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 45,
        "distanceKm": 45,
        "displayHints": {
          "duration": "45 мин",
          "distance": "45 км"
        }
      },
      "note": "Необязательная часть резервного дня.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "2 ч 15 мин"
    },
    "2026-08-21-georgioupoli": {
      "id": "2026-08-21-georgioupoli",
      "dayId": "2026-08-21",
      "placeId": "georgioupoli",
      "sequence": 2,
      "role": "Обед, пляж и купание",
      "timing": {
        "label": "13:20–17:30",
        "start": "13:20",
        "end": "17:30"
      },
      "durationMinutes": 250,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 20,
        "distanceKm": 8,
        "displayHints": {
          "duration": "20 мин",
          "distance": "8 км"
        }
      },
      "note": "Лёгкая длинная остановка перед финальным днём поездки.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "4 ч 10 мин"
    },
    "2026-08-21-pomegranate-garden-villa-2": {
      "id": "2026-08-21-pomegranate-garden-villa-2",
      "dayId": "2026-08-21",
      "placeId": "pomegranate-garden-villa",
      "sequence": 3,
      "role": "Возвращение и сборы",
      "timing": {
        "label": "18:15",
        "start": "18:15",
        "end": null
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 45,
        "distanceKm": 49,
        "displayHints": {
          "duration": "45 мин",
          "distance": "49 км"
        }
      },
      "note": "Вечером спокойно собрать вещи перед аэропортом.",
      "parking": {
        "primaryId": null,
        "primaryOverrides": null,
        "alternatives": []
      },
      "map": {
        "visible": true
      },
      "durationDisplayHint": "Финиш"
    },
    "2026-08-22-pomegranate-garden-villa": {
      "id": "2026-08-22-pomegranate-garden-villa",
      "dayId": "2026-08-22",
      "placeId": "pomegranate-garden-villa",
      "sequence": 0,
      "role": "Выселение и выезд",
      "timing": {
        "label": "10:30–10:45",
        "start": "10:30",
        "end": "10:45"
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "—",
          "distance": "—"
        }
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
      "durationDisplayHint": "Старт"
    },
    "2026-08-22-gomega-car-rentals-heraklion": {
      "id": "2026-08-22-gomega-car-rentals-heraklion",
      "dayId": "2026-08-22",
      "placeId": "gomega-car-rentals-heraklion",
      "sequence": 1,
      "role": "Дозаправка по пути, возврат автомобиля и шаттл",
      "timing": {
        "label": "12:15–13:30",
        "start": "12:15",
        "end": "13:30"
      },
      "durationMinutes": 75,
      "inboundTravel": {
        "mode": "driving",
        "durationMinutes": 75,
        "distanceKm": 80,
        "displayHints": {
          "duration": "1 ч 15 мин",
          "distance": "80 км"
        }
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
      "durationDisplayHint": "1 ч 15 мин"
    },
    "2026-08-22-heraklion-international-airport-n-kazantzakis": {
      "id": "2026-08-22-heraklion-international-airport-n-kazantzakis",
      "dayId": "2026-08-22",
      "placeId": "heraklion-international-airport-n-kazantzakis",
      "sequence": 2,
      "role": "Багаж, регистрация и вылет",
      "timing": {
        "label": "около 13:30–17:55",
        "start": "13:30",
        "end": "17:55"
      },
      "durationMinutes": null,
      "inboundTravel": {
        "mode": "flight",
        "durationMinutes": null,
        "distanceKm": null,
        "displayHints": {
          "duration": "шаттл прокатчика",
          "distance": "несколько минут"
        }
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
      "durationDisplayHint": "Аэропорт"
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
        "2026-08-15-pomegranate-garden-villa"
      ]
    },
    "route-2026-08-16": {
      "id": "route-2026-08-16",
      "dayId": "2026-08-16",
      "mode": "driving",
      "visitIds": [
        "2026-08-16-pomegranate-garden-villa",
        "2026-08-16-rethymno-old-town-and-venetian-harbour",
        "2026-08-16-platanes-beach",
        "2026-08-16-pomegranate-garden-villa-2"
      ]
    },
    "route-2026-08-17": {
      "id": "route-2026-08-17",
      "dayId": "2026-08-17",
      "mode": "driving",
      "visitIds": [
        "2026-08-17-pomegranate-garden-villa",
        "2026-08-17-chania-old-town-and-venetian-port",
        "2026-08-17-marathi-beach",
        "2026-08-17-pomegranate-garden-villa-2"
      ]
    },
    "route-2026-08-18": {
      "id": "route-2026-08-18",
      "dayId": "2026-08-18",
      "mode": "driving",
      "visitIds": [
        "2026-08-18-pomegranate-garden-villa",
        "2026-08-18-margarites",
        "2026-08-18-eleftherna",
        "2026-08-18-panormo",
        "2026-08-18-pomegranate-garden-villa-2"
      ]
    },
    "route-2026-08-19": {
      "id": "route-2026-08-19",
      "dayId": "2026-08-19",
      "mode": "driving",
      "visitIds": [
        "2026-08-19-pomegranate-garden-villa",
        "2026-08-19-plakias",
        "2026-08-19-pomegranate-garden-villa-2"
      ]
    },
    "route-2026-08-20": {
      "id": "route-2026-08-20",
      "dayId": "2026-08-20",
      "mode": "driving",
      "visitIds": [
        "2026-08-20-pomegranate-garden-villa",
        "2026-08-20-falassarna-beach",
        "2026-08-20-pomegranate-garden-villa-2"
      ]
    },
    "route-2026-08-21": {
      "id": "route-2026-08-21",
      "dayId": "2026-08-21",
      "mode": "driving",
      "visitIds": [
        "2026-08-21-pomegranate-garden-villa",
        "2026-08-21-lake-kournas",
        "2026-08-21-georgioupoli",
        "2026-08-21-pomegranate-garden-villa-2"
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
