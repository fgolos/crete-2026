import fs from 'node:fs';

const app = fs.readFileSync('app-runtime.js', 'utf8');
const bootstrap = fs.readFileSync('itinerary-bootstrap.js', 'utf8');
const stories = fs.readFileSync('stories-data.js', 'utf8');
const forbidden = ['window.CRETE_ITINERARY', 'projectLegacyData', 'routeStopOrders', 'data-stop-order', 'dataset.stopOrder', 'legacyVisitIndex'];
const required = ['window.CRETE_RENDERER_MODEL', 'routeVisitIds', 'data-visit-id', 'dataset.visitId'];

for (const token of forbidden) {
  if (app.includes(token) || bootstrap.includes(token) || stories.includes(token)) {
    console.error(`Native runtime contract failed: legacy token remains: ${token}`);
    process.exitCode = 1;
  }
}
for (const token of required) {
  if (!app.includes(token) && !bootstrap.includes(token)) {
    console.error(`Native runtime contract failed: missing ${token}`);
    process.exitCode = 1;
  }
}
if (!process.exitCode) console.log('Native normalized renderer contract is present.');
