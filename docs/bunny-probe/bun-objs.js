// VẬT LỚP 4 (trước thỏ đi xuyên): chuồng gà trong suốt, rào trạm biến áp, dây néo cột khí tượng, ống biogas về xe — mỗi vật 8 lượt: xuất phát thoáng cách 1–1,6 m, nhảy thẳng vào 1 điểm của vật 12 s
const B = window.__B, b = B.b, E = B.E, THREE = __dbg.THREE, dt = 1 / 60, cowY = B.cowY, colHit = B.colHit, bunOK = E('bunOK'), scene = E('scene');
let seed = 991; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const V = new THREE.Vector3(), M4 = new THREE.Matrix4();
function pts(root, sel) { const P = []; root.updateMatrixWorld(true); root.traverse(o => { if (!(o.isMesh || o.isLineSegments) || !sel(o)) return; for (let p = o; p; p = p.parent) if (!p.visible) return; const a = o.geometry.attributes.position; if (!a || !a.array) return;
  for (let i = 0; i < a.count; i += Math.max(1, a.count / 60 | 0)) { V.fromBufferAttribute(a, i).applyMatrix4(o.matrixWorld); const h = V.y - cowY(V.x, V.z); if (h > 0.15 && h < 0.45) P.push([V.x, V.z]); } }); return P; }
const tr = o => { const m = Array.isArray(o.material) ? o.material[0] : o.material; return o.isLineSegments || (m && m.transparent && m.opacity < 0.6) || o.userData.noCollide; };
const T = { coop: pts(scene.getObjectByName('Chuồng gà (Chicken coop)'), tr), substation: pts(scene.getObjectByName('Trạm biến áp (Substation)'), tr), mast: pts(scene.getObjectByName('Cột khí tượng (Weather Mast)'), o => o.isLineSegments), pipe: pts(scene.getObjectByName('Biogas: ống về xe'), tr) };
function freeAt(x, z) { if (!bunOK(x, z)) return false; const g = cowY(x, z); for (let dx = -0.35; dx <= 0.35; dx += 0.0625) for (let dz = -0.35; dz <= 0.35; dz += 0.0625) { if (colHit(23, x + dx, z + dz, g + 0.04, g + 0.5) || Math.abs(cowY(x + dx, z + dz) - g) > 0.1) return false; } return true; }
const out = {};
for (const k in T) {
  const P = T[k], R = { n: 0, pts: P.length, chk: 0, p4: 0, p4max: 0, p7: 0, passed: 0, ghost: 0, still: 0 };
  for (let run = 0; run < 8 && P.length; run++) {
    let S = null, Q = null; for (let tries = 0; tries < 300 && !S; tries++) { Q = P[rnd() * P.length | 0]; const a = rnd() * 6.283, r = 1 + rnd() * 0.6, x = Q[0] + Math.cos(a) * r, z = Q[1] + Math.sin(a) * r; if (freeAt(x, z)) S = [x, z]; }
    if (!S) continue; R.n++;
    const ang = Math.atan2(Q[1] - S[1], Q[0] - S[0]), L = Math.hypot(Q[0] - S[0], Q[1] - S[1]);
    b.x = S[0]; b.z = S[1]; b.ang = ang; b.hop = 0; b.state = 'hop'; b.tmr = 1e9; b.digTmr = 1e9; b.life = null; b.home = null; b.shelter = null; b.bed = null; b.col.ghost = 0; b.col.stuck = 0; b.want = ang; b.hp = null; b.fall = null; b.yawV = ang; b.sy = undefined;
    let t = E('clock.elapsedTime') + 2000 + rnd() * 50;
    for (let i = 0; i < 12 / dt; i++) { t += dt; B.colTick(dt); b.want = ang; B.bunnyTick(b, dt, t); if (b.col.ghost > 0) R.ghost += dt;
      if (i % 3 === 0) { R.chk++; const n4 = B.pen4(), n7 = B.penVerts(); if (n4) R.p4++; if (n7) R.p7++; R.p4max = Math.max(R.p4max, n4); } }
    if ((b.x - S[0]) * Math.cos(ang) + (b.z - S[1]) * Math.sin(ang) > L + 0.3) R.passed++;
  }
  out[k] = { runs: R.n, targetPts: R.pts, pen4pct: +(100 * R.p4 / Math.max(1, R.chk)).toFixed(1), pen4max: R.p4max, pen7pct: +(100 * R.p7 / Math.max(1, R.chk)).toFixed(1), passedThrough: R.passed, ghostSec: +R.ghost.toFixed(1) };
}
return out;
