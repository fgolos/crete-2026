import fs from 'node:fs';

function replaceOnce(content, search, replacement, label) {
  if (!content.includes(search)) throw new Error(`Cleanup target not found: ${label}`);
  return content.replace(search, replacement);
}

function update(path, transform) {
  const before = fs.readFileSync(path, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`Cleanup made no changes to ${path}`);
  fs.writeFileSync(path, after);
}

update('app-runtime.js', content => {
  content = replaceOnce(content, `  function parseTimeToMinutes(timeStr) {\n    if (!timeStr || timeStr === '—' || timeStr === '-') return 0;\n    const compactMatch = timeStr.match(/^(\\d+):(\\d{2})$/);\n    if (compactMatch) return Number(compactMatch[1]) * 60 + Number(compactMatch[2]);\n    let minutes = 0;\n    const hourMatch = timeStr.match(/(\\d+)\\s*(?:h|ч)/i);\n    const minMatch = timeStr.match(/(\\d+)\\s*(?:m|мин)/i);\n    if (hourMatch) minutes += Number(hourMatch[1]) * 60;\n    if (minMatch) minutes += Number(minMatch[1]);\n    return minutes;\n  }\n\n`, '', 'unused parseTimeToMinutes');

  content = replaceOnce(content, `  function formatClockTime(minutesSinceMidnight) {\n    const hours = Math.floor(minutesSinceMidnight / 60);\n    const minutes = minutesSinceMidnight % 60;\n    return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}\`;\n  }\n\n`, '', 'debug-only formatClockTime');

  content = replaceOnce(content, `    let timelineEvents = []; // Track events with actual clock times\n    \n`, '', 'unused timelineEvents declaration');

  content = replaceOnce(content, `      // Add events to timeline\n      if (stopStartTime !== null) {\n        timelineEvents.push({\n          time: stopStartTime,\n          type: 'stop-start',\n          stopIndex: i,\n          stopName: stop.name\n        });\n        if (stopEndTime !== null) {\n          timelineEvents.push({\n            time: stopEndTime,\n            type: 'stop-end',\n            stopIndex: i,\n            stopName: stop.name\n          });\n          maxEndTime = Math.max(maxEndTime, stopEndTime);\n        } else {\n          maxEndTime = Math.max(maxEndTime, stopStartTime);\n        }\n      }\n`, `      if (stopStartTime !== null) {\n        maxEndTime = Math.max(maxEndTime, stopEndTime ?? stopStartTime);\n      }\n`, 'unused timeline event collection');

  content = replaceOnce(content, `    console.log(\`DEBUG: \${day.id} - startMinutes: \${startMinutes} (\${formatClockTime(startMinutes)}), endTime: \${maxEndTime} (\${formatClockTime(maxEndTime)}), total: \${totalMinutes}\`);\n    \n`, '', 'timeline debug log');

  content = replaceOnce(content, `    // Determine CSS class suffix based on hover/selected\n    const suffix = isHover ? 'hovered' : 'active';\n    const selectionClass = isHover ? 'is-hovered' : 'is-selected';\n    const rowActiveClass = isHover ? 'is-hovered' : 'is-active';\n`, `    const selectionClass = isHover ? 'is-hovered' : 'is-selected';\n`, 'unused selection variables');

  return content;
});

update('itinerary-data.js', content => {
  content = replaceOnce(content, `  function normalizePayment(paid) {\n    if (paid === true) return { type: 'paid' };\n    if (paid === false) return { type: 'free' };\n    return { type: 'unknown' };\n  }\n\n`, `  function normalizePayment(paid) {\n    if (paid === true) return { type: 'paid' };\n    if (paid === false) return { type: 'free' };\n    return { type: 'unknown' };\n  }\n\n  function parkingOverrides(link) {\n    if (!link) return null;\n    const { ref: _ref, ...overrides } = link;\n    return overrides;\n  }\n\n`, 'parking override helper');

  content = replaceOnce(content, `            primaryId: parking.primary?.ref || null,\n            primaryOverrides: parking.primary ? { ...parking.primary, ref: undefined } : null,\n            alternatives: (parking.alternatives || []).map(link => ({ id: link.ref, overrides: { ...link, ref: undefined } }))\n`, `            primaryId: parking.primary?.ref || null,\n            primaryOverrides: parkingOverrides(parking.primary),\n            alternatives: (parking.alternatives || []).map(link => ({ id: link.ref, overrides: parkingOverrides(link) }))\n`, 'normalized parking overrides');

  return content;
});

update('itinerary-bootstrap.js', content => {
  const start = `  const projected = window.CRETE_DATA_API.projectLegacyData(data, source, window.CRETE_FORMATTERS);\n\n`;
  const end = `  window.CRETE_DATA = data;\n`;
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end, startIndex);
  if (startIndex < 0 || endIndex < 0) throw new Error('Cleanup target not found: bootstrap parking repair');
  return content.slice(0, startIndex) + start + content.slice(endIndex);
});

update('scripts/validate-itinerary.mjs', content => {
  const loopStart = `for (const day of projected.days || []) {\n`;
  const loopEnd = `validation.valid = validation.errors.length === 0;\n`;
  const startIndex = content.indexOf(loopStart);
  const endIndex = content.indexOf(loopEnd, startIndex);
  if (startIndex < 0 || endIndex < 0) throw new Error('Cleanup target not found: projected parking validation loop');

  const replacement = `for (const day of projected.days || []) {\n  for (const stop of day.stops || []) {\n    const links = [stop.parking?.primary, ...(stop.parking?.alternatives || [])].filter(Boolean);\n    for (const link of links) {\n      if (!link.ref || !projected.parkingLocations?.[link.ref]) {\n        validation.errors.push(\`Projected parking reference is invalid for \${day.id}: \${stop.name}\`);\n      }\n    }\n  }\n}\n`;

  return content.slice(0, startIndex) + replacement + content.slice(endIndex);
});

update('service-worker.js', content => replaceOnce(
  content,
  "const CACHE_VERSION = 'crete-2026-v18';",
  "const CACHE_VERSION = 'crete-2026-v19';",
  'cache version'
));

console.log('Runtime and compatibility cleanup applied.');
