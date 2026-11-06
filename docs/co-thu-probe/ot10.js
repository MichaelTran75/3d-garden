// tách chi phí TRƯỚC / SAU: ở góc all + root, 3 vòng xen kẽ: bình thường · bỏ đọc 2 lớp (hộp ra xa, chỉ bản mới) · ẩn lá rêu · ẩn rễ — trung vị
simSetup(); const THREE = __dbg.THREE, R = __dbg.renderer, dom = R.domElement, S = __dbg.scene, shots = [], out = {}, H = +window.__hourOverride;
R.setPixelRatio(1); runFor(3, H); __ev('lensRender = dt => renderer.render(scene, camera)'); __ev('vanAoAsked = true');
for (const o of S.children) if (o.isSprite) o.visible = false;
await new Promise(r => setTimeout(r, 50));
const isNew = __ev('typeof OT_SHADE !== "undefined"'); out.isNew = isNew;
const T = S.getObjectByName('Cây cổ thụ (Old Tree)'), P = T.getWorldPosition(new THREE.Vector3()), gy = __ev(`cowY(${P.x}, ${P.z})`);
__dbg.view(P.x, gy + 0.5, P.z, Math.PI * 0.27, 0.9, 16);
const orig = R.render; let f = 0; R.render = () => {};
try { while (f < 900) { __dbg.frames(1); f++; if (isNew ? (__ev('SKY.stat') && __ev('SKY_U.uSkB.value') && !__ev('AOB.job') && !__ev('AOB.q.length') && !__ev('SKY.pre.length + SKY.pend.length') && f >= 25) : f >= 25) break; } } finally { R.render = orig; }
out.frames = f; await new Promise(r => setTimeout(r, 1700)); __dbg.frames(2);
const V = [['all', [P.x, gy + 5, P.z], 0.27, 0.9, 5], ['base', [P.x, gy + 0.5, P.z], 0.27, 0.9, 16], ['root', [P.x + 1, gy + 0.2, P.z + 1], 0.27, 0.9, 30], ['bark', [P.x, gy + 2.5, P.z], 0.27, 1.2, 30], ['low', [P.x, gy + 0.6, P.z], 1.1, 1.35, 14], ['side', [P.x, gy + 0.4, P.z], -0.4, 1.15, 20]];
const gl = R.getContext(), px = new Uint8Array(4), cam = __ev('camera'), timeIt = n => { for (let i = 0; i < 5; i++) R.render(S, cam); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t = performance.now(); for (let i = 0; i < n; i++) { R.render(S, cam); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } return +((performance.now() - t) / n).toFixed(2); };
const Rt = S.getObjectByName('Rễ cây cổ thụ'), ML = __ev('mossLawn'), A = isNew ? __ev('SKY_U') : null;
const tog = { normal: [() => {}, () => {}], noLayers: [() => { if (A) { A._a = A.uSkAB.value.x; A._b = A.uSkBB.value.x; A.uSkAB.value.x = A.uSkBB.value.x = 1e9; } }, () => { if (A) { A.uSkAB.value.x = A._a; A.uSkBB.value.x = A._b; } }],
  noMoss: [() => { ML._v = ML.meshes.map(m => m.visible); ML.meshes.forEach(m => { m.visible = false; }); ML._t = ML.tick; ML.tick = () => {}; }, () => { ML.tick = ML._t; ML.meshes.forEach((m, i) => { m.visible = ML._v[i]; }); }],
  noRoots: [() => { Rt.visible = false; }, () => { Rt.visible = true; }] };
const M = {}; for (let r = 0; r < 3; r++) for (const [n, p, th, ph, z] of [V[0], V[2]]) { __dbg.view(p[0], p[1], p[2], Math.PI * th, ph, z); __dbg.frames(3); for (const k in tog) { if (k === 'noLayers' && !isNew) continue; tog[k][0](); (M[n + '.' + k] ||= []).push(timeIt(30)); tog[k][1](); } }
out.ms = {}; for (const n in M) { const a = M[n].slice().sort((x, y) => x - y); out.ms[n] = a[1]; }
out.err = R.getContext().getError(); return out;
