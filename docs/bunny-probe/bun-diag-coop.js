// chuồng gà: lấn lớp 4 ở độ cao nào, khoảng đặc lớp 4 ở cột đó cao bao nhiêu
const B = window.__B, b = B.b, E = B.E, THREE = __dbg.THREE, dt = 1 / 60, cowY = B.cowY, colHit = B.colHit, bunOK = E('bunOK'), scene = E('scene'), C = E('COL.C'), colSub = E('colSub');
let seed = 991; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const V = new THREE.Vector3();
const tr = o => { const m = Array.isArray(o.material) ? o.material[0] : o.material; return o.isLineSegments || (m && m.transparent && m.opacity < 0.6) || o.userData.noCollide; };
const P = []; const coop = scene.getObjectByName('Chuồng gà (Chicken coop)'); coop.updateMatrixWorld(true);
coop.traverse(o => { if (!(o.isMesh || o.isLineSegments) || !tr(o)) return; for (let p = o; p; p = p.parent) if (!p.visible) return; const a = o.geometry.attributes.position; if (!a || !a.array) return; for (let i = 0; i < a.count; i += Math.max(1, a.count / 60 | 0)) { V.fromBufferAttribute(a, i).applyMatrix4(o.matrixWorld); const h = V.y - cowY(V.x, V.z); if (h > 0.15 && h < 0.45) P.push([V.x, V.z]); } });
function freeAt(x, z) { if (!bunOK(x, z)) return false; const g = cowY(x, z); for (let dx = -0.35; dx <= 0.35; dx += 0.0625) for (let dz = -0.35; dz <= 0.35; dz += 0.0625) { if (colHit(23, x + dx, z + dz, g + 0.04, g + 0.5) || Math.abs(cowY(x + dx, z + dz) - g) > 0.1) return false; } return true; }
const VS = []; b.g.traverse(o => { if (o.isMesh && o.geometry.attributes.position && o.visible !== false) { const a = o.geometry.attributes.position; for (let i = 0; i < a.count; i += 2) VS.push([o, i]); } });
const H = {}, PARTS = {}, SPANS = []; let L4 = E('COL.L[4]');
for (let run = 0; run < 8; run++) {
  let S = null, Q = null; for (let tries = 0; tries < 300 && !S; tries++) { Q = P[rnd() * P.length | 0]; const a = rnd() * 6.283, r = 1 + rnd() * 0.6, x = Q[0] + Math.cos(a) * r, z = Q[1] + Math.sin(a) * r; if (freeAt(x, z)) S = [x, z]; }
  if (!S) continue; const ang = Math.atan2(Q[1] - S[1], Q[0] - S[0]);
  b.x = S[0]; b.z = S[1]; b.ang = ang; b.hop = 0; b.state = 'hop'; b.tmr = 1e9; b.digTmr = 1e9; b.life = null; b.home = null; b.shelter = null; b.bed = null; b.col.ghost = 0; b.col.stuck = 0; b.want = ang; b.hp = null; b.fall = null; b.yawV = ang; b.sy = undefined;
  let t = E('clock.elapsedTime') + 2000 + rnd() * 50;
  for (let i = 0; i < 12 / dt; i++) { t += dt; B.colTick(dt); b.want = ang; B.bunnyTick(b, dt, t);
    if (i % 3 === 0 && B.pen4()) { b.g.updateMatrixWorld(true); const sy = typeof b.sy === 'number' ? b.sy : -1e9;
      for (const [o, k] of VS) { let vis = true; for (let p = o; p; p = p.parent) if (!p.visible) { vis = false; break; } if (!vis) continue; V.fromBufferAttribute(o.geometry.attributes.position, k).applyMatrix4(o.matrixWorld); const g = cowY(V.x, V.z); if (V.y <= Math.max(g, sy) + 0.04) continue;
        const m = colSub(16, V.x, V.z, V.y - 0.01, V.y + 0.01); if (!m) continue; const xi = Math.floor(V.x / C), zi = Math.floor(V.z / C), u = Math.min(3, (V.x / C - xi) * 4 | 0), v = Math.min(3, (V.z / C - zi) * 4 | 0); if (!(m >> (u + 4 * v) & 1)) continue;
        const hb = Math.round((V.y - g) * 100 / 5) * 5; H[hb] = (H[hb] || 0) + 1; const nm = o.name || (o.parent && o.parent.name) || '?'; PARTS[nm] = (PARTS[nm] || 0) + 1;
        if (SPANS.length < 6) { E('colCell(4,' + V.x + ',' + V.z + ')'); const T = E('_colT'), I = E('_colI'), sp = []; for (let q = T.off[I]; q < T.off[I + 1]; q += 2) sp.push([T.y[q] - Math.round(g * 100), T.y[q + 1] - Math.round(g * 100), T.m[q >> 1].toString(2)]); SPANS.push({ h: +(V.y - g).toFixed(2), part: nm, ph: b.hp.ph, sy: +(sy - g).toFixed(2), spans: sp }); } } } }
}
return { hgt: H, parts: PARTS, spans: SPANS };
