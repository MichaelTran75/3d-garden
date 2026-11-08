// ĐO THỎ VA CHẠM — dựng xong lớp va chạm, cô lập dáng nhảy lang thang (tắt tập tính / trú mưa / luống / về hang), cài hàm đo vào window.__B
const E = __ev, THREE = __dbg.THREE, out = {};
let guard = 0; while (!E('COL.ready') && guard++ < 20000) E('colBuildTick(60)');
out.col = { ready: E('COL.ready'), tris: E('COL.tris'), cells: E('COL.cells') };
E('window.__orig = window.__orig || { bunnyLife, bunnyRain, bunnyBed, bunnyHome }; bunnyLife = () => false; bunnyRain = () => false; bunnyBed = () => false; bunnyHome = () => false;');
const g = E("scene.getObjectByName('Hệ biogas ống mềm')"); g.updateMatrixWorld(true);
const FX = 2.85, FZ = 1.5, P = [];
for (let i = 0; i <= 6; i++) P.push([FX - i * FX / 3, -FZ]);
for (const x of [FX, 1.9, 0.95, 0, -0.8, -1.55, -2.45, -FX]) P.push([x, FZ]);
for (const sx of [-1, 1]) for (const z of [-0.75, 0, 0.75]) P.push([sx * FX, z]);
const V = new THREE.Vector3(), cowY = E('cowY'), colHit = E('colHit');
const C0 = g.localToWorld(new THREE.Vector3(0, 0, 0)).clone();
const posts = P.map(([x, z]) => { g.localToWorld(V.set(x, 0.5, z)); return { x: V.x, z: V.z, lx: x, lz: z }; });
out.postsInCol = posts.filter(p => colHit(7, p.x, p.z, cowY(p.x, p.z) + 0.15, cowY(p.x, p.z) + 0.4)).length + '/' + posts.length;
out.center = [+C0.x.toFixed(2), +C0.z.toFixed(2)];
const b = E('bunnies[0]'), bunnyTick = E('bunnyTick'), colTick = E('colTick');
out.bunny = { a: +b.col.a.toFixed(3), b: +b.col.b.toFixed(3), lo: b.col.lo, hi: +b.col.hi.toFixed(3), scale: +b.g.scale.x.toFixed(4) };
// đỉnh lưới thân thỏ (cách 1 lấy 1) để đo lấn vào khối đặc thật
const VS = []; b.g.traverse(o => { if (o.isMesh && o.geometry.attributes.position && o.visible !== false) { const a = o.geometry.attributes.position; for (let i = 0; i < a.count; i += 2) VS.push([o, i]); } });
out.verts = VS.length;
function visibleChain(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }
function penVerts() {   // số đỉnh thân thỏ (cao > đất + 4 cm) nằm trong khối đặc lớp 0–2
  b.g.updateMatrixWorld(true); let n = 0;
  for (const [o, i] of VS) { if (!visibleChain(o)) continue; V.fromBufferAttribute(o.geometry.attributes.position, i).applyMatrix4(o.matrixWorld);
    if (V.y > cowY(V.x, V.z) + 0.04 && colHit(7, V.x, V.z, V.y - 0.01, V.y + 0.01)) n++; }
  return n;
}
function postOverlap() {   // lấn sâu nhất (m) vào cọc rào biogas: thân thỏ ≈ đoạn mông→đầu bán kính 0,12 m · cọc 4 cm
  const ca = Math.cos(b.ang), sa = Math.sin(b.ang), r = 0.12, pr = 0.02, ax = b.x - ca * 0.12, az = b.z - sa * 0.12, bx = b.x + ca * 0.15, bz = b.z + sa * 0.15;
  let worst = 0;
  for (const p of posts) { const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz, u = Math.max(0, Math.min(1, ((p.x - ax) * dx + (p.z - az) * dz) / L2)), d = Math.hypot(p.x - (ax + dx * u), p.z - (az + dz * u)); worst = Math.max(worst, r + pr - d); }
  return worst;
}
window.__B = { E, b, posts, C0, bunnyTick, colTick, penVerts, postOverlap, cowY, colHit };
return out;
