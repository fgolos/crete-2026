import fs from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({ window: {}, Object, Array, Map, Set, Number, String, RegExp, Error });
vm.runInContext(fs.readFileSync('itinerary-data.js', 'utf8'), context, { filename: 'itinerary-data.js' });
const data = context.window.CRETE_DATA;

const report = {
  days: Object.values(data.days).map(day => ({
    id: day.id,
    status: day.status,
    metrics: day.metrics,
    metricDisplayHints: day.metricDisplayHints
  })),
  timingLabels: [...new Set(Object.values(data.visits).map(visit => visit.timing?.label).filter(Boolean))],
  nullDurationHints: [...new Set(Object.values(data.visits)
    .filter(visit => !Number.isFinite(visit.durationMinutes))
    .map(visit => visit.durationDisplayHint))],
  travelHints: [...new Set(Object.values(data.visits).map(visit => JSON.stringify({
    durationMinutes: visit.inboundTravel?.durationMinutes,
    distanceKm: visit.inboundTravel?.distanceKm,
    displayHints: visit.inboundTravel?.displayHints
  })))]
};

console.log(JSON.stringify(report, null, 2));
