// tách chi phí ở góc rễ ×30: bình thường · bỏ đọc 2 lớp bóng (hộp ra xa) · ẩn rễ · ẩn rễ + lá rêu
simSetup(); const THREE = __dbg.THREE, R = __dbg.renderer, S = __dbg.scene, out = {}, H = +window.__hourOverride;
R.setPixelRatio(1); runFor(3, H); __ev('lensRender = dt => renderer.render(scene, camera)'); __ev('vanAoAsked = true');
const isNew = __ev('typeof OT_SHADE !== "undefined"');
const T = S.getObjectByName('Cây cổ thụ (Old Tree)'), P = T.getWorldPosition(new THREE.Vector3()), gy = __ev(`cowY(${P.x}, ${P.z})`), cam = __ev('camera');
__dbg.view(P.x, gy + 0.5, P.z, Math.PI * 0.27, 0.9, 16);
const orig = R.render; let f = 0; R.render = () => {};
try { while (f < 900) { __dbg.frames(1); f++; if (isNew ? (__ev('SKY.stat') && __ev('SKY_U.uSkB.value') && !__ev('AOB.job') && !__ev('AOB.q.length') && !__ev('SKY.pre.length + SKY.pend.length') && f >= 25) : f >= 25) break; } } finally { R.render = orig; }
__dbg.view(P.x + 1, gy + 0.2, P.z + 1, Math.PI * 0.27, 0.9, 30); __dbg.frames(3);
const gl = R.getContext(), px = new Uint8Array(4), timeIt = n => { for (let i = 0; i < 5; i++) R.render(S, cam); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t = performance.now(); for (let i = 0; i < n; i++) { R.render(S, cam); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } return +((performance.now() - t) / n).toFixed(2); };
const Rt = S.getObjectByName('Rễ cây cổ thụ'), ML = __ev('mossLawn');
const runs = [];
for (let rep = 0; rep < 3; rep++) {
  const r = {}; r.normal = timeIt(30);
  if (isNew) { const A = __ev('SKY_U'), a = A.uSkAB.value.clone(), b = A.uSkBB.value.clone(); A.uSkAB.value.x = A.uSkBB.value.x = 1e9; r.noLayers = timeIt(30); A.uSkAB.value.copy(a); A.uSkBB.value.copy(b); }
  Rt.visible = false; r.noRoots = timeIt(30);
  const mv = ML.meshes.map(m => m.visible); ML.meshes.forEach(m => { m.visible = false; }); const tk = ML.tick; ML.tick = () => {}; r.noRootsMoss = timeIt(30); ML.tick = tk; ML.meshes.forEach((m, i) => { m.visible = mv[i]; }); Rt.visible = true;
  runs.push(r);
}
out.isNew = isNew; out.runs = runs; return out;
