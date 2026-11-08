// ĐỨNG TRÊN VẬT: đặt bục 0,7 × 0,7 m cao 0,2 / 0,45 / 0,8 m giữa bãi phẳng, thỏ nhảy thẳng qua (10 s) — lên được không, đứng trên bao lâu, xuống được không, lấn
const B = window.__B, b = B.b, E = B.E, THREE = __dbg.THREE, dt = 1 / 60, cowY = B.cowY, scene = E('scene');
let start = null;
for (let r = 6; r < 30 && !start; r += 0.5) for (let k = 0; k < 24 && !start; k++) {
  const a = k * Math.PI / 12, x = B.C0.x + Math.cos(a) * r, z = B.C0.z + Math.sin(a) * r; let ok = E('bunOK')(x, z);
  for (let s = 0; s <= 7 && ok; s += 0.1) for (const w of [-0.6, 0, 0.6]) { const px = x + Math.cos(a) * s - Math.sin(a) * w, pz = z + Math.sin(a) * s + Math.cos(a) * w, g = cowY(px, pz); if (!E('bunOK')(px, pz) || B.colHit(23, px, pz, g + 0.03, g + 1) || Math.abs(g - cowY(x, z)) > 0.01) ok = false; }
  if (ok) start = [x, z, a];
}
if (!start) return { err: 'no ground' };
const rebuild = () => { const hid = []; scene.traverse(o => { const q = o.geometry && o.geometry.attributes && o.geometry.attributes.position; if ((o.isMesh || o.isLineSegments) && q && !q.array && o.visible) { o.visible = false; hid.push(o); } }); E('COL.L.forEach(m => m.clear()); COL.ready = false; COL.queue = null; COL.tris = 0; COL.cells = 0; if (typeof BUN_NAV !== "undefined") BUN_NAV = null;'); let n = 0; while (!E('COL.ready') && n++ < 50000) E('colBuildTick(200)'); hid.forEach(o => o.visible = true); };
const out = { start: start.map(v => +v.toFixed(2)) };
const [x0, z0, a] = start, ca = Math.cos(a), sa = Math.sin(a), cxp = x0 + ca * 2.5, czp = z0 + sa * 2.5, g0 = cowY(cxp, czp);
for (const H of [0.2, 0.45, 0.8]) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, H, 0.7), new THREE.MeshLambertMaterial({ color: 0x8a6a4a })); m.position.set(cxp, g0 + H / 2, czp); m.rotation.y = -a; m.name = 'bục thử'; scene.add(m); m.updateMatrixWorld(true); rebuild();
  const R = { onTopSec: 0, maxLiftCm: 0, passed: false, chk: 0, p7: 0, ghost: 0, endOnTop: false };
  for (const run of [0, 1]) {
    b.x = x0 + (run ? -sa * 0.15 : 0); b.z = z0 + (run ? ca * 0.15 : 0); b.ang = a; b.hop = 0; b.state = 'hop'; b.tmr = 1e9; b.digTmr = 1e9; b.life = null; b.home = null; b.shelter = null; b.bed = null; b.col.ghost = 0; b.col.stuck = 0; b.want = a; b.hp = null; b.fall = null; b.yawV = a; b.sy = undefined;
    let t = E('clock.elapsedTime') + 4000 + run * 30;
    for (let i = 0; i < 10 / dt; i++) { t += dt; B.colTick(dt); b.want = a; B.bunnyTick(b, dt, t); if (b.col.ghost > 0) R.ghost += dt;
      const u = (b.x - cxp) * ca + (b.z - czp) * sa, w = -(b.x - cxp) * sa + (b.z - czp) * ca, inside = Math.abs(u) < 0.35 && Math.abs(w) < 0.35, lift = b.g.position.y - cowY(b.x, b.z);
      if (inside) { R.maxLiftCm = Math.max(R.maxLiftCm, Math.round(lift * 100)); if (lift > H - 0.06) R.onTopSec += dt; }
      if (i % 3 === 0) { R.chk++; if (B.penVerts()) R.p7++; } }
    if ((b.x - x0) * ca + (b.z - z0) * sa > 2.5 + 0.55) R.passed = true;
  }
  out['H' + H] = { onTopSec: +R.onTopSec.toFixed(1), maxLiftCm: R.maxLiftCm, passedOver: R.passed, pen7pct: +(100 * R.p7 / R.chk).toFixed(1), ghostSec: +R.ghost.toFixed(1) };
  scene.remove(m);
}
rebuild(); return out;
