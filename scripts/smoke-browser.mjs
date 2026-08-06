import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

function existingFile(candidate) {
  return candidate && fs.existsSync(candidate) && fs.statSync(candidate).isFile();
}

function browserPaths() {
  const candidates = [
    process.env.CRETE_BROWSER_PATH,
    process.env.CHROME_PATH,
    process.env.CHROMIUM_PATH,
    process.env.EDGE_PATH
  ];

  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    const programFiles = process.env.PROGRAMFILES;
    const programFilesX86 = process.env['PROGRAMFILES(X86)'];
    candidates.push(
      localAppData && path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      programFiles && path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      programFilesX86 && path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      programFiles && path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      programFilesX86 && path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      localAppData && path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      localAppData && path.join(localAppData, 'Chromium', 'Application', 'chrome.exe'),
      programFiles && path.join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
      localAppData && path.join(localAppData, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe')
    );
  } else if (process.platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
    );
  }

  return candidates.filter(Boolean);
}

function browserCommands() {
  if (process.platform === 'win32') {
    return ['chrome.exe', 'chrome', 'msedge.exe', 'msedge', 'chromium.exe', 'chromium', 'brave.exe', 'brave'];
  }
  return ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge', 'brave-browser'];
}

function resolveCommand(command) {
  const locator = process.platform === 'win32' ? 'where.exe' : 'which';
  const result = spawnSync(locator, [command], {
    encoding: 'utf8',
    windowsHide: true
  });
  if (result.status !== 0) return null;
  return result.stdout
    .split(/\r?\n/)
    .map(value => value.trim())
    .find(existingFile) || null;
}

function findBrowser() {
  const directPath = browserPaths().find(existingFile);
  if (directPath) return directPath;

  for (const command of browserCommands()) {
    const resolved = resolveCommand(command);
    if (resolved) return resolved;
  }

  throw new Error(
    'No supported Chrome/Chromium executable was found. ' +
    'Install Chrome, Edge, Chromium or Brave, or set CRETE_BROWSER_PATH to the browser executable.'
  );
}

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.mp3', 'audio/mpeg'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8']
]);

function createStaticServer(root) {
  const normalizedRoot = path.resolve(root);
  return http.createServer((request, response) => {
    try {
      const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
      const pathname = decodeURIComponent(requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname);
      const filePath = path.resolve(normalizedRoot, `.${pathname}`);
      const insideRoot = filePath === normalizedRoot || filePath.startsWith(`${normalizedRoot}${path.sep}`);
      if (!insideRoot || !existingFile(filePath)) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
      }

      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': MIME_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream'
      });
      fs.createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(error instanceof Error ? error.message : String(error));
    }
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });
}

function closeServer(server) {
  return new Promise(resolve => server.close(() => resolve()));
}

function dumpDom(browser, url, timeoutMs = 30000) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'crete-smoke-'));
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-background-networking',
    '--ignore-certificate-errors',
    `--user-data-dir=${profile}`,
    '--virtual-time-budget=8000',
    '--dump-dom',
    url
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(browser, args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (error, html = '') => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      fs.rmSync(profile, { recursive: true, force: true });
      if (error) reject(error);
      else resolve(html);
    };

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      stdout += chunk;
      if (stdout.length > 20 * 1024 * 1024) {
        child.kill();
        finish(new Error(`Browser output exceeded 20 MB for ${url}`));
      }
    });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.once('error', error => finish(error));
    child.once('close', code => {
      if (code !== 0) {
        finish(new Error(`Browser failed for ${url}: ${stderr || `exit ${code}`}`));
        return;
      }
      if (/Failed to execute 'querySelector'|Set map center and zoom first/.test(stderr)) {
        finish(new Error(`Browser runtime error for ${url}: ${stderr}`));
        return;
      }
      finish(null, stdout);
    });

    const timeout = setTimeout(() => {
      child.kill();
      finish(new Error(`Browser timed out after ${timeoutMs / 1000}s for ${url}`));
    }, timeoutMs);
  });
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
console.log(`Using browser: ${browser}`);

const server = createStaticServer(process.cwd());
await listen(server);
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Smoke-test server did not expose a TCP port');
const origin = `http://127.0.0.1:${address.port}`;

try {
  console.log('Testing overview...');
  const overview = await dumpDom(browser, `${origin}/#overview`);
  assertActivePanel(overview, 'overview', 'overview');
  assertIncludes(overview, 'data-day-id="2026-08-12"', 'overview');
  assertIncludes(overview, 'Бронирования и ожидания', 'overview');

  console.log('Testing East day...');
  const eastDay = await dumpDom(browser, `${origin}/#east/2026-08-12`);
  assertActivePanel(eastDay, '2026-08-12', 'east day');
  assertIncludes(eastDay, 'data-visit-id="2026-08-12-toplou-monastery-and-toplou-fabrica"', 'east day');
  assertIncludes(eastDay, 'class="story-open', 'east day story buttons');
  assertIncludes(eastDay, 'Открыть в Google Maps', 'east day map action');
  assertIncludes(eastDay, 'class="numbered-marker', 'east day Leaflet markers');

  console.log('Testing West day...');
  const westDay = await dumpDom(browser, `${origin}/#west/2026-08-16`);
  assertActivePanel(westDay, '2026-08-16', 'west day');
  assertIncludes(westDay, 'data-visit-id="2026-08-16-rethymno-old-town-and-venetian-harbour"', 'west day');
  assertIncludes(westDay, 'Памятка', 'west day mobile controls');
  assertIncludes(westDay, 'class="numbered-marker', 'west day Leaflet markers');

  console.log(`Headless browser smoke test passed with ${browser}.`);
} finally {
  await closeServer(server);
}
