// ảnh môi trường kim loại xe (bước 2): cận cảnh ×200 chậu inox, nồi, sen tắm, lavabo + gương, chân bàn ăn, laptop — xem xuyên, nét viền 1; đo nướng lại
simSetup(); __ev('typeof CAMP_AO !== "undefined" && CAMP_AO.forEach(C => C.asked = true)');   /* khu trại không nướng chen (05/11) ⇒ AOB.stat là của xe */ const THREE = __dbg.THREE, R = __dbg.renderer, dom = R.domElement, shots = [], out = {}, tag = (location.pathname.includes('g-b') ? 'b' : 'e') + (+window.__hourOverride);
R.setPixelRatio(1);
runFor(3, +window.__hourOverride);
__ev('lensRender = dt => renderer.render(scene, camera)');
const V = __ev('VAN'), C = __ev('caravanObj'); V.setXray(true); __ev('setVanLines(1)');
const PRE = {}; { const f0 = (pred) => { let o = null; C.traverse(x => { if (!o && pred(x)) o = x; }); return o; }; const cy = (rt, rb) => f0(x => x.isMesh && x.geometry.parameters && x.geometry.parameters.radiusTop === rt && x.geometry.parameters.radiusBottom === rb); PRE.sen = cy(0.085, 0.06); PRE.ban = cy(0.16, 0.18); }
__ev("vanAoAsked = true"); __ev('aoBake(caravanObj, { box: VAN_AO_BOX, skip: o => caravanRole(o) === "shell" })');
const AOB = __ev('AOB'), orig = R.render; let f = 0;
R.render = () => {}; try { while ((AOB.job || AOB.q.length) && f < 3000) { __dbg.frames(1); f++; } } finally { R.render = orig; }
let env = null; try { env = __ev('VENV'); } catch (e) {}
if (env) { env.k = -1; __dbg.frames(1); const gl = R.getContext(), t0 = performance.now(); env.k = -1; __ev('vanEnvTick()'); gl.finish(); out.rebakeMs = +(performance.now() - t0).toFixed(2); }
for (const o of __dbg.scene.children) if (o !== C && !o.isLight) o.visible = false;   // cận cảnh sạch: chỉ xe (bong bóng suy nghĩ, nhãn, kỹ sư ẩn)
{ let lap = null; C.traverse(x => { if (!lap && x.name === "Laptop") lap = x; }); const inLap = o => { for (let p = o; p; p = p.parent) if (p === lap) return true; return false; };
  C.traverse(o => { const m = o.material, im = m && m.map && m.map.image; if (o.isSprite || (o.isMesh && im && (im instanceof HTMLCanvasElement || (self.OffscreenCanvas && im instanceof OffscreenCanvas)) && !inLap(o))) o.visible = false; }); }   // mọi bảng chữ vẽ canvas gắn trên xe (đếm ngược ngủ, Zzz) trừ màn laptop
__dbg.frames(3);
const find = (root, pred) => { let o = null; root.traverse(x => { if (!o && pred(x)) o = x; }); return o; };
const byName = nm => find(C, x => x.name === nm), cyl = (rt, rb) => find(C, x => x.isMesh && x.geometry.parameters && x.geometry.parameters.radiusTop === rt && (rb === undefined || x.geometry.parameters.radiusBottom === rb));
const ctr = o => new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
const galley = byName('Bếp: phần cố định'), lav = byName('Lavabo');
const spots = [
  //['chau', galley && galley.localToWorld(new THREE.Vector3(2.64, 1.8, -0.68))],
  ['noi', byName('Nồi luộc udon') && ctr(byName('Nồi luộc udon'))],
  ["tam", byName("Phòng tắm gọn") && ctr(byName("Phòng tắm gọn")), 110],
  //['lavabo', lav && ctr(lav).add(new THREE.Vector3(0, 0.15, 0))],
  //["banan", byName("Ghế đẩu bàn ăn") && ctr(byName("Ghế đẩu bàn ăn")).add(new THREE.Vector3(0, 0.15, 0)), 150],
  ['laptop', byName('Laptop') && ctr(byName('Laptop'))]];
out.found = spots.map(([n, p]) => n + ':' + !!p);
for (const [n, p, zz] of spots) { if (!p) continue;
  for (const [k, th, ph, z] of [["a", 0.77, 0.75, zz || 200], ["b", 0.27, 0.95, zz || 200]]) { __dbg.view(p.x, p.y, p.z, Math.PI * th, ph, z); __dbg.frames(2); shots.push([`${tag}_${n}_${k}.png`, dom.toDataURL('image/png')]); } }
out.size = [dom.width, dom.height]; out.mem = { ...R.info.memory }; out.progs = R.info.programs.length; out.err = R.getContext().getError();
out.shots = shots; return out;
