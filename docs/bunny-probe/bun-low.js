// ĐIỀU TRA vật thấp (đỉnh 4–12 cm trên đất, không có gì 12–50 cm) trên vùng thỏ đi được: bao nhiêu ô 12,5 cm, gom cụm, tên vật gần nhất
const B = window.__B, E = B.E, cowY = B.cowY, colHit = B.colHit, bunOK = E('bunOK'), C = 0.125;
let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
for (const b of E('bunnies')) { minX = Math.min(minX, b.x); maxX = Math.max(maxX, b.x); minZ = Math.min(minZ, b.z); maxZ = Math.max(maxZ, b.z); }
// vùng: toàn bản đồ đất liền thỏ đi được (bunOK), lấy mẫu mỗi ô
const GX = E('GX'), GZ = E('GZ'), BL = E('BLOCK'), cx = E('cx'), cz = E('cz'), gi2x = i => (i - cx + 0.5) * BL, gj2z = j => (j - cz + 0.5) * BL;
let low = 0, tall = 0, okCells = 0; const cl = new Map();
const X0 = gi2x(3), X1 = gi2x(GX - 3), Z0 = gj2z(3), Z1 = gj2z(GZ - 3);
for (let x = Math.min(X0, X1); x < Math.max(X0, X1); x += C) for (let z = Math.min(Z0, Z1); z < Math.max(Z0, Z1); z += C) {
  if (!bunOK(x, z)) continue; okCells++; const g = cowY(x, z);
  const lo = colHit(7, x, z, g + 0.04, g + 0.12), hi = colHit(7, x, z, g + 0.12, g + 0.5);
  if (hi) tall++; else if (lo) { low++; const k = Math.round(x / 2) + ',' + Math.round(z / 2); cl.set(k, (cl.get(k) || 0) + 1); }
}
const top = [...cl.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => { const [i, j] = k.split(',').map(Number); return { at: [i * 2, j * 2], n }; });
return { okCells, area_m2: +(okCells * C * C).toFixed(0), lowCells: low, low_m2: +(low * C * C).toFixed(1), tallCells: tall, bunnies: E('bunnies.length'), range: [[+minX.toFixed(1), +maxX.toFixed(1)], [+minZ.toFixed(1), +maxZ.toFixed(1)]], topClusters: top };
