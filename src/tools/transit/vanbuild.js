// "Ford Transit L2H2" (geyges, Sketchfab Standard) → hình xe cho 3d-garden (đv xe: mũi −X, cửa lùa +Z, sàn khoang Y 0,83).
// Giữ vỏ ngoài + cabin, bỏ khoang hàng (nội thất nhà xe dựng bằng code) và băng ghế đôi; lật trái–phải (tay lái nghịch kiểu Úc) nhưng logo / chữ
// lật lại tại chỗ cho đọc đúng; L3 = chèn 0,45 m vào GIỮA ô cửa lùa (ô cửa rộng 0,95 → 1,40 m như xe thật); nâng mui 6 cm; khoét 3 cửa sổ nhà xe +
// cửa sổ cửa lùa (kính, viền cao su, má cửa); 1 bánh dùng 4 lần (quay, không lật), 1 ghế lái dùng 2 lần. Kết quả: window.__van (nhóm + thống kê).
window.vanBuild = async (o = {}) => {
  const THREE = S.THREE, MSx = window.MS;
  const top0 = S.root.getObjectByName('Ford_Transit_(Mk5f)_PanelVan_L2H2_HQinterior_2018_587'); S.root.updateMatrixWorld(true);
  const CUT = o.cut ?? -0.1, STR = 0.45, KW = 0.44 / (1.1 * 0.365);
  const ss = (a, b, t) => { const k = Math.max(0, Math.min(1, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
  const MX = z => 0.0272 - 1.1 * (z < CUT ? z - STR : z), MY = y => 0.1128 + 1.1 * y + 0.06 * ss(1.9, 2.4, y);
  const base = n => n.replace(/_\d+$/, '');
  const CLS = n => /^Car_Paint/.test(n) ? 'paint' : /Glass_Window/.test(n) ? 'glass' : /Plastic_Clear/.test(n) ? 'lens' : /LightBulb|Light_White/.test(n) ? 'bulb'
    : /Plastic_Red|MetalOrnamental_Red/.test(n) ? 'red' : /MetalOrnamental_Blue/.test(n) ? 'blue' : /Metal_Chrome|Mirror_Glass|^white|skyblue/.test(n) ? 'chrome'
    : /Metal_Steel/.test(n) ? 'steel' : /Rubber_Tire/.test(n) ? 'tire' : /interior_second/.test(n) ? 'trim' : /interior_third/.test(n) ? 'dash'
    : /interior_fourth/.test(n) ? 'dashTop' : /interior_(sixth|seventh)/.test(n) ? 'ctrl' : /interior_(eighth|ninth)/.test(n) ? 'seat' : /yellow/.test(n) ? 'yellow' : 'black';
  const DROP = new Set(['boot_detail', 'boot_detail01', 'boot_detail03', 'boot_detail05', 'boot_edge', 'boot_light', 'boot_light_glass', 'boot_light_lamp', 'boot_light_reflector',
    'floor', 'interior_panel_cover', 'interior_rear_cover', 'interior_logo', 'interior_bump',
    'carchair_front', 'carchair_front_frame', 'carchair_front_part', 'carchair_front_seat_belts', 'carchair_front_seat_belts_catch', 'carchair_front_seat_belts_catch_detail',
    'carchair_front_seat_belts_catch_part', 'carchair_front_seat_belts_lock', 'carchair_front_seat_belts_part__', 'carchair_front_support', 'carchair_front_support_part',
    'Tire_Empty_Front_Left', 'Tire_Empty_Front_Right', 'Tire_Empty_Rear_Left', 'Tire_Empty_Rear_Right', ...(o.drop || [])]);
  const SEAT = new Set(['carchair_front_L', 'carchair_front_frame_L', 'carchair_front_frame_part_L', 'carchair_front_frame_detail_L', 'carchair_front_part_L',
    'carchair_front_seat_belts_catch_L', 'carchair_front_seat_belts_catch_part_L', 'carchair_front_support_L', 'carchair_front_support_part_L', 'interior_floor003']);
  const CAB = new Set(['steering', 'steering_logo', 'steering_logo_part', 'steering_part', 'steering_stripe', 'steering_support', 'steering_support_lock', 'steering_switch',
    'steering_wheel_signal', 'transmission_base', 'transmission_handle', 'transmission_handle_chrome', 'transmission_handle_skin', 'handle_chrome', 'gage_panel_pedal',
    'gage_panel_lever_brake', 'interior_floor', 'interior_carchair_seat_belts', 'interior_carchair_seat_belts_lock', 'interior_carchair_seat_belts_part']);
  // sơn ĐỤC ở mũi xe + 2 cửa cabin (không có gì trong khoang máy để xem; vỏ bán trong suốt làm lộ ruột thành vệt loang) — khoang ở phía sau vẫn bán trong suốt
  const OPQ = new Set(['bumper', 'hood', 'fender1', '13_DOOR_FRONT_LEFT', '14_DOOR_FRONT_RIGHT', ...(o.opq || [])]);
  const BELT = new Set(['interior_carchair_seat_belts', 'interior_carchair_seat_belts_lock', 'interior_carchair_seat_belts_part']);
  const LOGO = { Ford: 'front', Blue03: 'front', steering_logo: 'steer', steering_logo_part: 'steer' }, SUBLOGO = { Object_178: 'rearT', Object_185: 'rearB', Object_186: 'rearB' };
  // ---- 1. tam giác GLB (toạ độ thế giới mẫu) kèm nhãn ----
  const raw = [], a = new THREE.Vector3(), nm3 = new THREE.Matrix3();
  const take = (part, mesh, info) => {
    const g = mesh.geometry, P = g.attributes.position, N = g.attributes.normal, I = g.index, mats = [].concat(mesh.material); nm3.getNormalMatrix(mesh.matrixWorld);
    const matOf = t => { if (!g.groups.length) return mats[0]; for (const gr of g.groups) if (t * 3 >= gr.start && t * 3 < gr.start + gr.count) return mats[gr.materialIndex]; return mats[0]; };
    const nT = (I ? I.count : P.count) / 3;
    for (let t = 0; t < nT; t++) { const p = [], n = [];
      for (let k = 0; k < 3; k++) { const i = I ? I.getX(t * 3 + k) : t * 3 + k; a.fromBufferAttribute(P, i).applyMatrix4(mesh.matrixWorld); p.push(a.x, a.y, a.z);
        if (N) { a.fromBufferAttribute(N, i).applyMatrix3(nm3).normalize(); n.push(a.x, a.y, a.z); } else n.push(0, 1, 0); }
      raw.push({ part, sub: mesh.name, cls: CLS(matOf(t).name), p, n, ...info }); } };
  for (const c of top0.children) { const nm = base(c.name); if (DROP.has(nm)) continue;
    const node = SEAT.has(nm) ? 'seat' : nm === '15_DOOR_SIDE' ? 'door' : CAB.has(nm) ? 'cab' : 'shell';
    const DOOR_IN = o.doorInner ? [] : ['Object_135', 'Object_138', 'Object_141', 'Object_144'];   // cửa lùa: bỏ ốp trong + khung khoá (cửa mở nằm ngoài vách — mặt trong không thấy)
    c.traverse(m => { if (m.isMesh && !(node === 'door' && DOOR_IN.includes(m.name))) take(nm, m, { node, logo: LOGO[nm] || SUBLOGO[m.name] || '' }); }); }
  // dây đai 3 chỗ: chỉ giữ 2 dây ở trụ B ngoài (|x| > 0,6), dây giữa thuộc băng ghế đã bỏ
  for (let i = raw.length - 1; i >= 0; i--) { const r = raw[i]; if (BELT.has(r.part) && Math.abs((r.p[0] + r.p[3] + r.p[6]) / 3) < 0.6) raw.splice(i, 1); }
  // ---- 2. đổi sang đv xe ----
  const lc = {}; for (const r of raw) if (r.logo) { const b = lc[r.logo] || (lc[r.logo] = [9, -9]); for (let k = 0; k < 3; k++) { b[0] = Math.min(b[0], r.p[k * 3]); b[1] = Math.max(b[1], r.p[k * 3]); } }
  const tris = { shell: [], cab: [], door: [], seat: [] };
  for (const r of raw) {
    const xc = r.logo ? (lc[r.logo][0] + lc[r.logo][1]) / 2 : 0, mir = !r.logo, p = [], n = [];
    for (let k = 0; k < 3; k++) { const x = r.p[k * 3], y = r.p[k * 3 + 1], z = r.p[k * 3 + 2];
      p.push(MX(z), MY(y), mir ? -1.1 * x : 1.1 * (x - 2 * xc)); n.push(-r.n[k * 3 + 2], r.n[k * 3 + 1], mir ? -r.n[k * 3] : r.n[k * 3]); }
    if (mir) { for (const A of [p, n]) for (let j = 0; j < 3; j++) { const t = A[3 + j]; A[3 + j] = A[6 + j]; A[6 + j] = t; } }   // lật ⇒ đảo thứ tự đỉnh giữ mặt trước
    tris[r.node].push({ part: r.part, sub: r.sub, cls: r.cls === 'paint' && OPQ.has(r.part) ? 'paintO' : r.cls, p, n });
  }
  // ---- 3. bánh xe: bánh trước trái (mặt ngoài +x) quay về mặt ngoài +Z, phóng ×KW cho lốp chạm đất khi tâm ở Y 0,44 ----
  const wsrc = top0.children.find(c => base(c.name) === 'Tire_Empty_Front_Left'), wb = new THREE.Box3().setFromObject(wsrc), wc = wb.getCenter(new THREE.Vector3()), wheel = [];
  { const tmp = raw.length; wsrc.traverse(m => { if (m.isMesh) take('wheel', m, { node: 'wheel', logo: '' }); });
    for (const r of raw.splice(tmp)) { const p = [], n = [];
      for (let k = 0; k < 3; k++) { const x = r.p[k * 3] - wc.x, y = r.p[k * 3 + 1] - wc.y, z = r.p[k * 3 + 2] - wc.z, s = 1.1 * KW; p.push(-z * s, y * s, x * s); n.push(-r.n[k * 3 + 2], r.n[k * 3 + 1], r.n[k * 3]); }
      wheel.push({ part: 'wheel', sub: r.sub, cls: r.cls, p, n }); } }
  // ---- 4. khoét cửa sổ (đa giác lồi ngược kim, toạ độ (X, Y)) ----
  const rr = (x0, y0, x1, y1, r = 0.06) => { const q = []; for (const [cx, cy, a0] of [[x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI]]) for (let k = 0; k <= 3; k++) { const t = a0 + k * Math.PI / 6; q.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); } return q; };
  const fnorm = t => { const p = t.p, ux = p[3] - p[0], uy = p[4] - p[1], uz = p[5] - p[2], vx = p[6] - p[0], vy = p[7] - p[1], vz = p[8] - p[2]; const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx], l = Math.hypot(...n) || 1; return n.map(v => v / l); };
  const V = (t, k) => ({ p: t.p.slice(k * 3, k * 3 + 3), n: t.n.slice(k * 3, k * 3 + 3) });
  const lerpV = (A, B, s) => { const n = A.n.map((v, i) => v + (B.n[i] - v) * s), l = Math.hypot(...n) || 1; return { p: A.p.map((v, i) => v + (B.p[i] - v) * s), n: n.map(v => v / l) }; };
  const side2 = (a2, b2, P) => (b2[0] - a2[0]) * (P.p[1] - a2[1]) - (b2[1] - a2[1]) * (P.p[0] - a2[0]);
  const clip = (poly, a2, b2, keepIn) => { const out = []; for (let i = 0; i < poly.length; i++) { const A = poly[i], B = poly[(i + 1) % poly.length], da = side2(a2, b2, A) * (keepIn ? 1 : -1), db = side2(a2, b2, B) * (keepIn ? 1 : -1);
    if (da >= 0) out.push(A); if ((da >= 0) !== (db >= 0)) out.push(lerpV(A, B, da / (da - db))); } return out; };
  function cutHoles(list, holes, sideZ, test = () => true) {
    const out = [];
    for (const t of list) {
      const fn = fnorm(t), cz = (t.p[2] + t.p[5] + t.p[8]) / 3;
      let pieces = [[V(t, 0), V(t, 1), V(t, 2)]], hit = false;
      if (Math.abs(fn[2]) > 0.35 && cz * sideZ > 0.3 && test(t)) for (const H of holes) {
        const xs = [t.p[0], t.p[3], t.p[6]], ys = [t.p[1], t.p[4], t.p[7]], hx = H.map(q => q[0]), hy = H.map(q => q[1]);
        if (Math.max(...xs) < Math.min(...hx) || Math.min(...xs) > Math.max(...hx) || Math.max(...ys) < Math.min(...hy) || Math.min(...ys) > Math.max(...hy)) continue;
        const next = []; for (const pc of pieces) { let rem = pc; for (let i = 0; i < H.length && rem.length >= 3; i++) { const o2 = clip(rem, H[i], H[(i + 1) % H.length], false); if (o2.length >= 3) next.push(o2); rem = clip(rem, H[i], H[(i + 1) % H.length], true); } }
        pieces = next; hit = true;
      }
      if (!hit) { out.push(t); continue; }
      for (const pc of pieces) for (let i = 1; i < pc.length - 1; i++) { const q = [pc[0], pc[i], pc[i + 1]]; const nt = { part: t.part, sub: t.sub, cls: t.cls, p: q.flatMap(v => v.p), n: q.flatMap(v => v.n) };
        const f2 = fnorm(nt); if (Math.hypot(nt.p[3] - nt.p[0], nt.p[4] - nt.p[1]) + Math.hypot(nt.p[6] - nt.p[0], nt.p[7] - nt.p[1]) > 1e-6 && f2.every(Number.isFinite)) out.push(nt); }
    }
    return out;
  }
  const zAt = (list, X, Y, sideZ, pick = 'out') => {   // Z mặt vỏ tại (X, Y) — mặt ngoài cùng (hoặc trong cùng) theo hướng sideZ
    let best = null;
    for (const t of list) { const p = t.p; if (cz0(t) * sideZ < 0.3) continue;
      const d = (p[4] - p[7]) * (p[0] - p[6]) + (p[6] - p[3]) * (p[1] - p[7]); if (Math.abs(d) < 1e-9) continue;
      const l1 = ((p[4] - p[7]) * (X - p[6]) + (p[6] - p[3]) * (Y - p[7])) / d, l2 = ((p[7] - p[1]) * (X - p[6]) + (p[0] - p[6]) * (Y - p[7])) / d, l3 = 1 - l1 - l2;
      if (l1 < -1e-4 || l2 < -1e-4 || l3 < -1e-4) continue; const z = l1 * p[2] + l2 * p[5] + l3 * p[8];
      if (best === null || (pick === 'out' ? z * sideZ > best * sideZ : z * sideZ < best * sideZ)) best = z; }
    return best; };
  const cz0 = t => (t.p[2] + t.p[5] + t.p[8]) / 3;
  const extra = { shell: [], door: [] };
  function windowParts(dst, H, sideZ, outer, inner, glassCls) {
    const H2 = H.map(([x, y]) => [x, y, zAt(outer, x, y, sideZ)]); if (H2.some(q => q[2] === null)) { console.warn('window off-surface', H); return false; }
    const mk = (cls, ps, n) => dst.push({ part: 'win', sub: '', cls, p: ps.flat(), n: [n, n, n].flat() });
    const nOut = [0, 0, sideZ];
    // kính: lùi 1,2 cm vào trong, quạt từ tâm
    const cx = H.reduce((s, q) => s + q[0], 0) / H.length, cy = H.reduce((s, q) => s + q[1], 0) / H.length, cz = zAt(outer, cx, cy, sideZ) ?? H2[0][2];
    for (let i = 0; i < H.length; i++) { const A = H2[i], B = H2[(i + 1) % H.length], C = [cx, cy, cz];
      const tri = [C, A, B].map(q => [q[0], q[1], q[2] - sideZ * 0.012]); if (sideZ < 0) tri.reverse(); mk(glassCls, tri, nOut); }
    // viền cao su: vành rộng 3 cm quanh mép, nổi 4 mm
    const Ho = rr2(H, 0.03);
    for (let i = 0; i < H.length; i++) { const j = (i + 1) % H.length, A = H2[i], B = H2[j], zA = zAt(outer, Ho[i][0], Ho[i][1], sideZ) ?? A[2], zB = zAt(outer, Ho[j][0], Ho[j][1], sideZ) ?? B[2];
      const Ao = [Ho[i][0], Ho[i][1], zA + sideZ * 0.004], Bo = [Ho[j][0], Ho[j][1], zB + sideZ * 0.004], Ai = [A[0], A[1], A[2] + sideZ * 0.004], Bi = [B[0], B[1], B[2] + sideZ * 0.004];
      const q1 = [Ai, Ao, Bo], q2 = [Ai, Bo, Bi]; if (sideZ < 0) { q1.reverse(); q2.reverse(); } mk('black', q1, nOut); mk('black', q2, nOut); }
    // má cửa sổ: nối mép lỗ vỏ ngoài với vỏ trong (hoặc sâu 5 cm nếu không có vỏ trong)
    for (let i = 0; i < H.length; i++) { const j = (i + 1) % H.length, A = H2[i], B = H2[j];
      const zi = q => { const z = inner ? zAt(inner, q[0], q[1], sideZ) : null; return z === null || Math.abs(z - q[2]) > 0.15 ? q[2] - sideZ * 0.05 : z; };
      const Ai = [A[0], A[1], zi(A)], Bi = [B[0], B[1], zi(B)], ex = B[0] - A[0], ey = B[1] - A[1], l = Math.hypot(ex, ey) || 1, nn = [-ey / l, ex / l, 0];   // pháp tuyến hướng vào lỗ
      const q1 = [A, B, Bi], q2 = [A, Bi, Ai]; if (sideZ < 0) { q1.reverse(); q2.reverse(); } mk('paint', q1, nn); mk('paint', q2, nn); }
    return true;
  }
  const rr2 = (H, d) => {   // dời từng điểm vành tròn ra ngoài d (theo pháp tuyến góc)
    const n = H.length; return H.map((q, i) => { const A = H[(i - 1 + n) % n], B = H[(i + 1) % n], tx = B[0] - A[0], ty = B[1] - A[1], l = Math.hypot(tx, ty) || 1; return [q[0] + ty / l * d, q[1] - tx / l * d]; }); };
  // cửa sổ nhà xe (đv xe): vách −z trên giường, trên bàn học, phòng tắm (kính mờ; cửa lùa GLB dài 1,74 khi mở che kín đoạn X 0,9 … 2,65 vách +z nên dời sang −z)
  const WIN = o.win || { 1: [], [-1]: [{ H: rr(-0.30, 1.86, 1.22, 2.46) }, { H: rr(1.52, 1.98, 2.16, 2.46) }, { H: rr(2.42, 2.04, 2.82, 2.44), frost: true }] };
  const isOuter = t => t.part === 'body', isInner = t => t.part === 'boot_side';
  for (const s of [1, -1]) {
    const outerL = tris.shell.filter(isOuter), innerL = tris.shell.filter(isInner);
    for (const w of WIN[s]) windowParts(extra.shell, w.H, s, outerL, innerL, w.frost ? 'frost' : 'glass');
    if (WIN[s].length) tris.shell = cutHoles(tris.shell, WIN[s].map(w => w.H), s, t => t.cls === 'paint' || t.cls === 'trim');
  }
  // cửa lùa (đóng): mép trước/sau → cửa sổ cách mép trước 0,2, mép sau 0,28
  let dX0 = 9, dX1 = -9; for (const t of tris.door) for (let k = 0; k < 3; k++) { dX0 = Math.min(dX0, t.p[k * 3]); dX1 = Math.max(dX1, t.p[k * 3]); }
  const DW = rr(dX0 + 0.2, 1.86, dX1 - 0.28, 2.46);
  { const outerL = tris.door.filter(t => t.sub === 'Object_132'), innerL = tris.door.filter(t => t.cls === 'trim'); windowParts(extra.door, DW, 1, outerL, innerL, 'glass');
    tris.door = cutHoles(tris.door, [DW], 1, t => t.cls === 'paint' || t.cls === 'trim' || t.cls === 'black'); }
  tris.shell.push(...extra.shell); tris.door.push(...extra.door);
  // ---- 5. vị trí cửa lùa mở: mép trước cửa tới mép sau ô cửa (+2 cm); đẩy ra ngoài vừa đủ không chạm vỏ ----
  const OPEN_X1 = 0.0272 + 1.1 * (0.33 + STR), dX = OPEN_X1 + 0.02 - dX0;
  const WP = { xf: MX(1.955), xr: MX(-1.365), y: 0.44, z: 1.1 * wc.x, r: 0.44, hw: 1.1 * KW * (wb.max.x - wb.min.x) / 2 };
  // cửa thật mở ra ngoài ~dZ; mép gập trong của tấm cửa (sâu ~15 cm) chỗ nào lấn vào vỏ / ray / ốp / lốp thì ép phẳng ra sát mặt đó (khuất sau tấm cửa)
  const dZ = o.doorDZ ?? 0.085; let flat = 0;
  { const CL = new Set(['body', 'Rail', 'Molding03', 'fender', 'Black10', 'frame', 'skirt']), outerL = tris.shell.filter(t => CL.has(t.part) && cz0(t) > 0.3), memo = new Map();
    for (const t of tris.door) for (let k = 0; k < 3; k++) { const X = t.p[k * 3] + dX, Y = t.p[k * 3 + 1]; if (X < OPEN_X1 + 0.03) continue;
      const key = X.toFixed(4) + ',' + Y.toFixed(4); let zb = memo.get(key); if (zb === undefined) { zb = zAt(outerL, X, Y, 1); if (Math.abs(X - WP.xr) < WP.r && Y < WP.y + WP.r + 0.01) zb = Math.max(zb ?? -9, WP.z + WP.hw); memo.set(key, zb); }
      if (zb !== null && t.p[k * 3 + 2] + dZ < zb + 0.006) { t.p[k * 3 + 2] = zb + 0.006 - dZ; flat++; } } }
  const dZwhy = flat + ' đỉnh ép phẳng';
  window.__van = { tris, wheel, door: { dX, dZ, dZwhy, x0: dX0, x1: dX1 }, wheelPos: WP, stats: Object.fromEntries(Object.entries(tris).map(([k, v]) => [k, v.length])) };
  return { ...window.__van.stats, wheel: wheel.length, door: window.__van.door, wheelPos: window.__van.wheelPos };
};
window.vanbuildReady = true;
