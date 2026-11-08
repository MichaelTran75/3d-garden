// gần gầm chuồng gà: thỏ đứng cách đích nấp 0,62 m (lượt trốn 12 hỏng) — từng khung: pha, kế hoạch, kẹt; quanh đích: cột đặc, mặt đứng
const B = window.__B, b = B.b, E = B.E, dt = 1 / 60, cowY = B.cowY, THREE = __dbg.THREE;
E('bunnyLife = __orig.bunnyLife;');
const T = { x: -60.42, z: -19.16 }, out = { runs: [] };
const spans = (x, z) => { const r = []; for (let L = 0; L < 5; L++) { if (!E('colCell')(L, x, z)) continue; const C = E('_colT'), I = E('_colI'); for (let k = C.off[I]; k < C.off[I + 1]; k += 2) r.push(L + ':' + (C.y[k] - Math.round(cowY(x, z) * 100)) + '-' + (C.y[k + 1] - Math.round(cowY(x, z) * 100))); } return r.join(' '); };
out.target = spans(T.x, T.z); out.mid = spans((T.x - 59.85) / 2 - 59.85 / 2 + 0, 0);
const line = []; for (let s = 0; s <= 0.62; s += 0.08) { const x = -59.85 + (T.x + 59.85) * s / 0.62, z = -19.38 + (T.z + 19.38) * s / 0.62; line.push(s.toFixed(2) + ' ' + spans(x, z)); } out.line = line;
for (const st of [[-59.85, -19.38], [-59.6, -19.6], [-61.3, -19.9], [-60.4, -18.2]]) {
  const a = Math.atan2(T.z - st[1], T.x - st[0]);
  b.x = st[0]; b.z = st[1]; b.ang = a; b.hop = 0; b.state = 'hop'; b.tmr = 1; b.digTmr = 1e9; b.home = null; b.shelter = null; b.bed = null; b.col.ghost = 0; b.col.stuck = 0; b.want = a; b.hp = null; b.fall = null; b.yawV = a; b.sy = undefined;
  const src = new THREE.Vector3(st[0] - Math.cos(a) * 3, 0, st[1] - Math.sin(a) * 3);
  b.life = { st: 'flee', k: 0, d: 12, vt: 99, zz: 0, from: src.clone(), to: new THREE.Vector3(T.x, 0, T.z), cd: 4, hab: 0, rT: 1e12, ref: null, dRef: 5 };
  let t = E('clock.elapsedTime') + 7000; const tr = [];
  for (let i = 0; i < 4 / dt; i++) { t += dt; B.colTick(dt); B.bunnyTick(b, dt, t); if (i % 10 === 0) tr.push([+(i * dt).toFixed(1), +b.x.toFixed(2), +b.z.toFixed(2), b.life ? b.life.st : '-', b.hp ? b.hp.ph : '-', b.hp ? +(b.hp.stuck || 0).toFixed(1) : '-', +Math.hypot(T.x - b.x, T.z - b.z).toFixed(2)].join(' ')); if (!b.life || b.life.st === 'hide') { tr.push('HIDE at ' + (i * dt).toFixed(1)); break; } }
  out.runs.push({ st, tr: tr.join(' | ') });
}
E('bunnyLife = () => false;');
return out;
