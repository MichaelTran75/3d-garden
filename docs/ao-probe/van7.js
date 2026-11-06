// bóng góc xe: cận cảnh 4 chỗ trong xe (xem xuyên, ×70) trước / sau
simSetup(); __ev('typeof CAMP_AO !== "undefined" && CAMP_AO.forEach(C => C.asked = true)');   /* khu trại không nướng chen (05/11) ⇒ AOB.stat là của xe */ const THREE = __dbg.THREE, R = __dbg.renderer, dom = R.domElement, shots = [], out = {};
runFor(3, +window.__hourOverride);
__ev('lensRender = dt => renderer.render(scene, camera)'); __ev('vanAoAsked = true');
const V = __ev('VAN'), C = __ev('caravanObj'); V.setXray(true);
const names = ['Bàn học nhỏ', 'Thân tủ bếp', 'Giường dọc vách đối diện', 'Phòng tắm gọn'], spots = [];
for (const nm of names) { let o = null; C.traverse(x => { if (!o && x.name === nm) o = x; }); if (!o) { spots.push(null); continue; } const bx = new THREE.Box3().setFromObject(o); spots.push(bx.getCenter(new THREE.Vector3())); }
out.found = spots.map(s => s && s.toArray().map(v => +v.toFixed(2)));
const snap = tag => spots.forEach((p, i) => { if (!p) return; __dbg.view(p.x, p.y - 0.3, p.z, Math.PI * 0.77, 0.75, 70); __dbg.frames(2); shots.push([`c${i}_${tag}.png`, dom.toDataURL('image/png')]); });
snap('0');
__ev('aoBake(caravanObj, { box: VAN_AO_BOX, skip: o => caravanRole(o) === "shell" })');
const AOB = __ev('AOB'), orig = R.render; let f = 0;
R.render = () => {}; try { while ((AOB.job || AOB.q.length) && f < 3000) { __dbg.frames(1); f++; } } finally { R.render = orig; }
snap('1'); out.shots = shots; return out;
