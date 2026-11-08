// TỐC ĐỘ THẬT trên bãi trống: kiếm ăn (0,5 m/s) · chạy trốn thẳng / zíc-zắc ±0,45 rad mỗi 0,4 s (1,63 m/s mong muốn) · về hang (0,63)
const B = window.__B, b = B.b, E = B.E, dt = 1 / 60, cowY = B.cowY, bunHop = E('bunHop'), BUN_SLOW = E('BUN_SLOW'), BUN_CAD = E('BUN_CAD');
let start = null;
for (let r = 6; r < 30 && !start; r += 0.5) for (let k = 0; k < 24 && !start; k++) {
  const a = k * Math.PI / 12, x = B.C0.x + Math.cos(a) * r, z = B.C0.z + Math.sin(a) * r; let ok = E('bunOK')(x, z);
  for (let s = 0; s <= 12 && ok; s += 0.1) { const px = x + Math.cos(a) * s, pz = z + Math.sin(a) * s, g = cowY(px, pz); if (!E('bunOK')(px, pz) || B.colHit(7, px, pz, g + 0.05, g + 0.6) || Math.abs(g - cowY(x, z)) > 0.01) ok = false; }
  if (ok) start = [x, z, a];
}
if (!start) return { err: 'no ground' };
const out = {};
for (const [name, v, hz, zig] of [['forage', 0.5 * E('HOP_GO') / E('HOP_GO'), 3.2 * BUN_CAD, 0], ['flee', 6.5 * BUN_SLOW, 5 * BUN_CAD, 0], ['fleeZig', 6.5 * BUN_SLOW, 5 * BUN_CAD, 0.45]]) {
  b.x = start[0]; b.z = start[1]; b.ang = start[2]; b.hp = null; b.fall = null; b.yawV = start[2]; b.sy = undefined;
  let t = 0, air = 0, n = 0; const secs = 5, tl = [];
  for (let i = 0; i < secs / dt; i++) { t += dt; b.fr = (b.fr || 0) + 1; const want = start[2] + (zig ? (Math.floor(t / 0.4) % 2 ? zig : -zig) : 0); bunHop(b, dt, want, v, hz); if (b.hp.ph === 'fl') air++; n++; if (zig && i > 60 && i < 130) tl.push([i, b.hp.ph, +b.hp.s.toFixed(3), +(b.hp.Ts||0).toFixed(3), +(b.ang - start[2]).toFixed(2), +(want - start[2]).toFixed(2), b.hp.plan ? b.hp.plan.map(q => +(q - (q === b.hp.plan[0] ? start[2] : 0)).toFixed(2)).join('/') : '-', +(b.hp.Tf||0).toFixed(3)].join(' ')); }
  const dx = b.x - start[0], dz = b.z - start[1];
  out[name] = { tl: zig ? tl : undefined, wantV: +v.toFixed(2), gotV: +((dx * Math.cos(start[2]) + dz * Math.sin(start[2])) / secs).toFixed(2), airPct: Math.round(100 * air / n) };
}
return out;
