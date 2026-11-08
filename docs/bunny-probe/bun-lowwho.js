// vật thấp (đỉnh 3–12 cm, không có gì 12–50 cm) là gì, nằm đâu so với hang / hiên / luống — tên mesh có hộp bao chứa ô
const B = window.__B, E = B.E, cowY = B.cowY, colHit = B.colHit, bunOK = E('bunOK'), THREE = __dbg.THREE, C = 0.125;
const D = E('bunnyBurrow.door'), S = E('bunnyShelter'), CB = E("worldSee('carrotBed')");
const boxes = []; E('scene').traverse(o => { if (o.isMesh && !o.isInstancedMesh && o.geometry && !o.userData.noCollide) { const bb = new THREE.Box3().setFromObject(o); if (bb.max.y - bb.min.y < 40) boxes.push([o, bb]); } });
function nameAt(x, z, g) { const hits = []; for (const [o, bb] of boxes) if (x >= bb.min.x - 0.02 && x <= bb.max.x + 0.02 && z >= bb.min.z - 0.02 && z <= bb.max.z + 0.02 && bb.min.y < g + 0.12 && bb.max.y > g + 0.03) { let n = o.name, p = o.parent; while (!n && p) { n = p.name; p = p.parent; } let top = o; while (top.parent && top.parent.type !== 'Scene') top = top.parent; hits.push((top.name || '?') + '/' + (n || '?')); } return [...new Set(hits)].slice(0, 3).join(' ; '); }
const out = { door: [+D.x.toFixed(2), +D.z.toFixed(2)], shelter: [+S.x.toFixed(2), +S.z.toFixed(2)], bed: [+CB.pos.x.toFixed(2), +CB.pos.z.toFixed(2)], near: {}, who: {} };
const zones = { door: D, shelter: S, bed: CB.pos };
for (const k in zones) { const P = zones[k]; let n = 0; const names = {}; for (let x = P.x - 2; x < P.x + 2; x += C) for (let z = P.z - 2; z < P.z + 2; z += C) { if (!bunOK(x, z)) continue; const g = cowY(x, z); if (!colHit(7, x, z, g + 0.12, g + 0.5) && colHit(7, x, z, g + 0.03, g + 0.12)) { n++; const nm = nameAt(x, z, g); names[nm] = (names[nm] || 0) + 1; } } out.near[k] = { cells: n, names }; }
// toàn bản đồ: cụm 2 m → tên
const GX = E('GX'), GZ = E('GZ'), BL = E('BLOCK'), cx = E('cx'), cz = E('cz'), gi2x = i => (i - cx + 0.5) * BL, gj2z = j => (j - cz + 0.5) * BL;
const X0 = gi2x(3), X1 = gi2x(GX - 3), Z0 = gj2z(3), Z1 = gj2z(GZ - 3), cl = new Map();
for (let x = Math.min(X0, X1); x < Math.max(X0, X1); x += C) for (let z = Math.min(Z0, Z1); z < Math.max(Z0, Z1); z += C) { if (!bunOK(x, z)) continue; const g = cowY(x, z); if (!colHit(7, x, z, g + 0.12, g + 0.5) && colHit(7, x, z, g + 0.03, g + 0.12)) { const k = Math.round(x / 2) + ',' + Math.round(z / 2); let e = cl.get(k); if (!e) cl.set(k, e = { n: 0, x, z, g }); e.n++; } }
out.clusters = [...cl.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 14).map(([k, e]) => [k, e.n, nameAt(e.x, e.z, e.g)]);
out.totalLow = [...cl.values()].reduce((s, e) => s + e.n, 0);
return out;
