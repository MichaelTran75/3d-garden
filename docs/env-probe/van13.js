// mất ngữ cảnh WebGL rồi có lại: ảnh môi trường phải nướng lại (VENV.k), nồi inox trông như trước
simSetup(); __ev('typeof CAMP_AO !== "undefined" && CAMP_AO.forEach(C => C.asked = true)');   /* khu trại không nướng chen (05/11) ⇒ AOB.stat là của xe */ const THREE = __dbg.THREE, R = __dbg.renderer, dom = R.domElement, gl = R.getContext(), out = {}, shots = [];
R.setPixelRatio(1); runFor(2, +window.__hourOverride);
const C = __ev('caravanObj'), env = __ev('VENV'); __ev('VAN').setXray(true);
let pot = null; C.traverse(x => { if (!pot && x.name === 'Nồi luộc udon') pot = x; });
const p = new THREE.Box3().setFromObject(pot).getCenter(new THREE.Vector3());
for (const o of __dbg.scene.children) if (o !== C && !o.isLight) o.visible = false;
const snap = n => { __dbg.view(p.x, p.y, p.z, Math.PI * 0.77, 0.75, 260); __dbg.frames(3); shots.push([n, dom.toDataURL('image/png')]); };
env.k = -1; __dbg.frames(2); snap('ctx_0.png'); out.k0 = +env.k.toFixed(3);
const ext = gl.getExtension('WEBGL_lose_context'); ext.loseContext(); await new Promise(r => setTimeout(r, 400));
ext.restoreContext(); await new Promise(r => setTimeout(r, 800));
out.kLost = env.k; __dbg.frames(4); out.k1 = +env.k.toFixed(3); snap('ctx_1.png'); out.err = gl.getError();
out.shots = shots; return out;
