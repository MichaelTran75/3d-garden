// 5 góc nhìn (bong bóng kỹ sư, cột khí tượng + trạm biến áp, toàn cảnh, xe) — mỗi góc: ống kính bật chưa, tiêu cự đọc về CPU so với đọc thẳng ảnh GPU,
// giá htmlTextTick, các ô chữ đang hiện (tên, cỡ px CSS, CSS blur, tone), rồi chụp cả trang (gồm lớp DOM) vào $SHOTS/<góc>.png.
// Trang cũ (trước lớp chữ HTML, không có HT) vẫn chạy được: chỉ chụp ảnh — để so trước / sau cùng góc.
const d = __dbg, T = d.THREE, cam = d.camera, SH = window.__shotDir + '/';
const wait = ms => new Promise(r => setTimeout(r, ms)), step = async n => { for (let i = 0; i < n; i++) { await wait(50); d.frames(1); } };
const has = (() => { try { return !!__ev('HT'); } catch (e) { return false; } })(), HT = has ? __ev('HT') : { list: [] }, out = { st: [] };
const vis = () => HT.list.filter(e => e.o && e.o.on).map(e => [e.sp.name || (e.sp.parent && e.sp.parent.name) || '?', Math.round(e.dw), Math.round(e.dh), e.o.fl, e.tone]);
const syncAf = () => { const R = __ev('renderer'), L = __ev('LENS'); if (!L.fa) return null; const b = new Uint8Array(4); R.readRenderTargetPixels(L.fa, 0, 0, 1, 1, b); return Array.from(b); };
const go = async (tag, p, zoom, th = 0.75, ph = 0.95, n = 20) => {
  d.view(p.x, p.y, p.z, th, ph, zoom); __ev('viewTick(0)'); cam.updateMatrixWorld(true); await step(n);
  if (has) { const t0 = performance.now(); for (let i = 0; i < 20; i++) __ev('htmlTextTick()');
    out.st.push({ tag, lensOn: __ev('LENS.on'), afOffCpu: +__ev('LENS_RB.off').toFixed(3), afGpu: syncAf(), tickMs: +((performance.now() - t0) / 20).toFixed(3), vis: vis().slice(0, 18) }); }
  await window.__pshot(SH + tag + '.png');
};
for (let i = 0; i < 30; i++) d.frames(1);
const C = __ev('biogas').C; await go('biogas', { x: C.x, y: C.y + 0.2, z: C.z }, 30);
const E = __ev('engObj').g.position; await go('engineer', { x: E.x, y: E.y + 1, z: E.z }, 22);
const mast = __ev("scene.getObjectByName('Nhãn hướng gió')"); if (mast) { const p = mast.getWorldPosition(new T.Vector3()); await go('mast', { x: p.x, y: p.y - 3, z: p.z }, 12); }
await go('overview', { x: E.x, y: E.y, z: E.z }, 1.6, 0.75, 0.9, 20);
const V = __ev('VAN.object').position; await go('van', { x: V.x, y: V.y + 1, z: V.z }, 26);
return out;
