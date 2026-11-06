const { chromium } = require(process.env.HOME + '/.npm/_npx/0b9ff77863cb6e9f/node_modules/playwright');
const fs = require('fs'); const [pagePath, H0] = process.argv.slice(2);
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
  await page.evaluate(() => window.__ev('PROF.fix(); window.__resLock = true'));
  const out = { list: await page.evaluate(() => window.__ev('PROF.vegList()')), pairs: [] };
  await page.waitForTimeout(12000);
  const meas = async () => { await page.waitForTimeout(1500); await page.evaluate(() => window.__ev('PROF.start()')); await page.waitForTimeout(3000); const r = await page.evaluate(() => window.__ev('PROF.stop()')); return [r.ms50, r.tris, r.shadowTris]; };
  for (let i = 0; i < 3; i++) {
    const a = await meas(); await page.evaluate(() => window.__ev('PROF.vegShadow(false)')); const b = await meas(); await page.evaluate(() => window.__ev('PROF.vegShadow(true)'));
    const c = await meas(); await page.evaluate(() => window.__ev('PROF.vegHide(false)')); const d = await meas(); await page.evaluate(() => window.__ev('PROF.vegHide(true)'));
    out.pairs.push({ base: a, vegNoShadow: b, base2: c, vegHidden: d }); console.log(JSON.stringify(out.pairs[i]));
  }
  fs.writeFileSync(__dirname + '/veg.json', JSON.stringify(out, null, 1)); await br.close();
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
