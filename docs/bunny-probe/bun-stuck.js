// DÒ CHỖ KẸT: chạy lại kịch bản A (cùng hạt giống), lần đầu kẹt > 2 s thì chụp trạng thái + bản đồ ô quanh thỏ
const B = window.__B, b = B.b, E = B.E, THREE = __dbg.THREE, dt = 1 / 60;
const g = E("scene.getObjectByName('Hệ biogas ống mềm')"), V = new THREE.Vector3(), bunFree = E('bunFree'), bunRay = E('bunRay'), cowY = B.cowY, colHit = B.colHit;
let seed = 12345; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const cases = [];
for (const p of B.posts) {
  const out = Math.abs(Math.abs(p.lx) - 2.85) < 1e-3 ? [Math.sign(p.lx), 0] : [0, Math.sign(p.lz)];
  g.localToWorld(V.set(p.lx + out[0] * 1.11, 0, p.lz + out[1] * 1.11));
  const ang = Math.atan2(p.z - V.z, p.x - V.x) + (rnd() - 0.5) * 0.6;
  b.x = V.x; b.z = V.z; b.ang = ang; b.want = ang; b.hp = null; b.sy = undefined; b.fall = null; b.yawV = ang; b.state = 'hop'; b.tmr = 1e9; b.digTmr = 1e9; if (b.life) b.life.st = ''; b.col.ghost = 0;
  let t = E('clock.elapsedTime') + 1000, rec = null;
  for (let i = 0; i < 20 / dt && !rec; i++) {
    t += dt; B.colTick(dt); B.bunnyTick(b, dt, t);
    if (b.hp && b.hp.stuck > 2) {
      const mk = b.col.mask(), rays = []; for (let k = 0; k < 16; k++) { const a = b.ang + k * Math.PI / 8; rays.push([+(a % 6.283).toFixed(2), +bunRay(b, a, 0.6, mk).toFixed(2)]); }
      rec = { post: [+(p.lx).toFixed(2), +(p.lz).toFixed(2)], at: [+b.x.toFixed(3), +b.z.toFixed(3)], ang: +b.ang.toFixed(2), want: +(b.want ?? 0).toFixed(2), open: +(b.hp.open ?? 0).toFixed(2), freeHere: bunFree(b, b.x, b.z, b.ang, mk), rotP: bunFree(b, b.x, b.z, b.ang + 0.12, mk), rotM: bunFree(b, b.x, b.z, b.ang - 0.12, mk), plan: b.hp.plan, rays, sec: +(i * dt).toFixed(1) };
      // bản đồ ô 1,2 × 1,2 m quanh thỏ: # khối đặc trong dải thỏ, . trống, o tâm thỏ
      const rows = []; for (let zz = -0.6; zz < 0.6; zz += 0.0625) { let s = ''; for (let xx = -0.6; xx < 0.6; xx += 0.0625) { const px = b.x + xx, pz = b.z + zz, gy = cowY(px, pz); s += Math.hypot(xx, zz) < 0.04 ? 'o' : colHit(mk, px, pz, gy + 0.12, gy + 0.5) ? '#' : '.'; } rows.push(s); }
      rec.map = rows;
    }
  }
  if (rec) cases.push(rec);
}
return { n: cases.length, cases: cases.slice(0, 4) };
