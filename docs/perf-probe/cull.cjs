// node cull.cjs <trang> <giờ> — ảnh + tốc độ: toàn cảnh bình thường vs ẩn vật < 1 px (và < 2 px)
const { chromium } = require(process.env.PLAYWRIGHT_PATH || (() => {   // playwright: biến PLAYWRIGHT_PATH, không thì bản mới nhất trong ~/.npm/_npx
  const fs = require('fs'), path = require('path'), d = path.join(require('os').homedir(), '.npm/_npx'); let best = null, bv = '';
  for (const x of fs.existsSync(d) ? fs.readdirSync(d) : []) { const p = path.join(d, x, 'node_modules/playwright'); try { const v = JSON.parse(fs.readFileSync(path.join(p, 'package.json'))).version; if (v.localeCompare(bv, undefined, { numeric: true }) > 0) { bv = v; best = p; } } catch {} }
  if (!best) throw new Error('không thấy playwright (đặt PLAYWRIGHT_PATH)'); return best;
})());
const fs = require('fs'); const [pagePath, H0] = process.argv.slice(2); const SH = __dirname + '/../shots/';
(async () => {
  const br = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--disable-gpu-vsync', '--disable-frame-rate-limit'] });
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }); const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  const MD = 'N/3d-garden/models';
  await page.addInitScript(d => { const u = n => 'http://localhost:8794/' + d + '/' + n; Object.assign(window, { __chickGlb: u('chicken.glb'), __racGlb: u('raccoon.glb'), __droneGlb: u('dji-mini3.glb'), __turbineGlb: u('turbine.glb'), __fernGlb: u('fern.glb'), __booksGlb: u('books.glb') }); }, MD);
  await page.addInitScript(h => { window.__hourOverride = h; }, +H0);
  await page.goto('http://localhost:8794/' + pagePath + '?b=' + Date.now());
  await page.waitForFunction(() => window.__tBuilt !== undefined && window.__dbg, null, { timeout: 300000, polling: 200 });
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {}); await page.waitForTimeout(8000);
  await page.evaluate(src => window.__ev(src), fs.readFileSync(__dirname + '/prof-instr.js', 'utf8'));
  await page.evaluate(() => { window.__ev('PROF.fix()'); window.__ev('window.__resLock = true; window.__wxFreeze = true'); });
  await page.waitForTimeout(15000);
  const meas = async () => { await page.evaluate(() => window.__ev('PROF.start()')); await page.waitForTimeout(3000); return page.evaluate(() => window.__ev('PROF.stop()')); };
  const canvas = await page.$('canvas'); const shot = async n => { await page.waitForTimeout(400); await canvas.screenshot({ path: SH + n }); };
  const out = { pairs: [] };
  for (let i = 0; i < 3; i++) {
    const a = await meas(); if (i === 0) await shot('cull-base.png');
    out.n1 = await page.evaluate(() => window.__ev('PROF.cullTiny(1)')); await page.waitForTimeout(800); const b = await meas(); if (i === 0) await shot('cull-1px.png');
    await page.evaluate(() => window.__ev('PROF.uncull()')); out.n2 = await page.evaluate(() => window.__ev('PROF.cullTiny(2)')); await page.waitForTimeout(800); const c = await meas(); if (i === 0) await shot('cull-2px.png');
    await page.evaluate(() => window.__ev('PROF.uncull()')); await page.waitForTimeout(800);
    out.pairs.push([[a.ms50, a.calls, a.shadowCalls], [b.ms50, b.calls, b.shadowCalls], [c.ms50, c.calls, c.shadowCalls]]);
  }
  console.log(JSON.stringify(out)); await br.close();
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
