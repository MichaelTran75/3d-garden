// ẢNH TỪ TRÊN quanh hệ biogas: xám = khối đặc lớp 0–2 · xanh nhạt = lớp riêng thỏ (dây rào, ống, nhà kính) · nâu = cọc · xanh dương = nhảy thẳng vào cọc · xanh lá = lang thang · đỏ = thân lấn vật
const B = window.__B, b = B.b, E = B.E, dt = 1 / 60, cowY = B.cowY, colHit = B.colHit, TAG = window.__TAG || 'x', THREE = __dbg.THREE, V = new THREE.Vector3();
const g = E("scene.getObjectByName('Hệ biogas ống mềm')");
let seed = 12345; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function reset(x, z, ang, hop) { b.x = x; b.z = z; b.ang = ang; b.hop = 0; b.state = hop ? 'hop' : 'sniff'; b.tmr = hop ? 1e9 : 0.5; b.digTmr = 1e9; if (b.life) b.life.st = ''; b.col.ghost = 0; b.col.stuck = 0; b.g.visible = true; b.want = ang; b.hp = null; b.fall = null; b.yawV = ang; b.sy = undefined; }
const paths = [], pathsB = [];
function run(secs, path) { let t = E('clock.elapsedTime') + 1000 + rnd() * 100; for (let i = 0; i < secs / dt; i++) { t += dt; B.colTick(dt); B.bunnyTick(b, dt, t); if (i % 6 === 0) path.push([b.x, b.z, (B.penVerts() || B.pen4()) ? 1 : 0]); } }
for (const p of B.posts) { const o = Math.abs(Math.abs(p.lx) - 2.85) < 1e-3 ? [Math.sign(p.lx), 0] : [0, Math.sign(p.lz)]; g.localToWorld(V.set(p.lx + o[0] * 1.11, 0, p.lz + o[1] * 1.11)); const ang = Math.atan2(p.z - V.z, p.x - V.x) + (rnd() - 0.5) * 0.6; reset(V.x, V.z, ang, true); const P = []; run(14, P); paths.push(P); }
for (let k = 0; k < 6; k++) { const a = rnd() * 6.283, r = 2.6 + rnd() * 1.2; reset(B.C0.x + Math.cos(a) * r, B.C0.z + Math.sin(a) * r, rnd() * 6.283, false); const P = []; run(60, P); pathsB.push(P); }
const W = 900, H = 640, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'); x.fillStyle = '#f4efe4'; x.fillRect(0, 0, W, H);
const x0 = B.C0.x - 4.5, z0 = B.C0.z - 3.2, s = Math.min(W / 9, H / 6.4), P = (px, pz) => [(px - x0) * s, (pz - z0) * s], st = 0.03125;
for (let px = x0; px < x0 + 9; px += st) for (let pz = z0; pz < z0 + 6.4; pz += st) { const gy = cowY(px, pz), m7 = E('colSub')(7, px, pz, gy + 0.12, gy + 0.5), m4 = E('colSub')(16, px, pz, gy + 0.12, gy + 0.5), C = E('COL.C'), xi = Math.floor(px / C), zi = Math.floor(pz / C), q = Math.min(3, (px / C - xi) * 4 | 0) + 4 * Math.min(3, (pz / C - zi) * 4 | 0);
  const [u, v] = P(px, pz); if (m7 >> q & 1) { x.fillStyle = '#b9b0a0'; x.fillRect(u, v, st * s + 0.5, st * s + 0.5); } else if (m4 >> q & 1) { x.fillStyle = '#9cc7e3'; x.fillRect(u, v, st * s + 0.5, st * s + 0.5); } }
const draw = (ps, col) => { for (const pa of ps) { x.strokeStyle = col; x.lineWidth = 1.3; x.beginPath(); pa.forEach(([px, pz], i) => { const [u, v] = P(px, pz); i ? x.lineTo(u, v) : x.moveTo(u, v); }); x.stroke(); x.fillStyle = '#d0312d'; for (const [px, pz, h] of pa) if (h) { const [u, v] = P(px, pz); x.beginPath(); x.arc(u, v, 3, 0, 7); x.fill(); } } };
draw(paths, 'rgba(40,110,200,0.6)'); draw(pathsB, 'rgba(30,150,80,0.6)');
x.fillStyle = '#5a3a1e'; for (const p of B.posts) { const [u, v] = P(p.x, p.z); x.fillRect(u - 3, v - 3, 6, 6); }
x.fillStyle = '#222'; x.font = 'bold 22px sans-serif'; x.fillText(TAG, 12, 30); x.font = '14px sans-serif'; x.fillText('xám: khối đặc · xanh nhạt: dây rào, ống, nhà kính (lớp riêng thỏ) · xanh dương: nhảy vào 21 cọc · xanh lá: lang thang · đỏ: thân lấn vật', 12, H - 12);
let inF = 0, n = 0; for (const pa of [...paths, ...pathsB]) for (const [px, pz] of pa) { n++; if (B.inFence(px, pz)) inF++; }
return { tag: TAG, inFencePct: +(100 * inF / n).toFixed(1), shots: [[window.__SHOT || ('map-' + TAG + '.png'), cv.toDataURL('image/png')]] };
