// A: nhảy thẳng vào 21 cọc rào biogas (20 s mỗi cọc) · B: lang thang quanh hệ (8 × 90 s) — lấn theo ô con 3 cm (lớp chung 0–2 / lớp riêng thỏ 4), hở gần nhất tới cọc, thời gian lọt vào trong rào
const B = window.__B, b = B.b, E = B.E, THREE = __dbg.THREE, dt = 1 / 60;
const g = E("scene.getObjectByName('Hệ biogas ống mềm')"), V = new THREE.Vector3();
let seed = 12345; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function reset(x, z, ang, forceHop) { b.x = x; b.z = z; b.ang = ang; b.hop = 0; b.state = forceHop ? 'hop' : 'sniff'; b.tmr = forceHop ? 1e9 : 0.5; b.digTmr = 1e9; if (b.life) b.life.st = ''; b.col.ghost = 0; b.col.stuck = 0; b.col.gext = 0; b.g.visible = true; b.want = ang; b.hp = null; b.fall = null; b.yawV = ang; b.sy = undefined; }
const mk = () => ({ n: 0, ms: 0, msMax: 0, chk: 0, p7: 0, p7max: 0, p4: 0, p4max: 0, pc: 0, gapMin: 9, gaps: [], inF: 0, ghost: 0, flips: 0 });
function run(secs, M) {
  let t = E('clock.elapsedTime') + 1000 + rnd() * 100, pa = b.ang, gmin = 9;
  for (let i = 0, n = Math.round(secs / dt); i < n; i++) {
    t += dt; B.colTick(dt); const q0 = performance.now(); B.bunnyTick(b, dt, t); const q = performance.now() - q0; M.ms += q; M.msMax = Math.max(M.msMax, q); M.n++;
    if (b.col.ghost > 0) M.ghost += dt; if (B.inFence(b.x, b.z)) M.inF += dt;
    if (Math.abs(Math.atan2(Math.sin(b.ang - pa), Math.cos(b.ang - pa))) > 1) M.flips++; pa = b.ang;
    if (i % 3 === 0) { M.chk++; const p7 = B.penVerts(), p4 = B.pen4(); if (p7) M.p7++; if (p4) M.p4++; M.p7max = Math.max(M.p7max, p7); M.p4max = Math.max(M.p4max, p4); if (B.penCell()) M.pc++; if (i % 6 === 0) gmin = Math.min(gmin, B.postGap()); }
  }
  M.gaps.push(gmin); M.gapMin = Math.min(M.gapMin, gmin);
}
const A = mk();
for (const p of B.posts) {
  const out = Math.abs(Math.abs(p.lx) - 2.85) < 1e-3 ? [Math.sign(p.lx), 0] : [0, Math.sign(p.lz)];
  g.localToWorld(V.set(p.lx + out[0] * 1.11, 0, p.lz + out[1] * 1.11));
  const ang = Math.atan2(p.z - V.z, p.x - V.x) + (rnd() - 0.5) * 0.6; reset(V.x, V.z, ang, true); run(20, A);
}
const Bm = mk();
for (let k = 0; k < 8; k++) { const a = rnd() * 6.283, r = 2.6 + rnd() * 1.2; reset(B.C0.x + Math.cos(a) * r, B.C0.z + Math.sin(a) * r, rnd() * 6.283, false); run(90, Bm); }
const pc = (M, k) => +(100 * M[k] / Math.max(1, M.chk)).toFixed(1), med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const sum = M => ({ pen7pct: pc(M, 'p7'), pen7max: M.p7max, pen4pct: pc(M, 'p4'), pen4max: M.p4max, penCellPct: pc(M, 'pc'), gapMinCm: +(100 * M.gapMin).toFixed(1), gapMedCm: +(100 * med(M.gaps)).toFixed(1), inFenceSec: +M.inF.toFixed(1), ghostSec: +M.ghost.toFixed(1), flips: M.flips, msAvg: +(M.ms / M.n).toFixed(3), msMax: +M.msMax.toFixed(2) });
return { A: sum(A), B: sum(Bm), curl: window.__CURL };
