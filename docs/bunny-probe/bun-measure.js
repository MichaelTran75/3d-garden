// A: nhảy thẳng vào từng cọc rào biogas (23 cọc, 20 s nhảy liền) · B: lang thang tự nhiên quanh hệ (8 lượt × 90 s) — đếm lấn, lượt xuyên, giật hướng
const B = window.__B, b = B.b, E = B.E, THREE = __dbg.THREE, dt = 1 / 60, TAG = window.__TAG || 'x';
const g = E("scene.getObjectByName('Hệ biogas ống mềm')"), V = new THREE.Vector3();
let seed = 12345; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function reset(x, z, ang, forceHop) {
  b.x = x; b.z = z; b.ang = ang; b.hop = 0; b.state = forceHop ? 'hop' : 'sniff'; b.tmr = forceHop ? 1e9 : 0.5; b.digTmr = 1e9; if (b.life) b.life.st = '';
  b.col.ghost = 0; b.col.stuck = 0; b.col.gext = 0; b.g.visible = true; b.want = ang; b.hp = null; b.sy = undefined; b.fall = null; b.yawV = ang;
}
function run(secs, M, path) {
  let t = E('clock.elapsedTime') + 1000 + rnd() * 100, pa = b.ang, clear = false;
  for (let i = 0, n = Math.round(secs / dt); i < n; i++) {
    t += dt; B.colTick(dt); const q0 = performance.now(); B.bunnyTick(b, dt, t); const q1 = performance.now() - q0; M.msMax = Math.max(M.msMax, q1); M.msSum += q1; M.n++;
    if (b.col.ghost > 0) M.ghost += dt;
    let da = Math.abs(Math.atan2(Math.sin(b.ang - pa), Math.cos(b.ang - pa))); if (da > 1) M.flips++; pa = b.ang;
    const ov = B.postOverlap(); M.ovMax = Math.max(M.ovMax, ov); if (ov > 0.02) M.ovT += dt;
    if (i % 3 === 0) { const p = B.penVerts(); M.chk++; if (p >= 1) M.pen1++; if (p >= 5) M.pen5++; M.penMax = Math.max(M.penMax, p); if (!p) clear = true; if (clear) { M.chkC++; if (p >= 1) M.pen1C++; M.penMaxC = Math.max(M.penMaxC, p); } else M.startIn += 3 * dt; if (path && i % 6 === 0) path.push([+b.x.toFixed(3), +b.z.toFixed(3), p >= 1 ? 1 : 0]); }
    else if (path && i % 6 === 0) path.push([+b.x.toFixed(3), +b.z.toFixed(3), 0]);
    M.dist += 0;
  }
}
const mk = () => ({ msMax: 0, msSum: 0, n: 0, chkC: 0, pen1C: 0, penMaxC: 0, startIn: 0, chk: 0, pen1: 0, pen5: 0, penMax: 0, ovMax: 0, ovT: 0, ghost: 0, flips: 0, dist: 0 });
const A = mk(), paths = [];
for (const p of B.posts) {
  const out = Math.abs(Math.abs(p.lx) - 2.85) < 1e-3 ? [Math.sign(p.lx), 0] : [0, Math.sign(p.lz)];
  g.localToWorld(V.set(p.lx + out[0] * 1.11, 0, p.lz + out[1] * 1.11));
  const ang = Math.atan2(p.z - V.z, p.x - V.x) + (rnd() - 0.5) * 0.6;
  reset(V.x, V.z, ang, true); const path = []; const x0 = b.x, z0 = b.z; run(20, A, path); paths.push(path);
}
const Bm = mk(), pathsB = [];
for (let k = 0; k < 8; k++) {
  const a = rnd() * 6.283, r = 2.6 + rnd() * 1.2; V.set(B.C0.x + Math.cos(a) * r, 0, B.C0.z + Math.sin(a) * r);
  reset(V.x, V.z, rnd() * 6.283, false); const path = []; run(90, Bm, path); pathsB.push(path);
}
const pct = (M, k) => +(100 * M[k] / Math.max(1, M.chk)).toFixed(1);
const sum = M => ({ msAvg: +(M.msSum / Math.max(1, M.n)).toFixed(3), msMax: +M.msMax.toFixed(2), afterClear: { pen1pct: +(100 * M.pen1C / Math.max(1, M.chkC)).toFixed(1), penMax: M.penMaxC }, startInsideSec: +M.startIn.toFixed(1), pen1pct: pct(M, 'pen1'), pen5pct: pct(M, 'pen5'), penMax: M.penMax, postOvMaxCm: +(100 * M.ovMax).toFixed(1), postOvSec: +M.ovT.toFixed(1), ghostSec: +M.ghost.toFixed(1), flips: M.flips });
// ảnh nhìn từ trên: cọc (nâu), đường nhảy (xanh), chỗ lấn (đỏ)
const W = 900, H = 640, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
x.fillStyle = '#f4efe4'; x.fillRect(0, 0, W, H);
const all = [...paths, ...pathsB].flat(); let x0 = B.C0.x - 4.5, x1 = B.C0.x + 4.5, z0 = B.C0.z - 3.2, z1 = B.C0.z + 3.2;
const sx = W / (x1 - x0), sz = H / (z1 - z0), s = Math.min(sx, sz), P = (px, pz) => [(px - x0) * s, (pz - z0) * s];
// lớp va chạm thật (xám) trong khung
const colHit = B.colHit, cowY = B.cowY; x.fillStyle = '#c9c1b2';
for (let px = x0; px < x1; px += 0.0625) for (let pz = z0; pz < z1; pz += 0.0625) { const gy = cowY(px, pz); if (colHit(7, px, pz, gy + 0.12, gy + 0.5)) { const [u, v] = P(px, pz); x.fillRect(u, v, 0.0625 * s + 0.5, 0.0625 * s + 0.5); } }
const drawPaths = (ps, col) => { for (const path of ps) { x.strokeStyle = col; x.lineWidth = 1.2; x.beginPath(); path.forEach(([px, pz], i) => { const [u, v] = P(px, pz); i ? x.lineTo(u, v) : x.moveTo(u, v); }); x.stroke();
  x.fillStyle = '#d0312d'; for (const [px, pz, hit] of path) if (hit) { const [u, v] = P(px, pz); x.beginPath(); x.arc(u, v, 3, 0, 7); x.fill(); } } };
drawPaths(paths, 'rgba(40,110,200,0.55)'); drawPaths(pathsB, 'rgba(30,150,80,0.55)');
x.fillStyle = '#5a3a1e'; for (const p of B.posts) { const [u, v] = P(p.x, p.z); x.fillRect(u - 3, v - 3, 6, 6); }
x.fillStyle = '#222'; x.font = '15px sans-serif'; x.fillText(TAG + ' — xanh dương: nhảy thẳng vào 23 cọc · xanh lá: lang thang 8 × 90 s · chấm đỏ: thân thỏ lấn vào vật · xám: khối đặc lớp va chạm', 10, 20);
return { tag: TAG, A: sum(A), B: sum(Bm), shots: [[window.__SHOT || ('bun-' + TAG + '.png'), cv.toDataURL('image/png')]] };
