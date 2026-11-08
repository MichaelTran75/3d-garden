// đo: độ cao đất (cowY) quanh gốc + dưới tán · hộp rễ / đá / nền đất · mặt đất thật (tia xuống lưới đất) so với cowY
simSetup(); const THREE = __dbg.THREE, S = __dbg.scene, out = {}, H = +window.__hourOverride; runFor(2, H);
const cowY = (x, z) => __ev(`cowY(${x}, ${z})`);
const T = S.getObjectByName('Cây cổ thụ (Old Tree)'), Rt = S.getObjectByName('Rễ cây cổ thụ'), St = S.getObjectByName('Đá hộc phủ rêu quanh gốc cổ thụ');
const P = T.getWorldPosition(new THREE.Vector3()); out.P = P.toArray().map(v => +v.toFixed(2));
const bx = o => { const b = new THREE.Box3().setFromObject(o); return [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z].map(v => +v.toFixed(2)); };
out.roots = bx(Rt); out.stonesMesh = bx(St); out.stoneGroup = bx(St.parent); out.stoneGroupPos = St.parent.position.toArray().map(v => +v.toFixed(2));
out.rootKids = []; Rt.traverse(o => { if (o.isMesh) out.rootKids.push([o.name, o.geometry.attributes.position.count, o.material.type, o.material.userData && Object.keys(o.material.userData).join(',')]); });
// cowY quanh gốc: ô 0,25 m trong hộp rễ + 1 m
const rb = out.roots; let mn = 1e9, mx = -1e9; const grid = [];
for (let z = rb[2] - 1; z <= rb[5] + 1; z += 0.5) { const row = []; for (let x = rb[0] - 1; x <= rb[3] + 1; x += 0.5) { const y = cowY(x, z); mn = Math.min(mn, y); mx = Math.max(mx, y); row.push(+y.toFixed(2)); } grid.push(row); }
out.rootGround = [+mn.toFixed(2), +mx.toFixed(2)]; out.rootGrid = grid;
// dưới tán
mn = 1e9; mx = -1e9; for (let z = -12; z <= 23; z += 1) for (let x = -56; x <= -19; x += 1) { const y = cowY(x, z); mn = Math.min(mn, y); mx = Math.max(mx, y); }
out.canopyGround = [+mn.toFixed(2), +mx.toFixed(2)];
// mặt đất thật: tia xuống, trúng vật liệu đất / cỏ / bờ
const gm = new Set([__ev('grassMat'), __ev('dirtMat'), __ev('shoreMat')]); const rc = new THREE.Raycaster(); const targets = []; S.traverse(o => { if (o.isMesh && gm.has(o.material)) targets.push(o); });
out.gTargets = targets.map(o => [o.name, o.isInstancedMesh ? o.count : 1]);
const pts = []; for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [2, 2], [-2, -2], [3, -1], [-3, 2], [4, 0], [-4, 0], [0, 4], [0, -4]]) {
  const x = P.x + dx, z = P.z + dz; rc.set(new THREE.Vector3(x, 30, z), new THREE.Vector3(0, -1, 0)); const h = rc.intersectObjects(targets, false)[0];
  pts.push([dx, dz, +cowY(x, z).toFixed(3), h ? +h.point.y.toFixed(3) : null, h ? h.object.material === __ev('grassMat') ? 'g' : h.object.material === __ev('dirtMat') ? 'd' : 's' : '-']); }
out.gPts = pts;
out.disc = (() => { let d = null; St.parent.traverse(o => { if (o.isMesh && o.geometry.type === 'CylinderGeometry') d = o; }); if (!d) return null; const b = new THREE.Box3().setFromObject(d); return [b.min.y, b.max.y].map(v => +v.toFixed(3)); })();
return out;
