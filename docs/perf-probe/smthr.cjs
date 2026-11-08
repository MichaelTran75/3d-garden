const { chromium } = require(process.env.PLAYWRIGHT_PATH || (() => {   // playwright: biến PLAYWRIGHT_PATH, không thì bản mới nhất trong ~/.npm/_npx
  const fs = require('fs'), path = require('path'), d = path.join(require('os').homedir(), '.npm/_npx'); let best = null, bv = '';
  for (const x of fs.existsSync(d) ? fs.readdirSync(d) : []) { const p = path.join(d, x, 'node_modules/playwright'); try { const v = JSON.parse(fs.readFileSync(path.join(p, 'package.json'))).version; if (v.localeCompare(bv, undefined, { numeric: true }) > 0) { bv = v; best = p; } } catch {} }
  if (!best) throw new Error('không thấy playwright (đặt PLAYWRIGHT_PATH)'); return best;
})());
const fs = require('fs'); const [pagePath, H0, VIEW] = process.argv.slice(2);
(async () => {
  const br = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--disable-gpu-vsync', '--disable-frame-rate-limit'] });
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }); const page = await ctx.newPage();
  const MD = 'N/3d-garden/models';
  await page.addInitScript(d => { const u = n => 'http://localhost:8794/' + d + '/' + n; Object.assign(window, { __chickGlb: u('chicken.glb'), __racGlb: u('raccoon.glb'), __droneGlb: u('dji-mini3.glb'), __turbineGlb: u('turbine.glb'), __fernGlb: u('fern.glb'), __booksGlb: u('books.glb') }); }, MD);
  await page.addInitScript(h => { window.__hourOverride = h; }, +H0);
  await page.goto('http://localhost:8794/' + pagePath + '?b=' + Date.now());
  await page.waitForFunction(() => window.__tBuilt !== undefined && window.__dbg, null, { timeout: 300000, polling: 200 });
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {}); await page.waitForTimeout(8000);
  await page.evaluate(src => window.__ev(src), fs.readFileSync(__dirname + '/prof-instr.js', 'utf8'));
  await page.evaluate(v => window.__ev((v === 'camp' ? 'PROF.camp(16)' : 'PROF.fix()') + `; window.__resLock = true; window.__smEvery = 1; (() => { let f = 0; const tick = () => { f++; if (window.__smEvery > 1) { renderer.shadowMap.autoUpdate = false; if (f % window.__smEvery === 0) renderer.shadowMap.needsUpdate = true; } else renderer.shadowMap.autoUpdate = true; requestAnimationFrame(tick); }; requestAnimationFrame(tick); })()`), VIEW);
  await page.waitForTimeout(12000);
  const meas = async n => { await page.evaluate(n => { window.__smEvery = n; }, n); await page.waitForTimeout(1500); await page.evaluate(() => window.__ev('PROF.start()')); await page.waitForTimeout(3000); const r = await page.evaluate(() => window.__ev('PROF.stop()')); return [r.ms50, r.shadowCalls, r.shadowPassMs]; };
  const rows = []; for (let i = 0; i < 3; i++) rows.push({ every1: await meas(1), every2: await meas(2), every4: await meas(4), every1b: await meas(1) });
  console.log(JSON.stringify(rows)); await br.close();
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
