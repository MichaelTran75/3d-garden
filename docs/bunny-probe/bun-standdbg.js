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

const H = 0.2, m = new THREE.Mesh(new THREE.BoxGeometry(0.7, H, 0.7), new THREE.MeshLambertMaterial({ color: 0x8a6a4a })); m.position.set(cxp, g0 + H / 2, czp); m.rotation.y = -a; m.name = 'bục thử'; scene.add(m); m.updateMatrixWorld(true); rebuild();
const spans = (x, z) => { const r = []; for (let L = 0; L < 5; L++) { if (!E('colCell')(L, x, z)) continue; const T = E('_colT'), I = E('_colI'); for (let k = T.off[I]; k < T.off[I + 1]; k += 2) r.push([L, T.y[k], T.y[k + 1]]); } return r; };
out.g0 = +g0.toFixed(3); out.center = spans(cxp, czp); out.cw = [E('colWalkY')(cxp, czp, g0, 0.65, 21), E('colWalkY')(cxp, czp, g0, 0.65, 21, 0.15)];
b.sy = undefined; out.sup = E('bunSup')(b, cxp, czp, a, g0); out.lv = E('BHOP.lv');
out.spot = E('bunSpot')(b, cxp, czp, a, 23, g0);
out.nav = E('BUN_NAV') ? 'nav' : 'none';
scene.remove(m); rebuild(); return out;
