// usage: AUD=<repo> node vanshot.cjs <debug.html> <hour> <probe.js (async body, returns {shots:[[name,dataURL]]})> <outdir>
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), os = require('node:os');
const [page, H, JS, OUT] = process.argv.slice(2);
const HERE = path.resolve(process.env.AUD || '.', 'src/tools/engineer-audit'), SRC = path.resolve(HERE, '../..');
function pwPath() {
  if (process.env.PLAYWRIGHT_PATH) return process.env.PLAYWRIGHT_PATH;
  const npx = path.join(os.homedir(), '.npm/_npx'); let best = null, bv = '';
  for (const d of fs.existsSync(npx) ? fs.readdirSync(npx) : []) { const p = path.join(npx, d, 'node_modules/playwright'); try { const v = JSON.parse(fs.readFileSync(path.join(p, 'package.json'))).version; if (v.localeCompare(bv, undefined, { numeric: true }) > 0) { bv = v; best = p; } } catch {} }
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
    await pg.addInitScript(h => { window.__hourOverride = h; }, +H); await pg.addInitScript({ path: path.join(__dirname, 'hook.js') });
    const cdp0 = await pg.context().newCDPSession(pg); await cdp0.send('HeapProfiler.enable'); await cdp0.send('HeapProfiler.startSampling', { samplingInterval: 32768 });
    await pg.goto(base + '/debug.html' + (process.env.QS || ''), { timeout: 180000 });
    await pg.waitForFunction(() => window.__dbg && window.__tBuilt, null, { timeout: 180000, polling: 300 });
    await pg.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {}); await pg.waitForTimeout(4000);
    await pg.evaluate(async () => { const s = document.createElement('script'); s.src = '/harness.js?' + Date.now(); document.head.appendChild(s); await new Promise(r => s.onload = r); window.__resLock = true; wxLock({ raining: false, thunder: false, windSpeed: 2, cloudCover: 15 }); });
    const r = await pg.evaluate('(async () => {' + fs.readFileSync(JS, 'utf8') + '})()');
    if (r && r.shots) { for (const [n, u] of r.shots) fs.writeFileSync(path.join(OUT, n), Buffer.from(u.split(',')[1], 'base64')); r.shots = r.shots.length; }
    { const cdp = await pg.context().newCDPSession(pg); await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.collectGarbage'); await pg.waitForTimeout(500); await cdp.send('HeapProfiler.collectGarbage');
      r.heap = await cdp.send('Runtime.getHeapUsage');
      { const pr = (await cdp0.send('HeapProfiler.getSamplingProfile')).profile, by = {}; let tot = 0;
        const walk = (n, up) => { const f = n.callFrame, k = (f.functionName || '(anon)') + ':' + (f.lineNumber + 1), key = k + ' < ' + up; if (n.selfSize) { tot += n.selfSize; by[key] = (by[key] || 0) + n.selfSize; } for (const c of n.children || []) walk(c, k); };
        walk(pr.head, ''); r.samp = { totMB: +(tot / 1048576).toFixed(1), top: Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 45).map(([k, v]) => [+(v / 1048576).toFixed(2), k]) }; } r.gpu = await pg.evaluate('__gpuSum()'); r.arr = await pg.evaluate('__arrSum()');
      r.ps = require('node:child_process').execSync('ps -axo rss,command').toString().split('\n').filter(l => /headless|chromium|chrome/i.test(l) && !/ps -axo/.test(l)).map(l => { const m = l.trim().match(/^(\d+)\s+(.*)/); return m ? [Math.round(m[1] / 1024), (m[2].match(/--type=([\w-]+)/) || [0, 'browser'])[1]] : null; }).filter(Boolean); }
    console.log(JSON.stringify(r));
  } catch (e) { console.error('LỖI', e.message); }
  await b.close(); server.close();
});
