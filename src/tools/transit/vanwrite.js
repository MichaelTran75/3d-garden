// window.__van (vanbuild.js) → transit.bin: hàn đỉnh trùng → giảm lưới meshoptimizer (khoá mép, sai số tuyệt đối) → mỗi nút 1 lưới, mỗi lớp vật liệu
// 1 primitive → lượng tử hoá (KHR_mesh_quantization) + nén EXT_meshopt_compression → GLB → XOR dòng xorshift32 (giấy phép Sketchfab Standard: không
// để mẫu thành 1 tệp mở được) → /upload.
window.vanWrite = async (name = 'transit.bin', o = {}) => {
  const MSx = window.MS, ENC = window.MSE; await ENC.ready; await MSx.ready;
  const V = window.__van, ERR = o.err ?? 0.0012, report = [];
  const ORDER = ['paint', 'paintO', 'paintIn', 'black', 'chrome', 'glass', 'frost', 'lens', 'bulb', 'red', 'blue', 'steel', 'tire', 'trim', 'dash', 'dashTop', 'ctrl', 'seat', 'yellow', 'drl'];
  const errOf = o.errOf || { paint: 0.0008, paintO: 0.0008, paintIn: 0.0012, glass: 0.0006, frost: 0.0006, tire: 0.004, steel: 0.002 };
  function weldSimplify(list, err, tag) {
    const map = new Map(), P = [], N = [], I = [];
    for (const t of list) for (let k = 0; k < 3; k++) {
      const px = t.p[k * 3], py = t.p[k * 3 + 1], pz = t.p[k * 3 + 2], nx = t.n[k * 3], ny = t.n[k * 3 + 1], nz = t.n[k * 3 + 2];
      const key = Math.round(px * 1e4) + ',' + Math.round(py * 1e4) + ',' + Math.round(pz * 1e4) + ',' + Math.round(nx * 40) + ',' + Math.round(ny * 40) + ',' + Math.round(nz * 40);
      let id = map.get(key); if (id === undefined) { id = P.length / 3; map.set(key, id); P.push(px, py, pz); const l = Math.hypot(nx, ny, nz) || 1; N.push(nx / l, ny / l, nz / l); }
      I.push(id);
    }
    // bỏ tam giác suy biến (2 đỉnh trùng sau hàn)
    const I2 = []; for (let i = 0; i < I.length; i += 3) { const a = I[i], b = I[i + 1], c = I[i + 2]; if (a !== b && b !== c && a !== c) I2.push(a, b, c); }
    const Pf = new Float32Array(P), idx = new Uint32Array(I2);
    let out = idx, e = 0;
    if (err > 0 && idx.length > 300) {
      const scale = MSx.getScale ? MSx.getScale(Pf, 3) : 1;
      const r = MSx.simplify(idx, Pf, 3, 0, err / scale, ['LockBorder']); out = r[0]; e = r[1] * scale;
    }
    // gọn đỉnh không dùng
    const used = new Int32Array(Pf.length / 3).fill(-1), P3 = [], N3 = [], I3 = new Uint32Array(out.length); let nv = 0;
    for (let i = 0; i < out.length; i++) { const v = out[i]; if (used[v] < 0) { used[v] = nv++; P3.push(Pf[v * 3], Pf[v * 3 + 1], Pf[v * 3 + 2]); N3.push(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]); } I3[i] = used[v]; }
    report.push([tag, list.length, out.length / 3, nv, +e.toFixed(5)]);
    return { P: new Float32Array(P3), N: new Float32Array(N3), I: I3 };
  }
  const meshes = {};
  for (const [node, list] of [['shell', V.tris.shell], ['cab', V.tris.cab], ['door', V.tris.door], ['seat', V.tris.seat], ['wheel', V.wheel],
    ['doorF', V.tris.doorF], ['handle', V.tris.handle], ['hood', V.tris.hood], ['logo', V.tris.logo]]) {
    const by = {}; for (const t of list) (by[t.cls] || (by[t.cls] = [])).push(t);
    meshes[node] = ORDER.filter(c => by[c]).map(c => ({ cls: c, ...weldSimplify(by[c], errOf[c] ?? ERR, node + '/' + c) }));
    const extra = Object.keys(by).filter(c => !ORDER.includes(c)); if (extra.length) console.warn('lớp lạ', node, extra);
  }
  // ---- GLB ----
  const bin = [], align4 = n => (n + 3) & ~3; let binLen = 0, fbLen = 0;
  const pushBin = u8 => { const off = binLen; bin.push(u8); binLen += u8.length; const pad = align4(binLen) - binLen; if (pad) { bin.push(new Uint8Array(pad)); binLen += pad; } return off; };
  const J = { asset: { version: '2.0', generator: '3d-garden vanwrite', extras: { title: 'Ford Transit L2H2', author: 'geyges (Sketchfab)', license: 'Sketchfab Standard',
      note: 'Modified for 3d-garden (cut down, mirrored to right-hand drive, stretched to L3, camper windows, recoloured in code). Not to be extracted or redistributed.' } },
    extensionsUsed: ['EXT_meshopt_compression', 'KHR_mesh_quantization'], extensionsRequired: ['EXT_meshopt_compression', 'KHR_mesh_quantization'],
    scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [], materials: ORDER.map(c => ({ name: c, doubleSided: true, pbrMetallicRoughness: { baseColorFactor: [0.6, 0.6, 0.6, 1], metallicFactor: 0, roughnessFactor: 0.8 } })) };
  const encView = (u8, count, stride, mode, target) => { const enc = mode === 'TRIANGLES' ? ENC.encodeIndexBuffer(u8, count, stride) : ENC.encodeVertexBuffer(u8, count, stride); const off = pushBin(enc);
    const fbOff = fbLen; fbLen += align4(u8.length);
    J.bufferViews.push({ buffer: 1, byteOffset: fbOff, byteLength: u8.length, ...(mode === 'ATTRIBUTES' ? { byteStride: stride } : {}), ...(target ? { target } : {}), extensions: { EXT_meshopt_compression: { buffer: 0, byteOffset: off, byteLength: enc.length, byteStride: stride, count, mode } } });
    return J.bufferViews.length - 1; };
  const acc = a => { J.accessors.push(a); return J.accessors.length - 1; };
  const meshIdx = {}, deq = {};
  for (const node in meshes) {
    const prims = meshes[node]; const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (const p of prims) for (let i = 0; i < p.P.length; i += 3) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], p.P[i + a]); mx[a] = Math.max(mx[a], p.P[i + a]); }
    const ctr = mn.map((v, a) => (v + mx[a]) / 2), half = Math.max(...mn.map((v, a) => (mx[a] - v) / 2)) || 1;
    const primitives = [];
    for (const p of prims) {
      let n = p.P.length / 3; const I32 = new Uint32Array(p.I); const [remap, unique] = ENC.reorderMesh(I32, true, true);
      const P = new Float32Array(unique * 3), Nn = new Float32Array(unique * 3); for (let i = 0; i < n; i++) { const r = remap[i]; if (r === 0xffffffff) continue; P.set(p.P.subarray(i * 3, i * 3 + 3), r * 3); Nn.set(p.N.subarray(i * 3, i * 3 + 3), r * 3); }
      n = unique; const qp = new Int16Array(n * 4), qn = new Int8Array(n * 4); const pmn = [32767, 32767, 32767], pmx = [-32767, -32767, -32767];
      for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) { const q = Math.round((P[i * 3 + a] - ctr[a]) / half * 32767); qp[i * 4 + a] = q; pmn[a] = Math.min(pmn[a], q); pmx[a] = Math.max(pmx[a], q); qn[i * 4 + a] = Math.round(Math.max(-1, Math.min(1, Nn[i * 3 + a])) * 127); }
      const vP = encView(new Uint8Array(qp.buffer), n, 8, 'ATTRIBUTES', 34962), vN = encView(new Uint8Array(qn.buffer), n, 4, 'ATTRIBUTES', 34962);
      const I16 = n < 65536 ? new Uint16Array(I32) : I32, vI = encView(new Uint8Array(I16.buffer), I16.length, I16.BYTES_PER_ELEMENT, 'TRIANGLES', 34963);
      primitives.push({ attributes: { POSITION: acc({ bufferView: vP, componentType: 5122, normalized: true, count: n, type: 'VEC3', min: pmn, max: pmx }), NORMAL: acc({ bufferView: vN, componentType: 5120, normalized: true, count: n, type: 'VEC3' }) },
        indices: acc({ bufferView: vI, componentType: I16.BYTES_PER_ELEMENT === 2 ? 5123 : 5125, count: I16.length, type: 'SCALAR' }), material: ORDER.indexOf(p.cls) });
    }
    J.meshes.push({ name: node, primitives }); meshIdx[node] = J.meshes.length - 1; deq[node] = { ctr, half };
  }
  const addNode = (name, mesh, tr = {}, extras = {}, root = true) => { J.nodes.push({ name: name + '_q', mesh: meshIdx[mesh], translation: deq[mesh].ctr, scale: [deq[mesh].half, deq[mesh].half, deq[mesh].half] }); const q = J.nodes.length - 1;
    J.nodes.push({ name, children: [q], ...tr, extras }); const k = J.nodes.length - 1; if (root) J.scenes[0].nodes.push(k); return k; };
  addNode('Shell', 'shell', {}, { role: 'shell' }); addNode('Cab', 'cab', {}, { role: 'keep' });
  addNode('Door', 'door', { translation: [V.door.dX, 0, V.door.dZ] }, { role: 'shell' });
  addNode('SeatR', 'seat', {}, { role: 'keep' }); addNode('SeatL', 'seat', { scale: [1, 1, -1] }, { role: 'keep' });
  const W = V.wheelPos; for (const [nm, x, s] of [['WheelFL', W.xf, 1], ['WheelFR', W.xf, -1], ['WheelRL', W.xr, 1], ['WheelRR', W.xr, -1]])
    addNode(nm, 'wheel', { translation: [x, W.y, s * W.z], ...(s < 0 ? { rotation: [0, 1, 0, 0] } : {}) }, { role: 'keep' });
  // bộ phận cử động: nút đặt ở bản lề (extras.pivot), nút bấm (extras.btn = tên nút bản lề nó mở); cửa trái = ảnh gương cửa phải như ghế
  const HD = V.hinge.door; for (const [nm, s] of [['FrontDoorR', 1], ['FrontDoorL', -1]]) {
    const d = addNode(nm, 'doorF', { translation: [HD[0], HD[1], s * HD[2]], ...(s < 0 ? { scale: [1, 1, -1] } : {}) }, { role: 'shell', pivot: 'door' });
    J.nodes[d].children.push(addNode('Handle' + nm.slice(-1), 'handle', {}, { role: 'shell', btn: nm }, false)); }
  addNode('Hood', 'hood', { translation: V.hinge.hood }, { role: 'shell', pivot: 'hood' }); addNode('Logo', 'logo', {}, { role: 'shell', btn: 'Hood' });
  J.buffers.push({ byteLength: binLen }); J.buffers.push({ byteLength: fbLen, extensions: { EXT_meshopt_compression: { fallback: true } } });
  const jsonU8 = new TextEncoder().encode(JSON.stringify(J)), jl = align4(jsonU8.length), total = 12 + 8 + jl + 8 + binLen;
  const glb = new Uint8Array(total), dv = new DataView(glb.buffer); dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true);
  dv.setUint32(12, jl, true); dv.setUint32(16, 0x4E4F534A, true); glb.set(jsonU8, 20); for (let i = jsonU8.length; i < jl; i++) glb[20 + i] = 0x20;
  let off = 20 + jl; dv.setUint32(off, binLen, true); dv.setUint32(off + 4, 0x004E4942, true); off += 8; for (const u8 of bin) { glb.set(u8, off); off += u8.length; }
  window.__vanGlb = glb.slice();
  if (o.xor !== false) { let s = 0x2545F491; for (let i = 0; i < glb.length; i++) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; glb[i] ^= s & 255; } }
  if (o.upload !== false) await fetch('/upload?name=' + name, { method: 'POST', body: new Blob([glb]) });
  const tot = report.reduce((s, r) => s + r[2], 0);
  return { bytes: total, tris: tot, report };
};
window.vanwriteReady = true;
