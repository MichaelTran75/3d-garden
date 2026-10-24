// BỘ KIỂM TRA HÀNH VI KỸ SƯ (G 24/10 "engineer đang bị lỗi, liệt kê lỗi task theo thời gian") — nạp vào bản gỡ lỗi (make-debug.py) bởi run.cjs
// tua nhanh: đồng hồ cố định 1/20 s, không vẽ; giờ cảnh theo window.__hourOverride
window.simSetup = () => { const c = __dbg.clock; if (!c.__p) { c.__p = 1; c.__dt = 1 / 20; c.getDelta = () => { c.elapsedTime += c.__dt; return c.__dt; }; } };
window.sim2 = (sec, h0) => {
  simSetup(); const c = __dbg.clock, R = __dbg.renderer, orig = R.render; R.render = () => {};
  const dt = c.__dt, n = Math.round(sec / dt), e = __dbg.engObj, log = []; let last = '';
  try {
    for (let i = 0; i < n; i++) {
      const h = h0 + i * dt / 3600; window.__hourOverride = h; __dbg.frames(1);
      const V = e.van, key = [e.act, e.phase, e.inVan ? 1 : 0, V ? (V.station || '-') + ':' + (V.st || '-') : ''].join(' ');
      if (key !== last) { last = key; const p = e.g.position; const hm = Math.floor(h) + ':' + String(Math.floor(h * 60 % 60)).padStart(2, '0') + ':' + String(Math.floor(h * 3600 % 60)).padStart(2, '0'); log.push(hm + ' ' + key + ' @' + p.x.toFixed(2) + ',' + p.y.toFixed(2) + ',' + p.z.toFixed(2)); }
    }
  } finally { R.render = orig; }
  return log;
};
window.envSim = (sec, h0, extra) => {
  simSetup(); const c = __dbg.clock, R = __dbg.renderer, orig = R.render; R.render = () => {};
  const dt = c.__dt, n = Math.round(sec / dt), e = __dbg.engObj, log = [], cnt = {}; let last = '';
  const RX = __ev('RX'), ENV = __ev('ENV');
  try {
    for (let i = 0; i < n; i++) {
      const h = h0 + i * dt / 3600; window.__hourOverride = h; __dbg.frames(1);
      const key = [e.act, e.phase, RX.hold ? 'H:' + RX.hold.k : '', RX.gest ? 'G:' + RX.gest.k : '', ENV.tgt ? 'T:' + ENV.tgt.kind : '', ENV.bf ? 'BF:' + ENV.bf.st : '', extra ? extra() : ''].join(' ');
      if (key !== last) {
        last = key; const hm = Math.floor(h) + ':' + String(Math.floor(h * 60 % 60)).padStart(2, '0') + ':' + String(Math.floor(h * 3600 % 60)).padStart(2, '0');
        log.push(hm + ' ' + key); for (const w of key.split(' ')) if (/^[HGTB]/.test(w)) cnt[w] = (cnt[w] || 0) + 1;
      }
      if (!isFinite(e.g.position.x)) { log.push('NaN!'); break; }
    }
  } finally { R.render = orig; }
  return { cnt, log: log.slice(-120) };
};
// tới khi điều kiện đúng (hoặc hết sec giây), trả số giây đã chạy
window.envTo = (cond, sec, h0) => { simSetup(); const dt = __dbg.clock.__dt, R = __dbg.renderer, orig = R.render; R.render = () => {}; let k = 0;
  try { while (!cond() && k * dt < sec) { window.__hourOverride = h0 + k * dt / 3600; __dbg.frames(1); k++; } } finally { R.render = orig; }
  return +(k * dt).toFixed(2);
};
// chạy sec giây (giờ trôi từ h0), gọi each(t) mỗi khung; không vẽ
window.runFor = (sec, h0, each) => { simSetup(); const dt = __dbg.clock.__dt, R = __dbg.renderer, orig = R.render; R.render = () => {};
  try { for (let k = 0; k * dt < sec; k++) { if (h0 !== undefined) window.__hourOverride = h0 + k * dt / 3600; __dbg.frames(1); if (each && each(k * dt) === false) break; } } finally { R.render = orig; } };
window.wxLock = (o) => {   // khoá trường thời tiết (getter, setter bỏ qua)
  const st = __ev('liveWeather').state; window.__wx = Object.assign(window.__wx || {}, o);
  for (const k of Object.keys(o)) Object.defineProperty(st, k, { get: () => window.__wx[k], set: () => {}, configurable: true });
};
window.audInit = (o = {}) => {
  simSetup();
  const E = k => __ev(k);
  window.AUD = { tr: [], an: [], info: [], h: null, last: '', lastT: 0, pp: null, par: null, look: 0, ring: [], ringT: 0, inT: 0, gT: 0, fT: 0, forceSince: null,
    auto: null, done: null, act: null, once: null, left: {}, dd: {}, frames: 0, opts: o,
    R: { SW: E('skyWatch'), DR: E('droneToy'), AP: E('applePick'), TJ: E('trimJob'), GJ: E('gardenJob'), WJ: E('woodJob'), EJ: E('engineJob'), XJ: E('exploreJob'), AUTO: E('AUTO'),
      cowY: E('cowY'), FEET: E('ENG_FEET'), colHit: E('colHit'), COL: E('COL'), gY: E('engGroundY'), sched: E('engScheduleAt'), ACTS: E('ENG_ACTS'), scene: __dbg.scene } };
  return 'ok';
};
const audHM = h => { const s = Math.round(h * 3600); return Math.floor(s / 3600) + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const audSub = (e, R) => { const p = e.phase;
  return p === 'stars' ? R.SW.state.st : p === 'drone' ? R.DR.state.st : (p === 'apple' || p === 'appleEat') ? R.AP.state.st + (R.AP.state.eat ? '/' + R.AP.state.eat.st : '')
    : p === 'trim' ? R.TJ.state.st : p === 'garden' ? R.GJ.state.st : p === 'wood' ? R.WJ.state.st : p === 'engine' ? R.EJ.state.st : p === 'explore' && R.XJ && R.XJ.state ? R.XJ.state.st : ''; };
window.audRun = (h0, sec) => {
  const A = AUD, R = A.R, c = __dbg.clock, dt = c.__dt, Rn = __dbg.renderer, orig = Rn.render, e = __dbg.engObj; Rn.render = () => {};
  if (A.h === null || Math.abs(A.h - h0) > 0.01) A.h = h0;
  const n = Math.round(sec / dt), an = (type, x) => { const dk = type + '|' + (x.key || ''), last = A.dd[dk]; if (last !== undefined && A.h - last < (x.gap ?? 60) / 3600) return; A.dd[dk] = A.h; delete x.gap; A.an.push(Object.assign({ t: audHM(A.h), h: +A.h.toFixed(4), type }, x)); };
  try {
    for (let i = 0; i < n; i++) {
      window.__hourOverride = A.h;
      try { __dbg.frames(1); } catch (err) { an('exception', { key: String(err && err.message).slice(0, 80), msg: String(err && err.stack || err).split('\n').slice(0, 3).join(' | ').slice(0, 300), gap: 30 }); }
      A.frames++; const h = A.h; A.h += dt / 3600;
      const p = e.g.position, sub = audSub(e, R), V = e.van;
      const key = e.act + ' ' + e.phase + (e.inVan ? ' [xe ' + (V ? (V.station || '-') + ':' + (V.st || '-') : '-') + ']' : '') + (sub ? ' ' + sub : '') + (e.seat ? ' ghế:' + e.seat.st : '');
      if (!isFinite(p.x + p.y + p.z)) { an('NaN', { key, gap: 1e9 }); break; }
      if (key !== A.last) { if (A.tr.length < 20000) A.tr.push([+h.toFixed(4), key, +p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)]); A.last = key; A.lastT = h; }
      // nhảy vị trí trong 1 khung (cùng cha)
      if (A.pp && A.par === e.g.parent) { const d = Math.hypot(p.x - A.pp.x, p.y - A.pp.y, p.z - A.pp.z); if (d > 0.9) an('teleport', { key, d: +d.toFixed(2), from: [A.pp.x, A.pp.z].map(v => +v.toFixed(2)), to: [p.x, p.z].map(v => +v.toFixed(2)), gap: 5 }); }
      A.pp = { x: p.x, y: p.y, z: p.z }; A.par = e.g.parent;
      // kẹt (engStep: đứng lại nhìn quanh rồi đi vòng)
      const lk = e.nav ? e.nav.look : 0; if (lk > 0 && A.look <= 0) an('stuck', { key, at: [p.x, p.z].map(v => +v.toFixed(2)), tgt: [e.nav.tx, e.nav.tz].map(v => +v.toFixed(2)), gap: 20 }); A.look = lk;
      // 1 lần / giây: vật lộn tại chỗ, đứng trong vật cản, lơ lửng / lún, ngắm sao sớm, lệnh treo, đồ bỏ dở
      A.ringT += dt; if (A.ringT >= 1) { A.ringT = 0;
        A.ring.push([p.x, p.z, e.walking ? 1 : 0, key]); if (A.ring.length > 30) A.ring.shift();
        if (A.ring.length === 30) { const w = A.ring.reduce((s, r) => s + r[2], 0) / 30; let m = 0; for (const r of A.ring) m = Math.max(m, Math.hypot(r[0] - A.ring[0][0], r[1] - A.ring[0][1]));
          if (w > 0.8 && m < 0.6) an('struggle', { key, at: [p.x, p.z].map(v => +v.toFixed(2)), walkFrac: +w.toFixed(2), span: +m.toFixed(2), gap: 60 }); }
        const out = !e.inVan && e.phase !== 'van' && e.g.parent === R.scene, sitting = e.seat && !['go', 'stood', 'leave', 'path'].includes(e.seat.st);
        if (out && !sitting && R.COL.ready) { const g = R.gY(p.x, p.z); if (R.colHit(7, p.x, p.z, g + 0.3, g + 1.6)) an('insideObstacle', { key, at: [p.x, p.z].map(v => +v.toFixed(2)), gap: 30 }); }
        if (out && !sitting && !['stars', 'nap', 'pet', 'trim', 'garden', 'engine'].includes(e.phase)) { const dy = p.y - (R.cowY(p.x, p.z) - R.FEET); if (Math.abs(dy) > 0.65) an(dy > 0 ? 'floating' : 'sunk', { key, dy: +dy.toFixed(2), at: [p.x, p.z].map(v => +v.toFixed(2)), gap: 60 }); }
        if (e.phase === 'stars' && h < 19) an('starsBefore19', { key, gap: 300 });
        const f = __ev('engForceAct'); if (f) { if (A.forceSince === null) A.forceSince = h; else if (h - A.forceSince > (f === 'stars' ? 65 : 25) / 60) an('forceStale', { key: f, since: audHM(A.forceSince), gap: 1800 }); } else A.forceSince = null;
        const jobs = [['stars', R.SW, () => R.SW.state.st !== 'idle', ['stars']], ['drone', R.DR, () => R.DR.state.st !== 'idle', ['drone']], ['trim', R.TJ, () => R.TJ.busy(), ['trim']], ['garden', R.GJ, () => R.GJ.busy(), ['garden']],
          ['wood', R.WJ, () => R.WJ.busy(), ['wood']], ['engine', R.EJ, () => R.EJ.busy(), ['engine']], ['apple', R.AP, () => R.AP.busy, ['apple', 'appleEat']]];
        for (const [nm, , busy, ph] of jobs) { if (busy() && !ph.includes(e.phase)) { A.left[nm] = (A.left[nm] || 0) + 1; if (A.left[nm] > 15) an('leftover', { key: nm + ' còn chạy khi pha ' + e.phase, st: nm === 'apple' ? R.AP.state.st : (R.DR && nm === 'drone' ? R.DR.state.st : ''), gap: 300 }); } else A.left[nm] = 0; }
      }
      // tự chủ / xong việc 1 lần / bỏ dở việc 1 lần / khung lịch
      const au = R.AUTO.act; if (au !== A.auto) { A.info.push([audHM(h), 'tự chủ', au || '— (về lịch)', R.AUTO.cmd ? 'lệnh' : '']); A.auto = au; }
      if (e.doneAct !== A.done) { A.info.push([audHM(h), 'xong', e.doneAct]); A.done = e.doneAct; }
      if (e.act !== A.act) {
        if (A.act && R.ACTS[A.act] && R.ACTS[A.act].once && e.onceKey && e.onceKey.startsWith(A.act + '@') && e.doneAct !== e.onceKey && e.act !== 'sleep') an('onceAbandoned', { key: A.act + ' → ' + e.act, gap: 600 });
        A.info.push([audHM(h), 'việc', (A.act || '-') + ' → ' + e.act]); A.act = e.act; }
      const sa = R.sched(h).act; if (sa !== A.slot) { A.info.push([audHM(h), 'lịch', sa]); A.slot = sa; }
    }
  } finally { Rn.render = orig; window.__hourOverride = undefined; }
  return { h: +A.h.toFixed(4), frames: A.frames, tr: A.tr.length, an: A.an.length };
};
window.harnessReady = true;
