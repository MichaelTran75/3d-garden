// node ev.cjs <trang> <harness> <giờ> <tệp js trả kết quả (biểu thức async)>
const { chromium } = require(process.env.HOME + '/.npm/_npx/0b9ff77863cb6e9f/node_modules/playwright');
const fs = require('fs');
const [pagePath, HARN, H0, js] = process.argv.slice(2);
(async () => {
  const br = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
  const page = await br.newPage({ viewport: { width: +process.env.VW || 900, height: +process.env.VH || 700 } });
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  page.on('console', m => { const t = m.text(); if (m.type() === 'error' || (m.type() === 'warning' && /THREE|WebGL|GL_/.test(t))) console.log('CONSOLE', m.type(), t.slice(0, 200)); });
  const MD = process.env.MODELS_DIR || 'wt/E/3d-garden/models';   // mẫu nạp từ máy (thay địa chỉ Pages)
  await page.addInitScript(d => { const u = n => 'http://localhost:8778/' + d + '/' + n; Object.assign(window, { __chickGlb: u('chicken.glb'), __racGlb: u('raccoon.glb'), __droneGlb: u('dji-mini3.glb'), __turbineGlb: u('turbine.glb'), __fernGlb: u('fern.glb'), __booksGlb: u('books.glb') }); }, MD);
  await page.addInitScript(h => { window.__hourOverride = h; }, +H0);
  await page.goto('http://localhost:8778/' + pagePath + '?b=' + Date.now());
  await page.waitForFunction(() => window.__tBuilt !== undefined && window.__dbg, null, { timeout: 300000, polling: 500 });
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {}); await page.waitForTimeout(10000);
  await page.evaluate(async src => { const s = document.createElement('script'); s.src = src + '?' + Date.now(); document.head.appendChild(s); await new Promise(r => s.onload = r); window.__resLock = true; wxLock({ raining: false, thunder: false, windSpeed: 2 }); }, '/' + HARN);
  await page.addScriptTag({ content: fs.readFileSync(__dirname + '/walkprobe.js', 'utf8') });
  const r = await page.evaluate('(async () => {' + fs.readFileSync(js, 'utf8') + '})()');
  if (r && r.shots) { for (const [n, u] of r.shots) fs.writeFileSync(n, Buffer.from(u.split(',')[1], 'base64')); delete r.shots; }
  console.log(JSON.stringify(r, null, 1));
  await br.close();
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
