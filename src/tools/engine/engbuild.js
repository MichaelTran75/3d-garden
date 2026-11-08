// "Nelson Racing Engine B" (Rudy, CC-BY-4.0, lưới quét AI 1,9 triệu tam giác + màu đỉnh) → engine.glb cho khoang máy xe Transit (3d-garden).
// Gộp 20 khúc lưới (khúc chia theo giới hạn 65k đỉnh, không phải bộ phận) theo toạ độ thế giới của mẫu (m, Y lên, đầu máy +Z), hàn đỉnh trùng vị trí
// (trung bình màu + pháp tuyến), giảm lưới meshoptimizer simplifyWithAttributes (giữ màu + pháp tuyến), đặt gốc ở giữa đáy cacte, ghi GLB
// KHR_mesh_quantization + EXT_meshopt_compression (vị trí int16, pháp tuyến int8, màu uint8). engBuild({ tris }) → window.__eng; engWrite(name).
window.engBuild = async (o = {}) => {
  const THREE = S.THREE, MSx = window.MS; await MSx.ready; S.root.updateMatrixWorld(true);
  const P = [], N = [], C = [], I = []; let base = 0; const v = new THREE.Vector3(), nm = new THREE.Matrix3();
  S.root.traverse(m => { if (!m.isMesh) return; const g = m.geometry, pa = g.attributes.position, na = g.attributes.normal, ca = g.attributes.color, ix = g.index; nm.getNormalMatrix(m.matrixWorld);
    for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld); P.push(v.x, v.y, v.z); v.fromBufferAttribute(na, i).applyMatrix3(nm).normalize(); N.push(v.x, v.y, v.z);
      C.push(ca ? ca.getX(i) : 0.6, ca ? ca.getY(i) : 0.6, ca ? ca.getZ(i) : 0.6); }
    for (let i = 0; i < ix.count; i++) I.push(base + ix.getX(i)); base += pa.count; });
  // hàn theo vị trí (lưới quét: khúc liền nhau) → trung bình pháp tuyến + màu
  const map = new Map(), wP = [], wN = [], wC = [], cnt = [], remap = new Uint32Array(P.length / 3);
  for (let i = 0; i < P.length / 3; i++) { const key = Math.round(P[i * 3] * 2e4) + ',' + Math.round(P[i * 3 + 1] * 2e4) + ',' + Math.round(P[i * 3 + 2] * 2e4); let id = map.get(key);
    if (id === undefined) { id = cnt.length; map.set(key, id); wP.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]); wN.push(0, 0, 0); wC.push(0, 0, 0); cnt.push(0); }
    for (let a = 0; a < 3; a++) { wN[id * 3 + a] += N[i * 3 + a]; wC[id * 3 + a] += C[i * 3 + a]; } cnt[id]++; remap[i] = id; }
  const nv = cnt.length, pos = new Float32Array(wP), att = new Float32Array(nv * 6);
  for (let i = 0; i < nv; i++) { const l = Math.hypot(wN[i * 3], wN[i * 3 + 1], wN[i * 3 + 2]) || 1; for (let a = 0; a < 3; a++) { att[i * 6 + a] = wC[i * 3 + a] / cnt[i]; att[i * 6 + 3 + a] = wN[i * 3 + a] / l; } }
  const idx = []; for (let t = 0; t < I.length; t += 3) { const a = remap[I[t]], b = remap[I[t + 1]], c = remap[I[t + 2]]; if (a !== b && b !== c && a !== c) idx.push(a, b, c); }
  const target = (o.tris || 28000) * 3, scale = MSx.getScale(pos, 3);
  const [out, err] = MSx.simplifyWithAttributes(new Uint32Array(idx), pos, 3, att, 6, o.w || [0.6, 0.6, 0.6, 0.25, 0.25, 0.25], null, target, o.err ?? 0.01, []);
  // gọn đỉnh + gốc toạ độ ở giữa đáy (cacte)
  const used = new Int32Array(nv).fill(-1), F = [], A = [], J = new Uint32Array(out.length); let k = 0;
  for (let i = 0; i < out.length; i++) { const id = out[i]; if (used[id] < 0) { used[id] = k++; F.push(pos[id * 3], pos[id * 3 + 1], pos[id * 3 + 2]); for (let a = 0; a < 6; a++) A.push(att[id * 6 + a]); } J[i] = used[id]; }
  let mn = [9, 9, 9], mx = [-9, -9, -9]; for (let i = 0; i < F.length; i += 3) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], F[i + a]); mx[a] = Math.max(mx[a], F[i + a]); }
  const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2, y0 = mn[1]; for (let i = 0; i < F.length; i += 3) { F[i] -= cx; F[i + 1] -= y0; F[i + 2] -= cz; }
  window.__eng = { P: new Float32Array(F), A: new Float32Array(A), I: J, size: [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]] };
  return { srcTris: I.length / 3, welded: nv, tris: J.length / 3, verts: k, err: +(err * scale).toFixed(5), size: window.__eng.size.map(x => +x.toFixed(3)) };
};
window.engWrite = async (name = 'engine.glb') => {
  const ENC = window.MSE; await ENC.ready; const E = window.__eng, n0 = E.P.length / 3;
  const I32 = new Uint32Array(E.I), [remap, n] = ENC.reorderMesh(I32, true, true);
  const P = new Float32Array(n * 3), A = new Float32Array(n * 6); for (let i = 0; i < n0; i++) { const r = remap[i]; if (r === 0xffffffff) continue; P.set(E.P.subarray(i * 3, i * 3 + 3), r * 3); A.set(E.A.subarray(i * 6, i * 6 + 6), r * 6); }
  const mn = [9, 9, 9], mx = [-9, -9, -9]; for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], P[i * 3 + a]); mx[a] = Math.max(mx[a], P[i * 3 + a]); }
  const ctr = mn.map((x, a) => (x + mx[a]) / 2), half = Math.max(...mn.map((x, a) => (mx[a] - x) / 2));
  const qp = new Int16Array(n * 4), qn = new Int8Array(n * 4), qc = new Uint8Array(n * 4), pmn = [32767, 32767, 32767], pmx = [-32767, -32767, -32767];
  for (let i = 0; i < n; i++) { for (let a = 0; a < 3; a++) { const q = Math.round((P[i * 3 + a] - ctr[a]) / half * 32767); qp[i * 4 + a] = q; pmn[a] = Math.min(pmn[a], q); pmx[a] = Math.max(pmx[a], q);
    qn[i * 4 + a] = Math.round(Math.max(-1, Math.min(1, A[i * 6 + 3 + a])) * 127); qc[i * 4 + a] = Math.round(Math.max(0, Math.min(1, A[i * 6 + a])) * 255); } qc[i * 4 + 3] = 255; }
  const bin = [], al = x => (x + 3) & ~3; let binLen = 0, fbLen = 0;
  const push = u8 => { const off = binLen; bin.push(u8); binLen += u8.length; const pad = al(binLen) - binLen; if (pad) { bin.push(new Uint8Array(pad)); binLen += pad; } return off; };
  const J = { asset: { version: '2.0', generator: '3d-garden engbuild', extras: { title: 'Nelson Racing Engine B', author: 'Rudy (https://sketchfab.com/Rudy27)', license: 'CC-BY-4.0',
      source: 'https://sketchfab.com/3d-models/nelson-racing-engine-b-d6049e7c74544f13b3247f7c597837fc', note: 'Modified: merged, decimated (1.9M → ~28k triangles, vertex colours kept), origin at the sump bottom, compressed' } },
    extensionsUsed: ['EXT_meshopt_compression', 'KHR_mesh_quantization'], extensionsRequired: ['EXT_meshopt_compression', 'KHR_mesh_quantization'],
    scene: 0, scenes: [{ nodes: [1] }], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [], materials: [{ name: 'engine', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.7 } }] };
  const view = (u8, count, stride, mode, target) => { const enc = mode === 'TRIANGLES' ? ENC.encodeIndexBuffer(u8, count, stride) : ENC.encodeVertexBuffer(u8, count, stride), off = push(enc), fb = fbLen; fbLen += al(u8.length);
    J.bufferViews.push({ buffer: 1, byteOffset: fb, byteLength: u8.length, ...(mode === 'ATTRIBUTES' ? { byteStride: stride } : {}), target, extensions: { EXT_meshopt_compression: { buffer: 0, byteOffset: off, byteLength: enc.length, byteStride: stride, count, mode } } });
    return J.bufferViews.length - 1; };
  const acc = a => { J.accessors.push(a); return J.accessors.length - 1; };
  const I16 = n < 65536 ? new Uint16Array(I32) : I32;
  const prim = { attributes: { POSITION: acc({ bufferView: view(new Uint8Array(qp.buffer), n, 8, 'ATTRIBUTES', 34962), componentType: 5122, normalized: true, count: n, type: 'VEC3', min: pmn, max: pmx }),
      NORMAL: acc({ bufferView: view(new Uint8Array(qn.buffer), n, 4, 'ATTRIBUTES', 34962), componentType: 5120, normalized: true, count: n, type: 'VEC3' }),
      COLOR_0: acc({ bufferView: view(qc, n, 4, 'ATTRIBUTES', 34962), componentType: 5121, normalized: true, count: n, type: 'VEC4' }) },
    indices: acc({ bufferView: view(new Uint8Array(I16.buffer), I16.length, I16.BYTES_PER_ELEMENT, 'TRIANGLES', 34963), componentType: I16.BYTES_PER_ELEMENT === 2 ? 5123 : 5125, count: I16.length, type: 'SCALAR' }), material: 0 };
  J.meshes.push({ name: 'engine', primitives: [prim] });
  J.nodes.push({ name: 'Engine_q', mesh: 0, translation: ctr, scale: [half, half, half] }, { name: 'Engine', children: [0] });
  J.buffers.push({ byteLength: binLen }, { byteLength: fbLen, extensions: { EXT_meshopt_compression: { fallback: true } } });
  const js = new TextEncoder().encode(JSON.stringify(J)), jl = al(js.length), total = 28 + jl + binLen, glb = new Uint8Array(total), dv = new DataView(glb.buffer);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true); dv.setUint32(12, jl, true); dv.setUint32(16, 0x4E4F534A, true); glb.set(js, 20); for (let i = js.length; i < jl; i++) glb[20 + i] = 0x20;
  let off = 20 + jl; dv.setUint32(off, binLen, true); dv.setUint32(off + 4, 0x004E4942, true); off += 8; for (const u8 of bin) { glb.set(u8, off); off += u8.length; }
  window.__engGlb = glb; await fetch('/upload?name=' + name, { method: 'POST', body: new Blob([glb]) });
  return { bytes: total, verts: n, tris: I16.length / 3 };
};
window.engbuildReady = true;
