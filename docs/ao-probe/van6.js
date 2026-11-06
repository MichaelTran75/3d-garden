// bóng góc xe: đỉnh tăng thêm theo mảnh × hướng mặt (lên / xuống / ngang) × độ sáng vật liệu
simSetup(); __ev('typeof CAMP_AO !== "undefined" && CAMP_AO.forEach(C => C.asked = true)');   /* khu trại không nướng chen (05/11) ⇒ AOB.stat là của xe */ const THREE = __dbg.THREE, out = {};
runFor(2, +window.__hourOverride);
__ev('vanAoAsked = true'); const C = __ev('caravanObj');
__ev('VAN').setXray(true);
__ev('{ const _bar = batchAoRefresh; batchAoRefresh = objs => { window.__aoObjs = objs.map(o => [o, o.userData.aoGeo]); return _bar(objs); }; }');
const pre = new Map(); C.traverse(o => { if (o.isMesh) pre.set(o, o.geometry.attributes.position.count); });
__ev('aoBake(caravanObj, { box: VAN_AO_BOX, skip: o => caravanRole(o) === "shell" })');
const AOB = __ev('AOB'); let f = 0; const R = __dbg.renderer, orig = R.render;
R.render = () => {}; try { while ((AOB.job || AOB.q.length) && f < 3000) { __dbg.frames(1); f++; } } finally { R.render = orig; }
const list = (window.__aoObjs || []).map(([o, g]) => [o, g, true]); C.traverse(o => { if (o.userData.aoOwn) list.push([o, o.geometry, false]); });
const inv = new THREE.Matrix4().copy(C.matrixWorld).invert(), M = new THREE.Matrix4(), N3 = new THREE.Matrix3(), n = new THREE.Vector3();
const rows = [];
for (const [o, g, bat] of list) {
  M.multiplyMatrices(inv, o.matrixWorld); N3.getNormalMatrix(M);
  const P = g.attributes.position, Nn = g.attributes.normal, A = g.attributes.ao, Cc = g.attributes.color; let up = 0, dn = 0, sd = 0, dark = 0;
  for (let i = 0; i < P.count; i++) { n.fromBufferAttribute(Nn, i).applyMatrix3(N3).normalize(); if (n.y > 0.7) up++; else if (n.y < -0.7) dn++; else sd++; const l = A ? A.getX(i) : Cc.getX(i); if (l < 0.45) dark++; }
  const c = o.material.color, lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  rows.push([(o.name || o.parent.name).slice(0, 28), bat ? 'B' : 'O', pre.get(o), P.count, up, dn, sd, dark, +Math.sqrt(lum).toFixed(2), o.material.type.replace('Mesh', '').replace('Material', '')]);
}
rows.sort((a, b) => (b[3] - b[2]) - (a[3] - a[2]));
out.rows = rows.slice(0, 30); out.n = rows.length; out.stat = AOB.stat; return out;
