// ĐO BỘ 4 CHÂN quadRig (chó, gấu mèo, bò, hươu): chân trụ có trượt không khi xoay tại chỗ / đi
//   quadTurn(tên, {w, ang, k?, v?, sec?, each?})  gọi thẳng rig.step, không qua hành vi: xoay `ang` rad ở `w` rad/s (k: tốc độ = k × góc còn lại, trần w) · v > 0: vừa đi vừa xoay · each(i, obj): gọi sau mỗi khung (chụp hình giữa cú xoay bằng __dbg.snap)
//   quadWatch(h0, sec)                     chạy trang thật, gom theo loại khung: xoay tại chỗ / đi / dáng nằm – ngồi
// Trượt = quãng bàn chân VẼ RA dời đi giữa 2 khung liền mà chân vẫn là chân trụ · hụt = bàn chân vẽ ra lệch điểm đặt (IK kẹp, hết tầm)
(() => {
  const T = () => __dbg.THREE, v3 = () => new (T().Vector3)();
  const who = name => {
    if (name === 'dog') return { obj: __ev('dogObj'), rig: __ev('dogBrain.rig'), gait: 'walk' };
    if (name === 'raccoon') return { obj: __ev('raccoonObj'), rig: __ev('raccoonBrain.rig'), gait: 'walk' };
    if (name === 'deer') { const s = __ev('stag'); return s && { obj: s.g, rig: s.rig, gait: 'walk' }; }
    const cs = __ev('cows'), i = name === 'cow' ? cs.findIndex(c => c.ps && c.restY < 0.01 && !c.calf) : +name.slice(3), c = cs[i < 0 ? 0 : i]; return c && { obj: c.g, rig: c.rig, gait: 'walk' };
  };
  const tap = A => {   // ghi đối số lần gọi cuối của hành vi (độ chúc thân, dáng nằm)
    if (A.rig.__tap) return; const f = A.rig.step; A.rig.__tap = { f, last: null };
    A.rig.step = function (dt, dist, v, gait, h, pitch, posed) { A.rig.__tap.last = { v, gait, pitch, posed }; return f.call(this, dt, dist, v, gait, h, pitch, posed); };
  };
  const paws = (A, out) => { A.obj.updateMatrixWorld(true); const S = A.obj.scale.y; return A.rig.feet.map((F, i) => { const p = out[i] || (out[i] = v3()); F.L.paw.getWorldPosition(p); return { sw: F.sw, x: p.x, y: p.y, z: p.z, miss: Math.hypot(p.x - F.w.x, p.z - F.w.z, p.y - F.w.y - (F.L.ankleH || 0) * S) }; }); };
  const acc = () => ({ fr: 0, n: 0, slip: 0, slipMax: 0, big: 0, miss: 0, missMax: 0, missBig: 0, steps: 0, air: [0, 0, 0, 0, 0] });
  const add = (R, prev, cur, S) => { R.fr++; let up = 0;
    cur.forEach((f, k) => { if (f.sw) { up++; if (prev && !prev[k].sw) R.steps++; return; } if (f.miss > R.missMax) R.missMax = f.miss; R.miss += f.miss; if (f.miss > 0.06 * S) R.missBig++;
      if (prev && !prev[k].sw) { const d = Math.hypot(f.x - prev[k].x, f.z - prev[k].z); R.n++; R.slip += d; if (d > R.slipMax) R.slipMax = d; if (d > 0.03 * S) R.big++; } });
    R.air[up]++; };
  const fin = R => ({ fr: R.fr, slip: +R.slip.toFixed(3), slipMean: R.n ? +(R.slip / R.n).toFixed(4) : 0, slipMax: +R.slipMax.toFixed(3), big: R.big, missMean: R.n ? +(R.miss / Math.max(1, R.n)).toFixed(3) : 0, missMax: +R.missMax.toFixed(3), missBig: R.missBig, steps: R.steps, air: R.air });
  window.quadReady = (name, maxSec = 40) => {   // chờ con vật đứng thẳng (không nằm / ngồi), trả đối số cuối
    const A = who(name); if (!A || !A.obj || !A.rig) return null; tap(A); const Rn = __dbg.renderer, orig = Rn.render; Rn.render = () => {};
    try { for (let i = 0; i < maxSec * 20; i++) { __dbg.frames(1); const L = A.rig.__tap.last; if (L && !L.posed && Math.abs(L.v) < 0.06 && !A.rig.fk.some(K => K && K.w > 0) && !A.rig.free.some(Boolean) && !A.rig.feet.some(F => F.sw)) return L; } } finally { Rn.render = orig; }
    return A.rig.__tap.last && { ...A.rig.__tap.last, notReady: true };
  };
  window.quadTurn = (name, o) => {
    const A = who(name), L = A.rig.__tap && A.rig.__tap.last || { pitch: 0 }, step = A.rig.__tap ? A.rig.__tap.f : A.rig.step, obj = A.obj, S = obj.scale.y, dt = o.dt || 0.05, sg = o.ang < 0 ? -1 : 1;
    const y0 = obj.rotation.y, x0 = obj.position.x, z0 = obj.position.z, yy0 = obj.position.y, tmp = [], R = acc(), E = acc(), v = o.v || 0, tr = [];
    const sup = () => (A.rig.support(0) + A.rig.support(1) + A.rig.support(2) + A.rig.support(3)) / 4, s0 = sup();
    let prev = paws(A, tmp).map(f => ({ ...f })), rem = Math.abs(o.ang), tEnd = -1, t = 0, rest = 0;
    for (let i = 0; i < 2000; i++) {
      const d = Math.min(rem, (o.k ? Math.min(o.w, o.k * rem) : o.w) * dt); rem -= d; obj.rotation.y += sg * d;
      if (v) { obj.position.x += Math.cos(obj.rotation.y) * v * dt; obj.position.z -= Math.sin(obj.rotation.y) * v * dt; obj.position.y = yy0 + sup() - s0; }
      step.call(A.rig, dt, v * dt, v, o.gait || A.gait, 0, L.pitch, false); t += dt;
      const cur = paws(A, tmp).map(f => ({ ...f })); add(rem > 1e-6 || o.sec ? R : E, prev, cur, S);
      if (o.trace && i % o.trace === 0) tr.push([+t.toFixed(2), +(obj.rotation.y - y0).toFixed(2), cur.map(f => (f.sw ? 'S' : '.') + f.miss.toFixed(2)).join(' ')]);
      prev = cur; if (o.each) o.each(i, obj);
      if (o.sec) { if (t >= o.sec) break; if (rem <= 1e-6) rem = 0; }
      else if (rem <= 1e-6) { if (tEnd < 0) tEnd = t; if (cur.some(f => f.sw)) rest = t - tEnd; if (t - tEnd > 1.5) break; }
    }
    obj.rotation.y = y0; obj.position.set(x0, yy0, z0); A.rig.reset(); step.call(A.rig, dt, 0, 0, A.gait, 0, L.pitch, false);
    const out = { name, w: o.w, ang: o.ang, k: o.k || 0, v, S: +S.toFixed(2), turnSec: +tEnd.toFixed(2), settleAfter: +rest.toFixed(2), turn: fin(R), after: fin(E) }; if (o.trace) out.trace = tr; return out;
  };
  const WB = [1, 2.2, 3.5, 5, 99];   // khung xoay tại chỗ chia theo tốc độ xoay (rad/s)
  window.quadWatch = (h0, sec, names = ['dog', 'raccoon', 'cow', 'deer'], traceName) => {   // traceName: ghi từng khung xoay tại chỗ của con đó [t, rad/s, 4 chân: S = đang nhấc, số = quãng trượt mm]
    const As = names.map(n => ({ n, A: who(n) })).filter(x => x.A && x.A.obj && x.A.rig), Rn = __dbg.renderer, orig = Rn.render, dt = __dbg.clock.__dt || 0.05; Rn.render = () => {};
    for (const x of As) { tap(x.A); x.tmp = []; x.prev = null; x.py = null; x.pp = null; x.R = { turn: acc(), walk: acc(), still: acc(), posed: acc() }; x.wMax = 0; x.wSum = 0; x.wPosed = 0; x.bins = WB.map(() => acc()); }
    let h = h0; const tr = [];
    try { for (let k = 0; k * dt < sec; k++) { window.__hourOverride = h; __dbg.frames(1); h += dt / 3600;
      for (const x of As) { const A = x.A, o = A.obj, L = A.rig.__tap.last; if (!o.visible || !L) { x.prev = null; continue; }
        const cur = paws(A, x.tmp).map(f => ({ ...f })); let w = 0, jump = false;
        if (x.py !== null) { w = Math.atan2(Math.sin(o.rotation.y - x.py), Math.cos(o.rotation.y - x.py)) / dt; jump = Math.hypot(o.position.x - x.pp[0], o.position.z - x.pp[1]) > 0.6; }
        x.py = o.rotation.y; x.pp = [o.position.x, o.position.z];
        if (jump || A.rig.free.some(Boolean)) { x.prev = null; continue; }
        const cat = L.posed || A.rig.fk.some(K => K && K.w > 0.02) ? 'posed' : Math.abs(L.v) > 0.06 ? 'walk' : Math.abs(w) > 0.3 ? 'turn' : 'still';
        if (cat === 'turn') { x.wMax = Math.max(x.wMax, Math.abs(w)); x.wSum += Math.abs(w) * dt; } else if (cat === 'posed') x.wPosed += Math.abs(w) * dt;
        if (x.n === traceName && cat === 'turn' && tr.length < 400) tr.push([+(k * dt).toFixed(2), +w.toFixed(2), cur.map((f, j) => f.sw ? 'S' : x.prev && !x.prev[j].sw ? Math.round(1000 * Math.hypot(f.x - x.prev[j].x, f.z - x.prev[j].z)) : '-').join(' '), cur.map(f => Math.round(1000 * f.miss)).join(' ')]);
        add(x.R[cat], x.prev, cur, o.scale.y); if (cat === 'turn') add(x.bins[WB.findIndex(b => Math.abs(w) < b)], x.prev, cur, o.scale.y); x.prev = cur; } } }
    finally { Rn.render = orig; window.__hourOverride = undefined; }
    const out = { h }; if (traceName) out.trace = tr; for (const x of As) { out[x.n] = { wMax: +x.wMax.toFixed(2), turned: +x.wSum.toFixed(2), turnedPosed: +x.wPosed.toFixed(2) }; for (const c in x.R) out[x.n][c] = fin(x.R[c]); out[x.n].byRate = x.bins.map((b, i) => ({ under: WB[i], ...fin(b) })); } return out;
  };
})();
