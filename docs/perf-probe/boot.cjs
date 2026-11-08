// node boot.cjs <trang> <giờ> — hồ sơ CPU lúc nạp trang tới window.__tBuilt: thời gian GỘP (inclusive) theo hàm, thời gian mạng
const { chromium } = require(process.env.PLAYWRIGHT_PATH || (() => {   // playwright: biến PLAYWRIGHT_PATH, không thì bản mới nhất trong ~/.npm/_npx
  const fs = require('fs'), path = require('path'), d = path.join(require('os').homedir(), '.npm/_npx'); let best = null, bv = '';
  for (const x of fs.existsSync(d) ? fs.readdirSync(d) : []) { const p = path.join(d, x, 'node_modules/playwright'); try { const v = JSON.parse(fs.readFileSync(path.join(p, 'package.json'))).version; if (v.localeCompare(bv, undefined, { numeric: true }) > 0) { bv = v; best = p; } } catch {} }
  if (!best) throw new Error('không thấy playwright (đặt PLAYWRIGHT_PATH)'); return best;
})());
const fs = require('fs');
const [pagePath, H0] = process.argv.slice(2);
(async () => {
  const br = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }); const page = await ctx.newPage();
  const MD = 'N/3d-garden/models';
  await page.addInitScript(d => { const u = n => 'http://localhost:8794/' + d + '/' + n; Object.assign(window, { __chickGlb: u('chicken.glb'), __racGlb: u('raccoon.glb'), __droneGlb: u('dji-mini3.glb'), __turbineGlb: u('turbine.glb'), __fernGlb: u('fern.glb'), __booksGlb: u('books.glb') }); }, MD);
  await page.addInitScript(h => { window.__hourOverride = h; }, +H0);
  const cdp = await ctx.newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 }); await cdp.send('Profiler.start');
  await page.goto('http://localhost:8794/' + pagePath + '?b=' + Date.now());
  await page.waitForFunction(() => window.__tBuilt !== undefined, null, { timeout: 300000, polling: 100 });
  const { profile } = await cdp.send('Profiler.stop');
  const nav = await page.evaluate(() => { const r = performance.getEntriesByType('resource').map(e => [e.name.split('/').slice(-2).join('/').slice(0, 50), Math.round(e.startTime), Math.round(e.duration), e.transferSize]); return { tBuilt: Math.round(window.__tBuilt), dcl: Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd), res: r.sort((a, b) => b[2] - a[2]).slice(0, 10) }; });
  const html = fs.readFileSync(__dirname + '/../' + pagePath, 'utf8').split('\n');
  const parent = new Map(), byId = new Map(); for (const n of profile.nodes) { byId.set(n.id, n); for (const c of n.children || []) parent.set(c, n.id); }
  const key = n => { const cf = n.callFrame; return (cf.functionName || '(anon)') + '@' + cf.lineNumber + ':' + cf.columnNumber + (cf.url.includes(pagePath) ? '' : ' ' + cf.url.split('/').pop().slice(0, 30)); };
  const incl = new Map(), self = new Map(); let tot = 0;
  profile.samples.forEach((id, i) => { const d = (profile.timeDeltas[i] || 0) / 1000; tot += d; const n0 = byId.get(id); self.set(key(n0), (self.get(key(n0)) || 0) + d); const seen = new Set(); for (let x = id; x !== undefined; x = parent.get(x)) { const k = key(byId.get(x)); if (!seen.has(k)) { seen.add(k); incl.set(k, (incl.get(k) || 0) + d); } } });
  const snip = k => { const m = k.match(/@(\d+):(\d+)$/); return m ? (html[+m[1]] || '').slice(Math.max(0, +m[2] - 8), +m[2] + 60).trim() : ''; };
  const topI = [...incl.entries()].filter(([k]) => !/^\((root|program|idle|garbage)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 45).map(([k, ms]) => [Math.round(ms), k.slice(0, 40), snip(k).slice(0, 60)]);
  const topS = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, ms]) => [Math.round(ms), k.slice(0, 40), snip(k).slice(0, 50)]);
  console.log(JSON.stringify({ totalMs: Math.round(tot), nav, gc: Math.round(self.get('(garbage collector)@-1:-1') || 0), idle: Math.round(self.get('(idle)@-1:-1') || 0), topInclusive: topI, topSelf: topS }, null, 1));
  await br.close();
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
