// quanh chỗ trú gốc (toạ độ xe 2,3 · 1,45): mỗi điểm lưới 5 cm trong ±0,6 m — số hướng (trên 16) viên nang thỏ thoáng (lớp 0–2 + 4) · chọn điểm thoáng nhiều hướng nhất, gần gốc nhất
const E = __ev, b = E('bunnies[0]'), bunFree = E('bunFree'), bunOK = E('bunOK'), cowY = E('cowY');
const rows = [], best = []; let top = null;
for (let lz = 1.45 - 0.6; lz <= 1.45 + 0.6 + 1e-6; lz += 0.05) { let s = '';
  for (let lx = 2.3 - 0.6; lx <= 2.3 + 0.6 + 1e-6; lx += 0.05) { const P = E(`VAN.toWorld(${lx}, 0, ${lz})`); let n = 0; if (bunOK(P.x, P.z)) for (let k = 0; k < 16; k++) if (bunFree(b, P.x, P.z, k * Math.PI / 8, 23)) n++;
    s += n >= 16 ? '#' : n >= 12 ? '+' : n >= 6 ? '-' : n ? '.' : ' '; const d = Math.hypot(lx - 2.3, lz - 1.45);
    if (!top || n > top.n || (n === top.n && d < top.d)) top = { n, d: +d.toFixed(2), lx: +lx.toFixed(2), lz: +lz.toFixed(2), x: +P.x.toFixed(2), z: +P.z.toFixed(2) }; }
  rows.push(lz.toFixed(2) + ' ' + s); }
// điểm gần gốc nhất có ≥ 12/16 hướng thoáng
let near12 = null; for (let lz = 1.45 - 0.6; lz <= 2.05 + 1e-6; lz += 0.05) for (let lx = 1.7; lx <= 2.9 + 1e-6; lx += 0.05) { const P = E(`VAN.toWorld(${lx}, 0, ${lz})`); let n = 0; if (bunOK(P.x, P.z)) for (let k = 0; k < 16; k++) if (bunFree(b, P.x, P.z, k * Math.PI / 8, 23)) n++; const d = Math.hypot(lx - 2.3, lz - 1.45); if (n >= 12 && (!near12 || d < near12.d)) near12 = { n, d: +d.toFixed(2), lx: +lx.toFixed(2), lz: +lz.toFixed(2), x: +P.x.toFixed(2), z: +P.z.toFixed(2) }; }
return { legend: '# 16/16 · + ≥12 · - ≥6 · . ≥1 · trống 0 — cột lx 1,7→2,9, hàng lz 0,85→2,05', rows, top, near12 };
