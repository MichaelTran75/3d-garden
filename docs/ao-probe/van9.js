// bóng góc xe: mất ngữ cảnh WebGL rồi có lại ⇒ lô dựng lại từ hình gốc rồi nướng lại; mảnh tự vẽ giữ hình đã nướng
simSetup(); __ev('typeof CAMP_AO !== "undefined" && CAMP_AO.forEach(C => C.asked = true)');   /* khu trại không nướng chen (05/11) ⇒ AOB.stat là của xe */ const R = __dbg.renderer, gl = R.getContext(), out = {};
runFor(2, +window.__hourOverride);
__ev('vanAoAsked = true'); const C = __ev('caravanObj'), DB = __ev('drawBatches'); __ev('VAN').setXray(true);
const vb = DB.filter(b => b.roots.includes(C)).flatMap(b => b.meshes), sum = () => vb.reduce((s, m) => s + m.geometry.attributes.position.count, 0);
const own = () => { let n = 0, v = 0; C.traverse(o => { if (o.userData.aoOwn) { n++; v += o.geometry.attributes.position.count; } }); return [n, v]; };
const AOB = __ev('AOB'), run = (lim) => { let f = 0; while ((AOB.job || AOB.q.length) && f < lim) { __dbg.frames(1); f++; } return f; };
out.v0 = sum();
__ev('aoBake(caravanObj, { box: VAN_AO_BOX, skip: o => caravanRole(o) === "shell" })'); out.f1 = run(3000); out.v1 = sum(); out.own1 = own();
const ext = gl.getExtension('WEBGL_lose_context'); out.ext = !!ext;
if (ext) {
  ext.loseContext(); await new Promise(r => setTimeout(r, 100)); out.lost = gl.isContextLost(); __dbg.frames(3);
  ext.restoreContext(); let w = 0; while (gl.isContextLost() && w < 50) { await new Promise(r => setTimeout(r, 50)); w++; } await new Promise(r => setTimeout(r, 100)); out.wait = w; __dbg.frames(3);
  out.afterRestore = sum(); out.queued = AOB.q.length + (AOB.job ? 1 : 0);
  out.f2 = run(3000); out.v2 = sum(); out.own2 = own(); out.stat2 = AOB.stat; delete out.stat2.top;
}
__dbg.frames(5); out.err = gl.getError(); return out;
