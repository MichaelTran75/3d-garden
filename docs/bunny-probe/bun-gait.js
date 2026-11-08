// DÁNG NHẢY: đỉnh nhảy, tỉ lệ thời gian bay, tốc độ trung bình, số cú — nhảy liền 12 s trên bãi trống (không vật cản) · thời gian tính mỗi khung
const B = window.__B, b = B.b, E = B.E, dt = 1 / 60, cowY = B.cowY;
// tìm chỗ trống: quanh tâm biogas, ra xa 6–9 m, nơi 2 m quanh đó không có khối đặc
let start = null;
for (let r = 6; r < 14 && !start; r += 0.5) for (let k = 0; k < 24 && !start; k++) {
  const a = k * Math.PI / 12, x = B.C0.x + Math.cos(a) * r, z = B.C0.z + Math.sin(a) * r; let ok = E('bunOK')(x, z);
  for (let s = 0; s <= 3.2 && ok; s += 0.1) { const px = x + Math.cos(a) * s, pz = z + Math.sin(a) * s, g = cowY(px, pz); if (!E('bunOK')(px, pz) || B.colHit(7, px, pz, g + 0.05, g + 0.6) || Math.abs(g - cowY(x, z)) > 0.01) ok = false; }
  if (ok) start = [x, z, a];
}
if (!start) return { err: 'no open ground' };
const out = {};
for (const [name, secs] of [['wander', 6]]) {
  b.x = start[0]; b.z = start[1]; b.ang = start[2]; b.want = start[2]; b.hp = null; b.sy = undefined; b.fall = null; b.yawV = start[2]; b.state = 'hop'; b.tmr = 1e9; b.digTmr = 1e9; if (b.life) b.life.st = ''; b.col.ghost = 0;
  let t = E('clock.elapsedTime') + 5000, maxLift = 0, minLift = 0, air = 0, n = 0, lands = 0, wasAir = false, tMax = 0, tSum = 0; const x0 = b.x, z0 = b.z;
  for (let i = 0; i < secs / dt; i++) {
    t += dt; const t0 = performance.now(); B.colTick(dt); B.bunnyTick(b, dt, t); const tt = performance.now() - t0; tMax = Math.max(tMax, tt); tSum += tt;
    const lift = b.g.position.y - cowY(b.x, b.z); maxLift = Math.max(maxLift, lift); minLift = Math.min(minLift, lift); n++;
    const isAir = b.hp ? b.hp.ph === 'fl' : lift > 0.002; if (isAir) air++; if (wasAir && !isAir) lands++; wasAir = isAir;
  }
  out[name] = { apexCm: +(100 * maxLift).toFixed(1), crouchCm: +(100 * minLift).toFixed(1), airPct: +(100 * air / n).toFixed(0), speed: +(Math.hypot(b.x - x0, b.z - z0) / secs).toFixed(3), hopsPerS: +(lands / secs).toFixed(2), msAvg: +(tSum / n).toFixed(3), msMax: +tMax.toFixed(2) };
}
return out;
