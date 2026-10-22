// Bồn cầu + kệ treo ấm trà cho xe 3d-garden (G 20/10 "lấy từ glb file và add những item này vào": tinylivingpack.glb). Mẫu gốc ghi CC-BY của Irene
// nhưng lưới là đồ tách từ The Sims 4 (tên lưới s4studio_mesh) ⇒ CHỈ ĐO (luật của dự án): kích thước + màu lấy từ hình chiếu thẳng có lưới 10 cm
// (CompactLavatory · OpenShelf), hình dựng lại hoàn toàn bằng khối của mình (lăng trụ chữ nhật bo góc côn, vành nắp đùn, hộp, tiện tròn). Không chép đỉnh / ảnh.
//   lav   — bồn cầu, gốc = giữa đáy sát sàn, mặt trước −X, két +X, bề ngang Z. Bệ côn: mặt trên 0,41 × 0,38 → sàn 0,29 × 0,24; mặt ngồi 0,465; két cao 0,72.
//           Mẫu sâu 0,74 (có ống nối dài + tấm vách) — rút còn 0,59 (két sát sau bệ) cho vừa buồng tắm (rèm cách vách 0,65).
//   lid   — nắp bồn cầu, gốc = bản lề (mép sau, mặt dưới), nằm úp về −X (0,40 × 0,36 × 0,025) — xe xoay quanh Z để mở.
//   shelf — kệ treo 2 tầng: ván lưng + tờ ghi chú, 2 tầng ván 0,85 × 0,30, dây treo chéo + dây đứng có tua, ấm đun xanh ngọc, sách + hộp bánh + hũ + hộp trà.
//           Mẫu cao 0,73 (tầng dưới → đỉnh ván lưng) + tấm lót nồi treo; tường bếp dưới mui chỉ còn 0,55 ⇒ giãn tầng thu lại (cao 0,55), bỏ tấm lót nồi.
//           Gốc = giữa mép sau đáy tầng dưới, lưng áp vách ở z = 0, mặt trước +Z.
// tlBuild() → window.__tl · tlWrite() → shots/tinyliving.glb (KHR_mesh_quantization + EXT_meshopt_compression, màu đỉnh).
window.tlBuild = async () => {
  const THREE = await import('https://esm.sh/three@0.160.0'), BGU = await import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js');
  const mo = await import('https://esm.sh/meshoptimizer@0.21.0'); window.MSE = mo.MeshoptEncoder; await mo.MeshoptEncoder.ready;
  const lin = h => new THREE.Color(h);   // chuỗi '#rrggbb' sRGB → tuyến tính (quản lý màu bật)
  const paint = (g, hex) => { g = g.index ? g.toNonIndexed() : g; g.deleteAttribute('uv'); const c = lin(hex), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); if (!g.attributes.normal) g.computeVertexNormals(); return g; };
  const box = (w, h, d, x, y, z, hex, ry = 0, rz = 0, rx = 0) => { const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); return paint(g, hex); };
  const cyl = (r0, r1, a, b, hex, seg = 6) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B), g = new THREE.CylinderGeometry(r1, r0, L, seg, 1, false);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize())); g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2); return paint(g, hex); };
  // hình chữ nhật bo góc (x0..x1, z0..z1, bán kính r, n điểm / góc) — ngược chiều kim đồng hồ nhìn từ trên
  const rr = (x0, x1, z0, z1, r, n = 4) => { const P = [], C = [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, Math.PI / 2], [x0 + r, z0 + r, Math.PI], [x1 - r, z0 + r, 1.5 * Math.PI]];
    for (const [cx, cz, a0] of C) for (let k = 0; k <= n; k++) { const a = a0 + k / n * Math.PI / 2; P.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); } return P; };
  // lăng trụ côn giữa 2 viền cùng số điểm (dưới y0, trên y1) + nắp trên / dưới
  const loft = (B, Tp, y0, y1, hex, top = true, bot = true) => { const pos = [], idx = [], n = B.length;
    for (const [x, z] of B) pos.push(x, y0, z); for (const [x, z] of Tp) pos.push(x, y1, z);
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; idx.push(i, n + j, j, i, n + i, n + j); }   // mặt bên quay ra ngoài
    const cB = (B.reduce((s, p) => [s[0] + p[0], s[1] + p[1]], [0, 0])).map(v => v / n), cT = (Tp.reduce((s, p) => [s[0] + p[0], s[1] + p[1]], [0, 0])).map(v => v / n);
    if (bot) { const c = pos.length / 3; pos.push(cB[0], y0, cB[1]); for (let i = 0; i < n; i++) idx.push(c, i, (i + 1) % n); }
    if (top) { const c = pos.length / 3; pos.push(cT[0], y1, cT[1]); for (let i = 0; i < n; i++) idx.push(c, n + (i + 1) % n, n + i); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return paint(BGU.toCreasedNormals(g.toNonIndexed(), 0.6), hex); };
  // vành / tấm đùn từ viền (có lỗ) — nằm ngang, dày t, mặt dưới ở y
  const slab = (O, H, y, t, hex) => { const s = new THREE.Shape(O.map(([x, z]) => new THREE.Vector2(x, -z))); if (H) s.holes.push(new THREE.Path(H.map(([x, z]) => new THREE.Vector2(x, -z)).reverse()));
    const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 4 }); g.rotateX(-Math.PI / 2); g.translate(0, y + 0.004, 0); return paint(BGU.toCreasedNormals(g, 0.6), hex); };
  const CREAM = '#e6d6b6', SEAT = '#eadcbf', INNER = '#a39578', CHROME = '#b9bdc1';
  const out = {};
  // ---- BỒN CẦU ----
  {
    const P = [];
    const top = rr(-0.37, 0.04, -0.19, 0.19, 0.075), bot = rr(-0.29, 0.0, -0.12, 0.12, 0.045);
    P.push(loft(bot, top, 0, 0.445, CREAM, false, true));                       // bệ côn
    const inT = rr(-0.33, 0.0, -0.135, 0.135, 0.09), inB = rr(-0.27, -0.06, -0.08, 0.08, 0.06);
    P.push(loft(inB, inT, 0.33, 0.446, INNER, false, true));                    // lòng bồn (thấy qua lỗ vành)
    P.push(slab(rr(-0.367, 0.037, -0.187, 0.187, 0.072), rr(-0.325, -0.005, -0.13, 0.13, 0.085), 0.445, 0.012, SEAT));   // vành ngồi
    P.push(loft(rr(0.025, 0.22, -0.18, 0.18, 0.035), rr(0.025, 0.22, -0.18, 0.18, 0.035), 0.215, 0.70, CREAM));            // két + khối nối sau bệ
    P.push(slab(rr(0.018, 0.228, -0.188, 0.188, 0.035), null, 0.70, 0.012, SEAT));                                         // nắp két
    P.push(cyl(0.022, 0.022, [0.12, 0.716, 0], [0.12, 0.728, 0], CHROME, 12));                                            // nút xả
    out.lav = BGU.mergeGeometries(P);
    out.lid = slab(rr(-0.39, 0, -0.18, 0.18, 0.07), null, 0, 0.017, SEAT);      // nắp, bản lề ở x 0 (xe đặt bản lề trước mặt két 0,03 ⇒ nắp dựng không xuyên két)
  }
  // ---- KỆ TREO ẤM TRÀ ----
  {
    const P = [], WOOD = '#c48c55', WOODK = '#a8743f', ROPE = '#4a2e1c', W = 0.85, D = 0.30;
    P.push(box(W, 0.03, D, 0, 0.015, D / 2, WOOD));                                 // tầng dưới
    P.push(box(W, 0.03, D, 0, 0.295, D / 2, WOOD));                                 // tầng trên
    P.push(box(W, 0.09, 0.022, 0, 0.505, 0.011, WOODK));                            // ván lưng
    for (const s of [-1, 1]) {
      const x = s * 0.405;
      P.push(box(0.03, 0.05, 0.03, s * 0.41, 0.49, 0.03, '#2b2420'));              // móc treo đầu ván lưng
      P.push(cyl(0.007, 0.007, [x, 0.5, 0.03], [x, 0.31, D - 0.015], ROPE));        // dây chéo: ván lưng → góc trước tầng trên
      P.push(cyl(0.008, 0.008, [x, 0.31, D - 0.015], [x, -0.06, D - 0.015], ROPE)); // dây đứng phía trước (xuyên 2 tầng)
      P.push(cyl(0.008, 0.008, [x, 0.46, 0.02], [x, -0.06, 0.02], ROPE));          // dây đứng phía sau
      for (const z of [0.02, D - 0.015]) P.push(cyl(0.016, 0.004, [x, -0.06, z], [x, -0.12, z], ROPE));   // tua dây
    }
    // tờ ghi chú xanh nhạt treo trên ván lưng + dòng chữ vẽ tay
    P.push(box(0.19, 0.2, 0.003, -0.12, 0.43, 0.024, '#c7dbe8'));
    for (let k = 0; k < 6; k++) P.push(box(0.12 - (k % 3) * 0.025, 0.006, 0.002, -0.12 - (k % 2) * 0.01, 0.49 - k * 0.026, 0.027, '#6d86b3'));
    // ấm đun xanh ngọc trên tầng trên: thân tiện tròn, núm nắp, vòi, quai cong
    { const prof = [[0, 0], [0.075, 0], [0.09, 0.025], [0.09, 0.06], [0.072, 0.09], [0.042, 0.106], [0.03, 0.11], [0, 0.112]].map(([x, y]) => new THREE.Vector2(x, y));
      const g = new THREE.LatheGeometry(prof, 14); g.translate(-0.22, 0.31, 0.15); P.push(paint(g, '#2bb0b6'));
      P.push(paint(new THREE.SphereGeometry(0.014, 8, 6).translate(-0.22, 0.428, 0.15), '#1f7f84'));
      P.push(cyl(0.014, 0.008, [-0.15, 0.36, 0.15], [-0.105, 0.41, 0.15], '#2bb0b6'));
      const hg = new THREE.TorusGeometry(0.06, 0.006, 5, 12, Math.PI); hg.translate(-0.22, 0.4, 0.15); P.push(paint(hg, '#262626')); }
    // tầng dưới (mặt ván y 0,03): sách đỏ, sách xanh lá, hộp bánh quy nâu, hũ hổ phách, hộp trà xanh ngọc, hộp thiếc xanh rêu
    P.push(box(0.022, 0.2, 0.15, -0.385, 0.13, 0.1, '#c0392b'), box(0.02, 0.21, 0.15, -0.36, 0.135, 0.1, '#3fa16a'));
    P.push(box(0.17, 0.23, 0.15, -0.255, 0.145, 0.1, '#4a3226'), box(0.1, 0.03, 0.002, -0.255, 0.2, 0.176, '#e7b93c'), box(0.06, 0.06, 0.002, -0.255, 0.12, 0.176, '#d38b2e'));
    P.push(box(0.13, 0.16, 0.13, -0.075, 0.11, 0.1, '#d98e1f'), box(0.132, 0.05, 0.132, -0.075, 0.1, 0.1, '#efe2bf'));
    P.push(box(0.09, 0.09, 0.09, 0.085, 0.075, 0.1, '#2e9c8f'), box(0.035, 0.035, 0.002, 0.085, 0.075, 0.146, '#f2f2ee'));
    P.push(box(0.15, 0.07, 0.12, 0.27, 0.065, 0.1, '#3d6b35'), box(0.152, 0.02, 0.122, 0.27, 0.065, 0.1, '#e9dcb4'));
    out.shelf = BGU.mergeGeometries(P);
  }
  window.__tl = out;
  return Object.fromEntries(Object.entries(out).map(([k, g]) => [k, g.attributes.position.count / 3]));
};
window.tlWrite = async () => {
  const ENC = window.MSE, O = window.__tl, THREE = await import('https://esm.sh/three@0.160.0'), BGU = await import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js');
  const J = { asset: { version: '2.0', generator: '3d-garden tlbuild', extras: { title: 'Compact lavatory + open shelf (measured from TinyLivingPack, rebuilt)', note: 'Own geometry built from primitives; only dimensions and colours measured from the reference model' } },
    extensionsUsed: ['EXT_meshopt_compression', 'KHR_mesh_quantization'], extensionsRequired: ['EXT_meshopt_compression', 'KHR_mesh_quantization'],
    scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [], materials: [{ name: 'm', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.85 } }] };
  const bin = [], al = x => (x + 3) & ~3; let binLen = 0, fbLen = 0;
  const push = u8 => { const off = binLen; bin.push(u8); binLen += u8.length; const pad = al(binLen) - binLen; if (pad) { bin.push(new Uint8Array(pad)); binLen += pad; } return off; };
  const view = (u8, count, stride, mode, target) => { const enc = mode === 'TRIANGLES' ? ENC.encodeIndexBuffer(u8, count, stride) : ENC.encodeVertexBuffer(u8, count, stride), off = push(enc), fb = fbLen; fbLen += al(u8.length);
    J.bufferViews.push({ buffer: 1, byteOffset: fb, byteLength: u8.length, ...(mode === 'ATTRIBUTES' ? { byteStride: stride } : {}), target, extensions: { EXT_meshopt_compression: { buffer: 0, byteOffset: off, byteLength: enc.length, byteStride: stride, count, mode } } });
    return J.bufferViews.length - 1; };
  const acc = a => { J.accessors.push(a); return J.accessors.length - 1; };
  const res = {};
  for (const name of ['lav', 'lid', 'shelf']) {
    const g = BGU.mergeVertices(O[name], 1e-5), P = g.attributes.position, N = g.attributes.normal, C = g.attributes.color, n = P.count, I32 = new Uint32Array(g.index.array);
    const [remap, m] = ENC.reorderMesh(I32, true, true), p = new Float32Array(m * 3), nn = new Float32Array(m * 3), c = new Float32Array(m * 3);
    for (let i = 0; i < n; i++) { const r = remap[i]; if (r === 0xffffffff) continue; for (let a = 0; a < 3; a++) { p[r * 3 + a] = P.array[i * 3 + a]; nn[r * 3 + a] = N.array[i * 3 + a]; c[r * 3 + a] = C.array[i * 3 + a]; } }
    const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (let i = 0; i < m; i++) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], p[i * 3 + a]); mx[a] = Math.max(mx[a], p[i * 3 + a]); }
    const ctr = mn.map((v, a) => (v + mx[a]) / 2), half = Math.max(1e-4, ...mn.map((v, a) => (mx[a] - v) / 2)), qp = new Int16Array(m * 4), qn = new Int8Array(m * 4), qc = new Uint8Array(m * 4), pmn = [32767, 32767, 32767], pmx = [-32767, -32767, -32767];
    for (let i = 0; i < m; i++) { for (let a = 0; a < 3; a++) { const q = Math.round((p[i * 3 + a] - ctr[a]) / half * 32767); qp[i * 4 + a] = q; pmn[a] = Math.min(pmn[a], q); pmx[a] = Math.max(pmx[a], q);
      qn[i * 4 + a] = Math.round(Math.max(-1, Math.min(1, nn[i * 3 + a])) * 127); qc[i * 4 + a] = Math.round(Math.max(0, Math.min(1, c[i * 3 + a])) * 255); } qc[i * 4 + 3] = 255; }
    const I16 = m < 65536 ? new Uint16Array(I32) : I32;
    J.meshes.push({ name, primitives: [{ attributes: {
      POSITION: acc({ bufferView: view(new Uint8Array(qp.buffer), m, 8, 'ATTRIBUTES', 34962), componentType: 5122, normalized: true, count: m, type: 'VEC3', min: pmn, max: pmx }),
      NORMAL: acc({ bufferView: view(new Uint8Array(qn.buffer), m, 4, 'ATTRIBUTES', 34962), componentType: 5120, normalized: true, count: m, type: 'VEC3' }),
      COLOR_0: acc({ bufferView: view(qc, m, 4, 'ATTRIBUTES', 34962), componentType: 5121, normalized: true, count: m, type: 'VEC4' }) },
      indices: acc({ bufferView: view(new Uint8Array(I16.buffer), I16.length, I16.BYTES_PER_ELEMENT, 'TRIANGLES', 34963), componentType: I16.BYTES_PER_ELEMENT === 2 ? 5123 : 5125, count: I16.length, type: 'SCALAR' }), material: 0 }] });
    J.nodes.push({ name, children: [J.nodes.length + 1] }, { name: name + '_q', mesh: J.meshes.length - 1, translation: ctr, scale: [half, half, half] }); J.scenes[0].nodes.push(J.nodes.length - 2);
    res[name] = { verts: m, tris: I16.length / 3 };
  }
  J.buffers.push({ byteLength: binLen }, { byteLength: fbLen, extensions: { EXT_meshopt_compression: { fallback: true } } });
  const js = new TextEncoder().encode(JSON.stringify(J)), jl = al(js.length), total = 28 + jl + binLen, u = new Uint8Array(total), dv = new DataView(u.buffer);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true); dv.setUint32(12, jl, true); dv.setUint32(16, 0x4E4F534A, true); u.set(js, 20); for (let i = js.length; i < jl; i++) u[20 + i] = 0x20;
  let off = 20 + jl; dv.setUint32(off, binLen, true); dv.setUint32(off + 4, 0x004E4942, true); off += 8; for (const b of bin) { u.set(b, off); off += b.length; }
  await fetch('/upload?name=tinyliving.glb', { method: 'POST', body: new Blob([u]) }); res.bytes = total; return res;
};
window.tlbuildReady = true;
