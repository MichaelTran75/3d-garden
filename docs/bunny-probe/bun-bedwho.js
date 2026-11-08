// RA LUỐNG: lấn vật xảy ra ở hành vi nào (state | life.st | pha nhảy | bed.st) · 2 biến thể: chó tại chỗ / chó dời xa 500 m · 8 chỗ xuất phát
const B = window.__B, b = B.b, E = B.E, dt = 1 / 60, cowY = B.cowY, colHit = B.colHit;
E('bunnyLife = __orig.bunnyLife; bunnyRain = __orig.bunnyRain; bunnyBed = __orig.bunnyBed; bunnyHome = __orig.bunnyHome;');
const bunOK = E('bunOK'), CB = E("worldSee('carrotBed')"), BB = E('BUN_BED'), DOG = E('dogObj.position'), D0 = DOG.clone();
let seed; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function freeSpot(cx, cz, r0, r1) { for (let n = 0; n < 400; n++) { const a = rnd() * 6.283, r = r0 + rnd() * (r1 - r0), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (!bunOK(x, z)) continue; let ok = true; const g = cowY(x, z);
  for (let dx = -0.35; dx <= 0.35 && ok; dx += 0.0625) for (let dz = -0.35; dz <= 0.35 && ok; dz += 0.0625) if (colHit(7, x + dx, z + dz, g + 0.04, g + 0.5)) ok = false; if (ok) return [x, z]; } return null; }
function reset(x, z, ang) { b.x = x; b.z = z; b.ang = ang; b.hop = 0; b.state = 'hop'; b.tmr = 1; b.digTmr = 1e9; b.life = null; b.home = null; b.shelter = null; b.bed = null; b.bedHold = 0; b.col.ghost = 0; b.col.stuck = 0; b.col.gext = 0; b.g.visible = true; b.want = ang; b.hp = null; b.sy = undefined; b.fall = null; b.yawV = ang; b.carrot.visible = false; }
const out = {};
const THREE = __dbg.THREE, boxes = []; E('scene').traverse(o => { if (o.isMesh && !o.isInstancedMesh && o.geometry && !o.userData.noCollide) { const bb = new THREE.Box3().setFromObject(o); if (bb.max.y - bb.min.y < 40) boxes.push([o, bb]); } });
const VS = []; b.g.traverse(o => { if (o.isMesh && o.geometry.attributes.position && o.visible !== false) { const a = o.geometry.attributes.position; for (let i = 0; i < a.count; i += 2) VS.push([o, i]); } });
const V = new THREE.Vector3(), WHO = {}, HGT = {}, REL = [], CBo = E('carrotBed'), EX = { chk: 0, hit: 0, chkF: 0, hitF: 0, max: 0 };
function exact() { const C = CBo.C, L = CBo.L, W = CBo.W, H = CBo.H, S = CBo.SOIL; let n = 0; b.g.updateMatrixWorld(true);
  const BX = [[0, -(W / 2 - 0.0225), L / 2, 0.0225, H], [0, W / 2 - 0.0225, L / 2, 0.0225, H], [-(L / 2 - 0.0225), 0, 0.0225, W / 2, H], [L / 2 - 0.0225, 0, 0.0225, W / 2, H], [0, 0, (L - 0.09) / 2, (W - 0.09) / 2, S]];
  for (const [o, i] of VS) { let vis = true; for (let p = o; p; p = p.parent) if (!p.visible) { vis = false; break; } if (!vis) continue; V.fromBufferAttribute(o.geometry.attributes.position, i).applyMatrix4(o.matrixWorld); const x = V.x - C.x, z = V.z - C.z, y = V.y - C.y;
    for (const [px, pz, hx, hz, hh] of BX) if (Math.abs(x - px) <= hx && Math.abs(z - pz) <= hz && y >= 0 && y <= hh) { n++; break; } }
  return n; }
function who() { b.g.updateMatrixWorld(true); for (const [o, i] of VS) { let vis = true; for (let p = o; p; p = p.parent) if (!p.visible) { vis = false; break; } if (!vis) continue; V.fromBufferAttribute(o.geometry.attributes.position, i).applyMatrix4(o.matrixWorld); const g = cowY(V.x, V.z);
  if (V.y > g + 0.04 && colHit(7, V.x, V.z, V.y - 0.01, V.y + 0.01)) { const hb = Math.round((V.y - g) * 100 / 4) * 4; HGT[hb] = (HGT[hb] || 0) + 1; let nm = '?'; for (const [m, bb] of boxes) if (V.x >= bb.min.x - 0.01 && V.x <= bb.max.x + 0.01 && V.z >= bb.min.z - 0.01 && V.z <= bb.max.z + 0.01 && V.y >= bb.min.y - 0.01 && V.y <= bb.max.y + 0.01) { let t = m; while (t.parent && t.parent.type !== 'Scene') t = t.parent; nm = (t.name || '?') + '/' + (m.name || m.parent?.name || '?'); break; } WHO[nm] = (WHO[nm] || 0) + 1; } } }
for (const away of [1]) {
  seed = 4242; if (away) DOG.set(D0.x + 500, D0.y, D0.z + 500); else DOG.copy(D0);
  const KEY = {}, runs = []; let chk = 0, pen = 0, goChk = 0, goPen = 0;
  for (let k = 0; k < 8; k++) {
    const p = freeSpot(CB.pos.x, CB.pos.z, 4, 12); if (!p) continue; reset(p[0], p[1], rnd() * 6.283); BB.eatAt = -1e9; BB.who = null;
    let t = E('clock.elapsedTime') + 3000 + rnd() * 100, ok = 0, sec = 90, still = 0, mx = 0, lx = b.x, lz = b.z;
    for (let i = 0; i < 90 / dt; i++) {
      t += dt; B.colTick(dt); B.bunnyTick(b, dt, t);
      if (Math.hypot(b.x - lx, b.z - lz) < 0.002) { still += dt; mx = Math.max(mx, still); } else still = 0; lx = b.x; lz = b.z;
      if (i % 3 === 0) { const ne = exact(), fr = !!(b.bed && b.bed.st === 'go' && Math.hypot(b.bed.at.x - b.x, b.bed.at.z - b.z) <= 0.5); EX.chk++; if (ne) EX.hit++; if (fr) { EX.chkF++; if (ne) EX.hitF++; } EX.max = Math.max(EX.max, ne); const n = B.penVerts(), key = [b.state, b.life ? b.life.st : '', b.hp ? b.hp.ph : '', b.bed ? b.bed.st : '', b.bed && b.bed.st === 'go' && Math.hypot(b.bed.at.x - b.x, b.bed.at.z - b.z) <= 0.5 ? 'free' : ''].join('|'); chk++; const G = KEY[key] || (KEY[key] = [0, 0, 0]); G[0]++; if (n >= 1) { pen++; G[1]++; G[2] = Math.max(G[2], n); if (key.endsWith('free')) { who(); if (REL.length < 12) { const C = CB.pos; REL.push([+(b.x - C.x).toFixed(2), +(b.z - C.z).toFixed(2), +b.ang.toFixed(2), +(b.bed.at.x - C.x).toFixed(2), +(b.bed.at.z - C.z).toFixed(2), n, b.hp ? b.hp.ph : '']); } } }
        if (b.bed && b.bed.st === 'go') { goChk++; if (n >= 1) goPen++; } }
      if (b.bed && b.bed.st !== 'go') { ok = 1; sec = +(i * dt).toFixed(1); break; }
    }
    runs.push([ok, sec, +mx.toFixed(1), b.bed ? b.bed.st : 'none'].join(' ')); if (b.bed) { CB.release(b.bed.sl); b.bed = null; BB.who = null; }
  }
  const top = Object.entries(KEY).sort((a, c) => c[1][1] - a[1][1]).slice(0, 8).map(([k, v]) => `${k}: ${v[1]}/${v[0]} max ${v[2]}`);
  out[away ? 'dogAway' : 'dogHere'] = { arrived: runs.filter(r => r[0] === '1').length + '/' + runs.length, pen1pct: +(100 * pen / Math.max(1, chk)).toFixed(1), goPen1pct: +(100 * goPen / Math.max(1, goChk)).toFixed(1), runs, top };
}
out.exactBed = EX; out.who = WHO; out.hgt = HGT; out.rel = REL; DOG.copy(D0); E('bunnyLife = () => false; bunnyRain = () => false; bunnyBed = () => false; bunnyHome = () => false;');
return out;
