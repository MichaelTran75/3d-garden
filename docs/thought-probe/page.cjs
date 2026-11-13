// usage: AUD=<repo> node page.cjs <debug.html> <giờ> <probe.js (thân hàm async, trả { shots: [[tên, dataURL]], out })> <thư mục ra>
// SHOT=<tên.png>: chụp cả trang sau khi đầu dò chạy xong · trang: src/tools/debug/mkdbg.py · Playwright: bản mới nhất trong ~/.npm/_npx, hoặc PLAYWRIGHT_PATH · kết quả: dòng {"shots"…} trên stdout
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), os = require('node:os');
const [page, H, JS, OUT] = process.argv.slice(2);
const HERE = path.resolve(process.env.AUD || '.', 'src/tools/engineer-audit'), SRC = path.resolve(HERE, '../..');
function pwPath() {
  if (process.env.PLAYWRIGHT_PATH) return process.env.PLAYWRIGHT_PATH;
  const npx = path.join(os.homedir(), '.npm/_npx'); let best = null, bv = '';
  for (const d of fs.existsSync(npx) ? fs.readdirSync(npx) : []) { const p = path.join(npx, d, 'node_modules/playwright'); try { const v = JSON.parse(fs.readFileSync(path.join(p, 'package.json'))).version; if (v.localeCompare(bv, undefined, { numeric: true }) > 0) { bv = v; best = p; } } catch (_) {} }
  return best;
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = u === '/' || u === '/debug.html' ? page : u === '/harness.js' ? path.join(HERE, 'harness.js') : u.startsWith('/models/') ? path.join(SRC, 'models', path.basename(u)) : null;
  if (!f || !fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
server.listen(0, '127.0.0.1', async () => {
  const base = 'http://127.0.0.1:' + server.address().port, { chromium } = require(pwPath());
  const b = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] }), pg = await b.newPage({ viewport: { width: +process.env.VW || 1280, height: +process.env.VH || 800 }, deviceScaleFactor: +process.env.DSF || 1 });
  pg.on('pageerror', e => console.error('pageerror', String(e).slice(0, 300)));
  pg.on('console', m => { const t = m.text(); if (m.type() === 'error' || (m.type() === 'warning' && /THREE|WebGL|GL_/.test(t))) console.error('CONSOLE', m.type(), t.slice(0, 200)); });
  try {
    await pg.addInitScript(h => { window.__hourOverride = h; }, +H);
    await pg.goto(base + '/debug.html' + (process.env.QS || ''), { timeout: 180000 });
    await pg.waitForFunction(() => window.__dbg && window.__tBuilt, null, { timeout: 180000, polling: 300 });
    await pg.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {}); await pg.waitForTimeout(4000);
    await pg.evaluate(async () => { const s = document.createElement('script'); s.src = '/harness.js?' + Date.now(); document.head.appendChild(s); await new Promise(r => s.onload = r); window.__resLock = true; });
    const r = await pg.evaluate('(async () => {' + fs.readFileSync(JS, 'utf8') + '})()');
    if (r && r.shots) { for (const [n, u] of r.shots) fs.writeFileSync(path.join(OUT, n), Buffer.from(u.split(',')[1], 'base64')); r.shots = r.shots.length; }
    if (process.env.SHOT) { await pg.waitForTimeout(300); await pg.screenshot({ path: path.join(OUT, process.env.SHOT) }); }   // ảnh cả trang (chữ bong bóng là lớp HTML, không nằm trong canvas)
    console.log(JSON.stringify(r));
  } catch (e) { console.error('LỖI', e.message); }
  await b.close(); server.close();
});
