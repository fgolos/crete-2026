import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const port = 8123;
const origin = `http://127.0.0.1:${port}`;

function findBrowser() {
  for (const command of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    const result = spawnSync('which', [command], { encoding: 'utf8' });
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim();
  }
  throw new Error('No supported Chrome/Chromium executable was found');
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(origin, { cache: 'no-store' });
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error('Local smoke-test server did not start');
}

function dumpDom(browser, url) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'crete-smoke-'));
  try {
    const result = spawnSync(browser, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--ignore-certificate-errors',
      `--user-data-dir=${profile}`,
      '--virtual-time-budget=8000',
      '--dump-dom',
      url
    ], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
    if (result.status !== 0) {
      throw new Error(`Browser failed for ${url}: ${result.stderr || `exit ${result.status}`}`);
    }
    return result.stdout;
  } finally {
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

function assertIncludes(html, expected, label) {
  if (!html.includes(expected)) throw new Error(`${label}: missing ${expected}`);
}

function assertActivePanel(html, panelId, label) {
  const escaped = panelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<section id="${escaped}"[^>]*class="[^"]*\\bactive\\b`);
  if (!pattern.test(html)) throw new Error(`${label}: ${panelId} is not the active panel`);
}

const browser = findBrowser();
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'ignore', 'pipe']
});
let serverError = '';
server.stderr.on('data', chunk => { serverError += chunk; });

try {
  await waitForServer();

  const overview = dumpDom(browser, `${origin}/#overview`);
  assertActivePanel(overview, 'overview', 'overview');
  assertIncludes(overview, 'data-day-id="2026-08-12"', 'overview');
  assertIncludes(overview, 'Бронирования и ожидания', 'overview');

  const eastDay = dumpDom(browser, `${origin}/#east/2026-08-12`);
  assertActivePanel(eastDay, '2026-08-12', 'east day');
  assertIncludes(eastDay, 'data-visit-id="2026-08-12-toplou-monastery-and-toplou-fabrica"', 'east day');
  assertIncludes(eastDay, 'class="story-open', 'east day story buttons');
  assertIncludes(eastDay, 'Открыть в Google Maps', 'east day map action');

  const westDay = dumpDom(browser, `${origin}/#west/2026-08-16`);
  assertActivePanel(westDay, '2026-08-16', 'west day');
  assertIncludes(westDay, 'data-visit-id="2026-08-16-rethymno-old-town-and-venetian-harbour"', 'west day');
  assertIncludes(westDay, 'Памятка', 'west day mobile controls');

  console.log('Headless browser smoke test passed for overview, East and West day views.');
} finally {
  server.kill('SIGTERM');
  if (server.exitCode && server.exitCode !== 0) console.error(serverError);
}
