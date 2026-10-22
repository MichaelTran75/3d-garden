// "P-0301 B" (athar_faz, CC-BY-4.0 — cụm bơm công nghiệp: 93 lưới, ~136k tam giác, mọi vật liệu xám 0,8, không texture) → pump.glb cho 3d-garden.
// Chạy trong study.html (../transit/). Lấy 2 cụm, bỏ phần còn lại (khung đế 17 m, cầu thang, lan can, hệ dầu bôi trơn, ống lớn, tủ điện):
//   pump  — bơm ly tâm vỏ tách đôi (MOTOR_B) + vòng bu-lông mặt ghép (PAKU_MOTOR) + gối đỡ đầu trục (motor2) + chụp khớp nối (TENGAH_PUTIH) + động cơ
//           điện hình trụ (TENGAH) + hộp đầu trục động cơ (TENGAH3, bỏ cần đứng cao 1,9 m). Bỏ bó ống đo nhỏ lòng thòng (motor1).
//           Gốc = tâm đáy cụm, trục bơm dọc +Z (động cơ phía −Z), 2 mặt bích họng bơm hướng ±X; đơn vị mét × SC.
//   valve — van chặn nhỏ có vô-lăng (LUBEOIL VALVE_3): gốc = tâm thân van, ống đi dọc X, vô-lăng phía +Y; đơn vị mét (×1, trang tự phóng theo cỡ ống).
// Màu đỉnh (mẫu không có màu): vỏ + gối đỡ xanh dương, bu-lông thép sẫm, chụp khớp nối vàng an toàn, động cơ + hộp xám xanh, vô-lăng đỏ, thân van xám.
// Điểm neo (mét, hệ bộ phận) trong extras: pump.inX / outX (tâm mặt bích họng +X / −X), len (dài cụm), motorY0 (đáy động cơ), motorZ (khoảng z động cơ +
// hộp — để trang kê bệ), caseY0 (đáy vỏ bơm) · valve.half (nửa dài thân van theo X), wheelY (đỉnh vô-lăng), bodyY (tâm thân van — đặt trùng tâm ống).
// pumpBuild({ scale, ratio, err }) → window.__pump; pumpWrite(name) → shots/<name> (GLB KHR_mesh_quantization + EXT_meshopt_compression).
window.pumpBuild = async (o = {}) => {
  const THREE = S.THREE, MSx = window.MS; await MSx.ready; const R = S.root; R.updateMatrixWorld(true);
  const SC = o.scale ?? 0.36, RATIO = o.ratio ?? 0.4, ERR = o.err ?? 0.01;
  const SEL = [   // [khớp tên lưới, bộ phận, màu tuyến tính]
    ['(MOTOR_B)', 'pump', [0.02, 0.13, 0.32]], ['PAKU_MOTOR', 'pump', [0.045, 0.045, 0.05]], ['(motor2)', 'pump', [0.02, 0.13, 0.32]],
    ['TENGAH_PUTIH', 'pump', [0.79, 0.4, 0.01]], ['Circle011_P-0301_B_(TENGAH)', 'pump', [0.1, 0.13, 0.115]], ['(TENGAH)3', 'pump', [0.1, 0.13, 0.115]],
    ['VALVE_3_P-0301_B_LUBEOIL_(VALVE)', 'valve', null]];
  const pick = m => { for (const s of SEL) if (m.name.includes(s[0]) && !(s[1] === 'valve' && pick.valveDone && pick.valveDone !== m)) return s; return null; };
  const parts = { pump: { P: [], N: [], C: [], I: [] }, valve: { P: [], N: [], C: [], I: [] } }, stat = { src: 0, out: 0 }, v = new THREE.Vector3(), m3 = new THREE.Matrix3();
  // khung bộ phận: hộp bao (thế giới mẫu) của các lưới được chọn
  const boxes = { pump: new THREE.Box3(), valve: new THREE.Box3() }, motorB = new THREE.Box3(), caseB = new THREE.Box3();
  R.traverse(m => { if (!m.isMesh) return; const s = pick(m); if (!s) return; if (s[1] === 'valve') { if (pick.valveDone) return; pick.valveDone = m; }
    const b = new THREE.Box3().setFromObject(m); if (s[0].includes('TENGAH)3')) b.max.y = Math.min(b.max.y, b.min.y + 0.75); boxes[s[1]].union(b);
    if (/TENGAH\)$|TENGAH\)3|TENGAH\)_0/.test(s[0]) || s[0].includes('Circle011')) motorB.union(b); if (s[0] === '(MOTOR_B)') caseB.union(b); });
  const pc = boxes.pump.getCenter(new THREE.Vector3()), O = { pump: new THREE.Vector3(pc.x, boxes.pump.min.y, pc.z), valve: boxes.valve.getCenter(new THREE.Vector3()) };
  const vs = boxes.valve.getSize(new THREE.Vector3()), vAlongZ = vs.z > vs.x;   // van: đưa trục ống về X
  const toLocal = { pump: p => p.sub(O.pump).multiplyScalar(SC), valve: p => { p.sub(O.valve); if (vAlongZ) p.set(p.z, p.y, -p.x); return p; } };
  R.traverse(m => {
    if (!m.isMesh) return; const s = pick(m); if (!s || (s[1] === 'valve' && pick.valveDone !== m)) return; const part = s[1];
    const g = m.geometry, pa = g.attributes.position, flip = m3.setFromMatrix4(m.matrixWorld).determinant() < 0;
    const key = new Map(), P = [], remap = new Uint32Array(pa.count), raw = [];
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld); raw.push(v.y); toLocal[part](v);
      const k = Math.round(v.x * 2e4) + ',' + Math.round(v.y * 2e4) + ',' + Math.round(v.z * 2e4);
      let id = key.get(k); if (id === undefined) { id = P.length / 3; key.set(k, id); P.push(v.x, v.y, v.z); } remap[i] = id;
    }
    const src = g.index ? g.index.array : Uint32Array.from({ length: pa.count }, (_, i) => i); let idx = [];
    const seen = new Set();
    for (let t = 0; t < src.length; t += 3) {
      const a = remap[src[t]], b = remap[src[t + 1]], c = remap[src[t + 2]]; if (a === b || b === c || a === c) continue;
      const sk = [a, b, c].sort((x, y) => x - y).join(','); if (seen.has(sk)) continue; seen.add(sk);
      if (flip) idx.push(a, c, b); else idx.push(a, b, c);
    }
    if (s[0].includes('TENGAH)3') || s[0] === 'PAKU_MOTOR') {   // tách mảnh liền (hợp theo đỉnh đã hàn): hộp đầu trục bỏ cần đứng cao > 0,9 m · bu-lông bỏ mảnh lơ lửng trên vỏ (khớp ống đo đã bỏ)
      const n = P.length / 3, par = Int32Array.from({ length: n }, (_, i) => i), f = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
      for (let t = 0; t < idx.length; t += 3) { const a = f(idx[t]), b = f(idx[t + 1]), c = f(idx[t + 2]); par[b] = a; par[f(c)] = a; }
      const lo = new Map(), hi = new Map(); for (let i = 0; i < n; i++) { const r = f(i), y = P[i * 3 + 1]; lo.set(r, Math.min(lo.get(r) ?? 9, y)); hi.set(r, Math.max(hi.get(r) ?? -9, y)); }
      const yS = (caseB.getCenter(new THREE.Vector3()).y - O.pump.y + 0.3) * SC, ok = r => s[0] === 'PAKU_MOTOR' ? lo.get(r) < yS : (hi.get(r) - lo.get(r)) / SC < 0.9;
      const keep = []; for (let t = 0; t < idx.length; t += 3) if (ok(f(idx[t]))) keep.push(idx[t], idx[t + 1], idx[t + 2]); idx = keep;
    }
    let I = new Uint32Array(idx); const tris = I.length / 3; stat.src += tris;
    if (tris > 150) { const want = Math.max(120, Math.round(tris * RATIO)) * 3; [I] = MSx.simplify(I, new Float32Array(P), 3, want, ERR * (part === 'valve' ? 0.02 : 1), ['LockBorder']); }
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g2.setIndex(Array.from(I));
    const g3 = window.BGU.mergeVertices(window.BGU.toCreasedNormals(g2, o.crease ?? 0.6), 1e-6), p3 = g3.attributes.position, q3 = g3.attributes.normal, i3 = g3.index;
    const Q = parts[part], base = Q.P.length / 3;
    for (let i = 0; i < p3.count; i++) {
      Q.P.push(p3.getX(i), p3.getY(i), p3.getZ(i)); Q.N.push(q3.getX(i), q3.getY(i), q3.getZ(i));
      Q.C.push(...(s[2] || (p3.getY(i) > vs.y * 0.36 ? [0.46, 0.015, 0.015] : [0.12, 0.12, 0.125])));   // van: vô-lăng (phần trên) đỏ, thân xám
    }
    for (let i = 0; i < i3.count; i++) Q.I.push(base + i3.getX(i));
    stat.out += i3.count / 3;
  });
  // điểm neo: tâm 2 mặt bích họng (đỉnh vỏ bơm sát mép ±X, nửa dưới vỏ) · đáy, khoảng z động cơ
  const cs = [], Pp = parts.pump; const cl = caseB.clone(); cl.min.sub(O.pump).multiplyScalar(SC); cl.max.sub(O.pump).multiplyScalar(SC);
  for (let i = 0; i < Pp.P.length; i += 3) cs.push([Pp.P[i], Pp.P[i + 1], Pp.P[i + 2]]);
  const inCase = q => q[2] > cl.min.z && q[2] < cl.max.z && q[1] < (cl.min.y + cl.max.y) / 2;
  const flange = s => { const L = cs.filter(q => inCase(q) && s * q[0] > (s > 0 ? cl.max.x : -cl.min.x) - 0.02); const a = L.reduce((t, q) => [t[0] + q[0], t[1] + q[1], t[2] + q[2]], [0, 0, 0]).map(x => x / Math.max(1, L.length)); return a.map(x => +x.toFixed(4)); };
  const mz = [(motorB.min.z - O.pump.z) * SC, (motorB.max.z - O.pump.z) * SC].map(x => +x.toFixed(4));
  const VY = []; for (let i = 1; i < parts.valve.P.length; i += 3) VY.push(parts.valve.P[i]); const vy0 = Math.min(...VY), vy1 = Math.max(...VY), low = VY.filter(y => y < vy0 + 0.35 * (vy1 - vy0));
  const bodyY = +(low.reduce((a, y) => a + y, 0) / Math.max(1, low.length)).toFixed(4);   // tâm thân van ≈ trung bình đỉnh ở 35% dưới
  window.__pump = { parts, SC, anchors: { pump: { inX: flange(1), outX: flange(-1), len: +(boxes.pump.getSize(v).z * SC).toFixed(4), motorY0: +((motorB.min.y - O.pump.y) * SC).toFixed(4), motorZ: mz,
    caseY0: +((caseB.min.y - O.pump.y) * SC).toFixed(4), top: +((boxes.pump.max.y - O.pump.y) * SC).toFixed(4) }, valve: { half: +((vAlongZ ? vs.z : vs.x) / 2).toFixed(4), wheelY: +(boxes.valve.max.y - O.valve.y).toFixed(4), bodyY } } };
  return { srcTris: stat.src, tris: stat.out, perPart: Object.fromEntries(Object.entries(parts).map(([k, Q]) => [k, Q.I.length / 3])), anchors: window.__pump.anchors };
};
window.pumpWrite = async (name = 'pump.glb') => {
  const ENC = window.MSE; await ENC.ready; const TR = window.__pump;
  const bin = [], al = x => (x + 3) & ~3; let binLen = 0, fbLen = 0;
  const push = u8 => { const off = binLen; bin.push(u8); binLen += u8.length; const pad = al(binLen) - binLen; if (pad) { bin.push(new Uint8Array(pad)); binLen += pad; } return off; };
  const J = { asset: { version: '2.0', generator: '3d-garden pumpbuild', extras: { title: 'P-0301 B', author: 'athar_faz (https://sketchfab.com/athar_faz)', license: 'CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)',
      source: 'https://sketchfab.com/3d-models/p-0301-b-8fc4bc4bc44e423b98add2acde561995', note: 'Modified: only the split-case pump, coupling guard, motor and one small valve kept; instrument tubing and tall rod removed; decimated; vertex colours added; quantised + meshopt compressed' } },
    extensionsUsed: ['EXT_meshopt_compression', 'KHR_mesh_quantization'], extensionsRequired: ['EXT_meshopt_compression', 'KHR_mesh_quantization'],
    scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [], materials: [{ name: 'pump', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.8 } }] };
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
  J.scenes[0].nodes.push(node({ name: 'pump', children: [meshNode('pump', P.pump)], extras: A.pump }), node({ name: 'valve', children: [meshNode('valve', P.valve)], extras: A.valve }));
  J.buffers.push({ byteLength: binLen }, { byteLength: fbLen, extensions: { EXT_meshopt_compression: { fallback: true } } });
  const js = new TextEncoder().encode(JSON.stringify(J)), jl = al(js.length), total = 28 + jl + binLen, glb = new Uint8Array(total), dv = new DataView(glb.buffer);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true); dv.setUint32(12, jl, true); dv.setUint32(16, 0x4E4F534A, true); glb.set(js, 20); for (let i = js.length; i < jl; i++) glb[20 + i] = 0x20;
  let off = 20 + jl; dv.setUint32(off, binLen, true); dv.setUint32(off + 4, 0x004E4942, true); off += 8; for (const u8 of bin) { glb.set(u8, off); off += u8.length; }
  await fetch('/upload?name=' + name, { method: 'POST', body: new Blob([glb]) });
  return { bytes: total, parts: out };
};
window.pumpbuildReady = true;
