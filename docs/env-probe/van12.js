// lượt vẽ riêng xe (không bóng, vật khác ẩn) + số shader + bộ nhớ ảnh — so trước / sau bước 2
simSetup(); __ev('typeof CAMP_AO !== "undefined" && CAMP_AO.forEach(C => C.asked = true)');   /* khu trại không nướng chen (05/11) ⇒ AOB.stat là của xe */ const R = __dbg.renderer, out = {};
R.setPixelRatio(1); runFor(2, +window.__hourOverride);
const V = __ev('VAN'), C = __ev('caravanObj'); V.setXray(true);
__dbg.view(C.position.x, C.position.y + 1.5, C.position.z, Math.PI * 0.77, 0.75, 14); __dbg.frames(3);
const vis = []; for (const o of __dbg.scene.children) if (o !== C && o.visible && !o.isLight) { vis.push(o); o.visible = false; }
const sm = R.shadowMap.autoUpdate; R.shadowMap.autoUpdate = false; R.info.autoReset = false;
const cnt = () => { R.info.reset(); R.render(__dbg.scene, __dbg.camera); return [R.info.render.calls, R.info.render.triangles]; };
out.van = cnt(); out.van2 = cnt();
R.info.autoReset = true; R.shadowMap.autoUpdate = sm; for (const o of vis) o.visible = true;
let n = 0; C.traverse(o => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial && o.material.envMap) n++; }); out.envMeshes = n;
out.mem = { ...R.info.memory }; out.progs = R.info.programs.length; out.err = R.getContext().getError();
return out;
