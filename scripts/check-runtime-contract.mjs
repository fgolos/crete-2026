import fs from 'node:fs';

const app = fs.readFileSync('app-runtime.js', 'utf8');
const requiredLegacyTokens = [
  'window.CRETE_ITINERARY',
  'data.parts',
  'data.days',
  'data.parkingLocations',
  'routeStopOrders',
  'stop.order'
];

for (const token of requiredLegacyTokens) {
  if (!app.includes(token)) {
    console.error(`Runtime contract check failed: missing ${token}`);
    process.exitCode = 1;
  }
}

if (!process.exitCode) console.log('Compatibility runtime contract is present.');
