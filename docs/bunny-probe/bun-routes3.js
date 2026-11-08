// ĐƯỜNG XA (bậc đất, rào, ống, chuồng gà): về hang 19:00 và trú mưa — mỗi loại 14 chỗ xuất phát cách 6–26 m, tối đa 120 s; tới · giây · van an toàn · đứng im lâu nhất · lấn (lớp chung / lớp 4)
const B = window.__B, b = B.b, E = B.E, dt = 1 / 60, cowY = B.cowY, colHit = B.colHit;
E('bunnyLife = __orig.bunnyLife; bunnyRain = __orig.bunnyRain; bunnyBed = __orig.bunnyBed; bunnyHome = __orig.bunnyHome;');
const LW = E('liveWeather'), bunOK = E('bunOK'); let seed = 31337; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const DESC = {}; const set = (k, v) => { if (!(k in DESC)) DESC[k] = Object.getOwnPropertyDescriptor(LW, k); Object.defineProperty(LW, k, { value: v, configurable: true, writable: true }); };
const unset = k => { if (DESC[k]) Object.defineProperty(LW, k, DESC[k]); else delete LW[k]; delete DESC[k]; };
function freeSpot(cx, cz, r0, r1) { for (let n = 0; n < 600; n++) { const a = rnd() * 6.283, r = r0 + rnd() * (r1 - r0), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (!bunOK(x, z)) continue; let ok = true; const g = cowY(x, z);
  for (let dx = -0.35; dx <= 0.35 && ok; dx += 0.0625) for (let dz = -0.35; dz <= 0.35 && ok; dz += 0.0625) if (colHit(23, x + dx, z + dz, g + 0.04, g + 0.5) || Math.abs(cowY(x + dx, z + dz) - g) > 0.1) ok = false; if (ok) return [x, z]; } return null; }
function reset(x, z, ang) { b.x = x; b.z = z; b.ang = ang; b.hop = 0; b.state = 'hop'; b.tmr = 1; b.digTmr = 1e9; b.life = null; b.home = null; b.shelter = null; b.bed = null; b.bedHold = 0; b.col.ghost = 0; b.col.stuck = 0; b.col.gext = 0; b.g.visible = true; b.want = ang; b.hp = null; b.fall = null; b.yawV = ang; b.carrot.visible = false; b.sy = undefined; }
function run(maxS, done) { let t = E('clock.elapsedTime') + 6000 + rnd() * 100; const M = { ok: 0, sec: maxS, ghost: 0, p7: 0, p4: 0, chk: 0, maxStill: 0 }; let still = 0, lx = b.x, lz = b.z;
  for (let i = 0; i < maxS / dt; i++) { t += dt; B.colTick(dt); B.bunnyTick(b, dt, t); if (b.col.ghost > 0) M.ghost += dt;
    if (Math.hypot(b.x - lx, b.z - lz) < 0.002) { still += dt; M.maxStill = Math.max(M.maxStill, still); } else still = 0; lx = b.x; lz = b.z;
    if (i % 6 === 0) { M.chk++; if (B.penVerts()) M.p7++; if (B.pen4()) M.p4++; } if (done()) { M.ok = 1; M.sec = +(i * dt).toFixed(1); break; } } return M; }
const res = {}, SH = E('bunnyShelter'), HB = E('bunnyBurrow');
set('localHour', 19); set('wildlifeAwake', false); res.home = [];
for (let k = 0; k < 14; k++) { const p = freeSpot(HB.door.x, HB.door.z, 6, 26); if (!p) continue; reset(p[0], p[1], rnd() * 6.283); const m = run(120, () => b.home && b.home !== 'go'); m.from = p.map(v => +v.toFixed(1)); m.left = +Math.hypot(HB.door.x - b.x, HB.door.z - b.z).toFixed(1); res.home.push(m); }
unset('localHour'); unset('wildlifeAwake'); b.home = null;
LW.state.raining = true; res.rain = [];
for (let k = 0; k < 14; k++) { const p = freeSpot(SH.x, SH.z, 6, 26); if (!p) continue; reset(p[0], p[1], rnd() * 6.283); const m = run(120, () => b.shelter === 'under'); m.from = p.map(v => +v.toFixed(1)); m.left = +Math.hypot(SH.x - b.x, SH.z - b.z).toFixed(1); res.rain.push(m); }
LW.state.raining = false; b.shelter = null;
for (const k in res) { const R = res[k], ok = R.filter(m => m.ok); res[k] = { n: R.length, arrived: ok.length, secAvg: +(ok.reduce((s, m) => s + m.sec, 0) / Math.max(1, ok.length)).toFixed(1), ghostSec: +R.reduce((s, m) => s + m.ghost, 0).toFixed(1), maxStill: +Math.max(...R.map(m => m.maxStill)).toFixed(1), pen7pct: +(100 * R.reduce((s, m) => s + m.p7, 0) / R.reduce((s, m) => s + m.chk, 0)).toFixed(1), pen4pct: +(100 * R.reduce((s, m) => s + m.p4, 0) / R.reduce((s, m) => s + m.chk, 0)).toFixed(1), fails: R.filter(m => !m.ok).map(m => `${m.from} còn ${m.left} m · van ${m.ghost.toFixed(1)} s`) }; }
E('bunnyLife = () => false; bunnyRain = () => false; bunnyBed = () => false; bunnyHome = () => false;');
return res;
