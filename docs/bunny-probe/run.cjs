// node p3.cjs <page> <hour> <W> <H> <probe1.js> [probe2.js …] — chạy lần lượt từng probe (thân hàm async) trên CÙNG trang; sau mỗi probe chụp cả trang (gồm DOM) vào $PAGESHOT-<i>.png
const { chromium } = require(process.env.PLAYWRIGHT_PATH || (() => {   // playwright: biến PLAYWRIGHT_PATH, không thì bản mới nhất trong ~/.npm/_npx
  const fs = require('fs'), path = require('path'), d = path.join(require('os').homedir(), '.npm/_npx'); let best = null, bv = '';
  for (const x of fs.existsSync(d) ? fs.readdirSync(d) : []) { const p = path.join(d, x, 'node_modules/playwright'); try { const v = JSON.parse(fs.readFileSync(path.join(p, 'package.json'))).version; if (v.localeCompare(bv, undefined, { numeric: true }) > 0) { bv = v; best = p; } } catch {} }
  if (!best) throw new Error('không thấy playwright (đặt PLAYWRIGHT_PATH)'); return best;
})());
const fs = require('fs');
const [pagePath, H0, W, H, ...probes] = process.argv.slice(2);
(async () => {
  const br = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
  const page = await br.newPage({ viewport: { width: +W, height: +H } });
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('CONSOLE', m.type(), m.text().slice(0, 300)); });
  await page.addInitScript(h => { window.__hourOverride = h; }, +H0);
  await page.goto('http://localhost:' + (process.env.PORT || 8795) + '/' + pagePath + '?b=' + Date.now());
  await page.waitForFunction(() => window.__tBuilt !== undefined && window.__dbg, null, { timeout: 300000, polling: 500 });
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {}); await page.waitForTimeout(6000);
  for (let i = 0; i < probes.length; i++) {
    const r = await page.evaluate('(async () => {' + fs.readFileSync(probes[i], 'utf8') + '})()');
    if (r && r.shots) { for (const [n, u] of r.shots) fs.writeFileSync(n, Buffer.from(u.split(',')[1], 'base64')); r.shots = r.shots.map(s => s[0]); }
    console.log('#' + i, JSON.stringify(r));
    if (process.env.PAGESHOT) await page.screenshot({ path: process.env.PAGESHOT + '-' + i + '.png' });
  }
  await br.close();
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
