// "Chicken - rigged" (Maf'j Alvarez, CC-BY-4.0 — gà mái low-poly 736 tam giác, 7 màu phẳng, 17 xương, 7 hoạt cảnh) → chicken.glb cho 3d-garden.
// Chạy trong study.html (../transit/). Gộp 7 lưới da (cùng 1 bộ xương, cùng ma trận gắn) thành 1 lưới màu đỉnh (1 lượt vẽ / con), khớp + trọng số còn
// uint8 (trọng số chuẩn hoá lại tổng = 255), bỏ hoạt cảnh 'rest' (1 khung); mỗi rãnh hoạt cảnh lược khung: bỏ khung nội suy được từ 2 khung kề (quay
// ≤ 0,004 rad, dời ≤ 0,2% cỡ con gà, tỉ lệ ≤ 0,2%); rãnh hằng số còn 1 khung. Gốc mới 'chicken': quay 180° quanh Y (mẫu nhìn về −Z ⇒ đầu gà về +Z) và thu
// về MÉT (đứng cao CH = 0,40 m tới đỉnh mào, chân chạm y = 0 ở khung đầu của 'walking'). chickBuild({ height }) → window.__chick; chickWrite(name) → shots/<name>.
window.chickBuild = async (o = {}) => {
  const T = S.THREE, root = S.root, gl = S.gltf, CH = o.height ?? 0.4;
  S.pose('chicken-rig|walking', 0); root.updateMatrixWorld(true);
  const skinned = []; root.traverse(m => { if (m.isSkinnedMesh) skinned.push(m); });
  // ---- gộp lưới: màu vật liệu (tuyến tính) → màu đỉnh uint8 ----
  const P = [], N = [], C = [], J = [], W = [], I = []; let base = 0;
  for (const m of skinned) {
    const g = m.geometry, pa = g.attributes.position, na = g.attributes.normal, ja = g.attributes.skinIndex, wa = g.attributes.skinWeight, c = m.material.color;
    for (let i = 0; i < pa.count; i++) {
      P.push(pa.getX(i), pa.getY(i), pa.getZ(i)); N.push(na.getX(i), na.getY(i), na.getZ(i)); C.push(Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255), 255);
      const w = [wa.getX(i), wa.getY(i), wa.getZ(i), wa.getW(i)], q = w.map(x => Math.round(x * 255)), s = q.reduce((a, b) => a + b, 0);
      q[w.indexOf(Math.max(...w))] += 255 - s;   // tổng đúng 255 sau khi làm tròn
      J.push(ja.getX(i), ja.getY(i), ja.getZ(i), ja.getW(i)); W.push(...q);
    }
    const ix = g.index; for (let i = 0; i < ix.count; i++) I.push(base + ix.getX(i)); base += pa.count;
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(N, 3));
  geo.setAttribute('color', new T.Uint8BufferAttribute(C, 4, true)); geo.setAttribute('skinIndex', new T.Uint8BufferAttribute(J, 4)); geo.setAttribute('skinWeight', new T.Uint8BufferAttribute(W, 4, true));
  geo.setIndex(I);
  const m0 = skinned[0], mesh = new T.SkinnedMesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0 }));
  mesh.name = 'Chicken'; m0.parent.add(mesh); mesh.position.copy(m0.position); mesh.quaternion.copy(m0.quaternion); mesh.scale.copy(m0.scale);
  mesh.bind(m0.skeleton, m0.bindMatrix); for (const m of skinned) m.parent.remove(m);
  // ---- gốc mới: đầu về +Z, đơn vị mét, chân chạm đất ----
  root.updateMatrixWorld(true); mesh.computeBoundingBox(); const bb = mesh.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
  const sRig = root.getObjectByName('_rootJoint').getWorldScale(new T.Vector3()).y;   // 1 đv trong hệ xương = sRig đv cảnh study (trước khi đổi gốc)
  const k = CH / (bb.max.y - bb.min.y), top = new T.Group(); top.name = 'chicken'; top.rotation.y = Math.PI; top.scale.setScalar(k); top.position.y = -bb.min.y * k;
  root.parent.add(top); top.add(root);
  // ---- hoạt cảnh: bỏ 'rest', lược khung ----
  const tolQ = o.tolQ ?? 0.004, tolP = (o.tolP ?? 0.002) * (bb.max.y - bb.min.y) / sRig;
  const clips = gl.animations.filter(a => a.name !== 'chicken-rig|rest').map(a => a.clone());
  let kIn = 0, kOut = 0;
  for (const clip of clips) {
    clip.name = clip.name.replace('chicken-rig|', '');
    clip.tracks = clip.tracks.map(tr => {
      const n = tr.times.length, sz = tr.getValueSize(), V = tr.values, quat = tr.name.endsWith('.quaternion'), keep = [0];
      kIn += n;
      const err = (a, b, c) => {   // khung b nội suy tuyến tính từ a → c sai bao nhiêu
        const u = (tr.times[b] - tr.times[a]) / (tr.times[c] - tr.times[a]); let e = 0;
        if (quat) { let d = 0; for (let q = 0; q < 4; q++) d += V[a * 4 + q] * V[c * 4 + q]; const s = d < 0 ? -1 : 1; let dot = 0, nn = 0;
          for (let q = 0; q < 4; q++) { const x = V[a * 4 + q] * (1 - u) + s * V[c * 4 + q] * u; nn += x * x; } nn = Math.sqrt(nn);
          for (let q = 0; q < 4; q++) dot += (V[a * 4 + q] * (1 - u) + s * V[c * 4 + q] * u) / nn * V[b * 4 + q];
          return 2 * Math.acos(Math.min(1, Math.abs(dot))); }
        for (let q = 0; q < sz; q++) e = Math.max(e, Math.abs(V[a * sz + q] * (1 - u) + V[c * sz + q] * u - V[b * sz + q])); return e;
      };
      const tol = quat ? tolQ : tr.name.endsWith('.scale') ? 0.002 : tolP;
      for (let i = 1; i < n - 1; i++) { const a = keep[keep.length - 1]; let ok = true; for (let b = a + 1; b <= i; b++) if (err(a, b, i + 1) > tol) { ok = false; break; } if (!ok) keep.push(i); }
      if (n > 1) keep.push(n - 1);
      let K = keep; if (K.length === 2 && err(K[0], K[0], K[1]) === 0) { let same = true; for (let q = 0; q < sz; q++) if (Math.abs(V[q] - V[(n - 1) * sz + q]) > (quat ? 1e-4 : tol)) same = false; if (same) K = [0]; }
      kOut += K.length;
      const times = new Float32Array(K.map(i => tr.times[i])), vals = new Float32Array(K.length * sz); K.forEach((i, j) => vals.set(V.subarray(i * sz, i * sz + sz), j * sz));
      return new tr.constructor(tr.name, times, vals);
    });
  }
  // rãnh nào ở MỌI hoạt cảnh đều đứng yên đúng tư thế nghỉ ('rest') ⇒ bỏ hẳn (xương giữ tư thế nghỉ ghi trong nút) — bớt ~1/2 số rãnh, JSON nhỏ hẳn
  const rest = gl.animations.find(a => a.name === 'chicken-rig|rest'), restV = new Map(rest.tracks.map(t => [t.name, t.values.slice(0, t.getValueSize())])), drop = new Set();
  for (const nm of new Set(clips.flatMap(c => c.tracks.map(t => t.name)))) {
    const r = restV.get(nm); if (!r) continue; const quat = nm.endsWith('.quaternion'), tol = quat ? tolQ : nm.endsWith('.scale') ? 0.002 : tolP; let all = true;
    for (const c of clips) { const t = c.tracks.find(x => x.name === nm); if (!t) continue; const V = t.values, sz = t.getValueSize();
      for (let i = 0; i < V.length / sz && all; i++) {
        if (quat) { let d = 0; for (let q = 0; q < 4; q++) d += V[i * 4 + q] * r[q]; if (2 * Math.acos(Math.min(1, Math.abs(d))) > tol) all = false; }
        else for (let q = 0; q < sz; q++) if (Math.abs(V[i * sz + q] - r[q]) > tol) all = false; } }
    if (all) drop.add(nm);
  }
  for (const c of clips) c.tracks = c.tracks.filter(t => !drop.has(t.name));
  S.pose('chicken-rig|rest', 0); root.updateMatrixWorld(true);   // xương xuất ra ở tư thế nghỉ (rãnh đã bỏ dựa vào đây)
  window.__chick = { top, clips, mesh, dropped: drop.size };
  return { verts: P.length / 3, tris: I.length / 3, scale: +k.toFixed(6), keys: [kIn, kOut], dropped: drop.size, clips: clips.map(c => [c.name, +c.duration.toFixed(3), c.tracks.length]) };
};
window.chickWrite = async (name = 'chicken.glb') => {
  const { GLTFExporter } = await import('https://esm.sh/three@0.160.0/examples/jsm/exporters/GLTFExporter.js');
  const C = window.__chick, buf = await new Promise((res, rej) => new GLTFExporter().parse(C.top, res, rej, { binary: true, animations: C.clips }));
  const u8 = new Uint8Array(buf), dv = new DataView(u8.buffer), jl = dv.getUint32(12, true), J = JSON.parse(new TextDecoder().decode(u8.subarray(20, 20 + jl)));
  J.asset.extras = { title: 'Chicken - rigged', author: "Maf'j Alvarez (https://sketchfab.com/blujay)", license: 'CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)',
    source: 'https://sketchfab.com/3d-models/chicken-rigged-6e3b93c078114c52bfe4cfa08b9843eb', note: 'Modified: 7 meshes merged with vertex colours, uint8 joints/weights, rest clip removed, keyframes reduced, metres, faces +Z' };
  const js = new TextEncoder().encode(JSON.stringify(J)), al = x => (x + 3) & ~3, jl2 = al(js.length), binOff = 20 + jl, binLen = dv.getUint32(binOff, true);
  const out = new Uint8Array(12 + 8 + jl2 + 8 + binLen), od = new DataView(out.buffer);
  od.setUint32(0, 0x46546C67, true); od.setUint32(4, 2, true); od.setUint32(8, out.length, true); od.setUint32(12, jl2, true); od.setUint32(16, 0x4E4F534A, true); out.set(js, 20); for (let i = js.length; i < jl2; i++) out[20 + i] = 0x20;
  out.set(u8.subarray(binOff, binOff + 8 + binLen), 20 + jl2);
  await fetch('/upload?name=' + name, { method: 'POST', body: new Blob([out]) });
  return { bytes: out.length, json: jl2, bin: binLen };
};
window.chickbuildReady = true;
