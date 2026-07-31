import fs from 'node:fs';
import vm from 'node:vm';

const appPath = 'app.js';
let app = fs.readFileSync(appPath, 'utf8');

const hashBefore = "    if (!hash || hash === 'overview') return null;";
const hashAfter = "    if (!hash) return null;\n    if (hash === 'overview') return { panelId:'overview', partId:'overview' };";
if (!app.includes(hashBefore)) throw new Error('Hash overview condition not found');
app = app.replace(hashBefore, hashAfter);

const tabsBefore = "      const buttons = [...tabs.querySelectorAll('.tab-button')];";
const tabsAfter = "      const buttons = [...tabs.querySelectorAll('.tab-button:not(:disabled)')];";
if (!app.includes(tabsBefore)) throw new Error('Day tab keyboard collection not found');
app = app.replace(tabsBefore, tabsAfter);

new vm.Script(app, { filename:'app.js' });
if (!app.includes("hash === 'overview'")) throw new Error('Explicit overview hash support missing');
if (!app.includes(".tab-button:not(:disabled)")) throw new Error('Disabled day tabs are still keyboard targets');

fs.writeFileSync(appPath, app);
fs.rmSync('scripts/fix-navigation-followups.mjs');
fs.rmSync('.github/workflows/fix-navigation-followups.yml');
