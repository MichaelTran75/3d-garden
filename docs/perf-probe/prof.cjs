// node prof.cjs <trang> <giờ> <tệp ra.json> — đo khung hình THẬT (rAF tự chạy, không harness): CPU từng lượt tick, CPU/GPU lệnh vẽ, draw call, bộ nhớ, hồ sơ CPU (CDP)
const { chromium } = require(process.env.HOME + '/.npm/_npx/0b9ff77863cb6e9f/node_modules/playwright');
const fs = require('fs');
const [pagePath, H0, outPath] = process.argv.slice(2);
const INSTR = fs.readFileSync(__dirname + '/prof-instr.js', 'utf8');
(async () => {
  const br = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-precise-memory-info', '--js-flags=--expose-gc'].concat(process.env.UNCAP ? ['--disable-gpu-vsync', '--disable-frame-rate-limit'] : []) });
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  const MD = process.env.MODELS_DIR || 'N/3d-garden/models';
  await page.addInitScript(d => { const u = n => 'http://localhost:8794/' + d + '/' + n; Object.assign(window, { __chickGlb: u('chicken.glb'), __racGlb: u('raccoon.glb'), __droneGlb: u('dji-mini3.glb'), __turbineGlb: u('turbine.glb'), __fernGlb: u('fern.glb'), __booksGlb: u('books.glb') }); }, MD);
  await page.addInitScript(h => { window.__hourOverride = h; }, +H0);
  if (process.env.ALLOC) await page.addInitScript({ content: fs.readFileSync(__dirname + '/alloc-trace.js', 'utf8') });
  let hcdp = null; if (process.env.HEAP) { hcdp = await ctx.newCDPSession(page); await hcdp.send('HeapProfiler.enable'); await hcdp.send('HeapProfiler.startSampling', { samplingInterval: 16384 }); }
  const t0 = Date.now();
  await page.goto('http://localhost:8794/' + pagePath + '?b=' + Date.now());
  await page.waitForFunction(() => window.__tBuilt !== undefined && window.__dbg, null, { timeout: 300000, polling: 200 });
  const boot = await page.evaluate(() => ({ tBuilt: Math.round(window.__tBuilt), heapMB: performance.memory && +(performance.memory.usedJSHeapSize / 1e6).toFixed(1) }));
  boot.wallToBuilt = Date.now() - t0;
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {}); await page.waitForTimeout(8000);
  await page.evaluate(src => window.__ev(src), INSTR);
  let heap = null; if (hcdp) { await page.evaluate(() => window.gc && window.gc()); const { profile: hp } = await hcdp.send('HeapProfiler.getSamplingProfile'); await hcdp.send('HeapProfiler.stopSampling');
    const H = new Map(); let tot = 0; const walk = (n, stack) => { const cf = n.callFrame, k = (cf.functionName || '(anon)') + '@' + cf.lineNumber + ':' + cf.columnNumber + (cf.url.includes(pagePath) ? '' : ' ' + cf.url.split('/').pop().slice(0, 30)); const st = stack.concat([k]); if (n.selfSize) { tot += n.selfSize; const app = st.slice().reverse().find(x => !/ three|\(/.test(x) && /@\d+:/.test(x) && !/ \S+$/.test(x)); const key = app || k; H.set(key, (H.get(key) || 0) + n.selfSize); } (n.children || []).forEach(c => walk(c, st)); }; walk(hp.head, []);
    heap = { sampledMB: +(tot / 1e6).toFixed(1), top: [...H.entries()].sort((a, b) => b[1] - a[1]).slice(0, 45).map(([k, b]) => [k, +(b / 1e6).toFixed(2)]) }; }
  const cdp = await ctx.newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 250 });
  const html = fs.readFileSync(__dirname + '/../' + pagePath, 'utf8').split('\n');
  const views = (process.env.VIEWS || 'overview,camp-x16,camp-x40').split(',').map(v => [v, v === 'overview' ? 'PROF.fix()' : 'PROF.camp(' + v.split('-x')[1] + ')']);
  const out = { boot, heap, views: {} };
  if (process.env.ALLOC) { await page.evaluate(() => { window.gc && window.gc(); }); await page.waitForTimeout(3000); await page.evaluate(() => { window.gc && window.gc(); }); await page.waitForTimeout(1500);
    const A = await page.evaluate(() => [...window.__ALLOC.entries()].map(([k, r]) => [k, r.n, +(r.b / 1e6).toFixed(2), +(r.live / 1e6).toFixed(2), r.nl]));
    A.sort((a, b) => b[3] - a[3]); out.alloc = { liveMB: +A.reduce((s, a) => s + a[3], 0).toFixed(1), totalMB: +A.reduce((s, a) => s + a[2], 0).toFixed(1), top: A.slice(0, 40).map(a => { const m = a[0].match(/@(\d+):(\d+)$/); return a.concat([m ? (html[+m[1] - 1] || '').slice(Math.max(0, +m[2] - 60), +m[2] + 50).trim() : '']); }) }; }
  for (const [name, setup] of views) {
    if (setup) await page.evaluate(s => window.__ev(s), setup);
    await page.waitForTimeout(5000);
    if (process.env.STATICS) await page.evaluate(() => window.__ev('PROF.statics()'));
    if (process.env.AB) { const ab = []; out.abInit = await page.evaluate(() => window.__ev('PROF.abInit()'));
      await page.waitForTimeout(+(process.env.WARM || 0)); for (const v of (process.env.SEQ || 'base,lights,base,grass,base,fern,base,pr1,base,shadow').split(',')) { await page.evaluate(v => window.__ev("PROF.ab('" + v + "')"), v); await page.waitForTimeout(+(process.env.SETTLE || 2500)); await page.evaluate(() => window.__ev('PROF.start()')); await page.waitForTimeout(+(process.env.MEAS || 4500)); const r = await page.evaluate(() => window.__ev('PROF.stop()')); ab.push([v, r.fps, r.ms50, r.ms95, r.calls, r.tris, r.cpuRenderMs, r.census.programs, r.census.drawBuf.join('x')]); console.log('ab', name, v, r.fps, r.ms50, r.calls, r.tris); }
      await page.evaluate(() => window.__ev("PROF.ab('base')")); out.views[name] = { ab }; continue; }
    await page.evaluate(() => window.__ev('PROF.start()'));
    await cdp.send('Profiler.start'); await page.waitForTimeout(8000); const { profile } = await cdp.send('Profiler.stop');
    const r = await page.evaluate(() => window.__ev('PROF.stop()'));
    // hồ sơ CPU: thời gian tự chạy theo hàm (+ dòng mã để biết tệp)
    const self = new Map(), dt = {}; let total = 0;
    profile.samples.forEach((id, i) => { const d = profile.timeDeltas[i] || 0; dt[id] = (dt[id] || 0) + d; total += d; });
    for (const n of profile.nodes) { const cf = n.callFrame, key = (cf.functionName || '(anon)') + '@' + cf.lineNumber + ':' + cf.columnNumber + (cf.url.includes(pagePath) ? '' : ' ' + cf.url.split('/').pop().slice(0, 40)); self.set(key, (self.get(key) || 0) + (dt[n.id] || 0)); }
    const fr = r.frames || 1, top = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 32).map(([k, us]) => { const m = k.match(/@(\d+):(\d+)$/); const snip = m ? (html[+m[1]] || '').slice(Math.max(0, +m[2] - 10), +m[2] + 70).trim() : ''; return [k, +(us / 1000 / fr).toFixed(3), snip]; });
    r.cpuProfile = { wallMs: +(total / 1000).toFixed(0), msPerFrame: +(total / 1000 / fr).toFixed(2), idleMsPerFrame: +(((self.get('(idle)@-1:-1') || 0) + (self.get('(program)@-1:-1') || 0)) / 1000 / fr).toFixed(2), top };
    if (process.env.TINY) r.tiny = await page.evaluate(() => window.__ev('PROF.tiny()'));
    if (process.env.STATICS) r.statics = await page.evaluate(() => window.__ev('PROF.statics2()'));
    out.views[name] = r; console.log('view', name, 'fps', r.fps, 'gpu', r.gpuMs, 'calls', r.calls);
  }
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1)); await br.close();
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
