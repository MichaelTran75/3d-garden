// node ev4.cjs <trang> <harness> <giờ> <tệp js trả kết quả (thân hàm async)>
// như ev3.cjs, thêm (lớp chữ HTML, docs/html-text-probe):
//  · DSF=2: deviceScaleFactor (màn Retina — chữ HTML vẽ theo devicePixelRatio)
//  · window.__pshot(đường dẫn, clip?): chụp CẢ TRANG giữa probe (gồm lớp DOM: chữ HTML, bảng giao diện) — ảnh canvas WebGL không có lớp này
//  · window.__shotDir: thư mục ảnh (biến môi trường SHOTS, mặc định ./shots)
// Biến môi trường: VW / VH (cỡ khung, mặc định 900 × 700), DSF, SHOTS, MODELS_DIR (mẫu GLB nạp từ máy), cổng 8778.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || (() => {   // playwright: biến PLAYWRIGHT_PATH, không thì bản mới nhất trong ~/.npm/_npx
  const fs = require('fs'), path = require('path'), d = path.join(require('os').homedir(), '.npm/_npx'); let best = null, bv = '';
  for (const x of fs.existsSync(d) ? fs.readdirSync(d) : []) { const p = path.join(d, x, 'node_modules/playwright'); try { const v = JSON.parse(fs.readFileSync(path.join(p, 'package.json'))).version; if (v.localeCompare(bv, undefined, { numeric: true }) > 0) { bv = v; best = p; } } catch {} }
  if (!best) throw new Error('không thấy playwright (đặt PLAYWRIGHT_PATH)'); return best;
})());
const fs = require('fs'), path = require('path');
const [pagePath, HARN, H0, js] = process.argv.slice(2);
(async () => {
  const br = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
  const page = await br.newPage({ viewport: { width: +process.env.VW || 900, height: +process.env.VH || 700 }, deviceScaleFactor: +process.env.DSF || 1 });
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  page.on('console', m => { const t = m.text(); if (m.type() === 'error' || (m.type() === 'warning' && /THREE|WebGL|GL_/.test(t))) console.log('CONSOLE', m.type(), t.slice(0, 200)); });
  const SH = path.resolve(process.env.SHOTS || 'shots'); fs.mkdirSync(SH, { recursive: true });
  await page.exposeFunction('__pshot', async (p, clip) => { await page.screenshot({ path: p, clip: clip || undefined }); return 1; });
  await page.addInitScript(d => { window.__shotDir = d; }, SH);
  const MD = process.env.MODELS_DIR || '3d-garden/models';   // mẫu nạp từ máy (thay địa chỉ Pages)
  await page.addInitScript(d => { const u = n => 'http://localhost:8778/' + d + '/' + n; Object.assign(window, { __chickGlb: u('chicken.glb'), __racGlb: u('raccoon.glb'), __droneGlb: u('dji-mini3.glb'), __turbineGlb: u('turbine.glb'), __fernGlb: u('fern.glb'), __booksGlb: u('books.glb') }); }, MD);
  await page.addInitScript(h => { window.__hourOverride = h; }, +H0);
  await page.goto('http://localhost:8778/' + pagePath + '?b=' + Date.now());
  await page.waitForFunction(() => window.__tBuilt !== undefined && window.__dbg, null, { timeout: 300000, polling: 500 });
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {}); await page.waitForTimeout(10000);
  await page.evaluate(async src => { const s = document.createElement('script'); s.src = src + '?' + Date.now(); document.head.appendChild(s); await new Promise(r => s.onload = r); window.__resLock = true; wxLock({ raining: false, thunder: false, windSpeed: 2 }); }, '/' + HARN);
  await page.addScriptTag({ content: fs.readFileSync(__dirname + '/walkprobe.js', 'utf8') });
  const r = await page.evaluate('(async () => {' + fs.readFileSync(js, 'utf8') + '})()');
  if (r && r.shots) { for (const [n, u] of r.shots) fs.writeFileSync(n, Buffer.from(u.split(',')[1], 'base64')); delete r.shots; }
  console.log(JSON.stringify(r));
  await br.close();
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
