// node docs/physics-probe/drop.cjs <url trang mkdbg> <thư mục ra> — vật rời trên cảnh thật: thả ngẫu nhiên (nằm yên / nổi, không lọt đất, không nằm trong vật),
//  cùng chỗ nằm ở 20 / 60 / 144 khung/giây, giá mỗi bước, tốc độ xoay camera theo dt, 1 tick hỏng không đứng khung, lõi táo gấu mèo (quỹ đạo + ảnh).
//  ONLY=drops,fps,view,fault,raccoon chọn phần · SEED=số
const { chromium } = require(process.env.PLAYWRIGHT_PATH || (() => {   // playwright: biến PLAYWRIGHT_PATH, không thì bản mới nhất trong ~/.npm/_npx
  const fs = require('fs'), path = require('path'), d = path.join(require('os').homedir(), '.npm/_npx'); let best = null, bv = '';
  for (const x of fs.existsSync(d) ? fs.readdirSync(d) : []) { const p = path.join(d, x, 'node_modules/playwright'); try { const v = JSON.parse(fs.readFileSync(path.join(p, 'package.json'))).version; if (v.localeCompare(bv, undefined, { numeric: true }) > 0) { bv = v; best = p; } } catch {} }
  if (!best) throw new Error('không thấy playwright (đặt PLAYWRIGHT_PATH)'); return best;
})());
const fs = require('fs'); const [url, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const ONLY = (process.env.ONLY || 'drops,fps,view,fault,raccoon').split(','), SEED = +(process.env.SEED || 7);
const q = (a, f) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(f * s.length))] : null; };
const r3 = x => x == null ? x : +x.toFixed(3);

// ---- các hàm chạy TRONG trang (qua __ev: phạm vi cảnh) ----
function pgReady() {
  simSetup(); __dbg.clock.__dt = 1 / 20; const R = renderer, orig = R.render; R.render = () => {}; let k = 0;
  try { while (!COL.ready && k < 6000) { __dbg.frames(1); k++; } } finally { R.render = orig; }
  return { frames: k, ready: COL.ready, cells: COL.cells, tris: COL.tris };
}
function pgSites(o) {   // chỗ thả: quanh 3 cây táo, xe, đồ trại, vật cản, rải khắp bản đồ
  let s = o.seed >>> 0; const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296, L = [];
  const add = (kind, x, z, R, n) => { for (let i = 0; i < n; i++) { const a = rnd() * 6.2832, d = Math.sqrt(rnd()) * R; L.push({ kind, x: x + d * Math.cos(a), z: z + d * Math.sin(a) }); } };
  appleTrees.forEach((T, i) => add('apple' + i, T.position.x, T.position.z, 2.2, o.apple));
  const vp = __dbg.caravanObj.position; add('van', vp.x, vp.z, 4.5, o.van);
  for (let i = 0; i < o.props && PROPS.length; i++) { const P = PROPS[Math.floor(rnd() * PROPS.length)]; add('prop', P.x, P.z, (P.r || 0.3) + 0.5, 1); }
  for (let i = 0; i < o.obst; i++) { const P = obstacleCoords[Math.floor(rnd() * obstacleCoords.length)]; add('obst', P.x, P.z, (P.r || 0.3) + 0.6, 1); }
  const xa = wx(-MX + 2), xb = wx(GX + MX - 3), za = wz(-MZ + 2), zb = wz(GZ + MZ - 3);
  for (let i = 0; i < o.map; i++) L.push({ kind: 'map', x: xa + rnd() * (xb - xa), z: za + rnd() * (zb - za) });
  const R = [0.03, 0.05, 0.1];
  for (const S of L) { S.r = R[Math.floor(rnd() * 3)]; S.e = 0.28 + rnd() * 0.3; S.rr = 0.1 + rnd() * 0.1; S.h = 2.7 + rnd() * 0.6; const sp = rnd() * 1.5, a = rnd() * 6.2832; S.vx = sp * Math.cos(a); S.vy = rnd() * 2 - 1; S.vz = sp * Math.sin(a); }
  return L;
}
function pgDrops(L) {
  const rows = [], t0 = performance.now(); let steps = 0;
  for (const S of L) {
    const r = S.r, B = looseBody(r, { e: S.e, mu: 0.6, rr: S.rr });
    B.p.set(S.x, (S.y ?? cowY(S.x, S.z) + S.h), S.z); B.p0.copy(B.p); B.v.set(S.vx, S.vy, S.vz);
    let minG = 1e9, inS = 0, vmax = 0, n = 0, tIn = -1; const in0 = (colSub(B.mask, S.x, S.z, B.p.y - r + 0.005, B.p.y + r) & colBit(S.x, S.z)) !== 0;   // thả ngay trong 1 khoảng đặc (tường, thân cây cao): tách riêng
    while (!B.rest && n < 14 * 120) {
      _looseB = B; _looseSub(PHYS_H); n++; const p = B.p;
      minG = Math.min(minG, p.y - r - cowY(p.x, p.z)); vmax = Math.max(vmax, B.v.length());
      if (colSub(B.mask, p.x, p.z, p.y - r + 0.005, p.y + r) & colBit(p.x, p.z)) { inS++; if (tIn < 0) tIn = n / 120; }
    }
    steps += n; const p = B.p, gy = cowY(p.x, p.z), f = colRestY(p.x, p.z, p.y - r, LOOSE_UP, B.mask);
    rows.push({ kind: S.kind, r, in0, x0: S.x, z0: S.z, x: p.x, y: p.y, z: p.z, gy, f, t: n / 120, rest: B.rest, wet: B.wet, air: B.air, hits: B.hits, still: B.still, minG, inS, tIn, vmax,
      off: B.wet ? p.y - (waterSurfaceY(p.x, p.z) - 0.2 * r) : p.y - r - f, on: B.wet ? 'water' : f > gy + 1e-6 ? 'solid' : 'ground', fin: Number.isFinite(p.x + p.y + p.z), roll: Math.hypot(p.x - S.x, p.z - S.z) });
  }
  return { rows, steps, ms: performance.now() - t0 };
}
function pgGaps(P) {   // khe hở nhìn thấy: tia thẳng xuống từ tâm vật tới lưới thật (bỏ hiệu ứng, cỏ rải, vật trong suốt) − bán kính · above: có mặt lưới nào giữa tâm + r + 0,3 và tâm không
  const fx = /khói|smoke|mưa|rain|mây|cloud|gợn|ripple|lá rừng|lá cây|cánh hoa|giọt|bọt|đầm sen|lotus|vệt sáng|chùm sáng|ánh đèn|bóng đổ|zzz|nhãn|label|sóng|dây câu|phao/i, list = [];
  scene.traverse(o => {
    if (!(o.isMesh || o.isInstancedMesh) || o.isSkinnedMesh || !o.geometry || !o.geometry.attributes.position) return;
    for (let p = o; p; p = p.parent) if (!p.visible) return;
    if (fx.test(o.name + '|' + (o.parent ? o.parent.name : ''))) return;
    const terr = terrainMeshes.includes(o);
    if (o.isInstancedMesh && !terr && o.count > 400 && o.geometry.attributes.position.count <= 1000) return;
    const mt = Array.isArray(o.material) ? o.material[0] : o.material; if (!mt || mt.visible === false || (mt.transparent && mt.opacity < 0.6)) return;
    list.push(o);
  });
  const rc = new THREE.Raycaster(), dn = new THREE.Vector3(0, -1, 0), o = new THREE.Vector3(), t0 = performance.now();
  const nm = h => { let n = ''; for (let p = h.object; p && !n; p = p.parent) n = p.name; return (n || '?') + (h.object.isInstancedMesh ? ' [inst]' : ''); };
  const face = L => L.find(h => h.face);   // lưới vỏ cây sau memTrim trả lời tia bằng HỘP theo đoạn cành (không có face): không phải mặt thật ⇒ bỏ, ghi riêng vào box / aboveBox
  const res = P.map(b => {
    rc.set(o.set(b.x, b.y, b.z), dn); rc.far = 3; const H = rc.intersectObjects(list, false), h = face(H);
    rc.set(o.set(b.x, b.y + b.r + 0.3, b.z), dn); rc.far = b.r + 0.3 - 1e-4; const U = rc.intersectObjects(list, false), u = face(U);
    return { gap: h ? h.distance - b.r : null, gapOn: h ? nm(h) : null, box: H.length && !H[0].face ? nm(H[0]) : null, above: u ? nm(u) : null, aboveD: u ? b.r + 0.3 - u.distance : null, aboveBox: U.length && !U[0].face ? nm(U[0]) : null };
  });
  return { res, meshes: list.length, ms: performance.now() - t0 };
}
function pgFps(L) {   // cùng điều kiện đầu, chạy looseTick ở 3 tốc độ khung
  const run = (S, dt) => { const B = looseBody(S.r, { e: S.e, mu: 0.6, rr: S.rr }), obj = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() };
    B.p.set(S.x, cowY(S.x, S.z) + S.h, S.z); B.p0.copy(B.p); B.v.set(S.vx, S.vy, S.vz); let n = 0; while (!looseTick(B, dt, obj) && n * dt < 14) n++;
    return { x: B.p.x, y: B.p.y, z: B.p.z, wet: B.wet, rest: B.rest, steps: Math.round(B.age * 120) }; };
  let ms = 0, steps = 0; const rows = L.map(S => { const a = run(S, 1 / 20), t0 = performance.now(), b = run(S, 1 / 60); ms += performance.now() - t0; steps += b.steps; const c = run(S, 1 / 144);
    return { wet: a.wet || b.wet || c.wet, rest: a.rest && b.rest && c.rest, d: Math.max(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z), Math.hypot(c.x - b.x, c.y - b.y, c.z - b.z)) }; });
  return { rows, usPerStep: ms * 1000 / steps, steps };
}
function pgView(dts) {
  simSetup(); const c = __dbg.clock, R = renderer, orig = R.render, res = []; R.render = () => {};
  try { for (const dt of dts) { c.__dt = dt;
      autoRotate = true; tTheta = theta = 1; let n = Math.round(4 / dt); __dbg.frames(n); const rate = (tTheta - 1) / (n * dt);
      autoRotate = false; theta = 1; tTheta = 2; n = Math.round(0.2 / dt); __dbg.frames(n); res.push({ dt, rate, step02: theta - 1, sec: n * dt }); }
  } finally { R.render = orig; c.__dt = 1 / 20; autoRotate = false; }
  return res;
}
function pgFault() {
  let bad = 0, good = 0; const L0 = (WORLD_TICKS.get('wild') || []).length;
  const fb = () => { bad++; throw new Error('physics-probe: tick hỏng thử'); }, fg = () => { good++; };
  worldTick('wild', -1e9, fb); worldTick('wild', 1e9, fg);
  const f0 = renderer.info.render.frame; __dbg.frames(5); const f1 = renderer.info.render.frame;
  const L = WORLD_TICKS.get('wild'); for (let i = L.length - 1; i >= 0; i--) if (L[i].fn === fb || L[i].fn === fg) L.splice(i, 1);
  return { bad, good, drawn: f1 - f0, ticks: L0, left: L.length };
}
function pgRacGo(o) {   // bấm cây táo già, tua tới lúc gấu mèo vứt lõi
  simSetup(); const c = __dbg.clock; c.__dt = 1 / 20; const R = renderer, orig = R.render; R.render = () => {};
  const B = raccoonBrain.state, C = raccoonBrain.climb.C, log = []; let last = '', k = 0, tell = 0;
  try { while (!C.core && k * c.__dt < o.max) {
      if (B.st !== 'toTree' && B.st !== 'climb' && k >= tell) { worldTell('appleTreeTap', appleTrees[2]); tell = k + 400; }
      window.__hourOverride = o.hour + k * c.__dt / 3600; __dbg.frames(1); k++;
      const key = B.st + (B.st === 'climb' ? ':' + C.ph : ''); if (key !== last) { last = key; log.push((k * c.__dt).toFixed(1) + ' ' + key); } }
  } finally { R.render = orig; }
  if (!C.core) return { ok: false, sec: k * c.__dt, log };
  const b = C.core.B, T = appleTrees[2].position, x = b.p.x, z = b.p.z, gy = cowY(x, z);
  return { ok: true, sec: k * c.__dt, log, p: b.p.toArray(), v: b.v.toArray(), gy, tree: T.toArray(), rac: raccoonObj.position.toArray(), th: theta,
    oldIn: (colSub(7, x, z, gy + 0.001, gy + 0.06) & colBit(x, z)) !== 0, oldTop: colRestY(x, z, gy + 3, 0, 7) - gy };
}
function pgRacStep(o) {   // n khung ở dt, không vẽ → trạng thái lõi
  const c = __dbg.clock; c.__dt = o.dt; const R = renderer, orig = R.render; R.render = () => {}; try { __dbg.frames(o.n); } finally { R.render = orig; }
  const K = raccoonBrain.climb.C.core; if (!K) return null; const b = K.B, g = K.g.position;
  return { x: g.x, y: g.y, z: g.z, air: b.air, rest: b.rest, wet: b.wet, hits: b.hits, sp: b.v.length(), vis: K.g.visible, ph: raccoonBrain.climb.C.ph, st: raccoonBrain.state.st };
}
function pgSnap(o) { __dbg.view(o.t[0], o.t[1], o.t[2], o.th, o.ph, o.zoom); return __dbg.snap(o.cut ? radius - o.cut : 0.1); }   // cut: cắt mọi thứ gần camera hơn đích quá `cut` (bỏ tán lá che)
function pgRacMC(o) {   // 300 lần vứt từ đúng chỗ đó với vận tốc ngẫu nhiên như dropCore
  let s = o.seed >>> 0; const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296, L = [];
  for (let i = 0; i < o.n; i++) L.push({ kind: 'core', x: o.p[0], y: o.p[1], z: o.p[2], r: 0.03, e: 0.28, rr: 0.16, vx: (rnd() - 0.5) * 0.4, vy: 0.4, vz: (rnd() - 0.5) * 0.4 });
  return L;
}

(async () => {
  const br = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
  const page = await br.newPage({ viewport: { width: 1280, height: 800 } }), errs = [];
  page.on('pageerror', e => { errs.push(e.message); console.log('PAGEERR', e.message.slice(0, 200)); });
  await page.addInitScript(() => { window.__hourOverride = 12; });
  await page.goto(url + '?b=' + Date.now());
  await page.waitForFunction(() => window.__tBuilt !== undefined && window.__dbg, null, { timeout: 300000, polling: 500 });
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {}); await page.waitForTimeout(8000);
  await page.addScriptTag({ content: fs.readFileSync(__dirname + '/../../src/tools/engineer-audit/harness.js', 'utf8') });
  await page.evaluate(() => wxLock({ raining: false, thunder: false, windSpeed: 2, cloudCover: 15 }));
  const E = (fn, arg) => page.evaluate(([s, a]) => __ev('(' + s + ')(' + a + ')'), [fn.toString(), JSON.stringify(arg === undefined ? null : arg)]);
  const png = (name, dataUrl) => fs.writeFileSync(out + '/' + name + '.png', Buffer.from(dataUrl.split(',')[1], 'base64'));
  const R = { seed: SEED }; const save = () => fs.writeFileSync(out + '/rows.json', JSON.stringify(R, null, 1));
  R.ready = await E(pgReady); console.log('ready', JSON.stringify(R.ready));

  const sumDrops = (rows, hasGap) => {   // in0 (thả ngay trong khoảng đặc) tính riêng · box: ngay dưới là hộp thay thế của lưới vỏ cây, tia không kiểm được
    const by = {}; for (const r of rows) (by[r.on] = by[r.on] || []).push(r);
    const dry = rows.filter(r => !r.wet), live = rows.filter(r => !r.in0), S = { n: rows.length, ground: (by.ground || []).length, solid: (by.solid || []).length, water: (by.water || []).length,
      spawnInside: rows.length - live.length, notRest: dry.filter(r => !r.rest).length, forcedAt12s: dry.filter(r => r.rest && r.t >= 12).length, nan: rows.filter(r => !r.fin).length,
      belowGround: rows.filter(r => r.minG < -1e-6).length, minG: r3(Math.min(...rows.map(r => r.minG))), insideSolid: live.filter(r => r.inS > 0).length, insideSteps: live.reduce((a, r) => a + r.inS, 0),
      offMax: r3(Math.max(...dry.map(r => Math.abs(r.off)))), wetOffMax: by.water ? r3(Math.max(...by.water.map(r => Math.abs(r.off)))) : null,
      tRest: { med: r3(q(dry.map(r => r.t), 0.5)), p95: r3(q(dry.map(r => r.t), 0.95)), max: r3(Math.max(...dry.map(r => r.t))) }, hits: { med: q(dry.map(r => r.hits), 0.5), max: Math.max(...dry.map(r => r.hits)) },
      roll: { med: r3(q(dry.map(r => r.roll), 0.5)), p95: r3(q(dry.map(r => r.roll), 0.95)), max: r3(Math.max(...dry.map(r => r.roll))) }, vmax: r3(Math.max(...rows.map(r => r.vmax))) };
    if (hasGap) { const G = dry.filter(r => !r.in0 && !r.box && r.gap != null), top = {};
      for (const k of ['ground', 'solid']) { const g = G.filter(r => r.on === k).map(r => r.gap);
        S['gap_' + k] = g.length ? { n: g.length, med: r3(q(g, 0.5)), p05: r3(q(g, 0.05)), p95: r3(q(g, 0.95)), min: r3(Math.min(...g)), max: r3(Math.max(...g)), over5cm: g.filter(x => Math.abs(x) > 0.05).length, over15cm: g.filter(x => Math.abs(x) > 0.15).length } : null; }
      S.barkBox = dry.filter(r => !r.in0 && r.box).length; S.noRay = dry.filter(r => !r.in0 && !r.box && r.gap == null).length;
      const U = dry.filter(r => !r.in0 && r.above); S.under = U.length; for (const r of U) top[r.above] = (top[r.above] || 0) + 1; S.underBy = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 8); }
    return S;
  };

  if (ONLY.includes('drops')) {
    const L = await E(pgSites, { seed: SEED, apple: 60, van: 120, props: 120, obst: 150, map: 400 });
    const D = await E(pgDrops, L), G = await E(pgGaps, D.rows.map(r => ({ x: r.x, y: r.y, z: r.z, r: r.r })));
    D.rows.forEach((r, i) => Object.assign(r, G.res[i]));
    R.drops = { sum: sumDrops(D.rows, true), steps: D.steps, ms: r3(D.ms), usPerStep: r3(D.ms * 1000 / D.steps), rayMeshes: G.meshes, rayMs: r3(G.ms) };
    for (const k of [...new Set(D.rows.map(r => r.kind.replace(/\d$/, '')))]) R.drops['kind_' + k] = sumDrops(D.rows.filter(r => r.kind.replace(/\d$/, '') === k), true);
    R.dropRows = D.rows; console.log('drops', JSON.stringify(R.drops, null, 1)); save();
  }
  if (ONLY.includes('fps')) {
    const L = await E(pgSites, { seed: SEED + 1, apple: 20, van: 40, props: 40, obst: 40, map: 60 }), F = await E(pgFps, L), dry = F.rows.filter(r => !r.wet);
    R.fps = { n: F.rows.length, dry: dry.length, allRest: dry.every(r => r.rest), maxDiff: Math.max(...dry.map(r => r.d)), wet: F.rows.length - dry.length, usPerStep: r3(F.usPerStep), steps: F.steps };
    console.log('fps', JSON.stringify(R.fps)); save();
  }
  if (ONLY.includes('view')) {
    R.view = (await E(pgView, [1 / 20, 1 / 60, 1 / 144])).map(v => ({ fps: Math.round(1 / v.dt), radPerSec: +v.rate.toFixed(5), step02: +v.step02.toFixed(4), sec: +v.sec.toFixed(4),
      before: { radPerSec: +(0.0008 / v.dt).toFixed(5), step02: +(1 - Math.pow(0.92, Math.round(0.2 / v.dt))).toFixed(4) } }));
    console.log('view', JSON.stringify(R.view)); save();
  }
  if (ONLY.includes('fault')) {
    const e0 = errs.length; R.fault = await E(pgFault); await page.waitForTimeout(300);
    R.fault.pageErrors = errs.slice(e0).filter(m => /physics-probe/.test(m)).length; console.log('fault', JSON.stringify(R.fault)); save();
  }
  if (ONLY.includes('raccoon')) {
    const G = await E(pgRacGo, { max: 420, hour: 16.75 }); R.raccoon = { go: G }; console.log('raccoon go', JSON.stringify(G)); save();   // 16,75 h: gấu mèo đã thức, trời còn sáng
    if (G.ok) {
      // ảnh: camera bám lõi, nhìn từ phía đối diện thân cây (tán táo che các phía khác) · -a cảnh thật · -c cắt mọi thứ trước lõi quá 1,2 m (thấy lõi sau tán lá)
      const th = G.th + Math.PI, tr = [{ t: 0, x: G.p[0], y: G.p[1], z: G.p[2], air: true }], shots = new Set([4, 10, 20, 30, 40, 50, 60, 64, 68, 74, 80, 90, 100, 110, 120]); let k = 0, restK = -1;
      const pair = async (name, t) => { png(name + '-a', await E(pgSnap, { t, th, ph: 1.0, zoom: 75 })); png(name + '-c', await E(pgSnap, { t, th, ph: 1.0, zoom: 75, cut: 1.2 })); };
      await pair('core-000', G.p);
      while (k < 60 * 14) {
        const s = await E(pgRacStep, { dt: 1 / 60, n: 1 }); k++; if (!s) break; tr.push({ t: +(k / 60).toFixed(3), ...s });
        if (shots.has(k)) await pair('core-' + String(k).padStart(3, '0'), [s.x, s.y, s.z]);
        if ((s.rest || s.wet) && restK < 0) restK = k; if (restK >= 0 && k > restK + 30) break;
      }
      const e = tr[tr.length - 1], at = [e.x, e.y, e.z]; R.raccoon.track = tr; R.raccoon.end = e;
      for (const [i, d] of [0, 1.57, 3.14, 4.71].entries()) { png('core-rest-' + i + '-a', await E(pgSnap, { t: at, th: th + d, ph: 1.0, zoom: 90 })); png('core-rest-' + i + '-c', await E(pgSnap, { t: at, th: th + d, ph: 1.0, zoom: 90, cut: 1 })); }
      png('core-rest-wide', await E(pgSnap, { t: at, th, ph: 1.0, zoom: 30 }));
      const gE = await E(pgGaps, [{ x: e.x, y: e.y, z: e.z, r: 0.03 }]); R.raccoon.endGap = gE.res[0];
      const ML = await E(pgRacMC, { seed: SEED + 2, n: 300, p: G.p }), MD = await E(pgDrops, ML), MG = await E(pgGaps, MD.rows.map(r => ({ x: r.x, y: r.y, z: r.z, r: r.r })));
      MD.rows.forEach((r, i) => Object.assign(r, MG.res[i]));
      R.raccoon.mc = sumDrops(MD.rows, true); R.raccoon.mcRows = MD.rows;
      console.log('raccoon end', JSON.stringify(e), JSON.stringify(R.raccoon.endGap), '\nmc', JSON.stringify(R.raccoon.mc, null, 1)); save();
    }
  }
  R.pageErrors = errs; save(); console.log('pageErrors', errs.length);
  await br.close();
})().catch(e => { console.log('ERR', e.stack || e.message); process.exit(1); });
