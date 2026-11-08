// CHẠY TRỐN: 32 lượt (mối đe doạ giả cách 3 m sau lưng) — lượt hỏng: đích nấp là gì, đứng được không, thỏ dừng đâu, các tia về đích
const B = window.__B, b = B.b, E = B.E, dt = 1 / 60, cowY = B.cowY, colHit = B.colHit, THREE = __dbg.THREE;
E('bunnyLife = __orig.bunnyLife;');
const NEW = E('typeof bunRay === "function"'), bunOK = E('bunOK'), bunSpot = NEW ? E('bunSpot') : null, bunRay = NEW ? E('bunRay') : null, refEsc = E('bunEscape'), SH = E('bunnyShelter');
let seed = 4242; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function freeSpot(cx, cz, r0, r1) { for (let n = 0; n < 400; n++) { const a = rnd() * 6.283, r = r0 + rnd() * (r1 - r0), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (!bunOK(x, z)) continue; let ok = true; const g = cowY(x, z); for (let dx = -0.35; dx <= 0.35 && ok; dx += 0.0625) for (let dz = -0.35; dz <= 0.35 && ok; dz += 0.0625) if (colHit(7, x + dx, z + dz, g + 0.04, g + 0.5)) ok = false; if (ok) return [x, z]; } return null; }
const out = [], TT = [], PEN = [0, 0]; let ok = 0;
for (let k = 0; k < 32; k++) {
  const p = freeSpot(SH.x, SH.z, 3, 14); if (!p) continue; const a = rnd() * 6.283;
  b.x = p[0]; b.z = p[1]; b.ang = a; b.hop = 0; b.state = 'hop'; b.tmr = 1; b.digTmr = 1e9; b.home = null; b.shelter = null; b.bed = null; b.col.ghost = 0; b.want = a; b.hp = null; b.fall = null; b.yawV = a; b.sy = undefined;
  const src = new THREE.Vector3(p[0] - Math.cos(a) * 3, 0, p[1] - Math.sin(a) * 3), to = refEsc(b, src);
  b.life = { st: 'flee', k: 0, d: 12, vt: 99, zz: 0, from: src.clone(), to, cd: 4, hab: 0, rT: 1e12, ref: null, dRef: 5 };
  let t = E('clock.elapsedTime') + 5000, done = false, minD = 99, i0 = 0, pen = 0, chk = 0;
  for (let i = 0; i < 14 / dt && !done; i++) { t += dt; B.colTick(dt); B.bunnyTick(b, dt, t); if (to) minD = Math.min(minD, Math.hypot(to.x - b.x, to.z - b.z)); done = !b.life || b.life.st === 'hide'; if (i % 3 === 0) { chk++; if (B.penVerts()) pen++; } i0 = i; }
  TT.push(+(i0 * dt).toFixed(1)); PEN[0] += pen; PEN[1] += chk;
  if (done) { ok++; continue; }
  const mk = b.col.mask(), dT = to ? Math.hypot(to.x - b.x, to.z - b.z) : -1, aT = to ? Math.atan2(to.z - b.z, to.x - b.x) : 0;
  out.push({ to: to && [+to.x.toFixed(2), +to.z.toFixed(2)], kind: to ? (Math.hypot(to.x - SH.x, to.z - SH.z) < 0.01 ? 'hiên xe' : 'gốc cây / khác') : 'không', toStandable: to && NEW ? [0, 1.57, 3.14, 4.71].map(an => bunSpot(b, to.x, to.z, an, mk, cowY(to.x, to.z))) : null, at: [+b.x.toFixed(2), +b.z.toFixed(2)], dT: +dT.toFixed(2), minD: +minD.toFixed(2), rayToTarget: NEW ? +bunRay(b, aT, dT, mk, 1).toFixed(2) : null, st: b.life && b.life.st, stuck: b.hp ? +(b.hp.stuck || 0).toFixed(2) : null });
}
E('bunnyLife = () => false;');
return { ok, n: TT.length, secAvgAll: +(TT.reduce((a, c) => a + c, 0) / TT.length).toFixed(1), pen1pct: +(100 * PEN[0] / PEN[1]).toFixed(1), fails: out };
