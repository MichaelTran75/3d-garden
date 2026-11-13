// node docs/dusk-probe/dusk.cjs <url trang mkdbg> <thư mục ảnh> — chụp cảnh ở các mốc giờ Pleiku (giờ ép window.__hourOverride), trời khoá quang
const { chromium } = require(process.env.PLAYWRIGHT_PATH || (() => {   // playwright: biến PLAYWRIGHT_PATH, không thì bản mới nhất trong ~/.npm/_npx
  const fs = require('fs'), path = require('path'), d = path.join(require('os').homedir(), '.npm/_npx'); let best = null, bv = '';
  for (const x of fs.existsSync(d) ? fs.readdirSync(d) : []) { const p = path.join(d, x, 'node_modules/playwright'); try { const v = JSON.parse(fs.readFileSync(path.join(p, 'package.json'))).version; if (v.localeCompare(bv, undefined, { numeric: true }) > 0) { bv = v; best = p; } } catch {} }
  if (!best) throw new Error('không thấy playwright (đặt PLAYWRIGHT_PATH)'); return best;
})());
const fs = require('fs'); const [url, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const HOURS = (process.env.HOURS || '16.75,17.33,17.5,17.75,18,18.25,18.5,5.25,5.5,5.75,6.25').split(',').map(Number);
(async () => {
  const br = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
  const page = await br.newPage({ viewport: { width: 960, height: 600 } });
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  await page.addInitScript(() => { window.__hourOverride = 12; });
  await page.goto(url + '?b=' + Date.now());
  await page.waitForFunction(() => window.__tBuilt !== undefined && window.__dbg, null, { timeout: 300000, polling: 500 });
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {}); await page.waitForTimeout(8000);
  await page.addScriptTag({ content: fs.readFileSync(__dirname + '/../../src/tools/engineer-audit/harness.js', 'utf8') });
  await page.evaluate(() => wxLock({ raining: false, thunder: false, windSpeed: 2, cloudCover: 15 }));
  const rows = [];
  for (const h of HOURS) {
    const r = await page.evaluate(h => { window.__hourOverride = h; __dbg.frames(90); const E = __ev;
      return { h, nf: +E('nightFactor').toFixed(3), dusk: +E('skyDusk').toFixed(3), el: +(Math.asin(E('sunElevSin')) * 57.2958).toFixed(1), sun: +E('sun.intensity').toFixed(2), hemi: +E('hemi.intensity').toFixed(2),
        awake: E('liveWeather.wildlifeAwake'), study: E('studyDeskLighting.on'), lamp: +E('streetLamps && streetLamps[0] ? streetLamps[0].light.intensity : -1').toFixed(1) }; }, h).catch(e => ({ h, err: e.message.slice(0, 200) }));
    rows.push(r); console.log(JSON.stringify(r));
    const hh = String(Math.floor(h)).padStart(2, '0') + String(Math.round((h % 1) * 60)).padStart(2, '0');
    await page.screenshot({ path: out + '/' + hh + '.png' });
  }
  fs.writeFileSync(out + '/rows.json', JSON.stringify(rows, null, 1));
  await br.close();
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
