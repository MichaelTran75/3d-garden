// Kính thiên văn + thiên hà mini cho buổi ngắm sao của 3d-garden (G 19/10). Chạy trong 1 trang của devserver (vd treeview.html), mẫu gốc mỗi cái 1 thư mục riêng.
//   "Telescope" (sieminskaola, CC-BY-4.0): 2 lưới 9,6k tam giác — lưới ảnh màu (ánh sáng nướng sẵn, unlit) + 1 VỎ VIỀN ĐEN phồng ra (viền kiểu hoạt hình) ⇒ bỏ vỏ viền;
//     màu ảnh (1024², sRGB) lấy mẫu 3 × 3 tại UV từng đỉnh → màu đỉnh tuyến tính, hàn đỉnh theo vị trí, giảm lưới meshoptimizer, pháp tuyến gãy 52° (chân
//     ba càng tròn mịn, mặt đáy gãy). Đơn vị mét như mẫu (cao 1,40 m). Điểm neo trong extras: base (tâm chân trên đất), back (đuôi ống — chỗ thị kính),
//     front (miệng ống kính vật), axis (trục ống, về phía kính vật).
//   "Need some space?" (Loïc Norgeot, CC-BY-4.0): đám 50k điểm màu (POINTS) ⇒ tâm = đỉnh mật độ (dời trung bình 6 vòng), mặt đĩa = PCA (trục phương sai nhỏ
//     nhất → +Y), bán kính 90% điểm = 1, giữ n điểm (ngẫu nhiên có hạt giống), vị trí int16 + màu uint8.
//   skyBuild({ tele, gal, n, ratio, err }) → window.__sky · skyWrite() → shots/telescope.glb + shots/galaxy.glb (KHR_mesh_quantization + EXT_meshopt_compression).
window.skyBuild = async (o = {}) => {
  const THREE = await import('https://esm.sh/three@0.160.0'), { GLTFLoader } = await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js');
  const BGU = await import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js'), mo = await import('https://esm.sh/meshoptimizer@0.21.0');
  const MS = mo.MeshoptSimplifier; await MS.ready; window.MSE = mo.MeshoptEncoder; await mo.MeshoptEncoder.ready;
  const ld = new GLTFLoader(), out = {};
  // ---- kính thiên văn ----
  {
    const gl = await ld.loadAsync(o.tele || '/telescope-2-glb/telescope-2.glb'), R = gl.scene; R.updateMatrixWorld(true);
    let m = null; R.traverse(x => { if (x.isMesh && x.material.map && !m) m = x; });   // lưới có ảnh màu (vỏ viền đen không có ảnh)
    const img = m.material.map.image, cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0); const px = cx.getImageData(0, 0, cv.width, cv.height).data, W = cv.width, H = cv.height;
    const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const samp = (u, v) => { u -= Math.floor(u); v -= Math.floor(v); const x0 = Math.round(u * W), y0 = Math.round(v * H), s = [0, 0, 0]; let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = Math.min(W - 1, Math.max(0, x0 + dx)), y = Math.min(H - 1, Math.max(0, y0 + dy)), i = (y * W + x) * 4; s[0] += lin(px[i]); s[1] += lin(px[i + 1]); s[2] += lin(px[i + 2]); n++; }
      return s.map(c => c / n); };
    const g = m.geometry, pa = g.attributes.position, uv = g.attributes.uv, v = new THREE.Vector3(), key = new Map(), P = [], C = [], cnt = [], remap = new Uint32Array(pa.count);
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld); const k = Math.round(v.x * 5e3) + ',' + Math.round(v.y * 5e3) + ',' + Math.round(v.z * 5e3);
      let id = key.get(k); if (id === undefined) { id = P.length / 3; key.set(k, id); P.push(v.x, v.y, v.z); C.push(0, 0, 0); cnt.push(0); } remap[i] = id;
      const c = samp(uv.getX(i), uv.getY(i)); C[id * 3] += c[0]; C[id * 3 + 1] += c[1]; C[id * 3 + 2] += c[2]; cnt[id]++;
    }
    for (let i = 0; i < cnt.length; i++) for (let a = 0; a < 3; a++) C[i * 3 + a] /= cnt[i];
    const src = g.index ? g.index.array : Uint32Array.from({ length: pa.count }, (_, i) => i), idx = [], seen = new Set();
    for (let t = 0; t < src.length; t += 3) { const a = remap[src[t]], b = remap[src[t + 1]], c = remap[src[t + 2]]; if (a === b || b === c || a === c) continue; const s = [a, b, c].sort((x, y) => x - y).join(','); if (seen.has(s)) continue; seen.add(s); idx.push(a, b, c); }
    const tris0 = idx.length / 3, want = Math.round(tris0 * (o.ratio ?? 0.4)) * 3;
    const [I] = MS.simplify(new Uint32Array(idx), new Float32Array(P), 3, want, o.err ?? 0.004, []);
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g2.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g2.setIndex(Array.from(I));
    const g3 = BGU.mergeVertices(BGU.toCreasedNormals(g2, o.crease ?? 0.9), 1e-6);
    // điểm neo: chân = tâm 3 đầu chân ở đáy; ống = các đỉnh cao > 0,95 m ⇒ PCA lấy trục; 2 đầu ống theo trục
    const p3 = g3.attributes.position, pts = []; for (let i = 0; i < p3.count; i++) pts.push(new THREE.Vector3().fromBufferAttribute(p3, i));
    const foot = pts.filter(p => p.y < 0.03), base = foot.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(Math.max(1, foot.length)); base.y = 0;
    const tube = pts.filter(p => p.y > 0.95), ctr = tube.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(tube.length);
    const cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (const p of tube) { const d = [p.x - ctr.x, p.y - ctr.y, p.z - ctr.z]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) cov[a][b] += d[a] * d[b]; }
    let ax = new THREE.Vector3(0.3, 0.6, -0.7).normalize(); for (let it = 0; it < 60; it++) { const a = [ax.x, ax.y, ax.z]; ax.set(...[0, 1, 2].map(r => cov[r][0] * a[0] + cov[r][1] * a[1] + cov[r][2] * a[2])).normalize(); }   // lặp lũy thừa: trục phương sai lớn nhất
    if (ax.y < 0) ax.negate();   // về phía kính vật (đầu cao)
    let lo = 1e9, hi = -1e9; for (const p of tube) { const s = p.clone().sub(ctr).dot(ax); lo = Math.min(lo, s); hi = Math.max(hi, s); }
    const end = s0 => { const L = tube.filter(p => Math.abs(p.clone().sub(ctr).dot(ax) - s0) < 0.05); return L.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(Math.max(1, L.length)); };
    const r = x => +x.toFixed(4);
    out.tele = { P: Array.from(p3.array), N: Array.from(g3.attributes.normal.array), C: Array.from(g3.attributes.color.array), I: Array.from(g3.index.array), tris0, tris: g3.index.count / 3,
      anchors: { base: base.toArray().map(r), back: end(lo).toArray().map(r), front: end(hi).toArray().map(r), axis: ax.toArray().map(r), top: r(Math.max(...pts.map(p => p.y))) } };
  }
  // ---- thiên hà ----
  {
    const gl = await ld.loadAsync(o.gal || '/galaxy-glb/galaxy.glb'), R = gl.scene; R.updateMatrixWorld(true);
    let m = null; R.traverse(x => { if (x.isPoints && !m) m = x; });
    const pa = m.geometry.attributes.position, ca = m.geometry.attributes.color, N0 = pa.count, v = new THREE.Vector3(), P = new Float32Array(N0 * 3);
    for (let i = 0; i < N0; i++) { v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld); P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z; }
    const med = a => { const s = Array.from({ length: N0 }, (_, i) => P[i * 3 + a]).sort((x, y) => x - y); return s[N0 >> 1]; };
    const c = new THREE.Vector3(med(0), med(1), med(2));
    let rad = 0; { const d = []; for (let i = 0; i < N0; i++) d.push(Math.hypot(P[i * 3] - c.x, P[i * 3 + 1] - c.y, P[i * 3 + 2] - c.z)); d.sort((x, y) => x - y); rad = d[(N0 * 0.5) | 0]; }
    for (let it = 0, r0 = rad * 0.5; it < 6; it++, r0 *= 0.7) { const s = new THREE.Vector3(); let n = 0; for (let i = 0; i < N0; i++) { const dx = P[i * 3] - c.x, dy = P[i * 3 + 1] - c.y, dz = P[i * 3 + 2] - c.z; if (dx * dx + dy * dy + dz * dz < r0 * r0) { s.x += P[i * 3]; s.y += P[i * 3 + 1]; s.z += P[i * 3 + 2]; n++; } } if (n > 50) c.copy(s.divideScalar(n)); }   // dời trung bình về lõi sáng
    const cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (let i = 0; i < N0; i++) { const d = [P[i * 3] - c.x, P[i * 3 + 1] - c.y, P[i * 3 + 2] - c.z]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) cov[a][b] += d[a] * d[b]; }
    // trục phương sai nhỏ nhất: lặp lũy thừa trên (tr·1 − cov)
    const tr = cov[0][0] + cov[1][1] + cov[2][2], M = cov.map((row, a) => row.map((x, b) => (a === b ? tr : 0) - x));
    let nrm = new THREE.Vector3(0, 1, 0.1).normalize(); for (let it = 0; it < 80; it++) { const a = [nrm.x, nrm.y, nrm.z]; nrm.set(...[0, 1, 2].map(r => M[r][0] * a[0] + M[r][1] * a[1] + M[r][2] * a[2])).normalize(); }
    if (nrm.y < 0) nrm.negate();
    const q = new THREE.Quaternion().setFromUnitVectors(nrm, new THREE.Vector3(0, 1, 0)), D = [];
    for (let i = 0; i < N0; i++) { v.set(P[i * 3] - c.x, P[i * 3 + 1] - c.y, P[i * 3 + 2] - c.z).applyQuaternion(q); P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z; D.push(Math.hypot(v.x, v.z)); }
    const R90 = D.slice().sort((x, y) => x - y)[(N0 * 0.9) | 0];
    let a = 0x9e3779b9; const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let z = Math.imul(a ^ a >>> 15, 1 | a); z = (z + Math.imul(z ^ z >>> 7, 61 | z)) ^ z; return ((z ^ z >>> 14) >>> 0) / 4294967296; };
    const n = o.n ?? 10000, keep = [];
    for (let i = 0; i < N0; i++) if (D[i] < R90 * 1.6 && rnd() < n / N0 * 1.04) keep.push(i);
    const mort = i => { let k = 0; for (let b = 9; b >= 0; b--) for (let a2 = 0; a2 < 3; a2++) k = k * 2 + ((Math.min(1023, Math.max(0, Math.round((P[i * 3 + a2] / R90 / 3.2 + 0.5) * 1023))) >> b) & 1); return k; };
    const ks = keep.slice(0, n), mk = new Map(ks.map(i => [i, mort(i)])); ks.sort((x, y) => mk.get(x) - mk.get(y));   // thứ tự Morton: điểm gần nhau đứng cạnh nhau ⇒ nén meshopt tốt hơn nhiều
    const Pq = [], Cq = []; for (const i of ks) { Pq.push(P[i * 3] / R90, P[i * 3 + 1] / R90, P[i * 3 + 2] / R90); Cq.push(ca.getX(i), ca.getY(i), ca.getZ(i)); }
    out.gal = { P: Pq, C: Cq, n: Pq.length / 3, R90: +R90.toFixed(4) };
  }
  window.__sky = out;
  return { tele: { tris0: out.tele.tris0, tris: out.tele.tris, verts: out.tele.P.length / 3, anchors: out.tele.anchors }, gal: { n: out.gal.n, R90: out.gal.R90 } };
};
window.skyWrite = async () => {
  const ENC = window.MSE, S = window.__sky, res = {};
  const glb = (J, bin, binLen) => { const al = x => (x + 3) & ~3, js = new TextEncoder().encode(JSON.stringify(J)), jl = al(js.length), total = 28 + jl + binLen, u = new Uint8Array(total), dv = new DataView(u.buffer);
    dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true); dv.setUint32(12, jl, true); dv.setUint32(16, 0x4E4F534A, true); u.set(js, 20); for (let i = js.length; i < jl; i++) u[20 + i] = 0x20;
    let off = 20 + jl; dv.setUint32(off, binLen, true); dv.setUint32(off + 4, 0x004E4942, true); off += 8; for (const b of bin) { u.set(b, off); off += b.length; } return u; };
  function start(extras) {
    const J = { asset: { version: '2.0', generator: '3d-garden skybuild', extras }, extensionsUsed: ['EXT_meshopt_compression', 'KHR_mesh_quantization'], extensionsRequired: ['EXT_meshopt_compression', 'KHR_mesh_quantization'],
      scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [], materials: [{ name: 'm', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.8 } }] };
    const bin = [], al = x => (x + 3) & ~3; let binLen = 0, fbLen = 0;
    const push = u8 => { const off = binLen; bin.push(u8); binLen += u8.length; const pad = al(binLen) - binLen; if (pad) { bin.push(new Uint8Array(pad)); binLen += pad; } return off; };
    const view = (u8, count, stride, mode, target) => { const enc = mode === 'TRIANGLES' ? ENC.encodeIndexBuffer(u8, count, stride) : ENC.encodeVertexBuffer(u8, count, stride), off = push(enc), fb = fbLen; fbLen += al(u8.length);
      J.bufferViews.push({ buffer: 1, byteOffset: fb, byteLength: u8.length, ...(mode === 'ATTRIBUTES' ? { byteStride: stride } : {}), target, extensions: { EXT_meshopt_compression: { buffer: 0, byteOffset: off, byteLength: enc.length, byteStride: stride, count, mode } } });
      return J.bufferViews.length - 1; };
    const acc = a => { J.accessors.push(a); return J.accessors.length - 1; };
    const quant = (P, n) => {   // int16 chuẩn hoá quanh tâm hộp, phép đổi về đơn vị gốc nằm ở nút
      const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], P[i * 3 + a]); mx[a] = Math.max(mx[a], P[i * 3 + a]); }
      const ctr = mn.map((x, a) => (x + mx[a]) / 2), half = Math.max(1e-4, ...mn.map((x, a) => (mx[a] - x) / 2)), qp = new Int16Array(n * 4), pmn = [32767, 32767, 32767], pmx = [-32767, -32767, -32767];
      for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) { const q = Math.round((P[i * 3 + a] - ctr[a]) / half * 32767); qp[i * 4 + a] = q; pmn[a] = Math.min(pmn[a], q); pmx[a] = Math.max(pmx[a], q); }
      return { qp, ctr, half, pmn, pmx };
    };
    const col8 = (C, n) => { const qc = new Uint8Array(n * 4); for (let i = 0; i < n; i++) { for (let a = 0; a < 3; a++) qc[i * 4 + a] = Math.round(Math.max(0, Math.min(1, C[i * 3 + a])) * 255); qc[i * 4 + 3] = 255; } return qc; };
    const finish = () => { J.buffers.push({ byteLength: binLen }, { byteLength: fbLen, extensions: { EXT_meshopt_compression: { fallback: true } } }); return glb(J, bin, binLen); };
    return { J, view, acc, quant, col8, finish };
  }
  // kính thiên văn: lưới tam giác, màu đỉnh
  {
    const T = S.tele, W = start({ title: 'Telescope', author: 'sieminskaola (https://sketchfab.com/sieminskaola)', license: 'CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)',
      source: 'https://sketchfab.com/3d-models/telescope-fd6863dd22874707b99b00af620fdfcc', note: 'Modified: outline shell removed, texture baked to vertex colours, decimated, compressed' });
    const n0 = T.P.length / 3, I32 = new Uint32Array(T.I), [remap, n] = ENC.reorderMesh(I32, true, true);
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3);
    for (let i = 0; i < n0; i++) { const r = remap[i]; if (r === 0xffffffff) continue; for (let a = 0; a < 3; a++) { P[r * 3 + a] = T.P[i * 3 + a]; N[r * 3 + a] = T.N[i * 3 + a]; C[r * 3 + a] = T.C[i * 3 + a]; } }
    const Q = W.quant(P, n), qn = new Int8Array(n * 4); for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) qn[i * 4 + a] = Math.round(Math.max(-1, Math.min(1, N[i * 3 + a])) * 127);
    const I16 = n < 65536 ? new Uint16Array(I32) : I32;
    W.J.meshes.push({ name: 'telescope', primitives: [{ attributes: {
      POSITION: W.acc({ bufferView: W.view(new Uint8Array(Q.qp.buffer), n, 8, 'ATTRIBUTES', 34962), componentType: 5122, normalized: true, count: n, type: 'VEC3', min: Q.pmn, max: Q.pmx }),
      NORMAL: W.acc({ bufferView: W.view(new Uint8Array(qn.buffer), n, 4, 'ATTRIBUTES', 34962), componentType: 5120, normalized: true, count: n, type: 'VEC3' }),
      COLOR_0: W.acc({ bufferView: W.view(W.col8(C, n), n, 4, 'ATTRIBUTES', 34962), componentType: 5121, normalized: true, count: n, type: 'VEC4' }) },
      indices: W.acc({ bufferView: W.view(new Uint8Array(I16.buffer), I16.length, I16.BYTES_PER_ELEMENT, 'TRIANGLES', 34963), componentType: I16.BYTES_PER_ELEMENT === 2 ? 5123 : 5125, count: I16.length, type: 'SCALAR' }), material: 0 }] });
    W.J.nodes.push({ name: 'telescope', children: [1], extras: T.anchors }, { name: 'telescope_q', mesh: 0, translation: Q.ctr, scale: [Q.half, Q.half, Q.half] }); W.J.scenes[0].nodes.push(0);
    const u = W.finish(); await fetch('/upload?name=telescope.glb', { method: 'POST', body: new Blob([u]) }); res.tele = { bytes: u.length, verts: n, tris: I16.length / 3 };
  }
  // thiên hà: đám điểm (mode 0)
  {
    const G = S.gal, W = start({ title: 'Need some space?', author: 'Loïc Norgeot (https://sketchfab.com/norgeotloic)', license: 'CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)',
      source: 'https://sketchfab.com/3d-models/need-some-space-d6521362b37b48e3a82bce4911409303', note: 'Modified: centred on the core, disc plane to XZ, radius normalised (R90 = 1), subsampled to ' + G.n + ' points, compressed' });
    const n = G.n, Q = W.quant(G.P, n);
    W.J.meshes.push({ name: 'galaxy', primitives: [{ mode: 0, attributes: {
      POSITION: W.acc({ bufferView: W.view(new Uint8Array(Q.qp.buffer), n, 8, 'ATTRIBUTES', 34962), componentType: 5122, normalized: true, count: n, type: 'VEC3', min: Q.pmn, max: Q.pmx }),
      COLOR_0: W.acc({ bufferView: W.view(W.col8(G.C, n), n, 4, 'ATTRIBUTES', 34962), componentType: 5121, normalized: true, count: n, type: 'VEC4' }) }, material: 0 }] });
    W.J.nodes.push({ name: 'galaxy', mesh: 0, translation: Q.ctr, scale: [Q.half, Q.half, Q.half] }); W.J.scenes[0].nodes.push(0);
    const u = W.finish(); await fetch('/upload?name=galaxy.glb', { method: 'POST', body: new Blob([u]) }); res.gal = { bytes: u.length, n };
  }
  return res;
};
window.skybuildReady = true;
