// ĐƯỜNG CÓ ĐÍCH với tập tính thật (không cô lập): trú mưa → hiên xe · về hang 19:00 · ra luống cà rốt · chạy trốn về chỗ nấp — mỗi loại 6 chỗ xuất phát
const B = window.__B, b = B.b, E = B.E, dt = 1 / 60, cowY = B.cowY, colHit = B.colHit, TAG = window.__TAG || 'x';
E('bunnyLife = __orig.bunnyLife; bunnyRain = __orig.bunnyRain; bunnyBed = __orig.bunnyBed; bunnyHome = __orig.bunnyHome;');
const LW = E('liveWeather'), bunOK = E('bunOK'), proto = Object.getPrototypeOf(LW);
let seed = 777; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const DESC = {}; const set = (k, v) => { if (!(k in DESC)) DESC[k] = Object.getOwnPropertyDescriptor(LW, k); Object.defineProperty(LW, k, { value: v, configurable: true, writable: true }); };
const unset = k => { if (DESC[k]) Object.defineProperty(LW, k, DESC[k]); else delete LW[k]; delete DESC[k]; };
function freeSpot(cx, cz, r0, r1) {   // chỗ trống (cột 0,12–0,5 m quanh 0,35 m không vướng) cách (cx, cz) r0–r1
  for (let n = 0; n < 400; n++) { const a = rnd() * 6.283, r = r0 + rnd() * (r1 - r0), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (!bunOK(x, z)) continue; let ok = true; const g = cowY(x, z);
    for (let dx = -0.35; dx <= 0.35 && ok; dx += 0.0625) for (let dz = -0.35; dz <= 0.35 && ok; dz += 0.0625) if (colHit(7, x + dx, z + dz, g + 0.04, g + 0.5)) ok = false; if (ok) return [x, z]; }
  return null;
}
function reset(x, z, ang) { b.x = x; b.z = z; b.ang = ang; b.hop = 0; b.state = 'hop'; b.tmr = 1; b.digTmr = 1e9; b.life = null; b.home = null; b.shelter = null; b.bed = null; b.bedHold = 0; b.col.ghost = 0; b.col.stuck = 0; b.col.gext = 0; b.g.visible = true; b.want = ang; b.hp = null; b.sy = undefined; b.fall = null; b.yawV = ang; b.carrot.visible = false; }
function run(kind, maxS, done) {
  let t = E('clock.elapsedTime') + 3000 + rnd() * 100, pa = b.ang; const M = { ok: false, sec: maxS, ghost: 0, pen1: 0, chk: 0, flips: 0, maxStill: 0 }; let still = 0, lx = b.x, lz = b.z;
  for (let i = 0; i < maxS / dt; i++) {
    t += dt; B.colTick(dt); B.bunnyTick(b, dt, t);
    if (b.col.ghost > 0) M.ghost += dt;
    const da = Math.abs(Math.atan2(Math.sin(b.ang - pa), Math.cos(b.ang - pa))); if (da > 1) M.flips++; pa = b.ang;
    if (Math.hypot(b.x - lx, b.z - lz) < 0.002) { still += dt; M.maxStill = Math.max(M.maxStill, still); } else still = 0; lx = b.x; lz = b.z;
    if (i % 3 === 0) { M.chk++; if (B.penVerts() >= 1) M.pen1++; }
    if (CUR && i % 6 === 0) CUR.push([b.x, b.z, i % 3 === 0 && M.pen1 && B.penVerts() ? 1 : 0]); if (done()) { M.ok = true; M.sec = +(i * dt).toFixed(1); break; }
  }
  return M;
}
const res = {}, PATHS = { rain: [], home: [], bed: [], flee: [] }; let CUR = null;
// 1) trú mưa
const SH = E('bunnyShelter'); LW.state.raining = true; res.rain = [];
for (let k = 0; k < 6; k++) { const p = freeSpot(SH.x, SH.z, 4, 12); if (!p) continue; reset(p[0], p[1], rnd() * 6.283); CUR = []; PATHS.rain.push(CUR); const m = run('rain', 60, () => b.shelter === 'under'); m.from = [+p[0].toFixed(1), +p[1].toFixed(1)]; m.left = +Math.hypot(SH.x - b.x, SH.z - b.z).toFixed(2); res.rain.push(m); }
LW.state.raining = false; b.shelter = null;
// 2) về hang lúc 19:00
const HB = E('bunnyBurrow'); set('localHour', 19); set('wildlifeAwake', false); res.home = [];
for (let k = 0; k < 6; k++) { const p = freeSpot(HB.door.x, HB.door.z, 4, 12); if (!p) continue; reset(p[0], p[1], rnd() * 6.283); CUR = []; PATHS.home.push(CUR); const m = run('home', 90, () => b.home && b.home !== 'go'); m.from = [+p[0].toFixed(1), +p[1].toFixed(1)]; m.left = +Math.hypot(HB.door.x - b.x, HB.door.z - b.z).toFixed(2); res.home.push(m); }
unset('localHour'); unset('wildlifeAwake'); b.home = null;
// 3) ra luống cà rốt (ban ngày, có khóm chín)
const CB = E("worldSee('carrotBed')"), BB = E('BUN_BED'); res.bed = [];
if (CB && CB.ripe().length) for (let k = 0; k < 6; k++) { const p = freeSpot(CB.pos.x, CB.pos.z, 4, 12); if (!p) continue; reset(p[0], p[1], rnd() * 6.283); BB.eatAt = -1e9; BB.who = null;
  CUR = []; PATHS.bed.push(CUR); const m = run('bed', 90, () => b.bed && b.bed.st !== 'go'); m.from = [+p[0].toFixed(1), +p[1].toFixed(1)]; m.st = b.bed ? b.bed.st : 'none'; if (b.bed) { CB.release(b.bed.sl); b.bed = null; BB.who = null; } res.bed.push(m); }
// 4) chạy trốn về chỗ nấp: mối đe doạ giả cách 3 m phía sau
res.flee = []; const THREE = __dbg.THREE, refEsc = E('bunEscape');
for (let k = 0; k < 6; k++) { const p = freeSpot(SH.x, SH.z, 3, 14); if (!p) continue; const a = rnd() * 6.283; reset(p[0], p[1], a); const src = new THREE.Vector3(p[0] - Math.cos(a) * 3, 0, p[1] - Math.sin(a) * 3);
  const to = refEsc(b, src); b.life = { st: 'flee', k: 0, d: 12, vt: 99, zz: 0, from: src.clone(), to, cd: 4, hab: 0, rT: 1e12, ref: null, dRef: 5 };
  CUR = []; PATHS.flee.push(CUR); const m = run('flee', 14, () => !b.life || b.life.st === 'hide'); m.from = [+p[0].toFixed(1), +p[1].toFixed(1)]; m.to = to ? [+to.x.toFixed(1), +to.z.toFixed(1)] : null; m.left = to ? +Math.hypot(to.x - b.x, to.z - b.z).toFixed(2) : null; m.end = b.life ? b.life.st : '-'; res.flee.push(m); }
for (const k in res) { const R = res[k]; res[k] = { n: R.length, arrived: R.filter(m => m.ok).length, secAvg: +(R.filter(m => m.ok).reduce((s, m) => s + m.sec, 0) / Math.max(1, R.filter(m => m.ok).length)).toFixed(1), ghostSec: +R.reduce((s, m) => s + m.ghost, 0).toFixed(1), pen1pct: +(100 * R.reduce((s, m) => s + m.pen1, 0) / Math.max(1, R.reduce((s, m) => s + m.chk, 0))).toFixed(1), flips: R.reduce((s, m) => s + m.flips, 0), maxStill: +Math.max(0, ...R.map(m => m.maxStill)).toFixed(1), runs: R.map(m => [m.ok ? 1 : 0, m.sec, m.left ?? m.st ?? '', +m.ghost.toFixed(1), +m.maxStill.toFixed(1), m.end || ''].join(' ')) }; }
E('bunnyLife = () => false; bunnyRain = () => false; bunnyBed = () => false; bunnyHome = () => false;');
const all = Object.values(PATHS).flat(2); let x0 = Math.min(...all.map(p => p[0])) - 1, x1 = Math.max(...all.map(p => p[0])) + 1, z0 = Math.min(...all.map(p => p[1])) - 1, z1 = Math.max(...all.map(p => p[1])) + 1;
const W = 1100, S = Math.min(W / (x1 - x0), 1400 / (z1 - z0)), Hh = Math.ceil((z1 - z0) * S) + 30, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; const x = cv.getContext('2d'); x.fillStyle = '#f4efe4'; x.fillRect(0, 0, W, Hh);
const P = (px, pz) => [(px - x0) * S, 30 + (pz - z0) * S], st = 0.125, cs = st * S + 0.6;
for (let px = x0; px < x1; px += st) for (let pz = z0; pz < z1; pz += st) { const g = cowY(px, pz), [u, v] = P(px, pz); if (!bunOK(px, pz)) { x.fillStyle = '#a9cbe0'; x.fillRect(u, v, cs, cs); } else if (colHit(7, px, pz, g + 0.12, g + 0.5)) { x.fillStyle = '#b9b0a0'; x.fillRect(u, v, cs, cs); } else if (Math.max(Math.abs(cowY(px + st, pz) - g), Math.abs(cowY(px, pz + st) - g)) > 0.1) { x.fillStyle = '#7a5a3a'; x.fillRect(u, v, cs, cs); } }
const COLS = { rain: '#2a7ab8', home: '#7a3ab8', bed: '#e08a1e', flee: '#2e9e4f' };
for (const k in PATHS) for (const pa of PATHS[k]) { if (!pa.length) continue; x.strokeStyle = COLS[k]; x.lineWidth = 1.8; x.beginPath(); pa.forEach(([px, pz], i) => { const [u, v] = P(px, pz); i ? x.lineTo(u, v) : x.moveTo(u, v); }); x.stroke();
  const [u0, v0] = P(pa[0][0], pa[0][1]); x.fillStyle = COLS[k]; x.fillRect(u0 - 3, v0 - 3, 6, 6); const [u1, v1] = P(pa[pa.length - 1][0], pa[pa.length - 1][1]); x.beginPath(); x.arc(u1, v1, 5, 0, 7); x.fill();
  x.fillStyle = '#d0312d'; for (const [px, pz, h] of pa) if (h) { const [u, v] = P(px, pz); x.beginPath(); x.arc(u, v, 2.5, 0, 7); x.fill(); } }
x.fillStyle = '#222'; x.font = '15px sans-serif'; x.fillText(TAG + ' — xanh dương: trú mưa · tím: về hang · cam: ra luống · xanh lá: chạy trốn · vuông = xuất phát · tròn = dừng · đỏ = lấn vật · nâu = mép bậc đất · xám = vật cản', 8, 20);
return { tag: TAG, ...res, shots: [[window.__SHOT2 || '/tmp/r.png', cv.toDataURL('image/png')]] };
