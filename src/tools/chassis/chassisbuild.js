// "GAZ-69 Vehicle Chassis / Frame" (Peter Gatchev, CC-BY-4.0 — khung sườn GAZ-69: 53 lưới, 526k tam giác, 3 vật liệu ảnh vân gỉ sét) → chassis.glb cho 3d-garden.
// Chạy trong trang có window.gz (gazview.html: GLTFLoader + three r160) — xem README. G 24/10 "do research and study these glb files then modify to fit to the van".
// Giữ: khung (SK_Chassis_Frame), 2 cầu (Front/Rear_Axle), 4 nhíp lá, 2 cặp giảm xóc, hộp số phụ (TranspherBox), các-đăng + khớp chữ thập (Cardans), moay-ơ + tang
// trống (Rim_Hub), cụm lái (Stteering_Hub). Bỏ: lốp, vành (xe đã có bánh), cản trước + biển (Fender), 2 cần số (thò vào cabin).
// SỬA CHO VỪA FORD TRANSIT L3H2 (đv xe: 1,1 đv/m, mũi −X, cửa lùa +Z, cầu trước x −2,12, cầu sau x 2,03, tâm bánh y 0,44, vết bánh z ±0,955 — van/body/transit.js TR):
//   · dài: chèn ΔZ ở mặt cắt Z −0,68 (chỉ 2 thanh dọc + 1 thanh mảnh giữa đi qua — kiểu chèn L3 của vỏ xe; BẪY: Z −0,875 cắt qua tấm ốp thanh ngang −0,95…−0,79 ⇒
//     tấm phẳng dài 1,4 m giữa khung) cho cơ sở 2,51 m → 3,77 m; vật cứng (cầu, nhíp, khớp, giảm xóc, moay-ơ) theo tâm của nó (dời nguyên khối; khớp chữ thập
//     Cardans007 giữ chỗ vì bám ống), khung theo từng đỉnh (giãn); ống các-đăng sau Cardans008 cắt riêng ở −1,0 (đầu trước bám khớp, đầu sau theo cầu ⇒ ống dài ra);
//     đuôi sau cầu sau co 0,9 cho khỏi lòi qua cản sau.
//   · ngang: ×1,1 và LẬT trái–phải (GAZ tay lái thuận, Transit ở đây tay lái nghịch: hộp lái về bên phải −Z); 2 thanh dọc + nhíp + giảm xóc trước nở thêm SPREAD
//     về 2 bên (từ Z 0,75 tới 0,95) chừa chỗ động cơ V6 rộng ±0,44.
//   · cao: tâm cầu (Y 0,4285) → y 0,44; khung + hộp số phụ hạ DROP cho nóc thanh dọc dưới sàn xe 0,83; nhíp, giảm xóc, các-đăng bẹt dần theo độ cao (đầu bám
//     cầu giữ nguyên, đầu bám khung hạ theo khung).
// Màu đỉnh lấy từ ảnh vân màu (thu 128², sRGB → tuyến tính, × BRIGHT). chassisBuild(o) → window.__chassis; chassisWrite(name) → shots/<name>.
window.chassisBuild = async (o = {}) => {
  const THREE = gz.THREE, MSx = window.MS; await MSx.ready; const R = gz.root; R.updateMatrixWorld(true);
  const SPREAD = o.spread ?? 0.12, DROP = o.drop ?? 0.09, BRIGHT = o.bright ?? 1.5, ZC = -0.68, ZF = 0.983, ZR = -1.5275, YA = 0.4285, K = 1.1;
  const DZ = (2.03 + 2.12) / K - (ZF - ZR);   // đoạn chèn (m GAZ)
  const RULE = [   // [khớp tên, nhóm, tỉ lệ giữ tam giác]
    [/Chassis_Frame/, 'frame', 0.08], [/TranspherBox/, 'frame', 0.16], [/Front_Axle|Rear_Axle/, 'axle', 0.08], [/Rim_Hub/, 'axle', 0.12], [/Stteering_Hub/, 'axle', 0.25],
    [/Leaf_Spring/, 'squash', 0.12], [/Dampener/, 'squash', 0.1], [/Cardans00[89]/, 'squash', 1], [/Cardans/, 'squash', 0.015]];
  const SKIP = /Tire|Rims_|Fender|Gear_Lever/;
  const smooth = (a, b, x) => { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  // ---- màu: ảnh vân màu thu nhỏ (trung bình vùng) ----
  const texCache = new Map();
  const texOf = m => { const img = m.material && m.material.map && m.material.map.image; if (!img) return null; if (texCache.has(img)) return texCache.get(img);
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, 128, 128);
    const d = x.getImageData(0, 0, 128, 128).data; texCache.set(img, d); return d; };
  const PQ = o.levels ?? 24, lin = v => Math.pow(Math.round(v / 255 * PQ) / PQ, 2.2);   // gộp màu thành PQ bậc sRGB (màu đỉnh nhiễu nén kém)
  const out = { P: [], N: [], C: [], I: [] }, stat = { src: 0, out: 0, parts: [] }, v = new THREE.Vector3(), m3 = new THREE.Matrix3(), box = new THREE.Box3();
  for (const m of gz.meshes) {
    if (SKIP.test(m.name)) continue; const rule = RULE.find(r => r[0].test(m.name)); if (!rule) continue; const [, grp, ratio] = rule;
    const g = m.geometry, pa = g.attributes.position, uv = g.attributes.uv, flip = (m3.setFromMatrix4(m.matrixWorld).determinant() < 0) !== true;   // lật trái–phải ⇒ đảo chiều tam giác
    box.setFromObject(m); const cz = (box.min.z + box.max.z) / 2, tube = /Cardans00[89]/.test(m.name), cut = /Cardans008/.test(m.name) ? -1.0 : ZC, rigidShift = /Cardans007/.test(m.name) ? 0 : grp !== 'frame' && !tube ? (cz < ZC ? DZ : 0) : null;
    const front = /Chassis_Frame|Leaf_Spring_F|Dampener_FR/.test(m.name), tex = texOf(m);
    const P = [], C = [];
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld); const X0 = v.x, Y0 = v.y, Z0 = v.z;
      let Z = rigidShift === null ? (Z0 < cut ? Z0 - DZ : Z0) : Z0 - rigidShift; const ZRs = ZR - DZ; if (Z < ZRs) Z = ZRs + (Z - ZRs) * 0.9;   // chèn + co đuôi
      const X = front ? X0 + Math.sign(X0) * SPREAD * smooth(0.75, 0.95, Z0) : X0;
      const dy = grp === 'frame' ? -DROP : grp === 'squash' ? -DROP * smooth(0.47, 0.62, Y0) : 0;
      P.push(-2.12 - (Z - ZF) * K, (Y0 - YA) * K + 0.44 + dy, -X * K);
      if (tex && uv) { const u = uv.getX(i), w = uv.getY(i), px = Math.min(127, Math.max(0, Math.floor((u - Math.floor(u)) * 128))), py = Math.min(127, Math.max(0, Math.floor((w - Math.floor(w)) * 128))), o4 = (py * 128 + px) * 4;
        C.push(Math.min(1, lin(tex[o4]) * BRIGHT), Math.min(1, lin(tex[o4 + 1]) * BRIGHT), Math.min(1, lin(tex[o4 + 2]) * BRIGHT)); }
      else C.push(0.05, 0.045, 0.04);
    }
    const src = g.index ? g.index.array : Uint32Array.from({ length: pa.count }, (_, i) => i); const tris = src.length / 3; stat.src += tris;
    let I = new Uint32Array(src.length); for (let t = 0; t < src.length; t += 3) { I[t] = src[t]; I[t + 1] = flip ? src[t + 2] : src[t + 1]; I[t + 2] = flip ? src[t + 1] : src[t + 2]; }
    // hàn đỉnh trùng vị trí trước khi giảm (mẫu tách đỉnh theo đường nối UV) — giữ màu của đỉnh đầu tiên
    { const key = new Map(), remap = new Uint32Array(pa.count), P2 = [], C2 = [];
      for (let i = 0; i < pa.count; i++) { const k = Math.round(P[i * 3] * 4e3) + ',' + Math.round(P[i * 3 + 1] * 4e3) + ',' + Math.round(P[i * 3 + 2] * 4e3); let id = key.get(k);
        if (id === undefined) { id = P2.length / 3; key.set(k, id); P2.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]); C2.push(C[i * 3], C[i * 3 + 1], C[i * 3 + 2]); } remap[i] = id; }
      const J = []; for (let t = 0; t < I.length; t += 3) { const a = remap[I[t]], b = remap[I[t + 1]], c = remap[I[t + 2]]; if (a !== b && b !== c && a !== c) J.push(a, b, c); }
      P.length = 0; P.push(...P2); C.length = 0; C.push(...C2); I = new Uint32Array(J); }
    if (I.length / 3 > 60) { const want = Math.max(48, Math.round(I.length / 3 * ratio * (o.k ?? 1))) * 3; [I] = MSx.simplify(I, new Float32Array(P), 3, want, o.err ?? 0.02); }
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g2.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g2.setIndex(Array.from(I));
    const g3 = o.normals ? window.BGU.mergeVertices(window.BGU.toCreasedNormals(g2, o.crease ?? 0.7), 1e-6) : window.BGU.mergeVertices(g2, 1e-6), p3 = g3.attributes.position, q3 = g3.attributes.normal, c3 = g3.attributes.color, i3 = g3.index, base = out.P.length / 3;   // không pháp tuyến: trang tô phẳng (flatShading) — nhẹ gần nửa
    for (let i = 0; i < p3.count; i++) { out.P.push(p3.getX(i), p3.getY(i), p3.getZ(i)); if (q3) out.N.push(q3.getX(i), q3.getY(i), q3.getZ(i)); out.C.push(c3.getX(i), c3.getY(i), c3.getZ(i)); }
    for (let i = 0; i < i3.count; i++) out.I.push(base + i3.getX(i));
    stat.out += i3.count / 3; stat.parts.push([m.name.replace(/_M_Gaz69.*$/, ''), tris, i3.count / 3]);
  }
  const bb = new THREE.Box3(); for (let i = 0; i < out.P.length; i += 3) bb.expandByPoint(v.set(out.P[i], out.P[i + 1], out.P[i + 2]));
  window.__chassis = { out, anchors: { axleF: -2.12, axleR: 2.03, wheelY: 0.44, dz: +DZ.toFixed(4), drop: DROP, spread: SPREAD, min: bb.min.toArray().map(x => +x.toFixed(3)), max: bb.max.toArray().map(x => +x.toFixed(3)) } };
  return { srcTris: stat.src, tris: stat.out, anchors: window.__chassis.anchors, parts: stat.parts };
};
window.chassisWrite = async (name = 'chassis.glb') => {
  const ENC = window.MSE; await ENC.ready; const Q = window.__chassis.out, A = window.__chassis.anchors;
  const bin = [], al = x => (x + 3) & ~3; let binLen = 0, fbLen = 0;
  const push = u8 => { const off = binLen; bin.push(u8); binLen += u8.length; const pad = al(binLen) - binLen; if (pad) { bin.push(new Uint8Array(pad)); binLen += pad; } return off; };
  const J = { asset: { version: '2.0', generator: '3d-garden chassisbuild', extras: { title: 'GAZ-69 Vehicle Chassis / Frame', author: 'Peter Gatchev (https://sketchfab.com/petar.gachev)', license: 'CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)',
      source: 'https://sketchfab.com/3d-models/gaz-69-vehicle-chassis-frame-e67d8918300f4aaeaa783a6e3b7053be', note: 'Modified: tyres, rims, front bumper and gear levers removed; frame and propeller shaft lengthened, front rails widened, frame lowered and mirrored to fit a Ford Transit L3 (RHD); decimated; texture baked to vertex colours; quantised + meshopt compressed' } },
    extensionsUsed: ['EXT_meshopt_compression', 'KHR_mesh_quantization'], extensionsRequired: ['EXT_meshopt_compression', 'KHR_mesh_quantization'],
    scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [], materials: [{ name: 'chassis', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.85 } }] };
  const view = (u8, count, stride, mode, target) => { const enc = mode === 'TRIANGLES' ? ENC.encodeIndexBuffer(u8, count, stride) : ENC.encodeVertexBuffer(u8, count, stride), off = push(enc), fb = fbLen; fbLen += al(u8.length);
    J.bufferViews.push({ buffer: 1, byteOffset: fb, byteLength: u8.length, ...(mode === 'ATTRIBUTES' ? { byteStride: stride } : {}), target, extensions: { EXT_meshopt_compression: { buffer: 0, byteOffset: off, byteLength: enc.length, byteStride: stride, count, mode } } });
    return J.bufferViews.length - 1; };
  const acc = a => { J.accessors.push(a); return J.accessors.length - 1; };
  const n0 = Q.P.length / 3, I32 = new Uint32Array(Q.I), [remap, n] = ENC.reorderMesh(I32, true, true);
  const P = new Float32Array(n * 3), Nn = new Float32Array(n * 3), C = new Float32Array(n * 3), hasN = Q.N.length > 0;
  for (let i = 0; i < n0; i++) { const r = remap[i]; if (r === 0xffffffff) continue; for (let a = 0; a < 3; a++) { P[r * 3 + a] = Q.P[i * 3 + a]; if (hasN) Nn[r * 3 + a] = Q.N[i * 3 + a]; C[r * 3 + a] = Q.C[i * 3 + a]; } }
  const mn = [9, 9, 9], mx = [-9, -9, -9]; for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], P[i * 3 + a]); mx[a] = Math.max(mx[a], P[i * 3 + a]); }
  const ctr = mn.map((x, a) => (x + mx[a]) / 2), half = Math.max(1e-4, ...mn.map((x, a) => (mx[a] - x) / 2));
  const qp = new Int16Array(n * 4), qn = new Int8Array(n * 4), qc = new Uint8Array(n * 4), pmn = [32767, 32767, 32767], pmx = [-32767, -32767, -32767];
  for (let i = 0; i < n; i++) { for (let a = 0; a < 3; a++) { const q = Math.round((P[i * 3 + a] - ctr[a]) / half * 32767); qp[i * 4 + a] = q; pmn[a] = Math.min(pmn[a], q); pmx[a] = Math.max(pmx[a], q);
    qn[i * 4 + a] = Math.round(Math.max(-1, Math.min(1, Nn[i * 3 + a])) * 127); qc[i * 4 + a] = Math.round(Math.max(0, Math.min(1, C[i * 3 + a])) * 255); } qc[i * 4 + 3] = 255; }
  const I16 = n < 65536 ? new Uint16Array(I32) : I32;
  const prim = { attributes: { POSITION: acc({ bufferView: view(new Uint8Array(qp.buffer), n, 8, 'ATTRIBUTES', 34962), componentType: 5122, normalized: true, count: n, type: 'VEC3', min: pmn, max: pmx }),
      ...(hasN ? { NORMAL: acc({ bufferView: view(new Uint8Array(qn.buffer), n, 4, 'ATTRIBUTES', 34962), componentType: 5120, normalized: true, count: n, type: 'VEC3' }) } : {}),
      COLOR_0: acc({ bufferView: view(qc, n, 4, 'ATTRIBUTES', 34962), componentType: 5121, normalized: true, count: n, type: 'VEC4' }) },
    indices: acc({ bufferView: view(new Uint8Array(I16.buffer), I16.length, I16.BYTES_PER_ELEMENT, 'TRIANGLES', 34963), componentType: I16.BYTES_PER_ELEMENT === 2 ? 5123 : 5125, count: I16.length, type: 'SCALAR' }), material: 0 };
  J.meshes.push({ name: 'chassis', primitives: [prim] }); J.nodes.push({ name: 'chassis_q', mesh: 0, translation: ctr, scale: [half, half, half] }, { name: 'chassis', children: [0], extras: A }); J.scenes[0].nodes.push(1);
  J.buffers.push({ byteLength: binLen }, { byteLength: fbLen, extensions: { EXT_meshopt_compression: { fallback: true } } });
  const js = new TextEncoder().encode(JSON.stringify(J)), jl = al(js.length), total = 28 + jl + binLen, glb = new Uint8Array(total), dv = new DataView(glb.buffer);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true); dv.setUint32(12, jl, true); dv.setUint32(16, 0x4E4F534A, true); glb.set(js, 20); for (let i = js.length; i < jl; i++) glb[20 + i] = 0x20;
  let off = 20 + jl; dv.setUint32(off, binLen, true); dv.setUint32(off + 4, 0x004E4942, true); off += 8; for (const u8 of bin) { glb.set(u8, off); off += u8.length; }
  await fetch('/upload?name=' + name, { method: 'POST', body: new Blob([glb]) });
  return { bytes: total, verts: n, tris: I16.length / 3 };
};
window.chassisbuildReady = true;
