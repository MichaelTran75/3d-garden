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
// ── bổ sung (fix 2): đo lấn theo Ô CON 3,1 cm (mặt nạ khoảng đặc) thay vì cả cột 12,5 cm · lớp 4 riêng thỏ · khoảng hở gần nhất tới cọc rào · số lần phải cuộn người
const C = E('COL.C'), colSub = E('colSub');
function subHit(mask, x, z, y) { const m = colSub(mask, x, z, y - 0.01, y + 0.01); if (!m) return false; const xi = Math.floor(x / C), zi = Math.floor(z / C), u = Math.min(3, (x / C - xi) * 4 | 0), v = Math.min(3, (z / C - zi) * 4 | 0); return (m >> (u + 4 * v) & 1) === 1; }
function penSub(mask) {   // số đỉnh thân (cao hơn mặt đứng + 4 cm) nằm trong ô con đặc của các lớp trong mask
  b.g.updateMatrixWorld(true); let n = 0; const sy = typeof b.sy === 'number' ? b.sy : -1e9;
  for (const [o, i] of VS) { if (!visibleChain(o)) continue; V.fromBufferAttribute(o.geometry.attributes.position, i).applyMatrix4(o.matrixWorld);
    if (V.y > Math.max(cowY(V.x, V.z), sy) + 0.04 && subHit(mask, V.x, V.z, V.y)) n++; }
  return n;
}
function postGap() {   // khoảng hở ngang nhỏ nhất (m) từ lưới thân tới mặt cọc rào gần nhất (cọc 4 cm), chỉ đỉnh trong dải 4–60 cm
  b.g.updateMatrixWorld(true); let d = 9;
  for (const [o, i] of VS) { if (!visibleChain(o)) continue; V.fromBufferAttribute(o.geometry.attributes.position, i).applyMatrix4(o.matrixWorld); const h = V.y - cowY(V.x, V.z); if (h < 0.04 || h > 0.6) continue;
    for (const p of posts) d = Math.min(d, Math.hypot(V.x - p.x, V.z - p.z) - 0.02); }
  return d;
}
const inv = new THREE.Matrix4().copy(g.matrixWorld).invert();
function inFence(x, z) { V.set(x, cowY(x, z), z).applyMatrix4(inv); return Math.abs(V.x) < 2.85 && Math.abs(V.z) < 1.5; }
window.__CURL = { plans: 0, curl: 0, pivot: 0, none: 0 };
if (E('typeof bunPlan === "function" && bunPlan.length === 5 && typeof bunTurn === "function"')) {   // bản mới: đếm lượt lập kế hoạch phải xuống lượt cuộn người (kk < 1)
  E(`window.__bp = window.__bp || bunPlan; window.__br = window.__br || bunRay;
     bunRay = function (b, a, cap, mk, pv, kk) { if (kk < 1) window.__CURL.k = 1; return window.__br(b, a, cap, mk, pv, kk); };
     bunPlan = function (...A) { window.__CURL.k = 0; const r = window.__bp(...A); window.__CURL.plans++; if (!r) window.__CURL.none++; else if (window.__CURL.k) window.__CURL.curl++; else if (r[2]) window.__CURL.pivot++; return r; };`);
}
Object.assign(window.__B, { penCell: penVerts, penVerts: () => penSub(7), pen4: () => penSub(16), postGap, inFence });
out.subcell = true;
return out;
