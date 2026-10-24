// KIỂM TRA HÀNH VI KỸ SƯ CẢ NGÀY (G 24/10 "engineer đang bị lỗi, liệt kê lỗi task theo thời gian"): node run.cjs [segs.json] [--pool 4] [--out thư-mục]
//  Dựng bản gỡ lỗi từ "../3D garden.html" (chạy build.py trước), mở server tạm (trang + harness.js + /models = src/models), mỗi đoạn giờ 1 trình duyệt Chromium ẩn
//  (tối đa --pool cùng lúc: mỗi trang có luồng phụ chất lỏng / gió — 9 trang cùng lúc làm máy nghẽn), tua nhanh đồng hồ cố định 1/20 s, ghi chuyển việc + lỗi theo giờ
//  ra <out>/<đoạn>.json rồi in tóm tắt (summary.py). Không có segs.json ⇒ bộ mặc định DAY dưới đây (ngày quang, chiều mưa 14–15 h, lệnh Tools ngắm sao trước / sau 19:00).
//  Playwright: lấy bản mới nhất trong ~/.npm/_npx (máy có MCP Playwright) hoặc biến môi trường PLAYWRIGHT_PATH.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), os = require('node:os'), { execFileSync } = require('node:child_process');
const HERE = __dirname, SRC = path.resolve(HERE, '../..'), ROOT = path.resolve(SRC, '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const POOL = +arg('--pool', 4), OUT = path.resolve(arg('--out', path.join(os.tmpdir(), 'engineer-audit')));
function pwPath() {
  if (process.env.PLAYWRIGHT_PATH) return process.env.PLAYWRIGHT_PATH;
  const npx = path.join(os.homedir(), '.npm/_npx'); let best = null, bv = '';
  for (const d of fs.existsSync(npx) ? fs.readdirSync(npx) : []) { const p = path.join(npx, d, 'node_modules/playwright'); try { const v = JSON.parse(fs.readFileSync(path.join(p, 'package.json'))).version; if (v.localeCompare(bv, undefined, { numeric: true }) > 0) { bv = v; best = p; } } catch {} }
  if (!best) throw new Error('không thấy playwright (đặt PLAYWRIGHT_PATH)'); return best;
}
const W = { raining: false, thunder: false, windSpeed: 2 };
const CLEAR = "(() => { const st = __ev('liveWeather.state'); const d = JSON.parse(JSON.stringify(st.data || { current: {} })); d.current = d.current || {}; d.current.cloud_cover = 10; wxLock({ data: d, fresh: true }); return 'trời quang'; })()";
const FORCE = a => `(() => { __ev("engForceAct = '${a}'"); return __ev('engForceAct'); })()`, CHECK = "(() => [__ev('engForceAct'), __ev('engObj.act'), __ev('engObj.phase'), __ev('skyWatch.state.st')])()";
const DAY = [
  { name: 'd1', h0: 5.9, h1: 9.1, wx: W }, { name: 'd2', h0: 9.0, h1: 12.1, wx: W }, { name: 'd3', h0: 12.0, h1: 15.1, wx: W }, { name: 'd4', h0: 14.9, h1: 18.1, wx: W },
  { name: 'd5', h0: 17.9, h1: 21.9, wx: W, at: [[17.9, CLEAR]] },
  { name: 'r1', h0: 13.9, h1: 17.2, wx: { ...W, windSpeed: 3 }, at: [[14.0, "(() => { window.__wx.raining = true; return 'mưa'; })()"], [15.0, "(() => { window.__wx.raining = false; return 'tạnh'; })()"]] },
  { name: 'f1', h0: 9.9, h1: 10.3, wx: W, at: [[10.0, FORCE('stars')], [10.01, CHECK], [10.2, CHECK]] },
  { name: 'f2', h0: 18.4, h1: 19.6, wx: W, at: [[18.4, CLEAR], [18.6, FORCE('stars')], [18.61, CHECK], [19.1, FORCE('stars')], [19.11, CHECK], [19.3, CHECK]] }];
const segFile = process.argv.slice(2).find(a => a.endsWith('.json'));
const segs = segFile ? JSON.parse(fs.readFileSync(segFile, 'utf8')) : DAY;
fs.mkdirSync(OUT, { recursive: true });
const page = path.join(OUT, 'debug.html');
execFileSync('python3', [path.join(HERE, 'make-debug.py'), path.join(ROOT, '3D garden.html'), page], { stdio: 'inherit' });
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = u === '/' || u === '/debug.html' ? page : u === '/harness.js' ? path.join(HERE, 'harness.js') : u.startsWith('/models/') ? path.join(SRC, 'models', path.basename(u)) : null;
  if (!f || !fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
async function runSeg(S, base, chromium) {
  const b = await chromium.launch({ headless: true }), pg = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const cons = []; let lastH = S.h0; const t0 = Date.now();
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') cons.push([+lastH.toFixed(3), m.type(), m.text().slice(0, 240)]); });
  pg.on('pageerror', err => cons.push([+lastH.toFixed(3), 'pageerror', String(err).slice(0, 300)]));
  try {
    await pg.goto(base + '/debug.html', { timeout: 180000 });
    await pg.waitForFunction(() => window.__dbg && window.__tBuilt, null, { timeout: 180000, polling: 300 });
    await pg.evaluate(async () => { const s = document.createElement('script'); s.src = '/harness.js?' + Date.now(); document.head.appendChild(s); await new Promise(r => s.onload = r); window.__resLock = true; });
    await pg.evaluate(wx => { wxLock(wx); return audInit(); }, S.wx || W);
    const at = (S.at || []).slice().sort((a, c) => a[0] - c[0]); let h = S.h0;
    while (h < S.h1 - 1e-6) {
      while (at.length && at[0][0] <= h + 1e-6) { const [, js] = at.shift(); const r = await pg.evaluate(js).catch(e => 'LỖI ' + e.message); cons.push([+h.toFixed(3), 'at', js.slice(0, 80) + ' ⇒ ' + JSON.stringify(r).slice(0, 160)]); }
      const sec = Math.min(300, (Math.min(S.h1, at.length ? at[0][0] : 99) - h) * 3600);
      const r = await pg.evaluate(([hh, s]) => audRun(hh, s), [h, Math.max(1, sec)]); lastH = h = r.h;
      process.stdout.write(`${S.name} ${h.toFixed(2)} chuyển ${r.tr} lỗi ${r.an}\n`);
    }
    const A = await pg.evaluate(() => ({ tr: AUD.tr, an: AUD.an, info: AUD.info, frames: AUD.frames }));
    Object.assign(A, { console: cons, seg: S, wallSec: Math.round((Date.now() - t0) / 1000) });
    fs.writeFileSync(path.join(OUT, S.name + '.json'), JSON.stringify(A)); return S.name + ' xong ' + A.wallSec + ' s';
  } finally { await b.close(); }
}
server.listen(0, '127.0.0.1', async () => {
  const base = 'http://127.0.0.1:' + server.address().port, { chromium } = require(pwPath()), res = []; let qi = 0;
  const worker = async () => { while (qi < segs.length) { const S = segs[qi++]; res.push(await runSeg(S, base, chromium).catch(e => S.name + ' LỖI ' + e.message)); } };
  await Promise.all(Array.from({ length: POOL }, worker)); server.close();
  console.log(res.join('\n')); console.log('kết quả: ' + OUT);
  try { execFileSync('python3', [path.join(HERE, 'summary.py'), OUT], { stdio: 'inherit' }); } catch {}
});
