// bóng góc xe: đỉnh từng lô của xe trước / sau + tổng tăng của mảnh trong lô (đối chiếu)
simSetup(); __ev('typeof CAMP_AO !== "undefined" && CAMP_AO.forEach(C => C.asked = true)');   /* khu trại không nướng chen (05/11) ⇒ AOB.stat là của xe */ const out = {};
runFor(2, +window.__hourOverride);
__ev('vanAoAsked = true'); const C = __ev('caravanObj'), DB = __ev('drawBatches'); __ev('VAN').setXray(true);
__ev('{ const _bar = batchAoRefresh; batchAoRefresh = objs => { window.__aoG = objs.reduce((s, o) => s + o.userData.aoGeo.attributes.position.count - o.geometry.attributes.position.count, 0); window.__aoN = objs.length; return _bar(objs); }; }');
const vb = DB.filter(b => b.roots.includes(C)).flatMap(b => b.meshes);
const cnt = () => vb.map(m => [m.name, m.geometry.attributes.position.count, m.geometry.index.count, m.geometry.attributes.uv ? 1 : 0, m.geometry.attributes.skinIndex.array ? m.geometry.attributes.skinIndex.array.BYTES_PER_ELEMENT : m.geometry.attributes.skinIndex.count && 'freed']);
const b0 = cnt();
__ev('aoBake(caravanObj, { box: VAN_AO_BOX, skip: o => caravanRole(o) === "shell" })');
const AOB = __ev('AOB'); let f = 0; const R = __dbg.renderer, orig = R.render;
R.render = () => {}; try { while ((AOB.job || AOB.q.length) && f < 3000) { __dbg.frames(1); f++; } } finally { R.render = orig; }
const b1 = cnt(); out.rows = b0.map((r, i) => [r[0], r[1], b1[i][1], r[2], b1[i][2], r[3], r[4]]).filter(r => r[1] !== r[2]);
out.nMeshes = vb.length; out.batchedGrowth = window.__aoG; out.batchedN = window.__aoN; out.stat = AOB.stat; delete out.stat.top;
out.big = vb.map(m => m.skeleton && m.skeleton.bones.length); return out;
