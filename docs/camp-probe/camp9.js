// đường kích hoạt thật: nhìn khu trại zoom ×30 rồi chạy khung (không ép) ⇒ cụm nào được hỏi, bao nhiêu khung thì xong · rồi nướng xe xem xuyên (hồi quy)
simSetup(); const THREE = __dbg.THREE, R = __dbg.renderer, out = {}, H = +window.__hourOverride;
R.setPixelRatio(1); runFor(3, H); __ev('vanAoAsked = true');
const AOB = __ev('AOB'), CA = __ev('CAMP_AO');
out.ready = __ev('campLook.ready');
__dbg.view(-55.6, 7.0, -10.0, Math.PI * 0.27, 0.9, 30);
const orig = R.render; let f = 0, first = -1; R.render = () => {};
try { while (f < 600) { __dbg.frames(1); f++; if (first < 0 && CA.some(C => C.asked)) first = f; if (CA.every(C => C.floorMesh) && !AOB.job && !AOB.q.length) break; } } finally { R.render = orig; }
out.frames = f; out.firstAsk = first; out.camp = CA.map(C => [C.key, !!C.asked, !!C.floorMesh, C.grass, C.mid && +C.mid.distanceTo(__ev('target')).toFixed(1)]);
const V = __ev('VAN'); V.setXray(true); __ev('aoBake(caravanObj, { box: VAN_AO_BOX, skip: o => caravanRole(o) === "shell" })');
__ev('while (AOB.job || AOB.q.length) { if (!AOB.job) { const [r, o] = AOB.done.get(AOB.q.shift()); AOB.job = aoJob(r, o); } if (AOB.job.next().done) AOB.job = null; }');
out.van = { ...AOB.stat, top: undefined }; out.err = R.getContext().getError();
return out;
