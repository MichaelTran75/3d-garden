simSetup(); const THREE = __dbg.THREE, R = __dbg.renderer, S = __dbg.scene, shots = [], out = {}, H = +window.__hourOverride;
const CFG = window.__otCfg || {};
runFor(3, H); for (const o of S.children) if (o.isSprite) o.visible = false;
const T = S.getObjectByName('Cây cổ thụ (Old Tree)'), P = T.getWorldPosition(new THREE.Vector3()), gy = __ev(`cowY(${P.x}, ${P.z})`);
T.updateMatrixWorld(true);
const orig = R.render; let f = 0; R.render = () => {};
__dbg.view(P.x, gy + 5, P.z, 0.8, 1.2, 12);
try { while (f < 600) { __dbg.frames(1); f++; if (f >= 25 && __ev('SKY.stat') && !__ev('AOB.job') && !__ev('AOB.q.length') && !__ev('SKY.pre.length + SKY.pend.length')) break; } } finally { R.render = orig; }
out.frames = f; await new Promise(r => setTimeout(r, 1200)); window.__hourOverride = H; __dbg.frames(2);
const kids = []; T.traverse(o => { if (o.isMesh) kids.push({ n: o.name, inst: o.isInstancedMesh ? o.count : 0, v: o.geometry.attributes.position.count, tri: (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3, par: o.parent.name }); });
out.kids = kids; const bb = new THREE.Box3(); { const L = T.userData.leafPts, v = new THREE.Vector3(); for (let k = 0; k < L.length; k += 3) bb.expandByPoint(v.set(L[k], L[k + 1], L[k + 2]).applyMatrix4(T.matrixWorld)); } out.box = [bb.min.x, bb.min.y, bb.min.z, bb.max.x, bb.max.y, bb.max.z].map(v => +v.toFixed(1)); out.nLeafPts = T.userData.leafPts.length / 3;
out.calls = R.info.render.calls; out.progs = R.info.programs.length;
const leaves = []; T.traverse(o => { if (o.isInstancedMesh) leaves.push(o); });
const cx = P.x - 5, cz = P.z + 1.5, cy = gy + 9;
const views = CFG.views || [['a', 0.8, 1.25], ['b', 0.8 + Math.PI / 2, 1.25], ['c', 0.8 + Math.PI, 1.25], ['d', 0.8 - Math.PI / 2, 1.25], ['top', 0.8, 0.12], ['game', Math.PI * 0.25, 0.9], ['low', 0.8, 1.45]];
for (const [n, th, ph] of views) { __dbg.view(cx, cy, cz, th, ph, CFG.zoom || 9); __dbg.frames(1); shots.push([n + '_leaf.png', __dbg.snap()]);
  for (const l of leaves) l.visible = false; __dbg.frames(1); shots.push([n + '_bare.png', __dbg.snap()]); for (const l of leaves) l.visible = true; }
return { shots, out };
