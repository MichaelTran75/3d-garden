// "Grass Trimmer Machine" (Xorshift, CC-BY-4.0 — máy cắt cỏ ĐEO LƯNG: 42 lưới, 15,8k tam giác, 7 màu phẳng, không texture) → trimmer.glb cho 3d-garden.
// Chạy trong study.html (../transit/). Tách 4 bộ phận chuyển động riêng, bỏ ống mềm truyền động (vẽ lại bằng code mỗi khung theo vị trí cần):
//   pack    — khung + máy + bình xăng + đệm lưng + quai đeo; gốc = tâm MẶT đệm lưng, +Z hướng vào lưng người đeo, +X sang TRÁI người đeo, +Y lên
//   starter — tay nắm dây giật nổ máy; gốc = tâm tay nắm (ở hông trái ba lô)
//   shaft   — ống cứng + tay ga + tay cầm vòng + chắn đá + đầu nhông; gốc = đầu sau ống (chỗ nối ống mềm), +Z dọc ống về phía lưỡi
//   blade   — lưỡi dao 2 cánh; gốc = tâm lưỡi, trục quay = +Z cục bộ (con của shaft, TRS ghi trong nút)
// Bỏ thêm vòng dây ga 'cableDobble' (từ đầu ống vòng về máy — tách cần khỏi ba lô thì lơ lửng giữa trời). Mỗi lưới 1 màu: hàn đỉnh (vị trí + pháp tuyến ⇒ giữ cạnh gãy), giảm lưới meshoptimizer, màu vật liệu → màu đỉnh; đổi ra MÉT (×0,24/đv mẫu: khung ba lô cao
// 0,63 m, rộng 0,5 m; ống 1,63 m từ đầu sau tới tâm lưỡi; lưỡi Ø 0,45 m). Điểm neo (mét, hệ bộ phận) ghi trong extras của nút: pack.outlet (đầu ống mềm),
// strapL / strapR (đỉnh quai vai), top (thanh xách trên khung), port (lỗ dây giật), base (đáy khung) · shaft.grip (tay ga), loop (đỉnh tay cầm vòng), blade (tâm lưỡi).
// trimBuild({ scale, ratio, err }) → window.__trim; trimWrite(name) → shots/<name> (GLB KHR_mesh_quantization + EXT_meshopt_compression).
window.trimBuild = async (o = {}) => {
  const THREE = S.THREE, MSx = window.MS; await MSx.ready; const R = S.root; R.updateMatrixWorld(true);
  const SC = o.scale ?? 0.24, RATIO = o.ratio ?? 0.35, ERR = o.err ?? 0.004;
  // màu tuyến tính (vật liệu gốc: kim loại đen / dây đen là 0 tuyệt đối ⇒ nâng nhẹ cho thấy khối; kim loại 0,8 có metallic ⇒ xám vừa như thép dưới đèn Lambert)
  const COL = { MetalBlack: [0.03, 0.03, 0.032], Orange: [0.8, 0.07, 0.0], BlackRope: [0.022, 0.022, 0.022], WhitePlastic: [0.74, 0.74, 0.71], Metal: [0.42, 0.44, 0.46], Black: [0.015, 0.015, 0.015], Gass: [0.31, 0.41, 0.3] };
  const box = n => new THREE.Box3().setFromObject(R.getObjectByName(n));
  const bp = box('backpillow'), padO = new THREE.Vector3((bp.min.x + bp.max.x) / 2, (bp.min.y + bp.max.y) / 2, bp.max.z);
  const stickO = new THREE.Vector3().setFromMatrixPosition(R.getObjectByName('Stick').matrixWorld);
  const bladeP = new THREE.Vector3(), bladeQ = new THREE.Quaternion(); R.getObjectByName('blade').matrixWorld.decompose(bladeP, bladeQ, new THREE.Vector3());
  const stB = box('Starter'), stO = stB.getCenter(new THREE.Vector3());
  const bladeInv = new THREE.Matrix4().compose(bladeP, bladeQ, new THREE.Vector3(1, 1, 1)).invert();
  const partOf = m => { for (let p = m; p; p = p.parent) { if (p.name === 'cableDobble') return null; if (p.name === 'blade') return 'blade'; if (p.name === 'Starter') return 'starter'; if (p.name === 'BigCable') return 'cable'; if (p.name === 'Stick') return 'shaft'; if (p.name === 'Frame') return 'pack'; } return null; };
  const toLocal = { pack: v => v.sub(padO).multiplyScalar(SC), starter: v => v.sub(stO).multiplyScalar(SC), shaft: v => v.sub(stickO).multiplyScalar(SC), blade: v => v.applyMatrix4(bladeInv).multiplyScalar(SC) };
  const parts = { pack: { P: [], N: [], C: [], I: [] }, starter: { P: [], N: [], C: [], I: [] }, shaft: { P: [], N: [], C: [], I: [] }, blade: { P: [], N: [], C: [], I: [] } };
  const cablePts = [], strapPts = [], framePts = [], stat = { src: 0, out: 0 };
  const v = new THREE.Vector3(), m3 = new THREE.Matrix3();
  R.traverse(m => {
    if (!m.isMesh) return; const part = partOf(m); if (!part) return;
    const g = m.geometry, pa = g.attributes.position;
    if (part === 'cable') { for (let i = 0; i < pa.count; i++) cablePts.push(v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld).clone()); return; }
    if (m.name.startsWith('Strap_')) for (let i = 0; i < pa.count; i++) strapPts.push(v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld).clone());
    if (m.name.startsWith('Frame_')) for (let i = 0; i < pa.count; i++) framePts.push(v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld).clone());
    const flip = m3.setFromMatrix4(m.matrixWorld).determinant() < 0;
    const col = COL[(Array.isArray(m.material) ? m.material[0] : m.material).name] || [0.5, 0.5, 0.5];
    // hàn đỉnh theo VỊ TRÍ (mẫu xuất từ Sketchfab tách đỉnh theo pháp tuyến / mảnh UV ⇒ không hàn thì mọi cạnh là biên, giảm lưới bị khoá), bỏ tam giác trùng
    //  (tay cầm vòng 2.304 tam giác = 2 lớp mặt ngược nhau) ⇒ giảm lưới → pháp tuyến gãy lại theo góc (toCreasedNormals 34°) → hàn theo (vị trí, pháp tuyến)
    const key = new Map(), P = [], remap = new Uint32Array(pa.count);
    for (let i = 0; i < pa.count; i++) {
      toLocal[part](v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld));
      const k = Math.round(v.x * 2e4) + ',' + Math.round(v.y * 2e4) + ',' + Math.round(v.z * 2e4);
      let id = key.get(k); if (id === undefined) { id = P.length / 3; key.set(k, id); P.push(v.x, v.y, v.z); } remap[i] = id;
    }
    const src = g.index ? g.index.array : Uint32Array.from({ length: pa.count }, (_, i) => i), idx = [], seen = new Set();
    for (let t = 0; t < src.length; t += 3) {
      const a = remap[src[t]], b = remap[src[t + 1]], c = remap[src[t + 2]]; if (a === b || b === c || a === c) continue;
      const s = [a, b, c].sort((x, y) => x - y).join(','); if (seen.has(s)) continue; seen.add(s);
      if (flip) idx.push(a, c, b); else idx.push(a, b, c);
    }
    let I = new Uint32Array(idx); const tris = I.length / 3; stat.src += tris;
    if (tris > 120) { const want = Math.max(100, Math.round(tris * RATIO)) * 3; [I] = MSx.simplify(I, new Float32Array(P), 3, want, ERR, ['LockBorder']); }
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g2.setIndex(Array.from(I));
    const g3 = window.BGU.mergeVertices(window.BGU.toCreasedNormals(g2, o.crease ?? 0.6), 1e-6), p3 = g3.attributes.position, q3 = g3.attributes.normal, i3 = g3.index;
    const Q = parts[part], base = Q.P.length / 3;
    for (let i = 0; i < p3.count; i++) { Q.P.push(p3.getX(i), p3.getY(i), p3.getZ(i)); Q.N.push(q3.getX(i), q3.getY(i), q3.getZ(i)); Q.C.push(...col); }   // pháp tuyến tính lại trong hệ bộ phận
    for (let i = 0; i < i3.count; i++) Q.I.push(base + i3.getX(i));
    stat.out += i3.count / 3;
  });
  // điểm neo (mét, hệ bộ phận)
  const avg = L => L.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(Math.max(1, L.length));
  const zMin = Math.min(...cablePts.map(p => p.z)), outlet = toLocal.pack(avg(cablePts.filter(p => p.z < zMin + 0.06)));
  const sTop = Math.max(...strapPts.map(p => p.y)), sT = strapPts.filter(p => p.y > sTop - 0.12);
  const strapL = toLocal.pack(avg(sT.filter(p => p.x > 0))), strapR = toLocal.pack(avg(sT.filter(p => p.x < 0)));
  const fTop = Math.max(...framePts.map(p => p.y)), top = toLocal.pack(avg(framePts.filter(p => p.y > fTop - 0.05)));
  const base = toLocal.pack(new THREE.Vector3(padO.x, Math.min(...framePts.map(p => p.y)), padO.z));
  const port = toLocal.pack(new THREE.Vector3(stB.min.x, stO.y, stO.z)), starterAt = toLocal.pack(stO.clone());
  const th = box('throtle'), grip = toLocal.shaft(new THREE.Vector3(stickO.x, stickO.y + 0.12, (th.min.z + th.max.z) / 2));
  const hd = box('Handle'), loop = toLocal.shaft(new THREE.Vector3(stickO.x, hd.max.y - 0.05, (hd.min.z + hd.max.z) / 2));
  const bladeAt = toLocal.shaft(bladeP.clone()), r = a => a.toArray().map(x => +x.toFixed(4));
  window.__trim = { parts, SC, anchors: { pack: { outlet: r(outlet), strapL: r(strapL), strapR: r(strapR), top: r(top), base: r(base), port: r(port), starter: r(starterAt) },
    shaft: { grip: r(grip), loop: r(loop), blade: r(bladeAt) } }, bladeQ: bladeQ.toArray().map(x => +x.toFixed(6)) };
  return { srcTris: stat.src, tris: stat.out, perPart: Object.fromEntries(Object.entries(parts).map(([k, Q]) => [k, Q.I.length / 3])), anchors: window.__trim.anchors };
};
window.trimWrite = async (name = 'trimmer.glb') => {
  const ENC = window.MSE; await ENC.ready; const TR = window.__trim;
  const bin = [], al = x => (x + 3) & ~3; let binLen = 0, fbLen = 0;
  const push = u8 => { const off = binLen; bin.push(u8); binLen += u8.length; const pad = al(binLen) - binLen; if (pad) { bin.push(new Uint8Array(pad)); binLen += pad; } return off; };
  const J = { asset: { version: '2.0', generator: '3d-garden trimbuild', extras: { title: 'Grass Trimmer Machine', author: 'Xorshift (https://sketchfab.com/Xorshift)', license: 'CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)',
      source: 'https://sketchfab.com/3d-models/grass-trimmer-machine-0f57fcf619a94150afc5202689fc0309', note: 'Modified: split into pack / starter / shaft / blade, flexible drive cable removed (drawn in code), decimated, material colours baked to vertex colours, metres, compressed' } },
    extensionsUsed: ['EXT_meshopt_compression', 'KHR_mesh_quantization'], extensionsRequired: ['EXT_meshopt_compression', 'KHR_mesh_quantization'],
    scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [], materials: [{ name: 'trimmer', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.8 } }] };
  const view = (u8, count, stride, mode, target) => { const enc = mode === 'TRIANGLES' ? ENC.encodeIndexBuffer(u8, count, stride) : ENC.encodeVertexBuffer(u8, count, stride), off = push(enc), fb = fbLen; fbLen += al(u8.length);
    J.bufferViews.push({ buffer: 1, byteOffset: fb, byteLength: u8.length, ...(mode === 'ATTRIBUTES' ? { byteStride: stride } : {}), target, extensions: { EXT_meshopt_compression: { buffer: 0, byteOffset: off, byteLength: enc.length, byteStride: stride, count, mode } } });
    return J.bufferViews.length - 1; };
  const acc = a => { J.accessors.push(a); return J.accessors.length - 1; };
  const node = nd => { J.nodes.push(nd); return J.nodes.length - 1; };
  const out = {};
  function meshNode(nameP, Q) {   // lưới lượng tử hoá (int16 / int8 / uint8) dưới 1 nút con mang phép đổi về mét
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
    J.meshes.push({ name: nameP, primitives: [prim] }); out[nameP] = { verts: n, tris: I16.length / 3 };
    return node({ name: nameP + '_q', mesh: J.meshes.length - 1, translation: ctr, scale: [half, half, half] });
  }
  const A = TR.anchors, P = TR.parts;
  const blade = node({ name: 'blade', translation: A.shaft.blade, rotation: TR.bladeQ, children: [meshNode('blade', P.blade)] });
  const shaft = node({ name: 'shaft', children: [meshNode('shaft', P.shaft), blade], extras: A.shaft });
  const starter = node({ name: 'starter', translation: A.pack.starter, children: [meshNode('starter', P.starter)] });
  const pack = node({ name: 'pack', children: [meshNode('pack', P.pack), starter], extras: A.pack });
  J.scenes[0].nodes.push(pack, shaft);
  J.buffers.push({ byteLength: binLen }, { byteLength: fbLen, extensions: { EXT_meshopt_compression: { fallback: true } } });
  const js = new TextEncoder().encode(JSON.stringify(J)), jl = al(js.length), total = 28 + jl + binLen, glb = new Uint8Array(total), dv = new DataView(glb.buffer);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true); dv.setUint32(12, jl, true); dv.setUint32(16, 0x4E4F534A, true); glb.set(js, 20); for (let i = js.length; i < jl; i++) glb[20 + i] = 0x20;
  let off = 20 + jl; dv.setUint32(off, binLen, true); dv.setUint32(off + 4, 0x004E4942, true); off += 8; for (const u8 of bin) { glb.set(u8, off); off += u8.length; }
  await fetch('/upload?name=' + name, { method: 'POST', body: new Blob([glb]) });
  return { bytes: total, parts: out };
};
window.trimbuildReady = true;
