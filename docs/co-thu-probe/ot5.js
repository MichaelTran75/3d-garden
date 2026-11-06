// số lá rêu, đỉnh rễ, tam giác + lượt vẽ ở 3 góc (so bản cũ / mới)
simSetup(); const THREE = __dbg.THREE, R = __dbg.renderer, S = __dbg.scene, out = {}, H = +window.__hourOverride;
R.setPixelRatio(1); runFor(3, H); __ev('lensRender = dt => renderer.render(scene, camera)'); __ev('vanAoAsked = true');
const ML = __ev('mossLawn'); out.moss = [ML.blades, ML.cand];
const Rt = S.getObjectByName('Rễ cây cổ thụ'); let rv = 0, rt = 0; Rt.traverse(o => { if (o.isMesh) { rv += o.geometry.attributes.position.count; rt += o.geometry.index.count / 3; } }); out.roots = [rv, rt];
const T = S.getObjectByName('Cây cổ thụ (Old Tree)'), P = T.getWorldPosition(new THREE.Vector3()), gy = __ev(`cowY(${P.x}, ${P.z})`), cam = __ev('camera');
const V = [['all', [P.x, gy + 5, P.z], 0.27, 0.9, 5], ['base', [P.x, gy + 0.5, P.z], 0.27, 0.9, 16], ['root', [P.x + 1, gy + 0.2, P.z + 1], 0.27, 0.9, 30]];
const ai = R.info.autoReset; R.info.autoReset = false;
for (const [n, p, th, ph, z] of V) { __dbg.view(p[0], p[1], p[2], Math.PI * th, ph, z); __dbg.frames(3); R.info.reset(); R.render(S, cam); out[n] = [R.info.render.calls, R.info.render.triangles]; }
R.info.autoReset = ai; return out;
