// bóng góc nội thất xe — bản 2: lượt vẽ riêng của xe trước / sau, đỉnh lô xe, số đỉnh theo mảnh, ảnh trước / sau ở 3 góc xem xuyên
simSetup(); __ev('typeof CAMP_AO !== "undefined" && CAMP_AO.forEach(C => C.asked = true)');   /* khu trại không nướng chen (05/11) ⇒ AOB.stat là của xe */ const THREE = __dbg.THREE, R = __dbg.renderer, dom = R.domElement, gl = R.getContext(), shots = [], out = {};
runFor(3, +window.__hourOverride);
__ev('lensRender = dt => renderer.render(scene, camera)'); __ev('vanAoAsked = true');
const V = __ev('VAN'), C = __ev('caravanObj'), S = __ev('scene'), cam = __ev('camera'), DB = __ev('drawBatches'); V.setXray(true);
const vb = DB.filter(b => b.roots.includes(C)).flatMap(b => b.meshes);
const p = new THREE.Vector3(); C.getWorldPosition(p);
const vanCalls = () => { const hid = []; for (const o of S.children) if (o !== C && !o.isLight && !vb.includes(o) && o.visible) { o.visible = false; hid.push(o); } R.render(S, cam); const r = [R.info.render.calls, R.info.render.triangles]; hid.forEach(o => o.visible = true); return r; };
const bv = () => vb.reduce((s, m) => s + m.geometry.attributes.position.count, 0);
const views = [[0.27, 30], [0.77, 30], [1.27, 24]];
const snap = tag => views.forEach(([th, z], i) => { __dbg.view(p.x, p.y + 1.2, p.z, Math.PI * th, 0.9, z); __dbg.frames(2); shots.push([`ao${i}_${tag}.png`, dom.toDataURL('image/png')]); if (i === 0) { out['calls_' + tag] = R.info.render.calls; out['van_' + tag] = vanCalls(); out['bv_' + tag] = bv(); } });
snap('0');
__ev('aoBake(caravanObj, { box: VAN_AO_BOX, skip: o => caravanRole(o) === "shell" })');
const AOB = __ev('AOB'), orig = R.render; let f = 0; const t0 = performance.now();
R.render = () => {}; try { while ((AOB.job || AOB.q.length) && f < 3000) { __dbg.frames(1); f++; } } finally { R.render = orig; }
out.frames = f; out.wall = Math.round(performance.now() - t0); out.stat = AOB.stat;
let left = 0; C.traverse(o => { if (o.userData.aoGeo) left++; }); out.aoGeoLeft = left;
snap('1');
out.err = gl.getError(); out.shots = shots; return out;
