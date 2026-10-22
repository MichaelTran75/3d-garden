// Nấm cho cây cổ thụ, gốc cây cưa, gỗ chết → fungi.bin (GLB nén meshopt + lượng tử hoá, XOR dòng xorshift32 như transit.bin — 2 mẫu gốc giấy phép
// Sketchfab Standard: dùng trong trang được, không để người khác tải nguyên mẫu ra):
//   bracket — "Big mushroom - #AgisoftNatureChallenge" (Zacxophone): nấm giá chụp quét 3D (500k tam giác, ảnh 1024² 562 KB) mọc trên mảnh vỏ cây.
//             Tách nấm khỏi vỏ: tam giác có màu ảnh ở tâm UV sáng (độ sáng ≥ 0,33, y > −0,6) hoặc nâu vành mũ (≥ 0,2) ở dải trên (y > 0,25) → giữ mảnh liền
//             ≥ 2% (bỏ đốm sáng lẻ trên vỏ) → nới 1 vòng tam giác kề (lấp mép răng cưa; y > −0,3, sáng > 0,12) → giảm lưới → màu đỉnh = trung bình ô 5 × 5
//             texel quanh UV (đổi sRGB → tuyến tính); mặt dưới (ảnh quét tối) kéo về màu kem. Gốc = tâm đáy (chỗ cuống bám vỏ), mũ ngang (+Y lên), mét (ngang 0,3).
//   fly, cluster — "Low Poly Mushroom Pack" (EarlyMorrow3D): bảng 19 loại xếp 3 hàng; tách theo mảnh liền rồi gom mảnh chồng hộp bao thành từng cây:
//             fly = nấm đỏ chấm trắng (hàng 2, cx −0,832), cluster = cụm nấm nâu đỏ mọc chùm (hàng 3, cx −0,373). Màu đỉnh lấy từ ảnh bảng màu. Gốc = tâm đáy.
// fungiBuild({ big, pack, n }) → window.__fungi; fungiWrite(name) → shots/<name>. Cần window.MS / MSE (meshoptimizer), BGU (BufferGeometryUtils), S.THREE.
window.fungiBuild = async (o = {}) => {
  const THREE = S.THREE, MSx = window.MS; await MSx.ready;
  const { GLTFLoader } = await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), L = new GLTFLoader();
  const pixels = tex => { const im = tex.image, c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return { d: x.getImageData(0, 0, c.width, c.height).data, W: c.width, H: c.height }; };
  const lin = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const texel = (T, u, v, r = 0) => { let s = [0, 0, 0], n = 0; const x0 = Math.round(u * (T.W - 1)), y0 = Math.round(v * (T.H - 1));
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = Math.min(T.W - 1, Math.max(0, x0 + dx)), y = Math.min(T.H - 1, Math.max(0, y0 + dy)), k = (y * T.W + x) * 4; s[0] += T.d[k]; s[1] += T.d[k + 1]; s[2] += T.d[k + 2]; n++; }
    return s.map(c => c / n / 255); };
  const v = new THREE.Vector3();
  function soup(root) {   // gộp mọi lưới (toạ độ thế giới) → P, U, I (hàn đỉnh theo vị trí; UV lấy của đỉnh đầu tiên)
    root.updateMatrixWorld(true); const P = [], U = [], I = [], key = new Map(); let tex = null;
    root.traverse(m => { if (!m.isMesh) return; tex = tex || m.material.map; const pa = m.geometry.attributes.position, ua = m.geometry.attributes.uv, ix = m.geometry.index.array, remap = new Uint32Array(pa.count);
      for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld); const k = Math.round(v.x * 1e4) + ',' + Math.round(v.y * 1e4) + ',' + Math.round(v.z * 1e4); let id = key.get(k);
        if (id === undefined) { id = P.length / 3; key.set(k, id); P.push(v.x, v.y, v.z); U.push(ua.getX(i), ua.getY(i)); } remap[i] = id; }
      for (let t = 0; t < ix.length; t += 3) { const a = remap[ix[t]], b = remap[ix[t + 1]], c = remap[ix[t + 2]]; if (a !== b && b !== c && a !== c) I.push(a, b, c); } });
    return { P, U, I, tex };
  }
  function comps(I, n, tris) {   // mảnh liền theo đỉnh chung: trả gốc của từng tam giác trong danh sách tris
    const par = Int32Array.from({ length: n }, (_, i) => i), f = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
    for (const t of tris) { const a = f(I[t * 3]), b = f(I[t * 3 + 1]), c = f(I[t * 3 + 2]); par[b] = a; par[f(c)] = a; }
    return tris.map(t => f(I[t * 3]));
  }
  function finish(P, I, C, target, err, origin, scale, flags = ['LockBorder']) {   // giảm lưới (vị trí) → pháp tuyến gãy → đổi gốc / tỉ lệ → { P, N, C, I }
    let J = new Uint32Array(I); if (J.length / 3 > target) [J] = MSx.simplify(J, new Float32Array(P), 3, target * 3, err, flags);
    const used = new Map(), P2 = [], C2 = [], I2 = [];
    for (const i of J) { let k = used.get(i); if (k === undefined) { k = P2.length / 3; used.set(i, k); P2.push((P[i * 3] - origin.x) * scale, (P[i * 3 + 1] - origin.y) * scale, (P[i * 3 + 2] - origin.z) * scale); C2.push(...C(i)); } I2.push(k); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P2, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C2, 3)); g.setIndex(I2);
    const g2 = window.BGU.mergeVertices(window.BGU.toCreasedNormals(g, 1.0), 1e-6), p = g2.attributes.position, nn = g2.attributes.normal, cc = g2.attributes.color, ii = g2.index;
    const Q = { P: [], N: [], C: [], I: Array.from(ii.array) }; for (let i = 0; i < p.count; i++) { Q.P.push(p.getX(i), p.getY(i), p.getZ(i)); Q.N.push(nn.getX(i), nn.getY(i), nn.getZ(i)); Q.C.push(cc.getX(i), cc.getY(i), cc.getZ(i)); }
    return Q;
  }
  const out = {};
  { // ---- nấm giá (bỏ mảnh vỏ) ----
    const gl = await L.loadAsync(o.big || '/mush-big/big.glb'), { P, U, I, tex } = soup(gl.scene), TX = pixels(tex), n = P.length / 3, nt = I.length / 3;
    const lum = t => { let u = 0, w = 0, y = 0; for (let k = 0; k < 3; k++) { const i = I[t * 3 + k]; u += U[i * 2] / 3; w += U[i * 2 + 1] / 3; y += P[i * 3 + 1] / 3; } const c = texel(TX, u, w); return [0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2], y]; };
    const LY = Array.from({ length: nt }, (_, t) => lum(t)), sel = []; for (let t = 0; t < nt; t++) { const [l, y] = LY[t]; if ((l >= 0.33 && y > -0.6) || (l >= 0.2 && y > 0.25)) sel.push(t); }
    const root = comps(I, n, sel), cnt = new Map(); for (const r of root) cnt.set(r, (cnt.get(r) || 0) + 1);
    let keep = new Set(sel.filter((t, k) => cnt.get(root[k]) >= sel.length * 0.02));
    const vin = new Uint8Array(n); for (const t of keep) for (let k = 0; k < 3; k++) vin[I[t * 3 + k]] = 1;   // nới 1 vòng
    for (let t = 0; t < nt; t++) if (!keep.has(t) && LY[t][1] > -0.3 && LY[t][0] > 0.12 && (vin[I[t * 3]] || vin[I[t * 3 + 1]] || vin[I[t * 3 + 2]])) keep.add(t);
    const KI = []; for (const t of keep) KI.push(I[t * 3], I[t * 3 + 1], I[t * 3 + 2]);
    const B = new THREE.Box3(); for (const i of KI) B.expandByPoint(v.set(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]));
    const sz = B.getSize(new THREE.Vector3()), W = Math.max(sz.x, sz.z), scale = (o.width ?? 0.3) / W, org = new THREE.Vector3((B.min.x + B.max.x) / 2, B.min.y, (B.min.z + B.max.z) / 2);
    const col = i => texel(TX, U[i * 2], U[i * 2 + 1], 2).map(lin);
    out.bracket = finish(P, KI, col, o.n ?? 2600, o.err ?? 0.02, org, scale, []);   // mép quét lởm chởm: cho thu cả biên
    { const Q = out.bracket, cream = [0.42, 0.34, 0.24];   // mặt dưới (lỗ thịt nấm) trong ảnh quét tối đen ⇒ kéo về màu kem theo độ chúc xuống của pháp tuyến
      for (let i = 0; i < Q.N.length / 3; i++) { const k = Math.max(0, Math.min(1, (-Q.N[i * 3 + 1] - 0.1) / 0.5)); for (let a = 0; a < 3; a++) Q.C[i * 3 + a] += (cream[a] - Q.C[i * 3 + a]) * 0.75 * k; } }
    out.bracket.ex = { r: +(W / 2 * scale).toFixed(4), h: +(sz.y * scale).toFixed(4), srcTris: nt, keptTris: KI.length / 3 };
  }
  { // ---- 2 loại nấm nhỏ trong gói ----
    const gl = await L.loadAsync(o.pack || '/mush-pack/pack.glb'), { P, U, I, tex } = soup(gl.scene), TX = pixels(tex), n = P.length / 3, nt = I.length / 3;
    const all = Array.from({ length: nt }, (_, t) => t), root = comps(I, n, all), box = new Map();
    for (let t = 0; t < nt; t++) { let b = box.get(root[t]); if (!b) { b = new THREE.Box3(); box.set(root[t], b); } for (let k = 0; k < 3; k++) { const i = I[t * 3 + k]; b.expandByPoint(v.set(P[i * 3], P[i * 3 + 1], P[i * 3 + 2])); } }
    const ks = [...box.keys()], bs = ks.map(k => box.get(k).clone().expandByScalar(0.004)), par = ks.map((_, i) => i), f = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
    for (let a = 0; a < ks.length; a++) for (let b = a + 1; b < ks.length; b++) if (bs[a].intersectsBox(bs[b])) par[f(b)] = f(a);
    const grp = new Map(); ks.forEach((k, i) => { const g = f(i); if (!grp.has(g)) grp.set(g, { keys: new Set(), box: new THREE.Box3() }); grp.get(g).keys.add(k); grp.get(g).box.union(box.get(k)); });
    const pickAt = (cx, y0) => [...grp.values()].find(g => Math.abs((g.box.min.x + g.box.max.x) / 2 - cx) < 0.03 && Math.abs(g.box.min.y - y0) < 0.03);
    for (const [name, cx, y0] of [['fly', -0.832, 0.41], ['cluster', -0.373, -0.009]]) {
      const G = pickAt(cx, y0); if (!G) throw new Error('không thấy ' + name);
      const KI = []; for (let t = 0; t < nt; t++) if (G.keys.has(root[t])) KI.push(I[t * 3], I[t * 3 + 1], I[t * 3 + 2]);
      const org = new THREE.Vector3((G.box.min.x + G.box.max.x) / 2, G.box.min.y, (G.box.min.z + G.box.max.z) / 2);
      out[name] = finish(P, KI, i => texel(TX, U[i * 2], U[i * 2 + 1]).map(lin), 99999, 0.01, org, 1);
      const s = G.box.getSize(new THREE.Vector3()); out[name].ex = { r: +(Math.max(s.x, s.z) / 2).toFixed(4), h: +s.y.toFixed(4) };
    }
  }
  window.__fungi = out;
  return Object.fromEntries(Object.entries(out).map(([k, Q]) => [k, { tris: Q.I.length / 3, verts: Q.P.length / 3, ...Q.ex }]));
};
window.fungiWrite = async (name = 'fungi.bin') => {
  const ENC = window.MSE; await ENC.ready; const F = window.__fungi;
  const bin = [], al = x => (x + 3) & ~3; let binLen = 0, fbLen = 0;
  const push = u8 => { const off = binLen; bin.push(u8); binLen += u8.length; const pad = al(binLen) - binLen; if (pad) { bin.push(new Uint8Array(pad)); binLen += pad; } return off; };
  const J = { asset: { version: '2.0', generator: '3d-garden fungibuild', extras: { note: 'Big mushroom - #AgisoftNatureChallenge by Zacxophone; Low Poly Mushroom Pack by EarlyMorrow3D (Sketchfab Standard). Modified: bark removed, decimated, colours baked to vertices, 2 pack mushrooms kept.' } },
    extensionsUsed: ['EXT_meshopt_compression', 'KHR_mesh_quantization'], extensionsRequired: ['EXT_meshopt_compression', 'KHR_mesh_quantization'],
    scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [], materials: [{ name: 'fungi', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.8 } }] };
  const view = (u8, count, stride, mode, target) => { const enc = mode === 'TRIANGLES' ? ENC.encodeIndexBuffer(u8, count, stride) : ENC.encodeVertexBuffer(u8, count, stride), off = push(enc), fb = fbLen; fbLen += al(u8.length);
    J.bufferViews.push({ buffer: 1, byteOffset: fb, byteLength: u8.length, ...(mode === 'ATTRIBUTES' ? { byteStride: stride } : {}), target, extensions: { EXT_meshopt_compression: { buffer: 0, byteOffset: off, byteLength: enc.length, byteStride: stride, count, mode } } });
    return J.bufferViews.length - 1; };
  const acc = a => { J.accessors.push(a); return J.accessors.length - 1; };
  const out = {};
  for (const [nm, Q] of Object.entries(F)) {
    const n0 = Q.P.length / 3, I32 = new Uint32Array(Q.I), [remap, n] = ENC.reorderMesh(I32, true, true);
    const P = new Float32Array(n * 3), Nn = new Float32Array(n * 3), C = new Float32Array(n * 3);
    for (let i = 0; i < n0; i++) { const r = remap[i]; if (r === 0xffffffff) continue; for (let a = 0; a < 3; a++) { P[r * 3 + a] = Q.P[i * 3 + a]; Nn[r * 3 + a] = Q.N[i * 3 + a]; C[r * 3 + a] = Q.C[i * 3 + a]; } }
    const mn = [9, 9, 9], mx = [-9, -9, -9]; for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], P[i * 3 + a]); mx[a] = Math.max(mx[a], P[i * 3 + a]); }
    const ctr = mn.map((x, a) => (x + mx[a]) / 2), half = Math.max(1e-4, ...mn.map((x, a) => (mx[a] - x) / 2));
    const qp = new Int16Array(n * 4), qn = new Int8Array(n * 4), qc = new Uint8Array(n * 4), pmn = [32767, 32767, 32767], pmx = [-32767, -32767, -32767];
    for (let i = 0; i < n; i++) { for (let a = 0; a < 3; a++) { const q = Math.round((P[i * 3 + a] - ctr[a]) / half * 32767); qp[i * 4 + a] = q; pmn[a] = Math.min(pmn[a], q); pmx[a] = Math.max(pmx[a], q);
      qn[i * 4 + a] = Math.round(Math.max(-1, Math.min(1, Nn[i * 3 + a])) * 127); qc[i * 4 + a] = Math.round(Math.max(0, Math.min(1, C[i * 3 + a])) * 255); } qc[i * 4 + 3] = 255; }
    const I16 = n < 65536 ? new Uint16Array(I32) : I32;
    const prim = { attributes: { POSITION: acc({ bufferView: view(new Uint8Array(qp.buffer), n, 8, 'ATTRIBUTES', 34962), componentType: 5122, normalized: true, count: n, type: 'VEC3', min: pmn, max: pmx }),
        NORMAL: acc({ bufferView: view(new Uint8Array(qn.buffer), n, 4, 'ATTRIBUTES', 34962), componentType: 5120, normalized: true, count: n, type: 'VEC3' }),
        COLOR_0: acc({ bufferView: view(qc, n, 4, 'ATTRIBUTES', 34962), componentType: 5121, normalized: true, count: n, type: 'VEC4' }) },
      indices: acc({ bufferView: view(new Uint8Array(I16.buffer), I16.length, I16.BYTES_PER_ELEMENT, 'TRIANGLES', 34963), componentType: I16.BYTES_PER_ELEMENT === 2 ? 5123 : 5125, count: I16.length, type: 'SCALAR' }), material: 0 };
    J.meshes.push({ name: nm, primitives: [prim] }); out[nm] = { verts: n, tris: I16.length / 3 };
    J.nodes.push({ name: nm + '_q', mesh: J.meshes.length - 1, translation: ctr, scale: [half, half, half] });
    J.nodes.push({ name: nm, children: [J.nodes.length - 1], extras: Q.ex }); J.scenes[0].nodes.push(J.nodes.length - 1);
  }
  J.buffers.push({ byteLength: binLen }, { byteLength: fbLen, extensions: { EXT_meshopt_compression: { fallback: true } } });
  const js = new TextEncoder().encode(JSON.stringify(J)), jl = al(js.length), total = 28 + jl + binLen, glb = new Uint8Array(total), dv = new DataView(glb.buffer);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true); dv.setUint32(12, jl, true); dv.setUint32(16, 0x4E4F534A, true); glb.set(js, 20); for (let i = js.length; i < jl; i++) glb[20 + i] = 0x20;
  let off = 20 + jl; dv.setUint32(off, binLen, true); dv.setUint32(off + 4, 0x004E4942, true); off += 8; for (const u8 of bin) { glb.set(u8, off); off += u8.length; }
  { let s = 0x2545F491; for (let i = 0; i < glb.length; i++) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; glb[i] ^= s & 255; } }   // XOR như transit.bin (giấy phép Sketchfab Standard)
  await fetch('/upload?name=' + name, { method: 'POST', body: new Blob([glb]) });
  return { bytes: total, parts: out };
};
window.fungibuildReady = true;
